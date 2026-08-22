/* ═══════════════════════════════════════════════════════════════════════
   StarClip v41.49 — TESTS SEEDANCE 2.5 (deux modes)
   Studio Rudis, Douala · 22 août 2026

   Ces tests ne se contentent pas de vérifier ce que le code produit : ils
   confrontent chaque payload au SPEC OPENAPI OFFICIEL DE RUNWAY
   (github.com/runwayml/openapi), celui qui engendre les SDK Node et Python
   de Runway. Un champ interdit, un champ manquant, une valeur hors énumération
   → le test échoue ici, gratuitement, au lieu d'échouer chez Runway en
   facturant la génération.

   Lancement :  node test-v41.49.js
   (le spec est téléchargé une fois dans runway-openapi.json, puis réutilisé)
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");

const SPEC = path.join(__dirname, "runway-openapi.json");
if (!fs.existsSync(SPEC)) {
  console.error("Spec absent. Récupère-le une fois :");
  console.error("  curl -sL -o runway-openapi.json https://raw.githubusercontent.com/runwayml/openapi/next/openapi.json");
  process.exit(1);
}
const spec = JSON.parse(fs.readFileSync(SPEC, "utf8"));

let ok = 0, ko = 0;
const T = (nom, cond, detail) => {
  if (cond) { ok++; console.log("  ✓ " + nom); }
  else { ko++; console.log("  ✗ " + nom + (detail ? "  → " + detail : "")); }
};

/* ─── Résolution des $ref du spec ─── */
function res(n, d = 0) {
  if (d > 14) return n;
  if (Array.isArray(n)) return n.map(x => res(x, d + 1));
  if (n && typeof n === "object") {
    if (n.$ref) {
      let t = spec;
      for (const k of n.$ref.split("/").slice(1)) t = t[k];
      return res(t, d + 1);
    }
    const o = {};
    for (const k of Object.keys(n)) o[k] = res(n[k], d + 1);
    return o;
  }
  return n;
}
function variante(chemin, modele) {
  const body = res(spec.paths[chemin].post.requestBody.content["application/json"].schema);
  const list = body.oneOf || body.anyOf || [body];
  const v = list.find(o => {
    const m = o.properties && o.properties.model;
    return m && (m.const === modele || (m.enum && m.enum.includes(modele)));
  });
  if (!v) throw new Error("variante " + modele + " introuvable sur " + chemin);
  return v;
}

const I2V = variante("/v1/image_to_video", "seedance2_5");
const V2V = variante("/v1/video_to_video", "seedance2_5");

/* ─── Validateur : champs autorisés, requis, énumérations, bornes ─── */
function valider(payload, schema) {
  const erreurs = [];
  const permis = Object.keys(schema.properties || {});
  for (const k of Object.keys(payload))
    if (!permis.includes(k)) erreurs.push("champ INTERDIT : " + k);
  for (const k of schema.required || [])
    if (!(k in payload)) erreurs.push("champ requis absent : " + k);
  for (const [k, v] of Object.entries(payload)) {
    const p = schema.properties[k];
    if (!p) continue;
    if (p.enum && !p.enum.includes(v)) erreurs.push(k + " hors énumération : " + JSON.stringify(v));
    if (p.const !== undefined && v !== p.const) erreurs.push(k + " doit valoir " + p.const);
    if (p.type === "integer") {
      if (!Number.isInteger(v)) erreurs.push(k + " doit être un entier");
      if (p.minimum !== undefined && v < p.minimum) erreurs.push(k + " < " + p.minimum);
      if (p.maximum !== undefined && v > p.maximum) erreurs.push(k + " > " + p.maximum);
    }
    if (p.type === "array") {
      if (!Array.isArray(v)) erreurs.push(k + " doit être un tableau");
      else {
        if (p.maxItems !== undefined && v.length > p.maxItems) erreurs.push(k + " : " + v.length + " éléments pour un maximum de " + p.maxItems);
        const it = p.items || {};
        for (const el of v) {
          for (const c of it.required || [])
            if (!(c in el)) erreurs.push(k + " : sous-champ requis absent « " + c + " »");
          for (const c of Object.keys(el))
            if (it.properties && !(c in it.properties)) erreurs.push(k + " : sous-champ INTERDIT « " + c + " »");
          if (it.properties && it.properties.type && it.properties.type.const !== undefined
              && el.type !== it.properties.type.const)
            erreurs.push(k + " : type doit valoir « " + it.properties.type.const + " »");
        }
      }
    }
  }
  // ─── Règle sémantique que le JSON Schema ne peut pas exprimer ───
  // Le spec la donne en toutes lettres dans la description de promptImage :
  // « Use position first/last for keyframe mode, or omit position for reference
  //   images. The two modes cannot be mixed. »
  // Structurellement, "position" est un sous-champ valide : un validateur de
  // schéma seul laisserait donc passer le bug de v41.47. Il faut la coder ici.
  if (Array.isArray(payload.promptImage)) {
    const avec = payload.promptImage.filter(i => "position" in i).length;
    if (avec > 0 && avec < payload.promptImage.length)
      erreurs.push("promptImage : mélange interdit — " + avec + " image(s) avec position, "
        + (payload.promptImage.length - avec) + " sans. C'est le bug de v41.47.");
  }
  return erreurs;
}

