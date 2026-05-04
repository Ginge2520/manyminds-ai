# Database Schema

The app currently uses local file-backed adapters in `lib/users.ts` so the UI and API routes can be developed before the production database adapter is connected.

The production database target is Netlify Database, a managed Postgres database connected to the Netlify/GitHub deploy flow.

Initial migration:

```text
netlify/database/migrations/202605040001_manyminds_core.sql
```

Production tables:

## users

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Primary key |
| name | string | User display name |
| email | string | Unique, lowercase |
| passwordHash | string | Omit if using OAuth-only auth |
| plan | enum | `free`, `starter`, `pro`, `power`, `enterprise` |
| usageThisMonth | integer | Monthly agent run count |
| usageResetDate | datetime | Next usage reset date |
| onboarded | boolean | Redirect new users to onboarding until true |
| createdAt | datetime | Account creation time |
| updatedAt | datetime | Last update time |

## agent_runs

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Primary key |
| userId | string | Foreign key to users |
| planAtTime | enum | User plan when run happened |
| agentsUsed | integer | Number of agents requested |
| providerUsed | enum | `ollama`, `openai_standard`, `openai_premium`, `multi_model`, `custom` |
| tokensEstimated | integer | Estimated model usage |
| createdAt | datetime | Run creation time |

## conversations

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Primary key |
| userId | string | Foreign key to users |
| title | string | Display title |
| mode | enum | `standard`, `debate`, `developer` |
| selectedAgentIds | text[] | Agent IDs selected for the run |
| status | enum | `active`, `clarification_needed`, `complete`, `failed`, `archived` |
| createdAt | datetime | Creation time |
| updatedAt | datetime | Last update time |

## conversation_messages

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Primary key |
| conversationId | string | Foreign key to conversations |
| senderType | enum | `user`, `agent`, `system` |
| userId | string | User sender when applicable |
| agentId | string | Agent sender when applicable |
| agentName | string | Display name at time of message |
| agentRole | string | Role at time of message |
| replyToMessageId | string | Thread/reply reference |
| replyToAgentId | string | Agent reply reference |
| messageType | string | `idea`, `evidence`, `decision`, etc |
| content | text | Visible message body |
| confidence | decimal | 0 to 1 |
| assumptions | json | Listed assumptions |
| evidenceNeeded | json | Evidence checks needed |
| developerDetails | json | Developer Mode structured sections |
| createdAt | datetime | Message time |

## agent_memory_snapshots

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Primary key |
| conversationId | string | Foreign key to conversations |
| agentId | string | Agent ID |
| knows | json | What the agent currently knows |
| assumptions | json | What the agent is assuming |
| openQuestions | json | Questions still unresolved |
| createdAt | datetime | Snapshot time |

Monthly usage can be reset with a scheduled job that sets `usageThisMonth` to `0` when `usageResetDate` is reached and then advances `usageResetDate` to the first day of the next month.

Future paid account fields can be added later when paid tiers return.
