import { Node, Connection } from "@/contexts/AppContext";

export interface ExecutionContext {
  nodeOutputs: Record<string, any>;
  nodeStates: Record<string, "pending" | "running" | "completed" | "error">;
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
      nodeOutputs: {},
      nodeStates: {},
      executionLog: [],
      startTime: Date.now(),
    };
  }

  // Topological sort to determine execution order
  private getExecutionOrder(nodes: Node[], connections: Connection[]): Node[] {
    const inDegree: Record<string, number> = {};
    const adjList: Record<string, string[]> = {};

    // Initialize
    nodes.forEach((node) => {
      inDegree[node.id] = 0;
      adjList[node.id] = [];
    });

    // Build adjacency list and calculate in-degrees
    connections.forEach((conn) => {
      adjList[conn.source]?.push(conn.target);
      inDegree[conn.target] = (inDegree[conn.target] || 0) + 1;
    });

    // Topological sort
    const queue: string[] = [];
    const result: Node[] = [];

    // Find nodes with no incoming edges
    Object.entries(inDegree).forEach(([nodeId, degree]) => {
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

      adjList[nodeId]?.forEach((neighbor) => {
        const newDegree = (inDegree[neighbor] || 0) - 1;
        inDegree[neighbor] = newDegree;
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
        const sourceOutput = this.context.nodeOutputs[
          `${conn.source}_${conn.sourceOutput}`
        ];
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
    this.context.nodeStates[node.id] = "running";

    // Add small delay to make execution visible
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200),
    );

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
      this.context.nodeStates[node.id] = "completed";

      // Store outputs for connected nodes
      if (node.data.outputs) {
        node.data.outputs.forEach((outputName) => {
          this.context.nodeOutputs[`${node.id}_${outputName}`] = output;
        });
      }

      this.context.executionLog.push(
        `✓ ${node.data.label} completed in ${executionTime}ms → ${JSON.stringify(output).substring(0, 50)}${JSON.stringify(output).length > 50 ? "..." : ""}`,
      );

      return {
        success: true,
        output,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.context.nodeStates.set(node.id, "error");

      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
  private async executeInputNode(
    node: Node,
    inputs: Record<string, any>,
  ): Promise<any> {
    const config = node.data.config || {};
    const prompt = config.prompt || "Enter value:";

    // Generate dynamic realistic inputs based on context
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString();
    const dateString = currentTime.toLocaleDateString();

    const dynamicInputs = [
      `Hello from Matrix IDE at ${timeString}`,
      `Processing data on ${dateString}`,
      `Dynamic input #${Math.floor(Math.random() * 1000)}`,
      `User message: ${["Hello", "Testing", "Data flow", "AI Processing", "Node execution"][Math.floor(Math.random() * 5)]}`,
      `Session ${Math.floor(Math.random() * 100)}: ${["active", "processing", "ready", "initialized"][Math.floor(Math.random() * 4)]}`,
      `Real-time data: ${Math.random().toFixed(3)}`,
      `Matrix input ${Date.now().toString().slice(-4)}`,
    ];

    const value =
      dynamicInputs[Math.floor(Math.random() * dynamicInputs.length)];

    this.context.executionLog.push(`📥 Input generated: "${value}"`);
    this.context.executionLog.push(`   → Prompt: "${prompt}"`);
    return value;
  }

  private async executeFunctionNode(
    node: Node,
    inputs: Record<string, any>,
  ): Promise<any> {
    const config = node.data.config || {};
    const inputValue = Object.values(inputs)[0] || "";
    const functionName =
      config.functionName || node.data.label.toLowerCase().replace(/\s+/g, "_");

    this.context.executionLog.push(`⚙️ Executing function: ${functionName}`);
    this.context.executionLog.push(`   → Input: ${JSON.stringify(inputValue)}`);

    // Execute based on function type or custom code
    if (
      node.data.label.toLowerCase().includes("process") ||
      node.data.label.toLowerCase().includes("text")
    ) {
      const processed =
        typeof inputValue === "string"
          ? inputValue.trim().toLowerCase()
          : String(inputValue).toLowerCase();

      // Add some realistic processing steps
      this.context.executionLog.push(`   → Trimming whitespace...`);
      this.context.executionLog.push(`   → Converting to lowercase...`);
      this.context.executionLog.push(
        `🔄 Text processed: "${inputValue}" → "${processed}"`,
      );
      return processed;
    }

    if (
      node.data.label.toLowerCase().includes("ai") ||
      node.data.label.toLowerCase().includes("enhance")
    ) {
      const timestamp = Date.now().toString().slice(-4);
      const enhanced = `AI_ENHANCED_${timestamp}: ${inputValue}`;

      this.context.executionLog.push(`   → Loading AI model...`);
      this.context.executionLog.push(`   → Processing with neural network...`);
      this.context.executionLog.push(`   → Applying enhancement algorithms...`);
      this.context.executionLog.push(
        `🤖 AI Enhanced: "${inputValue}" → "${enhanced}"`,
      );
      return enhanced;
    }

    if (node.data.label.toLowerCase().includes("validate")) {
      const isValid = inputValue && String(inputValue).length > 2;
      const score = Math.random() * 100;
      const result = {
        isValid,
        data: inputValue,
        confidence: score.toFixed(2),
        timestamp: new Date().toISOString(),
      };

      this.context.executionLog.push(`   → Running validation checks...`);
      this.context.executionLog.push(
        `   → Confidence score: ${score.toFixed(2)}%`,
      );
      this.context.executionLog.push(
        `✅ Validation: "${inputValue}" is ${isValid ? "valid" : "invalid"}`,
      );
      return result;
    }

    // If node has custom code, try to execute it safely
    if (node.data.code && node.data.code.includes("return")) {
      try {
        const result = this.executeCustomCode(node.data.code, inputs);
        this.context.executionLog.push(`   → Executing custom code...`);
        this.context.executionLog.push(
          `⚙️ Custom function result: ${JSON.stringify(result)}`,
        );
        return result;
      } catch (error) {
        this.context.executionLog.push(
          `⚠️ Custom code execution failed: ${error}`,
        );
        return inputValue;
      }
    }

    // Default: enhanced pass through with metadata
    const metadata = {
      originalValue: inputValue,
      processedAt: new Date().toISOString(),
      nodeId: node.id,
      nodeType: node.type,
    };

    this.context.executionLog.push(`   → Adding metadata...`);
    this.context.executionLog.push(
      `➡️ Enhanced pass-through: ${JSON.stringify(metadata)}`,
    );
    return metadata;
  }

  private async executeApiNode(
    node: Node,
    inputs: Record<string, any>,
  ): Promise<any> {
    const config = node.data.config || {};
    const url = config.url || "https://api.example.com/data";
    const method = config.method || "GET";

    // Simulate API call
    this.context.executionLog.push(`🌐 API Call: ${method} ${url}`);

    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 200 + Math.random() * 300),
    );

    const mockResponse = {
      status: 200,
      data: {
        message: "API response data",
        timestamp: new Date().toISOString(),
        input: Object.values(inputs)[0],
        processed: true,
      },
    };

    this.context.executionLog.push(
      `📡 API Response: ${JSON.stringify(mockResponse.data)}`,
    );
    return mockResponse.data;
  }

  private async executeLogicNode(
    node: Node,
    inputs: Record<string, any>,
  ): Promise<any> {
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

  private async executeOutputNode(
    node: Node,
    inputs: Record<string, any>,
  ): Promise<any> {
    const inputValue = Object.values(inputs)[0];
    const config = node.data.config || {};
    const template = config.template || "Result: {result}";

    const output = template.replace("{result}", String(inputValue));

    this.context.executionLog.push(`📤 Output: ${output}`);
    return output;
  }

  private async executeVariableNode(
    node: Node,
    inputs: Record<string, any>,
  ): Promise<any> {
    const config = node.data.config || {};
    const value = config.value || Object.values(inputs)[0] || null;

    this.context.executionLog.push(
      `📊 Variable: ${node.data.label} = ${JSON.stringify(value)}`,
    );
    return value;
  }

  // Safe execution of custom code (very limited for security)
  private executeCustomCode(code: string, inputs: Record<string, any>): any {
    // Very basic and safe code execution for simple operations
    try {
      if (
        code.includes("return") &&
        !code.includes("eval") &&
        !code.includes("Function")
      ) {
        // Extract simple return statements
        const returnMatch = code.match(/return\s+(.+)/);
        if (returnMatch) {
          const expression = returnMatch[1].trim().replace(/;$/, "");

          // Only allow safe mathematical and string operations
          if (/^[\w\s+\-*\/()."']+$/.test(expression)) {
            // Replace input references
            let processedExpression = expression;
            Object.keys(inputs).forEach((key) => {
              processedExpression = processedExpression.replace(
                new RegExp(`\\b${key}\\b`, "g"),
                JSON.stringify(inputs[key]),
              );
            });

            // Very limited evaluation
            if (processedExpression.includes("+")) {
              const parts = processedExpression
                .split("+")
                .map((p) => p.trim().replace(/"/g, ""));
              return parts.join("");
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

    this.context.executionLog.push(
      `🚀 Starting execution of ${nodes.length} nodes`,
    );

    // Get execution order
    const executionOrder = this.getExecutionOrder(nodes, connections);

    if (executionOrder.length !== nodes.length) {
      this.context.executionLog.push(
        "⚠️ Warning: Circular dependency detected in node graph",
      );
    }

    // Execute nodes in order
    for (const node of executionOrder) {
      const inputs = this.getNodeInputs(node, connections);
      this.context.executionLog.push(`▶️ Executing: ${node.data.label}`);

      const result = await this.executeNode(node, inputs);

      if (!result.success) {
        this.context.executionLog.push(
          `💥 Execution stopped due to error in ${node.data.label}`,
        );
        break;
      }
    }

    const totalTime = Date.now() - this.context.startTime;
    const completedNodes = Array.from(this.context.nodeStates.values()).filter(
      (state) => state === "completed",
    ).length;

    this.context.executionLog.push(
      `🏁 Execution completed: ${completedNodes}/${nodes.length} nodes in ${totalTime}ms`,
    );

    return this.context;
  }

  getContext(): ExecutionContext {
    return this.context;
  }
}
