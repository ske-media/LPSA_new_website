from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'.local/logo-python'))
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
OUT=ROOT/'docs/brand/propositions';OUT.mkdir(exist_ok=True)
fonts={w:TTFont(ROOT/f'node_modules/@fontsource/manrope/files/manrope-latin-{w}-normal.woff') for w in [400,500,600]}
N='#082D3B';W='#F5F7F3';M='#50717B';A='#A0D1D6'
def text(value,x,y,size,color=N,weight=500,tracking=-.025):
 f=fonts[weight];g=f.getGlyphSet();cm=f.getBestCmap();scale=size/f['head'].unitsPerEm;items=[]
 for ch in value:
  name=cm[ord(ch)];pen=SVGPathPen(g);g[name].draw(TransformPen(pen,(scale,0,0,-scale,x,y)))
  if pen.getCommands():items.append('<path d="'+pen.getCommands()+'"/>')
  x+=g[name].width*scale+size*tracking
 return '<g fill="'+color+'">'+''.join(items)+'</g>'
def mark(i,c):
 if i==1:
  # A strong tapered vessel; one waterline carved through its upper third.
  return f'<path fill="{c}" d="M18 20H94L90.2 41C68 56 45 25 21.8 41ZM23.8 52C47 36 67 66 88.1 52L82 87Q81.2 92 75 92H37Q30.8 92 30 87Z"/>'
 if i==2:
  # Continuous open loop, broad vessel sides and a returning water stroke.
  return f'<path d="M88 27C79 14 43 12 27 26C15 37 27 47 47 47H74L68 78C66 89 45 94 34 82L23 63" fill="none" stroke="{c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
 if i==3:
  # Bespoke L/P monogram. Shared horizontal establishes the vessel rim.
  return f'<g fill="{c}"><path d="M20 18H32V79H63V91H20Z"/><path fill-rule="evenodd" d="M46 18H72C88 18 96 27 96 41C96 55 87 65 72 65H58V91H46ZM58 30V53H71C79 53 84 49 84 41C84 34 79 30 71 30Z"/></g>'
 if i==4:
  # Two nesting vessels, no literal water or recycling pictogram.
  return f'<g fill="none" stroke="{c}" stroke-width="7" stroke-linejoin="round"><path d="M20 18 28 69Q29 77 38 77H73Q82 77 83 69L91 18"/><path d="M36 22 42 53Q43 59 49 59H62Q68 59 69 53L75 22"/><path d="M34 91H77"/></g>'
 # A drop with a narrow vessel-shaped counter: water and cup in one silhouette.
 return f'<path fill="{c}" fill-rule="evenodd" d="M56 9C45 27 22 45 22 66C22 86 37 99 56 99C75 99 90 86 90 66C90 45 67 27 56 9ZM39 53 44 79Q45 83 49 83H63Q67 83 68 79L73 53Z"/>'
def signature(i,c):
 if i==3:
  word=text('LA PLONGE',141,51,34,c,500,.035)+text('S’ADAPTE',142,88,22,c,500,.18)
 elif i==1:
  word=text('la plonge',139,51,42,c,500,-.045)+text('s’adapte',139,96,42,c,500,-.045)
 elif i==2:
  word=text('la plonge',139,49,40,c,400,-.035)+text('s’adapte',139,95,40,c,400,-.035)
 elif i==4:
  word=text('la plonge',139,49,40,c,600,-.03)+text('s’adapte',139,95,40,c,600,-.03)
 else:
  word=text('LA PLONGE',139,50,31,c,400,.065)+text('S’ADAPTE',139,88,23,c,400,.18)
 return mark(i,c)+word
names=['01 — Monolithe','02 — Sillage','03 — Monogramme LP','04 — Collection','05 — Source']
notes=['Le gobelet et l’eau, taillés dans un seul signe.','Un mouvement continu, ouvert sur le prochain usage.','Une signature de maison, sobre et institutionnelle.','L’emboîtement des contenants devient une empreinte.','Une goutte. Un gobelet en réserve. Un seul symbole.']
def svg(content,w,h,title):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{title}</title>{content}</svg>'
board=f'<rect width="1600" height="1720" fill="{W}"/>'+text('LA PLONGE S’ADAPTE',80,63,17,N,500,.1)+text('CINQ DIRECTIONS / LOGOTYPE',1120,63,13,M,500,.08)
board+=text('Moins de signes. Plus de présence.',80,138,43,N,400,-.04)
for i in range(1,6):
 y=195+(i-1)*291
 board+=f'<path d="M80 {y}H1520" stroke="#CDD9D7"/>'
 board+=text(names[i-1],80,y+42,19,N,600,0)
 board+=f'<g transform="translate(340 {y+56}) scale(1.55)">{signature(i,N)}</g>'
 board+=text(notes[i-1],340,y+257,17,M,400,0)
 board+=f'<rect x="1168" y="{y+57}" width="190" height="172" rx="0" fill="{N}"/><g transform="translate(1207 {y+86})">{mark(i,W)}</g>'
 board+=f'<g transform="translate(1443 {y+126}) scale(.3)">{mark(i,N)}</g>'
 for variant,c in [('petrole',N),('blanc',W)]:
  (OUT/f'{i:02d}-logo-{variant}.svg').write_text(svg(signature(i,c),400,116,names[i-1]+' — La Plonge s’Adapte'))
  (OUT/f'{i:02d}-symbole-{variant}.svg').write_text(svg(mark(i,c),112,112,names[i-1]))
 # Individual review sheet, preserving the same generous proportions.
 page=f'<rect width="1600" height="1000" fill="{N}"/>'+text(names[i-1],80,78,22,A,500,0)
 page+=f'<g transform="translate(270 310) scale(2.7)">{signature(i,W)}</g>'
 page+=text(notes[i-1],80,911,25,W,400,0)
 (OUT/f'{i:02d}-presentation.svg').write_text(svg(page,1600,1000,names[i-1]))
board+=text('Formes originales. Logos vectoriels. Déclinaisons monochromes.',80,1690,15,M,400,0)
(OUT/'5-propositions-logo.svg').write_text(svg(board,1600,1720,'Cinq propositions de logo — La Plonge s’Adapte'))
