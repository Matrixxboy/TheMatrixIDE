import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Copy,
  Download,
  FileText,
  Terminal,
  Eye,
  Edit3,
  Code2,
  Zap,
  Save,
} from "lucide-react";

interface CodeEditorProps {}

const codeExamples = {
  python: `# Matrix IDE Generated Code
def process_user_input():
    """Process user input through the node pipeline"""
    user_input = input("Enter your data: ")
    
    # Data processing nodes
    processed_data = transform_data(user_input)
    validated_data = validate_input(processed_data)
    
    # AI enhancement
    ai_result = ai_enhance(validated_data)
    
    # Output generation
    result = generate_output(ai_result)
    print(f"Final result: {result}")
    
    return result

def transform_data(data):
    """Transform input data"""
    return data.strip().lower()

def validate_input(data):
    """Validate processed data"""
    if not data:
        raise ValueError("Empty input detected")
    return data

def ai_enhance(data):
    """AI processing node"""
    # Local AI model processing
    enhanced = f"AI_ENHANCED: {data}"
    return enhanced

def generate_output(data):
    """Generate final output"""
    return data.upper()

if __name__ == "__main__":
    process_user_input()`,

  javascript: `// Matrix IDE Generated Code
class MatrixProcessor {
    constructor() {
        this.pipeline = [];
    }
    
    async processUserInput() {
        const userInput = prompt("Enter your data:");
        
        // Data processing pipeline
        const processed = this.transformData(userInput);
        const validated = this.validateInput(processed);
        const aiResult = await this.aiEnhance(validated);
        const result = this.generateOutput(aiResult);
        
        console.log(\`Final result: \${result}\`);
        return result;
    }
    
    transformData(data) {
        return data.trim().toLowerCase();
    }
    
    validateInput(data) {
        if (!data) {
            throw new Error("Empty input detected");
        }
        return data;
    }
    
    async aiEnhance(data) {
        // Local AI model processing
        return \`AI_ENHANCED: \${data}\`;
    }
    
    generateOutput(data) {
        return data.toUpperCase();
    }
}

// Execute the pipeline
const processor = new MatrixProcessor();
processor.processUserInput();`,

  cpp: `// Matrix IDE Generated Code
#include <iostream>
#include <string>
#include <algorithm>
#include <stdexcept>

class MatrixProcessor {
private:
    std::string transformData(const std::string& data) {
        std::string result = data;
        std::transform(result.begin(), result.end(), result.begin(), ::tolower);
        return result;
    }
    
    std::string validateInput(const std::string& data) {
        if (data.empty()) {
            throw std::runtime_error("Empty input detected");
        }
        return data;
    }
    
    std::string aiEnhance(const std::string& data) {
        // Local AI model processing
        return "AI_ENHANCED: " + data;
    }
    
    std::string generateOutput(const std::string& data) {
        std::string result = data;
        std::transform(result.begin(), result.end(), result.begin(), ::toupper);
        return result;
    }

public:
    std::string processUserInput() {
        std::cout << "Enter your data: ";
        std::string userInput;
        std::getline(std::cin, userInput);
        
        // Data processing pipeline
        std::string processed = transformData(userInput);
        std::string validated = validateInput(processed);
        std::string aiResult = aiEnhance(validated);
        std::string result = generateOutput(aiResult);
        
        std::cout << "Final result: " << result << std::endl;
        return result;
    }
};

int main() {
    MatrixProcessor processor;
    processor.processUserInput();
    return 0;
}`,
};

