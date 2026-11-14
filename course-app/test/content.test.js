import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import { loadServer } from "./load.js";

const root = path.resolve(import.meta.dirname, "..");
const { COURSE } = loadServer({ setup: false }).server;

test("screen and question ids are unique, because records point to them", () => {
  const ids = [];
  COURSE.modules.forEach((module) => {
    ids.push(module.id);
    module.screens.forEach((screen) => {
      ids.push(screen.id);
      const activity = screen.activity;
      if (activity && activity.items) activity.items.forEach((item) => ids.push(item.id));
      if (activity && activity.type === "action") ids.push(activity.id);
    });
  });
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), []);
});

test("every question is complete", () => {
  COURSE.modules.flatMap((module) => module.screens).forEach((screen) => {
    const activity = screen.activity;
    if (!activity) return;
    assert.ok(["choice", "checkpoint", "write", "action", "questions"].includes(activity.type), screen.id);
    if (activity.type === "write") assert.ok(activity.model && activity.model.length, `${screen.id} needs a model response`);
    if (activity.type === "choice" || activity.type === "checkpoint") {
      activity.items.forEach((item) => {
        assert.ok(item.options.length >= 2, item.id);
        assert.equal(new Set(item.options).size, item.options.length, `${item.id} repeats an option`);
        assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length, item.id);
        assert.ok(item.explain, `${item.id} needs an explanation`);
      });
    }
  });
});

test("every \"What would you do?\" option has its own response", () => {
  COURSE.modules.flatMap((module) => module.screens).forEach((screen) => {
    (screen.blocks || []).filter((block) => block.type === "predict").forEach((block) => {
      assert.equal((block.responses || []).length, block.options.length, screen.id);
    });
  });
});

test("every built module shows the same skill for both students", () => {
  COURSE.modules.filter((module) => module.screens.length).forEach((module) => {
    const block = module.screens.flatMap((screen) => screen.blocks || []).find((entry) => entry.type === "twoStudents");
    assert.ok(block && block.maya && block.luis && block.same, module.id);
  });
});

test("every built module asks what questions the coach still has", () => {
  COURSE.modules.filter((module) => module.screens.length).forEach((module) => {
    assert.ok(module.screens.some((screen) => screen.activity && screen.activity.type === "questions"), module.id);
  });
});

test("learner text follows the course writing rules", () => {
  const text = fs.readFileSync(path.join(root, "src/content/course.js"), "utf8");
  assert.doesNotMatch(text, /[–—]/, "no em or en dashes");
  assert.doesNotMatch(text, /\bpaper\b|share out|speak your answer/i);
});

test("the build makes files Apps Script can load, and the page can call only the intended functions", () => {
  execFileSync(process.execPath, [path.join(root, "tools/build.mjs")], { stdio: "pipe" });
  const code = fs.readFileSync(path.join(root, "dist/Code.gs"), "utf8");
  new vm.Script(code);
  const callable = [...code.matchAll(/^function ([A-Za-z0-9]+)\b/gm)].map((match) => match[1]).filter((name) => !name.endsWith("_")).sort();
  assert.deepEqual(callable, ["doGet", "getCoach", "getDashboard", "getState", "saveAction", "saveObservation", "saveProgress", "saveResponse", "setup", "showSetup"]);
  for (const file of ["Index.html", "preview.html"]) {
    const html = fs.readFileSync(path.join(root, "dist", file), "utf8");
    const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
    assert.doesNotMatch(script, /<\/script/i, file);
    new vm.Script(script);
  }
});
