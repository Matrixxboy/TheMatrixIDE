import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { generateCodeForLanguage } from "@/utils/codeGenerator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Save,
  Settings,
  FileText,
  Code,
  Bot,
  FolderTree,
  Download,
  Github,
  Zap,
  Monitor,
  Terminal,
  Palette,
  Plus,
  Minus,
  RotateCcw,
  Menu,
} from "lucide-react";
import NodeCanvas from "@/components/NodeCanvas";
import CodeEditor from "@/components/CodeEditor";
import AIAssistant from "@/components/AIAssistant";
import ProjectSidebar from "@/components/ProjectSidebar";
import SettingsPanel from "@/components/SettingsPanel";

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
    const code = generateCodeForLanguage(nodes, connections, settings.language);
    dispatch({ type: "SET_GENERATED_CODE", payload: code });
  }, [nodes, connections, settings.language, dispatch]);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-matrix-dark via-matrix-purple-900 to-matrix-dark text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-16 glass-dark border-b border-matrix-purple-600/30 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            className="hover:bg-matrix-purple-700/50"
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
              className="border-matrix-gold-400/50 text-matrix-gold-300"
            >
              v1.0.0-beta
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <Badge
            variant="secondary"
            className="bg-matrix-purple-700/50 text-matrix-gold-300 border-matrix-purple-600/50"
          >
            {settings.language.toUpperCase()}
          </Badge>

          {/* Action Buttons */}
          <Button
            size="sm"
            variant="outline"
            className="border-matrix-purple-600/50 hover:bg-matrix-purple-700/50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark"
          >
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-matrix-purple-600/50 hover:bg-matrix-purple-700/50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 glass-panel border-r border-matrix-purple-600/30 flex flex-col">
            <ProjectSidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Node Canvas */}
          <div className="flex-1 relative">
            <NodeCanvas />
          </div>

          {/* Bottom Panel */}
          <div className="h-80 glass-panel border-t border-matrix-purple-600/30 flex flex-col">
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
                    ? "bg-matrix-purple-700/50 text-matrix-gold-300"
                    : "hover:bg-matrix-purple-700/30"
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
                    ? "bg-matrix-purple-700/50 text-matrix-gold-300"
                    : "hover:bg-matrix-purple-700/30"
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
                    ? "bg-matrix-purple-700/50 text-matrix-gold-300"
                    : "hover:bg-matrix-purple-700/30"
                }
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              {activePanel === "code" && <CodeEditor />}
              {activePanel === "ai" && <AIAssistant />}
              {activePanel === "settings" && <SettingsPanel />}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-8 glass-dark border-t border-matrix-purple-600/30 flex items-center justify-between px-6 text-sm">
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="border-matrix-gold-400/50 text-matrix-gold-300 text-xs"
          >
            Open Source
          </Badge>
          <span className="text-matrix-purple-300">Offline-First AI IDE</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs hover:bg-matrix-purple-700/30"
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
