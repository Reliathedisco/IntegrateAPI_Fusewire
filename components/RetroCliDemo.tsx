"use client";

import { useEffect, useRef } from "react";

/**
 * Animated terminal demo. Injects innerHTML for typing/progress lines, so the
 * internal class names (.ok, .dim, .barfill, .pct, .file, .flag, .brand, .warn)
 * are styled by globals.css scoped under `.retro-stage`.
 */
export default function RetroCliDemo() {
  const streamRef = useRef<HTMLDivElement>(null);
  const promptLineRef = useRef<HTMLDivElement>(null);
  const typedCmdRef = useRef<HTMLSpanElement>(null);
  const footerRef = useRef<HTMLSpanElement>(null);
  const logoElRef = useRef<HTMLPreElement>(null);

  const runDemoRef = useRef<() => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    const logoArt = [
      "  ╦╔╗╔╦╔═╗╔═╗╦═╗╔═╗╔╦╗╔═╗  ╔═╗╔═╗╦",
      "  ║║║║║║╣ ║ ╦╠╦╝╠═╣ ║ ║╣   ╠═╣╠═╝║",
      "  ╩╝╚╝╩╚═╝╚═╝╩╚═╩ ╩ ╩ ╚═╝  ╩ ╩╩  ╩",
      "  ─────────────────────────────────",
      "   ship integrations, not glue",
    ].join("\n");

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let cancelled = false;

    const addLine = (html: string) => {
      const stream = streamRef.current;
      if (!stream) return null;
      const d = document.createElement("div");
      d.innerHTML = html;
      stream.appendChild(d);
      return d;
    };

    const typeCmd = async (text: string, speed = 50) => {
      const typedCmd = typedCmdRef.current;
      if (!typedCmd) return;
      typedCmd.textContent = "";
      for (const ch of text) {
        if (cancelled) return;
        typedCmd.textContent += ch;
        await sleep(speed + Math.random() * 35);
      }
    };

    const progressBar = async (label: string, durationMs = 900) => {
      const stream = streamRef.current;
      if (!stream) return;
      const wrap = document.createElement("div");
      wrap.style.margin = "4px 0";
      wrap.innerHTML = `<span class="dim">›</span> ${label} <span class="barfill" style="width: 140px; margin-left: 8px;"><span></span></span> <span class="pct dim">0%</span>`;
      stream.appendChild(wrap);
      const fill = wrap.querySelector<HTMLElement>(".barfill > span");
      const pct = wrap.querySelector<HTMLElement>(".pct");
      const steps = 20;
      for (let i = 1; i <= steps; i++) {
        if (cancelled) return;
        const p = (i / steps) * 100;
        if (fill) fill.style.width = p + "%";
        if (pct) pct.textContent = Math.round(p) + "%";
        await sleep(durationMs / steps);
      }
      if (pct) pct.innerHTML = '<span class="ok">✓</span>';
    };

    const runDemo = async () => {
      const stream = streamRef.current;
      const promptLine = promptLineRef.current;
      const typedCmd = typedCmdRef.current;
      const footer = footerRef.current;
      const logoEl = logoElRef.current;

      if (stream) stream.innerHTML = "";
      if (logoEl) logoEl.textContent = "";
      if (promptLine) promptLine.style.display = "none";
      if (typedCmd) typedCmd.textContent = "";
      if (footer) footer.textContent = "FREE TIER · 3/5 INSTALLS";

      for (const ch of logoArt) {
        if (cancelled) return;
        if (logoEl) logoEl.textContent += ch;
        await sleep(4);
      }

      await sleep(300);
      if (promptLine) promptLine.style.display = "block";
      await sleep(400);

      await typeCmd("npx integrateapi add stripe");
      await sleep(400);
      addLine(
        `<span class="dim">reli@studio:~/my-saas-app$</span> <span>npx integrateapi add stripe</span>`,
      );
      if (typedCmd) typedCmd.textContent = "";
      if (promptLine) promptLine.style.display = "none";

      await sleep(280);
      addLine(
        `<span class="dim">→</span> authenticating <span class="dim">···</span> <span class="ok">authorized as reli@relimusic.com</span>`,
      );
      await sleep(360);
      addLine(
        `<span class="dim">→</span> fetching template <span class="brand">stripe@2.1.0</span> from registry`,
      );
      await sleep(300);
      await progressBar(
        'downloading <span class="file">stripe.template.tar.gz</span>',
        650,
      );

      await sleep(180);
      addLine(
        `<span class="dim">→</span> scanning project <span class="dim">(next.js 15.0 · app router · typescript)</span>`,
      );
      await sleep(360);
      addLine(`<span class="dim">→</span> writing files:`);

      const files = [
        "lib/stripe/client.ts",
        "lib/stripe/webhooks.ts",
        "app/api/stripe/route.ts",
        "app/api/webhooks/stripe/route.ts",
        "types/stripe.d.ts",
        ".env.local.example",
      ];
      for (const f of files) {
        if (cancelled) return;
        addLine(`   <span class="ok">+</span> <span class="file">${f}</span>`);
        await sleep(120);
      }

      await sleep(180);
      addLine(
        `<span class="dim">→</span> patching <span class="file">package.json</span> <span class="dim">(+stripe ^17.4.0, +micro ^10.0.1)</span>`,
      );
      await sleep(320);
      await progressBar("installing dependencies", 1000);

      await sleep(180);
      addLine(
        `<span class="dim">→</span> generating env keys <span class="flag">--mode=test</span>`,
      );
      await sleep(260);
      addLine(
        `   <span class="dim">STRIPE_SECRET_KEY        </span><span class="warn">sk_test_••••••••••••••••3kQz</span>`,
      );
      await sleep(140);
      addLine(
        `   <span class="dim">STRIPE_WEBHOOK_SECRET    </span><span class="warn">whsec_••••••••••••••••••dM2x</span>`,
      );

      await sleep(360);
      addLine("");
      addLine(
        `<span class="ok">✓</span> <span class="brand">stripe</span> integration installed in <span class="ok">3.2s</span>`,
      );
      await sleep(180);
      addLine(
        `<span class="dim">  next:</span> <span class="file">npm run dev</span> <span class="dim">then visit</span> <span class="file">/api/stripe</span>`,
      );

      await sleep(420);
      if (footer) footer.textContent = "FREE TIER · 4/5 INSTALLS";

      await sleep(600);
      if (promptLine) promptLine.style.display = "block";
      if (typedCmd) typedCmd.textContent = "";
    };

    runDemoRef.current = runDemo;
    runDemo();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full font-mono">
      <div className="retro-stage relative overflow-hidden rounded-2xl border border-line-strong bg-[#0a0e0a] shadow-lg">
        <div className="flex items-center gap-2.5 border-b border-[#2a3024] bg-[#1a1f1a] px-3.5 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex-1 text-center text-[12px] tracking-wider text-[#6b7a5b]">
            ~/my-saas-app — integrateapi v1.4.2
          </div>
          <div className="retro-status-dot size-2 rounded-full bg-[#f5b942]" />
        </div>

        <div className="relative">
          <div className="retro-scanlines pointer-events-none absolute inset-0 z-2" />
          <div className="retro-terminal-body relative z-1 min-h-[460px] px-5 py-5 text-[13.5px]/[1.65] text-[#d4ff7a]">
            <pre
              ref={logoElRef}
              className="m-0 mb-3.5 font-[inherit] text-[10px]/[1.15] whitespace-pre text-[#f5b942]"
            />
            <div ref={streamRef} className="retro-line-stream break-words" />
            <div ref={promptLineRef} className="mt-2 hidden">
              <span className="text-[#6dd3ff]">reli@studio</span>
              <span className="text-[#d4ff7a]">:</span>
              <span className="text-[#b88dff]">~/my-saas-app</span>
              <span className="text-[#d4ff7a]">$ </span>
              <span ref={typedCmdRef} className="text-[#d4ff7a]" />
              <span className="retro-cursor ml-px inline-block h-[15px] w-2 -translate-y-0.5 bg-[#d4ff7a] align-baseline" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#2a3024] bg-[#1a1f1a] px-3.5 py-2 text-[11px] tracking-wider text-[#6b7a5b]">
          <span>READY</span>
          <span ref={footerRef}>FREE TIER · 3/5 INSTALLS</span>
          <span>UTF-8</span>
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        <button
          onClick={() => runDemoRef.current()}
          className="cursor-pointer rounded-md border border-line bg-card px-3 py-1.5 font-mono text-[11px] text-mute transition hover:border-line-strong hover:text-ink"
        >
          ↻ replay
        </button>
      </div>
    </div>
  );
}
