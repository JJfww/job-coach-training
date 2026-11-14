// Builds the files to paste into Apps Script, plus a local preview page.
//   dist/Code.gs          course content + progress rules + server
//   dist/Index.html       the web page (styles and scripts inlined; Apps Script serves one file)
//   dist/appsscript.json  the manifest
//   dist/preview.html     open in a browser to try the app with pretend data (not uploaded)
// Paths resolve from this file, so it can run from any folder.
import fs from "node:fs";
import path from "node:path";
import { portrait, roleCircle, fadeStrip, supportChoice, taskSteps, chainLinks, promptLadder, ICONS } from "../../resources/illustrations/art.mjs";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const dist = path.join(root, "dist");

const content = read("src/content/course.js");
const shared = read("src/shared/progress.js");
const server = read("src/server/Code.js");
const client = read("src/client/app.js");
const styles = read("src/client/styles.css");
const template = read("src/client/index.html");
const fake = read("src/dev/fakeGoogle.js").replace(/\nif \(typeof module[^\n]*\n?/, "\n");
const preview = read("src/dev/preview.js");
// Illustrations for the page only; the server never needs them.
const art = `const ART = ${JSON.stringify({
  portraits: Object.fromEntries(["maya", "luis", "dana", "ben"].map((who) => [who, portrait(who)])),
  roleCircle,
  fadeStrip,
  supportChoice,
  taskSteps,
  chainLinks,
  promptLadder,
  icons: ICONS,
})};\n`;

// The server functions the web page may call. Everything else in Code.js ends in "_".
const PUBLIC = ["setup", "getState", "saveProgress", "saveResponse", "saveAction", "getDashboard", "getCoach", "saveObservation"];

// Inline scripts must not contain "</script", or the browser ends the tag early.
const inline = (code) => code.replace(/<\/(script)/gi, "<\\/$1");
// CSS @import lines only work at the top of a stylesheet, so lift them there.
const hoistImports = (css) => {
  const imports = css.match(/^@import[^\n]*\n/gm) || [];
  return imports.join("") + css.replace(/^@import[^\n]*\n/gm, "");
};
const page = (scripts, css = styles) => template.replace("/*STYLES*/", () => hoistImports(css)).replace("/*SCRIPTS*/", () => inline(scripts.join("\n")));

const banner = "// Built by tools/build.mjs from src/. Edit the files in src/, then run `npm run build`.\n\n";

fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, "Code.gs"), banner + [content, shared, server].join("\n"));
fs.writeFileSync(path.join(dist, "Index.html"), page([content, shared, art, client]));
fs.copyFileSync(path.join(root, "src/server/appsscript.json"), path.join(dist, "appsscript.json"));
const previewScripts = [
  content,
  shared,
  fake,
  preview,
  art,
  `startPreview(function (globals) {\nconst { PropertiesService, SpreadsheetApp, Session, LockService } = globals;\n${server}\nreturn { ${PUBLIC.join(", ")} };\n});`,
  client,
];
fs.writeFileSync(path.join(dist, "preview.html"), page(previewScripts));
const outputs = ["Code.gs", "Index.html", "appsscript.json", "preview.html"];

for (const file of outputs) {
  const size = fs.statSync(path.join(dist, file)).size;
  console.log(`dist/${file}  ${(size / 1024).toFixed(1)} KB`);
}
