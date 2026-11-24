import {useEffect,useRef,useState,type ReactNode} from 'react';
import {labels,needs,type Details} from '../lib/lead';

type Need=typeof needs[number];
type Fields=Record<string,string>;
type Receipt={id:string;token:string;stored?:boolean;contact?:Fields};
type Errors=Record<string,string>;
type Answers={need:Need|null;name:string;email:string;phone:string;organization:string;website:string;event:string;date:string;city:string;postalCode:string;volume:string;annualVolume:string;transport:Details['transport']|'';message:string};

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
const transports:[Details['transport'],string][]=[['collecte et livraison','Collecte et livraison'],['livraison','Livraison uniquement'],['collecte','Collecte uniquement'],['dépôt et retrait','Je dépose et je récupère'],['à définir','Je ne sais pas encore']];
const LETTERS='ABCDE';

// One question per screen. The contact is sent after "org"; everything after it is optional.
const order=['need','name','reach','org','event','date','place','volume','transport','message'] as const;
type Q=typeof order[number];
const firstDetail=order.indexOf('event');
const empty:Answers={need:null,name:'',email:'',phone:'',organization:'',website:'',event:'',date:'',city:'',postalCode:'',volume:'',annualVolume:'',transport:'',message:''};

const Arrow=()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
const Spinner=()=><span className="qf-spinner" aria-hidden="true" />;
const Err=({id,text}:{id:string;text?:string})=>text?<p className="qf-error" id={`${id}-error`}>{text}</p>:null;

