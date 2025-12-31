"use client";

import { useEffect, useMemo, useState } from "react";

const writingPrompts = {
  "Narrative Clarity": {
    description:
      "Sharpen story flow, connective tissue, and cinematic sensory detail so your reader never loses the thread.",
    prompts: [
      "Write the opening scene of a memoir where a single object unlocks a complicated memory. Use all five senses before revealing what the object means.",
      "Draft a vignette that moves between past and present in under 350 words. Use transitional phrases that make the time shifts unmistakable.",
      "Describe a place you know by heart, but reveal its true significance only in the last two sentences.",
      "Capture a conversation between two characters where one avoids answering the question. Use subtext and gesture to keep tension on the page.",
    ],
    moves: [
      "Map cause and effect in a quick bullet outline before drafting.",
      "Introduce a pivot sentence that reorients time, space, or tension.",
      "Swap two sentences and re-read. Keep whichever ordering heightens momentum.",
    ],
  },
  "Persuasive Impact": {
    description:
      "Build arguments that balance credibility, emotion, and logic. End every piece with a memorable nudge to action.",
    prompts: [
      "Write a 250-word letter convincing a skeptical city council to invest in a community garden. Use one data point, one vivid story, and one call-to-action.",
      "Argue for a controversial workspace change. Anticipate and address three likely objections without sounding defensive.",
      "Draft a manifesto paragraph for a grassroots movement. Fuse urgency with empathy so readers feel invited rather than cornered.",
      "Persuade a time-strapped executive to sponsor a new initiative using the 'problem → vision → payoff' structure.",
    ],
    moves: [
      "Lead with context the reader already agrees with before introducing your stance.",
      "Use one memorable statistic per section and translate it into human stakes.",
      "Close with a verb that signals the next concrete step you want the reader to take.",
    ],
  },
  "Creative Voice": {
    description:
      "Experiment with tone, metaphor, and rhythm until your writing feels unmistakably yours.",
    prompts: [
      "Rewrite a nursery rhyme as speculative fiction. Keep the plot recognizable but surprise with texture and tone.",
      "Describe an everyday routine using an extended metaphor that runs for at least three sentences.",
      "Draft a micro-essay (under 200 words) that alternates between sentence fragments and long lyrical lines.",
      "Tell a tiny story where every paragraph begins with the same word but moves the emotion somewhere new.",
    ],
    moves: [
      "Swap every third adjective with something sensory or unexpected.",
      "Read the draft aloud and mark places where the rhythm stalls—revise only those lines.",
      "Collect three images from your phone and weave them into the piece without naming them directly.",
    ],
  },
  "Concise Synthesis": {
    description:
      "Compress research and complex ideas into crisp takeaways that respect the reader’s time.",
    prompts: [
      "Summarize a 30-minute podcast into a 180-word executive brief with three actionable insights.",
      "Explain a technical workflow to a non-expert teenager. Replace jargon with analogy while keeping accuracy intact.",
      "Turn messy meeting notes into a follow-up email that balances appreciation, decisions, and next steps.",
      "Condense a 1,000-word article into a social post thread of five sentences max without losing nuance.",
    ],
    moves: [
      "Write the conclusion first, then distill the body so every sentence earns its place.",
      "Group ideas into threes; label each cluster with a punchy headline.",
      "Replace weak verbs plus adverbs with a single precise verb wherever possible.",
    ],
  },
} satisfies Record<
  string,
  {
    description: string;
    prompts: readonly string[];
    moves: readonly string[];
  }
>;

type FocusKey = keyof typeof writingPrompts;

const focusKeys = Object.keys(writingPrompts) as FocusKey[];

const microDrills = [
  {
    title: "Rhythm Remix",
    duration: "6 min",
    description:
      "Highlight one paragraph and rewrite every sentence so lengths alternate short/long. Note how pacing shifts meaning.",
    steps: [
      "Count words per sentence and mark with S or L.",
      "Adjust phrasing until rhythm feels intentional.",
      "Keep the version that carries emotion cleanly.",
    ],
  },
  {
    title: "Specificity Sprint",
    duration: "4 min",
    description:
      "Circle vague words (thing, stuff, very). Replace each with concrete nouns or verbs that a camera could film.",
    steps: [
      "List all vague words in the margin.",
      "Brainstorm two sharper replacements per word.",
      "Choose the version that surprises you most.",
    ],
  },
  {
    title: "Objection Drill",
    duration: "7 min",
    description:
      "Write a paragraph from the point of view of your most skeptical reader. Let them poke holes, then revise to answer them.",
    steps: [
      "Draft the objection without defending yourself.",
      "Underline the most compelling critique.",
      "Revise original piece to dissolve that concern.",
    ],
  },
];

