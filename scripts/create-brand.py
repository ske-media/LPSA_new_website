"""Original LPSA vector identity. Typography outlined from SIL OFL Manrope."""
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.local/logo-python'))
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
font=TTFont(ROOT/'node_modules/@fontsource/manrope/files/manrope-latin-600-normal.woff')
glyphs=font.getGlyphSet();cmap=font.getBestCmap();units=font['head'].unitsPerEm
OUT=ROOT/'public/brand';OUT.mkdir(exist_ok=True)
navy='#082F40';water='#79C8D3';white='#EEF8F8'

def words(text,x,y,size,fill):
    paths=[];scale=size/units
    for char in text:
        name=cmap[ord(char)];pen=SVGPathPen(glyphs);trans=TransformPen(pen,(scale,0,0,-scale,x,y));glyphs[name].draw(trans)
        if pen.getCommands():paths.append(f'<path d="{pen.getCommands()}"/>')
        x+=glyphs[name].width*scale-size*.037
    return f'<g fill="{fill}">'+''.join(paths)+'</g>'

def mark(fill=navy):
    return f'''<g fill="none" stroke="{fill}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M24 38 31.5 78C32.8 85.3 37.5 89 45 89H67C74.5 89 79.2 85.3 80.5 78L90 26"/><path d="M22 23C44 6 62 43 90 22"/></g>'''

def lockup(fill=navy,accent=None):
    return f'<g transform="translate(2 7) scale(.92)">{mark(accent or fill)}</g>'+words('la plonge',125,49,46,fill)+words('s’adapte',125,99,46,fill)

def svg(content,w,h):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>La Plonge s’Adapte</title>{content}</svg>'
for name,color,accent in [('petrole',navy,None),('blanc',white,None),('bicolore',white,water),('noir','#000000',None)]:
    (OUT/f'logo-{name}.svg').write_text(svg(lockup(color,accent),355,118))
    (OUT/f'symbole-{name}.svg').write_text(svg(mark(accent or color),112,112))
(ROOT/'public/favicon.svg').write_text(svg('<rect width="112" height="112" rx="25" fill="'+navy+'"/>'+mark(white),112,112))
# Overview with outlined lettering: independent of system fonts and usable offline.
board='<rect width="1600" height="1100" fill="#F0F5F2"/>'
board+='<rect width="1600" height="650" fill="'+navy+'"/>'
board+=words('LA PLONGE S’ADAPTE',85,73,18,water)
board+=words('IDENTITÉ VISUELLE / 2026',1165,73,16,water)
board+='<g transform="translate(292 205) scale(2.8)">'+lockup(white,water)+'</g>'
board+=words('Le gobelet. Le mouvement de l’eau. La continuité.',85,583,25,white)
board+='<g transform="translate(77 748) scale(1.42)">'+lockup(navy)+'</g>'
board+='<g transform="translate(830 729) scale(1.55)">'+mark(navy)+'</g>'
board+='<rect x="1190" y="746" width="110" height="110" rx="24" fill="'+navy+'"/><g transform="translate(1194 750) scale(.91)">'+mark(white)+'</g>'
board+=words('SIGNATURE',85,945,16,navy)+words('SYMBOLE',847,945,16,navy)+words('ICÔNE',1210,945,16,navy)
board+='<path d="M85 1005H1515" stroke="#CADBD8"/>'
board+=words('BLEU PÉTROLE  #082F40',85,1050,16,navy)+words('EAU  #79C8D3',663,1050,16,navy)+words('BLANC  #EEF8F8',1220,1050,16,navy)
(ROOT/'docs/brand/La-Plonge-sAdapte-planche.svg').write_text(svg(board,1600,1100))
