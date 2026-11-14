import { test } from "node:test";
import assert from "node:assert/strict";
import { loadServer, answerAll, OWNER } from "./load.js";

const COACH = "alex.rivera@usd497.org";

test("setup makes every tab with headers and adds the owner as a supervisor, once", () => {
  const env = loadServer();
  env.server.setup();
  for (const [name, headers] of Object.entries(env.server.TABS)) {
    assert.deepEqual([...env.sheetRows(name)[0]], [...headers], name);
  }
  assert.deepEqual(env.sheetRows("Supervisors").slice(1).map((row) => row[0]).join(), OWNER);
  assert.equal(env.store.books[env.store.props.SHEET_ID].sheets.length, Object.keys(env.server.TABS).length);
});

test("only the owner can run setup from the web page", () => {
  const env = loadServer();
  env.as(COACH);
  assert.throws(() => env.server.setup(), /Only the owner/);
});

test("only usd497.org accounts can open the course", () => {
  const env = loadServer();
  env.as("someone@gmail.com");
  assert.throws(() => env.server.getState(), /usd497\.org/);
  env.as("");
  assert.throws(() => env.server.getState(), /usd497\.org/);
});

test("a coach is added on the first visit and only updated after that", () => {
  const env = loadServer();
  env.as(COACH);
  const state = env.call("getState");
  assert.deepEqual(state.user, { email: COACH, name: "Alex Rivera", isSupervisor: false });
  env.call("getState");
  assert.equal(env.sheetRows("Coaches").length, 2);
});

test("multiple-choice answers are scored on the server and the first answer is kept", () => {
  const env = loadServer();
  env.as(COACH);
  const item = env.server.findItem_("m1", "m1-cp-q1").item;
  const wrong = (item.answer + 1) % item.options.length;
  let records = env.call("saveResponse", { module: "m1", item: item.id, answer: wrong });
  records = env.call("saveResponse", { module: "m1", item: item.id, answer: item.answer });
  assert.equal(records.responses.length, 1);
  assert.equal(records.responses[0].Correct, "No");
  assert.equal(records.responses[0].Answer, item.options[wrong]);
  assert.equal(records.responses[0].Kind, "checkpoint");
  assert.equal(typeof records.responses[0].Time, "string");
});

test("bad answers are refused", () => {
  const env = loadServer();
  env.as(COACH);
  assert.throws(() => env.server.saveResponse({ module: "m1", item: "m1-cp-q1", answer: 9 }), /Choose one/);
  assert.throws(() => env.server.saveResponse({ module: "m1", item: "nope", answer: 0 }), /not found/);
  assert.throws(() => env.server.saveResponse({ module: "m1", item: "m1-coworker-say", answer: "   " }), /Write a response/);
  assert.throws(() => env.server.saveProgress({ module: "m8", screen: "x", event: "reached" }), /not available/);
});

test("revised written answers are new rows; nothing is overwritten", () => {
  const env = loadServer();
  env.as(COACH);
  env.call("saveResponse", { module: "m1", item: "m1-coworker-say", answer: "First try." });
  const records = env.call("saveResponse", { module: "m1", item: "m1-coworker-say", answer: "Second try." });
  assert.deepEqual(records.responses.map((row) => row.Answer), ["First try.", "Second try."]);
});

test("text that looks like a formula is stored as plain text", () => {
  const env = loadServer();
  assert.equal(env.server.safeText_('=IMPORTXML("x")'), `'=IMPORTXML("x")`);
  assert.equal(env.server.safeText_("@x"), "'@x");
  assert.equal(env.server.safeText_("Fine"), "Fine");
  assert.equal(env.server.safeText_("x".repeat(6000)).length, 5000);
});

test("a module can be finished only after every question is answered, and only once", () => {
  const env = loadServer();
  env.as(COACH);
  const module = env.server.findModule_("m1");
  assert.throws(() => env.server.saveProgress({ module: "m1", event: "complete" }), /Answer every question/);
  answerAll(env, module, (i) => i === 0);
  env.call("saveProgress", { module: "m1", event: "complete" });
  const records = env.call("saveProgress", { module: "m1", event: "complete" });
  assert.equal(records.progress.filter((row) => row.Event === "complete").length, 1);
  const status = env.server.moduleStatus_(module, records);
  assert.equal(status.complete, true);
  assert.equal(status.answered, status.required);
});

