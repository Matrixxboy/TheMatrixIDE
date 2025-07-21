import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome to Matrix IDE AI Assistant! I\'m running locally on your machine for complete privacy. How can I help you with your code today?',
      timestamp: new Date(),
      category: 'chat'
    },
    {
      id: '2',
      type: 'ai',
      content: 'I can help you with:\n• Code generation from your node diagrams\n• Debugging and error analysis\n• Code optimization suggestions\n• Explaining complex algorithms\n• Best practices recommendations',
      timestamp: new Date(),
      category: 'chat'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const aiSuggestions = [
    { icon: Code, text: 'Generate code from current nodes', category: 'generate' },
    { icon: Bug, text: 'Debug the node connection error', category: 'debug' },
    { icon: Zap, text: 'Optimize the data processing pipeline', category: 'optimize' },
    { icon: Lightbulb, text: 'Suggest improvements for the algorithm', category: 'chat' },
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      category: 'chat'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        category: 'chat'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const responses = [
      "I understand you're working with the node-based system. Let me analyze your current setup and provide some optimized code suggestions.",
      "Based on your input, I recommend implementing error handling in your data processing nodes. Here's a Python snippet that might help...",
      "Great question! For better performance, consider using async/await patterns in your JavaScript nodes. This will improve the overall pipeline efficiency.",
      "I notice you're using multiple data transformation nodes. You could optimize this by combining some operations into a single function node.",
      "That's a complex algorithm! Let me break it down step by step and show you how to implement it using our visual programming approach."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSuggestionClick = (suggestion: string, category: string) => {
    setInputValue(suggestion);
    setActiveTab(category === 'debug' ? 'debug' : category === 'generate' ? 'generate' : 'chat');
  };

  const renderMessage = (message: Message) => (
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
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
              {messages.map(renderMessage)}
              {isProcessing && (
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
            disabled={isProcessing || !inputValue.trim()}
            className="bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
