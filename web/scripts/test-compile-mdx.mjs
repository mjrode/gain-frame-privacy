import { compileMDX } from "next-mdx-remote/rsc";
import fs from "node:fs/promises";
import path from "node:path";

const dir = "content/blog";
const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx"));
const failed = [];
for (const f of files) {
  const src = await fs.readFile(path.join(dir, f), "utf8");
  try {
    await compileMDX({ source: src, options: { parseFrontmatter: true } });
  } catch (e) {
    failed.push({ f, msg: e.message.split("\n").slice(0, 6).join(" | ") });
  }
}
console.log("Failed:", failed.length, "/", files.length);
for (const x of failed) console.log(" -", x.f, "::", x.msg);
