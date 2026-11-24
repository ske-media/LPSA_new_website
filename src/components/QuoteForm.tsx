import {useEffect,useRef,useState,type ReactNode} from 'react';
import {labels,needs,type Details} from '../lib/lead';

type Need=typeof needs[number];
type Fields=Record<string,string>;
type Receipt={id:string;token:string;stored?:boolean;contact?:Fields};
type Step='need'|'contact'|'details'|'done';
type Errors=Record<string,string>;

const PHONE='07 87 89 67 60',PHONE_HREF='tel:+33787896760';
const unavailable=`Impossible de transmettre la demande. Réessayez ou appelez-nous au ${PHONE}.`;

// Netlify Forms: the form is declared in public/__forms.html, the only place Netlify's build bot can see it.
async function sendToNetlify(fields:Fields){
  const response=await fetch('/__forms.html',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({'form-name':'devis',...fields}).toString()});
  if(!response.ok)throw new Error(unavailable);
}
// CRM route: true when saved, false when the service is unavailable, throws when the request itself is refused.
async function sendToCrm(url:string,method:string,payload:unknown,tolerate:number[]=[]){
  const response=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>null);
  if(response?.ok)return true;
  if(response&&response.status<500&&!tolerate.includes(response.status)){const data=await response.json().catch(()=>({}));throw new Error(data.error||unavailable);}
  return false;
}

