CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  usage_this_month INTEGER NOT NULL DEFAULT 0,
  usage_reset_date TIMESTAMPTZ NOT NULL,
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_plan_check CHECK (plan IN ('free', 'starter', 'pro', 'power', 'enterprise'))
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_plan_idx ON users (plan);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled agent run',
  mode TEXT NOT NULL DEFAULT 'standard',
  selected_agent_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversations_mode_check CHECK (mode IN ('standard', 'debate', 'developer')),
  CONSTRAINT conversations_status_check CHECK (status IN ('active', 'clarification_needed', 'complete', 'failed', 'archived'))
);

CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations (user_id);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations (updated_at DESC);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  agent_id TEXT,
  agent_name TEXT,
  agent_role TEXT,
  reply_to_message_id TEXT REFERENCES conversation_messages(id) ON DELETE SET NULL,
  reply_to_agent_id TEXT,
  message_type TEXT,
  content TEXT NOT NULL,
  confidence NUMERIC(4, 3),
  assumptions JSONB NOT NULL DEFAULT '[]'::JSONB,
  evidence_needed JSONB NOT NULL DEFAULT '[]'::JSONB,
  developer_details JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversation_messages_sender_check CHECK (sender_type IN ('user', 'agent', 'system')),
  CONSTRAINT conversation_messages_confidence_check CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

CREATE INDEX IF NOT EXISTS conversation_messages_conversation_id_idx ON conversation_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS conversation_messages_agent_id_idx ON conversation_messages (agent_id);

CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
  plan_at_time TEXT NOT NULL,
  mode TEXT NOT NULL,
  agents_used INTEGER NOT NULL,
  provider_used TEXT NOT NULL,
  model_used TEXT,
  tokens_estimated INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'complete',
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agent_runs_plan_check CHECK (plan_at_time IN ('free', 'starter', 'pro', 'power', 'enterprise')),
  CONSTRAINT agent_runs_mode_check CHECK (mode IN ('standard', 'debate', 'developer')),
  CONSTRAINT agent_runs_status_check CHECK (status IN ('complete', 'failed', 'blocked', 'clarification_needed'))
);

CREATE INDEX IF NOT EXISTS agent_runs_user_id_idx ON agent_runs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_runs_conversation_id_idx ON agent_runs (conversation_id);

CREATE TABLE IF NOT EXISTS agent_memory_snapshots (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  knows JSONB NOT NULL DEFAULT '[]'::JSONB,
  assumptions JSONB NOT NULL DEFAULT '[]'::JSONB,
  open_questions JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_memory_snapshots_conversation_id_idx ON agent_memory_snapshots (conversation_id, agent_id);
