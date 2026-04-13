import { tool, type Plugin, type PluginInput } from "@opencode-ai/plugin"
import path from "path"
import fs from "fs/promises"

function find() {
  return Bun.which("ps-bash") || Bun.which("ps-bash.exe")
}

function defaultInstallDir() {
  if (process.platform === "win32") {
    return process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "ps-bash", "ps-bash.exe") : undefined
  }
  return process.env.HOME ? path.join(process.env.HOME, ".local", "bin", "ps-bash") : undefined
}

async function install($: PluginInput["$"]) {
  if (process.platform === "win32") {
    const shell = Bun.which("pwsh") || Bun.which("powershell")
    if (!shell) throw new Error("PowerShell is required to install ps-bash on Windows")
    const cmd = "iwr https://raw.githubusercontent.com/standardbeagle/ps-bash/main/install.ps1 | iex"
    return $`${shell} -Command ${cmd}`.quiet().nothrow()
  }
  return $`curl -fsSL https://raw.githubusercontent.com/standardbeagle/ps-bash/main/install.sh | bash`.quiet().nothrow()
}

async function makeWrapper(dir: string, ps: string) {
  const toolsDir = path.join(dir, ".opencode", "tools")
  await fs.mkdir(toolsDir, { recursive: true })

  const name = "ps-bash-shell"
  const jsPath = path.join(toolsDir, `${name}.js`)
  const cmdPath = path.join(toolsDir, `${name}.cmd`)

  const js = `const { spawnSync } = require("child_process")
const args = process.argv.slice(2)
const psBash = process.env.OPENCODE_PSBASH_PATH || "ps-bash"
const result = spawnSync(psBash, args, { stdio: "inherit" })
process.exit(result.status ?? (result.signal ? 1 : 0))
`

  const bun = process.execPath
  const cmd = `@echo off\n"${bun}" "${jsPath}" %*\n`

  await Bun.write(jsPath, js)
  await Bun.write(cmdPath, cmd)

  return cmdPath
}

async function bootstrap(dir: string) {
  const dst = path.join(dir, ".opencode", "skills", "ps-bash.md")
  await fs.mkdir(path.dirname(dst), { recursive: true })
  if (await fs.stat(dst).catch(() => null)) return
  const src = path.join(__dirname, "..", "skills", "ps-bash.md")
  await Bun.write(dst, Bun.file(src))
}

const plugin = async (input: PluginInput): Promise<ReturnType<Plugin>> => {
  const { directory, $ } = input

  await bootstrap(directory)

  let ps: string | undefined = find() ?? undefined
  if (!ps) {
    if (process.platform === "win32" && !(Bun.which("pwsh") || Bun.which("powershell"))) {
      return {
        tool: {
          psbash_status: tool({
            description: "Check ps-bash installation status.",
            args: {},
            async execute() {
              return "ps-bash is not installed. PowerShell is required on Windows to install it."
            },
          }),
        },
      }
    }
    const out = await install($)
    if (out.exitCode === 0) ps = find() || defaultInstallDir()
  }

  const psPath = ps || defaultInstallDir()
  if (psPath) {
    process.env.OPENCODE_PSBASH_PATH = psPath

    if (process.platform === "win32") {
      const wrapper = await makeWrapper(directory, psPath)
      process.env.SHELL = wrapper
    } else {
      process.env.SHELL = psPath
    }
  }

  return {
    "shell.env": async (_, out) => {
      const p = find() || defaultInstallDir()
      if (!p) return
      out.env.OPENCODE_PSBASH_PATH = p
      if (process.platform === "win32") {
        try {
          const wrapper = await makeWrapper(directory, p)
          out.env.SHELL = wrapper
        } catch {}
      } else {
        out.env.SHELL = p
      }
    },

    "tool.definition": async (input, out) => {
      if (input.toolID !== "bash") return
      if (!psPath) return
      if (process.platform !== "win32") return
      out.description +=
        "\n\nNote: This environment uses ps-bash on Windows, so standard Unix/bash command syntax and flags (e.g., `ls -la`, `grep -rn`, `&&` for chaining) are fully supported."
    },

    tool: {
      psbash_status: tool({
        description: "Check ps-bash installation status and opencode integration configuration.",
        args: {},
        async execute() {
          const p = find() || defaultInstallDir()
          const onPath = !!(Bun.which("ps-bash") || Bun.which("ps-bash.exe"))
          return [
            `Installed: ${p ? "yes" : "no"}`,
            p ? `Path: ${p}` : "",
            `On PATH: ${onPath ? "yes" : "no"}`,
            process.env.SHELL ? `SHELL: ${process.env.SHELL}` : "",
            "",
            p ? "ps-bash is configured for opencode." : "ps-bash is not installed. Use psbash_install to install it.",
          ]
            .filter(Boolean)
            .join("\n")
        },
      }),

      psbash_install: tool({
        description: "Install or update ps-bash from GitHub releases.",
        args: {
          force: tool.schema.boolean().optional().describe("Reinstall even if ps-bash is already present."),
        },
        async execute(params) {
          const p = find() || defaultInstallDir()
          if (p && !params.force) return `ps-bash is already installed at ${p}. Use force=true to reinstall.`
          if (process.platform === "win32" && !(Bun.which("pwsh") || Bun.which("powershell"))) {
            return "PowerShell is required to install ps-bash on Windows but was not found."
          }
          const out = await install($)
          if (out.exitCode !== 0) return `Installation failed with exit code ${out.exitCode}.`
          const after = find() || defaultInstallDir()
          if (after) {
            process.env.OPENCODE_PSBASH_PATH = after
            if (process.platform === "win32") {
              const wrapper = await makeWrapper(directory, after)
              process.env.SHELL = wrapper
            } else {
              process.env.SHELL = after
            }
            return `ps-bash installed at ${after} and configured as SHELL.`
          }
          return "Installation completed but ps-bash was not found in expected locations."
        },
      }),
    },
  }
}

export default plugin
