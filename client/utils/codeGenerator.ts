import { Node, Connection } from '@/contexts/AppContext';

export interface CodeGenerationResult {
  python: string;
  javascript: string;
  cpp: string;
}

// Topological sort for node execution order
function topologicalSort(nodes: Node[], connections: Connection[]): Node[] {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();
  
  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  });
  
  // Build adjacency list and calculate in-degrees
  connections.forEach(conn => {
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
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      result.push(node);
    }
    
    adjList.get(nodeId)?.forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  return result;
}

// Generate variable names based on connections
function generateVariableMapping(nodes: Node[], connections: Connection[]): Map<string, string> {
  const varMap = new Map<string, string>();
  
  connections.forEach(conn => {
    const sourceNode = nodes.find(n => n.id === conn.source);
    const targetNode = nodes.find(n => n.id === conn.target);
    
    if (sourceNode && targetNode) {
      const varName = `${sourceNode.data.label.toLowerCase().replace(/\s+/g, '_')}_${conn.sourceOutput}`;
      varMap.set(`${conn.source}_${conn.sourceOutput}`, varName);
    }
  });
  
  return varMap;
}

// Python code generation
function generatePython(nodes: Node[], connections: Connection[]): string {
  const sortedNodes = topologicalSort(nodes, connections);
  const varMap = generateVariableMapping(nodes, connections);
  const lines: string[] = [];
  
  lines.push('# Matrix IDE Generated Python Code');
  lines.push('import sys');
  lines.push('import json');
  lines.push('from typing import Any, Dict, List');
  lines.push('');
  
  // Generate helper functions
  lines.push('def process_data(data: Any) -> Any:');
  lines.push('    """Transform and process input data"""');
  lines.push('    if isinstance(data, str):');
  lines.push('        return data.strip().lower()');
  lines.push('    return data');
  lines.push('');
  
  lines.push('def validate_input(data: Any) -> Any:');
  lines.push('    """Validate processed data"""');
  lines.push('    if not data:');
  lines.push('        raise ValueError("Empty input detected")');
  lines.push('    return data');
  lines.push('');
  
  lines.push('def ai_enhance(data: Any) -> Any:');
  lines.push('    """AI processing enhancement"""');
  lines.push('    return f"AI_ENHANCED: {data}"');
  lines.push('');
  
  lines.push('def main():');
  lines.push('    """Main execution function"""');
  
  sortedNodes.forEach(node => {
    switch (node.type) {
      case 'input':
        if (node.data.label.toLowerCase().includes('file')) {
          lines.push('    # File input node');
          lines.push(`    with open('input.txt', 'r') as f:`);
          lines.push(`        ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_value = f.read()`);
        } else {
          lines.push('    # User input node');
          lines.push(`    ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_value = input("${node.data.label}: ")`);
        }
        break;
        
      case 'function':
        const inputVars = connections
          .filter(conn => conn.target === node.id)
          .map(conn => varMap.get(`${conn.source}_${conn.sourceOutput}`) || 'data')
          .join(', ');
        
        lines.push(`    # ${node.data.label} node`);
        if (node.data.label.toLowerCase().includes('process')) {
          lines.push(`    ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = process_data(${inputVars || 'None'})`);
        } else if (node.data.label.toLowerCase().includes('validate')) {
          lines.push(`    ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = validate_input(${inputVars || 'None'})`);
        } else if (node.data.label.toLowerCase().includes('ai')) {
          lines.push(`    ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = ai_enhance(${inputVars || 'None'})`);
        } else {
          lines.push(`    ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = ${inputVars || 'None'}`);
        }
        break;
        
      case 'api':
        lines.push(`    # ${node.data.label} API call`);
        lines.push('    import requests');
        lines.push(`    response = requests.get('https://api.example.com/data')`);
        lines.push(`    ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = response.json()`);
        break;
        
      case 'logic':
        const conditionVar = connections
          .filter(conn => conn.target === node.id)
          .map(conn => varMap.get(`${conn.source}_${conn.sourceOutput}`) || 'data')[0];
        
        lines.push(`    # ${node.data.label} logic`);
        lines.push(`    if ${conditionVar || 'True'}:`);
        lines.push(`        ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = "condition_true"`);
        lines.push('    else:');
        lines.push(`        ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = "condition_false"`);
        break;
        
      case 'output':
        const outputVars = connections
          .filter(conn => conn.target === node.id)
          .map(conn => varMap.get(`${conn.source}_${conn.sourceOutput}`) || 'result')
          .join(', ');
        
        if (node.data.label.toLowerCase().includes('file')) {
          lines.push(`    # ${node.data.label} to file`);
          lines.push(`    with open('output.txt', 'w') as f:`);
          lines.push(`        f.write(str(${outputVars || 'result'}))`);
        } else {
          lines.push(`    # ${node.data.label}`);
          lines.push(`    print(f"${node.data.label}: {${outputVars || 'result'}}")`);
        }
        break;
    }
    lines.push('');
  });
  
  lines.push('    return "Execution completed successfully"');
  lines.push('');
  lines.push('if __name__ == "__main__":');
  lines.push('    try:');
  lines.push('        result = main()');
  lines.push('        print(result)');
  lines.push('    except Exception as e:');
  lines.push('        print(f"Error: {e}")');
  lines.push('        sys.exit(1)');
  
  return lines.join('\n');
}

