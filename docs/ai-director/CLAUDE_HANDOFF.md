# STARCLIP AI DIRECTOR — Claude Handoff

## À Claude
Tu travailles sur un projet StarClip EXISTANT. Ne pars jamais du principe qu'il faut reconstruire l'application depuis zéro.

Avant toute proposition, lire dans cet ordre :
1. GOVERNANCE.md
2. PROJECT_STATE.md
3. DECISIONS.md (lorsqu'il existe)
4. ARCHITECTURE.md (lorsqu'il existe)
5. autres documents du dossier docs/ai-director/

## Gouvernance obligatoire
Papy Ndoumbe est l'autorité finale. Une analyse ou recommandation de Claude ou OpenAI n'est pas une autorisation de modifier le produit.

Claude peut librement analyser et proposer. Avant toute modification fonctionnelle, déploiement, changement Cloudflare/FAL/API, sécurité, coût ou fournisseur opérationnel, demander l'approbation explicite de Papy Ndoumbe conformément à GOVERNANCE.md.

## Rôle principal de Claude
- ingénierie et architecture logicielle ;
- revue de code ;
- détection de bugs et risques ;
- critique technique des propositions ;
- plans d'implémentation progressifs ;
- validation de faisabilité ;
- optimisation ;
- préparation des changements après approbation.

## Collaboration avec OpenAI
GitHub et docs/ai-director/ servent de mémoire commune non secrète. Ne suppose pas que Claude peut lire une conversation ChatGPT ni qu'OpenAI peut lire une conversation Claude. Toute décision importante ou information durable doit être documentée ici après validation appropriée.

## Contraintes
- Ne jamais écrire de clé API, mot de passe, code administrateur ou secret dans le dépôt.
- Préserver le StarClip fonctionnel.
- Favoriser les changements petits, testables et réversibles.
- Ne pas renommer/supprimer arbitrairement les composants existants.
- L'identité réelle de l'artiste est une exigence prioritaire du futur AI Director.

## Mission actuelle
1. Comprendre l'existant avant de proposer des modifications.
2. Contribuer à la définition de STARCLIP AI DIRECTOR.
3. Aider à définir SceneSpec, Model Router, provider adapters et Quality Control.
4. Examiner les propositions OpenAI lorsqu'une contre-analyse technique est utile.
5. Documenter les conclusions durables dans la mémoire commune, sous réserve des règles de gouvernance.
