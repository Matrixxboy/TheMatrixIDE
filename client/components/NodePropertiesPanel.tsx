import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Code,
  Link2,
  Zap,
  Database,
  Globe,
  Variable,
  Plus,
  Minus,
  Copy,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Info,
  AlertTriangle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react";

interface NodePropertyConfig {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "select" | "code" | "array";
  value: any;
  options?: string[];
  description?: string;
  required?: boolean;
}

const defaultNodeConfigs: Record<string, NodePropertyConfig[]> = {
  input: [
    {
      id: "prompt",
      name: "Input Prompt",
      type: "string" as const,
      value: "Enter value:",
      description: "Text shown to user",
    },
    {
      id: "placeholder",
      name: "Placeholder",
      type: "string" as const,
      value: "",
      description: "Placeholder text",
    },
    {
      id: "validation",
      name: "Validation",
      type: "select" as const,
      value: "none",
      options: ["none", "required", "number", "email"],
      description: "Input validation type",
    },
    {
      id: "defaultValue",
      name: "Default Value",
      type: "string" as const,
      value: "",
      description: "Default input value",
    },
  ],
  function: [
    {
      id: "functionName",
      name: "Function Name",
      type: "string" as const,
      value: "process_data",
      description: "Name of the function",
    },
    {
      id: "parameters",
      name: "Parameters",
      type: "array" as const,
      value: ["data"],
      description: "Function parameters",
    },
    {
      id: "returnType",
      name: "Return Type",
      type: "select" as const,
      value: "auto",
      options: ["auto", "string", "number", "boolean", "array", "object"],
      description: "Expected return type",
    },
    {
      id: "async",
      name: "Async Function",
      type: "boolean" as const,
      value: false,
      description: "Whether function is asynchronous",
    },
    {
      id: "errorHandling",
      name: "Error Handling",
      type: "boolean" as const,
      value: true,
      description: "Include try-catch block",
    },
    {
      id: "customCode",
      name: "Custom Code",
      type: "code" as const,
      value: "# Custom implementation",
      description: "Custom function implementation",
    },
  ],
  api: [
    {
      id: "url",
      name: "API URL",
      type: "string" as const,
      value: "https://api.example.com",
      description: "API endpoint URL",
    },
    {
      id: "method",
      name: "HTTP Method",
      type: "select" as const,
      value: "GET",
      options: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      description: "HTTP request method",
    },
    {
      id: "headers",
      name: "Headers",
      type: "array" as const,
      value: ["Content-Type: application/json"],
      description: "HTTP headers",
    },
    {
      id: "timeout",
      name: "Timeout (ms)",
      type: "number" as const,
      value: 5000,
      description: "Request timeout in milliseconds",
    },
    {
      id: "retries",
      name: "Retry Count",
      type: "number" as const,
      value: 3,
      description: "Number of retry attempts",
    },
    {
      id: "authentication",
      name: "Authentication",
      type: "select" as const,
      value: "none",
      options: ["none", "bearer", "basic", "api-key"],
      description: "Authentication method",
    },
  ],
  logic: [
    {
      id: "condition",
      name: "Condition",
      type: "code" as const,
      value: "data is not None",
      description: "Boolean condition to evaluate",
    },
    {
      id: "operator",
      name: "Operator",
      type: "select" as const,
      value: "if",
      options: ["if", "if-else", "switch", "while", "for"],
      description: "Logic operator type",
    },
    {
      id: "trueValue",
      name: "True Value",
      type: "string" as const,
      value: "condition_true",
      description: "Value when condition is true",
    },
    {
      id: "falseValue",
      name: "False Value",
      type: "string" as const,
      value: "condition_false",
      description: "Value when condition is false",
    },
  ],
  output: [
    {
      id: "outputType",
      name: "Output Type",
      type: "select" as const,
      value: "console",
      options: ["console", "file", "api", "database"],
      description: "Where to send output",
    },
    {
      id: "format",
      name: "Format",
      type: "select" as const,
      value: "text",
      options: ["text", "json", "csv", "xml"],
      description: "Output format",
    },
    {
      id: "template",
      name: "Template",
      type: "string" as const,
      value: "Result: {result}",
      description: "Output template with placeholders",
    },
    {
      id: "logLevel",
      name: "Log Level",
      type: "select" as const,
      value: "info",
      options: ["debug", "info", "warn", "error"],
      description: "Logging level",
    },
  ],
};

