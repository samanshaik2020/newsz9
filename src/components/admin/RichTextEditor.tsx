"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  ImageIcon,
  Link,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Quote,
  Undo,
  Redo,
  Type,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function isActive(command: string) {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Toolbar button                                                        */
/* ------------------------------------------------------------------ */

function ToolBtn({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // keep focus in editor
        onClick();
      }}
      className={[
        "flex h-8 w-8 items-center justify-center rounded transition-colors",
        active
          ? "bg-red-700 text-white"
          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
      ].join(" ")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-6 w-px self-center bg-zinc-200" />;
}

/* ------------------------------------------------------------------ */
/* Link dialog                                                           */
/* ------------------------------------------------------------------ */

function LinkDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (url: string, text: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState("https://");
  const [text, setText] = useState("");

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg">
      <p className="mb-3 text-sm font-bold text-zinc-800">Insert Link</p>
      <label className="mb-2 grid gap-1 text-xs font-medium text-zinc-600">
        URL
        <input
          autoFocus
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-red-700"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onConfirm(url, text);
            }
            if (e.key === "Escape") onCancel();
          }}
        />
      </label>
      <label className="mb-3 grid gap-1 text-xs font-medium text-zinc-600">
        Display text (optional — uses selection if empty)
        <input
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-red-700"
          placeholder="Link text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onConfirm(url, text);
            }
            if (e.key === "Escape") onCancel();
          }}
        />
      </label>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800"
          onClick={() => onConfirm(url, text)}
        >
          Insert
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Image dialog                                                          */
/* ------------------------------------------------------------------ */

type ImgSize = "small" | "medium" | "full" | "wide";
type ImgAlign = "left" | "center" | "right";

const IMG_SIZE_CLASS: Record<ImgSize, string> = {
  small:  "article-img article-img--small",
  medium: "article-img article-img--medium",
  full:   "article-img article-img--full",
  wide:   "article-img article-img--wide",
};

function ImageDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (html: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl]         = useState("");
  const [caption, setCaption] = useState("");
  const [size, setSize]       = useState<ImgSize>("full");
  const [align, setAlign]     = useState<ImgAlign>("center");
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
    const data = (await res.json()) as { publicUrl?: string };
    if (data.publicUrl) setUrl(data.publicUrl);
    setUploading(false);
  }

  function buildHtml() {
    if (!url) return "";
    const cls = IMG_SIZE_CLASS[size];
    const alignStyle = align === "left" ? "margin-right:auto" : align === "right" ? "margin-left:auto" : "margin:0 auto";
    const imgTag = `<img src="${url}" alt="${caption || ""}" class="${cls}" style="display:block;${alignStyle}" />`;
    const fig = caption
      ? `<figure class="${cls}" style="${alignStyle};display:block">${imgTag}<figcaption>${caption}</figcaption></figure>`
      : `<div class="${cls}" style="${alignStyle};display:block">${imgTag}</div>`;
    return fig;
  }

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-96 rounded-lg border border-zinc-200 bg-white p-4 shadow-xl">
      <p className="mb-3 text-sm font-bold text-zinc-800">Insert Image</p>

      <label className="mb-2 grid gap-1 text-xs font-medium text-zinc-600">
        Image URL
        <input
          autoFocus
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-red-700"
          placeholder="https://example.com/photo.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>

      <label className="mb-2 grid gap-1 text-xs font-medium text-zinc-600">
        Or upload a file
        <input
          type="file"
          accept="image/*"
          className="text-xs"
          disabled={uploading}
          onChange={handleFileChange}
        />
        {uploading && <span className="text-xs text-zinc-400">Uploading…</span>}
      </label>

      <label className="mb-2 grid gap-1 text-xs font-medium text-zinc-600">
        Caption (optional)
        <input
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-red-700"
          placeholder="Photo credit or description"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </label>

      <div className="mb-3 flex gap-3">
        <label className="grid gap-1 text-xs font-medium text-zinc-600">
          Size
          <select
            className="rounded border border-zinc-300 px-2 py-1 text-xs"
            value={size}
            onChange={(e) => setSize(e.target.value as ImgSize)}
          >
            <option value="small">Small (33%)</option>
            <option value="medium">Medium (60%)</option>
            <option value="full">Full width</option>
            <option value="wide">Wide (breakout)</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-zinc-600">
          Alignment
          <select
            className="rounded border border-zinc-300 px-2 py-1 text-xs"
            value={align}
            onChange={(e) => setAlign(e.target.value as ImgAlign)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>

      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="preview" className="mb-3 max-h-32 w-full rounded border border-zinc-200 object-contain" />
      )}

      <div className="flex justify-end gap-2">
        <button type="button" className="rounded px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100" onClick={onCancel}>Cancel</button>
        <button
          type="button"
          disabled={!url}
          className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-40"
          onClick={() => onConfirm(buildHtml())}
        >
          Insert Image
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Highlight colour picker                                              */
/* ------------------------------------------------------------------ */

