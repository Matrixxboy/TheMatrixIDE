import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Palette,
  Code,
  Bot,
  Download,
  Github,
  Monitor,
  Cpu,
  Brain,
  Shield,
  Zap,
  Save,
  RotateCcw,
  HardDrive,
  Globe,
  Eye,
  Volume2,
} from "lucide-react";

interface SettingsState {
  // Appearance
  theme: "dark" | "light" | "auto";
  fontSize: number;
  nodeSnapToGrid: boolean;
  showMinimap: boolean;

  // Editor
  language: string;
  autoSave: boolean;
  livePreview: boolean;
  wordWrap: boolean;

  // AI
  aiEnabled: boolean;
  aiModel: string;
  aiSuggestions: boolean;
  aiAutoComplete: boolean;

  // Performance
  maxNodes: number;
  renderOptimization: boolean;
  memoryLimit: number;

  // Export
  defaultExportFormat: string;
  includeComments: boolean;
  minifyCode: boolean;
}

export default function SettingsPanel() {
  const { state, dispatch } = useApp();
  const { settings, activeTab } = state;
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local settings with global state
  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    dispatch({ type: "UPDATE_SETTINGS", payload: localSettings });
    localStorage.setItem("matrix-ide-settings", JSON.stringify(localSettings));
    setHasChanges(false);
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      theme: "dark" as const,
      fontSize: 14,
      nodeSnapToGrid: true,
      showMinimap: true,
      language: "python",
      autoSave: true,
      livePreview: true,
      wordWrap: true,
      aiEnabled: true,
      aiModel: "local-gpt-neo",
      aiSuggestions: true,
      aiAutoComplete: true,
      maxNodes: 100,
      renderOptimization: true,
      memoryLimit: 512,
      defaultExportFormat: "python",
      includeComments: true,
      minifyCode: false,
    };
    setLocalSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Settings Header */}
      <div className="h-12 border-b border-matrix-purple-600/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-matrix-gold-400" />
          <span className="text-sm font-medium text-matrix-gold-300">
            Settings & Preferences
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleResetSettings}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSaveSettings}
            disabled={!hasChanges}
            className={`bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark ${
              !hasChanges ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Save className="h-4 w-4 mr-1" />
            {hasChanges ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            dispatch({ type: "SET_ACTIVE_TAB", payload: value })
          }
          className="h-full flex flex-col"
        >
          <TabsList className="mx-4 mt-2 bg-matrix-purple-800/30 border border-matrix-purple-600/30 grid grid-cols-4">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <Monitor className="h-4 w-4 mr-1" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <Code className="h-4 w-4 mr-1" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <Bot className="h-4 w-4 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-4 py-4">
            <TabsContent value="general" className="m-0 space-y-6">
              {/* Appearance */}
              <div className="glass-panel rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-matrix-gold-400" />
                  <span className="font-medium text-matrix-gold-300">
                    Appearance
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Theme
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Choose your preferred color scheme
                      </div>
                    </div>
                    <Select
                      value={localSettings.theme}
                      onValueChange={(value: any) =>
                        updateSetting("theme", value)
                      }
                    >
                      <SelectTrigger className="w-32 bg-matrix-purple-800/30 border-matrix-purple-600/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Font Size
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Adjust editor font size
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-matrix-purple-300">
                        {localSettings.fontSize}px
                      </span>
                      <Slider
                        value={[localSettings.fontSize]}
                        onValueChange={([value]) =>
                          updateSetting("fontSize", value)
                        }
                        min={10}
                        max={24}
                        step={1}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Node Snap to Grid
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Align nodes to grid automatically
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.nodeSnapToGrid}
                      onCheckedChange={(checked) =>
                        updateSetting("nodeSnapToGrid", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Show Minimap
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Display minimap in node canvas
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.showMinimap}
                      onCheckedChange={(checked) =>
                        updateSetting("showMinimap", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="glass-panel rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-matrix-gold-400" />
                  <span className="font-medium text-matrix-gold-300">
                    Performance
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Max Nodes
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Maximum nodes in canvas
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-matrix-purple-300">
                        {localSettings.maxNodes}
                      </span>
                      <Slider
                        value={[localSettings.maxNodes]}
                        onValueChange={([value]) =>
                          updateSetting("maxNodes", value)
                        }
                        min={50}
                        max={500}
                        step={10}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Render Optimization
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Optimize rendering for better performance
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.renderOptimization}
                      onCheckedChange={(checked) =>
                        updateSetting("renderOptimization", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Memory Limit (MB)
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Memory usage limit for AI processing
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-matrix-purple-300">
                        {localSettings.memoryLimit}MB
                      </span>
                      <Slider
                        value={[localSettings.memoryLimit]}
                        onValueChange={([value]) =>
                          updateSetting("memoryLimit", value)
                        }
                        min={256}
                        max={2048}
                        step={64}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="editor" className="m-0 space-y-6">
              <div className="glass-panel rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="h-5 w-5 text-matrix-gold-400" />
                  <span className="font-medium text-matrix-gold-300">
                    Code Editor
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Default Language
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Primary programming language
                      </div>
                    </div>
                    <Select
                      value={localSettings.language}
                      onValueChange={(value) =>
                        updateSetting("language", value)
                      }
                    >
                      <SelectTrigger className="w-32 bg-matrix-purple-800/30 border-matrix-purple-600/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Auto Save
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Automatically save changes
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.autoSave}
                      onCheckedChange={(checked) =>
                        updateSetting("autoSave", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Live Preview
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Real-time code execution preview
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.livePreview}
                      onCheckedChange={(checked) =>
                        updateSetting("livePreview", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Word Wrap
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Wrap long lines in editor
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.wordWrap}
                      onCheckedChange={(checked) =>
                        updateSetting("wordWrap", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="m-0 space-y-6">
              <div className="glass-panel rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-matrix-gold-400" />
                  <span className="font-medium text-matrix-gold-300">
                    AI Assistant
                  </span>
                  <Badge
                    variant="outline"
                    className="border-green-400/50 text-green-300"
                  >
                    <Cpu className="h-3 w-3 mr-1" />
                    Local
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Enable AI
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Enable local AI processing
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.aiEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("aiEnabled", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        AI Model
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Local AI model to use
                      </div>
                    </div>
                    <Select
                      value={localSettings.aiModel}
                      onValueChange={(value) => updateSetting("aiModel", value)}
                    >
                      <SelectTrigger className="w-40 bg-matrix-purple-800/30 border-matrix-purple-600/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local-gpt-neo">
                          GPT-Neo (Local)
                        </SelectItem>
                        <SelectItem value="local-codegen">
                          CodeGen (Local)
                        </SelectItem>
                        <SelectItem value="local-llama">
                          LLaMA (Local)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        AI Suggestions
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Show AI-powered suggestions
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.aiSuggestions}
                      onCheckedChange={(checked) =>
                        updateSetting("aiSuggestions", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        AI Auto Complete
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Auto-complete code with AI
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.aiAutoComplete}
                      onCheckedChange={(checked) =>
                        updateSetting("aiAutoComplete", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="export" className="m-0 space-y-6">
              <div className="glass-panel rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Download className="h-5 w-5 text-matrix-gold-400" />
                  <span className="font-medium text-matrix-gold-300">
                    Export & Deployment
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Default Export Format
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Default code export format
                      </div>
                    </div>
                    <Select
                      value={localSettings.defaultExportFormat}
                      onValueChange={(value) =>
                        updateSetting("defaultExportFormat", value)
                      }
                    >
                      <SelectTrigger className="w-32 bg-matrix-purple-800/30 border-matrix-purple-600/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="docker">Docker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Include Comments
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Add explanatory comments to exported code
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.includeComments}
                      onCheckedChange={(checked) =>
                        updateSetting("includeComments", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-matrix-purple-200">
                        Minify Code
                      </div>
                      <div className="text-xs text-matrix-purple-400">
                        Minify exported code for production
                      </div>
                    </div>
                    <Switch
                      checked={localSettings.minifyCode}
                      onCheckedChange={(checked) =>
                        updateSetting("minifyCode", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Deployment Options */}
              <div className="glass-panel rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-matrix-gold-400" />
                  <span className="font-medium text-matrix-gold-300">
                    Deployment Targets
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="border-matrix-purple-600/50 hover:bg-matrix-purple-700/30"
                  >
                    <HardDrive className="h-4 w-4 mr-2" />
                    Windows
                  </Button>
                  <Button
                    variant="outline"
                    className="border-matrix-purple-600/50 hover:bg-matrix-purple-700/30"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Linux
                  </Button>
                  <Button
                    variant="outline"
                    className="border-matrix-purple-600/50 hover:bg-matrix-purple-700/30"
                  >
                    <Cpu className="h-4 w-4 mr-2" />
                    macOS
                  </Button>
                  <Button
                    variant="outline"
                    className="border-matrix-purple-600/50 hover:bg-matrix-purple-700/30"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
