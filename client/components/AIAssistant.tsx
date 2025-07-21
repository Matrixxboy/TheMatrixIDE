import { useState, useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  RefreshCw, 
  Zap, 
  Bug, 
  Code, 
  MessageSquare,
  Lightbulb,
  Shield,
  Play,
  Cpu,
  Brain
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  category?: 'debug' | 'generate' | 'chat' | 'optimize';
}

export default function AIAssistant() {
  const { state, dispatch } = useApp();
  const { aiMessages, aiProcessing, activeTab, nodes, connections, generatedCode, settings } = state;
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const aiSuggestions = [
    { icon: Code, text: 'Generate code from current nodes', category: 'generate' },
    { icon: Bug, text: 'Debug the node connection error', category: 'debug' },
    { icon: Zap, text: 'Optimize the data processing pipeline', category: 'optimize' },
    { icon: Lightbulb, text: 'Suggest improvements for the algorithm', category: 'chat' },
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    dispatch({
      type: 'ADD_AI_MESSAGE',
      payload: { type: 'user', content: inputValue, category: 'chat' }
    });

    const userInput = inputValue;
    setInputValue('');
    dispatch({ type: 'SET_AI_PROCESSING', payload: true });

    // Simulate AI processing with realistic delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(userInput, nodes, connections, generatedCode, settings.language);
      dispatch({
        type: 'ADD_AI_MESSAGE',
        payload: { type: 'ai', content: aiResponse, category: 'chat' }
      });
      dispatch({ type: 'SET_AI_PROCESSING', payload: false });
    }, 1000 + Math.random() * 1500);
  };

  const generateAIResponse = (input: string, nodes: any[], connections: any[], code: string, language: string): string => {
    const lowerInput = input.toLowerCase();

    // Code analysis responses
    if (lowerInput.includes('analyze') || lowerInput.includes('code')) {
      return `I've analyzed your current ${language} code with ${nodes.length} nodes and ${connections.length} connections. Your pipeline looks well-structured. The generated code includes proper error handling and follows ${language} best practices. Would you like me to suggest any optimizations?`;
    }

    // Node-specific responses
    if (lowerInput.includes('node') || lowerInput.includes('connect')) {
      const inputNodes = nodes.filter(n => n.type === 'input').length;
      const outputNodes = nodes.filter(n => n.type === 'output').length;
      const functionNodes = nodes.filter(n => n.type === 'function').length;

      return `Your current setup has ${inputNodes} input node(s), ${functionNodes} processing node(s), and ${outputNodes} output node(s). The connections create a ${connections.length > 0 ? 'valid' : 'incomplete'} data flow. ${connections.length === 0 ? 'Try connecting the output of one node to the input of another to create a processing pipeline.' : 'The data flows properly through your pipeline.'}`;
    }

    // Debug responses
    if (lowerInput.includes('debug') || lowerInput.includes('error') || lowerInput.includes('fix')) {
      if (connections.length === 0) {
        return "I found a potential issue: Your nodes aren't connected yet. Connect the output ports (gold circles) to input ports (purple circles) to create a data flow. This will enable proper code generation.";
      }
      return "I've scanned your pipeline for common issues. Everything looks good! Your nodes are properly connected and the generated code should execute without errors. If you're experiencing issues, try checking the data types between connected nodes.";
    }

    // Optimization responses
    if (lowerInput.includes('optimize') || lowerInput.includes('improve') || lowerInput.includes('performance')) {
      const suggestions = [
        "Consider combining sequential processing nodes to reduce overhead.",
        "Add error handling nodes between input and processing stages.",
        "Use async processing for API nodes to improve performance.",
        "Add validation nodes to ensure data integrity."
      ];
      return `Here are some optimization suggestions for your ${language} pipeline:\n\n• ${suggestions.join('\n• ')}\n\nWould you like me to help implement any of these improvements?`;
    }

    // Language-specific responses
    if (lowerInput.includes('python')) {
      return "Python is excellent for data processing pipelines! Your current code uses modern Python features like type hints and error handling. Consider using asyncio for better performance with multiple data sources.";
    }

    if (lowerInput.includes('javascript')) {
      return "JavaScript works great for real-time processing! I recommend using async/await patterns for better handling of asynchronous operations in your pipeline.";
    }

    // General helpful responses
    const generalResponses = [
      `I can help you with your ${language} pipeline! Currently, you have ${nodes.length} nodes configured. What specific aspect would you like to improve?`,
      "I'm analyzing your visual programming setup. The node-based approach makes it easy to understand data flow. What would you like to work on next?",
      "Your Matrix IDE setup looks good! I can help with code optimization, debugging, or adding new functionality. What's your goal?",
      "As your local AI assistant, I can help optimize your code, suggest improvements, or explain how different nodes work together. What interests you most?"
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  const handleSuggestionClick = (suggestion: string, category: string) => {
    setInputValue(suggestion);
    dispatch({ type: 'SET_ACTIVE_TAB', payload: category === 'debug' ? 'debug' : category === 'generate' ? 'generate' : 'chat' });
  };

  const renderMessage = (message: any) => (
    <div key={message.id} className={`flex gap-3 mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.type === 'ai' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-matrix-purple-500 to-matrix-purple-700 flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-lg p-3 ${
        message.type === 'user' 
          ? 'bg-matrix-gold-500/20 border border-matrix-gold-400/30 text-matrix-gold-200' 
          : 'glass-panel text-matrix-purple-200'
      }`}>
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs opacity-60 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      {message.type === 'user' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-matrix-dark">U</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* AI Assistant Header */}
      <div className="h-12 border-b border-matrix-purple-600/30 flex items-center justify-between px-4">
        <Tabs value={activeTab} onValueChange={(value) => dispatch({ type: 'SET_ACTIVE_TAB', payload: value })} className="flex-1">
          <TabsList className="bg-matrix-purple-800/30 border border-matrix-purple-600/30">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="debug" 
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <Bug className="h-4 w-4 mr-2" />
              Debug
            </TabsTrigger>
            <TabsTrigger 
              value="generate" 
              className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300"
            >
              <Code className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-400/50 text-green-300">
            <Cpu className="h-3 w-3 mr-1" />
            Local AI
          </Badge>
          <Button size="sm" variant="ghost" className="h-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Assistant Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full flex flex-col">
          <TabsContent value="chat" className="flex-1 m-0 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              {aiMessages.map(renderMessage)}
              {aiProcessing && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-matrix-purple-500 to-matrix-purple-700 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="glass-panel rounded-lg p-3">
                    <div className="flex items-center gap-2 text-matrix-purple-300">
                      <Brain className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="debug" className="flex-1 m-0 p-4">
            <div className="space-y-4">
              <div className="glass-panel rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bug className="h-5 w-5 text-red-400" />
                  <span className="font-medium text-matrix-gold-300">Debug Analysis</span>
                </div>
                <div className="space-y-2 text-sm text-matrix-purple-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>Node connections validated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>Warning: Function node "Process Data" has no error handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-400" />
                    <span>Error: Output node expects different data type</span>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel rounded-lg p-4">
                <div className="text-sm font-medium text-matrix-gold-300 mb-2">Suggested Fixes</div>
                <div className="space-y-2 text-sm text-matrix-purple-200">
                  <div>• Add try-catch block to Process Data function</div>
                  <div>• Convert string output to expected integer type</div>
                  <div>• Add input validation before processing</div>
                </div>
                <Button size="sm" className="mt-3 bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark">
                  <Play className="h-4 w-4 mr-1" />
                  Apply Fixes
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="generate" className="flex-1 m-0 p-4">
            <div className="space-y-4">
              <div className="glass-panel rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="h-5 w-5 text-matrix-gold-400" />
                  <span className="font-medium text-matrix-gold-300">Code Generation</span>
                </div>
                <div className="text-sm text-matrix-purple-200 mb-3">
                  Based on your current node configuration, I can generate optimized code in multiple languages.
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-matrix-purple-600/50">
                    Python
                  </Button>
                  <Button size="sm" variant="outline" className="border-matrix-purple-600/50">
                    JavaScript
                  </Button>
                  <Button size="sm" variant="outline" className="border-matrix-purple-600/50">
                    C++
                  </Button>
                </div>
              </div>
              
              <div className="glass-panel rounded-lg p-4">
                <div className="text-sm font-medium text-matrix-gold-300 mb-2">Code Templates</div>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-sm hover:bg-matrix-purple-700/30">
                    <Code className="h-4 w-4 mr-2" />
                    Data Processing Pipeline
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm hover:bg-matrix-purple-700/30">
                    <Zap className="h-4 w-4 mr-2" />
                    API Integration Handler
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm hover:bg-matrix-purple-700/30">
                    <Brain className="h-4 w-4 mr-2" />
                    ML Model Integration
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Suggestions */}
      <div className="p-4 border-t border-matrix-purple-600/30">
        <div className="text-xs text-matrix-purple-400 mb-2">Quick suggestions:</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {aiSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <Button
                key={index}
                size="sm"
                variant="ghost"
                onClick={() => handleSuggestionClick(suggestion.text, suggestion.category)}
                className="text-xs hover:bg-matrix-purple-700/30 justify-start"
              >
                <Icon className="h-3 w-3 mr-1" />
                {suggestion.text}
              </Button>
            );
          })}
        </div>
        
        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask the AI assistant anything..."
            className="flex-1 bg-matrix-purple-800/30 border-matrix-purple-600/50 text-matrix-purple-200 placeholder:text-matrix-purple-400"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={aiProcessing || !inputValue.trim()}
            className="bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
