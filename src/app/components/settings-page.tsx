import { useState } from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { ScrollArea } from "./ui/scroll-area";
import { Shield, Key, Server, Plug, Save, CheckCircle } from "lucide-react";

interface IntegrationConfig {
  name: string;
  connected: boolean;
  apiKey: string;
  endpoint: string;
  skills: string[];
}

const defaultIntegrations: IntegrationConfig[] = [
  { name: "ServiceNow", connected: true, apiKey: "••••••••••••sn4k", endpoint: "https://instance.service-now.com/api", skills: ["Create Epic", "Create Story", "Query Incidents", "Update Ticket"] },
  { name: "Confluence", connected: true, apiKey: "••••••••••••cf2x", endpoint: "https://wiki.atlassian.net/api/v2", skills: ["Create Page", "Update Page", "Attach Diagram"] },
  { name: "Figma", connected: false, apiKey: "", endpoint: "https://api.figma.com/v1", skills: ["Create Component", "Export Assets", "Read Design Tokens"] },
  { name: "GitHub", connected: true, apiKey: "••••••••••••gh9m", endpoint: "https://api.github.com", skills: ["Create Branch", "Create PR", "Trigger Workflow", "Read Repo"] },
  { name: "GitHub Actions", connected: true, apiKey: "••••••••••••gh9m", endpoint: "https://api.github.com", skills: ["Run Pipeline", "Deploy Staging", "Deploy Production"] },
];

export function SettingsPage() {
  const [integrations, setIntegrations] = useState(defaultIntegrations);
  const [saved, setSaved] = useState(false);

  const toggleConnection = (idx: number) => {
    setIntegrations((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, connected: !item.connected } : item))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-zinc-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Global Configuration
            </h2>
            <p className="text-[13px] text-zinc-500 mt-1">
              Manage MCP integrations, API credentials, and agent skills.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-[13px]"
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* MCP Protocol Info */}
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <Plug className="w-4 h-4 text-indigo-600" />
            <span className="text-[13px] text-indigo-700">Model Context Protocol (MCP)</span>
          </div>
          <p className="text-[12px] text-zinc-500">
            All agent integrations use MCP to securely interface with external services.
            Each tool call is logged and auditable. Configure credentials below.
          </p>
        </div>

        {/* Integration Cards */}
        <div className="space-y-4">
          {integrations.map((integration, idx) => (
            <div
              key={integration.name}
              className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-800 text-[14px]">{integration.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      integration.connected
                        ? "text-[10px] border-emerald-200 text-emerald-600 bg-emerald-50"
                        : "text-[10px] border-zinc-200 text-zinc-400"
                    }
                  >
                    {integration.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <Switch
                  checked={integration.connected}
                  onCheckedChange={() => toggleConnection(idx)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-500 mb-1 block">API Endpoint</label>
                  <Input
                    value={integration.endpoint}
                    className="h-8 text-[12px] bg-zinc-50 border-zinc-200 text-zinc-600"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 mb-1 block flex items-center gap-1">
                    <Key className="w-3 h-3" /> API Key
                  </label>
                  <Input
                    value={integration.apiKey || "Not configured"}
                    type="password"
                    className="h-8 text-[12px] bg-zinc-50 border-zinc-200 text-zinc-600"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 mb-1.5 block">MCP Skills</label>
                <div className="flex flex-wrap gap-1.5">
                  {integration.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-[10px] bg-zinc-100 text-zinc-600 border-zinc-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}