import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  sendMessage,
  addUserMessage,
  clearChat,
  selectChat,
} from "../features/chat/chatSlice";

export default function SpaChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const dispatch = useAppDispatch();

  const { messages, loading, error } = useAppSelector(selectChat);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (loading) return;

    const text = input.trim();

    // add message immediately
    dispatch(addUserMessage(text));

    setInput("");

    // call AI
    dispatch(
      sendMessage({
        message: text,
      }),
    );
  };

  // QUICK ACTION
  const quickActions = [
    "Tư vấn trị nám",
    "Tư vấn trị mụn",
    "Tư vấn trị thâm",
    "Đặt lịch chăm sóc da",
  ];

  // UI

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* CLOSED BUTTON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xl w-14 h-14 flex items-center justify-center transition"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* CHAT BOX */}
      {open && (
        <div className="w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* HEADER */}
          <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold">SpaClinic Assistant</p>

              <p className="text-xs opacity-90">Tư vấn & đặt lịch</p>
            </div>

            <div className="flex items-center gap-2">
              {/* CLEAR CHAT */}
              <button
                onClick={() => dispatch(clearChat())}
                className="hover:bg-white/20 p-1 rounded-lg"
              >
                <Trash2 size={18} />
              </button>

              {/* CLOSE */}
              <button
                onClick={() => setOpen(false)}
                className="hover:bg-white/20 px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* QUICK ACTION */}
          <div className="px-3 pt-3 pb-1 flex gap-2 overflow-auto scrollbar-hide">
            {quickActions.map((item) => (
              <button
                key={item}
                onClick={() => {
                  dispatch(addUserMessage(item));

                  dispatch(
                    sendMessage({
                      message: item,
                    }),
                  );
                }}
                className="whitespace-nowrap text-xs border border-amber-300 text-amber-600 px-3 py-1.5 rounded-full hover:bg-amber-50 transition"
              >
                {item}
              </button>
            ))}
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-amber-50">
            {messages.map((msg: any, index: number) => (
              <div
                key={index}
                className={`flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap break-words ${
                    msg.from === "user"
                      ? "bg-amber-500 text-white rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-700 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* LOADING */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl text-sm text-gray-500">
                  Spa đang trả lời...
                </div>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="text-center text-xs text-red-500">
                {typeof error === "string" ? error : "Có lỗi xảy ra"}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập nội dung..."
                className="flex-1 border border-gray-300 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white w-11 h-11 rounded-2xl flex items-center justify-center transition"
              >
                <Send size={18} />
              </button>
            </div>

            <p className="text-[11px] text-gray-400 mt-2 px-1">
              Spa AI hỗ trợ tư vấn dịch vụ và đặt lịch nhanh chóng.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
