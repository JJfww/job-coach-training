# Job Coach Training: Independence in Practice

A self-paced training course for school job coaches who support students with disabilities at community work sites. Coaches learn to teach real job tasks, use the least help that works, fade that help, and build toward each student doing the job to the Workplace Standard as independently as possible.

Created by Jennifer Burnes. **Work in progress:** Modules 1 to 5 are complete. Modules 6 to 8 and the capstone are being built.

**Try the demo:** https://jjfww.github.io/job-coach-training/

The demo runs the real app with pretend data that stays in your browser. Use the dark bar at the top to switch between a supervisor and two coaches, and **Reset preview data** to start over.

## Why it exists

Job coaches are often hired with little training and then work alone at a job site. The most common mistake is helping too much: doing the task, answering for the student, or staying close long after it's needed. This course teaches the opposite habit. The student does the work, and the coach's job is to become less and less necessary.

## What's in the course

| Module | Topic |
|---|---|
| 1 | Role, boundaries, and shared responsibility |
| 2 | Student-centered supports and accommodations |
| 3 | Task analysis, task hierarchy, and the Workplace Standard |
| 4 | Systematic instruction and chaining |
| 5 | The prompt hierarchy, wait time, and fading |
| 6 | Workplace communication, AAC, and natural supports (in progress) |
| 7 | Observation, data, and positive problem-solving (in progress) |
| 8 | Safety, workplace judgment, partnership, and dignity of risk (in progress) |
| Capstone | Plan, coach, observe, and revise (in progress) |

## How it teaches

- **Plain language and short screens.** One idea per screen, with terms defined where they're first used.
- **A recurring cast.** Two students, Maya and Luis, and two coaches, Dana and Ben. "Same skill, two students" screens show how one strategy looks different for two learners.
- **Worked examples with a pause.** Coaches pick what they would do before seeing what the experienced coach did and why.
- **Practice with feedback.** Every answer explains why it's right or wrong. Written responses are followed by a model answer to compare.
- **Checkpoints and stopping points.** Each module ends with a short checkpoint, a "What questions do you still have?" prompt, and a job-site action to try at work.
- **Supervisor view.** Supervisors see each coach's progress, answers, and questions, and record observations from the job site.

## How it's built

- **Google Apps Script web app** with district Google sign-in. Records go to a Google Sheet that coaches never see.
- **Records are permanent.** The app only adds rows, never edits or deletes them. Every row stores the course version so old answers match the wording the coach saw.
- **No frameworks or packages.** Plain JavaScript, HTML, and CSS. A small build script turns `src/` into the files pasted into Apps Script, plus the local demo.
- **One source for content.** Course text and questions live in one file that both the page and the server use, so the server checks answers against exactly what the learner saw.
- **Accessible by design.** Atkinson Hyperlegible font, keyboard navigation, focus management, and original illustrations in place of stock images.
- **Tests** cover saving, permissions, progress rules, and content checks (for example, every question has an explanation and every module has its required parts).

Setup and update steps are in [`course-app/README.md`](course-app/README.md).

```bash
cd course-app
npm test        # run the tests (Node 20 or newer, nothing to install)
npm run build   # build dist/ (Apps Script files and preview.html)
```

Every push to `main` runs the tests and republishes the demo.

## Privacy

The demo uses fictional people and pretend data. The course teaches coaches to use initials or fictional examples only and to leave out student names, disability information, and private workplace details.
