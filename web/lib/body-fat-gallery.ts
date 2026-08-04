// Data for the programmatic /body-fat/ gallery cluster. Each page targets one
// "X% body fat male/female" query family and is rendered by
// app/body-fat/[slug]/page.tsx from the physique reference images that already
// power the body-fat-visualizer tool.
//
// The visualizer assets exist at fixed percentages (male 8/13/18/23/28/33,
// female 18/22/27/32/37/42), so a page whose target percent falls between two
// assets shows the bracketing pair and says so — every image is labelled with
// the percent it actually depicts.

export type BfFaqItem = { q: string; a: string };

export type BfGalleryPage = {
  slug: string;
  gender: "male" | "female";
  percent: number;
  /** Bare title string — the root layout appends " | GainFrame". */
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  /** What is visibly different at this level. */
  traits: string[];
  /** Where this sits in the ACE body-fat ranges, and what that means. */
  rangeContext: string;
  /** How the target percent relates to the reference images shown. */
  referenceNote: string;
  /** Asset percent used for the by-age grid (nearest available). */
  primaryBf: number;
  /** Second reference percent shown alongside the primary. */
  compareBf: number;
  faq: BfFaqItem[];
};

export const BF_AGES = ["20s", "30s", "40s", "50s", "60s"] as const;

export function physiqueImage(
  gender: "male" | "female",
  age: (typeof BF_AGES)[number],
  bf: number,
): string {
  return `/tools/body-fat-visualizer/assets/physiques/${gender}-age${age}-bf${bf}.webp`;
}

