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
    paiement: { fr: "Pour payer : envoie le montant par Orange Money ou MTN Mobile Money aux numéros affichés dans l'onglet 💳 Commander, puis envoie ta capture sur WhatsApp. Tu reçois ton CODE StarClip sur WhatsApp. Pas de carte bancaire pour l'instant.", en: "To pay: send the amount by Orange Money or MTN Mobile Money to the numbers shown in the « 💳 Commander » (Order) tab, then send your screenshot on WhatsApp. You receive your StarClip CODE on WhatsApp. No card payment for now.", de: "So bezahlen Sie: Senden Sie den Betrag per Orange Money oder MTN Mobile Money an die im Tab « 💳 Commander » (Bestellen) angezeigten Nummern und schicken Sie dann Ihren Screenshot per WhatsApp. Sie erhalten Ihren StarClip-CODE per WhatsApp. Kartenzahlung ist vorerst nicht möglich." },
    packs: { fr: "Packs affichés dans l'app", en: "Packs shown in the app", de: "In der App angezeigte Pakete" },
    signature: { fr: "Clips réalisés par Studio Rudis", en: "Videos made by Studio Rudis", de: "Videos von Studio Rudis" },
    prix_moteur: { fr: "Prix affiché dans l'app pour {m}", en: "Price shown in the app for {m}", de: "In der App angezeigter Preis für {m}" },
    debite: { fr: "Débité seulement quand tu appuies toi-même sur le bouton de création.", en: "Charged only when you tap the create button yourself.", de: "Abgebucht erst, wenn Sie selbst auf Erstellen tippen." },
    prix_absent: { fr: "Je ne trouve pas ce prix dans l'app : ouvre l'onglet concerné, le prix exact s'y affiche avant tout lancement.", en: "I can't find this price in the app: open the tab concerned, the exact price is shown there before anything starts.", de: "Ich finde diesen Preis nicht in der App: Öffnen Sie den betreffenden Tab, dort wird der genaue Preis vor jedem Start angezeigt." },
    reprise: { fr: "Améliorer ma démo en mode Reprise : 999 FCFA.", en: "« 🎙️ Améliorer ma démo » (Improve my demo), « Reprise » (Cover) mode: 999 FCFA.", de: "« 🎙️ Améliorer ma démo » (Meine Demo verbessern), Modus « Reprise » (Cover): 999 FCFA." },
    resume_prix: { fr: "Quelques prix affichés dans l'app (outils Premium, payés sur ton solde) :", en: "Some prices shown in the app (Premium tools, paid from your balance):", de: "Einige Preise aus der App (Premium-Werkzeuge, vom Guthaben bezahlt):" },
    ouvrir: { fr: "Ouvrir", en: "Open", de: "Öffnen" },
    ouvrir_cmd: { fr: "Ouvrir 💳 Commander", en: "Open 💳 Order", de: "💳 Bestellen öffnen" },
    ouvrir_x: { fr: "Ouvrir {x}", en: "Open {x}", de: "{x} öffnen" },
    reference: { fr: "Référence", en: "Reference", de: "Referenz" },
    genre_titre: { fr: "Exemples de prompt", en: "Prompt examples", de: "Prompt-Beispiele" },
    ex_fr: { fr: "", en: "(examples written in French: the engine understands them)", de: "(Beispiele auf Französisch: Das Modell versteht sie)" },
    debutant_ex: { fr: "Débutant", en: "Beginner", de: "Einsteiger" },
    pro_ex: { fr: "Pro", en: "Pro", de: "Profi" },
    charger: { fr: "Charger", en: "Load", de: "Laden" },
    avec_paroles: { fr: "🎤 Avec paroles", en: "🎤 With lyrics", de: "🎤 Mit Text" },
    instrumental: { fr: "🎹 Instrumental", en: "🎹 Instrumental", de: "🎹 Instrumental" },
    charger_titre: { fr: "Charger un exemple dans Chanson Pro (rien n'est lancé) :", en: "Load an example into Chanson Pro (nothing starts):", de: "Ein Beispiel in Chanson Pro laden (nichts wird gestartet):" },
    charge_ok: { fr: "C'est chargé dans Chanson Pro. Modifie-le librement : rien n'est lancé, le prix s'affiche sous le formulaire.", en: "Loaded into Chanson Pro. Edit it freely: nothing has started, the price is shown below the form.", de: "In Chanson Pro geladen. Ändern Sie es frei: Nichts wurde gestartet, der Preis steht unter dem Formular." },
    charge_ko: { fr: "Je n'ai pas pu ouvrir Chanson Pro ici. Ouvre l'onglet 👑 Admin Premium 5.0, puis ⭐ Chanson Pro, choisis le genre et touche « ✨ Essayer un prompt exemple ».", en: "I couldn't open Chanson Pro here. Open the 👑 Admin Premium 5.0 tab, then ⭐ Chanson Pro, choose the genre and tap « ✨ Essayer un prompt exemple » (Try an example prompt).", de: "Ich konnte Chanson Pro hier nicht öffnen. Öffnen Sie den Tab 👑 Admin Premium 5.0, dann ⭐ Chanson Pro, wählen Sie das Genre und tippen Sie auf « ✨ Essayer un prompt exemple » (Beispiel-Prompt ausprobieren)." },
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
    dev_wa_absent: { fr: "Je ne trouve pas le lien WhatsApp officiel dans l'app : copie le texte et envoie-le depuis l'onglet 💳 Commander.", en: "I can't find the official WhatsApp link in the app: copy the text and send it from the « 💳 Commander » (Order) tab.", de: "Ich finde den offiziellen WhatsApp-Link nicht in der App: Kopieren Sie den Text und senden Sie ihn über den Tab « 💳 Commander » (Bestellen)." },
    essai_fini: { fr: "La période de test de StarClip est terminée : il n'y a plus de code d'essai. Pour commencer :\n1. choisis ton pack dans l'onglet 💳 Commander ;\n2. paie par Orange Money ou MTN Mobile Money ;\n3. envoie la capture sur WhatsApp ;\n4. entre le code reçu en haut de l'app et touche OK. Ce code est ton compte : il garde tes crédits.", en: "The StarClip test period is over: there are no more trial codes. To get started:\n1. choose your pack in the « 💳 Commander » (Order) tab;\n2. pay with Orange Money or MTN Mobile Money;\n3. send the screenshot on WhatsApp;\n4. enter the code you receive at the top of the app and tap OK. This code is your account: it keeps your credits.", de: "Die Testphase von StarClip ist beendet: Es gibt keine Testcodes mehr. So fangen Sie an:\n1. Wählen Sie Ihr Paket im Tab « 💳 Commander » (Bestellen);\n2. bezahlen Sie mit Orange Money oder MTN Mobile Money;\n3. senden Sie den Screenshot per WhatsApp;\n4. geben Sie den erhaltenen Code oben in der App ein und tippen Sie auf OK. Dieser Code ist Ihr Konto: Er speichert Ihr Guthaben." },
    langue_auto: { fr: "Je passe en français.", en: "Switching to English.", de: "Ich wechsle zu Deutsch." },
    voix_melanie: { fr: "🎙️ Voix de Naya : {n}", en: "🎙️ Naya's voice: {n}", de: "🎙️ Nayas Stimme: {n}" },
    voix_secours: { fr: "Voix de secours de ton appareil ({n}) : la voix de Naya n'est pas disponible pour le moment.", en: "Backup voice from your device ({n}): Naya's voice is not available right now.", de: "Ersatzstimme Ihres Geräts ({n}): Nayas Stimme ist gerade nicht verfügbar." },
    voix_aucune: { fr: "La voix n'est pas disponible pour le moment sur cet appareil : la réponse reste écrite.", en: "The voice is not available on this device right now: the answer stays in writing.", de: "Die Stimme ist auf diesem Gerät gerade nicht verfügbar: Die Antwort bleibt schriftlich." },
    voix_indispo: { fr: "La voix de Naya (Mélanie) n'est pas disponible pour le moment : la réponse reste écrite.", en: "Naya's voice (Lara) is not available right now: the answer stays in writing.", de: "Nayas Stimme (Lea) ist gerade nicht verfügbar: Die Antwort bleibt schriftlich." },
    voix_langue: { fr: "La voix de Naya n'est pas disponible pour cette réponse : elle reste écrite.", en: "Naya's voice is not available for this answer: it stays in writing.", de: "Nayas Stimme ist für diese Antwort nicht verfügbar: Sie bleibt schriftlich." },
    voix_touche: { fr: "Touche encore « Écouter » pour lancer la lecture.", en: "Tap « Listen » again to start playback.", de: "Tippen Sie erneut auf « Anhören », um die Wiedergabe zu starten." },
    environ: { fr: "environ ", en: "about ", de: "etwa " },
    securite: { fr: "Je suis Naya, l'assistante StarClip. Je peux vous expliquer comment utiliser nos outils, créer vos projets et choisir nos services. En revanche, le code interne, les accès administratifs et les informations confidentielles de StarClip ne sont pas communicables.", en: "I'm Naya, the StarClip assistant. I can explain how to use our tools, create your projects and choose our services. However, StarClip's internal code, administrative access and confidential information cannot be shared.", de: "Ich bin Naya, die StarClip-Assistentin. Ich erkläre Ihnen gern, wie Sie unsere Werkzeuge nutzen, Ihre Projekte erstellen und unsere Dienste auswählen. Interner Code, Administratorzugänge und vertrauliche Informationen von StarClip können jedoch nicht weitergegeben werden." },
    // v41.160 : réponses guidées (faits repris du manuel et de l'app, jamais inventés)
    guide_intro: { fr: "Bienvenue ! Voici comment utiliser StarClip, étape par étape.", en: "Welcome! Here is how to use StarClip, step by step.", de: "Willkommen! So nutzen Sie StarClip, Schritt für Schritt." },
    guide_code: { fr: "1) Obtiens ton code StarClip : il donne accès aux outils et porte tes crédits.", en: "1) Get your StarClip code: it unlocks the tools and holds your credits.", de: "1) Holen Sie sich Ihren StarClip-Code: Er schaltet die Werkzeuge frei und enthält Ihr Guthaben." },
    guide_etapes: { fr: "2) Crée ton clip, toujours dans le même ordre :", en: "2) Create your video, always in the same order:", de: "2) Erstellen Sie Ihr Video, immer in derselben Reihenfolge:" },
    guide_premium: { fr: "3) Pour aller plus loin, les outils Premium (vidéo haut de gamme, chanson, Chanson Pro, stems…) sont dans l'onglet « 👑 Admin Premium 5.0 ». Ils se paient à l'unité sur ton solde Premium, et le prix s'affiche avant chaque lancement.", en: "3) To go further, the Premium tools (high-end video, song, Chanson Pro, stems…) are in the « 👑 Admin Premium 5.0 » tab. They are paid per use from your Premium balance, and the price is shown before each launch.", de: "3) Für mehr Möglichkeiten finden Sie die Premium-Werkzeuge (hochwertiges Video, Song, Chanson Pro, Stems…) im Tab « 👑 Admin Premium 5.0 ». Sie werden einzeln von Ihrem Premium-Guthaben bezahlt, und der Preis wird vor jedem Start angezeigt." },
    guide_suite: { fr: "Dis-moi ce que tu veux créer, je te guide :", en: "Tell me what you want to create and I'll guide you:", de: "Sagen Sie mir, was Sie erstellen möchten – ich führe Sie:" },
    achat_intro: { fr: "Pour utiliser StarClip, tu achètes un code StarClip : pas d'abonnement, pas de carte bancaire. Voici comment faire :", en: "To use StarClip, you buy a StarClip code: no subscription, no bank card. Here is how:", de: "Um StarClip zu nutzen, kaufen Sie einen StarClip-Code: kein Abo, keine Bankkarte. So geht's:" },
    video_intro: { fr: "Pour créer une vidéo, tu as plusieurs possibilités :", en: "To create a video, you have several options:", de: "Für ein Video haben Sie mehrere Möglichkeiten:" },
    video_fin: { fr: "Commence toujours par une bonne photo (onglet « 📸 Ta photo »). Le prix s'affiche avant chaque lancement.", en: "Always start with a good photo (« 📸 Ta photo » (Your photo) tab). The price is shown before each launch.", de: "Beginnen Sie immer mit einem guten Foto (Tab « 📸 Ta photo » (Ihr Foto)). Der Preis wird vor jedem Start angezeigt." },
    chanson_intro: { fr: "Pour créer une chanson, deux outils (onglet « 👑 Admin Premium 5.0 ») :", en: "To create a song, two tools (« 👑 Admin Premium 5.0 » tab):", de: "Für einen Song gibt es zwei Werkzeuge (Tab « 👑 Admin Premium 5.0 »):" },
    chanson_fin: { fr: "Dis-moi ton genre (makossa, bikutsi, afropop…) et je te propose un exemple de prompt.", en: "Tell me your genre (makossa, bikutsi, afropop…) and I'll suggest an example prompt.", de: "Nennen Sie mir Ihr Genre (Makossa, Bikutsi, Afropop…), und ich schlage Ihnen einen Beispiel-Prompt vor." },
    moteur_intro: { fr: "Voici les moteurs et ce que fait chacun :", en: "Here are the engines and what each one does:", de: "Hier sind die Modelle und was jedes kann:" },
    moteur_bref: { fr: "En bref : une vidéo avec ton propre visage → Seedance 2.5 ; sans visage réel → Seedance 2.0 Moteur A ; plusieurs plans → Multi-Shot Video ; modifier une vidéo existante → Aleph 2.0.", en: "In short: a video with your own face → Seedance 2.5; no real face → Seedance 2.0 Engine A; several shots → Multi-Shot Video; edit an existing video → Aleph 2.0.", de: "Kurz gesagt: Video mit Ihrem eigenen Gesicht → Seedance 2.5; ohne echtes Gesicht → Seedance 2.0 Modell A; mehrere Einstellungen → Multi-Shot Video; vorhandenes Video bearbeiten → Aleph 2.0." },
    ici_intro: { fr: "Dans cet onglet ({o}) :", en: "In this tab ({o}):", de: "In diesem Tab ({o}):" },
    clarif: { fr: "Avec plaisir ! Pour te répondre précisément, dis-moi ce que tu cherches :", en: "Happy to help! To answer precisely, tell me what you are looking for:", de: "Gern helfe ich Ihnen! Damit ich genau antworten kann: Was suchen Sie?" },
    clarif_flou: { fr: "Je ne suis pas sûre d'avoir bien compris. Tu cherches plutôt :", en: "I'm not sure I understood. Are you looking for:", de: "Ich bin nicht sicher, ob ich Sie richtig verstanden habe. Suchen Sie eher:" },
    op_debuter: { fr: "🚀 Débuter avec StarClip", en: "🚀 Get started with StarClip", de: "🚀 Erste Schritte mit StarClip" },
    op_video: { fr: "🎬 Créer une vidéo", en: "🎬 Create a video", de: "🎬 Ein Video erstellen" },
    op_chanson: { fr: "🎵 Créer une chanson", en: "🎵 Create a song", de: "🎵 Einen Song erstellen" },
    op_moteur: { fr: "⚙️ Choisir un moteur", en: "⚙️ Choose an engine", de: "⚙️ Ein Modell wählen" },
    op_prix: { fr: "💰 Voir les prix", en: "💰 See the prices", de: "💰 Preise ansehen" },
    op_acheter: { fr: "💳 Acheter un code", en: "💳 Buy a code", de: "💳 Einen Code kaufen" },
    op_signature: { fr: "🎬 Un clip réalisé par le studio", en: "🎬 A music video made by the studio", de: "🎬 Ein Musikvideo vom Studio" },
    // v41.160 : bandeau d'aide et micro
    ban_txt: { fr: "Besoin d'aide ? Naya vous accompagne. Parlez à Naya ou écrivez-lui. Elle vous guidera pas à pas pour créer vos chansons, vidéos et clips professionnels.", en: "Need help? Naya is here for you. Talk to Naya or write to her. She will guide you step by step to create your songs, videos and professional music videos.", de: "Brauchen Sie Hilfe? Naya begleitet Sie. Sprechen Sie mit Naya oder schreiben Sie ihr. Sie führt Sie Schritt für Schritt zu Ihren Songs, Videos und professionellen Musikclips." },
    ban_parler: { fr: "🎤 Parler à Naya", en: "🎤 Talk to Naya", de: "🎤 Mit Naya sprechen" },
    ban_ecrire: { fr: "✍️ Écrire à Naya", en: "✍️ Write to Naya", de: "✍️ Naya schreiben" },
    micro: { fr: "Parler à Naya", en: "Talk to Naya", de: "Mit Naya sprechen" },
    micro_ecoute: { fr: "🎤 Je t'écoute… parle maintenant.", en: "🎤 I'm listening… speak now.", de: "🎤 Ich höre zu… sprechen Sie jetzt." },
    micro_indispo: { fr: "La dictée n'est pas disponible dans ce navigateur : touche la zone de saisie, puis le micro 🎤 de ton clavier pour dicter ta question.", en: "Voice input isn't available in this browser: tap the text box, then the 🎤 microphone on your keyboard to dictate your question.", de: "Die Spracheingabe ist in diesem Browser nicht verfügbar: Tippen Sie in das Eingabefeld und dann auf das 🎤 Mikrofon Ihrer Tastatur." },
    micro_refus: { fr: "Je n'ai pas accès au micro. Autorise le micro pour ce site dans les réglages du navigateur, ou écris ta question.", en: "I can't access the microphone. Allow the microphone for this site in your browser settings, or type your question.", de: "Ich habe keinen Zugriff auf das Mikrofon. Erlauben Sie das Mikrofon für diese Seite in den Browser-Einstellungen oder schreiben Sie Ihre Frage." },
    micro_rien: { fr: "Je n'ai rien entendu. Touche 🎤 pour réessayer, ou écris ta question.", en: "I didn't hear anything. Tap 🎤 to try again, or type your question.", de: "Ich habe nichts gehört. Tippen Sie auf 🎤, um es erneut zu versuchen, oder schreiben Sie Ihre Frage." }
  };
  // Langues pas encore prises en charge : une seule phrase, écrite à l'avance, puis réponse en français ou en anglais.
  var PAS_ENCORE = {
    es: "Todavía no hablo español en StarClip: te respondo en {l}. Puedes elegir English o Deutsch arriba.",
    pt: "Ainda não falo português no StarClip: respondo em {l}. Pode escolher English ou Deutsch acima.",
    ar: "لا أتحدث العربية بعد في StarClip، سأجيبك بـ{l}. يمكنك اختيار English أو Deutsch في الأعلى."
  };
  var NOM_LG = { fr: "français", en: "English", de: "Deutsch" };
  // v41.160 : l'app est en français. En anglais et en allemand, Naya traduit les noms d'onglets, d'outils et de
  // genres qu'elle affiche, ainsi que les lignes de tarifs lues dans l'app (prix et noms de marque inchangés).
  var NOMS_APP = {
    en: { "🎬 Accueil": "🎬 Home", "📸 Ta photo": "📸 Your photo", "✨ Traitement": "✨ Enhancement", "👔 Habillage & Décor": "👔 Outfit & Setting",
      "🎬 Scénario": "🎬 Script", "🎞️ Mini-séries IA": "🎞️ AI mini-series", "🔁 Remix": "🔁 Remix", "🎤 Finition": "🎤 Finishing", "💳 Commander": "💳 Order",
      "📝 Prompts": "📝 Prompts", "💡 Idées": "💡 Ideas", "📜 Tout voir": "📜 See all",
      "🎵 Chanson": "🎵 Song", "⭐ Chanson Pro — qualité studio": "⭐ Chanson Pro — studio quality", "🎙️ Améliorer ma démo": "🎙️ Improve my demo", "🎚️ Extraire les stems": "🎚️ Extract stems",
      "🎷 Rumba congolaise": "🎷 Congolese rumba", "🙏 Gospel africain": "🙏 African gospel", "💔 Ballade": "💔 Ballad",
      "👨 Voix d'homme": "👨 Male voice", "👩 Voix de femme": "👩 Female voice", "👫 Duo H + F": "👫 Duo M + F", "🎙️ Avec chœur": "🎙️ With choir" },
    de: { "🎬 Accueil": "🎬 Start", "📸 Ta photo": "📸 Ihr Foto", "✨ Traitement": "✨ Bearbeitung", "👔 Habillage & Décor": "👔 Outfit & Kulisse",
      "🎬 Scénario": "🎬 Drehbuch", "🎞️ Mini-séries IA": "🎞️ KI-Miniserien", "🔁 Remix": "🔁 Remix", "🎤 Finition": "🎤 Feinschliff", "💳 Commander": "💳 Bestellen",
      "📝 Prompts": "📝 Prompts", "💡 Idées": "💡 Ideen", "📜 Tout voir": "📜 Alles anzeigen",
      "🎵 Chanson": "🎵 Song", "⭐ Chanson Pro — qualité studio": "⭐ Chanson Pro — Studioqualität", "🎙️ Améliorer ma démo": "🎙️ Meine Demo verbessern", "🎚️ Extraire les stems": "🎚️ Stems extrahieren",
      "🎷 Rumba congolaise": "🎷 Kongolesische Rumba", "🙏 Gospel africain": "🙏 Afrikanischer Gospel", "💔 Ballade": "💔 Ballade",
      "👨 Voix d'homme": "👨 Männerstimme", "👩 Voix de femme": "👩 Frauenstimme", "👫 Duo H + F": "👫 Duo M + F", "🎙️ Avec chœur": "🎙️ Mit Chor" }
  };
  var nomApp = function (x) { var d = NOMS_APP[etat.lg]; x = String(x || "").replace(/\s+/g, " ").trim(); return (d && d[x]) || x; };
  // Lignes de tarifs de l'onglet 💳 Commander (texte français de l'app) : seuls les mots descriptifs sont traduits.
  var TARIFS_TR = {
    en: [[/\(chant \+ tenue\)/, "(singing + outfit)"], [/(\d+) scènes? Éco/, "$1 Eco scene(s)"], [/(\d+) scènes? Pro/, "$1 Pro scenes"],
      [/\(jusqu'à (\d+) s\)/, "(up to $1 s)"], [/(\d+) à (\d+) minutes/, "$1 to $2 minutes"], [/plus de scènes, (\d+) formats/, "more scenes, $1 formats"],
      [/scénario élaboré, corrections/, "detailed script, revisions"]],
    de: [[/\(chant \+ tenue\)/, "(Gesang + Outfit)"], [/(\d+) scènes? Éco/, "$1 Eco-Szene(n)"], [/(\d+) scènes? Pro/, "$1 Pro-Szenen"],
      [/\(jusqu'à (\d+) s\)/, "(bis zu $1 s)"], [/(\d+) à (\d+) minutes/, "$1 bis $2 Minuten"], [/plus de scènes, (\d+) formats/, "mehr Szenen, $1 Formate"],
      [/scénario élaboré, corrections/, "ausgearbeitetes Drehbuch, Korrekturen"]]
  };
  var tarifLg = function (x) { (TARIFS_TR[etat.lg] || []).forEach(function (r) { x = x.replace(r[0], r[1]); }); return x; };
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
  // Chapitres du studio (réservés à l'Admin) : jamais cités aux clients.
  var CHAP_STUDIO = { fonctionsReservees: 1, seedance2studio: 1, miniseries: 1, montageAuto: 1 };

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
    var cl = k.docs.filter(function (d) { return !CHAP_STUDIO[d.s.c]; }).map(function (d) {
      var c = tt.filter(function (x) { return d.plein.indexOf(racine(x)) >= 0; }).length / tt.length;
      return { d: d, couv: c, score: sc[d.s.c + "#" + d.s.r] || 0 };
    }).sort(function (a, b) { return b.couv - a.couv || b.score - a.score; });
    var best = cl[0];
    if (!best || best.couv < COUV_MIN || (best.score < SEUIL && best.couv < 1)) return null;
    // v41.160 : la rubrique citée est celle qui contient le plus de mots de la question (à égalité : tutoriel selon le niveau),
    // et elle doit en contenir au moins un — sinon ce n'est pas une réponse, Naya demande une précision.
    var ss = k.sections.filter(function (s) { return s.c === best.d.s.c && s.x; });
    var prefs = RUBRIQUES[etat.niveau] || RUBRIQUES.debutant;
    var rang = function (s) { var i = prefs.indexOf(s.r); return i < 0 ? 9 : i; };
    var couv = function (s) { var p = plier(s.x); return tt.filter(function (x) { return p.indexOf(racine(x)) >= 0; }).length; };
    var choisie = ss.slice().sort(function (a, b) { return couv(b) - couv(a) || rang(a) - rang(b); })[0] || best.d.s;
    if (!couv(choisie) && !tt.some(function (x) { return best.d.titre.indexOf(racine(x)) >= 0; })) return null;
    return { chapitre: best.d.s.c, titre: best.d.s.t, rubrique: choisie.r, texte: couper(choisie.x, 1000) };
  }

  // ───────────── Langue du message ─────────────
  var MOTS_LG = {
    fr: "je tu vous le la les est comment pour avec une mon ma pas quoi combien bonjour merci et acheter commencer utiliser faire veux besoin aide quel quelle où".split(" "),
    en: "i you the is how for with my what can do does hello thanks please and it to buy get start use make want need help which where".split(" "),
    de: "ich sie du der die das ist wie für mit mein meine was kann hallo danke bitte und nicht kaufe kaufen anfangen arbeiten mache machen brauche hilfe welche welches wo".split(" "),
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
        case "pmFermer": return typeof pmFermer !== "undefined" ? pmFermer : null;
        // v41.160 : le guide sait seulement SI un code est saisi (oui / non), jamais lequel.
        case "codePresent": return typeof getCode !== "undefined" ? !!getCode() : false;
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
    var p = " " + plier(q).replace(/[^a-z0-9&]+/g, " ") + " ";
    var a = Object.keys(ALIAS_GENRE).filter(function (k) { return p.indexOf(" " + k.replace(/-/g, " ") + " ") >= 0; })[0];
    if (a) return ALIAS_GENRE[a];
    return Object.keys(E).sort(function (x, y) { return y.length - x.length; }).filter(function (g) { return p.indexOf(" " + g + " ") >= 0 || p.indexOf(" " + g + "s ") >= 0; })[0] || null;
  }
  // v41.160 : description des genres (chanson-exemples.js est en français) ; les prompts restent en français (voir ex_fr).
  var DESC_GENRE = {
    "afropop": { en: "Afropop is a family of African pop styles. This example aims at Cameroonian afropop: bright melody, clean guitars, singing bass, a chorus to sing along.", de: "Afropop ist eine Familie afrikanischer Popstile. Dieses Beispiel zielt auf kamerunischen Afropop: helle Melodie, klare Gitarren, singender Bass, ein Refrain zum Mitsingen." },
    "afrobeats": { en: "Afrobeats is the modern pop from Nigeria and Ghana: supple programmed percussion, deep bass, a melodic voice with ad-libs. Not to be confused with 1970s afrobeat (big brass band).", de: "Afrobeats ist der moderne Pop aus Nigeria und Ghana: geschmeidige programmierte Perkussion, tiefer Bass, melodische Stimme mit Ad-libs. Nicht zu verwechseln mit dem Afrobeat der 1970er-Jahre (großes Bläserorchester)." },
    "amapiano": { en: "Amapiano comes from South Africa: percussive « log drum » bass, jazzy piano chords, offbeat shakers, a deep and hypnotic house mood.", de: "Amapiano kommt aus Südafrika: perkussiver « Log-Drum »-Bass, jazzige Klavierakkorde, versetzte Shaker, eine tiefe, hypnotische House-Stimmung." },
    "makossa": { en: "Makossa comes from Douala. Its heart is the dialogue between a melodic, syncopated electric bass, the drums, interlocking clean guitars and a voice answering the choir. A plain afrobeats rhythm is not enough.", de: "Makossa kommt aus Douala. Sein Kern ist der Dialog zwischen einem melodischen, synkopierten E-Bass, dem Schlagzeug, ineinandergreifenden klaren Gitarren und einer Stimme, die dem Chor antwortet. Ein einfacher Afrobeats-Rhythmus reicht nicht." },
    "bikutsi": { en: "Bikutsi comes from Central Cameroon (Beti). It rests on a fast, hammering ternary rhythm cycle, muted-string guitars imitating the balafon, and energetic voices locking in with the percussion.", de: "Bikutsi kommt aus Zentralkamerun (Beti). Er beruht auf einem schnellen, hämmernden Dreierrhythmus, Gitarren mit abgedämpften Saiten, die das Balafon nachahmen, und energischen Stimmen, die mit der Perkussion verzahnt sind." },
    "coupe": { en: "Coupé-décalé comes from Côte d'Ivoire: very dense electronic percussion, a slogan chorus, dance instructions and a party atmosphere.", de: "Coupé-décalé kommt aus der Elfenbeinküste: sehr dichte elektronische Perkussion, ein Slogan-Refrain, Tanzanweisungen und Partystimmung." },
    "ndombolo": { en: "Ndombolo comes from Kinshasa: a sebene of fast lead guitars, tight drums, and a hype man calling out shouts and dance steps.", de: "Ndombolo kommt aus Kinshasa: ein Sebene aus schnellen Leadgitarren, knappes Schlagzeug und ein Animateur, der Rufe und Tanzschritte vorgibt." },
    "rumba": { en: "Congolese rumba, on UNESCO's heritage list, is elegant and romantic: interwoven clean guitars, harmonised voices, then a more danceable sebene.", de: "Die kongolesische Rumba, UNESCO-Kulturerbe, ist elegant und romantisch: verflochtene klare Gitarren, mehrstimmiger Gesang, dann ein tanzbarerer Sebene." },
    "highlife": { en: "Highlife comes from Ghana: bright melodic guitars, jazzy horns, a bell pattern and harmonised voices in a joyful colour.", de: "Highlife kommt aus Ghana: helle melodische Gitarren, jazzige Bläser, ein Glockenmuster und mehrstimmiger Gesang in fröhlicher Farbe." },
    "gospel": { en: "African gospel celebrates faith: a powerful soloist, an answering choir, piano, organ, handclaps and a final build-up.", de: "Afrikanischer Gospel feiert den Glauben: kraftvolle Solostimme, antwortender Chor, Klavier, Orgel, Klatschen und eine Steigerung zum Schluss." },
    "afrorb": { en: "Afro R&B blends the softness of R&B with light afro percussion: slow tempo, intimate voice, night-time mood.", de: "Afro R&B verbindet die Sanftheit des R&B mit leichter Afro-Perkussion: langsames Tempo, intime Stimme, nächtliche Stimmung." },
    "kizomba": { en: "Kizomba, born in Angola, is slow, sensual music for couple dancing, with a deep synth bass and a soft electronic rhythm.", de: "Kizomba, in Angola entstanden, ist langsame, sinnliche Musik für den Paartanz, mit tiefem Synthbass und sanftem elektronischem Rhythmus." },
    "afrotrap": { en: "Afro-trap mixes trap codes (rolling hi-hats, 808 bass) with afro percussion and guitars, with rapped verses and a sung chorus.", de: "Afro-Trap mischt Trap-Elemente (rollende Hi-Hats, 808-Bass) mit Afro-Perkussion und Gitarren, mit gerappten Strophen und gesungenem Refrain." },
    "dancehall": { en: "Afro-dancehall combines Jamaica's dembow rhythm with afro percussion, with chanted vocals (toasting) and a melodic chorus.", de: "Afro-Dancehall verbindet den Dembow-Rhythmus Jamaikas mit Afro-Perkussion, mit skandiertem Gesang (Toasting) und melodischem Refrain." },
    "afrojazz": { en: "Afro-jazz joins jazz harmony (extended chords, solos) with African rhythms, in an acoustic club sound.", de: "Afro-Jazz verbindet die Harmonik des Jazz (erweiterte Akkorde, Soli) mit afrikanischen Rhythmen, in einem akustischen Clubsound." },
    "ballade": { en: "The African ballad is slow and moving: acoustic guitar, piano, soft strings and a voice that rises to a powerful final chorus.", de: "Die afrikanische Ballade ist langsam und bewegend: Akustikgitarre, Klavier, sanfte Streicher und eine Stimme, die sich bis zu einem kraftvollen Schlussrefrain steigert." }
  };
  function libGenre(id) { var L = G("CHP_GENRES") || []; var g = L.filter(function (x) { return x.id === id; })[0]; return g ? nomApp(g.l) : id; }

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
    capacites: /(tu (sais|peux) faire quoi|que (sais|peux)[- ]tu faire|qu.est-ce que tu (fais|sais faire)|what can you do|what do you do|was kannst du|was machst du)/i,
    lancer: /(lance[- ](la|le|les|moi|pour moi)|g[ée]n[èe]re[- ](la|le|moi|pour moi)|cr[ée]e[- ](la|le|moi)|fais[- ](la|le)\b|start it|generate it|run it|make it for me|starte es|generiere es|erstelle es)/i,
    deleguer: /(studio rudis|clip signature|premium cin[ée]ma|r[ée]alis[ée] par (le |un |des )?(studio|pro)|clip (pro|professionnel|complet)|(demander|commander|faire faire) un clip|professional (music )?video|professionelle?s? (musik)?video|fai(tes|s)[- ]le pour moi|d[ée]l[ée]guer|devis|une offre|\bquote\b|do it for me|made by the studio|music video made|angebot|vom studio|für mich (machen|erstellen))/i,
    abonnement: /(abonnement|obligatoire|subscription|do i have to|\babo\b|pflicht)/i,
    paiement: /(payer|paiement|orange money|\bmomo\b|mobile money|recharg|\bpacks?\b|essai star|\bpay\b|payment|top ?up|bezahlen|zahlung|aufladen|paket)/i,
    prix: /(prix|co[uû]t|combien|tarif|price|cost|how much|kostet|kosten|preis)/i,
    verifier: /^(v[ée]rifie|corrige|check|pr[üu]fe?)\s*:?\s*/i,
    prompt: /(prompt|[ée]crire|r[ée]diger|d[ée]crire|exemple|example|beispiel|write|describe|schreiben|beschreiben)/i,
    erreur: /(erreur|error|refus|refused|marche pas|bloqu|[ée]chou|failed|ne fonctionne|doesn.t work|fehler|abgelehnt|funktioniert nicht)/i
  };


  // ───────────── v41.160 : sécurité ─────────────
  // Naya n'a accès à AUCUN secret : elle tourne dans le navigateur, lit le manuel public et les prix affichés par l'app.
  // Ce filtre refuse poliment les demandes de secrets, de code interne, de contournement ou de manipulation, avec une
  // réponse fixe (aucun détail, aucune accusation). Les vraies protections sont côté serveur (PIN limité, plafonds).
  var SECURITE = new RegExp([
    "cl(e|es) (d )?api", "api[ -]?(key|keys|schlussel|token)", "\\btokens?\\b", "\\bsecrets?\\b", "geheimnis", "mot de passe", "password", "passwort", "kennwort",
    "\\bpin\\b", "identifiants? (admin|d acces|de connexion|prives?)", "\\bcredentials?\\b", "zugangsdaten", "variables? d environnement", "environment variables?",
    "umgebungsvariablen?", "\\benv\\b", "cloudflare", "elevenlabs\\W+(cle|key|schlussel|token)", "(cle|key|schlussel) (d |von |de |of )?elevenlabs",
    "code source", "source ?code", "quellcode", "instructions? (systeme|internes?)", "system ?prompt", "prompt (systeme|interne)", "systemanweisung",
    "(montre|affiche|donne|revele|repete|ecris|show|reveal|print|display|give|repeat|tell|zeig|gib|nenne|verrate)\\w* (moi |me |mir |uns )?(ton|tes|votre|vos|your|deine|deinen|ihre|dein) (prompt|instructions|consignes|regles|rules|anweisungen|regeln|system|configuration|config)",
    "\\bendpoints?\\b", "routes? (admin|privees?|internes?|secretes?)", "\\bworker\\b", "\\bbackend\\b", "base de donnees", "\\bdatabase\\b", "datenbank", "\\bkv\\b",
    "contourn", "bypass", "umgeh", "\\bhack", "pirat", "\\bfaille", "\\bexploits?\\b", "\\binjection\\b", "jailbreak", "\\bdan mode\\b",
    "sans payer", "without pay", "ohne (zu )?(be)?zahlen", "illimite", "unlimited", "unbegrenzt",
    "(modifier|changer|augmenter|change|increase|edit|andern|erhohen|bearbeiten) (mes |mon |le |les |my |the |mein |meine |mein |das |den )?(credits?|solde|balance|guthaben)",
    "(credits?|solde|balance|guthaben) (zu )?(andern|erhohen|modifier|augmenter|increase|change)",
    "(compte|code|donnees|historique|projets?) d (un |une )?autres? (client|utilisateur|personne)", "(another|other) (user|customer|client|person)s?\\W? (account|code|data|projects?|videos?)",
    "(konto|code|daten|projekte?) (eines|von einem|von) anderen", "(customer|client|kunden)[ -]?(codes|liste|list|accounts|konten|comptes)", "codes? (des |der |of )?(clients|kunden|customers)", "(liste|list|alle|tous les|all) (des |der |of |the |les )?(codes|clients|kunden|customers|users|utilisateurs)",
    "(acces|droits|privileges?) (d )?(admin|administrateur)", "admin(istrator)? (access|rights|privileges?)", "admin(istrator)?-?(zugang|rechte)",
    "devenir admin", "become (an )?admin", "admin werden",
    "ignore\\w* (tes |les |vos |toutes (les |tes )?|your |all |all previous |previous |prior |the previous |the above |any )(instructions|consignes|regles|rules|directives|prompts?)",
    "ignoriere\\w* (alle |deine |die |vorherigen |bisherigen )+(anweisungen|regeln|vorgaben)", "oublie\\w* (tes|les|vos|toutes) (instructions|consignes|regles)",
    "forget (your|all|previous|the) (instructions|rules)", "vergiss\\w* (alle |deine )+(anweisungen|regeln)",
    "je suis (le |la |un |une )?(developpeu(r|se)|admin|administrat(eur|rice)|directeur|createur|proprietaire|patron|papy)",
    "i a?m (the |a |an )?(developer|dev|admin|administrator|owner|creator|director)", "ich bin (der |die |ein |eine )?(entwickler|admin|administrator|chef|inhaber|eigentumer)",
    "mode (admin|administrateur|developpeur|debug|dieu|god)", "(admin|developer|debug|god|dev|root) mode", "(admin|entwickler|debug)-?modus",
    "^\\W*(system|systeme|assistant|admin)\\s*:", "\\[(system|systeme|admin|instructions?)\\]", "<\\s*/?\\s*system", "#+ ?system"
  ].join("|"));
  function demandeSensible(q) { var p = plier(q).replace(/['’`]/g, " ").replace(/admin premium( 5\.?0)?/g, " "); return SECURITE.test(p) || ADMIN.test(p); }

  // ───────────── v41.160 : compréhension des questions naturelles ─────────────
  // 1. Normalisation : minuscules sans accents, « star clip » → starclip, mots de remplissage de la dictée retirés,
  //    lettres répétées réduites, puis fautes de frappe corrigées vers le vocabulaire des intentions (distance d'édition).
  var REMPLISSAGE = / (euh+|heu+|hmm+|ben|bah|um+|uh+|erm|ahm|aehm|also|bitte|please|stp|svp|s il (te|vous) plait|dis moi|sag mal|okay|ok|hey|naya)(?= )/g;
  var VOCAB = ("acheter achat achete commander commande payer paiement abonnement buy purchase order payment kaufen bestellen bezahlen erwerben " +
    "commencer debuter demarrer debutant start started begin beginner anfangen beginnen starten loslegen einsteiger " +
    "utiliser utilise fonctionne use using work works arbeiten benutzen nutzen verwenden funktioniert " +
    "moteur moteurs engine engines modele modell modelle choisir choose welches " +
    "chanson chansons song songs musique music musik video videos clip clips creer erstellen machen " +
    "prix tarif tarifs combien price prices preis preise kosten kostet aide aider help hilfe helfen signature studio starclip").split(" ");
  var SANS_CORR = { words: 1, world: 1, model: 1, mode: 1, prise: 1, start: 1, using: 1, maker: 1, mache: 1, music: 1, video: 1, where: 1, there: 1, these: 1, those: 1, haben: 1, sagen: 1, bitte: 1, photo: 1, photos: 1 };
  function dist(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) d[i] = [i];
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);   // lettres inversées
    }
    return d[a.length][b.length];
  }
  // Fautes courtes fréquentes (dictée, phonétique) : corrigées directement.
  var FAUTES = { bye: "buy", byu: "buy", bai: "buy", kofen: "kaufen", kaufn: "kaufen", achte: "achete", acheté: "achete", coment: "comment", komment: "comment", starclipe: "starclip", sarclip: "starclip", klip: "clip", vidoe: "video", vidio: "video", sond: "song" };
  function corrigerMot(m) {
    if (FAUTES[m]) return FAUTES[m];
    if (m.length < 5 || SANS_CORR[m] || VOCAB.indexOf(m) >= 0) return m;
    var max = m.length >= 8 ? 2 : 1, best = m, bd = 9;
    VOCAB.forEach(function (v) { if (v.length < 4) return; var x = dist(m, v); if (x <= max && x < bd) { bd = x; best = v; } });
    return best;
  }
  function normaliser(q) {
    var p = " " + plier(q).replace(/['’`]/g, " ").replace(/star[\s.-]*cl[iy]p+e?s?(?![a-z])/g, "starclip").replace(/[^a-z0-9&+]+/g, " ").replace(/([a-z])\1{2,}/g, "$1$1") + " ";
    p = p.replace(REMPLISSAGE, " ");
    return " " + p.split(/\s+/).filter(Boolean).map(corrigerMot).join(" ") + " ";
  }
  // 2. Intentions : indices pondérés (FR / EN / DE), évalués sur le texte normalisé.
  var INTENTIONS = {
    acheter: [[/ (acheter|achat|achete|achetes|buy|buying|purchase|kaufen|kaufe|kauft|erwerben|erwerbe|abonner) /, 3], [/ (commander|commande|order|ordern|bestellen|bestelle) /, 2],
      [/ (obtenir|avoir|recevoir|get|bekommen|erhalten|kriege) (un |mon |ton |le |a |my |the |einen |meinen |den )?(code|acces|access|zugang) /, 3],
      [/ (pack|packs|paket|pakete) /, 2], [/ (payer|paie|paiement|pay|payment|bezahlen|zahlen|zahlung|orange money|momo|mobile money|recharger|aufladen|top up) /, 2]],
    debuter: [[/ (commencer|commence|debuter|debute|demarrer|demarre|debutant|debutante|start|started|starting|begin|beginner|anfangen|fange|anfanger|beginnen|starten|loslegen|einsteiger|einstieg) /, 3],
      [/ (premiere fois|first time|erste mal|erstes mal|erste schritte|get started|nouveau ici|nouvelle ici|new here|neu hier) /, 3]],
    utiliser: [[/ (utiliser|utilise|servir|fonctionne|marche|use|using|work|works|working|arbeiten|arbeite|benutzen|nutzen|verwenden|funktioniert|bedienen|bedient) /, 2],
      [/ (starclip|app|appli|application|plateforme|platform|site) /, 1],
      [/ (que (puis|peux|peut) (je|on) faire|qu est ce que (je|on) (peux|peut) faire|what can i do|what can you do|what do i do|was kann ich|was kann man|was mache ich|que faire) /, 3]],
    moteur: [[/ (moteur|moteurs|engine|engines|modele|modeles|model|models|modell|modelle|outil|outils|tool|tools|werkzeug|werkzeuge) /, 2],
      [/ (choisir|choix|lequel|laquelle|quel|quelle|which|choose|choice|best|meilleur|welche|welches|welcher|wahlen|nehmen|empfiehlst|empfehlen|recommend|recommande|conseilles) /, 2]],
    chanson: [[/ (chanson|chansons|song|songs|lied|lieder|musique|music|musik|morceau|chanter|singen) /, 2], [/ (creer|faire|composer|produire|ecrire|make|create|compose|produce|write|erstellen|machen|mache|komponieren|produzieren|schreiben) /, 1]],
    video: [[/ (video|videos|clip|clips|film|filme|filmen|animer|animation|animate|musikvideo) /, 2], [/ (creer|faire|realiser|make|create|produce|erstellen|machen|mache|drehen|produzieren) /, 1]],
    prix: [[/ (prix|cout|coute|coutent|combien|tarif|tarifs|price|prices|cost|costs|how much|kostet|kosten|preis|preise|teuer|cher) /, 3]],
    aide: [[/ (aide|aider|help|hilfe|helfen|perdu|perdue|lost|verloren|comprends pas|understand|verstehe|bloque|stuck|weiss nicht|sais pas|don t know) /, 2]]
  };
  var PRIORITE = ["acheter", "prix", "chanson", "video", "moteur", "debuter", "utiliser", "aide"];
  function intentionDe(q) {
    var n = normaliser(q), sc = {};
    PRIORITE.forEach(function (k) { sc[k] = INTENTIONS[k].reduce(function (a, c) { return a + (c[0].test(n) ? c[1] : 0); }, 0); });
    var best = null;
    PRIORITE.forEach(function (k) { if (sc[k] >= 2 && (!best || sc[k] > sc[best])) best = k; });
    return { id: best, scores: sc, ici: / (ici|here|hier|cet onglet|this tab|diesem tab) /.test(n) };
  }

  // 3. Textes du manuel réutilisés tels quels (dans la langue de la réponse), sans l'en-tête de rubrique.
  function rubrique(k, c, r) {
    var x = (k.sections.filter(function (s) { return s.c === c && (r === undefined || s.r === r); })[0] || {}).x || "";
    var y = x.replace(/^\d+\.\s+[^\n.]{1,45}\n/, "");   // en-tête sur sa propre ligne (« 5. Tutoriel débutant »)
    return (y !== x ? y : x.replace(/^\d+\.\s+[^.\n]{1,45}\.\s+/, "")).trim();   // ou en début de phrase (« 1. Présentation. »)
  }
  // Découpe en phrases : un point suivi d'un chiffre (« Seedance 2.5 ») ou d'une minuscule ne termine pas la phrase.
  function phrases(x, n, depuisFin) {
    var t0 = String(x).trim(), m = [], debut = 0, re = /[.!?…]+\s+/g, a;
    while ((a = re.exec(t0))) { var suite = t0.charAt(re.lastIndex); if (suite && !/[a-z0-9à-ÿ]/.test(suite)) { m.push(t0.slice(debut, re.lastIndex).trim()); debut = re.lastIndex; } }
    if (debut < t0.length) m.push(t0.slice(debut).trim());
    return (depuisFin ? m.slice(-n) : m.slice(0, n)).join(" ");
  }
  function titreChap(k, c) { var s = k.sections.filter(function (x) { return x.c === c; })[0]; return s ? s.t.replace(/^\d+\.\s*/, "").split(" — ")[0].replace(/\s*(✅|🛠️|🛠).*$/, "").trim() : c; }
  // Noms d'onglets et de boutons de l'app (en français) : en EN / DE, suivis de leur traduction, comme dans le manuel.
  var UI_TR = {
    en: { "Ton code StarClip": "Your StarClip code", "💬 Commander sur WhatsApp": "Order on WhatsApp", "Copier": "Copy" },
    de: { "Ton code StarClip": "Ihr StarClip-Code", "💬 Commander sur WhatsApp": "Auf WhatsApp bestellen", "Copier": "Kopieren" }
  };
  function annoter(x) {
    if (etat.lg === "fr") return x;
    var d = {}, a = NOMS_APP[etat.lg] || {}, b = UI_TR[etat.lg] || {}, cle;
    for (cle in a) if (a[cle] !== cle) d[cle] = a[cle].replace(/^\S+\s/, "");
    for (cle in b) d[cle] = b[cle];
    Object.keys(d).sort(function (u, v) { return v.length - u.length; }).forEach(function (fr) {
      var e = fr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      x = x.replace(new RegExp("(«\\s*)?" + e + "(\\s*»)?(?!\\s*\\(|[\\wÀ-ÿ])", "g"), function (m0) { return "« " + fr + " » (" + d[fr] + ")"; });
    });
    return x;
  }
  // Le bouton vaut accord du client : le parcours démarre directement.
  function boutonGuide(id) { return { lib: tg(GT.accompagner), fn: function () { ajouter("naya", demarrerGuide(id, function (t0, a, x) { var o = { texte: propre(t0), actions: a || [] }; for (var k in x || {}) o[k] = x[k]; return o; })); } }; }
  function puce(nom, texte) { return "• " + nom + " : " + texte; }
  function option(cle) { return { lib: t(cle), fn: function () { envoyer(t(cle).replace(/^\S+\s/, "")); } }; }
  var OPTIONS = ["op_debuter", "op_video", "op_chanson", "op_moteur", "op_prix", "op_acheter", "op_signature"];


  // ───────────── v41.160 : Naya — Guide interactif ─────────────
  // Parcours reliés aux vrais onglets et éléments de l'app (identifiants stables d'index.html). Le guide peut ouvrir un
  // onglet (après accord du client) et mettre un élément en évidence. Il vérifie la progression avec les indicateurs que
  // l'app affiche déjà (pastilles « fait », genre choisi, génération démarrée) et dit quand il ne peut pas vérifier.
  // Il ne clique JAMAIS sur un bouton de lancement, de paiement ou d'envoi : ces gestes restent ceux du client.
  var $ = function (sel) { try { return document.querySelector(sel); } catch (_) { return null; } };
  var visible = function (e) { return !!(e && e.getClientRects().length && !e.closest(".hidden,[hidden]")); };
  var aClasse = function (sel, c) { var e = $(sel); return !!(e && e.classList.contains(c)); };
  var tg = function (o, v) { var s0 = (o && (o[etat.lg] || o.fr)) || ""; return v ? s0.replace(/\{(\w+)\}/g, function (_, k) { return k in v ? v[k] : ""; }) : s0; };
  var GT = {
    titre: { fr: "🧭 Guide interactif", en: "🧭 Interactive guide", de: "🧭 Interaktiver Guide" },
    proposer: { fr: "Je peux t'accompagner étape par étape dans l'app : {p}. J'ouvre les bons onglets et je te montre où toucher ; c'est toi qui fais chaque geste. On y va ?", en: "I can walk you through it step by step in the app: {p}. I open the right tabs and show you where to tap; you make every move yourself. Shall we?", de: "Ich kann Sie Schritt für Schritt in der App begleiten: {p}. Ich öffne die richtigen Tabs und zeige Ihnen, wo Sie tippen; jeden Schritt machen Sie selbst. Sollen wir?" },
    oui: { fr: "✅ Oui, allons-y", en: "✅ Yes, let's go", de: "✅ Ja, los geht's" },
    non: { fr: "Non merci", en: "No thanks", de: "Nein danke" },
    accompagner: { fr: "🧭 M'accompagner pas à pas", en: "🧭 Guide me step by step", de: "🧭 Schritt für Schritt begleiten" },
    debut: { fr: "Avec plaisir ! Nous allons {p} ensemble, une étape à la fois. Tu peux dire à tout moment « répète », « explique autrement », « reviens en arrière », « passe cette étape » ou « arrête le guide ».", en: "With pleasure! We'll {p} together, one step at a time. You can say « repeat », « explain differently », « go back », « skip this step » or « stop the guide » at any time.", de: "Sehr gern! Wir werden gemeinsam {p}, ein Schritt nach dem anderen. Sie können jederzeit « wiederholen », « anders erklären », « zurück », « Schritt überspringen » oder « Guide beenden » sagen." },
    etape: { fr: "Étape {n}/{N} — {t}", en: "Step {n}/{N} — {t}", de: "Schritt {n}/{N} — {t}" },
    verif_auto: { fr: "Je vois quand c'est fait et je te propose la suite.", en: "I'll see when it's done and suggest the next step.", de: "Ich sehe, wenn es erledigt ist, und schlage den nächsten Schritt vor." },
    verif_manu: { fr: "Je ne peux pas vérifier cette étape moi-même : dis « suivant » quand c'est fait.", en: "I can't check this step myself: say « next » when it's done.", de: "Diesen Schritt kann ich nicht selbst prüfen: Sagen Sie « weiter », wenn er erledigt ist." },
    bravo: { fr: "✓ Parfait, c'est fait !", en: "✓ Great, that's done!", de: "✓ Perfekt, erledigt!" },
    pas_encore: { fr: "Je ne vois pas encore cette étape terminée dans l'app. Prends ton temps ; si tu veux continuer quand même, dis « passe cette étape ».", en: "I don't see this step completed in the app yet. Take your time; to continue anyway, say « skip this step ».", de: "Ich sehe diesen Schritt in der App noch nicht als erledigt. Lassen Sie sich Zeit; um trotzdem weiterzumachen, sagen Sie « Schritt überspringen »." },
    fini: { fr: "🎉 Bravo, le parcours « {p} » est terminé ! Ton résultat apparaîtra dans la zone Résultats. Je reste là si tu as une question.", en: "🎉 Well done, the « {p} » guide is complete! Your result will appear in the Results area. I'm here if you have a question.", de: "🎉 Glückwunsch, der Guide « {p} » ist abgeschlossen! Ihr Ergebnis erscheint im Ergebnisbereich. Ich bin da, wenn Sie eine Frage haben." },
    arret: { fr: "Guide arrêté. Tu pourras le reprendre quand tu veux : dis par exemple « accompagne-moi pour ma première chanson ».", en: "Guide stopped. You can restart it any time: say for example « guide me through my first song ».", de: "Guide beendet. Sie können ihn jederzeit neu starten: Sagen Sie zum Beispiel « begleite mich bei meinem ersten Song »." },
    debut_deja: { fr: "Nous sommes déjà à la première étape.", en: "We're already at the first step.", de: "Wir sind schon beim ersten Schritt." },
    rappel: { fr: "🧭 Guide en cours (étape {n}/{N}) : dis « continue » pour reprendre ou « arrête le guide ».", en: "🧭 Guide in progress (step {n}/{N}): say « continue » to resume or « stop the guide ».", de: "🧭 Guide läuft (Schritt {n}/{N}): Sagen Sie « weiter » zum Fortsetzen oder « Guide beenden »." },
    b_suivant: { fr: "✓ C'est fait", en: "✓ Done", de: "✓ Erledigt" },
    b_autre: { fr: "💬 Explique autrement", en: "💬 Explain differently", de: "💬 Anders erklären" },
    b_retour: { fr: "← Retour", en: "← Back", de: "← Zurück" },
    b_passer: { fr: "⏭ Passer", en: "⏭ Skip", de: "⏭ Überspringen" },
    b_arret: { fr: "■ Arrêter", en: "■ Stop", de: "■ Beenden" },
    // Commandes envoyées par les boutons (reconnues ensuite comme si le client les avait écrites)
    c_suivant: { fr: "suivant", en: "next", de: "weiter" }, c_autre: { fr: "explique autrement", en: "explain differently", de: "anders erklären" },
    c_retour: { fr: "reviens en arrière", en: "go back", de: "zurück" }, c_passer: { fr: "passe cette étape", en: "skip this step", de: "Schritt überspringen" },
    c_arret: { fr: "arrête le guide", en: "stop the guide", de: "Guide beenden" }
  };
  // Commandes reconnues pendant un parcours (texte normalisé, FR / EN / DE, y compris dictée).
  var CMD = {
    arret: / (arrete|arreter|stop|stoppe|stopp|quitte|quitter|quit|cancel|annule|beenden|beende|abbrechen|aufhoren|ende) /,
    retour: / (retour|reviens|revenir|arriere|precedent|back|previous|zuruck|vorherige) /,
    passer: / (passe|passer|saute|sauter|skip|uberspringen|uberspringe|ignorer cette) /,
    autre: / (autrement|autre facon|explique mieux|differently|another way|anders|einfacher|simpler|plus simple) /,
    repeter: / (repete|repeter|redis|repeat|again|say again|wiederhole|wiederholen|nochmal|noch einmal) /,
    suivant: / (suivant|suivante|continue|continuer|reprendre|reprend|next|done|weiter|fertig|erledigt|gemacht|c est fait|j ai fini|j y suis|ok|okay|oui|yes|ja|voila|finished|i m there|bin da) /
  };
  var ACCORD = / (oui|ouais|d accord|ok|okay|vas y|allons y|go|yes|yeah|sure|let s go|ja|gerne|los|klar) /, REFUS = / (non|no|nope|nein|pas maintenant|not now|merci non|plus tard|later|spater) /;
  var DEMANDE_GUIDE = / (accompagne|accompagner|guide|guider|guides|pas a pas|etape par etape|step by step|walk me|show me how|montre moi|begleite|begleiten|fuhre|fuhren|schritt fur schritt|zeig mir|premiere|premier|first|erste|ersten|erstes|debutant|debutante|beginner|anfanger|einsteiger) /;

  function tuileOuverte(id) { return visible($("#pmPan_" + id)); }
  function preparerPremium(outilVoulu) { ouvrirOnglet("premium"); var p = $(".pmPan:not(.hidden)"); if (p && p.id !== "pmPan_" + outilVoulu) { var f = G("pmFermer"); if (f) try { f(); } catch (_) {} } }
  var PARCOURS = {
    chanson: {
      nom: { fr: "créer ta première chanson", en: "create your first song", de: "Ihren ersten Song erstellen" },
      etapes: [
        { t: { fr: "Ton code StarClip", en: "Your StarClip code", de: "Ihr StarClip-Code" }, onglet: "premium", prep: function () { preparerPremium("chanson"); }, cible: "#pmCode",
          x: { fr: "Entre ton code StarClip dans la case mise en évidence (« Ton code STAR-XXXX »), puis touche OK. Il donne accès aux outils et contient ton solde. Pas encore de code ? Dis « acheter un code ».", en: "Enter your StarClip code in the highlighted box (« Ton code STAR-XXXX »), then tap OK. It unlocks the tools and holds your balance. No code yet? Say « buy a code ».", de: "Geben Sie Ihren StarClip-Code in das hervorgehobene Feld ein (« Ton code STAR-XXXX ») und tippen Sie auf OK. Er schaltet die Werkzeuge frei und enthält Ihr Guthaben. Noch kein Code? Sagen Sie « Code kaufen »." },
          a: { fr: "Ton code ressemble à STAR-7K3M. Tape-le sans espace dans la case qui clignote, puis touche le bouton OK juste à côté.", en: "Your code looks like STAR-7K3M. Type it without spaces into the flashing box, then tap the OK button next to it.", de: "Ihr Code sieht aus wie STAR-7K3M. Tippen Sie ihn ohne Leerzeichen in das blinkende Feld und dann auf OK daneben." },
          fait: function () { return G("codePresent"); } },
        { t: { fr: "Ouvrir l'outil Chanson", en: "Open the Song tool", de: "Das Song-Werkzeug öffnen" }, onglet: "premium", prep: function () { preparerPremium("chanson"); }, cible: '.pmTuile[data-pmouvre="chanson"]', cibleSiFait: "#pmPan_chanson",
          x: { fr: "Touche la tuile « 🎵 Chanson » mise en évidence : c'est l'outil le plus simple pour une première chanson (2 versions d'une chanson complète).", en: "Tap the highlighted « 🎵 Chanson » (Song) tile: it's the simplest tool for a first song (2 versions of a complete song).", de: "Tippen Sie auf die hervorgehobene Kachel « 🎵 Chanson » (Song): das einfachste Werkzeug für einen ersten Song (2 Versionen eines vollständigen Songs)." },
          a: { fr: "Dans l'onglet « 👑 Admin Premium 5.0 », plusieurs tuiles présentent les outils. Celle qui clignote s'appelle « 🎵 Chanson » : touche-la une fois pour ouvrir son formulaire.", en: "In the « 👑 Admin Premium 5.0 » tab, tiles present the tools. The flashing one is « 🎵 Chanson » (Song): tap it once to open its form.", de: "Im Tab « 👑 Admin Premium 5.0 » stellen Kacheln die Werkzeuge vor. Die blinkende heißt « 🎵 Chanson » (Song): Tippen Sie einmal darauf, um das Formular zu öffnen." },
          fait: function () { return tuileOuverte("chanson"); } },
        { t: { fr: "Le style musical", en: "The music style", de: "Der Musikstil" }, onglet: "premium", prep: function () { if (!tuileOuverte("chanson")) ouvrirOutil("chanson"); }, cible: "#pmChGenre_chanson",
          x: { fr: "Choisis un genre dans la liste mise en évidence : par exemple Makossa, Afrobeats ou Rumba congolaise. Quel style préfères-tu ? Je peux aussi te proposer un exemple de prompt : dis « prompt makossa ».", en: "Choose a genre in the highlighted list: for example Makossa, Afrobeats or Congolese rumba. Which style do you prefer? I can also suggest an example prompt: say « makossa prompt ».", de: "Wählen Sie ein Genre in der hervorgehobenen Liste, zum Beispiel Makossa, Afrobeats oder kongolesische Rumba. Welchen Stil möchten Sie? Ich kann Ihnen auch einen Beispiel-Prompt vorschlagen: Sagen Sie « Makossa-Prompt »." },
          a: { fr: "Chaque bouton de la ligne « Genre » est un style de musique. Touche celui qui ressemble le plus à la chanson que tu imagines ; il devient doré quand il est choisi.", en: "Each button in the « Genre » row is a music style. Tap the one closest to the song you imagine; it turns gold when selected.", de: "Jede Schaltfläche in der Zeile « Genre » ist ein Musikstil. Tippen Sie auf den, der Ihrem Song am nächsten kommt; er wird golden, wenn er gewählt ist." },
          fait: function () { var c = G("pmChChoix"); return !!(c && c.chanson && c.chanson.genre); } },
        { t: { fr: "La voix et la langue", en: "Voice and language", de: "Stimme und Sprache" }, onglet: "premium", cible: "#pmChVoix_chanson",
          x: { fr: "Choisis la voix (homme, femme, duo…) puis, juste en dessous, la langue du chant et l'ambiance. Si tu hésites, garde les choix proposés.", en: "Choose the voice (male, female, duo…) then, just below, the singing language and the mood. If unsure, keep the suggested choices.", de: "Wählen Sie die Stimme (Mann, Frau, Duo…) und darunter die Gesangssprache und die Stimmung. Wenn Sie unsicher sind, behalten Sie die Vorschläge." },
          a: { fr: "Ces réglages sont facultatifs : ils précisent qui chante, dans quelle langue et avec quelle émotion. Tu peux les laisser tels quels pour une première chanson.", en: "These settings are optional: they define who sings, in which language and with what emotion. You can leave them as they are for a first song.", de: "Diese Einstellungen sind optional: Sie legen fest, wer singt, in welcher Sprache und mit welcher Stimmung. Für einen ersten Song können Sie sie so lassen." } },
        { t: { fr: "Tes paroles", en: "Your lyrics", de: "Ihr Liedtext" }, onglet: "premium", cible: "#pmParoles_chanson",
          x: { fr: "Colle tes paroles dans la case mise en évidence, avec une ligne vide entre les couplets (le bloc qui se répète devient le refrain). Pas de paroles ? Laisse vide : elles seront écrites pour toi.", en: "Paste your lyrics into the highlighted box, with a blank line between verses (the repeated block becomes the chorus). No lyrics? Leave it empty: they will be written for you.", de: "Fügen Sie Ihren Text in das hervorgehobene Feld ein, mit einer Leerzeile zwischen den Strophen (der wiederholte Block wird zum Refrain). Kein Text? Leer lassen: Er wird für Sie geschrieben." },
          a: { fr: "Les paroles sont facultatives. Si tu en as, sépare chaque couplet par une ligne vide. Tu peux aussi ajouter des précisions dans la case juste au-dessus, par exemple « refrain très accrocheur, guitare douce ».", en: "Lyrics are optional. If you have some, separate each verse with a blank line. You can also add details in the box just above, for example « very catchy chorus, soft guitar ».", de: "Der Text ist optional. Wenn Sie einen haben, trennen Sie jede Strophe durch eine Leerzeile. Im Feld darüber können Sie Details ergänzen, z. B. « sehr eingängiger Refrain, sanfte Gitarre »." } },
        { t: { fr: "Vérifier le prix et lancer", en: "Check the price and start", de: "Preis prüfen und starten" }, onglet: "premium", cible: "#pmGo_chanson",
          x: { fr: "Le prix affiché en haut de l'outil est de {prix}. Il n'est débité que lorsque TU touches le bouton de lancement mis en évidence. Je ne lance jamais rien à ta place : quand tout te convient, touche-le toi-même.", en: "The price shown at the top of the tool is {prix}. It is charged only when YOU tap the highlighted start button. I never start anything for you: when everything suits you, tap it yourself.", de: "Der oben im Werkzeug angezeigte Preis beträgt {prix}. Er wird erst abgebucht, wenn SIE auf die hervorgehobene Start-Schaltfläche tippen. Ich starte nie etwas für Sie: Wenn alles passt, tippen Sie selbst darauf." },
          a: { fr: "Si le bouton indique encore ce qu'il manque (par exemple le genre ou le code), complète ce point d'abord. Quand il affiche « 👑 Lancer » avec le prix, tout est prêt.", en: "If the button still says what is missing (for example the genre or the code), complete that first. When it shows « 👑 Lancer » with the price, everything is ready.", de: "Wenn die Schaltfläche noch anzeigt, was fehlt (z. B. Genre oder Code), ergänzen Sie das zuerst. Zeigt sie « 👑 Lancer » mit dem Preis, ist alles bereit." },
          fait: function () { return visible($("#pm_chansonRond")) || !!$("#pmResult_chanson audio"); } }
      ]
    },
    video: {
      nom: { fr: "créer ta première vidéo", en: "create your first video", de: "Ihr erstes Video erstellen" },
      etapes: [
        { t: { fr: "Ton code StarClip", en: "Your StarClip code", de: "Ihr StarClip-Code" }, onglet: "accueil", cible: "#starCode",
          x: { fr: "Entre ton code StarClip dans la case mise en évidence, puis touche OK. Pas encore de code ? Dis « acheter un code ».", en: "Enter your StarClip code in the highlighted box, then tap OK. No code yet? Say « buy a code ».", de: "Geben Sie Ihren StarClip-Code in das hervorgehobene Feld ein und tippen Sie auf OK. Noch kein Code? Sagen Sie « Code kaufen »." },
          a: { fr: "Ton code ressemble à STAR-7K3M. Il contient tes vidéos. Tape-le sans espace dans la case qui clignote, puis OK.", en: "Your code looks like STAR-7K3M and holds your videos. Type it without spaces into the flashing box, then OK.", de: "Ihr Code sieht aus wie STAR-7K3M und enthält Ihre Videos. Tippen Sie ihn ohne Leerzeichen in das blinkende Feld, dann OK." },
          fait: function () { return aClasse("#dotKey", "on"); } },
        { t: { fr: "Ta photo", en: "Your photo", de: "Ihr Foto" }, onglet: "photo", cible: "#photoBtn",
          x: { fr: "Touche « Choisir une photo » et prends une photo nette, de face et bien éclairée : c'est la base de ta vidéo et le visage que l'app protège.", en: "Tap « Choisir une photo » (Choose a photo) and pick a sharp, front-facing, well-lit photo: it's the base of your video and the face the app protects.", de: "Tippen Sie auf « Choisir une photo » (Foto wählen) und nehmen Sie ein scharfes, frontales, gut beleuchtetes Foto: Es ist die Grundlage Ihres Videos und das Gesicht, das die App schützt." },
          a: { fr: "Une bonne photo fait une bonne vidéo : visage bien visible, pas de lunettes de soleil, lumière du jour si possible. Touche le bouton qui clignote pour la choisir dans ta galerie.", en: "A good photo makes a good video: face clearly visible, no sunglasses, daylight if possible. Tap the flashing button to pick it from your gallery.", de: "Ein gutes Foto ergibt ein gutes Video: Gesicht gut sichtbar, keine Sonnenbrille, möglichst Tageslicht. Tippen Sie auf die blinkende Schaltfläche, um es aus Ihrer Galerie zu wählen." },
          fait: function () { return aClasse("#dot1", "on"); } },
        { t: { fr: "Ton idée", en: "Your idea", de: "Ihre Idee" }, onglet: "scenario", cible: "#ideaFr",
          x: { fr: "Décris ton idée en une ou deux phrases dans la case mise en évidence (par exemple « je chante sur la plage au coucher du soleil »), puis touche le bouton juste en dessous : l'assistant écrit le scénario pour toi.", en: "Describe your idea in one or two sentences in the highlighted box (for example « I sing on the beach at sunset »), then tap the button just below: the assistant writes the script for you.", de: "Beschreiben Sie Ihre Idee in ein bis zwei Sätzen im hervorgehobenen Feld (z. B. « ich singe am Strand bei Sonnenuntergang ») und tippen Sie auf die Schaltfläche darunter: Der Assistent schreibt das Drehbuch für Sie." },
          a: { fr: "Pas besoin d'être technique : dis simplement où tu es, ce que tu fais et l'ambiance. Évite de redécrire ta tenue ou le décor : ils viennent de ta photo.", en: "No need to be technical: just say where you are, what you do and the mood. Don't describe your outfit or setting again: they come from your photo.", de: "Sie müssen nicht technisch sein: Sagen Sie einfach, wo Sie sind, was Sie tun und welche Stimmung herrscht. Outfit und Kulisse nicht erneut beschreiben: Sie kommen aus Ihrem Foto." },
          fait: function () { return aClasse("#dot2", "on"); } },
        { t: { fr: "Le mode et la durée", en: "Mode and length", de: "Modus und Dauer" }, onglet: "scenario", cible: '.chip[data-model="eco"]', cibleParent: true,
          x: { fr: "Choisis le mode : « Éco », « Pro (lip-sync) » ou « ⭐ Visage stable », puis la durée : 5 ou 10 secondes. Si tu débutes, « Éco » et 5 secondes suffisent.", en: "Choose the mode: « Éco », « Pro (lip-sync) » or « ⭐ Visage stable » (stable face), then the length: 5 or 10 seconds. To start, « Éco » and 5 seconds are enough.", de: "Wählen Sie den Modus: « Éco », « Pro (lip-sync) » oder « ⭐ Visage stable » (stabiles Gesicht), dann die Dauer: 5 oder 10 Sekunden. Für den Anfang reichen « Éco » und 5 Sekunden." },
          a: { fr: "Le mode change la qualité et ce qui est possible (lip-sync, visage plus fidèle) ; la durée change la longueur de la vidéo. Le bouton doré indique ton choix.", en: "The mode changes quality and what's possible (lip-sync, more faithful face); the length changes the video duration. The gold button shows your choice.", de: "Der Modus ändert Qualität und Möglichkeiten (Lip-Sync, treueres Gesicht); die Dauer ändert die Länge des Videos. Die goldene Schaltfläche zeigt Ihre Wahl." } },
        { t: { fr: "Lancer la vidéo", en: "Start the video", de: "Video starten" }, onglet: "scenario", cible: "#go",
          x: { fr: "Quand le bouton mis en évidence affiche « 🎬 Générer la vidéo », tout est prêt. C'est débité sur ton code StarClip au lancement : touche-le toi-même, je ne lance jamais rien à ta place.", en: "When the highlighted button shows « 🎬 Générer la vidéo » (Generate the video), everything is ready. It's charged to your StarClip code at launch: tap it yourself, I never start anything for you.", de: "Wenn die hervorgehobene Schaltfläche « 🎬 Générer la vidéo » (Video erzeugen) zeigt, ist alles bereit. Die Abbuchung von Ihrem StarClip-Code erfolgt beim Start: Tippen Sie selbst, ich starte nie etwas für Sie." },
          a: { fr: "Si le bouton dit encore « Complète les étapes », il manque le code, la photo ou le texte : dis « reviens en arrière » et je te remontre l'étape.", en: "If the button still says « Complète les étapes » (complete the steps), the code, photo or text is missing: say « go back » and I'll show you the step again.", de: "Wenn die Schaltfläche noch « Complète les étapes » (Schritte ergänzen) zeigt, fehlen Code, Foto oder Text: Sagen Sie « zurück », und ich zeige Ihnen den Schritt erneut." },
          fait: function () { return visible($("#status")); } }
      ]
    },
    pack: {
      nom: { fr: "comprendre et commander un pack", en: "understand and order a pack", de: "ein Paket verstehen und bestellen" },
      etapes: [
        { t: { fr: "Choisir ton pack", en: "Choose your pack", de: "Ihr Paket wählen" }, onglet: "commander", cible: "#sec-auto9",
          x: { fr: "Voici les packs affichés dans l'app :\n{packs}\nUn pack contient des scènes vidéo à assembler toi-même avec ta chanson. Lequel t'intéresse ?", en: "Here are the packs shown in the app:\n{packs}\nA pack contains video scenes you assemble yourself with your song. Which one interests you?", de: "Hier sind die Pakete aus der App:\n{packs}\nEin Paket enthält Videoszenen, die Sie selbst mit Ihrem Song zusammenfügen. Welches interessiert Sie?" },
          a: { fr: "Le nombre de scènes et leur qualité (Éco ou Pro) font le prix. Pour essayer, « ⭐ Essai Star » donne 1 scène ; les packs Pro donnent des scènes jusqu'à 10 s et débloquent aussi le Studio Images.", en: "The number of scenes and their quality (Éco or Pro) set the price. To try, « ⭐ Essai Star » gives 1 scene; Pro packs give scenes up to 10 s and also unlock the Studio Images.", de: "Anzahl und Qualität der Szenen (Éco oder Pro) bestimmen den Preis. Zum Ausprobieren gibt « ⭐ Essai Star » 1 Szene; Pro-Pakete liefern Szenen bis zu 10 s und schalten auch das Studio Images frei." } },
        { t: { fr: "Payer par Mobile Money", en: "Pay by Mobile Money", de: "Per Mobile Money bezahlen" }, onglet: "commander", cible: "#omNum", cibleParent: true,
          x: { fr: "Envoie le montant du pack choisi par Orange Money ou MTN Mobile Money au numéro affiché (le bouton « Copier » le copie pour toi). N'utilise jamais un autre numéro que ceux affichés dans l'app.", en: "Send the amount for the chosen pack by Orange Money or MTN Mobile Money to the number shown (the « Copier » (Copy) button copies it for you). Never use any number other than those shown in the app.", de: "Senden Sie den Betrag für das gewählte Paket per Orange Money oder MTN Mobile Money an die angezeigte Nummer (die Schaltfläche « Copier » (Kopieren) kopiert sie). Verwenden Sie nie eine andere Nummer als die in der App angezeigten." },
          a: { fr: "Le paiement se fait depuis ton téléphone, dans ton application Orange Money ou MTN MoMo, comme un transfert habituel. Garde la capture d'écran de la confirmation : elle te servira à l'étape suivante.", en: "Payment is made from your phone, in your Orange Money or MTN MoMo app, like a usual transfer. Keep the confirmation screenshot: you'll need it in the next step.", de: "Die Zahlung erfolgt auf Ihrem Telefon in der Orange-Money- oder MTN-MoMo-App wie eine normale Überweisung. Behalten Sie den Screenshot der Bestätigung: Sie brauchen ihn im nächsten Schritt." } },
        { t: { fr: "Envoyer ta preuve", en: "Send your proof", de: "Ihren Nachweis senden" }, onglet: "commander", cible: '#sec-auto9 a[href^="https://wa.me/"]',
          x: { fr: "Touche le bouton WhatsApp mis en évidence et envoie la capture de ton paiement. C'est toi qui envoies le message : je n'envoie rien à ta place.", en: "Tap the highlighted WhatsApp button and send the screenshot of your payment. You send the message yourself: I never send anything for you.", de: "Tippen Sie auf die hervorgehobene WhatsApp-Schaltfläche und senden Sie den Screenshot Ihrer Zahlung. Sie senden die Nachricht selbst: Ich sende nichts für Sie." },
          a: { fr: "WhatsApp s'ouvre avec un message déjà prêt pour Studio Rudis. Ajoute la capture de ton paiement, puis envoie.", en: "WhatsApp opens with a message ready for Studio Rudis. Add your payment screenshot, then send.", de: "WhatsApp öffnet sich mit einer vorbereiteten Nachricht an Studio Rudis. Fügen Sie den Screenshot Ihrer Zahlung hinzu und senden Sie." } },
        { t: { fr: "Entrer ton code", en: "Enter your code", de: "Ihren Code eingeben" }, onglet: "accueil", cible: "#starCode",
          x: { fr: "Tu reçois ton code StarClip sur WhatsApp en quelques minutes, après vérification du paiement. Tape-le dans la case mise en évidence, puis touche OK.", en: "You receive your StarClip code on WhatsApp within a few minutes, after the payment is checked. Type it into the highlighted box, then tap OK.", de: "Sie erhalten Ihren StarClip-Code per WhatsApp innerhalb weniger Minuten nach Prüfung der Zahlung. Tippen Sie ihn in das hervorgehobene Feld und dann auf OK." },
          a: { fr: "Le code ressemble à STAR-7K3M. Ne le partage jamais : il donne accès à tes crédits.", en: "The code looks like STAR-7K3M. Never share it: it gives access to your credits.", de: "Der Code sieht aus wie STAR-7K3M. Geben Sie ihn nie weiter: Er gibt Zugriff auf Ihr Guthaben." },
          fait: function () { return aClasse("#dotKey", "on"); } }
      ]
    }
  };
  var LS_GUIDE = "starclip_naya_guide";   // contexte du parcours, pour la session seulement (sessionStorage)
  var guide = (function () { try { var g = JSON.parse(sessionStorage.getItem(LS_GUIDE) || "null"); return g && PARCOURS[g.id] ? g : null; } catch (_) { return null; } })();
  var propose = null, surveillance = null, signale = -1;
  function memoGuide() { try { if (guide) sessionStorage.setItem(LS_GUIDE, JSON.stringify(guide)); else sessionStorage.removeItem(LS_GUIDE); } catch (_) {} }
  function surligner(sel, parent) {
    [].forEach.call(document.querySelectorAll(".naya-surligne"), function (e) { e.classList.remove("naya-surligne"); });
    var e = sel && $(sel); if (e && parent && e.parentNode) e = e.parentNode;
    if (!e) return false;
    e.classList.add("naya-surligne");
    try {
      e.scrollIntoView({ behavior: "smooth", block: window.innerWidth <= 640 ? "start" : "center" });
      if (window.innerWidth <= 640) setTimeout(function () { window.scrollBy(0, -70); }, 350);   // sous la barre d'onglets collante
    } catch (_) {}
    return true;
  }
  function etapeCourante() { return guide && PARCOURS[guide.id].etapes[guide.i]; }
  function appliquerEtape() {
    var e = etapeCourante(); if (!e) return;
    if (e.onglet) ouvrirOnglet(e.onglet);
    if (e.prep) try { e.prep(); } catch (_) {}
    var cible = e.cibleSiFait && e.fait && e.fait() ? e.cibleSiFait : e.cible;
    surligner(cible, e.cibleParent);
    if (el.pan) el.pan.classList.add("naya-guide");
    surveiller();
  }
  function texteEtape(autrement) {
    var P = PARCOURS[guide.id], e = P.etapes[guide.i];
    var prix = ($("#pmPrix_chanson") || {}).textContent || "…";
    var packs = lignesTarifs("sec-auto9").map(function (x) { return "• " + tarifLg(x); }).join("\n");
    var corps = tg(autrement ? e.a : e.x, { prix: prix, packs: packs });
    return tg(GT.titre) + " · " + tg(GT.etape, { n: guide.i + 1, N: P.etapes.length, t: tg(e.t) }) + "\n" + corps + "\n\n" + (e.fait ? tg(GT.verif_auto) : tg(GT.verif_manu));
  }
  function boutonsGuide() {
    var b = function (lib, cmd) { return { lib: tg(GT[lib]), fn: function () { envoyer(tg(GT[cmd])); } }; };
    return [b("b_suivant", "c_suivant"), b("b_autre", "c_autre"), b("b_retour", "c_retour"), b("b_passer", "c_passer"), b("b_arret", "c_arret")];
  }
  function repEtape(r, prefixe, autrement) { appliquerEtape(); return r((prefixe ? prefixe + "\n\n" : "") + texteEtape(autrement), boutonsGuide(), { intention: "guide_etape", guide: guide.id, etape: guide.i }); }
  function finirGuide(r, termine) {
    var nom = guide ? tg(PARCOURS[guide.id].nom) : "";
    guide = null; memoGuide(); surligner(null); if (el.pan) el.pan.classList.remove("naya-guide");
    if (surveillance) { clearInterval(surveillance); surveillance = null; }
    return r(termine ? tg(GT.fini, { p: nom }) : tg(GT.arret), [], { intention: termine ? "guide_fini" : "guide_arret" });
  }
  function avancer(r, prefixe) {
    guide.i++; memoGuide();
    if (guide.i >= PARCOURS[guide.id].etapes.length) return finirGuide(r, true);
    return repEtape(r, prefixe);
  }
  // Observation : quand l'app montre l'étape faite, Naya le dit et propose la suite (une seule fois par étape).
  function surveiller() {
    if (surveillance) clearInterval(surveillance);
    surveillance = setInterval(function () {
      var e = etapeCourante(); if (!e) { clearInterval(surveillance); surveillance = null; return; }
      if (e.fait && signale !== guide.i && e.fait()) {
        signale = guide.i;
        var r0 = function (texte, actions, extra) { var o = { texte: propre(texte), actions: actions || [] }; for (var x in extra || {}) o[x] = extra[x]; return o; };
        ajouter("naya", avancer(r0, tg(GT.bravo)));
      }
    }, 800);
  }
  function demarrerGuide(id, r) { guide = { id: id, i: 0 }; signale = -1; propose = null; memoGuide(); return repEtape(r, tg(GT.debut, { p: tg(PARCOURS[id].nom) })); }
  function proposerGuide(id, r, base) { propose = id; return r((base ? base.texte + "\n\n" : "") + tg(GT.proposer, { p: tg(PARCOURS[id].nom) }), [{ lib: tg(GT.oui), fn: function () { ajouter("naya", demarrerGuide(id, function (t0, a, x) { var o = { texte: propre(t0), actions: a || [] }; for (var k in x || {}) o[k] = x[k]; return o; })); } }, { lib: tg(GT.non), fn: function () { propose = null; } }].concat(base ? base.actions.slice(1) : []), { intention: "guide_proposition", guide: id }); }
  // Pendant un parcours : commandes du guide ; une autre question reçoit sa réponse, suivie d'un rappel du guide.
  function repondreGuide(q, r) {
    var n = normaliser(q), e = etapeCourante();
    if (propose && !guide) {
      if (ACCORD.test(n) && !REFUS.test(n)) return demarrerGuide(propose, r);
      if (REFUS.test(n)) { propose = null; return r(t("clarif"), OPTIONS.map(option), { intention: "clarification" }); }
    }
    if (!guide) return null;
    if (CMD.arret.test(n)) return finirGuide(r, false);
    if (CMD.retour.test(n)) { if (guide.i === 0) return repEtape(r, tg(GT.debut_deja)); guide.i--; signale = -1; memoGuide(); return repEtape(r); }
    if (CMD.passer.test(n)) return avancer(r);
    if (CMD.autre.test(n)) return repEtape(r, "", true);
    if (CMD.repeter.test(n)) return repEtape(r);
    if (CMD.suivant.test(n) && n.split(" ").filter(Boolean).length <= 6) {
      if (/ (continue|continuer|reprendre|reprend) /.test(n)) return repEtape(r);
      if (e.fait && !e.fait()) return r(tg(GT.pas_encore), boutonsGuide(), { intention: "guide_attente", guide: guide.id, etape: guide.i });
      return avancer(r, e.fait ? tg(GT.bravo) : "");
    }
    return null;
  }
  function parcoursDe(id, q) { var n = normaliser(q); if (!DEMANDE_GUIDE.test(n)) return null; return { chanson: "chanson", video: "video", acheter: "pack" }[id] || null; }

  // 4. Réponses guidées.
  function reponseGuide(k, r) {
    var d = (k.sections.filter(function (s) { return s.c === "demarrer"; })[0] || {}).x || "";
    var etapes = (d.split(/\n(?=### )/)[0] || "").replace(/^### [^\n]*\n/, "").trim();
    return r(t("guide_intro") + "\n\n" + t("guide_code") + "\n" + annoter(rubrique(k, "accueil", 5)) + "\n\n" + t("guide_etapes") + "\n" + etapes +
      "\n\n" + t("guide_premium") + "\n\n" + t("guide_suite"),
      [option("op_video"), option("op_chanson"), option("op_prix"), option("op_acheter")], { intention: "guide" });
  }
  function reponseAchat(k, r) {
    var pk = lignesTarifs("sec-auto9").map(function (x) { return "• " + tarifLg(x); });
    return r(t("achat_intro") + " " + phrases(rubrique(k, "commander", 1), 1) + "\n" + annoter(rubrique(k, "commander", 5)) + (pk.length ? "\n\n" + t("packs") + " :\n" + pk.join("\n") : "") +
      "\n\n" + annoter(rubrique(k, "commander", 7)) + "\n" + annoter(rubrique(k, "commander", 6)),
      [boutonGuide("pack"), { lib: t("ouvrir_cmd"), fn: function () { ouvrirOnglet("commander"); } }, option("op_signature")], { intention: "achat" });
  }
  function reponseVideo(k, r) {
    var l = [puce(annoter("🎬 Scénario"), phrases(rubrique(k, "scenario", 1), 2)), puce(annoter(titreChap(k, "multiplans")), phrases(rubrique(k, "multiplans", 1), 1)),
      puce(nomMoteur("seedance25"), phrases(rubrique(k, "seedance25", 1), 2)), puce(nomMoteur("seedance2"), phrases(rubrique(k, "seedance2", 1), 2)),
      puce(nomMoteur("multishot"), phrases(rubrique(k, "multishot", 1), 1)), puce("Clip Signature", phrases(rubrique(k, "commander", 6), 1, true))];
    return r(t("video_intro") + "\n" + l.join("\n") + "\n\n" + t("video_fin"),
      [boutonGuide("video"), { lib: t("ouvrir_x", { x: nomApp(ongletLib("scenario")) }), fn: function () { ouvrirOnglet("scenario"); } }, option("op_moteur"), option("op_signature")], { intention: "video" });
  }
  function prixDe(id) { var m = moteurs().filter(function (x) { return x.id === id; })[0]; var p = m ? prixMoteur(m) : []; return p.length ? " (" + p.join(" · ") + ")" : ""; }
  function reponseChanson(k, r) {
    var demo = rubrique(k, "demo");
    var l = [puce(nomMoteur("chanson"), phrases(rubrique(k, "chanson", 1), 1) + prixDe("chanson")), puce(nomMoteur("chansonPro"), phrases(rubrique(k, "chansonPro", 1), 1) + prixDe("chansonPro")),
      puce(nomMoteur("demo"), phrases(demo, 1)), puce(nomMoteur("stems"), phrases(rubrique(k, "stems", 1), 1))];
    return r(t("chanson_intro") + "\n" + l.join("\n") + "\n" + t("debite") + "\n\n" + t("chanson_fin"),
      [boutonGuide("chanson"), { lib: t("ouvrir_x", { x: nomMoteur("chanson") }), fn: function () { ouvrirOutil("chanson"); } }, { lib: t("ouvrir_x", { x: nomMoteur("chansonPro") }), fn: function () { ouvrirOutil("chansonPro"); } }], { intention: "chanson" });
  }
  function reponseMoteur(k, r) {
    var l = ["seedance25", "seedance2", "multishot", "aleph", "chanson", "chansonPro"].map(function (id) { return puce(nomMoteur(id), phrases(rubrique(k, id, 1), 2)); });
    return r(t("moteur_intro") + "\n" + l.join("\n") + "\n\n" + t("moteur_bref") + "\n" + t("debite"),
      [{ lib: t("ouvrir_x", { x: nomMoteur("seedance25") }), fn: function () { ouvrirOutil("seedance25"); } }, option("op_prix")], { intention: "moteur" });
  }
  function reponseIci(k, chap, r) {
    var tut = rubrique(k, chap, 5) || rubrique(k, chap, 3);
    return r(t("ici_intro", { o: annoter(titreChap(k, chap)) }) + "\n" + annoter(rubrique(k, chap, 1)) + (tut ? "\n\n" + annoter(tut) : ""), [option("op_debuter")], { intention: "ici", source: chap });
  }
  // La question nomme-t-elle une fonction précise (mot du titre d'un chapitre client, hors mots d'intention) ?
  // Mots d'intention = tous les mots des motifs d'intention + vocabulaire corrigé : ils ne désignent jamais une fonction.
  var MOTS_INTENTION = { star: 1, clip: 1, clips: 1, starclip: 1 };
  Object.keys(INTENTIONS).forEach(function (k) { INTENTIONS[k].forEach(function (c) { (c[0].source.match(/[a-z]+/g) || []).forEach(function (m) { MOTS_INTENTION[m] = 1; }); }); });
  VOCAB.concat(Object.keys(GEN)).forEach(function (m) { MOTS_INTENTION[m] = 1; });
  (DEMANDE_GUIDE.source.match(/[a-z]+/g) || []).forEach(function (m) { MOTS_INTENTION[m] = 1; });
  function chapitreNomme(k, q) {
    var tt = normaliser(q).split(" ").filter(function (x) { return x.length > 2 && !MOTS_INTENTION[x] && !VIDES[x]; });
    if (!tt.length) return null;
    var d = k.docs.filter(function (d) { return !CHAP_STUDIO[d.s.c] && d.s.c !== "demarrer" && tt.some(function (x) { return d.titre.indexOf(racine(x)) >= 0; }); })[0];
    return d ? d.s.c : null;
  }
  function clarification(flou, r) { return r(t(flou ? "clarif_flou" : "clarif"), OPTIONS.map(option), { intention: "clarification" }); }
  // Texte affiché : sans antislash parasite ni ligne de tableau « --- », coupé à la fin d'une phrase.
  function propre(x) { return String(x).replace(/\\/g, "").replace(/^[ \t]*(-{3,}[ \t]*)+$\n?/gm, "").replace(/\n{3,}/g, "\n\n").trim(); }
  function couper(x, max) {
    if (x.length <= max) return x;
    var c = x.slice(0, max), i = Math.max(c.lastIndexOf("\n"), c.lastIndexOf(". ") + 1, c.lastIndexOf("! ") + 1, c.lastIndexOf("? ") + 1);
    return (i > max * 0.5 ? c.slice(0, i) : c.replace(/\s+\S*$/, "")).trim() + " …";
  }

  // Chaque réponse : { texte, actions: [{lib, fn}], html? }. Aucune action ne lance une génération ni n'envoie rien.
  function repondre(q, k) {
    var r = function (texte, actions, extra) { var o = { texte: propre(texte), actions: actions || [] }; for (var x in extra || {}) o[x] = extra[x]; return o; };
    // v41.160 : sécurité d'abord (secrets, code interne, contournements, manipulation) → réponse fixe, sans détail.
    if (demandeSensible(q)) return r(t("securite"), [], { intention: "securite" });
    var g0 = repondreGuide(q, r); if (g0) return g0;
    if (guide) { var rep0 = repondre2(q, k, r); rep0.texte += "\n\n" + tg(GT.rappel, { n: guide.i + 1, N: PARCOURS[guide.id].etapes.length }); return rep0; }
    return repondre2(q, k, r);
  }
  function repondre2(q, k, r) {
    // Fin de la période de test : une demande de code d'essai reçoit le vrai mode d'emploi, pas un refus.
    if (/(essai gratuit|code (d.essai|de test|test|gratuit|offert|b[êe]ta)|(acc[èe]s|version) (test|b[êe]ta)|free (trial|code)|trial code|test code|beta code|kostenlos(e|er)? (test|code)|testcode|probecode|probeversion|(cr[ée]dits?|g[ée]n[ée]rations?|vid[ée]os?) (gratuit|offert)|free (credits?|generations?|videos?)|(kostenlose?n?|gratis) (guthaben|credits?|videos?|generierung))/i.test(q))
      return r(t("essai_fini"), [{ lib: t("ouvrir_cmd"), fn: function () { ouvrirOnglet("commander"); } }], { intention: "essai_fini" });
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
    // v41.160 : « accompagne-moi », « ma première chanson », « step by step »… → réponse, puis proposition du guide interactif.
    var pg = !guide && parcoursDe(intentionDe(q).id, q);
    if (pg) return proposerGuide(pg, r, pg === "chanson" ? reponseChanson(k, r) : pg === "video" ? reponseVideo(k, r) : reponseAchat(k, r));
    if (I.abonnement.test(q)) return r(t("abonnement"), [], { intention: "abonnement" });
    var outil = outilDe(q), genre = genreDe(q);
    if (I.prix.test(q) && (outil || !I.paiement.test(q))) return reponsePrix(outil || panneauOuvert(), r);
    if (I.paiement.test(q)) return reponseAchat(k, r);
    if (genre || (/(prompt|exemple|example|beispiel|genre)/i.test(q) && /(chanson|song|lied|musique|music|musik|genre)/i.test(plier(q)))) return reponseGenre(genre, r);
    if (I.erreur.test(q)) {
      var e = (k.erreurs || []).filter(function (x) { return new RegExp(x.motif, "i").test(q); })[0];
      if (e) return r(e.texte, [], { intention: "erreur" });
    }
    if (I.prompt.test(q)) {
      var oc = outil || panneauOuvert();
      var fiche = (k.outils || []).filter(function (x) { return x.id === oc; })[0];
      if (fiche) return r(fiche.icone + " " + fiche.nom + " — " + fiche.champ + ".\n" + "« " + fiche.exemple + " »\n\n" + t("verif_aide"), [], { intention: "prompt" });
    }
    // v41.160 : intentions courantes (débuter, utiliser, acheter, prix, chanson, vidéo, moteur, aide), sauf question sur un outil précis.
    var it = intentionDe(q), ici = panneauOuvert() || TAB_CHAP[ongletActif()];
    var precis = /^(utiliser|debuter|video|aide)$/.test(it.id || "") && chapitreNomme(k, q);
    if (precis) it.id = null;
    if (!(outil && outil !== "chanson") && !I.erreur.test(q)) {
      if (it.ici && ici && ici !== "accueil" && ici !== "photo" && /^(utiliser|aide|debuter)$/.test(it.id || "aide")) return reponseIci(k, ici, r);
      if (it.id === "acheter") return reponseAchat(k, r);
      if (it.id === "prix") return reponsePrix(panneauOuvert(), r);
      if (it.id === "chanson") return reponseChanson(k, r);
      if (it.id === "video") return reponseVideo(k, r);
      if (it.id === "moteur") return reponseMoteur(k, r);
      if (it.id === "debuter" || it.id === "utiliser") return reponseGuide(k, r);
      if (it.id === "aide") return clarification(false, r);
    }
    var m = chercherManuel(k, q, outil || panneauOuvert() || TAB_CHAP[ongletActif()]);
    if (!m) return clarification(true, r);
    var ent = etat.niveau === "debutant" && m.rubrique === 5 ? t("pasapas") : t("manuel");
    var act = [];
    if (CHAP_TAB[m.chapitre]) act.push({ lib: t("ouvrir_x", { x: nomApp(ongletLib(CHAP_TAB[m.chapitre])) }), fn: function () { ouvrirOnglet(CHAP_TAB[m.chapitre]); } });
    else if (PM_IDS.indexOf(m.chapitre) >= 0) act.push({ lib: t("ouvrir_x", { x: nomMoteur(m.chapitre) }), fn: function () { ouvrirOutil(m.chapitre); } });
    return r(ent + " (" + m.titre + ") :\n" + annoter(m.texte), act, { intention: "manuel", source: m.chapitre + "#" + m.rubrique });
  }
  function ongletLib(tab) { var a = document.querySelector('#tabbar .qnav[data-tab="' + tab + '"]'); return a ? (a.childNodes[0].textContent || "").trim() : tab; }
  function nomMoteur(id) { var m = moteurs().filter(function (x) { return x.id === id; })[0]; return m ? nomApp(m.nom) : id; }

  function reponsePrix(outil, r) {
    var L = moteurs();
    if (outil === "demo") {
      var md = L.filter(function (x) { return x.id === "demo"; })[0];
      return r(t("prix_moteur", { m: md ? nomApp(md.nom) : "demo" }) + " :\n• " + t("reprise") + (md ? "\n• " + t("reference") + " : " + prixMoteur(md).join(" · ") : "") + "\n" + t("debite"), [{ lib: t("ouvrir_x", { x: nomMoteur("demo") }), fn: function () { ouvrirOutil("demo"); } }], { intention: "prix", outil: "demo" });
    }
    var m = L.filter(function (x) { return x.id === outil; })[0];
    if (m) {
      var p = prixMoteur(m);
      if (!p.length) return r(t("prix_absent"), [], { intention: "prix" });
      return r(t("prix_moteur", { m: nomApp(m.nom) }) + " :\n" + p.map(function (x) { return "• " + x; }).join("\n") + "\n" + t("debite"), [{ lib: t("ouvrir_x", { x: nomApp(m.nom) }), fn: function () { ouvrirOutil(m.id); } }], { intention: "prix", outil: m.id });
    }
    // Pas d'outil précis : les packs, les clips Studio Rudis et un résumé des outils Premium.
    var pk = lignesTarifs("sec-auto9"), sg = lignesTarifs("sec-auto10");
    var res = L.filter(function (x) { return x.prix; }).map(function (x) { return "• " + nomApp(x.nom) + " : " + (x.id === "demo" ? "999 FCFA" : prixMoteur(x)[0]); });
    var blocs = [];
    if (pk.length) blocs.push(t("packs") + " :\n" + pk.map(function (x) { return "• " + tarifLg(x); }).join("\n"));
    if (res.length) blocs.push(t("resume_prix") + "\n" + res.join("\n"));
    if (sg.length) blocs.push(t("signature") + " :\n" + sg.map(function (x) { return "• " + tarifLg(x); }).join("\n"));
    if (!blocs.length) return r(t("prix_absent"), [], { intention: "prix" });
    return r(blocs.join("\n\n"), [{ lib: t("ouvrir_cmd"), fn: function () { ouvrirOnglet("commander"); } }], { intention: "prix" });
  }

  function reponseGenre(genre, r) {
    var E = window.CHP_EXEMPLES;
    if (!E) return r(t("charge_ko"), [], { intention: "genre" });
    if (!genre) return r(t("genres_dispo") + Object.keys(E).map(libGenre).join(", ") + ".", [], { intention: "genre" });
    var x = E[genre];
    var texte = libGenre(genre) + " — " + ((DESC_GENRE[genre] || {})[etat.lg] || x.desc) + "\n\n" + t("debutant_ex") + " : « " + x.debutant + " »" +
      (etat.niveau === "pro" ? "\n\n" + t("pro_ex") + " : « " + x.pro + " »" : "") + (t("ex_fr") ? "\n" + t("ex_fr") : "") + "\n\n" + t("auth");
    var act = ["debutant", "pro", "voix", "instru"].map(function (niv) {
      var lib = { debutant: t("debutant_ex"), pro: t("pro_ex"), voix: t("avec_paroles"), instru: t("instrumental") }[niv];
      return { lib: t("charger") + " · " + lib, fn: function () { return chargerExemple(genre, niv); } };
    });
    var prix = moteurs().filter(function (m) { return m.id === "chansonPro"; })[0];
    if (prix) texte += "\n" + t("prix_moteur", { m: nomApp(prix.nom) }) + " : " + prixMoteur(prix).join(" · ") + ". " + t("debite");
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
    var opt = offres.map(function (o, i) { return '<option value="' + i + '">' + esc(tarifLg(o)) + "</option>"; }).join("") + '<option value="">' + esc(t("dev_nsp")) + "</option>";
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
    // v41.160 : bandeau d'aide (dans le flux de la page, sous l'en-tête : ne recouvre rien) et bouton micro.
    "#naya-ban{display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap;margin:10px 0 8px;padding:8px 12px;border:1px solid var(--line,#1F2B5C);border-left:3px solid var(--ai,#2EE6D6);border-radius:12px;background:linear-gradient(90deg,rgba(46,230,214,.08),rgba(242,179,61,.05));color:var(--text,#E8ECF7);font:13px/1.45 Manrope,system-ui,sans-serif;text-align:left}" +
    "#naya-ban p{flex:1 1 280px;margin:0;min-width:0}#naya-ban p b{color:var(--ai,#2EE6D6)}#naya-ban .naya-acts-ban{display:flex;gap:8px;flex:0 0 auto}" +
    "#naya-ban .naya-btn{font-size:13px;padding:7px 14px;white-space:nowrap}" +
    ".naya-mic{flex:none;width:44px;border-radius:10px;font-size:18px;padding:0}.naya-mic.on{background:var(--ai,#2EE6D6);color:#04201e;animation:nayaMic 1.2s ease-in-out infinite}" +
    "@keyframes nayaMic{50%{box-shadow:0 0 0 6px rgba(46,230,214,.25)}}" +
    "@media (max-width:640px){#naya-ban{font-size:12.5px;padding:8px 10px}#naya-ban .naya-acts-ban{flex:1 1 100%}#naya-ban .naya-btn{flex:1;padding:8px 6px}}" +
    ".naya-surligne{outline:3px solid #2EE6D6 !important;outline-offset:4px;border-radius:10px;box-shadow:0 0 0 8px rgba(46,230,214,.22) !important;animation:nayaSurligne 1.6s ease-in-out infinite;scroll-margin:90px}" +
    "@keyframes nayaSurligne{50%{outline-color:#F2B33D;box-shadow:0 0 0 12px rgba(242,179,61,.18)}}" +
    "@media (prefers-reduced-motion:reduce){.naya-surligne,.naya-mic.on{animation:none}}" +
    "@media (max-width:640px){#naya-pan.naya-guide{height:46vh;height:46dvh}}" +
    "@media print{#naya-btn,#naya-pan,#naya-ban{display:none}}";

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
      '<form class="naya-saisie"><button type="button" class="naya-btn naya-mic">🎤</button><textarea rows="1" maxlength="1000"></textarea><button type="submit" class="naya-btn naya-or"></button></form>' +
      '<div class="naya-pied"><span class="naya-conf"></span> <a class="naya-eff"></a></div>';
    document.body.appendChild(el.pan); document.body.appendChild(el.btn);
    el.fil = el.pan.querySelector(".naya-fil"); el.saisie = el.pan.querySelector(".naya-saisie textarea");
    el.lg = el.pan.querySelector(".naya-lg"); el.mic = el.pan.querySelector(".naya-mic");
    el.mic.addEventListener("click", function () { dicter(); });
    // v41.160 : bandeau d'aide sous l'en-tête de l'app (au-dessus des onglets), dans la langue de Naya.
    var tete = document.querySelector(".wrap > header");
    if (tete) {
      el.ban = document.createElement("div"); el.ban.id = "naya-ban"; el.ban.setAttribute("role", "note");
      el.ban.innerHTML = '<span class="naya-pt" style="width:26px;height:26px;flex:none;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#2EE6D6,#0b6f68);color:#04201e;font-size:14px">✦</span><p></p>' +
        '<span class="naya-acts-ban"><button type="button" class="naya-btn naya-or" data-a="parler"></button><button type="button" class="naya-btn" data-a="ecrire"></button></span>';
      tete.insertAdjacentElement("afterend", el.ban);
      // Appels directs dans le geste de l'utilisateur : indispensable sur iPhone pour ouvrir le clavier et le micro.
      el.ban.querySelector("[data-a=parler]").addEventListener("click", function () { basculer(true); dicter(); });
      el.ban.querySelector("[data-a=ecrire]").addEventListener("click", function () { basculer(true); try { el.saisie.focus(); } catch (_) {} });
    }
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
    el.pan.querySelector(".naya-saisie button[type=submit]").textContent = t("envoyer");
    el.mic.setAttribute("aria-label", t("micro")); el.mic.title = t("micro");
    if (el.ban) { el.ban.querySelector("p").textContent = t("ban_txt"); el.ban.querySelector("[data-a=parler]").textContent = t("ban_parler"); el.ban.querySelector("[data-a=ecrire]").textContent = t("ban_ecrire"); el.ban.lang = etat.lg; }
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
    if (!o) { arreterVoix(); if (reco) { try { reco.abort(); } catch (_) {} } }
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
    if (qui === "naya" && !rep.formulaire && !rep.sansVoix && (serveurVoix() || (VOIX_SECOURS_APPAREIL && "speechSynthesis" in window))) acts.push({ lib: "🔊 " + t("ecouter"), fn: function (b) { lireAVoix(rep.texte, b, rep.lg); }, discret: true });
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
  // v41.160 : dictée. Chrome (Mac) et Safari (iPhone) proposent la reconnaissance vocale ; le navigateur demande
  // l'autorisation du micro. Sans elle : message clair et curseur dans la zone de saisie (micro du clavier).
  var reco = null;
  var LOCALE_DICTEE = { fr: "fr-FR", en: "en-US", de: "de-DE" };
  function noteMicro(cle) { ajouter("naya", { texte: t(cle), intention: "micro", sansVoix: true }, true); }
  function dicter() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (reco) { try { reco.stop(); } catch (_) {} return; }
    if (!SR) { noteMicro("micro_indispo"); try { el.saisie.focus(); } catch (_) {} return; }
    arreterVoix();
    var r0 = new SR(), final = "", place = el.saisie.placeholder;
    r0.lang = LOCALE_DICTEE[etat.lg] || "fr-FR"; r0.interimResults = true; r0.continuous = false; r0.maxAlternatives = 1;
    r0.onresult = function (ev) {
      var tmp = ""; for (var i = ev.resultIndex; i < ev.results.length; i++) { if (ev.results[i].isFinal) final += ev.results[i][0].transcript; else tmp += ev.results[i][0].transcript; }
      el.saisie.value = (final + tmp).trim();
    };
    r0.onerror = function (ev) { var e = ev && ev.error; if (e === "not-allowed" || e === "service-not-allowed") noteMicro("micro_refus"); else if (e === "no-speech") noteMicro("micro_rien"); else if (e !== "aborted") noteMicro("micro_indispo"); };
    r0.onend = function () { reco = null; el.mic.classList.remove("on"); el.saisie.placeholder = place; var q = final.trim(); if (q) envoyer(q); };
    try { r0.start(); reco = r0; el.mic.classList.add("on"); el.saisie.placeholder = t("micro_ecoute"); }
    catch (_) { reco = null; noteMicro("micro_indispo"); }
  }
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