export default function NodePropertiesPanel() {
  const { state, dispatch } = useApp();
  const { selectedNode, nodes } = state;
  const [activeTab, setActiveTab] = useState("properties");
  const [nodeConfig, setNodeConfig] = useState<NodePropertyConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const selectedNodeData = selectedNode
    ? nodes.find((n) => n.id === selectedNode)
    : null;

  useEffect(() => {
    if (selectedNodeData) {
      const defaultConfig =
        defaultNodeConfigs[
          selectedNodeData.type as keyof typeof defaultNodeConfigs
        ] || [];
      const existingConfig = selectedNodeData.data.config || {};

      const config = defaultConfig.map((prop) => ({
        ...prop,
        value:
          existingConfig[prop.id] !== undefined
            ? existingConfig[prop.id]
            : prop.value,
      }));

      setNodeConfig(config);
      setHasChanges(false);
    } else {
      setNodeConfig([]);
    }
  }, [selectedNodeData]);

  const updateProperty = (propertyId: string, value: any) => {
    setNodeConfig((prev) =>
      prev.map((prop) => (prop.id === propertyId ? { ...prop, value } : prop)),
    );
    setHasChanges(true);
  };

  const addArrayItem = (propertyId: string) => {
    setNodeConfig((prev) =>
      prev.map((prop) =>
        prop.id === propertyId ? { ...prop, value: [...prop.value, ""] } : prop,
      ),
    );
    setHasChanges(true);
  };

  const removeArrayItem = (propertyId: string, index: number) => {
    setNodeConfig((prev) =>
      prev.map((prop) =>
        prop.id === propertyId
          ? {
              ...prop,
              value: prop.value.filter((_: any, i: number) => i !== index),
            }
          : prop,
      ),
    );
    setHasChanges(true);
  };

  const updateArrayItem = (
    propertyId: string,
    index: number,
    value: string,
  ) => {
    setNodeConfig((prev) =>
      prev.map((prop) =>
        prop.id === propertyId
          ? {
              ...prop,
              value: prop.value.map((item: string, i: number) =>
                i === index ? value : item,
              ),
            }
          : prop,
      ),
    );
    setHasChanges(true);
  };

  const saveChanges = () => {
    if (selectedNodeData) {
      const configObject = nodeConfig.reduce((acc, prop) => {
        acc[prop.id] = prop.value;
        return acc;
      }, {} as any);

      dispatch({
        type: "UPDATE_NODE",
        payload: {
          id: selectedNodeData.id,
          updates: {
            data: {
              ...selectedNodeData.data,
              config: configObject,
            },
          },
        },
      });
      setHasChanges(false);
    }
  };

  const resetChanges = () => {
    if (selectedNodeData) {
      const defaultConfig =
        defaultNodeConfigs[
          selectedNodeData.type as keyof typeof defaultNodeConfigs
        ] || [];
      setNodeConfig(defaultConfig);
      setHasChanges(true);
    }
  };

  const duplicateNode = () => {
    if (selectedNodeData) {
      const newNode = {
        ...selectedNodeData,
        id: Date.now().toString(),
        position: {
          x: selectedNodeData.position.x + 50,
          y: selectedNodeData.position.y + 50,
        },
        data: {
          ...selectedNodeData.data,
          label: `${selectedNodeData.data.label} Copy`,
        },
      };
      dispatch({ type: "ADD_NODE", payload: newNode });
    }
  };

  const deleteNode = () => {
    if (selectedNodeData) {
      dispatch({ type: "DELETE_NODE", payload: selectedNodeData.id });
    }
  };

  const renderPropertyInput = (property: NodePropertyConfig) => {
    switch (property.type) {
      case "string":
        return (
          <Input
            value={property.value}
            onChange={(e) => updateProperty(property.id, e.target.value)}
            placeholder={property.description}
            className="bg-matrix-purple-800/30 border-matrix-purple-600/50 h-10 sm:h-9 touch-manipulation"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={property.value}
            onChange={(e) =>
              updateProperty(property.id, parseFloat(e.target.value) || 0)
            }
            className="bg-matrix-purple-800/30 border-matrix-purple-600/50 h-10 sm:h-9 touch-manipulation"
          />
        );

      case "boolean":
        return (
          <Switch
            checked={property.value}
            onCheckedChange={(checked) => updateProperty(property.id, checked)}
          />
        );

      case "select":
        return (
          <Select
            value={property.value}
            onValueChange={(value) => updateProperty(property.id, value)}
          >
            <SelectTrigger className="bg-matrix-purple-800/30 border-matrix-purple-600/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "code":
        return (
          <Textarea
            value={property.value}
            onChange={(e) => updateProperty(property.id, e.target.value)}
            className="bg-matrix-purple-800/30 border-matrix-purple-600/50 font-mono text-sm min-h-24 sm:min-h-20 touch-manipulation"
            placeholder={property.description}
          />
        );

      case "array":
        return (
          <div className="space-y-2">
            {property.value.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) =>
                    updateArrayItem(property.id, index, e.target.value)
                  }
                  className="bg-matrix-purple-800/30 border-matrix-purple-600/50"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeArrayItem(property.id, index)}
                  className="h-10 w-10 sm:h-8 sm:w-8 p-0 text-red-400 hover:bg-red-500/20 touch-manipulation"
                >
                  <Minus className="h-4 w-4 sm:h-3 sm:w-3" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => addArrayItem(property.id)}
              className="w-full border border-dashed border-matrix-purple-600/50 text-matrix-purple-300 hover:bg-matrix-purple-700/30"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!selectedNodeData) {
    return (
      <div className="h-full flex flex-col">
        <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
          <div className="h-12 sm:h-14 glass-panel border-b border-matrix-purple-600/30 flex items-center justify-between px-3 sm:px-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-matrix-purple-700/20 rounded p-1 -m-1 transition-colors">
                <div className="w-8 h-8 rounded bg-gradient-to-r from-matrix-purple-500 to-matrix-purple-700 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-matrix-gold-300">
                    Node Properties
                  </h3>
                  <p className="text-xs text-matrix-purple-400">
                    No node selected
                  </p>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-matrix-purple-400" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-matrix-purple-400" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 touch-manipulation"
                title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
              >
                {isCollapsed ? (
                  <PanelRightOpen className="h-4 w-4" />
                ) : (
                  <PanelRightClose className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <Settings className="h-12 w-12 text-matrix-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-matrix-gold-300 mb-2">
                  No Node Selected
                </h3>
                <p className="text-sm text-matrix-purple-400">
                  Select a node from the canvas to view and edit its properties.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Mobile-responsive */}
      <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
        <div className="h-12 sm:h-14 glass-panel border-b border-matrix-purple-600/30 flex items-center justify-between px-3 sm:px-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-matrix-purple-700/20 rounded p-1 -m-1 transition-colors">
              <div className="w-8 h-8 rounded bg-gradient-to-r from-matrix-purple-500 to-matrix-purple-700 flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-matrix-gold-300">
                  {selectedNodeData.data.label}
                </h3>
                <p className="text-xs text-matrix-purple-400 capitalize">
                  {selectedNodeData.type} Node
                </p>
              </div>
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4 text-matrix-purple-400" />
              ) : (
                <ChevronUp className="h-4 w-4 text-matrix-purple-400" />
              )}
            </div>
          </CollapsibleTrigger>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={duplicateNode}
              className="h-8 w-8 p-0 touch-manipulation"
              title="Duplicate Node"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={deleteNode}
              className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20 touch-manipulation"
              title="Delete Node"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 touch-manipulation"
                title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
              >
                {isCollapsed ? (
                  <PanelRightOpen className="h-4 w-4" />
                ) : (
                  <PanelRightClose className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="mx-3 sm:mx-4 mt-2 bg-matrix-purple-800/30 border border-matrix-purple-600/30 h-9 sm:h-10">
                <TabsTrigger
                  value="properties"
                  className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300 text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Properties</span>
                  <span className="sm:hidden">Props</span>
                </TabsTrigger>
                <TabsTrigger
                  value="connections"
                  className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300 text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
                >
                  <Link2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Connections</span>
                  <span className="sm:hidden">Links</span>
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="data-[state=active]:bg-matrix-purple-700/50 data-[state=active]:text-matrix-gold-300 text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
                >
                  <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Code</span>
                  <span className="sm:hidden">Code</span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-4 py-4">
                <TabsContent value="properties" className="m-0 space-y-4">
                  {/* Basic Properties */}
                  <div className="glass-panel rounded-lg p-4">
                    <h4 className="text-sm font-medium text-matrix-gold-300 mb-3">
                      Basic Properties
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-matrix-purple-300">
                          Node Label
                        </Label>
                        <Input
                          value={selectedNodeData.data.label}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_NODE",
                              payload: {
                                id: selectedNodeData.id,
                                updates: {
                                  data: {
                                    ...selectedNodeData.data,
                                    label: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                          className="bg-matrix-purple-800/30 border-matrix-purple-600/50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-matrix-purple-300">
                            X Position
                          </Label>
                          <Input
                            type="number"
                            value={selectedNodeData.position.x}
                            onChange={(e) =>
                              dispatch({
                                type: "MOVE_NODE",
                                payload: {
                                  id: selectedNodeData.id,
                                  position: {
                                    ...selectedNodeData.position,
                                    x: parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            className="bg-matrix-purple-800/30 border-matrix-purple-600/50"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-matrix-purple-300">
                            Y Position
                          </Label>
                          <Input
                            type="number"
                            value={selectedNodeData.position.y}
                            onChange={(e) =>
                              dispatch({
                                type: "MOVE_NODE",
                                payload: {
                                  id: selectedNodeData.id,
                                  position: {
                                    ...selectedNodeData.position,
                                    y: parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            className="bg-matrix-purple-800/30 border-matrix-purple-600/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Properties */}
                  <div className="glass-panel rounded-lg p-4">
                    <h4 className="text-sm font-medium text-matrix-gold-300 mb-3">
                      Advanced Configuration
                    </h4>
                    <div className="space-y-4">
                      {nodeConfig.map((property) => (
                        <div key={property.id}>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-matrix-purple-300">
                              {property.name}
                            </Label>
                            {property.required && (
                              <Badge
                                variant="outline"
                                className="text-xs h-5 border-red-400/50 text-red-300"
                              >
                                Required
                              </Badge>
                            )}
                          </div>
                          {renderPropertyInput(property)}
                          {property.description && (
                            <p className="text-xs text-matrix-purple-400 mt-1">
                              {property.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="connections" className="m-0">
                  <div className="glass-panel rounded-lg p-4">
                    <h4 className="text-sm font-medium text-matrix-gold-300 mb-3">
                      Node Connections
                    </h4>

                    {/* Input Connections */}
                    {selectedNodeData.data.inputs && (
                      <div className="mb-4">
                        <h5 className="text-xs font-medium text-matrix-purple-300 mb-2">
                          Inputs
                        </h5>
                        <div className="space-y-2">
                          {selectedNodeData.data.inputs.map((input, index) => (
                            <div
                              key={input}
                              className="flex items-center gap-2 p-2 glass-dark rounded"
                            >
                              <div className="w-3 h-3 rounded-full bg-matrix-purple-400 border-2 border-matrix-purple-300"></div>
                              <span className="text-sm text-matrix-purple-200">
                                {input}
                              </span>
                              <Badge
                                variant="outline"
                                className="ml-auto text-xs border-matrix-purple-600/50"
                              >
                                Input {index + 1}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Output Connections */}
                    {selectedNodeData.data.outputs && (
                      <div>
                        <h5 className="text-xs font-medium text-matrix-purple-300 mb-2">
                          Outputs
                        </h5>
                        <div className="space-y-2">
                          {selectedNodeData.data.outputs.map((output, index) => (
                            <div
                              key={output}
                              className="flex items-center gap-2 p-2 glass-dark rounded"
                            >
                              <div className="w-3 h-3 rounded-full bg-matrix-gold-400 border-2 border-matrix-gold-300"></div>
                              <span className="text-sm text-matrix-purple-200">
                                {output}
                              </span>
                              <Badge
                                variant="outline"
                                className="ml-auto text-xs border-matrix-gold-600/50 text-matrix-gold-300"
                              >
                                Output {index + 1}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="code" className="m-0">
                  <div className="glass-panel rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-matrix-gold-300">
                        Node Code
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updatedCode = `# ${selectedNodeData.data.label} Node\n# Generated at: ${new Date().toISOString()}\n\ndef ${selectedNodeData.data.label.toLowerCase().replace(/\s+/g, "_")}():\n    """${selectedNodeData.data.label} implementation"""\n    pass\n\nif __name__ == "__main__":\n    ${selectedNodeData.data.label.toLowerCase().replace(/\s+/g, "_")}()`;
                          dispatch({
                            type: "UPDATE_NODE",
                            payload: {
                              id: selectedNodeData.id,
                              updates: {
                                data: {
                                  ...selectedNodeData.data,
                                  code: updatedCode,
                                },
                              },
                            },
                          });
                        }}
                        className="text-xs"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                    <Textarea
                      value={
                        selectedNodeData.data.code ||
                        "# Code will be generated based on node configuration"
                      }
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_NODE",
                          payload: {
                            id: selectedNodeData.id,
                            updates: {
                              data: {
                                ...selectedNodeData.data,
                                code: e.target.value,
                              },
                            },
                          },
                        })
                      }
                      className="bg-matrix-dark/50 border-matrix-purple-600/50 font-mono text-sm min-h-32 text-matrix-purple-200"
                      placeholder="Enter custom code for this node..."
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-matrix-purple-400">
                        Edit the code that will be executed for this node
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs border-matrix-gold-400/50 text-matrix-gold-300"
                      >
                        {selectedNodeData.data.code?.split("\n").length || 1} lines
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>

              {/* Action Buttons - Mobile-responsive */}
              {hasChanges && (
                <div className="h-12 sm:h-14 glass-panel border-t border-matrix-purple-600/30 flex items-center justify-between px-3 sm:px-4">
                  <div className="flex items-center gap-2 text-xs text-matrix-gold-300">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="hidden sm:inline">Unsaved changes</span>
                    <span className="sm:hidden">Unsaved</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetChanges}
                      className="h-9 sm:h-8 px-2 sm:px-3 touch-manipulation"
                    >
                      <RotateCcw className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                      <span className="hidden sm:inline">Reset</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveChanges}
                      className="h-9 sm:h-8 px-3 sm:px-3 bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark touch-manipulation"
                    >
                      <Save className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                      <span className="hidden sm:inline">Save</span>
                      <span className="sm:hidden">Save</span>
                    </Button>
                  </div>
                </div>
              )}
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
    )
}
