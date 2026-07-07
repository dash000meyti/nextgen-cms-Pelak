"use client";

import { useState } from "react";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import type { BlockEditorProps } from "../blockTypes";

export function QuestionBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  const [showAnswer, setShowAnswer] = useState(() =>
    rawBlock.type === "question" ? Boolean(rawBlock.answer) : false,
  );
  if (rawBlock.type !== "question") return null;
  const block = rawBlock;

  return (
    <div className="space-y-2">
      <TextareaField
        id={`block-question-content-${blockId}`}
        label="پرسش"
        value={block.content}
        onChange={(content) => onChange({ ...block, content })}
        rows={2}
        placeholder="متن پرسش…"
        required
      />
      {showAnswer ? (
        <TextareaField
          id={`block-question-answer-${blockId}`}
          label="پاسخ"
          value={block.answer ?? ""}
          onChange={(answer) => onChange({ ...block, answer })}
          rows={4}
          placeholder="متن پاسخ…"
        />
      ) : null}
      <button
        type="button"
        onClick={() => {
          const next = !showAnswer;
          setShowAnswer(next);
          if (!next) {
            onChange({ type: "question", content: block.content });
          }
        }}
        className="text-xs text-accent hover:underline"
      >
        {showAnswer ? "حذف پاسخ" : "+ افزودن پاسخ"}
      </button>
    </div>
  );
}
