from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'.local/logo-python'))
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
OUT=ROOT/'docs/brand/propositions-06-10';OUT.mkdir(exist_ok=True)
fonts={w:TTFont(ROOT/f'node_modules/@fontsource/manrope/files/manrope-latin-{w}-normal.woff') for w in [400,500,600]}
fonts['serif']=TTFont('/System/Library/Fonts/Supplemental/Georgia.ttf')
N='#062C3A';W='#F4F6F2';M='#5B7680';A='#A0D1D6'
def text(value,x,y,size,color=N,weight=500,tracking=-.025):
 f=fonts[weight];g=f.getGlyphSet();cm=f.getBestCmap();scale=size/f['head'].unitsPerEm;items=[]
 for ch in value:
  name=cm[ord(ch)];pen=SVGPathPen(g);g[name].draw(TransformPen(pen,(scale,0,0,-scale,x,y)))
  if pen.getCommands():items.append('<path d="'+pen.getCommands()+'"/>')
  x+=g[name].width*scale+size*tracking
 return '<g fill="'+color+'">'+''.join(items)+'</g>'
def mark(i,c):
 if i==6:
  return f'<g fill="{c}"><path d="M83 19A43 43 0 0 0 20 77L32 65A26 26 0 0 1 71 31Z"/><path d="M29 93A43 43 0 0 0 92 35L80 47A26 26 0 0 1 41 81Z"/></g>'
 if i==7:
  return f'<path fill="{c}" fill-rule="evenodd" d="M25 18H66C86 18 98 29 98 47C98 65 86 77 66 77H41V96H25ZM43 32 47 57Q48 63 54 63H64Q71 63 73 57L78 32Z"/>'
 if i==8:
  return text('p',24,83,95,c,'serif',-.02)+f'<circle cx="91" cy="80" r="4" fill="{c}"/>'
 if i==9:
  return f'<g fill="{c}"><path d="M15 34C44 8 64 49 96 23V36C64 62 44 21 15 47Z"/><path d="M15 57C44 31 64 72 96 46V59C64 85 44 44 15 70Z"/><path d="M15 80C44 54 64 95 96 69V82C64 108 44 67 15 93Z"/></g>'
 return f'<g fill="none" stroke="{c}" stroke-width="6" stroke-linecap="round" transform="rotate(-26 56 56)"><path d="M84 27C64 10 26 18 19 47C12 76 32 94 55 94C78 94 94 77 94 55"/><path d="M72 39C58 28 35 34 33 53C31 71 44 81 57 79C70 77 80 66 78 52"/></g>'
def signature(i,c):
 if i==8:
  return text('la plonge',12,50,48,c,'serif',-.055)+text('s’adapte',13,101,48,c,'serif',-.055)+f'<path d="M288 25V98" stroke="{c}" stroke-width="1.4"/>'+text('EA',314,56,17,c,500,.09)+text('LAVAGE',314,77,10,c,400,.11)+text('RÉEMPLOI',314,94,10,c,400,.08)
 if i==6:
  word=text('LA PLONGE',136,51,30,c,500,.11)+text('S’ADAPTE',137,88,22,c,400,.22)
 elif i==7:
  word=text('la plonge',139,52,41,c,500,-.04)+text('s’adapte',139,96,41,c,500,-.04)
 elif i==9:
  word=text('la plonge',139,49,39,c,400,-.04)+text('s’adapte',139,96,39,c,400,-.04)
 else:
  word=text('LA PLONGE',139,51,31,c,400,.065)+text('S’ADAPTE',140,89,24,c,400,.13)
 return mark(i,c)+word
names=['06 — Relais','07 — Initiale','08 — Maison','09 — Flux','10 — Contour']
notes=['Deux mouvements se répondent : le passage de relais.','Le P de Plonge accueille un gobelet en contreforme.','Une signature typographique, calme et éditoriale.','Trois lignes d’eau. Un rythme continu.','Le bord d’une assiette, ouvert sur un nouveau cycle.']
def svg(content,w,h,title):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{title}</title>{content}</svg>'
board=f'<rect width="1600" height="1720" fill="{W}"/>'+text('LA PLONGE S’ADAPTE',80,63,17,N,500,.1)+text('DIRECTIONS 06—10 / LOGOTYPE',1110,63,13,M,500,.06)
board+=text('Cinq nouvelles expressions.',80,138,43,N,400,-.04)
for index,i in enumerate(range(6,11)):
 y=195+index*291
 board+=f'<path d="M80 {y}H1520" stroke="#CDD9D7"/>'+text(names[index],80,y+42,19,N,600,0)
 board+=f'<g transform="translate(340 {y+56}) scale(1.55)">{signature(i,N)}</g>'+text(notes[index],340,y+257,17,M,400,0)
 board+=f'<rect x="1168" y="{y+57}" width="190" height="172" fill="{N}"/><g transform="translate(1207 {y+86})">{mark(i,W)}</g>'
 board+=f'<g transform="translate(1443 {y+126}) scale(.3)">{mark(i,N)}</g>'
 for variant,c in [('petrole',N),('blanc',W)]:
  (OUT/f'{i:02d}-logo-{variant}.svg').write_text(svg(signature(i,c),410,116,names[index]+' — La Plonge s’Adapte'))
  (OUT/f'{i:02d}-symbole-{variant}.svg').write_text(svg(mark(i,c),112,112,names[index]))
 page=f'<rect width="1600" height="1000" fill="{N}"/>'+text(names[index],80,78,22,A,500,0)
 page+=f'<g transform="translate(247 310) scale(2.7)">{signature(i,W)}</g>'+text(notes[index],80,911,25,W,400,0)
 (OUT/f'{i:02d}-presentation.svg').write_text(svg(page,1600,1000,names[index]))
board+=text('Logos vectoriels. Typographies en tracés. Versions monochromes.',80,1690,15,M,400,0)
(OUT/'5-propositions-06-10.svg').write_text(svg(board,1600,1720,'Cinq nouvelles propositions — La Plonge s’Adapte'))
