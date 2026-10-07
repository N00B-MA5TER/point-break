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

    /* ═══════════════════════════ 04 ═══════════════════════════
       Replaced: now THE TWO WORKSHOPS. Truth values / explanations / sources are NOT filled in —
       set them live in the organizer KEY panel (or type them below). dataVersion makes the browser
       drop any progress saved for the previous problem that used this slot.   */
    {
      id: 4, num: '04', editable: true, dataVersion: 2,
      title: 'THE TWO WORKSHOPS',
      category: 'OPPORTUNITY COST',
      scenario: [
        'You are attending a **National Tech Fest** where two highly specialised workshops are scheduled at **exactly the same time**.',
        '**Workshop A — Microsoft Azure.** A specialised cloud-computing workshop conducted by industry professionals. It covers concepts and practical knowledge that are difficult to access regularly.',
        '**Workshop B — Brain Mapping & Brain Clone.** An advanced workshop on brain mapping and brain-clone technology. The subject is directly connected to your strongest personal technical interest, and is an area you have been wanting to explore more deeply.',
        'Choosing one means **completely missing the other**.',
        'You have **10 minutes** before the workshops begin.',
      ],
      constraints: [
        { v: '4 HRS',  l: 'Each workshop' },
        { v: 'SAME',   l: 'Start and end time', hot: true },
        { v: 'ONE',    l: 'You can attend only one', hot: true },
        { v: '10 MIN', l: 'Before they begin' },
      ],
      situationLabel: 'The constraint — both workshops',
      situation: [
        'Are 4 hours long',
        'Start and end at exactly the same time',
        'Require participants to remain for the complete session',
        'Do not allow participants to leave and return midway',
        'Cannot be attended online or recorded',
        'Cannot be attended simultaneously',
      ],
      challenge: {
        lead: 'You have **10 minutes** to make your decision. You must choose **exactly one** workshop.',
        emph: 'You cannot simply say “I am more interested in this one.” **Build a decision-making framework** using the information available.',
        label: 'Your presentation must explain:',
        items: [
          'What factors matter most to your decision?',
          'How would you compare the two opportunities?',
          'Which information are you relying on?',
          'Which information would you want to verify?',
          'What opportunity are you giving up by choosing your workshop?',
          'What is your final choice?',
          'Why is your decision rational even though the other workshop may also be valuable?',
        ],
      },
      brk: {
        l1: 'Not all information can be trusted.',
        l2: 'Some of the statements you were given are **valid**. Some are **invalid**. Some are **irrelevant** to the decision. You do not know which ones.',
        l3: 'Your original decision may have been based on information that is no longer reliable.',
      },
      adapt: {
        lead: 'You now have **7 minutes** to reconsider your decision. You may keep your choice, change it, change the factors you prioritize, or reweight the evidence.',
        prompts: [
          'What information did we originally rely on?',
          'Which of that information can we still trust?',
          'Did the reliability of the information change our decision?',
          'What are we giving up by choosing this workshop?',
          'Why is our final decision better than the alternative?',
          'What would have to change for us to choose the other workshop?',
        ],
        final: '',
        note: 'Explain how the **reliability of the information** changed your decision — not just that something turned out to be false.',
      },
      srcOptions: ['Direct information from the workshop organizers', 'Information from the workshop instructor', 'Information from another participant', 'Personal assumption', 'Previously observed information'],
      statements: [
        { t: 'The Azure workshop will cover technologies that are currently widely used in industry.', truth: null, why: '', src: '' },
        { t: 'The Brain Mapping & Brain Clone workshop is conducted by researchers working directly in the field.', truth: null, why: '', src: '' },
        { t: 'The Azure workshop may be offered again at other major tech events.', truth: null, why: '', src: '' },
        { t: 'The Brain Mapping & Brain Clone workshop is rarely available to students.', truth: null, why: '', src: '' },
        { t: 'The Azure workshop includes a practical component where participants work with Azure services.', truth: null, why: '', src: '' },
        { t: 'The Brain Mapping workshop may provide opportunities to interact directly with researchers and ask questions about their work.', truth: null, why: '', src: '' },
        { t: 'Your current career plans are more closely aligned with software / cloud engineering than neuroscience or brain-computer research.', truth: null, why: '', src: '' },
        { t: 'You have already attended introductory cloud-computing workshops before, but you have never attended a workshop focused specifically on brain mapping or brain-clone technology.', truth: null, why: '', src: '' },
      ],
      organizer: {
        notes: [
          'TRUTH TABLE NOT SET. Decide which statements are VALID, INVALID or IRRELEVANT and set them in the KEY panel before the lifelines are used.',
          'The key is NOT whether the team picks Azure or Brain Mapping. It is whether they show: Information → Evaluation → Prioritisation → Decision → Break → Investigation → Reassessment → Adaptation.',
          'A strong team can say: “This was our decision with the information we had. After discovering that information X was unreliable, our decision changed because…” — rather than changing their answer just because something was revealed false.',
          'Tests: decision frameworks, opportunity cost, information evaluation, personal prioritisation, short- vs long-term thinking, uncertainty, adaptability, telling preference apart from reasoning, strategic use of the lifelines.',
          'SOURCE CHECK for this problem reveals one of: Direct information from the workshop organizers · Information from the workshop instructor · Information from another participant · Personal assumption · Previously observed information (never whether it is true).',
          'Timing: 10 minutes for the decision, 7 minutes for the adaptation.',
        ],
      },
      reality: { situation: '', decision: '', outcome: '', reflection: 'Knowing what you know now, would you make the same decision? Why?' },
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
    /* ═══════════════════════════ 06 ═══════════════════════════
       Based on a real incident. TRUTH VALUES, EXPLANATIONS AND SOURCES ARE NOT FILLED IN on purpose:
       they must come from the club members who lived it. Set them live in the organizer KEY panel
       (SHOW/EDIT controls) — or type them here (truth: 'valid' | 'invalid' | 'irrelevant'; why; src).   */
    {
      id: 6, num: '06', editable: true,
      title: 'THE DESTINATION WITHOUT THE FINAL',
      category: 'DECISION UNDER UNCERTAINTY',
      scenario: [
        'You are participating in a **National-Level Hackathon** with two stages: **Round 1 — online** (PPT, working prototype, demo video) and **Round 2 — offline finale in Delhi** for shortlisted teams.',
        'Your team is based in **Durgapur**, and travelling to Delhi takes **almost an entire day**.',
        'Because the Round 1 results are expected very close to the offline round, your team decides to **book train tickets in advance**.',
        'The team boards the train. You are now approximately **one hour away from Delhi**.',
        'Then, the Round 1 result arrives. Your team has **NOT been shortlisted** for the offline finale.',
        'You have already travelled almost the entire distance. Your team now needs to decide what to do next.',
      ],
      constraints: [
        { v: '~1 HR',  l: 'Away from Delhi', hot: true },
        { v: 'NOT',    l: 'Shortlisted for the finale', hot: true },
        { v: '~1 DAY', l: 'Travelled already' },
        { v: 'BOOKED', l: 'Train tickets' },
        { v: 'LIMITED', l: 'Money remaining' },
        { v: 'NONE',   l: 'Accommodation arranged' },
      ],
      situation: [
        'Your train tickets are already booked',
        'You have limited money remaining',
        'No accommodation arranged, and no personal contacts in Delhi who can provide it',
        'You do not know whether the organizers will help non-shortlisted teams',
        'You do not know whether you can enter the venue',
        'The team is exhausted after almost a day of travel',
      ],
      challenge: {
        lead: 'You have **10 minutes**. Using only the information currently available, create a plan for the team’s **next 24 hours**.',
        label: 'Your plan must answer:',
        items: [
          'What do you do during the next 10 minutes?',
          'Who do you contact first?',
          'What information do you need to verify?',
          'Do you continue to Delhi or change your travel plan?',
          'How do you handle accommodation?',
          'How do you protect the remaining money?',
          'Is there still anything valuable the team can gain from going to Delhi?',
          'What is your fallback if your preferred plan fails?',
        ],
        emph: 'Your team must distinguish between **confirmed information, possible opportunities, and assumptions** before deciding what to do.',
        produceLabel: 'The team should produce:',
        produce: ['A primary plan', 'A contingency plan', 'The information they would try to verify before committing further money'],
      },
      brk: {
        l1: 'You now discover that not all of the information provided to you can be trusted.',
        l2: 'Some statements are **confirmed facts**. Some are **only possibilities**. Some are **assumptions or irrelevant** to the decision.',
        l3: 'You now have 3 lifelines to determine which information you should rely on.',
      },
      adapt: {
        lead: 'You now have **7 minutes** to reconsider your original plan.',
        prompts: [
          'What information did we originally rely on?',
          'Which assumptions are now questionable?',
          'Which information do we still trust?',
          'What changed in our decision?',
          'What is our new primary plan?',
          'What is our new contingency plan?',
        ],
        final: 'Do you still continue to Delhi?',
        note: 'Defend the decision with the information you have now — **not** the money or time already spent.',
      },
      srcOptions: ['Direct information from the organizers', 'Information from another participant', 'Team assumption', 'Previously observed information', 'Unverified claim'],
      statements: [
        { t: "There is a possibility that another shortlisting round could happen if some finalist teams are unable to attend.", truth: null, why: '', src: '' },
        { t: "Non-finalist teams may be allowed to attend certain parts of the event as audience members.", truth: null, why: '', src: '' },
        { t: "Other teams from the online round will be present in Delhi, and some may be open to connecting with your team.", truth: null, why: '', src: '' },
        { t: "Mentors, judges, and industry professionals are expected to be present at the event.", truth: null, why: '', src: '' },
        { t: "Non-finalist teams may get opportunities to showcase or discuss their projects informally during the event.", truth: null, why: '', src: '' },
        { t: "None of these opportunities has been confirmed for your team.", truth: null, why: '', src: '' },
        { t: "Staying in Delhi will require additional spending on accommodation, food, and local travel.", truth: null, why: '', src: '' },
        { t: "You still have approximately one hour before reaching Delhi and can contact organizers or other participants before making the final decision.", truth: null, why: '', src: '' },
      ],
      organizer: {
        notes: [
          'TRUTH TABLE NOT SET. This problem is based on a real incident — take the real facts and decide which statements are VALID, INVALID or IRRELEVANT. Set them in the KEY panel before the lifelines are used.',
          'SOURCE CHECK for this problem reveals one of: ' + 'Direct information from the organizers · Information from another participant · Team assumption · Previously observed information · Unverified claim (it does not reveal whether the statement is true).',
          'The Break wording talks about “confirmed facts / possibilities / assumptions or irrelevant”. In the interface a statement is still revealed as VALID, INVALID or IRRELEVANT — decide which label each one gets (for example a possibility that did not happen = INVALID, an unconfirmed one that did = VALID).',
          'Statements 1–5 are possible opportunities; 6 says none is confirmed; 7 is a cost; 8 is what the team can still do before deciding.',
          'Timing: 10 minutes for the initial plan, 7 minutes for the adaptation.',
          'Judge whether the team decides from the information it has — not from money or time already spent (sunk cost).',
        ],
      },
      reality: { situation: '', decision: '', outcome: '', reflection: 'Knowing what you know now, would you make the same decision?' },
    },

  ],
};
