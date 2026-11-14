/**
 * Job Coach Training (Google Apps Script web app).
 *
 * Deploy once as a web app: Execute as = Me, Who has access = anyone in usd497.org.
 * Coaches sign in with their school account; their answers are written to a Google Sheet
 * that only the owner can open. Supervisors (the owner plus anyone listed on the
 * Supervisors tab) see a dashboard inside the app.
 *
 * Records are kept permanently. The app only appends rows; it never deletes or overwrites
 * an answer. A revised answer is a new row, and the newest row is the one shown.
 *
 * Built from src/ by `npm run build`. Edit the files in src/, not dist/.
 */

const ALLOWED_DOMAIN = 'usd497.org';
const APP_NAME = 'Job Coach Training';
const TEXT_LIMIT = 5000;

const TABS = {
  Coaches: ['Email', 'Name', 'First seen', 'Last seen'],
  Supervisors: ['Email', 'Name', 'Added'],
  Progress: ['Time', 'Email', 'Module', 'Screen', 'Event', 'Course version'],
  Responses: ['Time', 'Email', 'Module', 'Item', 'Kind', 'Question', 'Answer', 'Correct', 'Course version'],
  Actions: ['Time', 'Email', 'Module', 'Action', 'Noticed', 'Did', 'Next step', 'Course version'],
  Observations: ['Time', 'Supervisor', 'Coach', 'Observed on', 'Setting', 'Competency', 'Level', 'Evidence', 'Impact', 'Next practice', 'Re-check'],
};

/* ---------- Setup (run these from the editor) ---------- */

