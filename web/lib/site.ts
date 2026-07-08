export const SITE = {
  url: "https://gainframe.app",
  name: "GainFrame",
  appStoreUrl:
    "https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082",
  ga4Id: "G-N6YPFBB8JE",
  // PostHog project token (publishable) — same project as the iOS app so
  // site + app analytics live in one place.
  posthogKey: "phc_qaY5cwxVEdsFMD240oLruxYUHhhx3ORlvTXUepqEk8S",
  posthogHost: "https://us.i.posthog.com",
  contactEmail: "michaelrode44@gmail.com",
  ogImage: "https://gainframe.app/assets/og-images/og-image.png",
  logo: "https://gainframe.app/assets/favicons/favicon.webp",
  // Trainer waitlist deposit — Stripe Payment Link for the $50 founding-
  // member deposit (applied to first month at the $5/client/mo founding
  // rate). See docs/trainers-landing.md for setup + refund flow.
  trainerDepositUrl: "https://buy.stripe.com/6oUfZh6By3lpbwLbNEg7e00",
} as const;
