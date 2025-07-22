import React, { createContext, useContext, useReducer, ReactNode } from "react";

// Types
export interface Node {
  id: string;
  type: "input" | "output" | "function" | "variable" | "api" | "logic";
  position: { x: number; y: number };
  data: {
    label: string;
    value?: string;
    inputs?: string[];
    outputs?: string[];
    code?: string;
    config?: any;
  };
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceOutput: string;
  targetInput: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  expanded?: boolean;
  language?: string;
  content?: string;
}

export interface Settings {
  theme: "dark" | "light" | "auto";
  fontSize: number;
  nodeSnapToGrid: boolean;
  showMinimap: boolean;
  language: string;
  autoSave: boolean;
  livePreview: boolean;
  wordWrap: boolean;
  aiEnabled: boolean;
  aiModel: string;
  aiSuggestions: boolean;
  aiAutoComplete: boolean;
  maxNodes: number;
  renderOptimization: boolean;
  memoryLimit: number;
  defaultExportFormat: string;
  includeComments: boolean;
  minifyCode: boolean;
}

export interface ExecutionContext {
  nodeOutputs: Record<string, any>;
  nodeStates: Record<string, "pending" | "running" | "completed" | "error">;
  executionLog: string[];
  startTime: number;
  isExecuting: boolean;
}

export interface AppState {
  // Canvas state
  nodes: Node[];
  connections: Connection[];
  selectedNode: string | null;
  canvasZoom: number;
  canvasPan: { x: number; y: number };

  // UI state
  sidebarOpen: boolean;
  activePanel: "code" | "ai" | "settings";
  activeTab: string;

  // Project state
  projectFiles: FileNode[];
  currentFile: string | null;
  generatedCode: string;

  // Settings
  settings: Settings;

  // AI state
  aiMessages: Array<{
    id: string;
    type: "user" | "ai";
    content: string;
    timestamp: Date;
    category?: string;
  }>;
  aiProcessing: boolean;

  // Execution state
  executionContext: ExecutionContext | null;
}

// Actions
type AppAction =
  | { type: "ADD_NODE"; payload: Node }
  | { type: "UPDATE_NODE"; payload: { id: string; updates: Partial<Node> } }
  | { type: "DELETE_NODE"; payload: string }
  | { type: "SELECT_NODE"; payload: string | null }
  | {
      type: "MOVE_NODE";
      payload: { id: string; position: { x: number; y: number } };
    }
  | { type: "ADD_CONNECTION"; payload: Connection }
  | { type: "DELETE_CONNECTION"; payload: string }
  | { type: "SET_CANVAS_ZOOM"; payload: number }
  | { type: "SET_CANVAS_PAN"; payload: { x: number; y: number } }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_ACTIVE_PANEL"; payload: "code" | "ai" | "settings" }
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Partial<Settings> }
  | { type: "SET_GENERATED_CODE"; payload: string }
  | { type: "TOGGLE_FILE_FOLDER"; payload: string }
  | { type: "SELECT_FILE"; payload: string }
  | {
      type: "ADD_AI_MESSAGE";
      payload: { type: "user" | "ai"; content: string; category?: string };
    }
  | { type: "SET_AI_PROCESSING"; payload: boolean }
  | { type: "SET_EXECUTION_CONTEXT"; payload: ExecutionContext | null }
  | {
      type: "UPDATE_NODE_EXECUTION_STATE";
      payload: {
        nodeId: string;
        state: "pending" | "running" | "completed" | "error";
      };
    };

