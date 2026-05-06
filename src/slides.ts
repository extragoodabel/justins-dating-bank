/**
 * Workshop deck: Part 1 = discovery · Part 2 = Hinge strategy.
 * On-slide copy speaks to Justin (you) once the session is underway; speakerNotes guide any facilitator.
 */

export type SlideBlock =
  | { kind: 'lines'; items: string[]; emphasis?: boolean }
  | { kind: 'emphasis'; text: string }
  | { kind: 'small'; text: string }
  | { kind: 'footer'; text: string }
  | { kind: 'label'; text: string };

export type SlideDefinition = {
  id: string;
  title: string;
  subtitle?: string;
  blocks?: SlideBlock[];
  tagline?: string;
  speakerNotes: string;
};

export const SLIDES: SlideDefinition[] = [
  {
    id: '1-title',
    title: 'Justin · Dating profile workshop',
    subtitle:
      'We start with you—your story, what you want. Then we wire that into your Hinge profile.',
    tagline: 'Extra Good · Phase 1 — Personal Exploration',
    speakerNotes:
      'Welcome everyone. Name roles: facilitator, scribe, Justin. Set expectation: discovery first, tactics second; nothing final ships tonight. Speaker notes are for whoever runs the deck.',
  },
  {
    id: '2-arc',
    title: 'Tonight’s arc',
    blocks: [
      {
        kind: 'lines',
        emphasis: true,
        items: [
          'Part 1 · Time with you—your story and what you want in a match',
          'Part 2 · Turn what we captured into strategy for your Hinge grid',
        ],
      },
      {
        kind: 'small',
        text: 'Someone captures themes live (doc or paper). Facilitator echoes sharp lines into notes verbatim.',
      },
    ],
    speakerNotes:
      'Give rough timing: Part 1 deeper than Part 2. Justin answers aloud first; scribe types.',
  },
  {
    id: '3-ground-rules',
    title: 'How we’ll run it',
    blocks: [
      {
        kind: 'lines',
        items: [
          'You answer out loud before anyone types',
          'We chase scenes, names, sensory detail',
          'If something stays fuzzy: “When did that last happen?”',
          'Strong lines go straight into our notes',
        ],
      },
    ],
    speakerNotes:
      'Permission to pause or redirect vague answers. Substitute facilitators: keep these four beats.',
  },
  {
    id: '4-p1-open',
    title: 'Part 1 · With you',
    blocks: [
      { kind: 'label', text: 'Discovery' },
      {
        kind: 'small',
        text: 'Each slide is a conversation starter—stay until you have real examples.',
      },
    ],
    speakerNotes:
      'Say: “Before we open the app, we need raw material.” Advance only when answers feel concrete.',
  },
  {
    id: '5-self-misread',
    title: 'How others read you',
    blocks: [
      {
        kind: 'lines',
        items: [
          'What do people reliably get wrong about you?',
          'What are you like once you’re comfortable?',
          'What do close friends tease you about?',
          'Which compliments feel off because they miss the point?',
        ],
      },
    ],
    speakerNotes:
      'If Justin stalls: last time someone misread him—in dating or at work?',
  },
  {
    id: '6-partner-self',
    title: 'You as a partner',
    blocks: [
      {
        kind: 'lines',
        items: [
          'What are your strongest traits in a relationship?',
          'What habits are you still improving?',
          'How do you show affection when things are good?',
          'How do you repair after tension?',
        ],
      },
    ],
    speakerNotes:
      'Ask for one recent mini-story per trait—not labels alone.',
  },
  {
    id: '7-humor-voice',
    title: 'Humor & voice',
    blocks: [
      {
        kind: 'lines',
        items: [
          'What humor shows up when you relax?',
          'What bits or jokes keep recurring in your life?',
          'Your texts skew dry, warm, chaotic, deadpan—where?',
          'Optional: thirty-second story that shows it',
        ],
      },
    ],
    speakerNotes:
      'Optional voice memo on phone for transcription later; label with date.',
  },
  {
    id: '8-life-work',
    title: 'Life & work',
    blocks: [
      {
        kind: 'lines',
        items: [
          'One job story that always lands at a dinner table',
          'What outsiders misunderstand about your work',
          'What did a recent week actually look like?',
          'Strangest scene you’ve been in on the clock',
        ],
      },
    ],
    speakerNotes:
      'Steer toward visuals and dialogue, not titles or flex.',
  },
  {
    id: '9-values-intent',
    title: 'Values & intent',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Why partnership and family momentum matter to you now',
          'What shifted so you’re ready at this moment',
          '“Good partner” in everyday behaviors—what does that mean?',
          'Hard lines you won’t cross in dating',
        ],
      },
    ],
    speakerNotes:
      'Ground with “What does that look like on a Tuesday night?” Watch energy; pause if weighty.',
  },
  {
    id: '10-dating-snapshot',
    title: 'Dating right now',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Where are you with apps—active, returning, paused?',
          'What has recent dating surfaced for you?',
          'What should someone feel within ten seconds on your profile?',
        ],
      },
    ],
    speakerNotes:
      'Bridge into match criteria. Cap at ~3 minutes if drained.',
  },
  {
    id: '11-match-draw',
    title: 'What pulls you in',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Beyond looks—traits that pull you toward someone',
          'Personality mix that fits with yours',
          'Curiosity or ambition that matters to you',
          'Humor you need long-term',
        ],
      },
    ],
    speakerNotes:
      'Cap at three non-negotiables with examples if the list balloons.',
  },
  {
    id: '12-match-push',
    title: 'Boundaries',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Patterns that make you tap out fast',
          'Lifestyles or rhythms that clash with yours',
          'Where you want decisiveness vs flexibility',
          'If your profile is straight about who you are, who should still swipe past?',
        ],
      },
    ],
    speakerNotes:
      'Boundaries help the right people self-select in.',
  },
  {
    id: '13-lifestyle',
    title: 'Rhythm & logistics',
    blocks: [
      {
        kind: 'lines',
        items: [
          'An ordinary month—travel, home base, crunch weeks',
          'How you recharge between intense stretches',
          'Shared routines that sound appealing',
          'Overlap vs independence you want',
        ],
      },
    ],
    speakerNotes:
      'Facts here often become captions later—capture plainly.',
  },
  {
    id: '14-p1-synthesis',
    title: 'Lock what we captured',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Three words you want a stranger to sense from your profile',
          'Two scenes we can turn into prompts',
          'One plain partnership-intent line',
          'Two filters that protect your time',
          'Optional · one tension worth showing (two details that coexist)',
        ],
      },
      {
        kind: 'footer',
        text: 'Pause here · Fill together · Don’t advance until bullets exist',
      },
    ],
    speakerNotes:
      'Critical stop: photograph whiteboard if analog. Facilitator reads bullets back for alignment.',
  },
  {
    id: '15-p2-open',
    title: 'Part 2 · Your Hinge plan',
    blocks: [
      { kind: 'label', text: 'Application' },
      {
        kind: 'small',
        text: 'We map Part 1 onto what strangers actually see in the app.',
      },
    ],
    speakerNotes:
      'Optional: open Hinge on Justin’s phone; observers without the app use screenshots.',
  },
  {
    id: '16-hinge-surfaces',
    title: 'What Hinge shows',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Basics · accurate vitals; honest location; bio only if it adds a fact',
          'Written prompts · stem + short answer',
          'Voice prompts · short clip on a voice stem (where available)',
          'Polls · quick taste signal',
          'Photos · proof; captions add what the still alone cannot',
        ],
      },
    ],
    speakerNotes:
      'If voice prompts aren’t in market, skip without drama—double down on written + photos.',
  },
  {
    id: '17-theme-to-job',
    title: 'Six jobs across your grid',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Hook · specific, scroll-stopping',
          'Humor · controlled chaos',
          'Values · grounded intent',
          'Filter · taste or boundary',
          'Invitation · easy to reply',
          'Wildcard · memorable risk',
        ],
      },
      {
        kind: 'emphasis',
        text: 'Jobs cover prompts, voice, polls, captions—not six identical written prompts.',
      },
      {
        kind: 'small',
        text: 'Assign jobs first; choose stems second.',
      },
    ],
    speakerNotes:
      'Use synthesis slide: map adjectives and scenes to jobs. Written slots < six is normal.',
  },
  {
    id: '18-stem-picking',
    title: 'Pick stems in the app',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Scroll written prompts together',
          'Star stems that match what you shared in Part 1',
          'Draft three answer variants per starred stem',
          'Flag five voice stems that fit your pacing',
        ],
      },
    ],
    speakerNotes:
      'Quantity over polish; park rough answers.',
  },
  {
    id: '19-written-lane',
    title: 'Written answers',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Proper nouns; sensory anchors',
          'Short beats, not paragraphs',
          'Alternate openers on the same memory',
          'Read aloud; trim what wanders',
        ],
      },
    ],
    speakerNotes:
      'Compare to humor slide: does this sound like his texts?',
  },
  {
    id: '20-voice-lane',
    title: 'Voice prompts',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Outline: open, middle, tag',
          'Record scratch takes after outlines',
          'Keep pauses and laughs when they help',
          'Transcribe punchlines into written variants',
        ],
      },
    ],
    speakerNotes:
      'If recording tonight feels heavy: outlines now, record within 48h.',
  },
  {
    id: '21-photo-lane',
    title: 'Photos & captions',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Portrait · clear eyes',
          'Work frame · travel or craft reads quickly',
          'Friends · mid-distance social proof',
          'Captions · add facts or jokes the photo can’t carry',
        ],
      },
    ],
    speakerNotes:
      'Tie frames to Part 1 scenes so the grid feels coherent.',
  },
  {
    id: '22-poll-lane',
    title: 'Polls',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Draft ten taste binaries',
          'Both answers should sound intentional',
          'Star four that read clear at a glance',
        ],
      },
    ],
    speakerNotes:
      'Mine lifestyle + humor answers for poll topics.',
  },
  {
    id: '23-positioning',
    title: 'Internal positioning line',
    blocks: [
      {
        kind: 'lines',
        items: [
          'For [match type you described]',
          'You read as someone who [specific angle]',
          'Proof sits in [two scenes or habits]',
        ],
      },
      {
        kind: 'small',
        text: 'Team-only · shapes tone; paste to Hinge only if it still sounds human',
      },
    ],
    speakerNotes:
      'Not mandatory live; skip if time thin.',
  },
  {
    id: '24-sprint',
    title: 'Live build sprint',
    blocks: [
      {
        kind: 'lines',
        emphasis: true,
        items: [
          '15+ written fragments on named stems',
          '6+ voice outlines',
          '6+ caption concepts paired to shots',
          '10 poll pairs drafted',
        ],
      },
      {
        kind: 'footer',
        text: 'Stretch targets · if time is tight, prioritize written fragments',
      },
    ],
    speakerNotes:
      'Timer 15–20 min. Facilitator cheers partial progress; timestamp recorder peaks.',
  },
  {
    id: '25-grid-pacing',
    title: 'Order & pacing',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Scroll top-to-bottom like a cold visitor',
          'Put two easy reply hooks early',
          'Alternate heavy prompts with lighter ones',
        ],
      },
    ],
    speakerNotes:
      'Use someone else’s phone to preview if possible.',
  },
  {
    id: '26-qa',
    title: 'Quick QA',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Would this earn a specific reply?',
          'Does it sound like something you already say?',
          'Any two slots doing the same job?',
        ],
      },
    ],
    speakerNotes:
      'Duplicate job across slots: swap a stem or rewrite an ending.',
  },
  {
    id: '27-next',
    title: 'After tonight',
    blocks: [
      {
        kind: 'lines',
        items: [
          'Phase 2 · Lock stems, finalize voice, choose photos',
          'Phase 3 · Cold reads from trusted reviewers',
          'Ship V1 · Watch replies · Iterate',
        ],
      },
    ],
    speakerNotes:
      'Confirm who sends recap within 48h. Thank Justin and the room.',
  },
];
