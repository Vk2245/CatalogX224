const fs = require("fs");
const file = "DEV/frontend/src/app/chat/page.tsx";
let code = fs.readFileSync(file, "utf8");

// 1. Add interface
code = code.replace(
  "interface Message {",
  `interface ConversationSummary {
  conversation_id: string;
  last_message: string;
  last_role: string;
  last_at: string;
}

interface Message {`
);

// 2. Add state
code = code.replace(
  "const [messages, setMessages] = useState<Message[]>([]);",
  `const [messages, setMessages] = useState<Message[]>([]);
  const [historyList, setHistoryList] = useState<ConversationSummary[]>([]);`
);

// 3. Add loadHistoryList logic
const loadHistoryStr = `
  const loadHistoryList = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(\`\${API}/api/chat/history\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data.conversations || []);
      }
    } catch (e) {}
  };
`;
code = code.replace(
  "const loadHistory = async",
  loadHistoryStr + "\n  const loadHistory = async"
);

// 4. call loadHistoryList on mount and on message send/new chat
code = code.replace(
  "setConversationId(savedConvId);\n      loadHistory(savedConvId);\n    }",
  "setConversationId(savedConvId);\n      loadHistory(savedConvId);\n    }\n    loadHistoryList();"
);

code = code.replace(
  "handleNewConversation();\n    } catch",
  "handleNewConversation();\n      loadHistoryList();\n    } catch"
);

code = code.replace(
  "localStorage.removeItem(\"chatConversationId\");\n  };",
  "localStorage.removeItem(\"chatConversationId\");\n    loadHistoryList();\n  };"
);

code = code.replace(
  "setConversationId(data.conversation_id);\n        localStorage.setItem(\"chatConversationId\", data.conversation_id);\n      }",
  "setConversationId(data.conversation_id);\n        localStorage.setItem(\"chatConversationId\", data.conversation_id);\n        loadHistoryList();\n      }"
);

// 5. Update UI
const newLayout = `
  return (
    <div className="flex h-[calc(100vh-3.5rem)] max-w-7xl mx-auto relative z-10 pt-4 pb-6 px-4 md:px-6 gap-6">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex-col gap-4 hidden md:flex border border-[var(--border)] rounded-2xl glass-panel p-4 overflow-hidden">
        <h2 className="text-xs font-semibold text-[var(--secondary)] uppercase tracking-widest px-1 mb-2">Past Conversations</h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {historyList.length === 0 ? (
            <p className="text-xs text-[var(--muted)] px-1">No past conversations.</p>
          ) : (
            historyList.map(conv => (
              <button
                key={conv.conversation_id}
                onClick={() => {
                  setConversationId(conv.conversation_id);
                  localStorage.setItem("chatConversationId", conv.conversation_id);
                  loadHistory(conv.conversation_id);
                }}
                className={\`w-full text-left p-3 rounded-xl transition-all \${conversationId === conv.conversation_id ? "bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 text-[var(--accent-blue)]" : "bg-black/[0.02] dark:bg-white/[0.02] border border-transparent hover:border-[var(--border)] text-[var(--foreground)]"}\`}
              >
                <p className="text-sm font-medium truncate mb-1">{conv.last_message}</p>
                <p className="text-[10px] text-[var(--muted)]">{new Date(conv.last_at).toLocaleDateString()}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col border border-[var(--border)] rounded-2xl overflow-hidden glass-panel">
`;

code = code.replace(
  `return (\n    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-5xl mx-auto relative z-10">\n      {/* Header */}`,
  newLayout + "\n      {/* Header */}"
);

// add closing div for main area
const endDivs = `
        <p className="text-[10px] text-[var(--muted)] mt-2 text-center">
          Responses are grounded in your scan data. The assistant cannot access
          other users&apos; records.
        </p>
      </div>
    </div>
  </div>
  );
}`;

code = code.replace(
  `<p className="text-[10px] text-[var(--muted)] mt-2 text-center">\n          Responses are grounded in your scan data. The assistant cannot access\n          other users&apos; records.\n        </p>\n      </div>\n    </div>\n  );\n}`,
  endDivs
);


fs.writeFileSync(file, code);
console.log("Updated chat page!");
