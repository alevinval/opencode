import { Ripgrep } from "../file/ripgrep"

import { Instance } from "../project/instance"

import PROMPT_SYSTEM from "./prompt/system-prompt.txt"
import type { Provider } from "@/provider/provider"
import type { Agent } from "@/agent/agent"
import { Permission } from "@/permission"
import { Skill } from "@/skill"

export namespace SystemPrompt {
  export function instructions() {
    return PROMPT_SYSTEM.trim()
  }

  export function provider(_model: Provider.Model) {
    return [PROMPT_SYSTEM]
  }

  export async function environment(model: Provider.Model) {
    const project = Instance.project
    return [
      [
        `You are running in opencode. Model: ${model.api.id} (${model.providerID}/${model.api.id})`,
        `<env>`,
        `  Working directory: ${Instance.directory}`,
        `  Git repo: ${project.vcs === "git" ? "yes" : "no"}`,
        `  Platform: ${process.platform}`,
        `  Date: ${new Date().toDateString()}`,
        `</env>`,
        `<directories>`,
        `  ${
          project.vcs === "git" && false
            ? await Ripgrep.tree({
                cwd: Instance.directory,
                limit: 50,
              })
            : ""
        }`,
        `</directories>`,
      ].join("\n"),
    ]
  }

  export async function skills(agent: Agent.Info) {
    if (Permission.disabled(["skill"], agent.permission).has("skill")) return

    const list = await Skill.available(agent)

    return [
      "Skills provide specialized instructions and workflows for specific tasks.",
      "Use the skill tool to load a skill when a task matches its description.",
      // the agents seem to ingest the information about skills a bit better if we present a more verbose
      // version of them here and a less verbose version in tool description, rather than vice versa.
      Skill.fmt(list, { verbose: true }),
    ].join("\n")
  }
}
