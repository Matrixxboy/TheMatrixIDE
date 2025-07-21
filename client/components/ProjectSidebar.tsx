import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import type { FileNode } from "@/contexts/AppContext";
import NodeTemplatesPanel from "@/components/NodeTemplatesPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderTree,
  FileText,
  Code,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  GitBranch,
  Settings,
  Workflow,
  Database,
  Globe,
  Cpu,
  Layers,
} from "lucide-react";

interface NodeDefinition {
  id: string;
  name: string;
  type: "input" | "output" | "function" | "api" | "logic";
  description: string;
  icon: any;
}

const projectStructure: FileNode[] = [
  {
    id: "1",
    name: "matrix-project",
    type: "folder",
    expanded: true,
    children: [
      {
        id: "2",
        name: "src",
        type: "folder",
        expanded: true,
        children: [
          { id: "3", name: "main.py", type: "file", language: "python" },
          {
            id: "4",
            name: "data_processor.py",
            type: "file",
            language: "python",
          },
          { id: "5", name: "ai_module.py", type: "file", language: "python" },
        ],
      },
      {
        id: "6",
        name: "nodes",
        type: "folder",
        expanded: false,
        children: [
          { id: "7", name: "input_nodes.json", type: "file", language: "json" },
          {
            id: "8",
            name: "processing_nodes.json",
            type: "file",
            language: "json",
          },
          {
            id: "9",
            name: "output_nodes.json",
            type: "file",
            language: "json",
          },
        ],
      },
      {
        id: "10",
        name: "config",
        type: "folder",
        expanded: false,
        children: [
          { id: "11", name: "settings.yaml", type: "file", language: "yaml" },
          { id: "12", name: "ai_config.json", type: "file", language: "json" },
        ],
      },
      { id: "13", name: "README.md", type: "file", language: "markdown" },
      { id: "14", name: "requirements.txt", type: "file", language: "text" },
    ],
  },
];

const nodeLibrary: NodeDefinition[] = [
  {
    id: "input-text",
    name: "Text Input",
    type: "input",
    description: "Captures user text input",
    icon: FileText,
  },
  {
    id: "input-file",
    name: "File Input",
    type: "input",
    description: "Reads data from files",
    icon: File,
  },
  {
    id: "process-data",
    name: "Data Processor",
    type: "function",
    description: "Transforms and validates data",
    icon: Cpu,
  },
  {
    id: "api-call",
    name: "API Request",
    type: "api",
    description: "Makes HTTP requests to APIs",
    icon: Globe,
  },
  {
    id: "logic-if",
    name: "If/Else Logic",
    type: "logic",
    description: "Conditional logic branching",
    icon: GitBranch,
  },
  {
    id: "output-console",
    name: "Console Output",
    type: "output",
    description: "Prints results to console",
    icon: Code,
  },
  {
    id: "output-file",
    name: "File Output",
    type: "output",
    description: "Saves results to files",
    icon: Database,
  },
];

// Helper function to count files recursively
const countFiles = (nodes: FileNode[]): number => {
  return nodes.reduce((count, node) => {
    if (node.type === "file") {
      return count + 1;
    } else if (node.children) {
      return count + countFiles(node.children);
    }
    return count;
  }, 0);
};

