import {useId,useState} from 'react';
import {parkScenario} from '../lib/impact';
const fr=(n:number)=>n.toLocaleString('fr-FR');
function Row({label,hint,value,max,step,onChange}:{label:string;hint:string;value:number;max:number;step:number;onChange:(n:number)=>void}){
  const id=useId(),pct=Math.min(100,value/max*100);
  return <div className="est-row">
    <div className="est-row-top"><label htmlFor={id}>{label}</label><input className="est-number" type="number" inputMode="numeric" min={0} max={max*10} step={step} value={value} aria-label={`${label} (nombre)`} onChange={e=>onChange(Math.max(0,Number(e.target.value)||0))} /></div>
    <input id={id} className="est-range" type="range" min={0} max={max} step={step} value={Math.min(value,max)} style={{'--pct':`${pct}%`} as React.CSSProperties} onChange={e=>onChange(Number(e.target.value))} />
    <p className="est-hint">{hint}</p>
  </div>;
}
export default function ParkEstimator(){
  const [services,setServices]=useState(1500),[returns,setReturns]=useState(500),[reserve,setReserve]=useState(300);
  const {stock}=parkScenario({services,cleanReturns:returns,reserve});
  return <div className="estimator">
    <div className="est-inputs">
      <Row label="Boissons servies avant le prochain réapprovisionnement" hint="Le nombre de services attendus, par exemple sur une journée ou un pic." value={services} max={10000} step={50} onChange={setServices} />
      <Row label="Gobelets propres déjà confirmés pour cette période" hint="Ne comptez pas les gobelets sales : ils doivent d’abord être lavés." value={returns} max={5000} step={50} onChange={setReturns} />
      <Row label="Réserve de sécurité" hint="Une marge si le public dépasse la prévision ou si un retour tarde." value={reserve} max={2000} step={50} onChange={setReserve} />
    </div>
    <div className="est-result" aria-live="polite">
      <p className="label plain">Votre parc à prévoir</p>
      <p className="est-total"><strong>{fr(stock)}</strong><span>gobelets</span></p>
      <p className="est-formula">{fr(services)} services − {fr(returns)} propres disponibles + {fr(reserve)} de réserve</p>
      <a className="btn btn-primary" href={`/devis/?besoin=gobelets&volume=${stock}`}>Demander ce parc <span aria-hidden="true">→</span></a>
      <a className="text-link" href="/blog/combien-gobelets-prevoir-evenement/">Comprendre le calcul</a>
      <p className="est-note">Une première estimation, issue de notre guide. Elle ne vaut pas réservation : nous vérifions ensemble les formats, le calendrier et les disponibilités.</p>
    </div>
  </div>;
}
