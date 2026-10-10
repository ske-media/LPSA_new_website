# Collection de lancement — 10 octobre 2026

Dix articles originaux, de 574 à 639 mots, orientés vers les décisions des organisateurs de grands événements et des collectivités. Les sources éditables sont dans `src/content/blog/*.md` ; titres, descriptions SEO, catégories, identifiants stables et dates sont dans `catalog.json`.

## Publication

Les dix articles ont été insérés et vérifiés dans le projet Supabase **LPSA 2**, `bxhnbrabukdsefarbjtd`, le 10 octobre 2026. `supabase/seeds/initial-blog.sql` est réexécutable sans remplacer un article déjà présent. Une modification éditoriale ultérieure doit se faire dans le CMS, avec son contrôle de version.

Tant que les identifiants serveur Supabase ne sont pas configurés, la partie publique utilise la collection versionnée : le blog reste lisible et indexable. Dès que la base est configurée, le CMS devient la seule source publique : les brouillons ou dépublications ne sont pas remplacés par la collection de lancement. Les erreurs d’une base configurée sont signalées et ne réactivent pas une ancienne version. Les accès administrateurs restent protégés et nécessitent leur configuration habituelle.

En développement, les articles sont présents dans le CMS local. Le script `prepare-editorial.py` ajoute les slugs absents et préserve les articles déjà édités. Les données `.local` ne sont pas publiées dans Git.

## Placement

- Blog : dix articles, filtres par catégorie, temps de lecture.
- Accueil : sélection de trois guides.
- Prestations : guides associés à chaque service.
- RSE et OETH : liens vers les articles dédiés.
- Articles : liens croisés, recommandations, demande de devis et métadonnées BlogPosting.
- Sitemap : URLs des articles publiés.

## Sources consultées

- DGCCRF, matériaux au contact des aliments, fiche du 18 février 2026 : https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/les-regles-respecter-pour-les-materiaux-emballages-ustensiles-et-contenants-au-contact-des-aliments
- Service Public Entreprendre, OETH : https://entreprendre.service-public.gouv.fr/vosdroits/F39595
- Légifrance, Code du travail, D5212-22 : https://www.legifrance.gouv.fr/affichCodeArticle.do?categorieLien=cid&cidTexte=LEGITEXT000006072050&dateTexte=&idArticle=LEGIARTI000018495254
- Winterhalter, contraintes du lavage de la vaisselle réutilisable : https://www.winterhalter.com/fr-fr/utilisations/lavage-de-la-vaisselle-reutilisable/
- SDED 52, organisation d’un service de gobelets : https://www.sded52.fr/gobelets-reutilisables
- RDC Environment, étude événementielle de 2013 : https://www.lecollectifdesfestivals.org/collectif/download/Impact_gobelets_RDC_2013.pdf

Les simulations sont explicitement fictives. Aucun chiffre CO₂, taux de satisfaction, certification, client réalisé ou délai de restitution non vérifié n’est annoncé. Le montant de 0,15 € HT dans le guide budget est un exemple arithmétique, pas un tarif proposé ni une moyenne de marché. Le minimum vaisselle n’est pas présenté comme HT tant que ce point n’a pas été confirmé.
