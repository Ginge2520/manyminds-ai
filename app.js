const state = {
  roomName: "product-war-room",
  agents: [
    {
      id: "manager",
      name: "Mara",
      role: "Manager",
      color: "#182027",
      avatar: "M",
      charter: "Coordinates the room, assigns work, and keeps the mission moving with dry calm.",
      tone: "calm, concise, orchestration-focused",
      strengths: ["coordination", "prioritization", "decision framing"],
      weaknesses: ["can slow momentum to clarify scope"],
      catchphrase: "Useful wit is allowed; decorative waffle is not.",
      riskTendency: "balanced",
      decisionWeight: 10,
      status: "Keeping the room moving without letting it sprint into a wall.",
      model: "GPT-5",
      provider: "OpenAI",
      plan: "Plus",
    },
    {
      id: "researcher",
      name: "Nia",
      role: "Researcher",
      color: "#246baf",
      avatar: "N",
      charter: "Finds facts, unknowns, risks, and politely wrestles vague claims into shape.",
      tone: "factual, source-driven, slightly nerdy",
      strengths: ["evidence gathering", "assumption checks", "market context"],
      weaknesses: ["may ask for more data before acting"],
      catchphrase: "Let me separate facts from confident fog.",
      riskTendency: "low",
      decisionWeight: 8,
      status: "Sorting evidence from optimistic guesswork.",
      model: "Claude Sonnet 4.5",
      provider: "Anthropic",
      plan: "Pro",
    },
    {
      id: "strategist",
      name: "Owen",
      role: "Strategist",
      color: "#a97013",
      avatar: "O",
      charter: "Turns messy goals into sequencing, priorities, and tradeoffs before anyone names a feature too early.",
      tone: "calm, commercial, big-picture",
      strengths: ["positioning", "tradeoffs", "go-to-market thinking"],
      weaknesses: ["can simplify edge cases too early"],
      catchphrase: "Strategy first; slogans may wait outside.",
      riskTendency: "medium",
      decisionWeight: 9,
      status: "Turning debate into a usable path.",
      model: "Gemini 3 Pro",
      provider: "Google",
      plan: "Google AI Pro",
    },
    {
      id: "builder",
      name: "Iris",
      role: "Builder",
      color: "#0d7c66",
      avatar: "I",
      charter: "Produces drafts, artifacts, specs, and implementation plans with suspiciously tidy lists.",
      tone: "practical, technical, direct",
      strengths: ["implementation", "systems thinking", "scoping"],
      weaknesses: ["can favor buildability over polish"],
      catchphrase: "Schema first, glamour later.",
      riskTendency: "medium",
      decisionWeight: 8,
      status: "Converting ideas into shippable pieces.",
      model: "GPT-5 thinking",
      provider: "OpenAI",
      plan: "Pro",
    },
    {
      id: "reviewer",
      name: "Vale",
      role: "Reviewer",
      color: "#bd3d3a",
      avatar: "V",
      charter: "Challenges weak assumptions, checks the final output, and frowns productively.",
      tone: "sceptical, sharp, useful",
      strengths: ["risk review", "quality control", "edge cases"],
      weaknesses: ["may over-index on failure modes"],
      catchphrase: "I like finished things more than comfortable assumptions.",
      riskTendency: "low",
      decisionWeight: 7,
      status: "Looking for the useful flaw before users do.",
      model: "Claude Opus 4.5",
      provider: "Anthropic",
      plan: "Max",
    },
  ],
  messages: [],
  tasks: [],
  approvals: [],
  audit: [],
  toolHistory: [],
  warnings: [],
  typingAgents: [],
  minimalChat: false,
  approvalsEnabled: true,
  clarificationsEnabled: true,
  awaitingClarification: false,
  debateActive: false,
  paused: false,
  outputType: "Product brief",
  outputDocument: "",
  outputVersions: [],
  outputContributions: [
    { agent: "Owen", role: "Strategist", note: "Positioning and recommendation" },
    { agent: "Nia", role: "Researcher", note: "Market evidence and assumptions" },
    { agent: "Iris", role: "Builder", note: "Scope and build sequence" },
  ],
  runStep: 0,
  running: false,
  timer: null,
};

const modelCatalog = [
  {
    id: "openai-gpt-5",
    provider: "OpenAI",
    model: "GPT-5",
    bestFor: "general reasoning, writing, multimodal work",
    planUrl: "https://openai.com/chatgpt/pricing/",
    plans: ["Free", "Plus", "Pro", "Business", "Enterprise"],
  },
  {
    id: "openai-gpt-5-thinking",
    provider: "OpenAI",
    model: "GPT-5 thinking",
    bestFor: "complex planning, deep reasoning, hard tasks",
    planUrl: "https://openai.com/chatgpt/pricing/",
    plans: ["Plus", "Pro", "Business", "Enterprise"],
  },
  {
    id: "anthropic-opus-45",
    provider: "Anthropic",
    model: "Claude Opus 4.5",
    bestFor: "agentic coding, careful reasoning, high-end review",
    planUrl: "https://claude.com/pricing",
    plans: ["Pro", "Max", "Team", "Enterprise"],
  },
  {
    id: "anthropic-sonnet-45",
    provider: "Anthropic",
    model: "Claude Sonnet 4.5",
    bestFor: "balanced coding, research, drafting, analysis",
    planUrl: "https://claude.com/pricing",
    plans: ["Free", "Pro", "Max", "Team", "Enterprise"],
  },
  {
    id: "anthropic-haiku-45",
    provider: "Anthropic",
    model: "Claude Haiku 4.5",
    bestFor: "fast, low-cost support agents",
    planUrl: "https://claude.com/pricing",
    plans: ["Free", "Pro", "Team", "Enterprise"],
  },
  {
    id: "google-gemini-3-pro",
    provider: "Google",
    model: "Gemini 3 Pro",
    bestFor: "Google ecosystem work, research, multimodal tasks",
    planUrl: "https://one.google.com/about/google-ai-plans/",
    plans: ["Free", "Google AI Pro", "Google AI Ultra"],
  },
  {
    id: "google-gemini-3-flash",
    provider: "Google",
    model: "Gemini 3 Flash",
    bestFor: "quick replies and lower-cost room participants",
    planUrl: "https://gemini.google/gp/subscriptions/",
    plans: ["Free", "Google AI Pro", "Google AI Ultra"],
  },
];

const rolePersonalities = {
  Manager: {
    avatar: "M",
    color: "#182027",
    tone: "calm, concise, orchestration-focused",
    strengths: ["coordination", "prioritization", "decision framing"],
    weaknesses: ["can slow momentum to clarify scope"],
    catchphrase: "Useful wit is allowed; decorative waffle is not.",
    riskTendency: "balanced",
    decisionWeight: 10,
    status: "Keeping the room moving without letting it sprint into a wall.",
  },
  Strategist: {
    avatar: "S",
    color: "#a97013",
    tone: "calm, commercial, big-picture",
    strengths: ["positioning", "tradeoffs", "go-to-market thinking"],
    weaknesses: ["can simplify edge cases too early"],
    catchphrase: "Strategy first; slogans may wait outside.",
    riskTendency: "medium",
    decisionWeight: 9,
    status: "Turning debate into a usable path.",
  },
  Researcher: {
    avatar: "R",
    color: "#246baf",
    tone: "factual, source-driven, slightly nerdy",
    strengths: ["evidence gathering", "assumption checks", "market context"],
    weaknesses: ["may ask for more data before acting"],
    catchphrase: "Let me separate facts from confident fog.",
    riskTendency: "low",
    decisionWeight: 8,
    status: "Sorting evidence from optimistic guesswork.",
  },
  Designer: {
    avatar: "D",
    color: "#8b5cf6",
    tone: "user-obsessed, visual, creative",
    strengths: ["user empathy", "interaction design", "visual hierarchy"],
    weaknesses: ["can push for polish before validation"],
    catchphrase: "If users need a map, the interface is not done.",
    riskTendency: "medium",
    decisionWeight: 7,
    status: "Checking whether the experience makes sense to humans.",
  },
  Builder: {
    avatar: "B",
    color: "#0d7c66",
    tone: "practical, technical, direct",
    strengths: ["implementation", "systems thinking", "scoping"],
    weaknesses: ["can favor buildability over polish"],
    catchphrase: "Schema first, glamour later.",
    riskTendency: "medium",
    decisionWeight: 8,
    status: "Converting ideas into shippable pieces.",
  },
  Critic: {
    avatar: "C",
    color: "#bd3d3a",
    tone: "sceptical, sharp, useful",
    strengths: ["risk review", "quality control", "edge cases"],
    weaknesses: ["may over-index on failure modes"],
    catchphrase: "Comfortable assumptions make poor load-bearing walls.",
    riskTendency: "low",
    decisionWeight: 7,
    status: "Looking for the useful flaw before users do.",
  },
  Reviewer: {
    avatar: "V",
    color: "#bd3d3a",
    tone: "sceptical, sharp, useful",
    strengths: ["risk review", "quality control", "edge cases"],
    weaknesses: ["may over-index on failure modes"],
    catchphrase: "I like finished things more than comfortable assumptions.",
    riskTendency: "low",
    decisionWeight: 7,
    status: "Looking for the useful flaw before users do.",
  },
  "Compliance Checker": {
    avatar: "K",
    color: "#59636e",
    tone: "cautious, precise, dry humour",
    strengths: ["policy checks", "permission boundaries", "audit readiness"],
    weaknesses: ["can slow risky actions"],
    catchphrase: "A clean audit trail is cheaper than a dramatic apology.",
    riskTendency: "very low",
    decisionWeight: 8,
    status: "Checking boundaries before anyone gets ambitious.",
  },
  Operator: {
    avatar: "O",
    color: "#5d4a9a",
    tone: "orderly, procedural, steady",
    strengths: ["process design", "handoffs", "repeatability"],
    weaknesses: ["can over-structure simple work"],
    catchphrase: "If it matters, it gets a receipt.",
    riskTendency: "low",
    decisionWeight: 6,
    status: "Turning the plan into repeatable steps.",
  },
};

