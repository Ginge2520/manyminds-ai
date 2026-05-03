# Database Schema Suggestion

The app currently uses typed in-memory adapters in `lib/users.ts` so the UI and API routes can be developed before a database is connected.

Recommended production tables:

## users

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Primary key |
| name | string | User display name |
| email | string | Unique, lowercase |
| passwordHash | string | Omit if using OAuth-only auth |
| plan | enum | `free`, `starter`, `pro`, `power`, `enterprise` |
| stripeCustomerId | string/null | Stripe customer reference |
| stripeSubscriptionId | string/null | Active subscription reference |
| usageThisMonth | integer | Monthly agent run count |
| usageResetDate | datetime | Next usage reset date |
| onboarded | boolean | Redirect new users to onboarding until true |
| createdAt | datetime | Account creation time |

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

Monthly usage can be reset with a scheduled job that sets `usageThisMonth` to `0` when `usageResetDate` is reached and then advances `usageResetDate` to the first day of the next month.
