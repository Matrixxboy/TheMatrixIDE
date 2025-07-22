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
    tags: ["basic", "print", "hello"]
  },
  {
    id: "py-function-def",
    name: "Function Definition",
    description: "Basic function with parameters and return",
    category: "Functions",
    language: "python",
    code: `def ${1:function_name}(${2:param1}, ${3:param2}):
    """${4:Function description}"""
    ${5:# Function body}
    return ${6:result}`,
    placeholders: ["function_name", "param1", "param2", "Function description", "# Function body", "result"],
    tags: ["function", "def", "return"]
  },
  {
    id: "py-class-def",
    name: "Class Definition",
    description: "Basic class with constructor",
    category: "Classes",
    language: "python",
    code: `class ${1:ClassName}:
    """${2:Class description}"""
    
    def __init__(self, ${3:param}):
        self.${4:attribute} = ${3:param}
    
    def ${5:method_name}(self):
        """${6:Method description}"""
        return self.${4:attribute}`,
    placeholders: ["ClassName", "Class description", "param", "attribute", "method_name", "Method description"],
    tags: ["class", "init", "method"]
  },
  {
    id: "py-for-loop",
    name: "For Loop",
    description: "For loop with range or iterable",
    category: "Loops",
    language: "python",
    code: `for ${1:item} in ${2:iterable}:
    ${3:# Loop body}
    print(${1:item})`,
    placeholders: ["item", "iterable", "# Loop body"],
    tags: ["loop", "for", "iteration"]
  },
  {
    id: "py-while-loop",
    name: "While Loop",
    description: "While loop with condition",
    category: "Loops",
    language: "python",
    code: `${1:counter} = 0
while ${1:counter} < ${2:limit}:
    ${3:# Loop body}
    ${1:counter} += 1`,
    placeholders: ["counter", "limit", "# Loop body"],
    tags: ["loop", "while", "condition"]
  },
  {
    id: "py-if-else",
    name: "If-Else Statement",
    description: "Conditional statement with if-elif-else",
    category: "Conditionals",
    language: "python",
    code: `if ${1:condition}:
    ${2:# If block}
elif ${3:another_condition}:
    ${4:# Elif block}
else:
    ${5:# Else block}`,
    placeholders: ["condition", "# If block", "another_condition", "# Elif block", "# Else block"],
    tags: ["conditional", "if", "else"]
  },
  {
    id: "py-try-except",
    name: "Try-Except Block",
    description: "Error handling with try-except",
    category: "Error Handling",
    language: "python",
    code: `try:
    ${1:# Code that might raise an exception}
except ${2:ExceptionType} as e:
    ${3:# Handle exception}
    print(f"Error: {e}")
finally:
    ${4:# Cleanup code}`,
    placeholders: ["# Code that might raise an exception", "ExceptionType", "# Handle exception", "# Cleanup code"],
    tags: ["exception", "try", "except", "error"]
  },
  {
    id: "py-list-comprehension",
    name: "List Comprehension",
    description: "List comprehension with condition",
    category: "Data Structures",
    language: "python",
    code: `${1:result} = [${2:expression} for ${3:item} in ${4:iterable} if ${5:condition}]`,
    placeholders: ["result", "expression", "item", "iterable", "condition"],
    tags: ["list", "comprehension", "filter"]
  },
  {
    id: "py-dict-comprehension",
    name: "Dict Comprehension",
    description: "Dictionary comprehension",
    category: "Data Structures",
    language: "python",
    code: `${1:result} = {${2:key_expr}: ${3:value_expr} for ${4:item} in ${5:iterable}}`,
    placeholders: ["result", "key_expr", "value_expr", "item", "iterable"],
    tags: ["dict", "dictionary", "comprehension"]
  },
  {
    id: "py-file-read",
    name: "File Reading",
    description: "Read file with context manager",
    category: "File I/O",
    language: "python",
    code: `with open('${1:filename}', 'r') as file:
    ${2:content} = file.read()
    ${3:# Process content}`,
    placeholders: ["filename", "content", "# Process content"],
    tags: ["file", "read", "io", "with"]
  },
  {
    id: "py-file-write",
    name: "File Writing",
    description: "Write to file with context manager",
    category: "File I/O",
    language: "python",
    code: `with open('${1:filename}', 'w') as file:
    file.write(${2:content})`,
    placeholders: ["filename", "content"],
    tags: ["file", "write", "io", "with"]
  },
  {
    id: "py-main-guard",
    name: "Main Guard",
    description: "Main execution guard",
    category: "Structure",
    language: "python",
    code: `if __name__ == "__main__":
    ${1:main()}`,
    placeholders: ["main()"],
    tags: ["main", "guard", "execution"]
  },
  {
    id: "py-import-statements",
    name: "Import Statements",
    description: "Common import patterns",
    category: "Imports",
    language: "python",
    code: `import ${1:module}
from ${2:module} import ${3:function}
from ${4:module} import ${5:class} as ${6:alias}`,
    placeholders: ["module", "module", "function", "module", "class", "alias"],
    tags: ["import", "from", "module"]
  },
  
  // Matrix IDE Specific Snippets
  {
    id: "matrix-input-node",
    name: "Matrix Input Node",
    description: "Template for Matrix IDE input node",
    category: "Matrix IDE",
    language: "python",
    code: `def ${1:input_node}():
    """Matrix IDE input node"""
    user_input = input("${2:Enter value}: ")
    return user_input`,
    placeholders: ["input_node", "Enter value"],
    tags: ["matrix", "input", "node"]
  },
  {
    id: "matrix-process-node",
    name: "Matrix Process Node",
    description: "Template for Matrix IDE processing node",
    category: "Matrix IDE",
    language: "python",
    code: `def ${1:process_node}(data):
    """Matrix IDE processing node"""
    # Process the input data
    processed = ${2:data.strip().lower()}
    return processed`,
    placeholders: ["process_node", "data.strip().lower()"],
    tags: ["matrix", "process", "node"]
  },
  {
    id: "matrix-output-node",
    name: "Matrix Output Node",
    description: "Template for Matrix IDE output node",
    category: "Matrix IDE",
    language: "python",
    code: `def ${1:output_node}(result):
    """Matrix IDE output node"""
    print(f"${2:Result}: {result}")
    return result`,
    placeholders: ["output_node", "Result"],
    tags: ["matrix", "output", "node"]
  },
  {
    id: "matrix-ai-node",
    name: "Matrix AI Node",
    description: "Template for Matrix IDE AI processing node",
    category: "Matrix IDE",
    language: "python",
    code: `def ${1:ai_process_node}(text):
    """Matrix IDE AI processing node"""
    # Simulate AI processing
    enhanced = f"AI_ENHANCED: {text}"
    return enhanced`,
    placeholders: ["ai_process_node"],
    tags: ["matrix", "ai", "node", "enhance"]
  },
  
  // JavaScript Snippets
  {
    id: "js-function",
    name: "Function Declaration",
    description: "JavaScript function declaration",
    category: "Functions",
    language: "javascript",
    code: `function ${1:functionName}(${2:params}) {
    ${3:// Function body}
    return ${4:result};
}`,
    placeholders: ["functionName", "params", "// Function body", "result"],
    tags: ["function", "declaration", "js"]
  },
  {
    id: "js-arrow-function",
    name: "Arrow Function",
    description: "ES6 arrow function",
    category: "Functions",
    language: "javascript",
    code: `const ${1:functionName} = (${2:params}) => {
    ${3:// Function body}
    return ${4:result};
};`,
    placeholders: ["functionName", "params", "// Function body", "result"],
    tags: ["arrow", "function", "es6", "const"]
  },
  {
    id: "js-console-log",
    name: "Console Log",
    description: "Console log statement",
    category: "Basic",
    language: "javascript",
    code: `console.log(${1:"Hello, World!"});`,
    placeholders: ['"Hello, World!"'],
    tags: ["console", "log", "debug"]
  }
];