export default function ProjectSidebar() {
  const { state, dispatch } = useApp();
  const { projectFiles, currentFile, nodes } = state;
  const [activeTab, setActiveTab] = useState("files");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFolder = (id: string) => {
    dispatch({ type: "TOGGLE_FILE_FOLDER", payload: id });
  };

  const selectFile = (id: string, content?: string) => {
    dispatch({ type: "SELECT_FILE", payload: id });
    if (content) {
      dispatch({ type: "SET_GENERATED_CODE", payload: content });
    }
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    const Icon =
      node.type === "folder" ? (node.expanded ? FolderOpen : Folder) : FileText;
    const ChevronIcon =
      node.type === "folder"
        ? node.expanded
          ? ChevronDown
          : ChevronRight
        : null;
    const isSelected = currentFile === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
            isSelected
              ? "bg-matrix-gold-500/20 text-matrix-gold-300"
              : node.type === "file"
                ? "text-matrix-purple-300 hover:bg-matrix-purple-700/30"
                : "text-matrix-gold-300 hover:bg-matrix-purple-700/30"
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.id);
            } else {
              selectFile(node.id, node.content || "");
            }
          }}
        >
          {ChevronIcon && (
            <ChevronIcon className="h-3 w-3 text-matrix-purple-400" />
          )}
          <Icon className="h-4 w-4" />
          <span className="text-sm truncate">{node.name}</span>
          {node.language && (
            <Badge
              variant="outline"
              className="ml-auto text-xs h-4 border-matrix-purple-600/50"
            >
              {node.language}
            </Badge>
          )}
        </div>
        {node.type === "folder" && node.expanded && node.children && (
          <div>
            {node.children.map((child) => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const addNodeFromLibrary = (nodeType: string, nodeName: string) => {
    const newNode = {
      id: Date.now().toString(),
      type: nodeType as any,
      position: {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 300,
      },
      data: {
        label: nodeName,
        inputs: nodeType !== "input" ? ["input"] : undefined,
        outputs: nodeType !== "output" ? ["output"] : undefined,
        code: `# ${nodeName} implementation`,
      },
    };
    dispatch({ type: "ADD_NODE", payload: newNode });
  };

  const renderNodeLibraryItem = (node: NodeDefinition) => {
    const Icon = node.icon;
    const typeColors = {
      input: "from-blue-400 to-blue-600",
      output: "from-red-400 to-red-600",
      function: "from-green-400 to-green-600",
      api: "from-purple-400 to-purple-600",
      logic: "from-orange-400 to-orange-600",
    };

    return (
      <div
        key={node.id}
        className="glass-panel rounded-lg p-3 mb-2 cursor-pointer hover:bg-matrix-purple-700/20 group"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded bg-gradient-to-r ${typeColors[node.type]} flex items-center justify-center`}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-matrix-gold-300">
              {node.name}
            </div>
            <div className="text-xs text-matrix-purple-400">
              {node.description}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => addNodeFromLibrary(node.type, node.name)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  const filteredFiles = searchTerm
    ? projectFiles.filter((node) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : projectFiles;

  const filteredNodes = searchTerm
    ? nodeLibrary.filter(
        (node) =>
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : nodeLibrary;

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="h-12 border-b border-matrix-purple-600/30 flex items-center justify-between px-4">
        <h2 className="text-sm font-medium text-matrix-gold-300">
          Project Explorer
        </h2>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-matrix-purple-600/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-matrix-purple-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files or nodes..."
            className="pl-10 bg-matrix-purple-800/30 border-matrix-purple-600/50 text-matrix-purple-200 placeholder:text-matrix-purple-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-4 bg-matrix-purple-800/30 border border-matrix-purple-600/30 grid grid-cols-3">
          <TabsTrigger
            value="files"
            className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
          >
            <FolderTree className="h-4 w-4 mr-1" />
            Files
          </TabsTrigger>
          <TabsTrigger
            value="nodes"
            className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
          >
            <Workflow className="h-4 w-4 mr-1" />
            Nodes
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
          >
            <Layers className="h-4 w-4 mr-1" />
            Templates
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="files" className="h-full m-0">
            <ScrollArea className="h-full px-4 py-2">
              {filteredFiles.map((node) => renderFileNode(node))}

              {/* Project Stats */}
              <div className="mt-6 pt-4 border-t border-matrix-purple-600/30">
                <div className="text-xs text-matrix-purple-400 mb-2">
                  Project Statistics
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-matrix-purple-300">Files</span>
                    <span className="text-matrix-gold-300">
                      {countFiles(projectFiles)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-matrix-purple-300">Nodes</span>
                    <span className="text-matrix-gold-300">{nodes.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-matrix-purple-300">Connections</span>
                    <span className="text-matrix-gold-300">
                      {state.connections.length}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="nodes" className="h-full m-0">
            <ScrollArea className="h-full px-4 py-2">
              <div className="text-xs text-matrix-purple-400 mb-3">
                Node Library (Click + to add)
              </div>
              {filteredNodes.map(renderNodeLibraryItem)}

              {/* Custom Nodes */}
              <div className="mt-6 pt-4 border-t border-matrix-purple-600/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-matrix-purple-400">
                    Custom Nodes
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Create
                  </Button>
                </div>
                <div className="glass-panel rounded-lg p-3 text-center text-xs text-matrix-purple-400">
                  No custom nodes yet. Create your first custom node to extend
                  the IDE functionality.
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates" className="h-full m-0">
            <NodeTemplatesPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