export const BF_GALLERY_PAGES: BfGalleryPage[] = [
  // ---------------------------------------------------------------- male ---
  {
    slug: "8-percent-body-fat-male",
    gender: "male",
    percent: 8,
    metaTitle: "8% Body Fat Male: What It Looks Like (Pictures by Age)",
    metaDescription:
      "See what 8% body fat looks like on a man with photorealistic reference images at every age from 20s to 60s. Contest-lean definition, vascularity, and what it takes to hold it.",
    h1: "8% Body Fat (Male): What It Looks Like",
    intro: [
      "8% body fat is contest-lean. This is the look of a physique competitor in peak week, not a maintainable everyday condition for most lifters. Every muscle group is fully separated, and skin sits paper-thin over the abs.",
      "The reference images below show a man at 8% body fat across five decades of age, so you can see how the same percentage presents on a 25-year-old versus a 60-year-old frame.",
    ],
    traits: [
      "All six (or eight) abdominal segments visible at rest, including the lower abs — the last place fat leaves for most men",
      "Prominent vascularity across the forearms, biceps, shoulders, and often the lower abdomen",
      "Visible striations in the shoulders and chest on trained physiques",
      "Serratus and oblique detail without flexing",
      "Noticeably drawn face — hollow cheeks and a sharp jawline",
    ],
    rangeContext:
      "On the ACE scale, 6–13% is the \"athlete\" range for men, and 8% sits near its floor — only essential fat (2–5%) is lower. Holding 8% year-round usually costs sleep quality, training performance, and hormone levels. Most physique athletes touch this leanness for a photoshoot or show, then return to 10–14%.",
    referenceNote:
      "The by-age grid below shows the visualizer's 8% reference frames. For comparison, the second image shows 13% — the top of the athlete range — so you can see how much separation is lost in just five percentage points.",
    primaryBf: 8,
    compareBf: 13,
    faq: [
      {
        q: "Is 8% body fat healthy to maintain?",
        a: "For most men, no — not long-term. 8% is close to essential fat levels, and staying there chronically can suppress testosterone, disturb sleep, and hurt training recovery. It's a peak condition to visit, not a place to live. 10–15% is a more sustainable lean range.",
      },
      {
        q: "How long does it take to get to 8% body fat?",
        a: "From a typical lean starting point of 15%, expect roughly 12–20 weeks of a disciplined cut, losing about 0.5–1% of body weight per week. The last few percentage points come slowest because your body fights harder as fat stores drop.",
      },
      {
        q: "Why don't I look like these references at 8%?",
        a: "Muscle mass. Body fat percentage only describes how much fat covers the muscle — a lifter at 8% with years of training looks dramatically different from an untrained person at the same percentage, who will simply look thin.",
      },
    ],
  },
  {
    slug: "10-percent-body-fat-male",
    gender: "male",
    percent: 10,
    metaTitle: "10% Body Fat Male: What It Looks Like (Pictures by Age)",
    metaDescription:
      "What does 10% body fat look like on a man? Photorealistic reference pictures at every age, the definition you can expect, and how to verify your own number for free.",
    h1: "10% Body Fat (Male): What It Looks Like",
    intro: [
      "10% body fat is the classic \"beach lean\" target — a clear six-pack in normal lighting, visible vascularity, and a sharp face, without the depleted look of contest conditioning.",
      "It's also the number most lifters chase and most overestimate: genuinely reaching 10% is harder than the mirror suggests, because abs that show only under flexing and hard light usually mean 12–14%.",
    ],
    traits: [
      "Six-pack visible at rest in normal lighting, though the lower abs may soften slightly by evening",
      "Veins visible on forearms and biceps, sometimes shoulders",
      "Obliques and serratus show when twisting or reaching",
      "Sharp jawline and lean face",
      "Muscle separation between chest, shoulders, and arms is obvious in a t-shirt",
    ],
    rangeContext:
      "10% sits solidly inside the ACE athlete range for men (6–13%). Unlike 8%, many disciplined lifters can hold 10–12% for months at a time, though it still demands consistent calorie awareness. It's a common photoshoot and summer target precisely because it photographs like peak condition without the final grind.",
    referenceNote:
      "The visualizer's reference frames sit at 8% and 13% — 10% looks between the two: nearly all the ab detail of the 8% frame, with slightly less vascularity and a little more fullness in the face. The by-age grid uses the 8% reference.",
    primaryBf: 8,
    compareBf: 13,
    faq: [
      {
        q: "Is 10% body fat sustainable?",
        a: "For disciplined lifters, yes — 10–12% is widely considered the leanest range most men can hold for months without performance or hormonal costs. It still requires tracking intake and accepting some hunger; below 10% those costs climb steeply.",
      },
      {
        q: "How do I know if I'm actually at 10%?",
        a: "Most men who guess 10% are at 13–15%. Check with more than the mirror: a U.S. Navy tape-measure calculation, an AI photo estimate, or a DEXA scan. If your lower abs aren't visible at rest in flat lighting, you're probably not at 10% yet.",
      },
      {
        q: "How long does it take to cut from 15% to 10%?",
        a: "At a sensible deficit losing 0.5–1 lb of fat per week, dropping five percentage points typically takes 10–16 weeks for an average-sized man. Slower cuts preserve more muscle, which matters more the leaner you get.",
      },
    ],
  },
  {
    slug: "12-percent-body-fat-male",
    gender: "male",
    percent: 12,
    metaTitle: "12% Body Fat Male: What It Looks Like (Pictures by Age)",
    metaDescription:
      "See what 12% body fat looks like on a man — lean, athletic, abs in good lighting — with reference pictures across ages 20s to 60s and free tools to check your own number.",
    h1: "12% Body Fat (Male): What It Looks Like",
    intro: [
      "12% body fat is arguably the best-looking sustainable condition for a natural lifter: clearly athletic in and out of clothes, abs visible in decent lighting, but with enough energy and food flexibility to train hard and live normally.",
      "Many coaches point clients here rather than to single-digit body fat, because the visual difference is smaller than people expect and the lifestyle difference is enormous.",
    ],
    traits: [
      "Upper four abs visible at rest; the lower abs appear in good lighting or with a slight flex",
      "Visible muscle separation in shoulders and arms",
      "Some forearm vascularity, less in the upper arms than at 10%",
      "Defined jawline, face looks lean but not drawn",
      "Waist stays tight through the day with minimal bloat",
    ],
    rangeContext:
      "12% is near the top of the ACE athlete range for men (6–13%). It's a realistic year-round condition for consistent trainees — lean enough that every muscle you build shows, forgiving enough that a vacation or a heavy diet week doesn't erase the look.",
    referenceNote:
      "12% sits closest to the visualizer's 13% reference, which the by-age grid below uses. The 8% frame is shown alongside for comparison — the gap between them is roughly what a 12-to-16-week contest prep accomplishes.",
    primaryBf: 13,
    compareBf: 8,
    faq: [
      {
        q: "Why can some men see abs at 15% but I need 12%?",
        a: "Fat distribution and ab muscle thickness are genetic. Men who store fat preferentially on the lower body show abs at higher percentages; men who store it on the belly need to get leaner. Thicker, well-trained abs also push through a thin fat layer earlier.",
      },
      {
        q: "Should I keep cutting below 12% or start building muscle?",
        a: "If you've been dieting a while, 12% is an excellent place to stop and lean-bulk. You'll gain muscle faster in a small surplus, and starting a bulk this lean means you can add size for months before definition disappears.",
      },
      {
        q: "What's the visible difference between 12% and 15%?",
        a: "About one belt notch and the lower half of your abs. At 12% the waist is visibly tighter, the upper abs show at rest, and shoulder striations start to appear. At 15% the same physique looks fit but smooth.",
      },
    ],
  },
  {
    slug: "15-percent-body-fat-male",
    gender: "male",
    percent: 15,
    metaTitle: "15% Body Fat Male: What It Looks Like (Pictures by Age)",
    metaDescription:
      "What does 15% body fat look like on a man? Fit but not shredded — see photorealistic pictures at every age from 20s to 60s, plus how to measure yours for free.",
    h1: "15% Body Fat (Male): What It Looks Like",
    intro: [
      "15% body fat is the fit-guy default: a flat stomach, visible muscle shape in a t-shirt, and faint upper-ab outlines in good lighting — without the constant dietary vigilance that lower percentages demand.",
      "It's the most-searched male body fat level for a reason. Most men who train consistently and eat reasonably well land somewhere near 15%, and it's the standard launch point for either a cut to 10–12% or a lean bulk.",
    ],
    traits: [
      "Flat stomach with faint upper-ab outlines in overhead lighting; no definition at rest in soft light",
      "Chest, shoulder, and arm muscle clearly visible clothed",
      "Little to no vascularity outside the forearms",
      "Face looks healthy and reasonably lean, not sharp",
      "A small pinch of fat at the navel and love-handle area",
    ],
    rangeContext:
      "ACE classifies 14–17% as the \"fitness\" range for men — lean enough for health markers to look excellent, comfortable enough to maintain without tracking every meal. Health-wise there is nothing to fix at 15%; going lower is an aesthetic choice, not a medical one.",
    referenceNote:
      "15% falls between the visualizer's 13% and 18% reference frames — closer to the 13% look with a slightly softer waist. Both are shown below; the by-age grid uses the 13% reference.",
    primaryBf: 13,
    compareBf: 18,
    faq: [
      {
        q: "Is 15% body fat good for a man?",
        a: "Yes. 15% sits in the ACE fitness range, health markers are typically excellent, and the physique reads as clearly fit. Cutting lower is purely about aesthetics — there's no health reason a man at 15% needs to be leaner.",
      },
      {
        q: "Can you see abs at 15% body fat?",
        a: "Usually only the upper abs, and only in favorable lighting or with a flex. Full six-pack visibility at rest typically requires 10–12%, depending on your fat distribution and how developed the ab muscles themselves are.",
      },
      {
        q: "Should I cut or bulk at 15%?",
        a: "Either works — 15% is the classic decision point. If you want visible abs this summer, cut to 11–12% over 8–12 weeks. If you want to look bigger in clothes, lean-bulk now and cut later; you have room to gain before definition fully disappears.",
      },
    ],
  },
  {
    slug: "18-percent-body-fat-male",
    gender: "male",
    percent: 18,
    metaTitle: "18% Body Fat Male: What It Looks Like (Pictures by Age)",
    metaDescription:
      "See what 18% body fat looks like on a man across ages 20s–60s. Soft but healthy — reference pictures, what changes at this level, and free ways to check your number.",
    h1: "18% Body Fat (Male): What It Looks Like",
    intro: [
      "18% body fat looks like a man who trains but doesn't diet: solid arms and shoulders, a stomach that's soft rather than flat, and no visible ab definition. In clothes, the physique still reads as strong; shirtless, the training is easier to miss.",
      "This is one of the most common real-world levels for recreational lifters, and it's a perfectly healthy place to be — the question at 18% is aesthetic preference, not health.",
    ],
    traits: [
      "No ab visibility at rest; the stomach is soft but not protruding",
      "Early love handles and a pinchable layer around the navel",
      "Arms and shoulders still show training through a shirt",
      "Face is fuller, jawline present but not sharp",
      "Waist measurably wider than at 15% — usually one to two belt notches",
    ],
    rangeContext:
      "18% sits at the top of ACE's fitness range and the bottom of the \"average\" range for men (18–24%). Health risk at this level is low for most men — waist circumference and bloodwork matter more than the percentage itself. Aesthetically, it's about 4–6 points of body fat away from clearly visible abs.",
    referenceNote:
      "The by-age grid below uses the visualizer's exact 18% reference. The 23% frame is shown alongside so you can see the direction another five points of fat takes the same physique.",
    primaryBf: 18,
    compareBf: 23,
    faq: [
      {
        q: "Is 18% body fat overweight for a man?",
        a: "No. 18% is within the healthy average range for men on the ACE scale. It's leaner than the average Western male adult, and health markers at this level are typically fine — visible abs are an aesthetic goal, not a health requirement.",
      },
      {
        q: "Can I build muscle and lose fat at the same time at 18%?",
        a: "Yes — 18% with less than a couple of years of serious training is prime body-recomposition territory. Eat around maintenance with high protein (0.7–1 g per lb), train progressively, and you can drop fat while adding muscle for months.",
      },
      {
        q: "How long to get from 18% to 12%?",
        a: "Roughly 12–18 weeks at a moderate deficit for an average-sized man — about 1% of body fat every two weeks is a sustainable pace that keeps your muscle and your sanity intact.",
      },
    ],
  },
  {
    slug: "20-percent-body-fat-male",
    gender: "male",
    percent: 20,
    metaTitle: "20% Body Fat Male: What It Looks Like (Pictures by Age)",
    metaDescription:
      "What does 20% body fat look like on a man? Reference pictures by age from 20s to 60s, what's normal at this level, and free tools to measure your own body fat.",
    h1: "20% Body Fat (Male): What It Looks Like",
    intro: [
      "20% body fat is close to the average for adult men who exercise casually. The midsection carries a clear layer of fat, the waist has begun to round, and muscle definition is hidden — but the frame still looks sturdy rather than heavy, especially in clothes.",
      "If you're at 20% and lifting, you're in a strong position: every pound of fat lost from here produces a visible change, and the first six weeks of a cut tend to be dramatic.",
    ],
    traits: [
      "Noticeable belly fat — the stomach protrudes slightly past the chest line when relaxed",
      "Defined love handles and a fuller lower back",
      "No visible muscle separation in the torso; arms may still show shape",
      "Rounder face and softer jawline",
      "Waist typically 2–4 inches larger than the same man at 15%",
    ],
    rangeContext:
      "20% is squarely in ACE's average range for men (18–24%). It's not a health alarm on its own, but it's the zone where visceral fat starts accumulating for many men — waist circumference above 40 inches is the number worth watching. Aesthetically, 20% is roughly 8–10 points from a visible six-pack.",
    referenceNote:
      "20% falls between the visualizer's 18% and 23% reference frames, a touch closer to the 18% look with more fullness at the waist. Both are shown; the by-age grid uses the 18% reference.",
    primaryBf: 18,
    compareBf: 23,
    faq: [
      {
        q: "Is 20% body fat normal for a man?",
        a: "Yes — 20% is within the ACE average range (18–24%) and close to typical for adult men. It's a normal, non-alarming level. Whether to cut from here is a goals question: abs need roughly 10–12%, a visibly athletic look needs about 15%.",
      },
      {
        q: "How long does it take to go from 20% to 15% body fat?",
        a: "At a steady 500-calorie daily deficit, most men drop from 20% to 15% in about 10–14 weeks. The early weeks move fastest — water and glycogen amplify the initial change — so don't panic when week six slows down.",
      },
      {
        q: "Should I do cardio or lift to lose fat from 20%?",
        a: "Lift first, add cardio second. The calorie deficit does the fat loss; lifting tells your body to keep its muscle while you lose. Three to four lifting sessions plus daily walking outperforms cardio-only approaches for how the end result looks.",
      },
    ],
  },
  {
    slug: "25-percent-body-fat-male",
    gender: "male",
    percent: 25,
    metaTitle: "25% Body Fat Male: What It Looks Like (Pictures by Age)",
    metaDescription:
      "See what 25% body fat looks like on a man at every age from 20s to 60s. Where it sits on the health scale, what changes first when you cut, and free measuring tools.",
    h1: "25% Body Fat (Male): What It Looks Like",
    intro: [
      "At 25% body fat, the belly leads: it's the first thing visible in profile, the waistband folds under it, and no torso muscle shows through. Shirts fit tight at the stomach before anywhere else.",
      "25% is also the ACE threshold where \"average\" ends for men — which makes it less a verdict than a signpost. Men starting a cut here see the fastest, most motivating early progress of any group.",
    ],
    traits: [
      "Prominent belly that projects past the chest; waist is the widest point of the torso",
      "Chest carries visible fat; jawline is soft",
      "No muscle definition visible anywhere at rest",
      "Love handles and lower-back fat are established",
      "Clothes size is driven by the waist rather than shoulders",
    ],
    rangeContext:
      "ACE marks 25%+ as the obese range for men, though the label matters less than the pattern: at this level most men are accumulating visceral fat around the organs, which drives blood pressure, blood sugar, and cholesterol in the wrong direction. A waist measurement over 40 inches is the practical warning sign. The good news is that the first 5% lost from here delivers outsized health returns.",
    referenceNote:
      "25% falls between the visualizer's 23% and 28% reference frames. Both are shown below; the by-age grid uses the 23% reference.",
    primaryBf: 23,
    compareBf: 28,
    faq: [
      {
        q: "Is 25% body fat bad for a man?",
        a: "It's the level where health risk starts climbing measurably — ACE places 25%+ in the obese range for men, largely because of visceral fat. It's also very fixable: a modest sustained deficit drops most men back into the average range within three to four months.",
      },
      {
        q: "How fast can I realistically lose fat from 25%?",
        a: "Men at 25% can safely lose 1–2 lbs per week — faster than leaner people, because larger fat stores release energy more readily. That's roughly 1% body fat every two to three weeks, or about 12–20 weeks to reach 18%.",
      },
      {
        q: "Should I lose the fat before starting to lift weights?",
        a: "No — start lifting immediately. At 25%, newcomers to training can lose fat and gain muscle simultaneously, and the muscle you build sets up how you'll look when the fat comes off. Waiting to be lean first wastes your best recomposition window.",
      },
    ],
  },
  {
    slug: "30-percent-body-fat-male",
    gender: "male",
    percent: 30,
    metaTitle: "30% Body Fat Male: What It Looks Like (Pictures by Age)",
    metaDescription:
      "What does 30% body fat look like on a man? Age-by-age reference pictures, honest health context, and where to start — with free tools to track the change.",
    h1: "30% Body Fat (Male): What It Looks Like",
    intro: [
      "At 30% body fat, roughly one pound in every three or four on the frame is fat. The stomach is large and rounded, fat is visible on the chest, back, and face, and everyday things — stairs, heat, shoe-tying — take noticeably more effort than they used to.",
      "If this is your starting point, it comes with a genuine advantage: no population loses weight faster or sees health markers improve more steeply than men cutting from 30%. The first three months can be transformative.",
    ],
    traits: [
      "Large, rounded belly; significant fat on the chest, back, and hips",
      "Full face with little jawline definition",
      "Neck and shoulders carry visible fat",
      "Skin appears smooth everywhere — no muscle contour shows at any angle",
      "Waist circumference commonly 42+ inches",
    ],
    rangeContext:
      "30% is well inside ACE's obese range for men (25%+), and at this level visceral fat is nearly always elevated — which is why blood pressure, fasting glucose, and sleep quality so often improve within weeks of starting a cut, long before the mirror catches up. This is worth discussing with a doctor alongside any training plan, especially if bloodwork hasn't been checked recently.",
    referenceNote:
      "30% falls between the visualizer's 28% and 33% reference frames. Both are shown; the by-age grid uses the 28% reference.",
    primaryBf: 28,
    compareBf: 33,
    faq: [
      {
        q: "How long does it take to get from 30% to 20% body fat?",
        a: "Roughly six to nine months at a sustainable pace of 1–2 lbs per week. That sounds long, but the visible change arrives continuously — most men look noticeably different by week eight and dramatically different by month four.",
      },
      {
        q: "What should I do first at 30% body fat?",
        a: "Three things, in order: set a moderate calorie deficit you can hold (roughly 500 below maintenance), walk daily and lift two to three times a week, and take a front-facing progress photo. The photo matters — scale weight fluctuates, but monthly photos never lie.",
      },
      {
        q: "Is it possible to have muscle under the fat at 30%?",
        a: "Yes, and heavier men usually do — carrying extra weight builds legs, back, and traps just by existing. That hidden base is why cuts from 30% often end better than expected: the muscle revealed at the end was being built the whole time.",
      },
    ],
  },
  // -------------------------------------------------------------- female ---
  {
    slug: "18-percent-body-fat-female",
    gender: "female",
    percent: 18,
    metaTitle: "18% Body Fat Female: What It Looks Like (Pictures by Age)",
    metaDescription:
      "See what 18% body fat looks like on a woman — athlete-lean reference pictures at every age from 20s to 60s, health context, and free tools to check your own number.",
    h1: "18% Body Fat (Female): What It Looks Like",
    intro: [
      "18% body fat on a woman is athlete-lean — the conditioning of a track sprinter or a physique competitor near show prep. Muscle separation shows in the shoulders and legs, ab lines are visible, and very little softness remains anywhere.",
      "Because women's essential fat is much higher than men's (10–13% versus 2–5%), 18% for a woman is comparable in relative leanness to a man in single digits — impressive, demanding, and not a casual maintenance level.",
    ],
    traits: [
      "Visible ab lines and an obviously tight waist",
      "Muscle separation in shoulders, arms, and quads",
      "Minimal fat on the hips and thighs relative to the female norm",
      "Veins may show on forearms; face is lean",
      "Glutes and legs look athletic and firm rather than soft",
    ],
    rangeContext:
      "ACE places 14–20% as the athlete range for women, so 18% sits comfortably inside it — but near the territory where some women experience menstrual irregularity, low energy, or sleep disruption if they push leaner. Individual response varies widely; performance and cycle regularity are better guides than the number itself.",
    referenceNote:
      "The by-age grid below uses the visualizer's exact 18% reference — its leanest female frame. The 22% frame is alongside for comparison; the gap between them is roughly a full diet phase.",
    primaryBf: 18,
    compareBf: 22,
    faq: [
      {
        q: "Is 18% body fat too low for a woman?",
        a: "Not inherently — 18% is within the ACE athlete range (14–20%), and many athletes hold it healthily. But it's near the level where some women see hormonal effects like cycle irregularity. If those appear, that's the body's signal to add some fat back regardless of the aesthetic.",
      },
      {
        q: "Can women see abs at 18% body fat?",
        a: "Usually yes — most women show clear ab definition somewhere between 16% and 20%, depending on genetics and how developed the ab muscles are. Women who store fat preferentially on the lower body see abs earlier than the number alone predicts.",
      },
      {
        q: "How is 18% for a woman different from 18% for a man?",
        a: "Completely different conditions. Women carry 8–10 extra points of essential fat in breast tissue, hips, and hormone-supporting stores. A woman at 18% is athlete-lean; a man at 18% is at the soft end of the fitness range. Never compare across sexes.",
      },
    ],
  },
  {
    slug: "20-percent-body-fat-female",
    gender: "female",
    percent: 20,
    metaTitle: "20% Body Fat Female: What It Looks Like (Pictures by Age)",
    metaDescription:
      "What does 20% body fat look like on a woman? Lean, athletic reference pictures across ages 20s–60s, what's visible at this level, and free ways to measure yours.",
    h1: "20% Body Fat (Female): What It Looks Like",
    intro: [
      "20% body fat is the lean-athletic look: toned shoulders and arms, a flat stomach with faint ab lines in good lighting, and visible muscle shape in the legs — while keeping the curves that disappear at competition leanness.",
      "For most women who train seriously, 20% is close to the leanest condition that still feels livable — maintainable through consistent training and mindful eating rather than a tracked diet.",
    ],
    traits: [
      "Flat stomach; ab outlines appear in overhead lighting or with a flex",
      "Defined shoulder caps and visible arm muscle",
      "Legs show quad and calf shape; glutes are firm",
      "Slim waist with a clear taper to the hips",
      "Face is lean with visible cheekbone structure",
    ],
    rangeContext:
      "20% sits at the boundary of ACE's athlete (14–20%) and fitness (21–24%) ranges for women — the sweet spot where a physique reads as unmistakably trained without the hormonal and lifestyle costs of true competition leanness. Energy, cycle regularity, and training performance are typically unaffected here.",
    referenceNote:
      "20% falls between the visualizer's 18% and 22% reference frames — both are shown below. Expect to look between the two, and remember fat distribution moves the look more at this level than the number does. The by-age grid uses the 18% reference.",
    primaryBf: 18,
    compareBf: 22,
    faq: [
      {
        q: "Is 20% body fat good for a woman?",
        a: "It's an athletic, lean level — right at the top of the ACE athlete range. Health markers are typically excellent, and it's sustainable for consistent trainees. Most recreational lifters would need a deliberate cutting phase to reach it.",
      },
      {
        q: "How do I get to 20% body fat as a woman?",
        a: "From an average starting point around 28–30%, plan on four to six months: a moderate deficit (300–500 calories), protein around 0.7–1 g per lb, and two to four lifting sessions weekly. Slower is better — aggressive cuts cost muscle, and the muscle is what creates the 'toned' look.",
      },
      {
        q: "Will I lose my curves getting to 20%?",
        a: "Mostly no. At 20% women retain hip and glute shape — that loss happens closer to 15–16%. Training glutes and shoulders through the cut actually increases the waist-to-hip contrast, since the waist shrinks faster than trained muscle.",
      },
    ],
  },
  {
    slug: "25-percent-body-fat-female",
    gender: "female",
    percent: 25,
    metaTitle: "25% Body Fat Female: What It Looks Like (Pictures by Age)",
    metaDescription:
      "See what 25% body fat looks like on a woman at every age from 20s to 60s. Fit, healthy, and strong — reference pictures plus free tools to check your own number.",
    h1: "25% Body Fat (Female): What It Looks Like",
    intro: [
      "25% body fat is the fit-and-healthy middle ground for women: a visibly in-shape physique with a soft stomach rather than a defined one, toned limbs, and natural curves. Think regular gym-goer, not competitor.",
      "It's probably the most common goal weight zone for women who lift — lean enough that training shows in the arms, shoulders, and legs, relaxed enough that no food needs weighing.",
    ],
    traits: [
      "Stomach is flat-ish but soft — no visible ab definition at rest",
      "Arms and shoulders show muscle tone, especially when active",
      "Full hips, thighs, and glutes with a defined waist",
      "A pinchable layer on the stomach, hips, and thighs",
      "Face is soft but structured",
    ],
    rangeContext:
      "25% opens ACE's acceptable range for women (25–31%) and borders the fitness range (21–24%). Health at this level is typically excellent — for many women it's the effortless setpoint that consistent training settles into. Moving from 25% toward 20% is an aesthetics project; staying at 25% is a perfectly good outcome.",
    referenceNote:
      "25% falls between the visualizer's 22% and 27% reference frames, closer to the 27% look. Both are shown; the by-age grid uses the 27% reference.",
    primaryBf: 27,
    compareBf: 22,
    faq: [
      {
        q: "Is 25% body fat good for a woman?",
        a: "Yes — 25% is a healthy, fit level sitting between the ACE fitness and acceptable ranges. Many women who train regularly maintain here year-round without tracking. Visible ab definition typically needs 20% or below, but that's an aesthetic choice, not a health upgrade.",
      },
      {
        q: "Can I see muscle definition at 25% body fat?",
        a: "In the arms, shoulders, and calves — yes, especially with consistent training. The midsection keeps a soft layer at 25%, so ab definition waits until roughly 20–22%. Shoulders are usually the first place a woman's training becomes visible.",
      },
      {
        q: "How long from 25% to 20% body fat?",
        a: "Typically 10–16 weeks at a moderate deficit. Women should generally cut slower than men — around 0.5–1% of body weight per week — to protect muscle and hormonal health. Lifting through the cut is what makes the result look athletic rather than just smaller.",
      },
    ],
  },
  {
    slug: "30-percent-body-fat-female",
    gender: "female",
    percent: 30,
    metaTitle: "30% Body Fat Female: What It Looks Like (Pictures by Age)",
    metaDescription:
      "What does 30% body fat look like on a woman? Reference pictures by age from 20s to 60s, honest context on where it sits in the healthy range, and free measuring tools.",
    h1: "30% Body Fat (Female): What It Looks Like",
    intro: [
      "30% body fat looks like the average healthy woman: soft through the stomach, hips, and thighs, with natural curves and no visible muscle definition. It's a normal, common level — close to the population median for adult women.",
      "At 30%, the frame still moves well and health markers are usually fine. Whether to change anything depends entirely on goals: this is a comfortable maintenance level for many women and a natural starting line for others.",
    ],
    traits: [
      "Soft, slightly rounded stomach; waist definition present but gentle",
      "Fuller hips, thighs, and glutes — fat distributes lower-body-first for most women",
      "Upper arms carry a soft layer; muscle tone not visible at rest",
      "Face is fuller with softer contours",
      "Bra-line and lower-back fat begin to be noticeable",
    ],
    rangeContext:
      "30% sits inside ACE's acceptable range for women (25–31%) — within normal, though near its upper edge. Health risk at this level depends more on where fat sits (waist versus hips) and on activity level than on the percentage. A waist under 35 inches with regular exercise generally means things are fine.",
    referenceNote:
      "30% falls between the visualizer's 27% and 32% reference frames, closer to the 32% look. Both are shown; the by-age grid uses the 32% reference.",
    primaryBf: 32,
    compareBf: 27,
    faq: [
      {
        q: "Is 30% body fat overweight for a woman?",
        a: "No — 30% is within ACE's acceptable range for women (25–31%). It's close to average for adult women and compatible with excellent health, particularly with regular activity. The obese classification doesn't begin until 32%+.",
      },
      {
        q: "What's a realistic first goal from 30%?",
        a: "25% in three to four months is ambitious but very achievable: a 300–500 calorie deficit, protein at each meal, lifting twice or more per week, and daily steps. That five-point drop visibly changes the waist, face, and how clothes fit.",
      },
      {
        q: "Why does my weight change but my body fat percentage barely move?",
        a: "Scale drops include water, glycogen, and sometimes muscle — not just fat. If you lose weight without lifting or eating protein, the fat percentage moves less than expected because lean mass fell too. Lifting through a diet is what makes the percentage follow the scale.",
      },
    ],
  },
  {
    slug: "35-percent-body-fat-female",
    gender: "female",
    percent: 35,
    metaTitle: "35% Body Fat Female: What It Looks Like (Pictures by Age)",
    metaDescription:
      "See what 35% body fat looks like on a woman across ages 20s–60s. Where it sits on the health scale, what changes first with training, and free tools to track it.",
    h1: "35% Body Fat (Female): What It Looks Like",
    intro: [
      "At 35% body fat, softness is the dominant visual note: a rounded stomach, full hips and thighs, and a fuller face. Clothes size is set by the hips or waist, and muscle tone doesn't show at rest anywhere.",
      "35% is past the ACE threshold where health risk starts to build for women — but it's also a starting point with unusually fast early returns. The first two months of consistent habits produce changes that are visible weekly.",
    ],
    traits: [
      "Rounded stomach that shows through fitted clothing",
      "Full hips, thighs, and upper arms with a soft texture",
      "Waist definition is minimal; torso reads as one width",
      "Fuller face and neck",
      "Bra-line, back, and underarm fat are established",
    ],
    rangeContext:
      "ACE marks 32%+ as the obese range for women, so 35% sits a few points inside it. As with men, the practical concern is visceral fat and its downstream effects on blood sugar and blood pressure — a waist measurement over 35 inches is the simplest flag worth acting on. Small, sustained changes move these markers quickly.",
    referenceNote:
      "35% falls between the visualizer's 32% and 37% reference frames, closer to the 37% look. Both are shown; the by-age grid uses the 37% reference.",
    primaryBf: 37,
    compareBf: 32,
    faq: [
      {
        q: "Is 35% body fat bad for a woman?",
        a: "It's a few points into the range where health risk climbs (ACE marks 32%+ as obese for women), but far from an emergency. Fat stored on hips and thighs — the typical female pattern — carries less metabolic risk than belly fat. A sustained modest deficit moves most women back under 32% within two to three months.",
      },
      {
        q: "Where do women lose fat first when cutting from 35%?",
        a: "Usually face and waist first, hips and thighs last — the reverse of the order it arrived. This is genetic and can't be spot-targeted. Progress photos catch the early face-and-waist changes weeks before the scale convinces you anything is happening.",
      },
      {
        q: "Do I need a gym to start from 35%?",
        a: "No. The deficit does the fat loss, and walking plus basic home resistance work (squats, hinges, push-ups, rows with bands) protects muscle. A gym helps later, when heavier progressive loading matters more. Start with food, steps, and photos.",
      },
    ],
  },
  {
    slug: "40-percent-body-fat-female",
    gender: "female",
    percent: 40,
    metaTitle: "40% Body Fat Female: What It Looks Like (Pictures by Age)",
    metaDescription:
      "What does 40% body fat look like on a woman? Age-by-age reference pictures, straightforward health context, and where to start — with free tools to track the change.",
    h1: "40% Body Fat (Female): What It Looks Like",
    intro: [
      "At 40% body fat, roughly two pounds in every five on the frame are fat. The stomach is prominent, the hips and thighs are heavy, and the softness extends to the arms, back, and face. Daily movement — stairs, long walks, getting off the floor — takes real effort.",
      "If 40% is the starting point, the encouraging part is mathematical: larger fat stores release energy faster, so safe weekly losses are bigger here than at any leaner level, and health markers respond within weeks of consistent change.",
    ],
    traits: [
      "Prominent, rounded stomach — often the widest point along with the hips",
      "Heavy thighs and upper arms; fat visible on knees and calves",
      "Little to no visible waist indentation",
      "Full face and neck with softened features",
      "Skin dimpling common on thighs and glutes",
    ],
    rangeContext:
      "40% is well inside ACE's obese range for women (32%+). At this level visceral fat is nearly always elevated, which affects blood pressure, blood sugar, joint load, and sleep. It's worth involving a doctor — both to baseline bloodwork and because rapid early improvements are motivating to see on paper. The trajectory matters far more than today's number.",
    referenceNote:
      "40% falls between the visualizer's 37% and 42% reference frames, closer to the 42% look. Both are shown; the by-age grid uses the 42% reference.",
    primaryBf: 42,
    compareBf: 37,
    faq: [
      {
        q: "How long does it take to get from 40% to 30% body fat?",
        a: "Typically eight to twelve months at a sustainable 1–2 lbs per week. That horizon sounds long, but it's continuously visible progress — most women look noticeably different at month two and substantially different by month six. Sustainable pace beats aggressive restarts every time.",
      },
      {
        q: "What's the single best first step at 40% body fat?",
        a: "A calorie target you can genuinely hold — roughly 500 below maintenance — plus a daily walk. Not a program overhaul, not a cleanse. One sustainable deficit habit outperforms any intense plan that collapses in week three. Add strength work within the first month to protect muscle.",
      },
      {
        q: "Is it too late to change my body composition after 40 or 50?",
        a: "No — fat loss works identically at every age, and women in their 40s–60s build muscle effectively with resistance training. The by-age references on this page show composition, not destiny: the same percentage, and the same improvements, exist at every decade.",
      },
    ],
  },
];

export function getBfPage(slug: string): BfGalleryPage | undefined {
  return BF_GALLERY_PAGES.find((p) => p.slug === slug);
}

/** Prev/next within the same gender, ordered by percent. */
export function getAdjacentBfPages(page: BfGalleryPage): {
  prev?: BfGalleryPage;
  next?: BfGalleryPage;
} {
  const siblings = BF_GALLERY_PAGES.filter(
    (p) => p.gender === page.gender,
  ).sort((a, b) => a.percent - b.percent);
  const i = siblings.findIndex((p) => p.slug === page.slug);
  return { prev: siblings[i - 1], next: siblings[i + 1] };
}
