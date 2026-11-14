// Course illustrations, shared by the Bento builder (tools/build_job_coach_claude_edition.mjs)
// and the web app build (course-app/tools/build.mjs). Flat shapes in the course palette, with no
// facial detail. Each export is a complete SVG string.
//
// The cast (see Course-Cast-and-Voice-for-Review.md):
//   Maya  student, grocery store; apron, phone checklist, ponytail
//   Luis  student, light custodial; headphones, speech app tablet
//   Dana  experienced job coach; clipboard, lanyard
//   Ben   new job coach; lanyard, notebook

const INK = "#1A202C";
const GRAY = "#718096";
const CORAL = "#FC8181";
const YELLOW = "#F6E05E";
const PALE_GRAY = "#E8ECF1";
const PALE_CORAL = "#FDE3E3";
const PALE_YELLOW = "#FBF3C4";

const svg = (w, h, body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">${body}</svg>`;

// One person in a 100 x 170 box, feet at the bottom. `look` sets colors and props.
function person(look, x = 0, y = 0, s = 1) {
  const { skin, shirt, sleeve = shirt, pants = GRAY, hair, hairStyle, prop } = look;
  const hairShapes = {
    ponytail: `<path d="M33 38 q0-21 17-21 q17 0 17 21 q-6-10-17-10 q-11 0-17 10z" fill="${hair}"/><path d="M64 28 q14 4 12 24 q-6-6-10-14z" fill="${hair}"/>`,
    short: `<path d="M33 38 q0-22 17-22 q17 0 17 22 q-4-12-17-12 q-13 0-17 12z" fill="${hair}"/>`,
    curly: `<circle cx="38" cy="30" r="9" fill="${hair}"/><circle cx="50" cy="23" r="10" fill="${hair}"/><circle cx="62" cy="30" r="9" fill="${hair}"/><circle cx="34" cy="40" r="6" fill="${hair}"/><circle cx="66" cy="40" r="6" fill="${hair}"/>`,
    wavy: `<path d="M32 40 q-2-24 18-24 q20 0 18 24 q-4-12-10-13 q-4 6-16 5 q-6 0-10 8z" fill="${hair}"/>`,
  };
  const props = {
    apron: `<path d="M38 74 h24 v52 h-24z" fill="${CORAL}"/><path d="M38 74 l-4-8 M62 74 l4-8" stroke="${CORAL}" stroke-width="3"/>`,
    phone: `<rect x="56" y="98" width="11" height="18" rx="2" fill="${INK}"/><rect x="58" y="101" width="7" height="11" rx="1" fill="${PALE_YELLOW}"/>`,
    headphones: `<path d="M31 40 q0-26 19-26 q19 0 19 26" fill="none" stroke="${INK}" stroke-width="4"/><rect x="27" y="36" width="8" height="13" rx="3" fill="${YELLOW}"/><rect x="65" y="36" width="8" height="13" rx="3" fill="${YELLOW}"/>`,
    tablet: `<rect x="40" y="94" width="30" height="22" rx="3" fill="${INK}"/><rect x="43" y="97" width="11" height="7" rx="1" fill="${YELLOW}"/><rect x="56" y="97" width="11" height="7" rx="1" fill="${PALE_CORAL}"/><rect x="43" y="106" width="11" height="7" rx="1" fill="${PALE_CORAL}"/><rect x="56" y="106" width="11" height="7" rx="1" fill="${YELLOW}"/>`,
    lanyard: `<path d="M42 66 L50 90 L58 66" fill="none" stroke="${CORAL}" stroke-width="2.5"/><rect x="44" y="89" width="12" height="15" rx="2" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/>`,
    clipboard: `<rect x="56" y="92" width="22" height="28" rx="2" fill="#B9844F"/><rect x="59" y="97" width="16" height="20" fill="#FFFFFF"/><rect x="62" y="89" width="10" height="5" rx="1" fill="${INK}"/><path d="M61 102 h12 M61 107 h12 M61 112 h8" stroke="${GRAY}" stroke-width="1.5"/>`,
    notebook: `<rect x="55" y="96" width="18" height="22" rx="2" fill="${YELLOW}"/><path d="M58 96 v22" stroke="${INK}" stroke-width="1.5"/>`,
  };
  const holds = prop.some((p) => ["phone", "tablet", "clipboard", "notebook"].includes(p));
  const rightArm = holds
    ? `<path d="M70 82 q8 16 -4 26" fill="none" stroke="${sleeve}" stroke-width="11" stroke-linecap="round"/><circle cx="63" cy="109" r="5.5" fill="${skin}"/>`
    : `<path d="M70 82 q6 20 4 38" fill="none" stroke="${sleeve}" stroke-width="11" stroke-linecap="round"/><circle cx="74" cy="122" r="5.5" fill="${skin}"/>`;
  const body = [
    `<path d="M32 122 h36 v44 h-15 l-3-28 l-3 28 h-15z" fill="${pants}"/>`,
    `<path d="M47 166 h-17 q0-5 6-5 h11z M53 166 h17 q0-5-6-5 h-11z" fill="${INK}"/>`,
    `<path d="M30 82 q-5 20 -4 38" fill="none" stroke="${sleeve}" stroke-width="11" stroke-linecap="round"/><circle cx="26" cy="122" r="5.5" fill="${skin}"/>`,
    `<rect x="45" y="54" width="10" height="12" fill="${skin}"/>`,
    `<path d="M28 126 V86 q0-22 22-22 q22 0 22 22 V126z" fill="${shirt}"/>`,
    ...prop.filter((p) => ["apron", "lanyard"].includes(p)).map((p) => props[p]),
    `<circle cx="50" cy="40" r="16" fill="${skin}"/>`,
    hairShapes[hairStyle],
    ...prop.filter((p) => p === "headphones").map((p) => props[p]),
    rightArm,
    ...prop.filter((p) => ["phone", "tablet", "clipboard", "notebook"].includes(p)).map((p) => props[p]),
  ].join("");
  return `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
}

export const LOOKS = {
  maya: { skin: "#8D5A3B", shirt: "#4A5568", hair: "#2B1B12", hairStyle: "ponytail", prop: ["apron", "phone"] },
  luis: { skin: "#C99364", shirt: "#5B8DB8", pants: "#4A5568", hair: "#1F1A17", hairStyle: "short", prop: ["headphones", "tablet"] },
  dana: { skin: "#5C3A28", shirt: "#2F855A", pants: "#4A5568", hair: "#1A1410", hairStyle: "curly", prop: ["lanyard", "clipboard"] },
  ben: { skin: "#F0C8A0", shirt: "#B7791F", hair: "#7B4A2A", hairStyle: "wavy", prop: ["lanyard", "notebook"] },
};

const NAMES = { maya: "Maya, a student", luis: "Luis, a student", dana: "Dana, an experienced job coach", ben: "Ben, a new job coach" };

// A single portrait on a soft round ground, for the "Meet the people" screen.
export const portrait = (who) => {
  const ground = { maya: PALE_CORAL, luis: PALE_YELLOW, dana: PALE_GRAY, ben: PALE_YELLOW }[who];
  return svg(160, 180, `<circle cx="80" cy="96" r="72" fill="${ground}"/>${person(LOOKS[who], 30, 6, 1)}`, NAMES[who]);
};

// Module 1 cover: the student at work with the supervisor and a coworker; the coach a step back.
export const roleCircle = svg(
  380, 190,
  [
    `<rect x="0" y="170" width="360" height="4" rx="2" fill="${PALE_GRAY}"/>`,
    // shelf behind the student
    `<rect x="118" y="44" width="124" height="126" rx="6" fill="${PALE_GRAY}"/>`,
    `<path d="M118 86 h124 M118 128 h124" stroke="#FFFFFF" stroke-width="4"/>`,
    `<rect x="130" y="62" width="16" height="22" rx="2" fill="${YELLOW}"/><rect x="150" y="66" width="16" height="18" rx="2" fill="${CORAL}"/><rect x="200" y="104" width="18" height="22" rx="2" fill="${YELLOW}"/><rect x="176" y="146" width="22" height="22" rx="2" fill="${CORAL}"/>`,
    person({ skin: "#A86A46", shirt: "#7A8699", hair: "#2B1B12", hairStyle: "short", prop: [] }, 6, 26, 0.84),
    person(LOOKS.maya, 136, 18, 0.9),
    person({ skin: "#E3B48C", shirt: "#4A5568", hair: "#6B4F3A", hairStyle: "wavy", prop: ["clipboard"] }, 222, 26, 0.84),
    // the coach, farther off and lighter: support that is ready but not in the middle
    `<g opacity="0.6">${person(LOOKS.dana, 290, 34, 0.8)}</g>`,
  ].join(""),
  "Maya works at a store shelf with a coworker and her supervisor beside her. Her job coach stands a step back.",
);

// Fading: three frames, the coach farther away in each.
export const fadeStrip = (() => {
  const frame = (fx, coachX, label) =>
    `<g transform="translate(${fx} 0)">` +
    `<rect x="0" y="0" width="290" height="170" rx="14" fill="${PALE_GRAY}"/>` +
    `<rect x="20" y="40" width="70" height="112" rx="4" fill="#FFFFFF"/><path d="M20 78 h70 M20 116 h70" stroke="${PALE_GRAY}" stroke-width="4"/>` +
    `<rect x="28" y="56" width="12" height="18" rx="2" fill="${YELLOW}"/><rect x="62" y="94" width="14" height="18" rx="2" fill="${CORAL}"/>` +
    person(LOOKS.luis, 54, 34, 0.78) +
    person(LOOKS.dana, coachX, 34, 0.78) +
    `<text x="145" y="196" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="${INK}">${label}</text>` +
    `</g>`;
  return svg(
    930, 206,
    frame(0, 96, "Beside") + frame(320, 150, "Nearby") + frame(640, 206, "Checking in") +
      `<path d="M296 85 h18 M616 85 h18" stroke="${GRAY}" stroke-width="3" stroke-linecap="round"/><path d="M308 79 l6 6 l-6 6 M628 79 l6 6 l-6 6" fill="none" stroke="${GRAY}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    "Three pictures of Luis working at a shelf. His coach stands beside him, then nearby, then across the room checking in.",
  );
})();

