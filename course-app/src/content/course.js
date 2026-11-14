/**
 * Course content. Shared by the web page and the Apps Script server, so the server can
 * check every answer against the same questions the learner saw.
 *
 * Modules 1 to 5 are built; Modules 1 to 3 are converted from the archived Claude edition deck (tools/build_job_coach_claude_edition.mjs, output in archive/bento/).
 * Modules with no screens show as "Coming soon".
 *
 * Screen blocks: p, list, table, cards, callout, scenario, plus:
 *   outcomes  the module's outcomes list (module.outcomes)
 *   coach     a coaching-voice callout: kind 'tip' (Coach's tip), 'trap' (Common trap), or 'say' (Try saying this)
 *   figure    an illustration from ART (built from resources/illustrations/art.mjs)
 *   twoStudents  "Same skill, two students": how one skill looks for Maya and for Luis (one per module)
 *   predict   an unscored "What would you do?" pick with a short response to each option;
 *             the blocks after it appear once the learner picks
 * Screen activities:
 *   choice      one or more multiple-choice questions with an explanation after each answer
 *   checkpoint  the same as choice, shown as the module checkpoint (completion only)
 *   write       a written response, then a model answer to compare
 *   action      a job-site action the coach records after a site visit (not required to finish)
 *   questions   "What questions do you still have?": a question or "no questions" (required); supervisors see them
 * Every question id must stay the same once coaches have answered it; records point to it.
 *
 * The recurring cast (see Course-Cast-and-Voice-for-Review.md): students Maya (grocery) and Luis
 * (light custodial), coaches Dana (experienced) and Ben (new), Carla (Maya's lead), Mr. Okafor
 * (Luis's building lead), and Rosa (Maya's coworker after she rotates to a food service café).
 */

const CAST = [
  { id: 'maya', name: 'Maya', role: 'Student, 19 · Grocery store', about: 'Stocks shelves and helps customers, then rotates to a café. Uses a checklist app on her phone. Working on asking her lead for help directly.' },
  { id: 'luis', name: 'Luis', role: 'Student, 20 · Light custodial', about: 'Resets rooms and restocks supplies. Uses a speech app, a picture sequence, and headphones. Working on starting tasks on his own.' },
  { id: 'dana', name: 'Dana', role: 'Experienced job coach', about: 'Has coached for years. Dana’s advice appears in the Coach’s tips throughout the course.' },
  { id: 'ben', name: 'Ben', role: 'New job coach', about: 'In his first semester. Ben makes the mistakes new coaches make, so you can think them through with him.' },
];