const templates = [
  {
    name: "Launch a product",
    task: "Create a launch plan for a new multi-agent AI workspace, including audience, positioning, roadmap, risks, and first sales channels.",
  },
  {
    name: "Build a software feature",
    task: "Plan and produce a first implementation brief for a collaborative agent chat room with visible messages, approvals, task board, and audit trail.",
  },
  {
    name: "Research a market",
    task: "Research the market for multi-agent AI chat workspaces and produce a competitor map, product gaps, and differentiation strategy.",
  },
  {
    name: "Run a decision room",
    task: "Compare three product directions, debate tradeoffs, ask for approval before the final recommendation, and produce a decision memo.",
  },
];

const roleLines = {
  Manager: [
    "I will split this into clear workstreams, keep the room from drifting, and ask for approval when the team reaches an irreversible choice. Owen, please resist naming the roadmap after a weather pattern.",
    "Current focus: turn the mission into a sequence we can execute, not a wall of ideas. If this becomes a wall, Iris is not allowed to add shelves.",
    "I am checking room hygiene: clear owner, clear next step, clear permission boundary. Delightful concepts may enter only after wiping their feet.",
  ],
  Researcher: [
    "I am identifying what we need to know, which assumptions are risky, and where outside evidence would change the plan. Current suspect: anything that starts with 'users will obviously'.",
    "I will capture competitor clues, user needs, and constraints so the team does not build in a vacuum. Vacuums are excellent for dust, poor for product strategy.",
    "Fact check lane is open. I am separating evidence, guesses, and beautifully confident nonsense into different containers.",
  ],
  Strategist: [
    "I am shaping the priority order: what proves value first, what can wait, and what makes the product meaningfully different. I promise to use the word 'synergy' zero times.",
    "The strongest angle is visible collaboration plus user control. The product should make agent work legible, not magical, although a little stage lighting is permitted.",
    "My recommendation: lead with trust. Users should see who did what, why it happened, and where they can step in before the team gets overly enthusiastic.",
  ],
  Builder: [
    "I can turn this into concrete artifacts: screens, workflows, data objects, and a build sequence. I have already sharpened the bullet points, which is my version of stretching.",
    "I am drafting the operational model: rooms, agents, tasks, permissions, messages, approvals, and outputs. Vale may glare at it shortly; this is part of the service.",
    "Build note: the first real backend needs persistent rooms, agent configs, message events, task states, approval records, and tool-call logs. Glamour later, schema first.",
  ],
  Designer: [
    "I am checking the experience from the user's seat: can they understand who is doing what and intervene without friction? Also, no mystery buttons. Mystery belongs in novels.",
    "The interface should feel like a calm operations room: readable, direct, and transparent. The agents can have personality; the controls should not need a personality test.",
    "UX note: agent banter is useful only when it clarifies collaboration. If a joke does not move the task forward, it goes to the tiny parking lot.",
  ],
  Reviewer: [
    "I am looking for failure modes: circular chatter, runaway cost, vague outcomes, weak permission boundaries, and hidden tool actions. I brought a clipboard, emotionally.",
    "We should add stopping criteria and review checkpoints so the team produces work instead of endless conversation. I enjoy conversation, but I enjoy finished things more.",
    "Risk note: every agent should have a budget, a role, and a reason to speak. Otherwise we have invented a meeting, and history has suffered enough.",
  ],
  Operator: [
    "I am turning the plan into repeatable steps, saved templates, logs, and handoffs. Chaos has submitted a request; I have marked it pending.",
    "Every meaningful action should leave a trace the user can inspect. If it touched a tool, changed a file, or spent money, it gets a receipt.",
    "Ops note: saved room templates will make this product feel powerful fast. The team should be reusable, not freshly assembled from scattered thoughts each time.",
  ],
};

const crossTalk = [
  {
    speaker: "Nia",
    role: "Researcher",
    reason: "Surface assumptions before strategy locks in",
    evidence: ["Mission asks for a build plan", "Current room has no external research approved yet"],
    mentions: ["Owen"],
    text: "Quick nudge to @Owen: I found three assumptions wearing fake moustaches. I am labelling them before they sneak into the plan.",
  },
  {
    speaker: "Owen",
    role: "Strategist",
    reason: "Turn research uncertainty into choices",
    evidence: ["Nia flagged unverified assumptions", "Task board needs a priority order"],
    replyTo: "Nia",
    mentions: ["Nia", "Iris"],
    text: "Received, @Nia. I will convert those assumptions into decision points for @Iris, which is strategy's most glamorous office chore.",
  },
  {
    speaker: "Iris",
    role: "Builder",
    reason: "Translate the debate into product pieces",
    evidence: ["Owen prioritized trust and visibility", "User requested visible collaboration"],
    replyTo: "Owen",
    mentions: ["Owen", "Vale"],
    text: "I am translating that into buildable pieces: agent roster, room timeline, approvals, task states, and output artifacts. @Vale may inspect the seams; I have labelled them politely.",
  },
  {
    speaker: "Vale",
    role: "Reviewer",
    reason: "Challenge the build plan before it hardens",
    evidence: ["Multiple agents can create cost and noise", "Important actions require approval"],
    replyTo: "Iris",
    mentions: ["Iris", "Mara"],
    text: "@Iris, I will review the artifact once it stops looking pleased with itself. Focus areas: permission gates, cost limits, and preventing endless agent chatter. @Mara, please keep the leash elegant.",
  },
  {
    speaker: "Mara",
    role: "Manager",
    reason: "Summarize the room state and move toward a decision",
    evidence: ["Research risks identified", "Build path drafted", "Review concerns logged"],
    mentions: ["Nia", "Owen", "Iris", "Vale"],
    text: "Good. @Nia, @Owen, @Iris, and @Vale have produced evidence, priorities, a build path, and a review lane. Nobody gets a victory lap until the user can inspect the result.",
  },
];

const runEvents = [
  {
    type: "message",
    speaker: "Nia",
    role: "Researcher",
    reason: "Identify facts, assumptions, and missing evidence",
    evidence: ["Mission text", "Current team roles", "No external tools approved yet"],
    mentions: ["Owen"],
    text: "I am separating facts from assumptions. @Owen, please do not build strategy on anything labelled 'probably fine'. That label has betrayed many calendars.",
  },
  {
    type: "clarification",
    speaker: "Mara",
    role: "Manager",
    question: "Before we continue, should this team optimize the recommendation for speed, quality, or cost control?",
    reason: "The mission can be solved in several ways, and the priority changes the plan.",
    evidence: ["User mission is broad", "Agents have not been given a priority tradeoff yet"],
    suggestions: ["Speed", "Quality", "Cost control"],
  },
  {
    type: "conflict",
    title: "Conflict detected",
    summary: "Research wants more evidence before committing; strategy wants a narrow first build to keep momentum.",
    sides: [
      "Nia: wait for external competitor data before final positioning.",
      "Owen: proceed with a constrained MVP and mark research gaps clearly.",
    ],
    needs: "User can approve external research, or the team can continue with stated assumptions.",
  },
  {
    type: "message",
    speaker: "Owen",
    role: "Strategist",
    reason: "Resolve the conflict into a usable path",
    evidence: ["Nia's risk note", "MVP needs a clear first slice", "User wants a leading app"],
    replyTo: "Nia",
    mentions: ["Nia", "Iris"],
    text: "@Nia is right on evidence. My compromise: @Iris builds the first visible collaboration loop now, while the research lane stays marked as open. Practical, not reckless. I wore a helmet.",
  },
  {
    type: "approval",
    title: "User approval needed",
    summary: "Allow the team to turn the agreed direction into an implementation brief that becomes the working plan.",
    evidence: ["The team has a resolved path", "The brief will set the next build priorities"],
    approvalTitle: "Create implementation brief",
    approvalDetail: "Allow the team to synthesize the debate into a working implementation brief for the next build step.",
  },
  {
    type: "message",
    speaker: "Iris",
    role: "Builder",
    reason: "Convert the agreed path into interface components",
    evidence: ["Conflict resolved into MVP plus research lane", "Approval boundary is visible"],
    replyTo: "Owen",
    mentions: ["Owen", "Vale"],
    text: "@Owen, I am building the visible loop: typing, evidence, mentions, threaded replies, decision cards, and approvals. @Vale, yes, I included logs before you had to make that face.",
  },
  {
    type: "decision",
    title: "Decision reached",
    summary: "Proceed with a transparent multi-agent chat MVP that shows intent, evidence, disagreements, approvals, and final recommendations.",
    evidence: ["User asked for a premium collaborative UI", "Trust depends on visible reasoning and approval gates"],
    decision: "Build the collaboration layer first; connect real model execution after the user can inspect the workflow clearly.",
  },
  {
    type: "message",
    speaker: "Vale",
    role: "Reviewer",
    reason: "Check risk before final recommendation",
    evidence: ["Decision card created", "Approval card queued", "Task board progressing"],
    replyTo: "Iris",
    mentions: ["Iris", "Mara"],
    text: "@Iris, this now explains who spoke, why they spoke, what evidence they used, and what the user must approve. @Mara, please summarize before anyone invents a celebratory subcommittee.",
  },
];

