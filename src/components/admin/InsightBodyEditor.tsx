"use client";

import { useEffect } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import { DOMParser as PMDOMParser } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { resolveCtaHref } from "@/lib/insightCtaRoutes";

// Real WYSIWYG replacement for the old plain-text-convention Body textarea
// (short unpunctuated line = heading, "-> " = CTA button, etc). The admin
// selects text and clicks a toolbar button instead of typing a convention —
// this is what the post page's body_html branch renders directly.
const CTA_PRESETS = [
  { label: "Hiring Cost Calculator", href: "/resources/hiring-cost-calculator" },
  { label: "Interview Kit / Questions", href: "/resources/ai-interview-generator" },
  { label: "Insights Home", href: "/insights" },
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// A paste is still recognized as "plain convention text" even when the
// clipboard also carries simple auto-generated HTML (a lone <p>/<div>/<span>
// wrapper, no real formatting) — only a paste that already carries actual
// rich markup skips this and falls through to Tiptap's normal paste handling,
// so pasting from another richly formatted source isn't flattened.
function clipboardHtmlIsPlain(html: string): boolean {
  return !/<(strong|b|em|i|a\s|a>|ul|ol|table|h1|h2|h3|blockquote)[\s>]/i.test(html);
}

// Upgrades pasted plain text written in the old convention (a short
// unpunctuated line is a heading, "-> "/"→ " starts a CTA button) into real
// nodes, so admins can keep pasting drafts from ChatGPT/docs in that shape
// instead of only being able to build structure via the toolbar.
function convertConventionTextToHtml(text: string): string {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (/^(→|->)\s*/.test(line)) {
        const label = line.replace(/^(→|->)\s*/, "");
        return `<p><a href="${resolveCtaHref(label)}" class="cta-button">${escapeHtml(label)}</a></p>`;
      }
      const isHeading = line.length <= 70 && !/[.!,;:]$/.test(line);
      return isHeading ? `<h2>${escapeHtml(line)}</h2>` : `<p>${escapeHtml(line)}</p>`;
    })
    .join("");
}

function ToolbarButton({
  active, onClick, title, children,
}: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`min-w-[28px] px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
        active ? "bg-navy text-white" : "text-navy/70 hover:bg-navy/10"
      }`}
    >
      {children}
    </button>
  );
}

export default function InsightBodyEditor({
  value, onChange,
}: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, strike: false }),
      Link.configure({ openOnClick: false, autolink: false, HTMLAttributes: { target: null, rel: "noopener noreferrer" } }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "insight-editor min-h-[280px] px-3 py-2.5 text-sm text-navy focus:outline-none " +
          "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy " +
          "[&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy " +
          "[&_p]:mb-3 [&_p]:leading-relaxed " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 " +
          "[&_blockquote]:border-l-4 [&_blockquote]:border-steel/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-navy/70 " +
          "[&_hr]:my-4 [&_hr]:border-navy/15 " +
          "[&_a]:text-blue-600 [&_a]:underline " +
          "[&_a.cta-button]:inline-block [&_a.cta-button]:no-underline [&_a.cta-button]:rounded-full [&_a.cta-button]:bg-navy [&_a.cta-button]:px-4 [&_a.cta-button]:py-1.5 [&_a.cta-button]:text-white [&_a.cta-button]:font-semibold",
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain") ?? "";
        const html = event.clipboardData?.getData("text/html") ?? "";
        if (!text.trim() || !clipboardHtmlIsPlain(html)) return false;

        const dom = document.createElement("div");
        dom.innerHTML = convertConventionTextToHtml(text);
        const slice = PMDOMParser.fromSchema(view.state.schema).parseSlice(dom, { preserveWhitespace: true });
        view.dispatch(view.state.tr.replaceSelection(slice));
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
  }, [value, editor]);

  const EMPTY_STATE = {
    bold: false, italic: false, h2: false, h3: false,
    bulletList: false, orderedList: false, blockquote: false, link: false,
  };
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor?.isActive("bold") ?? false,
      italic: ctx.editor?.isActive("italic") ?? false,
      h2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      h3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: ctx.editor?.isActive("bulletList") ?? false,
      orderedList: ctx.editor?.isActive("orderedList") ?? false,
      blockquote: ctx.editor?.isActive("blockquote") ?? false,
      link: ctx.editor?.isActive("link") ?? false,
    }),
  }) ?? EMPTY_STATE;

  if (!editor) return null;

  const insertLink = () => {
    const attrs = editor.getAttributes("link");
    const previousHref = (attrs.href as string | undefined) ?? "";
    const url = window.prompt("Link URL", previousHref || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    // Preserve the cta-button class if the cursor is inside an existing
    // button — otherwise re-pointing a button's URL through this button
    // would silently demote it back to a plain text link.
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim(), class: (attrs.class as string) ?? null }).run();
  };

  const insertCtaButton = (presetHref: string) => {
    let href = presetHref;
    if (href === "custom") {
      const url = window.prompt("Button destination (e.g. /seek-talent or https://...)");
      if (!url || !url.trim()) return;
      href = url.trim();
    }

    // Cursor already sitting inside an existing button: re-point it to the
    // new destination and keep its current label — don't insert a second one.
    if (state.link && editor.getAttributes("link").class === "cta-button") {
      editor.chain().focus().extendMarkRange("link").setLink({ href, class: "cta-button" }).run();
      return;
    }

    const { from, to } = editor.state.selection;
    if (from === to) {
      const label = window.prompt("Button text", "Learn more");
      if (!label || !label.trim()) return;
      const insertFrom = from;
      editor.chain().focus().insertContent(label.trim()).run();
      const insertTo = editor.state.selection.to;
      editor
        .chain()
        .focus()
        .setTextSelection({ from: insertFrom, to: insertTo })
        .extendMarkRange("link")
        .setLink({ href, class: "cta-button" })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href, class: "cta-button" }).run();
    }
  };

  return (
    <div className="rounded-lg border border-navy/10 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-navy/10 bg-mist/60 px-2 py-1.5">
        <ToolbarButton active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
          B
        </ToolbarButton>
        <ToolbarButton active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-navy/10" />
        <ToolbarButton active={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading">
          H2
        </ToolbarButton>
        <ToolbarButton active={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Subheading">
          H3
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-navy/10" />
        <ToolbarButton active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          • List
        </ToolbarButton>
        <ToolbarButton active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          1. List
        </ToolbarButton>
        <ToolbarButton active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
          &ldquo;&rdquo;
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          —
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-navy/10" />
        <ToolbarButton active={state.link} onClick={insertLink} title="Insert / edit link">
          Link
        </ToolbarButton>
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) insertCtaButton(e.target.value);
            e.target.value = "";
          }}
          title="Insert CTA button"
          className="rounded-md border border-navy/10 bg-white px-1.5 py-1 text-xs text-navy/70"
        >
          <option value="" disabled>
            + CTA Button
          </option>
          {CTA_PRESETS.map((p) => (
            <option key={p.href} value={p.href}>
              {p.label}
            </option>
          ))}
          <option value="custom">Custom URL…</option>
        </select>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
