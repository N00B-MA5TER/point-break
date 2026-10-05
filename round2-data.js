/**
 * ════════════════════════════════════════════════════════════
 * POINT BREAK — ROUND 02 · THE BREAK — round2-data.js
 * ════════════════════════════════════════════════════════════
 *
 * Every Round 2 problem lives here. Nothing is hard-coded in round2.js.
 *
 *   PUBLIC  (shown on the projector):  title · category · scenario ·
 *           constraints · challenge · statements[].t
 *   PRIVATE (organizer only, never shown until deliberately revealed):
 *           statements[].truth / .why / .src · organizer · reality
 *
 * truth  : 'valid' | 'invalid' | 'irrelevant'      (supplied by the club)
 * why    : the explanation shown when a statement is revealed
 * src    : what SOURCE CHECK reveals (says where it came from, never
 *          whether it is true)
 *
 * NOTE — authored by the assistant, please review/edit:
 *   · every `why` explanation
 *   · every `src` source line
 *   · the `constraints` cards (numbers copied from each scenario)
 *   · organizer.notes
 * `reality` is intentionally EMPTY — it must come from the club members
 * who lived these incidents. You can also type it live in the organizer
 * panel (REALITY tab); live edits are saved in the browser and win over
 * the text in this file.
 *
 * **double asterisks** in scenario / challenge text = highlighted words.
 * ════════════════════════════════════════════════════════════
 */

