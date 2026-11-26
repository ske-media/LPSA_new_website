// Two languages: French at the root, English under /en/ with the same slugs.
export type Lang='fr'|'en';
export const langs:Lang[]=['fr','en'];

/** Language of a URL path. */
export const langOf=(path:string):Lang=>path==='/en'||path.startsWith('/en/')?'en':'fr';

/** The same page in the other language (same slugs, /en prefix). */
export function switchPath(path:string,to:Lang):string{
  const bare=langOf(path)==='en'?(path.slice(3)||'/'):path;
  return to==='en'?`/en${bare==='/'?'/':bare}`:bare;
}

/** Prefix an internal link for the given language. */
export const href=(lang:Lang,path:string)=>lang==='en'&&path.startsWith('/')&&!path.startsWith('/en/')&&!path.startsWith('/admin')?`/en${path}`:path;

/** Pages that exist in English. Anything else (admin, API) is French only. */
export function hasEnglish(path:string){
  const bare=langOf(path)==='en'?(path.slice(3)||'/'):path;
  return !/^\/(admin|api)(\/|$)/.test(bare);
}

export const ui={
  fr:{
    locale:'fr_FR',skip:'Aller au contenu',home:'La Plonge s’Adapte — accueil',mainNav:'Navigation principale',
    nav:[['/#solutions','Prestations'],['/prestations/location-vaisselle/','Vaisselle'],['/#pour-qui','Pour qui ?'],['/rse/','Impact & RSE'],['/blog/','Guides']],
    cta:'Préparer mon événement',openMenu:'Ouvrir le menu',closeMenu:'Fermer le menu',menu:'Menu',
    services:'Prestations',forWhom:'Pour qui ?',discover:'Découvrir',resources:'Ressources',talk:'On en parle ?',
    svc:[['/prestations/lavage-gobelets/','Lavage de gobelets'],['/prestations/location-gobelets/','Location de gobelets'],['/prestations/location-vaisselle/','Location de vaisselle'],['/devis/?besoin=petits-lots','Petits événements & associations']],
    footerSvcExtra:[['/devis/?besoin=conseil','Conseil à l’achat'],['/devis/?besoin=stockage','Stockage de parc']],
    disc:[['/#methode','Notre méthode'],['/rse/','Impact & calculateur RSE'],['/entreprise-adaptee/oeth/','Entreprise adaptée & OETH'],['/blog/','Guides & conseils']],
    res:[['/rse/','Calculateur RSE'],['/entreprise-adaptee/oeth/','Entreprise adaptée & OETH'],['/blog/','Guides & conseils'],['/confidentialite/','Vos données']],
    staff:'Espace équipe',call:'Appeler le 07 87 89 67 60',
    motto:'Fluide. Profonde. Adaptée.',mottoSub:'Les événements passent. Les bonnes habitudes restent.',
    area:'Interventions en Haute-Savoie, Savoie et Ain',country:'France',legal:'Entreprise adaptée',
    switchLabel:'Language',switchTo:'English',switchShort:'EN',
    description:'Lavage et location de gobelets et de vaisselle pour vos événements. Collecte et livraison organisées en Haute-Savoie, Savoie et Ain.',
    business:'Entreprise adaptée : lavage et location de gobelets réutilisables et de vaisselle pour les événements.',
    knows:['Location de vaisselle','Lavage de gobelets réutilisables','Location de gobelets réutilisables','Réemploi','Entreprise adaptée'],
    offers:[['Location de vaisselle','/prestations/location-vaisselle/'],['Lavage de gobelets','/prestations/lavage-gobelets/'],['Location de gobelets','/prestations/location-gobelets/']],
  },
  en:{
    locale:'en_GB',skip:'Skip to content',home:'La Plonge s’Adapte — home',mainNav:'Main navigation',
    nav:[['/en/#solutions','Services'],['/en/prestations/location-vaisselle/','Tableware'],['/en/#pour-qui','Who we help'],['/en/rse/','Impact & CSR'],['/en/blog/','Guides']],
    cta:'Plan my event',openMenu:'Open the menu',closeMenu:'Close the menu',menu:'Menu',
    services:'Services',forWhom:'Who we help',discover:'Discover',resources:'Resources',talk:'Let’s talk',
    svc:[['/en/prestations/lavage-gobelets/','Cup washing'],['/en/prestations/location-gobelets/','Cup rental'],['/en/prestations/location-vaisselle/','Tableware rental'],['/en/devis/?besoin=petits-lots','Small events & associations']],
    footerSvcExtra:[['/en/devis/?besoin=conseil','Advice on buying cups'],['/en/devis/?besoin=stockage','Cup storage']],
    disc:[['/en/#methode','How we work'],['/en/rse/','Impact & CSR calculator'],['/en/entreprise-adaptee/oeth/','Disability-inclusive company & OETH'],['/en/blog/','Guides & advice']],
    res:[['/en/rse/','CSR calculator'],['/en/entreprise-adaptee/oeth/','Disability-inclusive company & OETH'],['/en/blog/','Guides & advice'],['/en/confidentialite/','Your data']],
    staff:'Staff area',call:'Call +33 7 87 89 67 60',
    motto:'Fluid. Deep. Adapted.',mottoSub:'Events come and go. Good habits stay.',
    area:'Serving Haute-Savoie, Savoie and Ain, near Geneva',country:'France',legal:'Disability-inclusive company (entreprise adaptée)',
    switchLabel:'Langue',switchTo:'Français',switchShort:'FR',
    description:'Reusable cup and tableware rental and washing for your events. Collection and delivery in Haute-Savoie, Savoie and Ain, near Geneva.',
    business:'Disability-inclusive company (entreprise adaptée): reusable cup and tableware rental and washing for events.',
    knows:['Tableware rental','Reusable cup washing','Reusable cup rental','Reuse','Disability-inclusive employment'],
    offers:[['Tableware rental','/en/prestations/location-vaisselle/'],['Cup washing','/en/prestations/lavage-gobelets/'],['Cup rental','/en/prestations/location-gobelets/']],
  },
} as const;
