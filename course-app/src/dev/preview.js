/**
 * Local preview only (dist/preview.html). Runs the real Code.js against fakeGoogle.js,
 * keeps the pretend sheet in this browser's storage, and lets you switch between a
 * supervisor and two coaches. Nothing here is uploaded to Apps Script.
 */
function startPreview(makeServer) {
  const STORAGE_KEY = 'job-coach-course-preview';
  const OWNER = 'jennifer.burnes@usd497.org';
  const PEOPLE = [
    { email: OWNER, label: 'Jennifer Burnes (owner, supervisor)' },
    { email: 'alex.rivera@usd497.org', label: 'Alex Rivera (new coach)' },
    { email: 'sam.lee@usd497.org', label: 'Sam Lee (finished Module 1)' },
  ];

  const revive = (key, value) => (value && value.__date ? new Date(value.__date) : value);
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved, revive) : null;
    } catch (error) {
      return null;
    }
  }
  function save(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store, function (key, value) {
        return this[key] instanceof Date ? { __date: this[key].toISOString() } : value;
      }));
    } catch (error) {
      // Private windows can refuse storage; the preview still works until reload.
    }
  }

  let current = OWNER;
  try { current = localStorage.getItem(`${STORAGE_KEY}-user`) || OWNER; } catch (error) { /* keep default */ }

  let store = load();
  const fresh = !store;
  if (fresh) store = { props: {}, books: {} };
  const fake = makeFakeGoogle(store, save);
  const server = makeServer(fake.globals);
  fake.setUser(OWNER, OWNER);

  if (fresh) {
    server.setup();
    // A sample coach who has finished Module 1, so the supervisor view has something to show.
    fake.setUser('sam.lee@usd497.org');
    server.getState();
    const module = COURSE.modules[0];
    module.screens.forEach((screen) => server.saveProgress({ module: module.id, screen: screen.id, event: 'reached' }));
    moduleItems_(module).forEach(({ activity, item }, i) => {
      if (activity.type === 'questions') {
        server.saveResponse({ module: module.id, item: item.id, answer: 'If a student is close to finishing a task but makes a mistake on the last step, should I let them finish or step in?' });
        return;
      }
      server.saveResponse({ module: module.id, item: item.id, answer: activity.type === 'write'
        ? 'I’m a job coach, here to support him while he learns the job. Work questions are best for him or the building lead.'
        : i === 2 ? (item.answer + 1) % item.options.length : item.answer });
    });
    server.saveProgress({ module: module.id, event: 'complete' });
    server.saveAction({ module: module.id, action: 'm1-action', noticed: 'At the deli, the lead asked me whether J. could stay late. I paused and looked at J., and J. answered.', did: 'Waited, then redirected with a look.', next: 'Stand farther back during the shift-change huddle.' });
    save(store);
  }
  fake.setUser(current, OWNER);

  // Same shape as google.script.run: withSuccessHandler(...).withFailureHandler(...).name(args)
  function runner(success, failure) {
    return new Proxy({}, {
      get(target, name) {
        if (name === 'withSuccessHandler') return (handler) => runner(handler, failure);
        if (name === 'withFailureHandler') return (handler) => runner(success, handler);
        return (...args) => {
          setTimeout(() => {
            try {
              const result = server[name](...JSON.parse(JSON.stringify(args)));
              if (success) success(result === undefined ? undefined : JSON.parse(JSON.stringify(result)));
            } catch (error) {
              if (failure) failure(error);
            }
          }, 250);
        };
      },
    });
  }
  window.google = { script: { run: runner(null, null) } };

  window.addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.className = 'preview-bar';
    bar.innerHTML = `<strong>Preview</strong>
      <label>Signed in as <select>${PEOPLE.map((person) => `<option value="${person.email}" ${person.email === current ? 'selected' : ''}>${person.label}</option>`).join('')}</select></label>
      <button type="button">Reset preview data</button>`;
    bar.querySelector('select').addEventListener('change', (event) => {
      try { localStorage.setItem(`${STORAGE_KEY}-user`, event.target.value); } catch (error) { /* ignore */ }
      location.reload();
    });
    bar.querySelector('button').addEventListener('click', () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* ignore */ }
      location.reload();
    });
    document.body.prepend(bar);
  });
}
