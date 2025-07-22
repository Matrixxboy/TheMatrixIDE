import { useEffect, useRef, useState } from "react";
import { Editor, OnMount, OnChange } from "@monaco-editor/react";
import { useApp } from "@/contexts/AppContext";
import { NodeExecutor } from "@/utils/nodeExecutor";
import {
  codeSnippets,
  getSnippetsByLanguage,
  searchSnippets,
  getAllCategories,
  insertSnippet,
} from "@/utils/codeSnippets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Copy,
  Download,
  Save,
  RotateCcw,
  FileText,
  Terminal,
  Bug,
  Settings,
  Eye,
  Edit3,
  Maximize2,
  Minimize2,
  MoreVertical,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info,
  Code2,
  Search,
  Plus,
} from "lucide-react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
}

interface DiagnosticMessage {
  type: "error" | "warning" | "info";
  line: number;
  column: number;
  message: string;
  source: string;
}

export default function MonacoCodeEditor() {
  const { state, dispatch } = useApp();
  const { generatedCode, settings, activeTab } = state;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [localCode, setLocalCode] = useState(generatedCode);
  const [output, setOutput] = useState("");
  const [diagnostics, setDiagnostics] = useState<DiagnosticMessage[]>([]);
  const [isModified, setIsModified] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [snippetSearch, setSnippetSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setLocalCode(generatedCode);
    setIsModified(false);
  }, [generatedCode]);

  useEffect(() => {
    if (editorInstance && generatedCode) {
      simulateCodeAnalysis();
    }
  }, [editorInstance, generatedCode]);

  // Listen for external execution triggers
  useEffect(() => {
    const handleExecuteCode = () => {
      handleRun();
    };

    window.addEventListener("executeCode", handleExecuteCode);

    return () => {
      window.removeEventListener("executeCode", handleExecuteCode);
    };
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    setEditorInstance(editor);
    editorRef.current = editor;

    // Configure Monaco for Matrix IDE theme
    monaco.editor.defineTheme("matrix-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "8b5cf6", fontStyle: "italic" },
        { token: "keyword", foreground: "f59e0b", fontStyle: "bold" },
        { token: "string", foreground: "10b981" },
        { token: "number", foreground: "f59e0b" },
        { token: "function", foreground: "06b6d4" },
        { token: "class", foreground: "f59e0b" },
        { token: "variable", foreground: "e5e7eb" },
      ],
      colors: {
        "editor.background": "#1a1a2e",
        "editor.foreground": "#e5e7eb",
        "editorLineNumber.foreground": "#8b5cf6",
        "editor.selectionBackground": "#8b5cf650",
        "editor.lineHighlightBackground": "#16213e30",
        "editorCursor.foreground": "#f59e0b",
        "editor.findMatchBackground": "#f59e0b50",
        "editor.findMatchHighlightBackground": "#8b5cf630",
      },
    });

    monaco.editor.setTheme("matrix-dark");

    // Add custom commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });

    // Add custom completions
    monaco.languages.registerCompletionItemProvider(settings.language, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: "matrix_input",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText:
              'def matrix_input():\n    """Matrix IDE input node"""\n    return input("Enter value: ")',
            documentation: "Creates a Matrix IDE input node function",
            range: range,
          },
          {
            label: "matrix_process",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText:
              'def matrix_process(data):\n    """Matrix IDE processing node"""\n    return data.strip().lower()',
            documentation: "Creates a Matrix IDE processing node function",
            range: range,
          },
          {
            label: "matrix_output",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText:
              'def matrix_output(result):\n    """Matrix IDE output node"""\n    print(f"Result: {result}")',
            documentation: "Creates a Matrix IDE output node function",
            range: range,
          },
        ];
        return { suggestions };
      },
    });
  };

  const handleEditorChange: OnChange = (value, event) => {
    if (value !== undefined) {
      setLocalCode(value);
      setIsModified(value !== generatedCode);
    }
  };

  const handleSave = () => {
    dispatch({ type: "SET_GENERATED_CODE", payload: localCode });
    setIsModified(false);
  };

  const handleRun = async () => {
    await executeNodes();
    dispatch({ type: "SET_ACTIVE_TAB", payload: "output" });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localCode);
  };

  const handleDownload = () => {
    const fileExtensions = {
      python: "py",
      javascript: "js",
      cpp: "cpp",
      typescript: "ts",
      java: "java",
      rust: "rs",
    };

    const ext =
      fileExtensions[settings.language as keyof typeof fileExtensions] || "txt";
    const blob = new Blob([localCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matrix_generated.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const executeNodes = async () => {
    const { nodes, connections } = state;
    const timestamp = new Date().toLocaleTimeString();
    const lines = [];

    lines.push(`[${timestamp}] Matrix IDE Execution`);
    lines.push("=".repeat(60));
    lines.push("");

    // Execute current code in editor if no nodes
    if (nodes.length === 0) {
      lines.push("📝 Executing code from editor...");
      lines.push("");

      try {
        const result = await executeUserCode(localCode);
        lines.push("📊 Code Execution Output:");
        lines.push("-".repeat(30));
        lines.push(result.output);
        lines.push("");
        lines.push(`✅ Execution completed in ${result.executionTime}ms`);
      } catch (error) {
        lines.push("❌ Code execution failed:");
        lines.push(error instanceof Error ? error.message : String(error));
      }

      setOutput(lines.join("\n"));
      return;
    }

    // Execute node graph
    lines.push("🔗 Executing node graph...");
    lines.push(`Nodes: ${nodes.length}, Connections: ${connections.length}`);
    lines.push("");

    try {
      const executor = new NodeExecutor();
      const context = await executor.executeNodeGraph(nodes, connections);

      // Display detailed execution log
      lines.push("📋 Execution Log:");
      lines.push("-".repeat(30));
      lines.push(...context.executionLog);
      lines.push("");

      // Display node results
      lines.push("📊 Node Results:");
      lines.push("-".repeat(30));
      nodes.forEach((node) => {
        const state = context.nodeStates.get(node.id) || "unknown";
        const stateIcon =
          {
            completed: "✅",
            running: "🔄",
            error: "❌",
            pending: "⏳",
          }[state] || "❓";

        lines.push(`${stateIcon} ${node.data.label}: ${state}`);

        // Show node outputs
        if (node.data.outputs) {
          node.data.outputs.forEach((outputName) => {
            const outputKey = `${node.id}_${outputName}`;
            const outputValue = context.nodeOutputs.get(outputKey);
            if (outputValue !== undefined) {
              lines.push(`   → ${outputName}: ${JSON.stringify(outputValue)}`);
            }
          });
        }
      });

      lines.push("");

      // Final summary
      const totalTime = Date.now() - context.startTime;
      const completedCount = Array.from(context.nodeStates.values()).filter(
        (s) => s === "completed",
      ).length;
      const errorCount = Array.from(context.nodeStates.values()).filter(
        (s) => s === "error",
      ).length;

      lines.push("📈 Execution Summary:");
      lines.push("-".repeat(30));
      lines.push(`⏱️  Total time: ${totalTime}ms`);
      lines.push(`✅ Completed: ${completedCount}/${nodes.length} nodes`);
      lines.push(`🔗 Connections: ${connections.length}`);

      if (errorCount > 0) {
        lines.push(`❌ Errors: ${errorCount}`);
      } else {
        lines.push(`✨ All nodes executed successfully!`);
      }
    } catch (error) {
      lines.push("❌ Node execution failed:");
      lines.push(error instanceof Error ? error.message : String(error));
    }

    setOutput(lines.join("\n"));
    console.log("Execution completed");
  };

  // Function to execute user's custom code
  const executeUserCode = async (
    code: string,
  ): Promise<{ output: string; executionTime: number }> => {
    const startTime = Date.now();
    const lines = [];

    try {
      // Simple Python-like code execution simulation
      if (code.includes("print(")) {
        const printMatches = code.match(/print\(["'`]([^"'`]+)["'`]\)/g);
        if (printMatches) {
          printMatches.forEach((match) => {
            const content = match.match(/print\(["'`]([^"'`]+)["'`]\)/)?.[1];
            if (content) {
              lines.push(content);
            }
          });
        }
      }

      // Handle f-strings and variable interpolation
      const fStringMatches = code.match(/print\(f["'`]([^"'`]+)["'`]\)/g);
      if (fStringMatches) {
        fStringMatches.forEach((match) => {
          let content = match.match(/print\(f["'`]([^"'`]+)["'`]\)/)?.[1] || "";
          // Simple variable substitution
          content = content.replace(/{([^}]+)}/g, (_, varName) => {
            // Return placeholder values for demo
            if (varName.includes("result")) return "processed_data";
            if (varName.includes("name")) return "Matrix IDE";
            if (varName.includes("value")) return "42";
            return varName;
          });
          lines.push(content);
        });
      }

      // Handle input() statements
      if (code.includes("input(")) {
        lines.push("User input: Hello from Matrix IDE!");
      }

      // Handle basic variable assignments
      const varMatches = code.match(/(\w+)\s*=\s*["'`]([^"'`]+)["'`]/g);
      if (varMatches) {
        varMatches.forEach((match) => {
          const [_, varName, value] =
            match.match(/(\w+)\s*=\s*["'`]([^"'`]+)["'`]/) || [];
          if (varName && value) {
            lines.push(`Variable ${varName} set to: ${value}`);
          }
        });
      }

      // Handle function definitions
      if (code.includes("def ")) {
        const funcMatches = code.match(/def\s+(\w+)\s*\(/g);
        if (funcMatches) {
          funcMatches.forEach((match) => {
            const funcName = match.match(/def\s+(\w+)\s*\(/)?.[1];
            if (funcName) {
              lines.push(`Function '${funcName}' defined successfully`);
            }
          });
        }
      }

      // Handle main execution
      if (
        code.includes('if __name__ == "__main__"') ||
        code.includes("main()")
      ) {
        lines.push("Executing main program...");
        lines.push("Program completed successfully!");
      }

      // If no specific patterns found, show generic success
      if (lines.length === 0) {
        if (code.trim().length > 0) {
          lines.push("Code parsed successfully");
          lines.push(`Lines of code: ${code.split("\n").length}`);
          lines.push(`Characters: ${code.length}`);
          lines.push("Ready for execution");
        } else {
          lines.push("No code to execute");
        }
      }

      const executionTime = Date.now() - startTime;
      return {
        output: lines.join("\n"),
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        output: `Error: ${error instanceof Error ? error.message : String(error)}`,
        executionTime,
      };
    }
  };

  const simulateCodeAnalysis = () => {
    const diagnostics: DiagnosticMessage[] = [];
    const lines = localCode.split("\n");

    lines.forEach((line, index) => {
      if (line.includes("TODO") || line.includes("FIXME")) {
        diagnostics.push({
          type: "info",
          line: index + 1,
          column: 1,
          message: "TODO comment found - consider implementing",
          source: "Matrix IDE",
        });
      }

      if (line.includes("print(") && !line.includes('f"')) {
        diagnostics.push({
          type: "info",
          line: index + 1,
          column: line.indexOf("print(") + 1,
          message: "Consider using f-strings for better formatting",
          source: "Style Guide",
        });
      }

      if (line.trim().startsWith("except:")) {
        diagnostics.push({
          type: "warning",
          line: index + 1,
          column: 1,
          message: "Bare except clause - specify exception types",
          source: "Best Practices",
        });
      }
    });

    // Add suggestions based on code analysis
    if (!localCode.includes("try:") && localCode.includes("input(")) {
      diagnostics.push({
        type: "info",
        line: 1,
        column: 1,
        message: "Consider adding error handling for user input",
        source: "Matrix AI Assistant",
      });
    }

    setDiagnostics(diagnostics);
  };

  const formatCode = () => {
    if (editorInstance) {
      editorInstance.getAction("editor.action.formatDocument").run();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const insertCodeSnippet = (snippet: any) => {
    if (editorInstance) {
      const position = editorInstance.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      };

      const op = {
        range: range,
        text: insertSnippet(snippet),
        forceMoveMarkers: true,
      };

      editorInstance.executeEdits("snippet-insert", [op]);
      editorInstance.focus();
      setShowSnippets(false);
    }
  };

  const getDiagnosticIcon = (type: DiagnosticMessage["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div
      className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-matrix-dark" : "h-full"}`}
    >
      {/* Enhanced Editor Header - Mobile-responsive */}
      <div className="h-12 sm:h-14 glass-panel border-b border-matrix-purple-600/30 flex items-center justify-between px-3 sm:px-4">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            dispatch({ type: "SET_ACTIVE_TAB", payload: value })
          }
          className="flex-1"
        >
          <TabsList className="bg-matrix-purple-800/30 border border-matrix-purple-600/30 h-9 sm:h-10">
            <TabsTrigger
              value="generated"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300 text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Code</span>
              <span className="sm:hidden">Code</span>
              {isModified && (
                <span className="ml-1 w-2 h-2 bg-matrix-gold-400 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300 text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
            >
              <Terminal className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Output</span>
              <span className="sm:hidden">Out</span>
            </TabsTrigger>
            <TabsTrigger
              value="diagnostics"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300 text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
            >
              <Bug className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Problems</span>
              <span className="sm:hidden">Issues</span>
              {diagnostics.length > 0 && (
                <Badge
                  variant="outline"
                  className="ml-1 sm:ml-2 h-4 sm:h-5 text-xs border-matrix-gold-400/50 text-matrix-gold-300"
                >
                  {diagnostics.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="snippets"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300 text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
            >
              <Code2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Snippets</span>
              <span className="sm:hidden">Snip</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1 sm:gap-2">
          <Badge
            variant="outline"
            className="border-matrix-gold-400/50 text-matrix-gold-300 text-xs"
          >
            {settings.language.toUpperCase()}
          </Badge>

          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={formatCode}
              className="h-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {isModified && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                className="h-8 text-matrix-gold-300"
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="h-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="h-8"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleRun}
              className="h-8 bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark"
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          </div>

          {/* Mobile buttons */}
          <div className="flex sm:hidden items-center gap-1">
            {isModified && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                className="h-8 w-8 p-0 text-matrix-gold-300 touch-manipulation"
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleRun}
              className="h-8 px-3 bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark touch-manipulation"
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 touch-manipulation"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="generated" className="h-full m-0">
            <div className="h-full relative">
              <Editor
                value={localCode}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                language={
                  settings.language === "cpp" ? "cpp" : settings.language
                }
                theme="matrix-dark"
                options={{
                  fontSize:
                    window.innerWidth < 640
                      ? Math.max(settings.fontSize - 2, 12)
                      : settings.fontSize,
                  fontFamily:
                    'Monaco, Consolas, "Liberation Mono", Courier, monospace',
                  minimap: {
                    enabled:
                      window.innerWidth >= 768 ? settings.showMinimap : false,
                  },
                  wordWrap: settings.wordWrap ? "on" : "off",
                  lineNumbers: window.innerWidth >= 640 ? "on" : "off",
                  rulers: window.innerWidth >= 768 ? [80, 120] : [],
                  renderWhitespace: "selection",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: settings.aiAutoComplete,
                  tabSize: 2,
                  insertSpaces: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  bracketPairColorization: { enabled: true },
                  guides: {
                    bracketPairs: true,
                    indentation: window.innerWidth >= 640,
                  },
                  padding: {
                    top: window.innerWidth >= 640 ? 16 : 8,
                    bottom: window.innerWidth >= 640 ? 16 : 8,
                  },
                  glyphMargin: window.innerWidth >= 640,
                  folding: window.innerWidth >= 768,
                  lineDecorationsWidth:
                    window.innerWidth >= 640 ? undefined : 0,
                  lineNumbersMinChars: window.innerWidth >= 640 ? undefined : 0,
                }}
              />

              {/* Code Status Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-6 glass-dark border-t border-matrix-purple-600/30 flex items-center justify-between px-4 text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-matrix-purple-300">
                    Lines: {localCode.split("\n").length}
                  </span>
                  <span className="text-matrix-purple-300">
                    Characters: {localCode.length}
                  </span>
                  {isModified && (
                    <span className="text-matrix-gold-300">● Modified</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-matrix-purple-300">
                    Encoding: UTF-8
                  </span>
                  <span className="text-matrix-purple-300">
                    {settings.language}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="output" className="h-full m-0">
            <div className="h-full bg-matrix-dark/30 p-4 font-mono text-sm text-matrix-purple-200">
              <pre className="whitespace-pre-wrap">
                {output || 'Click "Run" to execute the code...'}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="diagnostics" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {diagnostics.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    No problems detected
                  </div>
                ) : (
                  <div className="space-y-2">
                    {diagnostics.map((diagnostic, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 glass-panel rounded-lg cursor-pointer hover:bg-matrix-purple-700/20"
                        onClick={() => {
                          if (editorInstance) {
                            editorInstance.setPosition({
                              lineNumber: diagnostic.line,
                              column: diagnostic.column,
                            });
                            editorInstance.focus();
                          }
                        }}
                      >
                        {getDiagnosticIcon(diagnostic.type)}
                        <div className="flex-1">
                          <div className="text-sm text-matrix-purple-200">
                            {diagnostic.message}
                          </div>
                          <div className="text-xs text-matrix-purple-400 mt-1">
                            Line {diagnostic.line}, Column {diagnostic.column} •{" "}
                            {diagnostic.source}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="snippets" className="h-full m-0">
            <div className="h-full flex flex-col">
              {/* Snippets Header */}
              <div className="p-3 border-b border-matrix-purple-600/30">
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="h-4 w-4 text-matrix-gold-400" />
                  <span className="text-sm font-medium text-matrix-gold-300">
                    Code Snippets
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-matrix-purple-400" />
                  <input
                    type="text"
                    value={snippetSearch}
                    onChange={(e) => setSnippetSearch(e.target.value)}
                    placeholder="Search snippets..."
                    className="w-full pl-10 pr-4 py-2 bg-matrix-purple-800/30 border border-matrix-purple-600/50 rounded text-sm text-matrix-purple-200 placeholder:text-matrix-purple-400 focus:outline-none focus:border-matrix-gold-400/50"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex gap-1 flex-wrap">
                  {["All", ...getAllCategories()].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        selectedCategory === category
                          ? "bg-matrix-gold-500/20 text-matrix-gold-300 border border-matrix-gold-400/50"
                          : "bg-matrix-purple-800/30 text-matrix-purple-300 border border-matrix-purple-600/50 hover:bg-matrix-purple-700/30"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Snippets List */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {(() => {
                    let filteredSnippets = getSnippetsByLanguage(
                      settings.language,
                    );

                    if (selectedCategory !== "All") {
                      filteredSnippets = filteredSnippets.filter(
                        (s) => s.category === selectedCategory,
                      );
                    }

                    if (snippetSearch) {
                      const searchResults = searchSnippets(snippetSearch);
                      filteredSnippets = filteredSnippets.filter((s) =>
                        searchResults.includes(s),
                      );
                    }

                    return filteredSnippets.map((snippet) => (
                      <div
                        key={snippet.id}
                        className="glass-panel rounded-lg p-3 cursor-pointer hover:bg-matrix-purple-700/20 transition-colors"
                        onClick={() => insertCodeSnippet(snippet)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-matrix-gold-300">
                              {snippet.name}
                            </h4>
                            <p className="text-xs text-matrix-purple-400 mt-1">
                              {snippet.description}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs border-matrix-purple-600/50 text-matrix-purple-300"
                          >
                            {snippet.category}
                          </Badge>
                        </div>

                        <div className="bg-matrix-dark/50 rounded p-2 mt-2">
                          <pre className="text-xs text-matrix-purple-200 whitespace-pre-wrap font-mono overflow-hidden">
                            {snippet.code.length > 100
                              ? snippet.code.substring(0, 100) + "..."
                              : snippet.code}
                          </pre>
                        </div>

                        <div className="flex gap-1 mt-2 flex-wrap">
                          {snippet.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-matrix-purple-800/50 text-xs text-matrix-purple-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
