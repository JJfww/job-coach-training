/**
 * The course web page. Talks to Code.js through google.script.run.
 * Course text is trusted HTML from course.js; anything a person typed is escaped.
 */
(function () {
  'use strict';

  const app = document.getElementById('app');
  const toast = document.getElementById('toast');
  const state = {
    user: null,
    records: null,
    view: { name: 'loading' },
    picks: {}, // itemId -> option chosen but not yet checked
    drafts: {}, // field key -> unsaved text
    busy: {}, // key -> true while saving
    dashboard: null,
    coach: null,
    predicted: {}, // screenId -> option picked on an unscored "What would you do?" (not saved)
  };

  /* ---------- Server ---------- */

  function call(name, ...args) {
    return new Promise((resolve, reject) => {
      // Index.html opened straight from a computer has no Apps Script connection.
      if (typeof google === 'undefined') {
        reject(new Error('This page only runs inside Apps Script. To try the course on your computer, open preview.html in the same dist folder instead.'));
        return;
      }
      google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[name](...args);
    });
  }

  function failed(error) {
    showToast((error && error.message) || 'Something went wrong. Check your connection and try again.');
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { toast.hidden = true; }, 6000);
  }

  async function saving(key, work) {
    if (state.busy[key]) return;
    state.busy[key] = true;
    render();
    try {
      await work();
    } catch (error) {
      failed(error);
    } finally {
      delete state.busy[key];
      render();
    }
  }

  /* ---------- Helpers ---------- */

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function multiline(value) {
    return esc(value).replace(/\n/g, '<br>');
  }

  function formatDate(value, withTime) {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date)) return esc(value);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    if (withTime) Object.assign(options, { hour: 'numeric', minute: '2-digit' });
    return date.toLocaleString(undefined, options);
  }

  function today() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function go(view) {
    state.view = view;
    render();
    window.scrollTo(0, 0);
    const heading = app.querySelector('h1');
    if (heading) heading.focus();
  }

  function responsesFor(itemId) {
    return state.records.responses.filter((row) => row.Item === itemId);
  }

  function screenDone(screen) {
    const activity = screen.activity;
    if (!activity || activity.type === 'action') return true;
    return activity.items.every((item) => responsesFor(item.id).length > 0);
  }

  // Varied, stable wording so feedback doesn't repeat word for word.
  const RIGHT = ['Yes.', 'Exactly.', 'That’s it.', 'Right.', 'Nicely done.'];
  const RETRY = ['Not quite.', 'Close, but not this one.', 'Good thinking, but not quite.', 'Not this time.'];
  function wordFor(list, key) {
    let hash = 0;
    for (const c of key) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
    return list[hash % list.length];
  }

  // A predict block is revealed once the learner picks, or if they have already moved past the screen.
  function revealed(module, index) {
    const screen = module.screens[index];
    if (!(screen.blocks || []).some((block) => block.type === 'predict')) return true;
    if (screen.id in state.predicted) return true;
    const later = module.screens.slice(index + 1).map((entry) => entry.id);
    return state.records.progress.some((row) => row.Module === module.id && later.includes(row.Screen));
  }

  function nextModule() {
    return COURSE.modules.find((module) => isAvailable_(module) && !moduleStatus_(module, state.records).complete) || null;
  }

  /* ---------- Blocks ---------- */

  const COACH_LABELS = { tip: 'Coach’s tip', trap: 'Common trap', say: 'Try saying this' };

  function blockHtml(block, module, screen) {
    switch (block.type) {
      case 'outcomes':
        return `<ol class="list">${module.outcomes.map((item) => `<li>${item}</li>`).join('')}</ol>`;
      case 'coach':
        return `<aside class="coach coach-${block.kind}"><span class="coach-icon" aria-hidden="true">${ART.icons[block.kind]}</span>
          <div><p class="coach-label">${COACH_LABELS[block.kind]}</p><p>${block.html}</p></div></aside>`;
      case 'twoStudents':
        return `<div class="two-students">${['maya', 'luis'].map((who) => {
          const person = CAST.find((entry) => entry.id === who);
          return `<section class="student-card"><div class="student-head">${ART.portraits[who]}<div><h2>${person.name}</h2><p class="meta">${person.role}</p></div></div><p>${block[who]}</p></section>`;
        }).join('')}</div>
          <div class="callout tone-dark"><strong>Same skill:</strong> ${block.same}</div>`;
      case 'figure':
        return `<figure class="figure">${ART[block.art]}</figure>`;
      case 'predict': {
        const pick = state.predicted[screen.id];
        if (pick === undefined && !revealed(module, module.screens.indexOf(screen))) {
          return `<div class="predict"><p class="predict-q">${block.prompt}</p>
            <div class="predict-options">${block.options.map((option, i) => `<button class="option choosable" data-action="predict" data-screen="${screen.id}" data-index="${i}">${option}</button>`).join('')}</div>
            <p class="meta">No score. This just gets you thinking before you see what happens.</p></div>`;
        }
        if (pick === undefined) return '';
        return `<div class="predict-done" tabindex="-1"><p><strong>You picked:</strong> ${block.options[pick]}.</p>${block.responses ? `<p>${block.responses[pick]}</p>` : ''}</div>`;
      }
      case 'p':
        return `<p>${block.html}</p>`;
      case 'list': {
        const tag = block.ordered ? 'ol' : 'ul';
        return `<${tag} class="list">${block.items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`;
      }
      case 'table':
        return `<div class="table-wrap"><table><thead><tr>${block.head.map((cell) => `<th scope="col">${cell}</th>`).join('')}</tr></thead>
          <tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'cards':
        return `<div class="cards">${block.items.map((card) => `<section class="card tone-${card.tone || 'gray'}"><h2>${card.title}</h2>
          ${card.items.length === 1 ? `<p>${card.items[0]}</p>` : `<ul class="list">${card.items.map((item) => `<li>${item}</li>`).join('')}</ul>`}</section>`).join('')}</div>`;
      case 'callout':
        return `<div class="callout tone-${block.tone || 'yellow'}">${block.html}</div>`;
      case 'scenario':
        return `<div class="scenario">${block.html}</div>`;
      default:
        return '';
    }
  }

  /* ---------- Activities ---------- */

  function choiceHtml(module, item, number, total) {
    const first = responsesFor(item.id)[0];
    const label = total > 1 ? `<span class="q-number">Question ${number} of ${total}</span>` : '';
    if (first) {
      const chosen = item.options.indexOf(first.Answer);
      const right = first.Correct === 'Yes';
      return `<fieldset class="question answered"><legend>${label}${item.prompt}</legend>
        <div class="options">${item.options.map((option, i) => `<div class="option ${i === item.answer ? 'is-correct' : ''} ${i === chosen && !right ? 'is-wrong' : ''}">
          <span class="mark" aria-hidden="true">${i === item.answer ? '✓' : i === chosen ? '✕' : ''}</span>
          <span>${option}${i === chosen ? ' <em class="yours">(your answer)</em>' : ''}</span></div>`).join('')}</div>
        <div class="feedback ${right ? 'good' : 'retry'}" role="status"><strong>${wordFor(right ? RIGHT : RETRY, item.id)}</strong> ${item.explain}</div>
      </fieldset>`;
    }
    const pick = state.picks[item.id];
    const busy = state.busy[item.id];
    return `<fieldset class="question"><legend>${label}${item.prompt}</legend>
      <div class="options">${item.options.map((option, i) => `<label class="option choosable ${pick === i ? 'is-picked' : ''}">
        <input type="radio" name="${item.id}" value="${i}" data-pick="${item.id}" ${pick === i ? 'checked' : ''} ${busy ? 'disabled' : ''}>
        <span>${option}</span></label>`).join('')}</div>
      <button class="btn" data-action="check" data-module="${module.id}" data-item="${item.id}" ${pick === undefined || busy ? 'disabled' : ''}>${busy ? 'Saving…' : 'Check my answer'}</button>
    </fieldset>`;
  }

  function writeHtml(module, activity) {
    const saved = activity.items.every((item) => responsesFor(item.id).length);
    const fields = activity.items.map((item) => {
      const rows = responsesFor(item.id);
      const latest = rows[rows.length - 1];
      const key = `write:${item.id}`;
      const value = key in state.drafts ? state.drafts[key] : latest ? latest.Answer : '';
      return `<label class="field"><span class="field-label">${item.prompt}</span>
        <textarea rows="5" data-draft="${key}">${esc(value)}</textarea></label>
        ${latest ? `<p class="saved-note">Saved ${formatDate(latest.Time, true)}${rows.length > 1 ? ` · revised ${rows.length - 1} time${rows.length > 2 ? 's' : ''}` : ''}</p>` : ''}`;
    }).join('');
    const busy = state.busy[`write:${module.id}`];
    const model = saved ? `<section class="model"><h2>Compare with a model response</h2>
      <p class="model-lead">One defensible response. Your wording may differ. Check whether yours includes the same ideas.</p>
      ${activity.model.map((block) => blockHtml(block, module)).join('')}</section>` : '';
    return `<div class="write">${fields}
      <button class="btn" data-action="write" data-module="${module.id}" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : saved ? 'Save changes' : 'Save and see a model response'}</button>
      </div>${model}`;
  }

  function actionHtml(module, activity) {
    const rows = state.records.actions.filter((row) => row.Action === activity.id);
    const latest = rows[rows.length - 1];
    const key = (field) => `action:${activity.id}:${field}`;
    const value = (field, column) => key(field) in state.drafts ? state.drafts[key(field)] : latest ? latest[column] : '';
    const busy = state.busy[`action:${activity.id}`];
    return `<div class="write">
      ${latest ? `<p class="saved-note">Recorded ${formatDate(latest.Time, true)}. You can add to it after another visit.</p>` : ''}
      <label class="field"><span class="field-label">What did you notice? <span class="req">Required</span></span>
        <textarea rows="4" data-draft="${key('noticed')}">${esc(value('noticed', 'Noticed'))}</textarea></label>
      <label class="field"><span class="field-label">What did you do?</span>
        <textarea rows="3" data-draft="${key('did')}">${esc(value('did', 'Did'))}</textarea></label>
      <label class="field"><span class="field-label">What will you try next time?</span>
        <textarea rows="3" data-draft="${key('next')}">${esc(value('next', 'Next step'))}</textarea></label>
      <p class="privacy-inline">Use initials only. Do not enter student names, disability information, or private workplace details.</p>
      <button class="btn" data-action="save-action" data-module="${module.id}" data-id="${activity.id}" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : latest ? 'Save update' : 'Save job-site action'}</button>
    </div>`;
  }

  // End-of-module questions: a question, or "No questions right now". One is required.
  function questionsHtml(module, activity) {
    return activity.items.map((item) => {
      const rows = responsesFor(item.id);
      const latest = rows[rows.length - 1];
      const savedNone = Boolean(latest) && latest.Answer === NO_QUESTIONS;
      const key = `q:${item.id}`;
      const none = `${key}:none` in state.drafts ? state.drafts[`${key}:none`] === 'yes' : savedNone;
      const value = key in state.drafts ? state.drafts[key] : latest && !savedNone ? latest.Answer : '';
      const busy = state.busy[key];
      const saved = latest ? `<p class="saved-note">${savedNone ? 'Saved: no questions right now. You can add one later.' : 'Saved. Your supervisor will see your question and follow up.'} ${formatDate(latest.Time, true)}</p>` : '';
      return `<div class="write questions">
        <label class="field"><span class="field-label">${item.prompt}</span>
          <textarea rows="4" data-draft="${key}" ${none ? 'disabled' : ''} placeholder="Ask anything about this module.">${esc(none ? '' : value)}</textarea></label>
        <label class="no-questions"><input type="checkbox" data-draft="${key}:none" ${none ? 'checked' : ''}> N/A: no questions right now</label>
        ${saved}
        <button class="btn" data-action="questions" data-module="${module.id}" data-item="${item.id}" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : latest ? 'Save changes' : 'Save'}</button>
      </div>`;
    }).join('');
  }

  function activityHtml(module, activity) {
    if (!activity) return '';
    if (activity.type === 'questions') return questionsHtml(module, activity);
    if (activity.type === 'write') return writeHtml(module, activity);
    if (activity.type === 'action') return actionHtml(module, activity);
    return activity.items.map((item, i) => choiceHtml(module, item, i + 1, activity.items.length)).join('');
  }

  /* ---------- Views ---------- */

  function headerHtml() {
    const sup = state.user.isSupervisor;
    const onSup = state.view.name === 'dashboard' || state.view.name === 'coach';
    return `<header class="top"><div class="top-inner">
      <button class="brand" data-action="home">${COURSE.title}</button>
      <nav aria-label="Main">
        ${sup ? `<button class="nav-link ${onSup ? '' : 'is-current'}" data-action="home">My course</button>
          <button class="nav-link ${onSup ? 'is-current' : ''}" data-action="dashboard">Supervisor</button>` : ''}
        <span class="who">${esc(state.user.name)}</span>
      </nav></div></header>`;
  }

  function homeHtml() {
    const records = state.records;
    const next = nextModule();
    const available = COURSE.modules.filter(isAvailable_);
    const complete = available.filter((module) => moduleStatus_(module, records).complete).length;
    const openAction = COURSE.modules.find((module) => {
      const status = moduleStatus_(module, records);
      return status.complete && status.actionsDone < status.actionsTotal;
    });
    const nextStatus = next && moduleStatus_(next, records);
    const firstName = esc(state.user.name.split(' ')[0]);
    const returning = records.progress.length > 0;
    const greeting = `Welcome${returning ? ' back' : ''}, ${firstName}`;
    const nextUp = returning && next ? `<p class="next-up">${next.label} is ${nextStatus.started ? 'waiting where you left off' : 'next'}.</p>` : '';
    const milestones = COURSE.modules.map((module) => {
      const status = moduleStatus_(module, records);
      const mark = status.complete ? 'is-done' : module === next ? 'is-next' : '';
      const short = module.label.replace('Module ', '');
      return `<li class="${mark}" title="${module.label}: ${module.title}"><span aria-hidden="true">${status.complete ? '✓' : short === 'Capstone' ? '★' : short}</span>
        <span class="sr">${module.label}${status.complete ? ', complete' : module === next ? ', next' : ''}</span></li>`;
    }).join('');
    const overview = `<details class="cast" ${returning ? '' : 'open'}><summary>What you will learn</summary>
      <p class="big-goal"><strong>The big goal:</strong> ${COURSE.bigGoal}</p>
      <p>By the end of the course you will be able to:</p>
      <ol class="list">${COURSE.goals.map((goal) => `<li>${goal}</li>`).join('')}</ol>
      <p class="meta">Each module below says what it teaches. The capstone puts it all together.</p></details>`;
    const cast = `<details class="cast" ${returning ? '' : 'open'}><summary>Meet the people in this course</summary>
      <p class="meta">You will follow the same students and coaches from module to module. All names are fictional.</p>
      <div class="cast-grid">${CAST.map((person) => `<div class="person">${ART.portraits[person.id]}<h2>${person.name}</h2>
        <p class="meta">${person.role}</p><p>${person.about}</p></div>`).join('')}</div>
      <p class="meta">You will also meet Carla, Maya’s department lead; Mr. Okafor, the building lead at Luis’s site; and Rosa, Maya’s coworker when she rotates to a food service café.</p></details>`;
    const cards = COURSE.modules.map((module) => {
      const status = moduleStatus_(module, records);
      let pill = '<span class="pill soon">Coming soon</span>';
      let button = '';
      if (status.available) {
        if (status.complete) {
          pill = '<span class="pill done">Complete</span>';
          button = `<button class="btn ghost" data-action="open" data-module="${module.id}" data-index="0">Review</button>`;
        } else if (status.started) {
          pill = `<span class="pill going">In progress · ${status.answered} of ${status.required} questions</span>`;
          button = `<button class="btn" data-action="open" data-module="${module.id}" data-index="${status.resumeAt}">Continue</button>`;
        } else {
          pill = '<span class="pill">Not started</span>';
          button = `<button class="btn" data-action="open" data-module="${module.id}" data-index="0">Start</button>`;
        }
      }
      const action = status.complete && status.actionsTotal
        ? `<p class="action-status">${status.actionsDone >= status.actionsTotal ? '✓ Job-site action recorded' : 'Job-site action not recorded yet'}</p>` : '';
      return `<li class="module ${status.available ? '' : 'is-locked'}">
        <div><p class="eyebrow">${module.label}</p><h2>${module.title}</h2>${module.learn ? `<p class="learn">You will learn to: ${module.learn.charAt(0).toLowerCase() + module.learn.slice(1)}.</p>` : ''}<p class="meta">${module.time}</p>${pill}${action}</div>
        <div class="module-go">${button}</div></li>`;
    }).join('');
    return `<main class="page">
      <section class="welcome">
        <p class="eyebrow">${greeting}</p>
        <h1 tabindex="-1">${COURSE.title}: ${COURSE.subtitle}</h1>
        ${nextUp}
        <p>Work through the modules in order. Your answers save as you go, so you can stop at any screen and pick up later on any device.</p>
        <div class="progress-line"><div class="bar"><span style="width:${available.length ? Math.round(complete / COURSE.modules.length * 100) : 0}%"></span></div>
          <span>${complete} of ${COURSE.modules.length} parts complete</span></div>
        <ol class="milestones" aria-label="Course milestones">${milestones}</ol>
        <p class="privacy"><strong>Privacy:</strong> use initials or fictional examples only. Do not enter student names, disability information, or private workplace details.</p>
        <div class="welcome-go">
          ${next ? `<button class="btn big" data-action="open" data-module="${next.id}" data-index="${nextStatus.started ? nextStatus.resumeAt : 0}">${nextStatus.started ? 'Continue' : 'Start'} ${next.label}</button>` : ''}
          ${openAction ? `<button class="btn ghost big" data-action="open" data-module="${openAction.id}" data-index="${openAction.screens.length - 1}">Record your ${openAction.label} job-site action</button>` : ''}
        </div>
      </section>
      ${overview}
      ${cast}
      <ol class="modules">${cards}</ol>
    </main>`;
  }

  // Blocks after an unrevealed predict block stay hidden until the learner picks.
  function screenBlocks(module, screen, shown) {
    const blocks = screen.blocks || [];
    const stop = shown ? blocks.length : blocks.findIndex((block) => block.type === 'predict') + 1;
    return blocks.slice(0, stop).map((block) => blockHtml(block, module, screen)).join('');
  }

  function screenHtml() {
    const { moduleId, index } = state.view;
    const module = findModule_(moduleId);
    const screen = module.screens[index];
    const last = index === module.screens.length - 1;
    const status = moduleStatus_(module, state.records);
    const shown = revealed(module, index);
    const done = screenDone(screen) && shown;
    let forward;
    if (!last) {
      forward = `<button class="btn" data-action="open" data-module="${module.id}" data-index="${index + 1}" ${done ? '' : 'disabled'}>Continue</button>`;
    } else if (status.complete) {
      forward = '<button class="btn" data-action="home">Back to course</button>';
    } else {
      forward = `<button class="btn" data-action="finish" data-module="${module.id}" ${status.canComplete && !state.busy.finish ? '' : 'disabled'}>${state.busy.finish ? 'Saving…' : `Finish ${module.label}`}</button>`;
    }
    let hint = '';
    if (!shown) hint = 'Make a pick to see what happens.';
    else if (!done) hint = 'Answer each question on this screen to continue.';
    else if (last && !status.complete && !status.canComplete) {
      const missing = module.screens.findIndex((entry) => !screenDone(entry));
      hint = `${status.required - status.answered} question${status.required - status.answered === 1 ? '' : 's'} still need an answer. <button class="link" data-action="open" data-module="${module.id}" data-index="${missing}">Go to the first one</button>`;
    }
    return `<main class="page screen-page">
      <div class="screen-top">
        <button class="link" data-action="home">← All modules</button>
        <span>${module.label} · Screen ${index + 1} of ${module.screens.length}</span>
      </div>
      <div class="bar thin"><span style="width:${Math.round((index + 1) / module.screens.length * 100)}%"></span></div>
      <article class="screen">
        ${index === 0 ? `<div class="intro"><p class="question-box"><span>Guiding question</span>${module.question}</p>${module.art ? `<div class="intro-art">${ART[module.art]}</div>` : ''}</div>` : ''}
        <p class="kind">${screen.kind}</p>
        <h1 tabindex="-1">${screen.title}</h1>
        ${screen.lead ? `<p class="lead">${screen.lead}</p>` : ''}
        ${screenBlocks(module, screen, shown)}
        ${shown ? activityHtml(module, screen.activity) : ''}
      </article>
      <nav class="screen-nav" aria-label="Screens">
        ${index > 0 ? `<button class="btn ghost" data-action="open" data-module="${module.id}" data-index="${index - 1}">Back</button>` : '<span></span>'}
        <span class="hint">${hint}</span>
        ${forward}
      </nav>
    </main>`;
  }

  function doneHtml() {
    const module = findModule_(state.view.moduleId);
    const status = moduleStatus_(module, state.records);
    const checkpoint = module.screens.filter((screen) => screen.activity && screen.activity.type === 'checkpoint')
      .flatMap((screen) => screen.activity.items);
    const right = checkpoint.filter((item) => (responsesFor(item.id)[0] || {}).Correct === 'Yes').length;
    const next = nextModule();
    const actionScreen = module.screens.findIndex((screen) => screen.activity && screen.activity.type === 'action');
    return `<main class="page done">
      <div class="done-badge" aria-hidden="true">✓</div>
      <p class="eyebrow">${module.label} complete</p>
      <h1 tabindex="-1">Nice work, ${esc(state.user.name.split(' ')[0])}.</h1>
      <p class="lead">You finished <strong>${module.title}</strong>.</p>
      ${module.outcomes ? `<section class="can-now"><h2>You can now</h2><ul>${module.outcomes.map((item) => `<li>${item.replace(/\.$/, '')}</li>`).join('')}</ul></section>` : ''}
      ${checkpoint.length ? `<p>Checkpoint: ${right} of ${checkpoint.length} correct on the first try. The checkpoint counts for completion, not a score. Revisit any screen whose explanation surprised you.</p>` : ''}
      ${actionScreen >= 0 && status.actionsDone < status.actionsTotal ? `<div class="callout tone-yellow">Remember your job-site action. After your next site visit, come back and record what you noticed.
        <div><button class="link" data-action="open" data-module="${module.id}" data-index="${actionScreen}">Go to the job-site action</button></div></div>` : ''}
      <div class="welcome-go">
        ${next ? `<button class="btn big" data-action="open" data-module="${next.id}" data-index="0">Start ${next.label}</button>` : '<p>The next module is coming soon.</p>'}
        <button class="btn ghost big" data-action="home">Back to course</button>
      </div>
    </main>`;
  }

  // Every coach's latest question in each module, newest first, so the supervisor can follow up.
  function questionsListHtml(coaches) {
    const all = coaches.flatMap((coach) => (coach.questions || []).map((row) => ({ coach, row })))
      .sort((a, b) => String(b.row.Time).localeCompare(String(a.row.Time)));
    if (!all.length) return '';
    return `<section class="coach-questions"><h2>Questions from coaches</h2>
      <p class="meta">The latest question each coach left at the end of a module. Follow up with them directly.</p>
      <ol class="answers">${all.map(({ coach, row }) => {
        const module = findModule_(row.Module);
        return `<li><p class="q">${esc(coach.name)} · ${module ? module.label : esc(row.Module)}</p><blockquote>${multiline(row.Answer)}</blockquote>
          <p class="meta">${formatDate(row.Time, true)} · <button class="link" data-action="coach" data-email="${esc(coach.email)}">Open coach record</button></p></li>`;
      }).join('')}</ol></section>`;
  }

  function dashboardHtml() {
    if (!state.dashboard) return '<main class="page"><h1 tabindex="-1">Supervisor</h1><p>Loading coaches…</p></main>';
    const rows = state.dashboard.slice().sort((a, b) => String(b.summary.lastActive || b.lastSeen).localeCompare(String(a.summary.lastActive || a.lastSeen)));
    return `<main class="page">
      <p class="eyebrow">Supervisor</p>
      <h1 tabindex="-1">Coach progress</h1>
      <p class="lead">Everyone who has opened the course. Records are kept permanently in the records sheet; nothing here deletes anything.</p>
      ${questionsListHtml(rows)}
      ${rows.length ? `<div class="table-wrap"><table class="dash"><thead><tr>
        <th scope="col">Coach</th><th scope="col">Modules complete</th><th scope="col">Checkpoint first tries</th><th scope="col">Job-site actions</th><th scope="col">Questions</th><th scope="col">Last active</th><th scope="col"><span class="sr">Open</span></th>
      </tr></thead><tbody>${rows.map((coach) => {
        const s = coach.summary;
        return `<tr><td><strong>${esc(coach.name)}</strong><br><span class="meta">${esc(coach.email)}</span></td>
          <td>${s.modulesComplete} of ${s.modulesTotal}${s.modulesAvailable < s.modulesTotal ? `<br><span class="meta">${s.modulesAvailable} built so far</span>` : ''}</td>
          <td>${s.checkpointAnswered ? `${s.checkpointCorrect} of ${s.checkpointAnswered} correct` : '<span class="meta">None yet</span>'}</td>
          <td>${s.actionsDone} recorded${s.actionsOpen ? `<br><span class="flag">${s.actionsOpen} waiting</span>` : ''}</td>
          <td>${s.questions ? `<span class="flag">${s.questions}</span>` : '<span class="meta">None</span>'}</td>
          <td>${formatDate(s.lastActive || coach.lastSeen)}</td>
          <td><button class="btn small" data-action="coach" data-email="${esc(coach.email)}">View</button></td></tr>`;
      }).join('')}</tbody></table></div>` : '<p>No coaches have opened the course yet. Share the web app link with your coaches.</p>'}
    </main>`;
  }

  function coachHtml() {
    const coach = state.coach;
    if (!coach) return '<main class="page"><h1 tabindex="-1">Coach</h1><p>Loading…</p></main>';
    const records = coach.records;
    const modules = COURSE.modules.filter(isAvailable_).map((module) => {
      const status = moduleStatus_(module, records);
      const items = moduleItems_(module).map(({ activity, item }) => {
        const rows = records.responses.filter((row) => row.Item === item.id);
        if (!rows.length) return `<li><p class="q">${item.prompt}</p><p class="meta">Not answered yet</p></li>`;
        if (activity.type === 'write' || activity.type === 'questions') {
          const latest = rows[rows.length - 1];
          return `<li><p class="q">${item.prompt}</p><blockquote>${multiline(latest.Answer)}</blockquote>
            <p class="meta">${formatDate(latest.Time, true)}${rows.length > 1 ? ` · revised ${rows.length - 1} time${rows.length > 2 ? 's' : ''}` : ''}</p></li>`;
        }
        const first = rows[0];
        return `<li><p class="q">${item.prompt}</p><p>${esc(first.Answer)} <span class="pill ${first.Correct === 'Yes' ? 'done' : 'flagged'}">${first.Correct === 'Yes' ? 'Correct' : 'Not correct'}</span></p>
          <p class="meta">${activity.type === 'checkpoint' ? 'Checkpoint · ' : ''}${formatDate(first.Time, true)}</p></li>`;
      }).join('');
      const actions = records.actions.filter((row) => row.Module === module.id);
      const action = actions[actions.length - 1];
      return `<section class="coach-module"><h2>${module.label}: ${module.title}</h2>
        <p>${status.complete ? '<span class="pill done">Complete</span>' : status.started ? `<span class="pill going">In progress · ${status.answered} of ${status.required}</span>` : '<span class="pill">Not started</span>'}</p>
        <ol class="answers">${items}</ol>
        <h3>Job-site action</h3>
        ${action ? `<dl class="action"><dt>Noticed</dt><dd>${multiline(action.Noticed)}</dd><dt>Did</dt><dd>${multiline(action.Did) || '<span class="meta">Not entered</span>'}</dd>
          <dt>Next</dt><dd>${multiline(action['Next step']) || '<span class="meta">Not entered</span>'}</dd></dl>
          <p class="meta">${formatDate(action.Time, true)}${actions.length > 1 ? ` · ${actions.length} entries` : ''}</p>` : '<p class="meta">Not recorded yet</p>'}
      </section>`;
    }).join('');
    const observations = coach.observations.slice().reverse().map((o) => `<li class="obs">
      <p><strong>${esc(o.Competency)}</strong> <span class="pill">${esc(o.Level)}</span></p>
      <p class="meta">Observed ${formatDate(o['Observed on'])}${o.Setting ? ` · ${esc(o.Setting)}` : ''} · by ${esc(o.Supervisor)}</p>
      <dl class="action"><dt>Evidence</dt><dd>${multiline(o.Evidence)}</dd>
        ${o.Impact ? `<dt>Impact</dt><dd>${multiline(o.Impact)}</dd>` : ''}
        ${o['Next practice'] ? `<dt>Next practice</dt><dd>${multiline(o['Next practice'])}</dd>` : ''}
        ${o['Re-check'] ? `<dt>Re-check</dt><dd>${multiline(o['Re-check'])}</dd>` : ''}</dl></li>`).join('');
    const draft = (field, fallback) => esc(`obs:${field}` in state.drafts ? state.drafts[`obs:${field}`] : fallback || '');
    const select = (field, options, placeholder) => `<select data-draft="obs:${field}"><option value="">${placeholder}</option>
      ${options.map((option) => `<option ${state.drafts[`obs:${field}`] === option ? 'selected' : ''}>${option}</option>`).join('')}</select>`;
    const busy = state.busy.observation;
    return `<main class="page">
      <button class="link" data-action="dashboard">← All coaches</button>
      <p class="eyebrow">Coach record</p>
      <h1 tabindex="-1">${esc(coach.name)}</h1>
      <p class="meta">${esc(coach.email)}</p>
      ${modules}
      <section class="coach-module">
        <h2>Supervisor observations</h2>
        <p class="lead">Rate what the coach does, not confidence, intent, or personality. Do not mark safety, dignity, communication, prompting, fading, or data skills from a quiz alone.</p>
        ${observations ? `<ol class="answers">${observations}</ol>` : '<p class="meta">No observations yet.</p>'}
        <form class="obs-form" data-form="observation">
          <h3>Add an observation</h3>
          <div class="row">
            <label class="field"><span class="field-label">Date observed</span><input type="date" data-draft="obs:observedOn" value="${draft('observedOn', today())}"></label>
            <label class="field"><span class="field-label">Setting</span><input type="text" data-draft="obs:setting" value="${draft('setting')}" placeholder="Job site or task"></label>
          </div>
          <div class="row">
            <label class="field"><span class="field-label">Competency</span>${select('competency', RUBRIC.competencies, 'Choose a competency')}</label>
            <label class="field"><span class="field-label">Level</span>${select('level', RUBRIC.levels, 'Choose a level')}</label>
          </div>
          <label class="field"><span class="field-label">Evidence: “I observed…” <span class="req">Required</span></span><textarea rows="3" data-draft="obs:evidence">${draft('evidence')}</textarea></label>
          <label class="field"><span class="field-label">Impact: “This helped or may have limited…”</span><textarea rows="2" data-draft="obs:impact">${draft('impact')}</textarea></label>
          <label class="field"><span class="field-label">Next practice: “Next time, try…”</span><textarea rows="2" data-draft="obs:nextPractice">${draft('nextPractice')}</textarea></label>
          <label class="field"><span class="field-label">Re-check: “We will look for…”</span><textarea rows="2" data-draft="obs:recheck">${draft('recheck')}</textarea></label>
          <button class="btn" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : 'Save observation'}</button>
        </form>
      </section>
    </main>`;
  }

  function render() {
    const view = state.view.name;
    if (view === 'loading') {
      app.innerHTML = '<main class="page"><p class="loading">Loading your course…</p></main>';
      return;
    }
    if (view === 'error') {
      app.innerHTML = `<main class="page"><h1 tabindex="-1">The course could not open</h1><p>${esc(state.view.message)}</p></main>`;
      return;
    }
    const body = { home: homeHtml, screen: screenHtml, done: doneHtml, dashboard: dashboardHtml, coach: coachHtml }[view]();
    // Keep focus and cursor in a text box when a save re-renders the page.
    const active = document.activeElement;
    const focusKey = active && active.dataset ? active.dataset.draft : null;
    const caret = focusKey && 'selectionStart' in active ? active.selectionStart : null;
    app.innerHTML = headerHtml() + body;
    if (focusKey) {
      const again = app.querySelector(`[data-draft="${focusKey}"]`);
      if (again) {
        again.focus();
        if (caret !== null && again.setSelectionRange) again.setSelectionRange(caret, caret);
      }
    }
  }

  /* ---------- Actions ---------- */

  function openScreen(moduleId, index) {
    const module = findModule_(moduleId);
    const screen = module.screens[index];
    go({ name: 'screen', moduleId, index });
    const reached = state.records.progress.some((row) => row.Module === moduleId && row.Screen === screen.id);
    if (!reached) {
      call('saveProgress', { module: moduleId, screen: screen.id, event: 'reached' })
        .then((records) => { state.records = records; render(); })
        .catch(failed);
    }
  }

  function draftsFor(prefix) {
    const out = {};
    Object.keys(state.drafts).forEach((key) => { if (key.startsWith(prefix)) out[key.slice(prefix.length)] = state.drafts[key]; });
    return out;
  }

  function clearDrafts(prefix) {
    Object.keys(state.drafts).forEach((key) => { if (key.startsWith(prefix)) delete state.drafts[key]; });
  }

  const actions = {
    home: () => go({ name: 'home' }),
    open: (el) => openScreen(el.dataset.module, Number(el.dataset.index)),
    predict: (el) => {
      state.predicted[el.dataset.screen] = Number(el.dataset.index);
      render();
      const note = app.querySelector('.predict-done');
      if (note) note.focus();
    },
    check: (el) => saving(el.dataset.item, async () => {
      state.records = await call('saveResponse', { module: el.dataset.module, item: el.dataset.item, answer: state.picks[el.dataset.item] });
      delete state.picks[el.dataset.item];
    }),
    write: (el) => {
      const { moduleId, index } = state.view;
      const activity = findModule_(moduleId).screens[index].activity;
      const pending = activity.items.filter((item) => {
        const key = `write:${item.id}`;
        return key in state.drafts || !responsesFor(item.id).length;
      });
      if (!pending.length) {
        showToast('Nothing has changed since your last save.');
        return;
      }
      if (pending.some((item) => !String(state.drafts[`write:${item.id}`] || '').trim())) {
        showToast('Write a response before you save.');
        return;
      }
      saving(`write:${el.dataset.module}`, async () => {
        for (const item of pending) {
          state.records = await call('saveResponse', { module: el.dataset.module, item: item.id, answer: state.drafts[`write:${item.id}`] });
          delete state.drafts[`write:${item.id}`];
        }
      });
    },
    questions: (el) => {
      const key = `q:${el.dataset.item}`;
      const rows = responsesFor(el.dataset.item);
      const latest = rows[rows.length - 1];
      const savedNone = Boolean(latest) && latest.Answer === NO_QUESTIONS;
      const none = `${key}:none` in state.drafts ? state.drafts[`${key}:none`] === 'yes' : savedNone;
      const text = String(key in state.drafts ? state.drafts[key] : latest && !savedNone ? latest.Answer : '').trim();
      if (!none && !text) {
        showToast('Write your question, or check “No questions right now.”');
        return;
      }
      if (latest && none === savedNone && (none || text === latest.Answer)) {
        showToast('Nothing has changed since your last save.');
        return;
      }
      saving(key, async () => {
        state.records = await call('saveResponse', { module: el.dataset.module, item: el.dataset.item, answer: none ? '' : text, none });
        clearDrafts(key);
      });
    },
    'save-action': (el) => {
      const prefix = `action:${el.dataset.id}:`;
      const rows = state.records.actions.filter((row) => row.Action === el.dataset.id);
      const latest = rows[rows.length - 1] || {};
      const typed = draftsFor(prefix);
      const entry = {
        module: el.dataset.module,
        action: el.dataset.id,
        noticed: 'noticed' in typed ? typed.noticed : latest.Noticed,
        did: 'did' in typed ? typed.did : latest.Did,
        next: 'next' in typed ? typed.next : latest['Next step'],
      };
      if (!String(entry.noticed || '').trim()) {
        showToast('Write what you noticed before you save.');
        return;
      }
      if (!Object.keys(typed).length && rows.length) {
        showToast('Nothing has changed since your last save.');
        return;
      }
      saving(`action:${el.dataset.id}`, async () => {
        state.records = await call('saveAction', entry);
        clearDrafts(prefix);
        showToast('Job-site action saved.');
      });
    },
    finish: (el) => saving('finish', async () => {
      state.records = await call('saveProgress', { module: el.dataset.module, event: 'complete' });
      go({ name: 'done', moduleId: el.dataset.module });
    }),
    dashboard: () => {
      state.dashboard = null;
      go({ name: 'dashboard' });
      call('getDashboard').then((rows) => { state.dashboard = rows; render(); }).catch(failed);
    },
    coach: (el) => {
      state.coach = null;
      clearDrafts('obs:');
      go({ name: 'coach', email: el.dataset.email });
      call('getCoach', el.dataset.email).then((coach) => { state.coach = coach; render(); }).catch(failed);
    },
  };

  app.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action]');
    if (!el || el.disabled) return;
    event.preventDefault();
    actions[el.dataset.action](el);
  });

  app.addEventListener('change', (event) => {
    const el = event.target;
    if (el.type === 'checkbox' && el.dataset.draft) {
      state.drafts[el.dataset.draft] = el.checked ? 'yes' : '';
      render();
      const again = app.querySelector(`[data-draft="${el.dataset.draft}"]`);
      if (again) again.focus();
    } else if (el.dataset.pick) {
      state.picks[el.dataset.pick] = Number(el.value);
      render();
      const again = app.querySelector(`[data-pick="${el.dataset.pick}"][value="${el.value}"]`);
      if (again) again.focus();
    } else if (el.dataset.draft && el.tagName === 'SELECT') {
      state.drafts[el.dataset.draft] = el.value;
    }
  });

  app.addEventListener('input', (event) => {
    const el = event.target;
    if (el.dataset.draft && el.type !== 'checkbox') state.drafts[el.dataset.draft] = el.value;
  });

  app.addEventListener('submit', (event) => {
    event.preventDefault();
    if (event.target.dataset.form !== 'observation') return;
    const typed = draftsFor('obs:');
    const entry = Object.assign({ coach: state.coach.email, observedOn: today() }, typed);
    saving('observation', async () => {
      state.coach = await call('saveObservation', entry);
      clearDrafts('obs:');
      showToast('Observation saved.');
    });
  });

  // Stop the browser from leaving with unsaved writing.
  window.addEventListener('beforeunload', (event) => {
    if (Object.keys(state.drafts).some((key) => !key.startsWith('obs:observedOn') && String(state.drafts[key]).trim())) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  render();
  call('getState')
    .then((result) => {
      state.user = result.user;
      state.records = result.records;
      go({ name: 'home' });
    })
    .catch((error) => {
      state.view = { name: 'error', message: (error && error.message) || 'Check your connection and reload the page.' };
      render();
    });
})();
