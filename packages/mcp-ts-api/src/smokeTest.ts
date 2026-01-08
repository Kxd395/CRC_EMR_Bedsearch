#!/usr/bin/env tsx
/**
 * Smoke test that validates the bindings runtime and server connections
 * Run this after setup to ensure everything is wired correctly
 */

import { cleanup } from './bindings.runtime.js';

interface TestCase {
  name: string;
  namespace: string;
  tool: string;
  params: Record<string, unknown>;
  shouldSucceed: boolean;
}

const tests: TestCase[] = [
  {
    name: 'Context7: Resolve library ID',
    namespace: 'context7',
    tool: 'resolve_library_id',
    params: { libraryName: 'react' },
    shouldSucceed: true,
  },
  {
    name: 'Context7: Invalid parameters',
    namespace: 'context7',
    tool: 'resolve_library_id',
    params: {},
    shouldSucceed: false,
  },
];

async function runSmokeTest() {
  console.log('='.repeat(80));
  console.log('MCP Bindings Smoke Test');
  console.log('='.repeat(80));
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`Testing: ${test.name}... `);

    try {
      // Dynamically import bindings (generated file)
      const { bindings } = await import('./bindings.js');
      
      const ns = bindings[test.namespace as keyof typeof bindings];
      if (!ns) {
        throw new Error(`Namespace ${test.namespace} not found`);
      }

      const tool = ns[test.tool as keyof typeof ns];
      if (typeof tool !== 'function') {
        throw new Error(`Tool ${test.tool} not found in namespace ${test.namespace}`);
      }

      const result = await tool(test.params);

      if (test.shouldSucceed) {
        console.log('✅ PASS');
        console.log(`   Result:`, JSON.stringify(result).substring(0, 100));
        passed++;
      } else {
        console.log('❌ FAIL (expected to fail but succeeded)');
        failed++;
      }
    } catch (error) {
      if (!test.shouldSucceed) {
        console.log('✅ PASS (correctly failed)');
        passed++;
      } else {
        console.log('❌ FAIL');
        console.log(`   Error: ${error}`);
        failed++;
      }
    }

    console.log('');
  }

  console.log('='.repeat(80));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(80));

  await cleanup();

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTest();
