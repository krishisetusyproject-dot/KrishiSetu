"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🚩" },
];

export function getStoredLanguage() {
  if (typeof window === "undefined") return "en";
  try {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
    if (match && match[1]) {
      const found = SUPPORTED_LANGUAGES.find((l) => l.code === match[1]);
      if (found) return found.code;
    }
    const saved = localStorage.getItem("krishi_language");
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  } catch {}
  return "en";
}

export function applyLanguage(langCode) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("krishi_language", langCode);

    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    if (langCode === "en") {
      // Clear cookie to revert to original English
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=/en/en; path=/;";
      if (!isLocalhost) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname};`;
        if (window.location.hostname.includes(".")) {
          document.cookie = `googtrans=/en/en; path=/; domain=.${window.location.hostname};`;
        }
      }
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      if (!isLocalhost) {
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;
        if (window.location.hostname.includes(".")) {
          document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname};`;
        }
      }
    }

    // Attempt to update existing Google Translate combo element
    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change"));
    }

    // Refresh to guarantee clean, full DOM translation
    window.location.reload();
  } catch (err) {
    console.error("Language switch error:", err);
  }
}

export default function LanguageSwitcher({ className = "", compact = false }) {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setCurrentLang(getStoredLanguage());
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  function handleSelect(code) {
    setIsOpen(false);
    if (code !== currentLang) {
      setCurrentLang(code);
      applyLanguage(code);
    }
  }

  return (
    <div className={`relative inline-block notranslate ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-emerald-700/50 hover:bg-slate-50 transition active:scale-95"
        title="Change site language / भाषा बदला"
        aria-label="Language selector"
      >
        <Globe className="h-3.5 w-3.5 text-emerald-800" />
        <span className="font-semibold">{activeLangObj.nativeName}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Select Language / भाषा
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-emerald-950 text-amber-100 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <div className="text-left">
                    <p className="leading-tight">{lang.nativeName}</p>
                    <p className={`text-[10px] ${isSelected ? "text-amber-200/70" : "text-slate-400"}`}>
                      {lang.name}
                    </p>
                  </div>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-amber-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
