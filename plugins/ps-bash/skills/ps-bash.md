# ps-bash

This project uses ps-bash as the bash shell for opencode.

## What is ps-bash?

ps-bash is a cross-platform bash shell for PowerShell that lets you use standard Unix commands on Windows (and improves the experience on all platforms).

## Environment

- `SHELL` is set to the ps-bash executable path
- `OPENCODE_PSBASH_PATH` points to the ps-bash executable
- Bash tool commands run through ps-bash automatically

## Commands

Prefer standard Unix syntax in bash commands:

- `ls -la`
- `cat file.txt`
- `grep pattern file`
- `find . -name "*.ts"`
- `ps aux | head`

These work on all platforms when ps-bash is active.
