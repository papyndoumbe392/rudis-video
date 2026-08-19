# STARCLIP AI DIRECTOR — Lessons Learned

## Objet
Registre technique des erreurs, échecs et enseignements importants. Il s'applique à Claude, ChatGPT/OpenAI et aux futurs agents sans distinction.

Format :
`ERREUR -> CAUSE -> CONSÉQUENCE -> CORRECTION -> RÈGLE DE PRÉVENTION`

## L-001 — Easel : documentation ≠ exécution opérationnelle
**Erreur / constat :** considérer un modèle documenté et acceptant des requêtes comme potentiellement opérationnel sans preuve de génération aboutie.

**Cause :** confiance excessive dans la disponibilité documentaire/API.

**Conséquence :** `easel-ai/advanced-face-swap` a été rapporté comme acceptant les requêtes sans les exécuter réellement dans le test concerné.

**Correction :** abandon de cette piste opérationnelle.

**Règle de prévention :** aucun nouveau modèle n'est considéré intégrable avant une génération réelle réussie de bout en bout.

## L-002 — RunPod : construire avant d'inventorier
**Erreur / constat :** exploration d'une infrastructure GPU spécifique avant inventaire exhaustif des solutions déjà accessibles chez les fournisseurs.

**Cause :** recherche d'une solution technique avant comparaison complète du catalogue existant.

**Conséquence :** plus de 100 EUR de dépenses GPU rapportées pour une capacité de motion transfer disponible ensuite via un fournisseur existant.

**Correction :** Kling Motion Control retenu opérationnellement après tests rapportés ; piste Wan/RunPod retirée pour ce besoin.

**Règle de prévention :** inventorier d'abord FAL et les fournisseurs accessibles, tester les candidats réels, comparer qualité/coût/contraintes, puis seulement envisager une infrastructure spécifique.

## L-003 — Mémoire périmée
**Risque :** livrer une nouvelle version sans synchroniser `RUNTIME_STATE.md`.

**Cause :** documentation traitée comme tâche ultérieure plutôt que partie de la livraison.

**Conséquence :** la mémoire commune peut présenter un état faux aux agents et provoquer des décisions incorrectes.

**Correction :** synchronisation runtime intégrée au workflow de livraison.

**Règle de prévention :** aucune version n'est documentairement complète sans vérification/mise à jour de `RUNTIME_STATE.md`.

## Ajouts futurs
Toute nouvelle entrée doit décrire des faits vérifiés ou clairement marqués comme rapportés/non vérifiés. Ne pas transformer une hypothèse en leçon acquise sans preuve.
