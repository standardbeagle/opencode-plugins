# @standardbeagle/opencode-plugins

A Bun-powered monorepo of OpenCode server plugins.

## Plugins

| Plugin  | Package                            | Description                                                    |
| ------- | ---------------------------------- | -------------------------------------------------------------- |
| ps-bash | `@standardbeagle/opencode-ps-bash` | Installs and configures ps-bash as the bash shell for OpenCode |

## Development

This repo uses [Bun](https://bun.sh) workspaces.

```bash
# Install dependencies for all plugins
bun install

# Build all plugins
bun run build

# Typecheck all plugins
bun run typecheck
```

## Publishing

We use [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

```bash
# Add a changeset
bun run changeset

# Version packages
bun run version-packages

# Publish to npm
bun run release
```

## Installation

Add any plugin to your OpenCode config (`~/.config/opencode/opencode.json` or project `opencode.json`):

```json
{
  "plugin": ["@standardbeagle/opencode-ps-bash"]
}
```

Or use a local file plugin:

```json
{
  "plugin": ["./opencode-plugins/plugins/ps-bash/dist/index.js"]
}
```
