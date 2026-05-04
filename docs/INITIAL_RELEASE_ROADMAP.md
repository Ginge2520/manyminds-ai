# ManyMinds AI Initial Release Roadmap

Last updated: 2026-05-04

This roadmap tracks what needs to be completed before the first public test release of ManyMinds AI. The goal is not to finish every dream feature. The goal is to ship a stable, impressive first version that friends and early testers can use without Steven needing to explain every step.

## Release Goal

Initial release should let a user:

1. Open ManyMinds AI.
2. Understand what the app does quickly.
3. Create or enter an account.
4. Open Agent Lab.
5. Choose a team and mode.
6. Give the agents a task.
7. Watch agents collaborate in a clear chat.
8. Receive a useful answer, plan, or technical report.
9. Stop, redirect, or continue the conversation.

## Current Status

Completed or mostly completed:

- [x] Next.js app scaffold exists.
- [x] ManyMinds AI branding and logo added.
- [x] Premium dark SaaS visual direction started.
- [x] Agent Lab route exists at `/agent-test`.
- [x] Dashboard shell exists.
- [x] Mainstream-inspired AI agent names and nicknames added.
- [x] Agent avatars use symbol-style marks.
- [x] Backend agent API route exists.
- [x] Ollama backend provider exists for local testing.
- [x] OpenAI provider placeholder exists for future paid plans.
- [x] Team Build mode exists.
- [x] Debate Mode exists.
- [x] Developer Mode exists.
- [x] Output Mode removed from active modes.
- [x] Developer Mode has structured safe working sections.
- [x] Mode title and best-use description appear inside chat.
- [x] Prototype unlock mode exists for development.
- [x] Netlify deployment configuration exists.
- [x] Roadmap checklist is visible at the bottom of Agent Lab.

## Phase 1: Local Agent Experience

This phase makes the core product feel worth testing.

- [x] Improve agent collaboration so agents reliably respond to each other, not just the user.
- [x] Make final answers consistently useful and complete.
- [x] Stop models from showing raw JSON or malformed output.
- [x] Add stronger fallback cleanup when a model returns badly formatted content.
- [x] Make `funny` comments occasional, short, and clearly marked.
- [x] Make clarification questions pause the run until the user answers.
- [x] Add a visible “final answer” or “task complete” card at the end of a run.
- [x] Add a visible “clarification needed” card when the team cannot continue.
- [x] Add better loading and failure states for Ollama not running.
- [x] Add a simple “try again” button after a failed run.
- [x] Add a conversation reset button inside the chat.
- [ ] Test Team Build with at least 10 real prompts.
- [ ] Test Debate Mode with at least 5 decision prompts.
- [ ] Test Developer Mode with at least 5 technical prompts.

## Phase 2: UI Polish For Testers

This phase makes the app understandable for non-technical friends.

- [x] Make the first screen after login or entry obvious.
- [x] Ensure Agent Lab is clearly the main place to test.
- [x] Add a visible roadmap panel at the bottom of Agent Lab.
- [x] Simplify any copy that sounds too technical.
- [x] Add empty states that tell the user what to do next.
- [x] Improve mobile layout for the chat, agent selector, and mode selector.
- [x] Check all buttons have consistent size, shape, and hover states.
- [x] Make message bubbles easier to scan on small screens.
- [x] Add a clear “who is speaking and why” structure to every agent message.
- [x] Make Developer Mode feel clearly more premium than Team Build.
- [x] Remove or rewrite anything that feels generic.
- [ ] Run a visual pass in Safari and Chrome.

## Phase 3: Auth And Accounts

This phase makes public testing less chaotic.

- [ ] Decide whether initial release requires login or allows demo access.
- [ ] Fix sign-up so new users land in the app correctly.
- [ ] Fix login redirect issues.
- [ ] Fix logout and session clearing.
- [ ] Add a simple free account database record.
- [ ] Make new users default to the Free plan.
- [ ] Remove false “usage limit reached” errors for new users.
- [ ] Add a basic account page showing plan and usage.
- [ ] Add password reset or clearly mark it as coming soon.
- [ ] Confirm auth works on deployed Netlify environment.

## Phase 4: Data And Persistence

This phase stops the app from feeling like a temporary demo.

