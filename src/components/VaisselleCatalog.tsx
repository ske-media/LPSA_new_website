import {useEffect,useMemo,useState} from 'react';
import items from '../data/vaisselle-august.json';

type Item=typeof items[number];
const KEY='lpsa-vaisselle-selection';
const categories=['Tout',...Array.from(new Set(items.map(i=>i.category)))];
const norm=(s:string)=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

export default function VaisselleCatalog(){
  const [cat,setCat]=useState('Tout'),[q,setQ]=useState(''),[sel,setSel]=useState<Record<number,number>>({}),[open,setOpen]=useState(false),[limit,setLimit]=useState(24);
  // Remember the selection on this device only (convenience, never required).
  useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setSel(JSON.parse(raw));}catch{/* storage unavailable */}},[]);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(sel));}catch{/* storage unavailable */}},[sel]);
  const shown=useMemo(()=>items.filter(i=>(cat==='Tout'||i.category===cat)&&(!q||norm(i.name).includes(norm(q)))),[cat,q]);
  useEffect(()=>setLimit(24),[cat,q]);
  const chosen=items.filter(i=>sel[i.id]>0),count=chosen.length,pieces=chosen.reduce((n,i)=>n+sel[i.id],0);
  const setQty=(i:Item,n:number)=>setSel(s=>{const next={...s};if(n>0)next[i.id]=Math.min(99999,n);else delete next[i.id];return next;});
  const quoteHref=`/devis/?besoin=vaisselle&selection=${encodeURIComponent(chosen.map(i=>`${i.name} × ${sel[i.id]}`).join('|'))}`;

  return <div className="catalog">
    <div className="catalog-tools">
      <div className="catalog-chips" role="group" aria-label="Catégories">
        {categories.map(c=><button key={c} type="button" aria-pressed={cat===c} onClick={()=>setCat(c)}>{c}<span>{c==='Tout'?items.length:items.filter(i=>i.category===c).length}</span></button>)}
      </div>
      <label className="catalog-search"><span className="sr-only">Rechercher un article</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher : verre à vin, assiette, chafing dish…" /></label>
    </div>
    <p className="catalog-count" aria-live="polite">{shown.length} article{shown.length>1?'s':''}{cat!=='Tout'?` · ${cat}`:''}</p>
    <ul className="catalog-grid">
      {shown.slice(0,limit).map(i=>{const n=sel[i.id]||0;return <li key={i.id} className={`catalog-item${n?' is-chosen':''}`}>
        <div className="catalog-photo"><img src={i.image} alt="" loading="lazy" width="420" height="420" /></div>
        <div className="catalog-body">
          <span className="catalog-cat">{i.category}</span>
          <h3>{i.name}</h3>
          {n?<div className="qty" role="group" aria-label={`Quantité pour ${i.name}`}>
            <button type="button" onClick={()=>setQty(i,n-(n>10?10:1))} aria-label="Retirer">−</button>
            <input type="number" inputMode="numeric" min={0} value={n} aria-label={`Quantité de ${i.name}`} onChange={e=>setQty(i,Math.max(0,Math.round(Number(e.target.value)||0)))} />
            <button type="button" onClick={()=>setQty(i,n+(n>=10?10:1))} aria-label="Ajouter">+</button>
          </div>:<button type="button" className="catalog-add" onClick={()=>setQty(i,50)}>Ajouter à ma sélection</button>}
        </div>
      </li>;})}
    </ul>
    {shown.length===0&&<p className="notice">Aucun article ne correspond. Décrivez votre besoin dans la demande de devis : le catalogue complet est encore plus large.</p>}
    {shown.length>limit&&<div className="catalog-more"><button type="button" className="btn btn-ghost" onClick={()=>setLimit(l=>l+24)}>Voir plus d’articles ({shown.length-limit})</button></div>}
    <p className="catalog-credit">Catalogue et photographies : August Events, notre partenaire. Disponibilités et tarifs confirmés sur devis.</p>

    <div className={`catalog-bar${count?' is-visible':''}`} aria-live="polite">
      <button type="button" className="catalog-bar-summary" aria-expanded={open} onClick={()=>setOpen(o=>!o)} disabled={!count}>
        {count?<><strong>{count} article{count>1?'s':''}</strong><span>{pieces.toLocaleString('fr-FR')} pièces</span><i aria-hidden="true">{open?'▾':'▴'}</i></>:<span>Sélection vide : ajoutez des articles</span>}
      </button>
      {open&&count>0&&<ul className="catalog-bar-list">{chosen.map(i=><li key={i.id}><span>{i.name}</span><b>× {sel[i.id]}</b><button type="button" onClick={()=>setQty(i,0)} aria-label={`Retirer ${i.name}`}>✕</button></li>)}</ul>}
      <a className="btn btn-primary" href={count?quoteHref:'/devis/?besoin=vaisselle'}>Demander un devis <span aria-hidden="true">→</span></a>
    </div>
  </div>;
}
