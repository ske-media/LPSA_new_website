import {useEffect,useRef,useState,type ReactNode} from 'react';
import {labels,needs,profils,type Details} from '../lib/lead';

type Need=typeof needs[number];
type Fields=Record<string,string>;
type Receipt={id:string;token:string;stored?:boolean;contact?:Fields};
type Errors=Record<string,string>;
type Answers={need:Need|null;name:string;email:string;phone:string;organization:string;website:string;event:string;date:string;city:string;postalCode:string;volume:string;annualVolume:string;transport:Details['transport']|'';message:string};

type Lang='fr'|'en';
const PHONE_HREF='tel:+33787896760';
const PHONES:Record<Lang,string>={fr:'07 87 89 67 60',en:'+33 7 87 89 67 60'};

// Netlify Forms: the form is declared in public/__forms.html, the only place Netlify's build bot can see it.
async function sendToNetlify(fields:Fields,unavailable:string){
  const response=await fetch('/__forms.html',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({'form-name':'devis',...fields}).toString()});
  if(!response.ok)throw new Error(unavailable);
}
// CRM route: true when saved, false when the service is unavailable, throws when the request itself is refused.
async function sendToCrm(url:string,method:string,payload:unknown,unavailable:string,tolerate:number[]=[]){
  const response=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>null);
  if(response?.ok)return true;
  if(response&&response.status<500&&!tolerate.includes(response.status)){const data=await response.json().catch(()=>({}));throw new Error(data.error||unavailable);}
  return false;
}

