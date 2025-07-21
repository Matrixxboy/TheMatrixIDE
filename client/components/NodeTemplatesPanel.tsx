import { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Star,
  Clock,
  Layers,
  Code,
  Database,
  Globe,
  Zap,
  Variable,
  Workflow,
  Settings,
  Download,
  Upload,
  BookOpen,
  Sparkles,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";

interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "input" | "output" | "function" | "api" | "logic" | "variable";
  icon: any;
  color: string;
  config: any;
  code: string;
  inputs?: string[];
  outputs?: string[];
  tags: string[];
  popularity: number;
  isCustom?: boolean;
}

const nodeTemplates: NodeTemplate[] = [
  // Input Templates
  {
    id: "text-input",
    name: "Text Input",
    description: "Simple text input with validation",
    category: "Input",
    type: "input",
    icon: Variable,
    color: "from-blue-400 to-blue-600",
    config: { prompt: "Enter text:", validation: "required" },
    code: 'user_input = input("Enter text: ")\nif not user_input:\n    raise ValueError("Text input is required")',
    outputs: ["text"],
    tags: ["basic", "text", "validation"],
    popularity: 95,
  },
  {
    id: "file-input",
    name: "File Reader",
    description: "Read data from files with error handling",
    category: "Input",
    type: "input",
    icon: Variable,
    color: "from-blue-400 to-blue-600",
    config: { filePath: "input.txt", encoding: "utf-8" },
    code: 'try:\n    with open("input.txt", "r", encoding="utf-8") as f:\n        file_content = f.read()\nexcept FileNotFoundError:\n    print("File not found")\n    file_content = ""',
    outputs: ["content"],
    tags: ["file", "io", "error-handling"],
    popularity: 87,
  },
  {
    id: "number-input",
    name: "Number Input",
    description: "Numeric input with range validation",
    category: "Input",
    type: "input",
    icon: Variable,
    color: "from-blue-400 to-blue-600",
    config: { prompt: "Enter number:", min: 0, max: 100 },
    code: 'while True:\n    try:\n        number = float(input("Enter number: "))\n        if 0 <= number <= 100:\n            break\n        print("Number must be between 0 and 100")\n    except ValueError:\n        print("Please enter a valid number")',
    outputs: ["number"],
    tags: ["number", "validation", "range"],
    popularity: 78,
  },

  // Processing Templates
  {
    id: "data-cleaner",
    name: "Data Cleaner",
    description: "Clean and normalize text data",
    category: "Processing",
    type: "function",
    icon: Zap,
    color: "from-green-400 to-green-600",
    config: {
      removeSpaces: true,
      toLowerCase: true,
      removeSpecialChars: false,
    },
    code: 'def clean_data(data):\n    """Clean and normalize text data"""\n    if isinstance(data, str):\n        # Remove extra spaces\n        data = " ".join(data.split())\n        # Convert to lowercase\n        data = data.lower()\n        # Remove special characters if needed\n        # data = re.sub(r"[^a-zA-Z0-9\\s]", "", data)\n    return data',
    inputs: ["data"],
    outputs: ["cleaned_data"],
    tags: ["text", "cleaning", "normalization"],
    popularity: 91,
  },
  {
    id: "math-calculator",
    name: "Math Calculator",
    description: "Perform mathematical operations",
    category: "Processing",
    type: "function",
    icon: Zap,
    color: "from-green-400 to-green-600",
    config: { operation: "add", precision: 2 },
    code: 'def calculate(a, b, operation="add"):\n    """Perform mathematical operations"""\n    operations = {\n        "add": lambda x, y: x + y,\n        "subtract": lambda x, y: x - y,\n        "multiply": lambda x, y: x * y,\n        "divide": lambda x, y: x / y if y != 0 else None\n    }\n    result = operations.get(operation, operations["add"])(a, b)\n    return round(result, 2) if result is not None else "Division by zero"',
    inputs: ["a", "b"],
    outputs: ["result"],
    tags: ["math", "calculation", "operations"],
    popularity: 82,
  },
  {
    id: "ai-text-processor",
    name: "AI Text Processor",
    description: "Process text using local AI models",
    category: "AI",
    type: "function",
    icon: Sparkles,
    color: "from-purple-400 to-purple-600",
    config: { model: "local-gpt", maxLength: 500 },
    code: 'def ai_process_text(text, model="local-gpt"):\n    """Process text using local AI model"""\n    # Simulate local AI processing\n    processed = f"AI_PROCESSED[{model}]: {text}"\n    # Add sentiment analysis\n    sentiment = "positive" if len(text) > 10 else "neutral"\n    return {"processed_text": processed, "sentiment": sentiment}',
    inputs: ["text"],
    outputs: ["processed_text", "sentiment"],
    tags: ["ai", "nlp", "local", "processing"],
    popularity: 96,
  },

  // API Templates
  {
    id: "rest-api-get",
    name: "REST API GET",
    description: "Fetch data from REST API with error handling",
    category: "API",
    type: "api",
    icon: Globe,
    color: "from-purple-400 to-purple-600",
    config: { url: "https://api.example.com/data", timeout: 5000, retries: 3 },
    code: 'import requests\nimport time\n\ndef api_get(url, timeout=5, retries=3):\n    """Fetch data from REST API with retries"""\n    for attempt in range(retries):\n        try:\n            response = requests.get(url, timeout=timeout)\n            response.raise_for_status()\n            return response.json()\n        except requests.RequestException as e:\n            if attempt == retries - 1:\n                return {"error": str(e)}\n            time.sleep(1)',
    inputs: ["url"],
    outputs: ["data", "status"],
    tags: ["api", "rest", "get", "http"],
    popularity: 89,
  },
  {
    id: "webhook-sender",
    name: "Webhook Sender",
    description: "Send data to webhook endpoints",
    category: "API",
    type: "api",
    icon: Globe,
    color: "from-purple-400 to-purple-600",
    config: { webhook_url: "", method: "POST", headers: {} },
    code: 'import requests\nimport json\n\ndef send_webhook(data, webhook_url, method="POST"):\n    """Send data to webhook endpoint"""\n    headers = {"Content-Type": "application/json"}\n    payload = json.dumps(data) if isinstance(data, dict) else str(data)\n    \n    try:\n        response = requests.request(method, webhook_url, data=payload, headers=headers)\n        return {"status": response.status_code, "response": response.text}\n    except Exception as e:\n        return {"error": str(e)}',
    inputs: ["data"],
    outputs: ["status", "response"],
    tags: ["webhook", "api", "post", "integration"],
    popularity: 75,
  },

  // Logic Templates
  {
    id: "conditional-router",
    name: "Conditional Router",
    description: "Route data based on conditions",
    category: "Logic",
    type: "logic",
    icon: Workflow,
    color: "from-orange-400 to-orange-600",
    config: { condition: "value > 50", trueOutput: "high", falseOutput: "low" },
    code: 'def conditional_route(value, threshold=50):\n    """Route data based on condition"""\n    if isinstance(value, (int, float)):\n        return "high" if value > threshold else "low"\n    elif isinstance(value, str):\n        return "non_empty" if value.strip() else "empty"\n    else:\n        return "unknown"',
    inputs: ["value"],
    outputs: ["route", "category"],
    tags: ["logic", "conditional", "routing"],
    popularity: 84,
  },
  {
    id: "data-validator",
    name: "Data Validator",
    description: "Validate data against rules",
    category: "Logic",
    type: "logic",
    icon: Workflow,
    color: "from-orange-400 to-orange-600",
    config: { rules: ["required", "type:string", "min_length:3"] },
    code: 'def validate_data(data, rules):\n    """Validate data against rules"""\n    errors = []\n    \n    for rule in rules:\n        if rule == "required" and not data:\n            errors.append("Data is required")\n        elif rule.startswith("type:") and not isinstance(data, eval(rule.split(":")[1])):\n            errors.append(f"Data must be of type {rule.split(\':\')[1]}")\n        elif rule.startswith("min_length:") and len(str(data)) < int(rule.split(":")[1]):\n            errors.append(f"Data must be at least {rule.split(\':\')[1]} characters")\n    \n    return {"valid": len(errors) == 0, "errors": errors}',
    inputs: ["data"],
    outputs: ["valid", "errors"],
    tags: ["validation", "rules", "data-quality"],
    popularity: 77,
  },

  // Output Templates
  {
    id: "console-logger",
    name: "Console Logger",
    description: "Advanced console logging with levels",
    category: "Output",
    type: "output",
    icon: Code,
    color: "from-red-400 to-red-600",
    config: { level: "info", timestamp: true, format: "json" },
    code: 'import datetime\nimport json\n\ndef console_log(data, level="info", include_timestamp=True):\n    """Advanced console logging"""\n    timestamp = datetime.datetime.now().isoformat() if include_timestamp else None\n    \n    log_entry = {\n        "level": level.upper(),\n        "message": str(data),\n        "timestamp": timestamp\n    }\n    \n    print(json.dumps(log_entry, indent=2))',
    inputs: ["data"],
    outputs: [],
    tags: ["logging", "console", "debug", "json"],
    popularity: 92,
  },
  {
    id: "file-writer",
    name: "File Writer",
    description: "Write data to files with backup",
    category: "Output",
    type: "output",
    icon: Code,
    color: "from-red-400 to-red-600",
    config: { filename: "output.txt", backup: true, append: false },
    code: 'import os\nimport shutil\nimport datetime\n\ndef write_to_file(data, filename="output.txt", backup=True, append=False):\n    """Write data to file with backup option"""\n    if backup and os.path.exists(filename):\n        backup_name = f"{filename}.backup.{datetime.datetime.now().strftime(\'%Y%m%d_%H%M%S\')}")\n        shutil.copy2(filename, backup_name)\n    \n    mode = "a" if append else "w"\n    with open(filename, mode, encoding="utf-8") as f:\n        f.write(str(data) + "\\n")',
    inputs: ["data"],
    outputs: [],
    tags: ["file", "output", "backup", "io"],
    popularity: 81,
  },
];

