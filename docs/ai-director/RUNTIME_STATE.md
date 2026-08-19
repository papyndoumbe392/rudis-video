# STARCLIP AI DIRECTOR — Runtime State

## Portée
État opérationnel communiqué par Claude depuis la passation STARCLIP END et validé par Papy Ndoumbe pour intégration dans la mémoire commune. Ce fichier documente l'existant ; il n'autorise aucune modification du code.

**Dernière vérification documentaire : 19 août 2026.**

## RÈGLE STRICTE — synchronisation obligatoire à chaque livraison
Toute nouvelle version StarClip livrée (par exemple v41.35) doit inclure, dans la même discipline de livraison, une vérification et si nécessaire une mise à jour de `RUNTIME_STATE.md`.

Une livraison n'est pas considérée documentairement complète tant que `RUNTIME_STATE.md` n'a pas été comparé à la version réellement livrée.

Papy Ndoumbe, en tant que relais et autorité finale, exige cette synchronisation. Claude, OpenAI/ChatGPT et tout futur agent doivent également signaler explicitement si une livraison est proposée sans mise à jour/vérification du runtime.

Un `RUNTIME_STATE.md` périmé ne doit jamais être présenté comme l'état réel du produit. En cas de doute, marquer l'information comme non vérifiée plutôt que de la supposer correcte.

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
- `nano-banana/edit` — deux usages opérationnels rapportés : (1) édition d'image, postures et retouches ; (2) text-to-image pour l'option « Créer mon décor » du volet Décor vidéo — coût rapporté 0,04 USD.
- `fal-ai/kling-video/v2.6/pro/motion-control` — transfert de danse — coût rapporté 0,112 USD/seconde.
- `fal-ai/pixverse/swap` — changement de décor vidéo — coût rapporté 0,20 USD/5 s en 720p.

Les coûts sont des valeurs opérationnelles rapportées à cette date et doivent être revérifiés avant toute décision financière future.

## Paramètre critique PixVerse
`fal-ai/pixverse/swap` doit utiliser `mode: "background"` pour le changement de décor. Le défaut API rapporté est `"person"`, qui changerait la personne au lieu du fond. Ne jamais modifier ce comportement sans test et approbation explicite.

## Durée et facturation vidéo StarClip rapportées
- limite annoncée au client : 10 s ;
- durée <= 5 s : 1 crédit vidéo ;
- durée > 5 s et <= 10 s : 2 crédits vidéo ;
- constantes opérationnelles rapportées : `DANSE_DUREE_MAX = 10.5` et `DV_DUREE_MAX = 10.5` ;
- refus effectif au-delà de 10,5 s ;
- la tolérance technique de 0,5 s absorbe les débordements de conteneur vidéo et ne change pas la limite client annoncée de 10 s.

## Pixel Lock
Pixel Lock a été validé sur un test réel rapporté à 224 864 pixels 100 % identiques. La formulation « pixel pour pixel » est réservée à Pixel Lock et ne doit pas être utilisée pour d'autres mécanismes sans preuve équivalente.

## Tests
- Suite jsdom : 59 vérifications rapportées en v41.34.
- Objectif : zéro régression à chaque version.
- Règle de travail : une correction à la fois, validée sur un test de référence identique avant de passer à la suivante.

## Correctifs v41.33 / v41.34
### v41.33 — Décor vidéo / pieds
Deux changements rapportés :
1. suffixe de cadrage injecté en dur dans le prompt de l'option « Créer mon décor » : appareil à hauteur de poitrine, horizon à hauteur d'yeux, sol visible dans le tiers inférieur et légèrement réfléchissant, avant-plan dégagé ;
2. clause d'ombre de contact ajoutée au prompt PixVerse.

**Important : l'efficacité de la clause d'ombre de contact n'est pas encore prouvée et ne doit pas être considérée comme acquise.**

### v41.34 — vidéos iPhone
Acceptation des vidéos `.mov` iPhone dans les volets Danses, Décor et Recadrage.

## Contraintes de livraison rapportées
- Worker livré en fichier complet à coller, jamais en diff partiel.
- ZIP de livraison nommés avec des underscores, par exemple `StarClip-v41_34.zip` ; les points dans le nom ont causé des problèmes d'ouverture sur iPhone.
- Aucun échec silencieux : les erreurs serveur doivent remonter explicitement à l'utilisateur ; les replis silencieux sont interdits sauf autorisation explicite.

## Contexte réseau et exécution
- Contexte de travail rapporté : MacBook Pro + iPhone avec partage de connexion 4G.
- Les erreurs 408 ont motivé l'implémentation de 3 tentatives d'envoi en v41.32.
- Les bibliothèques de danses et de décors ne fonctionnent qu'en ligne dans le workflow rapporté, FAL devant pouvoir télécharger les fichiers depuis GitHub.
- Les médias opérationnels déposés sur GitHub comprennent notamment 4 décors PNG et une vidéo de danse ; leur régénération reste un chantier ouvert.

## Règles d'ingénierie issues des tests
1. Documentation fournisseur != modèle opérationnel. Avant toute intégration d'un nouveau modèle, exiger une génération réellement aboutie dans le playground/environnement du fournisseur.
2. Avant de construire/louer une infrastructure GPU spécifique, inventorier les modèles déjà disponibles chez FAL et les fournisseurs accessibles, puis comparer qualité, coût et contraintes.
3. Aucun échec silencieux sauf décision explicitement approuvée.
4. Une correction à la fois, testée avant la suivante.

## Open issue — talons relevés
Observation rapportée le 18 août 2026 : les talons de l'artiste apparaissent relevés après changement de décor.

Raisonnement diagnostique actuel : les talons relevés sont visibles dans les pixels de la personne. Dans le workflow rapporté, PixVerse en mode background ne modifie pas les pixels de la personne. Ce constat exclut donc, selon le diagnostic actuel, le changement de décor comme origine directe et remonte la cause probable à la génération Kling Motion Control en amont.

Ce diagnostic reste à confirmer par test contrôlé ; aucune correction n'est autorisée par ce document.