const descriptions:Record<Need,string>={
  lavage:'Vos gobelets lavés, séchés, comptés et reconditionnés, dès 3 000 pièces.',
  gobelets:'Des gobelets réutilisables pour votre événement, avec leur retour au lavage.',
  vaisselle:'Verres, assiettes et couverts : la location et le lavage réunis.',
  conseil:'Être accompagné pour choisir et acheter votre propre parc.',
  stockage:'Votre parc de gobelets gardé entre deux événements.',
};
const icon=(d:ReactNode)=><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const icons:Record<Need,ReactNode>={
  lavage:icon(<><path d="M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z"/><path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5"/></>),
  gobelets:icon(<><path d="M6 4h12l-1.6 15.2a1 1 0 0 1-1 .8H8.6a1 1 0 0 1-1-.8z"/><path d="M6.6 9h10.8"/></>),
  vaisselle:icon(<><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="3"/><path d="M3 4v6a1.5 1.5 0 0 0 1.5 1.5V20M21 4c-1.5 1-2 3-2 5s.8 2.5 2 2.5V20"/></>),
  conseil:icon(<><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></>),
  stockage:icon(<><path d="M3 8l9-5 9 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M7 20v-8h10v8M7 15h10"/></>),
};
const transports:[Details['transport'],string][]=[['à définir','Je ne sais pas encore'],['collecte et livraison','Collecte et livraison'],['livraison','Livraison uniquement'],['collecte','Collecte uniquement'],['dépôt et retrait','Je dépose et je récupère']];
const stepList:[Step,string][]=[['need','Votre besoin'],['contact','Vos coordonnées'],['details','Votre projet']];

function Field({name,label,optional,required,hint,error,full,children}:{name:string;label:string;optional?:boolean;required?:boolean;hint?:string;error?:string;full?:boolean;children:(a:{id:string;name:string;'aria-invalid'?:true;'aria-describedby'?:string})=>ReactNode}){
  const id=`qf-${name}`,described=[hint&&`${id}-hint`,error&&`${id}-error`].filter(Boolean).join(' ')||undefined;
  return <div className={`qf-field${full?' full':''}${error?' has-error':''}`}>
    <label htmlFor={id}>{label}{required&&<span className="qf-tag" aria-hidden="true">obligatoire</span>}{optional&&<span className="qf-tag">facultatif</span>}</label>
    {children({id,name,'aria-invalid':error?true:undefined,'aria-describedby':described})}
    {hint&&<p className="qf-hint" id={`${id}-hint`}>{hint}</p>}
    {error&&<p className="qf-error" id={`${id}-error`}>{error}</p>}
  </div>;
}
const Spinner=()=><span className="qf-spinner" aria-hidden="true" />;
const Arrow=()=><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;

export default function QuoteForm({demo}:{demo:boolean}){
  const [hydrated,setHydrated]=useState(false);useEffect(()=>setHydrated(true),[]);
  const [step,setStep]=useState<Step>('need'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[errors,setErrors]=useState<Errors>({});
  const [receipt,setReceipt]=useState<Receipt|null>(null),[need,setNeed]=useState<Need|null>(null);
  const card=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),moved=useRef(false);
  useEffect(()=>{
    const param=new URLSearchParams(location.search).get('besoin');if(needs.includes(param as Need)){setNeed(param as Need);setStep('contact');}
    try{const saved=sessionStorage.getItem('lpsa-receipt');if(saved){const r=JSON.parse(saved);if(typeof r.id==='string'&&typeof r.token==='string'){setReceipt(r);setStep('details');}}}catch{/* A disabled session store does not prevent sending. */}
  },[]);
  // After a step change, bring the new question into view and announce it.
  useEffect(()=>{
    if(!moved.current)return;heading.current?.focus({preventScroll:true});
    const top=card.current?.getBoundingClientRect().top??0;
    if(top<0||top>innerHeight*.4)card.current?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  },[step]);
  const go=(next:Step)=>{moved.current=true;setError('');setErrors({});setStep(next);};

  // Outside the local demo, a request counts as transmitted once Netlify Forms or the CRM has recorded it.
  async function deliver(crm:()=>Promise<boolean>,fields:Fields){
    const stored=await crm();let sent=false;
    if(!demo){try{await sendToNetlify(fields);sent=true;}catch{/* The CRM copy may still exist. */}}
    if(!stored&&!sent)throw new Error(unavailable);return stored;
  }
  function focusFirstError(form:HTMLFormElement,found:Errors){const first=Object.keys(found)[0];if(first)(form.elements.namedItem(first) as HTMLElement|null)?.focus();}

  async function contact(e:React.SyntheticEvent<HTMLFormElement>){
    e.preventDefault();if(!need)return go('need');setError('');
    const form=e.currentTarget,f=new FormData(form),text=(key:string)=>String(f.get(key)??'').trim();
    const fields:Fields={besoin:labels[need],nom:text('name'),email:text('email'),telephone:text('phone'),organisation:text('organization')};
    const found:Errors={};
    if(fields.nom.length<2)found.name='Indiquez votre prénom et votre nom.';
    if(fields.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email))found.email='Cette adresse email semble incomplète. Exemple : marie@mairie.fr';
    if(fields.telephone&&!/^[+\d\s().-]{6,40}$/.test(fields.telephone))found.phone='Ce numéro ne semble pas valide. Exemple : 06 12 34 56 78';
    if(!fields.email&&!fields.telephone)found.email='Indiquez au moins un email ou un numéro de téléphone pour que nous puissions vous répondre.';
    setErrors(found);if(Object.keys(found).length)return focusFirstError(form,found);
    setBusy(true);
    const base=receipt??{id:crypto.randomUUID(),token:Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')};setReceipt(base);
    try{
      const stored=await deliver(()=>sendToCrm('/api/leads/','POST',{id:base.id,token:base.token,need,name:fields.nom,email:fields.email,phone:fields.telephone,organization:fields.organisation,website:f.get('website')}),{etape:'1 — Coordonnées',reference:base.id,...fields,website:text('website')});
      const r={...base,stored,contact:fields};setReceipt(r);
      try{sessionStorage.setItem('lpsa-receipt',JSON.stringify(r));}catch{/* Keep receipt in component state. */}go('details');
    }catch(err){setError(err instanceof Error?err.message:'Une erreur est survenue.');}finally{setBusy(false);}
  }
  async function details(e:React.SyntheticEvent<HTMLFormElement>){
    e.preventDefault();if(!receipt)return;setError('');
    const form=e.currentTarget,f=new FormData(form),text=(key:string)=>String(f.get(key)??'').trim();
    const found:Errors={};
    if(text('postalCode')&&!/^\d{5}$/.test(text('postalCode')))found.postalCode='Le code postal compte 5 chiffres. Exemple : 74000';
    setErrors(found);if(Object.keys(found).length)return focusFirstError(form,found);
    setBusy(true);
    const number=(key:string)=>text(key)===''?null:Math.max(0,Math.round(Number(text(key).replace(/\s/g,''))||0));
    const details:Details={event:text('event'),city:text('city'),postalCode:text('postalCode'),date:text('date'),volume:number('volume'),annualVolume:number('annualVolume'),transport:(text('transport')||'à définir') as Details['transport'],message:text('message')};
    try{
      await deliver(async()=>receipt.stored!==false&&await sendToCrm(`/api/leads/${receipt.id}/`,'PATCH',{token:receipt.token,...details},[404]),{etape:'2 — Détails',reference:receipt.id,...receipt.contact,evenement:details.event,ville:details.city,'code-postal':details.postalCode,date:details.date,volume:details.volume?.toString()??'','volume-annuel':details.annualVolume?.toString()??'',transport:details.transport,message:details.message});
      try{sessionStorage.removeItem('lpsa-receipt');}catch{}go('done');
    }catch(err){setError(err instanceof Error?err.message:'Une erreur est survenue.');}finally{setBusy(false);}
  }
  function restart(){try{sessionStorage.removeItem('lpsa-receipt');}catch{}setReceipt(null);setNeed(null);go('need');}

  const index=stepList.findIndex(([key])=>key===step),current=step==='done'?3:index;
  return <div className="qf" ref={card}>
    {demo&&<p className="qf-demo">Démonstration locale : utilisez uniquement des coordonnées fictives. Aucun email n’est envoyé.</p>}
    <ol className="qf-steps" aria-label="Progression de votre demande">
      {stepList.map(([key,label],i)=><li key={key} className={i<current?'done':i===current?'current':''} aria-current={i===current?'step':undefined}>
        <span className="qf-bar"><i /></span>
        <span className="qf-step-label"><b>{i<current?'✓':i+1}</b>{label}</span>
      </li>)}
    </ol>
    {error&&<p className="qf-alert" role="alert">{error}</p>}

    {step==='need'&&<div className="qf-panel" key="need">
      <p className="qf-kicker">Étape 1 sur 3</p>
      <h2 ref={heading} tabIndex={-1}>De quoi avez-vous besoin ?</h2>
      <p className="qf-lead">Choisissez la prestation qui vous intéresse. Vous pourrez en parler d’autres avec nous ensuite.</p>
      <div className="qf-choices">
        {needs.map(n=><button type="button" key={n} className="qf-choice" aria-pressed={need===n} disabled={!hydrated} onClick={()=>{setNeed(n);go('contact');}}>
          <span className="qf-ico">{icons[n]}</span><strong>{labels[n]}</strong><small>{descriptions[n]}</small><span className="qf-go" aria-hidden="true"><Arrow /></span>
        </button>)}
      </div>
    </div>}

    {step==='contact'&&need&&<form className="qf-panel" key="contact" onSubmit={contact} noValidate>
      <button type="button" className="qf-back" onClick={()=>go('need')}>← Changer de prestation</button>
      <div className="qf-summary"><span className="qf-ico small">{icons[need]}</span><span><small>Votre besoin</small><strong>{labels[need]}</strong></span></div>
      <p className="qf-kicker">Étape 2 sur 3</p>
      <h2 ref={heading} tabIndex={-1}>Comment pouvons-nous vous joindre ?</h2>
      <p className="qf-lead">Un email <b>ou</b> un numéro de téléphone suffit.</p>
      <div className="qf-grid">
        <Field name="name" label="Prénom et nom" required full error={errors.name}>{a=><input {...a} autoComplete="name" required minLength={2} maxLength={200} placeholder="Marie Dupont" />}</Field>
        <Field name="email" label="Email" error={errors.email}>{a=><input {...a} type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="marie@exemple.fr" />}</Field>
        <Field name="phone" label="Téléphone" error={errors.phone}>{a=><input {...a} type="tel" inputMode="tel" autoComplete="tel" maxLength={40} placeholder="06 12 34 56 78" />}</Field>
        <Field name="organization" label="Organisation" optional full hint="Association, mairie, entreprise, festival…">{a=><input {...a} autoComplete="organization" maxLength={200} placeholder="Le nom de votre structure" />}</Field>
      </div>
      <label className="honeypot" aria-hidden="true">Votre site<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <p className="qf-fine">En continuant, vous transmettez vos coordonnées et votre besoin à La Plonge s’Adapte pour préparer votre demande. <a href="/confidentialite/">Vos données</a></p>
      <button className="qf-primary" disabled={busy||!hydrated}>{busy?<><Spinner />Transmission…</>:<>Transmettre et préciser mon projet <Arrow /></>}</button>
    </form>}

    {step==='details'&&<form className="qf-panel" key="details" onSubmit={details} noValidate>
      <p className="qf-success" role="status"><span aria-hidden="true">✓</span>Vos coordonnées ont bien été transmises.</p>
      <p className="qf-kicker">Étape 3 sur 3 · facultative</p>
      <h2 ref={heading} tabIndex={-1}>Les détails, à votre rythme.</h2>
      <p className="qf-lead">Tout est facultatif. Remplissez ce que vous savez déjà : une estimation suffit pour préparer notre échange.</p>
      <section className="qf-section"><h3>Votre événement</h3><div className="qf-grid">
        <Field name="event" label="Nom de l’événement" full>{a=><input {...a} maxLength={200} placeholder="Festival, marché, réception…" />}</Field>
        <Field name="date" label="Date de début">{a=><input {...a} type="date" />}</Field>
      </div></section>
      <section className="qf-section"><h3>Le lieu</h3><div className="qf-grid">
        <Field name="city" label="Ville">{a=><input {...a} autoComplete="address-level2" maxLength={200} placeholder="Annecy, Chambéry…" />}</Field>
        <Field name="postalCode" label="Code postal" error={errors.postalCode}>{a=><input {...a} inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="74000" />}</Field>
      </div></section>
      <section className="qf-section"><h3>Les quantités</h3><div className="qf-grid">
        <Field name="volume" label="Volume de l’événement" hint="Nombre de gobelets ou de pièces.">{a=><input {...a} type="number" inputMode="numeric" min={0} max={10000000} placeholder="Ex. 5 000" />}</Field>
        <Field name="annualVolume" label="Volume annuel estimé" hint="Si vous avez plusieurs événements par an.">{a=><input {...a} type="number" inputMode="numeric" min={0} max={100000000} placeholder="Ex. 40 000" />}</Field>
      </div></section>
      <section className="qf-section"><fieldset className="qf-chips"><legend><h3>Le transport</h3></legend>
        {transports.map(([value,label])=><label className="qf-chip" key={value}><input type="radio" name="transport" value={value} defaultChecked={value==='à définir'} /><span>{label}</span></label>)}
      </fieldset></section>
      <section className="qf-section"><div className="qf-grid">
        <Field name="message" label="Ce qui nous aiderait à comprendre" full>{a=><textarea {...a} maxLength={4000} rows={4} placeholder="Formats, nombre de convives, budget, contraintes…" />}</Field>
      </div></section>
      <p className="qf-note"><span aria-hidden="true">i</span>Le lavage commence à 3 000 gobelets par événement. Pour la vaisselle, le minimum de commande est de 1 500 € pour la location et le lavage ; le transport est en supplément.</p>
      <button className="qf-primary" disabled={busy||!hydrated}>{busy?<><Spinner />Enregistrement…</>:<>Finaliser ma demande <Arrow /></>}</button>
      <button type="button" className="qf-secondary" disabled={busy||!hydrated} onClick={()=>{try{sessionStorage.removeItem('lpsa-receipt');}catch{}go('done');}}>J’ajouterai les détails lors de notre échange</button>
    </form>}

    {step==='done'&&<div className="qf-panel qf-done" key="done">
      <svg className="qf-check" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="44" /><path d="M30 49l12 12 25-26" /></svg>
      <h2 ref={heading} tabIndex={-1}>Le relais est pris.</h2>
      <p className="qf-lead">Votre demande a été enregistrée. {demo?'Vous pouvez la retrouver dans l’espace équipe local.':'Notre équipe l’étudiera pour préparer la suite avec vous.'}</p>
      <ol className="qf-next"><li><b>1</b>Notre équipe étudie votre demande.</li><li><b>2</b>Nous vous recontactons pour préparer la suite ensemble.</li></ol>
      {demo&&<a className="qf-primary" href="/admin/">Voir la demande dans le back-office ↗</a>}
      <a className="qf-secondary" href="/">Revenir au site</a>
      <button type="button" className="qf-back" onClick={restart}>Préparer une autre demande</button>
    </div>}

    <p className="qf-help">Besoin d’aide ? Appelez-nous au <a href={PHONE_HREF}>{PHONE}</a></p>
  </div>;
}
