# Installation

Requirements: Node.js 18+.

```bash
npm install bemora
# or
pnpm add bemora
```

For the CLI and MCP server globally:

```bash
npm install -g bemora
bemora weather Cairo
bemora-mcp  # stdio MCP server for Cursor / Claude Desktop
```

## Developing bemora itself

`bemora/` is excluded from the root pnpm workspace on purpose (it ships standalone to npm), so install from inside it:

```bash
cd bemora
pnpm install --ignore-workspace
pnpm test
```

See [CONTRIBUTING.md](../CONTRIBUTING.md).
