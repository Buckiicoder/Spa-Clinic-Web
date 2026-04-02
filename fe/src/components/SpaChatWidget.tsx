import { useState } from "react";
import { Send } from "lucide-react";

export default function SpaChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào 👋 SpaClinic có thể hỗ trợ gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: input },
      { from: "bot", text: "(Demo) Spa sẽ phản hồi sớm 💛" },
    ]);

    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-full shadow-lg"
        >
          Chat
        </button>
      )}

      {/* Chat Box */}
      {open && (
        <div className="w-80 h-[420px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-amber-500 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold">SpaClinic</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-amber-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-xl max-w-[70%] text-sm ${
                    msg.from === "user"
                      ? "bg-amber-500 text-white"
                      : "bg-white border"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-amber-500 text-white p-2 rounded-xl"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