const icon=(d:ReactNode)=><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const icons:Record<Need,ReactNode>={
  lavage:icon(<><path d="M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z"/><path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5"/></>),
  gobelets:icon(<><path d="M6 4h12l-1.6 15.2a1 1 0 0 1-1 .8H8.6a1 1 0 0 1-1-.8z"/><path d="M6.6 9h10.8"/></>),
  vaisselle:icon(<><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="3"/><path d="M3 4v6a1.5 1.5 0 0 0 1.5 1.5V20M21 4c-1.5 1-2 3-2 5s.8 2.5 2 2.5V20"/></>),
  'petits-lots':icon(<><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M10.5 20a5.5 5.5 0 0 1 11 0"/></>),
  conseil:icon(<><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></>),
  stockage:icon(<><path d="M3 8l9-5 9 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M7 20v-8h10v8M7 15h10"/></>),
};
// Values are the French enum sent to the API; only the visible label is translated.
const transports:Details['transport'][]=['collecte et livraison','livraison','collecte','dépôt et retrait','à définir'];
const T={
  fr:{
    unavailable:(phone:string)=>`Impossible de transmettre la demande. Réessayez ou appelez-nous au ${phone}.`,
    labels:labels as Record<Need,string>,
    descriptions:{
      lavage:'Vos gobelets lavés, séchés, comptés et reconditionnés.',
      gobelets:'Des gobelets réutilisables pour votre événement, avec leur retour au lavage.',
      vaisselle:'Banquets, mariages, repas d’affaires : vaisselle livrée, reprise et lavée.',
      'petits-lots':'Association, fête de village, kermesse : une formule pour les petits volumes.',
      conseil:'Être accompagné pour choisir et acheter votre propre parc.',
      stockage:'Votre parc de gobelets gardé entre deux événements.',
    } as Record<Need,string>,
    transports:{'collecte et livraison':'Collecte et livraison',livraison:'Livraison uniquement',collecte:'Collecte uniquement','dépôt et retrait':'Je dépose et je récupère','à définir':'Je ne sais pas encore'} as Record<Details['transport'],string>,
    selection:'Ma sélection de vaisselle :',
    errName:'Indiquez votre prénom et votre nom.',
    errEmail:'Cette adresse email semble incomplète. Exemple : marie@mairie.fr',
    errPhone:'Ce numéro ne semble pas valide. Exemple : 06 12 34 56 78',
    errReach:'Indiquez au moins un email ou un numéro de téléphone pour que nous puissions vous répondre.',
    errPostal:'Le code postal compte 5 chiffres. Exemple : 74000',
    errNeed:'Choisissez une prestation pour continuer.',
    errGeneric:'Une erreur est survenue.',
    sending:'Envoi…',skip:'Passer',enterOr:'ou appuyez sur',enter:'Entrée ↵',
    start:'Pour commencer',needQ:'De quoi avez-vous besoin ?',needSub:'Choisissez une prestation. Vous pourrez nous parler des autres ensuite.',needGroup:'Prestations',
    nameQ:'Comment vous appelez-vous ?',nameSub:'Votre prénom et votre nom.',namePh:'Marie Dupont',
    reachQ:(first:string)=>`Comment pouvons-nous vous joindre${first?`, ${first}`:''} ?`,reachSub:<>Un email <b>ou</b> un numéro de téléphone suffit.</>,
    email:'Email',emailPh:'marie@exemple.fr',phone:'Téléphone',phonePh:'06 12 34 56 78',
    optional:'facultatif',orgQ:'Pour quelle structure ?',orgSub:'Association, mairie, entreprise, festival… Laissez vide si vous venez à titre personnel.',orgPh:'Le nom de votre structure',
    honeypot:'Votre site',
    fine:'En continuant, vous transmettez vos coordonnées et votre besoin à La Plonge s’Adapte pour préparer votre demande.',privacy:'Vos données',
    sendContact:'Transmettre mes coordonnées',
    toastOk:'Vos coordonnées ont bien été transmises.',toastSending:'Envoi de vos coordonnées…',
    eventQ:'Comment s’appelle votre événement ?',eventSub:'Les questions suivantes sont facultatives : répondez à ce que vous savez déjà.',eventPh:'Festival, marché, réception…',
    dateQ:'Quand commence-t-il ?',dateSub:'La date du premier jour, même approximative.',
    placeQ:'Où se déroule-t-il ?',placeSub:'Nous intervenons en Haute-Savoie, Savoie et Ain.',city:'Ville',cityPh:'Annecy, Chambéry…',postal:'Code postal',
    volumeQ:'Combien de gobelets ou de pièces ?',volumeSub:'Une estimation suffit.',volume:'Pour cet événement',volumePh:'Ex. 800',annual:'Par an, si vous en organisez plusieurs',annualPh:'Ex. 2 500',
    tablewareNote:'Pour la vaisselle, le minimum de commande est de 1 500 € pour la location et le lavage ; le transport est en supplément.',
    transportQ:'Pour le transport, que préférez-vous ?',transportSub:'Touchez une réponse.',transportGroup:'Transport',
    messageQ:'Un dernier mot pour nous aider ?',messageSub:'Formats, nombre de convives, budget, contraintes… ou rien du tout.',messagePh:'Votre message',
    finish:'Finaliser ma demande',
    demo:'Démonstration locale : utilisez uniquement des coordonnées fictives. Aucun email n’est envoyé.',
    progress:'Progression de votre demande',sent:'Demande transmise',question:(i:number,n:number)=>`Question ${i} sur ${n}`,percent:(n:number)=>`${n} %`,
    doneQ:(first:string)=>`Le relais est pris${first?`, ${first}`:''}.`,doneSub:'Votre demande a été enregistrée.',doneDemo:'Vous pouvez la retrouver dans l’espace équipe local.',doneLive:'Notre équipe l’étudiera pour préparer la suite avec vous.',
    next1:'Notre équipe étudie votre demande.',next2:'Nous vous recontactons pour préparer la suite ensemble.',
    admin:'Voir la demande dans le back-office ↗',home:'Revenir au site',again:'Préparer une autre demande',
    prev:'← Précédent',later:'Terminer : j’ajouterai les détails lors de notre échange',help:'Besoin d’aide ? Appelez-nous au',
  },
  en:{
    unavailable:(phone:string)=>`We could not send your request. Please try again or call us on ${phone}.`,
    labels:{lavage:'Cup washing',gobelets:'Reusable cup rental',vaisselle:'Tableware rental','petits-lots':'Small event or association',conseil:'Advice on buying',stockage:'Cup stock storage'} as Record<Need,string>,
    descriptions:{
      lavage:'Your cups washed, dried, counted and repacked.',
      gobelets:'Reusable cups for your event, with their return for washing.',
      vaisselle:'Banquets, weddings, business meals: tableware delivered, collected and washed.',
      'petits-lots':'Association, village fête, school fair: a package for small volumes.',
      conseil:'Support in choosing and buying your own cup stock.',
      stockage:'Your stock of cups kept safe between two events.',
    } as Record<Need,string>,
    transports:{'collecte et livraison':'Collection and delivery',livraison:'Delivery only',collecte:'Collection only','dépôt et retrait':'I’ll drop off and pick up myself','à définir':'I don’t know yet'} as Record<Details['transport'],string>,
    selection:'My tableware selection:',
    errName:'Please enter your first name and surname.',
    errEmail:'This email address looks incomplete. Example: marie@example.com',
    errPhone:'This number does not look valid. Example: 06 12 34 56 78',
    errReach:'Please enter at least an email address or a phone number so that we can reply to you.',
    errPostal:'The postcode has 5 digits. Example: 74000',
    errNeed:'Choose a service to continue.',
    errGeneric:'Something went wrong.',
    sending:'Sending…',skip:'Skip',enterOr:'or press',enter:'Enter ↵',
    start:'To begin',needQ:'What do you need?',needSub:'Choose one service. You can tell us about the others afterwards.',needGroup:'Services',
    nameQ:'What is your name?',nameSub:'Your first name and surname.',namePh:'Marie Dupont',
    reachQ:(first:string)=>`How can we reach you${first?`, ${first}`:''}?`,reachSub:<>An email address <b>or</b> a phone number is enough.</>,
    email:'Email',emailPh:'marie@example.com',phone:'Phone',phonePh:'06 12 34 56 78',
    optional:'optional',orgQ:'Which organisation is this for?',orgSub:'Association, town hall, company, festival… Leave blank if you are asking as an individual.',orgPh:'The name of your organisation',
    honeypot:'Your website',
    fine:'By continuing, you send your contact details and your request to La Plonge s’Adapte so that we can prepare your quote.',privacy:'Your data',
    sendContact:'Send my contact details',
    toastOk:'Your contact details have been sent.',toastSending:'Sending your contact details…',
    eventQ:'What is your event called?',eventSub:'The following questions are optional: just answer what you already know.',eventPh:'Festival, market, reception…',
    dateQ:'When does it start?',dateSub:'The date of the first day, even if approximate.',
    placeQ:'Where is it taking place?',placeSub:'We operate in Haute-Savoie, Savoie and Ain.',city:'Town',cityPh:'Annecy, Chambéry…',postal:'Postcode',
    volumeQ:'How many cups or items?',volumeSub:'An estimate is enough.',volume:'For this event',volumePh:'e.g. 800',annual:'Per year, if you organise several',annualPh:'e.g. 2,500',
    tablewareNote:'For tableware, the minimum order is €1,500 for rental and washing; transport is extra.',
    transportQ:'For transport, what would you prefer?',transportSub:'Tap an answer.',transportGroup:'Transport',
    messageQ:'Anything else that would help us?',messageSub:'Formats, number of guests, budget, constraints… or nothing at all.',messagePh:'Your message',
    finish:'Complete my request',
    demo:'Local demo: use fictitious contact details only. No email is sent.',
    progress:'Progress of your request',sent:'Request sent',question:(i:number,n:number)=>`Question ${i} of ${n}`,percent:(n:number)=>`${n}%`,
    doneQ:(first:string)=>`We’ll take it from here${first?`, ${first}`:''}.`,doneSub:'Your request has been recorded.',doneDemo:'You can find it in the local team area.',doneLive:'Our team will review it and prepare the next steps with you.',
    next1:'Our team reviews your request.',next2:'We get back to you to prepare the next steps together.',
    admin:'View the request in the back office ↗',home:'Back to the website',again:'Prepare another request',
    prev:'← Previous',later:'Finish: I’ll add the details when we talk',help:'Need help? Call us on',
  },
};
const LETTERS='ABCDEF';

// One question per screen. The contact is sent after "org"; everything after it is optional.
const order=['need','name','reach','org','event','date','place','volume','transport','message'] as const;
type Q=typeof order[number];
const firstDetail=order.indexOf('event');
const empty:Answers={need:null,name:'',email:'',phone:'',organization:'',website:'',event:'',date:'',city:'',postalCode:'',volume:'',annualVolume:'',transport:'',message:''};

const Arrow=()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
const Spinner=()=><span className="qf-spinner" aria-hidden="true" />;
const Err=({id,text}:{id:string;text?:string})=>text?<p className="qf-error" id={`${id}-error`}>{text}</p>:null;

export default function QuoteForm({demo,lang='fr'}:{demo:boolean;lang?:Lang}){
  const t=T[lang],PHONE=PHONES[lang],unavailable=t.unavailable(PHONE),prefix=lang==='en'?'/en':'';
  const [hydrated,setHydrated]=useState(false);useEffect(()=>setHydrated(true),[]);
  const [qi,setQi]=useState(0),[dir,setDir]=useState<1|-1>(1),[a,setA]=useState<Answers>(empty);
  const [errors,setErrors]=useState<Errors>({}),[error,setError]=useState(''),[pending,setPending]=useState(false),[done,setDone]=useState(false);
  const [profil,setProfil]=useState('');
  const [receipt,setReceipt]=useState<Receipt|null>(null),[contact,setContact]=useState<'idle'|'sending'|'sent'>('idle');
  const contactSending=useRef<Promise<Receipt|null>|null>(null),card=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),moved=useRef(false);
  const q:Q=order[qi],first=a.name.trim().split(/\s+/)[0]||'';

  useEffect(()=>{
    const query=new URLSearchParams(location.search),param=query.get('besoin'),volume=(query.get('volume')||'').replace(/\D/g,'').slice(0,8);
    if(volume&&volume!=='0')setA(p=>({...p,volume}));
    setProfil(profils[query.get('profil')||'']||'');
    // Selection built on the tableware catalogue page: "Name × qty" lines.
    const selection=(query.get('selection')||'').split('|').map(l=>l.replace(/[\u0000-\u001f<>]/g,'').trim()).filter(Boolean).slice(0,60);
    if(selection.length)setA(p=>({...p,message:(`${t.selection}\n${selection.map(l=>`- ${l}`).join('\n')}`).slice(0,3800)}));
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
    if(question==='name'&&a.name.trim().length<2)found.name=t.errName;
    if(question==='reach'){
      if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))found.email=t.errEmail;
      if(phone&&!/^[+\d\s().-]{6,40}$/.test(phone))found.phone=t.errPhone;
      if(!email&&!phone)found.email=t.errReach;
    }
    if(question==='place'&&a.postalCode.trim()&&!/^\d{5}$/.test(a.postalCode.trim()))found.postalCode=t.errPostal;
    return found;
  }
  function next(e?:React.SyntheticEvent){
    e?.preventDefault();if(pending)return;
    const found=validate(q);setErrors(found);
    if(Object.keys(found).length){stage.current?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();return;}
    if(q==='need'&&!a.need)return setErrors({need:t.errNeed});
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
      if(q==='transport'&&transports[i])choose('transport',transports[i]);
    };
    addEventListener('keydown',onKey);return()=>removeEventListener('keydown',onKey);
  });

  // Outside the local demo, a request counts as transmitted once Netlify Forms or the CRM has recorded it.
  async function deliver(crm:()=>Promise<boolean>,fields:Fields){
    const stored=await crm();let sent=false;
    if(!demo){try{await sendToNetlify(fields,unavailable);sent=true;}catch{/* The CRM copy may still exist. */}}
    if(!stored&&!sent)throw new Error(unavailable);return stored;
  }
  // Optimistic: the next question appears at once while the contact travels; on failure we come back here.
  function sendContact(){
    if(!a.need)return move(0);
    const fields:Fields={besoin:labels[a.need],nom:a.name.trim(),email:a.email.trim(),telephone:a.phone.trim(),organisation:a.organization.trim()};
    const base=receipt??{id:crypto.randomUUID(),token:Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')};
    setReceipt(base);setContact('sending');move(firstDetail);
    contactSending.current=deliver(()=>sendToCrm('/api/leads/','POST',{id:base.id,token:base.token,need:a.need,name:fields.nom,email:fields.email,phone:fields.telephone,organization:fields.organisation,website:a.website},unavailable),{etape:'1 — Coordonnées',reference:base.id,profil,langue:lang,...fields,website:a.website})
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
        await deliver(async()=>r.stored!==false&&await sendToCrm(`/api/leads/${r.id}/`,'PATCH',{token:r.token,...details},unavailable,[404]),{etape:'2 — Détails',reference:r.id,profil,langue:lang,...r.contact,evenement:details.event,ville:details.city,'code-postal':details.postalCode,date:details.date,volume:details.volume?.toString()??'','volume-annuel':details.annualVolume?.toString()??'',transport:details.transport,message:details.message});
      }
      try{sessionStorage.removeItem('lpsa-receipt');}catch{}moved.current=true;setDone(true);
    }catch(err){setError(err instanceof Error?err.message:t.errGeneric);}finally{setPending(false);}
  }
  function restart(){try{sessionStorage.removeItem('lpsa-receipt');}catch{}contactSending.current=null;setReceipt(null);setContact('idle');setA(empty);setDone(false);move(0);}

  // Optimistic progress: front-loaded so every answer feels like a real step forward.
  const frac=done?1:(qi+1+(pending?.6:0))/(order.length+1),pct=done?100:Math.round(100*(1-Math.pow(1-frac,1.6)));
  const isEmpty=(...v:string[])=>v.every(x=>!x.trim());
  const canGoBack=qi>0&&!(qi===firstDetail&&contact!=='idle')&&!pending;
  const ok=(label:string,blank=false)=><div className="tf-actions">
    <button className="qf-primary tf-ok" disabled={pending||!hydrated}>{pending?<><Spinner />{t.sending}</>:blank?<>{t.skip} <Arrow /></>:<>{label} <Arrow /></>}</button>
    <span className="tf-enter" aria-hidden="true">{t.enterOr} <kbd>{t.enter}</kbd></span>
  </div>;
  const field=(name:keyof Answers,props:React.InputHTMLAttributes<HTMLInputElement>,firstField=false)=><input id={`tf-${name}`} name={name} value={a[name] as string} onChange={set(name)} aria-invalid={errors[name]?true:undefined} aria-describedby={errors[name]?`tf-${name}-error`:undefined} data-first={firstField||undefined} {...props} />;

  let body:ReactNode;
  if(q==='need')body=<>
    <p className="tf-num">1 <Arrow /> {t.start}</p>
    <h2 tabIndex={-1}>{t.needQ}</h2>
    <p className="tf-sub">{t.needSub}</p>
    <div className="qf-choices" role="group" aria-label={t.needGroup}>
      {needs.map((n,i)=><button type="button" key={n} className="qf-choice" aria-pressed={a.need===n} disabled={!hydrated} data-first={i===0||undefined} onClick={()=>choose('need',n)}>
        <span className="qf-ico">{icons[n]}</span><strong>{t.labels[n]}</strong><small>{t.descriptions[n]}</small><kbd className="tf-key" aria-hidden="true">{LETTERS[i]}</kbd>
      </button>)}
    </div>
    <Err id="tf-need" text={errors.need} />
  </>;
  if(q==='name')body=<>
    {a.need&&<p className="tf-chosen"><span className="qf-ico small">{icons[a.need]}</span>{t.labels[a.need]}</p>}
    <p className="tf-num">2 <Arrow /></p>
    <h2 tabIndex={-1}><label htmlFor="tf-name">{t.nameQ}</label></h2>
    <p className="tf-sub">{t.nameSub}</p>
    {field('name',{className:'tf-big',autoComplete:'name',maxLength:200,placeholder:t.namePh},true)}<Err id="tf-name" text={errors.name} />
    {ok('OK')}
  </>;
  if(q==='reach')body=<>
    <p className="tf-num">3 <Arrow /></p>
    <h2 tabIndex={-1}>{t.reachQ(first)}</h2>
    <p className="tf-sub">{t.reachSub}</p>
    <div className="qf-grid tf-grid">
      <div className="qf-field"><label htmlFor="tf-email">{t.email}</label>{field('email',{type:'email',inputMode:'email',autoComplete:'email',maxLength:254,placeholder:t.emailPh},true)}<Err id="tf-email" text={errors.email} /></div>
      <div className="qf-field"><label htmlFor="tf-phone">{t.phone}</label>{field('phone',{type:'tel',inputMode:'tel',autoComplete:'tel',maxLength:40,placeholder:t.phonePh})}<Err id="tf-phone" text={errors.phone} /></div>
    </div>
    {ok('OK')}
  </>;
  if(q==='org')body=<>
    <p className="tf-num">4 <Arrow /> <span className="qf-tag">{t.optional}</span></p>
    <h2 tabIndex={-1}><label htmlFor="tf-organization">{t.orgQ}</label></h2>
    <p className="tf-sub">{t.orgSub}</p>
    {field('organization',{className:'tf-big',autoComplete:'organization',maxLength:200,placeholder:t.orgPh},true)}
    <label className="honeypot" aria-hidden="true">{t.honeypot}<input name="website" tabIndex={-1} autoComplete="off" value={a.website} onChange={set('website')} /></label>
    <p className="qf-fine">{t.fine} <a href={`${prefix}/confidentialite/`}>{t.privacy}</a></p>
    {ok(t.sendContact)}
  </>;
  if(q==='event')body=<>
    <p className={`tf-toast${contact==='sent'?' ok':''}`} role="status">{contact==='sent'?<><span aria-hidden="true">✓</span>{t.toastOk}</>:<><Spinner />{t.toastSending}</>}</p>
    <p className="tf-num">5 <Arrow /> <span className="qf-tag">{t.optional}</span></p>
    <h2 tabIndex={-1}><label htmlFor="tf-event">{t.eventQ}</label></h2>
    <p className="tf-sub">{t.eventSub}</p>
    {field('event',{className:'tf-big',maxLength:200,placeholder:t.eventPh},true)}
    {ok('OK',isEmpty(a.event))}
  </>;
  if(q==='date')body=<>
    <p className="tf-num">6 <Arrow /> <span className="qf-tag">{t.optional}</span></p>
    <h2 tabIndex={-1}><label htmlFor="tf-date">{t.dateQ}</label></h2>
    <p className="tf-sub">{t.dateSub}</p>
    {field('date',{className:'tf-big tf-date',type:'date'},true)}
    {ok('OK',isEmpty(a.date))}
  </>;
  if(q==='place')body=<>
    <p className="tf-num">7 <Arrow /> <span className="qf-tag">{t.optional}</span></p>
    <h2 tabIndex={-1}>{t.placeQ}</h2>
    <p className="tf-sub">{t.placeSub}</p>
    <div className="qf-grid tf-grid">
      <div className="qf-field"><label htmlFor="tf-city">{t.city}</label>{field('city',{autoComplete:'address-level2',maxLength:200,placeholder:t.cityPh},true)}</div>
      <div className="qf-field"><label htmlFor="tf-postalCode">{t.postal}</label>{field('postalCode',{inputMode:'numeric',autoComplete:'postal-code',maxLength:5,placeholder:'74000'})}<Err id="tf-postalCode" text={errors.postalCode} /></div>
    </div>
    {ok('OK',isEmpty(a.city,a.postalCode))}
  </>;
  if(q==='volume')body=<>
    <p className="tf-num">8 <Arrow /> <span className="qf-tag">{t.optional}</span></p>
    <h2 tabIndex={-1}>{t.volumeQ}</h2>
    <p className="tf-sub">{t.volumeSub}</p>
    <div className="qf-grid tf-grid">
      <div className="qf-field"><label htmlFor="tf-volume">{t.volume}</label>{field('volume',{type:'number',inputMode:'numeric',min:0,max:10000000,placeholder:t.volumePh},true)}</div>
      <div className="qf-field"><label htmlFor="tf-annualVolume">{t.annual}</label>{field('annualVolume',{type:'number',inputMode:'numeric',min:0,max:100000000,placeholder:t.annualPh})}</div>
    </div>
    {a.need==='vaisselle'&&<p className="qf-note"><span aria-hidden="true">i</span>{t.tablewareNote}</p>}
    {ok('OK',isEmpty(a.volume,a.annualVolume))}
  </>;
  if(q==='transport')body=<>
    <p className="tf-num">9 <Arrow /> <span className="qf-tag">{t.optional}</span></p>
    <h2 tabIndex={-1}>{t.transportQ}</h2>
    <p className="tf-sub">{t.transportSub}</p>
    <div className="tf-options" role="group" aria-label={t.transportGroup}>
      {transports.map((value,i)=><button type="button" key={value} className="tf-option" aria-pressed={a.transport===value} data-first={i===0||undefined} onClick={()=>choose('transport',value)}><kbd aria-hidden="true">{LETTERS[i]}</kbd>{t.transports[value]}</button>)}
    </div>
  </>;
  if(q==='message')body=<>
    <p className="tf-num">10 <Arrow /> <span className="qf-tag">{t.optional}</span></p>
    <h2 tabIndex={-1}><label htmlFor="tf-message">{t.messageQ}</label></h2>
    <p className="tf-sub">{t.messageSub}</p>
    <textarea id="tf-message" name="message" data-first value={a.message} onChange={set('message')} maxLength={4000} rows={4} placeholder={t.messagePh} />
    <div className="tf-actions"><button className="qf-primary tf-ok" disabled={pending||!hydrated}>{pending?<><Spinner />{t.sending}</>:<>{t.finish} <Arrow /></>}</button></div>
  </>;

  return <div className="qf tf" ref={card}>
    {demo&&<p className="qf-demo">{t.demo}</p>}
    <div className="tf-progress" role="progressbar" aria-label={t.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{width:`${pct}%`}} className={pending||contact==='sending'?'busy':''} /></div>
    <p className="tf-meta"><span>{done?t.sent:t.question(qi+1,order.length)}</span><span>{t.percent(pct)}</span></p>
    {error&&<p className="qf-alert" role="alert">{error}</p>}
    <div className="tf-stage" ref={stage}>
      {done?<div className="qf-done tf-q fwd" key="done">
        <svg className="qf-check" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="44" /><path d="M30 49l12 12 25-26" /></svg>
        <h2 tabIndex={-1}>{t.doneQ(first)}</h2>
        <p className="tf-sub">{t.doneSub} {demo?t.doneDemo:t.doneLive}</p>
        <ol className="qf-next"><li><b>1</b>{t.next1}</li><li><b>2</b>{t.next2}</li></ol>
        {demo&&<a className="qf-primary" href="/admin/">{t.admin}</a>}
        <a className="qf-secondary" href={`${prefix}/`}>{t.home}</a>
        <button type="button" className="qf-back" onClick={restart}>{t.again}</button>
      </div>:<form className={`tf-q ${dir>0?'fwd':'back'}`} key={q} onSubmit={next} noValidate>{body}</form>}
    </div>
    <div className="tf-foot">
      {!done&&<button type="button" className="qf-back tf-prev" disabled={!canGoBack} onClick={()=>move(qi-1)}>{t.prev}</button>}
      {!done&&qi>=firstDetail&&<button type="button" className="qf-back" disabled={pending} onClick={()=>void finish(true)}>{t.later}</button>}
    </div>
    <p className="qf-help">{t.help} <a href={PHONE_HREF}>{PHONE}</a></p>
  </div>;
}
