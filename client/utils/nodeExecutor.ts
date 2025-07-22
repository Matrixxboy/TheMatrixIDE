import { Node, Connection } from "@/contexts/AppContext";

export interface ExecutionContext {
  nodeOutputs: Map<string, any>;
  nodeStates: Map<string, "pending" | "running" | "completed" | "error">;
  executionLog: string[];
  startTime: number;
}

export interface NodeExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
}

export class NodeExecutor {
  private context: ExecutionContext;

  constructor() {
    this.context = {
      nodeOutputs: new Map(),
      nodeStates: new Map(),
      executionLog: [],
      startTime: Date.now(),
    };
  }

  // Topological sort to determine execution order
  private getExecutionOrder(nodes: Node[], connections: Connection[]): Node[] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // Initialize
    nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });

    // Build adjacency list and calculate in-degrees
    connections.forEach((conn) => {
      adjList.get(conn.source)?.push(conn.target);
      inDegree.set(conn.target, (inDegree.get(conn.target) || 0) + 1);
    });

    // Topological sort
    const queue: string[] = [];
    const result: Node[] = [];

    // Find nodes with no incoming edges
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        result.push(node);
      }

      adjList.get(nodeId)?.forEach((neighbor) => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    return result;
  }

  // Get input values for a node from connected outputs
  private getNodeInputs(
    node: Node,
    connections: Connection[],
  ): Record<string, any> {
    const inputs: Record<string, any> = {};

    if (!node.data.inputs) return inputs;

    connections
      .filter((conn) => conn.target === node.id)
      .forEach((conn) => {
        const sourceOutput = this.context.nodeOutputs.get(
          `${conn.source}_${conn.sourceOutput}`,
        );
        if (sourceOutput !== undefined) {
          inputs[conn.targetInput] = sourceOutput;
        }
      });

    return inputs;
  }

  // Execute a single node
  private async executeNode(
    node: Node,
    inputs: Record<string, any>,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    this.context.nodeStates.set(node.id, "running");
    
    try {
      let output: any;

      switch (node.type) {
        case "input":
          output = await this.executeInputNode(node, inputs);
          break;
        case "function":
          output = await this.executeFunctionNode(node, inputs);
          break;
        case "api":
          output = await this.executeApiNode(node, inputs);
          break;
        case "logic":
          output = await this.executeLogicNode(node, inputs);
          break;
        case "output":
          output = await this.executeOutputNode(node, inputs);
          break;
        case "variable":
          output = await this.executeVariableNode(node, inputs);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      const executionTime = Date.now() - startTime;
      this.context.nodeStates.set(node.id, "completed");
      
      // Store outputs for connected nodes
      if (node.data.outputs) {
        node.data.outputs.forEach((outputName) => {
          this.context.nodeOutputs.set(`${node.id}_${outputName}`, output);
        });
      }

      this.context.executionLog.push(
        `✓ ${node.data.label} completed in ${executionTime}ms`,
      );

      return {
        success: true,
        output,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.context.nodeStates.set(node.id, "error");
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.context.executionLog.push(
        `✗ ${node.data.label} failed: ${errorMessage}`,
      );

      return {
        success: false,
        output: null,
        error: errorMessage,
        executionTime,
      };
    }
  }

  // Node type implementations
  private async executeInputNode(node: Node, inputs: Record<string, any>): Promise<any> {
    const config = node.data.config || {};
    const prompt = config.prompt || "Enter value:";
    
    // Simulate user input - in a real app this could be a modal or form
    const mockInputs = [
      "Hello Matrix IDE",
      "Sample data",
      "42",
      "test@example.com",
      "user input data"
    ];
    
    const value = mockInputs[Math.floor(Math.random() * mockInputs.length)];
    
    this.context.executionLog.push(`📥 Input: "${value}"`);
    return value;
  }

  private async executeFunctionNode(node: Node, inputs: Record<string, any>): Promise<any> {
    const config = node.data.config || {};
    const inputValue = Object.values(inputs)[0] || "";

    // Execute based on function type or custom code
    if (node.data.label.toLowerCase().includes("process")) {
      const processed = typeof inputValue === "string" 
        ? inputValue.trim().toLowerCase() 
        : String(inputValue);
      this.context.executionLog.push(`🔄 Processed: "${inputValue}" → "${processed}"`);
      return processed;
    }
    
    if (node.data.label.toLowerCase().includes("ai")) {
      const enhanced = `AI_ENHANCED: ${inputValue}`;
      this.context.executionLog.push(`🤖 AI Enhanced: "${inputValue}" → "${enhanced}"`);
      return enhanced;
    }
    
    if (node.data.label.toLowerCase().includes("validate")) {
      const isValid = inputValue && String(inputValue).length > 0;
      this.context.executionLog.push(`✅ Validation: "${inputValue}" is ${isValid ? "valid" : "invalid"}`);
      return { isValid, data: inputValue };
    }

    // If node has custom code, try to execute it safely
    if (node.data.code && node.data.code.includes("return")) {
      try {
        // Simple function execution for basic operations
        const result = this.executeCustomCode(node.data.code, inputs);
        this.context.executionLog.push(`⚙️ Custom function result: ${JSON.stringify(result)}`);
        return result;
      } catch (error) {
        this.context.executionLog.push(`⚠️ Custom code execution failed: ${error}`);
        return inputValue;
      }
    }

    // Default: pass through the input
    this.context.executionLog.push(`➡️ Pass-through: ${JSON.stringify(inputValue)}`);
    return inputValue;
  }

  private async executeApiNode(node: Node, inputs: Record<string, any>): Promise<any> {
    const config = node.data.config || {};
    const url = config.url || "https://api.example.com/data";
    const method = config.method || "GET";

    // Simulate API call
    this.context.executionLog.push(`🌐 API Call: ${method} ${url}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    const mockResponse = {
      status: 200,
      data: {
        message: "API response data",
        timestamp: new Date().toISOString(),
        input: Object.values(inputs)[0],
        processed: true,
      },
    };

    this.context.executionLog.push(`📡 API Response: ${JSON.stringify(mockResponse.data)}`);
    return mockResponse.data;
  }

  private async executeLogicNode(node: Node, inputs: Record<string, any>): Promise<any> {
    const inputValue = Object.values(inputs)[0];
    const config = node.data.config || {};
    
    // Simple condition evaluation
    let result;
    if (typeof inputValue === "number") {
      result = inputValue > 50 ? "high" : "low";
    } else if (typeof inputValue === "string") {
      result = inputValue.length > 5 ? "long" : "short";
    } else {
      result = inputValue ? "truthy" : "falsy";
    }

    this.context.executionLog.push(`🔀 Logic: "${inputValue}" → "${result}"`);
    return result;
  }

  private async executeOutputNode(node: Node, inputs: Record<string, any>): Promise<any> {
    const inputValue = Object.values(inputs)[0];
    const config = node.data.config || {};
    const template = config.template || "Result: {result}";
    
    const output = template.replace("{result}", String(inputValue));
    
    this.context.executionLog.push(`📤 Output: ${output}`);
    return output;
  }

  private async executeVariableNode(node: Node, inputs: Record<string, any>): Promise<any> {
    const config = node.data.config || {};
    const value = config.value || Object.values(inputs)[0] || null;
    
    this.context.executionLog.push(`📊 Variable: ${node.data.label} = ${JSON.stringify(value)}`);
    return value;
  }

  // Safe execution of custom code (very limited for security)
  private executeCustomCode(code: string, inputs: Record<string, any>): any {
    // Very basic and safe code execution for simple operations
    try {
      if (code.includes("return") && !code.includes("eval") && !code.includes("Function")) {
        // Extract simple return statements
        const returnMatch = code.match(/return\s+(.+)/);
        if (returnMatch) {
          const expression = returnMatch[1].trim().replace(/;$/, "");
          
          // Only allow safe mathematical and string operations
          if (/^[\w\s+\-*\/()."']+$/.test(expression)) {
            // Replace input references
            let processedExpression = expression;
            Object.keys(inputs).forEach(key => {
              processedExpression = processedExpression.replace(
                new RegExp(`\\b${key}\\b`, 'g'), 
                JSON.stringify(inputs[key])
              );
            });
            
            // Very limited evaluation
            if (processedExpression.includes('+')) {
              const parts = processedExpression.split('+').map(p => p.trim().replace(/"/g, ''));
              return parts.join('');
            }
          }
        }
      }
    } catch (error) {
      // Fall back to input passthrough
    }
    
    return Object.values(inputs)[0];
  }

  // Main execution method
  async executeNodeGraph(
    nodes: Node[],
    connections: Connection[],
  ): Promise<ExecutionContext> {
    this.context = {
      nodeOutputs: new Map(),
      nodeStates: new Map(),
      executionLog: [],
      startTime: Date.now(),
    };

    // Initialize all nodes as pending
    nodes.forEach((node) => {
      this.context.nodeStates.set(node.id, "pending");
    });

    this.context.executionLog.push(`🚀 Starting execution of ${nodes.length} nodes`);

    // Get execution order
    const executionOrder = this.getExecutionOrder(nodes, connections);
    
    if (executionOrder.length !== nodes.length) {
      this.context.executionLog.push("⚠️ Warning: Circular dependency detected in node graph");
    }

    // Execute nodes in order
    for (const node of executionOrder) {
      const inputs = this.getNodeInputs(node, connections);
      this.context.executionLog.push(`▶️ Executing: ${node.data.label}`);
      
      const result = await this.executeNode(node, inputs);
      
      if (!result.success) {
        this.context.executionLog.push(`💥 Execution stopped due to error in ${node.data.label}`);
        break;
      }
    }

    const totalTime = Date.now() - this.context.startTime;
    const completedNodes = Array.from(this.context.nodeStates.values()).filter(
      state => state === "completed"
    ).length;
    
    this.context.executionLog.push(
      `🏁 Execution completed: ${completedNodes}/${nodes.length} nodes in ${totalTime}ms`
    );

    return this.context;
  }

  getContext(): ExecutionContext {
    return this.context;
  }
}
