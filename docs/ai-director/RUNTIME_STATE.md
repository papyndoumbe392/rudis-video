# STARCLIP AI DIRECTOR — Runtime State

## Portée
État opérationnel communiqué par Claude depuis la passation STARCLIP END et validé par Papy Ndoumbe pour intégration dans la mémoire commune. Ce fichier documente l'existant ; il n'autorise aucune modification du code.

## Protection absolue du code existant
- Ne jamais modifier le code fonctionnel produit/maintenu par Claude sans approbation explicite de Papy Ndoumbe.
- Ne jamais modifier `index.html` / l'index de StarClip dans le cadre des mises à jour documentaires AI Director.
- La documentation AI Director reste confinée à `docs/ai-director/` sauf approbation explicite contraire.

## Versions opérationnelles rapportées
- Application : v41.34, livrée le 18 août 2026.
- Cloudflare Worker : v5.14.
- Règle de version : la version qui fait foi est celle affichée en bas de page, jamais le titre/onglet du navigateur.

## Moteurs FAL actifs et validés par génération réelle
- `fal-ai/hy-wu-edit` — face swap — coût rapporté ~0,10 USD/image.
- `nano-banana/edit` — image editing — coût rapporté 0,04 USD.
- `fal-ai/kling-video/v2.6/pro/motion-control` — transfert de danse — coût rapporté 0,112 USD/seconde.
- `fal-ai/pixverse/swap` — changement de décor vidéo — coût rapporté 0,20 USD/5 s en 720p.

Les coûts sont des valeurs opérationnelles rapportées à cette date et doivent être revérifiés avant toute décision financière future.

## Paramètre critique PixVerse
`fal-ai/pixverse/swap` doit utiliser `mode: "background"` pour le changement de décor. Le défaut API rapporté est `"person"`, qui changerait la personne au lieu du fond. Ne jamais modifier ce comportement sans test et approbation explicite.

## Facturation vidéo StarClip rapportée
- durée <= 5 s : 1 crédit vidéo ;
- durée > 5 s et <= 10 s : 2 crédits vidéo ;
- au-delà de 10,5 s : refus avant envoi au fournisseur.

## Pixel Lock
Pixel Lock a été validé sur un test réel rapporté à 224 864 pixels 100 % identiques. La formulation « pixel pour pixel » est réservée à Pixel Lock et ne doit pas être utilisée pour d'autres mécanismes sans preuve équivalente.

## Tests
Suite jsdom : 59 vérifications rapportées en v41.34. Objectif : zéro régression à chaque version.

## Correctifs v41.33 / v41.34
- v41.33 : ancrage des pieds dans le volet Décor vidéo.
- v41.34 : acceptation des vidéos `.mov` iPhone dans Danses, Décor et Recadrage.

## Règles d'ingénierie issues des tests
1. Documentation fournisseur != modèle opérationnel. Avant toute intégration d'un nouveau modèle, exiger une génération réellement aboutie dans le playground/environnement du fournisseur.
2. Avant de construire/louer une infrastructure GPU spécifique, inventorier les modèles déjà disponibles chez FAL et les fournisseurs accessibles, puis comparer qualité, coût et contraintes.

## Open issue — talons relevés
Observation rapportée le 18 août 2026 : talons de l'artiste relevés après changement de décor. Diagnostic actuel : PixVerse ne modifiant pas les pixels de la personne dans ce workflow, l'origine probable est la vidéo de danse Kling en amont. Ce diagnostic reste à confirmer par test ; aucune correction n'est autorisée par ce document.