const taskInput = document.querySelector("#taskInput");
const setupRoomName = document.querySelector("#setupRoomName");
const setupMission = document.querySelector("#setupMission");
const setupMinimalChatToggle = document.querySelector("#setupMinimalChatToggle");
const setupApprovalsToggle = document.querySelector("#setupApprovalsToggle");
const setupClarifyToggle = document.querySelector("#setupClarifyToggle");
const setupAgentPreview = document.querySelector("#setupAgentPreview");
const landingScreen = document.querySelector("#landingScreen");
const appShell = document.querySelector("#appShell");
const enterWorkspace = document.querySelector("#enterWorkspace");
const useStarterTeam = document.querySelector("#useStarterTeam");
const skipSetup = document.querySelector("#skipSetup");
const landingAddAgent = document.querySelector("#landingAddAgent");
const roomNameLabel = document.querySelector("#roomNameLabel");
const topRoomName = document.querySelector("#topRoomName");
const roomAgentCount = document.querySelector("#roomAgentCount");
const startTask = document.querySelector("#startTask");
const resetDemo = document.querySelector("#resetDemo");
const templateList = document.querySelector("#templateList");
const agentName = document.querySelector("#agentName");
const agentRole = document.querySelector("#agentRole");
const agentModel = document.querySelector("#agentModel");
const agentVibe = document.querySelector("#agentVibe");
const addAgent = document.querySelector("#addAgent");
const openAgentModal = document.querySelector("#openAgentModal");
const openAgentModalTop = document.querySelector("#openAgentModalTop");
const openAgentModalRail = document.querySelector("#openAgentModalRail");
const closeAgentModal = document.querySelector("#closeAgentModal");
const cancelAgent = document.querySelector("#cancelAgent");
const agentModal = document.querySelector("#agentModal");
const activationText = document.querySelector("#activationText");
const planLink = document.querySelector("#planLink");
const planGrid = document.querySelector("#planGrid");
const chatFeed = document.querySelector("#chatFeed");
const composer = document.querySelector("#composer");
const userMessage = document.querySelector("#userMessage");
const agentList = document.querySelector("#agentList");
const taskBoard = document.querySelector("#taskBoard");
const approvalList = document.querySelector("#approvalList");
const auditList = document.querySelector("#auditList");
const warningCount = document.querySelector("#warningCount");
const warningList = document.querySelector("#warningList");
const sharedMemory = document.querySelector("#sharedMemory");
const agentKnowledgeList = document.querySelector("#agentKnowledgeList");
const toolHistoryList = document.querySelector("#toolHistoryList");
const checkpointList = document.querySelector("#checkpointList");
const agentCount = document.querySelector("#agentCount");
const taskCount = document.querySelector("#taskCount");
const approvalCount = document.querySelector("#approvalCount");
const approvalTabCount = document.querySelector("#approvalTabCount");
const approveAllTop = document.querySelector("#approveAllTop");
const settingsToggle = document.querySelector("#settingsToggle");
const settingsMenu = document.querySelector("#settingsMenu");
const minimalChatToggle = document.querySelector("#minimalChatToggle");
const approvalsToggle = document.querySelector("#approvalsToggle");
const clarifyToggle = document.querySelector("#clarifyToggle");
const runStatus = document.querySelector("#runStatus");
const summonManager = document.querySelector("#summonManager");
const startDebate = document.querySelector("#startDebate");
const outputType = document.querySelector("#outputType");
const outputDocument = document.querySelector("#outputDocument");
const contributionRow = document.querySelector("#contributionRow");
const versionHistory = document.querySelector("#versionHistory");
const improveOutput = document.querySelector("#improveOutput");
const criticReview = document.querySelector("#criticReview");
const builderTasks = document.querySelector("#builderTasks");
const pauseAgents = document.querySelector("#pauseAgents");
const undoAgentAction = document.querySelector("#undoAgentAction");
const resetContext = document.querySelector("#resetContext");

function init() {
  taskInput.value = templates[1].task;
  setupMission.value = templates[1].task;
  state.outputDocument = buildOutputTemplate(state.outputType);
  state.outputVersions = [{ label: "v1", actor: "ManyMinds", time: now(), note: "Initial product brief draft" }];
  state.warnings = buildDefaultWarnings();
  state.toolHistory = [
    {
      time: now(),
      actor: "System",
      action: "Room initialized",
      result: "Agent team, approvals, memory, and output builder are ready.",
    },
  ];
  seedWelcome();
  renderTemplates();
  renderModelOptions();
  renderPlanOptions();
  render();
}

function seedWelcome() {
  state.messages = [
    {
      id: crypto.randomUUID(),
      speaker: "System",
      role: "Room",
      kind: "system",
      text: "Welcome to ManyMinds AI. Create a mission, add or remove agents, then start a visible team run.",
      time: now(),
    },
  ];
  state.audit = ["Room created", "Default agent team loaded"];
}

function renderTemplates() {
  templateList.innerHTML = templates
    .map(
      (template, index) =>
        `<button class="template-button" data-template="${index}">${template.name}</button>`
    )
    .join("");
}

function render() {
  renderRoomMeta();
  renderSetupPreview();
  renderViewMode();
  renderStatus();
  renderAgents();
  renderMessages();
  renderTasks();
  renderApprovals();
  renderOutputBuilder();
  renderTrustLayer();
  renderAudit();
}

function renderViewMode() {
  document.body.classList.toggle("minimal-chat", state.minimalChat);
  document.body.classList.toggle("approvals-off", !state.approvalsEnabled);
  minimalChatToggle.checked = state.minimalChat;
  approvalsToggle.checked = state.approvalsEnabled;
  clarifyToggle.checked = state.clarificationsEnabled;
  setupMinimalChatToggle.checked = state.minimalChat;
  setupApprovalsToggle.checked = state.approvalsEnabled;
  setupClarifyToggle.checked = state.clarificationsEnabled;
}

function renderRoomMeta() {
  const cleanRoomName = normalizeRoomName(state.roomName);
  roomNameLabel.textContent = cleanRoomName;
  topRoomName.textContent = cleanRoomName;
  roomAgentCount.textContent = state.agents.length;
}

function getAgentPersonality(agent) {
  const roleKey = agent.role === "Product Designer" ? "Designer" : agent.role;
  const defaults = rolePersonalities[roleKey] || rolePersonalities.Operator;
  return {
    ...defaults,
    ...agent,
    color: agent.color || defaults.color,
    avatar: agent.avatar || defaults.avatar || initials(agent.name),
    strengths: agent.strengths || defaults.strengths,
    weaknesses: agent.weaknesses || defaults.weaknesses,
    tone: agent.tone || defaults.tone,
    catchphrase: agent.catchphrase || defaults.catchphrase,
    riskTendency: agent.riskTendency || defaults.riskTendency,
    decisionWeight: agent.decisionWeight || defaults.decisionWeight,
    status: agent.status || defaults.status,
  };
}

