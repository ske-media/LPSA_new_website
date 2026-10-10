# La Plonge s’Adapte — première tranche

Astro + React + TypeScript, déploiement Netlify, stockage et authentification Supabase.

## Ce qui fonctionne

- Accueil immersif bleu pétrole : séquence de 96 rendus Blender Cycles, gobelets creux et imprimés, chute physique Cannon pilotée par le scroll. Images de 2560 × 1600 pixels sur ordinateur et variante mobile. Logo provisoire : piste 09 — Flux.
- Formulaire : transmission explicite du contact, enregistrement, détails facultatifs, reprise dans le même onglet après rechargement.
- Une demande unique par identifiant : les reprises après erreur réseau sont idempotentes.
- Administration : connexion Supabase, autorisation par `staff_members`, demandes et détails, qualification simple, changement de statut.
- Routes serveur : validation, limite de fréquence persistante, origine, jetons de reprise hachés et expirants. Aucun accès public aux demandes.

La première tranche comprend aussi un calculateur de scénario de réemploi, une estimation OETH et sa page explicative, une recherche entreprise/SIREN facultative, et un CMS de blog : brouillons, aperçu assaini, catégories, couverture, champs SEO, publication immédiate ou programmée, versions et suppression de brouillons.

Pas encore : emails transactionnels, reprise par email, fichiers joints aux leads, assignation et tâches, planning de production, génération IA des articles. La hero affiche des images précalculées, chargées à la demande avec un cache borné. Le scroll natif pilote la séquence ; le mode mouvement réduit conserve une image fixe.

## Développement

Node 22+, pnpm. Dépendances exactes et lockfile versionnés.

```sh
pnpm install
cp .env.example .env
# DEMO_MODE=true uniquement pour une démo locale avec données fictives.
pnpm exec netlify dev
```

Le mode de démonstration fonctionne uniquement en développement et sur l’hôte local ; ses données sont enregistrées dans `.local/leads.json`, ignoré par Git. Aucun email n’est envoyé. Ne jamais y introduire de données réelles. La production sans configuration renvoie une indisponibilité explicite, jamais une fausse confirmation.

## Raccordement Supabase LPSA 2

1. Vérifier le projet exact et son schéma existant avant toute migration.
2. Pour un nouveau projet uniquement, appliquer les trois fichiers `supabase/migrations/*.sql` dans leur ordre chronologique. Ils ont déjà été appliqués dans LPSA 2 via le SQL Editor ; ne pas les rejouer dans ce projet. La migration n’est pas appliquée par le build Netlify.
3. Configurer `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY` et `RATE_LIMIT_SECRET` dans Netlify. La clé secrète est réservée au serveur ; ne jamais la préfixer `PUBLIC_` ni l’enregistrer dans Git. Générer un secret de limitation d’au moins 32 caractères.
4. Créer/inviter les comptes Supabase Auth de l’équipe et inscrire leurs UUID dans `public.staff_members` depuis l’administration autorisée. Ne pas permettre l’auto-inscription d’un compte commercial. Vérifier qu’un compte authentifié non inscrit est refusé.
5. Utiliser un projet de test séparé pour les previews : ne pas les connecter aux leads réels. Sans projet de test, laisser le formulaire indisponible sur les previews.
6. Vérifier les RLS et grants, un enregistrement réel de test autorisé, la connexion de l’équipe, la reprise et la modification de statut. Supprimer la donnée fictive de test après validation.

Le jeton de reprise n’est pas un accès CRM : il permet uniquement de compléter les détails d’une demande, pendant 30 jours. La conservation réelle des demandes et le nettoyage programmé des contacts incomplets restent à définir et à mettre en place avant ouverture publique.

## Tests

```sh
pnpm test
pnpm build
pnpm exec playwright install chromium
# Lancer le serveur local de démo dans un autre terminal.
pnpm exec playwright test
```

La configuration Playwright utilise le serveur Astro local `127.0.0.1:4321` : les tests de parcours visent les routes du framework, sans primitives Netlify. Le serveur de prévisualisation de travail est lancé par `netlify dev`. Tests : contact requis, validation, origine, mauvais jeton, idempotence, parcours transmis/rechargé/complété, changement persistant de statut et largeur mobile.

## Publication

La version présente est une base de développement. Avant publication publique : compléter les pages légales, confirmer les conditions HT/TTC du minimum vaisselle, raccorder LPSA 2 et tester les droits, prévoir notification commerciale et politique de conservation, finaliser les textes et visuels autorisés. Ne pas remplacer le site existant à ce stade.

GitHub est la source du code. Netlify exécute `pnpm build`, publie `dist` et déploie les routes serveur via l’adaptateur Astro. Aucune réécriture globale vers index.html : les routes absentes doivent conserver leur vrai statut 404.

## Blog et automatisation

L’éditeur se trouve à `/admin/blog/`, les articles à `/blog/`. Les pages sont rendues côté serveur et excluent les brouillons et les dates futures. Un article validé et programmé devient donc accessible à son heure sans cron ni rebuild. Le sitemap applique le même filtre. Le serveur utilise l’heure UTC ; l’éditeur convertit l’heure locale choisie. Les lectures publiques ne sont pas mises en cache durablement dans cette version.

Les images sont décodées puis converties en WebP côté serveur, débarrassées des métadonnées, limitées à 1600 px et stockées dans le bucket public `blog-media`. Le reste du CRM reste privé. Une image éditoriale publiée est publique : ne pas y stocker de document prospect.

Les versions précédentes sont enregistrées à chaque modification. Le chargement d’une version dans l’éditeur ne publie rien avant un enregistrement explicite. Les modifications concurrentes sont refusées avec un message. La suppression est réservée aux brouillons. L’adresse d’un article déjà en ligne est conservée afin de ne pas casser ses liens.

Automatisation recommandée ensuite : calendrier éditorial → génération de brouillon sourcé → validation par l’équipe → programmation. La publication automatique est en place ; la génération IA n’est pas branchée à un fournisseur ou à une facturation.

### État réel de Supabase LPSA 2
Le schéma a été appliqué au projet `bxhnbrabukdsefarbjtd` via le SQL Editor, dans une transaction. L’application reste en démonstration locale tant que les variables privées `.env.example` ne sont pas renseignées. Les accès souhaités sont accueil@laplongesadapte.com et vivien@laplongesadapte.com. `scripts/provision-admins.mjs` permet de les créer sans envoyer de message, après configuration privée des identifiants et du mot de passe initial. Ces comptes ne sont pas encore créés. Le mode démonstration est interdit sur les déploiements.

## Articles de lancement

Dix guides originaux ont été ajoutés au blog, à l’accueil, aux pages de prestations et aux pages RSE/OETH. Sources Markdown et métadonnées : `src/content/blog/`. Les dix enregistrements ont également été insérés dans Supabase LPSA 2. Le seed `supabase/seeds/initial-blog.sql` préserve les slugs existants.

En l’absence de configuration de base, seules les lectures publiques du blog utilisent cette collection versionnée. Dès que Supabase est configuré, les données du CMS font autorité ; une erreur de base ou une dépublication n’active pas de repli vers une ancienne version. Ce mécanisme ne concerne pas les leads et n’ouvre aucun accès administrateur. Voir `docs/editorial/README.md`.
