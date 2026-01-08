#!/usr/bin/env tsx
/**
 * Run a task by prompting the model, getting TypeScript code, and executing it in a sandbox
 * This is the main orchestrator for the TS API approach
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import * as dotenv from 'dotenv';

dotenv.config();

interface TaskResult {
  success: boolean;
  output?: unknown;
  error?: string;
  code?: string;
  executionTimeMs: number;
  stdout: string;
  stderr: string;
}

/**
 * Extract TypeScript code from model response
 * Looks for ```typescript or ```ts code blocks
 */
function extractCode(response: string): string | null {
  const patterns = [
    /```typescript\n([\s\S]+?)\n```/,
    /```ts\n([\s\S]+?)\n```/,
    /```\n([\s\S]+?)\n```/,
  ];

  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Execute TypeScript code in a Deno sandbox
 * - No filesystem access
 * - No environment variables
 * - Limited network (only if explicitly allowed)
 * - Must print exactly one JSON line
 */
async function executeSandboxed(code: string): Promise<TaskResult> {
  const startTime = Date.now();
  
  // Create temporary directory for this execution
  const tmpDir = mkdtempSync(join(tmpdir(), 'mcp-task-'));
  const codePath = join(tmpDir, 'task.ts');
  
  // Wrap the code with bindings import
  const wrappedCode = `
import { bindings } from './bindings.ts';

async function main() {
  ${code}
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message, stack: err.stack }));
  Deno.exit(1);
});
`;

  writeFileSync(codePath, wrappedCode);

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    // Run with Deno for security isolation
    const deno = spawn('deno', [
      'run',
      '--no-prompt',
      '--no-config',
      // Security flags - deny everything by default
      '--deny-read',
      '--deny-write',
      '--deny-env',
      '--deny-net', // Enable --allow-net if tools need network
      '--deny-run',
      '--deny-ffi',
      '--deny-hrtime',
      codePath,
    ], {
      cwd: tmpDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    deno.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    deno.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    deno.on('close', (code) => {
      const executionTimeMs = Date.now() - startTime;
      
      // Cleanup
      rmSync(tmpDir, { recursive: true, force: true });

      if (code !== 0) {
        resolve({
          success: false,
          error: `Execution failed with code ${code}`,
          code: wrappedCode,
          executionTimeMs,
          stdout,
          stderr,
        });
        return;
      }

      // Parse the single JSON line
      const lines = stdout.trim().split('\n').filter(l => l.trim());
      if (lines.length !== 1) {
        resolve({
          success: false,
          error: `Expected exactly 1 JSON line, got ${lines.length}`,
          code: wrappedCode,
          executionTimeMs,
          stdout,
          stderr,
        });
        return;
      }

      try {
        const output = JSON.parse(lines[0]);
        resolve({
          success: true,
          output,
          code: wrappedCode,
          executionTimeMs,
          stdout,
          stderr,
        });
      } catch (e) {
        resolve({
          success: false,
          error: `Failed to parse JSON output: ${e}`,
          code: wrappedCode,
          executionTimeMs,
          stdout,
          stderr,
        });
      }
    });

    deno.on('error', (err) => {
      resolve({
        success: false,
        error: `Failed to spawn Deno: ${err.message}`,
        code: wrappedCode,
        executionTimeMs: Date.now() - startTime,
        stdout,
        stderr,
      });
    });
  });
}

/**
 * Prompt the model to generate TypeScript code for a task
 * This is a placeholder - integrate with your actual model client
 */
async function promptModel(task: string): Promise<string> {
  // TODO: Implement actual model prompting
  // This would call Claude, GPT-4, etc. with a prompt like:
  //
  // "Generate TypeScript code that uses the bindings object to accomplish this task: {task}
  //  You have access to: bindings.context7, bindings.chrome, bindings.shadcn, bindings.apple
  //  Print exactly one JSON line with the result.
  //  
  //  Example:
  //  const docs = await bindings.context7.get_library_docs({ ... });
  //  console.log(JSON.stringify({ docs }));
  // "

  console.error('[RunTask] Model prompting not yet implemented');
  console.error('[RunTask] Task:', task);
  
  // Return a placeholder response
  return `
\`\`\`typescript
// Example task code
const result = await bindings.context7.resolve_library_id({ libraryName: 'react' });
console.log(JSON.stringify({ result }));
\`\`\`
`;
}

/**
 * Main entry point
 */
async function main() {
  const task = process.argv[2] || 'Search for React documentation';
  
  console.error('='.repeat(80));
  console.error('MCP TypeScript API Task Runner');
  console.error('='.repeat(80));
  console.error(`Task: ${task}`);
  console.error('');

  // Step 1: Prompt model
  console.error('[1/3] Prompting model...');
  const modelResponse = await promptModel(task);
  
  // Step 2: Extract code
  console.error('[2/3] Extracting code...');
  const code = extractCode(modelResponse);
  
  if (!code) {
    console.error('❌ No code found in model response');
    process.exit(1);
  }
  
  console.error('Code extracted:');
  console.error(code);
  console.error('');
  
  // Step 3: Execute in sandbox
  console.error('[3/3] Executing in sandbox...');
  const result = await executeSandboxed(code);
  
  console.error('');
  console.error('='.repeat(80));
  console.error('Result:');
  console.error('='.repeat(80));
  console.error(`Success: ${result.success}`);
  console.error(`Execution time: ${result.executionTimeMs}ms`);
  
  if (result.success) {
    console.error('Output:');
    console.log(JSON.stringify(result.output, null, 2));
  } else {
    console.error(`Error: ${result.error}`);
    console.error('');
    console.error('Stdout:', result.stdout);
    console.error('Stderr:', result.stderr);
    process.exit(1);
  }
}

main();
