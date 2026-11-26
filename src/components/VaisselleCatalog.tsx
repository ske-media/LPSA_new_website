import {useEffect,useMemo,useState} from 'react';
import items from '../data/vaisselle-august.json';
import english from '../data/vaisselle-august-en.json';

type Item=typeof items[number];
type Lang='fr'|'en';
const KEY='lpsa-vaisselle-selection';
const ALL='Tout';
const categories=[ALL,...Array.from(new Set(items.map(i=>i.category)))];
const norm=(s:string)=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
// English names and categories; any missing key falls back to the French value.
const en=english as {categories?:Record<string,string>;names?:Record<string,string>};
const T={
  fr:{
    all:'Tout',categories:'Catégories',search:'Rechercher un article',placeholder:'Rechercher : verre à vin, assiette, saladier…',
    articles:(n:number)=>`${n} article${n>1?'s':''}`,alt:(name:string)=>`${name}, location de vaisselle`,
    qtyFor:(name:string)=>`Quantité pour ${name}`,qtyOf:(name:string)=>`Quantité de ${name}`,remove:'Retirer',add:'Ajouter',addSel:'Ajouter à ma sélection',
    none:'Aucun article ne correspond. Décrivez votre besoin dans la demande de devis : le catalogue complet est encore plus large.',
    more:(n:number)=>`Voir plus d’articles (${n})`,credit:'Catalogue et photographies : August Events, notre partenaire. Disponibilités et tarifs confirmés sur devis.',
    pieces:'pièces',empty:'Sélection vide : ajoutez des articles',removeItem:(name:string)=>`Retirer ${name}`,quote:'Demander un devis',
  },
  en:{
    all:'All',categories:'Categories',search:'Search for an item',placeholder:'Search: wine glass, plate, salad bowl…',
    articles:(n:number)=>`${n} item${n>1?'s':''}`,alt:(name:string)=>`${name}, tableware rental`,
    qtyFor:(name:string)=>`Quantity for ${name}`,qtyOf:(name:string)=>`Quantity of ${name}`,remove:'Remove',add:'Add',addSel:'Add to my selection',
    none:'No items match. Describe what you need in your quote request: the full catalogue is even larger.',
    more:(n:number)=>`Show more items (${n})`,credit:'Catalogue and photographs: August Events, our partner. Availability and prices confirmed with your quote.',
    pieces:'pieces',empty:'Selection empty: add some items',removeItem:(name:string)=>`Remove ${name}`,quote:'Request a quote',
  },
};

export default function VaisselleCatalog({lang='fr'}:{lang?:Lang}){
  const t=T[lang],isEn=lang==='en',locale=isEn?'en-GB':'fr-FR',prefix=isEn?'/en':'';
  const name=(i:Item)=>isEn?en.names?.[String(i.id)]||i.name:i.name;
  const catLabel=(c:string)=>c===ALL?t.all:isEn?en.categories?.[c]||c:c;
  const [cat,setCat]=useState(ALL),[q,setQ]=useState(''),[sel,setSel]=useState<Record<number,number>>({}),[open,setOpen]=useState(false),[limit,setLimit]=useState(24);
  // Remember the selection on this device only (convenience, never required).
  useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setSel(JSON.parse(raw));}catch{/* storage unavailable */}},[]);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(sel));}catch{/* storage unavailable */}},[sel]);
  const shown=useMemo(()=>items.filter(i=>(cat===ALL||i.category===cat)&&(!q||norm(name(i)).includes(norm(q))||(isEn&&norm(i.name).includes(norm(q))))),[cat,q,lang]);
  useEffect(()=>setLimit(24),[cat,q]);
  const chosen=items.filter(i=>sel[i.id]>0),count=chosen.length,pieces=chosen.reduce((n,i)=>n+sel[i.id],0);
  const setQty=(i:Item,n:number)=>setSel(s=>{const next={...s};if(n>0)next[i.id]=Math.min(99999,n);else delete next[i.id];return next;});
  const quoteHref=`${prefix}/devis/?besoin=vaisselle&selection=${encodeURIComponent(chosen.map(i=>`${name(i)} × ${sel[i.id]}`).join('|'))}`;

  return <div className="catalog">
    <div className="catalog-tools">
      <div className="catalog-chips" role="group" aria-label={t.categories}>
        {categories.map(c=><button key={c} type="button" aria-pressed={cat===c} onClick={()=>setCat(c)}>{catLabel(c)}<span>{c===ALL?items.length:items.filter(i=>i.category===c).length}</span></button>)}
      </div>
      <label className="catalog-search"><span className="sr-only">{t.search}</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder={t.placeholder} /></label>
    </div>
    <p className="catalog-count" aria-live="polite">{t.articles(shown.length)}{cat!==ALL?` · ${catLabel(cat)}`:''}</p>
    <ul className="catalog-grid">
      {shown.slice(0,limit).map(i=>{const n=sel[i.id]||0,label=name(i);return <li key={i.id} className={`catalog-item${n?' is-chosen':''}`}>
        <div className="catalog-photo"><img src={i.image} alt={t.alt(label)} loading="lazy" width="420" height="420" /></div>
        <div className="catalog-body">
          <span className="catalog-cat">{catLabel(i.category)}</span>
          <h3>{label}</h3>
          {n?<div className="qty" role="group" aria-label={t.qtyFor(label)}>
            <button type="button" onClick={()=>setQty(i,n-(n>10?10:1))} aria-label={t.remove}>−</button>
            <input type="number" inputMode="numeric" min={0} value={n} aria-label={t.qtyOf(label)} onChange={e=>setQty(i,Math.max(0,Math.round(Number(e.target.value)||0)))} />
            <button type="button" onClick={()=>setQty(i,n+(n>=10?10:1))} aria-label={t.add}>+</button>
          </div>:<button type="button" className="catalog-add" onClick={()=>setQty(i,50)}>{t.addSel}</button>}
        </div>
      </li>;})}
    </ul>
    {shown.length===0&&<p className="notice">{t.none}</p>}
    {shown.length>limit&&<div className="catalog-more"><button type="button" className="btn btn-ghost" onClick={()=>setLimit(l=>l+24)}>{t.more(shown.length-limit)}</button></div>}
    <p className="catalog-credit">{t.credit}</p>

    <div className={`catalog-bar${count?' is-visible':''}`} aria-live="polite">
      <button type="button" className="catalog-bar-summary" aria-expanded={open} onClick={()=>setOpen(o=>!o)} disabled={!count}>
        {count?<><strong>{t.articles(count)}</strong><span>{pieces.toLocaleString(locale)} {t.pieces}</span><i aria-hidden="true">{open?'▾':'▴'}</i></>:<span>{t.empty}</span>}
      </button>
      {open&&count>0&&<ul className="catalog-bar-list">{chosen.map(i=><li key={i.id}><span>{name(i)}</span><b>× {sel[i.id]}</b><button type="button" onClick={()=>setQty(i,0)} aria-label={t.removeItem(name(i))}>✕</button></li>)}</ul>}
      <a className="btn btn-primary" href={count?quoteHref:`${prefix}/devis/?besoin=vaisselle`}>{t.quote} <span aria-hidden="true">→</span></a>
    </div>
  </div>;
}
