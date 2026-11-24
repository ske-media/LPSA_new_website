// One landing page per audience. Every claim here is something the company actually offers
// (see the service pages, the OETH page and the guides); nothing is promised beyond that.
export type Persona={
  slug:string;profil:string;besoin:string;nav:string;icon:string;teaser:string;
  title:string;description:string;label:string;h1:[string,string];lead:string;
  pains:{title:string;text:string}[];
  argsTitle:[string,string];args:{title:string;text:string}[];
  services:{href:string;title:string;text:string}[];
  steps:[string,string][];
  engage:{title:[string,string];text:string;links:{href:string;label:string}[]};
  faq:{q:string;a:string}[];
  guides:string[];
  cta:[string,string];
};
const S={
  lavage:{href:'/prestations/lavage-gobelets/',title:'Lavage de gobelets'},
  gobelets:{href:'/prestations/location-gobelets/',title:'Location de gobelets'},
  vaisselle:{href:'/prestations/location-vaisselle/',title:'Location de vaisselle'},
};
export const personas:Persona[]=[
{
  slug:'clubs-sportifs',teaser:'Buvette, tournois, repas du club : vos bénévoles restent au bord du terrain.',profil:'Club sportif',besoin:'petits-lots',nav:'Clubs sportifs',
  icon:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7"/>',
  title:'Gobelets et vaisselle pour clubs sportifs | La Plonge s’Adapte',
  description:'Buvette, tournoi, repas du club : location et lavage de gobelets réutilisables et de vaisselle pour les clubs sportifs de Haute-Savoie, Savoie et Ain. Formule petits lots.',
  label:'Pour les clubs sportifs',
  h1:['Clubs sportifs : la buvette tourne,','vos bénévoles soufflent.'],
  lead:'Jours de match, tournois, repas d’après-saison : nous louons et lavons vos gobelets et votre vaisselle, pour que vos bénévoles restent au bord du terrain, pas derrière l’évier.',
  pains:[
    {title:'Des bénévoles trop rares',text:'Les mêmes personnes tiennent la buvette, rangent le club-house… et finissent la soirée à laver.'},
    {title:'Une saison entière à tenir',text:'Matchs à domicile, tournois, loto, assemblée générale : les besoins reviennent toute l’année, jamais au même volume.'},
    {title:'Un budget de club',text:'Chaque euro compte. Il faut une solution à votre échelle, pas un contrat pensé pour un festival.'},
  ],
  argsTitle:['Ce que nous prenons en charge','pour votre club.'],
  args:[
    {title:'Une formule petits lots',text:'Quel que soit votre volume : nous adaptons l’organisation au volume d’une buvette ou d’un tournoi.'},
    {title:'Des gobelets réutilisables',text:'Vous n’avez pas de parc ? Nous vous en louons. Vous en avez un ? Nous le lavons, le comptons et le reconditionnons.'},
    {title:'La vaisselle du repas',text:'Repas d’après-match, soirée des partenaires, gala du club : la vaisselle arrive prête à servir et repart sans être lavée.'},
    {title:'Un calendrier sur la saison',text:'Donnez-nous vos dates à domicile : nous préparons les rotations une fois pour toutes, sans tout réorganiser à chaque match.'},
    {title:'Dépôt ou collecte',text:'Vous déposez et récupérez vous-même, ou nous organisons la collecte et la livraison avec nos partenaires de transport.'},
    {title:'Votre parc gardé au sec',text:'Entre deux saisons, nous pouvons stocker votre parc de gobelets, prêt pour la reprise.'},
  ],
  services:[{...S.gobelets,text:'Des gobelets pour la buvette, sans investissement.'},{...S.lavage,text:'Votre parc lavé, compté et reconditionné.'},{...S.vaisselle,text:'Pour les repas et soirées du club.'}],
  steps:[['Votre saison','Vous nous indiquez vos dates et vos volumes, même approximatifs.'],['Notre organisation','Nous préparons les rotations, le dépôt ou la collecte.'],['Vos bénévoles au match','Les gobelets reviennent propres et comptés. La buvette peut rouvrir.']],
  engage:{title:['Un club engagé,','jusque dans sa buvette.'],text:'La Plonge s’Adapte est une entreprise adaptée : votre prestation soutient l’emploi de personnes en situation de handicap, à Neydens. Un choix concret, à partager avec vos licenciés et vos partenaires.',links:[{href:'/rse/',label:'Voir notre calculateur de réemploi'}]},
  faq:[
    {q:'Notre club a de petits volumes. Est-ce possible ?',a:'Oui. Nous avons une formule petits lots pour les associations et les clubs : décrivez-nous votre buvette ou votre tournoi, nous vous proposons une organisation à votre échelle.'},
    {q:'Faut-il acheter nos propres gobelets ?',a:'Pas forcément. Vous pouvez louer des gobelets pour vos événements, ou acheter votre parc : nous vous accompagnons dans ce choix et nous lavons ensuite votre parc.'},
    {q:'Peut-on venir déposer et récupérer nous-mêmes ?',a:'Oui, le dépôt et le retrait par vos soins sont possibles. Nous pouvons aussi organiser la collecte et la livraison, chiffrées séparément.'},
    {q:'Louez-vous aussi la vaisselle pour le repas du club ?',a:'Oui. Assiettes, couverts et verres arrivent prêts à servir et sont repris après le repas : le lavage est compris dans la prestation.'},
  ],
  guides:['combien-gobelets-prevoir-evenement','acheter-ou-louer-gobelets-reutilisables','prix-lavage-gobelets'],
  cta:['Le prochain match se prépare','dès maintenant.'],
},
{
  slug:'restaurants-entreprise',teaser:'Du réutilisable sans charge pour vos équipes, et un achat qui compte pour votre OETH.',profil:'Restaurant d’entreprise',besoin:'vaisselle',nav:'Cantines d’entreprise',
  icon:'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M10 21v-4h4v4"/>',
  title:'Vaisselle et gobelets pour cantines d’entreprise | La Plonge s’Adapte',
  description:'Restaurants d’entreprise et événements internes : location et lavage de vaisselle et de gobelets réutilisables par une entreprise adaptée. Un achat qui peut compter pour votre OETH.',
  label:'Pour les cantines et restaurants d’entreprise',
  h1:['Cantines d’entreprise : du réutilisable,','sans charge pour vos équipes.'],
  lead:'Séminaires, repas d’équipe, pauses café, pics d’activité : nous louons et lavons vaisselle et gobelets pour votre restaurant d’entreprise. Et comme nous sommes une entreprise adaptée, cet achat peut aussi servir votre politique handicap.',
  pains:[
    {title:'Sortir du jetable',text:'Vos collaborateurs l’attendent et votre démarche RSE l’exige, mais le réutilisable demande du lavage et de l’organisation.'},
    {title:'Des pics difficiles à absorber',text:'Séminaire, journée portes ouvertes, repas de fin d’année : votre stock et votre plonge ne suivent pas toujours.'},
    {title:'Des achats qui doivent avoir du sens',text:'Direction, RH et achats cherchent des prestataires qui comptent vraiment dans les engagements de l’entreprise.'},
  ],
  argsTitle:['Ce que nous apportons','à votre restaurant d’entreprise.'],
  args:[
    {title:'Un achat auprès d’une entreprise adaptée',text:'Vos prestations peuvent ouvrir droit à une déduction de votre contribution OETH, selon votre situation et la main-d’œuvre éligible.'},
    {title:'De la vaisselle pour vos temps forts',text:'Séminaires, repas d’affaires, soirées d’entreprise : une vaisselle soignée, livrée prête à servir, reprise et lavée.'},
    {title:'Des gobelets réutilisables',text:'Pour vos pauses, vos fontaines et vos événements internes : nous louons les gobelets ou lavons votre propre parc.'},
    {title:'Un rythme régulier, si besoin',text:'Un besoin récurrent ? Présentez-nous vos volumes et votre calendrier : nous étudions une organisation qui se répète.'},
    {title:'Des volumes comptés',text:'Chaque lot est compté et conditionné : des chiffres utiles pour suivre vos rotations et alimenter votre reporting RSE.'},
    {title:'Un seul interlocuteur',text:'Livraison, reprise, lavage : nous nous coordonnons avec votre prestataire de restauration ou votre traiteur.'},
  ],
  services:[{...S.vaisselle,text:'Pour vos séminaires et repas d’affaires.'},{...S.gobelets,text:'Pour vos pauses et événements internes.'},{...S.lavage,text:'Votre parc de gobelets, lavé et compté.'}],
  steps:[['Votre besoin','Un événement interne ou un besoin régulier : vous nous donnez dates et volumes.'],['Notre proposition','Vaisselle, gobelets, livraison et reprise : un devis clair, avec les éléments utiles à votre déclaration.'],['Le service, sans la plonge','Tout arrive prêt à servir et repart sans être lavé.']],
  engage:{title:['Votre prestation compte aussi','pour votre politique handicap.'],text:'Les achats auprès d’une entreprise adaptée peuvent réduire la contribution OETH des entreprises d’au moins 20 salariés. Le montant dépend de votre situation : notre page dédiée explique l’assiette, les plafonds et les limites, et notre calculateur permet de tester un scénario.',links:[{href:'/entreprise-adaptee/oeth/',label:'Comprendre la déduction OETH'},{href:'/rse/',label:'Tester un scénario dans le calculateur'}]},
  faq:[
    {q:'Nos achats chez vous réduisent-ils notre contribution OETH ?',a:'Ils peuvent ouvrir droit à une déduction, sous conditions. Elle se calcule sur la main-d’œuvre éligible de la prestation, avec des plafonds. Il s’agit d’une déduction de contribution, pas d’une remise sur la facture : vérifiez le montant avec la personne chargée de votre déclaration.'},
    {q:'Pouvez-vous intervenir pour un séminaire ou un repas d’entreprise ?',a:'Oui. Nous louons la vaisselle, livrée prête à servir, puis nous la reprenons et la lavons. Nous pouvons nous coordonner avec votre traiteur ou votre prestataire de restauration.'},
    {q:'Proposez-vous un service régulier ?',a:'Présentez-nous vos volumes et votre calendrier : nous étudions avec vous une organisation récurrente adaptée à votre site.'},
    {q:'Dans quelles zones intervenez-vous ?',a:'En Haute-Savoie, Savoie et dans l’Ain. La collecte et la livraison sont organisées avec nos partenaires de transport et chiffrées séparément.'},
  ],
  guides:['entreprise-adaptee-oeth-lavage-gobelets','rse-gobelets-reemploi-indicateurs','location-vaisselle-evenement-guide'],
  cta:['Un achat utile à vos équipes','et à vos engagements.'],
},
{
  slug:'traiteurs',teaser:'La vaisselle qu’il vous manque, livrée, reprise sale et lavée.',profil:'Traiteur',besoin:'vaisselle',nav:'Traiteurs',
  icon:'<path d="M4 17h16M5 17a7 7 0 0 1 14 0M12 7V5M3 20h18"/>',
  title:'Location et lavage de vaisselle pour traiteurs | La Plonge s’Adapte',
  description:'Traiteurs : complétez votre stock avec 150 références de vaisselle, livrées sur le lieu de réception, reprises sales et lavées. Haute-Savoie, Savoie et Ain.',
  label:'Pour les traiteurs',
  h1:['Traiteurs : vous signez le repas,','nous faisons la plonge.'],
  lead:'Un mariage de 200 couverts, deux réceptions le même soir, un cocktail à dresser : nous livrons la vaisselle qu’il vous manque, nous la reprenons sale et nous la lavons. Votre équipe rentre, pas à la plonge.',
  pains:[
    {title:'La plonge de deux heures du matin',text:'Après le service, il reste des centaines de pièces à laver alors que l’équipe est debout depuis le matin.'},
    {title:'Un stock jamais à la bonne taille',text:'Trop juste pour la grosse réception, immobilisé le reste de l’année : difficile d’investir pour quelques dates.'},
    {title:'Plusieurs prestations à la fois',text:'En haute saison, la même vaisselle ne peut pas être sur deux lieux, ni propre deux jours de suite.'},
  ],
  argsTitle:['Un partenaire de plonge','pour votre maison.'],
  args:[
    {title:'Votre stock, en plus grand',text:'Plus de 150 références de vaisselle avec notre partenaire August Events : porcelaine, verrerie fine, couverts dorés ou cuivrés, pièces vintage.'},
    {title:'Reprise sale, sans conditions',text:'Vous ne lavez rien. Nous reprenons la vaisselle après le service, à l’heure qui arrange votre équipe.'},
    {title:'Livré sur le lieu de réception',text:'La vaisselle arrive propre, comptée et conditionnée, directement là où vous dressez.'},
    {title:'Une coordination directe',text:'Horaires, quantités, points de dépose : nous voyons les détails avec vous plutôt qu’avec vos clients.'},
    {title:'Des gobelets pour le cocktail',text:'Vin d’honneur, buffet en extérieur, soirée dansante : des gobelets réutilisables, loués et lavés.'},
    {title:'Un argument pour vos clients',text:'Votre prestation fait travailler une entreprise adaptée : un engagement concret à valoriser dans vos propositions.'},
  ],
  services:[{...S.vaisselle,text:'Le catalogue complet, à composer en ligne.'},{...S.gobelets,text:'Pour les cocktails et les soirées.'},{...S.lavage,text:'Votre propre parc de gobelets, lavé et compté.'}],
  steps:[['Votre prestation','Vous composez votre sélection ou nous envoyez vos quantités et vos dates.'],['Livraison prête à dresser','La vaisselle arrive comptée sur le lieu de réception, à l’heure convenue.'],['Vous rentrez, on lave','Nous reprenons tout après le service. Le lavage est compris.']],
  engage:{title:['Une table élégante,','un engagement en plus.'],text:'La Plonge s’Adapte est une entreprise adaptée, à Neydens. En nous confiant la vaisselle de vos réceptions, vous soutenez l’emploi de personnes en situation de handicap, et vos clients entreprises peuvent y trouver un intérêt pour leur propre démarche.',links:[{href:'/prestations/location-vaisselle/#catalogue',label:'Parcourir le catalogue de vaisselle'},{href:'/entreprise-adaptee/oeth/',label:'Entreprise adaptée et OETH'}]},
  faq:[
    {q:'Faut-il rincer ou laver la vaisselle avant la reprise ?',a:'Non. Le lavage fait partie de la prestation : vous nous rendez la vaisselle après le service et nous nous occupons du reste.'},
    {q:'Pouvez-vous livrer directement sur le lieu de la réception ?',a:'Oui. Nous livrons la vaisselle prête à servir sur le lieu convenu et nous la reprenons après le service. Le transport est chiffré en supplément.'},
    {q:'Quel est le minimum de commande ?',a:'Pour la vaisselle, le minimum de commande est de 1 500 € pour la location et le lavage, transport en supplément. Pour un besoin plus modeste, contactez-nous : nous étudions la meilleure solution.'},
    {q:'Comment connaître les disponibilités pour mes dates ?',a:'Composez votre sélection dans le catalogue ou envoyez-nous vos quantités : nous vérifions les disponibilités pour vos dates et vous adressons un devis.'},
  ],
  guides:['location-vaisselle-evenement-guide','collecte-livraison-gobelets-evenement','combien-gobelets-prevoir-evenement'],
  cta:['Votre prochaine réception,','sans la plonge.'],
},
{
  slug:'comites-des-fetes',teaser:'Une formule petits lots pour que tout le comité profite de la fête.',profil:'Comité des fêtes',besoin:'petits-lots',nav:'Comités des fêtes',
  icon:'<path d="M3 5c3 2 6 3 9 3s6-1 9-3M6 7l1 4 2-3.4M11 8l1 4 1-4M15 7.6l2 3.4 1-4"/><path d="M12 15v6M8 21h8"/>',
  title:'Gobelets et vaisselle pour comités des fêtes | La Plonge s’Adapte',
  description:'Fête de village, vogue, bal, marché de Noël : location et lavage de gobelets réutilisables et de vaisselle pour les comités des fêtes. Formule petits lots, dépôt ou collecte.',
  label:'Pour les comités des fêtes',
  h1:['Comités des fêtes : la fête pour tous,','la plonge pour nous.'],
  lead:'Fête de village, bal du 14 juillet, vogue, marché de Noël, repas dansant : nous louons et lavons gobelets et vaisselle, avec une formule pensée pour les associations. Vos bénévoles profitent enfin de la fête.',
  pains:[
    {title:'Le lendemain, toujours les mêmes',text:'Quand la place est vide, une poignée de bénévoles reste pour laver, sécher et ranger tous les gobelets.'},
    {title:'Un budget associatif',text:'Les recettes de la buvette financent l’année : impossible de les engloutir dans la logistique.'},
    {title:'Le jetable n’est plus une option',text:'Les habitants comme la mairie attendent des gobelets réutilisables, mais encore faut-il pouvoir les laver.'},
  ],
  argsTitle:['Ce que nous faisons','à votre place.'],
  args:[
    {title:'Une formule petits lots',text:'Nous adaptons l’organisation au volume de votre fête, quel qu’il soit.'},
    {title:'Vous déposez, ou nous collectons',text:'Vous pouvez déposer et récupérer vous-même pour maîtriser le budget, ou nous confier la collecte et la livraison.'},
    {title:'Des gobelets réutilisables',text:'Loués pour l’occasion, ou votre propre parc lavé, compté et reconditionné pour la prochaine fête.'},
    {title:'La vaisselle du repas',text:'Paella géante, repas des aînés, banquet : assiettes, couverts et verres livrés prêts à servir, repris sans être lavés.'},
    {title:'Les boissons chaudes aussi',text:'Vin chaud, chocolat, café : nous vous aidons à choisir des contenants adaptés à votre marché de Noël.'},
    {title:'Un parc gardé entre deux fêtes',text:'Pas de local sain pour stocker ? Nous pouvons garder votre parc jusqu’à la prochaine édition.'},
  ],
  services:[{...S.gobelets,text:'Pour la buvette, sans acheter de parc.'},{...S.lavage,text:'Le parc du comité, propre et compté.'},{...S.vaisselle,text:'Pour le repas et le banquet.'}],
  steps:[['Votre fête','Date, lieu, nombre de personnes attendues : une estimation suffit.'],['Notre organisation','Location ou lavage, dépôt ou collecte : nous préparons une solution à votre budget.'],['Vos bénévoles à la fête','Tout repart après l’événement. Vous retrouvez un parc propre et compté.']],
  engage:{title:['Une fête de village','qui fait du bien deux fois.'],text:'La Plonge s’Adapte est une entreprise adaptée installée à Neydens. Chaque prestation soutient l’emploi local de personnes en situation de handicap : une belle histoire à raconter dans le bulletin de la commune.',links:[{href:'/blog/gobelets-marche-noel-vin-chaud/',label:'Lire le guide du marché de Noël'}]},
  faq:[
    {q:'Notre fête est petite. Vous intervenez quand même ?',a:'Oui. Notre formule petits lots est faite pour les comités des fêtes et les associations : décrivez-nous votre événement et nous vous proposons une organisation à votre échelle.'},
    {q:'Comment réduire le coût du transport ?',a:'Vous pouvez déposer et récupérer vous-même les gobelets ou la vaisselle. Si vous préférez, nous organisons la collecte et la livraison, chiffrées séparément.'},
    {q:'Combien de gobelets faut-il prévoir ?',a:'Cela dépend du nombre de boissons servies et du rythme des retours. Notre estimateur en ligne et notre guide vous donnent une première estimation, que nous affinons ensemble.'},
    {q:'Vaut-il mieux acheter ou louer nos gobelets ?',a:'Les deux se défendent selon le nombre de fêtes dans l’année et votre capacité de stockage. Nous vous aidons à comparer, puis nous lavons votre parc si vous achetez.'},
  ],
  guides:['gobelets-marche-noel-vin-chaud','acheter-ou-louer-gobelets-reutilisables','combien-gobelets-prevoir-evenement'],
  cta:['Cette année, tout le comité','profite de la fête.'],
},
{
  slug:'collectivites-mairies',teaser:'Votre parc mutualisé lavé, compté et stocké entre deux prêts.',profil:'Collectivité ou mairie',besoin:'lavage',nav:'Collectivités & mairies',
  icon:'<path d="M3 21h18M5 21V10M19 21V10M9 21v-6h6v6M3 10l9-6 9 6z"/>',
  title:'Gobelets et vaisselle pour collectivités et mairies | La Plonge s’Adapte',
  description:'Mairies et collectivités : lavage et stockage de votre parc de gobelets mutualisé, location de vaisselle pour vos cérémonies, par une entreprise adaptée de Haute-Savoie.',
  label:'Pour les collectivités et les mairies',
  h1:['Collectivités et mairies : un parc partagé,','toujours prêt à servir.'],
  lead:'Vœux, fête de la musique, forum des associations, marché de Noël : nous lavons, comptons et stockons le parc de gobelets que vous prêtez, et nous louons la vaisselle de vos cérémonies. Un achat local et responsable.',
  pains:[
    {title:'Un parc prêté… et rendu comment ?',text:'Entre deux associations, il faut laver, sécher, recompter et constater les pertes. Rarement le métier des services techniques.'},
    {title:'Des agents déjà très sollicités',text:'Chaque manifestation mobilise vos équipes : le lavage des gobelets ne devrait pas s’y ajouter.'},
    {title:'Des achats à justifier',text:'Réduction des déchets, insertion, ancrage local : vos élus attendent des prestataires qui répondent à ces objectifs.'},
  ],
  argsTitle:['Ce que nous apportons','à votre commune.'],
  args:[
    {title:'Votre parc mutualisé, entretenu',text:'Après chaque prêt, les gobelets sont lavés, séchés, comptés et reconditionnés : le suivant reçoit un lot complet et propre.'},
    {title:'Un comptage à chaque retour',text:'Vous savez ce qui revient et ce qui manque : des chiffres utiles pour votre règlement de prêt et votre bilan.'},
    {title:'Le stockage, si vous le souhaitez',text:'Nous pouvons garder votre parc entre deux manifestations et le remettre à disposition selon votre calendrier.'},
    {title:'La vaisselle de vos cérémonies',text:'Vœux du maire, repas des aînés, réceptions officielles : une vaisselle livrée prête à servir, reprise et lavée.'},
    {title:'Un achat local et inclusif',text:'Entreprise adaptée installée à Neydens, nous employons des personnes en situation de handicap, près de chez vous.'},
    {title:'Un conseil pour constituer votre parc',text:'Formats, quantités, usages : nous vous aidons à dimensionner un parc avant de l’acheter.'},
  ],
  services:[{...S.lavage,text:'Le parc de la commune, lavé et compté.'},{...S.gobelets,text:'En complément, pour vos grandes manifestations.'},{...S.vaisselle,text:'Pour vos cérémonies et repas officiels.'}],
  steps:[['Votre calendrier','Manifestations, prêts aux associations, volumes : nous faisons le point ensemble.'],['Une organisation claire','Collecte, lavage, comptage, stockage ou remise à disposition : chacun sait qui fait quoi.'],['Un parc toujours prêt','Vos associations reçoivent des lots propres et complets, vos agents gardent leur temps.']],
  engage:{title:['Un achat responsable,','au service du territoire.'],text:'Confier cette prestation à une entreprise adaptée soutient l’emploi local de personnes en situation de handicap. Le code de la commande publique permet par ailleurs de réserver certains marchés ou lots à des entreprises adaptées : un point à étudier avec votre service achats. Attention, le secteur public relève du FIPHFP et de règles distinctes de celles des entreprises privées.',links:[{href:'/blog/parc-gobelets-mutualise-collectivite/',label:'Guide : créer un parc de gobelets mutualisé'},{href:'/blog/rse-gobelets-reemploi-indicateurs/',label:'Quels indicateurs suivre ?'}]},
  faq:[
    {q:'Pouvez-vous gérer le parc que nous prêtons aux associations ?',a:'Oui. Nous lavons, comptons et reconditionnons les gobelets après chaque prêt, et nous pouvons les stocker entre deux manifestations. Les modalités de collecte et de remise à disposition sont définies avec vous.'},
    {q:'Comment suivre les pertes de gobelets ?',a:'Chaque retour est compté. Vous disposez ainsi des quantités rendues après chaque manifestation, pour appliquer votre règlement de prêt et suivre l’évolution du parc.'},
    {q:'Peut-on vous confier un marché réservé ?',a:'Le code de la commande publique permet de réserver des marchés ou des lots à des entreprises adaptées. Nous vous invitons à étudier cette possibilité avec votre service achats ; nous vous transmettons volontiers les informations utiles sur notre structure.'},
    {q:'La déduction OETH s’applique-t-elle à une collectivité ?',a:'Non, pas telle quelle : le secteur public relève du FIPHFP et de règles distinctes. Notre calculateur OETH concerne les entreprises privées.'},
  ],
  guides:['parc-gobelets-mutualise-collectivite','rse-gobelets-reemploi-indicateurs','collecte-livraison-gobelets-evenement'],
  cta:['Un parc partagé,','sans la corvée partagée.'],
},
];
