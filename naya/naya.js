// v41.156 : NAYA, l'assistante StarClip, dans l'application cliente.
// Tout se passe dans le navigateur : aucun serveur, aucune IA payante, aucun appel réseau autre que le
// chargement de sa base (le manuel StarClip vérifié, en FR / EN / DE). Les prix sont lus dans l'app elle-même
// (PM_MOTEURS, onglet 💳 Commander) : Naya n'invente jamais un chiffre. Elle ne lance JAMAIS une génération,
// ne touche à aucun solde, et ne parle jamais des fonctions Admin. Une demande d'offre est préparée ici,
// puis c'est le client qui l'envoie lui-même sur le WhatsApp officiel de StarClip.
(function () {
  "use strict";
  var ACTIVES = ["fr", "en", "de"];
  var BIENTOT = { es: "Español", pt: "Português", ar: "العربية" };
  var NIVEAUX = ["debutant", "pro"];
  var LS = { lg: "starclip_naya_lg", niv: "starclip_naya_niveau", hist: "starclip_naya_hist", dem: "starclip_naya_demandes" };
  var lire = function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (_) { return d; } };
  var ecrire = function (k, v) { try { localStorage.setItem(k, v); } catch (_) {} };
  var navLg = String((navigator.language || "fr")).slice(0, 2).toLowerCase();
  var etat = {
    lg: ACTIVES.indexOf(lire(LS.lg, "")) >= 0 ? lire(LS.lg, "") : (ACTIVES.indexOf(navLg) >= 0 ? navLg : "fr"),
    niveau: NIVEAUX.indexOf(lire(LS.niv, "")) >= 0 ? lire(LS.niv, "") : "debutant",
    ouvert: false
  };

  // ───────────── Textes de Naya (FR = référence ; EN et DE relus) ─────────────
  var T = {
    titre: { fr: "Naya · ton assistante", en: "Naya · your assistant", de: "Naya · Ihre Assistentin" },
    bouton: { fr: "Naya", en: "Naya", de: "Naya" },
    placeholder: { fr: "Pose ta question à Naya…", en: "Ask Naya a question…", de: "Stellen Sie Naya eine Frage…" },
    envoyer: { fr: "Envoyer", en: "Send", de: "Senden" },
    fermer: { fr: "Fermer", en: "Close", de: "Schließen" },
    debutant: { fr: "Débutant", en: "Beginner", de: "Einsteiger" },
    pro: { fr: "Pro", en: "Pro", de: "Profi" },
    effacer: { fr: "Effacer la conversation", en: "Clear conversation", de: "Gespräch löschen" },
    bientot: { fr: "bientôt", en: "soon", de: "bald" },
    ecouter: { fr: "Écouter", en: "Listen", de: "Anhören" },
    confid: { fr: "Naya répond à partir du manuel StarClip. Ta conversation reste sur ton appareil : rien n'est envoyé.", en: "Naya answers from the StarClip manual. Your conversation stays on your device: nothing is sent.", de: "Naya antwortet anhand des StarClip-Handbuchs. Ihr Gespräch bleibt auf Ihrem Gerät: Nichts wird gesendet." },
    bienvenue: { fr: "Bonjour, je suis Naya 👋 Je t'explique chaque outil de StarClip, je t'aide à écrire tes prompts, je te donne les prix affichés dans l'app et je prépare ta demande de devis pour Studio Rudis. Je ne lance jamais rien à ta place.", en: "Hello, I'm Naya 👋 I explain every StarClip tool, help you write your prompts, give you the prices shown in the app and prepare your quote request for Studio Rudis. I never start anything for you.", de: "Hallo, ich bin Naya 👋 Ich erkläre Ihnen jedes StarClip-Werkzeug, helfe beim Schreiben Ihrer Prompts, nenne die in der App angezeigten Preise und bereite Ihre Angebotsanfrage für Studio Rudis vor. Ich starte nie etwas an Ihrer Stelle." },
    q_quoi: { fr: "Que puis-je faire ici ?", en: "What can I do here?", de: "Was kann ich hier machen?" },
    q_chanson: { fr: "Combien coûte une Chanson Pro ?", en: "How much is a Chanson Pro?", de: "Was kostet ein Chanson Pro?" },
    q_prompt: { fr: "Aide-moi pour un prompt makossa", en: "Help me with a makossa prompt", de: "Hilf mir mit einem Makossa-Prompt" },
    q_clip: { fr: "Je veux un clip réalisé par le studio", en: "I want a music video made by the studio", de: "Ich möchte ein Musikvideo vom Studio" },
    q_payer: { fr: "Comment payer ?", en: "How do I pay?", de: "Wie bezahle ich?" },
    capacites: { fr: "Voici ce que je fais pour toi :\n• expliquer chaque onglet et chaque moteur (vidéo, chanson, lip-sync, stems…) ;\n• te proposer des prompts par genre musical et vérifier les tiens ;\n• te donner les prix exacts affichés dans l'app, avant que tu lances ;\n• préparer ta demande de devis pour un clip réalisé par Studio Rudis.\nJe ne lance aucune génération et je ne touche jamais à ton solde.", en: "Here is what I do for you:\n• explain every tab and every engine (video, song, lip-sync, stems…);\n• suggest prompts by music genre and check yours;\n• give you the exact prices shown in the app, before you start;\n• prepare your quote request for a video made by Studio Rudis.\nI never start a generation and never touch your balance.", de: "Das mache ich für Sie:\n• jeden Tab und jedes Modell erklären (Video, Song, Lip-Sync, Stems…);\n• Prompts nach Musikgenre vorschlagen und Ihre prüfen;\n• die genauen Preise aus der App nennen, bevor Sie starten;\n• Ihre Angebotsanfrage für ein Video von Studio Rudis vorbereiten.\nIch starte keine Generierung und verändere nie Ihr Guthaben." },
    admin: { fr: "Je ne peux pas t'aider sur ce point : cette partie est réservée au studio, et je ne donne jamais d'accès, de code ni de détail technique. Si tu as besoin d'une fonction Studio, Studio Rudis peut réaliser ton projet.", en: "I can't help with that: this part is reserved for the studio, and I never give access, codes or technical details. If you need a Studio feature, Studio Rudis can produce your project.", de: "Dabei kann ich nicht helfen: Dieser Bereich ist dem Studio vorbehalten, und ich gebe niemals Zugänge, Codes oder technische Details weiter. Wenn Sie eine Studio-Funktion brauchen, kann Studio Rudis Ihr Projekt umsetzen." },
    inconnu: { fr: "Je ne trouve pas cette fonction dans le manuel StarClip, et je préfère ne pas inventer. Dis-moi ce que tu veux obtenir (vidéo, chanson, photo…) et je te montre l'outil qui s'en rapproche le plus ; sinon, l'équipe te répond sur WhatsApp.", en: "I can't find this feature in the StarClip manual, and I'd rather not make anything up. Tell me what you want to achieve (video, song, photo…) and I'll show you the closest tool; otherwise, the team will answer you on WhatsApp.", de: "Ich finde diese Funktion nicht im StarClip-Handbuch und möchte nichts erfinden. Sagen Sie mir, was Sie erreichen möchten (Video, Song, Foto…), und ich zeige Ihnen das passendste Werkzeug; andernfalls antwortet Ihnen das Team per WhatsApp." },
    manuel: { fr: "D'après le manuel", en: "According to the manual", de: "Laut Handbuch" },
    pasapas: { fr: "Pas à pas", en: "Step by step", de: "Schritt für Schritt" },
    lancer: { fr: "Je ne lance jamais moi-même une génération payante. Vérifie le prix affiché, puis touche toi-même le bouton de lancement quand tu es prêt(e).", en: "I never start a paid generation myself. Check the price shown, then tap the start button yourself when you're ready.", de: "Ich starte nie selbst eine kostenpflichtige Generierung. Prüfen Sie den angezeigten Preis und tippen Sie selbst auf Start, wenn Sie bereit sind." },
    abonnement: { fr: "Aucun abonnement n'est nécessaire : tu paies à l'unité, avec un code StarClip ou un solde Premium que tu recharges.", en: "No subscription is required: you pay per use, with a StarClip code or a Premium balance you top up.", de: "Kein Abonnement nötig: Sie zahlen pro Nutzung, mit einem StarClip-Code oder einem aufladbaren Premium-Guthaben." },
    paiement: { fr: "Pour payer : envoie le montant par Orange Money ou MTN Mobile Money aux numéros affichés dans l'onglet 💳 Commander, puis envoie ta capture sur WhatsApp. Tu reçois ton CODE StarClip sur WhatsApp. Pas de carte bancaire pour l'instant.", en: "To pay: send the amount by Orange Money or MTN Mobile Money to the numbers shown in the 💳 Commander tab, then send your screenshot on WhatsApp. You receive your StarClip CODE on WhatsApp. No card payment for now.", de: "So bezahlen Sie: Senden Sie den Betrag per Orange Money oder MTN Mobile Money an die im Tab 💳 Commander angezeigten Nummern und schicken Sie dann Ihren Screenshot per WhatsApp. Sie erhalten Ihren StarClip-CODE per WhatsApp. Kartenzahlung ist vorerst nicht möglich." },
    packs: { fr: "Packs affichés dans l'app", en: "Packs shown in the app", de: "In der App angezeigte Pakete" },
    signature: { fr: "Clips réalisés par Studio Rudis", en: "Videos made by Studio Rudis", de: "Videos von Studio Rudis" },
    prix_moteur: { fr: "Prix affiché dans l'app pour {m}", en: "Price shown in the app for {m}", de: "In der App angezeigter Preis für {m}" },
    debite: { fr: "Débité seulement quand tu appuies toi-même sur le bouton de création.", en: "Charged only when you tap the create button yourself.", de: "Abgebucht erst, wenn Sie selbst auf Erstellen tippen." },
    prix_absent: { fr: "Je ne trouve pas ce prix dans l'app : ouvre l'onglet concerné, le prix exact s'y affiche avant tout lancement.", en: "I can't find this price in the app: open the tab concerned, the exact price is shown there before anything starts.", de: "Ich finde diesen Preis nicht in der App: Öffnen Sie den betreffenden Tab, dort wird der genaue Preis vor jedem Start angezeigt." },
    reprise: { fr: "Améliorer ma démo en mode Reprise : 999 FCFA.", en: "Améliorer ma démo in Reprise mode: 999 FCFA.", de: "Améliorer ma démo im Reprise-Modus: 999 FCFA." },
    resume_prix: { fr: "Quelques prix affichés dans l'app (outils Premium, payés sur ton solde) :", en: "Some prices shown in the app (Premium tools, paid from your balance):", de: "Einige Preise aus der App (Premium-Werkzeuge, vom Guthaben bezahlt):" },
    ouvrir: { fr: "Ouvrir", en: "Open", de: "Öffnen" },
    ouvrir_cmd: { fr: "Ouvrir 💳 Commander", en: "Open 💳 Commander", de: "💳 Commander öffnen" },
    genre_titre: { fr: "Exemples de prompt", en: "Prompt examples", de: "Prompt-Beispiele" },
    ex_fr: { fr: "", en: "(examples written in French: the engine understands them)", de: "(Beispiele auf Französisch: Das Modell versteht sie)" },
    debutant_ex: { fr: "Débutant", en: "Beginner", de: "Einsteiger" },
    pro_ex: { fr: "Pro", en: "Pro", de: "Profi" },
    charger: { fr: "Charger", en: "Load", de: "Laden" },
    avec_paroles: { fr: "🎤 Avec paroles", en: "🎤 With lyrics", de: "🎤 Mit Text" },
    instrumental: { fr: "🎹 Instrumental", en: "🎹 Instrumental", de: "🎹 Instrumental" },
    charger_titre: { fr: "Charger un exemple dans Chanson Pro (rien n'est lancé) :", en: "Load an example into Chanson Pro (nothing starts):", de: "Ein Beispiel in Chanson Pro laden (nichts wird gestartet):" },
    charge_ok: { fr: "C'est chargé dans Chanson Pro. Modifie-le librement : rien n'est lancé, le prix s'affiche sous le formulaire.", en: "Loaded into Chanson Pro. Edit it freely: nothing has started, the price is shown below the form.", de: "In Chanson Pro geladen. Ändern Sie es frei: Nichts wurde gestartet, der Preis steht unter dem Formular." },
    charge_ko: { fr: "Je n'ai pas pu ouvrir Chanson Pro ici. Ouvre l'onglet 👑 Admin Premium 5.0, puis ⭐ Chanson Pro, choisis le genre et touche « ✨ Essayer un prompt exemple ».", en: "I couldn't open Chanson Pro here. Open the 👑 Admin Premium 5.0 tab, then ⭐ Chanson Pro, choose the genre and tap « ✨ Essayer un prompt exemple ».", de: "Ich konnte Chanson Pro hier nicht öffnen. Öffnen Sie den Tab 👑 Admin Premium 5.0, dann ⭐ Chanson Pro, wählen Sie das Genre und tippen Sie auf « ✨ Essayer un prompt exemple »." },
    genres_dispo: { fr: "Dis-moi le genre voulu, je te donne un exemple. Genres disponibles : ", en: "Tell me the genre you want and I'll give you an example. Available genres: ", de: "Nennen Sie mir das gewünschte Genre, ich gebe Ihnen ein Beispiel. Verfügbare Genres: " },
    auth: { fr: "Le nom du genre ne garantit pas le résultat : écoute toujours ta chanson avant de la publier.", en: "The genre name does not guarantee the result: always listen to your song before publishing it.", de: "Der Genrename garantiert das Ergebnis nicht: Hören Sie Ihren Song immer an, bevor Sie ihn veröffentlichen." },
    verif_titre: { fr: "Vérification de ton prompt", en: "Checking your prompt", de: "Prüfung Ihres Prompts" },
    verif_bon: { fr: "Ça semble bon. Vérifie le prix affiché, puis lance toi-même.", en: "Looks good. Check the price shown, then start it yourself.", de: "Sieht gut aus. Prüfen Sie den angezeigten Preis und starten Sie selbst." },
    verif_aide: { fr: "Pour que je vérifie ton prompt, écris « vérifie : » suivi de ton texte.", en: "For me to check your prompt, write « check: » followed by your text.", de: "Damit ich Ihren Prompt prüfe, schreiben Sie « prüfe: » und dann Ihren Text." },
    dev_intro: { fr: "Studio Rudis réalise ton clip de A à Z : scénario, vidéos IA, montage, synchronisation et révisions. Je prépare ta demande ; c'est toi qui l'envoies sur WhatsApp.", en: "Studio Rudis produces your video from A to Z: script, AI videos, editing, sync and revisions. I prepare your request; you send it yourself on WhatsApp.", de: "Studio Rudis produziert Ihr Video von A bis Z: Drehbuch, KI-Videos, Schnitt, Synchronisierung und Korrekturen. Ich bereite Ihre Anfrage vor; Sie senden sie selbst per WhatsApp." },
    dev_offre: { fr: "Offre", en: "Offer", de: "Angebot" },
    dev_nsp: { fr: "Je ne sais pas encore", en: "Not sure yet", de: "Noch unsicher" },
    dev_nom: { fr: "Ton nom ou nom d'artiste", en: "Your name or artist name", de: "Ihr Name oder Künstlername" },
    dev_titre: { fr: "Titre et durée de la chanson", en: "Song title and length", de: "Songtitel und Länge" },
    dev_date: { fr: "Date souhaitée (indicative)", en: "Preferred date (indicative)", de: "Wunschtermin (unverbindlich)" },
    dev_idee: { fr: "Ton idée en quelques mots", en: "Your idea in a few words", de: "Ihre Idee in wenigen Worten" },
    dev_preparer: { fr: "Préparer ma demande", en: "Prepare my request", de: "Anfrage vorbereiten" },
    dev_pret: { fr: "Ta demande est prête. Relis-la, puis envoie-la toi-même : WhatsApp s'ouvre avec le texte, rien ne part sans ton geste.", en: "Your request is ready. Read it, then send it yourself: WhatsApp opens with the text, nothing is sent without you.", de: "Ihre Anfrage ist fertig. Lesen Sie sie und senden Sie sie selbst: WhatsApp öffnet sich mit dem Text, nichts wird ohne Sie gesendet." },
    dev_envoyer: { fr: "Envoyer moi-même sur WhatsApp", en: "Send it myself on WhatsApp", de: "Selbst per WhatsApp senden" },
    dev_copier: { fr: "Copier le texte", en: "Copy the text", de: "Text kopieren" },
    copie: { fr: "Copié ✓", en: "Copied ✓", de: "Kopiert ✓" },
    dev_prix: { fr: "Prix affiché dans l'app : {p}. Le devis final, l'acompte et le délai sont confirmés par Studio Rudis ; aucun délai n'est garanti avant cette confirmation.", en: "Price shown in the app: {p}. The final quote, deposit and timing are confirmed by Studio Rudis; no deadline is guaranteed before that confirmation.", de: "In der App angezeigter Preis: {p}. Endgültiges Angebot, Anzahlung und Termin bestätigt Studio Rudis; vor dieser Bestätigung ist kein Termin garantiert." },
    dev_wa_absent: { fr: "Je ne trouve pas le lien WhatsApp officiel dans l'app : copie le texte et envoie-le depuis l'onglet 💳 Commander.", en: "I can't find the official WhatsApp link in the app: copy the text and send it from the 💳 Commander tab.", de: "Ich finde den offiziellen WhatsApp-Link nicht in der App: Kopieren Sie den Text und senden Sie ihn über den Tab 💳 Commander." },
    essai_fini: { fr: "La période de test de StarClip est terminée : il n'y a plus de code d'essai. Pour commencer :\n1. choisis ton pack dans l'onglet 💳 Commander ;\n2. paie par Orange Money ou MTN Mobile Money ;\n3. envoie la capture sur WhatsApp ;\n4. entre le code reçu en haut de l'app et touche OK. Ce code est ton compte : il garde tes crédits.", en: "The StarClip test period is over: there are no more trial codes. To get started:\n1. choose your pack in the 💳 Commander tab;\n2. pay with Orange Money or MTN Mobile Money;\n3. send the screenshot on WhatsApp;\n4. enter the code you receive at the top of the app and tap OK. This code is your account: it keeps your credits.", de: "Die Testphase von StarClip ist beendet: Es gibt keine Testcodes mehr. So fangen Sie an:\n1. Wählen Sie Ihr Paket im Tab 💳 Commander;\n2. bezahlen Sie mit Orange Money oder MTN Mobile Money;\n3. senden Sie den Screenshot per WhatsApp;\n4. geben Sie den erhaltenen Code oben in der App ein und tippen Sie auf OK. Dieser Code ist Ihr Konto: Er speichert Ihr Guthaben." },
    langue_auto: { fr: "Je passe en français.", en: "Switching to English.", de: "Ich wechsle zu Deutsch." },
    voix_melanie: { fr: "🎙️ Voix de Naya : {n}", en: "🎙️ Naya's voice: {n}", de: "🎙️ Nayas Stimme: {n}" },
    voix_secours: { fr: "Voix de secours de ton appareil ({n}) : la voix de Naya n'est pas disponible pour le moment.", en: "Backup voice from your device ({n}): Naya's voice is not available right now.", de: "Ersatzstimme Ihres Geräts ({n}): Nayas Stimme ist gerade nicht verfügbar." },
    voix_aucune: { fr: "La voix n'est pas disponible pour le moment sur cet appareil : la réponse reste écrite.", en: "The voice is not available on this device right now: the answer stays in writing.", de: "Die Stimme ist auf diesem Gerät gerade nicht verfügbar: Die Antwort bleibt schriftlich." },
    voix_indispo: { fr: "La voix de Naya (Mélanie) n'est pas disponible pour le moment : la réponse reste écrite.", en: "Naya's voice (Lara) is not available right now: the answer stays in writing.", de: "Nayas Stimme (Lea) ist gerade nicht verfügbar: Die Antwort bleibt schriftlich." },
    voix_langue: { fr: "La voix de Naya n'est pas disponible pour cette réponse : elle reste écrite.", en: "Naya's voice is not available for this answer: it stays in writing.", de: "Nayas Stimme ist für diese Antwort nicht verfügbar: Sie bleibt schriftlich." },
    voix_touche: { fr: "Touche encore « Écouter » pour lancer la lecture.", en: "Tap « Listen » again to start playback.", de: "Tippen Sie erneut auf « Anhören », um die Wiedergabe zu starten." },
    environ: { fr: "environ ", en: "about ", de: "etwa " }
  };
  // Langues pas encore prises en charge : une seule phrase, écrite à l'avance, puis réponse en français ou en anglais.
  var PAS_ENCORE = {
    es: "Todavía no hablo español en StarClip: te respondo en {l}. Puedes elegir English o Deutsch arriba.",
    pt: "Ainda não falo português no StarClip: respondo em {l}. Pode escolher English ou Deutsch acima.",
    ar: "لا أتحدث العربية بعد في StarClip، سأجيبك بـ{l}. يمكنك اختيار English أو Deutsch في الأعلى."
  };
  var NOM_LG = { fr: "français", en: "English", de: "Deutsch" };
  var t = function (cle, vars) {
    var e = T[cle]; var s = (e && (e[etat.lg] || e.fr)) || "";
    return vars ? s.replace(/\{(\w+)\}/g, function (_, k) { return k in vars ? vars[k] : ""; }) : s;
  };

  // ───────────── Base de connaissances (chargée à la première ouverture) ─────────────
  var srcNaya = (document.currentScript && document.currentScript.src) || "naya/naya.js";
  var dossier = srcNaya.replace(/[^\/]*$/, ""), version = (srcNaya.match(/\?.*$/) || [""])[0];
  var KB = {}, chargements = {};
  function chargerKB(lg) {
    if (KB[lg]) return Promise.resolve(KB[lg]);
    if (chargements[lg]) return chargements[lg];
    chargements[lg] = new Promise(function (ok, ko) {
      var s = document.createElement("script");
      s.src = dossier + "naya-kb-" + lg + ".js" + version;
      s.onload = function () {
        var k = window.NAYA_KB && window.NAYA_KB[lg];
        if (!k) return ko(new Error("base absente"));
        k.docs = k.sections.map(function (x) { var c = plier(x.x); return { s: x, corps: c, titre: plier(x.t), plein: plier(x.t + " " + x.x), long: mots(x.x).length || 1 }; });
        k.moy = k.docs.reduce(function (a, d) { return a + d.long; }, 0) / k.docs.length;
        KB[lg] = k; ok(k);
      };
      s.onerror = function () { chargements[lg] = null; ko(new Error("chargement impossible")); };
      document.head.appendChild(s);
    });
    return chargements[lg];
  }

  // ───────────── Recherche dans le manuel (portage fidèle de la formatrice de Naya) ─────────────
  function plier(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss"); }
  var VIDES = {}; "le la les un une des de du et ou a au aux en dans pour sur avec que qui quoi comment est ce ces mon ma mes ton ta tes je tu il elle on the a an of to in on for with and or is how what my your i do does der die das ein eine und oder ist wie was mit fur zu im ich sie es".split(" ").forEach(function (m) { VIDES[m] = 1; });
  function mots(s) { return plier(s).split(/[^a-z0-9]+/).filter(function (m) { return m.length > 1 && !VIDES[m]; }); }
  var SYN = { prix: ["cout", "couts", "fcfa"], combien: ["cout", "couts"], price: ["cost", "costs", "fcfa"], much: ["cost", "costs"], preis: ["kosten", "fcfa"], kostet: ["kosten"], decor: ["decor", "kulisse", "setting"], voix: ["voix", "vocals"], vocals: ["stems"], gesang: ["stems"], download: ["telecharger"], herunterladen: ["telecharger"], erreur: ["depannage", "refus"], error: ["troubleshooting", "refusal"], fehler: ["fehlerbehebung", "ablehnung"] };
  var GEN = {}; ("starclip naya app application appli video videos photo photos image mode modus fonction function funktion comment faire utiliser marche fonctionne activer est quoi peux puis veux dois mon ma mes ton ta tes avec dans pour une des les sur how can could use does work make want need what where why the and with into your for this that sert servent servir sers faut wie kann konnen machen nutzen meinen meinem meiner gebe geben benutzen funktioniert warum was wo ich mein meine mit einen eine der die das und fur").split(" ").forEach(function (m) { GEN[m] = 1; });
  function termes(q) { var vu = {}; return plier(q).split(/[^a-z0-9]+/).filter(function (m) { if (m.length <= 2 || GEN[m] || vu[m]) return false; vu[m] = 1; return true; }); }
  var racine = function (x) { return x.slice(0, Math.min(5, x.length)); };
  var SEUIL = 4, COUV_MIN = 0.6, RUBRIQUES = { debutant: [5, 3, 1], pro: [6, 7, 3] };

  function bm25(k, q, chapitre) {
    var base = mots(q), vu = {}, tt = [];
    base.forEach(function (x) { [x].concat(SYN[x] || []).forEach(function (y) { if (!vu[y]) { vu[y] = 1; tt.push(y); } }); });
    var N = k.docs.length, df = {};
    tt.forEach(function (x) { df[x] = k.docs.filter(function (d) { return d.corps.indexOf(x) >= 0; }).length; });
    var out = {};
    k.docs.forEach(function (d) {
      var sc = 0;
      tt.forEach(function (x) {
        var tf = d.corps.split(x).length - 1; if (!tf) return;
        var idf = Math.log(1 + (N - df[x] + 0.5) / (df[x] + 0.5));
        sc += idf * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * d.long / k.moy)) * (base.indexOf(x) >= 0 ? 1 : 0.6);
        if (d.titre.indexOf(x) >= 0) sc += idf;
      });
      if (sc && chapitre && d.s.c === chapitre) sc *= 1.5;
      out[d.s.c + "#" + d.s.r] = sc;
    });
    return out;
  }
  function chercherManuel(k, q, chapitre) {
    var tt = termes(q); if (!tt.length) return null;
    var sc = bm25(k, tt.map(racine).join(" "), chapitre);
    var cl = k.docs.filter(function (d) { return d.s.c !== "fonctionsReservees"; }).map(function (d) {
      var c = tt.filter(function (x) { return d.plein.indexOf(racine(x)) >= 0; }).length / tt.length;
      return { d: d, couv: c, score: sc[d.s.c + "#" + d.s.r] || 0 };
    }).sort(function (a, b) { return b.couv - a.couv || b.score - a.score; });
    var best = cl[0];
    if (!best || best.couv < COUV_MIN || (best.score < SEUIL && best.couv < 1)) return null;
    var ss = k.sections.filter(function (s) { return s.c === best.d.s.c; });
    var prefs = RUBRIQUES[etat.niveau] || RUBRIQUES.debutant, choisie = null;
    for (var i = 0; i < prefs.length && !choisie; i++) choisie = ss.filter(function (s) { return s.r === prefs[i]; })[0] || null;
    choisie = choisie || best.d.s;
    return { chapitre: best.d.s.c, titre: best.d.s.t, rubrique: choisie.r, texte: choisie.x.slice(0, 900) + (choisie.x.length > 900 ? "…" : "") };
  }

  // ───────────── Langue du message ─────────────
  var MOTS_LG = {
    fr: "je tu vous le la les est comment pour avec une mon ma pas quoi combien bonjour merci et".split(" "),
    en: "i you the is how for with my what can do does hello thanks please and it".split(" "),
    de: "ich sie du der die das ist wie für mit mein meine was kann hallo danke bitte und nicht".split(" "),
    es: "yo el los las es cómo como para con mi qué puedo hola gracias por y".split(" "),
    pt: "eu você o os as é como para com meu minha que posso olá obrigado obrigada e não".split(" ")
  };
  function detecterLangue(texte) {
    if (/[؀-ۿ]/.test(texte)) return "ar";
    var m = String(texte || "").toLowerCase().split(/[^a-zà-ÿäöüßñçõã]+/).filter(Boolean);
    var sc = {}; Object.keys(MOTS_LG).forEach(function (lg) { sc[lg] = m.filter(function (x) { return MOTS_LG[lg].indexOf(x) >= 0; }).length; });
    if (/[äöüß]/.test(texte)) sc.de += 2;
    if (/[ñ¿¡]/.test(texte)) sc.es += 2;
    if (/[ãõ]/.test(texte)) sc.pt += 2;
    if (/[éèêàùç]/.test(texte)) sc.fr += 1;
    var best = Object.keys(sc).sort(function (a, b) { return sc[b] - sc[a]; })[0];
    // Il faut au moins deux indices pour changer de langue : un mot isolé ne suffit pas.
    return sc[best] >= 2 && sc[best] > sc[etat.lg] ? best : etat.lg;
  }

  // ───────────── Garde-fous ─────────────
  var ADMIN = /(code ?pin|\bpin\b|mot de passe admin|admin password|passwort|cl[ée] api|api ?key|api-schl[üu]ssel|secret|(cr[ée]er|g[ée]n[ée]rer|create|generate|erstellen) (des |un |my |own |eigene )?(customer |client |clients? |kunden)?(codes?|kundencodes?)|(modifier|changer|augmenter|change|increase|ändern|erhöhen) (mon |le |my |das )?(solde|balance|guthaben)|(guthaben|solde|balance) (zu )?(ändern|erhöhen|modifier|changer|change|increase)|espace studio|studio space|studio-bereich|panneau admin|admin panel|console du directeur|(codes?|kundencodes?) (zu )?(erstellen|generieren|anlegen))/i;

  // ───────────── Données réelles de l'app ─────────────
  // Données et fonctions de l'app (déclarées au niveau global d'index.html), lues au moment de la question.
  var G = function (nom) {
    try {
      switch (nom) {
        case "PM_MOTEURS": return typeof PM_MOTEURS !== "undefined" ? PM_MOTEURS : null;
        case "PM_ALEPH_PRIX": return typeof PM_ALEPH_PRIX !== "undefined" ? PM_ALEPH_PRIX : null;
        case "CHP_GENRES": return typeof CHP_GENRES !== "undefined" ? CHP_GENRES : null;
        case "pmChChoix": return typeof pmChChoix !== "undefined" ? pmChChoix : null;
        case "chpPuces": return typeof chpPuces !== "undefined" ? chpPuces : null;
        case "pmMaj": return typeof pmMaj !== "undefined" ? pmMaj : null;
        case "pmOuvrir": return typeof pmOuvrir !== "undefined" ? pmOuvrir : null;
        case "pmChargerExemple": return typeof pmChargerExemple !== "undefined" ? pmChargerExemple : null;
      }
    } catch (_) {}
    return null;
  };
  function moteurs() { return G("PM_MOTEURS") || []; }
  function fmt(n) { return Number(n).toLocaleString("fr-FR").replace(/[\s\u202f\u00a0]/g, "\u00a0") + "\u00a0FCFA"; }   // espaces insécables : « 1 499 FCFA » ne se coupe pas
  function prixMoteur(m) {
    if (m.id === "aleph") { var A = G("PM_ALEPH_PRIX") || {}; return Object.keys(A).map(function (d) { return d + " s : " + fmt(A[d]); }); }
    if (!m.prix) return [];
    return m.durees.filter(function (d) { return m.prix[d]; }).map(function (d) {
      var lib = m.libDuree ? m.libDuree[d] : (d ? d + " s" : "");
      return (lib ? lib + " : " : "") + fmt(m.prix[d]);
    });
  }
  // Lignes de tarifs lues dans l'onglet 💳 Commander, telles que le client les voit.
  function lignesTarifs(idSection) {
    var s = document.getElementById(idSection); if (!s) return [];
    var bloc = [].slice.call(s.querySelectorAll("div")).filter(function (d) { return /FCFA/.test(d.textContent) && /<br/i.test(d.innerHTML); })[0];
    if (!bloc) return [];
    return bloc.innerHTML.split(/<br\s*\/?>/i).map(function (h) { var x = document.createElement("div"); x.innerHTML = h; return x.textContent.replace(/\s+/g, " ").trim(); }).filter(Boolean);
  }
  function lienWhatsApp() {
    var a = document.querySelector('#sec-auto10 a[href^="https://wa.me/"]') || document.querySelector('a[href^="https://wa.me/"]');
    var m = a && a.getAttribute("href").match(/^https:\/\/wa\.me\/(\d{8,15})/);
    return m ? "https://wa.me/" + m[1] : null;
  }
  function ongletActif() { var a = document.querySelector("#tabbar .qnav.active"); return a ? a.dataset.tab : null; }
  function panneauOuvert() { var p = document.querySelector(".pmPan:not(.hidden)"); return p && document.body.classList.contains("tab-premium") ? p.id.replace("pmPan_", "") : null; }
  // Sur téléphone, le panneau couvre l'écran : Naya se referme pour montrer l'onglet ouvert (la conversation est gardée).
  function ouvrirOnglet(tab) {
    var a = document.querySelector('#tabbar .qnav[data-tab="' + tab + '"]'); if (!a) return false;
    a.click();
    try { if (matchMedia("(max-width:640px)").matches) basculer(false); } catch (_) {}
    return true;
  }
  var PM_IDS = ["aleph", "seedance25", "seedance2", "multishot", "chanson", "chansonPro", "demo", "stems"];
  function ouvrirOutil(id) {
    if (!ouvrirOnglet("premium")) return false;
    var f = G("pmOuvrir"); if (typeof f !== "function" || !document.getElementById("pmPan_" + id)) return false;
    try { f(id); return true; } catch (_) { return false; }
  }
  // Chapitre du manuel → onglet de l'app (pour le bouton « Ouvrir »). Les chapitres Studio n'ont pas de bouton.
  var CHAP_TAB = { accueil: "accueil", photo: "photo", traitement: "traitement", look: "look", scenario: "scenario", danses: "scenario", multiplans: "scenario", miniseriesClient: "miniseries", finition: "finition", commander: "commander", rudis: "commander", ressources: "prompts" };
  var TAB_CHAP = { accueil: "accueil", photo: "photo", traitement: "traitement", look: "look", scenario: "scenario", miniseries: "miniseriesClient", finition: "finition", commander: "commander", prompts: "ressources", idees: "ressources", remix: "remix" };

  // Outil visé par la question (pour les prix et les prompts).
  var OUTILS_RE = [
    ["chansonPro", /chanson ?pro|song pro|pro song|qualit[ée] studio|studio quality/],
    ["demo", /am[ée]liorer ma d[ée]mo|\bd[ée]mo\b|my demo|meine demo/],
    ["stems", /\bstems?\b|s[ée]parer (la|une|ma) chanson|separate|spuren/],
    ["chanson", /chanson|\bsong\b|\blied\b|musique|\bmusic\b|musik/],
    ["seedance25", /seedance ?2[.,]5/],
    ["multishot", /multi[- ]?shot|plusieurs plans|multi[- ]?plans/],
    ["aleph", /aleph|modifier (une|ma) vid[ée]o|edit (a|my) video/],
    ["seedance2", /seedance|moteur a\b|vid[ée]o [àa] partir d.une photo|video from (a )?photo/]
  ];
  function outilDe(q) { var p = plier(q); for (var i = 0; i < OUTILS_RE.length; i++) if (OUTILS_RE[i][1].test(p)) return OUTILS_RE[i][0]; return null; }

  // Genres de Chanson Pro (mêmes identifiants que l'app).
  var ALIAS_GENRE = { "coupe decale": "coupe", "coupe-decale": "coupe", "r&b": "afrorb", "rnb": "afrorb", "afro r&b": "afrorb", "afro trap": "afrotrap", "afro jazz": "afrojazz", "ballad": "ballade", "slow": "ballade", "afrobeat": "afrobeats" };
  function genreDe(q) {
    var E = window.CHP_EXEMPLES; if (!E) return null;
    var p = " " + plier(q).replace(/[^a-z0-9&-]+/g, " ") + " ";
    var a = Object.keys(ALIAS_GENRE).filter(function (k) { return p.indexOf(" " + k + " ") >= 0; })[0];
    if (a) return ALIAS_GENRE[a];
    return Object.keys(E).sort(function (x, y) { return y.length - x.length; }).filter(function (g) { return p.indexOf(" " + g + " ") >= 0 || p.indexOf(" " + g + "s ") >= 0; })[0] || null;
  }
  function libGenre(id) { var L = G("CHP_GENRES") || []; var g = L.filter(function (x) { return x.id === id; })[0]; return g ? g.l : id; }

  // ───────────── Vérification d'un prompt (règles du manuel et limites de l'app) ─────────────
  var LIM = { seedance2: 3500, seedance25: 15000 };
  var P = {
    long: { fr: "Trop long : {n} caractères, le moteur en accepte {max}.", en: "Too long: {n} characters, the engine accepts {max}.", de: "Zu lang: {n} Zeichen, das Modell akzeptiert {max}." },
    decor: { fr: "Ne redécris pas le décor ni la tenue : ils viennent déjà de ta photo. Concentre-toi sur l'action, l'émotion et la caméra.", en: "Don't describe the setting or outfit again: they come from your photo. Focus on action, emotion and camera.", de: "Beschreiben Sie Kulisse und Outfit nicht erneut: Sie kommen bereits aus Ihrem Foto. Konzentrieren Sie sich auf Handlung, Gefühl und Kamera." },
    parle: { fr: "Les moteurs refusent parfois une personne qui « parle » : décris plutôt ce qu'elle fait (« elle sourit face caméra »).", en: "Engines sometimes refuse a person who « talks »: describe what they do instead (« she smiles at the camera »).", de: "Modelle lehnen manchmal eine Person ab, die « spricht »: Beschreiben Sie lieber, was sie tut (« sie lächelt in die Kamera »)." },
    camera: { fr: "Ajoute un mouvement de caméra, par exemple « la caméra se rapproche lentement ».", en: "Add a camera movement, e.g. « the camera slowly moves closer ».", de: "Ergänzen Sie eine Kamerabewegung, z. B. « die Kamera nähert sich langsam »." },
    pose: { fr: "Décris une pose stable plutôt qu'un mouvement en cours (« debout, une main sur la portière » plutôt que « en train de descendre »).", en: "Describe a stable pose rather than a movement in progress.", de: "Beschreiben Sie eine stabile Pose statt einer laufenden Bewegung." },
    couplets: { fr: "Sépare tes couplets par une ligne vide : le bloc qui se répète devient le refrain.", en: "Separate verses with a blank line: the repeated block becomes the chorus.", de: "Trennen Sie die Strophen durch eine Leerzeile: Der wiederholte Block wird zum Refrain." },
    artiste: { fr: "Évite les noms d'artistes : décris plutôt le son (instruments, tempo, ambiance). Un nom ne garantit pas l'imitation.", en: "Avoid artist names: describe the sound instead (instruments, tempo, mood). A name does not guarantee imitation.", de: "Vermeiden Sie Künstlernamen: Beschreiben Sie lieber den Klang (Instrumente, Tempo, Stimmung). Ein Name garantiert keine Nachahmung." },
    court: { fr: "Un peu court : ajoute l'ambiance, les instruments ou l'action principale.", en: "A bit short: add the mood, instruments or main action.", de: "Etwas kurz: Ergänzen Sie Stimmung, Instrumente oder Haupthandlung." }
  };
  var pp = function (k, v) { var s = P[k][etat.lg] || P[k].fr; return v ? s.replace(/\{(\w+)\}/g, function (_, x) { return v[x]; }) : s; };
  function verifierPrompt(texte, outil) {
    var x = String(texte).trim(), c = [];
    var musique = /chanson/i.test(outil || "") || outil === "demo";
    var video = !musique;
    if (LIM[outil] && x.length > LIM[outil]) c.push(pp("long", { n: x.length, max: LIM[outil] }));
    if (x.split(/\s+/).length < 6) c.push(pp("court"));
    if (video && /(tenue|robe|costume|d[ée]cor|outfit|dress|setting|kleid|anzug|kulisse)/i.test(x)) c.push(pp("decor"));
    if (video && /(parle|dit |dire|talk|speak|says|spricht|sagt|sprechen)/i.test(x)) c.push(pp("parle"));
    if (video && !/(cam[ée]ra|kamera|plan |zoom|travelling|gros plan|close-up|nahaufnahme|se rapproche|moves|nähert)/i.test(x)) c.push(pp("camera"));
    if (/(descendant|en train de|getting out|while |während)/i.test(x)) c.push(pp("pose"));
    if (musique && !/\n\s*\n/.test(x) && x.split("\n").length > 4) c.push(pp("couplets"));
    if (musique && /(dans le style de|comme |style of|like |im stil von)\s*[A-Z][a-z]+/.test(x)) c.push(pp("artiste"));
    return c;
  }

  // ───────────── Intentions ─────────────
  var I = {
    salut: /^(bonjour|bonsoir|salut|coucou|hello|hi|hey|hallo|guten (tag|morgen|abend))\b[\s!.,]*$/i,
    capacites: /(que (puis|peux)[- ]je faire|tu (sais|peux) faire quoi|qu.est-ce que tu fais|aide[- ]moi$|what can (i|you) do|was kann ich|was kannst du|^aide$|^help$|^hilfe$)/i,
    lancer: /(lance[- ](la|le|les|moi|pour moi)|g[ée]n[èe]re[- ](la|le|moi|pour moi)|cr[ée]e[- ](la|le|moi)|fais[- ](la|le)\b|start it|generate it|run it|make it for me|starte es|generiere es|erstelle es)/i,
    deleguer: /(studio rudis|clip signature|premium cin[ée]ma|r[ée]alis[ée] par (le |un )?(studio|pro)|fai(tes|s)[- ]le pour moi|d[ée]l[ée]guer|devis|une offre|\bquote\b|do it for me|made by the studio|music video made|angebot|vom studio|für mich (machen|erstellen))/i,
    abonnement: /(abonnement|obligatoire|subscription|do i have to|\babo\b|pflicht)/i,
    paiement: /(payer|paiement|orange money|\bmomo\b|mobile money|recharg|\bpacks?\b|essai star|\bpay\b|payment|top ?up|bezahlen|zahlung|aufladen|paket)/i,
    prix: /(prix|co[uû]t|combien|tarif|price|cost|how much|kostet|kosten|preis)/i,
    verifier: /^(v[ée]rifie|corrige|check|pr[üu]fe?)\s*:?\s*/i,
    prompt: /(prompt|[ée]crire|r[ée]diger|d[ée]crire|exemple|example|beispiel|write|describe|schreiben|beschreiben)/i,
    erreur: /(erreur|error|refus|refused|marche pas|bloqu|[ée]chou|failed|ne fonctionne|doesn.t work|fehler|abgelehnt|funktioniert nicht)/i
  };

  // Chaque réponse : { texte, actions: [{lib, fn}], html? }. Aucune action ne lance une génération ni n'envoie rien.
  function repondre(q, k) {
    var r = function (texte, actions, extra) { var o = { texte: texte, actions: actions || [] }; for (var x in extra || {}) o[x] = extra[x]; return o; };
    // Fin de la période de test : une demande de code d'essai reçoit le vrai mode d'emploi, pas un refus.
    if (/(essai gratuit|code (d.essai|de test|test|gratuit|offert|b[êe]ta)|(acc[èe]s|version) (test|b[êe]ta)|free (trial|code)|trial code|test code|beta code|kostenlos(e|er)? (test|code)|testcode|probecode|probeversion)/i.test(q))
      return r(t("essai_fini"), [{ lib: t("ouvrir_cmd"), fn: function () { ouvrirOnglet("commander"); } }], { intention: "essai_fini" });
    if (ADMIN.test(q) && !/admin premium/i.test(q)) return r(t("admin"), [], { intention: "admin_refuse" });
    var abs = (k.absentes || []).filter(function (f) { return new RegExp(f.motif, "i").test(q); })[0];
    if (abs) return r(abs.texte, [], { intention: "fonction_absente" });
    if (I.salut.test(q.trim())) return r(t("bienvenue"), [], { intention: "salut" });
    if (I.capacites.test(q.trim())) return r(t("capacites"), [], { intention: "capacites" });
    if (I.lancer.test(q)) return r(t("lancer"), [], { intention: "lancer" });
    if (I.verifier.test(q.trim())) {
      var txt = q.trim().replace(I.verifier, "");
      if (txt.length < 3) return r(t("verif_aide"), [], { intention: "verifier" });
      var o = outilDe(txt) || panneauOuvert() || (/(couplet|refrain|verse|chorus|strophe|bpm|guitare|guitar|basse|bass)/i.test(txt) ? "chansonPro" : "seedance2");
      var c = verifierPrompt(txt, o);
      return r(t("verif_titre") + " :\n" + (c.length ? c.map(function (x) { return "• " + x; }).join("\n") : t("verif_bon")), [], { intention: "verifier", conseils: c.length });
    }
    if (I.deleguer.test(q)) return r(t("dev_intro"), [], { intention: "devis", formulaire: true });
    if (I.abonnement.test(q)) return r(t("abonnement"), [], { intention: "abonnement" });
    var outil = outilDe(q), genre = genreDe(q);
    if (I.prix.test(q) && (outil || !I.paiement.test(q))) return reponsePrix(outil || panneauOuvert(), r);
    if (I.paiement.test(q)) {
      var pk = lignesTarifs("sec-auto9");
      return r(t("paiement") + (pk.length ? "\n\n" + t("packs") + " :\n" + pk.map(function (x) { return "• " + x; }).join("\n") : ""), [{ lib: t("ouvrir_cmd"), fn: function () { ouvrirOnglet("commander"); } }], { intention: "paiement" });
    }
    if (genre || (I.prompt.test(q) && /(chanson|song|lied|musique|music|genre)/i.test(plier(q)))) return reponseGenre(genre, r);
    if (I.erreur.test(q)) {
      var e = (k.erreurs || []).filter(function (x) { return new RegExp(x.motif, "i").test(q); })[0];
      if (e) return r(e.texte, [], { intention: "erreur" });
    }
    if (I.prompt.test(q)) {
      var oc = outil || panneauOuvert();
      var fiche = (k.outils || []).filter(function (x) { return x.id === oc; })[0];
      if (fiche) return r(fiche.icone + " " + fiche.nom + " — " + fiche.champ + ".\n" + "« " + fiche.exemple + " »\n\n" + t("verif_aide"), [], { intention: "prompt" });
    }
    var m = chercherManuel(k, q, outil || panneauOuvert() || TAB_CHAP[ongletActif()]);
    if (!m) return r(t("inconnu"), [], { intention: "inconnue" });
    var ent = etat.niveau === "debutant" && m.rubrique === 5 ? t("pasapas") : t("manuel");
    var act = [];
    if (CHAP_TAB[m.chapitre]) act.push({ lib: t("ouvrir") + " " + ongletLib(CHAP_TAB[m.chapitre]), fn: function () { ouvrirOnglet(CHAP_TAB[m.chapitre]); } });
    else if (PM_IDS.indexOf(m.chapitre) >= 0) act.push({ lib: t("ouvrir") + " " + nomMoteur(m.chapitre), fn: function () { ouvrirOutil(m.chapitre); } });
    return r(ent + " (" + m.titre + ") :\n" + m.texte, act, { intention: "manuel", source: m.chapitre + "#" + m.rubrique });
  }
  function ongletLib(tab) { var a = document.querySelector('#tabbar .qnav[data-tab="' + tab + '"]'); return a ? (a.childNodes[0].textContent || "").trim() : tab; }
  function nomMoteur(id) { var m = moteurs().filter(function (x) { return x.id === id; })[0]; return m ? m.nom : id; }

  function reponsePrix(outil, r) {
    var L = moteurs();
    if (outil === "demo") {
      var md = L.filter(function (x) { return x.id === "demo"; })[0];
      return r(t("prix_moteur", { m: md ? md.nom : "demo" }) + " :\n• " + t("reprise") + (md ? "\n• Référence : " + prixMoteur(md).join(" · ") : "") + "\n" + t("debite"), [{ lib: t("ouvrir") + " " + nomMoteur("demo"), fn: function () { ouvrirOutil("demo"); } }], { intention: "prix", outil: "demo" });
    }
    var m = L.filter(function (x) { return x.id === outil; })[0];
    if (m) {
      var p = prixMoteur(m);
      if (!p.length) return r(t("prix_absent"), [], { intention: "prix" });
      return r(t("prix_moteur", { m: m.nom }) + " :\n" + p.map(function (x) { return "• " + x; }).join("\n") + "\n" + t("debite"), [{ lib: t("ouvrir") + " " + m.nom, fn: function () { ouvrirOutil(m.id); } }], { intention: "prix", outil: m.id });
    }
    // Pas d'outil précis : les packs, les clips Studio Rudis et un résumé des outils Premium.
    var pk = lignesTarifs("sec-auto9"), sg = lignesTarifs("sec-auto10");
    var res = L.filter(function (x) { return x.prix; }).map(function (x) { return "• " + x.nom + " : " + (x.id === "demo" ? "999 FCFA" : prixMoteur(x)[0]); });
    var blocs = [];
    if (pk.length) blocs.push(t("packs") + " :\n" + pk.map(function (x) { return "• " + x; }).join("\n"));
    if (res.length) blocs.push(t("resume_prix") + "\n" + res.join("\n"));
    if (sg.length) blocs.push(t("signature") + " :\n" + sg.map(function (x) { return "• " + x; }).join("\n"));
    if (!blocs.length) return r(t("prix_absent"), [], { intention: "prix" });
    return r(blocs.join("\n\n"), [{ lib: t("ouvrir_cmd"), fn: function () { ouvrirOnglet("commander"); } }], { intention: "prix" });
  }

  function reponseGenre(genre, r) {
    var E = window.CHP_EXEMPLES;
    if (!E) return r(t("charge_ko"), [], { intention: "genre" });
    if (!genre) return r(t("genres_dispo") + Object.keys(E).map(libGenre).join(", ") + ".", [], { intention: "genre" });
    var x = E[genre];
    var texte = libGenre(genre) + " — " + x.desc + "\n\n" + t("debutant_ex") + " : « " + x.debutant + " »" +
      (etat.niveau === "pro" ? "\n\n" + t("pro_ex") + " : « " + x.pro + " »" : "") + (t("ex_fr") ? "\n" + t("ex_fr") : "") + "\n\n" + t("auth");
    var act = ["debutant", "pro", "voix", "instru"].map(function (niv) {
      var lib = { debutant: t("debutant_ex"), pro: t("pro_ex"), voix: t("avec_paroles"), instru: t("instrumental") }[niv];
      return { lib: t("charger") + " · " + lib, fn: function () { return chargerExemple(genre, niv); } };
    });
    var prix = moteurs().filter(function (m) { return m.id === "chansonPro"; })[0];
    if (prix) texte += "\n" + t("prix_moteur", { m: prix.nom }) + " : " + prixMoteur(prix).join(" · ") + ". " + t("debite");
    texte += "\n\n" + t("charger_titre");
    return r(texte, act, { intention: "genre", genre: genre });
  }
  // Charge l'exemple dans le vrai formulaire Chanson Pro : genre choisi, exemple chargé, AUCUN lancement.
  function chargerExemple(genre, niveau) {
    var C = G("pmChChoix"), puces = G("chpPuces"), GEN_L = G("CHP_GENRES"), maj = G("pmMaj"), ch = G("pmChargerExemple");
    if (!C || !C.chansonPro || typeof ch !== "function" || !ouvrirOutil("chansonPro")) { dire(t("charge_ko")); return; }
    C.chansonPro.genre = genre;
    var z = document.getElementById("pmChGenre_chansonPro");
    if (z && typeof puces === "function" && GEN_L) puces(z, GEN_L, C.chansonPro, "genre", function () { if (typeof maj === "function") maj("chansonPro"); });
    ch("chansonPro", niveau);
    dire(t("charge_ok"));
  }

  // ───────────── Demande de devis (préparée ici, envoyée par le client lui-même) ─────────────
  function formulaireDevis() {
    var offres = lignesTarifs("sec-auto10");
    var f = document.createElement("form"); f.className = "naya-form";
    var opt = offres.map(function (o, i) { return '<option value="' + i + '">' + esc(o) + "</option>"; }).join("") + '<option value="">' + esc(t("dev_nsp")) + "</option>";
    f.innerHTML =
      '<label>' + esc(t("dev_offre")) + '<select name="offre">' + opt + "</select></label>" +
      '<label>' + esc(t("dev_nom")) + '<input name="nom" maxlength="80" autocomplete="name"></label>' +
      '<label>' + esc(t("dev_titre")) + '<input name="titre" maxlength="120"></label>' +
      '<label>' + esc(t("dev_date")) + '<input name="date" maxlength="40"></label>' +
      '<label>' + esc(t("dev_idee")) + '<textarea name="idee" rows="3" maxlength="600"></textarea></label>' +
      '<button type="submit" class="naya-btn naya-or">' + esc(t("dev_preparer")) + "</button>";
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(f), i = d.get("offre"), offre = i === "" ? t("dev_nsp") : offres[+i];
      var ref = "N" + Date.now().toString(36).toUpperCase().slice(-6);
      var lignes = ["Bonjour Studio Rudis, demande de devis préparée avec Naya (réf. " + ref + ").",
        "Offre : " + offre,
        d.get("nom") ? "Nom : " + d.get("nom") : "",
        d.get("titre") ? "Chanson : " + d.get("titre") : "",
        d.get("date") ? "Date souhaitée : " + d.get("date") : "",
        d.get("idee") ? "Idée : " + d.get("idee") : "",
        "Langue de réponse souhaitée : " + NOM_LG[etat.lg]].filter(Boolean);
      var texte = lignes.join("\n");
      var demandes = [];
      try { demandes = JSON.parse(lire(LS.dem, "[]")) || []; } catch (_) {}
      demandes.unshift({ ref: ref, date: new Date().toISOString(), offre: offre, texte: texte });
      ecrire(LS.dem, JSON.stringify(demandes.slice(0, 10)));
      var prixTxt = i === "" ? "" : "\n\n" + t("dev_prix", { p: (offre.match(/[\d  ]+ ?FCFA ?\+?/) || [offre])[0].trim() });
      var wa = lienWhatsApp();
      var act = [{ lib: t("dev_copier"), fn: function (b) { copier(texte, b); } }];
      if (wa) act.unshift({ lib: t("dev_envoyer"), fn: function () { window.open(wa + "?text=" + encodeURIComponent(texte), "_blank", "noopener"); }, classe: "naya-wa" });
      f.remove();
      ajouter("naya", { texte: t("dev_pret") + prixTxt + (wa ? "" : "\n" + t("dev_wa_absent")) + "\n\n" + texte, actions: act, intention: "devis_pret" });
    });
    return f;
  }
  function copier(texte, bouton) {
    var fini = function () { if (bouton) bouton.textContent = t("copie"); };
    try { navigator.clipboard.writeText(texte).then(fini, fini); } catch (_) { fini(); }
  }

  // ───────────── Interface ─────────────
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function mise(s) { return esc(s).replace(/^### (.+)$/gm, "<b>$1</b>").replace(/\n/g, "<br>"); }
  var css = "" +
    "#naya-btn{position:fixed;right:16px;bottom:16px;z-index:9000;display:flex;align-items:center;gap:8px;padding:10px 16px 10px 12px;border-radius:999px;border:1px solid var(--gold,#F2B33D);background:linear-gradient(135deg,var(--panel,#0A1236),var(--up,#0E1A48));color:var(--text,#E8ECF7);font:700 15px/1 Manrope,system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.45),0 0 0 3px rgba(46,230,214,.12);cursor:pointer}" +
    "#naya-btn .naya-pt{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,var(--ai,#2EE6D6),#0b6f68);color:#04201e;font-size:14px}" +
    "#naya-pan{position:fixed;right:16px;bottom:76px;z-index:9001;width:380px;max-width:calc(100vw - 32px);height:min(620px,calc(100vh - 110px));display:flex;flex-direction:column;background:var(--panel,#0A1236);border:1px solid var(--line,#1F2B5C);border-top:2px solid var(--ai,#2EE6D6);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.55);color:var(--text,#E8ECF7);font:14px/1.5 Manrope,system-ui,sans-serif;overflow:hidden}" +
    "#naya-pan[hidden]{display:none}" +
    ".naya-tete{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line,#1F2B5C);background:var(--up,#0E1A48)}" +
    ".naya-tete b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:Cinzel,serif;letter-spacing:.04em;color:var(--champagne,#F3E3B5);font-size:14px}" +
    ".naya-tete select,.naya-niv button{background:var(--bg,#060A1C);color:var(--text,#E8ECF7);border:1px solid var(--line,#1F2B5C);border-radius:8px;font:600 12px Manrope,sans-serif;padding:5px 6px}" +
    ".naya-niv{display:flex;gap:4px;padding:8px 12px 0}.naya-niv button{cursor:pointer}.naya-niv button.on{border-color:var(--ai,#2EE6D6);color:var(--ai,#2EE6D6)}" +
    ".naya-x{background:none;border:0;color:var(--dim,#AEB7D3);font-size:20px;line-height:1;cursor:pointer;padding:2px 6px}" +
    ".naya-fil{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;-webkit-overflow-scrolling:touch}" +
    ".naya-m{max-width:92%;padding:9px 12px;border-radius:12px;word-wrap:break-word}" +
    ".naya-m.naya{align-self:flex-start;background:var(--up,#0E1A48);border:1px solid var(--line,#1F2B5C)}" +
    ".naya-m.client{align-self:flex-end;background:rgba(242,179,61,.14);border:1px solid rgba(242,179,61,.35)}" +
    ".naya-acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}" +
    ".naya-btn{cursor:pointer;border-radius:999px;border:1px solid var(--ai,#2EE6D6);background:transparent;color:var(--ai,#2EE6D6);font:700 12px Manrope,sans-serif;padding:6px 10px}" +
    ".naya-btn.naya-or{border-color:var(--gold,#F2B33D);color:#1A1204;background:var(--gold,#F2B33D)}.naya-btn.naya-wa{background:#25D366;border-color:#25D366;color:#06300f}" +
    ".naya-puces{display:flex;gap:6px;overflow-x:auto;padding:0 12px 8px;-webkit-overflow-scrolling:touch}.naya-puces .naya-btn{white-space:nowrap;border-color:var(--line,#1F2B5C);color:var(--dim,#AEB7D3)}" +
    ".naya-saisie{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line,#1F2B5C);background:var(--bg,#060A1C)}" +
    ".naya-saisie textarea{flex:1;resize:none;min-height:40px;max-height:110px;border-radius:10px;border:1px solid var(--line,#1F2B5C);background:var(--panel,#0A1236);color:var(--text,#E8ECF7);font:16px/1.35 Manrope,sans-serif;padding:9px 10px}" +
    ".naya-pied{font-size:11px;color:var(--dim,#AEB7D3);padding:0 12px 8px}.naya-pied a{color:var(--dim,#AEB7D3);cursor:pointer;text-decoration:underline}" +
    ".naya-form{display:flex;flex-direction:column;gap:8px;align-self:stretch;background:var(--up,#0E1A48);border:1px solid var(--gold,#F2B33D);border-radius:12px;padding:10px 12px}" +
    ".naya-form label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--dim,#AEB7D3)}" +
    ".naya-form input,.naya-form select,.naya-form textarea{font:16px Manrope,sans-serif;color:var(--text,#E8ECF7);background:var(--bg,#060A1C);border:1px solid var(--line,#1F2B5C);border-radius:8px;padding:7px 8px}" +
    "@media (min-width:1100px){#naya-btn{right:316px}#naya-pan{right:316px}}" +
    "@media (max-width:640px){#naya-btn{right:12px;bottom:calc(12px + env(safe-area-inset-bottom))}#naya-pan{left:0;right:0;bottom:0;width:100%;max-width:100%;height:82vh;height:82dvh;border-radius:16px 16px 0 0;padding-bottom:env(safe-area-inset-bottom)}}" +
    "@media print{#naya-btn,#naya-pan{display:none}}";

  var el = {};
  function construire() {
    var st = document.createElement("style"); st.id = "naya-css"; st.textContent = css; document.head.appendChild(st);
    el.btn = document.createElement("button"); el.btn.id = "naya-btn"; el.btn.type = "button";
    el.btn.setAttribute("aria-haspopup", "dialog");
    el.btn.innerHTML = '<span class="naya-pt">✦</span><span class="naya-lib"></span>';
    el.pan = document.createElement("section"); el.pan.id = "naya-pan"; el.pan.hidden = true;
    el.pan.setAttribute("role", "dialog");
    el.pan.innerHTML =
      '<div class="naya-tete"><span class="naya-pt" style="width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#2EE6D6,#0b6f68);color:#04201e;font-size:13px">✦</span><b class="naya-t"></b>' +
      '<select class="naya-lg" aria-label="Langue / Language / Sprache"></select><button type="button" class="naya-x"></button></div>' +
      '<div class="naya-niv"><button type="button" data-niv="debutant"></button><button type="button" data-niv="pro"></button></div>' +
      '<div class="naya-fil" aria-live="polite"></div><div class="naya-puces"></div>' +
      '<form class="naya-saisie"><textarea rows="1" maxlength="1000"></textarea><button type="submit" class="naya-btn naya-or"></button></form>' +
      '<div class="naya-pied"><span class="naya-conf"></span> <a class="naya-eff"></a></div>';
    document.body.appendChild(el.pan); document.body.appendChild(el.btn);
    el.fil = el.pan.querySelector(".naya-fil"); el.saisie = el.pan.querySelector(".naya-saisie textarea");
    el.lg = el.pan.querySelector(".naya-lg");
    el.btn.addEventListener("click", function () { basculer(!etat.ouvert); });
    el.pan.querySelector(".naya-x").addEventListener("click", function () { basculer(false); });
    el.pan.querySelector(".naya-saisie").addEventListener("submit", function (ev) { ev.preventDefault(); envoyer(el.saisie.value); });
    el.saisie.addEventListener("keydown", function (ev) { if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); envoyer(el.saisie.value); } });
    el.lg.addEventListener("change", function () { if (ACTIVES.indexOf(el.lg.value) < 0) { el.lg.value = etat.lg; return; } changerLangue(el.lg.value); });
    [].forEach.call(el.pan.querySelectorAll("[data-niv]"), function (b) { b.addEventListener("click", function () { etat.niveau = b.dataset.niv; ecrire(LS.niv, etat.niveau); libelles(); }); });
    el.pan.querySelector(".naya-eff").addEventListener("click", function () { ecrire(LS.hist, "[]"); el.fil.innerHTML = ""; ajouter("naya", { texte: t("bienvenue") }, true); });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && etat.ouvert) basculer(false); });
    libelles();
  }
  function libelles() {
    el.btn.querySelector(".naya-lib").textContent = t("bouton");
    el.btn.setAttribute("aria-label", t("titre"));
    el.pan.setAttribute("aria-label", t("titre"));
    el.pan.querySelector(".naya-t").textContent = t("titre");
    el.pan.querySelector(".naya-x").setAttribute("aria-label", t("fermer")); el.pan.querySelector(".naya-x").textContent = "×";
    el.saisie.placeholder = t("placeholder");
    el.pan.querySelector(".naya-saisie button").textContent = t("envoyer");
    el.pan.querySelector(".naya-conf").textContent = t("confid");
    el.pan.querySelector(".naya-eff").textContent = t("effacer");
    el.lg.innerHTML = ACTIVES.map(function (l) { return '<option value="' + l + '"' + (l === etat.lg ? " selected" : "") + ">" + l.toUpperCase() + " · " + NOM_LG[l] + "</option>"; }).join("") +
      Object.keys(BIENTOT).map(function (l) { return '<option value="' + l + '" disabled>' + l.toUpperCase() + " · " + BIENTOT[l] + " (" + t("bientot") + ")</option>"; }).join("");
    [].forEach.call(el.pan.querySelectorAll("[data-niv]"), function (b) { b.textContent = t(b.dataset.niv); b.classList.toggle("on", b.dataset.niv === etat.niveau); });
    var pu = el.pan.querySelector(".naya-puces"); pu.innerHTML = "";
    ["q_quoi", "q_chanson", "q_prompt", "q_clip", "q_payer"].forEach(function (k) {
      var b = document.createElement("button"); b.type = "button"; b.className = "naya-btn"; b.textContent = t(k);
      b.addEventListener("click", function () { envoyer(t(k)); }); pu.appendChild(b);
    });
  }
  function changerLangue(lg) { etat.lg = lg; ecrire(LS.lg, lg); libelles(); chargerKB(lg).catch(function () {}); }
  function basculer(o) {
    etat.ouvert = o; el.pan.hidden = !o; el.btn.setAttribute("aria-expanded", String(o));
    if (!o) arreterVoix();
    if (o) {
      if (!el.fil.childNodes.length) restaurer();
      chargerKB(etat.lg).catch(function () {});
      setTimeout(function () { try { el.saisie.focus({ preventScroll: true }); } catch (_) {} }, 50);
    }
  }
  function restaurer() {
    var h = []; try { h = JSON.parse(lire(LS.hist, "[]")) || []; } catch (_) {}
    if (!h.length) { ajouter("naya", { texte: t("bienvenue") }, true); return; }
    h.forEach(function (m) { ajouter(m.qui, { texte: m.texte }, true); });
  }
  function memoriser(qui, texte) {
    var h = []; try { h = JSON.parse(lire(LS.hist, "[]")) || []; } catch (_) {}
    h.push({ qui: qui, texte: String(texte).slice(0, 1500) }); ecrire(LS.hist, JSON.stringify(h.slice(-30)));
  }
  function ajouter(qui, rep, sansMemo) {
    var d = document.createElement("div"); d.className = "naya-m " + qui;
    if (rep.intention) d.dataset.intention = rep.intention;
    if (qui === "naya" && !rep.lg) rep.lg = etat.lg;   // langue dans laquelle la réponse est écrite : la voix lira cette langue
    d.innerHTML = mise(rep.texte);
    var acts = (rep.actions || []).slice();
    if (qui === "naya" && !rep.formulaire && (serveurVoix() || (VOIX_SECOURS_APPAREIL && "speechSynthesis" in window))) acts.push({ lib: "🔊 " + t("ecouter"), fn: function (b) { lireAVoix(rep.texte, b, rep.lg); }, discret: true });
    if (acts.length) {
      var z = document.createElement("div"); z.className = "naya-acts";
      acts.forEach(function (a) {
        var b = document.createElement("button"); b.type = "button"; b.className = "naya-btn" + (a.classe ? " " + a.classe : "");
        if (a.discret) b.style.borderColor = "var(--line,#1F2B5C)";
        b.textContent = a.lib; b.addEventListener("click", function () { a.fn(b); }); z.appendChild(b);
      });
      d.appendChild(z);
    }
    el.fil.appendChild(d);
    if (rep.formulaire) el.fil.appendChild(formulaireDevis());
    el.fil.scrollTop = el.fil.scrollHeight;
    if (!sansMemo) memoriser(qui, rep.texte);
    return d;
  }
  function dire(texte) { ajouter("naya", { texte: texte }); }
  // ───────────── Voix ─────────────
  // 1) Mélanie (ElevenLabs) par le serveur StarClip : la clé reste dans Cloudflare, jamais dans le navigateur.
  // 2) Sinon, voix de secours de l'appareil, SIGNALÉE, et seulement si c'est une voix FÉMININE connue dans la
  //    bonne langue. Avant v41.157, aucune voix n'était choisie : le navigateur prenait sa voix par défaut
  //    (souvent masculine, « Thomas » sur Mac et iPhone) et lisait l'anglais ou l'allemand avec un accent français.
  // v41.158 : décision du directeur — Naya ne parle QU'AVEC la voix qu'il a choisie (Mélanie, ElevenLabs).
  // La voix de secours de l'appareil est désactivée : sans Mélanie, la réponse reste écrite et c'est dit.
  // v41.159 : une voix native par langue, choisie par le serveur (Mélanie fr-FR, Lea de-DE, Lara en anglais) ;
  // jamais de voix de l'appareil, même si une voix ElevenLabs manque.
  // Passer à true seulement avec son accord.
  var VOIX_SECOURS_APPAREIL = false;
  var LANGUE_VOIX = { fr: "fr-FR", en: "en-GB", de: "de-DE" };
  var FEMININES = {
    fr: ["audrey", "aurelie", "amelie", "marie", "flo", "sandy", "shelley", "hortense", "julie", "denise", "eloise", "vivienne", "google francais"],
    en: ["samantha", "ava", "allison", "susan", "zoe", "nicky", "joelle", "kate", "serena", "stephanie", "martha", "fiona", "moira", "tessa", "karen", "kathy", "flo", "sandy", "shelley", "zira", "aria", "jenny", "sonia", "libby", "michelle", "emma", "google us english", "google uk english female"],
    de: ["anna", "petra", "helena", "katja", "hedda", "amala", "seraphina", "flo", "sandy", "shelley", "google deutsch"]
  };
  // Nom simplifié : « Microsoft Hortense - French (France) » → « hortense » ; « Flo (Français (France)) » → « flo ».
  function nomVoix(n) { return plier(n).replace(/\s+-\s+.*$/, "").replace(/\s*\(.*$/, "").replace(/^microsoft\s+/, "").replace(/\s+online.*$/, "").trim(); }
  function voixFeminine(lg) {
    var liste = []; try { liste = speechSynthesis.getVoices() || []; } catch (_) {}
    var noms = FEMININES[lg] || [], region = LANGUE_VOIX[lg].toLowerCase();
    var bonnes = liste.filter(function (v) {
      var n = nomVoix(v.name), l = String(v.lang || "").toLowerCase().replace("_", "-");
      return l.indexOf(lg) === 0 && noms.some(function (x) { return n === x || n.indexOf(x + " ") === 0; });
    });
    // Préférence : la région exacte (fr-FR, en-GB, de-DE), puis une voix « améliorée », puis l'ordre de la liste.
    bonnes.sort(function (a, b) {
      var ra = String(a.lang).toLowerCase().replace("_", "-") === region ? 0 : 1, rb = String(b.lang).toLowerCase().replace("_", "-") === region ? 0 : 1;
      var qa = /premium|enhanced|améliorée|natural/i.test(a.name) ? 0 : 1, qb = /premium|enhanced|améliorée|natural/i.test(b.name) ? 0 : 1;
      return ra - rb || qa - qb || noms.indexOf(nomVoix(a.name)) - noms.indexOf(nomVoix(b.name));
    });
    return bonnes[0] || null;
  }
  function voixPretes() {
    return new Promise(function (ok) {
      try {
        if ((speechSynthesis.getVoices() || []).length) return ok();
        speechSynthesis.addEventListener("voiceschanged", function f() { speechSynthesis.removeEventListener("voiceschanged", f); ok(); });
        setTimeout(ok, 1500);
      } catch (_) { ok(); }
    });
  }
  var lecture = null;
  function arreterVoix() { try { if (lecture) { lecture.pause(); URL.revokeObjectURL(lecture.src); } } catch (_) {} lecture = null; try { speechSynthesis.cancel(); } catch (_) {} }
  function noteVoix(bouton, texte) { var z = bouton && bouton.parentNode; if (!z) return; var n = z.querySelector(".naya-vx") || z.appendChild(document.createElement("small")); n.className = "naya-vx"; n.style.cssText = "flex-basis:100%;color:var(--dim,#AEB7D3);font-size:11px"; n.textContent = texte; }
  function serveurVoix() { try { return typeof WORKER_URL === "string" && /^(https:\/\/|http:\/\/127\.0\.0\.1[:/])/.test(WORKER_URL) && !/COLLE_ICI|\.invalid/.test(WORKER_URL) ? WORKER_URL : null; } catch (_) { return null; } }
  // Le serveur choisit la voix native de la langue du texte (Mélanie en français). Sans voix validée
  // pour cette langue, il répond 409 et la réponse reste écrite.
  function lireAVoix(texte, bouton, lgTexte) {
    arreterVoix();
    var lg = lgTexte || etat.lg, srv = serveurVoix(), refusLangue = false;
    var essai = srv ? fetch(srv + "/naya/voix", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texte: String(texte).slice(0, 1200), langue: lg }) })
      .then(function (r) { if (r.status === 409) refusLangue = true; return r.ok && /audio/.test(r.headers.get("Content-Type") || "") ? r.blob().then(function (b) { return { blob: b, nom: decodeURIComponent(r.headers.get("X-Naya-Voix") || "Naya") }; }) : null; })
      .catch(function () { return null; }) : Promise.resolve(null);
    essai.then(function (res) {
      if (res) {
        lecture = new Audio(URL.createObjectURL(res.blob));
        var p = lecture.play(); if (p && p.catch) p.catch(function () { noteVoix(bouton, t("voix_touche")); });
        noteVoix(bouton, t("voix_melanie", { n: res.nom })); return;
      }
      if (refusLangue) { noteVoix(bouton, t("voix_langue")); return; }
      if (!VOIX_SECOURS_APPAREIL) { noteVoix(bouton, t("voix_indispo")); return; }
      if (!("speechSynthesis" in window)) { noteVoix(bouton, t("voix_aucune")); return; }
      voixPretes().then(function () {
        var v = voixFeminine(lg);
        // Jamais de voix choisie au hasard par le navigateur : sans voix féminine connue, la réponse reste écrite.
        if (!v) { noteVoix(bouton, t("voix_aucune")); return; }
        var u = new SpeechSynthesisUtterance(String(texte).replace(/≈\s?/g, t("environ")).replace(/[•«»"*#|]|[\u2190-\u2BFF\uFE0F]|\p{Extended_Pictographic}/gu, " ").slice(0, 900));
        try { u.voice = v; } catch (_) { noteVoix(bouton, t("voix_aucune")); return; }
        u.lang = v.lang; u.rate = 0.97;
        speechSynthesis.speak(u);
        noteVoix(bouton, t("voix_secours", { n: v.name.replace(/\s*\(.*$/, "") }));
      });
    });
  }
  function envoyer(brut) {
    var q = String(brut || "").trim().slice(0, 1000); if (!q) return;
    el.saisie.value = "";
    ajouter("client", { texte: q });
    var lg = detecterLangue(q), note = "";
    if (BIENTOT[lg]) { ajouter("naya", { texte: PAS_ENCORE[lg].replace("{l}", NOM_LG[etat.lg]), intention: "langue_non_prise_en_charge" }); return; }
    else if (lg !== etat.lg && ACTIVES.indexOf(lg) >= 0) { changerLangue(lg); note = t("langue_auto") + "\n\n"; }
    chargerKB(etat.lg).then(function (k) {
      var rep = repondre(q, k); rep.texte = note + rep.texte; ajouter("naya", rep);
    }, function () { ajouter("naya", { texte: note + t("inconnu") }); });
  }

  function demarrer() {
    if (document.getElementById("naya-btn")) return;
    construire();
    // Point d'accès pour les tests automatiques et pour l'aide contextuelle des autres onglets.
    window.Naya = { ouvrir: function () { basculer(true); }, fermer: function () { basculer(false); }, demander: function (q) { basculer(true); envoyer(q); },
      repondre: function (q, lg) { return chargerKB(lg || etat.lg).then(function (k) { var a = etat.lg; if (lg) etat.lg = lg; try { return repondre(q, k); } finally { etat.lg = a; } }); },
      langue: function () { return etat.lg; },
      voixDeSecours: function (lg) { var v = voixFeminine(lg); return v ? v.name + " (" + v.lang + ")" : null; } };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
