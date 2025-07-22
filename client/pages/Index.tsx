import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { generateCodeForLanguage } from "@/utils/codeGenerator";
import { NodeExecutor } from "@/utils/nodeExecutor";
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
      const code = generateCodeForLanguage(
        nodes,
        connections,
        settings.language,
      );
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
      <header className="h-16 glass-dark border-b border-matrix-purple-600/30 flex items-center justify-between px-4 sm:px-6 z-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-matrix-purple-500/5 to-transparent"></div>

        <div className="flex items-center gap-2 sm:gap-4 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            className="hover:bg-matrix-purple-700/50 matrix-interactive"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-matrix-gold-400 to-matrix-gold-600 flex items-center justify-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-matrix-dark" />
            </div>
            <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-matrix-gold-300 to-matrix-gold-500 bg-clip-text text-transparent">
              <span className="hidden sm:inline">The Matrix IDE</span>
              <span className="sm:hidden">Matrix</span>
            </h1>
            <Badge
              variant="outline"
              className="border-matrix-gold-400/50 text-matrix-gold-300 glass matrix-interactive text-xs hidden sm:inline-flex"
            >
              v1.0.0-beta
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 relative z-10">
          {/* Language Selector */}
          <Badge
            variant="secondary"
            className="glass text-matrix-gold-300 border-matrix-purple-600/50 matrix-interactive text-xs"
          >
            {settings.language.toUpperCase()}
          </Badge>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
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
              onClick={async () => {
                if (nodes.length === 0) {
                  alert("Add some nodes to the canvas first!");
                  return;
                }

                dispatch({ type: "SET_ACTIVE_PANEL", payload: "code" });
                dispatch({ type: "SET_ACTIVE_TAB", payload: "output" });

                try {
                  const executor = new NodeExecutor();
                  const context = await executor.executeNodeGraph(
                    nodes,
                    connections,
                  );
                  dispatch({ type: "SET_EXECUTION_CONTEXT", payload: context });

                  // Trigger code editor to update output
                  setTimeout(() => {
                    const event = new CustomEvent("executeCode");
                    window.dispatchEvent(event);
                  }, 100);
                } catch (error) {
                  console.error("Execution failed:", error);
                }
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

          {/* Action Buttons - Mobile */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-matrix-purple-700/50"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark h-8 px-3"
              onClick={async () => {
                if (nodes.length === 0) {
                  alert("Add some nodes to the canvas first!");
                  return;
                }

                dispatch({ type: "SET_ACTIVE_PANEL", payload: "code" });
                dispatch({ type: "SET_ACTIVE_TAB", payload: "output" });

                try {
                  const executor = new NodeExecutor();
                  const context = await executor.executeNodeGraph(
                    nodes,
                    connections,
                  );
                  dispatch({ type: "SET_EXECUTION_CONTEXT", payload: context });

                  setTimeout(() => {
                    const event = new CustomEvent("executeCode");
                    window.dispatchEvent(event);
                  }, 100);
                } catch (error) {
                  console.error("Execution failed:", error);
                }
              }}
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-matrix-purple-700/50"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Sidebar - Mobile Overlay, Desktop Side Panel */}
        {sidebarOpen && (
          <>
            {/* Mobile Overlay */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            />
            {/* Sidebar Panel */}
            <div className="w-80 glass-panel border-r border-matrix-purple-600/30 flex flex-col m-2 rounded-xl matrix-interactive lg:relative fixed left-0 top-16 bottom-0 z-50 lg:z-auto">
              <ProjectSidebar />
            </div>
          </>
        )}

        {/* Main Content Area - Responsive Layout */}
        <div className="flex-1 flex flex-col xl:flex-row gap-2 p-2 min-h-0">
          {/* Primary Content - Canvas + Properties */}
          <div className="flex-1 flex flex-col lg:flex-row gap-2 min-h-0">
            {/* Node Canvas */}
            <div className="flex-1 relative glass-panel rounded-xl overflow-hidden matrix-interactive min-h-80 lg:min-h-0">
              <NodeCanvas />
            </div>

            {/* Right Panel - Node Properties (Hidden on small screens, collapsible on medium) */}
            <div className="w-full lg:w-80 glass-panel rounded-xl flex flex-col matrix-interactive lg:min-h-0">
              <div className="flex-1 overflow-hidden">
                <NodePropertiesPanel />
              </div>
            </div>
          </div>

          {/* Bottom/Side Panel - Code Editor, AI, Settings */}
          <div className="w-full xl:w-[600px] h-[500px] xl:h-auto glass-panel border-t xl:border-t-0 xl:border-l border-matrix-purple-600/30 flex flex-col xl:mt-0 rounded-xl matrix-interactive">
            {/* Panel Tabs */}
            <div className="h-12 flex items-center gap-1 px-4 border-b border-matrix-purple-600/30 overflow-x-auto">
              <Button
                variant={activePanel === "code" ? "secondary" : "ghost"}
                size="sm"
                onClick={() =>
                  dispatch({ type: "SET_ACTIVE_PANEL", payload: "code" })
                }
                className={
                  activePanel === "code"
                    ? "glass text-matrix-gold-300 matrix-interactive flex-shrink-0"
                    : "hover:bg-matrix-purple-700/30 matrix-interactive flex-shrink-0"
                }
              >
                <Code className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Code Editor</span>
                <span className="sm:hidden">Code</span>
              </Button>
              <Button
                variant={activePanel === "ai" ? "secondary" : "ghost"}
                size="sm"
                onClick={() =>
                  dispatch({ type: "SET_ACTIVE_PANEL", payload: "ai" })
                }
                className={
                  activePanel === "ai"
                    ? "glass text-matrix-gold-300 matrix-interactive flex-shrink-0"
                    : "hover:bg-matrix-purple-700/30 matrix-interactive flex-shrink-0"
                }
              >
                <Bot className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">AI Assistant</span>
                <span className="sm:hidden">AI</span>
              </Button>
              <Button
                variant={activePanel === "settings" ? "secondary" : "ghost"}
                size="sm"
                onClick={() =>
                  dispatch({ type: "SET_ACTIVE_PANEL", payload: "settings" })
                }
                className={
                  activePanel === "settings"
                    ? "glass text-matrix-gold-300 matrix-interactive flex-shrink-0"
                    : "hover:bg-matrix-purple-700/30 matrix-interactive flex-shrink-0"
                }
              >
                <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Config</span>
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
      </div>

      {/* Footer - Mobile-responsive */}
      <footer className="h-8 sm:h-10 glass-dark border-t border-matrix-purple-600/30 flex items-center justify-between px-3 sm:px-6 text-xs sm:text-sm relative z-10">
        <div className="flex items-center gap-2 sm:gap-4">
          <Badge
            variant="outline"
            className="border-matrix-gold-400/50 text-matrix-gold-300 text-xs glass matrix-interactive"
          >
            <span className="hidden sm:inline">Open Source</span>
            <span className="sm:hidden">OSS</span>
          </Badge>
          <span className="text-matrix-purple-300 hidden sm:inline">
            Offline-First AI IDE
          </span>
          <span className="text-matrix-purple-300 sm:hidden">AI IDE</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 sm:h-7 text-xs hover:bg-matrix-purple-700/30 matrix-interactive touch-manipulation px-2"
          >
            <Github className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">GitHub</span>
            <span className="sm:hidden">Git</span>
          </Button>
          <span className="text-matrix-purple-400 hidden lg:inline text-xs">
            Ready for deployment on Windows, Linux, macOS
          </span>
          <span className="text-matrix-purple-400 lg:hidden text-xs">
            Multi-platform
          </span>
        </div>
      </footer>
    </div>
  );
}
