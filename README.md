# opencode-plugins

> **Finally — bash on Windows. No Git Bash, no WSL, no Cygwin.**

If you've ever tried running [OpenCode](https://opencode.ai) on a Windows machine, you know the pain. The shell fights you. Commands that work everywhere else break. Your options? Install a heavyweight compatibility layer or just suffer.

[**ps-bash**](https://github.com/standardbeagle/ps-bash) is a different answer. It's a native bash shell that runs on Windows without WSL, without Git Bash, without Cygwin — without any of the usual baggage. That makes it especially useful on cloud VMs and containers where you can't afford to install a full Linux subsystem just to get a working bash prompt.

This plugin wires ps-bash directly into OpenCode. Install it and forget about it.

## Why ps-bash?

- **No WSL required.** No virtualization layer, no kernel overhead, no `wsl --install` lottery.
- **No Git Bash.** No MSYS2 runtime, no dll headaches, no PATH conflicts.
- **No Cygwin.** No installation wizard from 2003.
- **Tiny footprint.** Ideal for cloud VMs and containers where every megabyte and every second of startup time counts.
- **It just works.** Standard Unix commands — `ls -la`, `grep -rn`, `find . -name "*.ts"`, `&&` chaining — all work the way OpenCode expects them to.

## Quick Start

Add to your OpenCode config (`~/.config/opencode/opencode.json` or project-level `opencode.json`):

```json
{
  "plugin": ["@standardbeagle/opencode-ps-bash"]
}
```

That's it. The plugin auto-installs ps-bash if it's not already present, sets it as your shell, and keeps things running. You shouldn't need to think about it again.

## What Actually Happens

On first load the plugin:

1. Checks if `ps-bash` is already installed — if not, downloads and installs it automatically
2. Sets `SHELL` to the ps-bash binary so OpenCode's bash tool uses it natively
3. On Windows, creates a thin wrapper to handle the way Bun spawns custom shells
4. Injects `SHELL` and `OPENCODE_PSBASH_PATH` into every shell environment
5. Updates the bash tool description so the AI knows Unix syntax is supported
6. Bootstraps a skill file for project context

## Tools

The plugin exposes two tools that OpenCode can use:

- **`psbash_status`** — Check whether ps-bash is installed and configured
- **`psbash_install`** — Install or reinstall ps-bash from GitHub releases

## Plugins

| Plugin  | Package                            | What it does                                       |
| ------- | ---------------------------------- | -------------------------------------------------- |
| ps-bash | `@standardbeagle/opencode-ps-bash` | Installs and configures ps-bash as the bash shell  |

---

## Development

This repo uses [Bun](https://bun.sh) workspaces and [Changesets](https://github.com/changesets/changesets) for versioning.

```bash
bun install                # install dependencies
bun run build              # build all plugins
bun run typecheck          # typecheck all plugins
bun run changeset          # add a changeset
bun run version-packages   # bump versions from changesets
bun run release            # build + publish to npm
```
