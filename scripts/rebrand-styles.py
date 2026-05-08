#!/usr/bin/env python3
"""Visual-only class token replacements (bulk)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

REPLACEMENTS: list[tuple[str, str]] = [
    # Accent / green → coral system (longest patterns first)
    ("shadow-[0_0_28px_-14px_rgba(158,255,107,0.45)]", "shadow-[0_8px_28px_-8px_rgba(217,97,86,0.22)]"),
    ("shadow-[0_0_14px_-6px_rgba(158,255,107,0.65)]", "shadow-[0_4px_20px_-6px_rgba(217,97,86,0.35)]"),
    ("shadow-[0_0_18px_-8px_rgba(158,255,107,0.55)]", "shadow-[0_6px_24px_-8px_rgba(217,97,86,0.28)]"),
    ("shadow-[0_0_10px_rgba(158,255,107,0.85)]", "shadow-[0_2px_12px_rgba(217,97,86,0.45)]"),
    ("bg-[#9EFF6B]/[0.06]", "bg-accent-soft"),
    ("border-[#9EFF6B]/75", "border-accent/50"),
    ("border-[#9EFF6B]/55", "border-accent/45"),
    ("border-[#9EFF6B]/50", "border-accent/40"),
    ("border-[#9EFF6B]/45", "border-accent/40"),
    ("border-[#9EFF6B]/40", "border-accent/35"),
    ("border-[#9EFF6B]/35", "border-accent/30"),
    ("border-[#9EFF6B]/30", "border-accent/28"),
    ("border-[#9EFF6B]/22", "border-sage/35"),
    ("bg-[#9EFF6B]/22", "bg-accent-soft"),
    ("bg-[#9EFF6B]/20", "bg-accent-soft"),
    ("bg-[#9EFF6B]/18", "bg-accent-soft"),
    ("bg-[#9EFF6B]/14", "bg-accent-soft"),
    ("bg-[#9EFF6B]/12", "bg-accent-soft"),
    ("bg-[#9EFF6B]/10", "bg-accent-soft"),
    ("bg-[#9EFF6B]/45", "bg-accent"),
    ("text-[#9EFF6B]", "text-accent"),
    ("text-[#E9FFB8]", "text-accent-ink"),
    ("text-[#C8F5A8]", "text-sage"),
    ("bg-[#9EFF6B]", "bg-accent"),
    ("hover:bg-[#9EFF6B]/22", "hover:bg-accent-soft"),
    ("hover:bg-[#9EFF6B]/18", "hover:bg-accent-soft"),
    ("hover:bg-[#9EFF6B]/10", "hover:bg-accent-soft"),
    ("hover:bg-[#b8ff8f]", "hover:bg-accent-hover"),
    ("after:bg-[#9EFF6B]", "after:bg-accent"),
    ("accent-[#9EFF6B]", "accent-accent"),
    # Backgrounds / surfaces
    ("bg-[#111]/90", "bg-muted/90"),
    ("bg-[#151515]/40", "bg-muted/70"),
    ("bg-[#151515]/60", "bg-muted/80"),
    ("bg-[#0B0B0B]/98", "bg-page/95"),
    ("bg-[#0B0B0B]/95", "bg-page/88"),
    ("bg-[#0B0B0B]/80", "bg-card-inner/92"),
    ("bg-[#0B0B0B]", "bg-page"),
    ("bg-[#151515]", "bg-card"),
    ("bg-[#141414]", "bg-card-inner"),
    ("bg-[#111]", "bg-muted"),
    ("bg-[#1a1a1a]", "bg-muted"),
    ("border-[#3a3a3a]", "border-border"),
    ("border-[#2A2A2A]/80", "border-border"),
    ("border-[#2A2A2A]/70", "border-border"),
    ("border-[#2A2A2A]", "border-border"),
    ("border-[#1a1a1a]", "border-border"),
    ("border-dashed border-[#2A2A2A]", "border-dashed border-border"),
    # Text
    ("text-[#e9ffb8]", "text-accent-ink"),
    ("text-[#cfcfcf]", "text-ink-secondary"),
    ("text-[#888888]", "text-ink-soft"),
    ("text-[#8a8a8a]", "text-ink-soft"),
    ("text-[#6b6b6b]", "text-ink-soft"),
    ("placeholder:text-[#6b6b6b]", "placeholder:text-ink-soft"),
    ("text-[#dcdcdc]", "text-ink"),
    ("text-[#A1A1A1]", "text-ink-secondary"),
    ("text-[#F5F5F5]", "text-ink"),
]

FILES = [
    ROOT / "PromptBankApp.tsx",
    ROOT / "JustinWorkspace.tsx",
    ROOT / "MatchTrackerTab.tsx",
    ROOT / "SignalReportTab.tsx",
    ROOT / "SaveProgressTab.tsx",
]


def main() -> None:
    for fp in FILES:
        if not fp.exists():
            continue
        s = fp.read_text(encoding="utf-8")
        orig = s
        for old, new in REPLACEMENTS:
            s = s.replace(old, new)
        if s != orig:
            fp.write_text(s, encoding="utf-8")
            print(f"updated {fp.relative_to(ROOT.parent)}")


if __name__ == "__main__":
    main()
