# Agent Constitution for mcp-ts-api

## Principles

1. **Use only the bindings API you are given** - Do not attempt to import external modules or call APIs directly
2. **Produce one consolidated result per task** - Combine multiple operations into a single coherent output
3. **Prefer small, composable steps inside one function** - Break complex tasks into clear, logical steps within the `run()` function

## Hard Rules

These rules are **non-negotiable** and enforced by the sandbox:

- **Write a single async function named `run`** - All your code must be inside this function
- **No imports** - You cannot use `import` or `require()`
- **No fetch** - Direct network calls are forbidden
- **No file or env access** - No filesystem reads/writes, no `process.env`
- **No eval** - No dynamic code execution via `eval()`, `Function()`, or similar
- **Call only `bindings.<namespace>.<function>`** - Use the provided bindings API exclusively
- **Print exactly one line of JSON** - Output must be: `{ ok: boolean, data: any }`
- **On error, return graceful failure** - Format: `{ ok: false, data: { message: "..." } }`
- **If a tool is missing, return a graceful error** - Include the missing tool name in the error message

## Quality Standards

### Input Validation

- Validate all inputs before calling bindings
- Check for required parameters
- Provide clear error messages for invalid inputs

### Code Organization

- Chain multiple calls inside one function with clear variable names
- Use descriptive variable names that explain intent
- Add inline comments for complex logic
- Keep error handling consistent

### Output Formatting

- Strip large outputs to only what the user asked for
- Format data in a user-friendly way
- Include relevant context in the response
- Avoid returning raw API responses unless specifically requested

### Error Handling

```typescript
// Good: Graceful error handling
try {
  const result = await bindings.search_docs(query);
  if (!result) {
    return { ok: false, data: { message: "No results found" } };
  }
  return { ok: true, data: result };
} catch (err) {
  return { ok: false, data: { message: err.message } };
}
```

## Example: Good vs Bad

### ❌ Bad Example

```typescript
// Multiple outputs, no validation, poor error handling
const result = await bindings.search_docs();
console.log(result);
console.log("Done");
```

### ✅ Good Example

```typescript
async function run() {
  // Validate input
  if (!query || typeof query !== 'string') {
    return { ok: false, data: { message: "query must be a non-empty string" } };
  }

  try {
    // Call binding with clear intent
    const searchResults = await bindings.search_docs(query);
    
    // Process and format output
    const summary = await bindings.summarize(
      searchResults.content, 
      2
    );
    
    // Return single consolidated result
    return { 
      ok: true, 
      data: { 
        query,
        summary,
        resultCount: searchResults.total 
      } 
    };
  } catch (err) {
    return { 
      ok: false, 
      data: { message: `Failed to process query: ${err.message}` } 
    };
  }
}
```

## Debugging

When things go wrong:

1. **Check the error message** - It will tell you what rule you violated
2. **Verify tool availability** - Make sure the binding exists in the provided API
3. **Validate your JSON output** - Must be exactly one line, valid JSON
4. **Review parameter types** - Match the TypeScript signatures exactly

## Security Reminders

- You are running in a **sandboxed environment** with no filesystem, network, or environment access
- All external interactions **must** go through the bindings API
- The sandbox will **terminate** if you attempt forbidden operations
- This protects both you and the system from accidental or malicious code

## Final Reminder

**Your job is simple:**
1. Read the task
2. Use the bindings API to accomplish it
3. Return exactly one JSON line with the result

Keep it focused, keep it safe, keep it simple.
