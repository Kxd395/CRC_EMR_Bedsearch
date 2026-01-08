import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const pExecFile = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.MODEL || "gpt-4o-mini";
const SANDBOX_TIMEOUT_MS = parseInt(process.env.SANDBOX_TIMEOUT_MS || "20000", 10);

// Try root first, then src/ for constitution
const rootCandidate = path.join(__dirname, "..", "agent.constitution.md");
const srcCandidate = path.join(__dirname, "agent.constitution.md");

async function systemPrompt() {
  const dts = await fs.readFile(path.join(__dirname, "bindings.d.ts"), "utf8");
  let constitution = "";
  try {
    constitution = await fs.readFile(rootCandidate, "utf8");
  } catch {
    try {
      constitution = await fs.readFile(srcCandidate, "utf8");
    } catch {
      throw new Error("agent.constitution.md not found in root or src/");
    }
  }
  return [
    constitution,
    "",
    "Bindings API types:",
    "```ts",
    dts,
    "```"
  ].join("\n");
}

function wrapUserCode(userTs: string) {
  return `
    import { bindings } from "./bindings.ts";
    async function run() {
      ${userTs}
    }
    try {
      const result = await run();
      console.log(JSON.stringify(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(JSON.stringify({ ok: false, data: { message } }));
    }
  `;
}

async function askModel(task: string) {
  const system = await systemPrompt();
  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: system },
      { role: "user", content: task }
    ]
  });
  
  // Capture token usage for metrics
  const usage = res.usage;
  if (usage) {
    console.error(`[USAGE] prompt=${usage.prompt_tokens} completion=${usage.completion_tokens} total=${usage.total_tokens}`);
  }
  
  const content = res.choices[0]?.message?.content || "";
  const fenced = content.match(/```ts(?:|x)\s*([\s\S]*?)```/m) || content.match(/```(?:javascript|typescript)?\s*([\s\S]*?)```/m);
  return (fenced ? fenced[1] : content).trim();
}

async function runInDeno(tsBody: string) {
  const tmpPath = path.join(__dirname, ".tmp.exec.ts");
  await fs.writeFile(tmpPath, wrapUserCode(tsBody), "utf8");
  const allowNet = process.env.ALLOW_NET || "";
  const args = ["run", "--quiet", "--no-prompt"];
  if (allowNet) args.push(`--allow-net=${allowNet}`);
  args.push(tmpPath);
  
  // Hard timeout for sandbox execution
  const { stdout, stderr } = await pExecFile("deno", args, { 
    env: process.env, 
    timeout: SANDBOX_TIMEOUT_MS 
  });
  
  if (stderr && stderr.trim()) console.error(stderr);
  
  // Enforce exactly one JSON line
  const lines = stdout.trim().split("\n").filter(l => l.trim());
  const jsonLines = lines.filter(l => {
    const trimmed = l.trim();
    return trimmed.startsWith("{") && trimmed.endsWith("}");
  });
  
  if (jsonLines.length !== 1) {
    throw new Error(
      `Expected exactly one JSON line, got ${jsonLines.length}. ` +
      `First few lines: ${lines.slice(0, 3).join(" | ")}`
    );
  }
  
  return JSON.parse(jsonLines[0]);
}

export async function runTask(task: string) {
  const code = await askModel(task);
  return runInDeno(code);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const task = process.argv.slice(2).join(" ") || "Use search_docs with query 'codemode' then summarize to 2 sentences.";
  runTask(task).then(r => console.log("Result:", r));
}
