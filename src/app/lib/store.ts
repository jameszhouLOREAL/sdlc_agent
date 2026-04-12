import { useState, useCallback, useRef, useEffect } from "react";

export type AgentStatus = "idle" | "processing" | "pending_approval" | "complete" | "error";

export interface LogEntry {
  timestamp: string;
  type: "thinking" | "action" | "result" | "error";
  message: string;
}

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  icon: string;
  status: AgentStatus;
  progress: number;
  inputSchema: Record<string, any>;
  outputPreview: Record<string, any> | null;
  logs: LogEntry[];
  integration: string;
  description: string;
}

export interface ProjectRun {
  id: string;
  name: string;
  createdAt: string;
  status: "running" | "paused" | "complete" | "failed";
  currentAgentIndex: number;
  mode: "autonomous" | "supervised";
  agents: AgentNode[];
}

const createDefaultAgents = (): AgentNode[] => [
  {
    id: "product",
    name: "Product Agent",
    role: "Requirements Engineering",
    icon: "ClipboardList",
    status: "idle",
    progress: 0,
    inputSchema: { raw_requirements: "string", stakeholders: "string[]", priority: "P0|P1|P2" },
    outputPreview: null,
    logs: [],
    integration: "ServiceNow",
    description: "Transforms raw business requirements into structured Epics and Stories in ServiceNow.",
  },
  {
    id: "architect",
    name: "Architect Agent",
    role: "System Design",
    icon: "Network",
    status: "idle",
    progress: 0,
    inputSchema: { stories: "Story[]", constraints: "string[]" },
    outputPreview: null,
    logs: [],
    integration: "Confluence",
    description: "Produces system architecture, tech stack decisions, and Confluence documentation.",
  },
  {
    id: "design",
    name: "Design Agent",
    role: "UI/UX Design",
    icon: "Palette",
    status: "idle",
    progress: 0,
    inputSchema: { stories: "Story[]", architecture: "ArchDoc", style_guide: "string" },
    outputPreview: null,
    logs: [],
    integration: "Figma",
    description: "Generates Figma mockups and component designs from stories and architecture.",
  },
  {
    id: "developer",
    name: "Developer Agent",
    role: "Implementation",
    icon: "Code",
    status: "idle",
    progress: 0,
    inputSchema: { architecture: "ArchDoc", designs: "FigmaAsset[]", stories: "Story[]" },
    outputPreview: null,
    logs: [],
    integration: "GitHub",
    description: "Writes source code, unit tests, and creates pull requests in GitHub.",
  },
  {
    id: "devops",
    name: "DevOps Agent",
    role: "Deployment",
    icon: "Container",
    status: "idle",
    progress: 0,
    inputSchema: { source_code: "Repo", branch: "string", env: "staging|production" },
    outputPreview: null,
    logs: [],
    integration: "GitHub Actions",
    description: "Manages CI/CD pipelines, infrastructure, and deployment to production.",
  },
  {
    id: "support",
    name: "Support Agent",
    role: "Incident Response",
    icon: "LifeBuoy",
    status: "idle",
    progress: 0,
    inputSchema: { incidents: "Incident[]", severity: "string" },
    outputPreview: null,
    logs: [],
    integration: "ServiceNow",
    description: "Monitors incidents, generates bug reports, and loops fixes back to Developer Agent.",
  },
];

