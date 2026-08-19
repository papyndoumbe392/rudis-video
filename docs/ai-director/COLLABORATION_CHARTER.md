# STARCLIP AI DIRECTOR — Charte finale de collaboration

**Statut : VALIDÉE par Papy Ndoumbe le 19 août 2026.**

## 1. Autorité finale — Papy Ndoumbe
Papy Ndoumbe est le directeur et l'autorité de décision finale de STARCLIP AI DIRECTOR. Il définit les objectifs, arbitre les désaccords, autorise les changements fonctionnels, les dépenses, les nouveaux moteurs/API et les déploiements.

Pendant la phase actuelle, Papy reste le relais unique des messages entre Claude et ChatGPT/OpenAI. Aucune automatisation directe entre agents n'est active.

## 2. Claude — ingénierie du StarClip opérationnel
Claude est responsable principal de l'ingénierie du StarClip opérationnel existant : implémentation, corrections, tests, préparation des versions et préparation du Worker lorsque Papy l'autorise.

Claude ne modifie pas `docs/ai-director/` sans autorisation de Papy.

Pour le Worker, Claude peut préparer un fichier complet à coller conformément aux règles opérationnelles. Aucun déploiement Cloudflare ou GitHub n'est effectué sans autorisation explicite de Papy. Papy décide qui exécute techniquement chaque déploiement.

## 3. ChatGPT/OpenAI — AI Director, recherche et architecture
ChatGPT/OpenAI prend principalement en charge :
- architecture STARCLIP AI DIRECTOR ;
- recherche et comparaison des moteurs/API ;
- Model Router ;
- SceneSpec ;
- orchestration automatique du storyboard ;
- analyse qualité/coûts/capacités ;
- contre-analyse technique des décisions importantes ;
- maintien de la mémoire AI Director dans les limites autorisées.

ChatGPT/OpenAI ne modifie jamais le code fonctionnel StarClip ni `index.html` / l'index sans autorisation explicite de Papy.

## 4. Protection symétrique
- ChatGPT ne modifie pas le code fonctionnel StarClip ni `index.html` sans autorisation de Papy.
- Claude ne modifie pas `docs/ai-director/` sans autorisation de Papy.
- Une proposition d'un agent n'autorise jamais l'autre agent à l'implémenter.

## 5. Trois régimes de travail

### LÉGER
Pour : correction de bug, ajustement d'interface, compatibilité, petit correctif.

Flux :
`CLAUDE PRÉPARE -> TESTS AUTOMATIQUES -> VERSION -> TEST RÉEL PAPY -> RUNTIME_STATE VÉRIFIÉ/MIS À JOUR -> LIVRAISON`

Pas de contre-analyse ChatGPT systématique. Papy peut la demander.

### STANDARD
Pour : nouvelle fonctionnalité, nouveau volet, changement important de prompt en production ou changement fonctionnel significatif.

Flux :
`ANALYSE -> CONTRE-ANALYSE SI NÉCESSAIRE -> OPTIONS À PAPY -> APPROBATION -> IMPLÉMENTATION -> TESTS AUTOMATIQUES -> VERSION -> TEST RÉEL PAPY -> RUNTIME_STATE -> LIVRAISON`

### LOURD
Pour : architecture, nouveau moteur/fournisseur, sécurité, coûts, API, changement Cloudflare important, engagement financier ou changement à risque élevé.

Double analyse Claude + ChatGPT obligatoire avant décision. Les deux analyses sont présentées à Papy, qui tranche.

## 6. Régime URGENCE
Le mode URGENCE n'existe que si Papy le déclare explicitement pour débloquer une situation de production/client.

Flux raccourci :
`CORRECTIF -> TEST PAPY -> LIVRAISON URGENTE -> DOCUMENTATION/RUNTIME_STATE <= 24 H`

Le mode urgence ne donne jamais carte blanche sur les secrets, paiements, suppressions de données, changements irréversibles ou autres opérations critiques non explicitement autorisées.

La livraison doit être tracée comme livraison d'urgence dans la mémoire opérationnelle.

## 7. Test réel obligatoire
Les tests automatiques ne suffisent pas à eux seuls à déclarer une fonction opérationnelle. Le cycle normal de livraison comprend un test réel par Papy sur du contenu représentatif.

Chaîne de référence :
`CODE -> TESTS AUTOMATIQUES -> VERSION -> TEST RÉEL PAPY -> RUNTIME_STATE -> LIVRAISON`

## 8. Discipline RUNTIME_STATE
Toute version livrée doit entraîner une vérification de `RUNTIME_STATE.md` et sa mise à jour si nécessaire. Une version n'est pas documentairement complète sans cette étape.

L'état réel vérifié prévaut toujours sur la documentation. En cas de doute, une information est marquée non vérifiée plutôt que supposée correcte.

## 9. Contre-analyse proportionnée
- Décisions d'architecture, coûts, fournisseur/moteur, sécurité : contre-analyse systématique des deux agents.
- Correctifs courants : contre-analyse uniquement sur demande de Papy ou si un risque inhabituel est identifié.
- La lourdeur du processus doit rester proportionnée à l'enjeu.

## 10. Désaccord Claude / ChatGPT
Les agents ne doivent pas rechercher artificiellement le consensus. En cas de désaccord significatif, chacun présente sa solution, ses preuves, avantages, risques et coûts. Papy tranche.

## 11. Journal des erreurs et leçons
Toute erreur significative constatée doit être documentée selon :
`ERREUR -> CAUSE -> CONSÉQUENCE -> CORRECTION -> RÈGLE DE PRÉVENTION`

Cette règle s'applique symétriquement à Claude, ChatGPT/OpenAI et aux futurs agents. Le but est la prévention des répétitions, pas l'attribution de blâme.

Le registre dédié est `LESSONS_LEARNED.md`.

## 12. Sécurité
Aucun mot de passe, code administrateur, clé FAL, clé OpenAI, clé Anthropic ou autre secret ne doit être stocké dans GitHub. Les secrets restent dans l'infrastructure sécurisée appropriée.

## 13. Communication inter-agents
Pendant la phase actuelle :
`CLAUDE -> PAPY -> CHATGPT`
`CHATGPT -> PAPY -> CLAUDE`

Aucune communication automatique OpenAI API <-> Anthropic API n'est mise en place avant une décision ultérieure explicite de Papy.

## 14. Principe directeur
La gouvernance doit protéger le produit sans empêcher une livraison raisonnablement rapide. Si un processus devient disproportionné par rapport à l'enjeu, Papy peut choisir le régime approprié ou demander une révision de la charte.

---

**Validation finale : CHARTE FINALE VALIDÉE par Papy Ndoumbe le 19 août 2026.**