/* ═══ LES CONSTRUCTEURS, COPIE CONFORME DE index.html v41.49 ═══ */
function sdPayloadPhoto(o) {
  const p = {
    model: "seedance2_5",
    promptImage: (o.images || []).map(uri => ({ uri: uri })),
    ratio: o.ratio,
    duration: Number(o.duration),
    audio: !!o.audio,
  };
  if (o.promptText) p.promptText = o.promptText;
  if (o.audios && o.audios.length) p.referenceAudio = o.audios.map(uri => ({ type: "audio", uri: uri }));
  return p;
}
function sdPayloadVideo(o) {
  const p = {
    model: "seedance2_5",
    promptVideo: o.videoUri,
    mode: "reference",
    ratio: o.ratio,
    duration: Number(o.duration),
    audio: !!o.audio,
  };
  if (o.promptText) p.promptText = o.promptText;
  if (o.images && o.images.length) p.references = o.images.map(uri => ({ uri: uri }));
  if (o.videos && o.videos.length) p.referenceVideos = o.videos.map(uri => ({ type: "video", uri: uri }));
  if (o.audios && o.audios.length) p.referenceAudio = o.audios.map(uri => ({ type: "audio", uri: uri }));
  return p;
}

const U = n => "runway://media/" + n;

/* ═══════════════ 1 · MODE PHOTO → VIDÉO ═══════════════ */
console.log("\n1 · MODE PHOTO → VIDÉO  (POST /v1/image_to_video)");
{
  const p = sdPayloadPhoto({
    promptText: "the lead female singer performs on stage, cinematic wide shot",
    images: [U("a"), U("b"), U("c")], audios: [U("song")],
    ratio: "1280:720", duration: 5, audio: true,
  });
  const e = valider(p, I2V);
  T("payload complet conforme au spec officiel", e.length === 0, e.join(" | "));
  T("endpoint image_to_video, modèle seedance2_5", p.model === "seedance2_5");
  T("AUCUN champ position sur les images (mode références)",
    p.promptImage.every(i => !("position" in i)));
  T("AUCUN contentModeration (interdit sur seedance2_5)", !("contentModeration" in p));
  T("referenceAudio = [{type:'audio', uri}]",
    p.referenceAudio[0].type === "audio" && !!p.referenceAudio[0].uri);
  T("promptImage = [{uri}] sans autre clé",
    p.promptImage.every(i => Object.keys(i).join() === "uri"));
}
{
  const p = sdPayloadPhoto({ images: [U("a")], ratio: "1080:1920", duration: 30, audio: false });
  T("sans prompt ni audio de référence : toujours conforme", valider(p, I2V).length === 0);
  T("promptText omis quand vide (et non envoyé vide)", !("promptText" in p));
  T("referenceAudio omis quand aucun audio", !("referenceAudio" in p));
  T("audio:false transmis tel quel", p.audio === false);
}

/* ═══════════════ 2 · MODE VIDÉO + RÉFÉRENCES ═══════════════ */
console.log("\n2 · MODE VIDÉO + RÉFÉRENCES → VIDÉO  (POST /v1/video_to_video)");
{
  const p = sdPayloadVideo({
    promptText: "recreate the performance with the outfit from image 2",
    videoUri: U("source"), images: [U("a"), U("b")],
    videos: [U("v1")], audios: [U("song")],
    ratio: "1280:720", duration: 8, audio: true,
  });
  const e = valider(p, V2V);
  T("payload complet conforme au spec officiel", e.length === 0, e.join(" | "));
  T("la vidéo source s'appelle promptVideo", "promptVideo" in p);
  T("videoUri (champ d'Aleph) ABSENT", !("videoUri" in p));
  T("mode vaut exactement « reference »", p.mode === "reference");
  T("references = [{uri}] SANS type:'image'",
    p.references.every(r => Object.keys(r).join() === "uri"));
  T("referenceVideos = [{type:'video', uri}]", p.referenceVideos[0].type === "video");
  T("referenceAudio = [{type:'audio', uri}]", p.referenceAudio[0].type === "audio");
  T("AUCUN contentModeration", !("contentModeration" in p));
  T("AUCUN keyframes (champ d'Aleph)", !("keyframes" in p));
}
{
  const p = sdPayloadVideo({ videoUri: U("s"), ratio: "854:480", duration: 4, audio: true });
  T("vidéo seule, sans aucune référence : conforme", valider(p, V2V).length === 0);
  T("references / referenceVideos / referenceAudio omis si vides",
    !("references" in p) && !("referenceVideos" in p) && !("referenceAudio" in p));
}

