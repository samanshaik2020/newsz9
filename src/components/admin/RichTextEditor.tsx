"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ARTICLE_FONT_FAMILIES,
  ARTICLE_FONT_SIZES,
  getArticleFontSize,
  sanitizeArticleFontFamily,
} from "@/lib/article-formatting";
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
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
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
      <p className="mb-3 text-sm font-bold text-zinc-800">లింకు జోడించండి</p>
      <label className="mb-2 grid gap-1 text-xs font-medium text-zinc-600">
        లింకు
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
        లింకుకు తెలుగు పేరు
        <input
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-red-700"
          placeholder="తెలుగు లింకు పేరు"
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
          రద్దు
        </button>
        <button
          type="button"
          className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800"
          onClick={() => onConfirm(url, text)}
        >
          జోడించండి
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
      <p className="mb-3 text-sm font-bold text-zinc-800">చిత్రం జోడించండి</p>

      <label className="mb-2 grid gap-1 text-xs font-medium text-zinc-600">
        చిత్రం లింకు
        <input
          autoFocus
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-red-700"
          placeholder="https://example.com/photo.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>

      <label className="mb-2 grid gap-1 text-xs font-medium text-zinc-600">
        లేదా చిత్రం అప్‌లోడ్ చేయండి
        <input
          type="file"
          accept="image/*"
          className="text-xs"
          disabled={uploading}
          onChange={handleFileChange}
        />
        {uploading && <span className="text-xs text-zinc-400">అప్‌లోడ్ అవుతోంది…</span>}
      </label>

      <label className="mb-2 grid gap-1 text-xs font-medium text-zinc-600">
        చిత్రానికి తెలుగు వివరణ, మూలం
        <input
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-red-700"
          placeholder="చిత్ర వివరణ, మూలం తెలుగులో"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </label>

      <div className="mb-3 flex gap-3">
        <label className="grid gap-1 text-xs font-medium text-zinc-600">
          పరిమాణం
          <select
            className="rounded border border-zinc-300 px-2 py-1 text-xs"
            value={size}
            onChange={(e) => setSize(e.target.value as ImgSize)}
          >
            <option value="small">చిన్నది (33%)</option>
            <option value="medium">మధ్యస్థం (60%)</option>
            <option value="full">పూర్తి వెడల్పు</option>
            <option value="wide">విస్తృత చిత్రం</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-zinc-600">
          అమరిక
          <select
            className="rounded border border-zinc-300 px-2 py-1 text-xs"
            value={align}
            onChange={(e) => setAlign(e.target.value as ImgAlign)}
          >
            <option value="left">ఎడమ</option>
            <option value="center">మధ్య</option>
            <option value="right">కుడి</option>
          </select>
        </label>
      </div>

      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="preview" className="mb-3 max-h-32 w-full rounded border border-zinc-200 object-contain" />
      )}

      <div className="flex justify-end gap-2">
        <button type="button" className="rounded px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100" onClick={onCancel}>రద్దు</button>
        <button
          type="button"
          disabled={!url}
          className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-40"
          onClick={() => onConfirm(buildHtml())}
        >
          చిత్రం జోడించండి
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Highlight colour picker                                              */
/* ------------------------------------------------------------------ */

