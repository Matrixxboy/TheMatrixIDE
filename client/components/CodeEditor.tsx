import { useState } from "react";
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
  Zap
} from "lucide-react";

interface CodeEditorProps {
  language: string;
}

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
}`
};

export default function CodeEditor({ language }: CodeEditorProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = useState('generated');
  const [code, setCode] = useState(codeExamples[language as keyof typeof codeExamples] || codeExamples.python);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const fileExtensions = {
      python: 'py',
      javascript: 'js',
      cpp: 'cpp'
    };
    
    const ext = fileExtensions[language as keyof typeof fileExtensions] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matrix_generated.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="h-12 border-b border-matrix-purple-600/30 flex items-center justify-between px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
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
          <Badge variant="outline" className="border-matrix-gold-400/50 text-matrix-gold-300">
            {language.toUpperCase()}
          </Badge>
          <Button
            size="sm"
            variant={mode === 'edit' ? 'secondary' : 'ghost'}
            onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
            className="h-8"
          >
            {mode === 'edit' ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCopy} className="h-8">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDownload} className="h-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
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
              {mode === 'edit' ? (
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 bg-transparent text-matrix-purple-200 font-mono text-sm resize-none border-none outline-none"
                  style={{ fontFamily: 'Monaco, Consolas, "Liberation Mono", Courier, monospace' }}
                />
              ) : (
                <pre className="w-full h-full p-4 text-matrix-purple-200 font-mono text-sm overflow-auto">
                  <code>{code}</code>
                </pre>
              )}
              
              {/* Syntax highlighting overlay simulation */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="p-4 font-mono text-sm">
                  {code.split('\n').map((line, index) => (
                    <div key={index} className="h-5">
                      {line.includes('def ') || line.includes('class ') || line.includes('function ') ? (
                        <span className="text-matrix-gold-400 font-semibold">{line}</span>
                      ) : line.includes('#') || line.includes('//') ? (
                        <span className="text-matrix-purple-400 italic">{line}</span>
                      ) : line.includes('"') || line.includes("'") ? (
                        <span className="text-green-400">{line}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="h-full m-0">
            <div className="h-full bg-matrix-dark/30 p-4 font-mono text-sm text-matrix-purple-200">
              <div className="text-matrix-gold-400 mb-2">$ python matrix_generated.py</div>
              <div>Enter your data: <span className="text-matrix-gold-300">Hello World</span></div>
              <div>Final result: <span className="text-green-400">AI_ENHANCED: hello world</span></div>
              <div className="mt-4 text-matrix-purple-400">
                ✓ Execution completed successfully in 0.234s
              </div>
              <div className="text-matrix-purple-400">
                ✓ Memory usage: 12.3 MB
              </div>
              <div className="text-matrix-purple-400">
                ✓ AI enhancement applied
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="errors" className="h-full m-0">
            <div className="h-full bg-matrix-dark/30 p-4 font-mono text-sm">
              <div className="text-green-400 mb-4">✓ No errors found</div>
              <div className="text-matrix-purple-400 mb-2">Code quality checks:</div>
              <div className="text-green-400">✓ Syntax validation passed</div>
              <div className="text-green-400">✓ Type checking passed</div>
              <div className="text-green-400">✓ Security scan passed</div>
              <div className="text-green-400">✓ Performance analysis complete</div>
              <div className="mt-4 text-matrix-gold-400">
                Suggestions:
              </div>
              <div className="text-matrix-purple-300 ml-2">
                • Consider adding error handling for edge cases
              </div>
              <div className="text-matrix-purple-300 ml-2">
                • Add unit tests for better code coverage
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
