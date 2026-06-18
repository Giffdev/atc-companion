"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types/api";
import type { ParsedIntent } from "@/types/intents";
import { createVoiceRecognitionController, type VoiceRecognitionController } from "@/ai/voice-input";

type QueryInputProps = {
  initialQuery?: string;
  onPreviewChange?: (intent: ParsedIntent | null) => void;
  onSubmit?: (query: string, intent: ParsedIntent | null) => void | Promise<void>;
  isSubmitting?: boolean;
};

const SUGGESTIONS = [
  "METAR and TAF for KSEA",
  "Show TFR and runway NOTAMs for KSEA",
  "Traffic near KSEA below 12,000",
  "Tower and ground frequencies for KSEA"
] as const;

const intentTypeLabel = (intent: ParsedIntent): string => intent.type.replaceAll("_", " ").toUpperCase();

const summarizeIntent = (intent: ParsedIntent): string => {
  switch (intent.type) {
    case "weather":
      return `${intent.subtype.toUpperCase()} • ${intent.airport}`;
    case "notam":
      return `${intent.type_filter ?? "ALL"} • ${intent.airport ?? "ROUTE"}`;
    case "traffic":
      return `${intent.airport ?? "REGIONAL"} TRAFFIC`;
    case "frequency":
      return `${intent.freq_type ?? "ALL"} • ${intent.facility}`;
    case "plates":
      return `${intent.procedure_type ?? "PROC"} • ${intent.airport}`;
    case "regulatory":
      return intent.part ? `FAR ${intent.part}.${intent.section ?? ""}` : "REGULATORY";
    case "airport_info":
      return `${intent.airport} • ${intent.detail ?? "ALL"}`;
    case "unknown":
      return intent.clarificationPrompt ?? "Awaiting clarification";
  }
};