const reflectionPrompts = [
  "Which sentence carried the most weight today? Why did it land?",
  "What part of your process felt awkward—and what does that awkwardness teach you to practice next?",
  "Where did you surprise yourself with specificity, and how can you replicate that move tomorrow?",
  "How would a reader with half your context interpret this piece differently?",
];

const growthSignals = [
  {
    title: "Precision",
    description:
      "Replace filler and hedge words with exact verbs, nouns, and sensory anchors.",
  },
  {
    title: "Momentum",
    description:
      "Keep sentence flow varied so the eye glides. Trim or split anything that drags beyond 28 words.",
  },
  {
    title: "Audience Alignment",
    description:
      "Track objections, questions, and emotional beats your reader will feel—and answer them before they arise.",
  },
  {
    title: "Voice Confidence",
    description:
      "Let one stylistic risk live in every draft, even if you scale it back. Practice makes originality habitual.",
  },
];

const fillerWords = [
  "actually",
  "just",
  "really",
  "very",
  "maybe",
  "so",
  "perhaps",
  "quite",
  "literally",
  "kind of",
  "sort of",
  "in order to",
  "in terms of",
];

const positiveTone = [
  "achieve",
  "brilliant",
  "confident",
  "delight",
  "elevate",
  "fresh",
  "glow",
  "inspired",
  "joy",
  "momentum",
  "progress",
  "solid",
  "support",
  "transform",
  "vibrant",
];

const negativeTone = [
  "afraid",
  "broken",
  "confused",
  "doubt",
  "fail",
  "frustrated",
  "hard",
  "problem",
  "stress",
  "tired",
  "weak",
  "worried",
  "stuck",
  "risk",
  "block",
];

type ToneSnapshot = {
  label: string;
  score: number;
  confidence: number;
  explanation: string;
};

type WritingAnalysis = {
  words: number;
  sentences: number;
  avgSentenceLength: number;
  readingTime: number;
  readability: number;
  fillerCount: number;
  uniqueWordRatio: number;
  tone: ToneSnapshot;
  flaggedSentences: string[];
  suggestions: string[];
};

