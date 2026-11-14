// Loads the course, progress rules, and server into one sandbox with fake Google services,
// the same way they run together in Apps Script.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

export const OWNER = "jennifer.burnes@usd497.org";

export function loadServer({ setup = true } = {}) {
  const store = { props: {}, books: {} };
  const sandbox = { console: { log() {} } };
  vm.createContext(sandbox);
  vm.runInContext(read("src/dev/fakeGoogle.js"), sandbox);
  const fake = sandbox.makeFakeGoogle(store);
  Object.assign(sandbox, fake.globals);
  vm.runInContext([
    read("src/content/course.js"),
    read("src/shared/progress.js"),
    read("src/server/Code.js"),
    "this.COURSE = COURSE; this.RUBRIC = RUBRIC; this.TABS = TABS;",
  ].join("\n"), sandbox);
  fake.setUser(OWNER, OWNER);
  if (setup) sandbox.setup();
  const sheetRows = (name) => store.books[store.props.SHEET_ID].sheets.find((sheet) => sheet.name === name).rows;
  // Results cross to the page as JSON, so compare them as JSON.
  const call = (name, ...args) => JSON.parse(JSON.stringify(sandbox[name](...args)) ?? "null");
  return { server: sandbox, store, as: (email) => fake.setUser(email), sheetRows, call };
}

// Answers every question in a module, using the right answer unless wrong() says otherwise.
export function answerAll(env, module, wrong = () => false) {
  const { server } = env;
  server.moduleItems_(module).forEach(({ activity, item }, i) => {
    const answer = activity.type === "write" || activity.type === "questions" ? "A short response." : wrong(i) ? (item.answer + 1) % item.options.length : item.answer;
    server.saveResponse({ module: module.id, item: item.id, answer });
  });
}