const HIGHLIGHT_COLORS = [
  { label: "Yellow", color: "#fef08a" },
  { label: "Green", color: "#bbf7d0" },
  { label: "Blue", color: "#bae6fd" },
  { label: "Pink", color: "#fbcfe8" },
  { label: "Orange", color: "#fed7aa" },
  { label: "None", color: "transparent" },
];

function ColorPicker({
  onPick,
  onClose,
}: {
  onPick: (color: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-0 top-full z-50 mt-1 flex gap-1.5 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
      {HIGHLIGHT_COLORS.map(({ label, color }) => (
        <button
          key={label}
          type="button"
          title={label}
          className="h-6 w-6 rounded-full border border-zinc-300 transition-transform hover:scale-110"
          style={{ background: color === "transparent" ? "white" : color }}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(color);
            onClose();
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Font-size selector                                                   */
/* ------------------------------------------------------------------ */

const FONT_SIZES = ["1", "2", "3", "4", "5", "6", "7"];
const FONT_SIZE_LABELS: Record<string, string> = {
  "1": "Tiny",
  "2": "Small",
  "3": "Normal",
  "4": "Large",
  "5": "Larger",
  "6": "Huge",
  "7": "Giant",
};

/* ------------------------------------------------------------------ */
/* Main component                                                        */
/* ------------------------------------------------------------------ */

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your article content here…",
  minHeight = "320px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLink, setShowLink]   = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showImage, setShowImage]  = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [, forceUpdate] = useState(0);

  // Initialise editor with existing HTML value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0).cloneRange());
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (!savedRange) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(savedRange);
    editorRef.current?.focus();
  }, [savedRange]);

  const handleInput = useCallback(() => {
    onChange(editorRef.current?.innerHTML ?? "");
    forceUpdate((n) => n + 1);
  }, [onChange]);

  /* Link insert */
  function handleLinkConfirm(url: string, displayText: string) {
    restoreSelection();
    setShowLink(false);

    const sel = window.getSelection();
    const hasSelection = sel && sel.toString().trim().length > 0;

    if (!hasSelection && displayText) {
      // No selection — insert a new anchor element
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.textContent = displayText || url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      const range = sel?.getRangeAt(0);
      if (range) {
        range.deleteContents();
        range.insertNode(anchor);
        range.setStartAfter(anchor);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    } else {
      // Wrap selection in an anchor
      exec("createLink", url);
      // Make target _blank on the newly created link
      const links = editorRef.current?.querySelectorAll("a");
      links?.forEach((a) => {
        if (a.href === url || a.getAttribute("href") === url) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
      });
    }
    handleInput();
  }

  /* Heading helper */
  function insertHeading(tag: "h1" | "h2" | "h3") {
    exec("formatBlock", tag);
    handleInput();
  }

  /* Highlight */
  function applyHighlight(color: string) {
    if (color === "transparent") {
      exec("removeFormat");
    } else {
      exec("hiliteColor", color);
    }
    handleInput();
  }

  const iconSize = 14;

  return (
    <div className="grid gap-2 text-sm font-bold text-zinc-800">
      Full Article
      <div className="overflow-hidden rounded-md border border-zinc-300 focus-within:border-red-700">
        {/* ── Toolbar ── */}
        <div className="relative flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
          {/* History */}
          <ToolBtn title="Undo (Ctrl+Z)" onClick={() => exec("undo")}>
            <Undo size={iconSize} />
          </ToolBtn>
          <ToolBtn title="Redo (Ctrl+Y)" onClick={() => exec("redo")}>
            <Redo size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Inline formatting */}
          <ToolBtn
            title="Bold (Ctrl+B)"
            active={isActive("bold")}
            onClick={() => { exec("bold"); handleInput(); }}
          >
            <Bold size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="Italic (Ctrl+I)"
            active={isActive("italic")}
            onClick={() => { exec("italic"); handleInput(); }}
          >
            <Italic size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="Underline (Ctrl+U)"
            active={isActive("underline")}
            onClick={() => { exec("underline"); handleInput(); }}
          >
            <Underline size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="Strikethrough"
            active={isActive("strikeThrough")}
            onClick={() => { exec("strikeThrough"); handleInput(); }}
          >
            <Strikethrough size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Highlight */}
          <div className="relative">
            <ToolBtn
              title="Highlight"
              active={showColors}
              onClick={() => {
                saveSelection();
                setShowColors((v) => !v);
                setShowLink(false);
              }}
            >
              <Highlighter size={iconSize} />
            </ToolBtn>
            {showColors && (
              <ColorPicker
                onPick={applyHighlight}
                onClose={() => setShowColors(false)}
              />
            )}
          </div>

          <Divider />

          {/* Headings */}
          <ToolBtn title="Heading 1" onClick={() => insertHeading("h1")}>
            <Heading1 size={iconSize} />
          </ToolBtn>
          <ToolBtn title="Heading 2" onClick={() => insertHeading("h2")}>
            <Heading2 size={iconSize} />
          </ToolBtn>
          <ToolBtn title="Heading 3" onClick={() => insertHeading("h3")}>
            <Heading3 size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="Paragraph"
            onClick={() => { exec("formatBlock", "p"); handleInput(); }}
          >
            <Type size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Font size */}
          <select
            title="Font size"
            className="h-8 rounded border border-zinc-200 bg-white px-1 text-xs text-zinc-700 outline-none focus:border-red-700"
            defaultValue="3"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              exec("fontSize", e.target.value);
              handleInput();
            }}
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {FONT_SIZE_LABELS[s]}
              </option>
            ))}
          </select>

          <Divider />

          {/* Alignment */}
          <ToolBtn
            title="Align left"
            active={isActive("justifyLeft")}
            onClick={() => { exec("justifyLeft"); handleInput(); }}
          >
            <AlignLeft size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="Align center"
            active={isActive("justifyCenter")}
            onClick={() => { exec("justifyCenter"); handleInput(); }}
          >
            <AlignCenter size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="Align right"
            active={isActive("justifyRight")}
            onClick={() => { exec("justifyRight"); handleInput(); }}
          >
            <AlignRight size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="Justify"
            active={isActive("justifyFull")}
            onClick={() => { exec("justifyFull"); handleInput(); }}
          >
            <AlignJustify size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Lists */}
          <ToolBtn
            title="Bullet list"
            active={isActive("insertUnorderedList")}
            onClick={() => { exec("insertUnorderedList"); handleInput(); }}
          >
            <List size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="Numbered list"
            active={isActive("insertOrderedList")}
            onClick={() => { exec("insertOrderedList"); handleInput(); }}
          >
            <ListOrdered size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Block extras */}
          <ToolBtn
            title="Blockquote"
            onClick={() => { exec("formatBlock", "blockquote"); handleInput(); }}
          >
            <Quote size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="Horizontal rule"
            onClick={() => { exec("insertHorizontalRule"); handleInput(); }}
          >
            <Minus size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Links */}
          <div className="relative">
            <ToolBtn
              title="Insert link"
              onClick={() => {
                saveSelection();
                setShowLink((v) => !v);
                setShowColors(false);
                setShowImage(false);
              }}
            >
              <Link size={iconSize} />
            </ToolBtn>
            {showLink && (
              <LinkDialog
                onConfirm={handleLinkConfirm}
                onCancel={() => setShowLink(false)}
              />
            )}
          </div>
          <ToolBtn
            title="Remove link"
            onClick={() => { exec("unlink"); handleInput(); }}
          >
            <Unlink size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Insert Image */}
          <div className="relative">
            <ToolBtn
              title="Insert image"
              active={showImage}
              onClick={() => {
                saveSelection();
                setShowImage((v) => !v);
                setShowLink(false);
                setShowColors(false);
              }}
            >
              <ImageIcon size={iconSize} />
            </ToolBtn>
            {showImage && (
              <ImageDialog
                onConfirm={(html) => {
                  restoreSelection();
                  setShowImage(false);
                  exec("insertHTML", html);
                  handleInput();
                }}
                onCancel={() => setShowImage(false)}
              />
            )}
          </div>
        </div>

        {/* ── Editable area ── */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          className="rich-editor min-h-[320px] px-4 py-3 text-sm font-normal text-zinc-900 outline-none"
          style={{ minHeight }}
          onInput={handleInput}
          onKeyUp={() => forceUpdate((n) => n + 1)}
          onMouseUp={() => forceUpdate((n) => n + 1)}
          onFocus={() => setShowColors(false)}
          onBlur={() => {
            // close popovers when focus leaves editor (not into a popover)
          }}
        />
      </div>

      <style>{`
        .rich-editor:empty:before {
          content: attr(data-placeholder);
          color: #a1a1aa;
          pointer-events: none;
        }
        .rich-editor h1 { font-size: 2em; font-weight: 800; line-height: 1.2; margin: 0.5em 0; }
        .rich-editor h2 { font-size: 1.5em; font-weight: 700; line-height: 1.3; margin: 0.5em 0; }
        .rich-editor h3 { font-size: 1.25em; font-weight: 600; line-height: 1.4; margin: 0.5em 0; }
        .rich-editor p  { margin: 0.4em 0; }
        .rich-editor blockquote {
          border-left: 4px solid #dc2626;
          margin: 0.8em 0;
          padding: 0.3em 1em;
          color: #52525b;
          font-style: italic;
          background: #fef2f2;
          border-radius: 0 4px 4px 0;
        }
        .rich-editor a { color: #dc2626; text-decoration: underline; }
        .rich-editor ul { list-style: disc; padding-left: 1.5em; margin: 0.4em 0; }
        .rich-editor ol { list-style: decimal; padding-left: 1.5em; margin: 0.4em 0; }
        .rich-editor hr { border: none; border-top: 2px solid #e4e4e7; margin: 1em 0; }
        .rich-editor img { max-width:100%; height:auto; border-radius:4px; margin:0.6em 0; }
        .rich-editor figure { margin:1em 0; }
        .rich-editor figcaption { font-size:0.78em; color:#71717a; text-align:center; margin-top:0.3em; font-style:italic; }
      `}</style>
    </div>
  );
}
