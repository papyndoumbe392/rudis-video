# STARCLIP AI DIRECTOR — État du projet

## Objet
Ce document est une mémoire technique partagée entre Papy Ndoumbe, OpenAI/ChatGPT et Claude/Anthropic. Il ne contient aucun secret.

## StarClip existant
- Dépôt principal public : papyndoumbe392/rudis-video.
- Branche de production observée : main.
- La partie publique/PWA StarClip est présente dans ce dépôt.
- `config.js` pointe vers un Cloudflare Worker public ; l'URL n'est pas dupliquée ici.
- Le Worker Cloudflare contient la logique sensible et l'administration selon le propriétaire du projet.
- FAL est utilisé par StarClip pour la génération ; les secrets ne doivent pas être copiés dans GitHub.
- GitHub Pages est utilisé pour la partie publique du projet.
- Pour l'état opérationnel testé, les versions, moteurs actifs et paramètres critiques, lire `RUNTIME_STATE.md`.

## Protection du produit existant
- STARCLIP AI DIRECTOR est une évolution de StarClip, pas une reconstruction depuis zéro.
- Ne jamais modifier le code fonctionnel existant maintenu avec Claude sans approbation explicite de Papy Ndoumbe.
- Ne jamais toucher à `index.html` / l'index dans le cadre du travail documentaire AI Director.

## Composants connus hors de ce dépôt
- Cloudflare Worker : logique serveur sensible, authentification/administration et secrets.
- FAL : fournisseur/API de génération utilisé par StarClip.

## Approches historiques retirées
L'exploration Wan Animate / Wan 2.2 / RunPod pour le transfert de mouvement n'est plus une piste active du workflow actuel. Elle a été remplacée opérationnellement par Kling Motion Control après tests rapportés. Lire `RETIRED_APPROACHES.md` avant de proposer de relancer cette piste.

## Vision AI Director
Faire évoluer StarClip sans le reconstruire depuis zéro. AI Director doit devenir une couche d'orchestration capable de :
1. recevoir une chanson, des références artiste et une direction créative ;
2. analyser la structure de la chanson ;
3. produire un storyboard et un découpage temporel ;
4. créer des SceneSpec structurées ;
5. choisir le moteur vidéo le mieux adapté à chaque scène ;
6. préserver l'identité de l'artiste comme critère prioritaire ;
7. contrôler les résultats et proposer/réaliser une régénération selon les règles approuvées ;
8. rester extensible à de nouveaux fournisseurs.

## Architecture cible — non encore approuvée pour implémentation
- StarClip UI/PWA
- Cloudflare/backend sécurisé
- AI Director
- Shared Project Memory
- Model Router
- Provider adapters (FAL et futurs fournisseurs)
- Quality Control
- Lip-sync / upscale / rendu selon capacités retenues

Cette architecture est une direction de travail documentaire. Elle ne constitue pas une autorisation d'implémentation.

## Gouvernance
Lire `GOVERNANCE.md` avant toute intervention. Papy Ndoumbe reste l'autorité de décision finale.

## À vérifier
- Inventaire complet des fichiers et fonctions du StarClip actuel sans modification.
- Architecture exacte du Worker Cloudflare lorsque Papy autorisera son audit.
- APIs vidéo candidates et conditions commerciales.
- Format SceneSpec et critères du Model Router.
- Open issue talons relevés décrit dans `RUNTIME_STATE.md`.
