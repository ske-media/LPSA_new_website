import {useEffect,useState} from 'react';
import {labels,needs,type Details} from '../lib/lead';
type Receipt={id:string;token:string};
export default function QuoteForm({demo}:{demo:boolean}){
  const [hydrated,setHydrated]=useState(false);useEffect(()=>setHydrated(true),[]);
  const [step,setStep]=useState(1),[busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<Receipt|null>(null);
  const [need,setNeed]=useState<string>('lavage');
  useEffect(()=>{
    const param=new URLSearchParams(location.search).get('besoin');if(needs.includes(param as typeof needs[number]))setNeed(param!);
    try{const saved=sessionStorage.getItem('lpsa-receipt');if(saved){const r=JSON.parse(saved);if(typeof r.id==='string'&&typeof r.token==='string'){setReceipt(r);setStep(2);}}}catch{/* A disabled session store does not prevent sending. */}
  },[]);
  async function contact(e:React.SyntheticEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError('');const f=new FormData(e.currentTarget);
    const r=receipt??{id:crypto.randomUUID(),token:Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')};setReceipt(r);
    try{
      const response=await fetch('/api/leads/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...r,need,name:f.get('name'),email:f.get('email'),phone:f.get('phone'),organization:f.get('organization'),website:f.get('website')})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Impossible de transmettre la demande.');
      try{sessionStorage.setItem('lpsa-receipt',JSON.stringify(r));}catch{/* Keep receipt in component state. */}setStep(2);
    }catch(err){setError(err instanceof Error?err.message:'Une erreur est survenue.');}finally{setBusy(false);}
  }
  async function details(e:React.SyntheticEvent<HTMLFormElement>){
    e.preventDefault();if(!receipt)return;setBusy(true);setError('');const f=new FormData(e.currentTarget);
    const number=(key:string)=>f.get(key)===''?null:Number(f.get(key));
    const details:Details={event:String(f.get('event')),city:String(f.get('city')),postalCode:String(f.get('postalCode')),date:String(f.get('date')),volume:number('volume'),annualVolume:number('annualVolume'),transport:String(f.get('transport')) as Details['transport'],message:String(f.get('message'))};
    try{const response=await fetch(`/api/leads/${receipt.id}/`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:receipt.token,...details})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Impossible de sauvegarder les détails.');try{sessionStorage.removeItem('lpsa-receipt');}catch{}setStep(3);}catch(err){setError(err instanceof Error?err.message:'Une erreur est survenue.');}finally{setBusy(false);}
  }
  return <div className="form-card">
    {demo&&<p className="demo-banner">Démonstration locale — utilisez uniquement des coordonnées fictives. Aucun email n’est envoyé.</p>}
    <div className="form-top"><span>VOTRE DEMANDE</span><span>{step===1?'01 / 02':step===2?'02 / 02':'TRANSMISE'} <i className="dot" /></span></div>
    {error&&<p className="error" role="alert">{error}</p>}
    {step===1&&<form onSubmit={contact}>
      <h2>De quoi avez-vous besoin ?</h2><fieldset className="need-options"><legend className="sr-only">Choisir une prestation</legend>{needs.map(n=><label key={n} className={need===n?'selected':''}><input type="radio" name="need" value={n} checked={need===n} onChange={()=>setNeed(n)}/>{labels[n]}<span aria-hidden="true">↗</span></label>)}</fieldset>
      <div className="form-grid"><label className="full">Prénom et nom *<input name="name" autoComplete="name" required minLength={2} maxLength={200} placeholder="Votre nom" /></label><label>Email<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="vous@organisation.fr" /></label><label>Téléphone<input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="06 …" /></label><label className="full">Organisation<input name="organization" autoComplete="organization" maxLength={200} placeholder="Le nom de votre structure" /></label></div>
      <p className="field-help">Un email ou un téléphone suffit. Les informations marquées * sont nécessaires.</p>
      <label className="honeypot" aria-hidden="true">Votre site<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <p className="form-disclosure">En continuant, vous transmettez vos coordonnées et votre besoin à La Plonge s’Adapte pour préparer votre demande. Vous pouvez compléter les détails ensuite. <a href="/confidentialite/">Vos données</a>.</p>
      <button className="button full-width" disabled={busy||!hydrated}>{busy?'Transmission…':'Transmettre et préciser mon projet'} <span aria-hidden="true">↗</span></button>
    </form>}
    {step===2&&<form onSubmit={details}>
      <p className="success" role="status">Vos coordonnées ont bien été transmises.</p><h2>Les détails, à votre rythme.</h2><p className="field-help">Tout est facultatif. Une estimation suffit pour préparer notre échange.</p>
      <div className="form-grid"><label className="full">Nom de l’événement<input name="event" maxLength={200} placeholder="Festival, marché, réception…" /></label><label>Ville<input name="city" maxLength={200} placeholder="Annecy, Chambéry…" /></label><label>Code postal<input name="postalCode" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} placeholder="74000" /></label><label className="full">Date de début<input name="date" type="date" /></label><label>Volume de l’événement<input name="volume" type="number" min={0} max={10000000} placeholder="Nombre de pièces" /></label><label>Volume annuel estimé<input name="annualVolume" type="number" min={0} max={100000000} placeholder="Si besoin récurrent" /></label><label className="full">Transport<select name="transport"><option>à définir</option><option>collecte et livraison</option><option>collecte</option><option>livraison</option><option>dépôt et retrait</option></select></label><label className="full">Ce qui nous aiderait à comprendre<textarea name="message" maxLength={4000} rows={4} placeholder="Formats, rotations, nombre de convives, budget, contraintes…" /></label></div>
      <p className="field-help">Le lavage commence à 3 000 gobelets par événement. Pour la vaisselle, le minimum de commande est de 1 500 € pour location et lavage ; le transport est en supplément.</p>
      <button className="button full-width" disabled={busy||!hydrated}>{busy?'Enregistrement…':'Finaliser ma demande'} <span aria-hidden="true">↗</span></button><button type="button" className="quiet-button" disabled={busy||!hydrated} onClick={()=>setStep(3)}>J’ajouterai les détails lors de notre échange</button>
    </form>}
    {step===3&&<div className="confirmation"><span className="confirmation-icon">↗</span><h2>Le relais est pris.</h2><p>Votre demande a été enregistrée. {demo?'Vous pouvez la retrouver dans l’espace équipe local.':'Notre équipe l’étudiera pour préparer la suite avec vous.'}</p>{demo&&<a className="button" href="/admin/">Voir la demande dans le back-office ↗</a>}<a className="text-link" href="/">Revenir au site</a><button className="quiet-button" onClick={()=>{try{sessionStorage.removeItem('lpsa-receipt');}catch{}setReceipt(null);setStep(1);}}>Préparer une autre demande</button></div>}
  </div>;
}