// Run once. Creates the records sheet with its tabs and adds you as a supervisor.
// Safe to run again: it only adds what is missing.
function setup() {
  // The web page can call any function without a trailing "_", so only the owner may run this.
  const active = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (active && active !== ownerEmail_()) throw new Error('Only the owner can run setup.');
  const props = PropertiesService.getScriptProperties();
  let sheetId = props.getProperty('SHEET_ID');
  if (!sheetId) {
    sheetId = SpreadsheetApp.create(`${APP_NAME} records`).getId();
    props.setProperty('SHEET_ID', sheetId);
  }
  const book = SpreadsheetApp.openById(sheetId);
  Object.keys(TABS).forEach((name) => {
    let sheet = book.getSheetByName(name);
    if (!sheet) {
      const blank = book.getSheetByName('Sheet1');
      sheet = blank && blank.getLastRow() === 0 ? blank.setName(name) : book.insertSheet(name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(TABS[name]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, TABS[name].length).setFontWeight('bold');
    }
  });
  const owner = ownerEmail_();
  if (owner && !supervisorEmails_().includes(owner)) {
    append_('Supervisors', { Email: owner, Name: nameFromEmail_(owner), Added: new Date() });
  }
  showSetup();
}

// Shows the records sheet address again (Execution log).
function showSetup() {
  const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  console.log(`Records sheet: https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
  console.log('To add a supervisor, type their usd497.org email on the Supervisors tab.');
}

/* ---------- Web page ---------- */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Everything the page needs when it opens: who is signed in and their records.
function getState() {
  const email = currentEmail_();
  touchCoach_(email);
  return {
    user: { email, name: nameFromEmail_(email), isSupervisor: isSupervisor_(email) },
    records: recordsFor_(email),
  };
}

// event: "reached" when a coach opens a screen, "complete" when they finish a module.
function saveProgress(entry) {
  const email = currentEmail_();
  const module = findModule_(entry && entry.module);
  if (!isAvailable_(module)) throw new Error('That module is not available yet.');
  if (entry.event === 'reached') {
    if (!module.screens.some((screen) => screen.id === entry.screen)) throw new Error('That screen was not found.');
  } else if (entry.event === 'complete') {
    if (!moduleStatus_(module, recordsFor_(email)).canComplete) throw new Error('Answer every question in this module before you finish it.');
  } else {
    throw new Error('Unknown progress event.');
  }
  return withLock_(() => {
    const records = recordsFor_(email);
    const already = records.progress.some((row) => row.Module === module.id && row.Event === entry.event && (entry.event === 'complete' || row.Screen === entry.screen));
    if (!already) {
      append_('Progress', { Time: new Date(), Email: email, Module: module.id, Screen: entry.event === 'reached' ? entry.screen : '', Event: entry.event, 'Course version': COURSE.version });
    }
    return recordsFor_(email);
  });
}

// choice and checkpoint: answer is the option number; the first answer is kept.
// write: answer is text; each save is a new row.
function saveResponse(entry) {
  const email = currentEmail_();
  const found = findItem_(entry && entry.module, entry && entry.item);
  if (!found) throw new Error('That question was not found.');
  const { activity, item } = found;
  const row = { Email: email, Module: entry.module, Item: item.id, Kind: activity.type, Question: item.prompt, 'Course version': COURSE.version };
  if (activity.type === 'write') {
    const answer = String(entry.answer || '').trim();
    if (!answer) throw new Error('Write a response before you save.');
    row.Answer = answer;
    row.Correct = '';
  } else if (activity.type === 'questions') {
    const answer = entry.none === true ? NO_QUESTIONS : String(entry.answer || '').trim();
    if (!answer) throw new Error('Write your question, or check “No questions right now.”');
    row.Answer = answer;
    row.Correct = '';
  } else {
    const choice = Number(entry.answer);
    if (!Number.isInteger(choice) || choice < 0 || choice >= item.options.length) throw new Error('Choose one of the answers.');
    row.Answer = item.options[choice];
    row.Correct = choice === item.answer ? 'Yes' : 'No';
  }
  return withLock_(() => {
    const answeredBefore = recordsFor_(email).responses.some((existing) => existing.Item === item.id);
    if (activity.type === 'write' || activity.type === 'questions' || !answeredBefore) {
      row.Time = new Date();
      append_('Responses', row);
    }
    return recordsFor_(email);
  });
}

function saveAction(entry) {
  const email = currentEmail_();
  const action = findAction_(entry && entry.module, entry && entry.action);
  if (!action) throw new Error('That job-site action was not found.');
  if (!String(entry.noticed || '').trim()) throw new Error('Write what you noticed before you save.');
  return withLock_(() => {
    append_('Actions', { Time: new Date(), Email: email, Module: entry.module, Action: action.id, Noticed: entry.noticed, Did: entry.did, 'Next step': entry.next, 'Course version': COURSE.version });
    return recordsFor_(email);
  });
}

/* ---------- Supervisor view ---------- */

function getDashboard() {
  requireSupervisor_();
  const records = allRecords_();
  return readRows_('Coaches').map((coach) => {
    const email = String(coach.Email).toLowerCase();
    const own = recordsOf_(records, email);
    return { email, name: coach.Name, firstSeen: coach['First seen'], lastSeen: coach['Last seen'], summary: coachSummary_(own), questions: coachQuestions_(own) };
  });
}

function getCoach(email) {
  requireSupervisor_();
  const key = String(email || '').toLowerCase();
  const coach = readRows_('Coaches').find((row) => String(row.Email).toLowerCase() === key);
  if (!coach) throw new Error('That coach was not found.');
  return {
    email: key,
    name: coach.Name,
    records: recordsOf_(allRecords_(), key),
    observations: readRows_('Observations').filter((row) => String(row.Coach).toLowerCase() === key),
  };
}

function saveObservation(entry) {
  const supervisor = requireSupervisor_();
  const coach = String(entry && entry.coach || '').toLowerCase();
  if (!readRows_('Coaches').some((row) => String(row.Email).toLowerCase() === coach)) throw new Error('That coach was not found.');
  if (!RUBRIC.competencies.includes(entry.competency)) throw new Error('Choose a competency.');
  if (!RUBRIC.levels.includes(entry.level)) throw new Error('Choose a level.');
  if (!String(entry.evidence || '').trim()) throw new Error('Write what you observed before you save.');
  withLock_(() => append_('Observations', {
    Time: new Date(), Supervisor: supervisor, Coach: coach, 'Observed on': entry.observedOn, Setting: entry.setting,
    Competency: entry.competency, Level: entry.level, Evidence: entry.evidence, Impact: entry.impact,
    'Next practice': entry.nextPractice, 'Re-check': entry.recheck,
  }));
  return getCoach(coach);
}

/* ---------- Helpers ---------- */

function currentEmail_() {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) throw new Error(`Sign in with your ${ALLOWED_DOMAIN} Google account to use this course.`);
  return email;
}

function ownerEmail_() {
  return String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
}

function supervisorEmails_() {
  return readRows_('Supervisors').map((row) => String(row.Email).trim().toLowerCase()).filter(Boolean);
}

function isSupervisor_(email) {
  return email === ownerEmail_() || supervisorEmails_().includes(email);
}

function requireSupervisor_() {
  const email = currentEmail_();
  if (!isSupervisor_(email)) throw new Error('Only supervisors can open this page.');
  return email;
}

// Adds the coach on their first visit and updates "Last seen" after that.
function touchCoach_(email) {
  withLock_(() => {
    const sheet = sheet_('Coaches');
    const values = sheet.getDataRange().getValues();
    const index = values.findIndex((row, i) => i > 0 && String(row[0]).toLowerCase() === email);
    const now = new Date();
    if (index === -1) {
      append_('Coaches', { Email: email, Name: nameFromEmail_(email), 'First seen': now, 'Last seen': now });
    } else {
      sheet.getRange(index + 1, TABS.Coaches.indexOf('Last seen') + 1).setValue(now);
    }
  });
}

function allRecords_() {
  return { progress: readRows_('Progress'), responses: readRows_('Responses'), actions: readRows_('Actions') };
}

function recordsOf_(records, email) {
  const mine = (rows) => rows.filter((row) => String(row.Email).toLowerCase() === email);
  return { progress: mine(records.progress), responses: mine(records.responses), actions: mine(records.actions) };
}

function recordsFor_(email) {
  return recordsOf_(allRecords_(), email);
}

function sheet_(name) {
  const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!sheetId) throw new Error('The course is not set up yet. Run setup in the Apps Script editor.');
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(name);
  if (!sheet) throw new Error(`The ${name} tab is missing. Run setup in the Apps Script editor.`);
  return sheet;
}

// Rows as objects keyed by header. Dates become text, because the web page cannot receive Date objects.
function readRows_(name) {
  const values = sheet_(name).getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map((row) => {
    const entry = {};
    headers.forEach((header, i) => {
      const value = row[i];
      entry[header] = value instanceof Date ? value.toISOString() : value;
    });
    return entry;
  });
}

function append_(name, entry) {
  sheet_(name).appendRow(TABS[name].map((header) => {
    const value = entry[header];
    if (value === undefined || value === null) return '';
    return value instanceof Date ? value : safeText_(value);
  }));
}

// Plain text only, and never something the sheet would treat as a formula.
function safeText_(value) {
  const text = String(value).replace(/\r\n/g, '\n').trim().slice(0, TEXT_LIMIT);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function nameFromEmail_(email) {
  return String(email).split('@')[0].split(/[._]/).filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function withLock_(work) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return work();
  } finally {
    lock.releaseLock();
  }
}
