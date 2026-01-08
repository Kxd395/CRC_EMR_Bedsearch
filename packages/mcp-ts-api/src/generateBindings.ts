import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = process.env.MCP_SCHEMA_PATH || path.join(__dirname, "schema.samples", "tooling.schema.json");
const manifestPath = path.join(__dirname, "bindings.manifest.json");
const outTs = path.join(__dirname, "bindings.ts");
const outDts = path.join(__dirname, "bindings.d.ts");

type ToolParam = { name: string; type: string; required?: boolean; description?: string };
type Tool = { name: string; description?: string; params?: ToolParam[]; returns?: string };
type Schema = { tools: Tool[]; serviceName?: string };

const typeMap: Record<string, string> = {
  string: "string",
  number: "number",
  boolean: "boolean",
  object: "Record<string, unknown>",
  any: "unknown"
};

function toTsType(t: string) {
  return typeMap[t] || "unknown";
}

function dts(schema: Schema) {
  const lines: string[] = [];
  lines.push("/** Typed bindings generated from MCP schema. Do not edit by hand. */");
  lines.push("export declare namespace Bindings {");
  for (const tool of schema.tools) {
    const fn = tool.name.replace(/[^a-zA-Z0-9_]/g, "_");
    const ps = (tool.params || []).map(p => `${p.name}${p.required ? "" : "?"}: ${toTsType(p.type)}`).join(", ");
    const doc = tool.description ? `/** ${tool.description} */` : "";
    lines.push(doc);
    lines.push(`  function ${fn}(${ps}): Promise<unknown>;`);
  }
  lines.push("}");
  lines.push("export type BindingsApi = typeof import('./bindings')['bindings'];");
  return lines.join("\n");
}

async function fileWrite(p: string, c: string) {
  await fs.writeFile(p, c, "utf8");
  console.log(`Wrote ${path.relative(process.cwd(), p)}`);
}

async function main() {
  const raw = await fs.readFile(schemaPath, "utf8");
  const schema = JSON.parse(raw) as Schema;

  // Load optional whitelist manifest
  let manifest: any = null;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    console.log("Loaded bindings.manifest.json - will filter tools");
  } catch {
    console.log("No bindings.manifest.json - using all tools from schema");
  }

  // Filter tools if manifest exists
  const keep = new Set<string>();
  if (manifest?.namespaces) {
    for (const ns of Object.values<any>(manifest.namespaces)) {
      for (const t of ns.tools) {
        // Handle both string and object tool definitions
        const toolName = typeof t === 'string' ? t : t.name;
        keep.add(toolName);
      }
    }
  }
  
  const tools = keep.size ? schema.tools.filter(t => keep.has(t.name)) : schema.tools;
  
  if (keep.size) {
    console.log(`Filtered to ${tools.length} of ${schema.tools.length} tools`);
  }

  // Create filtered schema for type generation
  const filteredSchema = { ...schema, tools };

  // Implementation
  const impl: string[] = [];
  impl.push("// Generated from MCP schema. Routes calls via bindings.runtime.ts");
  impl.push(`import { callTool } from "./bindings.runtime";`);
  impl.push("export const bindings = {");
  for (const tool of tools) {
    const fn = tool.name.replace(/[^a-zA-Z0-9_]/g, "_");
    const names = (tool.params || []).map(p => p.name);
    const argsObj = (tool.params || []).map(p => `${p.name}: ${p.name}`).join(", ");
    impl.push(`  async ${fn}(${names.join(", ")}) {`);
    impl.push(`    return callTool(${JSON.stringify(tool.name)}, { ${argsObj} });`);
    impl.push("  },");
  }
  impl.push("} as const;");

  await fileWrite(outDts, dts(filteredSchema));
  await fileWrite(outTs, impl.join("\n"));
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