/* ═══════════════ 3 · LES BUGS DE v41.47 SONT BIEN DÉTECTÉS ═══════════════ */
console.log("\n3 · CONTRÔLE INVERSE — le validateur attrape les fautes de v41.47");
{
  const v47 = sdPayloadPhoto({ promptText: "x", images: [U("a")], ratio: "1280:720", duration: 5, audio: true });
  v47.contentModeration = { publicFigureThreshold: "low" };
  T("contentModeration est bien rejeté", valider(v47, I2V).some(x => x.includes("contentModeration")));

  // Le bug exact de v41.47 : trois images, position seulement sur la première.
  const pos = sdPayloadPhoto({ images: [U("a"), U("b"), U("c")], ratio: "1280:720", duration: 5, audio: true });
  pos.promptImage[0].position = "first";
  T("le mélange image-clé / références de v41.47 est bien rejeté",
    valider(pos, I2V).some(x => x.includes("mélange interdit")));
  // À l'inverse, un vrai mode image-clé (toutes positionnées) reste légal :
  // le validateur ne doit pas devenir bêtement restrictif.
  const kf = sdPayloadPhoto({ images: [U("a"), U("b")], ratio: "1280:720", duration: 5, audio: true });
  kf.promptImage[0].position = "first"; kf.promptImage[1].position = "last";
  T("un mode image-clé cohérent reste accepté", valider(kf, I2V).length === 0);

  const mauvaisRatio = sdPayloadPhoto({ images: [U("a")], ratio: "2208:946", duration: 5, audio: true });
  T("l'ancien ratio 2208:946 est bien rejeté", valider(mauvaisRatio, I2V).some(x => x.includes("ratio")));

  const typeImage = sdPayloadVideo({ videoUri: U("s"), images: [U("a")], ratio: "1280:720", duration: 5, audio: true });
  typeImage.references[0].type = "image";
  T("type:'image' dans references est bien rejeté", valider(typeImage, V2V).some(x => x.includes("references")));

  const vieuxChamp = sdPayloadVideo({ videoUri: U("s"), ratio: "1280:720", duration: 5, audio: true });
  delete vieuxChamp.promptVideo; vieuxChamp.videoUri = U("s");
  T("videoUri est bien rejeté sur seedance2_5", valider(vieuxChamp, V2V).some(x => x.includes("videoUri")));
}

/* ═══════════════ 4 · RATIOS ET RÉSOLUTIONS ═══════════════ */
console.log("\n4 · RATIOS — les 18 valeurs de l'app contre celles du spec");
{
  const SD_RATIOS = {
    "480p":  { "21:9": "992:432",   "16:9": "854:480",   "4:3": "752:560",   "1:1": "640:640",   "3:4": "560:752",   "9:16": "480:854"  },
    "720p":  { "21:9": "1470:630",  "16:9": "1280:720",  "4:3": "1112:834",  "1:1": "960:960",   "3:4": "834:1112",  "9:16": "720:1280" },
    "1080p": { "21:9": "2206:946",  "16:9": "1920:1080", "4:3": "1664:1248", "1:1": "1440:1440", "3:4": "1248:1664", "9:16": "1080:1920" },
  };
  const tous = Object.values(SD_RATIOS).flatMap(r => Object.values(r));
  T("les 18 ratios de l'app sont acceptés en Photo",
    tous.every(r => I2V.properties.ratio.enum.includes(r)),
    tous.filter(r => !I2V.properties.ratio.enum.includes(r)).join(","));
  T("les 18 ratios de l'app sont acceptés en Vidéo",
    tous.every(r => V2V.properties.ratio.enum.includes(r)),
    tous.filter(r => !V2V.properties.ratio.enum.includes(r)).join(","));
  T("1080p disponible dans les DEUX modes (spec identique)",
    I2V.properties.ratio.enum.includes("1920:1080") && V2V.properties.ratio.enum.includes("1920:1080"));
  T("2206:946 est la bonne valeur du 21:9 en 1080p",
    I2V.properties.ratio.enum.includes("2206:946") && !I2V.properties.ratio.enum.includes("2208:946"));
}

