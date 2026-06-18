import { normalizeAviationText } from "@/ai/entity-extractor";

export interface VoiceRecognitionResult {
  transcript: string;
  normalizedTranscript: string;
  confidence: number;
  isHighConfidence: boolean;
}

export interface VoiceRecognitionController {
  start: () => void;
  stop: () => void;
  abort: () => void;
  isSupported: boolean;
}

export interface VoiceRecognitionOptions {
  language?: string;
  minConfidence?: number;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: Event | string) => void;
  onEnd?: () => void;
}

interface BrowserSpeechRecognitionEvent extends Event {
  results: ArrayLike<{
    isFinal?: boolean;
    [index: number]: {
      transcript: string;
      confidence: number;
    };
  }>;
}

interface BrowserSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognitionInstance;

const DEFAULT_MIN_CONFIDENCE = 0.75;

const getSpeechRecognitionConstructor = (): BrowserSpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const speechWindow = window as Window & typeof globalThis & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
};

export const postProcessVoiceTranscript = (transcript: string): string => normalizeAviationText(transcript);

export const createVoiceRecognitionController = (
  options: VoiceRecognitionOptions = {}
): VoiceRecognitionController => {
  const Recognition = getSpeechRecognitionConstructor();

  if (!Recognition) {
    return {
      isSupported: false,
      start: () => undefined,
      stop: () => undefined,
      abort: () => undefined
    };
  }

  const recognition = new Recognition();
  recognition.lang = options.language ?? "en-US";
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
    const result = event.results[event.results.length - 1]?.[0];

    if (!result) {
      return;
    }

    const confidence = Number.isFinite(result.confidence) ? result.confidence : 0;
    const normalizedTranscript = postProcessVoiceTranscript(result.transcript);
    const minConfidence = options.minConfidence ?? DEFAULT_MIN_CONFIDENCE;

    options.onResult?.({
      transcript: result.transcript,
      normalizedTranscript,
      confidence,
      isHighConfidence: confidence >= minConfidence
    });
  };

  recognition.onerror = (event: Event) => {
    options.onError?.(event);
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  return {
    isSupported: true,
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort()
  };
};
