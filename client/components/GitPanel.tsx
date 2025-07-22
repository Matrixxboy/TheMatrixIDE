import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  GitCompare,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function GitPanel() {
  const [gitOutput, setGitOutput] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [branchName, setBranchName] = useState("");

  const runGitCommand = async (command: string) => {
    setGitOutput(`Executing: git ${command}\n`);
    // In a real application, this would call a backend API that executes git commands
    // For this simulation, we'll just return a dummy output
    try {
      const dummyOutput = await simulateGitCommand(command);
      setGitOutput((prev) => prev + dummyOutput + "\n");
    } catch (error) {
      setGitOutput((prev) => prev + `Error: ${error}\n`);
    }
  };

  const simulateGitCommand = (command: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let output = "";
        if (command.includes("status")) {
          output =
            "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean";
        } else if (command.includes("add")) {
          output = "All changes staged.";
        } else if (command.includes("commit")) {
          output = `[main 0123456] ${commitMessage}\n 1 file changed, 1 insertion(+), 1 deletion(-)\n`;
          setCommitMessage("");
        } else if (command.includes("branch")) {
          output = "* main\n  develop\n  feature/new-feature";
        } else if (command.includes("checkout")) {
          output = `Switched to branch '${branchName}'`;
          setBranchName("");
        } else if (command.includes("pull")) {
          output = "Already up to date.";
        } else if (command.includes("push")) {
          output = "Everything up-to-date";
        } else {
          output = `Simulated git ${command} command output.`;
        }
        resolve(output);
      }, 500);
    });
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h3 className="text-lg font-medium text-matrix-gold-300 mb-4">
        Git Operations
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button onClick={() => runGitCommand("status")} className="glass-panel">
          <RefreshCw className="h-4 w-4 mr-2" /> Git Status
        </Button>
        <Button onClick={() => runGitCommand("add .")} className="glass-panel">
          <Plus className="h-4 w-4 mr-2" /> Git Add All
        </Button>
        <Button onClick={() => runGitCommand("pull")} className="glass-panel">
          <GitPullRequest className="h-4 w-4 mr-2" /> Git Pull
        </Button>
        <Button onClick={() => runGitCommand("push")} className="glass-panel">
          <GitMerge className="h-4 w-4 mr-2" /> Git Push
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Commit message"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          className="mb-2 bg-matrix-purple-800/30 border-matrix-purple-600/50 text-matrix-purple-200 placeholder:text-matrix-purple-400"
        />
        <Button
          onClick={() => runGitCommand(`commit -m "${commitMessage}"`)}
          disabled={!commitMessage}
          className="w-full bg-gradient-to-r from-matrix-gold-500 to-matrix-gold-600 hover:from-matrix-gold-600 hover:to-matrix-gold-700 text-matrix-dark"
        >
          <GitCommit className="h-4 w-4 mr-2" /> Commit
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Branch name (e.g., feature/my-branch)"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          className="mb-2 bg-matrix-purple-800/30 border-matrix-purple-600/50 text-matrix-purple-200 placeholder:text-matrix-purple-400"
        />
        <Button
          onClick={() => runGitCommand(`checkout ${branchName}`)}
          disabled={!branchName}
          className="w-full glass-panel"
        >
          <GitBranch className="h-4 w-4 mr-2" /> Checkout Branch
        </Button>
      </div>

      <div className="flex-1 flex flex-col glass-panel rounded-lg p-3">
        <h4 className="text-sm font-medium text-matrix-gold-300 mb-2">
          Git Output
        </h4>
        <ScrollArea className="flex-1 bg-matrix-dark/30 p-2 rounded text-xs text-matrix-purple-200">
          <pre className="whitespace-pre-wrap">{gitOutput}</pre>
        </ScrollArea>
      </div>
    </div>
  );
}
