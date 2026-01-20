#!/usr/bin/env node

/**
 * Lab Autograder (light checks)
 * - 80 marks for steps (tag presence + VERY light patterns; NOT strict)
 * - 20 marks for submission timing (deadline-based)
 *   - On/before deadline => 20/20
 *   - After deadline     => 10/20
 *
 * IMPORTANT: Ignore HTML comments. (So examples in comments do NOT count.)
 * IGNORE optional TODOs.
 * Do NOT check classes, ids, or inner text.
 *
 * Outputs:
 *  - GitHub Actions Summary (includes detailed per-step checks)
 *  - artifacts/grade.csv
 *  - artifacts/feedback/README.md
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ARTIFACTS_DIR = "artifacts";
const FEEDBACK_DIR = path.join(ARTIFACTS_DIR, "feedback");
fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

/* -----------------------------
   Deadline (Asia/Riyadh)
   19 Jan 2026, 11:59 PM
-------------------------------- */
const DEADLINE_RIYADH_ISO = "2026-01-21T23:59:00+03:00";
const DEADLINE_MS = Date.parse(DEADLINE_RIYADH_ISO);

// Submission marks policy
const SUBMISSION_MAX = 20;
const SUBMISSION_LATE = 10;

/* -----------------------------
   Step marks (out of 80)
--------------------------------
   Step 2: Container        15
   Step 3: Header wrapper   15
   Step 4: Nav links        20
   Step 5: Posts wrapper    10
   Step 6: Form             20
-------------------------------- */
const tasks = [
  { id: "step2", name: "Step 2: Main Page Container", marks: 15 },
  { id: "step3", name: "Step 3: Wrap the Header", marks: 15 },
  { id: "step4", name: "Step 4: Navigation Links", marks: 20 },
  { id: "step5", name: "Step 5: Wrap Each Post", marks: 10 },
  { id: "step6", name: "Step 6: Complete the Form", marks: 20 },
];

const STEPS_MAX = tasks.reduce((sum, t) => sum + t.marks, 0); // 80
const TOTAL_MAX = STEPS_MAX + SUBMISSION_MAX; // 100

/* -----------------------------
   Helpers
-------------------------------- */
function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function findHtmlFile() {
  const preferred = path.join(process.cwd(), "index.html");
  if (fs.existsSync(preferred)) return preferred;

  const ignoreDirs = new Set(["node_modules", ".git", ARTIFACTS_DIR]);
  const stack = [process.cwd()];

  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const e of entries) {
      const full = path.join(dir, e.name);

      if (e.isDirectory()) {
        if (!ignoreDirs.has(e.name)) stack.push(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith(".html")) {
        return full;
      }
    }
  }
  return null;
}

// ✅ Critical fix: remove HTML comments so tags inside comments don't count
function stripHtmlComments(html) {
  // Removes <!-- ... --> including multiline comments
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

function hasTag(html, tagName) {
  const re = new RegExp(`<\\s*${tagName}\\b`, "i");
  return re.test(html);
}

function countTag(html, tagName) {
  const re = new RegExp(`<\\s*${tagName}\\b`, "gi");
  const matches = html.match(re);
  return matches ? matches.length : 0;
}

function attrExistsOnTag(html, tagName, attrName) {
  const re = new RegExp(`<\\s*${tagName}\\b[^>]*\\b${attrName}\\s*=\\s*["'][^"']*["']`, "i");
  return re.test(html);
}

function hasAttrValueOnTag(html, tagName, attrName, attrValue) {
  const escaped = String(attrValue).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `<\\s*${tagName}\\b[^>]*\\b${attrName}\\s*=\\s*["']${escaped}["']`,
    "i"
  );
  return re.test(html);
}

function anyRequiredAttribute(html) {
  return /\brequired\b/i.test(html);
}

function hasInternalLink(html) {
  return /<a\b[^>]*\bhref\s*=\s*["']#[^"']+["']/i.test(html);
}

function hasExternalLink(html) {
  return /<a\b[^>]*\bhref\s*=\s*["']https?:\/\/[^"']+["']/i.test(html);
}

