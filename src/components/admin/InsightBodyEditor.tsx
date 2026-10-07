"use client";

import { useEffect } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import { DOMParser as PMDOMParser, DOMSerializer } from "@tiptap/pm/model";
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

// A paste is "rich" when the clipboard carries real formatting (links, bold,
// lists…) — e.g. copied from ChatGPT, Google Docs or a web page.
function clipboardHtmlIsPlain(html: string): boolean {
  return !/<(strong|b|em|i|a\s|a>|ul|ol|table|h1|h2|h3|blockquote)[\s>]/i.test(html);
}

// ─── Auto-format ────────────────────────────────────────────────────────────
// Same structure rules the legacy post renderer applies to old plain-text
// bodies (insights/post/[slug]/page.tsx isHeadingLine/isCtaLine), applied to
// the editor's top-level paragraphs:
//   short line, no closing punctuation      -> H2 heading
//   short line that's entirely bold         -> H2 heading
//   "→ Label" / "-> Label"                  -> CTA button
//   "- item" / "• item" / "* item" lines    -> bullet list
// Confirmed live: a post pasted with links in it skipped the old plain-text
// conversion entirely, so all 9 of its section titles stayed body paragraphs
// (0 headings, no table of contents). This now runs on rich pastes too, and
// on demand via the toolbar's Auto-format button. Existing headings, lists,
// quotes etc. are never touched — only plain top-level paragraphs.
const CTA_PREFIX = /^(→|->)\s*/;
const BULLET_PREFIX = /^[-•*]\s+/;

function isFootnoteLine(text: string): boolean {
  return /^Sources:/i.test(text) || (text.length < 220 && /(legal advice|financial advice|informational purposes only)/i.test(text));
}

function isEntirelyBold(p: Element): boolean {
  const text = (p.textContent ?? "").trim();
  if (!text) return false;
  const boldText = Array.from(p.querySelectorAll("strong, b"))
    .map((el) => el.textContent ?? "")
    .join("")
    .trim();
  return boldText.length > 0 && boldText.replace(/\s+/g, " ") === text.replace(/\s+/g, " ");
}

function looksLikeHeading(p: Element): boolean {
  const text = (p.textContent ?? "").trim();
  // A paragraph that carries a link is real content (or a CTA), not a title.
  if (!text || p.querySelector("a") || CTA_PREFIX.test(text) || isFootnoteLine(text)) return false;
  if (isEntirelyBold(p)) return text.length <= 90 && !/[.!]$/.test(text);
  return text.length <= 70 && !/[.!,;:]$/.test(text);
}

// Removes a leading prefix (bullet marker) from an element's first text node,
// keeping any inline formatting/links after it.
function stripLeadingPrefix(el: Element, prefix: RegExp) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node && !(node.textContent ?? "").trim()) node = walker.nextNode();
  if (node) node.textContent = (node.textContent ?? "").replace(/^\s+/, "").replace(prefix, "");
}

function autoFormatContainer(root: HTMLElement): HTMLElement {
  const out = document.createElement("div");
  let list: HTMLUListElement | null = null;

  for (const child of Array.from(root.childNodes)) {
    if (!(child instanceof Element) || child.tagName !== "P") {
      list = null;
      if (child instanceof Element || (child.textContent ?? "").trim()) out.appendChild(child);
      continue;
    }
    const text = (child.textContent ?? "").trim();
    if (!text) { list = null; continue; } // drop empty spacer paragraphs

    if (BULLET_PREFIX.test(text)) {
      if (!list) { list = document.createElement("ul"); out.appendChild(list); }
      stripLeadingPrefix(child, BULLET_PREFIX);
      const li = document.createElement("li");
      const p = document.createElement("p");
      p.innerHTML = child.innerHTML;
      li.appendChild(p);
      list.appendChild(li);
      continue;
    }
    list = null;

    if (CTA_PREFIX.test(text) && !child.querySelector("a")) {
      const label = text.replace(CTA_PREFIX, "");
      const p = document.createElement("p");
      p.innerHTML = `<a href="${resolveCtaHref(label)}" class="cta-button">${escapeHtml(label)}</a>`;
      out.appendChild(p);
      continue;
    }

    // Same rule the live page applies (insights/post/[slug] normalizeCtaButtons):
    // a line that's only one internal link is a CTA button; a button inside a
    // sentence is split out — the words stay in the sentence as plain text and
    // the button goes on its own line right after the paragraph.
    const anchors = Array.from(child.querySelectorAll("a"));
    const linkText = anchors.map((a) => a.textContent ?? "").join("").trim();
    if (anchors.length === 1 && linkText === text && (anchors[0].getAttribute("href") ?? "").startsWith("/")) {
      anchors[0].setAttribute("class", "cta-button");
      out.appendChild(child);
      continue;
    }
    const inlineButtons = linkText !== text ? anchors.filter((a) => a.classList.contains("cta-button")) : [];
    if (inlineButtons.length > 0) {
      const buttonParagraphs = inlineButtons.map((a) => {
        const label = (a.textContent ?? "").trim();
        const p = document.createElement("p");
        const button = document.createElement("a");
        button.setAttribute("href", a.getAttribute("href") ?? "");
        button.className = "cta-button";
        button.textContent = label.charAt(0).toUpperCase() + label.slice(1);
        p.appendChild(button);
        a.replaceWith(document.createTextNode(a.textContent ?? ""));
        return p;
      });
      out.appendChild(child);
      buttonParagraphs.forEach((p) => out.appendChild(p));
      continue;
    }

    if (looksLikeHeading(child)) {
      const h2 = document.createElement("h2");
      // Headings are already bold — unwrap <strong>/<b> so they don't double up.
      h2.innerHTML = child.innerHTML.replace(/<\/?(strong|b)(\s[^>]*)?>/gi, "");
      out.appendChild(h2);
      continue;
    }
    out.appendChild(child);
  }
  return out;
}

