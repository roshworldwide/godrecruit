"use client";

import { useState, useEffect } from "react";
import { Settings, CheckCircle2, Bot } from "lucide-react";

export default function Popup() {
  const [status, setStatus] = useState<"idle" | "parsing" | "generating" | "injecting" | "done">("idle");

  const handleAutoApply = async () => {
    setStatus("parsing");

    // In a real extension, we send a message to the active tab's content script
    if (typeof chrome !== "undefined" && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "START_AUTO_APPLY" });
      }
    } else {
      // Dummy flow for local testing
      setTimeout(() => setStatus("generating"), 1000);
      setTimeout(() => setStatus("injecting"), 2000);
      setTimeout(() => setStatus("done"), 3000);
    }
  };

  const openOptions = () => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
      window.open(chrome.runtime.getURL('options.html'));
    } else {
      window.open("/options.html", "_blank");
    }
  };

  return (
    <div className="w-[340px] h-[480px] p-6 relative overflow-hidden flex flex-col items-center justify-between text-center bg-transparent">
      {/* Background gradients for liquid glass depth */}
      <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5" />
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] z-[-1]" />
      <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-purple-500/20 rounded-full blur-[60px] z-[-1]" />

      <div className="w-full flex justify-between items-center mb-6 z-10">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-semibold tracking-tight">GodRecruit</h1>
        </div>
        <button
          onClick={openOptions}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 apple-transition"
        >
          <Settings className="w-5 h-5 opacity-70" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full z-10">
        <div className="liquid-glass p-8 w-full flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
            {status === "done" ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <div className={`w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full ${status !== "idle" ? "animate-spin" : ""}`} />
            )}
          </div>
          <h2 className="text-lg font-medium">
            {status === "idle" && "Ready to Apply"}
            {status === "parsing" && "Reading ATS Form..."}
            {status === "generating" && "Gemini Thinking..."}
            {status === "injecting" && "Injecting Answers..."}
            {status === "done" && "Application Filled"}
          </h2>
          <p className="text-sm opacity-60">
            {status === "idle" ? "Supported: Lever, Greenhouse, Workday" : "Please don't close the popup"}
          </p>
        </div>
      </div>

      <button
        onClick={handleAutoApply}
        disabled={status !== "idle" && status !== "done"}
        className="w-full mt-6 py-4 rounded-2xl liquid-glass border border-white/40 text-[15px] font-medium apple-interactive disabled:opacity-50 disabled:active:scale-100 hover:bg-black/5 dark:hover:bg-white/10 z-10"
      >
        {status === "done" ? "Apply Again" : "Auto-Fill Form"}
      </button>
    </div>
  );
}