// Module 2 cover: Luis choosing among three supports; the one he picks is marked.
export const supportChoice = (() => {
  const card = (x, icon, picked) =>
    `<g transform="translate(${x} 30)">` +
    `<rect x="0" y="0" width="70" height="86" rx="10" fill="#FFFFFF" stroke="${picked ? CORAL : PALE_GRAY}" stroke-width="${picked ? 4 : 3}"/>` +
    icon +
    (picked ? `<circle cx="64" cy="4" r="12" fill="${CORAL}"/><path d="M58 4 l4 4 l8 -8" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : "") +
    `</g>`;
  const checklist = `<rect x="16" y="14" width="38" height="56" rx="3" fill="${PALE_YELLOW}"/>` +
    [24, 36, 48, 60].map((y) => `<rect x="21" y="${y - 4}" width="7" height="7" rx="1" fill="${YELLOW}"/><path d="M32 ${y} h17" stroke="${GRAY}" stroke-width="2.5" stroke-linecap="round"/>`).join("");
  const headphones = `<path d="M18 52 q0-30 17-30 q17 0 17 30" fill="none" stroke="${INK}" stroke-width="4"/><rect x="12" y="46" width="12" height="20" rx="4" fill="${YELLOW}"/><rect x="46" y="46" width="12" height="20" rx="4" fill="${YELLOW}"/>`;
  const timer = `<circle cx="35" cy="46" r="21" fill="${PALE_CORAL}" stroke="${INK}" stroke-width="3"/><path d="M35 46 V32 M35 46 l9 6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><rect x="30" y="17" width="10" height="6" rx="2" fill="${INK}"/>`;
  return svg(
    390, 196,
    `<rect x="0" y="176" width="390" height="4" rx="2" fill="${PALE_GRAY}"/>` +
      person(LOOKS.luis, 0, 10, 0.98) +
      `<path d="M104 70 q14 -10 26 -4" fill="none" stroke="${GRAY}" stroke-width="2.5" stroke-dasharray="2 6" stroke-linecap="round"/>` +
      card(138, checklist, true) + card(222, headphones, false) + card(306, timer, false),
    "Luis looks at three possible supports, a picture checklist, headphones, and a timer. He has picked the checklist.",
  );
})();

// Module 3 cover: a task analysis on a clipboard, each step marked + (does it) or - (not yet), with Luis.
export const taskSteps = (() => {
  const rows = [["+", true], ["+", true], ["-", false], ["+", true], ["-", false]];
  const lines = rows.map(([mark, done], i) => {
    const y = 58 + i * 24;
    return `<text x="150" y="${y + 5}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="${GRAY}">${i + 1}</text>` +
      `<rect x="166" y="${y - 3}" width="${[96, 78, 104, 70, 90][i]}" height="7" rx="3.5" fill="${PALE_GRAY}"/>` +
      `<circle cx="292" cy="${y}" r="9" fill="${done ? "#2F855A" : PALE_CORAL}"/>` +
      `<text x="292" y="${y + 5}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="900" fill="${done ? "#FFFFFF" : INK}">${mark === "+" ? "+" : "&#8722;"}</text>`;
  }).join("");
  return svg(
    330, 196,
    `<rect x="0" y="176" width="330" height="4" rx="2" fill="${PALE_GRAY}"/>` +
      person(LOOKS.luis, 0, 10, 0.98) +
      `<rect x="134" y="26" width="178" height="150" rx="10" fill="#B9844F"/><rect x="142" y="38" width="162" height="132" rx="4" fill="#FFFFFF"/><rect x="198" y="18" width="50" height="16" rx="4" fill="${INK}"/>` +
      lines,
    "Luis next to a clipboard showing a five-step task analysis. Three steps are marked as done on his own and two as not yet.",
  );
})();

// Module 4 cover: Maya beside a chain of five linked steps. Three are learned, one is being taught, one is next.
export const chainLinks = (() => {
  const fills = [YELLOW, YELLOW, YELLOW, CORAL, PALE_GRAY];
  const links = fills.map((fill, i) => {
    const x = 132 + i * 50;
    return (i ? `<path d="M${x - 12} 96 h12" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` : "") +
      `<rect x="${x}" y="72" width="38" height="48" rx="12" fill="${fill}" stroke="${INK}" stroke-width="3"/>` +
      `<text x="${x + 19}" y="102" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="900" fill="${INK}">${i + 1}</text>`;
  }).join("");
  return svg(
    390, 196,
    `<rect x="0" y="176" width="390" height="4" rx="2" fill="${PALE_GRAY}"/>` +
      person(LOOKS.maya, 0, 10, 0.98) +
      links +
      `<path d="M301 140 v-12 M295 134 l6 -7 l6 7" fill="none" stroke="${CORAL}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    "Maya next to a chain of five linked steps. Steps 1 to 3 are learned, step 4 is being taught now, and step 5 comes next.",
  );
})();

// Module 5 cover: the prompt hierarchy as a ladder, from natural cues at the top to physical at the bottom, with Ben.
export const promptLadder = (() => {
  const rungs = Array.from({ length: 8 }, (_, i) => {
    const y = 22 + i * 19;
    const w = 70 + i * 14;
    const fill = i === 0 ? YELLOW : i < 4 ? PALE_YELLOW : i < 7 ? PALE_CORAL : CORAL;
    return `<rect x="${140}" y="${y}" width="${w}" height="14" rx="7" fill="${fill}" stroke="${INK}" stroke-width="1.5"/>`;
  }).join("");
  return svg(
    390, 196,
    `<rect x="0" y="176" width="390" height="4" rx="2" fill="${PALE_GRAY}"/>` +
      person(LOOKS.ben, 0, 10, 0.98) +
      rungs +
      `<path d="M128 166 V30 M121 38 l7 -9 l7 9" fill="none" stroke="${GRAY}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<text x="216" y="33" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="${INK}">Natural cues</text>` +
      `<text x="140" y="190" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${GRAY}">Most help at the bottom</text>`,
    "Ben next to eight stacked bars, the prompt hierarchy. Natural cues are at the top, physical prompts at the bottom, and an arrow points up toward natural cues.",
  );
})();

// Callout icons, 48 x 48.
export const ICONS = {
  tip: svg(48, 48, `<circle cx="24" cy="24" r="23" fill="${PALE_YELLOW}"/><path d="M24 11 a9 9 0 0 1 5.4 16.2 c-1 .8-1.4 1.6-1.4 2.8 v1 h-8 v-1 c0-1.2-.4-2-1.4-2.8 A9 9 0 0 1 24 11z" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/><path d="M20 35 h8 M21 38.5 h6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`, "Coach's tip"),
  trap: svg(48, 48, `<circle cx="24" cy="24" r="23" fill="${PALE_CORAL}"/><path d="M24 11 L37 34 H11z" fill="${CORAL}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M24 19 v7" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="30" r="1.6" fill="${INK}"/>`, "Common trap"),
  say: svg(48, 48, `<circle cx="24" cy="24" r="23" fill="${PALE_GRAY}"/><path d="M12 15 h24 a3 3 0 0 1 3 3 v11 a3 3 0 0 1-3 3 h-12 l-6 5 v-5 h-6 a3 3 0 0 1-3-3 v-11 a3 3 0 0 1 3-3z" fill="#FFFFFF" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M17 21 h14 M17 26 h9" stroke="${GRAY}" stroke-width="2" stroke-linecap="round"/>`, "Try saying this"),
};

export const dataUri = (svgText) => `data:image/svg+xml;base64,${Buffer.from(svgText).toString("base64")}`;