export default function QuoteForm({demo}:{demo:boolean}){
  const [hydrated,setHydrated]=useState(false);useEffect(()=>setHydrated(true),[]);
  const [qi,setQi]=useState(0),[dir,setDir]=useState<1|-1>(1),[a,setA]=useState<Answers>(empty);
  const [errors,setErrors]=useState<Errors>({}),[error,setError]=useState(''),[pending,setPending]=useState(false),[done,setDone]=useState(false);
  const [receipt,setReceipt]=useState<Receipt|null>(null),[contact,setContact]=useState<'idle'|'sending'|'sent'>('idle');
  const contactSending=useRef<Promise<Receipt|null>|null>(null),card=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),moved=useRef(false);
  const q:Q=order[qi],first=a.name.trim().split(/\s+/)[0]||'';

  useEffect(()=>{
    const query=new URLSearchParams(location.search),param=query.get('besoin'),volume=(query.get('volume')||'').replace(/\D/g,'').slice(0,8);
    if(volume&&volume!=='0')setA(p=>({...p,volume}));
    if(needs.includes(param as Need)){setA(p=>({...p,need:param as Need}));setQi(1);}
    try{const saved=sessionStorage.getItem('lpsa-receipt');if(saved){const r=JSON.parse(saved);if(typeof r.id==='string'&&typeof r.token==='string'){setReceipt(r);setContact('sent');setQi(firstDetail);}}}catch{/* A disabled session store does not prevent sending. */}
  },[]);
  // Each new question: keyboard users land in its field, touch users on its title (no surprise keyboard).
  useEffect(()=>{
    if(!moved.current)return;
    const root=stage.current,fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
    const target=(fine&&root?.querySelector<HTMLElement>('[data-first]'))||root?.querySelector<HTMLElement>('h2');
    target?.focus({preventScroll:true});
    const top=card.current?.getBoundingClientRect().top??0;
    if(top<0||top>innerHeight*.45)card.current?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  },[qi,done]);

  const set=(key:keyof Answers)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{const value=e.target.value;setA(p=>({...p,[key]:value}));if(errors[key])setErrors(p=>{const n={...p};delete n[key];return n;});};
  const move=(i:number)=>{moved.current=true;setDir(i>=qi?1:-1);setError('');setErrors({});setQi(i);};

  function validate(question:Q):Errors{
    const found:Errors={},email=a.email.trim(),phone=a.phone.trim();
    if(question==='name'&&a.name.trim().length<2)found.name='Indiquez votre prénom et votre nom.';
    if(question==='reach'){
      if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))found.email='Cette adresse email semble incomplète. Exemple : marie@mairie.fr';
      if(phone&&!/^[+\d\s().-]{6,40}$/.test(phone))found.phone='Ce numéro ne semble pas valide. Exemple : 06 12 34 56 78';
      if(!email&&!phone)found.email='Indiquez au moins un email ou un numéro de téléphone pour que nous puissions vous répondre.';
    }
    if(question==='place'&&a.postalCode.trim()&&!/^\d{5}$/.test(a.postalCode.trim()))found.postalCode='Le code postal compte 5 chiffres. Exemple : 74000';
    return found;
  }
  function next(e?:React.SyntheticEvent){
    e?.preventDefault();if(pending)return;
    const found=validate(q);setErrors(found);
    if(Object.keys(found).length){stage.current?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();return;}
    if(q==='need'&&!a.need)return setErrors({need:'Choisissez une prestation pour continuer.'});
    if(q==='org')return sendContact();
    if(q==='message')return void finish(false);
    move(qi+1);
  }
  function choose(key:'need'|'transport',value:string){
    setA(p=>({...p,[key]:value}));setErrors({});
    setTimeout(()=>move(qi+1),320); // let the selection blink before moving on
  }
  // Letter shortcuts (A, B, C…) on choice questions, as long as no text field has focus.
  useEffect(()=>{
    if(q!=='need'&&q!=='transport')return;
    const onKey=(e:KeyboardEvent)=>{
      if(e.metaKey||e.ctrlKey||e.altKey||(e.target as HTMLElement).matches('input,textarea'))return;
      const i=LETTERS.indexOf(e.key.toUpperCase());if(i<0)return;
      if(q==='need'&&needs[i])choose('need',needs[i]);
      if(q==='transport'&&transports[i])choose('transport',transports[i][0]);
    };
    addEventListener('keydown',onKey);return()=>removeEventListener('keydown',onKey);
  });

  // Outside the local demo, a request counts as transmitted once Netlify Forms or the CRM has recorded it.
  async function deliver(crm:()=>Promise<boolean>,fields:Fields){
    const stored=await crm();let sent=false;
    if(!demo){try{await sendToNetlify(fields);sent=true;}catch{/* The CRM copy may still exist. */}}
    if(!stored&&!sent)throw new Error(unavailable);return stored;
  }
  // Optimistic: the next question appears at once while the contact travels; on failure we come back here.
  function sendContact(){
    if(!a.need)return move(0);
    const fields:Fields={besoin:labels[a.need],nom:a.name.trim(),email:a.email.trim(),telephone:a.phone.trim(),organisation:a.organization.trim()};
    const base=receipt??{id:crypto.randomUUID(),token:Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')};
    setReceipt(base);setContact('sending');move(firstDetail);
    contactSending.current=deliver(()=>sendToCrm('/api/leads/','POST',{id:base.id,token:base.token,need:a.need,name:fields.nom,email:fields.email,phone:fields.telephone,organization:fields.organisation,website:a.website}),{etape:'1 — Coordonnées',reference:base.id,...fields,website:a.website})
      .then(stored=>{const r={...base,stored,contact:fields};setReceipt(r);try{sessionStorage.setItem('lpsa-receipt',JSON.stringify(r));}catch{/* Keep receipt in component state. */}setContact('sent');return r;})
      .catch(err=>{setContact('idle');moved.current=true;setDir(-1);setQi(order.indexOf('org'));setError(err instanceof Error?err.message:unavailable);return null;});
  }
  async function finish(skip:boolean){
    setPending(true);setError('');
    try{
      const r=contactSending.current?await contactSending.current:receipt;if(!r)return;
      if(!skip){
        const number=(v:string)=>v.trim()===''?null:Math.max(0,Math.round(Number(v.replace(/\s/g,''))||0));
        const details:Details={event:a.event.trim(),city:a.city.trim(),postalCode:a.postalCode.trim(),date:a.date,volume:number(a.volume),annualVolume:number(a.annualVolume),transport:a.transport||'à définir',message:a.message.trim()};
        await deliver(async()=>r.stored!==false&&await sendToCrm(`/api/leads/${r.id}/`,'PATCH',{token:r.token,...details},[404]),{etape:'2 — Détails',reference:r.id,...r.contact,evenement:details.event,ville:details.city,'code-postal':details.postalCode,date:details.date,volume:details.volume?.toString()??'','volume-annuel':details.annualVolume?.toString()??'',transport:details.transport,message:details.message});
      }
      try{sessionStorage.removeItem('lpsa-receipt');}catch{}moved.current=true;setDone(true);
    }catch(err){setError(err instanceof Error?err.message:'Une erreur est survenue.');}finally{setPending(false);}
  }
  function restart(){try{sessionStorage.removeItem('lpsa-receipt');}catch{}contactSending.current=null;setReceipt(null);setContact('idle');setA(empty);setDone(false);move(0);}

  // Optimistic progress: front-loaded so every answer feels like a real step forward.
  const frac=done?1:(qi+1+(pending?.6:0))/(order.length+1),pct=done?100:Math.round(100*(1-Math.pow(1-frac,1.6)));
  const isEmpty=(...v:string[])=>v.every(x=>!x.trim());
  const canGoBack=qi>0&&!(qi===firstDetail&&contact!=='idle')&&!pending;
  const ok=(label:string,blank=false)=><div className="tf-actions">
    <button className="qf-primary tf-ok" disabled={pending||!hydrated}>{pending?<><Spinner />Envoi…</>:blank?<>Passer <Arrow /></>:<>{label} <Arrow /></>}</button>
    <span className="tf-enter" aria-hidden="true">ou appuyez sur <kbd>Entrée ↵</kbd></span>
  </div>;
  const field=(name:keyof Answers,props:React.InputHTMLAttributes<HTMLInputElement>,firstField=false)=><input id={`tf-${name}`} name={name} value={a[name] as string} onChange={set(name)} aria-invalid={errors[name]?true:undefined} aria-describedby={errors[name]?`tf-${name}-error`:undefined} data-first={firstField||undefined} {...props} />;

  let body:ReactNode;
  if(q==='need')body=<>
    <p className="tf-num">1 <Arrow /> Pour commencer</p>
    <h2 tabIndex={-1}>De quoi avez-vous besoin ?</h2>
    <p className="tf-sub">Choisissez une prestation. Vous pourrez nous parler des autres ensuite.</p>
    <div className="qf-choices" role="group" aria-label="Prestations">
      {needs.map((n,i)=><button type="button" key={n} className="qf-choice" aria-pressed={a.need===n} disabled={!hydrated} data-first={i===0||undefined} onClick={()=>choose('need',n)}>
        <span className="qf-ico">{icons[n]}</span><strong>{labels[n]}</strong><small>{descriptions[n]}</small><kbd className="tf-key" aria-hidden="true">{LETTERS[i]}</kbd>
      </button>)}
    </div>
    <Err id="tf-need" text={errors.need} />
  </>;
  if(q==='name')body=<>
    {a.need&&<p className="tf-chosen"><span className="qf-ico small">{icons[a.need]}</span>{labels[a.need]}</p>}
    <p className="tf-num">2 <Arrow /></p>
    <h2 tabIndex={-1}><label htmlFor="tf-name">Comment vous appelez-vous ?</label></h2>
    <p className="tf-sub">Votre prénom et votre nom.</p>
    {field('name',{className:'tf-big',autoComplete:'name',maxLength:200,placeholder:'Marie Dupont'},true)}<Err id="tf-name" text={errors.name} />
    {ok('OK')}
  </>;
  if(q==='reach')body=<>
    <p className="tf-num">3 <Arrow /></p>
    <h2 tabIndex={-1}>Comment pouvons-nous vous joindre{first?`, ${first}`:''} ?</h2>
    <p className="tf-sub">Un email <b>ou</b> un numéro de téléphone suffit.</p>
    <div className="qf-grid tf-grid">
      <div className="qf-field"><label htmlFor="tf-email">Email</label>{field('email',{type:'email',inputMode:'email',autoComplete:'email',maxLength:254,placeholder:'marie@exemple.fr'},true)}<Err id="tf-email" text={errors.email} /></div>
      <div className="qf-field"><label htmlFor="tf-phone">Téléphone</label>{field('phone',{type:'tel',inputMode:'tel',autoComplete:'tel',maxLength:40,placeholder:'06 12 34 56 78'})}<Err id="tf-phone" text={errors.phone} /></div>
    </div>
    {ok('OK')}
  </>;
  if(q==='org')body=<>
    <p className="tf-num">4 <Arrow /> <span className="qf-tag">facultatif</span></p>
    <h2 tabIndex={-1}><label htmlFor="tf-organization">Pour quelle structure ?</label></h2>
    <p className="tf-sub">Association, mairie, entreprise, festival… Laissez vide si vous venez à titre personnel.</p>
    {field('organization',{className:'tf-big',autoComplete:'organization',maxLength:200,placeholder:'Le nom de votre structure'},true)}
    <label className="honeypot" aria-hidden="true">Votre site<input name="website" tabIndex={-1} autoComplete="off" value={a.website} onChange={set('website')} /></label>
    <p className="qf-fine">En continuant, vous transmettez vos coordonnées et votre besoin à La Plonge s’Adapte pour préparer votre demande. <a href="/confidentialite/">Vos données</a></p>
    {ok('Transmettre mes coordonnées')}
  </>;
  if(q==='event')body=<>
    <p className={`tf-toast${contact==='sent'?' ok':''}`} role="status">{contact==='sent'?<><span aria-hidden="true">✓</span>Vos coordonnées ont bien été transmises.</>:<><Spinner />Envoi de vos coordonnées…</>}</p>
    <p className="tf-num">5 <Arrow /> <span className="qf-tag">facultatif</span></p>
    <h2 tabIndex={-1}><label htmlFor="tf-event">Comment s’appelle votre événement ?</label></h2>
    <p className="tf-sub">Les questions suivantes sont facultatives : répondez à ce que vous savez déjà.</p>
    {field('event',{className:'tf-big',maxLength:200,placeholder:'Festival, marché, réception…'},true)}
    {ok('OK',isEmpty(a.event))}
  </>;
  if(q==='date')body=<>
    <p className="tf-num">6 <Arrow /> <span className="qf-tag">facultatif</span></p>
    <h2 tabIndex={-1}><label htmlFor="tf-date">Quand commence-t-il ?</label></h2>
    <p className="tf-sub">La date du premier jour, même approximative.</p>
    {field('date',{className:'tf-big tf-date',type:'date'},true)}
    {ok('OK',isEmpty(a.date))}
  </>;
  if(q==='place')body=<>
    <p className="tf-num">7 <Arrow /> <span className="qf-tag">facultatif</span></p>
    <h2 tabIndex={-1}>Où se déroule-t-il ?</h2>
    <p className="tf-sub">Nous intervenons en Haute-Savoie, Savoie et Ain.</p>
    <div className="qf-grid tf-grid">
      <div className="qf-field"><label htmlFor="tf-city">Ville</label>{field('city',{autoComplete:'address-level2',maxLength:200,placeholder:'Annecy, Chambéry…'},true)}</div>
      <div className="qf-field"><label htmlFor="tf-postalCode">Code postal</label>{field('postalCode',{inputMode:'numeric',autoComplete:'postal-code',maxLength:5,placeholder:'74000'})}<Err id="tf-postalCode" text={errors.postalCode} /></div>
    </div>
    {ok('OK',isEmpty(a.city,a.postalCode))}
  </>;
  if(q==='volume')body=<>
    <p className="tf-num">8 <Arrow /> <span className="qf-tag">facultatif</span></p>
    <h2 tabIndex={-1}>Combien de gobelets ou de pièces ?</h2>
    <p className="tf-sub">Une estimation suffit.</p>
    <div className="qf-grid tf-grid">
      <div className="qf-field"><label htmlFor="tf-volume">Pour cet événement</label>{field('volume',{type:'number',inputMode:'numeric',min:0,max:10000000,placeholder:'Ex. 5 000'},true)}</div>
      <div className="qf-field"><label htmlFor="tf-annualVolume">Par an, si vous en organisez plusieurs</label>{field('annualVolume',{type:'number',inputMode:'numeric',min:0,max:100000000,placeholder:'Ex. 40 000'})}</div>
    </div>
    {a.need==='lavage'&&<p className="qf-note"><span aria-hidden="true">i</span>Le lavage commence à 3 000 gobelets par événement.</p>}
    {a.need==='vaisselle'&&<p className="qf-note"><span aria-hidden="true">i</span>Pour la vaisselle, le minimum de commande est de 1 500 € pour la location et le lavage ; le transport est en supplément.</p>}
    {ok('OK',isEmpty(a.volume,a.annualVolume))}
  </>;
  if(q==='transport')body=<>
    <p className="tf-num">9 <Arrow /> <span className="qf-tag">facultatif</span></p>
    <h2 tabIndex={-1}>Pour le transport, que préférez-vous ?</h2>
    <p className="tf-sub">Touchez une réponse.</p>
    <div className="tf-options" role="group" aria-label="Transport">
      {transports.map(([value,label],i)=><button type="button" key={value} className="tf-option" aria-pressed={a.transport===value} data-first={i===0||undefined} onClick={()=>choose('transport',value)}><kbd aria-hidden="true">{LETTERS[i]}</kbd>{label}</button>)}
    </div>
  </>;
  if(q==='message')body=<>
    <p className="tf-num">10 <Arrow /> <span className="qf-tag">facultatif</span></p>
    <h2 tabIndex={-1}><label htmlFor="tf-message">Un dernier mot pour nous aider ?</label></h2>
    <p className="tf-sub">Formats, nombre de convives, budget, contraintes… ou rien du tout.</p>
    <textarea id="tf-message" name="message" data-first value={a.message} onChange={set('message')} maxLength={4000} rows={4} placeholder="Votre message" />
    <div className="tf-actions"><button className="qf-primary tf-ok" disabled={pending||!hydrated}>{pending?<><Spinner />Envoi…</>:<>Finaliser ma demande <Arrow /></>}</button></div>
  </>;

  return <div className="qf tf" ref={card}>
    {demo&&<p className="qf-demo">Démonstration locale : utilisez uniquement des coordonnées fictives. Aucun email n’est envoyé.</p>}
    <div className="tf-progress" role="progressbar" aria-label="Progression de votre demande" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{width:`${pct}%`}} className={pending||contact==='sending'?'busy':''} /></div>
    <p className="tf-meta"><span>{done?'Demande transmise':`Question ${qi+1} sur ${order.length}`}</span><span>{pct} %</span></p>
    {error&&<p className="qf-alert" role="alert">{error}</p>}
    <div className="tf-stage" ref={stage}>
      {done?<div className="qf-done tf-q fwd" key="done">
        <svg className="qf-check" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="44" /><path d="M30 49l12 12 25-26" /></svg>
        <h2 tabIndex={-1}>Le relais est pris{first?`, ${first}`:''}.</h2>
        <p className="tf-sub">Votre demande a été enregistrée. {demo?'Vous pouvez la retrouver dans l’espace équipe local.':'Notre équipe l’étudiera pour préparer la suite avec vous.'}</p>
        <ol className="qf-next"><li><b>1</b>Notre équipe étudie votre demande.</li><li><b>2</b>Nous vous recontactons pour préparer la suite ensemble.</li></ol>
        {demo&&<a className="qf-primary" href="/admin/">Voir la demande dans le back-office ↗</a>}
        <a className="qf-secondary" href="/">Revenir au site</a>
        <button type="button" className="qf-back" onClick={restart}>Préparer une autre demande</button>
      </div>:<form className={`tf-q ${dir>0?'fwd':'back'}`} key={q} onSubmit={next} noValidate>{body}</form>}
    </div>
    <div className="tf-foot">
      {!done&&<button type="button" className="qf-back tf-prev" disabled={!canGoBack} onClick={()=>move(qi-1)}>← Précédent</button>}
      {!done&&qi>=firstDetail&&<button type="button" className="qf-back" disabled={pending} onClick={()=>void finish(true)}>Terminer : j’ajouterai les détails lors de notre échange</button>}
    </div>
    <p className="qf-help">Besoin d’aide ? Appelez-nous au <a href={PHONE_HREF}>{PHONE}</a></p>
  </div>;
}
