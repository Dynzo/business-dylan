export type PillarKey = "web" | "data" | "ai";

export type Pillar = {
  id: string;
  key: PillarKey;
  name: string;
  tagline: string;
  description: string;
  order_index: number;
  active: boolean;
};

export type Service = {
  id: string;
  pillar_id: string;
  name: string;
  description: string;
  includes: string[];
  price_label: string;
  cta_label: string;
  order_index: number;
  active: boolean;
};

export type ServiceWithPillar = Service & {
  pillars: { key: PillarKey; name: string } | null;
};

export type LeadStatus = "new" | "researching" | "qualified" | "contacted" | "archived";

export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  company_domain: string;
  message: string;
  source: string;
  status: LeadStatus;
  created_at: string;
};

export type LeadInput = {
  name: string;
  email: string;
  company: string;
  message: string;
};

// Structured research output — gevalideerd via het Zod-schema in lib/agents/schema.ts.
export type BriefingContent = {
  summary: string;
  sector: string;
  size_estimate: string;
  website_quality: string;
  tech_signals: string[];
  news_signals: string[];
  angle: string;
};

export type Company = {
  id: string;
  domain: string;
  name: string;
  sector: string;
  size_estimate: string;
  summary: string;
  website_quality: string;
  tech_signals: string[];
  news: string[];
  updated_at: string;
};

export type Briefing = {
  id: string;
  lead_id: string | null;
  company_id: string;
  content: BriefingContent;
  angle: string;
  draft_reply: string;
  model_used: string;
  created_at: string;
};

export type BriefingWithCompany = Briefing & {
  companies: Company | null;
};

export type AgentName = "research" | "enrichment";
export type AgentRunStatus = "success" | "error";

export type AgentRun = {
  id: string;
  agent: AgentName;
  input: Record<string, unknown>;
  status: AgentRunStatus;
  tokens: number | null;
  cost_estimate: number | null;
  error: string | null;
  created_at: string;
};