/* ═══════════════ 5 · DURÉE, LIMITES, CRÉDITS ═══════════════ */
console.log("\n5 · DURÉES, LIMITES ET CRÉDITS");
{
  T("durée bornée à 4–30 s en Photo", I2V.properties.duration.minimum === 4 && I2V.properties.duration.maximum === 30);
  T("durée bornée à 4–30 s en Vidéo", V2V.properties.duration.minimum === 4 && V2V.properties.duration.maximum === 30);
  T("promptText accepte 15000 caractères (et non 1000)", I2V.properties.promptText.maxLength === 15000
    && V2V.properties.promptText.maxLength === 15000);
  T("jusqu'à 30 images de référence en Vidéo", V2V.properties.references.maxItems === 30);
  T("jusqu'à 9 vidéos de référence", V2V.properties.referenceVideos.maxItems === 9);
  T("jusqu'à 10 audios de référence dans les deux modes",
    V2V.properties.referenceAudio.maxItems === 10 && I2V.properties.referenceAudio.maxItems === 10);
  T("mode accepte reference et extend", V2V.properties.mode.enum.join() === "reference,extend");

  const SD_CR_S = { "480p": 20, "720p": 30, "1080p": 68 };
  const SD_CR_REF = { "480p": 10, "720p": 15, "1080p": 34 };
  const credits = (res, duree, secVideo) =>
    Math.max(80, duree * SD_CR_S[res] + Math.ceil(secVideo * SD_CR_REF[res]));
  T("Photo 720p 5 s = 150 crédits", credits("720p", 5, 0) === 150);
  T("Photo 480p 4 s = 80 crédits (le minimum s'applique)", credits("480p", 4, 0) === 80);
  T("Photo 1080p 10 s = 680 crédits", credits("1080p", 10, 0) === 680);
  T("Vidéo 720p 5 s + 4 s de source = 210 crédits", credits("720p", 5, 4) === 150 + 60);
  T("Vidéo 1080p 8 s + 6 s de source = 748 crédits", credits("1080p", 8, 6) === 544 + 204);
  T("les secondes fractionnaires sont arrondies au crédit supérieur",
    credits("720p", 5, 4.3) === 150 + Math.ceil(4.3 * 15));
}

/* ═══════════════ 6 · LE CODE LIVRÉ CORRESPOND AUX TESTS ═══════════════ */
console.log("\n6 · COHÉRENCE AVEC index.html LIVRÉ");
{
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const attendu = [
    ['version v41.49 en pied de page', "· v41.49"],
    ['ratio corrigé 2206:946', '"2206:946"'],
    ["l'ancien 2208:946 a disparu", null, '"2208:946"'],
    ["aucun contentModeration dans le bloc Seedance", null, 'contentModeration: { publicFigureThreshold: "low" },   // v41.45 : voir Aleph'],
    ["plus de position:'first' forcée", null, 'images[0].position = "first"'],
    ["constructeur sdPayloadPhoto présent", "function sdPayloadPhoto("],
    ["constructeur sdPayloadVideo présent", "function sdPayloadVideo("],
    ["promptVideo utilisé", "promptVideo: o.videoUri"],
    ['mode: "reference" présent', 'mode: "reference"'],
    ["endpoint video_to_video appelé", 'rwSubmit(sdMode === "video" ? "video_to_video" : "image_to_video"'],
    ["limite Seedance à 15000", "SD_PROMPT_MAX = 15000"],
    ["surtaxe vidéo de référence codée", "SD_CR_REF"],
    ["deux boutons de mode dans la page", 'data-mode="video"'],
    ["audio de référence dans l'interface", 'id="sdAudBtn"'],
  ];
  for (const [nom, doit, nedoitpas] of attendu) {
    if (doit) T(nom, html.includes(doit));
    else T(nom, !html.includes(nedoitpas), "encore présent");
  }
  // Aleph ne doit pas avoir bougé.
  T("Aleph conserve videoUri", html.includes("videoUri: videoUri"));
  T("Aleph conserve keyframes", html.includes("payload.keyframes = []"));
  T("Aleph conserve son contentModeration (il y a droit)",
    html.includes('model: "aleph2"') && html.includes('contentModeration: { publicFigureThreshold: "low" }'));
  T("le garde-fou noms propres est toujours appelé pour Seedance",
    html.includes('rwVerifierPrompt(document.getElementById("sdPrompt").value)'));
}

console.log("\n" + "═".repeat(58));
console.log(ko === 0 ? "✅ " + ok + " vérifications AU VERT." : "❌ " + ko + " ÉCHEC(S) sur " + (ok + ko) + ".");
console.log("═".repeat(58) + "\n");
process.exit(ko === 0 ? 0 : 1);