- [x] Choose production database.
- [ ] Wire persistent user records to Netlify Database.
- [ ] Wire persistent agent run records to Netlify Database.
- [ ] Save conversation history to Netlify Database.
- [ ] Save selected agents and preferred mode to Netlify Database.
- [ ] Add monthly usage reset structure.
- [ ] Add current shared memory placeholder.
- [ ] Add what each agent is assuming.
- [ ] Add what each agent knows.
- [ ] Add basic activity log.

## Phase 5: Provider And Model Setup

This phase prepares the app for real users who will not install Ollama.

- [ ] Decide first hosted AI provider for production.
- [ ] Wire OpenAI provider for server-side use.
- [ ] Add model selection per plan.
- [ ] Add provider error messages that users can understand.
- [ ] Add timeout handling for slow model calls.
- [ ] Add basic cost controls.
- [ ] Add logging for failed provider calls.
- [ ] Keep Ollama available for local development only.
- [ ] Ensure no API keys are exposed to the frontend.

## Phase 6: Plan Limits And Upgrade Flow

This phase can wait until the core app feels good.

- [ ] Re-enable Free plan limits.
- [ ] Re-enable mode restrictions.
- [ ] Lock Developer Mode to Pro and above.
- [ ] Decide whether Debate Mode is Pro-only or available earlier.
- [ ] Add upgrade prompts only where they make sense.
- [ ] Add pricing page copy review.
- [ ] Add Stripe Checkout.
- [ ] Add Stripe webhook.
- [ ] Add customer portal.
- [ ] Add plan sync to database.
- [ ] Test upgrade and downgrade flows.

## Phase 7: Trust And Control Layer

This phase makes the product feel safe and serious.

- [ ] Add pause all agents.
- [ ] Add stop current run.
- [ ] Add undo last agent action placeholder.
- [ ] Add reset conversation context.
- [ ] Add visible tool/action history.
- [ ] Add human approval checkpoints for risky actions.
- [ ] Add warning cards for missing source.
- [ ] Add warning cards for unsupported assumption.
- [ ] Add warning cards for agent disagreement.
- [ ] Add warning cards for low confidence.
- [ ] Add warning cards for conflicting evidence.

## Phase 8: Output And Export

This phase turns good conversations into useful documents.

- [ ] Design output/report workspace separately from chat modes.
- [ ] Add final answer summary card.
- [ ] Add copy-to-clipboard for final outputs.
- [ ] Add Markdown export.
- [ ] Add PDF export placeholder or working export.
- [ ] Add DOCX export placeholder or working export.
- [ ] Add product brief template.
- [ ] Add MVP roadmap template.
- [ ] Add technical build plan template.
- [ ] Add pitch deck outline template.

## Phase 9: Deployment And Testing

This phase gets the first public test release ready.

- [ ] Confirm Netlify build is green.
- [ ] Confirm production site loads from the domain.
- [ ] Add required environment variables in Netlify.
- [ ] Test on Safari desktop.
- [ ] Test on Chrome desktop.
- [ ] Test on iPhone Safari.
- [ ] Test on Android Chrome if available.
- [ ] Create 10 tester tasks for friends to try.
- [ ] Create a feedback form or feedback email link.
- [ ] Add simple error reporting plan.
- [ ] Add privacy policy draft.
- [ ] Add terms or acceptable-use draft if accounts are public.

## Phase 10: Initial Release Checklist

Do not release publicly until these are true:

- [ ] A new user can reach the Agent Lab without getting stuck.
- [ ] A user can send a task and get a useful answer.
- [ ] Agents visibly collaborate.
- [ ] No raw JSON appears in normal output.
- [ ] Chat works on mobile.
- [ ] The app explains each mode clearly.
- [ ] Developer Mode does not expose hidden chain-of-thought.
- [ ] The site works from the production domain.
- [ ] Provider keys are server-side only.
- [ ] Basic privacy and trust copy exists.
- [ ] At least 3 non-developer testers can use the app without live help.

## Suggested Initial Release Scope

Recommended first public test release:

- Agent Lab
- Team Build mode
- Debate Mode
- Developer Mode
- Free account or demo access
- Hosted AI provider
- Basic saved history
- Simple account page
- No live paid billing yet

Paid tiers, Stripe billing, full output exports, admin dashboards, and team accounts should come after the first tester release unless they become necessary earlier.

## Roadmap Maintenance Rule

After each meaningful change:

1. Mark completed tasks.
2. Add new tasks if the change reveals missing work.
3. Move tasks between phases if priorities change.
4. Keep this roadmap focused on initial release, not the entire long-term company vision.