const MOCK_LOGS: Record<string, LogEntry[]> = {
  product: [
    { timestamp: "00:00.1", type: "thinking", message: "Analyzing raw business requirements document..." },
    { timestamp: "00:01.3", type: "action", message: "MCP Call: servicenow.createEpic({ title: 'User Auth Module', priority: 'P0' })" },
    { timestamp: "00:02.7", type: "result", message: "Epic EPIC-1042 created. Decomposing into 6 user stories..." },
    { timestamp: "00:04.1", type: "action", message: "MCP Call: servicenow.createStory({ epic: 'EPIC-1042', title: 'OAuth2 Login Flow' })" },
    { timestamp: "00:05.5", type: "result", message: "Stories US-3201 through US-3206 created with acceptance criteria." },
  ],
  architect: [
    { timestamp: "00:00.2", type: "thinking", message: "Reviewing 6 stories for architectural implications..." },
    { timestamp: "00:01.8", type: "thinking", message: "Recommending microservices pattern for auth module isolation." },
    { timestamp: "00:03.1", type: "action", message: "MCP Call: confluence.createPage({ space: 'ARCH', title: 'Auth Module - System Design' })" },
    { timestamp: "00:04.6", type: "result", message: "Architecture doc published. Tech stack: Node.js, PostgreSQL, Redis, Docker." },
  ],
  design: [
    { timestamp: "00:00.3", type: "thinking", message: "Mapping stories to UI screens and interaction flows..." },
    { timestamp: "00:02.0", type: "action", message: "MCP Call: figma.createComponent({ name: 'LoginForm', variants: ['default','error','loading'] })" },
    { timestamp: "00:03.8", type: "result", message: "4 Figma frames generated: Login, Register, MFA, Password Reset." },
  ],
  developer: [
    { timestamp: "00:00.1", type: "thinking", message: "Scaffolding auth service from architecture spec..." },
    { timestamp: "00:02.4", type: "action", message: "MCP Call: github.createBranch({ repo: 'platform', branch: 'feat/auth-module' })" },
    { timestamp: "00:04.0", type: "action", message: "Writing 12 source files and 24 unit tests..." },
    { timestamp: "00:06.2", type: "result", message: "PR #847 created. 94% test coverage. All linting passed." },
  ],
  devops: [
    { timestamp: "00:00.2", type: "action", message: "MCP Call: github.triggerWorkflow({ workflow: 'ci-cd.yml', ref: 'feat/auth-module' })" },
    { timestamp: "00:02.1", type: "thinking", message: "CI pipeline running: lint -> test -> build -> deploy staging..." },
    { timestamp: "00:04.5", type: "result", message: "Deployed to staging: https://staging.app.example.com. Health check passed." },
  ],
  support: [
    { timestamp: "00:00.1", type: "thinking", message: "Scanning ServiceNow for new incidents on auth module..." },
    { timestamp: "00:01.5", type: "action", message: "MCP Call: servicenow.queryIncidents({ module: 'auth', status: 'new' })" },
    { timestamp: "00:02.8", type: "result", message: "2 incidents found. Creating bug reports and routing to Developer Agent." },
  ],
};

const MOCK_OUTPUTS: Record<string, Record<string, any>> = {
  product: {
    epic: { id: "EPIC-1042", title: "User Authentication Module", stories_count: 6, priority: "P0" },
    stories: [
      { id: "US-3201", title: "OAuth2 Login Flow", points: 5, status: "Ready" },
      { id: "US-3202", title: "User Registration", points: 3, status: "Ready" },
      { id: "US-3203", title: "Multi-Factor Auth", points: 8, status: "Ready" },
    ],
  },
  architect: {
    tech_stack: { backend: "Node.js + Express", database: "PostgreSQL", cache: "Redis", container: "Docker" },
    patterns: ["Microservices", "Event-Driven", "CQRS"],
    confluence_url: "https://wiki.example.com/arch/auth-module",
  },
  design: {
    figma_url: "https://figma.com/file/abc123/auth-module",
    screens: ["Login", "Register", "MFA Challenge", "Password Reset"],
    components: 12,
    design_tokens: { primary: "#6366F1", surface: "#1E1B4B" },
  },
  developer: {
    pull_request: { id: "PR-847", branch: "feat/auth-module", files_changed: 12, additions: 1842, deletions: 23 },
    test_coverage: "94.2%",
    lint_status: "passed",
  },
  devops: {
    pipeline_status: "success",
    staging_url: "https://staging.app.example.com",
    build_time: "3m 42s",
    docker_image: "registry.example.com/auth:v1.0.0-rc1",
  },
  support: {
    incidents_processed: 2,
    bugs_created: [
      { id: "BUG-501", title: "Token refresh race condition", severity: "High", routed_to: "Developer Agent" },
    ],
  },
};