function hasTargetBlankOnAnchor(html) {
  return /<a\b[^>]*\btarget\s*=\s*["']_blank["']/i.test(html);
}

function hasSubmitButton(html) {
  return (
    /<button\b[^>]*\btype\s*=\s*["']submit["']/i.test(html) ||
    /<input\b[^>]*\btype\s*=\s*["']submit["']/i.test(html)
  );
}

function hasForIdMatch(html) {
  const labelFor = [...html.matchAll(/<label\b[^>]*\bfor\s*=\s*["']([^"']+)["'][^>]*>/gi)].map(
    m => m[1]
  );
  if (labelFor.length === 0) return false;

  const ids = new Set(
    [...html.matchAll(/<(input|textarea)\b[^>]*\bid\s*=\s*["']([^"']+)["'][^>]*>/gi)].map(
      m => m[2]
    )
  );

  return labelFor.some(f => ids.has(f));
}

// Light header wrapper signal: <header> OR <div> that contains an <h1>
function headerWrappedLight(html) {
  if (hasTag(html, "header")) return true;
  return /<div\b[^>]*>[\s\S]*?<h1\b/i.test(html);
}

function splitMarks(stepMarks, missingCount, totalChecks) {
  if (missingCount <= 0) return stepMarks;
  const perItem = stepMarks / totalChecks;
  const deducted = perItem * missingCount;
  return Math.max(0, Math.round((stepMarks - deducted) * 100) / 100);
}

function mdEscape(s) {
  return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* -----------------------------
   Determine submission time
-------------------------------- */
let lastCommitISO = null;
let lastCommitMS = null;

try {
  lastCommitISO = execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim();
  lastCommitMS = Date.parse(lastCommitISO);
} catch {
  lastCommitISO = new Date().toISOString();
  lastCommitMS = Date.now();
}

/* -----------------------------
   Submission marks
-------------------------------- */
const isLate = Number.isFinite(lastCommitMS) ? lastCommitMS > DEADLINE_MS : true;
const submissionScore = isLate ? SUBMISSION_LATE : SUBMISSION_MAX;

/* -----------------------------
   Load student HTML
-------------------------------- */
const htmlFile = findHtmlFile();
const htmlRaw = htmlFile ? safeRead(htmlFile) : null;

// ✅ Use cleaned HTML for all checks
const html = htmlRaw ? stripHtmlComments(htmlRaw) : null;

const results = []; // { id, name, max, score, checklist[], deductions[] }

function failAllSteps(reason) {
  for (const t of tasks) {
    results.push({
      id: t.id,
      name: t.name,
      max: t.marks,
      score: 0,
      checklist: [],
      deductions: [reason],
    });
  }
}

if (!html) {
  failAllSteps(
    htmlFile
      ? `Could not read HTML file at: ${htmlFile}`
      : "No .html file found (expected index.html or any .html file)."
  );
} else {
  /* Step 2 */
  {
    const required = [{ label: "At least one <div> (main container)", ok: hasTag(html, "div") }];
    const missing = required.filter(r => !r.ok);
    const score = splitMarks(tasks[0].marks, missing.length, required.length);

    results.push({
      id: "step2",
      name: tasks[0].name,
      max: tasks[0].marks,
      score,
      checklist: required.map(r => `${r.ok ? "✅" : "❌"} ${r.label}`),
      deductions: missing.length ? missing.map(m => `Missing: ${m.label}`) : [],
    });
  }

  /* Step 3 */
  {
    const required = [
      { label: "Header is wrapped (has <header> OR a <div> that contains <h1>)", ok: headerWrappedLight(html) },
      { label: "At least one <h1>", ok: hasTag(html, "h1") },
      { label: "At least one <p>", ok: hasTag(html, "p") },
    ];

    const missing = required.filter(r => !r.ok);
    const score = splitMarks(tasks[1].marks, missing.length, required.length);

    results.push({
      id: "step3",
      name: tasks[1].name,
      max: tasks[1].marks,
      score,
      checklist: required.map(r => `${r.ok ? "✅" : "❌"} ${r.label}`),
      deductions: missing.length ? missing.map(m => `Missing: ${m.label}`) : [],
    });
  }

  /* Step 4 */
  {
    const required = [
      { label: "At least one <a> link", ok: hasTag(html, "a") },
      { label: "At least one internal link (href=\"#...\")", ok: hasInternalLink(html) },
      { label: "At least one external link (href=\"https://...\")", ok: hasExternalLink(html) },
      { label: "At least one link uses target=\"_blank\"", ok: hasTargetBlankOnAnchor(html) },
    ];

    const missing = required.filter(r => !r.ok);
    const score = splitMarks(tasks[2].marks, missing.length, required.length);

    results.push({
      id: "step4",
      name: tasks[2].name,
      max: tasks[2].marks,
      score,
      checklist: required.map(r => `${r.ok ? "✅" : "❌"} ${r.label}`),
      deductions: missing.length ? missing.map(m => `Missing: ${m.label}`) : [],
    });
  }

  /* Step 5 */
  {
    const divCount = countTag(html, "div");
    const required = [
      { label: "At least two <div> tags (main container + at least one post container)", ok: divCount >= 2 },
      { label: "At least one <h4> (post author)", ok: hasTag(html, "h4") },
      { label: "At least one <p> (post text)", ok: hasTag(html, "p") },
    ];

    const missing = required.filter(r => !r.ok);
    const score = splitMarks(tasks[3].marks, missing.length, required.length);

    results.push({
      id: "step5",
      name: tasks[3].name,
      max: tasks[3].marks,
      score,
      checklist: required.map(r => `${r.ok ? "✅" : "❌"} ${r.label}`),
      deductions: missing.length ? missing.map(m => `Missing: ${m.label}`) : [],
    });
  }

  /* Step 6 */
  {
    const required = [
      { label: "A <form> tag", ok: hasTag(html, "form") },
      { label: "Form uses action=\"#\"", ok: hasAttrValueOnTag(html, "form", "action", "#") },
      { label: "Form uses method=\"post\"", ok: hasAttrValueOnTag(html, "form", "method", "post") },
      { label: "At least one <label>", ok: hasTag(html, "label") },
      { label: "At least one <input>", ok: hasTag(html, "input") },
      { label: "At least one <textarea>", ok: hasTag(html, "textarea") },
      {
        label: "A name attribute on an input/textarea",
        ok: attrExistsOnTag(html, "input", "name") || attrExistsOnTag(html, "textarea", "name"),
      },
      {
        label: "A placeholder attribute on an input/textarea",
        ok: attrExistsOnTag(html, "input", "placeholder") || attrExistsOnTag(html, "textarea", "placeholder"),
      },
      { label: "Required fields used (required attribute exists)", ok: anyRequiredAttribute(html) },
      { label: "At least one label[for] matches an input/textarea id", ok: hasForIdMatch(html) },
      { label: "Submit button exists (type=\"submit\")", ok: hasSubmitButton(html) },
    ];

    const missing = required.filter(r => !r.ok);
    const score = splitMarks(tasks[4].marks, missing.length, required.length);

    results.push({
      id: "step6",
      name: tasks[4].name,
      max: tasks[4].marks,
      score,
      checklist: required.map(r => `${r.ok ? "✅" : "❌"} ${r.label}`),
      deductions: missing.length ? missing.map(m => `Missing: ${m.label}`) : [],
    });
  }
}

/* -----------------------------
   Final scoring
-------------------------------- */
const stepsScore = results.reduce((sum, r) => sum + r.score, 0);
const totalScore = Math.round((stepsScore + submissionScore) * 100) / 100;

/* -----------------------------
   Build summary + feedback
-------------------------------- */
const submissionLine = `- **Deadline (Riyadh / UTC+03:00):** ${DEADLINE_RIYADH_ISO}
- **Last commit time (from git log):** ${lastCommitISO}
- **Submission marks:** **${submissionScore}/${SUBMISSION_MAX}** ${isLate ? "(Late submission)" : "(On time)"}
`;

let summary = `# demo_2.2_social_app – Autograding Summary

## Submission

${submissionLine}

## Marks Breakdown

| Component | Marks |
|---|---:|
`;

for (const r of results) summary += `| ${r.name} | ${r.score}/${r.max} |\n`;
summary += `| Submission (timing) | ${submissionScore}/${SUBMISSION_MAX} |\n`;

summary += `
## Total Marks

**${totalScore} / ${TOTAL_MAX}**

## Detailed Checks (What you did / missed)

`;

for (const r of results) {
  const done = (r.checklist || []).filter(x => x.startsWith("✅"));
  const missed = (r.checklist || []).filter(x => x.startsWith("❌"));

  summary += `
<details>
  <summary><strong>${mdEscape(r.name)}</strong> — ${r.score}/${r.max}</summary>

  <br/>

  <strong>✅ Found</strong>
  ${done.length ? "\n" + done.map(x => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing detected)"}

  <br/><br/>

  <strong>❌ Missing</strong>
  ${missed.length ? "\n" + missed.map(x => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing missing)"}

  <br/><br/>

  <strong>❗ Deductions / Notes</strong>
  ${
    r.deductions && r.deductions.length
      ? "\n" + r.deductions.map(d => `- ${mdEscape(d)}`).join("\n")
      : "\n- No deductions."
  }

</details>
`;
}

summary += `
> Full feedback is also available in: \`artifacts/feedback/README.md\`
`;

let feedback = `# Lab 1 – Feedback

## Submission

${submissionLine}

## File Checked

- ${htmlFile ? `✅ ${htmlFile}` : "❌ No HTML file found"}

---

## Step-by-step Feedback
`;

for (const r of results) {
  feedback += `
### ${r.name} — **${r.score}/${r.max}**

**Checklist**
${r.checklist.length ? r.checklist.map(x => `- ${x}`).join("\n") : "- (No checks available)"}

**Deductions / Notes**
${
  r.deductions.length
    ? r.deductions.map(d => `- ❗ ${d}`).join("\n")
    : "- ✅ No deductions. Good job!"
}
`;
}

feedback += `
---

## How marks were deducted (if any)

- This autograder ignores HTML comments (examples inside comments do NOT count).
- Checks only top-level tags and a few basic attributes (action/method/target/required).
- It does not check classes, ids, or inner text.
- Optional TODOs are ignored.
- Missing required items reduce marks proportionally within a step.
`;

/* -----------------------------
   Write outputs
-------------------------------- */
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);

const csv = `student,score,max_score
all_students,${totalScore},${TOTAL_MAX}
`;
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.writeFileSync(path.join(ARTIFACTS_DIR, "grade.csv"), csv);
fs.writeFileSync(path.join(FEEDBACK_DIR, "README.md"), feedback);

console.log(
  `✔ Lab graded: ${totalScore}/${TOTAL_MAX} (Submission: ${submissionScore}/${SUBMISSION_MAX}, Steps: ${stepsScore}/${STEPS_MAX}).`
);
