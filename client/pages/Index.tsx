import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { generateCodeForLanguage } from "@/utils/codeGenerator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Save,
  Settings,
  Code,
  Bot,
  Download,
  Github,
  Zap,
  Menu,
} from "lucide-react";
import NodeCanvas from "@/components/NodeCanvas";
import MonacoCodeEditor from "@/components/MonacoCodeEditor";
import AIAssistant from "@/components/AIAssistant";
import ProjectSidebar from "@/components/ProjectSidebar";
import SettingsPanel from "@/components/SettingsPanel";
import NodePropertiesPanel from "@/components/NodePropertiesPanel";

export default function Index() {
  const { state, dispatch } = useApp();
  const {
    sidebarOpen,
    activePanel,
    settings,
    nodes,
    connections,
    generatedCode,
  } = state;

  // Generate code when nodes or connections change
  useEffect(() => {
    if (nodes.length > 0) {
      const code = generateCodeForLanguage(nodes, connections, settings.language);
      dispatch({ type: "SET_GENERATED_CODE", payload: code });
      console.log("Code regenerated due to node/connection changes");
    }
  }, [nodes, connections, settings.language, dispatch]);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-matrix-dark via-matrix-purple-900 to-matrix-dark text-foreground overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-matrix-purple-500/20 to-matrix-gold-500/20 rounded-full blur-3xl matrix-float"></div>
        <div
          className="absolute top-60 right-20 w-48 h-48 bg-gradient-to-r from-matrix-gold-500/20 to-matrix-purple-500/20 rounded-full blur-3xl matrix-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/3 w-56 h-56 bg-gradient-to-r from-matrix-purple-600/20 to-matrix-gold-400/20 rounded-full blur-3xl matrix-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="h-16 glass-dark border-b border-matrix-purple-600/30 flex items-center justify-between px-6 z-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-matrix-purple-500/5 to-transparent"></div>

        <div className="flex items-center gap-4 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            className="hover:bg-matrix-purple-700/50 matrix-interactive"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-matrix-gold-400 to-matrix-gold-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-matrix-dark" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-matrix-gold-300 to-matrix-gold-500 bg-clip-text text-transparent">
              The Matrix IDE
            </h1>
            <Badge
              variant="outline"
              className="border-matrix-gold-400/50 text-matrix-gold-300 glass matrix-interactive"
            >
              v1.0.0-beta
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {/* Language Selector */}
          <Badge
            variant="secondary"
            className="glass text-matrix-gold-300 border-matrix-purple-600/50 matrix-interactive"
          >
            {settings.language.toUpperCase()}
          </Badge>

          {/* Action Buttons */}
          <Button
            size="sm"
            variant="outline"
            className="glass border-matrix-purple-600/50 hover:bg-matrix-purple-700/50 matrix-interactive"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark matrix-interactive"
            onClick={() => {
              dispatch({ type: "SET_ACTIVE_PANEL", payload: "code" });
              dispatch({ type: "SET_ACTIVE_TAB", payload: "output" });
              // Trigger code execution by creating a custom event
              setTimeout(() => {
                const event = new CustomEvent('executeCode');
                window.dispatchEvent(event);
              }, 100);
            }}
          >
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="glass border-matrix-purple-600/50 hover:bg-matrix-purple-700/50 matrix-interactive"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 glass-panel border-r border-matrix-purple-600/30 flex flex-col m-2 rounded-xl matrix-interactive">
            <ProjectSidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex gap-2 p-2">
          {/* Node Canvas */}
          <div className="flex-1 relative glass-panel rounded-xl overflow-hidden matrix-interactive">
            <NodeCanvas />
          </div>

          {/* Right Panel - Node Properties */}
          <div className="w-80 glass-panel rounded-xl flex flex-col matrix-interactive">
            <div className="flex-1 overflow-hidden">
              <NodePropertiesPanel />
            </div>
          </div>
        </div>

        {/* Bottom Panel - Code Editor, AI, Settings */}
        <div className="h-96 glass-panel border-t border-matrix-purple-600/30 flex flex-col m-2 mt-0 rounded-xl matrix-interactive">
          {/* Panel Tabs */}
          <div className="h-12 flex items-center gap-1 px-4 border-b border-matrix-purple-600/30">
            <Button
              variant={activePanel === "code" ? "secondary" : "ghost"}
              size="sm"
              onClick={() =>
                dispatch({ type: "SET_ACTIVE_PANEL", payload: "code" })
              }
              className={
                activePanel === "code"
                  ? "glass text-matrix-gold-300 matrix-interactive"
                  : "hover:bg-matrix-purple-700/30 matrix-interactive"
              }
            >
              <Code className="h-4 w-4 mr-2" />
              Code Editor
            </Button>
            <Button
              variant={activePanel === "ai" ? "secondary" : "ghost"}
              size="sm"
              onClick={() =>
                dispatch({ type: "SET_ACTIVE_PANEL", payload: "ai" })
              }
              className={
                activePanel === "ai"
                  ? "glass text-matrix-gold-300 matrix-interactive"
                  : "hover:bg-matrix-purple-700/30 matrix-interactive"
              }
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button
              variant={activePanel === "settings" ? "secondary" : "ghost"}
              size="sm"
              onClick={() =>
                dispatch({ type: "SET_ACTIVE_PANEL", payload: "settings" })
              }
              className={
                activePanel === "settings"
                  ? "glass text-matrix-gold-300 matrix-interactive"
                  : "hover:bg-matrix-purple-700/30 matrix-interactive"
              }
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === "code" && <MonacoCodeEditor />}
            {activePanel === "ai" && <AIAssistant />}
            {activePanel === "settings" && <SettingsPanel />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-8 glass-dark border-t border-matrix-purple-600/30 flex items-center justify-between px-6 text-sm relative z-10">
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="border-matrix-gold-400/50 text-matrix-gold-300 text-xs glass matrix-interactive"
          >
            Open Source
          </Badge>
          <span className="text-matrix-purple-300">Offline-First AI IDE</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs hover:bg-matrix-purple-700/30 matrix-interactive"
          >
            <Github className="h-3 w-3 mr-1" />
            GitHub
          </Button>
          <span className="text-matrix-purple-400">
            Ready for deployment on Windows, Linux, macOS
          </span>
        </div>
      </footer>
    </div>
  );
}
