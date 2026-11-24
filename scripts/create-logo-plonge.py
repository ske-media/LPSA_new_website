"""Vector rebuild of the "La Plonge s'Adapte" ribbon logo (silver ribbons, thin geometric wordmark).
Writes public/brand/plonge/*.svg and src/lib/logo-paths.json (used by the Logo component)."""
import json, math, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/brand/plonge'; OUT.mkdir(parents=True, exist_ok=True)

# Ribbons, drawn on a 1035 x 480 grid traced from the concept board.
RIBBON_A = ("M40 440 C200 330 330 180 400 110 C460 50 520 38 580 40 C640 45 690 80 708 112 "
            "C660 92 600 90 550 108 C490 130 450 200 400 265 C330 355 220 415 40 440 Z")
RIBBON_B = ("M340 330 C420 340 500 390 600 392 C720 394 800 330 870 250 C920 190 960 140 1000 92 "
            "C900 150 850 240 760 290 C700 320 620 300 540 295 C470 292 400 310 340 330 Z")

# Stroke glyphs, cap height 100, origin top-left. (path, advance width)
def g_G():
    cx, cy, r = 52, 50, 50
    a = math.radians(38)
    sx, sy = cx + r*math.cos(a), cy - r*math.sin(a)
    return f"M{sx:.1f} {sy:.1f} A{r} {r} 0 1 0 {cx+r} {cy} H{cx+4}", 104
GLYPHS = {
    'L': ("M0 0 V100 H60", 60),
    'A': ("M0 100 L44 0 L88 100", 88),          # crossbar-less, as on the board
    'P': ("M0 100 V0 H38 C60 0 70 12 70 28 C70 44 60 56 38 56 H0", 70),
    'O': ("M52 0 A50 50 0 1 1 51.9 0 Z", 104),
    'N': ("M0 100 V0 L82 100 V0", 82),
    'G': g_G(),
    'E': ("M62 0 H0 V100 H62 M0 50 H54", 62),
    'S': ("M60 16 C53 6 43 1 32 1 C18 1 5 9 5 26 C5 42 19 46 32 50 C46 54 61 58 61 75 C61 91 48 99 32 99 C19 99 8 93 2 82", 63),
    "'": ("M10 0 L3 22", 12),
    'D': ("M0 0 V100 H32 C72 100 92 78 92 50 C92 22 72 0 32 0 Z", 92),
    'T': ("M0 0 H70 M35 0 V100", 70),
}
def word(text, tracking):
    parts, x = [], 0.0
    for ch in text:
        if ch == ' ':
            x += 52; continue
        d, w = GLYPHS[ch]
        parts.append(f'<path transform="translate({x:.1f} 0)" d="{d}"/>')
        x += w + tracking
    return ''.join(parts), x - tracking

TOP, TOP_W = word('LA PLONGE', 34)
SUB, SUB_W = word("S'ADAPTE", 118)

DEFS = """<defs>
<linearGradient id="lp-a" x1="40" y1="440" x2="708" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7f97a3"/><stop offset=".42" stop-color="#e4edf1"/><stop offset=".62" stop-color="#ffffff"/><stop offset="1" stop-color="#b9cad2"/></linearGradient>
<linearGradient id="lp-b" x1="340" y1="330" x2="1000" y2="92" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a9bcc5"/><stop offset=".38" stop-color="#ffffff"/><stop offset=".7" stop-color="#c3d4db"/><stop offset="1" stop-color="#6f93a3"/></linearGradient>
<linearGradient id="lp-w" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e3ecf0"/><stop offset="1" stop-color="#aebfc7"/></linearGradient>
</defs>"""
MARK = f'<path d="{RIBBON_A}" fill="url(#lp-a)"/><path d="{RIBBON_B}" fill="url(#lp-b)"/>'

def svg(w, h, body, title='La Plonge s’Adapte'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="{title}"><title>{title}</title>{DEFS}{body}</svg>\n'

# Symbol only
(OUT/'symbole.svg').write_text(svg(1035, 480, MARK))
# Favicon: symbol on deep water tile
fav = f'<rect width="1035" height="1035" rx="230" fill="#071c27"/><g transform="translate(33 290) scale(.94)">{MARK}</g>'
(OUT/'favicon.svg').write_text(svg(1035, 1035, fav))

# Stacked lockup (as on the board): mark, LA PLONGE, S'ADAPTE
W = max(TOP_W, 1035*0.62) + 40
mark_w = 1035*0.62; mx = (W-mark_w)/2
stack = (f'<g transform="translate({mx:.1f} 0) scale(.62)">{MARK}</g>'
         f'<g transform="translate({(W-TOP_W)/2:.1f} 340)" fill="none" stroke="url(#lp-w)" stroke-width="6" stroke-linecap="square" stroke-linejoin="miter">{TOP}</g>'
         f'<g transform="translate({(W-SUB_W*.36)/2:.1f} 474) scale(.36)" fill="none" stroke="#72c6d4" stroke-width="11" stroke-linecap="square">{SUB}</g>')
(OUT/'logo-vertical.svg').write_text(svg(W, 530, stack))

# Horizontal lockup for headers: mark left, words stacked right
mk = 0.25; mw, mh = 1035*mk, 480*mk
tx = mw + 26; s2 = .6
horiz = (f'<g transform="scale({mk})">{MARK}</g>'
         f'<g transform="translate({tx:.1f} 4) scale(.62)" fill="none" stroke="url(#lp-w)" stroke-width="7" stroke-linecap="square">{TOP}</g>'
         f'<g transform="translate({tx+2:.1f} 90) scale(.235)" fill="none" stroke="#72c6d4" stroke-width="15" stroke-linecap="square">{SUB}</g>')
HW = tx + TOP_W*.62 + 4
(OUT/'logo-horizontal.svg').write_text(svg(HW, mh, horiz))

(ROOT/'src/lib/logo-paths.json').write_text(json.dumps({'ribbonA': RIBBON_A, 'ribbonB': RIBBON_B, 'top': TOP, 'topWidth': TOP_W, 'sub': SUB, 'subWidth': SUB_W}, ensure_ascii=False))
print('ok', round(TOP_W), round(SUB_W), round(HW), round(W))
