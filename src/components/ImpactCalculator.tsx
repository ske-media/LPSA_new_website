import {useState} from 'react';
import {oethScenario,reuseScenario} from '../lib/impact';
import CompanyLookup from './CompanyLookup';
type Lang='fr'|'en';
const T={
  fr:{
    tabReuse:'Le réemploi',tabOeth:'OETH / AGEFIPH',
    reuseTitle:'Votre parc, plusieurs vies.',reuseIntro:'Un scénario de volumes pour préparer vos rotations. Les valeurs proposées sont un exemple modifiable.',
    park:'Gobelets dans votre parc',uses:'Nombre total d’utilisations prévues',
    useHelp:'Une utilisation correspond ici à une boisson servie dans un gobelet. Les lavages nécessaires dépendent de votre organisation.',
    reuseEyebrow:'VOTRE SCÉNARIO DE RÉEMPLOI',average:'utilisations moyennes par gobelet du parc',
    planned:'Services prévus',mobilised:'Parc mobilisé',cups:'gobelets',equivalent:'Équivalent jetable théorique',singleUse:'gobelets à usage unique',
    reuseNote:'L’équivalent suppose un gobelet jetable par utilisation. Ce résultat ne mesure ni des déchets effectivement évités ni un bilan carbone. Le transport, les pertes et les lavages doivent être étudiés séparément.',
    reuseCta:'Préparer cette organisation ↗',
    oethTitle:'Une déduction, sous conditions.',situation:'Votre situation',
    unknown:'Je ne sais pas encore',private:'Entreprise privée assujettie, hors accord agréé',public:'Employeur public',
    labor:'Coût de main-d’œuvre éligible (€)',laborHelp:'Utilisez l’assiette de votre attestation ou une hypothèse explicite. Ce n’est pas le montant total de location, transport et lavage.',
    contribution:'Contribution brute avant déductions (€)',employment:'Taux d’emploi de bénéficiaires OETH (%)',other:'Autres déductions de sous-traitance déjà utilisées (€)',
    oethEyebrow:'ESTIMATION INDICATIVE',deduction:'de déduction additionnelle estimée',
    potential:'Potentiel avant plafonnement',cap:'Plafond global de sous-traitance',remaining:'Plafond encore disponible',
    publicTitle:'Un dispositif distinct.',unknownTitle:'Confirmons votre situation.',
    publicText:'Les règles du secteur public relèvent du FIPHFP. Ce simulateur privé ne s’applique pas à votre situation.',
    unknownText:'Le SIREN ou une tranche d’effectif ne suffisent pas à établir votre assujettissement. Vérifiez les données de votre DOETH avant de retenir un montant.',
    oethNote:'Exemple modifiable, sans valeur d’attestation. La déduction dépend des dépenses réglées, de la main-d’œuvre éligible et de votre situation déclarative. Elle ne correspond pas à une remise sur la facture ni à une réduction fiscale.',
    oethCta:'Étudier une prestation avec LPSA ↗',rules:'Comprendre les règles',
  },
  en:{
    tabReuse:'Reuse',tabOeth:'OETH / AGEFIPH',
    reuseTitle:'Your cup stock, many lives.',reuseIntro:'A volume scenario to help plan your rotations. The suggested values are an example you can change.',
    park:'Reusable cups in your stock',uses:'Total number of planned uses',
    useHelp:'Here, one use means one drink served in a cup. The number of washes needed depends on how you organise your event.',
    reuseEyebrow:'YOUR REUSE SCENARIO',average:'average uses per cup in your stock',
    planned:'Planned servings',mobilised:'Stock in use',cups:'reusable cups',equivalent:'Theoretical disposable equivalent',singleUse:'single-use cups',
    reuseNote:'The equivalent assumes one disposable cup per use. This result measures neither waste actually avoided nor a carbon footprint. Transport, losses and washing must be assessed separately.',
    reuseCta:'Plan this set-up ↗',
    oethTitle:'A deduction, subject to conditions.',situation:'Your situation',
    unknown:'I don’t know yet',private:'Private company subject to the obligation, without an approved agreement',public:'Public-sector employer',
    labor:'Eligible labour cost (€)',laborHelp:'Use the basis shown on your certificate or a clearly stated assumption. This is not the total amount for rental, transport and washing.',
    contribution:'Gross contribution before deductions (€)',employment:'Employment rate of OETH beneficiaries (%)',other:'Other subcontracting deductions already used (€)',
    oethEyebrow:'INDICATIVE ESTIMATE',deduction:'estimated additional deduction',
    potential:'Potential before the cap',cap:'Overall subcontracting cap',remaining:'Cap still available',
    publicTitle:'A separate scheme.',unknownTitle:'Let’s confirm your situation.',
    publicText:'Public-sector rules fall under the FIPHFP. This private-sector simulator does not apply to your situation.',
    unknownText:'A SIREN number or headcount band is not enough to establish whether you are subject to the obligation. Check the data in your DOETH before relying on an amount.',
    oethNote:'An example you can change, with no value as a certificate. The deduction depends on the expenses paid, the eligible labour and your declaration status. It is neither a discount on the invoice nor a tax reduction.',
    oethCta:'Explore a service with LPSA ↗',rules:'Understand the rules',
  },
};
export default function ImpactCalculator({lang='fr'}:{lang?:Lang}){
  const t=T[lang],locale=lang==='en'?'en-GB':'fr-FR',prefix=lang==='en'?'/en':'';
  const euros=(n:number)=>n.toLocaleString(locale,{style:'currency',currency:'EUR',maximumFractionDigits:0});
  const [tab,setTab]=useState<'reuse'|'oeth'>('reuse'),[park,setPark]=useState(600),[uses,setUses]=useState(2400),[labor,setLabor]=useState(5000),[contribution,setContribution]=useState(4000),[employment,setEmployment]=useState(1.5),[other,setOther]=useState(1200),[scope,setScope]=useState('unknown');
  const reuse=reuseScenario(Math.max(0,park),Math.max(0,uses)),oeth=oethScenario({eligibleLabor:Math.max(0,labor),contribution:Math.max(0,contribution),employmentRate:Math.min(100,Math.max(0,employment)),otherDeductions:Math.max(0,other)});
  return <div className="impact-tool"><div className="tool-tabs"><button className={tab==='reuse'?'active':''} aria-pressed={tab==='reuse'} onClick={()=>setTab('reuse')}>{t.tabReuse}</button><button className={tab==='oeth'?'active':''} aria-pressed={tab==='oeth'} onClick={()=>setTab('oeth')}>{t.tabOeth}</button></div>
    {tab==='reuse'?<div className="tool-grid"><div className="form-card"><h2>{t.reuseTitle}</h2><p className="field-help">{t.reuseIntro}</p><label>{t.park}<input type="number" value={park} min={0} max={10000000} onChange={e=>setPark(Number(e.target.value))}/></label><label>{t.uses}<input type="number" value={uses} min={0} max={100000000} onChange={e=>setUses(Number(e.target.value))}/></label><p className="field-help">{t.useHelp}</p></div><div className="impact-results"><p className="eyebrow">{t.reuseEyebrow}</p><strong>{reuse.averageRotations.toLocaleString(locale,{maximumFractionDigits:1})}×</strong><p>{t.average}</p><dl><dt>{t.planned}</dt><dd>{uses.toLocaleString(locale)}</dd><dt>{t.mobilised}</dt><dd>{park.toLocaleString(locale)} {t.cups}</dd><dt>{t.equivalent}</dt><dd>{uses.toLocaleString(locale)} {t.singleUse}</dd></dl><p className="field-help">{t.reuseNote}</p><a className="button" href={`${prefix}/devis/?besoin=lavage`}>{t.reuseCta}</a></div></div>:<div className="tool-grid"><div className="form-card"><h2>{t.oethTitle}</h2><CompanyLookup lang={lang} /><label htmlFor="oeth-scope">{t.situation}</label><select id="oeth-scope" value={scope} onChange={e=>setScope(e.target.value)}><option value="unknown">{t.unknown}</option><option value="private">{t.private}</option><option value="public">{t.public}</option></select><label>{t.labor}<input type="number" value={labor} min={0} onChange={e=>setLabor(Number(e.target.value))}/></label><p className="field-help">{t.laborHelp}</p><label>{t.contribution}<input type="number" value={contribution} min={0} onChange={e=>setContribution(Number(e.target.value))}/></label><label>{t.employment}<input type="number" step="0.1" value={employment} min={0} max={100} onChange={e=>setEmployment(Number(e.target.value))}/></label><label>{t.other}<input type="number" value={other} min={0} onChange={e=>setOther(Number(e.target.value))}/></label></div><div className="impact-results"><p className="eyebrow">{t.oethEyebrow}</p>{scope==='private'?<><strong>{euros(oeth.deduction)}</strong><p>{t.deduction}</p><dl><dt>{t.potential}</dt><dd>{euros(oeth.potential)}</dd><dt>{t.cap}</dt><dd>{euros(oeth.cap)}</dd><dt>{t.remaining}</dt><dd>{euros(oeth.remaining)}</dd></dl></>:<><h2>{scope==='public'?t.publicTitle:t.unknownTitle}</h2><p>{scope==='public'?t.publicText:t.unknownText}</p></>}<p className="field-help">{t.oethNote}</p><a className="button" href={`${prefix}/devis/`}>{t.oethCta}</a><a href={`${prefix}/entreprise-adaptee/oeth/`} className="text-link">{t.rules}</a></div></div>}
  </div>;
}
