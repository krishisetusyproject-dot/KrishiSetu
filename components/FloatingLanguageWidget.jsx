"use client";

import { useState, useEffect } from "react";
import { Globe, Check, X } from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  getStoredLanguage,
  applyLanguage,
} from "@/components/LanguageSwitcher";

export default function FloatingLanguageWidget() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLang(getStoredLanguage());
  }, []);

  if (!mounted) return null;

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
    <aside
      aria-label="Language selection"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 notranslate font-sans"
    >
      {/* Expanded Menu */}
      {isOpen && (
        <div className="mb-2 w-52 rounded-3xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-md ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Language / भाषा
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Close language selector"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-1 space-y-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-xs font-semibold transition active:scale-95 ${
                    isSelected
                      ? "bg-emerald-950 text-amber-100 font-bold shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
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
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-md transition-all hover:bg-emerald-950 hover:text-amber-100 hover:border-emerald-900 active:scale-95"
        title="Translate Website / संकेतस्थळ भाषांतर करा"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-950 group-hover:bg-emerald-900 group-hover:text-amber-200 transition-colors">
          <Globe className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-bold text-slate-800 group-hover:text-amber-100">
          {activeLangObj.flag} {activeLangObj.nativeName}
        </span>
      </button>
    </aside>
  );
}