const HIGHLIGHT_COLORS = [
  { label: "పసుపు", color: "#fef08a" },
  { label: "ఆకుపచ్చ", color: "#bbf7d0" },
  { label: "నీలం", color: "#bae6fd" },
  { label: "గులాబీ", color: "#fbcfe8" },
  { label: "నారింజ", color: "#fed7aa" },
  { label: "ఏదీ వద్దు", color: "transparent" },
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

function serializeEditorHtml(editor: HTMLDivElement) {
  // Normalize a copy so selections, typing at the caret, and native undo survive.
  const copy = editor.cloneNode(true) as HTMLDivElement;
  copy.querySelectorAll("font").forEach((font) => {
    const size = getArticleFontSize(font.getAttribute("size") ?? "");
    const family = sanitizeArticleFontFamily(font.getAttribute("face") ?? "");
    const span = document.createElement("span");

    span.style.cssText = font.getAttribute("style") ?? "";
    if (size) span.style.fontSize = size;
    if (family) span.style.fontFamily = family;
    span.append(...Array.from(font.childNodes));
    font.replaceWith(span);
  });
  return copy.innerHTML;
}

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
  const savedRangeRef = useRef<Range | null>(null);
  const lastValueRef = useRef(value);
  const [fontSize, setFontSize] = useState("");
  const [fontFamily, setFontFamily] = useState("");
  const [, forceUpdate] = useState(0);

  // Sync externally loaded drafts without resetting the caret on every keystroke.
  useEffect(() => {
    if (editorRef.current && (lastValueRef.current !== value || !editorRef.current.innerHTML)) {
      editorRef.current.innerHTML = value;
      savedRangeRef.current = null;
    }
    lastValueRef.current = value;
  }, [value]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    const editor = editorRef.current;
    if (editor && sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editor.contains(range.startContainer) && editor.contains(range.endContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    const savedRange = savedRangeRef.current;
    if (!editor) return;
    editor.focus();
    if (!savedRange || !editor.contains(savedRange.commonAncestorContainer)) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }, []);

  const updateSelection = useCallback(() => {
    saveSelection();
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.anchorNode || !editor.contains(selection.anchorNode)) return;
    const element = selection.anchorNode instanceof Element
      ? selection.anchorNode
      : selection.anchorNode.parentElement;
    if (element) {
      const styles = window.getComputedStyle(element);
      const pixels = parseFloat(styles.fontSize);
      const rootPixels = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
      setFontSize(ARTICLE_FONT_SIZES.find((size) => Math.abs(parseFloat(size.style) * rootPixels - pixels) < 0.5)?.value ?? "");
      setFontFamily(sanitizeArticleFontFamily(styles.fontFamily.split(",")[0]) ?? "");
    }
    forceUpdate((n) => n + 1);
  }, [saveSelection]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateSelection);
    return () => document.removeEventListener("selectionchange", updateSelection);
  }, [updateSelection]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = serializeEditorHtml(editorRef.current);
    lastValueRef.current = html;
    onChange(html);
    saveSelection();
    forceUpdate((n) => n + 1);
  }, [onChange, saveSelection]);

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

  function applyFontSize(size: string) {
    if (!getArticleFontSize(size)) return;
    restoreSelection();
    exec("styleWithCSS", "false");
    exec("fontSize", size);
    handleInput();
    setFontSize(size);
  }

  function applyFontFamily(family: string) {
    if (!sanitizeArticleFontFamily(family)) return;
    restoreSelection();
    exec("styleWithCSS", "false");
    exec("fontName", family);
    handleInput();
    setFontFamily(family);
  }

  const iconSize = 14;

  return (
    <div className="grid gap-2 text-sm font-bold text-zinc-800">
      పూర్తి కథనం
      <div className="overflow-hidden rounded-md border border-zinc-300 focus-within:border-red-700">
        {/* ── Toolbar ── */}
        <div className="relative flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
          {/* History */}
          <ToolBtn title="చర్య వెనక్కి (Ctrl+Z)" onClick={() => { restoreSelection(); exec("undo"); handleInput(); }}>
            <Undo size={iconSize} />
          </ToolBtn>
          <ToolBtn title="చర్య మళ్లీ (Ctrl+Y)" onClick={() => { restoreSelection(); exec("redo"); handleInput(); }}>
            <Redo size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Inline formatting */}
          <ToolBtn
            title="మందమైన అక్షరాలు (Ctrl+B)"
            active={isActive("bold")}
            onClick={() => { exec("bold"); handleInput(); }}
          >
            <Bold size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="వాలు అక్షరాలు (Ctrl+I)"
            active={isActive("italic")}
            onClick={() => { exec("italic"); handleInput(); }}
          >
            <Italic size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="కింద గీత (Ctrl+U)"
            active={isActive("underline")}
            onClick={() => { exec("underline"); handleInput(); }}
          >
            <Underline size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="మధ్య గీత"
            active={isActive("strikeThrough")}
            onClick={() => { exec("strikeThrough"); handleInput(); }}
          >
            <Strikethrough size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Highlight */}
          <div className="relative">
            <ToolBtn
              title="రంగు గుర్తింపు"
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
          <ToolBtn title="ఉపశీర్షిక" onClick={() => insertHeading("h2")}>
            <Heading2 size={iconSize} />
          </ToolBtn>
          <ToolBtn title="చిన్న ఉపశీర్షిక" onClick={() => insertHeading("h3")}>
            <Heading3 size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="పేరా"
            onClick={() => { exec("formatBlock", "p"); handleInput(); }}
          >
            <Type size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Font size */}
          <select
            title="అక్షర రూపం"
            aria-label="అక్షర రూపం"
            className="h-8 rounded border border-zinc-200 bg-white px-1 text-xs text-zinc-700 outline-none focus:border-red-700"
            value={fontFamily}
            onPointerDown={saveSelection}
            onFocus={saveSelection}
            onChange={(e) => applyFontFamily(e.target.value)}
          >
            <option value="" disabled>అక్షర రూపం</option>
            {ARTICLE_FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
          <select
            title="అక్షర పరిమాణం"
            aria-label="అక్షర పరిమాణం"
            className="h-8 rounded border border-zinc-200 bg-white px-1 text-xs text-zinc-700 outline-none focus:border-red-700"
            value={fontSize}
            onPointerDown={saveSelection}
            onFocus={saveSelection}
            onChange={(e) => {
              applyFontSize(e.target.value);
            }}
          >
            <option value="" disabled>అక్షర పరిమాణం</option>
            {ARTICLE_FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>

          <Divider />

          {/* Alignment */}
          <ToolBtn
            title="ఎడమ అమరిక"
            active={isActive("justifyLeft")}
            onClick={() => { exec("justifyLeft"); handleInput(); }}
          >
            <AlignLeft size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="మధ్య అమరిక"
            active={isActive("justifyCenter")}
            onClick={() => { exec("justifyCenter"); handleInput(); }}
          >
            <AlignCenter size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="కుడి అమరిక"
            active={isActive("justifyRight")}
            onClick={() => { exec("justifyRight"); handleInput(); }}
          >
            <AlignRight size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="రెండు అంచుల అమరిక"
            active={isActive("justifyFull")}
            onClick={() => { exec("justifyFull"); handleInput(); }}
          >
            <AlignJustify size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Lists */}
          <ToolBtn
            title="అంశాల జాబితా"
            active={isActive("insertUnorderedList")}
            onClick={() => { exec("insertUnorderedList"); handleInput(); }}
          >
            <List size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="సంఖ్యల జాబితా"
            active={isActive("insertOrderedList")}
            onClick={() => { exec("insertOrderedList"); handleInput(); }}
          >
            <ListOrdered size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Block extras */}
          <ToolBtn
            title="ఉల్లేఖనం"
            onClick={() => { exec("formatBlock", "blockquote"); handleInput(); }}
          >
            <Quote size={iconSize} />
          </ToolBtn>
          <ToolBtn
            title="విభజన గీత"
            onClick={() => { exec("insertHorizontalRule"); handleInput(); }}
          >
            <Minus size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Links */}
          <div className="relative">
            <ToolBtn
              title="లింకు జోడించండి"
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
            title="లింకు తొలగించండి"
            onClick={() => { exec("unlink"); handleInput(); }}
          >
            <Unlink size={iconSize} />
          </ToolBtn>

          <Divider />

          {/* Insert Image */}
          <div className="relative">
            <ToolBtn
              title="చిత్రం జోడించండి"
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
          role="textbox"
          aria-label="పూర్తి కథనం"
          aria-multiline="true"
          suppressContentEditableWarning
          data-placeholder={placeholder}
          className="rich-editor min-h-[320px] px-4 py-3 text-base font-normal text-zinc-900 outline-none"
          style={{ minHeight }}
          onInput={handleInput}
          onKeyUp={updateSelection}
          onMouseUp={updateSelection}
          onFocus={() => setShowColors(false)}
          onBlur={saveSelection}
        />
      </div>

      <style>{`
        ${ARTICLE_FONT_SIZES.map((size) => `.rich-editor font[size="${size.value}"] { font-size: ${size.style}; }`).join("\n")}
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
