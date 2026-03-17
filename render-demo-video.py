from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Tuple

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont


@dataclass(frozen=True)
class Step:
    kind: str  # "type", "output", "sleep", "clear"
    text: str = ""
    ms: int = 0


def _load_font(size: int) -> ImageFont.FreeTypeFont:
    # Prefer a macOS mono font.
    candidates = [
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/SFNSMono.ttf",
        "/Library/Fonts/Menlo.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except Exception:
            continue
    return ImageFont.load_default()


def _wrap_lines(text: str, max_cols: int) -> List[str]:
    lines: List[str] = []
    for raw in text.splitlines() or [""]:
        s = raw
        while len(s) > max_cols:
            lines.append(s[:max_cols])
            s = s[max_cols:]
        lines.append(s)
    return lines


def render_terminal_frame(
    *,
    width: int,
    height: int,
    title: str,
    prompt: str,
    typed: str,
    output_lines: List[str],
    font: ImageFont.FreeTypeFont,
    cursor_on: bool,
) -> Image.Image:
    # Palette
    bg = (17, 17, 24)
    panel = (24, 24, 35)
    border = (46, 46, 64)
    text = (227, 227, 240)
    dim = (160, 160, 180)
    green = (74, 222, 128)
    blue = (96, 165, 250)

    radius = 18
    margin = 44
    bar_h = 56

    img = Image.new("RGB", (width, height), bg)
    d = ImageDraw.Draw(img)

    # Terminal panel
    x0, y0 = margin, margin
    x1, y1 = width - margin, height - margin
    d.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=panel, outline=border, width=2)

    # Window bar
    d.rounded_rectangle([x0, y0, x1, y0 + bar_h], radius=radius, fill=(30, 30, 44), outline=border, width=2)
    # Dots
    dot_y = y0 + bar_h // 2
    dot_r = 8
    dots = [
        ((x0 + 26, dot_y), (239, 68, 68)),
        ((x0 + 52, dot_y), (245, 158, 11)),
        ((x0 + 78, dot_y), (34, 197, 94)),
    ]
    for (cx, cy), col in dots:
        d.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=col, outline=None)

    # Title
    d.text((x0 + 112, y0 + 16), title, font=font, fill=dim)

    # Content area
    pad_x = 28
    pad_y = 22
    content_x = x0 + pad_x
    content_y = y0 + bar_h + pad_y
    content_w = (x1 - x0) - pad_x * 2
    content_h = (y1 - y0) - bar_h - pad_y * 2

    # Compute monospace metrics
    char_w = d.textlength("M", font=font)
    line_h = int(font.size * 1.55)
    max_cols = max(20, int(content_w // max(1, char_w)) - 1)
    max_rows = max(8, int(content_h // max(1, line_h)) - 1)

    # Build visible lines
    rendered: List[Tuple[str, Tuple[int, int, int]]] = []

    for line in output_lines[-max_rows:]:
        # Colorize a few common markers
        color = text
        if line.startswith("✓"):
            color = green
        elif line.startswith("→"):
            color = blue
        rendered.extend([(l, color) for l in _wrap_lines(line, max_cols)])

    # Current prompt line
    prompt_line = f"{prompt}{typed}"
    rendered.append((prompt_line, text))

    # Clamp to screen
    rendered = rendered[-max_rows:]

    # Draw lines
    y = content_y
    for i, (line, col) in enumerate(rendered):
        d.text((content_x, y + i * line_h), line, font=font, fill=col)

    # Cursor (block)
    if cursor_on:
        # Cursor at end of typed line
        cursor_x = content_x + d.textlength(prompt_line, font=font)
        cursor_y = y + (len(rendered) - 1) * line_h
        d.rectangle([cursor_x + 2, cursor_y + 4, cursor_x + 14, cursor_y + line_h - 6], fill=text)

    return img


def build_steps() -> List[Step]:
    return [
        Step("type", "npx integrateapi login"),
        Step("sleep", ms=400),
        Step("output", "→ Sent a verification code to demo@integrateapi.io"),
        Step("output", "? Code: "),
        Step("type", "000000"),
        Step("sleep", ms=250),
        Step("output", "✓ Authentication successful"),
        Step("sleep", ms=600),
        Step("type", "npx integrateapi list"),
        Step("sleep", ms=200),
        Step("output", "Available integrations:"),
        Step("output", "  Stripe"),
        Step("output", "  Clerk"),
        Step("output", "  Supabase"),
        Step("output", "  OpenAI"),
        Step("sleep", ms=700),
        Step("type", "npx integrateapi add stripe"),
        Step("sleep", ms=200),
        Step("output", "✓ Installing Stripe integration"),
        Step("output", "✓ Generating client"),
        Step("output", "✓ Adding webhook handler"),
        Step("output", "✓ Creating types"),
        Step("sleep", ms=500),
        Step("output", ""),
        Step("output", "Next: add these to .env.local"),
        Step("output", "STRIPE_SECRET_KEY=sk_live_REDACTED"),
        Step("output", "STRIPE_WEBHOOK_SECRET=whsec_REDACTED"),
        Step("sleep", ms=900),
        Step("type", "npx integrateapi doctor"),
        Step("sleep", ms=300),
        Step("output", "✓ Auth: logged in"),
        Step("output", "✓ Project: looks like Next.js"),
        Step("output", "✓ Env vars: configured"),
        Step("sleep", ms=1200),
    ]


def main() -> None:
    width, height = 1280, 720
    fps = 30
    title = "integrateapi — demo"
    prompt = "$ "
    font = _load_font(30)

    steps = build_steps()

    typed = ""
    output_lines: List[str] = []
    frames: List[Image.Image] = []

    def add_hold(ms: int) -> None:
        count = max(1, int(math.ceil(ms / 1000 * fps)))
        for i in range(count):
            cursor_on = (i // max(1, fps // 2)) % 2 == 0
            frames.append(
                render_terminal_frame(
                    width=width,
                    height=height,
                    title=title,
                    prompt=prompt,
                    typed=typed,
                    output_lines=output_lines,
                    font=font,
                    cursor_on=cursor_on,
                )
            )

    for step in steps:
        if step.kind == "clear":
            typed = ""
            output_lines = []
            add_hold(350)
            continue

        if step.kind == "sleep":
            add_hold(step.ms)
            continue

        if step.kind == "output":
            output_lines.append(step.text)
            add_hold(320)
            continue

        if step.kind == "type":
            cmd = step.text
            # type it out
            typed = ""
            for ch in cmd:
                typed += ch
                add_hold(55)  # per-char delay
            # press enter: move typed command into output as prompt+cmd and clear input
            output_lines.append(f"{prompt}{typed}")
            typed = ""
            add_hold(250)
            continue

    # Write video
    out_path = "integrateapi-demo.mp4"
    with imageio.get_writer(
        out_path,
        fps=fps,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
    ) as w:
        for im in frames:
            w.append_data(np.asarray(im))

    print(f"Wrote {out_path} ({len(frames)} frames @ {fps}fps)")


if __name__ == "__main__":
    main()

