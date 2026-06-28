"use client";

import type { NavSection } from "@nextgen-cms/contract/types/site";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type MobileNavProps = {
  navSections: NavSection[];
  currentIssueLabel: string;
};

export function MobileNav({ navSections, currentIssueLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "بستن منو" : "باز کردن منو"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rule text-ink-muted transition-colors hover:border-accent hover:text-accent"
      >
        {open ? <CloseIcon /> : <BurgerIcon />}
      </button>

      {open && mounted
        ? createPortal(
            <div
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="منوی ناوبری"
              className="fixed inset-0 z-50 lg:hidden"
            >
              <button
                type="button"
                aria-label="بستن"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />
              <div className="absolute inset-y-0 inset-s-0 w-[82%] max-w-xs overflow-y-auto border-e border-rule bg-paper shadow-xl">
                <div className="flex h-16 items-center justify-between border-b border-rule px-4">
                  <span className="font-heading text-lg text-ink">منو</span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="بستن منو"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <nav aria-label="ناوبری موبایل" className="px-2 py-3">
                  <ul className="space-y-0.5">
                    {navSections.map((section) => (
                      <li key={section.id}>
                        <Link
                          href={section.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-md px-3 py-3 font-heading text-base text-ink transition-colors hover:bg-surface hover:text-accent"
                        >
                          {section.label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 border-t border-rule px-3 pt-4">
                    <Link
                      href="/issues"
                      onClick={() => setOpen(false)}
                      className="block rounded-md bg-accent-soft px-3 py-2.5 text-sm text-accent transition-colors hover:bg-accent hover:text-paper"
                    >
                      {currentIssueLabel}
                    </Link>
                  </div>
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function BurgerIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
