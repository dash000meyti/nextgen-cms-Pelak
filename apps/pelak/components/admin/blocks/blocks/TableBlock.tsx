"use client";

import {
  TABLE_CLASS,
  TABLE_TD_CLASS,
  TABLE_TH_CLASS,
  TABLE_WRAP_CLASS,
} from "@/components/article/blockStyles";
import { BlockPlainInput } from "../BlockPlainInput";
import type { BlockEditorProps, BlockSettingsProps } from "../blockTypes";
import {
  TableAddColIcon,
  TableAddRowIcon,
  TableRemoveColIcon,
  TableRemoveRowIcon,
} from "../icons";

function emptyRow(cols: number): string[] {
  return Array.from({ length: cols }, () => "");
}

function iconBtnClass(disabled?: boolean): string {
  return [
    "inline-flex items-center justify-center rounded border border-rule p-1 text-ink-muted transition-colors hover:bg-surface-2",
    disabled ? "disabled:opacity-40" : "",
  ].join(" ");
}

export function TableSettings({ block, onChange }: BlockSettingsProps) {
  if (block.type !== "table") return null;
  const table = block;
  const colCount = table.headers.length;
  const rowCount = table.rows.length;

  function addColumn() {
    onChange({
      ...table,
      headers: [...table.headers, ""],
      rows: table.rows.map((row) => [...row, ""]),
    });
  }

  function removeColumn() {
    if (colCount <= 1) return;
    onChange({
      ...table,
      headers: table.headers.slice(0, -1),
      rows: table.rows.map((row) => row.slice(0, -1)),
    });
  }

  function addRow() {
    onChange({
      ...table,
      rows: [...table.rows, emptyRow(colCount)],
    });
  }

  function removeRow() {
    if (rowCount <= 1) return;
    onChange({
      ...table,
      rows: table.rows.slice(0, -1),
    });
  }

  return (
    <fieldset className="flex flex-col gap-1" aria-label="ابعاد جدول">
      <legend className="sr-only">ابعاد جدول</legend>
      <button
        type="button"
        onClick={addColumn}
        aria-label="افزودن ستون"
        title="افزودن ستون"
        className={iconBtnClass()}
      >
        <TableAddColIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={removeColumn}
        disabled={colCount <= 1}
        aria-label="حذف ستون"
        title="حذف ستون"
        className={iconBtnClass(colCount <= 1)}
      >
        <TableRemoveColIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={addRow}
        aria-label="افزودن ردیف"
        title="افزودن ردیف"
        className={iconBtnClass()}
      >
        <TableAddRowIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={removeRow}
        disabled={rowCount <= 1}
        aria-label="حذف ردیف"
        title="حذف ردیف"
        className={iconBtnClass(rowCount <= 1)}
      >
        <TableRemoveRowIcon className="h-3.5 w-3.5" />
      </button>
    </fieldset>
  );
}

export function TableBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  if (rawBlock.type !== "table") return null;
  const block = rawBlock;

  function updateHeader(col: number, value: string) {
    const headers = [...block.headers];
    headers[col] = value;
    onChange({ ...block, headers });
  }

  function updateCell(row: number, col: number, value: string) {
    const rows = block.rows.map((r) => [...r]);
    rows[row][col] = value;
    onChange({ ...block, rows });
  }

  return (
    <div className={`${TABLE_WRAP_CLASS} my-0!`}>
      <table className={TABLE_CLASS}>
        <thead>
          <tr>
            {block.headers.map((header, col) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: column order is authoritative
              <th key={`h-${col}`} className={TABLE_TH_CLASS} scope="col">
                <BlockPlainInput
                  id={`block-table-h-${blockId}-${col}`}
                  type="text"
                  value={header}
                  onChange={(e) => updateHeader(col, e.target.value)}
                  placeholder={`ستون ${col + 1}`}
                  aria-label={`هدر ستون ${col + 1}`}
                  className="w-full min-w-20 font-medium text-ink"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: row order is authoritative
            <tr key={`r-${rowIndex}`}>
              {row.map((cell, col) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: cell position is authoritative
                <td key={`c-${rowIndex}-${col}`} className={TABLE_TD_CLASS}>
                  <BlockPlainInput
                    id={`block-table-c-${blockId}-${rowIndex}-${col}`}
                    type="text"
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                    placeholder="…"
                    aria-label={`ردیف ${rowIndex + 1} ستون ${col + 1}`}
                    className="w-full min-w-20 text-ink"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
