/** Typed bindings generated from MCP schema. Do not edit by hand. */
export declare namespace Bindings {
/** Full text search over local docs */
  function search_docs(query: string): Promise<unknown>;
/** Summarize text to N sentences */
  function summarize(text: string, sentences?: number): Promise<unknown>;
}
export type BindingsApi = typeof import('./bindings')['bindings'];