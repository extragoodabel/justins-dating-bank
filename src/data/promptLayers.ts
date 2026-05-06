import type {
  FinalizedPrompt,
  PromptEvaluation,
  PromptLayers,
  PromptSeed,
  PromptSeedCore,
  StrategicRole,
} from './promptTypes'

/** Verbatim + voice patches merged into catalog seeds in `finalizePrompt` */
export const PROMPT_LAYER_PATCHES: Record<string, Partial<PromptLayers>> = {
  'key-to-my-heart': {
    sourceQuotes: ['The key to my heart is. Adventure.', 'Or trust.'],
    voiceFragments: ['Physical touch matters to me. Hugs, kisses, holding hands, all of that feels natural to me when things are good.', "I'm affectionate when I'm with someone I really care about."],
    themes: ['trust + adventure reads relational, not gimmick', 'pairs affection style with motion', 'upgrade short quotes into usable hinge line'],
  },
  'one-thing-you-should-know': {
    sourceQuotes: ['I may overthink things.', "I'm an overthinker."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'my-love-language': {
    sourceQuotes: ['Quality time and then physical touch would be number two.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'if-loving-this-is-wrong': {
    sourceQuotes: ['Running in the cold.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'you-should-not-go-out-with-me-if': {
    sourceQuotes: ["I don't want to date anyone who has kids already.", "I can't get turned on by someone who is not in shape."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'dont-hate-me-if-i': {
    sourceQuotes: ['I get too tied up with work.', 'I definitely love networking.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'what-if-i-told-you': {
    sourceQuotes: ["I'm definitely a creative person.", "I'm definitely a problem solver."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'i-geek-out-on': {
    sourceQuotes: ["I'm really big into running indoor rock climbing.", 'I actually started building legos.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'i-wont-shut-up-about': {
    sourceQuotes: ['I love health and wellness.', 'I want to see other people succeed.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'dorkiest-thing-about-me': {
    sourceQuotes: ['I know the sign language alphabet.', 'I can spell my name.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'friend-group-one-who': {
    sourceQuotes: ['Has a crazy ideas.', "I'm the first one out there."],
    voiceFragments: ["I'm the guy who actually gets on the dance floor at weddings.", 'There was a time in my life where I absolutely would have been one of the people sitting down, worrying about how I looked.'],
    themes: ['social initiation + benign chaos', 'matches dance-floor identity', 'self-aware leadership charm'],
  },
  'where-i-go-feel-myself': {
    sourceQuotes: ['I go climbing every Monday.', 'I recently started doing karaoke.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'im-in-my-element-when': {
    sourceQuotes: ["I'm always up for adventure.", "I'm right in the middle of the action."],
    voiceFragments: ["For work, I'm a television camera operator. The way I like to say it is: I put pro athletes on TV. That line usually sticks with people.", 'In the fall, I travel for NFL games, basically every weekend in a different city. In the summer, I do Reds games and FC Cincinnati.'],
    themes: ['broadcast / fitness / adventure synthesis', 'humor clause prevents pure brag', 'shows pace of actual weeks'],
  },
  'pet-thinks-about-me': {
    sourceQuotes: ["No pets actually. I'm not home enough."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'award-family-would-give': {
    sourceQuotes: ['Biggest dreamer.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'kindest-thing-someone-did': {
    sourceQuotes: ["Someone can say, hey, Justin, let's relax tonight."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'not-vacation-unless': {
    sourceQuotes: ["It's not a vacation unless we get lost."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'before-we-meet-listen': {
    sourceQuotes: ['I got a feeling.', 'I Will Survive.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'stay-up-all-night': {
    sourceQuotes: ['I love creativity.', 'I love health and wellness.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'youd-never-know-but-i': {
    sourceQuotes: ['I used to be afraid of heights.', "I'm actually an only child."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'i-go-crazy-for': {
    sourceQuotes: ['The old classic arcade game dance revolution.', 'I love adrenaline or fear facing.'],
    voiceFragments: ["The funny part is I'm not just adrenaline 24/7. I'm also a guy who builds Legos. So the energy is kind of: yes, I'll jump out of an airplane, but I'll also sit down and lock in on a Lego set like my life depends on it.", "I also love dancing. I'm the guy who actually gets on the dance floor at weddings."],
    themes: ['DDR + movement + fear-facing as one lane', 'thrill-seeker + Lego contrast = signature', 'broad enough to message, specific enough to believe'],
  },
  'dating-me-is-like': {
    sourceQuotes: ['Getting out of bed to go to your workout class.', 'You might not want to do it. But at the end of it, you realize it was the best idea you ever made.'],
    voiceFragments: ["I'm not trying to sound like every other profile that says pizza, travel, laughs, and good vibes.", "I joke about it because you kind of have to — like, yes, I'm one of those fools who runs the full marathon — but it's also something that has taught me discipline in a real way."],
    themes: ['self-deprecation + confidence in one metaphor', 'discipline / energy without sounding preachy', 'original line beats generic humor prompts'],
  },
  'life-goal-of-mine': {
    sourceQuotes: ['Save the world.', 'Fighter jet.'],
    voiceFragments: ["I'm at a stage now where I'm dating with real intention. I want marriage. I want kids. I want a family. I want to share my life with someone, not just stack achievements and adventures and then realize I built all of it alone.", 'I want to be a husband and a father. I want to leave a legacy. I want the kind of responsibility that makes me better, more selfless, more grounded.'],
    themes: ['family + legacy without sounding urgent', 'fun now / meaningful later tension', 'directional dating signal'],
  },
  'my-greatest-strength': {
    sourceQuotes: ['Dependability.', 'You can always rely on me.'],
    voiceFragments: ["I think one of my strongest relationship traits is that I'm reliable. If I care about you, you can count on me. I'm dedicated, accountable, and I'm open to feedback.", "If someone I care about says, 'Hey, this hurt me,' I'm capable of listening and trying to understand where they're coming from instead of turning it into a courtroom defense of my intentions."],
    themes: ['reliability as warmth, not LinkedIn', 'trust signal for long-game dating', 'shows up → emotional safety'],
  },
  'unusual-skills': {
    sourceQuotes: ['I know the sign language alphabet.', 'I can spell my name.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'this-year-i-want-to': {
    sourceQuotes: ['Explore new and exotic vacation spot.'],
    voiceFragments: ['What I like is that feeling of getting outside your normal routine. A good trip makes your regular life feel very far away for a minute.', "I've been to the Bahamas, Hawaii, Europe — Amsterdam and Geneva — and there are still a lot of places I want to see."],
    themes: ['travel as reset from routine — emotional not list-y', 'invites follow-up without sounding rehearsed', 'matches spontaneous-but-intentional vibe'],
  },
  'my-simple-pleasures': {
    sourceQuotes: ['Building legos.', 'Chips and guac or chips and salsa.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'typical-sunday': {
    sourceQuotes: ['Doing nothing all day and not caring.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'way-to-win-me-over': {
    sourceQuotes: ['Adventure.', 'Trust.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'most-irrational-fear': {
    sourceQuotes: ["Some days I'm still trying to figure that out."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'i-recently-discovered': {
    sourceQuotes: ['I recently gotten into yoga and pilates.', 'I recently started doing karaoke.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'random-fact-i-love': {
    sourceQuotes: ["There's something I read a long time ago.", 'Top regrets of the dying.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'i-want-someone-who': {
    sourceQuotes: ["Enjoy staying busy but isn't afraid to try new things.", 'Warm, bubbly.', 'Calm.', 'Someone who loves to build deep trust and intimacy.'],
    voiceFragments: ["I'm drawn to someone warm, bubbly, calm, and affectionate. I tend to see myself as more of the masculine/protector type in a relationship — opening doors, taking initiative, creating safety.", "I want honesty too. I don't want someone who hides what they think to keep the peace. I want a woman who can give me perspective and challenge me to grow."],
    themes: ['warmth + momentum without checklist aggression', 'support while chasing goals — reciprocal frame', 'active life compatible with intentionality', 'trust-building language over rigid filters'],
  },
  'ill-fall-for-you-if': {
    sourceQuotes: ['You pick me up off the dance floor.', "As long as she's at least open to it."],
    voiceFragments: ["Now I'd rather have fun than protect myself from looking silly.", 'I want somebody that could just run out there with me.'],
    themes: ['dance floor as chemistry / initiative test', 'playful filter that still feels kind', 'visual, memorable, specific to him'],
  },
  'ill-brag-about-you': {
    sourceQuotes: ['If you never stop learning and growing.', 'Wants to always like be trending up.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'green-flags-i-look-for': {
    sourceQuotes: ['Health conscious.', 'Open mindedness.', 'Accountability.'],
    voiceFragments: ["Fitness matters to me, both because I care about it and because it tends to reflect mindset. I'm not looking for an Olympian.", "I'm not trying to date my clone. She doesn't need to come skydiving with me. I just want openness."],
    themes: ['behaviors > vague kindness soup', 'health mindset without olympian demand', 'accountability + openness explicitly named'],
  },
  'im-looking-for': {
    sourceQuotes: ["Someone who's very supportive when you're chasing goals.", 'Someone who brings stability when life is chaotic.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'all-i-ask-is-that-you': {
    sourceQuotes: ['Be honest.', 'Keeps me accountable.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'hallmark-good-relationship': {
    sourceQuotes: ['Deep trust and intimacy.', 'Being a good listener.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'im-weirdly-attracted-to': {
    sourceQuotes: ["Someone who's very affectionate.", 'Definitely somebody on the more feminine side.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'well-get-along-if': {
    sourceQuotes: ["You're open to doing something like that.", "As long as she's at least open to it."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'non-negotiable-for-me': {
    sourceQuotes: ["I don't want to date anyone who has kids already.", "I would like to, it would be a mismatch if I went to church and my partner didn't."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'same-type-of-weird': {
    sourceQuotes: ['You run to the dance floor.', "I'm one of those fools who runs the full."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'together-we-could': {
    sourceQuotes: ['Painted town red.', 'Conquer the world.', 'Steak and karaoke on a Tuesday.'],
    voiceFragments: ['A good week with me might include Taco Tuesday at Jefferson Social, a workout or yoga class, church, something spontaneous, and one genuinely low-key night where we do absolutely nothing productive and feel great about it.', "I'll look around and see everybody sitting there waiting for someone else to go first, and I'm just like, people, what are we doing? Let's go."],
    themes: ['micro-date vignettes > abstract adventure claims', 'local ritual → playful escalation', 'social courage without performance', 'lets her picture Tuesday night, not a bucket list'],
  },
  'best-spot-in-town': {
    sourceQuotes: ['Tacos.', 'Jefferson Social.'],
    voiceFragments: ['I live right downtown at The Banks, so the Reds stadium is basically right there.', "Taco Tuesday energy at The Banks when everyone's pretending they won't order too much — that's very me."],
    themes: ['local specificity easy first date', 'low pressure but personality-forward', 'Banks / taco ritual continuity'],
  },
  'best-way-to-ask-me-out': {
    sourceQuotes: ['Just ask.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'first-round-on-me-if': {
    sourceQuotes: ['You run to the dance floor.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'what-i-order-for-table': {
    sourceQuotes: ['Chips and guac or chips and salsa.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'one-thing-id-love-to-know': {
    sourceQuotes: ['What lights you up on the weekends.', 'Why do you do what you do?'],
    voiceFragments: ["So now I'm trying to be more intentional about asking better questions. More 'why do you do what you do?' and 'what lights you up?' Less résumé review.", 'I realized that on dates, I could slip into this mode where I was being very polite, very logical, very interview-y.'],
    themes: ['emotional curiosity vs interview mode', 'weekend / identity outside work', 'conversation starter aligned with growth edge'],
  },
  'teach-me-something-about': {
    sourceQuotes: ['Calmness and stillness.', 'Planting.'],
    voiceFragments: ["I've gotten into yoga and Pilates more recently, partly because it balances out the running and partly because I like the challenge of doing things that aren't naturally in my wheelhouse.", "I'm world-class at motion and mediocre at pausing — that's the contrast I'm leaning into here."],
    themes: ['stillness vs motion — distinct Justin contrast', 'maturity without therapy jargon', 'short punchy hinge cadence'],
  },
  'same-page-about': {
    sourceQuotes: ['Marriage and family.', 'I do want to have kids of my own.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'do-you-agree-or-disagree': {
    sourceQuotes: ['Life has to be boring.', 'The best was yet to come.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'try-to-guess-this-about-me': {
    sourceQuotes: ['I used to be afraid of heights.', "I'm actually an only child."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'give-me-travel-tips': {
    sourceQuotes: ['Santorini, Greece.', 'Tokyo, Japan.', 'Australia.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'you-should-leave-a-comment-if': {
    sourceQuotes: ['You want to actually like the best was yet to come.', "You're open to doing something like that."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'friends-ask-advice-about': {
    sourceQuotes: ['Fitness.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'to-me-relaxation-is': {
    sourceQuotes: ['Doing nothing all day and not caring.'],
    voiceFragments: ['I think the best description of life with me is that it would be active, fun, and intentional, but not nonstop chaos.', "I want someone who can talk me off the ledge a little bit when I'm too wound up. Someone who can say, 'Hey, let's stay in tonight. Let's watch a movie. Let's chill.'"],
    themes: ['soft counterweight to high-motion profile', 'needs partner permission to downshift', 'humanizes discipline-heavy lifestyle'],
  },
  'i-hype-myself-up-by': {
    sourceQuotes: ['For a run.'],
    voiceFragments: ["I hype myself up by going for a run and pretending it's for mental health, not because I'm incapable of sitting still.", "Signing up for hot Pilates at 7 a.m. and then acting surprised when I'm questioning every decision I've ever made halfway through — that's very on-brand."],
    themes: ['movement as nervous-system regulation joke', 'fitness signal without flex', 'secondary humor slot candidate'],
  },
  'boundary-of-mine': {
    sourceQuotes: ["I don't want to date anyone who has kids already."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'therapy-recently-taught-me': {
    sourceQuotes: ['Do self reflection.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'biggest-risk-ive-taken': {
    sourceQuotes: ['Leaving a stable nine to five.', "That's probably scarier than any kind of skydiving."],
    voiceFragments: ["Leaving that job in 2018 was probably the biggest risk I've taken, bigger than skydiving in a lot of ways. Skydiving is over pretty quickly. Walking away from a salary and a known structure to bet on yourself? That follows you home.", "I didn't leave because I hated software. What I hated was the corporate politics, the feeling that I wasn't growing, and the sense that my life was getting smaller instead of bigger."],
    themes: ['career pivot scarier than adrenaline stunts', 'ambition + humility via joke', 'shows judgment under uncertainty'],
  },
  'never-have-i-ever': {
    sourceQuotes: ['Walked into a glass door.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'one-thing-never-again': {
    sourceQuotes: ['Pineapple on pizza.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'two-truths-and-a-lie': {
    sourceQuotes: ["I've done shark diving.", "I've done skydiving.", 'I know the sign language alphabet.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'most-spontaneous-thing': {
    sourceQuotes: ['Hopping on a plane going on adventure with no agenda.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'best-travel-story': {
    sourceQuotes: ["I've also flirted with the idea of like Antarctica.", 'I went to Europe a few years ago.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'my-biggest-date-fail': {
    sourceQuotes: ['It was too much like an interview.'],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'shower-thought': {
    sourceQuotes: ["Some days I'm still trying to figure that out."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'setup-you-guess-punchline': {
    sourceQuotes: ["I'm one of those fools who runs the full."],
    voiceFragments: ["If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.", "I'm very motivated by not wanting to get to the end of my life and feel like I played it too safe."],
    themes: ['growth-minded momentum without sounding rehearsed', 'specific beats generic dating-app cadence', 'warmth + accountability show up in how he dates now'],
  },
  'i-wish-more-people-knew': {
    sourceQuotes: ['What goes into putting an event on television.', 'People think I just show up film and go home.'],
    voiceFragments: [
      "A lot of people don't understand what goes into putting a live event on television. They think you show up, point a camera, and go home. That is not even close.",
      "If the event is at 7 p.m., I may need to be there at noon or 1 p.m. because all the gear comes off tractor trailers, the setup takes hours, things have to be tested, and you're troubleshooting constantly.",
    ],
    themes: ['invisible craft behind what viewers see', 'discipline + patience under live pressure', 'curiosity hook without leading with accolades'],
  },
  'younger-self-lgbtq-prompt': {
    sourceQuotes: ["I'm still trying to figure that out.", "I don't want to live like that."],
    voiceFragments: [
      "I remember reading about people's regrets at the end of life, and one of the big ones was not going after what they really wanted. That stuck with me.",
      "If something scares me in a way that feels meaningful, I'm interested — not because I need to be reckless, but because I've learned there's a lot on the other side of fear.",
    ],
    themes: ['fear-facing as a practiced habit', 'regret-avoidance as motivation', 'growth narrative without therapy jargon'],
  },
}

function buildWhyItWorks(valueForJustin: string, strategicRoles: StrategicRole[]): string[] {
  const bullets: string[] = [valueForJustin]
  bullets.push(
    'Pays off when you swap generic labels for one habit, place, or moment someone can picture.',
  )
  if (strategicRoles.includes('Hook')) {
    bullets.push('Front-and-center on the profile — a sharp detail earns the scroll stop.')
  } else if (strategicRoles.includes('Conversation')) {
    bullets.push('Invites chemistry when your line asks for imagination or reaction, not a résumé.')
  } else if (strategicRoles.includes('Humor')) {
    bullets.push('Room for charm or wit without needing a big “bit.”')
  } else if (strategicRoles.includes('Filter')) {
    bullets.push('Can signal standards when behaviors are concrete, not abstract virtues.')
  } else {
    bullets.push('Shows lifestyle or intent clearly when you keep one vivid through-line.')
  }
  return bullets.slice(0, 5)
}

function derivePromptEvaluation(seed: PromptSeedCore): PromptEvaluation {
  if (seed.promptEvaluation) return seed.promptEvaluation
  const whyBase = buildWhyItWorks(seed.valueForJustin, seed.strategicRoles)
  const whyItWorks =
    seed.creativeOpportunity === true
      ? [
          'Creative opportunity prompt — humor, specificity, or subversion can win here.',
          ...whyBase,
        ].slice(0, 6)
      : whyBase
  const whenItFails =
    seed.risks && seed.risks.length > 0
      ? [...seed.risks]
      : ['Reads interchangeable without contrast, story, or a Justin-specific beat.']
  return { whyItWorks, whenItFails }
}

export function finalizePrompt(seed: PromptSeed): FinalizedPrompt {
  const patch = PROMPT_LAYER_PATCHES[seed.id]
  return {
    id: seed.id,
    category: seed.category,
    prompt: seed.prompt,
    strength: seed.strength,
    redditSignal: seed.redditSignal,
    strategicRoles: seed.strategicRoles,
    valueForJustin: seed.valueForJustin,
    answers: seed.answers,
    creativeOpportunity: seed.creativeOpportunity ?? false,
    sourceQuotes: patch?.sourceQuotes ?? seed.sourceQuotes ?? [],
    voiceFragments: patch?.voiceFragments ?? seed.voiceFragments ?? [],
    themes: patch?.themes ?? seed.themes ?? [],
    promptEvaluation: derivePromptEvaluation(seed),
  }
}