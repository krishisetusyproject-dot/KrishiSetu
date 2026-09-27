"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, User, ShieldCheck, MapPin, Sparkles, Check, CheckCheck } from "lucide-react";

export default function BuyerChatModal({
  isOpen,
  onClose,
  farmer = {
    name: "Ramesh Patil",
    location: "Dindori, Nashik",
    verified: true,
    crop: "Hybrid Red Tomatoes",
    produceId: "b-prod-101",
  },
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const farmerKey = farmer?.name ? `krishi_chat_${farmer.name.replace(/\s+/g, "_").toLowerCase()}` : "krishi_chat_default";

  // Pre-configured negotiation quick chips
  const quickPrompts = [
    "Is price negotiable for bulk orders?",
    "When was this batch harvested?",
    "Can you arrange farmgate pickup tomorrow?",
    "Do you have quality grade certificates?",
  ];

  // Load existing conversation or initialize with farmer greeting
  useEffect(() => {
    if (!isOpen) return;

    try {
      const stored = localStorage.getItem(farmerKey);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        const initialMessages = [
          {
            id: 1,
            sender: "farmer",
            senderName: farmer.name || "Farmer",
            text: `Namaste ji! I am ${farmer.name || "the farmer"}. Thank you for your interest in my ${farmer.crop || "produce"}. How many quintals / kilograms are you looking to procure?`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
        setMessages(initialMessages);
        localStorage.setItem(farmerKey, JSON.stringify(initialMessages));
      }
    } catch {
      // fallback
    }
  }, [isOpen, farmerKey, farmer.name, farmer.crop]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend(textToSend) {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      sender: "buyer",
      senderName: "You",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputValue("");

    try {
      localStorage.setItem(farmerKey, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    // Simulate smart farmer response after 1.2 seconds
    setIsTyping(true);
    setTimeout(() => {
      let replyText = "Ji bilkul! That works well for us. Let's confirm the quantity and pickup schedule via the official KrishiSetu offer.";
      const lower = text.toLowerCase();
      if (lower.includes("price") || lower.includes("negotiable") || lower.includes("rate")) {
        replyText = "The rate is genuine as per APMC modal benchmark, but for bulk procurement of 1,000kg+ I can give a discount of ₹1–2 per kg.";
      } else if (lower.includes("tomorrow") || lower.includes("pickup") || lower.includes("timing")) {
        replyText = "Tomorrow morning between 8 AM and 11 AM is ideal for loading at our farm gate hub. Crated and weighed!";
      } else if (lower.includes("quality") || lower.includes("grade") || lower.includes("test")) {
        replyText = "All produce is Grade A sorted with uniform maturity. You are welcome to inspect before loading with escrow protection.";
      } else if (lower.includes("harvest")) {
        replyText = "Harvested just early this morning! 100% fresh picked and sorted directly into aerated crates.";
      }

      const farmerReply = {
        id: Date.now() + 1,
        sender: "farmer",
        senderName: farmer.name || "Farmer",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => {
        const next = [...prev, farmerReply];
        try {
          localStorage.setItem(farmerKey, JSON.stringify(next));
        } catch (e) {
          console.warn("Could not save to localStorage:", e);
        }
        return next;
      });
      setIsTyping(false);
    }, 1200);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="flex h-[88vh] sm:h-[620px] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-950 px-5 py-4 text-amber-100">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 border border-emerald-700/60 font-bold text-amber-200">
              <User className="h-6 w-6" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-emerald-950 bg-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base leading-tight text-amber-100">{farmer.name || "Farmer"}</h3>
                {farmer.verified && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-900 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-300">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-100/70 mt-0.5">
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" /> {farmer.location || "Maharashtra"}
                </span>
                {farmer.crop && <span>• {farmer.crop}</span>}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900/60 text-amber-200 hover:bg-emerald-900 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="flex items-center gap-2 overflow-x-auto bg-slate-50 px-4 py-2 border-b border-slate-100 scrollbar-none">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Quick Ask:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-600 hover:text-emerald-950 transition active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#fbfdfa]">
          <div className="text-center my-1">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
              Direct Farmer Direct Chat • Escrow Protected
            </span>
          </div>

          {messages.map((msg) => {
            const isBuyer = msg.sender === "buyer";
            return (
              <div key={msg.id} className={`flex flex-col ${isBuyer ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                    isBuyer
                      ? "rounded-br-xs bg-emerald-950 text-amber-50"
                      : "rounded-bl-xs bg-white text-slate-800 border border-slate-200/90"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                <div className="mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-400">
                  <span>{msg.time}</span>
                  {isBuyer && <CheckCheck className="h-3 w-3 text-emerald-600" />}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic px-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-700 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>{farmer.name || "Farmer"} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 border-t border-slate-100 bg-white p-3 sm:p-4"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type message to farmer (rates, pickup, grade)..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-950 text-amber-100 shadow-md transition hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
