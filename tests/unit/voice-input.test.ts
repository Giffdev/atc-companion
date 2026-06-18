import { postProcessVoiceTranscript } from "@/ai/voice-input";

describe("voice input post-processing", () => {
  it("converts NATO alphabet airport spellings into airport identifiers", () => {
    expect(postProcessVoiceTranscript("kilo juliet foxtrot kilo")).toBe("KJFK");
  });

  it("converts spoken frequencies into aviation digits", () => {
    expect(postProcessVoiceTranscript("one eighteen point seven")).toBe("118.7");
  });

  it("handles mixed airport, runway, and frequency utterances", () => {
    expect(
      postProcessVoiceTranscript("kilo sierra echo alpha runway two eight right tower one one niner point niner")
    )
      .toBe("KSEA runway 28R tower 119.9");
  });
});