export const getSnippetsByLanguage = (language: string): CodeSnippet[] => {
  return codeSnippets.filter(snippet => 
    snippet.language === language || snippet.language === "all"
  );
};

export const getSnippetsByCategory = (category: string): CodeSnippet[] => {
  return codeSnippets.filter(snippet => snippet.category === category);
};

export const searchSnippets = (query: string): CodeSnippet[] => {
  const lowercaseQuery = query.toLowerCase();
  return codeSnippets.filter(snippet =>
    snippet.name.toLowerCase().includes(lowercaseQuery) ||
    snippet.description.toLowerCase().includes(lowercaseQuery) ||
    snippet.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getAllCategories = (): string[] => {
  const categories = new Set(codeSnippets.map(snippet => snippet.category));
  return Array.from(categories).sort();
};

export const insertSnippet = (snippet: CodeSnippet, replacePlaceholders: boolean = true): string => {
  if (!replacePlaceholders || !snippet.placeholders) {
    return snippet.code;
  }
  
  let code = snippet.code;
  snippet.placeholders.forEach((placeholder, index) => {
    const placeholderPattern = new RegExp(`\\$\\{${index + 1}:([^}]+)\\}`, 'g');
    code = code.replace(placeholderPattern, placeholder);
  });
  
  return code;
};