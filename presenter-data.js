/**
 * ════════════════════════════════════════════════════════════
 * POINT BREAK — presenter-data.js
 * Source of truth: "POINT BREAK — Final Problem Bank" (PDF)
 * ════════════════════════════════════════════════════════════
 *
 * Every problem has two layers:
 *
 *   PUBLIC   (problem / twist)   → shown on the projector
 *   PRIVATE  (organizer)         → only inside the organizer drawer
 *
 * Team number and team name are NOT stored here. The organizer
 * assigns them live in the presenter (saved to localStorage).
 *
 * Public visuals are built from "blocks" (see renderBlocks in
 * presenter.js): stats · cards · versus · hero · flow · bars ·
 * chips · note · battery · split.
 *
 * Numbering follows the PDF body. The quick-reference table in the
 * PDF numbers a few problems differently (see README note in chat);
 * problem 13 is a pointer to problem 10, so it is not repeated.
 */

window.PB = {

  event: {
    name: 'POINT BREAK',
    tagline: 'THE ECLIPSE CHANGES EVERYTHING.',
    motto: 'THINK. PIVOT. SURVIVE.',
    by: 'ECLIPSE · DIATM',
    when: '6TH & 7TH OCTOBER 2026 · 2:00 PM ONWARDS',
    where: 'LAB 225',
  },

  /* Card positions. Labels are what you see on the board; order = which problem sits in each slot.
     (Editing a card's number in the presenter swaps it with whoever holds that number.) */
  positions: ['01','02','03','04','05','06','07','08','09','10','11','12','14','15'],
  primaryCount: 12,
  order: [1, 2, 3, 4, 5, 6, 7, 8, 14, 10, 11, 12, 9, 15],

  judging: {
    categories: [
      { k: 'und', label: 'Understanding the Problem', max: 10 },
      { k: 'rea', label: 'Reasoning & Trade-offs',    max: 10 },
      { k: 'ada', label: 'Adaptation to Twist',       max: 10 },
      { k: 'com', label: 'Communication',             max: 10 },
    ],
    principle:
      'Do not judge “Did they find the organizer’s intended solution?” Judge: did they understand the constraints, make a defensible decision, identify what their decision depended on, and intelligently adapt when that dependency changed?',
    rules: [
      'The problem statement must be complete — if a fact affects the solution, it is in the statement.',
      'No hidden rules during judging. A solution that is technically possible under the stated rules is valid, even if it differs from the intended direction.',
      'Twists attack dependencies — not just “less money” or “less time”.',
    ],
    flow: [
      'Stage 1 — Give only the participant problem. No key, no twist. Let the team lock their solution.',
      'Stage 2 — Team presents: real problem, solution, why, assumptions, risks. Record their initial dependency.',
      'Stage 3 — Reveal the twist. No hints. Team explains what is invalid, what remains useful, what changes, new risks, revised solution.',
    ],
  },


  /* ══════════════════════════════════════════════════════════════
     PROBLEM STEPS — the full participant statement, split into
     2–3 calm screens. **double asterisks** = highlighted key facts.
     Block types: lead · sub · rows · list · table · cols · viz · foot
     The final screen (THE CHALLENGE) is built from problem.challenge.
  ══════════════════════════════════════════════════════════════ */
  steps: {
    1: [
      { k: 'THE SITUATION', lead: 'Your team has a project presentation tomorrow at **10:00 AM**.', sub: 'There are **four** team members:',
        rows: [
          { k: 'A', t: 'Has written most of the code but has not prepared the presentation.' },
          { k: 'B', t: 'Created most of the slides but does not understand the implementation well.' },
          { k: 'C', t: 'Understands the technical implementation but has not reviewed the final slides.' },
          { k: 'D', t: 'Contributed very little and only understands the basic idea of the project.' },
        ]},
      { k: 'THE PRESENTATION', lead: 'The presentation must contain:', list: ['Problem statement', 'Approach', 'Implementation', 'Live / demo explanation', 'Results'], twoCol: true, num: true,
        foot: 'You have **3 hours tonight** to prepare.' },
    ],
    2: [
      { k: 'THE SITUATION', lead: 'Your team has developed an ML model for identifying patients at **high risk** of a disease.', sub: 'Your test dataset contains:',
        table: { head: ['Class', 'Patients'], rows: [['Low Risk', '900'], ['High Risk', '100'], ['Total', '1000']], total: true } },
      { k: 'THE RESULT', lead: 'The model correctly classifies **970 out of 1000** patients. Therefore, its reported accuracy is **97%**.',
        viz: { t: 'hero', n: '97%', l: 'Reported accuracy', small: true },
        foot: 'Your demonstration is tomorrow, in front of a **hospital review committee** that will decide whether to use the model on real patients. You may make **one major change** to the model or evaluation before the demonstration.' },
    ],
    15: [
      { k: 'THE FACTORY', lead: 'A factory runs **24 hours a day** with **2 production lines** of hot moulding machines.',
        sub: 'A fire on one line can spread to the other.',
        foot: 'Normal operation naturally produces:', list: ['Temperature fluctuations', 'Visible smoke', 'Air-pressure changes'], listAfter: true },
      { k: 'THE GOAL', lead: 'Detect danger **at least 5 minutes before a fire starts**.', sub: 'The system must:',
        list: ['Trigger an alarm', 'Automatically shut down the affected line', 'Work without continuous human monitoring'] },
      { k: 'WHAT YOU CAN BUY', lead: 'Total budget: **₹2,00,000**.', sub: 'Only these items exist:',
        table: { head: ['Item', 'Price'], rows: [
          ['Control & alarm unit (whole factory) · required', '₹50,000'],
          ['Temperature sensors · per line', '₹10,000'],
          ['Smoke detectors · per line', '₹10,000'],
          ['Air-pressure sensors · per line', '₹15,000'],
          ['Electrical current monitor · per line', '₹30,000'],
          ['Gas (CO) sensors · per line', '₹25,000'],
        ] } },
    ],
    4: [
      { k: 'THE CLINIC', lead: 'A small emergency clinic has:', viz: { t: 'stats', items: [
        { n: '1', l: 'Doctor' }, { n: '1', l: 'Nurse' }, { n: '1', l: 'Oxygen cylinder' }, { n: '1', l: 'Ambulance' },
      ]}, foot: 'The ambulance can transport **only one patient** per trip. The hospital is **20 minutes** away. Three patients arrive simultaneously.' },
      { k: 'THE PATIENTS', rows: [
        { k: 'A', t: 'Severe injury. Currently stable. Requires surgery within **60 minutes**.' },
        { k: 'B', t: 'Severe breathing difficulty. Requires continuous oxygen. Without oxygen, condition becomes critical within **15 minutes**.' },
        { k: 'C', t: 'Minor injury. Requires transportation to another hospital. Can safely wait **90 minutes**.' },
      ], foot: 'There is **no additional oxygen cylinder** available.' },
    ],
    5: [
      { k: 'THE SITUATION', lead: 'Your team has **18 hours** remaining in a hackathon.', sub: 'Your current project has:',
        list: ['A working core prototype', 'A weak UI', 'A partially working backend', 'One major unfinished feature', 'No finalized demonstration flow'] },
      { k: 'THE CRITERIA', lead: 'The published judging criteria are:', table: { head: ['Criterion', 'Weight'], rows: [['Functionality', '40%'], ['UX', '30%'], ['Feature completeness', '30%']] },
        foot: 'You have enough time to fully complete **only two** of the following:', list: ['Improve the UI', 'Complete the backend', 'Finish the major feature', 'Build a polished demo flow'], listAfter: true, num: true, twoCol: true },
    ],
    6: [
      { k: 'THE ORDERS', lead: 'You manage deliveries from a warehouse. It is **4:00 PM**. You have **one vehicle**.',
        cols: [
          { tag: 'CUSTOMER A', lines: ['Needs **3 medical devices**', 'Deadline: **5:30 PM**', 'Travel time from warehouse: **30 minutes**'] },
          { tag: 'CUSTOMER B', lines: ['Needs **1 emergency medical device**', 'Deadline: **6:00 PM**', 'Travel time from warehouse: **20 minutes**'] },
        ]},
      { k: 'THE VEHICLE', lead: 'The vehicle:', list: ['Can carry only one customer’s complete order at a time', 'Must return to the warehouse before taking another order', 'Takes the same amount of time returning as going', 'Loading each order takes **5 minutes**'] },
    ],
    7: [
      { k: 'THE OFFERS', lead: 'You are a college student looking for an internship. You have received two offers.',
        cols: [
          { tag: 'OFFER A — HIGH PAY', lines: ['**₹40,000/month**', '**3-month** internship', '**40 hours/week**', 'Work primarily involves **routine implementation tasks**', 'Work follows instructions from senior developers', 'Limited exposure to system design and technical decision-making', 'Completion certificate provided', 'Company is well known in the industry'] },
          { tag: 'OFFER B — HIGH LEARNING', lines: ['**₹10,000/month**', '**6-month** internship', '**30 hours/week**', 'Work directly with a small engineering team', 'Design and implement features yourself', 'Participate in code reviews and technical discussions', 'Work on a real production system', 'Regular mentorship from a senior engineer', 'Company is relatively unknown'] },
        ], tight: true },
      { k: 'YOUR SITUATION', lead: 'You can accept **only one** offer.',
        list: ['You do **not** know whether either company will offer you a full-time position after the internship', 'You do **not** have a financial emergency that requires you to choose the higher-paying option'] },
    ],
    8: [
      { k: 'THE SITUATION', lead: 'Your team is conducting an experiment for a college project.', sub: 'You have **one day remaining** before your final submission.',
        viz: { t: 'versus', left: { n: '7', l: 'Successful', tone: 'cy' }, right: { n: '1', l: 'Failed', tone: 'pur' } },
        foot: 'Your first **8 trials** produced 7 successful results and 1 failed result.' },
      { k: 'THE CONDITIONS', lead: 'The seven successful trials were conducted under the same controlled laboratory conditions.', sub: 'The failed trial was conducted under the same procedure.',
        foot: 'Your team currently believes the failure was an **anomaly**.' },
    ],
    9: [
      { k: 'THE WORKSHOP', lead: 'Your college club is conducting a **60-minute workshop** for **80 students**.', sub: 'The planned schedule is:',
        rows: [
          { k: '15', t: 'minutes — Introduction' },
          { k: '30', t: 'minutes — Main demonstration' },
          { k: '15', t: 'minutes — Hands-on activity' },
        ], wide: true },
      { k: 'THE RESOURCES', lead: 'Available resources:', list: ['1 main speaker', '2 volunteers', '1 laptop', '1 projector'],
        foot: 'The main speaker is the **only person who knows the complete demonstration**. The workshop begins in **20 minutes**.' },
    ],
    10: [
      { k: 'THE SITUATION', lead: 'You are going on a **7-day college trip**.', sub: 'Your phone is currently at **100% battery**. You have:',
        list: ['No charger', 'No power bank', 'No laptop', 'No access to an electrical outlet'],
        foot: 'Your phone must remain usable throughout the trip.' },
      { k: 'THE BATTERY', lead: 'The following battery consumption figures are **fixed**:',
        table: { head: ['Activity', 'Battery consumption'], rows: [
          ['1 hour video', '10%'], ['1 hour gaming', '15%'], ['1 hour GPS navigation', '8%'],
          ['1 hour video call', '12%'], ['1 hour messaging', '2%'], ['12 hours idle with network active', '4%'] ] },
        foot: 'You may change how you use the phone, but you cannot change these figures.' },
    ],
    11: [
      { k: 'THE WORKSHOP', lead: 'Your college club is organizing a **2-hour technical workshop** for **100 registered students**.', sub: 'You have:',
        list: ['1 venue with a maximum capacity of **120 people**', '**100** chairs', '**5** volunteers', '1 speaker', '1 projector', '1 microphone'], twoCol: true },
      { k: 'THE SCHEDULE & RULES', lead: 'The workshop consists of:',
        rows: [ { k: '20', t: 'minutes — Introduction' }, { k: '60', t: 'minutes — Main Workshop' }, { k: '40', t: 'minutes — Hands-on Activity' } ], wide: true,
        foot: 'Rules:', list: ['Nobody may stand during the workshop', 'The venue can never contain more than **120 people**', 'The workshop must happen in the given venue', 'You cannot add volunteers, equipment, chairs, or another venue', 'The workshop cannot be moved online'], listAfter: true, twoCol: true },
    ],
    12: [
      { k: 'THE SITUATION', lead: 'Your team is participating in a competition.', sub: 'You have **10 minutes** remaining. Your project is **80% complete**.',
        viz: { t: 'hero', n: '10:00', l: 'Minutes remaining', small: true, bar: 80 }, foot: 'You have two choices:' },
      { k: 'THE OPTIONS',
        cols: [
          { tag: 'OPTION A — SUBMIT NOW', lines: ['The existing system is stable', 'One major feature is incomplete', 'The system has already been tested'] },
          { tag: 'OPTION B — ATTEMPT THE FINAL FEATURE', lines: ['The final feature is likely to improve the project substantially', 'Implementing it may break the existing system', 'You will have only 10 minutes to implement and test it'] },
        ], foot: 'If the existing system breaks, you may not be able to recover before submission.' },
    ],
    14: [
      { k: 'THE SITUATION', lead: 'You have an exam tomorrow at **10:00 AM**. There are **10 topics**, studied in four ranges.',
        table: { head: ['Topics', 'Expected marks', 'Current preparation', 'Time to fully prepare'], rows: [['1–3', '20', '80%', '5 HRS'], ['4–6', '30', '40%', '5 HRS'], ['7–8', '30', '20%', '5 HRS'], ['9–10', '20', '0%', '4 HRS']], hotCols: [3] } },
      { k: 'THE LIMIT', lead: 'You have **8 hours** available for studying.', sub: 'You cannot study all topics thoroughly.',
        foot: '“Time to fully prepare” is how long a range takes to go from 0% to 100%. Preparation grows evenly with study time.' },
    ],
    3: [
      { k: 'THE FACTORY', lead: 'The factory has three **sequential production stages**: Stage A → Stage B → Stage C.',
        sub: 'Each stage can process a **maximum number of units per day**, as follows:',
        table: { head: ['Stage', 'Maximum processing capacity'], rows: [['Stage A', '1,200 units/day'], ['Stage B', '1,000 units/day'], ['Stage C', '1,100 units/day']] } },
      { k: 'THE ORDER', lead: 'A customer has ordered **2800 finished units**.', sub: 'The order must be delivered in **3 days**. The factory:',
        list: ['Cannot add workers', 'Cannot add machines', 'Can store unfinished units between production stages', 'Cannot store units outside the factory'] },
    ],
  },

  /* ══════════════════════════════════════════════════════════════
     LOCK-IN — what the organizer records at THE SOLUTION so the team
     cannot change it after the twist. A free-text "in brief" note is
     always added. type: choice | multi | text
  ══════════════════════════════════════════════════════════════ */
  locks: {
    1:  [],
    2:  [ { k: 'ready', label: 'Ready to present?', type: 'choice', options: ['Yes — present as is', 'No — change first'] }, { k: 'change', label: 'The one major change (if any)', type: 'text' } ],
    15: [ { k: 'items', label: 'Items bought', type: 'multi', options: ['Temperature', 'Smoke', 'Air-pressure', 'Electrical current', 'Gas (CO)'] }, { k: 'lines', label: 'Which lines', type: 'text' } ],
    4:  [ { k: 'oxygen', label: 'Oxygen goes to', type: 'choice', options: ['Patient A', 'Patient B', 'Patient C'] }, { k: 'amb', label: 'Ambulance carries first', type: 'choice', options: ['Patient A', 'Patient B', 'Patient C'] }, { k: 'doc', label: 'Doctor stays with', type: 'choice', options: ['Patient A', 'Patient B', 'Patient C'] } ],
    5:  [ { k: 'areas', label: 'Two areas prioritized', type: 'multi', max: 2, options: ['Improve the UI', 'Complete the backend', 'Finish the major feature', 'Polished demo flow'] } ],
    6:  [ { k: 'first', label: 'Delivered first', type: 'choice', options: ['Customer A', 'Customer B'] } ],
    7:  [ { k: 'offer', label: 'Offer chosen', type: 'choice', options: ['Offer A', 'Offer B'] }, { k: 'opt', label: 'Optimizing for', type: 'text' } ],
    8:  [ { k: 'acts', label: 'What they will do', type: 'multi', options: ['Continue collecting data', 'Repeat the experiment', 'Remove the failed result', 'Present the existing results', 'Change the experimental approach'] } ],
    9:  [ { k: 'who', label: 'Who does what', type: 'text' } ],
    10: [ { k: 'plan', label: 'Daily battery plan', type: 'text' } ],
    11: [ { k: 'inside', label: 'Students inside at a time', type: 'text' }, { k: 'flow', label: 'Seating / flow', type: 'text' } ],
    12: [ { k: 'opt', label: 'Option chosen', type: 'choice', options: ['Option A — submit now', 'Option B — attempt the final feature'] } ],
    14: [ { k: 'topics', label: 'Topics prioritized', type: 'multi', options: ['Topics 1–3', 'Topics 4–6', 'Topics 7–8', 'Topics 9–10'] }, { k: 'hours', label: 'Hours per topic', type: 'text' } ],
    3: [ { k: 'plan', label: 'Production plan (units per stage per day)', type: 'text' } ],
  },


  problems: [

    /* ─────────────────────────────── 1 ─────────────────────────────── */
    {
      id: 1, kind: 'primary',
      title: 'THE PRESENTATION FROM HELL',
      skill: 'Team coordination', attacks: 'Knowledge dependency',
      problem: {
        challenge: { label: 'Your plan must specify:', lead: 'Create a preparation plan for the next 3 hours.', items: ['What each member does', 'How the presentation is divided', 'How the team handles the demo'] },
      },
      twist: {
        lead: 'Five minutes before the presentation, the professor announces:',
        quote: 'I will randomly select one member of each team. That person will deliver the entire presentation and answer all questions alone.',
        facts: ['You have 10 minutes before entering the room.'],
        blocks: [
          { t: 'stats', items: [
            { n: '1 OF 4', l: 'Randomly selected', hot: true },
            { n: '10 MIN', l: 'Before entering the room' },
          ]},
        ],
        challenge: 'Adapt your preparation plan.',
        recap: 'One random member will present everything and answer all questions alone.',
      },
      organizer: {
        core: 'Knowledge distribution',
        tests: ['Knowledge distribution', 'Risk management', 'Team coordination', 'Identification of single points of failure', 'Adaptability'],
        strong: [
          'The strongest teams realize the original preparation should not merely divide the presentation into four isolated sections.',
          'Ensure every member understands the complete project.',
          'Conduct a rapid mock presentation.',
          'Make everyone capable of explaining the core architecture.',
          'Prepare common Q&A questions.',
          'Ensure the demo can be explained by anyone.',
        ],
        accept: ['“We train all four members to present the entire project.”'],
        reject: ['“We will simply choose the member who knows everything.” — The professor chooses randomly.'],
        notes: [
          'After the twist, teams that already distributed knowledge effectively have a major advantage.',
          'There is no requirement that the original presentation be divided equally.',
        ],
        calc: [],
      },
    },

    /* ─────────────────────────────── 2 ─────────────────────────────── */
    {
      id: 2, kind: 'primary',
      title: 'THE PERFECT MODEL THAT DOESN’T WORK',
      skill: 'Evidence evaluation', attacks: 'Metric interpretation',
      problem: {
        challenge: { label: '', lead: 'Decide:', items: ['Whether the model is ready to present', 'Whether the model needs to be changed', 'What claims you can responsibly make'] },
      },
      twist: {
        lead: 'You discover that the real-world population is approximately:',
        factsLast: true,
        facts: ['You cannot collect a new dataset before the demonstration.'],
        blocks: [
          { t: 'table', table: { head: ['Class', 'Your test dataset', 'Real-world population'], rows: [['Low Risk', '900', '100'], ['High Risk', '100', '900']], hot: true } },
        ],
        challenge: 'Reconsider your decision.',
        recap: 'Real-world population: 100 low-risk, 900 high-risk. No new dataset possible.',
      },
      organizer: {
        core: 'Accuracy can be misleading when class distribution changes.',
        tests: [],
        strong: [
          'Discussing precision / recall.',
          'Looking at the confusion matrix.',
          'Considering sensitivity for high-risk patients.',
          'Adjusting the classification threshold.',
          'Re-evaluating the model rather than blindly reporting 97%.',
          'Explicitly limiting claims.',
        ],
        accept: ['Keeping the model — if they properly explain the limitation and propose an appropriate evaluation / mitigation strategy.'],
        reject: [],
        notes: [
          'AUDIENCE IS FIXED: a hospital review committee deciding whether to use the model on real patients — so teams cannot pick a convenient audience (research paper, hackathon panel, etc.).',
          'There is NO requirement to throw away the model.',
          'The twist attacks the assumption: “97% accuracy means the model is excellent.”',
        ],
        calc: [],
      },
    },

    /* ─────────────────────────────── 3 ─────────────────────────────── */
    {
      id: 3, kind: 'primary',
      title: 'THE PRODUCTION LINE',
      skill: 'Bottleneck analysis', attacks: 'Capacity collapse',
      problem: {
        challenge: { label: 'Explain:', lead: 'Create a production plan that delivers the complete order within 3 days.', items: ['How many units each stage should produce each day', 'Where unfinished units should be stored', 'How the bottleneck should be managed'] },
      },
      twist: {
        lead: 'At the beginning of Day 2, Stage B develops a problem.',
        facts: [
          'Its capacity drops to 600 units/day for the remainder of the order.',
          'No additional workers or machines can be added.',
        ],
        blocks: [
          { t: 'table', table: { head: ['Stage', 'Maximum processing capacity'], rows: [['Stage A', '1,200 units/day'], ['Stage B', '1,000 → 600 units/day'], ['Stage C', '1,100 units/day']], hotCols: [1] } },
        ],
        challenge: 'Adapt the production plan.',
        recap: 'Stage B drops from 1000 to 600 units/day from Day 2 onward.',
      },
      organizer: {
        core: 'Bottleneck analysis and adaptation.',
        tests: [],
        strong: [
          'The team must be allowed to identify that the order has become mathematically impossible under the stated constraints.',
          'Producing as much as possible.',
          'Prioritizing the most important units if the order can be split.',
          'Negotiating a revised delivery schedule.',
          'Informing the customer immediately.',
          'Explaining exactly why the original deadline is no longer feasible.',
        ],
        accept: [],
        reject: [
          'Do NOT reward invented capacity.',
          'Extra machines.',
          'Extra workers.',
          'Overtime beyond the stated daily capacity.',
          'Outsourcing — it is not listed as an available resource.',
        ],
        notes: ['Key insight: recognize the new bottleneck and communicate the consequence rather than pretending the constraint does not exist.'],
        calc: [
          { h: 'Initial', lines: [
            'Stage B is the bottleneck: A 1200, B 1000, C 1100 per day.',
            'System produces up to 1000 finished units/day.',
            '1000 × 3 = 3000 units → the 2800-unit order is feasible.',
          ]},
          { h: 'After twist (B = 600/day from Day 2)', lines: [
            'Day 1: 1000', 'Day 2: 600', 'Day 3: 600',
            'Total: 2200 units — continuing the original plan cannot meet the order.',
          ]},
        ],
      },
    },

    /* ─────────────────────────────── 4 ─────────────────────────────── */
    {
      id: 4, kind: 'primary',
      title: 'THE THREE PATIENTS',
      skill: 'Prioritization', attacks: 'Deadline / resource dependency',
      problem: {
        challenge: { label: '', lead: 'Decide:', items: ['Who receives oxygen?', 'Who receives the ambulance?', 'How the doctor and nurse are allocated', 'What happens to the remaining patients'] },
      },
      twist: {
        lead: 'The hospital informs you:',
        quote: 'The surgical team required for Patient A will be unavailable after 45 minutes.',
        facts: [],
        blocks: [
          { t: 'stats', items: [
            { n: '45 MIN', was: '60', l: 'Patient A surgical window', hot: true },
            { n: '15 MIN', l: 'Patient B oxygen dependency' },
            { n: '90 MIN', l: 'Patient C can wait' },
          ]},
        ],
        challenge: 'Reconsider your allocation.',
        recap: 'The surgical team for Patient A is only available for 45 more minutes.',
      },
      organizer: {
        core: 'Prioritization under competing deadlines.',
        tests: [],
        strong: [
          'Teams should explicitly compare: immediate medical urgency.',
          'Hard deadlines.',
          'Resource dependency.',
          'Consequences of delaying each patient.',
        ],
        accept: [],
        reject: ['Introducing medical facts that are not stated. The problem is decision-making using the supplied information, not medical expertise.'],
        notes: [],
        calc: [
          { h: 'Variables after the twist', lines: [
            'A: 45-minute surgical window after twist.',
            'B: 15-minute oxygen dependency.',
            'C: 90-minute transport window.',
            'Ambulance: one patient.',
          ]},
        ],
      },
    },

    /* ─────────────────────────────── 5 ─────────────────────────────── */
    {
      id: 5, kind: 'primary',
      title: 'THE HACKATHON PIVOT',
      skill: 'Strategic prioritization', attacks: 'Evaluation mechanism',
      problem: {
        challenge: { label: '', lead: 'Choose the two areas you will prioritize and explain why.', items: [] },
      },
      twist: {
        lead: 'The organizers announce:',
        quote: 'There will be no presentation or Q&A.',
        facts: [
          'Each team receives 5 minutes.',
          'Judges will directly use the submitted product themselves.',
          'Judges will evaluate the actual product through hands-on interaction.',
        ],
        blocks: [
          { t: 'stats', items: [
            { n: '5 MIN', l: 'Per team', hot: true },
            { n: 'HANDS-ON', l: 'Judges use the product', hot: true },
          ]},
        ],
        challenge: 'Adapt your priorities.',
        recap: 'No presentation or Q&A — judges use your product hands-on for 5 minutes.',
      },
      organizer: {
        core: 'Understanding what is actually being evaluated.',
        tests: [],
        strong: [
          'The initial solution should use the published criteria.',
          'After the twist, teams should reconsider whether UI/UX becomes more important.',
          'Demo preparation becomes less important.',
          'Product stability becomes more important.',
          'Completing visible functionality becomes more valuable.',
        ],
        accept: [],
        reject: [],
        notes: [
          'Do NOT require one exact pair of priorities.',
          'Judge whether the team understands how the evaluation mechanism changes the value of each task.',
        ],
        calc: [],
      },
    },

    /* ─────────────────────────────── 6 ─────────────────────────────── */
    {
      id: 6, kind: 'primary',
      title: 'THE WRONG DELIVERY',
      skill: 'Logistics', attacks: 'Consequence priority',
      problem: {
        challenge: { label: '', lead: 'Create a delivery sequence that gets both orders delivered before their deadlines.', foot: 'Explain why your sequence is preferable to the alternative.', items: [] },
      },
      twist: {
        lead: 'At 4:15 PM, Customer B calls.',
        quote: 'The emergency device is now required by 4:50 PM.',
        facts: [
          'If it is not delivered by 4:50 PM, the patient’s treatment cannot proceed.',
          'There is no replacement device available.',
        ],
        blocks: [
          { t: 'stats', items: [
            { n: '4:50 PM', was: '6:00 PM', l: 'Customer B deadline', hot: true },
          ]},
        ],
        challenge: 'Adapt your plan.',
        recap: 'Customer B’s emergency device is now due by 4:50 PM. No replacement exists.',
      },
      organizer: {
        core: 'Prioritization under changing consequences.',
        tests: [],
        strong: [
          'Initial problem contains a genuine strategic choice — both orderings meet both deadlines.',
          'After the twist, B must be delivered before 4:50, so B becomes the immediate priority.',
        ],
        accept: [],
        reject: ['Inventing: another vehicle, another driver, a second warehouse, a third-party courier. Those are not available.'],
        notes: [],
        calc: [
          { h: 'A first — both deadlines met', lines: [
            '4:00–4:05 loading', '4:05–4:35 travel', '4:35 delivery', '4:35–5:05 return',
            '5:05–5:10 loading B', '5:10–5:30 delivery B',
          ]},
          { h: 'B first — both deadlines also met', lines: [
            '4:00–4:05 loading', '4:05–4:25 travel', '4:25 delivery', '4:25–4:45 return',
            '4:45–4:50 loading A', '4:50–5:20 delivery A',
          ]},
        ],
      },
    },

    /* ─────────────────────────────── 7 ─────────────────────────────── */
    {
      id: 7, kind: 'primary',
      title: 'THE JOB OFFER',
      skill: 'Decision-making under uncertainty', attacks: 'Incomplete information',
      problem: {
        challenge: { label: 'Explain:', lead: 'Choose **one** offer.', items: ['Which offer you choose', 'Why you chose it', 'What you gain from your decision', 'What you give up', 'What your decision is ultimately optimizing for'] },
      },
      twist: {
        lead: 'After you announce your decision, you receive new information.',
        cols: [
          { tag: 'OFFER A', lines: ['The company informs you:', '**“Interns cannot work on production systems or attend architecture/design meetings.”**', 'Your work will remain limited to the implementation tasks described earlier.'] },
          { tag: 'OFFER B', lines: ['The senior engineer who was supposed to mentor you is **leaving the company one month after you join**.', 'No replacement mentor will be assigned.', 'Everything else about the internship remains unchanged.'] },
        ],
        blocks: [],
        challenge: 'Reconsider your choice.',
        fixHead: ['YOUR ORIGINAL DECISION', 'WAS BASED ON INCOMPLETE INFORMATION.'],
        fixNote: 'You may keep your original choice or switch to the other offer. But you must explain: **why does the new information change — or not change — your decision?**',
        recap: 'Offer A: no production work or design meetings. Offer B: your mentor leaves after one month and is not replaced.',
      },
      organizer: {
        core: 'Decision-making under uncertainty, opportunity cost, and changing assumptions.',
        tests: ['Key trade-off — Offer A: more money + shorter commitment + stronger company brand.', 'Key trade-off — Offer B: more learning + greater ownership + production exposure + mentorship.', 'There is NO predetermined correct choice.'],
        strong: [
          'Identification of opportunity cost.',
          'Short-term vs. long-term value.',
          'Recognition of assumptions.',
          'Clear decision criteria.',
          'Understanding of what the team is optimizing for.',
          'Ability to reassess after the twist.',
          'Logical justification for either staying with or changing the original decision.',
        ],
        accept: ['Keeping the original choice or switching — both can be strong.'],
        reject: ['Assuming “Learning is always better than money.”', 'Assuming “₹40,000 is obviously the better offer.”'],
        notes: ['The important question is whether the team can defend its priorities and adapt when the information changes.'],
        calc: [],
      },
    },

    /* ─────────────────────────────── 8 ─────────────────────────────── */
    {
      id: 8, kind: 'primary',
      title: 'THE EXPERIMENT',
      skill: 'Scientific reasoning', attacks: 'Evidence quality',
      problem: {
        challenge: { label: '', lead: 'Decide what you will do:', items: ['Continue collecting data', 'Repeat the experiment', 'Remove the failed result', 'Present the existing results', 'Change the experimental approach'], foot: 'Explain your reasoning.' },
      },
      twist: {
        lead: 'You discover that:',
        facts: ['You cannot collect additional data before the submission deadline.'],
        blocks: [
          { t: 'versus',
            left:  { n: '7', l: 'Successful trials', sub: 'Ideal laboratory conditions', tone: 'cy' },
            right: { n: '1', l: 'Failed trial', sub: 'Conditions most similar to the actual environment where the system will be used', tone: 'amb' },
          },
        ],
        challenge: 'Reconsider your conclusion.',
        recap: 'The failed trial was the one closest to real-world conditions. No more data can be collected.',
      },
      organizer: {
        core: 'Evidence quality and confirmation bias.',
        tests: [],
        strong: [
          'Giving greater weight to the realistic failure.',
          'Explicitly separating laboratory performance from real-world performance.',
          'Reporting the failure rather than hiding it.',
          'Limiting the project’s claims.',
          'Explaining the risk of deployment.',
        ],
        accept: ['Choosing to proceed — if they justify the risk.'],
        reject: ['Deleting the failed result simply because it is inconvenient.'],
        notes: [],
        calc: [],
      },
    },

    /* ─────────────────────────────── 9 ─────────────────────────────── */
    {
      id: 9, kind: 'primary',
      title: 'THE SPEAKER WHO CANNOT SPEAK',
      skill: 'Redundancy', attacks: 'Single-person dependency',
      problem: {
        challenge: { label: 'Your plan must explain:', lead: 'Create an execution plan that ensures the workshop can still run if a minor problem occurs.', items: ['Who does what', 'How the demonstration is handled', 'How the volunteers are used', 'How the audience is managed'] },
      },
      twist: {
        lead: 'Two minutes before the workshop begins…',
        quote: 'The main speaker completely loses their voice.',
        facts: [
          'The speaker cannot speak at all.',
          'The speaker can communicate through text.',
          'The workshop cannot be postponed.',
          'The laptop and projector are working normally.',
        ],
        blocks: [],
        challenge: 'Adapt the workshop plan.',
        recap: 'The only person who knows the demo has no voice — and the workshop starts in 2 minutes.',
      },
      organizer: {
        core: 'Dependency management and redundancy.',
        tests: [],
        strong: [
          'Transfer speaking responsibility to volunteers.',
          'Use the speaker as a text-based director.',
          'Use prepared slides / instructions.',
          'Simplify or restructure the demonstration.',
          'Turn the session into a guided hands-on workshop.',
        ],
        accept: [],
        reject: ['Solutions that depend on the speaker suddenly recovering.'],
        notes: ['The speaker cannot speak. The volunteers CAN speak. The laptop / projector work normally.'],
        calc: [],
      },
    },

    /* ─────────────────────────────── 10 ─────────────────────────────── */
    {
      id: 10, kind: 'primary',
      title: 'THE PHONE THAT HAS TO LAST',
      skill: 'Resource optimization', attacks: 'Fixed new requirement',
      problem: {
        challenge: { label: '', lead: 'Design a 7-day phone-use strategy that maximizes the chance that the phone remains usable for the entire trip.', foot: 'Explain what you will prioritize and what you will stop doing.', items: [] },
      },
      twist: {
        lead: 'On Day 3, you receive the following requirement:',
        quote: 'For the remaining 4 days, the phone must provide exactly 2 hours of GPS navigation every day.',
        facts: ['This requirement cannot be changed.'],
        blocks: [
          { t: 'stats', items: [
            { n: '4 DAYS', l: 'Remaining' },
            { n: '2 HRS', l: 'GPS navigation, every day', hot: true },
          ]},
        ],
        challenge: 'Recalculate your strategy.',
        recap: 'Exactly 2 hours of GPS every day for the remaining 4 days. Non-negotiable.',
      },
      organizer: {
        core: 'Resource optimization and adaptation.',
        tests: [],
        strong: ['Recognize the twist adds a large fixed consumption, then decide how aggressively to reduce ALL other usage.'],
        reward: [
          'Calculate the constraint.',
          'Identify essential vs optional usage.',
          'Preserve emergency functionality.',
          'Adapt quantitatively rather than simply saying “use the phone less.”',
        ],
        accept: [],
        reject: ['Arguing about 5G vs 4G, screen brightness, background apps, battery health, phone model or network strength — intentionally abstracted away. The battery model is complete.'],
        notes: [],
        calc: [
          { h: 'Additional fixed consumption', lines: ['4 days × 2 hours GPS × 8% = 64% battery'] },
        ],
      },
    },

    /* ─────────────────────────────── 11 ─────────────────────────────── */
    {
      id: 11, kind: 'primary',
      title: 'THE EVENT THAT IS TOO SUCCESSFUL',
      skill: 'Operations', attacks: 'Capacity assumption',
      problem: {
        challenge: { label: 'Your plan must specify:', lead: 'You have **30 minutes** before the event begins. Create a concrete operational plan for the **100 expected students**.',
          items: ['How the 100 students will be seated', 'How the 5 volunteers will be assigned', 'How registration and entry will be managed', 'How the speaker, projector, and microphone will be managed', 'How students will be organized for the hands-on activity'],
          foot: 'You have **10 minutes** to present your plan.' },
      },
      twist: {
        lead: '10 minutes before the workshop begins, **500 registered students arrive**.',
        blocks: [
          { t: 'flow', items: [ { k: 'EXPECTED', v: '100' }, { k: 'ARRIVE', v: '500', hot: true } ] },
        ],
        unchanged: 'Nothing else has changed: max 120 at a time · 100 chairs · 5 volunteers · nobody may stand · no new venue, equipment or volunteers.',
        constraints: { label: 'The constraints have not changed:', items: ['Maximum occupancy: 120', '100 chairs', '5 volunteers', '1 speaker', '1 projector', '1 microphone', '2-hour event', 'No additional venue', 'No additional equipment or volunteers', 'Nobody may stand'] },
        newChallenge: { lead: 'Adapt your original plan.', label: 'Your revised plan must specify:',
          items: ['How many students will be inside the venue at any given time', 'How the 500 students will be managed', 'What students outside the venue will do', 'How the 5 volunteers will manage the new situation', 'How you will keep the venue within its 120-person capacity at all times'],
          foot: 'Your team must present the revised plan and explain **which parts of your original plan you changed and why**.' },
        challenge: 'Adapt your original plan.',
        compact: true,
        recap: '500 registered students arrive 10 minutes before the start. Every constraint is unchanged.',
      },
      organizer: {
        core: 'Scaling an operation when the original capacity assumption fails.',
        tests: [],
        strong: [
          'Multiple batches.',
          'Repeated sessions.',
          'Rotating participants.',
          'Live relay to another nearby permitted space — ONLY if the team explicitly creates / identifies such a space within the stated environment.',
          'Condensing or restructuring content.',
          'Volunteer-based participant management.',
        ],
        accept: [],
        reject: ['“Everyone can just stand.” — Standing is not allowed. The occupancy limit is also a hard constraint.'],
        notes: ['The initial solution depends on 100 attendees fitting into a 120-person venue. The twist destroys that assumption.', 'Schedule is 20 + 60 + 40 minutes. Nothing may be added: no volunteers, equipment, chairs or venue.'],
        calc: [],
      },
    },

    /* ─────────────────────────────── 12 ─────────────────────────────── */
    {
      id: 12, kind: 'primary',
      title: 'THE LAST TEN MINUTES',
      skill: 'Risk management', attacks: 'New evaluation information',
      problem: {
        challenge: { label: 'Your team must justify the decision using:', lead: 'Choose Option A or B.', items: ['Probability of success', 'Impact of failure', 'Remaining time', 'Value of the missing feature'] },
      },
      twist: {
        lead: 'The organizers announce:',
        quote: 'During judging, every team will be tested specifically on the functionality represented by the unfinished feature.',
        facts: ['You still have 10 minutes.'],
        blocks: [
          { t: 'hero', n: '10:00', l: 'Still remaining', small: true },
        ],
        challenge: 'Reconsider your decision.',
        recap: 'Judges will test exactly the functionality of the unfinished feature. Still 10 minutes.',
      },
      organizer: {
        core: 'Risk management and decision-making under new information.',
        tests: [],
        strong: [
          'Teams should identify the trade-off.',
          'Option A: high probability of submitting something stable; guaranteed weakness in an important area.',
          'Option B: higher potential reward; higher probability of total failure.',
        ],
        accept: ['Still choosing A — if they argue the probability of breaking the entire system is too high.'],
        reject: [],
        notes: [
          'The twist changes the expected value of completing the feature, because judges will specifically test it.',
          'There is still NO automatic requirement to choose B.',
          'What matters: does the team UPDATE ITS REASONING after learning what the judges will test?',
        ],
        calc: [],
      },
    },

    /* ───────────────────────────── BACKUP ───────────────────────────── */
    {
      id: 14, kind: 'backup',
      title: 'THE EXAM PAPER',
      skill: 'Optimization', attacks: 'Changed information',
      problem: {
        challenge: { label: 'Your team must explain:', lead: 'Create a study strategy that maximizes your expected exam score.', items: ['Which topics you study', 'Which topics you deprioritize', 'Why your strategy gives the highest expected return'] },
      },
      twist: {
        lead: 'At 9:00 PM, the professor announces a change:',
        facts: ['You now have only 5 hours remaining.', 'The time needed to fully prepare each range has not changed.'],
        blocks: [
          { t: 'table', table: { head: ['Topics', 'New expected marks', 'Current preparation', 'Time to fully prepare'], rows: [['1–3', '20', '80%', '5 HRS'], ['4–6', '30', '40%', '5 HRS'], ['7–8', '30 → 10', '20%', '5 HRS'], ['9–10', '20 → 40', '0%', '4 HRS']], hotCols: [1] } },
        ],
        challenge: 'Adapt your study strategy.',
        recap: 'Marks changed: topics 7–8 drop to 10, topics 9–10 rise to 40. Preparation and study times are unchanged. Only 5 hours left.',
      },
      organizer: {
        core: 'Resource allocation under changing information.',
        tests: [],
        strong: [
          'Compare current preparation.',
          'Compare marks available.',
          'Compare the time each range still needs.',
          'Compare the marginal benefit (marks gained per hour) of each block.',
        ],
        accept: [],
        reject: [],
        notes: [
          'Percentages are abstract preparation levels and time needed is given. Assume preparation grows evenly with study time.',
          'Participants are not expected to know exact subject difficulty, learning curves, individual topic difficulty, or actual exam psychology.',
          'The twist changes the value of previously prioritized topics. The team should recalculate rather than defend the original plan emotionally.',
        ],
        calc: [
          { h: 'Before the twist (8 hours)', lines: [
            'Hours still needed to reach 100%: 1–3 → 1 h · 4–6 → 3 h · 7–8 → 4 h · 9–10 → 4 h  (12 h in total, so 4 h must be skipped)',
            'Marks gained per hour: 1–3 → 4 · 4–6 → 6 · 7–8 → 6 · 9–10 → 5',
            'Best use: 4–6 (3 h) + 7–8 (4 h) + 1 h on 9–10 → +18 +24 +5 = +47 marks',
          ]},
          { h: 'After the twist (5 hours)', lines: [
            'Marks gained per hour: 1–3 → 4 · 4–6 → 6 · 7–8 → 2 (now 10 marks) · 9–10 → 10 (now 40 marks)',
            'Best use: 9–10 (4 h) + 1 h on 4–6 → +40 +6 = +46 marks',
          ]},
        ],
      },
    },
    {
      id: 15, kind: 'backup',
      title: 'THE FACTORY FIRE',
      skill: 'Systems thinking', attacks: 'Reliability of evidence',
      problem: {
        challenge: { label: 'Explain:', lead: 'Design a fire-detection system **within the budget**.',
          items: ['What you buy, and for which line', 'What you watch to decide a fire is coming', 'What happens when it triggers'] },
      },
      twist: {
        lead: 'Testing reveals that…',
        quote: 'Normal operation can produce the same temperature, smoke and pressure patterns as the early stages of a real fire.',
        facts: ['These three signals cannot reliably distinguish between normal operation and an actual fire.', 'Items you already bought **cannot be returned**. Your budget has not changed.'],
        blocks: [
          { t: 'cards', cols: 3, items: [
            { tag: 'UNRELIABLE', title: 'TEMPERATURE', lines: [], tone: 'amb' },
            { tag: 'UNRELIABLE', title: 'SMOKE',       lines: [], tone: 'amb' },
            { tag: 'UNRELIABLE', title: 'PRESSURE',    lines: [], tone: 'amb' },
          ]},
        ],
        challenge: 'Adapt your system.',
        recap: 'Temperature, smoke and pressure can no longer reliably tell normal operation from a real fire. Money already spent cannot be recovered.',
      },
      organizer: {
        core: 'Reliable decision-making requires reliable evidence.',
        tests: [],
        strong: [
          'Adding a different kind of evidence (electrical current, gas).',
          'Correlating independent signals instead of trusting one.',
          'Multi-stage verification before shutting a line down.',
          'Fail-safe shutdown.',
        ],
        accept: ['Any combination from the price list that fits ₹2,00,000 — including keeping some of the original three signals as one input among several.'],
        reject: [
          'Anything over ₹2,00,000 or not on the price list.',
          'Leaving out the control & alarm unit (required).',
          'Asking for a refund after the twist.',
        ],
        notes: ['The small budget and short list exist so the twist cannot be dodged with unlimited spending. After the twist, money already spent on temperature / smoke / pressure is gone.'],
        calc: [
          { h: 'Budget', lines: [
            'Control & alarm unit ₹50,000 (required) → ₹1,50,000 left',
            'All three original signals on both lines = 2 × (10 + 10 + 15) = ₹70,000',
            'Everything on both lines would be 2 × (10 + 10 + 15 + 30 + 25) = ₹1,80,000 — over budget, so something must be skipped',
          ]},
        ],
      },
    },
  ],
};
