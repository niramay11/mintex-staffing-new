import path from "path";
import PDFDocument from "pdfkit";
import type { InterviewKit, InterviewQuestion } from "./schema";

// Printable PDF of a full interview kit, attached to the "Email me this kit"
// email. Mirrors the candidate view on the site (InterviewKitView +
// QuestionCard): competency map, every round and question with its answer
// guidance, prep, and the state rights section — so the attachment is the
// whole kit, not just the question list.
//
// Uses pdfkit's built-in Helvetica (no font files to ship), which only
// covers the WinAnsi character set — see pdfText() for how anything outside
// it is handled.

const COLORS = {
  navy: "#003060",
  steel: "#4a738c",
  muted: "#5b7185",
  faint: "#8fa6b8",
  rule: "#d8cbb6",
  cream: "#edeae4",
  panel: "#f4f7f9",
};

const STAGE_LABELS: Record<string, string> = {
  phone_screen: "Phone Screen",
  technical: "Technical Round",
  panel: "Panel",
  final: "Final Round",
};

const FRAMEWORK_LABELS: Record<string, string> = {
  star: "STAR",
  car: "CAR",
  soar: "SOAR",
  process: "Process walkthrough",
  direct: "Direct answer",
  case: "Case approach",
};

const WEIGHT_LABELS: Record<string, string> = {
  critical: "Critical",
  important: "Important",
  "nice-to-have": "Nice to have",
};

const LOGO_PATH = path.join(process.cwd(), "public", "logo-navy.png");
const MARGIN = 54;

// Characters Helvetica/WinAnsi can't draw come out as garbage glyphs, so map
// the common ones the model produces to plain equivalents and drop the rest.
const REPLACEMENTS: Record<string, string> = {
  "→": "->",
  "←": "<-",
  "≥": ">=",
  "≤": "<=",
  "≠": "!=",
  "×": "x",
  "✓": "-",
  "✔": "-",
  "•": "-",
  "‑": "-",
  "−": "-",
  " ": " ",
  " ": " ",
  "​": "",
};
const WIN_ANSI_EXTRAS = new Set("–—‘’‚“”„…€™šœžŸŠŒŽƒˆ˜‰‹›†‡");

function pdfText(s: string): string {
  let out = "";
  for (const ch of s.normalize("NFC")) {
    if (ch in REPLACEMENTS) out += REPLACEMENTS[ch];
    else if (ch.charCodeAt(0) <= 0xff || WIN_ANSI_EXTRAS.has(ch)) out += ch;
  }
  return out;
}