export default function CodeEditor() {
  const { state, dispatch } = useApp();
  const { generatedCode, settings, activeTab } = state;
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [localCode, setLocalCode] = useState(generatedCode);
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setLocalCode(generatedCode);
  }, [generatedCode]);

  useEffect(() => {
    // Simulate code execution for output
    if (generatedCode) {
      simulateExecution();
    }
  }, [generatedCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(localCode);
  };

  const handleSave = () => {
    dispatch({ type: "SET_GENERATED_CODE", payload: localCode });
  };

  const simulateExecution = () => {
    // Simulate running the code
    const lines = generatedCode.split("\n");
    const outputLines = [];

    if (generatedCode.includes("input(")) {
      outputLines.push("Enter your data: Hello World");
    }

    if (generatedCode.includes("process_data")) {
      outputLines.push("Processing data...");
    }

    if (generatedCode.includes("print(")) {
      outputLines.push("Result: AI_ENHANCED: hello world");
    }

    outputLines.push("\n✓ Execution completed successfully in 0.234s");
    outputLines.push("✓ Memory usage: 12.3 MB");
    outputLines.push("✓ No errors detected");

    setOutput(outputLines.join("\n"));

    // Simulate error checking
    const potentialErrors = [];
    if (
      !generatedCode.includes("def ") &&
      !generatedCode.includes("class ") &&
      generatedCode.split("\n").length > 5
    ) {
      potentialErrors.push(
        "Consider organizing code into functions for better maintainability",
      );
    }
    if (!generatedCode.includes("try:") && generatedCode.includes("input(")) {
      potentialErrors.push("Add error handling for user input validation");
    }
    setErrors(potentialErrors);
  };

  const handleRun = () => {
    simulateExecution();
    dispatch({ type: "SET_ACTIVE_TAB", payload: "output" });
  };

  const handleDownload = () => {
    const fileExtensions = {
      python: "py",
      javascript: "js",
      cpp: "cpp",
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

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="h-12 border-b border-matrix-purple-600/30 flex items-center justify-between px-4">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            dispatch({ type: "SET_ACTIVE_TAB", payload: value })
          }
          className="flex-1"
        >
          <TabsList className="bg-matrix-purple-800/30 border border-matrix-purple-600/30">
            <TabsTrigger
              value="generated"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generated Code
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Output
            </TabsTrigger>
            <TabsTrigger
              value="errors"
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <Zap className="h-4 w-4 mr-2" />
              Errors
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-matrix-gold-400/50 text-matrix-gold-300"
          >
            {settings.language.toUpperCase()}
          </Badge>
          <Button
            size="sm"
            variant={mode === "edit" ? "secondary" : "ghost"}
            onClick={() => setMode(mode === "edit" ? "view" : "edit")}
            className="h-8"
          >
            {mode === "edit" ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Edit3 className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
          {mode === "edit" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className="h-8"
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
            onClick={handleRun}
            className="h-8 bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark"
          >
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="generated" className="h-full m-0">
            <div className="h-full bg-matrix-dark/30 relative">
              {mode === "edit" ? (
                <textarea
                  value={localCode}
                  onChange={(e) => setLocalCode(e.target.value)}
                  className="w-full h-full p-4 bg-transparent text-matrix-purple-200 font-mono text-sm resize-none border-none outline-none"
                  style={{
                    fontFamily:
                      'Monaco, Consolas, "Liberation Mono", Courier, monospace',
                    fontSize: `${settings.fontSize}px`,
                  }}
                  placeholder="Generated code will appear here..."
                />
              ) : (
                <pre
                  className="w-full h-full p-4 text-matrix-purple-200 font-mono text-sm overflow-auto"
                  style={{ fontSize: `${settings.fontSize}px` }}
                >
                  <code>
                    {localCode ||
                      "No code generated yet. Add and connect nodes in the canvas to generate code."}
                  </code>
                </pre>
              )}

              {/* Enhanced syntax highlighting overlay */}
              {!mode || mode === "view" ? (
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="p-4 font-mono text-sm"
                    style={{ fontSize: `${settings.fontSize}px` }}
                  >
                    {(localCode || "").split("\n").map((line, index) => (
                      <div key={index} className="leading-5">
                        {line.includes("def ") ||
                        line.includes("class ") ||
                        line.includes("function ") ? (
                          <span className="text-matrix-gold-400 font-semibold">
                            {line}
                          </span>
                        ) : line.includes("#") || line.includes("//") ? (
                          <span className="text-matrix-purple-400 italic">
                            {line}
                          </span>
                        ) : line.includes('"') || line.includes("'") ? (
                          <span className="text-green-400">{line}</span>
                        ) : line.includes("import ") ||
                          line.includes("from ") ? (
                          <span className="text-blue-400">{line}</span>
                        ) : line.includes("if ") ||
                          line.includes("else:") ||
                          line.includes("elif ") ? (
                          <span className="text-yellow-400">{line}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="output" className="h-full m-0">
            <div className="h-full bg-matrix-dark/30 p-4 font-mono text-sm text-matrix-purple-200">
              <div className="text-matrix-gold-400 mb-2">
                $ {settings.language} matrix_generated.
                {settings.language === "python"
                  ? "py"
                  : settings.language === "javascript"
                    ? "js"
                    : "cpp"}
              </div>
              <pre className="whitespace-pre-wrap">
                {output || 'Click "Run" to execute the generated code...'}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="errors" className="h-full m-0">
            <div className="h-full bg-matrix-dark/30 p-4 font-mono text-sm">
              {errors.length === 0 ? (
                <div className="text-green-400 mb-4">✓ No errors found</div>
              ) : (
                <div className="text-yellow-400 mb-4">
                  ⚠ {errors.length} suggestion(s) found
                </div>
              )}

              <div className="text-matrix-purple-400 mb-2">
                Code quality checks:
              </div>
              <div className="text-green-400">✓ Syntax validation passed</div>
              <div className="text-green-400">✓ Type checking passed</div>
              <div className="text-green-400">✓ Security scan passed</div>
              <div className="text-green-400">
                ✓ Performance analysis complete
              </div>

              {errors.length > 0 && (
                <div className="mt-4">
                  <div className="text-matrix-gold-400 mb-2">Suggestions:</div>
                  {errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-matrix-purple-300 ml-2 mb-1"
                    >
                      • {error}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 text-matrix-gold-400">
                General recommendations:
              </div>
              <div className="text-matrix-purple-300 ml-2">
                • Consider adding error handling for edge cases
              </div>
              <div className="text-matrix-purple-300 ml-2">
                • Add unit tests for better code coverage
              </div>
              <div className="text-matrix-purple-300 ml-2">
                • Document complex functions with docstrings
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
