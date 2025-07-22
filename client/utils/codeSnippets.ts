export interface CodeSnippet {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  code: string;
  placeholders?: string[];
  tags: string[];
}

export const codeSnippets: CodeSnippet[] = [
  // Python Basic Patterns
  {
    id: "py-hello-world",
    name: "Hello World",
    description: "Basic Hello World program",
    category: "Basic",
    language: "python",
    code: `print("Hello, World!")`,
    tags: ["basic", "print", "hello"],
  },
  {
    id: "py-function-def",
    name: "Function Definition",
    description: "Basic function with parameters and return",
    category: "Functions",
    language: "python",
    code: `def function_name(param1, param2):
    """Function description"""
    # Function body
    return result`,
    placeholders: [
      "function_name",
      "param1",
      "param2",
      "Function description",
      "Function body",
      "result",
    ],
    tags: ["function", "def", "return"],
  },
  {
    id: "py-class-def",
    name: "Class Definition",
    description: "Basic class with constructor",
    category: "Classes",
    language: "python",
    code: `class ClassName:
    """Class description"""
    
    def __init__(self, param):
        self.attribute = param
    
    def method_name(self):
        """Method description"""
        return self.attribute`,
    placeholders: [
      "ClassName",
      "Class description",
      "param",
      "attribute",
      "method_name",
      "Method description",
    ],
    tags: ["class", "init", "method"],
  },
  {
    id: "py-for-loop",
    name: "For Loop",
    description: "For loop with range or iterable",
    category: "Loops",
    language: "python",
    code: `for item in iterable:
    # Loop body
    print(item)`,
    placeholders: ["item", "iterable", "Loop body"],
    tags: ["loop", "for", "iteration"],
  },
  {
    id: "py-while-loop",
    name: "While Loop",
    description: "While loop with condition",
    category: "Loops",
    language: "python",
    code: `counter = 0
while counter < limit:
    # Loop body
    counter += 1`,
    placeholders: ["counter", "limit", "Loop body"],
    tags: ["loop", "while", "condition"],
  },
  {
    id: "py-if-else",
    name: "If-Else Statement",
    description: "Conditional statement with if-elif-else",
    category: "Conditionals",
    language: "python",
    code: `if condition:
    # If block
    pass
elif another_condition:
    # Elif block
    pass
else:
    # Else block
    pass`,
    placeholders: [
      "condition",
      "If block",
      "another_condition",
      "Elif block",
      "Else block",
    ],
    tags: ["conditional", "if", "else"],
  },
  {
    id: "py-try-except",
    name: "Try-Except Block",
    description: "Error handling with try-except",
    category: "Error Handling",
    language: "python",
    code: `try:
    # Code that might raise an exception
    pass
except Exception as e:
    # Handle exception
    print(f"Error: {e}")
finally:
    # Cleanup code
    pass`,
    placeholders: [
      "Code that might raise an exception",
      "Exception",
      "Handle exception",
      "Cleanup code",
    ],
    tags: ["exception", "try", "except", "error"],
  },
  {
    id: "py-list-comprehension",
    name: "List Comprehension",
    description: "List comprehension with condition",
    category: "Data Structures",
    language: "python",
    code: `result = [expression for item in iterable if condition]`,
    placeholders: ["result", "expression", "item", "iterable", "condition"],
    tags: ["list", "comprehension", "filter"],
  },
  {
    id: "py-dict-comprehension",
    name: "Dict Comprehension",
    description: "Dictionary comprehension",
    category: "Data Structures",
    language: "python",
    code: `result = {key_expr: value_expr for item in iterable}`,
    placeholders: ["result", "key_expr", "value_expr", "item", "iterable"],
    tags: ["dict", "dictionary", "comprehension"],
  },
  {
    id: "py-file-read",
    name: "File Reading",
    description: "Read file with context manager",
    category: "File I/O",
    language: "python",
    code: `with open('filename.txt', 'r') as file:
    content = file.read()
    # Process content`,
    placeholders: ["filename.txt", "content", "Process content"],
    tags: ["file", "read", "io", "with"],
  },
  {
    id: "py-file-write",
    name: "File Writing",
    description: "Write to file with context manager",
    category: "File I/O",
    language: "python",
    code: `with open('filename.txt', 'w') as file:
    file.write(content)`,
    placeholders: ["filename.txt", "content"],
    tags: ["file", "write", "io", "with"],
  },
  {
    id: "py-main-guard",
    name: "Main Guard",
    description: "Main execution guard",
    category: "Structure",
    language: "python",
    code: `if __name__ == "__main__":
    main()`,
    placeholders: ["main()"],
    tags: ["main", "guard", "execution"],
  },
  {
    id: "py-import-statements",
    name: "Import Statements",
    description: "Common import patterns",
    category: "Imports",
    language: "python",
    code: `import module_name
from module_name import function_name
from module_name import ClassName as Alias`,
    placeholders: ["module_name", "function_name", "ClassName", "Alias"],
    tags: ["import", "from", "module"],
  },

  // Matrix IDE Specific Snippets
  {
    id: "matrix-input-node",
    name: "Matrix Input Node",
    description: "Template for Matrix IDE input node",
    category: "Matrix IDE",
    language: "python",
    code: `def input_node():
    """Matrix IDE input node"""
    user_input = input("Enter value: ")
    return user_input`,
    placeholders: ["input_node", "Enter value"],
    tags: ["matrix", "input", "node"],
  },
  {
    id: "matrix-process-node",
    name: "Matrix Process Node",
    description: "Template for Matrix IDE processing node",
    category: "Matrix IDE",
    language: "python",
    code: `def process_node(data):
    """Matrix IDE processing node"""
    # Process the input data
    processed = data.strip().lower()
    return processed`,
    placeholders: ["process_node", "data.strip().lower()"],
    tags: ["matrix", "process", "node"],
  },
  {
    id: "matrix-output-node",
    name: "Matrix Output Node",
    description: "Template for Matrix IDE output node",
    category: "Matrix IDE",
    language: "python",
    code: `def output_node(result):
    """Matrix IDE output node"""
    print(f"Result: {result}")
    return result`,
    placeholders: ["output_node", "Result"],
    tags: ["matrix", "output", "node"],
  },
  {
    id: "matrix-ai-node",
    name: "Matrix AI Node",
    description: "Template for Matrix IDE AI processing node",
    category: "Matrix IDE",
    language: "python",
    code: `def ai_process_node(text):
    """Matrix IDE AI processing node"""
    # Simulate AI processing
    enhanced = f"AI_ENHANCED: {text}"
    return enhanced`,
    placeholders: ["ai_process_node"],
    tags: ["matrix", "ai", "node", "enhance"],
  },
  {
    id: "matrix-full-pipeline",
    name: "Matrix Full Pipeline",
    description: "Complete Matrix IDE pipeline template",
    category: "Matrix IDE",
    language: "python",
    code: `# Matrix IDE Complete Pipeline

def input_node():
    """Get user input"""
    return input("Enter your message: ")

def process_node(data):
    """Process the data"""
    return data.strip().lower()

def ai_enhance_node(text):
    """Enhance with AI"""
    return f"AI_ENHANCED: {text}"

def output_node(result):
    """Display result"""
    print(f"Final Result: {result}")
    return result

# Execute pipeline
if __name__ == "__main__":
    user_data = input_node()
    processed = process_node(user_data)
    enhanced = ai_enhance_node(processed)
    output_node(enhanced)`,
    tags: ["matrix", "pipeline", "complete", "workflow"],
  },

  // JavaScript Snippets
  {
    id: "js-function",
    name: "Function Declaration",
    description: "JavaScript function declaration",
    category: "Functions",
    language: "javascript",
    code: `function functionName(params) {
    // Function body
    return result;
}`,
    placeholders: ["functionName", "params", "Function body", "result"],
    tags: ["function", "declaration", "js"],
  },
  {
    id: "js-arrow-function",
    name: "Arrow Function",
    description: "ES6 arrow function",
    category: "Functions",
    language: "javascript",
    code: `const functionName = (params) => {
    // Function body
    return result;
};`,
    placeholders: ["functionName", "params", "Function body", "result"],
    tags: ["arrow", "function", "es6", "const"],
  },
  {
    id: "js-console-log",
    name: "Console Log",
    description: "Console log statement",
    category: "Basic",
    language: "javascript",
    code: `console.log("Hello, World!");`,
    placeholders: ['"Hello, World!"'],
    tags: ["console", "log", "debug"],
  },
];

export const getSnippetsByLanguage = (language: string): CodeSnippet[] => {
  return codeSnippets.filter(
    (snippet) => snippet.language === language || snippet.language === "all",
  );
};

export const getSnippetsByCategory = (category: string): CodeSnippet[] => {
  return codeSnippets.filter((snippet) => snippet.category === category);
};

export const searchSnippets = (query: string): CodeSnippet[] => {
  const lowercaseQuery = query.toLowerCase();
  return codeSnippets.filter(
    (snippet) =>
      snippet.name.toLowerCase().includes(lowercaseQuery) ||
      snippet.description.toLowerCase().includes(lowercaseQuery) ||
      snippet.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
};

export const getAllCategories = (): string[] => {
  const categories = new Set(codeSnippets.map((snippet) => snippet.category));
  return Array.from(categories).sort();
};

export const insertSnippet = (snippet: CodeSnippet): string => {
  return snippet.code;
};