export function useProjectStore() {
  const [run, setRun] = useState<ProjectRun>({
    id: "run-001",
    name: "Auth Module v2.0",
    createdAt: "2026-04-12T09:00:00Z",
    status: "paused",
    currentAgentIndex: -1,
    mode: "supervised",
    agents: createDefaultAgents(),
  });

  const [selectedAgentId, setSelectedAgentId] = useState<string>("product");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedAgent = run.agents.find((a) => a.id === selectedAgentId) || run.agents[0];

  const updateAgent = useCallback((id: string, updates: Partial<AgentNode>) => {
    setRun((prev) => ({
      ...prev,
      agents: prev.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  }, []);

  const simulateAgent = useCallback(
    (index: number) => {
      const agent = run.agents[index];
      if (!agent) {
        setRun((prev) => ({ ...prev, status: "complete" }));
        return;
      }

      setRun((prev) => ({ ...prev, currentAgentIndex: index, status: "running" }));
      updateAgent(agent.id, { status: "processing", progress: 0, logs: [], outputPreview: null });
      setSelectedAgentId(agent.id);

      const logs = MOCK_LOGS[agent.id] || [];
      let logIndex = 0;

      const addLog = () => {
        if (logIndex < logs.length) {
          const progress = Math.round(((logIndex + 1) / logs.length) * 80);
          updateAgent(agent.id, {
            progress,
            logs: logs.slice(0, logIndex + 1),
          });
          logIndex++;
          timerRef.current = setTimeout(addLog, 800 + Math.random() * 600);
        } else {
          // Agent done processing
          const mode = run.mode;
          updateAgent(agent.id, {
            progress: 100,
            outputPreview: MOCK_OUTPUTS[agent.id] || null,
            status: mode === "supervised" ? "pending_approval" : "complete",
          });
          if (mode === "autonomous") {
            timerRef.current = setTimeout(() => simulateAgent(index + 1), 1000);
          } else {
            setRun((prev) => ({ ...prev, status: "paused" }));
          }
        }
      };

      timerRef.current = setTimeout(addLog, 500);
    },
    [run.agents, run.mode, updateAgent]
  );

  const startRun = useCallback(() => {
    // Reset all agents
    setRun((prev) => ({
      ...prev,
      status: "running",
      currentAgentIndex: 0,
      agents: prev.agents.map((a) => ({ ...a, status: "idle" as AgentStatus, progress: 0, logs: [], outputPreview: null })),
    }));
    setTimeout(() => simulateAgent(0), 300);
  }, [simulateAgent]);

  const approveAndProceed = useCallback(() => {
    const idx = run.currentAgentIndex;
    const agent = run.agents[idx];
    if (agent) {
      updateAgent(agent.id, { status: "complete" });
    }
    setTimeout(() => simulateAgent(idx + 1), 500);
  }, [run.currentAgentIndex, run.agents, updateAgent, simulateAgent]);

  const editAndRetry = useCallback(() => {
    const idx = run.currentAgentIndex;
    simulateAgent(idx);
  }, [run.currentAgentIndex, simulateAgent]);

  const toggleMode = useCallback(() => {
    setRun((prev) => ({
      ...prev,
      mode: prev.mode === "autonomous" ? "supervised" : "autonomous",
    }));
  }, []);

  const pauseRun = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRun((prev) => ({ ...prev, status: "paused" }));
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    run,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    startRun,
    approveAndProceed,
    editAndRetry,
    toggleMode,
    pauseRun,
  };
}
