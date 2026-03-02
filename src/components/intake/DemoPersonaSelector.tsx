"use client";

import { demoPersonas, DemoPersona } from "@/lib/personas";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DemoPersonaSelectorProps {
  onSelect: (persona: DemoPersona) => void;
  onClose: () => void;
}

export function DemoPersonaSelector({ onSelect, onClose }: DemoPersonaSelectorProps) {
  return (
    <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Load Demo Persona</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Pre-filled profiles to explore different scenarios
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {demoPersonas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => onSelect(persona)}
                className="w-full text-left bg-navy-700 hover:bg-navy-600 border border-navy-500 hover:border-navy-400 rounded-xl p-4 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white group-hover:text-accent transition-colors">
                        {persona.name}
                      </span>
                      <span className="text-xs bg-navy-500 text-slate-300 px-2 py-0.5 rounded-full">
                        {persona.tagline}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{persona.description}</p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-slate-500 group-hover:text-accent transition-colors mt-1 flex-shrink-0"
                  >
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-navy-500">
            <Button variant="ghost" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
