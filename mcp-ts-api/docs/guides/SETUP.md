# Setup Guide

Complete setup instructions for the MCP TypeScript API system.

> **📋 Architecture Reference:** See [SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md) for complete architectural decisions and technical contracts.

## Prerequisites

- **Node.js** >= 20.0.0
- **npm** or **pnpm**
- **Deno** (for sandboxed execution)
  ```bash
  curl -fsSL https://deno.land/install.sh | sh
  ```
- **Bun** (optional, for apple-mcp server)
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /Users/VScode_Projects/EMR/mcp-ts-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure:

```bash
# Required: OpenAI API key for model execution
OPENAI_API_KEY=sk-proj-your-actual-key

# Optional: Override model (default: gpt-4o-mini)
MODEL=gpt-4o-mini

# Optional: Path to tool schema (default shown)
MCP_SCHEMA_PATH=src/schema.samples/tooling.schema.json

# Optional: Allow network access (comma-separated domains)
# ALLOW_NET=api.example.com,other.domain.com

# Optional: Sandbox timeout in milliseconds (default: 20000)
# SANDBOX_TIMEOUT_MS=20000
```

> **Security Note:** See [SSOT_DESIGN_AUTHORITY.md Section 3](./SSOT_DESIGN_AUTHORITY.md#3-security-model) for complete security model.

### 3. Create Server Working Directories

```bash
mkdir -p ~/.mcp/context7
mkdir -p ~/.mcp/apple
mkdir -p ~/.mcp/chrome
```

### 4. Verify Server Paths

Check that local server paths exist:

```bash
# shadcn-ui
ls ~/projects/DoseTap/shadcn-ui/build/index.js

# anna's-archive (if using)
ls ~/projects/School_Jefferson_DevTools/annas-mcp/annas-mcp
```

If these don't exist, either:
- Build them locally
- Update paths in `src/servers.json`
- Remove them from the manifest if not needed

### 5. Generate Bindings

```bash
npm run generate
```

This creates `src/bindings.ts` from the manifest.

### 6. Run Smoke Test

```bash
npm run smoke-test
```

Expected output:
```
================================================================================
MCP Bindings Smoke Test
================================================================================

Testing: Context7: Resolve library ID... ✅ PASS
   Result: {"libraryId":"/facebook/react"}

Testing: Context7: Invalid parameters... ✅ PASS (correctly failed)

================================================================================
Results: 2 passed, 0 failed
================================================================================
```

## Troubleshooting

### Server Won't Start

**Error**: `Server 'xxx' failed to start`

**Solutions**:
1. Check the command path in `src/servers.json`
2. Verify dependencies are installed (`npx`, `bunx`, `node`)
3. Check working directory exists
4. Review environment variables

### Deno Not Found

**Error**: `spawn deno ENOENT`

**Solution**:
```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Add to PATH (add to ~/.zshrc)
export PATH="$HOME/.deno/bin:$PATH"

# Verify
deno --version
```

### Bindings Generation Fails

**Error**: `Cannot find module './bindings.manifest.json'`

**Solution**:
```bash
# Ensure you're in the right directory
cd /Users/VScode_Projects/EMR/mcp-ts-api

# Check the file exists
ls src/bindings.manifest.json

# Regenerate
npm run generate
```

### Chrome Headless Issues

**Error**: Chrome fails to start or crashes

**Solutions**:
1. Install Chrome Canary if using `--channel=canary`
2. Verify path in `servers.json`: `CHROME_BIN`
3. Check permissions on `.cache/mcp/` directory
4. Try non-headless mode for debugging:
   ```json
   "--headless=false"
   ```

### Environment Variables Not Expanding

**Error**: `${HOME}` appears literally in paths

**Solution**: The runtime expands these. If you see errors:
1. Check `bindings.runtime.ts` `expandEnvVars` function
2. Verify environment variables are set: `echo $HOME`
3. Use absolute paths as a workaround

## Validation Checklist

Before using in production:

- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file created with actual secrets
- [ ] Working directories created (`~/.mcp/...`)
- [ ] Deno installed and in PATH
- [ ] Server paths verified (shadcn, anna's-archive)
- [ ] Bindings generated successfully
- [ ] Smoke test passes
- [ ] Type check passes (`npm run typecheck`)

## VS Code Integration

### Using Tasks

1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Tasks: Run Task"
3. Select a task:
   - **Full Setup** - Complete installation
   - **Generate Bindings** - Regenerate after manifest changes
   - **Smoke Test** - Validate connections
   - **Run Task** - Execute a task

### Recommended Extensions

Install these VS Code extensions for best experience:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript and JavaScript Language Features** - Built-in

## Advanced Configuration

### Custom Server Timeouts

Edit `src/servers.json`:
```json
{
  "mcpServers": {
    "slow-server": {
      "timeoutMs": 300000  // 5 minutes for slow operations
    }
  }
}
```

### Network Access in Sandbox

If tools need network access, modify `src/runTask.ts`:
```typescript
'--allow-net=api.example.com',  // Allow specific domain
// or
'--allow-net',  // Allow all network (less secure)
```

### Adding Environment Variables

1. Add to `.env`:
   ```bash
   MY_API_KEY=secret123
   ```

2. Add to server config in `servers.json`:
   ```json
   "env": {
     "MY_API_KEY": "${MY_API_KEY}"
   }
   ```

3. Runtime will expand and inject it

### Debugging Generated Code

Enable verbose logging:
```bash
npm run run-task "your task" 2>debug.log
cat debug.log
```

Save and replay generated code:
```bash
# Extract code from logs
# Save to replay.ts
# Run directly
deno run --deny-all replay.ts
```

## Production Hardening

Before deploying:

1. **Pin all versions** - Never use floating versions in `servers.json`
2. **Audit dependencies** - Run `npm audit`
3. **Minimize exposed tools** - Keep manifest minimal
4. **Enable logging** - Capture all tool calls for review
5. **Set up monitoring** - Track success rates and latencies
6. **Implement rate limiting** - Prevent abuse
7. **Regular updates** - Keep servers and dependencies current
8. **Backup configurations** - Version control all config files

## Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review server logs in stderr
3. Validate manifest schema
4. Test servers individually
5. Check MCP server documentation

## Next Steps

After setup is complete:

1. Read the main [README.md](./README.md)
2. Explore example tasks
3. Customize the manifest for your use case
4. Integrate model API in `runTask.ts`
5. Create your test suite
6. Measure and optimize