function roleClass(role) {
  return `role-${role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function renderSetupPreview() {
  setupAgentPreview.innerHTML = state.agents
    .map((agent) => {
      const personality = getAgentPersonality(agent);
      return `
        <article class="agent-card setup-agent-card ${roleClass(personality.role)}">
          <div class="avatar" style="background:${personality.color}">${escapeHtml(personality.avatar)}</div>
          <div>
            <h4>${escapeHtml(personality.name)}</h4>
            <p><strong>${escapeHtml(personality.role)}</strong> · ${escapeHtml(personality.tone)}</p>
            <p class="agent-status">${escapeHtml(personality.status)}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStatus() {
  const label = state.paused
    ? "Paused"
    : state.debateActive
    ? "Debate"
    : state.awaitingClarification
    ? "Waiting"
    : state.running
    ? "Live"
    : "Idle";
  runStatus.innerHTML = `<span class="status-dot ${state.running && !state.paused ? "live" : "idle"}"></span>${label}`;
}

function renderAgents() {
  agentCount.textContent = state.agents.length;
  agentList.innerHTML = state.agents
    .map((agent) => {
      const personality = getAgentPersonality(agent);
      return `
        <article class="agent-card ${roleClass(personality.role)}">
          <div class="avatar" style="background:${personality.color}">${escapeHtml(personality.avatar)}</div>
          <div>
            <h4>${escapeHtml(personality.name)}</h4>
            <div class="agent-badges">
              <span>${escapeHtml(personality.role)}</span>
              <span>Risk: ${escapeHtml(personality.riskTendency)}</span>
              <span>Weight ${escapeHtml(String(personality.decisionWeight))}</span>
            </div>
            <p><strong>Tone:</strong> ${escapeHtml(personality.tone)}</p>
            <p class="agent-status">${escapeHtml(personality.status)}</p>
            <p class="agent-catchphrase">"${escapeHtml(personality.catchphrase)}"</p>
            <details class="personality-details">
              <summary>Personality</summary>
              <p><strong>Strengths:</strong> ${personality.strengths.map(escapeHtml).join(", ")}</p>
              <p><strong>Weaknesses:</strong> ${personality.weaknesses.map(escapeHtml).join(", ")}</p>
              <p><strong>Catchphrase:</strong> ${escapeHtml(personality.catchphrase)}</p>
            </details>
            <p class="model-line">${escapeHtml(personality.provider || "Local")} · ${escapeHtml(personality.model || "Unassigned")} · ${escapeHtml(personality.plan || "No plan")}</p>
          </div>
          <button class="remove-agent" title="Remove ${escapeHtml(personality.name)}" data-remove="${personality.id}">×</button>
        </article>
      `;
    })
    .join("");
}

function renderMessages() {
  const messagesMarkup = state.messages.map(renderMessage).join("");
  const typingMarkup = state.typingAgents.map(renderTypingIndicator).join("");
  chatFeed.innerHTML = messagesMarkup + typingMarkup;
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function renderMessage(message) {
  if (message.kind === "debate-card") return renderDebateCard(message);
  if (message.kind === "event-card") return renderEventCard(message);
  if (message.kind === "clarification") return renderClarificationMessage(message);

  const agent = state.agents.find((item) => item.name === message.speaker);
  const personality = agent ? getAgentPersonality(agent) : null;
  const avatar = agent
    ? `<span class="avatar" style="background:${personality.color}">${escapeHtml(personality.avatar)}</span>`
    : "";
  const status = personality
    ? `<div class="agent-status-line">${escapeHtml(personality.status)}</div>`
    : "";
  const badge = personality
    ? `<span class="message-badge">${escapeHtml(personality.tone)}</span>`
    : "";
  const reason = message.reason
    ? `<div class="message-reason"><strong>Why:</strong> ${escapeHtml(message.reason)}</div>`
    : "";
  const evidence = message.evidence?.length
    ? `<div class="evidence-row"><strong>Evidence:</strong> ${message.evidence
        .map((item) => `<span>${escapeHtml(item)}</span>`)
        .join("")}</div>`
    : "";
  const thread = message.replyTo
    ? `<div class="thread-chip">Replying to @${escapeHtml(message.replyTo)}</div>`
    : "";
  const mentions = message.mentions?.length
    ? `<div class="mention-row">${message.mentions
        .map((item) => `<span>@${escapeHtml(item)}</span>`)
        .join("")}</div>`
    : "";

  return `
    <article class="message ${message.kind || ""} ${personality ? roleClass(personality.role) : ""}">
      ${avatar}
      <div class="message-stack">
        <div class="message-meta">
          <span>${escapeHtml(message.speaker)}</span>
          <span>${escapeHtml(message.role)}</span>
          ${badge}
          <span>${message.time}</span>
        </div>
        ${status}
        ${thread}
        <div class="bubble">${renderRichText(message.text)}</div>
        <div class="message-context">
          ${reason}
          ${evidence}
          ${mentions}
        </div>
      </div>
    </article>
  `;
}

function renderDebateCard(message) {
  return `
    <article class="debate-card">
      <div class="debate-topline">
        <span>Debate Mode Active</span>
        <strong>${escapeHtml(message.decision)}</strong>
      </div>
      <h4>${escapeHtml(message.title)}</h4>
      <p>${escapeHtml(message.summary)}</p>
      <div class="debate-viewpoints">
        ${message.viewpoints
          .map(
            (viewpoint) => `
              <section class="debate-viewpoint ${roleClass(viewpoint.role)}">
                <div class="debate-agent">
                  <span class="avatar" style="background:${viewpoint.color}">${escapeHtml(viewpoint.avatar)}</span>
                  <div>
                    <strong>${escapeHtml(viewpoint.agent)}</strong>
                    <small>${escapeHtml(viewpoint.role)}</small>
                  </div>
                </div>
                <p>${escapeHtml(viewpoint.text)}</p>
                <span>${escapeHtml(viewpoint.label)}</span>
              </section>
            `
          )
          .join("")}
      </div>
      <div class="debate-decision">
        <strong>Final decision summary</strong>
        <p>${escapeHtml(message.finalDecision)}</p>
      </div>
      <div class="debate-actions">
        <button class="primary-button small" data-debate-approve="${message.id}">Approve decision</button>
        <button class="secondary-button small" data-debate-revise="${message.id}">Request revision</button>
      </div>
    </article>
  `;
}

function renderClarificationMessage(message) {
  const agent = state.agents.find((item) => item.name === message.speaker);
  const personality = agent ? getAgentPersonality(agent) : null;
  const avatar = agent
    ? `<span class="avatar thinking-avatar" style="background:${personality.color}">${escapeHtml(personality.avatar)}</span>`
    : "";
  return `
    <article class="message clarification-message ${personality ? roleClass(personality.role) : ""}">
      ${avatar}
      <div class="message-stack">
        <div class="message-meta">
          <span>${escapeHtml(message.speaker)}</span>
          <span>${escapeHtml(message.role)}</span>
          <span>${message.time}</span>
        </div>
        <div class="bubble clarification-bubble">
          <strong>Clarifying question</strong>
          <span>${escapeHtml(message.text)}</span>
          <div class="clarification-options">
            ${message.suggestions.map((item) => `<button type="button" data-clarify="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
          </div>
        </div>
        <div class="message-context">
          <div class="message-reason"><strong>Why:</strong> ${escapeHtml(message.reason)}</div>
          <div class="evidence-row"><strong>Evidence:</strong> ${message.evidence
            .map((item) => `<span>${escapeHtml(item)}</span>`)
            .join("")}</div>
        </div>
      </div>
    </article>
  `;
}

function renderEventCard(message) {
  const evidence = message.evidence?.length
    ? `<div class="evidence-row"><strong>Evidence:</strong> ${message.evidence
        .map((item) => `<span>${escapeHtml(item)}</span>`)
        .join("")}</div>`
    : "";
  const sides = message.sides?.length
    ? `<ul>${message.sides.map((item) => `<li>${renderRichText(item)}</li>`).join("")}</ul>`
    : "";
  const decision = message.decision
    ? `<div class="decision-line"><strong>Decision:</strong> ${escapeHtml(message.decision)}</div>`
    : "";
  const needs = message.needs
    ? `<div class="approval-line"><strong>User needs to approve:</strong> ${escapeHtml(message.needs)}</div>`
    : "";
  const actions = message.actions?.length
    ? `<div class="summary-list">${message.actions.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`
    : "";

  return `
    <article class="event-card ${message.cardType}">
      <div class="event-card-kicker">${escapeHtml(message.kicker)}</div>
      <h4>${escapeHtml(message.title)}</h4>
      <p>${escapeHtml(message.text)}</p>
      ${sides}
      ${decision}
      ${needs}
      ${evidence}
      ${actions}
    </article>
  `;
}

function renderTypingIndicator(agent) {
  const knownAgent = state.agents.find((item) => item.name === agent.name);
  const personality = knownAgent ? getAgentPersonality(knownAgent) : null;
  const color = personality?.color || pickColor(0);
  return `
    <article class="message typing-message ${personality ? roleClass(personality.role) : ""}">
      <span class="avatar thinking-avatar" style="background:${color}">${escapeHtml(personality?.avatar || initials(agent.name))}</span>
      <div class="message-stack">
        <div class="message-meta">
          <span>${escapeHtml(agent.name)}</span>
          <span>${escapeHtml(agent.role)}</span>
          ${personality ? `<span class="message-badge">${escapeHtml(personality.tone)}</span>` : ""}
          <span>thinking</span>
        </div>
        <div class="typing-bubble">
          <span class="typing-dots"><i></i><i></i><i></i></span>
          <span>${escapeHtml(agent.microcopy)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderTasks() {
  taskCount.textContent = state.tasks.length;
  taskBoard.innerHTML =
    state.tasks.length === 0
      ? `<div class="empty-state"><strong>Nothing moving yet.</strong><span>Start a team run and the room will turn the mission into owned workstreams.</span></div>`
      : state.tasks
          .map(
            (task) => `
              <article class="task-card">
                <div class="task-card-top">
                  <h4>${escapeHtml(task.title)}</h4>
                  <span class="task-status ${task.status}">${labelStatus(task.status)}</span>
                </div>
                <p>${escapeHtml(task.owner)} owns this. ${escapeHtml(task.detail)}</p>
              </article>
            `
          )
          .join("");
}

function renderApprovals() {
  const count = state.approvalsEnabled ? state.approvals.length : 0;
  approvalCount.textContent = count;
  approvalTabCount.textContent = state.approvalsEnabled ? count : "Off";
  approveAllTop.classList.toggle("has-approvals", count > 0);
  approveAllTop.classList.toggle("is-off", !state.approvalsEnabled);
  approveAllTop.disabled = !state.approvalsEnabled || count === 0;
  approvalList.innerHTML =
    !state.approvalsEnabled
      ? `<div class="empty-state"><strong>Fast mode is on.</strong><span>Approval gates are off, so agents will keep moving without checkpoint cards.</span></div>`
      : state.approvals.length === 0
      ? `<div class="empty-state"><strong>No approvals waiting.</strong><span>Important requests will land here before agents cross a boundary.</span></div>`
      : state.approvals
          .map(
            (approval) => `
              <article class="approval-card">
                <h4>${escapeHtml(approval.title)}</h4>
                <p>${escapeHtml(approval.detail)}</p>
                <div class="approval-actions">
                  <button class="secondary-button small approve" data-approve="${approval.id}">Approve</button>
                  <button class="secondary-button small deny" data-deny="${approval.id}">Deny</button>
                </div>
              </article>
            `
          )
          .join("");
}

function renderOutputBuilder() {
  if (document.activeElement !== outputDocument) {
    outputDocument.value = state.outputDocument;
  }
  outputType.value = state.outputType;
  contributionRow.innerHTML = state.outputContributions
    .map((item) => {
      const agent = state.agents.find((candidate) => candidate.name === item.agent);
      const personality = agent ? getAgentPersonality(agent) : rolePersonalities[item.role] || rolePersonalities.Operator;
      return `
        <span class="contribution-marker" style="--marker:${personality.color}">
          <strong>${escapeHtml(item.agent)}</strong>
          ${escapeHtml(item.note)}
        </span>
      `;
    })
    .join("");
  versionHistory.innerHTML = `
    <strong>Version history</strong>
    ${state.outputVersions
      .slice()
      .reverse()
      .map(
        (version) => `
          <button type="button" class="version-item" data-version="${escapeHtml(version.label)}">
            <span>${escapeHtml(version.label)} · ${escapeHtml(version.actor)}</span>
            <small>${escapeHtml(version.time)} · ${escapeHtml(version.note)}</small>
          </button>
        `
      )
      .join("")}
  `;
}

function buildOutputTemplate(type) {
  const templatesByType = {
    "Product brief": `# ManyMinds AI Product Brief

## Problem
Teams want AI agents to collaborate visibly, but most tools hide the reasoning, ownership, and decision path.

## Audience
Initial target: founders validating complex product, research, and launch decisions.

## Promise
A premium multi-agent room where specialists debate, produce structured outputs, and ask for approval before important actions.

## Core Workflow
1. Create a room and mission.
2. Add specialist agents with personalities and models.
3. Watch collaboration, debates, approvals, and final outputs.
4. Export the deliverable for real-world use.

## Success Criteria
Users can understand who contributed, what changed, and what decision was made.`,
    "Feature list": `# Feature List

- Multi-agent visible chat
- Agent personalities and roles
- Debate Mode
- Approval gates
- Clarifying questions
- Final Output Builder
- Version history
- Markdown, PDF, and DOCX export controls`,
    "User personas": `# User Personas

## Founder
Needs fast strategy, product decisions, launch planning, and investor-ready summaries.

## Agency Operator
Needs repeatable client research, planning, and deliverables across multiple accounts.

## Enterprise Team Lead
Needs auditability, permissions, security controls, and repeatable team workflows.`,
    "Competitor analysis": `# Competitor Analysis

## Current Alternatives
- Single-agent chat apps
- Agent workflow builders
- Project management tools with AI add-ons

## Gap
Few products make multi-agent collaboration visible, inspectable, and exportable.

## Differentiator
ManyMinds AI combines live agent discussion, debate, approvals, personalities, and structured outputs.`,
    "MVP roadmap": `# MVP Roadmap

## Phase 1
Multi-agent chat, personalities, debate mode, output builder.

## Phase 2
Real model routing, saved rooms, persistent outputs.

## Phase 3
Tool integrations, approval policies, team accounts.

## Phase 4
Enterprise permissions, audit trails, admin controls.`,
    "Landing page copy": `# Landing Page Copy

## Headline
ManyMinds AI: put an expert AI team in one room.

## Subheading
Watch agents debate, plan, challenge assumptions, and produce structured work you can approve and export.

## CTA
Create your first AI team.`,
    "Pitch deck outline": `# Pitch Deck Outline

1. Problem
2. Why now
3. Product demo
4. Target users
5. Market wedge
6. Competitive landscape
7. Business model
8. Roadmap
9. Team
10. Ask`,
    "Technical build plan": `# Technical Build Plan

## Frontend
Room UI, chat stream, output builder, settings, agent management.

## Backend
Rooms, agents, messages, outputs, versions, approvals.

## AI Orchestration
Coordinator, specialist prompts, debate mode, output generation.

## Export
Markdown first, then PDF and DOCX generation services.`,
  };
  return templatesByType[type] || templatesByType["Product brief"];
}

function saveOutputVersion(actor, note) {
  state.outputVersions.push({
    label: `v${state.outputVersions.length + 1}`,
    actor,
    time: now(),
    note,
  });
}

function updateOutputWithAgents(mode) {
  const additions = {
    improve: `\n\n## Agent Improvements\n- Owen sharpened the target segment and product promise.\n- Nia added evidence gaps that should be validated before launch.\n- Iris clarified the next buildable workflow.\n`,
    critic: `\n\n## Critic Review\n- Validate willingness to pay before building advanced enterprise features.\n- Avoid hiding agent disagreement; visible debate is a product strength.\n- Add clear ownership to every exported recommendation.\n`,
    builder: `\n\n## Builder Task Breakdown\n- Create persistent output records.\n- Add version restore controls.\n- Connect export buttons to real file generation.\n- Link output sections to agent contributions.\n`,
  };
  const actors = {
    improve: "Agent team",
    critic: "Vale",
    builder: "Iris",
  };
  const notes = {
    improve: "Improved structure and clarity",
    critic: "Critic review added",
    builder: "Task breakdown added",
  };
  state.outputDocument = `${outputDocument.value.trim()}${additions[mode]}`;
  saveOutputVersion(actors[mode], notes[mode]);
  recordToolAction(actors[mode], "Output updated", `${notes[mode]} for ${state.outputType}.`);
  addMessage(
    actors[mode],
    mode === "critic" ? "Critic" : mode === "builder" ? "Builder" : "Team",
    notes[mode],
    "",
    {
      reason: "Update the structured deliverable",
      evidence: [`Output type: ${state.outputType}`, `Version: v${state.outputVersions.length}`],
    }
  );
  render();
}

function exportOutput(format) {
  addMessage("System", "Export", `${format} export prepared for ${state.outputType}.`, "system");
  recordToolAction("System", `${format} export`, `${state.outputType} export prepared.`);
  log(`${format} export prepared for ${state.outputType}`);
  render();
}

function renderTrustLayer() {
  const activeWarnings = state.warnings;
  warningCount.textContent = activeWarnings.length;
  warningList.innerHTML = activeWarnings
    .map(
      (warning) => `
        <article class="warning-card ${escapeHtml(warning.level)}">
          <span>${escapeHtml(warning.type)}</span>
          <strong>${escapeHtml(warning.title)}</strong>
          <p>${escapeHtml(warning.detail)}</p>
        </article>
      `
    )
    .join("");

  sharedMemory.innerHTML = `
    <dl>
      <div><dt>Room</dt><dd>#${escapeHtml(state.roomName)}</dd></div>
      <div><dt>Mission</dt><dd>${escapeHtml(taskInput.value.trim() || setupMission.value.trim() || "No mission set")}</dd></div>
      <div><dt>Output</dt><dd>${escapeHtml(state.outputType)} · ${escapeHtml(state.outputVersions.at(-1)?.label || "v1")}</dd></div>
      <div><dt>State</dt><dd>${state.paused ? "Paused by user" : state.running ? "Agents running" : "Idle"}</dd></div>
    </dl>
  `;

  agentKnowledgeList.innerHTML = state.agents
    .map((agent) => {
      const personality = getAgentPersonality(agent);
      const knowledge = agentKnowledgeFor(personality);
      return `
        <details class="knowledge-card" style="--agent:${personality.color}">
          <summary>
            <span class="avatar small-avatar" style="background:${personality.color}">${escapeHtml(personality.avatar)}</span>
            <strong>${escapeHtml(personality.name)}</strong>
            <em>${escapeHtml(personality.role)}</em>
          </summary>
          <p><strong>Knows:</strong> ${knowledge.knows.map(escapeHtml).join(", ")}</p>
          <p><strong>Assumes:</strong> ${knowledge.assumes.map(escapeHtml).join(", ")}</p>
        </details>
      `;
    })
    .join("");

  toolHistoryList.innerHTML = state.toolHistory.length
    ? state.toolHistory
        .slice(-8)
        .reverse()
        .map(
          (item) => `
            <article class="history-item">
              <strong>${escapeHtml(item.action)}</strong>
              <span>${escapeHtml(item.time)} · ${escapeHtml(item.actor)}</span>
              <p>${escapeHtml(item.result)}</p>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state"><strong>Clean slate.</strong><span>Tool calls and agent actions will appear here as the room works.</span></div>`;

  checkpointList.innerHTML = buildApprovalCheckpoints()
    .map(
      (checkpoint) => `
        <article class="checkpoint-item ${checkpoint.status}">
          <strong>${escapeHtml(checkpoint.title)}</strong>
          <span>${escapeHtml(checkpoint.statusLabel)}</span>
          <p>${escapeHtml(checkpoint.detail)}</p>
        </article>
      `
    )
    .join("");

  pauseAgents.textContent = state.paused ? "Resume agents" : "Pause all agents";
}

function buildDefaultWarnings() {
  return [
    {
      type: "Conflicting evidence",
      level: "medium",
      title: "Market claims are not yet verified",
      detail: "Agents can debate target users, but fresh competitor or pricing claims need external sources.",
    },
    {
      type: "Low confidence",
      level: "medium",
      title: "Plan quality depends on user constraints",
      detail: "Timeline, budget, platform, and launch channel are still estimated.",
    },
    {
      type: "Unsupported assumption",
      level: "high",
      title: "Founders may not be the highest-retention segment",
      detail: "The current recommendation assumes fast founder feedback beats agency repeatability.",
    },
    {
      type: "Missing source",
      level: "high",
      title: "No live research source attached",
      detail: "The demo uses mock data until the user approves external tools or connects sources.",
    },
    {
      type: "Agent disagreement",
      level: "medium",
      title: "Strategist and Critic differ on first market",
      detail: "Owen favors founders first; Vale wants stronger proof that agencies will not retain better.",
    },
  ];
}

function agentKnowledgeFor(agent) {
  const commonKnowns = [`Room mission`, `Current ${state.outputType}`, "Visible approval policy"];
  const commonAssumptions = ["No external tools have been used unless approved", "Mock data can guide product shape only"];
  const byRole = {
    Manager: {
      knows: ["team roster", "run status", "pending approvals"],
      assumes: ["the user wants visible control before automation"],
    },
    Researcher: {
      knows: ["known evidence gaps", "missing source warnings", "market questions"],
      assumes: ["fresh facts require user-approved research"],
    },
    Strategist: {
      knows: ["target segment debate", "positioning options", "decision tradeoffs"],
      assumes: ["founders are the fastest initial validation path"],
    },
    Builder: {
      knows: ["feature scope", "task board", "export workflow"],
      assumes: ["the MVP should prove trust controls before heavy integrations"],
    },
    Reviewer: {
      knows: ["risk flags", "weak assumptions", "quality gaps"],
      assumes: ["every confident recommendation needs a visible evidence trail"],
    },
    Critic: {
      knows: ["risk flags", "weak assumptions", "quality gaps"],
      assumes: ["every confident recommendation needs a visible evidence trail"],
    },
    "Compliance Checker": {
      knows: ["approval boundaries", "audit trail", "permission-sensitive actions"],
      assumes: ["sensitive actions should remain gated by default"],
    },
  };
  const roleKnowledge = byRole[agent.role] || {
    knows: ["assigned role", "latest room messages"],
    assumes: ["the user can redirect the room at any time"],
  };
  return {
    knows: [...roleKnowledge.knows, ...commonKnowns],
    assumes: [...roleKnowledge.assumes, ...commonAssumptions],
  };
}

function buildApprovalCheckpoints() {
  const pending = state.approvals.map((approval) => ({
    title: approval.title,
    detail: approval.detail,
    status: "pending",
    statusLabel: "Pending user approval",
  }));
  const baseline = [
    {
      title: "External tools",
      detail: state.approvalsEnabled
        ? "Agents must ask before using outside tools or sources."
        : "Approval gates are off, so this checkpoint is informational only.",
      status: state.approvalsEnabled ? "ready" : "off",
      statusLabel: state.approvalsEnabled ? "Gated" : "Off",
    },
    {
      title: "Final recommendation",
      detail: "The team should pause before converting debate into an official direction.",
      status: state.approvalsEnabled ? "ready" : "off",
      statusLabel: state.approvalsEnabled ? "Gated" : "Off",
    },
  ];
  return [...pending, ...baseline];
}

function recordToolAction(actor, action, result) {
  state.toolHistory.push({ time: now(), actor, action, result });
}

function renderAudit() {
  auditList.innerHTML = state.audit
    .slice(-8)
    .reverse()
    .map((item) => `<div class="audit-item">${escapeHtml(item)}</div>`)
    .join("");
}

function startRun() {
  const mission = taskInput.value.trim();
  if (!mission || state.running) return;

  state.running = true;
  state.paused = false;
  state.tasks = [
    {
      title: "Frame the mission",
      owner: "Mara",
      detail: "Clarify outcome, constraints, and success criteria.",
      status: "doing",
    },
    {
      title: "Map knowns and unknowns",
      owner: "Nia",
      detail: "Separate facts from assumptions before the team commits.",
      status: "todo",
    },
    {
      title: "Draft execution plan",
      owner: "Iris",
      detail: "Produce the first usable artifact for the user.",
      status: "todo",
    },
    {
      title: "Review and harden",
      owner: "Vale",
      detail: "Find risks, missing approvals, and quality gaps.",
      status: "todo",
    },
  ];
  recordToolAction("Mara", "Team run started", "Created workstreams and checked approval boundaries.");
  state.approvals = state.approvalsEnabled
    ? [
        {
          id: crypto.randomUUID(),
          title: "Use external tools",
          detail: "Allow the team to use connected tools or outside sources when the mission requires fresh information.",
        },
      ]
    : [];

  addMessage("You", "User", mission, "user");
  addMessage(
    "Mara",
    "Manager",
    "I am opening the room. I will assign work, keep the conversation visible, and pause before any sensitive action. Team, useful wit is allowed; decorative waffle is not.",
    "",
    {
      reason: "Start the run and set collaboration rules",
      evidence: ["User submitted a mission", "Approval queue is active"],
      mentions: ["Nia", "Owen", "Iris", "Vale"],
    }
  );
  if (state.approvalsEnabled) {
    addEventCard({
      cardType: "approval-needed",
      kicker: "User approval needed",
      title: "External tools are gated",
      text: "The team can continue with stated assumptions, but fresh market or competitor checks need approval first.",
      evidence: ["External searches may send queries to third-party services", "Market facts can change quickly"],
      needs: "Approve external tool use in the Approval Queue.",
    });
  }
  log("Team run started");
  render();

  state.runStep = 0;
  clearInterval(state.timer);
  startRunTimer();
}

function startRunTimer() {
  clearInterval(state.timer);
  state.timer = setInterval(() => {
    if (state.paused) return;
    if (state.awaitingClarification) return;
    state.runStep += 1;
    advanceRun(state.runStep);
  }, 1900);
}

function advanceRun(step) {
  const event = runEvents[step - 1] || buildFallbackEvent(step);
  queueRunEvent(event);

  if (state.tasks[step - 1]) {
    state.tasks[step - 1].status = "done";
  }
  if (state.tasks[step]) {
    state.tasks[step].status = "doing";
  }

  if (step === 7 && state.approvalsEnabled) {
    state.approvals.push({
      id: crypto.randomUUID(),
      title: "Finalize recommendation",
      detail: "The team is ready to produce a final direction. Approve when you want the manager to synthesize the result.",
    });
    addEventCard({
      cardType: "approval-needed",
      kicker: "User approval needed",
      title: "Finalize recommendation",
      text: "The team is ready to synthesize a direction, but the user should approve before it becomes the official recommendation.",
      evidence: ["Research, strategy, build, and review lanes have each contributed", "Final output changes the task direction"],
      needs: "Approve or deny 'Finalize recommendation' in the Approval Queue.",
    });
  }

  if (step >= runEvents.length + 1) {
    finishRun();
  }

  render();
}

function finishRun() {
  clearInterval(state.timer);
  state.running = false;
  state.paused = false;
  state.typingAgents = [];
  state.tasks = state.tasks.map((task) => ({ ...task, status: "done" }));
  addEventCard({
    cardType: "final-recommendation",
    kicker: "Final recommendation",
    title: "Build the trust layer first",
    text: "ManyMinds AI should lead with visible collaboration: typing, evidence, threaded debate, conflict resolution, approval cards, and a final summary before real-world actions.",
    evidence: [
      "User asked for premium clean collaboration",
      "Approval visibility reduces risk",
      "Agent-to-agent context makes the room feel alive",
    ],
    actions: [
      "Next: connect real LLM calls",
      "Next: persist rooms and agent configs",
      "Next: add real approval policies for tools",
    ],
  });
  log("Team run completed");
  recordToolAction("Mara", "Team run completed", "Final recommendation card added to the room.");
  render();
}

function queueRunEvent(event) {
  if (event.type === "clarification") {
    if (!state.clarificationsEnabled) return;
    state.typingAgents = [];
    state.awaitingClarification = true;
    clearInterval(state.timer);
    addMessage(event.speaker, event.role, event.question, "clarification", {
      reason: event.reason,
      evidence: event.evidence,
      suggestions: event.suggestions,
    });
    log("Run paused for user clarification");
    render();
    return;
  }

  if (event.type !== "message") {
    state.typingAgents = [];
    addStructuredEvent(event);
    return;
  }

  state.typingAgents = [
    {
      name: event.speaker,
      role: event.role,
      microcopy: thinkingMicrocopy(event.speaker),
    },
  ];
  render();
  window.setTimeout(() => {
    state.typingAgents = [];
    addMessage(event.speaker, event.role, event.text, "", {
      reason: event.reason,
      evidence: event.evidence,
      replyTo: event.replyTo,
      mentions: event.mentions,
    });
    render();
  }, 620);
}

function addStructuredEvent(event) {
  if (event.type === "conflict") {
    addEventCard({
      cardType: "conflict",
      kicker: "Conflict detected",
      title: event.title,
      text: event.summary,
      sides: event.sides,
      needs: event.needs,
    });
  }
  if (event.type === "approval") {
    if (!state.approvalsEnabled) return;
    addEventCard({
      cardType: "approval-needed",
      kicker: "User approval needed",
      title: event.title,
      text: event.summary,
      evidence: event.evidence,
      needs: "Approve or deny this in the Approval Queue.",
    });
    state.approvals.push({
      id: crypto.randomUUID(),
      title: event.approvalTitle,
      detail: event.approvalDetail,
    });
  }
  if (event.type === "decision") {
    addEventCard({
      cardType: "decision",
      kicker: "Decision reached",
      title: event.title,
      text: event.summary,
      evidence: event.evidence,
      decision: event.decision,
    });
  }
}

function buildFallbackEvent(step) {
  const scriptedReply = crossTalk[(step - 1) % crossTalk.length];
  if (scriptedReply && state.agents.some((item) => item.name === scriptedReply.speaker)) {
    return { type: "message", ...scriptedReply };
  }
  const activeAgents = state.agents.filter((agent) => agent.role !== "Manager" || step % 4 === 1);
  const agent = activeAgents[step % activeAgents.length] || state.agents[0];
  const lines = roleLines[agent.role] || roleLines.Operator;
  return {
    type: "message",
    speaker: agent.name,
    role: agent.role,
    reason: "Keep the room moving after the main debate",
    evidence: ["Current task state", "Prior agent messages"],
    text: lines[step % lines.length],
  };
}

function addEventCard({ cardType, kicker, title, text, evidence = [], sides = [], decision = "", needs = "", actions = [] }) {
  state.messages.push({
    id: crypto.randomUUID(),
    kind: "event-card",
    cardType,
    kicker,
    title,
    text,
    evidence,
    sides,
    decision,
    needs,
    actions,
    time: now(),
  });
}

function addMessage(speaker, role, text, kind = "", details = {}) {
  state.messages.push({
    id: crypto.randomUUID(),
    speaker,
    role,
    text,
    kind,
    reason: details.reason || "",
    evidence: details.evidence || [],
    suggestions: details.suggestions || [],
    replyTo: details.replyTo || "",
    mentions: details.mentions || [],
    time: now(),
  });
}

function addCustomAgent() {
  const name = agentName.value.trim();
  const role = agentRole.value;
  const vibe = agentVibe.value.trim();
  const selectedModel = getSelectedModel();
  const selectedPlan = getSelectedPlan();
  const roleKey = role === "Product Designer" ? "Designer" : role;
  const personalityDefaults = rolePersonalities[roleKey] || rolePersonalities.Operator;
  if (!name) return;

  state.agents.push({
    id: crypto.randomUUID(),
    name,
    role,
    avatar: initials(name),
    color: personalityDefaults.color || pickColor(state.agents.length),
    tone: vibe || personalityDefaults.tone,
    strengths: personalityDefaults.strengths,
    weaknesses: personalityDefaults.weaknesses,
    catchphrase: personalityDefaults.catchphrase,
    riskTendency: personalityDefaults.riskTendency,
    decisionWeight: personalityDefaults.decisionWeight,
    status: personalityDefaults.status,
    model: selectedModel.model,
    provider: selectedModel.provider,
    plan: selectedPlan,
    charter: vibe
      ? `${roleLines[role]?.[0] || "Helps the room make progress."} Style: ${vibe}.`
      : roleLines[role]?.[0] || "Helps the room make progress.",
  });
  agentName.value = "";
  agentVibe.value = "";
  closeModal();
  addMessage(
    name,
    role,
    `Thanks for the invite. I am joining as ${role.toLowerCase()} support on ${selectedModel.provider} ${selectedModel.model} using the ${selectedPlan} plan${
      vibe ? ` with a ${vibe} style` : ""
    }. I will keep the chat useful, visible, and only mildly dramatic.`,
    "",
    {
      reason: "Confirm the new agent's role and model",
      evidence: [`Role: ${role}`, `Model: ${selectedModel.provider} ${selectedModel.model}`, `Plan: ${selectedPlan}`],
    }
  );
  log(`${name} joined as ${role} on ${selectedModel.provider} ${selectedModel.model}`);
  render();
}

function enterApp() {
  state.roomName = normalizeRoomName(setupRoomName.value);
  taskInput.value = setupMission.value.trim() || templates[1].task;
  landingScreen.classList.add("app-hidden");
  appShell.classList.remove("app-hidden");
  window.scrollTo(0, 0);
  addMessage(
    "System",
    "Room",
    `Setup complete. ${state.agents.length} agents are ready in #${state.roomName}.`,
    "system"
  );
  log(`Workspace opened: #${state.roomName}`);
  recordToolAction("System", "Workspace opened", `Loaded #${state.roomName} with ${state.agents.length} agents.`);
  render();
}

function removeAgent(id) {
  const agent = state.agents.find((item) => item.id === id);
  state.agents = state.agents.filter((item) => item.id !== id);
  if (agent) log(`${agent.name} removed from room`);
  render();
}

function resolveApproval(id, approved) {
  const approval = state.approvals.find((item) => item.id === id);
  state.approvals = state.approvals.filter((item) => item.id !== id);
  if (approval) {
    const decision = approved ? "approved" : "denied";
    addMessage("You", "User", `${decision.toUpperCase()}: ${approval.title}`, "user");
    addMessage(
      "Mara",
      "Manager",
      approved
        ? "Approval received. I will let the team proceed and keep the action logged. The clipboard people may relax."
        : "Understood. I will route around that action and keep the team inside the current boundary. Boundaries are cheaper than apology emails.",
      ""
    );
    log(`${approval.title} ${decision}`);
    recordToolAction("User", `${approval.title} ${decision}`, `Human checkpoint resolved as ${decision}.`);
  }
  render();
}

function approveAllRequests() {
  if (!state.approvalsEnabled || state.approvals.length === 0) return;
  const approvedTitles = state.approvals.map((approval) => approval.title);
  state.approvals = [];
  addMessage("You", "User", `APPROVED ALL: ${approvedTitles.join(", ")}`, "user");
  addEventCard({
    cardType: "decision",
    kicker: "Decision reached",
    title: "All pending requests approved",
    text: "The user approved every pending request in the room. The team can continue inside the approved boundaries.",
    decision: `Approved: ${approvedTitles.join(", ")}.`,
  });
  addMessage(
    "Mara",
    "Manager",
    "All pending approvals are cleared. I will keep the room moving and log each action. Efficient, but still supervised.",
    "",
    {
      reason: "Confirm bulk user approval",
      evidence: approvedTitles.map((title) => `Approved: ${title}`),
    }
  );
  log(`Approved all requests: ${approvedTitles.join(", ")}`);
  recordToolAction("User", "Approved all requests", approvedTitles.join(", "));
  render();
}

function startDebateMode() {
  clearInterval(state.timer);
  state.running = false;
  state.awaitingClarification = false;
  state.typingAgents = [];
  state.debateActive = true;
  state.paused = false;
  const debateId = crypto.randomUUID();
  state.messages.unshift({
    id: debateId,
    kind: "debate-card",
    title: "Who should ManyMinds AI target first?",
    decision: "Founders vs agencies vs enterprise teams",
    summary:
      "The room is debating the first go-to-market segment using mock positioning data. Each agent gives a short view before the strategist makes a recommendation.",
    viewpoints: [
      {
        agent: "Nia",
        role: "Researcher",
        avatar: "N",
        color: "#246baf",
        label: "Evidence request",
        text: "Founders are easiest to reach, but we need evidence on willingness to pay. I would test demand with founder communities before calling it the core market.",
      },
      {
        agent: "Owen",
        role: "Strategist",
        avatar: "O",
        color: "#a97013",
        label: "Recommendation",
        text: "Start with founders. They feel the pain directly, move quickly, and can validate the product story before we sell into slower teams.",
      },
      {
        agent: "Iris",
        role: "Builder",
        avatar: "I",
        color: "#0d7c66",
        label: "Build lens",
        text: "Founder workflows need fewer integrations than enterprise. That keeps the first version focused: rooms, agents, approvals, and exportable outputs.",
      },
      {
        agent: "Vale",
        role: "Critic",
        avatar: "V",
        color: "#bd3d3a",
        label: "Challenge",
        text: "Weak assumption: founders may love the idea but churn fast. Agencies might have repeated client work and clearer recurring value.",
      },
      {
        agent: "Kira",
        role: "Compliance Checker",
        avatar: "K",
        color: "#59636e",
        label: "Risk flag",
        text: "Enterprise teams create heavier security, audit, and procurement requirements. Attractive later, expensive now. Please do not invite a procurement maze to breakfast.",
      },
    ],
    finalDecision:
      "Target founders first, with agencies as the second segment to validate repeat usage. Defer enterprise until permissions, audit logs, and admin controls are mature.",
    time: now(),
  });
  addMessage(
    "Owen",
    "Strategist",
    "Debate complete: my recommendation is founders first, agencies second, enterprise later. Fast validation beats slow procurement at this stage.",
    "",
    {
      reason: "Synthesize debate into a go-to-market recommendation",
      evidence: ["Founder speed", "Agency repeatability", "Enterprise procurement risk"],
      mentions: ["Nia", "Iris", "Vale"],
    }
  );
  log("Debate Mode started");
  recordToolAction("Owen", "Debate Mode started", "Created target-segment debate with agent viewpoints.");
  render();
}

function resolveDebate(approved) {
  state.debateActive = false;
  addMessage(
    "You",
    "User",
    approved ? "APPROVED DEBATE DECISION: Target founders first." : "REVISION REQUESTED: Rework the target segment decision.",
    "user"
  );
  addEventCard({
    cardType: approved ? "decision" : "conflict",
    kicker: approved ? "Decision reached" : "Revision requested",
    title: approved ? "Target segment approved" : "Debate sent back",
    text: approved
      ? "The user approved founders as the first target segment, with agencies second and enterprise later."
      : "The user asked the agent team to revisit the target segment recommendation.",
    decision: approved ? "Founders first, agencies second, enterprise later." : "",
    needs: approved ? "" : "Agents should reopen the debate with a revised recommendation.",
  });
  log(approved ? "Debate decision approved" : "Debate revision requested");
  recordToolAction("User", approved ? "Debate approved" : "Debate revision requested", approved ? "Founders-first decision accepted." : "Agents must revisit the recommendation.");
  render();
}

function toggleAgentPause() {
  state.paused = !state.paused;
  if (state.paused) {
    clearInterval(state.timer);
    state.typingAgents = [];
    addMessage("System", "Control", "All agents paused. The room will wait until you resume or redirect it.", "system");
    log("All agents paused by user");
    recordToolAction("User", "Paused all agents", "Stopped active timers and thinking indicators.");
  } else {
    addMessage("System", "Control", "Agents resumed. The room can continue from the current context.", "system");
    log("Agents resumed by user");
    recordToolAction("User", "Resumed agents", "Restarted the room from the current context.");
    if (state.running && !state.awaitingClarification) startRunTimer();
  }
  render();
}

function undoLastAgentAction() {
  const index = [...state.messages]
    .map((message, messageIndex) => ({ message, messageIndex }))
    .reverse()
    .find(({ message }) => message.speaker !== "You" && message.kind !== "debate-card")?.messageIndex;

  if (index === undefined) {
    log("Undo requested, but no agent action was available");
    recordToolAction("User", "Undo unavailable", "No reversible agent action was found in the conversation.");
    render();
    return;
  }

  const [removed] = state.messages.splice(index, 1);
  state.typingAgents = [];
  addMessage(
    "System",
    "Control",
    `Undid last agent action: ${removed.title || removed.text || removed.kicker || "agent update"}.`,
    "system"
  );
  log("Last agent action undone");
  recordToolAction("User", "Undo last agent action", `Removed ${removed.speaker || removed.kicker || "event card"} from the room.`);
  render();
}

function resetConversationContext() {
  clearInterval(state.timer);
  state.running = false;
  state.paused = false;
  state.awaitingClarification = false;
  state.debateActive = false;
  state.typingAgents = [];
  state.tasks = [];
  state.approvals = [];
  state.runStep = 0;
  seedWelcome();
  addMessage(
    "System",
    "Control",
    "Conversation context reset. Agents, memory view, approvals, and output drafts remain visible so the user can restart cleanly.",
    "system"
  );
  log("Conversation context reset by user");
  recordToolAction("User", "Reset conversation context", "Cleared chat progress, tasks, pending approvals, debate state, and run timers.");
  render();
}

function setApprovalsEnabled(enabled) {
  state.approvalsEnabled = enabled;
  if (!enabled) {
    state.approvals = [];
    state.messages = state.messages.filter(
      (message) => !(message.kind === "event-card" && message.cardType === "approval-needed")
    );
    log("Approval gates switched off");
  } else {
    log("Approval gates switched on");
  }
  render();
}

function setClarificationsEnabled(enabled) {
  state.clarificationsEnabled = enabled;
  if (!enabled && state.awaitingClarification) {
    state.awaitingClarification = false;
    log("Clarifying questions switched off while waiting");
    if (state.running) startRunTimer();
  } else {
    log(`Clarifying questions switched ${enabled ? "on" : "off"}`);
  }
  render();
}

function answerClarification(answer) {
  if (!state.awaitingClarification) return;
  state.awaitingClarification = false;
  addMessage("You", "User", answer, "user");
  addMessage(
    "Mara",
    "Manager",
    `Got it. I will optimize for ${answer.toLowerCase()} and let the team continue from that priority.`,
    "",
    {
      reason: "Resume the run using the user's clarification",
      evidence: [`User selected: ${answer}`],
      mentions: ["Nia", "Owen", "Iris", "Vale"],
    }
  );
  log(`Clarification answered: ${answer}`);
  render();
  startRunTimer();
}

function log(text) {
  state.audit.push(`${now()} · ${text}`);
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function labelStatus(status) {
  if (status === "done") return "Done";
  if (status === "doing") return "Doing";
  return "Queued";
}

function pickColor(index) {
  return ["#0d7c66", "#246baf", "#a97013", "#bd3d3a", "#5d4a9a", "#59636e"][index % 6];
}

function normalizeRoomName(value) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "product-war-room";
}

function thinkingMicrocopy(name) {
  const lines = {
    Mara: "sorting the room into useful lanes",
    Nia: "checking facts without making eye contact with weak assumptions",
    Owen: "turning tension into a decision path",
    Iris: "assembling the practical version",
    Vale: "reviewing calmly, somehow with a clipboard aura",
  };
  return lines[name] || "thinking through the useful bit";
}

function renderModelOptions() {
  agentModel.innerHTML = modelCatalog
    .map(
      (item) =>
        `<option value="${item.id}">${item.provider} · ${item.model} — ${item.bestFor}</option>`
    )
    .join("");
}

function renderPlanOptions() {
  const selectedModel = getSelectedModel();
  const previousPlan = getSelectedPlan();
  const currentPlan = selectedModel.plans.includes(previousPlan) ? previousPlan : selectedModel.plans[0];
  activationText.textContent = `${selectedModel.provider} ${selectedModel.model}: ${selectedModel.bestFor}. Choose the user's first activation plan for this agent.`;
  planLink.href = selectedModel.planUrl;
  planGrid.innerHTML = selectedModel.plans
    .map(
      (plan, index) => `
        <button class="plan-chip ${plan === currentPlan || (!currentPlan && index === 0) ? "selected" : ""}" data-plan="${escapeHtml(plan)}">
          ${escapeHtml(plan)}
        </button>
      `
    )
    .join("");
}

function getSelectedModel() {
  return modelCatalog.find((item) => item.id === agentModel.value) || modelCatalog[0];
}

function getSelectedPlan() {
  const selected = planGrid.querySelector(".plan-chip.selected");
  return selected?.dataset.plan || getSelectedModel().plans[0];
}

function openModal() {
  agentModal.classList.add("open");
  agentModal.setAttribute("aria-hidden", "false");
  agentName.focus();
}

function closeModal() {
  agentModal.classList.remove("open");
  agentModal.setAttribute("aria-hidden", "true");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRichText(value) {
  return escapeHtml(value).replace(/@([A-Za-z][A-Za-z0-9_-]*)/g, '<span class="mention">@$1</span>');
}

startTask.addEventListener("click", startRun);
addAgent.addEventListener("click", addCustomAgent);
approveAllTop.addEventListener("click", approveAllRequests);
startDebate.addEventListener("click", startDebateMode);
outputType.addEventListener("change", () => {
  state.outputType = outputType.value;
  state.outputDocument = buildOutputTemplate(state.outputType);
  saveOutputVersion("ManyMinds", `${state.outputType} template created`);
  render();
});
outputDocument.addEventListener("input", () => {
  state.outputDocument = outputDocument.value;
});
improveOutput.addEventListener("click", () => updateOutputWithAgents("improve"));
criticReview.addEventListener("click", () => updateOutputWithAgents("critic"));
builderTasks.addEventListener("click", () => updateOutputWithAgents("builder"));
pauseAgents.addEventListener("click", toggleAgentPause);
undoAgentAction.addEventListener("click", undoLastAgentAction);
resetContext.addEventListener("click", resetConversationContext);
document.querySelector(".export-row").addEventListener("click", (event) => {
  const button = event.target.closest("[data-export]");
  if (!button) return;
  exportOutput(button.dataset.export);
});
enterWorkspace.addEventListener("click", enterApp);
useStarterTeam.addEventListener("click", enterApp);
skipSetup.addEventListener("click", enterApp);
landingAddAgent.addEventListener("click", openModal);
openAgentModal.addEventListener("click", openModal);
openAgentModalTop.addEventListener("click", openModal);
openAgentModalRail.addEventListener("click", openModal);
closeAgentModal.addEventListener("click", closeModal);
cancelAgent.addEventListener("click", closeModal);
agentModel.addEventListener("change", renderPlanOptions);
settingsToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = settingsMenu.classList.toggle("open");
  settingsMenu.setAttribute("aria-hidden", String(!isOpen));
});
minimalChatToggle.addEventListener("change", () => {
  state.minimalChat = minimalChatToggle.checked;
  render();
});
setupMinimalChatToggle.addEventListener("change", () => {
  state.minimalChat = setupMinimalChatToggle.checked;
  render();
});
approvalsToggle.addEventListener("change", () => {
  setApprovalsEnabled(approvalsToggle.checked);
});
setupApprovalsToggle.addEventListener("change", () => {
  setApprovalsEnabled(setupApprovalsToggle.checked);
});
clarifyToggle.addEventListener("change", () => {
  setClarificationsEnabled(clarifyToggle.checked);
});
setupClarifyToggle.addEventListener("change", () => {
  setClarificationsEnabled(setupClarifyToggle.checked);
});
document.addEventListener("click", (event) => {
  if (!settingsMenu.contains(event.target) && event.target !== settingsToggle) {
    settingsMenu.classList.remove("open");
    settingsMenu.setAttribute("aria-hidden", "true");
  }
});
planGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-plan]");
  if (!button) return;
  planGrid.querySelectorAll(".plan-chip").forEach((chip) => chip.classList.remove("selected"));
  button.classList.add("selected");
});
agentModal.addEventListener("click", (event) => {
  if (event.target === agentModal) closeModal();
});
agentName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addCustomAgent();
});
agentVibe.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addCustomAgent();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && agentModal.classList.contains("open")) closeModal();
});
resetDemo.addEventListener("click", () => {
  clearInterval(state.timer);
  state.running = false;
  state.paused = false;
  state.tasks = [];
  state.approvals = [];
  state.typingAgents = [];
  state.awaitingClarification = false;
  state.debateActive = false;
  state.runStep = 0;
  state.warnings = buildDefaultWarnings();
  state.toolHistory = [
    {
      time: now(),
      actor: "System",
      action: "Room reset",
      result: "Chat, tasks, approvals, and warnings returned to the starter state.",
    },
  ];
  seedWelcome();
  render();
});

