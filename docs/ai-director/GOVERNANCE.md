# STARCLIP AI DIRECTOR — Gouvernance

## Autorité finale

Papy Ndoumbe est l'autorité de décision finale du projet STARCLIP AI DIRECTOR.

Les agents IA (OpenAI/ChatGPT, Claude/Anthropic et futurs agents) peuvent analyser, rechercher, comparer, proposer, critiquer, tester dans un environnement isolé et préparer des changements.

Aucune décision architecturale majeure, suppression, remplacement d'un moteur ou fournisseur, modification de production, déploiement, changement de sécurité, engagement financier ou modification irréversible ne doit être appliqué sans approbation explicite de Papy Ndoumbe.

## Autorisation permanente — documentation et analyse

Papy Ndoumbe autorise durablement les agents travaillant sur STARCLIP AI DIRECTOR à :

- lire et analyser le dépôt et sa documentation ;
- créer et maintenir la documentation et la mémoire technique de STARCLIP AI DIRECTOR ;
- documenter les recherches, comparaisons, décisions approuvées et propositions ;
- préparer des recommandations et plans d'implémentation.

Cette autorisation permanente ne couvre pas les changements fonctionnels ou opérationnels décrits ci-dessous.

## Approbation explicite obligatoire

Une approbation explicite de Papy Ndoumbe est requise avant :

- toute modification du code fonctionnel de StarClip ;
- toute modification affectant la production ou un déploiement ;
- toute modification de Cloudflare, FAL ou des intégrations API actives ;
- tout changement de sécurité, authentification, secrets ou permissions ;
- tout engagement financier ou changement susceptible d'augmenter les coûts ;
- tout ajout, retrait ou remplacement opérationnel d'un moteur ou fournisseur ;
- toute suppression ou modification irréversible.

## RÈGLE STRICTE — discipline de livraison et vérité du runtime

Toute livraison d'une nouvelle version StarClip doit inclure une vérification de `docs/ai-director/RUNTIME_STATE.md` et sa mise à jour si l'état opérationnel a changé.

Cette vérification fait partie intégrante de la livraison : une nouvelle version ne doit pas être considérée documentairement complète si le runtime n'a pas été synchronisé.

Papy Ndoumbe, en tant que relais et autorité finale, exige cette discipline à chaque livraison. Claude, OpenAI/ChatGPT et tout futur agent doivent signaler une livraison qui omet cette vérification.

Si l'état réel et `RUNTIME_STATE.md` divergent, l'état réel vérifié prévaut et le document doit être corrigé. Aucun agent ne doit présenter une information périmée comme actuelle.

## Règles

1. Préserver le StarClip fonctionnel existant.
2. Travailler progressivement et par étapes testables.
3. Présenter les options, avantages, risques et coûts avant toute décision majeure.
4. Ne jamais stocker de mot de passe, code administrateur, clé FAL, clé OpenAI, clé Anthropic ou autre secret dans GitHub.
5. Les secrets restent côté serveur, notamment dans les mécanismes sécurisés de Cloudflare.
6. GitHub sert de source commune pour le code non secret, la documentation, les décisions approuvées et la mémoire technique partagée entre agents.
7. Une proposition d'un agent n'est pas une décision approuvée.
8. L'autorisation de maintenir la documentation ne doit jamais être interprétée comme une autorisation de modifier automatiquement le produit.
9. Ne jamais modifier le code fonctionnel maintenu avec Claude ni `index.html` / l'index de StarClip dans le cadre du travail documentaire AI Director sans approbation explicite de Papy Ndoumbe.
10. La synchronisation de `RUNTIME_STATE.md` est une obligation de livraison, pas une tâche facultative ultérieure.

## Workflow de décision

PROPOSITION -> ANALYSE/CRITIQUE -> PRÉSENTATION À PAPY NDOUMBE -> APPROBATION EXPLICITE -> IMPLÉMENTATION -> TEST -> MISE À JOUR/VÉRIFICATION RUNTIME_STATE -> VALIDATION FINALE

## Statut

La gouvernance initiale, l'autorisation permanente limitée à la documentation/analyse et la règle stricte de synchronisation du runtime à chaque livraison ont été explicitement validées par Papy Ndoumbe.