// JavaScript code generation
function generateJavaScript(nodes: Node[], connections: Connection[]): string {
  const sortedNodes = topologicalSort(nodes, connections);
  const lines: string[] = [];
  
  lines.push('// Matrix IDE Generated JavaScript Code');
  lines.push('const fs = require("fs");');
  lines.push('const readline = require("readline");');
  lines.push('');
  
  lines.push('class MatrixProcessor {');
  lines.push('  constructor() {');
  lines.push('    this.rl = readline.createInterface({');
  lines.push('      input: process.stdin,');
  lines.push('      output: process.stdout');
  lines.push('    });');
  lines.push('  }');
  lines.push('');
  
  lines.push('  async processData(data) {');
  lines.push('    if (typeof data === "string") {');
  lines.push('      return data.trim().toLowerCase();');
  lines.push('    }');
  lines.push('    return data;');
  lines.push('  }');
  lines.push('');
  
  lines.push('  validateInput(data) {');
  lines.push('    if (!data) {');
  lines.push('      throw new Error("Empty input detected");');
  lines.push('    }');
  lines.push('    return data;');
  lines.push('  }');
  lines.push('');
  
  lines.push('  aiEnhance(data) {');
  lines.push('    return `AI_ENHANCED: ${data}`;');
  lines.push('  }');
  lines.push('');
  
  lines.push('  async main() {');
  
  sortedNodes.forEach(node => {
    switch (node.type) {
      case 'input':
        lines.push(`    // ${node.data.label} node`);
        lines.push(`    const ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_value = await this.getUserInput("${node.data.label}: ");`);
        break;
        
      case 'function':
        lines.push(`    // ${node.data.label} node`);
        if (node.data.label.toLowerCase().includes('process')) {
          lines.push(`    const ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = await this.processData(user_input_value);`);
        } else {
          lines.push(`    const ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = user_input_value;`);
        }
        break;
        
      case 'output':
        lines.push(`    // ${node.data.label}`);
        lines.push(`    console.log(\`${node.data.label}: \${process_data_result}\`);`);
        break;
    }
  });
  
  lines.push('    this.rl.close();');
  lines.push('    return "Execution completed successfully";');
  lines.push('  }');
  lines.push('');
  
  lines.push('  getUserInput(prompt) {');
  lines.push('    return new Promise((resolve) => {');
  lines.push('      this.rl.question(prompt, (answer) => {');
  lines.push('        resolve(answer);');
  lines.push('      });');
  lines.push('    });');
  lines.push('  }');
  lines.push('}');
  lines.push('');
  
  lines.push('// Execute the processor');
  lines.push('const processor = new MatrixProcessor();');
  lines.push('processor.main()');
  lines.push('  .then(result => console.log(result))');
  lines.push('  .catch(error => console.error("Error:", error));');
  
  return lines.join('\n');
}

