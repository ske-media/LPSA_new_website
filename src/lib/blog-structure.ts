// Blog taxonomy and article helpers shared by French and English pages.
import {renderMarkdown} from './markdown';
import type {Lang} from '../i18n';

export type Cat={slug:string;fr:string;en:string;title:{fr:string;en:string};intro:{fr:string;en:string};cta:{fr:[string,string,string];en:[string,string,string]};icon:string};
export const categories:Cat[]=[
  {slug:'gobelets',fr:'Gobelets',en:'Cups',title:{fr:'Gobelets réutilisables',en:'Reusable cups'},
    intro:{fr:'Choisir, louer, laver, stocker et faire revenir vos gobelets réutilisables : nos guides pour une buvette sans corvée, quelle que soit la taille de votre événement.',en:'Choosing, renting, washing, storing and getting back your reusable cups: our guides for a bar without the chores, whatever the size of your event.'},
    cta:{fr:['Vos gobelets, propres et comptés.','Location et lavage de gobelets réutilisables, collecte et livraison possibles.','/devis/?besoin=gobelets'],en:['Your cups, clean and counted.','Reusable cup rental and washing, with collection and delivery available.','/en/devis/?besoin=gobelets']},
    icon:'<path d="M6 4h12l-1.6 15.2a1 1 0 0 1-1 .8H8.6a1 1 0 0 1-1-.8z"/><path d="M6.6 9h10.8"/>'},
  {slug:'vaisselle',fr:'Vaisselle',en:'Tableware',title:{fr:'Vaisselle et réceptions',en:'Tableware and receptions'},
    intro:{fr:'Mariages, banquets, repas d’affaires, buffets : quantités, styles, dressage et logistique pour louer la bonne vaisselle, sans la vaisselle à faire.',en:'Weddings, banquets, business meals and buffets: quantities, styles, table setting and logistics for renting the right tableware, without the washing-up.'},
    cta:{fr:['Une belle table, sans la plonge.','Vaisselle livrée prête à servir, reprise et lavée, en lien avec votre traiteur.','/prestations/location-vaisselle/'],en:['A beautiful table, without the washing-up.','Tableware delivered ready to use, collected and washed, in step with your caterer.','/en/prestations/location-vaisselle/']},
    icon:'<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="3"/><path d="M3 4v6a1.5 1.5 0 0 0 1.5 1.5V20M21 4c-1.5 1-2 3-2 5s.8 2.5 2 2.5V20"/>'},
  {slug:'guides',fr:'Guides',en:'Guides',title:{fr:'Organiser son événement',en:'Planning your event'},
    intro:{fr:'Buvette associative, fête de village, tournoi, marché de Noël, événement en montagne : méthodes, rétroplannings et listes de contrôle pour bien préparer chaque étape.',en:'Association bars, village fêtes, tournaments, Christmas markets, mountain events: methods, timelines and checklists to prepare every step.'},
    cta:{fr:['Un événement à préparer ?','Gobelets, vaisselle, lavage : dites-nous en quelques mots ce dont vous avez besoin.','/devis/'],en:['An event to prepare?','Cups, tableware, washing: tell us in a few words what you need.','/en/devis/']},
    icon:'<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/>'},
  {slug:'collectivites',fr:'Collectivités',en:'Local authorities',title:{fr:'Collectivités et entreprises',en:'Local authorities and companies'},
    intro:{fr:'Parc de gobelets mutualisé, prêt aux associations, cérémonies, cantines et marchés réservés : des repères pour les mairies, intercommunalités et entreprises.',en:'Shared cups, loans to associations, ceremonies, canteens and reserved contracts: guidance for town halls, groups of municipalities and companies.'},
    cta:{fr:['Un parc toujours prêt à servir.','Lavage, comptage et stockage du parc de la commune, vaisselle de vos cérémonies.','/pour/collectivites-mairies/'],en:['Shared cups, always ready.','Washing, counting and storage of your town’s cups, tableware for your ceremonies.','/en/pour/collectivites-mairies/']},
    icon:'<path d="M3 21h18M5 21V10M19 21V10M9 21v-6h6v6M3 10l9-6 9 6z"/>'},
  {slug:'rse',fr:'RSE',en:'CSR',title:{fr:'RSE et événements responsables',en:'CSR and responsible events'},
    intro:{fr:'Réduire les déchets, choisir le réemploi, acheter auprès d’une entreprise adaptée, mesurer sans exagérer : des repères honnêtes pour vos engagements.',en:'Cutting waste, choosing reuse, buying from a disability-inclusive company, measuring without overstating: honest guidance for your commitments.'},
    cta:{fr:['Un engagement qui se mesure.','Testez votre scénario de réemploi et la déduction OETH possible.','/rse/'],en:['A commitment you can measure.','Try your reuse scenario and the possible OETH deduction.','/en/rse/']},
    icon:'<path d="M12 21c-4-3-8-6.5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 4.5-4 8-8 11z"/>'},
];
export const catByName=(name:string)=>categories.find(c=>c.fr===name||c.en===name)??categories[2];
export const catBySlug=(slug:string)=>categories.find(c=>c.slug===slug);

export const readingMinutes=(md:string)=>Math.max(1,Math.ceil(md.split(/\s+/).length/220));

const slugify=(s:string)=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/<[^>]+>/g,'').replace(/&[a-z#0-9]+;/g,' ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
const strip=(s:string)=>s.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&#39;|&rsquo;/g,'’').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const FAQ_HEADINGS=/^(questions fréquentes|frequently asked questions|faq)$/i;

/** Render an article: sanitized HTML with heading anchors, a table of contents and its FAQ. */
export function renderArticle(md:string){
  let html=renderMarkdown(md);const toc:{id:string;text:string}[]=[];const used=new Set<string>();
  html=html.replace(/<h2>([\s\S]*?)<\/h2>/g,(_,inner:string)=>{let id=slugify(inner)||'section';while(used.has(id))id+='-2';used.add(id);toc.push({id,text:strip(inner)});return `<h2 id="${id}">${inner}</h2>`;});
  const faq:{q:string;a:string}[]=[];
  const parts=md.split(/^##\s+(.+)$/m);
  for(let i=1;i<parts.length;i+=2){
    if(!FAQ_HEADINGS.test(parts[i].trim()))continue;
    const block=parts[i+1]||'';
    for(const m of block.matchAll(/^###\s+(.+?)\s*\n([\s\S]*?)(?=^###\s|$(?![\s\S]))/gm)){
      const a=strip(renderMarkdown(m[2].trim()));if(a)faq.push({q:m[1].trim(),a});
    }
  }
  return {html,toc,faq};
}
export const dateFmt=(iso:string,lang:Lang)=>new Date(iso).toLocaleDateString(lang==='en'?'en-GB':'fr-FR',{day:'numeric',month:'long',year:'numeric'});
