# Job Coach Training web app (prototype)

The self-paced job coach course as a Google Apps Script web app. Coaches sign in with their usd497.org account. Their answers, progress, and job-site actions are saved to a Google Sheet that only you can open. Supervisors see progress and record observations inside the app.

**Prototype status:** Modules 1 to 5 are complete. Modules 6 to 8 and the capstone show as "Coming soon" until they are built.

```
Coach or supervisor ──(usd497.org sign-in)──> Web app (runs as you) ──> Google Sheet "Job Coach Training records"
```

## Try it on your computer first

Open `dist/preview.html` in Chrome or Safari. It runs the real app with pretend data that stays in that browser. Use the dark bar at the top to switch between:

- **Jennifer Burnes (owner, supervisor):** the course plus the **Supervisor** page
- **Alex Rivera (new coach):** a coach starting fresh
- **Sam Lee (finished Module 1):** a coach with answers, so the supervisor page has something to show

**Reset preview data** starts over.

## One-time setup (about 10 minutes)

Do this signed in to your **usd497.org** Google account.

1. Go to [script.google.com](https://script.google.com) → **New project**. Name it `Job Coach Training`.
2. **Project Settings** (gear) → check **Show "appsscript.json" manifest file in editor**.
3. In the editor, replace the contents of:
   - `Code.gs` with [`dist/Code.gs`](dist/Code.gs)
   - `appsscript.json` with [`dist/appsscript.json`](dist/appsscript.json)
   - Add an HTML file named **`Index`** (File **+** → HTML → `Index`) and replace its contents with [`dist/Index.html`](dist/Index.html).
4. Pick **`setup`** in the function menu and click **Run**. Approve the permissions (Sheets and your email address).
   It creates the records sheet and adds you as a supervisor. Open **Execution log** to see the sheet link.
5. **Deploy → New deployment → Web app**:

   | Execute as | Who has access |
   |---|---|
   | Me | **Anyone within usd497.org** |

6. Copy the web app URL and share it with your coaches.

## The records sheet

| Tab | One row for each |
|---|---|
| Coaches | person who has opened the course (first and last visit) |
| Supervisors | person who can open the Supervisor page. **Type an email here to add a supervisor.** |
| Progress | screen a coach opened, and each module they finished |
| Responses | answer. Multiple-choice keeps the first try. Written answers add a row each time they are revised. |
| Actions | job-site action entry |
| Observations | supervisor observation, rated on the competency rubric |

**Records are kept permanently.** The app only adds rows. It never deletes or overwrites an answer, and nothing cleans up old rows. Every row also records the course version, so old answers can be matched to the wording the coach saw. Please don't delete rows by hand either; the progress shown in the app comes from them.

Coaches never get access to the sheet. The app runs as you and shows each coach only their own records. You can share the sheet with someone (for example, HR) the normal Google way if that changes.

## Privacy

The course reminds coaches to use initials or fictional examples only and to leave out student names, disability information, and private workplace details. The sheet stays in the district's Google Workspace.

## Updating the app later

1. Edit the files in `src/` (course text is in `src/content/course.js`).
2. Run `npm test` and `npm run build`.
3. Paste the new `dist/Code.gs` and `dist/Index.html` into the editor.
4. **Deploy → Manage deployments** → edit the deployment (pencil) → Version: **New version** → **Deploy**. The URL stays the same.

Never change a question's `id` after coaches have answered it; records point to it. To reword a question, keep the id.

## Files

- `src/content/course.js`: course text, questions, and the supervisor rubric
- `src/shared/progress.js`: progress rules used by both the page and the server
- `src/server/Code.js`: the Apps Script server (sign-in check, saving, supervisor pages)
- `src/client/`: the web page (`app.js`, `styles.css`, `index.html`)
- `src/dev/`: the local preview and the stand-in for Google services used by the tests
- `tools/build.mjs`: builds `dist/`
- `test/`: `npm test` (no packages to install; needs Node 20 or newer)
