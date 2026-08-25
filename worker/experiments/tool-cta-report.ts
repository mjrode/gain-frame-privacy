import { hogql, type AdminEnv, num, str } from "../api/admin.ts";

export const TOOL_CTA_EXPERIMENT_ID = "tool_result_cta_v1";

export interface ToolCtaReportEnv extends AdminEnv {
  SLACK_REPORT_BOT_TOKEN?: string;
  SLACK_REPORT_CHANNEL_ID?: string;
}

export type ToolCtaVariantSummary = {
  variant: "improve" | "track" | "future";
  viewers: number;
  clickers: number;
  ctr: number;
};

const VARIANT_META = {
  improve: { letter: "A", label: "Improve next" },
  track: { letter: "B", label: "Track progress" },
  future: { letter: "C", label: "Future physique" },
} as const;

export function summarizeToolCtaRows(rows: unknown[][]): ToolCtaVariantSummary[] {
  const values = new Map(
    rows.map((row) => [str(row[0]), { viewers: num(row[1]), clickers: num(row[2]) }]),
  );
  return (Object.keys(VARIANT_META) as ToolCtaVariantSummary["variant"][]).map(
    (variant) => {
      const value = values.get(variant) ?? { viewers: 0, clickers: 0 };
      return {
        variant,
        ...value,
        ctr: value.viewers > 0 ? value.clickers / value.viewers : 0,
      };
    },
  );
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function variantLine(summary: ToolCtaVariantSummary): string {
  const meta = VARIANT_META[summary.variant];
  return `*${meta.letter} · ${meta.label}*  ${summary.viewers} viewed · ${summary.clickers} clicked · *${percent(summary.ctr)}*`;
}

export function formatToolCtaReport(input: {
  generatedAt: Date;
  daily: ToolCtaVariantSummary[];
  weekly: ToolCtaVariantSummary[];
}): string {
  const eligible = input.daily.filter((row) => row.viewers > 0);
  const leader = eligible.length
    ? [...eligible].sort((a, b) => b.ctr - a.ctr)[0]
    : null;
  const leaderText = leader
    ? `Directional leader: *${VARIANT_META[leader.variant].letter} · ${VARIANT_META[leader.variant].label}* at ${percent(leader.ctr)}.`
    : "No eligible experiment views in the last 24 hours.";
  const weeklyText = input.weekly
    .map((row) => `${VARIANT_META[row.variant].letter} ${percent(row.ctr)} (${row.clickers}/${row.viewers})`)
    .join(" · ");

  return [
    ":chart_with_upwards_trend: *Tool result CTA A/B/C · daily*",
    `Trailing 24 hours · ${input.generatedAt.toISOString().slice(0, 16).replace("T", " ")} UTC`,
    "",
    ...input.daily.map(variantLine),
    "",
    leaderText,
    `*Trailing 7 days:* ${weeklyText}`,
    "_Unique consented PostHog visitors. QA-forced assignments excluded. Treat the daily leader as directional until the pre-set sample is reached._",
  ].join("\n");
}

async function queryWindow(
  env: ToolCtaReportEnv,
  hours: number,
): Promise<ToolCtaVariantSummary[]> {
  const rows = await hogql(
    env,
    `SELECT properties.experiment_variant AS variant,
            count(DISTINCT if(event = 'tool_cta_viewed', person_id, NULL)) AS viewers,
            count(DISTINCT if(event = 'tool_cta_clicked', person_id, NULL)) AS clickers
     FROM events
     WHERE event IN ('tool_cta_viewed', 'tool_cta_clicked')
       AND properties.experiment_id = '${TOOL_CTA_EXPERIMENT_ID}'
       AND coalesce(properties.experiment_forced, false) = false
       AND timestamp > now() - INTERVAL ${hours} HOUR
     GROUP BY variant`,
  );
  return summarizeToolCtaRows(rows);
}

export async function sendToolCtaDailyReport(
  env: ToolCtaReportEnv,
  now = new Date(),
): Promise<{ sent: boolean; reason?: string }> {
  if (!env.POSTHOG_PERSONAL_API_KEY) {
    return { sent: false, reason: "POSTHOG_PERSONAL_API_KEY is not configured" };
  }
  if (!env.SLACK_REPORT_BOT_TOKEN) {
    return { sent: false, reason: "SLACK_REPORT_BOT_TOKEN is not configured" };
  }
  if (!env.SLACK_REPORT_CHANNEL_ID) {
    return { sent: false, reason: "SLACK_REPORT_CHANNEL_ID is not configured" };
  }

  const [daily, weekly] = await Promise.all([
    queryWindow(env, 24),
    queryWindow(env, 24 * 7),
  ]);
  const text = formatToolCtaReport({ generatedAt: now, daily, weekly });
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SLACK_REPORT_BOT_TOKEN}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel: env.SLACK_REPORT_CHANNEL_ID, text }),
  });
  if (!response.ok) {
    throw new Error(`Slack API ${response.status}`);
  }
  const result = (await response.json()) as { ok?: boolean };
  if (result.ok !== true) throw new Error("Slack API rejected the report");
  return { sent: true };
}
