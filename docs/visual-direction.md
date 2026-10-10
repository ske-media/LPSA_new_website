# Direction visuelle — eau, matières et gobelets

La direction suit les références fournies par l’utilisateur : réalisme produit, bleu pétrole, lumière diffuse, fines parois de plastique, impressions cylindriques, ombres de contact et reflets humides. Les photographies de marques servent de références de forme et d’ambiance ; elles ne sont pas utilisées comme références clients ni copiées dans les textures.

La hero est une vraie scène WebGL Three.js. Les gobelets sont modélisés creux, avec un fond et un rebord ; les impressions sont des graphismes originaux LPSA. La chute est une simulation rigid-body Cannon pré-calculée et rejouée au scroll. Les collisions sont une approximation de solides pour le web, pas une simulation de parois plastiques souples. Le rendu interactif reste à distinguer d’un film publicitaire calculé image par image dans un moteur hors ligne.

Fond photographique original : `public/images/water-studio.webp`, source `water-studio-original.png`. Généré avec le tool ImageGen intégré, puis optimisé pour le web. Prompt utilisé : « Wide landscape photoreal cinematic studio atmosphere, empty of products and text. Dark petroleum-blue wet studio surface, realistic subtle water caustic reflections, fine condensation, tiny foreground droplets, diffuse silver-cyan light from the upper right through bluish haze. Quiet dark left half for white typography; center/right free for a realtime cup pyramid. Luxury product advertising photography; physically credible wet reflections, fine grain and restrained depth of field. No neon, illustration, logo, text, cup or pyramid. »

Les cartes du site reprennent des bords fins et des surfaces translucides. Les chiffres commerciaux et réglementaires restent indépendants de la scénographie.

## Nouvelle hero cinématique
La hero utilise 96 images originales rendues dans Blender Cycles (Metal), une géométrie creuse de gobelet, des matériaux de plastique imprimé et une simulation de chute. Le script reproductible est `scripts/render-cinematic.py`, l’encodage WebP `scripts/encode-cinematic.mjs`. Le scroll natif pilote les images, avec cache limité à 8 images sur ordinateur et 10 sur mobile et poster statique en mouvement réduit. Aucun logo de festival tiers ne fait office de référence client.

### Netteté de la séquence
La séquence haute définition utilise 2560 × 1600 pixels, 64 échantillons Cycles, 128 segments pour chaque gobelet, sans profondeur de champ ni flou de mouvement. Les WebP sont encodés à qualité 94, avec une variante mobile de 1440 pixels. Les fichiers versionnés `cinematic-hq` évitent de réutiliser les anciennes images depuis le cache du navigateur.