const categories = [
  "All",
  "Input",
  "Processing",
  "AI",
  "API",
  "Logic",
  "Output",
];
const sortOptions = ["Popularity", "Name", "Category", "Recent"];

export default function NodeTemplatesPanel() {
  const { dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("templates");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = nodeTemplates
    .filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesCategory =
        selectedCategory === "All" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Name":
          return a.name.localeCompare(b.name);
        case "Category":
          return a.category.localeCompare(b.category);
        case "Popularity":
          return b.popularity - a.popularity;
        default:
          return 0;
      }
    });

  const addNodeFromTemplate = (
    template: NodeTemplate,
    position?: { x: number; y: number },
  ) => {
    const newNode = {
      id: Date.now().toString(),
      type: template.type,
      position: position || {
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
      },
      data: {
        label: template.name,
        inputs: template.inputs,
        outputs: template.outputs,
        code: template.code,
        config: template.config,
      },
    };
    dispatch({ type: "ADD_NODE", payload: newNode });
  };

  const exportTemplates = () => {
    const dataStr = JSON.stringify(nodeTemplates, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "matrix-ide-templates.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          console.log("Imported templates:", imported);
          // Here you would add them to the nodeTemplates array
        } catch (error) {
          console.error("Invalid template file");
        }
      };
      reader.readAsText(file);
    }
  };

  const renderTemplateCard = (template: NodeTemplate) => {
    const Icon = template.icon;

    if (viewMode === "list") {
      return (
        <div
          key={template.id}
          className="glass-panel rounded-lg p-3 cursor-pointer hover:bg-matrix-purple-700/20 transition-all group"
          onClick={() => addNodeFromTemplate(template)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded bg-gradient-to-r ${template.color} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-matrix-gold-300 truncate">
                  {template.name}
                </h3>
                <Badge
                  variant="outline"
                  className="text-xs border-matrix-purple-600/50"
                >
                  {template.category}
                </Badge>
                {template.isCustom && (
                  <Badge
                    variant="outline"
                    className="text-xs border-matrix-gold-400/50 text-matrix-gold-300"
                  >
                    Custom
                  </Badge>
                )}
              </div>
              <p className="text-xs text-matrix-purple-400 truncate">
                {template.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-matrix-gold-400" />
                  <span className="text-xs text-matrix-purple-300">
                    {template.popularity}
                  </span>
                </div>
                <div className="flex gap-1">
                  {template.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs h-4 border-matrix-purple-600/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                addNodeFromTemplate(template);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={template.id}
        className="glass-panel rounded-lg p-4 cursor-pointer hover:bg-matrix-purple-700/20 transition-all group"
        onClick={() => addNodeFromTemplate(template)}
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-matrix-gold-400" />
            <span className="text-xs text-matrix-purple-300">
              {template.popularity}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-matrix-gold-300">
              {template.name}
            </h3>
            {template.isCustom && (
              <Badge
                variant="outline"
                className="text-xs border-matrix-gold-400/50 text-matrix-gold-300"
              >
                Custom
              </Badge>
            )}
          </div>
          <p className="text-xs text-matrix-purple-400 line-clamp-2">
            {template.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="text-xs border-matrix-purple-600/50"
          >
            {template.category}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              addNodeFromTemplate(template);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex gap-1 mt-2 flex-wrap">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs h-4 border-matrix-purple-600/30"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 glass-panel border-b border-matrix-purple-600/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 flex items-center justify-center">
            <Layers className="h-4 w-4 text-matrix-dark" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-matrix-gold-300">
              Node Templates
            </h3>
            <p className="text-xs text-matrix-purple-400">
              {filteredTemplates.length} templates available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="h-8 w-8 p-0"
          >
            {viewMode === "grid" ? (
              <List className="h-3 w-3" />
            ) : (
              <Grid3X3 className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={exportTemplates}
            className="h-8 w-8 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8 p-0"
          >
            <Upload className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 glass-panel border-b border-matrix-purple-600/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-matrix-purple-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates, tags, or descriptions..."
              className="pl-10 bg-matrix-purple-800/30 border-matrix-purple-600/50"
            />
          </div>
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {categories.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "secondary" : "ghost"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-matrix-purple-700/50 text-matrix-gold-300"
                    : "hover:bg-matrix-purple-700/30"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-matrix-purple-800/30 border border-matrix-purple-600/50 rounded px-2 py-1 text-sm text-matrix-purple-200"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      <ScrollArea className="flex-1 p-4">
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-2"
          }
        >
          {filteredTemplates.map(renderTemplateCard)}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-matrix-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-matrix-gold-300 mb-2">
              No Templates Found
            </h3>
            <p className="text-sm text-matrix-purple-400">
              Try adjusting your search or category filter.
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importTemplates}
        className="hidden"
      />
    </div>
  );
}
