/**
 * Progress rules shared by the web page and the Apps Script server.
 *
 * Records are sheet rows as objects keyed by column header (see TABS in Code.js).
 * Names end in "_" because Apps Script lets the web page call any top-level server
 * function whose name does not.
 */

// Saved as the answer when a coach checks "No questions right now" on a module's questions screen.
const NO_QUESTIONS = 'N/A: no questions';

function findModule_(moduleId) {
  return COURSE.modules.find((module) => module.id === moduleId) || null;
}

function isAvailable_(module) {
  return Boolean(module && module.screens.length);
}

// Every question in a module, with the screen and activity it belongs to.
function moduleItems_(module) {
  const items = [];
  module.screens.forEach((screen) => {
    const activity = screen.activity;
    if (!activity || activity.type === 'action') return;
    activity.items.forEach((item) => items.push({ screen, activity, item }));
  });
  return items;
}

function findItem_(moduleId, itemId) {
  const module = findModule_(moduleId);
  if (!module) return null;
  return moduleItems_(module).find((entry) => entry.item.id === itemId) || null;
}

function findAction_(moduleId, actionId) {
  const module = findModule_(moduleId);
  if (!module) return null;
  const screen = module.screens.find((entry) => entry.activity && entry.activity.type === 'action' && entry.activity.id === actionId);
  return screen ? screen.activity : null;
}

// The last row for each key; later rows are revisions, nothing is ever deleted.
function latestBy_(rows, key) {
  const latest = {};
  rows.forEach((row) => { latest[row[key]] = row; });
  return latest;
}

// The first row for each key; multiple-choice answers keep the first try.
function firstBy_(rows, key) {
  const first = {};
  rows.forEach((row) => { if (!(row[key] in first)) first[row[key]] = row; });
  return first;
}

function moduleStatus_(module, records) {
  const items = moduleItems_(module);
  const responses = records.responses.filter((row) => row.Module === module.id);
  const answered = latestBy_(responses, 'Item');
  const progress = records.progress.filter((row) => row.Module === module.id);
  const reached = {};
  progress.forEach((row) => { reached[row.Screen] = true; });
  const done = items.filter((entry) => answered[entry.item.id]).length;
  const complete = progress.some((row) => row.Event === 'complete');
  const actionScreens = module.screens.filter((screen) => screen.activity && screen.activity.type === 'action');
  const actions = latestBy_(records.actions.filter((row) => row.Module === module.id), 'Action');
  let resumeAt = 0;
  module.screens.forEach((screen, index) => { if (reached[screen.id]) resumeAt = index; });
  return {
    available: isAvailable_(module),
    started: progress.length > 0 || responses.length > 0,
    complete,
    answered: done,
    required: items.length,
    canComplete: items.length === done,
    resumeAt,
    actionsDone: actionScreens.filter((screen) => actions[screen.activity.id]).length,
    actionsTotal: actionScreens.length,
  };
}

// Each module's latest question from a coach, leaving out "no questions" answers.
function coachQuestions_(records) {
  const rows = records.responses.filter((row) => row.Kind === 'questions');
  return Object.values(latestBy_(rows, 'Item')).filter((row) => row.Answer !== NO_QUESTIONS);
}

// A one-line summary of a coach for the supervisor dashboard.
function coachSummary_(records) {
  const available = COURSE.modules.filter(isAvailable_);
  const statuses = available.map((module) => moduleStatus_(module, records));
  const checkpoint = records.responses.filter((row) => row.Kind === 'checkpoint');
  const firstTries = Object.values(firstBy_(checkpoint, 'Item'));
  const times = [].concat(records.progress, records.responses, records.actions).map((row) => row.Time).filter(Boolean).sort();
  return {
    modulesComplete: statuses.filter((status) => status.complete).length,
    modulesAvailable: available.length,
    modulesTotal: COURSE.modules.length,
    checkpointCorrect: firstTries.filter((row) => row.Correct === 'Yes').length,
    checkpointAnswered: firstTries.length,
    actionsDone: statuses.reduce((sum, status) => sum + status.actionsDone, 0),
    actionsOpen: statuses.filter((status) => status.complete).reduce((sum, status) => sum + status.actionsTotal - status.actionsDone, 0),
    questions: coachQuestions_(records).length,
    lastActive: times.length ? times[times.length - 1] : '',
  };
}