window.R2 = {

  event: { name: 'POINT BREAK', round: 'ROUND 02', title: 'THE BREAK' },

  teamSlots: 6,

  /* ── judging rubric (organizer only) ── */
  judging: {
    categories: [
      { k: 'und', label: 'Initial Understanding',  max: 10 },
      { k: 'rea', label: 'Initial Reasoning',      max: 15 },
      { k: 'inf', label: 'Information Evaluation', max: 20 },
      { k: 'lif', label: 'Lifeline Strategy',      max: 10 },
      { k: 'ada', label: 'Adaptation',             max: 25 },
      { k: 'fea', label: 'Feasibility',            max: 10 },
      { k: 'com', label: 'Communication',          max: 10 },
    ],
    guidance: [
      'Reward teams that notice WHICH facts their plan depends on and spend lifelines on those.',
      'Reward a clear “what changed, why, what now” — not a different answer for its own sake.',
      'Keeping the original plan is fine if the team can show the information still supports it.',
      'A team that never used its information critically (trusted everything, then trusted the lifelines blindly) should score low on Information Evaluation.',
    ],
  },

  /* ── lifelines ── */
  lifelines: [
    { k: 'verify',    name: 'VERIFY',       need: 1, blurb: 'Pick one statement. It is revealed as VALID, INVALID or IRRELEVANT.' },
    { k: 'eliminate', name: 'ELIMINATE',    need: 2, blurb: 'Pick two statements. One of them is revealed as unreliable.' },
    { k: 'source',    name: 'SOURCE CHECK', need: 1, blurb: 'Pick one statement. Its source is revealed — not whether it is true.' },
  ],

  problems: [

    /* ═══════════════════════════ 01 ═══════════════════════════ */
    {
      id: 1, num: '01',
      title: 'THE DEAD SYSTEM',
      category: 'CRISIS MANAGEMENT',
      scenario: [
        'You are participating in a **36-hour hackathon** with a **two-member team**.',
        'Your complete project is running on your **primary laptop**, while the **second laptop** is being used exclusively for the final presentation and supporting material.',
        'You are now **1 hour away** from the final submission deadline.',
        'Suddenly, the primary laptop goes to sleep, stops responding, and eventually **shuts down**.',
        'You have no clear idea whether the issue is software, hardware, overheating, power, or something else.',
        'Your entire working environment, project files, dependencies, and running system are on that machine.',
        'You have only two laptops, two team members, and one hour left. The second laptop is functional but **has not been configured for development**.',
      ],
      constraints: [
        { v: '36 HRS', l: 'Hackathon' },
        { v: '2',      l: 'Team members' },
        { v: '1 HOUR', l: 'To final submission', hot: true },
        { v: '2',      l: 'Laptops — the primary is dead' },
      ],
      challenge: {
        lead: 'What would you do in the next **60 minutes**?',
        label: 'Explain:',
        items: [
          'How you divide responsibilities',
          'How you recover or recreate the working environment',
          'How you protect the project',
          'How you ensure something valid is submitted before the deadline',
        ],
      },
      statements: [
        { t: 'The second laptop has enough storage for the project.',                 truth: 'valid',
          why: 'Storage is not the blocker — the project can be put on the second laptop.',
          src: 'A teammate checked the free disk space on the second laptop.' },
        { t: 'The project repository was pushed to GitHub less than 30 minutes ago.', truth: 'valid',
          why: 'The work is safe in the repository, so the dead laptop is not a single point of failure.',
          src: 'GitHub’s own push log — an automatic timestamp.' },
        { t: 'The primary laptop’s battery was almost empty before it shut down.',    truth: 'irrelevant',
          why: 'Why it died does not change the next step. The plan must not depend on reviving that laptop.',
          src: 'The laptop’s own low-battery notification, seen earlier.' },
        { t: 'The second laptop already has Git installed.',                          truth: 'valid',
          why: 'Cloning can start immediately — no setup time lost on Git.',
          src: 'Terminal output of “git --version” on the second laptop.' },
        { t: 'The primary laptop had shown occasional overheating warnings earlier in the day.', truth: 'irrelevant',
          why: 'It may explain the failure, but it does not change what has to be done in the next hour.',
          src: 'Warning pop-ups noticed during the day.' },
        { t: 'The final submission requires a working demo.',                         truth: 'valid',
          why: 'A submission without a working demo is not a valid submission — this sets the finish line.',
          src: 'The hackathon’s submission rules.' },
        { t: 'The project has several dependencies that are not installed on the second laptop.', truth: 'valid',
          why: 'Installing dependencies is the main time cost of recreating the environment.',
          src: 'The project’s requirements list compared with the second laptop’s installed packages.' },
        { t: 'The presentation laptop contains the final project screenshots.',      truth: 'irrelevant',
          why: 'Screenshots are supporting material. They do not help recover a working demo.',
          src: 'The presentation folder on the second laptop.' },
      ],
      organizer: {
        notes: [
          'Core idea: crisis management — find what is still safe and rebuild from it.',
          'Strong plans clone from GitHub on the second laptop, install the dependencies first, and split the work (one person rebuilds, one protects the submission).',
          'Distractors: battery, overheating, screenshots.',
        ],
      },
      reality: { situation: '', decision: '', outcome: '', reflection: '' },
    },

    /* ═══════════════════════════ 02 ═══════════════════════════ */
    {
      id: 2, num: '02',
      title: 'THE SUBMISSION THAT ISN’T READY',
      category: 'PRIORITISATION',
      scenario: [
        'You are participating in a **12-hour hackathon**.',
        'Your team has successfully completed and tested a **robust solution** within the given time.',
        'With only a short time remaining before submission, you realise something critical:',
        'The project is complete, but **the submission package is not**.',
        'The **demo video** has not been recorded.',
        'The **one-page report** has not been prepared.',
        '**Screenshots and supporting documentation** are incomplete.',
        'Your project is technically ready, but the submission requires these materials. You have limited time remaining and **cannot assume that the deadline will be extended**.',
      ],
      constraints: [
        { v: '12 HRS',  l: 'Hackathon' },
        { v: 'DONE',    l: 'Product built & tested' },
        { v: '3',       l: 'Submission items missing', hot: true },
        { v: 'NO',      l: 'Deadline extension' },
      ],
      challenge: {
        lead: 'How would you **prioritise** the remaining work?',
        label: 'What would you:',
        items: ['Sacrifice?', 'Simplify?', 'Delegate?', 'Automate?'],
        foot: 'Would you continue improving the product or immediately shift your focus toward submission readiness?',
      },
      statements: [
        { t: 'The submission portal accepts files until the official deadline.', truth: 'valid',
          why: 'The official deadline is the real limit — there is no grace period to count on.',
          src: 'The submission portal’s own page.' },
        { t: 'The demo video must show the complete workflow.',                   truth: 'valid',
          why: 'A partial video fails the requirement, so the recording has to be planned around the full flow.',
          src: 'The submission guidelines.' },
        { t: 'The project has already passed all your internal tests.',           truth: 'valid',
          why: 'The product work is finished — more polishing is not what is missing.',
          src: 'The team’s own test log.' },
        { t: 'The report has a strict one-page limit.',                           truth: 'valid',
          why: 'The report must be short; it can be written quickly and should not be over-built.',
          src: 'The submission guidelines (report template).' },
        { t: 'Screenshots can be generated from the existing application.',       truth: 'valid',
          why: 'Screenshots are cheap to produce because the application already works.',
          src: 'The team can run the finished application right now.' },
        { t: 'The judges will evaluate only the submitted video.',                truth: 'invalid',
          why: 'The report and documentation are also part of the submission, so the video alone is not enough.',
          src: 'Something another team said in the corridor.' },
        { t: 'The documentation is required as part of submission.',              truth: 'valid',
          why: 'Skipping documentation makes the package incomplete.',
          src: 'The submission guidelines.' },
        { t: 'The team can safely spend the remaining time improving the product without affecting submission preparation.', truth: 'invalid',
          why: 'Every minute spent on the product is a minute not spent on the missing items.',
          src: 'A teammate’s optimism.' },
      ],
      organizer: {
        notes: [
          'Core idea: prioritisation — the product is done; the package is what is missing.',
          'Strong plans shift to submission readiness immediately, delegate (video / report / screenshots) and avoid new product work.',
          'Traps: “judges only watch the video” and “we can keep improving the product”.',
        ],
      },
      reality: { situation: '', decision: '', outcome: '', reflection: '' },
    },

    /* ═══════════════════════════ 03 ═══════════════════════════ */
    {
      id: 3, num: '03',
      title: 'THE 97% FAILURE',
      category: 'ADAPTIVE THINKING',
      scenario: [
        'You are participating in an **8-hour ML hackathon**.',
        'Your team receives a **5 GB dataset**.',
        'Due to its size, importing and preparing the dataset takes **more than an hour**.',
        'After successfully waiting through almost the entire loading process, you discover that **at 97% completion**, the data-loading process has failed and the loaded data has become corrupted.',
        'You have to start again.',
        'Your planned model training requires approximately **3–4 hours**, while documentation and final submission preparation require roughly **1 hour**.',
        'You now have significantly less usable time than your original plan assumed.',
      ],
      constraints: [
        { v: '8 HRS',   l: 'Hackathon' },
        { v: '5 GB',    l: 'Dataset' },
        { v: '1 HR +',  l: 'To load & prepare — again', hot: true },
        { v: '3–4 HRS', l: 'Model training' },
        { v: '~1 HR',   l: 'Documentation & submission' },
        { v: '97%',     l: 'Where loading failed' },
      ],
      challenge: {
        lead: 'Explain your decision and how you will manage the remaining time. Do you:',
        label: '',
        items: [
          'Restart the entire pipeline exactly as planned?',
          'Change the model?',
          'Reduce preprocessing?',
          'Use a data subset?',
          'Modify the validation strategy?',
          'Reorganise the team?',
          'Change the entire solution approach?',
        ],
      },
      statements: [
        { t: 'The complete dataset is required for your original model.',         truth: 'invalid',
          why: 'It is not required — a subset can support a faster or smaller approach.',
          src: 'An assumption carried over from the original plan.' },
        { t: 'The dataset can be loaded again from the original source.',         truth: 'valid',
          why: 'A restart is possible, so the failed load is recoverable.',
          src: 'The dataset provider’s download page.' },
        { t: 'Your preprocessing pipeline has already been tested.',              truth: 'valid',
          why: 'There is no need to re-debug preprocessing — it can be reused as it is.',
          src: 'The team’s earlier test run.' },
        { t: 'A smaller subset of the dataset can be created locally.',           truth: 'valid',
          why: 'A subset allows fast iteration and works as a fallback while the full load runs again.',
          src: 'The team can sample the data files on the laptop.' },
        { t: 'The model can be trained without changing the architecture.',       truth: 'valid',
          why: 'The architecture can stay as it is, which helps with a reduced or faster setup.',
          src: 'The training configuration notes.' },
        { t: 'The failed loading process proves that the dataset itself is corrupted.', truth: 'invalid',
          why: 'A failed load corrupts the loaded copy, not necessarily the source — reloading can fix it.',
          src: 'A conclusion drawn from the error message.' },
        { t: 'Documentation can be completed after model training.',              truth: 'invalid',
          why: 'Documentation needs about an hour of its own, so it must be planned inside the remaining time, not after it.',
          src: 'A teammate’s suggestion.' },
        { t: 'Your team has enough remaining time to repeat the original plan without changing anything.', truth: 'invalid',
          why: 'The original plan no longer fits in the time that is left.',
          src: 'The team’s original schedule.' },
      ],
      organizer: {
        notes: [
          'Core idea: adaptive thinking — the original plan has quietly become impossible.',
          'Strong plans restart the load in the background, start working on a subset, and fit documentation inside the remaining time.',
          'Traps: “the data is corrupted”, “we have enough time as is”, “documentation can wait”.',
        ],
      },
      reality: { situation: '', decision: '', outcome: '', reflection: '' },
    },

    /* ═══════════════════════════ 04 ═══════════════════════════ */
    {
      id: 4, num: '04',
      title: 'THE LAST TRAINING RUN',
      category: 'RISK–REWARD DECISION MAKING',
      scenario: [
        'You are participating in a **12-hour ML hackathon**.',
        'Your team is given a dataset and must build, train, evaluate, document, and submit a complete ML solution within the available time.',
        'Training the model **locally takes approximately 6 hours** for one complete run. **Cloud-based training** is significantly faster, taking approximately **2 hours** for a complete training cycle.',
        'After several experiments, your team develops a **new model (Model B)** that performs significantly better than your previous approaches.',
        'Your **previously validated model (Model A)** performs reasonably well but requires around **4–5 hours** for a complete local training cycle.',
        'Model B has an expected training time of approximately **2.5 hours**, but it has **never been fully trained and validated** on the final configuration.',
        'You now have only **3 hours remaining**. Those 3 hours must potentially cover final model training, testing and validation, result analysis, demo preparation, documentation, and final submission.',
        'You cannot simply choose both.',
      ],
      constraints: [
        { v: '3 HRS',   l: 'Remaining', hot: true },
        { v: '4–5 HRS', l: 'Model A — validated, local' },
        { v: '~2.5 HRS',l: 'Model B — never fully trained' },
        { v: '2 HRS',   l: 'Cloud training cycle' },
        { v: '6 HRS',   l: 'One local training run' },
        { v: '12 HRS',  l: 'Hackathon' },
      ],
      challenge: {
        lead: 'What would you do? Define your strategy and explain exactly where you would draw the line between **“worth the risk”** and **“too late to gamble.”** Would you:',
        label: '',
        items: [
          'Trust the proven model and secure the submission?',
          'Take the risk with the higher-performing model?',
          'Use the cloud to accelerate the final experiment?',
          'Reduce the training configuration?',
          'Run a smaller validation experiment first?',
          'Allocate a fixed time limit to the new model and fall back if it fails?',
          'Sacrifice documentation / demo quality to pursue better model performance?',
        ],
      },
      statements: [
        { t: 'Model A has already been validated.',                       truth: 'valid',
          why: 'Model A is a proven fallback that can secure a submission.',
          src: 'The earlier validation report.' },
        { t: 'Model B performed better in preliminary experiments.',      truth: 'valid',
          why: 'Model B has real potential — which is why the decision is hard.',
          src: 'The team’s experiment log.' },
        { t: 'Model B’s 2.5-hour training time is guaranteed.',           truth: 'invalid',
          why: 'It is only an expectation — Model B has never been fully trained on the final configuration.',
          src: 'An estimate from a teammate — not a measurement.' },
        { t: 'The final submission requires testing and validation.',     truth: 'valid',
          why: 'Training time is not the whole cost — validation also has to fit into the 3 hours.',
          src: 'The competition rules.' },
        { t: 'Cloud training is available.',                              truth: 'valid',
          why: 'Cloud training (about 2 hours per cycle) is a real way to speed up the final run.',
          src: 'The team’s cloud account.' },
        { t: 'Model A requires 4–5 hours to train locally.',              truth: 'valid',
          why: 'That already exceeds the 3 hours remaining if trained locally.',
          src: 'The timing of the earlier local run.' },
        { t: 'A smaller validation run could provide information about Model B.', truth: 'valid',
          why: 'A small run is a cheap way to learn about Model B before committing the remaining time.',
          src: 'The team can run Model B on a small sample.' },
        { t: 'The competition rewards model performance regardless of submission time.', truth: 'invalid',
          why: 'Performance only counts inside a valid, on-time submission.',
          src: 'A teammate’s assumption.' },
      ],
      organizer: {
        notes: [
          'Core idea: risk–reward — the line between “worth the risk” and “too late to gamble”.',
          'Strong plans use a cheap validation run and/or the cloud, set a hard time limit for Model B, and keep Model A as the fallback.',
          'Traps: “2.5 hours is guaranteed” and “only performance matters”.',
        ],
      },
      reality: { situation: '', decision: '', outcome: '', reflection: '' },
    },

    /* ═══════════════════════════ 05 ═══════════════════════════ */
    {
      id: 5, num: '05',
      title: 'THE INTERNET IS GONE',
      category: 'DEPENDENCY ANALYSIS',
      scenario: [
        'You are in an **AI hackathon**.',
        'Your solution depends on several **APIs, online documentation, cloud services and package downloads**.',
        'Everything has been working perfectly.',
        'Suddenly, the venue’s **internet connection goes down**.',
        'The organisers announce: **“We don’t know when connectivity will return.”**',
        'Your existing project still runs locally, but you cannot download new dependencies, access cloud APIs, search documentation, or push to GitHub.',
        'You have **4 hours** remaining.',
      ],
      constraints: [
        { v: '4 HRS',  l: 'Remaining', hot: true },
        { v: '4',      l: 'Things you cannot do now' },
        { v: '?',      l: 'When internet returns — unknown', hot: true },
        { v: 'LOCAL',  l: 'The project still runs' },
      ],
      challenge: {
        lead: 'Explain your strategy and how you will protect the final submission. Do you:',
        label: '',
        items: [
          'Redesign the solution around what is already available?',
          'Wait for the network?',
          'Create a local alternative?',
          'Simplify the product?',
        ],
      },
      statements: [
        { t: 'The current project can still run locally.',                truth: 'valid',
          why: 'There is a working baseline to build on.',
          src: 'The team ran the project after the outage.' },
        { t: 'One of the core APIs requires an active internet connection.', truth: 'valid',
          why: 'That feature is a real blocker while the network is down.',
          src: 'The core API’s own documentation.' },
        { t: 'The required package dependencies are already installed.',  truth: 'valid',
          why: 'No downloads are needed to keep working locally.',
          src: 'A check of the installed packages against the project’s requirements.' },
        { t: 'The team has a local copy of the API documentation.',       truth: 'valid',
          why: 'Documentation can still be consulted offline.',
          src: 'The offline docs folder on a team laptop.' },
        { t: 'The cloud service has a local offline mode.',               truth: 'invalid',
          why: 'There is no offline mode — the cloud service cannot simply be switched to local.',
          src: 'Somebody’s guess about the vendor’s features.' },
        { t: 'The final demo requires every planned feature.',            truth: 'invalid',
          why: 'The demo does not need every feature, so scope can shrink.',
          src: 'A teammate’s assumption.' },
        { t: 'The team can replace the online API with a local implementation.', truth: 'valid',
          why: 'A local replacement is a workable way around the missing API.',
          src: 'The team’s own technical judgement.' },
        { t: 'The internet will probably return within one hour.',        truth: 'invalid',
          why: 'The organisers said they do not know — betting on one hour is not supported by anything.',
          src: 'A rumour at the venue.' },
      ],
      organizer: {
        notes: [
          'Core idea: dependency analysis — what does the project really need the network for?',
          'Strong plans stop waiting, replace the online API locally, drop non-essential scope, and keep a locally runnable submission.',
          'Traps: “offline mode exists”, “we need every feature”, “internet will be back soon”.',
        ],
      },
      reality: { situation: '', decision: '', outcome: '', reflection: '' },
    },
  ],
};
