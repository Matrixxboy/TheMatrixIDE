import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Zap as FunctionIcon
} from "lucide-react";

interface Node {
  id: string;
  type: 'input' | 'output' | 'function' | 'variable' | 'api' | 'logic';
  position: { x: number; y: number };
  data: {
    label: string;
    value?: string;
    inputs?: string[];
    outputs?: string[];
  };
}

interface Connection {
  id: string;
  source: string;
  target: string;
  sourceOutput: string;
  targetInput: string;
}

const nodeTypes = [
  { type: 'input', label: 'Input', icon: Variable, color: 'from-blue-400 to-blue-600' },
  { type: 'function', label: 'Function', icon: FunctionIcon, color: 'from-green-400 to-green-600' },
  { type: 'api', label: 'API Call', icon: Database, color: 'from-purple-400 to-purple-600' },
  { type: 'logic', label: 'Logic', icon: Workflow, color: 'from-orange-400 to-orange-600' },
  { type: 'output', label: 'Output', icon: Code, color: 'from-red-400 to-red-600' },
];

export default function NodeCanvas() {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      type: 'input',
      position: { x: 100, y: 100 },
      data: {
        label: 'User Input',
        outputs: ['value']
      }
    },
    {
      id: '2',
      type: 'function',
      position: { x: 300, y: 150 },
      data: {
        label: 'Process Data',
        inputs: ['data'],
        outputs: ['result']
      }
    },
    {
      id: '3',
      type: 'output',
      position: { x: 500, y: 200 },
      data: {
        label: 'Display Result',
        inputs: ['result']
      }
    }
  ]);
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState<'select' | 'pan'>('select');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const addNode = (type: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      type: type as Node['type'],
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      data: {
        label: `New ${type}`,
        inputs: type !== 'input' ? ['input'] : undefined,
        outputs: type !== 'output' ? ['output'] : undefined,
      }
    };
    setNodes(prev => [...prev, newNode]);
  };

  const renderNode = (node: Node) => {
    const nodeTypeConfig = nodeTypes.find(nt => nt.type === node.type);
    const Icon = nodeTypeConfig?.icon || Function;
    
    return (
      <div
        key={node.id}
        className={`absolute glass-panel rounded-lg p-4 min-w-32 cursor-move transform transition-all duration-200 ${
          selectedNode === node.id ? 'ring-2 ring-matrix-gold-400 glow-gold' : ''
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${zoom})`,
        }}
        onClick={() => setSelectedNode(node.id)}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded bg-gradient-to-r ${nodeTypeConfig?.color} flex items-center justify-center`}>
            <Icon className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium text-matrix-gold-300">{node.data.label}</span>
        </div>
        
        {/* Input connections */}
        {node.data.inputs && (
          <div className="mb-2">
            {node.data.inputs.map((input, index) => (
              <div key={input} className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-matrix-purple-400 border border-matrix-purple-300"></div>
                <span className="text-xs text-matrix-purple-300">{input}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Output connections */}
        {node.data.outputs && (
          <div className="text-right">
            {node.data.outputs.map((output, index) => (
              <div key={output} className="flex items-center justify-end gap-2 mb-1">
                <span className="text-xs text-matrix-purple-300">{output}</span>
                <div className="w-2 h-2 rounded-full bg-matrix-gold-400 border border-matrix-gold-300"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden node-canvas">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 glass-panel rounded-lg p-2 flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={dragMode === 'select' ? 'secondary' : 'ghost'}
            onClick={() => setDragMode('select')}
            className="h-8 w-8 p-0"
          >
            <Move3D className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={dragMode === 'pan' ? 'secondary' : 'ghost'}
            onClick={() => setDragMode('pan')}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={handleZoomIn} className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleZoomOut} className="h-8 w-8 p-0">
            <Minus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleReset} className="h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Node Palette */}
      <div className="absolute top-4 right-4 z-10 glass-panel rounded-lg p-2">
        <div className="text-xs text-matrix-gold-300 mb-2 font-medium">Add Node</div>
        <div className="flex flex-col gap-1">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <Button
                key={nodeType.type}
                size="sm"
                variant="ghost"
                onClick={() => addNode(nodeType.type)}
                className="justify-start gap-2 h-8 hover:bg-matrix-purple-700/30"
              >
                <div className={`w-4 h-4 rounded bg-gradient-to-r ${nodeType.color} flex items-center justify-center`}>
                  <Icon className="h-2 w-2 text-white" />
                </div>
                <span className="text-xs">{nodeType.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Code Generation Panel */}
      <div className="absolute bottom-4 right-4 z-10 glass-panel rounded-lg p-4 max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <Code className="h-4 w-4 text-matrix-gold-400" />
          <span className="text-sm font-medium text-matrix-gold-300">Generated Code</span>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto">
            <Play className="h-3 w-3" />
          </Button>
        </div>
        <div className="bg-matrix-dark/50 rounded p-3 font-mono text-xs text-matrix-purple-300">
          <div># Generated Python Code</div>
          <div>user_input = input("Enter value: ")</div>
          <div>result = process_data(user_input)</div>
          <div>print(f"Result: {'{result}'}")</div>
        </div>
        <Badge variant="outline" className="mt-2 border-matrix-gold-400/50 text-matrix-gold-300 text-xs">
          Auto-generated from nodes
        </Badge>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        {nodes.map(renderNode)}
        
        {/* Render connections here */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((connection) => (
            <line
              key={connection.id}
              x1="100"
              y1="100"
              x2="200"
              y2="200"
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              className="drop-shadow-lg"
            />
          ))}
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--matrix-purple-400))" />
              <stop offset="100%" stopColor="hsl(var(--matrix-gold-400))" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