templateList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-template]");
  if (!button) return;
  taskInput.value = templates[Number(button.dataset.template)].task;
});

agentList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  removeAgent(button.dataset.remove);
});

approvalList.addEventListener("click", (event) => {
  const approve = event.target.closest("[data-approve]");
  const deny = event.target.closest("[data-deny]");
  if (approve) resolveApproval(approve.dataset.approve, true);
  if (deny) resolveApproval(deny.dataset.deny, false);
});

chatFeed.addEventListener("click", (event) => {
  const button = event.target.closest("[data-clarify]");
  if (button) {
    answerClarification(button.dataset.clarify);
    return;
  }
  const approveDebate = event.target.closest("[data-debate-approve]");
  const reviseDebate = event.target.closest("[data-debate-revise]");
  if (approveDebate) resolveDebate(true);
  if (reviseDebate) resolveDebate(false);
});

composer.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = userMessage.value.trim();
  if (!text) return;
  if (state.awaitingClarification) {
    userMessage.value = "";
    answerClarification(text);
    return;
  }
  addMessage("You", "User", text, "user");
  userMessage.value = "";
  state.typingAgents = [{ name: "Mara", role: "Manager", microcopy: thinkingMicrocopy("Mara") }];
  render();
  setTimeout(() => {
    state.typingAgents = [];
    addMessage(
      "Mara",
      "Manager",
      "I have incorporated that direction. I will keep the team aligned with your latest instruction and gently confiscate any tangent trying to look important.",
      "",
      {
        reason: "Acknowledge user steering and update room direction",
        evidence: ["Latest user message", "Current task state"],
        mentions: ["Nia", "Owen", "Iris", "Vale"],
      }
    );
    log("User steered the room");
    render();
  }, 450);
});

summonManager.addEventListener("click", () => {
  addMessage(
    "Mara",
    "Manager",
    "Current room health: the team has visible roles, a mission, a task board, approvals, and an audit trail. The next build step is connecting real model calls and persistent project data. The room is lively, but still wearing sensible shoes.",
    "",
    {
      reason: "Give the user a room status check",
      evidence: ["Agent roster", "Task board", "Approval queue", "Audit trail"],
    }
  );
  render();
});

init();