// C++ code generation
function generateCpp(nodes: Node[], connections: Connection[]): string {
  const sortedNodes = topologicalSort(nodes, connections);
  const lines: string[] = [];
  
  lines.push('// Matrix IDE Generated C++ Code');
  lines.push('#include <iostream>');
  lines.push('#include <string>');
  lines.push('#include <fstream>');
  lines.push('#include <algorithm>');
  lines.push('#include <stdexcept>');
  lines.push('');
  
  lines.push('class MatrixProcessor {');
  lines.push('private:');
  lines.push('  std::string processData(const std::string& data) {');
  lines.push('    std::string result = data;');
  lines.push('    std::transform(result.begin(), result.end(), result.begin(), ::tolower);');
  lines.push('    return result;');
  lines.push('  }');
  lines.push('');
  
  lines.push('  std::string validateInput(const std::string& data) {');
  lines.push('    if (data.empty()) {');
  lines.push('      throw std::runtime_error("Empty input detected");');
  lines.push('    }');
  lines.push('    return data;');
  lines.push('  }');
  lines.push('');
  
  lines.push('  std::string aiEnhance(const std::string& data) {');
  lines.push('    return "AI_ENHANCED: " + data;');
  lines.push('  }');
  lines.push('');
  
  lines.push('public:');
  lines.push('  std::string main() {');
  
  sortedNodes.forEach(node => {
    switch (node.type) {
      case 'input':
        lines.push(`    // ${node.data.label} node`);
        lines.push(`    std::cout << "${node.data.label}: ";`);
        lines.push(`    std::string ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_value;`);
        lines.push(`    std::getline(std::cin, ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_value);`);
        break;
        
      case 'function':
        lines.push(`    // ${node.data.label} node`);
        if (node.data.label.toLowerCase().includes('process')) {
          lines.push(`    std::string ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = processData(user_input_value);`);
        } else {
          lines.push(`    std::string ${node.data.label.toLowerCase().replace(/\s+/g, '_')}_result = user_input_value;`);
        }
        break;
        
      case 'output':
        lines.push(`    // ${node.data.label}`);
        lines.push(`    std::cout << "${node.data.label}: " << process_data_result << std::endl;`);
        break;
    }
  });
  
  lines.push('    return "Execution completed successfully";');
  lines.push('  }');
  lines.push('};');
  lines.push('');
  
  lines.push('int main() {');
  lines.push('  try {');
  lines.push('    MatrixProcessor processor;');
  lines.push('    std::string result = processor.main();');
  lines.push('    std::cout << result << std::endl;');
  lines.push('  } catch (const std::exception& e) {');
  lines.push('    std::cerr << "Error: " << e.what() << std::endl;');
  lines.push('    return 1;');
  lines.push('  }');
  lines.push('  return 0;');
  lines.push('}');
  
  return lines.join('\n');
}

// Main generation function
export function generateCode(nodes: Node[], connections: Connection[]): CodeGenerationResult {
  return {
    python: generatePython(nodes, connections),
    javascript: generateJavaScript(nodes, connections),
    cpp: generateCpp(nodes, connections)
  };
}

// Generate code for specific language
export function generateCodeForLanguage(
  nodes: Node[], 
  connections: Connection[], 
  language: string
): string {
  const result = generateCode(nodes, connections);
  switch (language.toLowerCase()) {
    case 'python':
      return result.python;
    case 'javascript':
    case 'js':
      return result.javascript;
    case 'cpp':
    case 'c++':
      return result.cpp;
    default:
      return result.python;
  }
}
