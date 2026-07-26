# Reddit draft — GainFrame 90-day roadmap

**Blog article:** `https://gainframe.app/blog/gainframe-roadmap-next-90-days/` after publication

**Suggested image:** `../blog/gainframe-roadmap-next-90-days/assets/focus-map.webp`

**Created:** July 26, 2026

## Title options

1. The next 90 days of my iOS fitness app are focused on retention
2. I’m narrowing my fitness app around one recurring check-in loop
3. My 90-day roadmap after week-four retention stayed below 12%

## Post

I’m spending the next 90 days trying to reduce paid churn by 30–50% and improve paid retention by about 25% in my iOS app, GainFrame.

Those are targets. I still need to lock down the baseline and make sure I’m measuring entitlement expiration separately from somebody turning off renewal.

The current product is an AI progress-photo tracker. In June, 27% of installers returned during week one, up from 20.1% in May. Week-four retention stayed between 8% and 12%.

I wrote previously that the app “gets good on check-in five.” I need to correct that. I want the product to become more useful as photos, comparisons, workouts, and recovery context accumulate. I don’t have data proving that people value the history or that it improves retention yet.

So the first part of my roadmap is research rather than another batch of features.

**1. Establish the retention and churn baseline**

I’m auditing PostHog and RevenueCat together: identity, onboarding drop-off, the first photo flow, behavior during the seven days before cancellation, usage after renewal is disabled, and which first-week actions are associated with paid retention.

App opens won’t count as the retained behavior. I care about completed check-ins, comparisons, useful trend reviews, and other actions tied to the product’s main job.

**2. Make the AI result easier to trust**

The most rewarding part of the app is seeing a score improve or a body-fat estimate fall. It’s also the easiest place to lose somebody if lighting, pose, angle, or crop moves the number around.

I’m going to benchmark repeated results with controlled photo changes. Then the app can explain photo comparability, confidence, and when a trend needs one more check-in before it deserves a conclusion.

**3. Turn each check-in into a durable record**

GainFrame already attaches some weight and workout information to photos. I want a small, versioned snapshot for the check-in day: workout summary, recent load, sleep, HRV relative to the person’s baseline, resting heart rate, recovery availability, and optional notes like soreness or stress.

I don’t want to clone somebody’s entire HealthKit history. Every stored field needs a user-facing reason to exist.

The useful result would be: this is what you looked like, what you were doing, how you were recovering, and what changed afterward.

**4. Make one check-in create the reason for the next**

The intended habit is one to three visits a week and roughly two check-ins. After each one, the app should explain what changed, how confident it is, what may be contributing, when to check again, and what that next check-in can confirm.

Coach and Trends can fill the days between photos, but only when they are answering a question created by the person’s data.

**5. Test one social feature**

The working concept is GainFrame Timeprint. It would be a short vertical story that pose-locks a baseline and current check-in, shows time passing, highlights one credible area of change, and adds a personalized AI insight.

It also needs to work when the transformation is subtle and when somebody does not want to share a raw physique photo. The privacy modes I’m considering are face blur, background removal, and a stylized AI representation.

I’m going to make three visual prototypes before I build the generator. The reaction I want is, “I want to run that scan.” A generic before-and-after does not justify the engineering.

The broader product direction is pretty simple: GainFrame should be a visual evidence system for physique progress. The UI gets easier when every prominent feature helps somebody capture, compare, interpret, return, or share.

I’m sharing this before the research because I want the messy version on record. If you track your physique or build a subscription app, I’d be interested in where you think this plan is wrong.

Full roadmap with the diagrams: [BLOG_URL]

## Posting notes

- Replace `[BLOG_URL]` after the article is published.
- Attach `focus-map.webp` when the subreddit supports an image plus body text.
- For stricter communities, remove the final link and add it only if somebody asks.
- Check the community’s current self-promotion rules before posting.
- Stay around for the first few hours and answer the product and measurement questions directly.
