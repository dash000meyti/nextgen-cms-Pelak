"use client";

import { useState } from "react";
import {
  QUESTION_ANSWER_CLASS,
  QUESTION_HEADER_CLASS,
  QUESTION_ICON_CLASS,
  QUESTION_SHELL_CLASS,
} from "@/components/article/blockStyles";
import { BlockPlainTextarea } from "../BlockPlainTextarea";
import type { BlockEditorProps } from "../blockTypes";

type IconProps = { className?: string };

function QuestionMarkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.5 2.5 0 1 1 3.4 2.3c-.7.4-.9.8-.9 1.5v.5" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
    <div className={`${QUESTION_SHELL_CLASS} !my-0`}>
      <div className={QUESTION_HEADER_CLASS}>
        <span className={QUESTION_ICON_CLASS}>
          <QuestionMarkIcon className="h-5 w-5" />
        </span>
        <BlockPlainTextarea
          id={`block-question-content-${blockId}`}
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          rows={1}
          placeholder="متن پرسش…"
          className="m-0 min-w-0 flex-1 font-heading"
        />
      </div>

      <div className={`${QUESTION_ANSWER_CLASS} space-y-2`}>
        {showAnswer ? (
          <BlockPlainTextarea
            id={`block-question-answer-${blockId}`}
            value={block.answer ?? ""}
            onChange={(e) =>
              onChange({
                ...block,
                answer: e.target.value || undefined,
              })
            }
            rows={3}
            placeholder="متن پاسخ…"
            className="w-full"
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
    </div>
  );
}
