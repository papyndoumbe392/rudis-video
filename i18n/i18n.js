// v41.162 : LANGUE DE L'INTERFACE STARCLIP (français, anglais, espagnol, allemand).
// • Le choix est mémorisé sur l'appareil (localStorage « starclip_langue ») et posé sur <html lang> dès l'en-tête
//   d'index.html : Naya (bandeau, bouton, cadre, guide) suit cet attribut.
// • Le français est la langue source : chaque texte affiché est cherché dans i18n/dict-<langue>.js (textes exacts,
//   puis motifs à valeur variable). Le texte d'origine est conservé : revenir au français le restitue tel quel.
// • Les textes ajoutés ou modifiés ensuite par l'app sont traduits à la volée (MutationObserver).
// • Jamais traduits : Naya (elle gère sa langue), l'espace Studio, les zones de saisie du client, le code.
(function () {
  "use strict";
  var LANGUES = { fr: "Français", en: "English", es: "Español", de: "Deutsch" };
  var CLE = "starclip_langue";
  var lire = function () { try { return localStorage.getItem(CLE); } catch (_) { return null; } };
  var ecrire = function (v) { try { localStorage.setItem(CLE, v); } catch (_) {} };
  var lg = LANGUES[lire()] ? lire() : "fr";
  var srcScript = (document.currentScript && document.currentScript.src) || "i18n/i18n.js";
  var dossier = srcScript.replace(/[^\/]*$/, ""), version = (srcScript.match(/\?.*$/) || [""])[0];
  var IGNORER_TEXTE = "#naya-pan,#naya-ban,#naya-btn,#adminZone,#admOuvre,script,style,textarea,code,pre,[data-i18n-ignore],.sc-langue";
  var IGNORER_ATTR = "#naya-pan,#naya-ban,#naya-btn,#adminZone,#admOuvre,[data-i18n-ignore],.sc-langue";
  var ATTRS = ["placeholder", "title", "aria-label", "alt"], SEL_ATTRS = "[placeholder],[title],[aria-label],[alt]";
  var D = null, dicos = {}, chargements = {};
  var origine = new WeakMap(), pose = new WeakMap(), aOrigine = new WeakMap(), aPose = new WeakMap();
  var norm = function (s) { return String(s).replace(/\s+/g, " ").trim(); };

  function chargerDico(l) {
    if (l === "fr") return Promise.resolve(null);
    if (dicos[l]) return Promise.resolve(dicos[l]);
    if (chargements[l]) return chargements[l];
    chargements[l] = new Promise(function (ok) {
      var s = document.createElement("script");
      s.src = dossier + "dict-" + l + ".js" + version;
      s.onload = function () {
        var d = window.STARCLIP_I18N && window.STARCLIP_I18N[l];
        if (d) dicos[l] = { t: d.t || {}, re: (d.p || []).map(function (p) { return [new RegExp(p[0]), p[1]]; }), s: d.s || [] };
        ok(dicos[l] || null);
      };
      s.onerror = function () { chargements[l] = null; ok(null); };
      document.head.appendChild(s);
    });
    return chargements[l];
  }
  function traduire(fr) {
    if (!D) return null;
    var k = norm(fr); if (!k) return null;
    if (Object.prototype.hasOwnProperty.call(D.t, k)) return D.t[k];
    for (var i = 0; i < D.re.length; i++) if (D.re[i][0].test(k)) return k.replace(D.re[i][0], D.re[i][1]);
    return segments(k);
  }
  // Messages fabriqués par morceaux par l'app (« Envoi refusé (403). Vérifie ta connexion… ») : chaque morceau connu
  // (8 caractères au moins, du plus long au plus court) est traduit à l'intérieur du texte. Rien trouvé → null.
  function segments(k) {
    if (!D.s || !D.s.length || !/[A-Za-zÀ-ÿ]{3}/.test(k)) return null;
    var morceaux = [k], change = false;
    for (var i = 0; i < D.s.length; i++) {
      var fr = D.s[i];
      for (var j = 0; j < morceaux.length; j++) {
        var m = morceaux[j];
        if (typeof m !== "string" || m.indexOf(fr) < 0) continue;
        var parts = m.split(fr), rempl = [];
        parts.forEach(function (p, n) { if (n) rempl.push({ v: D.t[fr] }); if (p) rempl.push(p); });
        morceaux.splice.apply(morceaux, [j, 1].concat(rempl)); j += rempl.length - 1; change = true;
      }
    }
    if (!change) return null;
    return morceaux.map(function (m) { return typeof m === "string" ? m : m.v; }).join("");
  }
  function texte(n) {
    var p = n.parentElement;
    if (!p || p.closest(IGNORER_TEXTE)) return;
    var actuel = n.nodeValue;
    if (pose.get(n) !== actuel) origine.set(n, actuel);   // texte nouveau (écrit par l'app) : c'est la nouvelle source
    var source = origine.get(n), v = lg === "fr" ? null : traduire(source);
    var cible = v === null ? source : source.match(/^\s*/)[0] + v + source.match(/\s*$/)[0];
    if (v !== null && p.childNodes.length === 1) p.setAttribute("data-i18n-src", norm(source));   // texte d'origine, pour le code qui compare des libellés
    pose.set(n, cible);
    if (actuel !== cible) n.nodeValue = cible;
  }
  function attributs(e) {
    if (e.closest(IGNORER_ATTR)) return;
    var o = aOrigine.get(e) || {}, p = aPose.get(e) || {};
    ATTRS.forEach(function (a) {
      if (!e.hasAttribute(a)) return;
      var v0 = e.getAttribute(a); if (p[a] !== v0) o[a] = v0;
      var v = lg === "fr" ? null : traduire(o[a]), c = v === null ? o[a] : v;
      p[a] = c; if (v0 !== c) e.setAttribute(a, c);
    });
    aOrigine.set(e, o); aPose.set(e, p);
  }
  function parcourir(racine) {
    if (!racine) return;
    if (racine.nodeType === 3) { texte(racine); return; }
    if (racine.nodeType !== 1) return;
    if (racine.matches(SEL_ATTRS)) attributs(racine);
    [].forEach.call(racine.querySelectorAll(SEL_ATTRS), attributs);
    var w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) texte(n);
  }
  function appliquer(l) {
    return chargerDico(l).then(function (d) {
      if (l !== "fr" && !d) l = "fr";               // dictionnaire introuvable : l'app reste en français, rien ne casse
      lg = l; D = d;
      document.documentElement.setAttribute("lang", l);
      parcourir(document.body);
      majSelecteur();
      try { window.dispatchEvent(new CustomEvent("starclip:langue", { detail: l })); } catch (_) {}
      return l;
    });
  }
  function changer(l) { if (!LANGUES[l]) return Promise.resolve(lg); ecrire(l); return appliquer(l); }

  // Sélecteur de langue : en tête de la barre d'onglets (colonne de gauche sur ordinateur, barre du haut sur mobile).
  var sel = null;
  function majSelecteur() { if (sel) sel.value = lg; }
  function creerSelecteur() {
    var tb = document.getElementById("tabbar"); if (!tb || tb.querySelector(".sc-langue")) return;
    var st = document.createElement("style");
    st.textContent = ".sc-langue{flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid var(--line);border-radius:999px;background:var(--up,#1a1726);color:var(--text);font:600 13px Manrope,system-ui,sans-serif}" +
      ".sc-langue select{background:transparent;color:inherit;border:none;font:inherit;cursor:pointer;max-width:120px}.sc-langue select option{color:#111}" +
      "@media (min-width:1100px){.sc-langue{width:100%;border-radius:10px;margin-bottom:6px}.sc-langue select{flex:1;max-width:none}}" +
      "html:not([lang=fr]) #tabbar .qnav small{display:none}";   // sous-titres anglais d'appoint : inutiles quand l'onglet est traduit
    document.head.appendChild(st);
    var lab = document.createElement("label"); lab.className = "sc-langue"; lab.title = "Langue · Language · Idioma · Sprache";
    lab.innerHTML = '<span aria-hidden="true">🌐</span>';
    sel = document.createElement("select"); sel.setAttribute("aria-label", "Langue · Language · Idioma · Sprache");
    Object.keys(LANGUES).forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = LANGUES[k]; sel.appendChild(o); });
    sel.addEventListener("change", function () { changer(sel.value); });
    lab.appendChild(sel);
    var marque = tb.querySelector(".sc-nav-brand");
    tb.insertBefore(lab, marque ? marque.nextSibling : tb.firstChild);
    majSelecteur();
  }

  function demarrer() {
    creerSelecteur();
    try { new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === "characterData") texte(m.target);
        else if (m.type === "attributes") { if (m.target.nodeType === 1) attributs(m.target); }
        else [].forEach.call(m.addedNodes, parcourir);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS }); } catch (_) {}
    appliquer(lg);
  }
  window.StarClipI18n = { langue: function () { return lg; }, changer: changer, langues: function () { return Object.keys(LANGUES); }, traduire: traduire };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
