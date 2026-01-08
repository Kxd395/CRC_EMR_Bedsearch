import { config } from "dotenv";
config();

/**
 * Replace this transport with your real MCP client.
 * For demo, we either echo or POST to MCP_HTTP_ENDPOINT.
 */
const DEFAULT_ENDPOINT = process.env.MCP_HTTP_ENDPOINT;

export async function callTool(toolName: string, params: Record<string, unknown>) {
  if (!DEFAULT_ENDPOINT) {
    // Demo path: echo back
    return { tool: toolName, params };
  }
  const res = await fetch(DEFAULT_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tool: toolName, params })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tool call failed: ${res.status} ${text}`);
  }
  return res.json();
}
