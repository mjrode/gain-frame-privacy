import type { ReactNode } from "react";

type Cell = ReactNode;

export type PostTableProps = {
  headers: string[];
  rows: Cell[][];
  /** Highlight the GainFrame column (last column by default). Set false to disable. */
  highlight?: boolean;
  /**
   * Place the highlighted column second (right after the row label) instead of last.
   * Used when the table is wider than the viewport so GainFrame stays visible without scroll.
   */
  gainframeFirst?: boolean;
  /** Optional caption above the table (small uppercase label). */
  caption?: string;
};

export default function PostTable({
  headers,
  rows,
  highlight = true,
  gainframeFirst = false,
  caption,
}: PostTableProps) {
  const tableClassName = ["post-table", gainframeFirst ? "gainframe-first" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="post-table-wrapper">
      {caption ? <div className="post-table-caption">{caption}</div> : null}
      <table className={tableClassName} data-highlight={highlight ? "true" : "false"}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