export function QueryInput({ initialQuery = SUGGESTIONS[0], onPreviewChange, onSubmit, isSubmitting = false }: QueryInputProps) {
  const [query, setQuery] = useState<string>(initialQuery);
  const [intentPreview, setIntentPreview] = useState<ParsedIntent | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("Voice standby");
  const [parseError, setParseError] = useState<string | null>(null);
  const controllerRef = useRef<VoiceRecognitionController | null>(null);

  const updateQuery = useCallback((nextQuery: string) => {
    setQuery(nextQuery);

    if (!nextQuery.trim()) {
      setIntentPreview(null);
      setParseError(null);
      onPreviewChange?.(null);
    }
  }, [onPreviewChange]);

  useEffect(() => {
    controllerRef.current = createVoiceRecognitionController({
      continuous: false,
      interimResults: false,
      onResult: (result) => {
        updateQuery(result.normalizedTranscript);
        setVoiceMessage(result.isHighConfidence ? "Voice capture accepted" : "Low confidence voice readback");
      },
      onError: () => {
        setIsListening(false);
        setVoiceMessage("Voice capture unavailable");
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    return () => {
      controllerRef.current?.abort();
    };
  }, [updateQuery]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === "Space") {
        event.preventDefault();

        if (isListening) {
          controllerRef.current?.stop();
          setIsListening(false);
          setVoiceMessage("Voice standby");
          return;
        }

        if (!controllerRef.current?.isSupported) {
          setVoiceMessage("Voice input not supported in this browser");
          return;
        }

        try {
          controllerRef.current.start();
          setIsListening(true);
          setVoiceMessage("Listening...");
        } catch {
          setVoiceMessage("Voice input unavailable");
          setIsListening(false);
        }
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, [isListening]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      const loadIntentPreview = async (): Promise<void> => {
        try {
          setIsParsing(true);
          setParseError(null);

          const response = await fetch(API_ENDPOINTS.intent, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ input: trimmedQuery }),
            signal: abortController.signal
          });

          const payload = (await response.json()) as ApiResponse<ParsedIntent>;

          if (!payload.ok) {
            setIntentPreview(null);
            setParseError(payload.error.message);
            onPreviewChange?.(null);
            return;
          }

          setIntentPreview(payload.data);
          onPreviewChange?.(payload.data);
        } catch (error) {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            setIntentPreview(null);
            setParseError("Intent preview unavailable");
            onPreviewChange?.(null);
          }
        } finally {
          setIsParsing(false);
        }
      };

      void loadIntentPreview();
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [onPreviewChange, query]);

  const previewTone = useMemo(() => {
    if (!intentPreview) {
      return "border-aviation-border bg-black/15 text-aviation-muted";
    }

    if (intentPreview.requiresClarification) {
      return "border-amber-500/20 bg-amber-500/10 text-amber-200";
    }

    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
  }, [intentPreview]);

  const handleSubmit = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    void onSubmit?.(trimmedQuery, intentPreview);
  };

  const handleVoiceToggle = () => {
    if (!controllerRef.current?.isSupported) {
      setVoiceMessage("Voice input not supported in this browser");
      return;
    }

    try {
      if (isListening) {
        controllerRef.current.stop();
        setIsListening(false);
        setVoiceMessage("Voice standby");
        return;
      }

      controllerRef.current.start();
      setIsListening(true);
      setVoiceMessage("Listening...");
    } catch {
      setIsListening(false);
      setVoiceMessage("Voice input unavailable");
    }
  };

  return (
    <section className="aviation-panel-strong aviation-grid relative overflow-hidden p-5 md:p-7">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="data-label">Query Console</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-aviation-text md:text-4xl">
              Type or speak the next tower-room query.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-aviation-muted md:text-base">
              Input is tuned for concise operational phrasing, with intent parsing previewed before dispatch. No light mode, no clutter, no hidden provenance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-aviation-muted">
            <span className="rounded-full border border-aviation-border px-3 py-1 font-data">ENTER • submit</span>
            <span className="rounded-full border border-aviation-border px-3 py-1 font-data">CTRL+SPACE • voice</span>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_auto_auto]">
          <label className="space-y-2">
            <span className="data-label">Operational Query</span>
            <input
              className="h-16 w-full rounded-2xl border border-aviation-border bg-black/30 px-5 font-data text-base text-aviation-text placeholder:text-aviation-muted/70"
              disabled={isSubmitting}
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Example: METAR and TAF for KSEA"
              type="text"
              value={query}
            />
          </label>

          <button
            className={[
              "flex h-16 min-w-40 items-center justify-center gap-3 rounded-2xl border px-5 text-sm font-medium",
              isListening
                ? "animate-radar-pulse border-emerald-400/40 bg-emerald-500/12 text-emerald-200"
                : "border-aviation-border bg-black/25 text-aviation-text hover:border-cyan-400/30 hover:bg-cyan-500/8"
            ].join(" ")}
            disabled={isSubmitting}
            onClick={handleVoiceToggle}
            type="button"
          >
            <span
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full border",
                isListening ? "border-emerald-400/50 bg-emerald-500/15" : "border-aviation-border bg-black/20"
              ].join(" ")}
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 15a3 3 0 0 0 3-3V8a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Zm0 0v4m-4-4a4 4 0 1 0 8 0"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
            <span>{isListening ? "Listening..." : "Voice Input"}</span>
          </button>

          <button
            className="h-16 rounded-2xl bg-cyan-400 px-6 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Dispatching..." : "Submit Query"}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className={`rounded-2xl border px-4 py-3 ${previewTone}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="data-label text-inherit">Intent Preview</span>
              {isParsing ? <span className="font-data text-xs">PARSING…</span> : null}
              {intentPreview ? <span className="font-data text-xs">{intentTypeLabel(intentPreview)}</span> : null}
              {intentPreview ? <span className="font-data text-xs">{Math.round(intentPreview.confidence * 100)}%</span> : null}
            </div>

            <p className="mt-2 text-sm leading-6">
              {parseError
                ? parseError
                : intentPreview
                  ? summarizeIntent(intentPreview)
                  : "Type an airport, source, or regulation to preview how the query router classifies it."}
            </p>

            {intentPreview?.requiresClarification ? (
              <p className="mt-2 text-xs text-amber-100/90">{intentPreview.clarificationPrompt}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
            <p className="data-label">Voice Status</p>
            <p className="mt-2 font-data text-sm text-aviation-text">{voiceMessage}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              className="rounded-full border border-aviation-border bg-black/10 px-3 py-1.5 text-xs text-aviation-muted hover:border-cyan-400/30 hover:text-aviation-text"
              onClick={() => updateQuery(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