test("each screen visit is recorded once", () => {
  const env = loadServer();
  env.as(COACH);
  env.call("saveProgress", { module: "m1", screen: "m1-goals", event: "reached" });
  const records = env.call("saveProgress", { module: "m1", screen: "m1-goals", event: "reached" });
  assert.equal(records.progress.length, 1);
  assert.throws(() => env.server.saveProgress({ module: "m1", screen: "nope", event: "reached" }), /not found/);
});

test("job-site actions keep every entry", () => {
  const env = loadServer();
  env.as(COACH);
  assert.throws(() => env.server.saveAction({ module: "m1", action: "m1-action", noticed: " " }), /what you noticed/);
  env.call("saveAction", { module: "m1", action: "m1-action", noticed: "One", did: "", next: "" });
  const records = env.call("saveAction", { module: "m1", action: "m1-action", noticed: "Two", did: "Waited", next: "" });
  assert.deepEqual(records.actions.map((row) => row.Noticed), ["One", "Two"]);
});

test("coaches cannot open supervisor pages; people on the Supervisors tab can", () => {
  const env = loadServer();
  env.as(COACH);
  env.server.getState();
  for (const name of ["getDashboard", "getCoach", "saveObservation"]) {
    assert.throws(() => env.server[name]({ coach: COACH }), /Only supervisors/, name);
  }
  env.as(OWNER);
  env.server.SpreadsheetApp.openById(env.store.props.SHEET_ID).getSheetByName("Supervisors").appendRow(["Pat.Kim@usd497.org ", "Pat Kim", new Date()]);
  env.as("pat.kim@usd497.org");
  assert.equal(env.call("getState").user.isSupervisor, true);
  assert.equal(env.call("getDashboard").length, 2);
});

test("the dashboard summarizes each coach", () => {
  const env = loadServer();
  env.as(COACH);
  env.server.getState();
  const module = env.server.findModule_("m1");
  const items = env.server.moduleItems_(module);
  const checkpoint = items.filter(({ activity }) => activity.type === "checkpoint").length;
  const firstCheckpoint = items.findIndex(({ activity }) => activity.type === "checkpoint");
  answerAll(env, module, (i) => i === firstCheckpoint);
  env.server.saveProgress({ module: "m1", event: "complete" });
  env.as(OWNER);
  const row = env.call("getDashboard").find((coach) => coach.email === COACH);
  assert.equal(row.summary.modulesComplete, 1);
  assert.equal(row.summary.modulesTotal, env.server.COURSE.modules.length);
  assert.equal(row.summary.checkpointAnswered, checkpoint);
  assert.equal(row.summary.checkpointCorrect, checkpoint - 1);
  assert.equal(row.summary.actionsOpen, 1);
  assert.ok(row.summary.lastActive);
});

test("supervisors record observations against the rubric", () => {
  const env = loadServer();
  env.as(COACH);
  env.server.getState();
  env.as(OWNER);
  const good = { coach: COACH, observedOn: "2026-11-11", setting: "Deli", competency: "Role and boundaries", level: "Knows", evidence: "Redirected the lead's question." };
  assert.throws(() => env.server.saveObservation({ ...good, competency: "Juggling" }), /competency/);
  assert.throws(() => env.server.saveObservation({ ...good, level: "Expert" }), /level/);
  assert.throws(() => env.server.saveObservation({ ...good, evidence: "" }), /what you observed/);
  assert.throws(() => env.server.saveObservation({ ...good, coach: "nobody@usd497.org" }), /not found/);
  const coach = env.call("saveObservation", good);
  assert.equal(coach.observations.length, 1);
  assert.equal(coach.observations[0].Supervisor, OWNER);
});

test("end-of-module questions: a question or no questions is required, and supervisors see real questions", () => {
  const env = loadServer();
  env.as(COACH);
  env.server.getState();
  assert.throws(() => env.server.saveResponse({ module: "m1", item: "m1-questions-q", answer: "  " }), /No questions right now/);
  env.server.saveResponse({ module: "m1", item: "m1-questions-q", none: true });
  env.as(OWNER);
  let row = env.call("getDashboard").find((coach) => coach.email === COACH);
  assert.equal(row.summary.questions, 0);
  env.as(COACH);
  env.server.saveResponse({ module: "m1", item: "m1-questions-q", answer: "How far away should I stand when fading?" });
  env.as(OWNER);
  row = env.call("getDashboard").find((coach) => coach.email === COACH);
  assert.equal(row.summary.questions, 1);
  assert.equal(row.questions[0].Answer, "How far away should I stand when fading?");
  assert.equal(env.sheetRows("Responses").filter((r) => r[2] === "m1-questions-q" || r.includes("m1-questions-q")).length, 2);
});
