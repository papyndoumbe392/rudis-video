// ═══════════ test-v41.38.js — suite jsdom StarClip v41.38 ═══════════
// Objet de la version : ancrage des pieds dans le volet 🏙️ Décor vidéo.
//   1. Option B (décrire) : suffixe de cadrage EN DUR (hauteur de poitrine,
//      sol visible et réfléchissant) collé derrière le texte du client.
//   2. Envoi pixverse : clause d'ombre de contact EN DUR dans le payload.
// + non-régression structurelle sur tout le reste (v41.33 conservée à l'identique).
// Zéro régression exigé : tout doit être au vert.

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// Le script fonctionne depuis le dossier livré (à côté d'index.html)
// comme depuis le dossier parent.
const DIR = fs.existsSync(path.join(__dirname, "index.html"))
  ? __dirname : path.join(__dirname, "StarClip-v41.38");
const html = fs.readFileSync(path.join(DIR, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(DIR, "sw.js"), "utf8");

let n = 0, ko = 0;
function t(nom, cond) {
  n++;
  if (cond) console.log(`  ✓ ${nom}`);
  else { ko++; console.log(`  ✗ ${nom}  ← ÉCHEC`); }
}

console.log("\n═══ A · VERSIONS COHÉRENTES ═══");
t("titre de l'onglet = v41.38", html.includes("<title>StarClip Studio v41.38"));
t("version en bas de page = v41.38 (référence officielle)", html.includes("> · v41.38</span>"));
t("sw.js CACHE = starclip-v41-38 (leçon des clients bloqués)", sw.includes('const CACHE = "starclip-v41-38"'));
t("aucune trace résiduelle v41.33 dans le titre/pied", !html.includes("<title>StarClip Studio v41.33") && !html.includes("> · v41.33</span>"));

console.log("\n═══ B · CORRECTIF 1 — OPTION B « DÉCRIRE » (nano-banana) ═══");
t("cadrage à hauteur de poitrine imposé", html.includes("photographed from chest height"));
t("horizon à hauteur d'yeux", html.includes("eye-level horizon"));
t("sol visible dans le tiers inférieur", html.includes("ground plane clearly visible in the lower third"));
t("sol légèrement réfléchissant (l'ancrage prouvé par l'essai Arc de Triomphe)", html.includes("slightly wet reflective ground surface"));
t("avant-plan dégagé en bas au centre (place pour les pieds)", html.includes("empty foreground area at the bottom center"));
t("l'ancien suffixe « camera at eye level, deep perspective » a disparu", !html.includes("camera at eye level, deep perspective"));
t("le texte du client reste concaténé AVANT le suffixe (desc + suffixe en dur)", /prompt:\s*"A photorealistic wide establishing shot of "\s*\+\s*desc/.test(html));
t("toujours aucune personne dans le décor généré", html.includes("NO people"));
t("interdits conservés : texte, filigrane, logos", html.includes("No text, no watermark, no brand logos"));

console.log("\n═══ C · CORRECTIF 2 — CLAUSE D'ANCRAGE PIXVERSE ═══");
// Isoler le bloc d'envoi pixverse (apiSubmit(DV_MOTEUR, …))
const iSubmit = html.indexOf("const payload = {", html.indexOf("dvLogReset()"));
const blocSubmit = html.slice(iSubmit, iSubmit + 2400);
t("le bloc de construction du payload pixverse existe", iSubmit > -1);
t("clause : ombre de contact sous les pieds", blocSubmit.includes("soft natural contact shadow beneath the subject's feet"));
t("clause : sujet fermement posé au sol", blocSubmit.includes("subject firmly planted on the ground surface"));
t("clause : pieds en contact avec le sol", blocSubmit.includes("feet touching the ground"));
t("mode \"background\" toujours EN DUR (jamais \"person\")", blocSubmit.includes('mode: "background"'));
t("keyframe_id: 1 conservé", blocSubmit.includes("keyframe_id: 1"));
t("résolution 720p conservée (palier de prix)", blocSubmit.includes('resolution: "720p"'));
t("son de la vidéo conservé", blocSubmit.includes("original_sound_switch: true"));
t("durée facturable transmise (dance_seconds)", html.includes("apiSubmit(DV_MOTEUR, payload, { dance_seconds"));
t("avertissement « À VALIDER par le test local » présent (règle doc ≠ modèle opérationnel)", blocSubmit.includes("À VALIDER"));
t("la clause s'applique aux TROIS modes (A biblio, B décrire, C importer) car unique point d'envoi",
  (html.match(/apiSubmit\(DV_MOTEUR/g) || []).length === 1);

console.log("\n═══ D · NON-RÉGRESSION VOLET DÉCOR VIDÉO ═══");
t("moteur inchangé : fal-ai/pixverse/swap", html.includes('const DV_MOTEUR = "fal-ai/pixverse/swap"'));
t("palier 1 crédit ≤ 5,5 s", html.includes("const DV_PALIER_1 = 5.5"));
t("refus AVANT envoi au-delà de 10,5 s", html.includes("const DV_DUREE_MAX = 10.5"));
t("bibliothèque : les 4 décors présents", ["decor-douala-crepuscule.png","decor-douala-nuit.png","decor-champs-elysees.png","decor-tour-eiffel.png"].every(f => html.includes(f)));
t("repli du suivi sur la RACINE du modèle (fal-ai/pixverse/requests)", html.includes("queue.fal.run/fal-ai/pixverse/requests/"));
t("lecture robuste du résultat (trouverUrlVideo)", html.includes("trouverUrlVideo(data)"));
t("erreur affichée avec la réponse brute (aucun échec silencieux)", html.includes("apercuReponse(data)"));

console.log("\n═══ E · NON-RÉGRESSION GÉNÉRALE v41.33 ═══");
t("Face Lock : moteur hy-wu-edit présent", html.includes("fal-ai/hy-wu-edit"));
t("Danses : moteur Kling motion-control présent", html.includes("kling-video/v2.6/pro/motion-control"));
t("Danses : bibliothèque MOTION_DANSES présente", html.includes("const MOTION_DANSES"));
t("Pixel Lock : BiRefNet présent", html.includes("birefnet"));
t("Multi-plans : budgets de préfixes présents", html.includes("MS_PREFIXIMG_LEN"));
t("3 tentatives d'envoi de fichier (erreurs 408) conservées", html.includes("v41.32 : 3 tentatives"));
t("enregistrement du service worker conservé", html.includes('navigator.serviceWorker.register("sw.js")'));


console.log("\n═══ G · CORRECTIF v41.38 — VIDÉOS .MOV DE L'IPHONE ═══");
const champs = [
  ["dansePersoInput", "🕺 Danses · importer sa propre danse"],
  ["dvInput",         "🏙️ Décor vidéo · importer la vidéo"],
  ["rfVideoInput",    "Recadrage · importer la vidéo"],
  ["lipVideoInput",   "Lip-sync · importer la vidéo (déjà correct avant v41.38)"],
];
champs.forEach(([id, nom]) => {
  const m = html.match(new RegExp('id="' + id + '"[^>]*accept="([^"]*)"'));
  t(nom + " accepte .mov", !!m && /\.mov/i.test(m[1]));
  t(nom + " accepte .mp4", !!m && /\.mp4/i.test(m[1]));
  t(nom + " garde video/* (compatibilité Android/desktop)", !!m && m[1].includes("video/*"));
});
t("plus aucun champ vidéo limité au seul video/*", !/accept="video\/\*"/.test(html));
t("message d'erreur mov/mp4 conservé dans le volet Danses", html.includes("formats acceptés : mp4, mov"));


console.log("\n═══ H · CORRECTIF v41.38 — ALERTE DE FORMAT DANS LE VOLET DÉCOR ═══");
t("bloc d'alerte présent dans le HTML", html.includes('id="dvFormatAlerte"'));
t("alerte masquée par défaut (classe hidden)", /id="dvFormatAlerte"[^>]*class="[^"]*hidden/.test(html));
t("bouton « Continuer tel quel » avec le doigt 👉", /id="dvGarderFormat"[^>]*>👉 Continuer tel quel/.test(html));
t("bouton « Convertir » avec le doigt 👉 et le coût annoncé", /id="dvConvertirBtn"[^>]*>👉 🔄 Convertir en 16:9 \(2 crédits\)/.test(html));
t("barre de progression dédiée à la conversion", html.includes('id="dvCvStatus"') && html.includes('id="dvCvFill"'));
t("détection du ratio appelée à l'import", html.includes("dvVerifierFormat(v.videoWidth, v.videoHeight)"));
t("tolérance 16:9 de 1,70 à 1,85 (pas d'alerte inutile)", html.includes("r >= 1.70 && r <= 1.85"));
t("noms de formats lisibles par le client (9:16, 4:3, 1:1…)", html.includes("function dvNomFormat"));
t("le message affiche les dimensions réelles", html.includes('w + " × " + h'));
t("message court : mention réseaux sociaux vs YouTube", html.includes("Réseaux sociaux → aucun souci. YouTube pro → mieux vaut convertir."));
t("variable d'état dvFormatOk déclarée", html.includes("let dvFormatOk = true"));
t("« Continuer tel quel » ne déclenche AUCUN appel moteur", /dvGarderFormat"\).onclick = \(\) => \{\s*document\.getElementById\("dvFormatAlerte"\)\.classList\.add\("hidden"\);\s*\};/.test(html));
t("conversion sur place via le moteur du volet Format (RF_MODEL)", html.includes('apiSubmit(RF_MODEL, { video_url: url, aspect_ratio: "16:9" })'));
t("la vidéo convertie remplace la source du volet Décor", html.includes("dvVideo = { url: out };"));
t("lecture robuste du résultat (trouverUrlVideo)", /dvConvertirBtn[\s\S]{0,3000}trouverUrlVideo\(data\)/.test(html));
t("erreur serveur affichée en clair (aucun échec silencieux)", /dvConvertirBtn[\s\S]{0,3000}apercuReponse\(data\)/.test(html));
t("les deux boutons sont réactivés même en cas d'échec (finally)", /dvConvertirBtn[\s\S]{0,3500}finally \{[\s\S]{0,120}btn\.disabled = false; garder\.disabled = false;/.test(html));
t("le chemin « Ma dernière danse » passe par la même vérification", html.includes('dvLireVideo(window.derniereDanseUrl'));
t("aucun changement du payload pixverse (mode background intact)", html.includes('mode: "background"'));


console.log("\n═══ I · v41.38 — JOURNAL DE DIAGNOSTIC + GARDE-FOU ANTI-ÉCHO ═══");
t("journal présent dans le HTML (repliable)", html.includes('id="dvJournalBoite"') && html.includes('id="dvJournal"'));
t("bouton de copie du journal", html.includes('id="dvJournalCopier"'));
t("fonction dvLog déclarée, doublée en console", html.includes("function dvLog(") && html.includes('console.log("[DÉCOR'));
t("journal remis à zéro à chaque lancement", /dvLogReset\(\);[\s\S]{0,120}dvLog\("DÉMARRAGE"/.test(html));
t("trace : vidéo source (fichier: nom, taille, MIME)", html.includes('dvLog("VIDÉO SOURCE (fichier importé)"'));
t("trace : vidéo source (URL)", html.includes('dvLog("VIDÉO SOURCE (URL)"'));
t("trace : décor importé (option C)", html.includes('dvLog("DÉCOR (image importée — option C)"'));
t("trace : décor par URL (options A/B)", html.includes('dvLog("DÉCOR (URL — option A bibliothèque ou B créé)"'));
t("trace : URL vidéo réellement transmise", html.includes('dvLog("VIDÉO HÉBERGÉE — URL réellement transmise au moteur"'));
t("trace : URL décor réellement transmise", html.includes('dvLog("DÉCOR HÉBERGÉ — URL réellement transmise au moteur"'));
t("trace : moteur et payload complet", html.includes('dvLog("MOTEUR"') && html.includes('dvLog("PAYLOAD COMPLET ENVOYÉ", payload)'));
t("trace : request_id du job", html.includes('dvLog("JOB ACCEPTÉ PAR LE SERVEUR"'));
t("trace : chaque changement de statut", html.includes('dvLog("STATUT"'));
t("trace : réponse brute AVANT extraction de l'URL", html.includes('dvLog("RÉPONSE BRUTE COMPLÈTE (avant extraction de l\'URL)", data)'));
t("délai 6 min dépassé = erreur explicite, pas de lecture d'un job en cours", html.includes("Le moteur n'a pas terminé en 6 minutes"));
t("GARDE-FOU : écho de la vidéo d'entrée détecté et refusé", html.includes("if (url === videoUrl)") && html.includes("ÉCHO DÉTECTÉ"));
t("l'écho produit une erreur visible, jamais un faux succès", html.includes("le décor n'a PAS été appliqué"));
t("payload pixverse inchangé (mode background en dur)", html.includes('mode: "background"'));
t("journal tronqué à 4000 caractères par entrée (pas d'engorgement)", html.includes('txt.length > 4000'));


console.log("\n═══ J · v41.38 — GARDE-FOU ANTI-FACTURATION D'UN ÉCHEC SILENCIEUX ═══");
t("extraction d'une image de vidéo (canvas 32x32)", html.includes("function dvImageDeVideo"));
t("comparaison source/sortie en niveaux de gris", html.includes("function dvDecorVraimentChange"));
t("seuil d'écart fixé à 18 %", html.includes("ecart >= 0.18"));
t("verdict « inconnu » si les images ne sont pas lisibles (aucune affirmation hasardeuse)", html.includes('verdict: "inconnu"'));
t("délai de sécurité sur la lecture vidéo (15 s)", html.includes("15000"));
t("contrôle exécuté APRÈS le garde-fou anti-écho", html.indexOf("dvDecorVraimentChange(videoUrl, url") > html.indexOf("if (url === videoUrl)"));
t("résultat du contrôle inscrit au journal", html.includes('dvLog("CONTRÔLE DU CHANGEMENT DE DÉCOR", ctrl)'));
t("fonction de remboursement du volet Décor", html.includes("async function dvRembourserSiEchec"));
t("remboursement via l'endpoint /refund du Worker", /dvRembourserSiEchec[\s\S]{0,400}WORKER_URL \+ "\/refund"/.test(html));
t("request_id mémorisé pour le remboursement", html.includes("dvJobEnCours = job.request_id"));
t("request_id remis à zéro à chaque lancement", html.includes("dvJobEnCours = null;   // v41.37"));
t("décor inchangé → erreur explicite, jamais un faux succès", html.includes("SANS appliquer le décor"));
t("l'écart mesuré est affiché au client", html.includes("écart mesuré : \" + ctrl.ecart"));
t("conseil concret donné au client (personne debout, entière, détachée)", html.includes("debout, entière et bien détachée du fond"));
t("la vidéo reste téléchargeable même en cas d'échec", html.includes("tu peux quand même la télécharger"));
t("payload pixverse toujours inchangé", html.includes('mode: "background"'));

console.log("\n═══ K · v41.38 — ESPACE ADMIN RUNWAY (Aleph 2.0 + Seedance 2.5) ═══");
t("zone admin présente et MASQUÉE par défaut", /id="adminZone"[^>]*class="hidden"/.test(html));
t("ouverture discrète depuis le pied de page", html.includes('id="admOuvre"'));
t("DEUX pages séparées, une par moteur", html.includes('id="admPageAleph"') && html.includes('id="admPageSeed"'));
t("page Seedance masquée par défaut (Aleph s'ouvre en premier)", /id="admPageSeed" class="hidden"/.test(html));
t("onglets de bascule entre les deux moteurs", html.includes('id="admOngletAleph"') && html.includes('id="admOngletSeed"'));

console.log("  — Sécurité —");
t("AUCUNE clé Runway dans le fichier", !/RUNWAY_API_KEY\s*=|runwayml_api_secret|Bearer\s+key_/i.test(html));
t("passage obligatoire par le Worker (/runway/submit)", html.includes('WORKER_URL + "/runway/submit"'));
t("suivi via le Worker (/runway/status)", html.includes('WORKER_URL + "/runway/status"'));
t("le code client est transmis pour vérification serveur", /rwSubmit[\s\S]{0,400}code: getCode\(\)/.test(html));
t("aucun appel direct à api.dev.runwayml.com depuis le navigateur", !html.includes("api.dev.runwayml.com"));

console.log("  — Aleph 2.0 —");
t("modèle aleph2 sur l'endpoint video_to_video", html.includes('model: "aleph2"') && html.includes('rwSubmit("video_to_video"'));
t("champ videoUri (nom exact de l'API)", html.includes("videoUri: videoUri"));
t("limite 30 s appliquée AVANT envoi", html.includes("v.duration > 30.5"));
t("limite vidéo 16 Mo (data URI Runway)", html.includes("rwFichierEnDataUri(alVideo, 16)"));
t("keyframes : 5 images de guidage maximum", html.includes("alRefs.length >= 5") && html.includes("payload.keyframes"));
t("AUCUN sélecteur de ratio (déprécié sur video_to_video)", !html.includes('id="alRatio"'));
t("tarif 28 crédits/s, minimum 56", html.includes("AL_CR_S = 28") && html.includes("AL_CR_MIN = 56"));

console.log("  — Seedance 2.5 —");
t("modèle seedance2_5 sur l'endpoint image_to_video", html.includes('model: "seedance2_5"') && html.includes('rwSubmit("image_to_video"'));
t("les 3 paliers de résolution", html.includes('"480p"') && html.includes('"720p"') && html.includes('"1080p"'));
t("les 6 ratios en 720p (relevés au playground)", html.includes('"1470:630"') && html.includes('"1280:720"') && html.includes('"1112:834"') && html.includes('"960:960"') && html.includes('"834:1112"') && html.includes('"720:1280"'));
t("les 6 ratios en 480p", html.includes('"992:432"') && html.includes('"854:480"') && html.includes('"752:560"') && html.includes('"640:640"') && html.includes('"560:752"') && html.includes('"480:854"'));
t("les 6 ratios en 1080p", html.includes('"2208:946"') && html.includes('"1920:1080"') && html.includes('"1664:1248"') && html.includes('"1440:1440"') && html.includes('"1248:1664"') && html.includes('"1080:1920"'));
t("durées de 4 à 30 s", html.includes("for (let i = 4; i <= 30; i++)"));
t("promptImage en TABLEAU (références multiples)", html.includes("promptImage: images"));
t("première image marquée position:first", html.includes('images[0].position = "first"'));
t("images limitées à 5 Mo (contrainte API)", html.includes("rwFichierEnDataUri(f, 5)"));
t("case audio pour le chant et le lip-sync", html.includes('id="sdAudio"') && html.includes("audio: document.getElementById(\"sdAudio\").checked"));
t("tarifs 20/30/68 crédits par seconde", html.includes('"480p": 20') && html.includes('"720p": 30') && html.includes('"1080p": 68'));
t("minimum 80 crédits par génération", html.includes("SD_CR_MIN = 80"));
t("au moins une image de référence exigée avant envoi", html.includes("Seedance a besoin d'au moins une image"));

console.log("  — Coût et robustesse —");
t("coût affiché AVANT génération sur les deux boutons", html.includes("alCredits() + \" crédits") && html.includes("sdCredits() + \" crédits"));
t("coût converti en dollars pour Papy", html.includes("/ 100).toFixed(2)"));
t("tarifs en constantes modifiables (jamais figés dans le texte)", html.includes("const AL_CR_S") && html.includes("const SD_CR_S"));
t("suivi SUBMIT → id → POLL → résultat", html.includes("async function rwAttendre"));
t("échec Runway affiché en clair (aucun échec silencieux)", html.includes("Runway a refusé la génération"));
t("délai dépassé signalé avec le dernier statut", html.includes("Runway n'a pas terminé en"));
t("journal technique sur les deux pages", html.includes('id="alJournal"') && html.includes('id="sdJournal"'));
t("en-tête X-Runway-Version NON géré côté client (rôle du Worker)", !html.includes("X-Runway-Version"));

console.log("\n═══ F · CHARGEMENT JSDOM (aucune erreur de syntaxe bloquante) ═══");
let domOk = true, domErr = "";
try {
  const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true,
    beforeParse(w) {
      w.fetch = () => new Promise(() => {});
      w.URL.createObjectURL = () => "blob:test";
      w.HTMLMediaElement.prototype.load = () => {};
      w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      w.navigator.serviceWorker || Object.defineProperty(w.navigator, "serviceWorker", { value: { register: () => Promise.resolve() } });
    } });
  const erreurs = [];
  dom.virtualConsole && dom.virtualConsole.on && dom.virtualConsole.on("jsdomError", e => erreurs.push(e));
  const d = dom.window.document;
  t("page chargée, <title> lu par le DOM = v41.38", d.title.includes("v41.38"));
  t("bouton maître du volet Décor (dvGo) présent dans le DOM", !!d.getElementById("dvGo"));
  t("zone bibliothèque de décors (dvBiblio) présente", !!d.getElementById("dvBiblio"));
  t("champ de description (dvPrompt) présent", !!d.getElementById("dvPrompt"));
  t("bouton créer le décor (dvCreerBtn) présent", !!d.getElementById("dvCreerBtn"));
  t("bloc d'alerte de format présent dans le DOM", !!d.getElementById("dvFormatAlerte"));
  t("zone admin présente dans le DOM", !!d.getElementById("adminZone"));
  t("boutons des deux moteurs Runway dans le DOM", !!d.getElementById("alGo") && !!d.getElementById("sdGo"));
  t("sélecteurs Seedance remplis par le script (6 ratios, 27 durées)", d.getElementById("sdRatio").options.length === 6 && d.getElementById("sdDuree").options.length === 27);
  t("coût Seedance affiché AVANT toute génération", /crédits Runway/.test(d.getElementById("sdCout").textContent));
  t("bouton Aleph désactivé tant qu'aucune vidéo n'est choisie", d.getElementById("alGo").disabled === true);
  t("localStorage protégé (l'app fonctionne en local, file://)", html.includes("function admLire") && html.includes("catch (e) { return null; }"));
  t("boutons de choix de format présents dans le DOM", !!d.getElementById("dvGarderFormat") && !!d.getElementById("dvConvertirBtn"));
  t("journal de diagnostic présent dans le DOM", !!d.getElementById("dvJournal") && !!d.getElementById("dvJournalCopier"));
  t("import d'image décor (dvImgInput) présent", !!d.getElementById("dvImgInput"));
} catch (e) { domOk = false; domErr = e.message; }
t("exécution des scripts sans erreur fatale", domOk || (console.log("    détail : " + domErr), false));

console.log("\n════════════════════════════════════════");
console.log(ko === 0
  ? `✅ ${n}/${n} vérifications AU VERT — zéro régression, v41.38 prête pour ton test local.`
  : `❌ ${ko} échec(s) sur ${n} — NE PAS DÉPLOYER.`);
process.exit(ko === 0 ? 0 : 1);