function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildInterviewKitPdf(kit: InterviewKit, kitUrl: string | null): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: MARGIN, bottom: MARGIN + 18, left: MARGIN, right: MARGIN },
    bufferPages: true,
    info: {
      Title: pdfText(`${kit.role.title} Interview Kit`),
      Author: "Mintex Staffing",
      Subject: pdfText(`${kit.role.title} interview questions — ${kit.region.state}`),
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const width = doc.page.width - MARGIN * 2;
  const bottomLimit = () => doc.page.height - doc.page.margins.bottom;
  const ensureSpace = (height: number) => {
    if (doc.y + height > bottomLimit()) doc.addPage();
  };

  const label = (text: string, gapBefore = 14) => {
    doc.moveDown(gapBefore / 12);
    ensureSpace(40);
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(COLORS.steel)
      .text(pdfText(text.toUpperCase()), MARGIN, doc.y, { width, characterSpacing: 0.8 });
    doc.moveDown(0.35);
  };

  const heading = (text: string) => {
    doc.moveDown(1.2);
    ensureSpace(70);
    doc.font("Helvetica-Bold").fontSize(15).fillColor(COLORS.navy).text(pdfText(text), MARGIN, doc.y, { width });
    const y = doc.y + 4;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + width, y).lineWidth(0.8).strokeColor(COLORS.rule).stroke();
    doc.y = y + 10;
  };

  const paragraph = (text: string, opts: { color?: string; font?: string; size?: number; indent?: number } = {}) => {
    const indent = opts.indent ?? 0;
    doc.font(opts.font ?? "Helvetica").fontSize(opts.size ?? 10).fillColor(opts.color ?? COLORS.muted)
      .text(pdfText(text), MARGIN + indent, doc.y, { width: width - indent, lineGap: 2 });
  };

  const bullets = (items: string[], indent = 0) => {
    for (const item of items) {
      ensureSpace(18);
      const x = MARGIN + indent;
      const y = doc.y;
      doc.circle(x + 3, y + 5, 1.6).fillColor(COLORS.steel).fill();
      doc.font("Helvetica").fontSize(10).fillColor(COLORS.muted)
        .text(pdfText(item), x + 12, y, { width: width - indent - 12, lineGap: 2 });
      doc.moveDown(0.25);
    }
  };

  // ── Cover block ────────────────────────────────────────────────────────────
  try {
    doc.image(LOGO_PATH, MARGIN, MARGIN - 8, { width: 150 });
  } catch {
    doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.navy).text("Mintex Staffing", MARGIN, MARGIN - 8);
  }
  doc.rect(MARGIN, MARGIN + 22, width, 2).fillColor(COLORS.navy).fill();
  doc.y = MARGIN + 42;

  doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.steel)
    .text("AI INTERVIEW KIT", MARGIN, doc.y, { width, characterSpacing: 1.2 });
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fontSize(24).fillColor(COLORS.navy)
    .text(pdfText(`${kit.role.title} Interview Kit`), MARGIN, doc.y, { width });
  doc.moveDown(0.3);
  paragraph(
    [titleCase(kit.role.seniority) + " level", kit.role.industry, kit.region.state].filter(Boolean).join("  ·  "),
    { color: COLORS.steel, size: 10.5 },
  );
  doc.moveDown(0.6);
  paragraph(kit.role.summary, { size: 10.5 });

  // Stat strip: total questions / rounds / est. time.
  const totalQuestions = kit.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const totalMinutes = kit.sections.reduce((sum, s) => sum + s.duration_minutes, 0);
  doc.moveDown(1);
  const stripY = doc.y;
  const stats = [
    { label: "Practice questions", value: String(totalQuestions) },
    { label: "Interview rounds", value: String(kit.sections.length) },
    { label: "Est. interview time", value: `~${totalMinutes} min` },
  ];
  const cellW = (width - 16) / stats.length;
  stats.forEach((stat, i) => {
    const x = MARGIN + i * (cellW + 8);
    doc.roundedRect(x, stripY, cellW, 54, 8).fillColor(COLORS.cream).fill();
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(COLORS.steel)
      .text(stat.label.toUpperCase(), x + 12, stripY + 11, { width: cellW - 24, characterSpacing: 0.6 });
    doc.font("Helvetica-Bold").fontSize(17).fillColor(COLORS.navy).text(stat.value, x + 12, stripY + 25, { width: cellW - 24 });
  });
  doc.y = stripY + 54;

  // ── Competency map ─────────────────────────────────────────────────────────
  heading("Competency map");
  for (const c of kit.competency_map) {
    ensureSpace(40);
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(COLORS.navy)
      .text(pdfText(c.competency), MARGIN, y, { width: width - 90, continued: false });
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.steel)
      .text((WEIGHT_LABELS[c.weight] ?? c.weight).toUpperCase(), MARGIN + width - 90, y + 1.5, { width: 90, align: "right", characterSpacing: 0.6 });
    doc.y = Math.max(doc.y, y + 14);
    paragraph(c.why_it_matters, { size: 9.5 });
    doc.moveDown(0.5);
  }

  // ── Rounds + questions ─────────────────────────────────────────────────────
  let questionNumber = 0;
  const questionBlock = (q: InterviewQuestion) => {
    questionNumber += 1;
    ensureSpace(150);
    doc.moveDown(0.6);
    const top = doc.y;
    doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.navy)
      .text(`Q${questionNumber}.`, MARGIN, top, { width: 28 });
    doc.text(pdfText(q.question), MARGIN + 28, top, { width: width - 28, lineGap: 2 });
    doc.moveDown(0.25);
    paragraph(
      [titleCase(q.type), `Level ${q.difficulty} of 5`, `${FRAMEWORK_LABELS[q.answer_framework] ?? q.answer_framework} framework`, q.competency].join("  ·  "),
      { color: COLORS.faint, size: 8.5, indent: 28 },
    );
    doc.moveDown(0.35);
    paragraph(q.subtext, { font: "Helvetica-Oblique", color: COLORS.navy, size: 10, indent: 28 });

    const sub = (title: string, items: string[]) => {
      doc.moveDown(0.5);
      ensureSpace(34);
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(COLORS.navy).text(pdfText(title), MARGIN + 28, doc.y, { width: width - 28 });
      doc.moveDown(0.2);
      bullets(items, 28);
    };
    sub("Strong answer includes", q.what_strong_looks_like);
    sub("Weak answer looks like", q.what_weak_looks_like);
    sub("Follow-up probes", q.follow_up_probes);

    doc.moveDown(0.4);
    const y = doc.y;
    doc.moveTo(MARGIN + 28, y).lineTo(MARGIN + width, y).lineWidth(0.5).strokeColor(COLORS.cream).stroke();
    doc.y = y + 2;
  };

  for (const section of kit.sections) {
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.steel)
      .text("INTERVIEW ROUND", MARGIN, doc.y, { width, characterSpacing: 1.2 });
    doc.moveDown(0.2);
    doc.font("Helvetica-Bold").fontSize(19).fillColor(COLORS.navy)
      .text(pdfText(STAGE_LABELS[section.stage] ?? titleCase(section.stage)), MARGIN, doc.y, { width });
    paragraph(`${section.questions.length} question${section.questions.length === 1 ? "" : "s"}  ·  ~${section.duration_minutes} min`, {
      color: COLORS.steel,
      size: 10,
    });
    const y = doc.y + 6;
    doc.rect(MARGIN, y, width, 1.5).fillColor(COLORS.navy).fill();
    doc.y = y + 8;
    section.questions.forEach(questionBlock);
  }

  // ── Prep ───────────────────────────────────────────────────────────────────
  doc.addPage();
  doc.y = MARGIN;
  doc.font("Helvetica-Bold").fontSize(19).fillColor(COLORS.navy).text("Prep before you go in", MARGIN, doc.y, { width });
  label("Think through these before the interview");
  bullets(kit.prep.star_prompts);
  label("Questions to ask them");
  bullets(kit.prep.questions_to_ask_them);
  if (kit.prep.likely_skills_tests.length > 0) {
    label("You may also be tested on");
    bullets(kit.prep.likely_skills_tests);
  }

  // ── Rights ─────────────────────────────────────────────────────────────────
  const rights = kit.your_rights;
  heading(`Know your rights in ${kit.region.state}`);
  paragraph(`Not legal advice — verify anything specific with ${kit.region.state}'s labor office before relying on it.`, { size: 9.5 });

  if (rights.cannot_be_asked.length > 0) {
    label("Questions they shouldn't ask");
    for (const item of rights.cannot_be_asked) {
      ensureSpace(80);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.faint)
        .text(pdfText(item.question), MARGIN, doc.y, { width, strike: true, lineGap: 2 });
      doc.moveDown(0.15);
      paragraph(item.why, { size: 9.5 });
      doc.moveDown(0.15);
      paragraph(`If you're asked this: ${item.how_to_respond}`, { font: "Helvetica-Bold", color: COLORS.navy, size: 9.5 });
      doc.moveDown(0.15);
      paragraph(`Source: ${item.source.label}`, { color: COLORS.faint, size: 8.5 });
      doc.moveDown(0.8);
    }
  }

  if (rights.state_specific.length > 0) {
    label(`${kit.region.state}-specific notes`);
    for (const note of rights.state_specific) {
      bullets([note.text]);
      paragraph(`Source: ${note.source.label}`, { color: COLORS.faint, size: 8.5, indent: 12 });
      doc.moveDown(0.4);
    }
  }

  if (rights.legally_confused.length > 0) {
    label("Often assumed illegal — but isn't");
    for (const item of rights.legally_confused) {
      ensureSpace(60);
      paragraph(item.question, { font: "Helvetica-Bold", color: COLORS.navy, size: 10 });
      doc.moveDown(0.15);
      paragraph(item.why, { size: 9.5 });
      doc.moveDown(0.15);
      paragraph(item.guidance, { size: 9.5 });
      doc.moveDown(0.7);
    }
  }

  // ── Closing ────────────────────────────────────────────────────────────────
  doc.moveDown(1.5);
  ensureSpace(60);
  const boxY = doc.y;
  doc.roundedRect(MARGIN, boxY, width, kitUrl ? 58 : 44, 8).fillColor(COLORS.panel).fill();
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(COLORS.navy)
    .text("Looking for your next role?", MARGIN + 16, boxY + 12, { width: width - 32 });
  doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.muted)
    .text("Browse open roles and talk to a Mintex recruiter at mintexstaffing.com", MARGIN + 16, doc.y + 2, {
      width: width - 32,
      link: "https://mintexstaffing.com/get-hired",
    });
  if (kitUrl) {
    doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.steel)
      .text("View this kit online", MARGIN + 16, doc.y + 2, { width: width - 32, link: kitUrl, underline: true });
  }

  // ── Footer on every page ───────────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    const footerY = doc.page.height - MARGIN + 4;
    // Writing inside the bottom margin would otherwise trigger an auto page break.
    const savedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.moveTo(MARGIN, footerY - 8).lineTo(MARGIN + width, footerY - 8).lineWidth(0.5).strokeColor(COLORS.rule).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.faint)
      .text(pdfText(`${kit.role.title} Interview Kit  ·  Mintex Staffing`), MARGIN, footerY, { width: width / 2, lineBreak: false });
    doc.text(`Page ${i - range.start + 1} of ${range.count}`, MARGIN + width / 2, footerY, { width: width / 2, align: "right", lineBreak: false });
    doc.page.margins.bottom = savedBottom;
  }

  doc.end();
  return done;
}
