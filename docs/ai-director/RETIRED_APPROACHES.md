# STARCLIP AI DIRECTOR — Retired / Rejected Approaches

Ce fichier empêche les agents futurs de recommander à nouveau des pistes déjà testées et rejetées sans nouvelle preuve justifiant leur réévaluation.

## Wan / RunPod pour le transfert de mouvement
Statut : RETIRÉ / ABANDONNÉ dans le workflow StarClip actuel.

Historique rapporté :
- travail exploratoire autour de Wan Animate / Wan 2.2 et GPU RunPod ;
- `fal-ai/wan-motion` éliminé après test A/B réel ;
- défauts rapportés : mains géantes/flottantes et corps figé ;
- Kling Motion Control a été retenu comme solution opérationnelle actuelle ;
- plus de 100 EUR de dépense GPU RunPod ont été rapportés pendant cette exploration.

Règle : ne pas relancer une infrastructure Wan/RunPod pour ce besoin sans nouvel élément technique mesurable, comparaison avec le catalogue fournisseur actuel, estimation de coût et approbation explicite de Papy Ndoumbe.

## Easel advanced face swap
Statut : REJETÉ comme modèle opérationnel lors du test rapporté.

`easel-ai/advanced-face-swap` acceptait les requêtes mais ne les exécutait pas réellement dans l'expérience rapportée. Leçon : une documentation ou un endpoint visible ne constitue pas une validation opérationnelle.

Règle : un nouveau modèle doit réussir une génération réelle de bout en bout avant proposition d'intégration.
