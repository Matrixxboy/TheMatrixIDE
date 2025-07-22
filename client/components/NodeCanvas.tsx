import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NodeExecutor } from "@/utils/nodeExecutor";
import {
  Plus,
  Minus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move3D,
  Code,
  Play,
  Variable,
  Database,
  Workflow,
  Zap as FunctionIcon,
  Trash2,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Node, Connection } from "@/contexts/AppContext";

const nodeTypes = [
  {
    type: "input",
    label: "Input",
    icon: Variable,
    color: "from-blue-400 to-blue-600",
  },
  {
    type: "function",
    label: "Function",
    icon: FunctionIcon,
    color: "from-green-400 to-green-600",
  },
  {
    type: "api",
    label: "API Call",
    icon: Database,
    color: "from-purple-400 to-purple-600",
  },
  {
    type: "logic",
    label: "Logic",
    icon: Workflow,
    color: "from-orange-400 to-orange-600",
  },
  {
    type: "output",
    label: "Output",
    icon: Code,
    color: "from-red-400 to-red-600",
  },
];

interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  offset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

interface ConnectionState {
  isConnecting: boolean;
  sourceNode: string | null;
  sourceOutput: string | null;
  tempConnection: { x: number; y: number } | null;
}

export default function NodeCanvas() {
  const { state, dispatch } = useApp();
  const {
    nodes,
    connections,
    selectedNode,
    canvasZoom,
    canvasPan,
    generatedCode,
    settings,
  } = state;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    nodeId: null,
    offset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
  });

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    sourceNode: null,
    sourceOutput: null,
    tempConnection: null,
  });

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [nodeExecutionStates, setNodeExecutionStates] = useState<
    Record<string, string>
  >({});
  const [isExecuting, setIsExecuting] = useState(false);

  const handleZoomIn = () =>
    dispatch({
      type: "SET_CANVAS_ZOOM",
      payload: Math.min(canvasZoom + 0.1, 2),
    });
  const handleZoomOut = () =>
    dispatch({
      type: "SET_CANVAS_ZOOM",
      payload: Math.max(canvasZoom - 0.1, 0.5),
    });
  const handleReset = () => {
    dispatch({ type: "SET_CANVAS_ZOOM", payload: 1 });
    dispatch({ type: "SET_CANVAS_PAN", payload: { x: 0, y: 0 } });
  };

  const addNode = (type: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      type: type as Node["type"],
      position: {
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
      },
      data: {
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        inputs: type !== "input" ? ["input"] : undefined,
        outputs: type !== "output" ? ["output"] : undefined,
        code: `# ${type} node code\nprint("${type} node executed")`,
        config: {},
      },
    };
    dispatch({ type: "ADD_NODE", payload: newNode });
    console.log("Added node:", newNode);
  };

  const deleteNode = (nodeId: string) => {
    dispatch({ type: "DELETE_NODE", payload: nodeId });
    setContextMenu(null);
  };

  const executeNodes = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    setNodeExecutionStates(new Map());

    try {
      const executor = new NodeExecutor();

      // Set up execution monitoring
      const originalExecuteNode = executor["executeNode"];
      executor["executeNode"] = async function (node, inputs) {
        setNodeExecutionStates((prev) => new Map(prev.set(node.id, "running")));
        const result = await originalExecuteNode.call(this, node, inputs);
        setNodeExecutionStates(
          (prev) =>
            new Map(prev.set(node.id, result.success ? "completed" : "error")),
        );
        return result;
      };

      const context = await executor.executeNodeGraph(nodes, connections);

      // Trigger code editor to show results
      dispatch({ type: "SET_ACTIVE_PANEL", payload: "code" });
      dispatch({ type: "SET_ACTIVE_TAB", payload: "output" });

      setTimeout(() => {
        const event = new CustomEvent("executeCode");
        window.dispatchEvent(event);
      }, 100);
    } catch (error) {
      console.error("Node execution failed:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Mouse and Touch handlers for node dragging
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string) => {
      e.currentTarget.setPointerCapture(e.pointerId);

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const pointerX = (e.clientX - rect.left - canvasPan.x) / canvasZoom;
      const pointerY = (e.clientY - rect.top - canvasPan.y) / canvasZoom;

      setDragState({
        isDragging: true,
        nodeId,
        offset: {
          x: pointerX - node.position.x,
          y: pointerY - node.position.y,
        },
        startPosition: { x: pointerX, y: pointerY },
      });

      dispatch({ type: "SELECT_NODE", payload: nodeId });

      e.preventDefault();
      e.stopPropagation();
    },
    [nodes, canvasPan, canvasZoom, dispatch],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const pointerX = (e.clientX - rect.left - canvasPan.x) / canvasZoom;
      const pointerY = (e.clientY - rect.top - canvasPan.y) / canvasZoom;

      setMousePosition({ x: pointerX, y: pointerY });

      if (dragState.isDragging && dragState.nodeId) {
        const newPosition = {
          x: pointerX - dragState.offset.x,
          y: pointerY - dragState.offset.y,
        };

        // Snap to grid if enabled
        if (settings.nodeSnapToGrid) {
          newPosition.x = Math.round(newPosition.x / 20) * 20;
          newPosition.y = Math.round(newPosition.y / 20) * 20;
        }

        dispatch({
          type: "MOVE_NODE",
          payload: { id: dragState.nodeId, position: newPosition },
        });
      }

      if (connectionState.isConnecting) {
        setConnectionState((prev) => ({
          ...prev,
          tempConnection: { x: pointerX, y: pointerY },
        }));
      }
    },
    [
      dragState,
      canvasPan,
      canvasZoom,
      settings.nodeSnapToGrid,
      dispatch,
      connectionState.isConnecting,
    ],
  );

  const handlePointerUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        nodeId: null,
        offset: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 },
      });
    }

    if (connectionState.isConnecting) {
      setConnectionState({
        isConnecting: false,
        sourceNode: null,
        sourceOutput: null,
        tempConnection: null,
      });
    }
  }, [dragState.isDragging, connectionState.isConnecting]);

  // Handle connection creation
  const startConnection = (
    nodeId: string,
    outputName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setConnectionState({
      isConnecting: true,
      sourceNode: nodeId,
      sourceOutput: outputName,
      tempConnection: null,
    });
  };

  const endConnection = (
    nodeId: string,
    inputName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    if (
      connectionState.isConnecting &&
      connectionState.sourceNode &&
      connectionState.sourceOutput
    ) {
      // Don't connect to the same node
      if (connectionState.sourceNode === nodeId) {
        setConnectionState({
          isConnecting: false,
          sourceNode: null,
          sourceOutput: null,
          tempConnection: null,
        });
        return;
      }

      // Check if connection already exists
      const existingConnection = connections.find(
        (conn) =>
          conn.source === connectionState.sourceNode &&
          conn.target === nodeId &&
          conn.sourceOutput === connectionState.sourceOutput &&
          conn.targetInput === inputName,
      );

      if (!existingConnection) {
        const newConnection: Connection = {
          id: Date.now().toString(),
          source: connectionState.sourceNode,
          target: nodeId,
          sourceOutput: connectionState.sourceOutput,
          targetInput: inputName,
        };

        dispatch({ type: "ADD_CONNECTION", payload: newConnection });
      }

      setConnectionState({
        isConnecting: false,
        sourceNode: null,
        sourceOutput: null,
        tempConnection: null,
      });
    }
  };

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId,
    });
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const renderNode = (node: Node) => {
    const nodeTypeConfig = nodeTypes.find((nt) => nt.type === node.type);
    const Icon = nodeTypeConfig?.icon || FunctionIcon;
    const isSelected = selectedNode === node.id;
    const executionState = nodeExecutionStates.get(node.id);

    return (
      <div
        key={node.id}
        className={`absolute glass-panel rounded-lg p-3 sm:p-4 min-w-32 sm:min-w-40 cursor-move transform transition-all duration-200 touch-manipulation ${
          isSelected ? "ring-2 ring-matrix-gold-400/50 shadow-lg" : ""
        } ${dragState.isDragging && dragState.nodeId === node.id ? "z-50" : "z-10"} ${
          executionState === "running"
            ? "ring-2 ring-blue-400 animate-pulse"
            : executionState === "completed"
              ? "ring-2 ring-green-400"
              : executionState === "error"
                ? "ring-2 ring-red-400"
                : ""
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${canvasZoom})`,
          transformOrigin: "top left",
        }}
        onPointerDown={(e) => handlePointerDown(e, node.id)}
        onContextMenu={(e) => handleContextMenu(e, node.id)}
      >
        {/* Node Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-6 h-6 rounded bg-gradient-to-r ${nodeTypeConfig?.color} flex items-center justify-center`}
          >
            <Icon className="h-3 w-3 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-matrix-gold-300">
              {node.data.label}
            </span>
            <div className="flex items-center gap-2 text-xs text-matrix-purple-400">
              <span className="capitalize">{node.type}</span>
              <span>•</span>
              <span>ID: {node.id.slice(-4)}</span>
              {node.data.code && node.data.code.length > 50 && (
                <span className="text-matrix-gold-400" title="Has custom code">
                  • <Code className="h-3 w-3 inline" />
                </span>
              )}
            </div>
          </div>
          {executionState === "running" && (
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-spin border-2 border-blue-200 border-t-transparent"></div>
          )}
          {executionState === "completed" && (
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          )}
          {executionState === "error" && (
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
          )}
          {isSelected && !executionState && (
            <div className="w-2 h-2 rounded-full bg-matrix-gold-400 animate-pulse"></div>
          )}
        </div>

        {/* Input connections */}
        {node.data.inputs && (
          <div className="mb-3">
            {node.data.inputs.map((input, index) => (
              <div
                key={input}
                className="flex items-center gap-2 mb-1 relative"
                onMouseUp={(e) => endConnection(node.id, input, e)}
              >
                <div className="w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-matrix-purple-400 border-2 border-matrix-purple-300 cursor-pointer hover:bg-matrix-purple-300 transition-colors touch-manipulation"></div>
                <span className="text-xs text-matrix-purple-300">{input}</span>
              </div>
            ))}
          </div>
        )}

        {/* Output connections */}
        {node.data.outputs && (
          <div className="text-right">
            {node.data.outputs.map((output, index) => (
              <div
                key={output}
                className="flex items-center justify-end gap-2 mb-1 relative"
                onMouseDown={(e) => startConnection(node.id, output, e)}
              >
                <span className="text-xs text-matrix-purple-300">{output}</span>
                <div className="w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-matrix-gold-400 border-2 border-matrix-gold-300 cursor-pointer hover:bg-matrix-gold-300 transition-colors touch-manipulation"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getNodeOutputPosition = (nodeId: string, outputName: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.data.outputs) return { x: 0, y: 0 };

    const outputIndex = node.data.outputs.indexOf(outputName);
    return {
      x: node.position.x + 152, // Node width + margin
      y: node.position.y + 40 + outputIndex * 20 + 10, // Header + offset
    };
  };

  const getNodeInputPosition = (nodeId: string, inputName: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.data.inputs) return { x: 0, y: 0 };

    const inputIndex = node.data.inputs.indexOf(inputName);
    return {
      x: node.position.x,
      y: node.position.y + 40 + inputIndex * 20 + 10,
    };
  };

  return (
    <div className="relative w-full h-full overflow-hidden node-canvas">
      {/* Toolbar - Mobile-friendly */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 glass-panel rounded-lg p-2 flex flex-col gap-2">
        <div className="flex sm:flex-col items-center gap-1 sm:gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            className="h-10 w-10 sm:h-8 sm:w-8 p-0 touch-manipulation"
          >
            <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            className="h-10 w-10 sm:h-8 sm:w-8 p-0 touch-manipulation"
          >
            <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-10 w-10 sm:h-8 sm:w-8 p-0 touch-manipulation"
          >
            <RotateCcw className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <div className="text-xs text-matrix-purple-300 text-center hidden sm:block">
          {Math.round(canvasZoom * 100)}%
        </div>
      </div>

      {/* Node Palette - Mobile-responsive */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 glass-panel rounded-lg p-2">
        <div className="text-xs text-matrix-gold-300 mb-2 font-medium hidden sm:block">
          Add Node
        </div>
        <div className="flex sm:flex-col gap-1">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <Button
                key={nodeType.type}
                size="sm"
                variant="ghost"
                onClick={() => addNode(nodeType.type)}
                className="justify-start gap-2 h-10 sm:h-8 hover:bg-matrix-purple-700/30 touch-manipulation min-w-10 sm:min-w-auto"
                title={nodeType.label}
              >
                <div
                  className={`w-5 h-5 sm:w-4 sm:h-4 rounded bg-gradient-to-r ${nodeType.color} flex items-center justify-center`}
                >
                  <Icon className="h-3 w-3 sm:h-2 sm:w-2 text-white" />
                </div>
                <span className="text-xs hidden sm:inline">
                  {nodeType.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Code Generation Panel - Mobile-responsive */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 glass-panel rounded-lg p-3 sm:p-4 max-w-xs sm:max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <Code className="h-4 w-4 text-matrix-gold-400" />
          <span className="text-xs sm:text-sm font-medium text-matrix-gold-300">
            <span className="hidden sm:inline">Generated Code</span>
            <span className="sm:hidden">Code</span>
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 ml-auto touch-manipulation"
            onClick={executeNodes}
            disabled={isExecuting}
            title="Execute Nodes"
          >
            {isExecuting ? (
              <div className="w-3 h-3 rounded-full border-2 border-matrix-gold-400 border-t-transparent animate-spin"></div>
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="bg-matrix-dark/50 rounded p-2 sm:p-3 font-mono text-xs text-matrix-purple-300 max-h-24 sm:max-h-32 overflow-auto">
          <pre className="whitespace-pre-wrap">
            {generatedCode.split("\n").slice(0, 6).join("\n")}
          </pre>
          {generatedCode.split("\n").length > 6 && (
            <div className="text-matrix-purple-400 mt-1 sm:mt-2 text-xs">
              ...+{generatedCode.split("\n").length - 6} lines
            </div>
          )}
        </div>
        <Badge
          variant="outline"
          className="mt-2 border-matrix-gold-400/50 text-matrix-gold-300 text-xs"
        >
          {settings.language.toUpperCase()}
          <span className="hidden sm:inline"> - Auto-generated</span>
        </Badge>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${canvasPan.x}px, ${canvasPan.y}px)`,
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => dispatch({ type: "SELECT_NODE", payload: null })}
      >
        {/* Render connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
        >
          {connections.map((connection) => {
            const startPos = getNodeOutputPosition(
              connection.source,
              connection.sourceOutput,
            );
            const endPos = getNodeInputPosition(
              connection.target,
              connection.targetInput,
            );

            const midX = (startPos.x + endPos.x) / 2;

            return (
              <g key={connection.id}>
                <path
                  d={`M ${startPos.x} ${startPos.y} C ${midX} ${startPos.y} ${midX} ${endPos.y} ${endPos.x} ${endPos.y}`}
                  stroke="url(#connectionGradient)"
                  strokeWidth="2"
                  fill="none"
                  className="drop-shadow-lg"
                />
              </g>
            );
          })}

          {/* Temporary connection line */}
          {connectionState.isConnecting &&
            connectionState.tempConnection &&
            connectionState.sourceNode &&
            connectionState.sourceOutput && (
              <line
                x1={
                  getNodeOutputPosition(
                    connectionState.sourceNode,
                    connectionState.sourceOutput,
                  ).x
                }
                y1={
                  getNodeOutputPosition(
                    connectionState.sourceNode,
                    connectionState.sourceOutput,
                  ).y
                }
                x2={connectionState.tempConnection.x}
                y2={connectionState.tempConnection.y}
                stroke="hsl(var(--matrix-gold-400))"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="opacity-70"
              />
            )}

          <defs>
            <linearGradient
              id="connectionGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="hsl(var(--matrix-purple-400))" />
              <stop offset="100%" stopColor="hsl(var(--matrix-gold-400))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Render nodes */}
        {nodes.map(renderNode)}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 glass-panel rounded-lg p-2 border border-matrix-purple-600/50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.nodeId ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteNode(contextMenu.nodeId!)}
              className="justify-start gap-2 text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete Node
            </Button>
          ) : (
            <div className="text-xs text-matrix-purple-400">Canvas Menu</div>
          )}
        </div>
      )}
    </div>
  );
}
