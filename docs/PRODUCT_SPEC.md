# ManyMinds AI Product Spec

Last updated: 2026-05-04

This is the living product spec for ManyMinds AI. Update this document after every meaningful product, UI, agent, backend, pricing, or deployment change so the app can be rebuilt from the spec if context is lost.

## Product Summary

ManyMinds AI is a multi-agent AI workspace where a user gives a task to a visible team of AI agents. The agents talk to the user and to each other in a chat-style interface, challenge weak ideas, ask for evidence, debate decisions, and produce useful product or technical outputs.

The product should feel like a premium messaging app crossed with a focused product team workspace. It should be clear, structured, founder-friendly, and slightly witty without becoming silly.

## Core Promise

Top AI agents. One team. One app.

ManyMinds AI gives users the feeling of having a small AI product team in the room: strategist, researcher, designer, builder, critic, and compliance checker.

## Current Development Status

The app is currently in local prototype development. Usage limits and paid mode restrictions are unlocked during development so the full product can be tested freely.

Prototype unlock flags:

```env
PROTOTYPE_UNLOCK_ALL=true
NEXT_PUBLIC_PROTOTYPE_UNLOCK_ALL=true
```

Restrictions should be reinstated before public release.

Public site lock:

```env
PUBLIC_SITE_UNLOCKED=false
```

When `PUBLIC_SITE_UNLOCKED` is not `true`, hosted non-local traffic should be rewritten to `/coming-soon`. Localhost remains open so development can continue without exposing the work-in-progress app on `www.manymindsai.com`.

## Current Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Server-side API routes
- Ollama for local/free testing
- OpenAI-ready provider abstraction for future paid plans
- Netlify deployment target

## Key Routes

- `/` main landing or app entry route
- `/coming-soon` public holding page while the hosted site is locked
- `/agent-test` current Agent Lab testing workspace
- `/dashboard` dashboard shell
- `/account` account page
- `/login` login page
- `/signup` sign-up page
- `/onboarding` onboarding page
- `/pricing` pricing page
- `/api/agents/run` backend route for agent runs

## In-App Roadmap

The Agent Lab page displays an Initial Release Checklist at the bottom of the page. This is a quick visual version of `docs/INITIAL_RELEASE_ROADMAP.md` so Steven can review the release path while using the app.

The roadmap panel should:

- Sit below the main Agent Lab experience.
- Use collapsible phase cards.
- Show completed and incomplete tasks clearly.
- Stay mobile-friendly.
- Be kept in sync with `docs/INITIAL_RELEASE_ROADMAP.md` after meaningful roadmap changes.

## Current Navigation

The app shell uses `DashboardChrome`.

Top navigation:

- Dashboard
- Agent Lab
- Account

`Agent Lab` is intentionally highlighted with a larger white pill because it is the main prototype workspace.

## Dashboard Entry

The dashboard should make the next action obvious. In the prototype, the primary dashboard CTA is `Open Agent Lab`, not an old usage-test form. The dashboard copy should tell the user that Agent Lab is the main workspace where they choose agents, select a mode, and give the team a task.

## Tester Copy Rules

Tester-facing copy should avoid unnecessary technical language. Prefer short, practical wording such as:

- `Agent Lab` instead of `Local AI lab`
- `Local model` instead of `Ollama backend`
- `Why this answer looks this way` instead of heavier internal labels
- `In the room` instead of generic selected-state copy

The setup area should show the simple sequence: pick agents, choose mode, send task.

## Brand

Name: ManyMinds AI

Tone:

- Premium
- Trustworthy
- Clear
- Practical
- Slightly witty
- Founder-friendly

Brand language:

- Not one AI assistant. A whole team.
- Top AI agents. One team. One app.
- Your AI product team.
- Agents that collaborate, debate, and build with a bit of banter.

## Logo

The ManyMinds AI logo is stored in:

- `public/assets/manyminds-ai-logo.png`
- `assets/manyminds-ai-logo.png`

The logo should be used in the main shell and auth/landing experiences.

## Core User Flow

1. User opens the app.
2. User enters or skips account flow during prototype testing.
3. User opens Agent Lab.
4. User selects an AI team.
5. User chooses a mode.
6. User opens the team chat.
7. User sends the first task.
8. One lead agent replies directly to the user.
9. Supporting agents talk to each other using `@Nickname` mentions.
10. Agents challenge, improve, research, plan, or clarify.
11. The lead agent produces a useful final answer or asks one clear clarification question.

## Agent Team

The current mainstream-inspired agent set is:

| Internal ID | Nickname | Full Name | Role | Purpose |
| --- | --- | --- | --- | --- |
| strategist | Chat | ChatGPT | Strategist | Shapes ideas, positioning, and final recommendations |
| researcher | Gem | Gemini | Researcher | Finds assumptions, evidence gaps, and market angles |
| designer | Cloud | Claude | Product Designer | Improves UX, user journeys, and product experience |
| builder | Pilot | GitHub Copilot | Builder | Turns ideas into features, tasks, and implementation plans |
| critic | Rok | Grok | Critic | Challenges weak assumptions and improves quality |
| compliance | Peri | Perplexity | Compliance Checker | Flags privacy, safety, claim, and trust risks |

Agent display rule:

- Nickname appears first in larger text.
- Full AI name appears after it in lighter text.
- Role appears beside the full name.
- Avatars use symbol-style marks rather than first letters.

## Agent Behaviour

Agents should not feel like isolated one-shot responses. They should:

- Reply directly to each other.
- Mention each other using `@Nickname`.
- Include reply metadata for internal agent messages so the UI can show `Replying to @Nickname`.
- Refer to the same agent only once in a message unless a different agent is being referenced.
- Build on specific previous points.
- Challenge weak assumptions.
- Add real work, not just describe what they would do.
- Ask the user one clear clarification question only when necessary.
- Produce a concrete answer, plan, draft, or output when possible.
- Include occasional funny comments, clearly marked as `funny`, without undermining professionalism.
- Funny comments should be short asides and should never replace useful task progress.

Agent typing state:

- Show a stacked team typing bubble.
- Include a random quirky or slightly rude comment about the AI team arguing, fact-checking, or taking too long.
- Do not show a second fixed typing sentence beside the animated dots; the changing funny comment is the only typing copy.
- Keep humour brief and product-safe.

## Modes

### Team Build

Best for everyday product tasks, quick ideas, feature shaping, and getting a useful answer without slowing the room down.

Expected behaviour:

- One lead agent responds to the user.
- Other agents discuss and improve the answer.
- Team produces a practical final response.

### Debate Mode

Best when the user needs the agents to argue through a choice, expose weak assumptions, and reach a stronger recommendation.

Expected behaviour:

- Researcher demands evidence.
- Critic challenges weak assumptions.
- Compliance Checker flags risks.
- Strategist summarises the final recommendation.

### Developer Mode

Best for technical planning, implementation notes, evidence tracking, risks, tests, and decision logs for serious build work.

Developer Mode must not reveal hidden chain-of-thought reasoning. It should show safe, useful working only:

- Reasoning summary
- Evidence used
- Evidence gaps
- Assumptions
- Trade-offs
- Decision log
- Risks
- Implementation steps
- Tests or checks
- Confidence score
- Source links or placeholders
- Model/tool actions taken

Developer Mode UI should feel more premium and technical than Team Build or Debate Mode.

## Mode Header Requirement

When a user is inside any chat mode, the top of the chat must show:

- Mode title
- Brief best-use description
- Small badges showing what the mode is for

Current badge examples:

- Team Build: Build, Chat, Answer
- Debate Mode: Challenge, Decision, Approve
- Developer Mode: Evidence, Risks, Tests

## Chat UI Requirements

The Agent Lab chat should feel closer to WhatsApp or Discord than a flat log.

Required:

- Clear chat bubbles
- User messages aligned separately
- Agent messages with visible avatar, nickname, full model name, role, message type, and confidence
- `@Nickname` mentions highlighted inline
- `Replying to @Nickname` chips for agent-to-agent replies
- Duplicate mentions of the same agent should render plainly after the first mention.
- Message type pills with meaningful colours
- Typing indicators
- Empty state before first message
- Mode title and best-use description at top
- Task complete card after a successful run
- Clarification needed card when agents need user input before continuing
- Try again action after a failed agent run
- Reset chat action inside the chat room
- Clear local model failure state for Ollama errors, including a practical fix and retry path
- Mobile chat header controls should wrap into a clean grid.
- Chat input should stack on mobile and become a pill-style row on larger screens.
- Message bubbles should use full width on tight mobile screens and shrink naturally on larger screens.
- Responsive mobile layout

Do not show generic “next” text below normal messages.

## Output Cleanup And Fallbacks

The backend should defend the chat UI from raw model formatting problems.

Current cleanup rules:

- Strip code fences and JSON wrappers before parsing model output.
- Extract the `content` field from valid or broken JSON when possible.
- If a model nests JSON inside the `content` field, unwrap it recursively.
- Remove obvious JSON field leakage before rendering messages.
- If a final answer is too thin, replace it with a structured fallback deliverable.
- Do not replace genuine clarification questions with fallback deliverables.
- If an internal agent reply is too vague or process-only, replace it with a concrete role-specific contribution.
- Debate Mode agents must directly answer or challenge the previous agent rather than producing disconnected viewpoints.

## Clarification Handling

If an agent produces a genuine clarification request, the run should stop and wait for the user. The UI then shows a `Clarification needed` card and the user can answer in the chat input. Agents should not continue building on a guessed answer when the blocker is real.

