# Copilot Customization Files

This repository includes GitHub Copilot customization files:

- `.github/agents/first.agent.md` — custom agent profile for **Lichess External Mover Expert**.
- `.github/copilot-instructions.md` — repo-wide guidance for Copilot.
- `.github/instructions/electron.instructions.md` — scoped guidance for Electron/CDP areas.

## How to use
1. Commit these files to the default branch.
2. In GitHub → Copilot **Agents** tab (or VS Code), select **Lichess External Mover Expert**.
3. Chat with the agent; it will adhere to the provided context.


## Use **Gemini 3 Pro** with this agent
GitHub Copilot does not pin the model in `.agent.md`. Select Gemini in the client:

### VS Code / GitHub.com
1. Open Copilot Chat and click the **model picker**.
2. Choose **Gemini 3 Pro** (if you don’t see it yet, it’s rolling out; Business/Enterprise admins may need to enable the policy).  
3. (Optional) **Manage Models → Bring your own key** and add your Gemini API key to use Gemini via your own quota.

### Organization policy (Business/Enterprise)
Ask an admin to enable **Gemini 3 Pro** in Copilot settings so the model appears for users.

> References: GitHub confirms agent/chat model selection via the picker and policy controls; Gemini 3 Pro rollout is in public preview.  
- https://github.blog/changelog/2025-11-18-gemini-3-pro-is-in-public-preview-for-github-copilot/  
- https://code.visualstudio.com/docs/copilot/customization/language-models  
- https://docs.github.com/en/copilot/reference/ai-models/supported-models
