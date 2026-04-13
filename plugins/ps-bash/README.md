# @standardbeagle/opencode-ps-bash

An OpenCode server plugin that installs and configures [ps-bash](https://github.com/standardbeagle/ps-bash) as the bash shell.

## What it does

- **Auto-installs ps-bash** if it is not already present on the system
- **Sets `SHELL` to ps-bash** so OpenCode's bash tool uses it automatically
- **Works around Windows shell-spawn behavior** by creating a thin `.cmd` wrapper that forwards commands to ps-bash
- **Injects `SHELL` and `OPENCODE_PSBASH_PATH`** into every shell environment via the `shell.env` hook
- **Updates the bash tool description** on Windows so the AI knows standard Unix syntax is supported
- **Provides AI tools** to check status and manually install/update ps-bash
- **Bootstraps a skill file** (`.opencode/skills/ps-bash.md`) for project context

## How it works

On **Linux / macOS**, the plugin simply points `SHELL` at the `ps-bash` binary. Bun's `spawn` with `shell: path` correctly invokes `ps-bash -c "command"`, so no wrapper is needed.

On **Windows**, Bun's `spawn` with a custom `shell` passes the command through a wrapper without a `-c` flag, which ps-bash does not understand in interactive mode. The plugin solves this by generating a small wrapper in `.opencode/tools/ps-bash-shell.cmd` (plus a companion `.js` script). The wrapper absorbs the invocation and forwards the original command to ps-bash, preserving quotes and special characters.

## Tools

- `psbash_status` — Check whether ps-bash is installed, on PATH, and configured as `SHELL`
- `psbash_install` — Install or reinstall ps-bash from GitHub releases

## Installation

Add to your OpenCode configuration (`~/.config/opencode/opencode.json` or project `opencode.json`):

```json
{
  "plugin": ["@standardbeagle/opencode-ps-bash"]
}
```

Or as a local file plugin:

```json
{
  "plugin": ["./opencode-plugins/plugins/ps-bash/dist/index.js"]
}
```
