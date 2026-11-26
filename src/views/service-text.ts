// Cup washing and cup rental pages, French and English. Layout lives in Service.astro.
export type ServiceSlug='lavage-gobelets'|'location-gobelets';
export const serviceSlugs:ServiceSlug[]=['lavage-gobelets','location-gobelets'];
type Text={
  home:string;services:string;quote:string;phone:string;
  how:{label:string;h2:[string,string];lead:string;small:string;smallLink:string};
  includes:{label:string;em:string};forYou:string;vaisselle:string;
  faqHead:{label:string;h2:[string,string];lead:string};band:[string,string];guides:{label:string;read:string};
  entries:Record<ServiceSlug,{title:string;headline:string;intro:string;need:'lavage'|'gobelets';related:string[]}>;
  steps:Record<'lavage'|'gobelets',[string,string][]>;
  meta:Record<'lavage'|'gobelets',{title:string;description:string;includes:[string,string][];faq:{q:string;a:string}[];audiences:string[]}>;
};
const related={'lavage-gobelets':['lavage-gobelets-festival','prix-lavage-gobelets','collecte-livraison-gobelets-evenement'],'location-gobelets':['combien-gobelets-prevoir-evenement','acheter-ou-louer-gobelets-reutilisables','parc-gobelets-mutualise-collectivite']};
export const serviceText:Record<'fr'|'en',Text>={
fr:{
  home:'Accueil',services:'Prestations',quote:'Préparer mon devis',phone:'07 87 89 67 60',
  how:{label:'Comment ça se passe',h2:['Un calendrier clair','avant de commencer.'],lead:'Un événement, plusieurs dates ou toute une saison : nous préparons une proposition adaptée à votre calendrier. Pour un événement plus éloigné, nous étudions les possibilités selon le calendrier et la logistique.',small:'Association, fête de village, petit volume ? ',smallLink:'Découvrez notre formule petits lots'},
  includes:{label:'Ce que comprend la prestation',em:'sans rien oublier.'},forYou:'Pensé pour vous',vaisselle:'Location de vaisselle',
  faqHead:{label:'Questions fréquentes',h2:['Vos questions,','nos réponses.'],lead:'Une autre question ? '},band:['Indiquez vos dates,','on s’occupe du reste.'],guides:{label:'Les guides pour préparer votre prestation',read:'Lire le guide'},
  entries:{
    'lavage-gobelets':{title:'Lavage de gobelets réutilisables',headline:'Vos gobelets propres. Une charge en moins.',intro:'Lavage, séchage, comptage et conditionnement de vos gobelets, quel que soit le nombre. Préparons vos dates, vos volumes et vos retours.',need:'lavage',related:related['lavage-gobelets']},
    'location-gobelets':{title:'Location de gobelets réutilisables',headline:'Votre événement a soif. Votre parc est prêt.',intro:'Vous n’avez pas de parc ou souhaitez compléter le vôtre ? Organisons les formats, les quantités et leur retour au lavage, selon les disponibilités.',need:'gobelets',related:related['location-gobelets']},
  },
  steps:{
    lavage:[['Vos dates et vos volumes','Nous préparons ensemble le calendrier, les formats et les modalités de retour.'],['Collecte si vous le souhaitez','La collecte et la livraison peuvent être organisées avec nos partenaires de transport.'],['Lavage, séchage, comptage','Vos gobelets sont lavés, séchés, comptés puis conditionnés.'],['Votre parc repart','Retrait ou livraison selon le calendrier convenu, prêt pour le prochain service.']],
    gobelets:[['Vos besoins','Formats, quantités, dates : nous étudions les disponibilités pour votre événement.'],['La mise à disposition','Les gobelets sont préparés selon le calendrier convenu.'],['Le retour au lavage','Après l’événement, le retour et le lavage sont prévus dans l’organisation.'],['La suite','Pour une saison ou plusieurs dates, nous construisons un calendrier de rotations.']],
  },
  meta:{
    lavage:{title:'Lavage de gobelets réutilisables | Haute-Savoie, Savoie, Ain',description:'Lavage, séchage, comptage et conditionnement de vos gobelets réutilisables, avec collecte et livraison possibles. Entreprise adaptée en Haute-Savoie.',
      includes:[['Lavage et séchage','Vos gobelets réutilisables sont lavés puis séchés, prêts à resservir.'],['Comptage','Chaque retour est compté : vous savez ce qui revient et ce qui manque.'],['Conditionnement','Les gobelets propres repartent conditionnés, faciles à stocker et à redistribuer.'],['Transport, si besoin','Collecte et livraison avec nos partenaires de transport, chiffrées séparément. Le dépôt et le retrait par vos soins sont possibles.'],['Stockage, si besoin','Nous pouvons garder votre parc entre deux événements.']],
      faq:[{q:'Lavez-vous les petits volumes ?',a:'Oui. Nous adaptons l’organisation à votre volume, avec une formule petits lots pour les associations et les petits événements.'},{q:'Organisez-vous la collecte et la livraison ?',a:'Oui, avec nos partenaires de transport. Ce service est chiffré séparément ; vous pouvez aussi déposer et récupérer vos gobelets vous-même.'},{q:'Dans quelle zone intervenez-vous ?',a:'En priorité en Haute-Savoie, Savoie et dans l’Ain. Pour un événement plus éloigné, nous étudions les possibilités selon le calendrier et la logistique.'},{q:'Saurez-vous combien de gobelets sont revenus ?',a:'Oui. Chaque retour est compté, ce qui vous permet de suivre les pertes et d’alimenter votre bilan.'},{q:'Pouvez-vous laver nos gobelets toute la saison ?',a:'Oui. Présentez-nous votre calendrier : nous préparons une organisation qui se répète, événement après événement.'}],
      audiences:['comites-des-fetes','clubs-sportifs','collectivites-mairies']},
    gobelets:{title:'Location de gobelets réutilisables | Haute-Savoie, Savoie, Ain',description:'Louez des gobelets réutilisables pour votre événement, avec leur retour au lavage organisé. Pour associations, clubs, entreprises et collectivités.',
      includes:[['Des gobelets réutilisables','Pour votre buvette, votre bar ou votre cocktail, sans investir dans un parc.'],['Des quantités adaptées','Nous étudions avec vous les formats et les quantités selon vos boissons et votre public.'],['Le lavage compris','Après l’événement, le retour et le lavage sont prévus dans l’organisation.'],['Transport, si besoin','Livraison et collecte possibles, chiffrées séparément, ou dépôt et retrait par vos soins.'],['Un conseil pour la suite','Vous hésitez entre louer et acheter ? Nous vous aidons à comparer.']],
      faq:[{q:'Faut-il laver les gobelets avant de les rendre ?',a:'Non. Le retour au lavage est prévu dans l’organisation : nous nous occupons du lavage après votre événement.'},{q:'Combien de gobelets prévoir ?',a:'Cela dépend du nombre de boissons servies et du rythme des retours. Notre estimateur en ligne donne une première estimation, que nous affinons ensemble.'},{q:'Vaut-il mieux louer ou acheter ?',a:'La location évite d’investir et de stocker ; l’achat se justifie si vous organisez plusieurs événements par an. Nous vous aidons à comparer, et nous lavons votre parc si vous achetez.'},{q:'Louez-vous aussi la vaisselle ?',a:'Oui : assiettes, couverts et verrerie, livrés prêts à servir puis repris et lavés, avec le catalogue de notre partenaire August Events.'}],
      audiences:['clubs-sportifs','comites-des-fetes','restaurants-entreprise']},
  },
},
en:{
  home:'Home',services:'Services',quote:'Get my quote',phone:'+33 7 87 89 67 60',
  how:{label:'How it works',h2:['A clear schedule','before we start.'],lead:'One event, several dates or a whole season: we prepare a proposal that fits your calendar. For an event further away, we look at what is possible depending on dates and logistics.',small:'Association, village fête, small numbers? ',smallLink:'Discover our small-batch option'},
  includes:{label:'What the service includes',em:'with nothing left out.'},forYou:'Designed for you',vaisselle:'Tableware rental',
  faqHead:{label:'Frequently asked questions',h2:['Your questions,','our answers.'],lead:'Another question? '},band:['Give us your dates,','we handle the rest.'],guides:{label:'Guides to help you prepare',read:'Read the guide'},
  entries:{
    'lavage-gobelets':{title:'Reusable cup washing',headline:'Clean cups. One less thing to worry about.',intro:'Washing, drying, counting and packing of your cups, however many you have. Let us plan your dates, your numbers and your returns together.',need:'lavage',related:related['lavage-gobelets']},
    'location-gobelets':{title:'Reusable cup rental',headline:'Your event is thirsty. Your cups are ready.',intro:'No cups of your own, or need to top up your stock? Let us plan the sizes, the quantities and their return for washing, subject to availability.',need:'gobelets',related:related['location-gobelets']},
  },
  steps:{
    lavage:[['Your dates and numbers','Together we plan the schedule, the cup sizes and how the cups come back to us.'],['Collection if you wish','Collection and delivery can be arranged with our transport partners.'],['Washing, drying, counting','Your cups are washed, dried, counted and then packed.'],['Your cups go back out','Pick-up or delivery on the agreed schedule, ready for your next event.']],
    gobelets:[['Your needs','Sizes, quantities, dates: we check availability for your event.'],['Your cups, ready','The cups are prepared to the agreed schedule.'],['Back for washing','After the event, the return and the washing are built into the plan.'],['What comes next','For a season or several dates, we set up a rotation schedule.']],
  },
  meta:{
    lavage:{title:'Reusable cup washing | Haute-Savoie, Savoie, Ain',description:'Washing, drying, counting and packing of your reusable cups, with collection and delivery available. A disability-inclusive company near Geneva.',
      includes:[['Washing and drying','Your reusable cups are washed and dried, ready to use again.'],['Counting','Every return is counted: you know what has come back and what is missing.'],['Packing','Clean cups go back packed, easy to store and hand out again.'],['Transport, if needed','Collection and delivery with our transport partners, priced separately. You can also drop off and pick up the cups yourself.'],['Storage, if needed','We can store your cups between two events.']],
      faq:[{q:'Do you wash small numbers of cups?',a:'Yes. We adapt to your numbers, with a small-batch option for associations and small events.'},{q:'Do you organise collection and delivery?',a:'Yes, with our transport partners. This service is priced separately; you can also drop off and pick up your cups yourself.'},{q:'Which area do you cover?',a:'Mainly Haute-Savoie, Savoie and Ain. For an event further away, we look at what is possible depending on dates and logistics.'},{q:'Will we know how many cups came back?',a:'Yes. Every return is counted, so you can track losses and use the figures in your event report.'},{q:'Can you wash our cups all season?',a:'Yes. Share your calendar with us: we set up an arrangement that repeats, event after event.'}],
      audiences:['comites-des-fetes','clubs-sportifs','collectivites-mairies']},
    gobelets:{title:'Reusable cup rental | Haute-Savoie, Savoie, Ain',description:'Rent reusable cups for your event, with their return for washing organised. For associations, clubs, companies, local authorities and town halls.',
      includes:[['Reusable cups','For your refreshment stand, bar or drinks reception, without investing in cups of your own.'],['The right quantities','Together we work out sizes and quantities based on your drinks and your audience.'],['Washing included','After the event, the return and the washing are built into the plan.'],['Transport, if needed','Delivery and collection available, priced separately, or drop-off and pick-up by you.'],['Advice for the future','Torn between renting and buying? We help you compare.']],
      faq:[{q:'Do we need to wash the cups before returning them?',a:'No. The return for washing is built into the plan: we take care of the washing after your event.'},{q:'How many cups should we plan for?',a:'It depends on the number of drinks served and how quickly cups come back. Our online estimator gives a first estimate, which we refine together.'},{q:'Is it better to rent or to buy?',a:'Renting avoids investment and storage; buying makes sense if you run several events a year. We help you compare, and we wash your cups if you buy.'},{q:'Do you also rent tableware?',a:'Yes: plates, cutlery and glassware, delivered ready to use, then collected and washed, from the catalogue of our partner August Events.'}],
      audiences:['clubs-sportifs','comites-des-fetes','restaurants-entreprise']},
  },
},
};