const COURSE = {
  title: 'Job Coach Training',
  subtitle: 'Independence in Practice',
  // Saved with every record so old answers can be matched to the wording they answered.
  version: '2026-11-12.1',
  // The course overview on the home page. Mirrors the "Course goals" screen in the deck.
  goals: [
    'Protect the student’s role as the worker and decision maker',
    'Teach students to work to the Workplace Standard: completion, quality, pace, independence, and the soft skills every employer expects',
    'Choose and test workplace supports and accommodations with the student, not for the student',
    'Build and use a task analysis, and choose a chaining strategy',
    'Use the prompt hierarchy, wait time, error correction, and fading so natural cues take over',
    'Support direct communication with supervisors and coworkers',
    'Record useful observations and use them to make decisions',
    'Respond to risk with sound judgment while respecting dignity of risk',
  ],
  bigGoal: 'A student doing a real job to the Workplace Standard, as independently as possible, with you needed less and less.',
  modules: [
    {
      id: 'm1',
      label: 'Module 1',
      title: 'Role, boundaries, and shared responsibility',
      time: '20 to 25 minutes',
      question: 'Who should act first: the student, the workplace, or me?',
      art: 'roleCircle',
      learn: 'Protect the student’s role as the worker and decide who should act first',
      // Shown on the goals screen and again on the module-complete screen.
      outcomes: [
        'Explain why job coaching exists and what success looks like.',
        'Describe the Workplace Standard every student works toward.',
        'Distinguish the responsibilities of the student, job coach, workplace supervisor, coworkers, and work experience coordinator.',
        'Decide when to teach, when to wait, when to consult, and when to step back.',
        'Protect student voice, privacy, and direct relationships at work.',
      ],
      screens: [
        {
          id: 'm1-goals',
          kind: 'Learn',
          title: 'What you will be able to do',
          lead: 'Protect the student’s role as the worker while giving enough support for learning and access. By the end of this module you will be able to:',
          blocks: [
            { type: 'outcomes' },
            { type: 'callout', tone: 'coral', html: '<strong>Why it matters:</strong> if every question goes through the coach, the student’s job depends on the coach.' },
          ],
        },
        {
          id: 'm1-purpose',
          kind: 'Learn',
          title: 'Why job coaching exists',
          lead: 'Every decision in this course comes back to this purpose.',
          blocks: [
            { type: 'p', html: 'Job coaching exists so a student can do a real job, with real coworkers, to the Workplace Standard, as independently as possible. You teach the job, help the workplace see the student as an employee, and build supports the student can use without you.' },
            { type: 'figure', art: 'fadeStrip' },
            { type: 'callout', tone: 'dark', html: 'Success means you are needed less and less.' },
          ],
        },
        {
          id: 'm1-standard',
          kind: 'Learn',
          title: 'The Workplace Standard',
          lead: 'This is the target for every student and every task in this course.',
          blocks: [
            { type: 'callout', tone: 'dark', html: 'The Workplace Standard is what the employer expects of any worker in the job. Students learn to work to it, with supports when they need them.' },
            { type: 'cards', items: [
              { title: 'Doing the task', tone: 'yellow', items: ['<strong>Completion:</strong> every step is done', '<strong>Quality:</strong> done right and safely, the way the workplace requires', '<strong>Pace:</strong> done in the time the workplace expects', '<strong>Independence:</strong> gathers materials, starts, and checks the work without help'] },
              { title: 'Being a good worker', tone: 'gray', items: ['Attendance and punctuality', 'Attitude, effort, and behavior', 'Appearance, hygiene, and uniform', 'Accepting constructive feedback', 'Self-advocacy and asking for help', 'Social communication with coworkers and customers'] },
            ] },
            { type: 'coach', kind: 'tip', html: 'You evaluate students against the Workplace Standard using the program’s work evaluation form. Ask your work experience coordinator to walk you through it.' },
          ],
        },
        {
          id: 'm1-student-works',
          kind: 'Learn',
          title: 'The student does the work',
          lead: 'This is the rule. There are only two exceptions, and both are ways of teaching: modeling and parallel working.',
          blocks: [
            { type: 'callout', tone: 'dark', html: 'The student does the work. The coach does not do it for them.' },
            { type: 'cards', items: [
              { title: 'Exception 1: Modeling, showing how', tone: 'yellow', items: ['You do one step while the student watches. Then you hand it right back, and the student does the next one.<br><br><strong>Example:</strong> Ben wipes one table while Luis watches. Luis wipes the rest.'] },
              { title: 'Exception 2: Parallel working', tone: 'gray', items: ['You do the same task next to the student so they can follow along. Use it only for students it helps, on purpose, with a plan to fade it.<br><br><strong>Example:</strong> Dana faces one shelf beside Maya, then moves farther away each week.'] },
            ] },
            { type: 'coach', kind: 'trap', html: 'Luis is behind before lunch, so Ben starts wiping tables to catch up. That is not modeling. Luis loses the practice, and the supervisor sees Ben doing Luis’s job.' },
          ],
        },
        {
          id: 'm1-role-map',
          kind: 'Learn',
          title: 'Role map: one main responsibility for each person',
          lead: 'Use this map whenever you are unsure who should act.',
          blocks: [
            { type: 'table', head: ['Person', 'Main responsibility', 'How the coach supports it'], rows: [
              ['<strong>Student</strong>', 'The worker and primary decision maker. Does the work and communicates with the workplace.', 'Teaches skills, supports access, and steps back as skills grow'],
              ['<strong>Supervisor</strong>', 'Sets expectations, assigns work, and sets the Workplace Standard. May give informal feedback.', 'Clarifies the standard and routes work questions to the student'],
              ['<strong>Coworkers</strong>', 'Provide ordinary workplace cues, help, and social connection', 'Encourages natural support that would exist for any employee'],
              ['<strong>Job coach</strong>', 'Teaches from the task analysis (and may build it), gives performance feedback, evaluates progress toward the Workplace Standard, and fades support', 'Plans for the day the coach is no longer needed'],
              ['<strong>Work experience coordinator</strong>', 'Plans placements and the task analysis, coordinates schedules and transportation, and decides on independence with the team', 'Checks in often and asks for help at any time'],
            ] },
            { type: 'coach', kind: 'tip', html: 'Performance feedback and evaluation are your job, so the work site is not burdened. A supervisor may still give quick, informal feedback, and that is a good sign.' },
          ],
        },
        {
          id: 'm1-three-actions',
          kind: 'Learn',
          title: 'Three kinds of coach action',
          lead: 'The same action can help or over-support depending on what the student can already do.',
          blocks: [
            { type: 'cards', items: [
              { title: 'Helpful support', tone: 'yellow', items: ['Teach the one missing step', 'Model a step, then hand it back', 'Point to the checklist after waiting', 'Rehearse a question before the student asks the supervisor'] },
              { title: 'Over-support', tone: 'gray', items: ['Do the task for the student', 'Finish work because it is faster', 'Answer for the student', 'Stay beside the student all shift after skills are established'] },
              { title: 'Consult first', tone: 'coral', items: ['Schedule or transportation changes', 'Unclear safety procedures', 'Requests for private information'] },
            ] },
          ],
        },
        {
          id: 'm1-decision',
          kind: 'Learn',
          title: 'Teach, wait, consult, or step back',
          lead: 'Ask what the situation needs, then choose the smallest role that works.',
          blocks: [
            { type: 'table', head: ['Choose', 'When', 'Example'], rows: [
              ['<strong>Teach</strong>', 'The student does not yet have the skill or the step is new', 'Model the new label-printing step, then hand it back to Maya'],
              ['<strong>Wait</strong>', 'The student has the skill and a natural cue is present', 'Pause while Luis checks his picture sequence after break'],
              ['<strong>Consult</strong>', 'The decision belongs to someone else or follows a policy', 'Ask the work experience coordinator about a new shift that affects Maya’s bus'],
              ['<strong>Step back</strong>', 'Performance is steady and the workplace can support it', 'Move farther away and check in at set times'],
            ] },
            { type: 'coach', kind: 'tip', html: 'Ask once, in a few words. Then wait quietly. Some students need time to process, and repeating or rephrasing too soon makes them start over.' },
          ],
        },
        {
          id: 'm1-worked-example',
          kind: 'See it',
          title: 'Worked example: a change in hours',
          lead: 'See how a coach keeps the conversation with the employee.',
          blocks: [
            { type: 'scenario', html: 'Carla, Maya’s department lead, turns to Ben and asks, “Can Maya work Thursday from 1 to 4 this week instead of Tuesday morning?” Maya is restocking a few steps away.' },
            { type: 'predict', prompt: 'What would you do first?',
              options: ['Answer Carla, since you know Maya’s schedule', 'Turn to Maya so she can answer', 'Tell Carla you will check with the work experience coordinator'],
              responses: [
                'It’s quick, but it takes the conversation away from Maya and teaches Carla to ask Ben next time. See what Ben did instead.',
                'That’s what Ben did. The question is Maya’s to answer, so it stays with her.',
                'Checking with the coordinator is a good step, but it comes after Maya answers Carla herself. See how Ben handled it.',
              ] },
            { type: 'list', ordered: true, items: [
              '<strong>Redirect:</strong> Ben looks to Maya and says, “Maya, Carla has a question for you.”',
              '<strong>Wait:</strong> Ben stays quiet while Maya checks her calendar app.',
              '<strong>Support only as needed:</strong> If Maya asks, Ben helps her find Thursday on the calendar.',
              '<strong>Consult afterward:</strong> New hours can affect Maya’s bus and class time. Maya tells Carla she will confirm by tomorrow, then checks with the work experience coordinator.',
            ] },
            { type: 'coach', kind: 'say', html: '“Maya, Carla has a question for you.” Then let Maya answer.' },
          ],
        },
        {
          id: 'm1-compare',
          kind: 'Try it',
          title: 'Compare the coaching responses',
          lead: 'Same situation. Choose the response that builds Maya’s capability.',
          activity: { type: 'choice', items: [
            {
              id: 'm1-compare-hours',
              prompt: 'Carla asks Ben, “Can Maya work Thursday from 1 to 4 instead of Tuesday morning?” Which response is stronger?',
              options: [
                'Ben answers, “Sure, Thursday works,” because it is faster and he knows Maya’s schedule.',
                'Ben steps back and says, “Maya, Carla has a question for you.” Maya answers Carla herself.',
              ],
              answer: 1,
              explain: 'The question stays with the employee and protects Maya’s voice. Ben’s quick yes also skipped the bus and class check, which belongs to Maya and the work experience coordinator.',
            },
          ] },
        },
        {
          id: 'm1-two-students',
          kind: 'See it',
          title: 'Same skill, two students: redirecting to the student',
          lead: 'Redirecting a question to the student looks different depending on how the student communicates.',
          blocks: [
            { type: 'twoStudents',
              maya: 'Carla asks Ben whether Maya wants to restock aisle 5 or aisle 6 first. Ben says, “Maya, Carla has a question for you,” and steps back. Maya answers in her own words. After a few weeks, Ben just looks at Maya instead of saying anything.',
              luis: 'Mr. Okafor asks Ben whether Luis wants to start with the conference room or the break room. Ben says, “Luis, Mr. Okafor is asking you,” then waits while Luis answers on his speech app. Ben helped Luis save quick phrases like “Yes,” “No,” and “Let me think.”',
              same: 'The question stays with the student. What changes is how much setup and wait time the student needs.' },
          ],
        },
        {
          id: 'm1-privacy',
          kind: 'Learn',
          title: 'Protecting privacy and student voice',
          lead: 'Information about a student belongs to the student and the program, not to the job site conversation.',
          blocks: [
            { type: 'cards', items: [
              { title: 'Do', tone: 'gray', items: ['Speak to the student, not about the student', 'Ask the student before sharing anything personal', 'Share only what the student agrees to and policy allows', 'Redirect work questions to the student or supervisor'] },
              { title: 'Avoid', tone: 'coral', items: ['Discussing support needs in front of coworkers', 'Explaining a student’s disability to the workplace', 'Answering questions meant for the student', 'Sending student information by personal phone or text'] },
            ] },
            { type: 'callout', tone: 'gray', html: 'Disclosure and information sharing follow program policy and student or family consent.' },
          ],
        },
        {
          id: 'm1-who-acts',
          kind: 'Try it',
          title: 'Practice: who should act first?',
          lead: 'For each situation, choose who should act first. Read the explanation after each answer.',
          activity: { type: 'choice', items: [
            {
              id: 'm1-who-q1',
              prompt: 'A customer asks Maya where the pasta is.',
              options: ['Student', 'Supervisor', 'Job coach', 'Work experience coordinator'],
              answer: 0,
              explain: 'Maya answers the customer. Ben supports only if Maya asks or seems stuck after waiting.',
            },
            {
              id: 'm1-who-q2',
              prompt: 'A schedule change will affect Luis’s bus ride.',
              options: ['Job coach', 'Coworker', 'Work experience coordinator, with the student', 'Supervisor'],
              answer: 2,
              explain: 'The work experience coordinator handles transportation with the student. The coach consults, not decides.',
            },
            {
              id: 'm1-who-q3',
              prompt: 'The safety steps for the new floor scrubber at Luis’s site are unclear.',
              options: ['Coworker', 'Supervisor', 'Job coach', 'Student'],
              answer: 1,
              explain: 'Mr. Okafor, the supervisor, clarifies the safety steps before work continues. The coach then teaches them.',
            },
            {
              id: 'm1-who-pace',
              prompt: 'Mr. Okafor mentions to Ben that Luis is taking longer than expected to reset the meeting rooms.',
              options: ['Supervisor, by correcting Luis', 'Job coach, by asking the expected time and giving Luis the feedback', 'Job coach, by resetting some rooms for Luis', 'Work experience coordinator'],
              answer: 1,
              explain: 'Performance feedback is the coach’s job, so the site is not burdened. Ben thanks Mr. Okafor, asks what time is expected, then gives Luis the feedback and builds pace into instruction.',
            },
            {
              id: 'm1-who-behind',
              prompt: 'Luis is behind on wiping tables before the lunch crowd arrives.',
              options: ['Job coach, by wiping some tables to catch up', 'Coworker, by finishing the tables', 'Student, with the coach pointing to the next step or modeling one table'],
              answer: 2,
              explain: 'Luis does the work. Ben can point to the next step or model one table, then hand it back. He does not wipe tables to catch up.',
            },
          ] },
        },
        {
          id: 'm1-coworker',
          kind: 'Apply it',
          title: 'Apply it: a coworker’s question',
          lead: 'Write what you would say. Keep it short and respectful.',
          blocks: [
            { type: 'scenario', html: 'A coworker asks you, “So what’s wrong with him? Why does he need you here?” Luis is restocking in the next room.' },
          ],
          activity: {
            type: 'write',
            items: [
              { id: 'm1-coworker-say', prompt: 'What can you say about your role without sharing anything about Luis? Who should the coworker talk to about work questions?' },
            ],
            model: [
              { type: 'scenario', html: '“I’m a job coach. I’m here to support Luis while he learns the job. If you have questions about the work, Luis or Mr. Okafor are the best people to ask.”' },
              { type: 'list', items: [
                'Explains the coach’s role, not anything about Luis',
                'Does not confirm or explain a disability or support need',
                'Stays brief and ordinary, then redirects to Luis and his supervisor',
              ] },
            ],
          },
        },
        {
          id: 'm1-checkpoint',
          kind: 'Checkpoint',
          title: 'Module checkpoint',
          lead: 'Answer each question. Your first answer is saved, and the explanation appears right away. The checkpoint counts for completion, not a score.',
          activity: { type: 'checkpoint', items: [
            {
              id: 'm1-cp-purpose',
              prompt: 'What does success in job coaching look like?',
              options: [
                'The student finishes every task, with the coach’s help as needed',
                'The coach is needed less and less as the student does the job more independently',
                'The supervisor relies on the coach to manage the student',
                'The coach is at the student’s side for every shift',
              ],
              answer: 1,
              explain: 'Job coaching exists so the student can do a real job as independently as possible. Success means the coach is needed less and less.',
            },
            {
              id: 'm1-cp-q1',
              prompt: 'Who is the worker and primary decision maker?',
              options: ['The job coach', 'The student', 'The workplace supervisor', 'The work experience coordinator'],
              answer: 1,
              explain: 'The student is the worker. Coaching protects that role.',
            },
            {
              id: 'm1-cp-q2',
              prompt: 'When is it appropriate for the coach to speak for the student?',
              options: [
                'Whenever it saves time during a busy shift',
                'When the supervisor addresses the coach directly',
                'Rarely: when the student asks for that help or it is needed for access, and only for the part the student wants communicated',
                'Never, under any circumstances',
              ],
              answer: 2,
              explain: 'Rarely, and only with the student’s direction or for access. A supervisor speaking to the coach is a cue to redirect, not to answer.',
            },
            {
              id: 'm1-cp-supervisor',
              prompt: 'Which decision belongs to the supervisor?',
              options: [
                'Whether to share the student’s disability information',
                'Work assignments, schedules, and the Workplace Standard',
                'The student’s performance evaluation',
                'Which prompts the coach uses during instruction',
              ],
              answer: 1,
              explain: 'Supervisors own work assignments, schedules, and the Workplace Standard, and may give informal feedback. The job coach handles performance feedback and evaluation. Disclosure belongs to the student and program.',
            },
            {
              id: 'm1-cp-standard',
              prompt: 'Which best describes the Workplace Standard?',
              options: [
                'Whatever the student can do with the coach’s help',
                'What the employer expects of any worker: completion, quality, pace, and independence, plus soft skills like punctuality and accepting feedback',
                'A lower standard set for students in the program',
                'The job coach’s personal expectations',
              ],
              answer: 1,
              explain: 'The Workplace Standard is the same for every worker. Supports can change how a student meets it, not what it is.',
            },
            {
              id: 'm1-cp-q4',
              prompt: 'What relationship should coaching strengthen over time?',
              options: [
                'Between the coach and the supervisor',
                'Between the student and the coach',
                'Among the student, supervisor, and coworkers',
                'Between the work experience coordinator and the employer',
              ],
              answer: 2,
              explain: 'Coaching should strengthen the direct relationship among the student, supervisor, and coworkers, so the job does not depend on the coach.',
            },
          ] },
        },
        {
          id: 'm1-questions',
          kind: 'Your questions',
          title: 'What questions do you still have?',
          lead: 'Your supervisor reads these and will follow up with you. Write a question, or check the box if you have none right now. One is required to finish the module.',
          activity: { type: 'questions', items: [
            { id: 'm1-questions-q', prompt: 'Your questions about Module 1' },
          ] },
        },
        {
          id: 'm1-job-site',
          kind: 'Job-site action',
          title: 'Job-site action',
          lead: 'Try this at your next site visit, then come back and record what happened. You can finish the module now and record this later.',
          blocks: [
            { type: 'callout', tone: 'dark', html: 'At your next site visit, notice one moment when waiting or redirecting would preserve the student’s role.' },
          ],
          activity: { type: 'action', id: 'm1-action', prompt: 'Notice one moment when waiting or redirecting would preserve the student’s role.' },
        },
      ],
    },
    {
      id: 'm2',
      label: 'Module 2',
      title: 'Student-centered supports and accommodations',
      time: '20 to 25 minutes',
      learn: 'Choose and test workplace supports and accommodations with the student',
      question: 'Whose experience of the barrier am I starting from?',
      art: 'supportChoice',
      outcomes: [
        'Begin with the student’s goal, preferences, communication, and experience of a barrier.',
        'Distinguish an accommodation from doing the task for the student.',
        'Involve each student in selecting and testing supports, through choice or through acceptance.',
        'Teach the student to use a support, then decide whether to keep, revise, or replace it.',
      ],
      screens: [
        {
          id: 'm2-goals',
          kind: 'Learn',
          title: 'What you will be able to do',
          lead: 'Choose workplace supports with the student, test them during real work, and revise them using evidence. By the end of this module you will be able to:',
          blocks: [
            { type: 'outcomes' },
            { type: 'callout', tone: 'coral', html: '<strong>Why it matters:</strong> a support the student didn’t choose or accept is a support the student stops using.' },
          ],
        },
        {
          id: 'm2-shift',
          kind: 'Learn',
          title: 'Change the question you ask',
          lead: 'This module is about one shift in thinking.',
          blocks: [
            { type: 'cards', items: [
              { title: 'Instead of asking', tone: 'gray', items: ['“How can I help the student finish this task?”'] },
              { title: 'Ask', tone: 'yellow', items: ['“What can the student use or change so I am needed less?”'] },
            ] },
            { type: 'callout', tone: 'dark', html: 'Using an accommodation is not the opposite of independence. A good support lets a person do the work with less help from someone else.' },
          ],
        },
        {
          id: 'm2-terms',
          kind: 'Learn',
          title: 'Plain-language definitions',
          lead: 'Read these terms before you plan a support.',
          blocks: [
            { type: 'table', head: ['Term', 'What it means'], rows: [
              ['<strong>Barrier</strong>', 'Something in the task, tools, or environment that makes the work harder to access or complete'],
              ['<strong>Accommodation</strong>', 'A change in how the student accesses the task or environment that keeps the essential work with the student whenever possible'],
              ['<strong>Essential work</strong>', 'The result the job actually requires, such as correctly stocked shelves, not one particular way of getting there'],
              ['<strong>Independence</strong>', 'Effective work performance, which can include tools, technology, environmental changes, and natural support'],
            ] },
          ],
        },
        {
          id: 'm2-access',
          kind: 'Learn',
          title: 'An accommodation changes access. It does not take over.',
          lead: 'Compare supports that keep the work with the student and actions that move the work to the coach.',
          blocks: [
            { type: 'table', head: ['Barrier', 'Accommodation: student still does the work', 'Taking over: coach does the work'], rows: [
              ['Remembering steps', 'Photo checklist the student follows', 'Coach reads each step aloud every time'],
              ['Sorting accuracy', 'Labeled bins with pictures', 'Coach sorts the hard items'],
              ['Asking for help', 'Prepared request script', 'Coach asks the supervisor for the student'],
              ['Folding precision', 'Folding guide or jig', 'Coach folds the difficult pieces'],
            ] },
            { type: 'callout', tone: 'yellow', html: 'A useful support reduces a barrier and increases access, participation, safety, or independence.' },
            { type: 'callout', tone: 'dark', html: 'An accommodation changes how the student meets the Workplace Standard, not what the standard is.' },
          ],
        },
        {
          id: 'm2-ask',
          kind: 'Learn',
          title: 'Start with the student: ask, listen, offer, confirm',
          lead: 'Use this routine before suggesting any support. Adult preference alone is not evidence that a support works.',
          blocks: [
            { type: 'list', ordered: true, items: [
              '<strong>Ask:</strong> “What part of this is hard?” Use the student’s communication mode.',
              '<strong>Listen:</strong> Note the student’s words and what you observe. Do not finish the answer for them.',
              '<strong>Offer:</strong> Share two or three options. Include doing nothing new as one choice.',
              '<strong>Confirm:</strong> The student chooses what to try, or shows you whether it works: by telling you, or by using it or not using it. Agree on how you will both know it is working.',
            ] },
            { type: 'coach', kind: 'tip', html: 'Ask in the student’s mode. Luis answers on his speech app, so ask one short question, then wait while he types.' },
          ],
        },
        {
          id: 'm2-participation',
          kind: 'Learn',
          title: 'Every student takes part, in different ways',
          lead: 'Not every student can name a barrier or choose between options yet. Every student can still take part.',
          blocks: [
            { type: 'cards', items: [
              { title: 'Some students can', tone: 'yellow', items: ['Name what is hard', 'Look at options and pick one to try', 'Tell you whether it worked'] },
              { title: 'Other students first need', tone: 'gray', items: ['You to introduce a support, then teach and model it', 'Guided choices between two options', 'Time to try it before they can respond'] },
            ] },
            { type: 'p', html: 'Students can tell you whether a support works by speaking, picking from pictures, using AAC, a rating scale, showing you, or simply choosing to use it again. Over time, help each student make more of the choices.' },
            { type: 'coach', kind: 'trap', html: 'Ben gives Luis a new picture sequence and decides it doesn’t work when Luis ignores it. No one showed Luis how to use it.' },
            { type: 'coach', kind: 'tip', html: 'Not using a support is feedback, once you know the student was taught how to use it. Until then, it may just mean “I don’t know how yet.”' },
          ],
        },
        {
          id: 'm2-workwise',
          kind: 'Learn',
          title: 'The support trial loop',
          lead: 'Every workplace support decision follows the same six steps. After Decide, the loop starts again if the support is revised or replaced.',
          blocks: [
            { type: 'list', ordered: true, items: [
              '<strong>Identify:</strong> Name the specific barrier, from what the student tells or shows you and what you observe.',
              '<strong>Explore:</strong> List more than one possible solution.',
              '<strong>Choose:</strong> The student chooses what to try, or accepts or turns down what the team offers.',
              '<strong>Try:</strong> Teach the student how to use the support, then test it during an authentic work task.',
              '<strong>Collect:</strong> Gather performance information and student feedback.',
              '<strong>Decide:</strong> Keep, revise, replace, or discontinue.',
            ] },
            { type: 'coach', kind: 'tip', html: 'Ask your work experience coordinator which tools you can borrow for a trial before anyone buys something new.' },
            { type: 'callout', tone: 'gray', html: 'This loop comes from our program’s WorkWISE grant: Workplace Independence Through Supports and Exploration.' },
          ],
        },
        {
          id: 'm2-barriers',
          kind: 'Learn',
          title: 'Barrier categories and supports to explore',
          lead: 'Teach the barrier first. Products are examples, not answers.',
          blocks: [
            { type: 'table', head: ['Barrier category', 'You might observe or hear', 'Supports to explore'], rows: [
              ['Task sequence and memory', 'Skips or repeats steps, loses place after interruptions', 'Photo checklist, reusable writing tablet, dry-erase schedule, labeled bins'],
              ['Time and pace', 'Unsure when to start, stop, or move on', 'Visual timer, tactile or vibrating timer, talking timer'],
              ['Organization and accuracy', 'Miscounts, misplaces items', 'Label maker, large-display calculator, tally counter'],
              ['Communication and self-advocacy', 'Waits instead of asking, unsure how to request help', 'Prepared request script, voice recorder when permitted, visual choice system'],
              ['Sensory and attention', 'Covers ears, leaves area during noise, glances away often', 'Hearing protection when safe, task lighting, anti-glare support, visual boundary, planned quiet break'],
              ['Physical access and endurance', 'Shifts weight, slows over a shift, difficulty gripping', 'Anti-fatigue mat, ergonomic writing tool, folding guide, task jig or fixture'],
              ['Visual access', 'Leans close to labels, misreads small print', 'Magnifier, high-contrast labels, enlarged directions'],
            ] },
            { type: 'callout', tone: 'gray', html: 'Before any trial, confirm workplace rules, hygiene, hearing and visibility requirements, data privacy, and task safety.' },
          ],
        },
        {
          id: 'm2-worked-example',
          kind: 'See it',
          title: 'Worked example: the support trial loop with Luis',
          lead: 'Luis loses his place while resetting a meeting room. Interruptions make restarting hard.',
          blocks: [
            { type: 'predict', prompt: 'What would you do first?',
              options: ['Get Luis a visual timer', 'Ask Luis what makes restarting hard', 'Tell Luis each next step yourself'],
              responses: [
                'A timer is a common first idea, but it’s a guess. Ben doesn’t know the barrier yet, and losing his place isn’t about time. See how Ben finds out first.',
                'That’s what Ben did. Starting with what Luis tells or shows him keeps the support tied to the real barrier.',
                'That gets the room reset today, but it puts Ben in charge of the steps and is hard to fade. See what Ben tried instead.',
              ] },
            { type: 'table', head: ['Step', 'What the team did'], rows: [
              ['<strong>Identify</strong>', 'On his speech app, Luis typed, “People talk. I forget.” Ben saw him restart from step 1 twice.'],
              ['<strong>Explore</strong>', 'Picture sequence on the cart, colored tape on finished tables, a coworker check-in'],
              ['<strong>Choose</strong>', 'Luis chose his picture sequence with a clip he can move to mark his place.'],
              ['<strong>Try</strong>', 'Ben showed Luis how to move the clip after each step, modeled it once, then handed it back. Luis used it during three normal room resets.'],
              ['<strong>Collect</strong>', 'Restarts from step 1 dropped from 2 to 0. Luis tapped “good” and pointed at the clip.'],
              ['<strong>Decide</strong>', 'Keep the picture sequence. Next, fade Ben’s check-ins.'],
            ] },
          ],
        },
        {
          id: 'm2-compare',
          kind: 'Try it',
          title: 'Compare the coaching responses',
          lead: 'Luis’s team is choosing a support.',
          activity: { type: 'choice', items: [
            {
              id: 'm2-compare-timer',
              prompt: 'Which response is stronger?',
              options: [
                'Ben buys a visual timer because timers often help people stay on task.',
                'Ben asks Luis what makes restarting hard, waits while he answers on his speech app, offers three options, and lets Luis choose one to try during real work.',
              ],
              answer: 1,
              explain: 'A product is useful only when it addresses the specific barrier and works for this student in this workplace. A timer does not solve losing place.',
            },
          ] },
        },
        {
          id: 'm2-trial',
          kind: 'Try it',
          title: 'Practice: plan a support trial',
          lead: 'Maya has just rotated to the café. During the lunch rush she loses track of which order comes next.',
          blocks: [
            { type: 'p', html: 'The team is considering three options:' },
            { type: 'list', items: [
              '<strong>A.</strong> A ticket rail where orders hang in order, oldest on the left',
              '<strong>B.</strong> A highlighter to mark finished items on each ticket',
              '<strong>C.</strong> Ben tells Maya the next order each time she finishes one',
            ] },
          ],
          activity: {
            type: 'write',
            items: [
              { id: 'm2-trial-plan', prompt: 'Write (1) the barrier in observable terms, (2) which options are accommodations and why, (3) which one you would offer Maya to try, and (4) what data and student feedback would show whether it works.' },
            ],
            model: [
              { type: 'list', items: [
                '<strong>Barrier:</strong> During the lunch rush, Maya starts the wrong order or waits because she cannot tell which order is next.',
                '<strong>Accommodations:</strong> A and B change access and keep the work with Maya. C replaces Maya’s own checking with a coach prompt and is hard to fade.',
                '<strong>Trial:</strong> Offer A and B. Maya chooses. The choice belongs to Maya when both are reasonable. Teach her how to use the one she picks, such as where to hang tickets and when to highlight, before judging whether it works.',
                '<strong>Evidence:</strong> Orders started in the right sequence, prompts needed, time per order, and Maya’s own view of the support.',
              ] },
            ],
          },
        },
        {
          id: 'm2-headphones',
          kind: 'Apply it',
          title: 'Apply it: a support with a safety catch',
          lead: 'Write how the team should proceed.',
          blocks: [
            { type: 'scenario', html: 'Luis’s noise-reducing headphones help in the loud cafeteria where he empties trash, but they may block the fire alarm and Mr. Okafor’s voice.' },
          ],
          activity: {
            type: 'write',
            items: [
              { id: 'm2-headphones-plan', prompt: 'What should the team check first? How does Luis stay involved in the decision?' },
            ],
            model: [
              { type: 'list', ordered: true, items: [
                'Check workplace rules for alarms, hearing, and communication in that area with Mr. Okafor and the work experience coordinator.',
                'Ask Luis which sounds are hardest and when. Wait while he answers on his speech app.',
                'Explore safer options with Luis, such as ear protection that lets alarms through, a visual alarm, or a planned quiet break.',
                'Trial only an approved option, then collect performance information and Luis’s feedback.',
              ] },
            ],
          },
        },
        {
          id: 'm2-two-students',
          kind: 'See it',
          title: 'Same skill, two students: finding the right support',
          lead: 'Both students help decide on a support. They just do it in different ways.',
          blocks: [
            { type: 'twoStudents',
              maya: 'Ben asks Maya what makes the lunch rush hard. She says, “I lose which order is next.” Ben offers a ticket rail or a highlighter, and Maya picks the rail. After a week she tells Ben she wants to keep it.',
              luis: 'Ben sees Luis restart from step 1 after interruptions. He shows Luis two options, modeling each one: a picture sequence with a clip, and colored tape. Luis points to the clip. Over three room resets he moves the clip on his own, which tells Ben it works.',
              same: 'The student helps decide. Maya tells Ben what works. Luis shows him.' },
          ],
        },
        {
          id: 'm2-checkpoint',
          kind: 'Checkpoint',
          title: 'Module checkpoint',
          lead: 'Answer each question. Your first answer is saved, and the explanation appears right away. The checkpoint counts for completion, not a score.',
          activity: { type: 'checkpoint', items: [
            {
              id: 'm2-cp-start',
              prompt: 'When you are deciding on an appropriate accommodation, what starts the process?',
              options: ['A product that has worked for other students', 'A specific barrier, based on what the student tells or shows you and what you observe', 'The supervisor’s request for a tool', 'A list of tools the program already owns'],
              answer: 1,
              explain: 'Start with a specific barrier, from what the student tells or shows you and what you observe. Products come later, as options to try.',
            },
            {
              id: 'm2-cp-access',
              prompt: 'Which of these is an accommodation, not doing the task for the student?',
              options: ['The coach sorts the hard items', 'Labeled bins with pictures the student uses to sort', 'The coach asks the supervisor for the student', 'The coach reads each step aloud every time'],
              answer: 1,
              explain: 'An accommodation changes access while the student still does the essential work. The other choices move the work to the coach.',
            },
            {
              id: 'm2-cp-choose',
              prompt: 'Who chooses among reasonable support options?',
              options: ['The job coach', 'The supervisor', 'The student, whenever possible', 'The work experience coordinator'],
              answer: 2,
              explain: 'The student chooses whenever possible. When a student can’t choose yet, the team offers options and the student’s acceptance decides, shown in words, with AAC, or by whether they use it.',
            },
            {
              id: 'm2-cp-taught',
              prompt: 'Luis isn’t using his new picture sequence. What should you check first?',
              options: ['Whether he was taught how to use it', 'Whether a different product would work better', 'Whether the supervisor wants him to use it', 'Nothing. Not using it means it doesn’t work.'],
              answer: 0,
              explain: 'Not using a support can mean “no” or “I don’t know how yet.” Make sure he was taught to use it before you decide.',
            },
            {
              id: 'm2-cp-evidence',
              prompt: 'What evidence ends a trial with a decision?',
              options: ['The coach’s impression of how it went', 'Performance information and the student’s feedback', 'How much the support cost', 'Whether the supervisor likes it'],
              answer: 1,
              explain: 'Performance information and student feedback lead to a decision: keep, revise, replace, or discontinue.',
            },
          ] },
        },
        {
          id: 'm2-questions',
          kind: 'Your questions',
          title: 'What questions do you still have?',
          lead: 'Your supervisor reads these and will follow up with you. Write a question, or check the box if you have none right now. One is required to finish the module.',
          activity: { type: 'questions', items: [
            { id: 'm2-questions-q', prompt: 'Your questions about Module 2' },
          ] },
        },
        {
          id: 'm2-job-site',
          kind: 'Job-site action',
          title: 'Job-site action',
          lead: 'Try this at your next site visit, then come back and record what happened. You can finish the module now and record this later.',
          blocks: [
            { type: 'callout', tone: 'dark', html: 'Use the support trial loop for one barrier. Find out what the student tells or shows you before you suggest any product, and teach the support before you judge it.' },
          ],
          activity: { type: 'action', id: 'm2-action', prompt: 'Use the support trial loop for one barrier. Find out what the student tells or shows you before you suggest any product, and teach the support before you judge it.' },
        },
      ],
    },
    {
      id: 'm3',
      label: 'Module 3',
      title: 'Task analysis, task hierarchy, and the Workplace Standard',
      time: '30 to 35 minutes',
      learn: 'Build and use a task analysis that shows where training begins',
      question: 'Could another coach observe and teach every step exactly as written?',
      art: 'taskSteps',
      outcomes: [
        'Explain what a task analysis is and why coaching decisions start from one.',
        'Break a workplace task into observable steps, at the right size for the student.',
        'Confirm the steps and the Workplace Standard with the workplace before teaching.',
        'Assess each step to find where training begins.',
        'Name the student’s next target on the way to the Workplace Standard.',
        'Plan for the skill to transfer to new conditions and last.',
      ],
      screens: [
        {
          id: 'm3-goals',
          kind: 'Learn',
          title: 'What you will be able to do',
          lead: 'Turn a complete workplace task into observable steps connected to the Workplace Standard. By the end of this module you will be able to:',
          blocks: [
            { type: 'outcomes' },
            { type: 'callout', tone: 'coral', html: '<strong>Why it matters:</strong> if the steps aren’t clear, no two people teach them the same way, and the student pays for it.' },
          ],
        },
        {
          id: 'm3-why',
          kind: 'Learn',
          title: 'The task analysis is your teaching plan',
          lead: 'Almost every decision in the rest of this course starts from a task analysis.',
          blocks: [
            { type: 'table', head: ['The task analysis tells you', 'You will use it in'], rows: [
              ['Which steps the student can already do, and where training begins', 'This module'],
              ['Which steps to teach first, and in what order', 'Module 4: Chaining'],
              ['Which steps need a prompt, and which prompt', 'Module 5: Prompts and fading'],
              ['What to record on each visit', 'Module 7: Observation and data'],
              ['When the student is ready for you to step back', 'Fading, in Modules 5 and 8'],
            ] },
            { type: 'cards', items: [
              { title: 'Who builds it', tone: 'yellow', items: ['The work experience coordinator builds the task analysis with the workplace supervisor. A job coach may build one too, if comfortable. Either way, the coach teaches from it and helps keep it accurate.'] },
            ] },
            { type: 'coach', kind: 'tip', html: 'Training begins where skill ends. Teach the steps the student can’t do yet, not the ones they already can.' },
          ],
        },
        {
          id: 'm3-terms',
          kind: 'Learn',
          title: 'Plain-language definitions',
          lead: 'You will use these terms in every remaining module.',
          blocks: [
            { type: 'table', head: ['Term', 'What it means'], rows: [
              ['<strong>Task analysis</strong>', 'A written or visual breakdown of a complete task into observable steps that can be taught and measured'],
              ['<strong>Task hierarchy</strong>', 'The ordered relationship among the whole job, major task parts, individual steps, and smaller actions when a step needs more breakdown'],
              ['<strong>Observable step</strong>', 'One action with a visible result that two people would agree did or did not happen'],
              ['<strong>Workplace Standard</strong>', 'What the workplace expects of any worker doing this task: completion, quality and safety, pace, and independence. It tells you when a step or task is done right.'],
              ['<strong>Baseline</strong>', 'A record of how the student does each step before teaching or a new support begins'],
            ] },
          ],
        },
        {
          id: 'm3-hierarchy',
          kind: 'Learn',
          title: 'The task hierarchy',
          lead: 'Break a job down only as far as the student needs. Here is one level of Luis’s job, from the top down.',
          blocks: [
            { type: 'list', ordered: true, items: [
              '<strong>Whole job:</strong> custodial aide at a community building',
              '<strong>Major task:</strong> reset a meeting room',
              '<strong>Major part:</strong> clean the tables',
              '<strong>Step:</strong> spray the approved cleaner on one table',
              '<strong>Smaller actions, only if needed:</strong> check the label, point the nozzle at the table, spray two times',
            ] },
            { type: 'callout', tone: 'gray', html: 'Only break a step into smaller actions when the student can’t do it reliably as written. Extra steps make a task analysis harder to teach and harder to fade.' },
          ],
        },
        {
          id: 'm3-worked-example',
          kind: 'See it',
          title: 'Worked example: reset a meeting room',
          lead: 'Luis’s task analysis has four major parts and nine observable steps.',
          blocks: [
            { type: 'table', head: ['Major part', 'Observable steps'], rows: [
              ['<strong>1. Gather supplies</strong>', '1. Take the cart with cleaner, cloth, and trash bags to the room'],
              ['<strong>2. Clear the room</strong>', '2. Throw away trash from tables and floor<br>3. Put items left behind in the lost-and-found bin on the cart'],
              ['<strong>3. Clean the tables</strong>', '4. Spray the approved cleaner on one table<br>5. Wipe the whole table, left to right<br>6. Check the table for spots or wet areas, and wipe again if needed'],
              ['<strong>4. Reset and return</strong>', '7. Push in four chairs at each table<br>8. Return the cart to the supply closet<br>9. Tell Mr. Okafor the room is ready'],
            ] },
          ],
        },
        {
          id: 'm3-criteria',
          kind: 'Learn',
          title: 'The Workplace Standard for the same task',
          lead: 'The Workplace Standard tells you and the student when the task is done right.',
          blocks: [
            { type: 'table', head: ['Part', 'Workplace Standard for this task'], rows: [
              ['<strong>Safety</strong>', 'Uses the approved cleaner and amount. Does not spray near people or electronics.'],
              ['<strong>Quality</strong>', 'No trash, crumbs, spots, or wet areas. Four chairs pushed in at each table.'],
              ['<strong>Completion</strong>', 'Lost items in the bin, cart returned, Mr. Okafor told the room is ready.'],
              ['<strong>Pace</strong>', 'Confirm with the supervisor, for example one room in 15 minutes.'],
              ['<strong>Independence</strong>', 'Gets the cart, starts, and checks the room without prompts.'],
            ] },
            { type: 'callout', tone: 'yellow', html: 'The Workplace Standard comes from the workplace. Ask for it; don’t invent it. It is the same for Luis as for any worker.' },
          ],
        },
        {
          id: 'm3-observable',
          kind: 'Learn',
          title: 'What makes a step observable',
          lead: 'Rewrite vague steps so anyone could see whether they happened.',
          blocks: [
            { type: 'table', head: ['Vague step', 'Observable step'], rows: [
              ['Clean the room', 'Wipe the whole table, left to right'],
              ['Be careful with chemicals', 'Spray cleaner only on the table, away from people'],
              ['Understand the schedule', 'Check the schedule card and start the first task on it'],
              ['Finish correctly', 'Return the cart to the closet and tell the supervisor the room is ready'],
            ] },
            { type: 'list', items: [
              'Starts with an action verb',
              'One action and one visible result',
              'Avoids words like understand, careful, or appropriately',
            ] },
          ],
        },
        {
          id: 'm3-observable-check',
          kind: 'Try it',
          title: 'Practice: is the step observable?',
          lead: 'Decide whether two people watching would agree that each step did or did not happen.',
          activity: { type: 'choice', items: [
            {
              id: 'm3-obs-q1',
              prompt: '“Do a good job on the shelf.”',
              options: ['Observable', 'Not observable'],
              answer: 1,
              explain: '“A good job” means different things to different people. Try: “Pull each item to the front edge of the shelf.”',
            },
            {
              id: 'm3-obs-q2',
              prompt: '“Push in four chairs at each table.”',
              options: ['Observable', 'Not observable'],
              answer: 0,
              explain: 'One action, one visible result. Anyone could count the chairs.',
            },
            {
              id: 'm3-obs-q3',
              prompt: '“Remember to be safe with the cleaner.”',
              options: ['Observable', 'Not observable'],
              answer: 1,
              explain: '“Remember” and “safe” can’t be seen. Try: “Spray cleaner only on the table, away from people.”',
            },
          ] },
        },
        {
          id: 'm3-confirm',
          kind: 'Learn',
          title: 'Confirm the steps before you teach',
          lead: 'A task analysis is a draft until the workplace and the student confirm it.',
          blocks: [
            { type: 'list', ordered: true, items: [
              '<strong>Ask:</strong> ask the supervisor for the Workplace Standard and any required order.',
              '<strong>Watch:</strong> observe a skilled coworker do the task.',
              '<strong>Walk through:</strong> go through the steps with the student and find out what they already do.',
              '<strong>Check rules:</strong> note site rules for safety, hygiene, and equipment.',
              '<strong>Revise:</strong> remove extra steps and add missing ones.',
            ] },
            { type: 'coach', kind: 'trap', html: 'Ben writes the steps from memory and starts teaching. Mr. Okafor wants chairs pushed in before the tables are wiped. Luis learns it the wrong way and has to relearn it.' },
          ],
        },
        {
          id: 'm3-baseline',
          kind: 'See it',
          title: 'Assess each step to find where training begins',
          lead: 'Before teaching, watch the student do the whole task with no added help, when it is safe. Record each step as done independently (+) or not yet (−).',
          blocks: [
            { type: 'table', head: ['Luis’s step', 'Day 1', 'Day 2'], rows: [
              ['1. Take the cart to the room', '+', '+'],
              ['2. Throw away trash', '+', '+'],
              ['3. Items to lost and found', '+', '+'],
              ['4. Spray cleaner on one table', '−', '−'],
              ['5. Wipe the whole table', '+', '−'],
              ['6. Check for spots', '−', '−'],
              ['7. Push in chairs', '+', '+'],
              ['8. Return the cart', '+', '+'],
              ['9. Tell Mr. Okafor', '−', '−'],
            ] },
            { type: 'predict', prompt: 'Where should Ben start teaching?',
              options: ['At step 1, teaching the whole task from the beginning', 'At the steps Luis can’t do yet: 4, 5, 6, and 9', 'At whichever step Ben thinks is hardest'],
              responses: [
                'Luis already does steps 1, 2, 7, and 8 on his own. Reteaching them wastes his time and adds prompts he doesn’t need.',
                'That’s it. Training begins where skill ends. Steps that are mixed across days, like 5, are teaching targets too.',
                'Ben’s guess may be wrong. The baseline shows exactly which steps need teaching.',
              ] },
            { type: 'p', html: '<strong>Ben teaches steps 4, 5, 6, and 9.</strong> He leaves the steps Luis already does alone. Repeat the assessment on two or three days if performance varies, and on any step that affects safety, step in and record it as not yet.' },
          ],
        },
        {
          id: 'm3-path',
          kind: 'Learn',
          title: 'Building toward the Workplace Standard',
          lead: 'Students rarely meet the whole standard at once. Most build toward it in this order.',
          blocks: [
            { type: 'list', ordered: true, items: [
              '<strong>Starts the task:</strong> gathers the materials and begins without repeated prompts.',
              '<strong>Completes it:</strong> does every step, even if some need fixing.',
              '<strong>Meets quality:</strong> checks the work, finds errors, and fixes them.',
              '<strong>Meets pace:</strong> works at the speed the workplace expects.',
              '<strong>Works independently:</strong> needs help only now and then, to solve a problem.',
            ] },
            { type: 'callout', tone: 'yellow', html: 'Teach accuracy before speed. Work on pace once the student does the task correctly, and fade your support once the student meets the whole standard consistently.' },
            { type: 'coach', kind: 'tip', html: 'Find the student’s place on the path. Luis starts and finishes the room, but he can’t yet spray the cleaner or check for spots. His next targets are completion and quality, not speed.' },
          ],
        },
        {
          id: 'm3-two-students',
          kind: 'See it',
          title: 'Same skill, two students: sizing the steps',
          lead: 'A good task analysis fits the student. The task can be similar while the steps are very different.',
          blocks: [
            { type: 'twoStudents',
              maya: 'Maya’s task analysis for facing a grocery shelf has 6 broad steps, such as “Pull every item to the front edge.” She keeps them as a checklist on her phone and checks off each one.',
              luis: 'Luis’s task analysis for resetting a meeting room started with 9 steps. Ben broke the cleaning steps into smaller actions, for 14 steps in all, each with a photo in Luis’s picture sequence.',
              same: 'Observable steps, at the size the student needs. Maya’s steps are bigger. Luis’s are smaller and pictured.' },
          ],
        },
        {
          id: 'm3-transfer',
          kind: 'Learn',
          title: 'Plan for the skill to transfer and last',
          lead: 'A skill isn’t learned until it lasts and works in new conditions.',
          blocks: [
            { type: 'table', head: ['Term', 'What it means'], rows: [
              ['<strong>Generalization</strong>', 'Using the skill with different people, materials, places, or times'],
              ['<strong>Maintenance</strong>', 'Keeping the skill weeks after teaching ends'],
            ] },
            { type: 'list', items: [
              'Practice in different rooms, with different supervisors, and at busy times',
              'Check the skill again two and four weeks after it is mastered',
              'Write these checks into the teaching plan from the start',
            ] },
            { type: 'callout', tone: 'gray', html: '<strong>What research shows:</strong> a review of 75 studies found that people with significant disabilities learned many work tasks, but few studies checked whether the skills generalized or lasted. Plan for it.' },
          ],
        },
        {
          id: 'm3-practice',
          kind: 'Try it',
          title: 'Practice: improve a task analysis',
          lead: 'Maya’s first task analysis for facing a shelf has three vague steps: “Get ready,” “Do the shelf,” and “Finish up.”',
          activity: {
            type: 'write',
            items: [
              { id: 'm3-practice-steps', prompt: 'Rewrite Maya’s three steps so they are observable. Then name one thing you would confirm with Carla before teaching.' },
            ],
            model: [
              { type: 'list', items: [
                '<strong>Get ready:</strong> “Take the stocking cart to the start of aisle 5.”',
                '<strong>Do the shelf:</strong> “Pull every item to the front edge, label facing out.”',
                '<strong>Finish up:</strong> “Return the cart and tell Carla the aisle is done.”',
                '<strong>Confirm with Carla:</strong> the order of the aisles, how items should face, how long an aisle should take, and anything that must never be moved.',
              ] },
            ],
          },
        },
        {
          id: 'm3-machine',
          kind: 'Apply it',
          title: 'Apply it: “Use the machine safely”',
          lead: 'At the café, Maya’s task analysis for the dish room includes this step.',
          blocks: [
            { type: 'scenario', html: 'Step 4: Use the dish machine safely.' },
          ],
          activity: {
            type: 'write',
            items: [
              { id: 'm3-machine-step', prompt: 'What smaller actions does this step hide? Which standards must the workplace confirm before teaching begins?' },
            ],
            model: [
              { type: 'list', items: [
                'Break it into the approved setup, protective equipment, loading pattern, start sequence, and how to stop the machine.',
                'Confirm the stop conditions, such as an alarm, a jam, or a spill, and who Maya tells.',
                'Confirm what “done” looks like: racks unloaded, area dry, machine off or ready.',
                'Rosa or the café supervisor confirms each item before Ben teaches it.',
              ] },
            ],
          },
        },
        {
          id: 'm3-checkpoint',
          kind: 'Checkpoint',
          title: 'Module checkpoint',
          lead: 'Answer each question. Your first answer is saved, and the explanation appears right away. The checkpoint counts for completion, not a score.',
          activity: { type: 'checkpoint', items: [
            {
              id: 'm3-cp-observable',
              prompt: 'What makes a step observable?',
              options: ['It is written in the supervisor’s words', 'It names one action with a visible result that two people would agree happened', 'It describes what the student should understand', 'It is short'],
              answer: 1,
              explain: 'An observable step names one action with a visible result, so anyone watching would agree whether it happened.',
            },
            {
              id: 'm3-cp-smaller',
              prompt: 'When does a step need to be broken into smaller actions?',
              options: ['Always, for every student', 'When the student can’t do the step reliably as written', 'When the supervisor asks for more detail', 'Never; smaller steps confuse students'],
              answer: 1,
              explain: 'Break a step down only as far as the student needs. Extra steps make a task harder to teach and to fade.',
            },
            {
              id: 'm3-cp-standard',
              prompt: 'Who sets the Workplace Standard for a task?',
              options: ['The job coach', 'The workplace, confirmed with the student', 'The student alone', 'Whoever wrote the task analysis'],
              answer: 1,
              explain: 'The workplace sets the Workplace Standard. The coach asks for it and confirms it before teaching.',
            },
            {
              id: 'm3-cp-baseline',
              prompt: 'Why assess each step before teaching?',
              options: ['To give the student a grade', 'To find the steps the student can’t do yet, because training begins where skill ends', 'To show the supervisor the student needs a coach', 'It isn’t needed if the coach knows the student'],
              answer: 1,
              explain: 'The assessment shows which steps need teaching, so you don’t reteach what the student already does.',
            },
            {
              id: 'm3-cp-pace',
              prompt: 'When should you start working on a student’s pace?',
              options: ['First, so the student keeps up', 'Once the student does the task correctly', 'Only if the supervisor complains', 'Never; pace is not part of the Workplace Standard'],
              answer: 1,
              explain: 'Teach accuracy before speed. Pace is part of the Workplace Standard, and you work on it once the steps and quality are right.',
            },
            {
              id: 'm3-cp-builder',
              prompt: 'Who builds the task analysis in our program?',
              options: ['Only the supervisor', 'The work experience coordinator with the supervisor, or a job coach who feels comfortable doing it', 'The student', 'Nobody; coaches teach from memory'],
              answer: 1,
              explain: 'The work experience coordinator builds it with the supervisor. A job coach may build one too, if comfortable. The coach always teaches from it.',
            },
          ] },
        },
        {
          id: 'm3-questions',
          kind: 'Your questions',
          title: 'What questions do you still have?',
          lead: 'Your supervisor reads these and will follow up with you. Write a question, or check the box if you have none right now. One is required to finish the module.',
          activity: { type: 'questions', items: [
            { id: 'm3-questions-q', prompt: 'Your questions about Module 3' },
          ] },
        },
        {
          id: 'm3-job-site',
          kind: 'Job-site action',
          title: 'Job-site action',
          lead: 'Try this at your next site visit, then come back and record what happened. You can finish the module now and record this later.',
          blocks: [
            { type: 'callout', tone: 'dark', html: 'Choose one real task. Get or build its task analysis, confirm the steps and the Workplace Standard with the workplace, and assess each step before you teach.' },
          ],
          activity: { type: 'action', id: 'm3-action', prompt: 'Choose one real task. Get or build its task analysis, confirm the steps and the Workplace Standard with the workplace, and assess each step before you teach.' },
        },
      ],
    },
    {
      id: 'm4',
      label: 'Module 4',
      title: 'Systematic instruction and chaining',
      time: '30 to 35 minutes',
      learn: 'Teach a task step by step with forward, backward, or total-task chaining',
      question: 'Which steps is the student learning right now, and what happens during the rest?',
      art: 'chainLinks',
      outcomes: [
        'Explain chaining and how it builds on the task analysis.',
        'Compare forward chaining, backward chaining, and total-task instruction.',
        'Choose a strategy based on the student, the task, and which way is easier to teach.',
        'Plan what happens during the steps the student is not learning yet, without doing the student’s work.',
        'Move a skill from learning it, to doing it at pace, to doing it anywhere.',
      ],
      screens: [
        {
          id: 'm4-goals',
          kind: 'Learn',
          title: 'What you will be able to do',
          lead: 'Choose how the student will learn a sequence of steps, and plan what happens during every step. By the end of this module you will be able to:',
          blocks: [
            { type: 'outcomes' },
            { type: 'callout', tone: 'coral', html: '<strong>Why it matters:</strong> teaching steps in a random order makes a task feel harder than it is, and it is easy to end up doing the steps the student isn’t learning yet.' },
          ],
        },
        {
          id: 'm4-terms',
          kind: 'Learn',
          title: 'Plain-language definitions',
          lead: 'Chaining is built on the task analysis from Module 3.',
          blocks: [
            { type: 'table', head: ['Term', 'What it means'], rows: [
              ['<strong>Chaining</strong>', 'Teaching the steps of a task analysis one link at a time, in order, until the student does the whole task'],
              ['<strong>Forward chaining</strong>', 'Teach the first step first. Once it is mastered, the student does it and learns the second step, and so on.'],
              ['<strong>Backward chaining</strong>', 'The same, in reverse. Teach the last step first, then work back toward the beginning.'],
              ['<strong>Total-task instruction</strong>', 'The student does every step, every time, with the least help needed on each step'],
              ['<strong>Mastered step</strong>', 'A step the student does correctly, without help, across several days'],
            ] },
          ],
        },
        {
          id: 'm4-forward-backward',
          kind: 'Learn',
          title: 'Forward and backward chaining, side by side',
          lead: 'Luis is learning a new task: restocking a hand towel dispenser. It has five steps.',
          blocks: [
            { type: 'list', ordered: true, items: [
              'Take a pack of towels from the cart',
              'Unlock the dispenser with the key',
              'Load the towels',
              'Close and lock the dispenser',
              'Hang the key back on the cart',
            ] },
            { type: 'table', head: ['', 'Forward chaining', 'Backward chaining'], rows: [
              ['<strong>Teaching starts with</strong>', 'Step 1. Ben models steps 2 to 5 while Luis watches.', 'Step 5. Ben models steps 1 to 4 while Luis watches, then Luis does step 5.'],
              ['<strong>Once that step is mastered</strong>', 'Luis does step 1 and learns step 2.', 'Luis learns step 4, then does step 5.'],
              ['<strong>And so on, until</strong>', 'Luis does all five steps.', 'Luis does all five steps.'],
              ['<strong>A good fit when</strong>', 'The task is new, and the first steps set up everything after them.', 'Finishing matters to the student, so every practice ends with a finished task.'],
            ] },
            { type: 'callout', tone: 'gray', html: 'When you complete the steps not being taught, the student watches. That is modeling, one of the two exceptions from Module 1, not doing the work for them.' },
          ],
        },
        {
          id: 'm4-total-task',
          kind: 'Learn',
          title: 'Total-task instruction',
          lead: 'Sometimes the student does every step, every time, and you teach inside the steps that need it.',
          blocks: [
            { type: 'p', html: 'In Module 3, Luis already did steps 1, 2, 3, 7, and 8 of the room reset on his own. Ben doesn’t chain those. Luis does all nine steps every time he resets a room, and Ben gives help only on steps 4, 5, 6, and 9.' },
            { type: 'cards', items: [
              { title: 'A good fit when', tone: 'yellow', items: ['The student already does many of the steps', 'The task happens often, so there are many chances to practice', 'The steps are short and connected'] },
              { title: 'Watch for', tone: 'coral', items: ['Help on every step, even the ones the student knows', 'A coach who talks the student through the whole task. That is prompting, not total-task teaching.'] },
            ] },
          ],
        },
        {
          id: 'm4-choose',
          kind: 'Learn',
          title: 'Choosing a strategy',
          lead: 'Our program guide says the strategy depends on the student, the task, and which way will be easier to teach. These questions help.',
          blocks: [
            { type: 'table', head: ['Ask', 'If yes, consider'], rows: [
              ['Is the task new, and do the first steps set up the rest?', 'Forward chaining'],
              ['Does the student do most early steps but stop before finishing?', 'Backward chaining'],
              ['Does finishing the task matter to the student?', 'Backward chaining'],
              ['Is the task done often, and does the student already do many steps?', 'Total-task instruction'],
              ['Would you end up doing steps while the student stands by?', 'Rethink the plan with the work experience coordinator'],
            ] },
            { type: 'callout', tone: 'dark', html: 'Pick the plan that gives the student the most real practice and the clearest path to fading your help.' },
          ],
        },
        {
          id: 'm4-during',
          kind: 'Learn',
          title: 'What happens during the steps not being taught',
          lead: 'Every plan has steps the student isn’t learning yet. Decide ahead of time what happens during them.',
          blocks: [
            { type: 'cards', items: [
              { title: 'Good options', tone: 'yellow', items: ['The student does the step with as much help as needed', 'You model the step while the student watches', 'A coworker does the step as part of normal work, as agreed with the supervisor'] },
              { title: 'Not an option', tone: 'coral', items: ['You do the step off to the side while the student waits', 'You finish the task after the student leaves', 'You skip steps so the task looks done'] },
            ] },
            { type: 'coach', kind: 'trap', html: 'Ben uses forward chaining with Luis on the dispenser. After step 1, Ben rushes through steps 2 to 5 while Luis looks at his tablet. Luis didn’t see the steps, so that wasn’t modeling. It was Ben doing the work.' },
          ],
        },
        {
          id: 'm4-worked-example',
          kind: 'See it',
          title: 'Worked example: closing the café dish room',
          lead: 'Maya has rotated to the café. Her closing task has seven steps. She does steps 1 to 5 on her own, then stops and looks for Dana.',
          blocks: [
            { type: 'list', ordered: true, items: [
              'Scrape and rack the last dishes',
              'Run the last rack through the machine',
              'Unload and put away the clean dishes',
              'Drain and wipe the machine',
              'Sweep the dish room floor',
              'Wipe the counter and dry the sink',
              'Tell Rosa the dish room is closed',
            ] },
            { type: 'predict', prompt: 'Which strategy would you choose?',
              options: ['Forward chaining, starting again from step 1', 'Backward chaining, starting with step 7', 'Total-task instruction on all seven steps'],
              responses: [
                'Maya already does steps 1 to 5. Starting over reteaches what she knows and leaves her stuck at the end again. See what Dana chose.',
                'That’s what Dana chose. Maya already does the early steps, and teaching the last step first means every shift ends with Maya finishing the job herself.',
                'Defensible, since Maya does most of the steps. But she keeps stopping before the end, so Dana chose a plan that makes finishing the focus. See her reasoning.',
              ] },
            { type: 'list', items: [
              '<strong>Plan:</strong> Maya does steps 1 to 5. Dana models step 6 while Maya watches. Maya does step 7 and tells Rosa herself.',
              '<strong>Next:</strong> once step 7 is mastered, Maya learns step 6.',
              '<strong>Why:</strong> every shift ends with Maya finishing and talking to Rosa directly, which builds her connection with her coworker.',
            ] },
            { type: 'coach', kind: 'tip', html: 'Write the plan on the task analysis, so anyone covering for you teaches the same steps the same way.' },
          ],
        },
        {
          id: 'm4-chain-vs-prompt',
          kind: 'Learn',
          title: 'Chaining is not the prompt hierarchy',
          lead: 'This is the most common mix-up. Keep the two ideas separate.',
          blocks: [
            { type: 'cards', items: [
              { title: 'Chaining answers', tone: 'yellow', items: ['Which steps is the student learning right now?', 'Which steps does the student already do alone?', 'In what order will new steps be added?'] },
              { title: 'Prompts answer', tone: 'gray', items: ['What added help does the student get within one step?', 'How much help, and what kind?', 'How will that help fade?'] },
            ] },
            { type: 'callout', tone: 'dark', html: 'You use prompts inside any chaining plan. Module 5 covers the prompt hierarchy.' },
          ],
        },
        {
          id: 'm4-stages',
          kind: 'Learn',
          title: 'Learn it, speed it up, use it anywhere',
          lead: 'Our program teaches every skill in three stages. Together they lead to the Workplace Standard.',
          blocks: [
            { type: 'table', head: ['Stage', 'The question', 'Toward the Workplace Standard'], rows: [
              ['<strong>Acquisition</strong>', 'Has the student learned the steps?', 'Completion and quality'],
              ['<strong>Fluency</strong>', 'Does the student know the skill but need to do it faster or more smoothly?', 'Pace'],
              ['<strong>Generalization</strong>', 'Can the student do it in a different room, with different people, on a busy day?', 'Independence, on any day'],
            ] },
            { type: 'callout', tone: 'yellow', html: 'If a student isn’t learning a skill, change the teaching plan, not the student. Problem-solve with your work experience coordinator.' },
            { type: 'coach', kind: 'tip', html: 'To build fluency, try a visual support, a short break at a set time, or practice at the real pace for part of a shift. Don’t push for speed before the steps are right.' },
          ],
        },
        {
          id: 'm4-compare',
          kind: 'Try it',
          title: 'Compare the coaching responses',
          lead: 'Ben is planning instruction for a new task.',
          activity: { type: 'choice', items: [
            {
              id: 'm4-compare-plan',
              prompt: 'Which approach is stronger?',
              options: [
                'Ben uses forward chaining, because it always works best for new tasks.',
                'Ben looks at the step-by-step assessment, how often the task happens, safety, whether finishing matters to the student, and how his help will fade. Then he chooses.',
              ],
              answer: 1,
              explain: 'There is no single best strategy. The same task may need a different plan for another student or site. Choose from evidence, not habit.',
            },
          ] },
        },
        {
          id: 'm4-pick',
          kind: 'Try it',
          title: 'Practice: choose a chaining strategy',
          lead: 'Choose a strategy for each student. Other choices can be defensible, so read the reasoning after each answer.',
          activity: { type: 'choice', items: [
            {
              id: 'm4-pick-q1',
              prompt: 'A student at the bakery does the first five of seven steps for packaging cookies, then stops before labeling and stacking the boxes.',
              options: ['Forward chaining', 'Backward chaining', 'Total-task instruction'],
              answer: 1,
              explain: 'The student already does the early steps and stops before the end. Teaching the last step first means every practice ends with a finished, labeled box.',
            },
            {
              id: 'm4-pick-q2',
              prompt: 'A student in the laundry room folds towels many times every shift and already does most of the steps with a little help.',
              options: ['Forward chaining', 'Backward chaining', 'Total-task instruction'],
              answer: 2,
              explain: 'Frequent practice and partial skills fit total-task instruction: the student does every step every time, with the least help needed on each.',
            },
            {
              id: 'm4-pick-q3',
              prompt: 'A student is new to scanning documents in the office. The first steps, logging in and loading the scanner, set up everything that follows.',
              options: ['Forward chaining', 'Backward chaining', 'Total-task instruction'],
              answer: 0,
              explain: 'A new task where the first steps set up the rest fits forward chaining. Model the later steps while the student watches.',
            },
          ] },
        },
        {
          id: 'm4-two-students',
          kind: 'See it',
          title: 'Same skill, two students: learning a new chain',
          lead: 'Both students learn a new task one step at a time. The plan fits each of them.',
          blocks: [
            { type: 'twoStudents',
              maya: 'Maya learns the café closing routine with backward chaining. Her seven steps are on her phone checklist. Dana models step 6 once, and Maya masters the last two steps in about two weeks.',
              luis: 'Luis learns the hand towel dispenser with forward chaining. Each of his five steps has a photo in his picture sequence. Ben models each new step, then hands it back. Luis adds about one step a week.',
              same: 'One new link at a time, joined to steps the student already does. The direction, the step size, and the pace fit the student.' },
          ],
        },
        {
          id: 'm4-dependence',
          kind: 'Apply it',
          title: 'Apply it: chaining or prompt dependence?',
          lead: 'Write your answer and your reason.',
          blocks: [
            { type: 'scenario', html: 'Luis does every step of the room reset, but only after Ben tells him each step out loud. Ben calls this total-task instruction.' },
          ],
          activity: {
            type: 'write',
            items: [
              { id: 'm4-dependence-why', prompt: 'Is this total-task instruction, prompt dependence, or both? What would you check next?' },
            ],
            model: [
              { type: 'list', items: [
                'It may be both. Luis does every step, which is total-task instruction. But needing Ben’s voice before every step suggests prompt dependence.',
                'Chaining decides which steps are taught. Prompts are added help within a step. Here the prompts were never faded.',
                'Next, check whether Luis can start any step if Ben waits. Then plan to fade the spoken directions toward his picture sequence, using Module 5.',
              ] },
            ],
          },
        },
        {
          id: 'm4-checkpoint',
          kind: 'Checkpoint',
          title: 'Module checkpoint',
          lead: 'Answer each question. Your first answer is saved, and the explanation appears right away. The checkpoint counts for completion, not a score.',
          activity: { type: 'checkpoint', items: [
            {
              id: 'm4-cp-chaining',
              prompt: 'What does a chaining strategy decide?',
              options: ['How much help to give within a step', 'Which steps the student is learning right now, and in what order', 'How fast the student must work', 'Who builds the task analysis'],
              answer: 1,
              explain: 'Chaining decides which steps are taught and in what order. Prompts decide how much help to give within a step.',
            },
            {
              id: 'm4-cp-backward',
              prompt: 'In backward chaining, which step does the student learn first?',
              options: ['The first step', 'The hardest step', 'The last step', 'Every step at once'],
              answer: 2,
              explain: 'Backward chaining starts with the last step, so the student finishes the task every time, then works back toward the beginning.',
            },
            {
              id: 'm4-cp-untaught',
              prompt: 'During a step the student isn’t learning yet, what should happen?',
              options: ['The coach does it off to the side to save time', 'The student does it with as much help as needed, or watches the coach model it', 'The step is skipped', 'The student waits until the coach finishes'],
              answer: 1,
              explain: 'The student stays involved, by doing the step with help or by watching you model it. Doing it while the student waits is doing the work for them.',
            },
            {
              id: 'm4-cp-choose',
              prompt: 'What decides which chaining strategy to use?',
              options: ['The coach’s favorite method', 'The student, the task, and which way is easier to teach', 'Always forward chaining for new students', 'The supervisor’s preference'],
              answer: 1,
              explain: 'Our program guide puts it this way: the strategy depends on the student, the task, and which way will be easier to teach.',
            },
            {
              id: 'm4-cp-fluency',
              prompt: 'When should you focus on a student’s pace?',
              options: ['Before the student learns the steps', 'After the student has learned the steps and does them correctly', 'Only on the first day', 'Never'],
              answer: 1,
              explain: 'Pace is the fluency stage. Work on it after the student has learned the skill and does the steps correctly.',
            },
          ] },
        },
        {
          id: 'm4-questions',
          kind: 'Your questions',
          title: 'What questions do you still have?',
          lead: 'Your supervisor reads these and will follow up with you. Write a question, or check the box if you have none right now. One is required to finish the module.',
          activity: { type: 'questions', items: [
            { id: 'm4-questions-q', prompt: 'Your questions about Module 4' },
          ] },
        },
        {
          id: 'm4-job-site',
          kind: 'Job-site action',
          title: 'Job-site action',
          lead: 'Try this at your next site visit, then come back and record what happened. You can finish the module now and record this later.',
          blocks: [
            { type: 'callout', tone: 'dark', html: 'For one task, choose a chaining strategy and write why. Plan what the student and you will each do during every step.' },
          ],
          activity: { type: 'action', id: 'm4-action', prompt: 'For one task, choose a chaining strategy and write why. Plan what the student and you will each do during every step.' },
        },
      ],
    },
    {
      id: 'm5',
      label: 'Module 5',
      title: 'The prompt hierarchy, wait time, and fading',
      time: '35 to 40 minutes',
      learn: 'Use the prompt hierarchy, wait time, and fading so natural cues take over',
      question: 'What will tell the student to act when I’m not there?',
      art: 'promptLadder',
      outcomes: [
        'Tell a natural cue from a prompt.',
        'Use the program’s prompt hierarchy, from natural cues to physical prompts.',
        'Use few words and enough wait time before adding help.',
        'Correct errors respectfully and give specific feedback.',
        'Fade help one feature at a time until natural cues and supports take over.',
      ],
      screens: [
        {
          id: 'm5-goals',
          kind: 'Learn',
          title: 'What you will be able to do',
          lead: 'Help only as much as needed, then reduce help so natural workplace cues guide the work. By the end of this module you will be able to:',
          blocks: [
            { type: 'outcomes' },
            { type: 'callout', tone: 'coral', html: '<strong>Why it matters:</strong> help that comes too often or too fast teaches a student to wait for the coach instead of the job.' },
          ],
        },
        {
          id: 'm5-terms',
          kind: 'Learn',
          title: 'Plain-language definitions',
          lead: 'Start with what is already in the workplace.',
          blocks: [
            { type: 'table', head: ['Term', 'What it means'], rows: [
              ['<strong>Natural cue</strong>', 'Something already in the setting that tells the student it’s time to act, such as an empty bin, a clock, a customer at the counter, or a supervisor’s direction'],
              ['<strong>Prompt</strong>', 'Help added by a coach or a support to make a correct response more likely'],
              ['<strong>Wait time</strong>', 'A planned, quiet pause that gives the student time to notice the cue, think, and begin'],
              ['<strong>Prompt hierarchy</strong>', 'Prompts in order, from least restrictive to most restrictive'],
              ['<strong>Fading</strong>', 'Reducing added help, step by step, as the student responds to natural cues'],
              ['<strong>Prompt dependence</strong>', 'Waiting for the coach’s prompt even when the student has the skill and the natural cue is there'],
            ] },
          ],
        },
        {
          id: 'm5-natural',
          kind: 'Learn',
          title: 'Natural cue or prompt?',
          lead: 'The goal is for natural cues to do the job your prompts are doing now.',
          blocks: [
            { type: 'table', head: ['Situation', 'Natural cue', 'Added prompt'], rows: [
              ['Restocking napkins at the café', 'The napkin holder is empty', 'Ben says, “Napkins are low.”'],
              ['Ending break', 'The clock on the break room wall', 'Ben taps the table'],
              ['Next step of a room reset', 'The next photo in Luis’s picture sequence', 'Ben points to the spray bottle'],
              ['Helping a customer', 'A customer asks Maya where the pasta is', 'Ben whispers, “Help her.”'],
            ] },
            { type: 'callout', tone: 'dark', html: 'Ask yourself: when I leave, which cue will still be here?' },
          ],
        },
        {
          id: 'm5-hierarchy',
          kind: 'Learn',
          title: 'Our prompt hierarchy',
          lead: 'Our program uses eight levels, from least restrictive at the top to most restrictive at the bottom. Our goal is to progress toward natural cues.',
          blocks: [
            { type: 'table', head: ['Level', 'What it is', 'Example'], rows: [
              ['<strong>1. Natural cues</strong><br>Least restrictive', 'Something in the setting that tells the student it’s time to act', 'The trash can is full'],
              ['<strong>2. Visual or picture</strong>', 'An object or picture added or changed so it stands out and draws attention', 'Luis’s picture sequence on the cart'],
              ['<strong>3. Proximity or shadowing</strong>', 'Moving closer to the student, or moving an item closer to them. Shadowing means watching from near enough to step in only when needed.', 'Ben stands a few steps from Luis'],
              ['<strong>4. Indirect verbal</strong>', 'An open question that doesn’t say what to do', '“What needs to happen next?”'],
              ['<strong>5. Direct verbal</strong>', 'A statement that tells the student exactly what to do', '“Spray the table.”'],
              ['<strong>6. Gestural</strong>', 'A movement that cues the start, the next step, or the end of a task', 'Ben points to the spray bottle'],
              ['<strong>7. Modeling</strong>', 'The coach or a coworker shows the step done correctly, then hands it back', 'Rosa loads one rack while Maya watches'],
              ['<strong>8. Physical or touch</strong><br>Most restrictive', 'Guiding the student’s movement, from a light tap to hand-over-hand', 'A light touch on the elbow to start moving'],
            ] },
            { type: 'coach', kind: 'tip', html: 'If you need physical guidance for safety, use a gentle touch on the arm or elbow, not holding hands. Follow program policy and the student’s consent.' },
          ],
        },
        {
          id: 'm5-using',
          kind: 'Learn',
          title: 'Using the hierarchy: cue, wait, prompt, fade',
          lead: 'Start with the least help that might work. Add help one level at a time.',
          blocks: [
            { type: 'list', ordered: true, items: [
              '<strong>Cue:</strong> Make sure the natural cue is there and the student can see it.',
              '<strong>Wait:</strong> Stay quiet for the agreed time.',
              '<strong>Prompt:</strong> Give the least restrictive prompt that might work. If the student still doesn’t start, move one level, not straight to the bottom.',
              '<strong>Hand it back:</strong> As soon as the student starts, step back.',
              '<strong>Fade:</strong> Next time, try less help first.',
            ] },
            { type: 'callout', tone: 'gray', html: 'For a brand-new step, or a step where an error isn’t safe, you may start with more help, such as modeling, and fade to less help quickly. Agree on the plan with your work experience coordinator.' },
          ],
        },
        {
          id: 'm5-words',
          kind: 'Learn',
          title: 'Few words, more wait time',
          lead: 'Many students do better with less talking and more time.',
          blocks: [
            { type: 'cards', items: [
              { title: 'Say less', tone: 'yellow', items: ['Use one short prompt, such as “Next?”', 'Use the same words each time', 'Don’t explain while the student is working', 'Don’t rely only on words. Some students do better with a picture or a model.'] },
              { title: 'Wait longer', tone: 'gray', items: ['Count silently to five or more before adding help', 'Don’t repeat or rephrase too soon; it makes the student start over', 'Watch for signs the student is thinking', 'Give extra time to students who use AAC'] },
            ] },
            { type: 'coach', kind: 'trap', html: 'Ben asks Luis, “Okay, what do you need to do now? Remember the spray? Where’s the spray bottle? Can you get it?” That’s four prompts in five seconds. Luis stops to sort through them and doesn’t start.' },
            { type: 'coach', kind: 'say', html: '“Luis, what’s next?” Then wait.' },
          ],
        },
        {
          id: 'm5-worked-example',
          kind: 'See it',
          title: 'Worked example: Ben’s voice or Luis’s pictures?',
          lead: 'See how a coach moves help back toward a support the student controls.',
          blocks: [
            { type: 'scenario', html: 'Luis uses his picture sequence to reset a meeting room. After each step, Ben says the next step out loud, like “Now spray the table,” before Luis looks at his pictures. Luis gets every step right, but only after Ben speaks.' },
            { type: 'predict', prompt: 'What should Ben do on the next room reset?',
              options: ['Keep saying each step, since Luis gets them right', 'After each step, wait quietly. If Luis doesn’t start, ask, “What’s next?”', 'Take away the picture sequence, since Luis doesn’t use it'],
              responses: [
                'Luis is right every time, but he’s learning to wait for Ben’s voice. When Ben leaves, the cue leaves with him. See what Dana suggested.',
                'That’s Dana’s suggestion. The picture sequence is the support that stays. An open question is less restrictive than telling Luis what to do, and it sends him back to his pictures.',
                'Luis hasn’t had the chance to use it, because Ben speaks first. Removing it takes away the support that would let Ben fade. See what Dana suggested.',
              ] },
            { type: 'list', items: [
              '<strong>What Ben’s voice replaced:</strong> the picture sequence. Luis learned to wait for Ben instead of looking at the next photo.',
              '<strong>Next reset:</strong> Ben waits 5 seconds after each step. If Luis doesn’t start, Ben asks, “What’s next?” and waits again.',
              '<strong>Evidence:</strong> Ben records which steps Luis starts on his own and which prompt he used. Prompts should drop across resets.',
            ] },
          ],
        },
        {
          id: 'm5-levels',
          kind: 'Try it',
          title: 'Practice: name the prompt',
          lead: 'Choose the level of our hierarchy that each example shows.',
          activity: { type: 'choice', items: [
            {
              id: 'm5-level-q1',
              prompt: 'Ben asks Maya, “What needs to happen next?”',
              options: ['Natural cue', 'Indirect verbal', 'Direct verbal', 'Gestural'],
              answer: 1,
              explain: 'An open question that doesn’t say what to do is an indirect verbal prompt.',
            },
            {
              id: 'm5-level-q2',
              prompt: 'Dana points to the empty napkin holder.',
              options: ['Natural cue', 'Visual or picture', 'Gestural', 'Modeling'],
              answer: 2,
              explain: 'The empty holder is the natural cue. Dana’s pointing is a gestural prompt that draws attention to it. Next time, Dana waits and lets the empty holder do the work.',
            },
            {
              id: 'm5-level-q3',
              prompt: 'Rosa loads one dish rack while Maya watches, then hands Maya the next rack.',
              options: ['Proximity', 'Direct verbal', 'Modeling', 'Physical'],
              answer: 2,
              explain: 'Showing the step done correctly, then handing it back, is modeling.',
            },
            {
              id: 'm5-level-q4',
              prompt: 'Ben stands a few steps away from Luis and watches, ready to step in only if needed.',
              options: ['Proximity or shadowing', 'Indirect verbal', 'Natural cue', 'Gestural'],
              answer: 0,
              explain: 'Watching from near enough to step in only when needed is shadowing. Moving farther away is one way to fade it.',
            },
            {
              id: 'm5-level-q5',
              prompt: 'Which of these prompts is the least restrictive?',
              options: ['Direct verbal: “Wipe the table.”', 'Modeling the step', 'Visual: a photo of a clean table on the cart', 'Gestural: pointing to the cloth'],
              answer: 2,
              explain: 'In our hierarchy, a visual or picture prompt is less restrictive than verbal, gestural, or modeling prompts. Only natural cues are less restrictive.',
            },
          ] },
        },
        {
          id: 'm5-errors',
          kind: 'Learn',
          title: 'Respectful error correction',
          lead: 'Errors are information. Correct them in a way that keeps the student in charge of the work.',
          blocks: [
            { type: 'list', ordered: true, items: [
              '<strong>Decide:</strong> Step in only when the error matters for safety, quality, or learning.',
              '<strong>Show:</strong> Point out the cue or show the step, without blame.',
              '<strong>Retry:</strong> The student does the step again.',
              '<strong>Acknowledge:</strong> Name what the student did right.',
              '<strong>Adjust:</strong> If the same error keeps happening, change the teaching plan.',
            ] },
            { type: 'callout', tone: 'coral', html: 'Don’t fix the error yourself, and don’t restart the whole task.' },
            { type: 'coach', kind: 'tip', html: 'Let the student struggle a little. Resist jumping in, and give them the chance to solve the problem. That is how independence grows.' },
          ],
        },
        {
          id: 'm5-feedback',
          kind: 'Learn',
          title: 'Specific feedback, adult to adult',
          lead: 'Giving feedback is your job. Accepting it is part of the Workplace Standard.',
          blocks: [
            { type: 'cards', items: [
              { title: 'Do', tone: 'yellow', items: ['Name exactly what went well: “All four chairs are pushed in.”', 'Name one thing to change, and how', 'Use the same respect you would give any coworker', 'Celebrate with a high five or fist bump, if the student likes that'] },
              { title: 'Avoid', tone: 'coral', items: ['“Good job” over and over', 'Tangible rewards like candy or coffee', 'Correcting in front of customers or coworkers when it can wait', 'Hugs as a routine'] },
            ] },
            { type: 'p', html: 'Each time you give feedback calmly and the student uses it, they practice accepting constructive feedback, one of the soft skills in the Workplace Standard. Over time, help the student take feedback from the supervisor too.' },
          ],
        },
        {
          id: 'm5-fading',
          kind: 'Learn',
          title: 'Fade one feature at a time',
          lead: 'Plan fading from the first day. Change one thing, then check how the student does.',
          blocks: [
            { type: 'list', items: [
              'Wait a few seconds longer before prompting',
              'Use fewer words',
              'Move up the hierarchy, for example from direct verbal, to a picture, to the natural cue',
              'Prompt less often',
              'Stand farther away',
              'Shift help to a coworker or supervisor',
              'Let the student control the support, like Luis’s picture sequence',
            ] },
            { type: 'callout', tone: 'yellow', html: '<strong>If performance drops:</strong> ask whether the change was too big, the skill isn’t learned yet, the support isn’t available, or something changed at the site. Going back to more help for a while is not failure.' },
            { type: 'coach', kind: 'tip', html: 'When you step back, keep your eyes on the student, not your phone. You represent the program, and you need to see what the student does without you.' },
          ],
        },
        {
          id: 'm5-path',
          kind: 'Learn',
          title: 'From the first day to independence',
          lead: 'Our program follows these steps with every placement. Fading is gradual and based on the student’s performance.',
          blocks: [
            { type: 'table', head: ['Step', 'What it looks like'], rows: [
              ['<strong>Start of placement</strong>', 'More support: more frequent prompts and closer supervision'],
              ['<strong>Acquisition</strong>', 'The student learns the steps. If not, change the teaching method with the coordinator.'],
              ['<strong>Fluency</strong>', 'The student builds pace'],
              ['<strong>Generalization</strong>', 'The student does the task with small changes, distractions, or related tasks'],
              ['<strong>Fading</strong>', 'Once the student consistently meets the Workplace Standard, check in less and step farther away, even out of the room'],
              ['<strong>Regular check-ins</strong>', 'You may wait at the front of the site or in the car, and check in less over time'],
              ['<strong>Independence</strong>', 'Decided with the work experience coordinator, who tells the student and the site and keeps checking in'],
            ] },
            { type: 'coach', kind: 'say', html: 'Before you step back: “I’ll be at the front. If you need help, ask Mr. Okafor or come find me.”' },
            { type: 'p', html: '<strong>Then ask:</strong> what does the student do when you’re not there? Do they keep working, or stop and wait? The answer tells you whether to fade further.' },
          ],
        },
        {
          id: 'm5-dependence',
          kind: 'Learn',
          title: 'Signs of prompt dependence',
          lead: 'If you see these, the plan needs a fading step.',
          blocks: [
            { type: 'cards', items: [
              { title: 'What the coach does', tone: 'gray', items: ['Prompts before the student has a chance to respond', 'Repeats the same reminder with no plan to fade it', 'Answers questions or does steps the student can do', 'Keeps prompting just as often as the student improves'] },
              { title: 'What the student does', tone: 'coral', items: ['Watches the coach instead of the work', 'Waits even when the natural cue is clear', 'Works well only with one coach', 'Stops when the coach steps away'] },
            ] },
          ],
        },
        {
          id: 'm5-two-students',
          kind: 'See it',
          title: 'Same skill, two students: fading prompts',
          lead: 'Both students move toward natural cues. They start in different places on the hierarchy.',
          blocks: [
            { type: 'twoStudents',
              maya: 'Maya starts in the middle of the hierarchy. Ben uses indirect verbal prompts like “What’s next on your list?” Then he waits longer, and her checklist app and Carla take over. Ben moves from the end of the aisle to the front of the store.',
              luis: 'Luis starts with more help: modeling and gestures. His picture sequence becomes the support that stays. Ben fades from beside him, to the doorway, to check-ins, and Luis learns to tap “I need help” on his speech app for Mr. Okafor.',
              same: 'Both move toward natural cues. Luis starts with more help and keeps a visual support he controls.' },
          ],
        },
        {
          id: 'm5-plan',
          kind: 'Try it',
          title: 'Practice: write a fading plan',
          lead: 'Use the worked example with Luis and his picture sequence. Fill in every blank.',
          blocks: [
            { type: 'scenario', html: '“When ___ happens, wait ___ seconds. If Luis does not start ___, use ___. Record ___ for ___ room resets. Fade next by ___ if ___.”' },
          ],
          activity: {
            type: 'write',
            items: [
              { id: 'm5-plan-fade', prompt: 'Write the full plan. Use only one fading change, and name what you will record.' },
            ],
            model: [
              { type: 'scenario', html: '“When Luis finishes a step and the next photo is showing, wait 5 seconds. If Luis does not start the next step, ask, ‘What’s next?’ Record the steps he starts on his own and the prompt used, for 5 room resets. Fade next by standing in the doorway if Luis starts at least 8 of 9 steps on his own.”' },
              { type: 'list', items: [
                'The natural cue is the picture sequence, not Ben’s voice',
                'The prompt is indirect verbal, which is less restrictive than telling Luis each step',
                'The fading rule is tied to what Ben records',
              ] },
            ],
          },
        },
        {
          id: 'm5-checkpoint',
          kind: 'Checkpoint',
          title: 'Module checkpoint',
          lead: 'Answer each question. Your first answer is saved, and the explanation appears right away. The checkpoint counts for completion, not a score.',
          activity: { type: 'checkpoint', items: [
            {
              id: 'm5-cp-least',
              prompt: 'In our prompt hierarchy, which is the least restrictive?',
              options: ['Modeling', 'Natural cues', 'Direct verbal', 'Visual or picture'],
              answer: 1,
              explain: 'Natural cues are the least restrictive, and our goal is to progress toward them. Physical prompts are the most restrictive.',
            },
            {
              id: 'm5-cp-before',
              prompt: 'What comes before any prompt?',
              options: ['A direct verbal reminder', 'The natural cue and planned wait time', 'Modeling the step', 'A check-in with the supervisor'],
              answer: 1,
              explain: 'Make sure the natural cue is there, then wait. Add a prompt only if the student doesn’t start.',
            },
            {
              id: 'm5-cp-indirect',
              prompt: 'Which is an indirect verbal prompt?',
              options: ['“Spray the table.”', '“What needs to happen next?”', 'Pointing to the spray bottle', 'Showing how to spray one table'],
              answer: 1,
              explain: 'An indirect verbal prompt is an open question that doesn’t say exactly what to do.',
            },
            {
              id: 'm5-cp-error',
              prompt: 'After an error, what should correction give back to the student?',
              options: ['A lecture about the mistake', 'Another chance to do the step correctly', 'A task the coach has fixed', 'A restart of the whole task'],
              answer: 1,
              explain: 'Show the cue without blame, then let the student do the step again.',
            },
            {
              id: 'm5-cp-feedback',
              prompt: 'Which feedback fits our program?',
              options: ['“Good job!” after every step', 'A piece of candy for a finished task', '“All four chairs are pushed in. Next time, check the table for spots.”', 'Saying nothing, so the student stays independent'],
              answer: 2,
              explain: 'Specific feedback tells the student what went well and what to change. Our program doesn’t use tangible rewards like candy or coffee.',
            },
            {
              id: 'm5-cp-fade',
              prompt: 'When do you begin to fade support?',
              options: ['As soon as the student has done the task once', 'When the student consistently meets the Workplace Standard', 'When the supervisor asks', 'At the end of the semester'],
              answer: 1,
              explain: 'Plan fading from the first day, and begin once the student consistently meets the standard. Fade gradually, and decide on independence with the work experience coordinator.',
            },
          ] },
        },
        {
          id: 'm5-questions',
          kind: 'Your questions',
          title: 'What questions do you still have?',
          lead: 'Your supervisor reads these and will follow up with you. Write a question, or check the box if you have none right now. One is required to finish the module.',
          activity: { type: 'questions', items: [
            { id: 'm5-questions-q', prompt: 'Your questions about Module 5' },
          ] },
        },
        {
          id: 'm5-job-site',
          kind: 'Job-site action',
          title: 'Job-site action',
          lead: 'Try this at your next site visit, then come back and record what happened. You can finish the module now and record this later.',
          blocks: [
            { type: 'callout', tone: 'dark', html: 'Choose one prompt you give often. Move it toward the natural cue: wait longer, use fewer words, or use a less restrictive level. Notice what the student does.' },
          ],
          activity: { type: 'action', id: 'm5-action', prompt: 'Choose one prompt you give often. Move it toward the natural cue: wait longer, use fewer words, or use a less restrictive level. Notice what the student does.' },
        },
      ],
    },
    { id: 'm6', label: 'Module 6', title: 'Workplace communication, AAC, and natural supports', time: '25 to 30 minutes', learn: 'Support direct communication with supervisors and coworkers', screens: [] },
    { id: 'm7', label: 'Module 7', title: 'Observation, data, and positive problem-solving', time: '35 to 40 minutes', learn: 'Record what you see and use it to decide what to change', screens: [] },
    { id: 'm8', label: 'Module 8', title: 'Safety, workplace judgment, partnership, and dignity of risk', time: '30 to 35 minutes', learn: 'Respond to risk with sound judgment while respecting dignity of risk', screens: [] },
    { id: 'cap', label: 'Capstone', title: 'Plan, coach, observe, and revise', time: '35 to 45 minutes', learn: 'Put it all together in one coaching plan for one student', screens: [] },
  ],
};

// Supervisor observation form: the job coach competencies this course teaches.
const RUBRIC = {
  competencies: [
    'Role and boundaries',
    'Student voice and dignity',
    'Task analysis and instruction',
    'Prompt selection and response time',
    'Fading and natural supports',
    'Workplace communication',
    'Positive support and problem-solving',
    'Data and documentation',
    'Safety and judgment',
    'Collaboration and reflection',
  ],
  levels: ['Knows', 'Applies with support', 'Demonstrates independently'],
};