function escapeRegExp(pattern: string) {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countSyllables(word: string) {
  const cleaned = word
    .toLowerCase()
    .replace(/[^a-z]+/g, "")
    .replace(/e\b/, "");

  if (!cleaned) return 0;

  const vowelGroups = cleaned.match(/[aeiouy]+/g);
  if (!vowelGroups) return 1;

  const count = vowelGroups.length;
  return count > 0 ? count : 1;
}

function detectTone(words: string[]): ToneSnapshot {
  if (words.length === 0) {
    return {
      label: "Neutral foundation",
      score: 0,
      confidence: 0,
      explanation:
        "Add more emotional or evaluative language to help the agent gauge tone.",
    };
  }

  const positives = words.filter((word) => positiveTone.includes(word)).length;
  const negatives = words.filter((word) => negativeTone.includes(word)).length;
  const magnitude = positives + negatives;
  const score = magnitude === 0 ? 0 : (positives - negatives) / magnitude;

  let label = "Balanced";
  if (score >= 0.35) label = "Optimistic";
  if (score >= 0.65) label = "Uplifting";
  if (score <= -0.35) label = "Cautious";
  if (score <= -0.65) label = "Urgent / Risk-Focused";

  let explanation = "Balanced emotional register. Keep layering purposeful tone.";
  if (score >= 0.35) {
    explanation = "Optimistic tone detected. Anchor upbeat claims with concrete proof.";
  }
  if (score <= -0.35) {
    explanation =
      "Caution-heavy tone. Make space for solutions so readers leave with agency.";
  }

  return {
    label,
    score,
    confidence: Math.min(1, magnitude / Math.max(6, words.length / 4)),
    explanation,
  };
}

function analyzeWriting(text: string): WritingAnalysis {
  const sentences =
    text
      .replace(/\s+/g, " ")
      .match(/[^.!?]+[.!?]?/g)
      ?.map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0) ?? [];

  const words =
    text
      .toLowerCase()
      .match(/[a-zA-Z']+/g)
      ?.map((word) => word.replace(/'+/g, "'")) ?? [];

  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = words.length;
  const syllableCount = words.reduce(
    (total, word) => total + countSyllables(word),
    0,
  );

  const fillerCount = fillerWords.reduce((total, filler) => {
    const regex = new RegExp(`\\b${escapeRegExp(filler)}\\b`, "gi");
    return total + (text.match(regex)?.length ?? 0);
  }, 0);

  const avgSentenceLength =
    wordCount === 0 ? 0 : Math.round((wordCount / sentenceCount) * 10) / 10;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const readability =
    wordCount === 0
      ? 0
      : Math.round(
          (206.835 -
            1.015 * (wordCount / sentenceCount) -
            84.6 * (syllableCount / wordCount)) *
            10,
        ) / 10;

  const uniqueWords = new Set(words.filter((word) => word.length > 3));
  const uniqueWordRatio =
    wordCount === 0 ? 0 : Math.round((uniqueWords.size / wordCount) * 1000) / 10;

  const flaggedSentences = sentences.filter((sentence) => {
    const wordsInSentence = sentence.match(/[a-zA-Z']+/g)?.length ?? 0;
    return wordsInSentence > 28;
  });

  const tone = detectTone(words);

  const suggestions: string[] = [];

  if (wordCount < 80) {
    suggestions.push(
      "Add more texture—aim for at least 120 words so the agent can surface deeper patterns.",
    );
  }

  if (avgSentenceLength > 22) {
    suggestions.push(
      "Several sentences run long. Break complex thoughts into two parts to keep momentum.",
    );
  }

  if (readability < 55 && readability !== 0) {
    suggestions.push(
      "Readability dips below 55. Swap abstract nouns for active verbs and trim stacked clauses.",
    );
  }

  if (uniqueWordRatio < 45 && wordCount > 0) {
    suggestions.push(
      "Vocabulary repeats. Introduce fresh imagery or analogies to differentiate key points.",
    );
  }

  if (fillerCount > 2) {
    suggestions.push(
      "Filler and hedge words appear often. Replace them with deliberate verbs or delete entirely.",
    );
  }

  if (tone.score <= -0.35) {
    suggestions.push(
      "Tone leans skeptical. Add a solution-oriented paragraph so readers leave with clarity.",
    );
  }

  if (flaggedSentences.length === 0 && wordCount > 80) {
    suggestions.push(
      "Sentence pacing looks balanced—now experiment with a deliberate rhythm pattern to craft voice.",
    );
  }

  return {
    words: wordCount,
    sentences: sentences.length,
    avgSentenceLength,
    readingTime,
    readability,
    fillerCount,
    uniqueWordRatio,
    tone,
    flaggedSentences,
    suggestions,
  };
}

function percentageLabel(value: number) {
  if (value >= 80) return "Excellent";
  if (value >= 60) return "Strong";
  if (value >= 40) return "Emerging";
  return "Opportunity";
}

function formatReadability(score: number) {
  if (score === 0) return "—";
  if (score >= 80) return `${score} (grade 5-6 ease)`;
  if (score >= 60) return `${score} (grade 7-8 balance)`;
  if (score >= 30) return `${score} (college-level density)`;
  return `${score} (expert-level density)`;
}

export default function Home() {
  const [focus, setFocus] = useState<FocusKey>("Narrative Clarity");
  const [promptIndex, setPromptIndex] = useState(() =>
    Math.floor(Math.random() * writingPrompts["Narrative Clarity"].prompts.length),
  );
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setPromptIndex(
      Math.floor(Math.random() * writingPrompts[focus].prompts.length),
    );
  }, [focus]);

  const regeneratePrompt = () => {
    const options = writingPrompts[focus].prompts;
    if (options.length === 1) {
      setPromptIndex(0);
      return;
    }

    let next = Math.floor(Math.random() * options.length);
    while (next === promptIndex) {
      next = Math.floor(Math.random() * options.length);
    }
    setPromptIndex(next);
  };

  const analysis = useMemo(() => analyzeWriting(draft), [draft]);

  const prompt = writingPrompts[focus].prompts[promptIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pt-12 md:pt-16">
        <header className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.8)] backdrop-blur">
          <p className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Practice Architect
          </p>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Writerly Agent: your daily partner for sharper, braver writing.
            </h1>
            <p className="max-w-3xl text-lg text-slate-300 sm:text-xl">
              Choose a focus area, draft inside the studio, and let the agent
              surface rhythm, tone, and clarity signals. Rotate through targeted
              drills and reflections to build a consistent, leveled-up writing habit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {focusKeys.map((key) => (
              <button
                key={key}
                onClick={() => setFocus(key)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-transform ${
                  focus === key
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          <p className="max-w-2xl text-sm text-slate-400">
            {writingPrompts[focus].description}
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.75fr,1.1fr]">
          <section className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white sm:text-xl">
                    Focus Prompt
                  </h2>
                  <p className="text-sm text-slate-400">
                    Use this as your launch point. Keep the intent, remix the execution.
                  </p>
                </div>
                <button
                  onClick={regeneratePrompt}
                  className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-200 transition-all hover:-translate-y-0.5 hover:bg-emerald-500/20"
                >
                  Regenerate
                </button>
              </div>
              <p className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-sm leading-relaxed text-slate-200 sm:text-base">
                {prompt}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-emerald-200">
                {writingPrompts[focus].moves.map((move) => (
                  <span
                    key={move}
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1"
                  >
                    {move}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white sm:text-xl">
                    Draft Studio
                  </h2>
                  <p className="text-sm text-slate-400">
                    Drop your draft below. The agent reads in real-time and nudges you toward sharper choices.
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                  {analysis.words} words
                </span>
              </div>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                spellCheck
                placeholder="Start writing with momentum. Keep sentences purposeful, take stylistic risks, and revise on the fly."
                className="min-h-[320px] w-full rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-base text-slate-200 shadow-inner outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Readability
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatReadability(analysis.readability)}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Aim for 60–75 for general audiences; dip under 55 when writing for experts only.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Sentence Flow
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {analysis.avgSentenceLength} words
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Mix sentence lengths to create rhythm; flag anything over 28 words for trimming.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Vocabulary Freshness
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {analysis.uniqueWordRatio}% • {percentageLabel(analysis.uniqueWordRatio)}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    A high ratio means you are varying language. Swap repeated nouns for imagery.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Tone Snapshot
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {analysis.tone.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {analysis.tone.explanation}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6">
              <h3 className="text-lg font-semibold text-emerald-200">
                Agent Feedback
              </h3>
              <p className="text-sm text-emerald-100/80">
                Prioritize the top actions to strengthen clarity, pacing, and style.
              </p>
              <ul className="mt-4 space-y-3 text-sm text-emerald-100">
                {analysis.suggestions.length === 0 ? (
                  <li className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    Keep drafting—add more words for deeper analysis or play with rhythm to test new stylistic moves.
                  </li>
                ) : (
                  analysis.suggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
                    >
                      {suggestion}
                    </li>
                  ))
                )}
              </ul>
              {analysis.flaggedSentences.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
                    Sentences to tighten
                  </p>
                  <ul className="space-y-2 text-sm text-emerald-50/90">
                    {analysis.flaggedSentences.map((sentence) => (
                      <li
                        key={sentence}
                        className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3"
                      >
                        {sentence}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-white">Session Blueprint</h2>
              <p className="mt-2 text-sm text-slate-400">
                Follow the guided flow to stretch both craft and confidence.
              </p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    stage: "01 Warm Up",
                    duration: "5 min",
                    focus: "Name your reader, clarify what they need, set a bold promise.",
                  },
                  {
                    stage: "02 Draft Sprint",
                    duration: "15 min",
                    focus:
                      "Write without stopping. Mark gaps with brackets instead of pausing to research.",
                  },
                  {
                    stage: "03 Revise with Intention",
                    duration: "10 min",
                    focus:
                      "Run one pass for structure, one for voice, one for specificity. Stop once each goal improves.",
                  },
                ].map((step) => (
                  <div
                    key={step.stage}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                      <span>{step.stage}</span>
                      <span>{step.duration}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{step.focus}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-white">Micro Drills</h2>
              <p className="mt-2 text-sm text-slate-400">
                Layer one drill after each draft pass to reinforce deliberate practice.
              </p>
              <div className="mt-4 space-y-4">
                {microDrills.map((drill) => (
                  <div
                    key={drill.title}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                      <span>{drill.title}</span>
                      <span>{drill.duration}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      {drill.description}
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-slate-400">
                      {drill.steps.map((step) => (
                        <li key={step}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-white">Reflect & Anchor</h2>
              <p className="mt-2 text-sm text-slate-400">
                Close your session by capturing what shifted. Reflection cements skill.
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {reflectionPrompts.map((question) => (
                  <li
                    key={question}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </main>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Growth Levers to Track Weekly
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Rate yourself after every third session. Look for trends rather than perfection.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {growthSignals.map((signal) => (
              <div
                key={signal.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {signal.title}
                </p>
                <p className="mt-2 text-sm text-slate-300">{signal.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