function autoFormatHtml(html: string): string {
  const root = document.createElement("div");
  root.innerHTML = html;
  return autoFormatContainer(root).innerHTML;
}

function plainTextToParagraphs(text: string): string {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
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
          // Same look as the live article (insights/post/[slug] RICH_BODY_CLASSNAME).
          "[&_a.cta-button]:mt-3 [&_a.cta-button]:inline-flex [&_a.cta-button]:items-center [&_a.cta-button]:no-underline [&_a.cta-button]:rounded-full [&_a.cta-button]:bg-navy [&_a.cta-button]:px-8 [&_a.cta-button]:py-4 [&_a.cta-button]:text-base [&_a.cta-button]:text-white [&_a.cta-button]:font-semibold",
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain") ?? "";
        const html = event.clipboardData?.getData("text/html") ?? "";
        // A single line (a word, a phrase, a sentence) pastes as-is — only a
        // multi-line block gets auto-formatted, so pasting a short phrase
        // mid-paragraph never turns it into a heading.
        if (!text.trim() || text.trim().split(/\r\n|\r|\n/).filter((l) => l.trim()).length < 2) return false;

        const parser = PMDOMParser.fromSchema(view.state.schema);
        const dom = document.createElement("div");
        if (html && !clipboardHtmlIsPlain(html)) {
          // Rich paste: let the editor's schema clean up the clipboard HTML
          // first (keeps links/bold, drops Docs/ChatGPT wrapper junk), then
          // apply the same structure rules to the result.
          const source = document.createElement("div");
          source.innerHTML = html;
          const cleaned = parser.parseSlice(source);
          dom.appendChild(DOMSerializer.fromSchema(view.state.schema).serializeFragment(cleaned.content));
        } else {
          dom.innerHTML = plainTextToParagraphs(text);
        }
        const slice = parser.parseSlice(autoFormatContainer(dom), { preserveWhitespace: true });
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

    // Inside an existing link/button, act on the whole link.
    if (state.link) editor.chain().focus().extendMarkRange("link").run();

    const { from, to, $from, $to } = editor.state.selection;
    const paragraphText = $from.parent.textContent.trim();
    const selectedText = editor.state.doc.textBetween(from, to, " ").trim();
    const coversWholeParagraph = $from.sameParent($to) && selectedText === paragraphText;

    // A button that's already its own line: re-point it to the new
    // destination and keep its label — don't insert a second one.
    if (state.link && coversWholeParagraph && editor.getAttributes("link").class === "cta-button") {
      editor.chain().focus().setLink({ href, class: "cta-button" }).run();
      return;
    }

    // Cursor or selection inside a sentence: a button can't live mid-sentence,
    // so the selected words stay in the sentence as plain text and the button
    // goes on its own line right after this paragraph (same as Auto-format).
    if (paragraphText && !coversWholeParagraph) {
      const typed = selectedText ? selectedText : window.prompt("Button text", "Learn more")?.trim();
      if (!typed) return;
      const label = typed.charAt(0).toUpperCase() + typed.slice(1);
      const after = $to.after();
      const chain = editor.chain().focus();
      if (state.link) chain.unsetLink();
      chain
        .insertContentAt(after, {
          type: "paragraph",
          content: [{ type: "text", text: label, marks: [{ type: "link", attrs: { href, class: "cta-button" } }] }],
        })
        .run();
      return;
    }

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
        <div className="mx-1 h-5 w-px bg-navy/10" />
        <ToolbarButton
          onClick={() => {
            const next = autoFormatHtml(editor.getHTML());
            if (next !== editor.getHTML()) editor.chain().focus().setContent(next, { emitUpdate: true }).run();
          }}
          title="Auto-format: turn short title lines into headings, '→ ' lines into CTA buttons and '- ' lines into bullet lists (Ctrl+Z to undo)"
        >
          ✨ Auto-format
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
