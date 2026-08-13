# Website analytics consent

The production site resolves analytics consent in
`components/AnalyticsConsentManager.tsx`.

Analytics run only on `gainframe.app` and its `www` alias. Other subdomains and
preview hosts stay off so a future product host does not inherit Clarity.

## Regional decision

`GET /api/privacy-region` runs in the Cloudflare Worker and returns only:

```json
{ "requiresConsent": true, "regionKnown": true }
```

The edge keeps the country code private. EEA, UK, and Swiss requests return a
known consent requirement and show the choice. Missing or unknown Cloudflare
location data follows the non-regulated path: analytics run without an
automatic banner. A saved `granted` or `denied` choice always wins. Other
visitors get analytics without the prompt unless they save a preference from
`/privacy/`.

Choices are stored in local storage with a first-party, same-site preference
cookie fallback so a decline can survive the reload that unloads active SDKs.
If those stores disagree after a partial browser-storage failure, denial wins
and the manager attempts to reconcile both stores to that denial.

## Provider behavior

- Google Analytics, PostHog, and Microsoft Clarity do not load while a visitor
  still needs to choose or after a visitor has declined.
- Google Analytics queues its Consent Mode state before its library loads.
- PostHog loads only after consent is granted or implied outside a regulated
  region.
- Microsoft Clarity defaults to cookies off in the project dashboard. Consent
  API V2 is queued with granted analytics storage before its tag loads.

## Clarity coverage

Clarity loads on every production website route after consent is granted or
implied. The editorial email-capture form is explicitly marked
`data-clarity-mask="true"`; Clarity's configured form-field masking applies
site-wide.

## Verification

```bash
npm run test:tools
npm run test:worker
npx tsc --noEmit
npm run build
```

After deployment, verify both marketing pages and tool/input pages request
`https://www.clarity.ms/tag/y0oh5t64bn` when analytics are allowed.