The clarification card must show only the actual question, or a short summarised version of it, in a large bold block. It should not show the full agent message, the agent's lead-in reasoning, or repeated `@Agent` references.

For broad business prompts, the agents should ask for missing constraints such as budget, market/location, or user skills before assuming them. For example, if the user asks what business to start and gives no budget, ask for the budget range before discussing whether the user can stretch it.

## Message Types

Current message types:

- idea
- evidence
- challenge
- decision
- action
- summary
- risk
- funny
- analysis
- architecture
- implementation
- test

Message type pills should be visually distinct because they help the user understand why the agent is speaking.

## Backend Agent Route

Route: `/api/agents/run`

Input:

```json
{
  "task": "string",
  "selectedAgents": ["strategist", "researcher"],
  "mode": "standard"
}
```

Supported modes:

- `standard`
- `debate`
- `developer`

Output:

```json
{
  "ok": true,
  "messages": []
}
```

Error output:

```json
{
  "ok": false,
  "code": "upgrade_required",
  "message": "Developer Mode is available on Pro and above."
}
```

## Netlify Backend And Database

Production backend target:

- Netlify hosts the Next.js app and API routes.
- GitHub pushes trigger Netlify builds and deploys.
- Netlify Database stores production account and chat data.

Database migration:

```text
netlify/database/migrations/202605040001_manyminds_core.sql
```

The migration creates:

- `users`
- `conversations`
- `conversation_messages`
- `agent_runs`
- `agent_memory_snapshots`

Setup guide:

```text
docs/NETLIFY_BACKEND_SETUP.md
```

Important: `lib/users.ts` still uses local file-backed development storage. Before public testing with real accounts, replace it with a Netlify Database-backed adapter.

## AI Providers

### Ollama

Used for local/free testing.

Default URL:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.1
```

Ollama must be called from the backend only.

### OpenAI

OpenAI provider is prepared for later paid plans.

Rules:

- Server-side only.
- No API keys exposed to frontend.
- If no key exists, throw a clear provider-not-configured error.

## Plans

Current planned tiers:

| Plan | Runs | Max Agents | Modes | Provider |
| --- | ---: | ---: | --- | --- |
| Free | 10/month | 3 | Team Build | Ollama |
| Starter | 75/month | 4 | Team Build | OpenAI standard |
| Pro | 250/month | 6 | Team Build, Debate, Developer | OpenAI premium |
| Power | 1000/month | 8 | Team Build, Debate, Developer | Multi-model |
| Enterprise | Custom | Custom | Team Build, Debate, Developer | Custom |

During prototype development all modes and usage are unlocked. Before launch, the backend must enforce limits again.

## Auth Status

Login and sign-up pages exist, but the current practical development focus is Agent Lab and real agent behaviour. Auth should be stabilised before public release.

Required before release:

- Reliable sign-up
- Reliable login
- Reliable logout
- Correct redirects
- New users land in the correct place
- Session persistence
- No false usage-limit blocks

## Billing Status

Paid tiers are designed but not active for launch testing yet.

Before public paid launch:

- Stripe Checkout integration
- Stripe webhook handling
- Customer portal
- Plan sync in database
- Usage reset logic
- Upgrade and downgrade flows

## Trust And Control Layer

Planned trust controls:

- Activity log
- Tool/action history
- Human approval checkpoints
- Undo last agent action
- Pause all agents
- Reset conversation context
- Show current shared memory
- Show what each agent knows
- Show what each agent is assuming

Warning states:

- Conflicting evidence
- Low confidence
- Unsupported assumption
- Missing source
- Agent disagreement

## Output Builder

An Output Builder panel was previously explored, but `Output Mode` has been removed from the active mode selector for now.

Future output deliverables may include:

- Product brief
- Feature list
- User personas
- Competitor analysis
- MVP roadmap
- Landing page copy
- Pitch deck outline
- Technical build plan

These should return later as an output/report workspace, not as the main chat mode until the agent flow is stable.

## Deployment Notes

The app must be deployed as a Next.js app, not as a static `index.html` upload.

Netlify configuration exists.

Production deployment must include required environment variables such as:

```env
AUTH_SECRET=
```

AI provider and payment keys must remain server-side.

## Current Known Product Priorities

Highest priority:

1. Make agents consistently collaborate and produce useful outputs.
2. Make Agent Lab smooth and obvious for non-technical testers.
3. Stabilise auth only after the local agent experience is strong.
4. Add database-backed users, runs, and history.
5. Reintroduce plan limits and paid modes after core experience works.

## Spec Maintenance Rule

After every meaningful app change:

1. Update this file.
2. Update `docs/INITIAL_RELEASE_ROADMAP.md` if the work affects launch readiness.
3. Note any changed routes, components, modes, plans, agent behaviour, or backend assumptions.
4. Keep this document practical enough that a new developer could rebuild the current product from it.
