import {useId,useState} from 'react';
import {parkScenario} from '../lib/impact';
type Lang='fr'|'en';
const T={
  fr:{
    number:'nombre',
    services:'Boissons servies avant le prochain réapprovisionnement',servicesHint:'Le nombre de services attendus, par exemple sur une journée ou un pic.',
    returns:'Gobelets propres déjà confirmés pour cette période',returnsHint:'Ne comptez pas les gobelets sales : ils doivent d’abord être lavés.',
    reserve:'Réserve de sécurité',reserveHint:'Une marge si le public dépasse la prévision ou si un retour tarde.',
    result:'Votre parc à prévoir',unit:'gobelets',
    formula:(s:string,r:string,v:string)=>`${s} services − ${r} propres disponibles + ${v} de réserve`,
    cta:'Demander ce parc',how:'Comprendre le calcul',
    note:'Une première estimation, issue de notre guide. Elle ne vaut pas réservation : nous vérifions ensemble les formats, le calendrier et les disponibilités.',
  },
  en:{
    number:'number',
    services:'Drinks served before the next restock',servicesHint:'The number of servings expected, for example over one day or at a peak.',
    returns:'Clean cups already confirmed for this period',returnsHint:'Do not count dirty cups: they need to be washed first.',
    reserve:'Safety reserve',reserveHint:'A margin in case attendance exceeds the forecast or a return is delayed.',
    result:'Your cup stock to plan',unit:'reusable cups',
    formula:(s:string,r:string,v:string)=>`${s} servings − ${r} clean cups available + ${v} in reserve`,
    cta:'Request this stock',how:'Understand the calculation',
    note:'A first estimate, based on our guide. It is not a booking: we will check the formats, dates and availability together.',
  },
};
function Row({label,hint,value,max,step,onChange,numberLabel}:{label:string;hint:string;value:number;max:number;step:number;onChange:(n:number)=>void;numberLabel:string}){
  const id=useId(),pct=Math.min(100,value/max*100);
  return <div className="est-row">
    <div className="est-row-top"><label htmlFor={id}>{label}</label><input className="est-number" type="number" inputMode="numeric" min={0} max={max*10} step={step} value={value} aria-label={`${label} (${numberLabel})`} onChange={e=>onChange(Math.max(0,Number(e.target.value)||0))} /></div>
    <input id={id} className="est-range" type="range" min={0} max={max} step={step} value={Math.min(value,max)} style={{'--pct':`${pct}%`} as React.CSSProperties} onChange={e=>onChange(Number(e.target.value))} />
    <p className="est-hint">{hint}</p>
  </div>;
}
export default function ParkEstimator({lang='fr'}:{lang?:Lang}){
  const t=T[lang],prefix=lang==='en'?'/en':'',fmt=(n:number)=>n.toLocaleString(lang==='en'?'en-GB':'fr-FR');
  const [services,setServices]=useState(1500),[returns,setReturns]=useState(500),[reserve,setReserve]=useState(300);
  const {stock}=parkScenario({services,cleanReturns:returns,reserve});
  return <div className="estimator">
    <div className="est-inputs">
      <Row label={t.services} hint={t.servicesHint} value={services} max={10000} step={50} onChange={setServices} numberLabel={t.number} />
      <Row label={t.returns} hint={t.returnsHint} value={returns} max={5000} step={50} onChange={setReturns} numberLabel={t.number} />
      <Row label={t.reserve} hint={t.reserveHint} value={reserve} max={2000} step={50} onChange={setReserve} numberLabel={t.number} />
    </div>
    <div className="est-result" aria-live="polite">
      <p className="label plain">{t.result}</p>
      <p className="est-total"><strong>{fmt(stock)}</strong><span>{t.unit}</span></p>
      <p className="est-formula">{t.formula(fmt(services),fmt(returns),fmt(reserve))}</p>
      <a className="btn btn-primary" href={`${prefix}/devis/?besoin=gobelets&volume=${stock}`}>{t.cta} <span aria-hidden="true">→</span></a>
      <a className="text-link" href={`${prefix}/blog/combien-gobelets-prevoir-evenement/`}>{t.how}</a>
      <p className="est-note">{t.note}</p>
    </div>
  </div>;
}