// Initial state
const initialState: AppState = {
  nodes: [
    {
      id: "1",
      type: "input",
      position: { x: 100, y: 100 },
      data: {
        label: "User Input",
        outputs: ["value"],
        code: 'user_input = input("Enter value: ")',
        config: {
          prompt: "Enter your message:",
          placeholder: "Type something...",
          validation: "required",
        },
      },
    },
    {
      id: "2",
      type: "function",
      position: { x: 350, y: 120 },
      data: {
        label: "Text Processor",
        inputs: ["input"],
        outputs: ["processed"],
        code: "def process_text(text):\n    return text.strip().lower()",
        config: {
          functionName: "process_text",
          parameters: ["text"],
          returnType: "string",
        },
      },
    },
    {
      id: "3",
      type: "function",
      position: { x: 350, y: 220 },
      data: {
        label: "AI Enhancer",
        inputs: ["text"],
        outputs: ["enhanced"],
        code: "def ai_enhance(text):\n    return f'AI_ENHANCED: {text}'",
        config: {
          functionName: "ai_enhance",
          model: "local-gpt",
          maxLength: 500,
        },
      },
    },
    {
      id: "4",
      type: "output",
      position: { x: 600, y: 170 },
      data: {
        label: "Console Output",
        inputs: ["data"],
        code: 'print(f"Final Result: {data}")',
        config: {
          outputType: "console",
          format: "text",
          template: "Final Result: {data}",
        },
      },
    },
  ],
  connections: [
    {
      id: "conn1",
      source: "1",
      target: "2",
      sourceOutput: "value",
      targetInput: "input",
    },
    {
      id: "conn2",
      source: "2",
      target: "3",
      sourceOutput: "processed",
      targetInput: "text",
    },
    {
      id: "conn3",
      source: "3",
      target: "4",
      sourceOutput: "enhanced",
      targetInput: "data",
    },
  ],
  selectedNode: null,
  canvasZoom: 1,
  canvasPan: { x: 0, y: 0 },
  sidebarOpen: true,
  activePanel: "code",
  activeTab: "generated",
  projectFiles: [
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
            {
              id: "3",
              name: "main.py",
              type: "file",
              language: "python",
              content: "# Generated code will appear here",
            },
            {
              id: "4",
              name: "data_processor.py",
              type: "file",
              language: "python",
              content:
                "def process_data(data):\n    return data.strip().lower()",
            },
            {
              id: "5",
              name: "ai_module.py",
              type: "file",
              language: "python",
              content: "# AI processing module",
            },
          ],
        },
        {
          id: "13",
          name: "README.md",
          type: "file",
          language: "markdown",
          content:
            "# Matrix IDE Project\n\nThis project was generated using The Matrix IDE.",
        },
      ],
    },
  ],
  currentFile: null,
  generatedCode:
    '# Matrix IDE Generated Python Code\nimport sys\nimport json\nfrom typing import Any, Dict, List\n\ndef process_data(data: Any) -> Any:\n    """Transform and process input data"""\n    if isinstance(data, str):\n        return data.strip().lower()\n    return data\n\ndef main():\n    """Main execution function"""\n    # User Input node\n    user_input_value = input("User Input: ")\n    \n    # Process Data node\n    process_data_result = process_data(user_input_value)\n    \n    # Display Result\n    print(f"Display Result: {process_data_result}")\n    \n    return "Execution completed successfully"\n\nif __name__ == "__main__":\n    try:\n        result = main()\n        print(result)\n    except Exception as e:\n        print(f"Error: {e}")\n        sys.exit(1)',
  settings: {
    theme: "dark",
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
  },
  aiMessages: [
    {
      id: "1",
      type: "ai",
      content:
        "Welcome to Matrix IDE AI Assistant! I'm running locally on your machine for complete privacy. How can I help you with your code today?",
      timestamp: new Date(),
      category: "chat",
    },
  ],
  aiProcessing: false,
  executionContext: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_NODE":
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
      };

    case "UPDATE_NODE":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id
            ? { ...node, ...action.payload.updates }
            : node,
        ),
      };

    case "DELETE_NODE":
      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== action.payload),
        connections: state.connections.filter(
          (conn) =>
            conn.source !== action.payload && conn.target !== action.payload,
        ),
      };

    case "SELECT_NODE":
      return {
        ...state,
        selectedNode: action.payload,
      };

    case "MOVE_NODE":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id
            ? { ...node, position: action.payload.position }
            : node,
        ),
      };

    case "ADD_CONNECTION":
      return {
        ...state,
        connections: [...state.connections, action.payload],
      };

    case "DELETE_CONNECTION":
      return {
        ...state,
        connections: state.connections.filter(
          (conn) => conn.id !== action.payload,
        ),
      };

    case "SET_CANVAS_ZOOM":
      return {
        ...state,
        canvasZoom: action.payload,
      };

    case "SET_CANVAS_PAN":
      return {
        ...state,
        canvasPan: action.payload,
      };

    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case "SET_ACTIVE_PANEL":
      return {
        ...state,
        activePanel: action.payload,
      };

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTab: action.payload,
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case "SET_GENERATED_CODE":
      return {
        ...state,
        generatedCode: action.payload,
      };

    case "TOGGLE_FILE_FOLDER":
      const toggleNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.id === action.payload && node.type === "folder") {
            return { ...node, expanded: !node.expanded };
          }
          if (node.children) {
            return { ...node, children: toggleNode(node.children) };
          }
          return node;
        });
      };
      return {
        ...state,
        projectFiles: toggleNode(state.projectFiles),
      };

    case "SELECT_FILE":
      return {
        ...state,
        currentFile: action.payload,
      };

    case "ADD_AI_MESSAGE":
      return {
        ...state,
        aiMessages: [
          ...state.aiMessages,
          {
            id: Date.now().toString(),
            type: action.payload.type,
            content: action.payload.content,
            timestamp: new Date(),
            category: action.payload.category,
          },
        ],
      };

    case "SET_AI_PROCESSING":
      return {
        ...state,
        aiProcessing: action.payload,
      };

    case "SET_EXECUTION_CONTEXT":
      return {
        ...state,
        executionContext: action.payload,
      };

    case "UPDATE_NODE_EXECUTION_STATE":
      const currentContext = state.executionContext;
      if (!currentContext) return state;

      const newNodeStates = new Map(currentContext.nodeStates);
      newNodeStates.set(action.payload.nodeId, action.payload.state);

      return {
        ...state,
        executionContext: {
          ...currentContext,
          nodeStates: newNodeStates,
        },
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
