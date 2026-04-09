import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { sendMessage, addUserMessage, selectChat } from "../features/chat/chatSlice";

export default function SpaChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const dispatch = useAppDispatch();
  const { messages, loading } = useAppSelector(selectChat);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const text = input;

    // 👇 thêm message user vào redux ngay
    dispatch(addUserMessage(text));

    setInput("");

    // 👇 gọi API qua thunk
    dispatch(sendMessage({ message: text }));
  };

  return (
    <div className="fixed bottom-3 right-3 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-full shadow-lg"
        >
          Chat
        </button>
      )}

      {open && (
        <div className="w-100 h-[460px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-amber-500 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold">SpaClinic</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-amber-50">
            {messages.map((msg: any, i: any) => (
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

            {loading && (
              <div className="text-xs text-gray-400">
                Spa đang trả lời...
              </div>
            )}

            <div ref={messagesEndRef} />
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
