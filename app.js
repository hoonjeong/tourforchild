/* ============================================================
   TourForChild — app.js  (vanilla SPA, no build needed to run)
   Data: window.TFC_INDEX (data/index.js), per-country data/cities/<code>.js,
         window.TFC_THEMES (data/themes.js), window.TFC_I18N (i18n.js)
   Features: 4-lang UI+content, search, continent/country nav, Leaflet maps,
   read-aloud (TTS), travel-passport stamps, quiz game, theme trails,
   Wikipedia photos, today's/random city, related cities.
   ============================================================ */
(function () {
  "use strict";

  var I18N = window.TFC_I18N;
  var INDEX = window.TFC_INDEX || { countries: [], cities: [] };
  var THEMES = window.TFC_THEMES || [];
  window.TFC_CITY_DATA = window.TFC_CITY_DATA || {};

  var LANGS = I18N.langs.map(function (l) { return l.code; });
  var lang = getInitialLang();
  var app = document.getElementById("app");

  /* ---------- language ---------- */
  function getInitialLang() {
    var saved = localStorage.getItem("tfc_lang");
    if (saved && LANGS.indexOf(saved) >= 0) return saved;
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) >= 0 ? nav : "en";
  }
  function setLang(l) {
    stopTTS();
    lang = l; localStorage.setItem("tfc_lang", l);
    document.documentElement.lang = l;
    renderChrome(); route();
  }
  function t(key) { return (I18N.ui[lang] && I18N.ui[lang][key]) || I18N.ui.en[key] || key; }
  function L(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.en || obj.ko || Object.values(obj)[0] || "";
  }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function countryByCode(code) { return INDEX.countries.find(function (c) { return c.code === code; }); }
  function cityById(id) { return INDEX.cities.find(function (c) { return c.id === id; }); }
  function continentLabel(code) { var c = I18N.continents[code]; return c ? c[lang] || c.en : code; }
  function continentEmoji(code) { var c = I18N.continents[code]; return c ? c.emoji : "🌍"; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function on(id, ev, fn) { var e = document.getElementById(id); if (e) e.addEventListener(ev, fn); }

  /* ---------- passport (localStorage) ---------- */
  function getVisited() { try { return JSON.parse(localStorage.getItem("tfc_visited") || "[]"); } catch (e) { return []; } }
  function isVisited(id) { return getVisited().indexOf(id) >= 0; }
  function addVisited(id) {
    var v = getVisited();
    if (v.indexOf(id) < 0) { v.push(id); localStorage.setItem("tfc_visited", JSON.stringify(v)); }
    updatePassportBadge();
  }
  function updatePassportBadge() {
    var b = document.getElementById("passBadge");
    if (b) { var n = getVisited().length; b.textContent = n ? n : ""; b.style.display = n ? "grid" : "none"; }
  }

  /* ---------- data loading (per country) ---------- */
  var loading = {};
  function loadCountryData(code) {
    if (window.TFC_CITY_DATA[code]) return Promise.resolve(window.TFC_CITY_DATA[code]);
    if (loading[code]) return loading[code];
    loading[code] = new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = "data/cities/" + code + ".js"; s.async = true;
      s.onload = function () { resolve(window.TFC_CITY_DATA[code] || null); };
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
    return loading[code];
  }
  function getCity(id) {
    var meta = cityById(id);
    if (!meta) return Promise.resolve(null);
    return loadCountryData(meta.country).then(function (bag) {
      var full = bag && bag[id];
      return full ? Object.assign({}, meta, full) : meta;
    });
  }

  /* ============================================================
     Chrome
     ============================================================ */
  function renderChrome() {
    var ls = document.getElementById("langSwitch");
    ls.innerHTML = I18N.langs.map(function (l) {
      return '<button data-lang="' + l.code + '" class="' + (l.code === lang ? "active" : "") + '">' + esc(l.label) + "</button>";
    }).join("");
    ls.querySelectorAll("button").forEach(function (b) { b.onclick = function () { setLang(b.getAttribute("data-lang")); }; });

    var ha = document.getElementById("headerActions");
    ha.innerHTML =
      '<button class="hbtn" id="btnTheme" aria-label="theme">' + (currentTheme() === "dark" ? "☀️" : "🌙") + "</button>" +
      '<button class="hbtn" id="btnRandom" title="' + esc(t("randomCity")) + '" aria-label="' + esc(t("randomCity")) + '">🎲</button>' +
      '<a class="hbtn" href="#/quiz" title="' + esc(t("quiz")) + '" aria-label="' + esc(t("quiz")) + '">🎮</a>' +
      '<a class="hbtn" href="#/passport" title="' + esc(t("passport")) + '" aria-label="' + esc(t("passport")) + '">📖<span class="badge" id="passBadge"></span></a>';
    on("btnRandom", "click", gotoRandom);
    on("btnTheme", "click", toggleTheme);
    updatePassportBadge();

    document.getElementById("brandTag").textContent = t("brandTag");
    document.getElementById("footerFix").innerHTML =
      t("footerFix") + ' <a href="mailto:hoonjeong.eden@gmail.com?subject=TourForChild%20info">hoonjeong.eden@gmail.com</a>';
    document.getElementById("footerAbout").textContent = t("footerAbout");
  }

  function gotoRandom() {
    var c = INDEX.cities[Math.floor(Math.random() * INDEX.cities.length)];
    if (c) location.hash = "#/city/" + c.id;
  }
  function todaysCity() {
    var d = new Date(), key = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate(), h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return INDEX.cities[h % INDEX.cities.length];
  }

  /* ---------- theme ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") || "light"; }
  function toggleTheme() {
    var n = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", n);
    try { localStorage.setItem("tfc_theme", n); } catch (e) {}
    var b = document.getElementById("btnTheme"); if (b) b.textContent = n === "dark" ? "☀️" : "🌙";
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = n === "dark" ? "#15121f" : "#ff6b6b";
  }

  /* ---------- toast + confetti ---------- */
  function toast(msg) {
    var el = document.createElement("div"); el.className = "toast"; el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () { el.classList.remove("show"); setTimeout(function () { el.remove(); }, 400); }, 1800);
  }
  function confetti() {
    var colors = ["#ff6b6b", "#4ecdc4", "#ffd166", "#6a8cff", "#9b5de5"];
    var wrap = document.createElement("div"); wrap.className = "confetti-wrap";
    for (var i = 0; i < 26; i++) {
      var s = document.createElement("span");
      s.className = "confetti";
      s.style.left = Math.random() * 100 + "%";
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = (Math.random() * 0.2) + "s";
      s.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
    setTimeout(function () { wrap.remove(); }, 1600);
  }

  /* ---------- share / print ---------- */
  function shareCity(city) {
    var data = { title: L(city.name) + " — TourForChild", text: L(city.tagline) || "", url: location.href };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    if (navigator.clipboard) { navigator.clipboard.writeText(location.href).then(function () { toast(t("linkCopied")); }, function () {}); }
    else { window.prompt("URL", location.href); }
  }

  /* ============================================================
     Search
     ============================================================ */
  function matchCities(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return INDEX.cities.filter(function (c) {
      var country = countryByCode(c.country) || {};
      var hay = [c.id, c.name && c.name.en, c.name && c.name.ko, c.name && c.name.ja, c.name && c.name.zh,
                 country.name && L(country.name)].join(" ").toLowerCase();
      return hay.indexOf(q) >= 0;
    }).slice(0, 12);
  }
  function wireSearch(input, resultsBox) {
    var idx = -1;
    function render(list) {
      idx = -1;
      if (!input.value.trim()) { resultsBox.innerHTML = ""; resultsBox.style.display = "none"; return; }
      if (!list.length) { resultsBox.innerHTML = '<div class="search-empty">' + esc(t("searchNoResult")) + "</div>"; }
      else {
        resultsBox.innerHTML = list.map(function (c) {
          var country = countryByCode(c.country) || {};
          return '<a href="#/city/' + esc(c.id) + '"><span class="r-emoji">' + (c.emoji || "📍") +
            '</span><span><span class="r-city">' + esc(L(c.name)) + '</span> <span class="r-country">· ' +
            esc(L(country.name)) + " " + (country.flag || "") + "</span></span></a>";
        }).join("");
      }
      resultsBox.style.display = "block";
    }
    input.addEventListener("input", function () { render(matchCities(input.value)); });
    input.addEventListener("focus", function () { if (input.value.trim()) render(matchCities(input.value)); });
    input.addEventListener("keydown", function (e) {
      var links = resultsBox.querySelectorAll("a");
      if (e.key === "ArrowDown") { e.preventDefault(); idx = Math.min(idx + 1, links.length - 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); idx = Math.max(idx - 1, 0); }
      else if (e.key === "Enter") { if (links[idx]) { location.hash = links[idx].getAttribute("href").slice(1); input.blur(); } return; }
      else return;
      links.forEach(function (a, i) { a.classList.toggle("active", i === idx); });
    });
    document.addEventListener("click", function (e) {
      if (!resultsBox.contains(e.target) && e.target !== input) resultsBox.style.display = "none";
    });
  }

  /* ============================================================
     Cards
     ============================================================ */
  function cityCardHTML(c) {
    var country = countryByCode(c.country) || {};
    return '<a class="card fade-in" href="#/city/' + esc(c.id) + '">' +
      '<span class="flag">' + (country.flag || "") + "</span>" +
      '<span class="emoji">' + (c.emoji || "📍") + "</span>" +
      "<h3>" + esc(L(c.name)) + "</h3>" +
      '<div class="country">' + esc(L(country.name)) + "</div>" +
      (c.tagline ? '<div class="tag">' + esc(L(c.tagline)) + "</div>" : "") +
      (isVisited(c.id) ? '<span class="stamp-badge">⭐</span>' : "") + "</a>";
  }
  function countryCardHTML(c) {
    return '<a class="card country-card fade-in" href="#/country/' + esc(c.code) + '">' +
      '<span class="emoji">' + (c.flag || "🏳️") + "</span><h3>" + esc(L(c.name)) + "</h3>" +
      '<div class="count">' + (c.cityIds || []).length + " " + esc(t("citiesInCountry")) + "</div></a>";
  }

  /* ============================================================
     Home
     ============================================================ */
  function viewHome(continentFilter) {
    var countries = INDEX.countries.slice();
    if (continentFilter && continentFilter !== "all")
      countries = countries.filter(function (c) { return c.continent === continentFilter; });
    countries.sort(function (a, b) { return L(a.name).localeCompare(L(b.name)); });

    var present = {}; INDEX.countries.forEach(function (c) { present[c.continent] = true; });
    var continentCodes = Object.keys(I18N.continents).filter(function (k) { return present[k]; });
    var featured = INDEX.cities.filter(function (c) { return c.featured; });
    if (!featured.length) featured = INDEX.cities.slice(0, 12);
    var isAll = !continentFilter || continentFilter === "all";

    var html = '<section class="hero fade-in">' +
      "<h1>" + t("heroTitle") + "</h1><p>" + esc(t("heroSub")) + "</p>" +
      '<div class="searchbar"><span class="search-ico">🔎</span>' +
      '<input id="homeSearch" type="search" autocomplete="off" placeholder="' + esc(t("searchPlaceholder")) + '">' +
      '<div class="search-results" id="homeResults" style="display:none"></div></div>' +
      '<div class="quicknav">' +
        '<a class="qbtn" href="#/themes">🧭 ' + esc(t("themes")) + "</a>" +
        '<a class="qbtn" href="#/quiz">🎮 ' + esc(t("quiz").replace("퀴즈","퀴즈")) + "</a>" +
        '<a class="qbtn" href="#/passport">📖 ' + esc(t("passport")) + "</a>" +
        '<button class="qbtn" id="qRandom">🎲</button>' +
      "</div></section>";

    if (isAll) {
      var today = todaysCity();
      if (today) html += '<section class="section fade-in"><h2>' + esc(t("todayCity")) + "</h2>" +
        '<div class="grid">' + cityCardHTML(today) + "</div></section>";
    }

    html += '<section class="section"><h2>' + esc(t("browseContinents")) + '</h2><div class="chips">' +
      '<a class="chip ' + (isAll ? "active" : "") + '" href="#/">🌐 ' + esc(t("allContinents")) + "</a>" +
      continentCodes.map(function (code) {
        return '<a class="chip ' + (continentFilter === code ? "active" : "") + '" href="#/continent/' + code + '">' +
          continentEmoji(code) + " " + esc(continentLabel(code)) + "</a>";
      }).join("") + "</div></section>";

    if (isAll) {
      html += '<section class="section"><h2>' + esc(t("popularCities")) + '</h2><div class="grid">' +
        featured.map(cityCardHTML).join("") + "</div></section>";
      html += '<section class="section"><h2>' + esc(t("themesTitle")) + '</h2><div class="theme-row">' +
        THEMES.map(function (th) {
          return '<a class="theme-chip" href="#/theme/' + th.id + '"><span class="te">' + th.emoji + "</span>" + esc(L(th.name)) + "</a>";
        }).join("") + "</div></section>";
      html += '<section class="section"><h2>' + esc(t("exploreMap")) + '</h2>' +
        '<button class="btn ghost" id="toggleMap">' + esc(t("exploreMap")) + '</button>' +
        '<div id="homeMap" style="display:none"></div></section>';
    }

    html += '<section class="section"><h2>' + esc(t("browseCountries")) +
      (isAll ? "" : " · " + continentEmoji(continentFilter) + " " + esc(continentLabel(continentFilter))) +
      '</h2><div class="grid">' + countries.map(countryCardHTML).join("") + "</div></section>";

    app.innerHTML = html;
    var hs = document.getElementById("homeSearch"); if (hs) wireSearch(hs, document.getElementById("homeResults"));
    on("qRandom", "click", gotoRandom);
    on("toggleMap", "click", function () {
      var m = document.getElementById("homeMap"), btn = document.getElementById("toggleMap");
      if (m.style.display === "none") { m.style.display = "block"; btn.textContent = t("hideMap"); initHomeMap(); }
      else { m.style.display = "none"; btn.textContent = t("exploreMap"); }
    });
    document.title = "TourForChild — " + t("brandTag");
    setMeta(t("heroSub"));
    window.scrollTo(0, 0);
  }

  /* ============================================================
     Country / Themes / Passport / Quiz
     ============================================================ */
  function viewCountry(code) {
    var country = countryByCode(code);
    if (!country) return viewHome();
    var cities = INDEX.cities.filter(function (c) { return c.country === code; });
    cities.sort(function (a, b) { return L(a.name).localeCompare(L(b.name)); });
    app.innerHTML = '<a class="back-link" href="#/">← ' + esc(t("backHome")) + "</a>" +
      '<section class="section fade-in"><h2>' + (country.flag || "") + " " + esc(L(country.name)) + "</h2>" +
      '<p class="sub">' + cities.length + " " + esc(t("citiesInCountry")) + "</p>" +
      '<div class="grid">' + cities.map(cityCardHTML).join("") + "</div></section>";
    document.title = L(country.name) + " — TourForChild";
    setMeta(L(country.name)); window.scrollTo(0, 0);
  }

  function viewThemes() {
    var html = '<a class="back-link" href="#/">← ' + esc(t("backHome")) + "</a>" +
      '<section class="section fade-in"><h2>' + esc(t("themesTitle")) + '</h2>' +
      '<p class="sub">' + esc(t("themesIntro")) + '</p><div class="grid">' +
      THEMES.map(function (th) {
        var n = th.cityIds.filter(cityById).length;
        return '<a class="card theme-card fade-in" href="#/theme/' + th.id + '"><span class="emoji">' + th.emoji + "</span>" +
          "<h3>" + esc(L(th.name)) + "</h3><div class=\"tag\">" + esc(L(th.desc)) + "</div>" +
          '<div class="count">' + n + " " + esc(t("citiesInCountry")) + "</div></a>";
      }).join("") + "</div></section>";
    app.innerHTML = html;
    document.title = t("themesTitle") + " — TourForChild"; setMeta(t("themesIntro")); window.scrollTo(0, 0);
  }
  function viewTheme(id) {
    var th = THEMES.find(function (x) { return x.id === id; });
    if (!th) return viewThemes();
    var cities = th.cityIds.map(cityById).filter(Boolean);
    app.innerHTML = '<a class="back-link" href="#/themes">← ' + esc(t("themes")) + "</a>" +
      '<section class="section fade-in"><h2>' + th.emoji + " " + esc(L(th.name)) + "</h2>" +
      '<p class="sub">' + esc(L(th.desc)) + '</p><div class="grid">' + cities.map(cityCardHTML).join("") + "</div></section>";
    document.title = L(th.name) + " — TourForChild"; setMeta(L(th.desc)); window.scrollTo(0, 0);
  }

  function viewPassport() {
    var cities = getVisited().map(cityById).filter(Boolean);
    var countries = {}, continents = {};
    cities.forEach(function (c) { countries[c.country] = 1; var co = countryByCode(c.country); if (co) continents[co.continent] = 1; });
    var html = '<a class="back-link" href="#/">← ' + esc(t("backHome")) + "</a>" +
      '<section class="section fade-in"><h2>' + esc(t("myPassport")) + '</h2>' +
      '<p class="sub">' + esc(t("passportIntro")) + '</p>' +
      '<div class="pass-stats">' +
        '<div class="pstat"><b>' + cities.length + '</b>' + esc(t("collectedCities")) + "</div>" +
        '<div class="pstat"><b>' + Object.keys(countries).length + '</b>' + esc(t("collectedCountries")) + "</div>" +
        '<div class="pstat"><b>' + Object.keys(continents).length + '</b>' + esc(t("collectedContinents")) + "</div>" +
      "</div>";

    // continent progress bars
    var contTotal = {}, contGot = {};
    INDEX.cities.forEach(function (c) { var co = countryByCode(c.country); if (co) contTotal[co.continent] = (contTotal[co.continent] || 0) + 1; });
    cities.forEach(function (c) { var co = countryByCode(c.country); if (co) contGot[co.continent] = (contGot[co.continent] || 0) + 1; });
    var contCodes = Object.keys(I18N.continents).filter(function (k) { return contTotal[k]; });
    html += '<div class="block"><h2>' + esc(t("progressTitle")) + "</h2>" +
      contCodes.map(function (code) {
        var got = contGot[code] || 0, tot = contTotal[code], pct = Math.round(got / tot * 100);
        return '<div class="prog-row"><span class="prog-label">' + continentEmoji(code) + " " + esc(continentLabel(code)) + "</span>" +
          '<span class="prog-bar"><span class="prog-fill" style="width:' + pct + '%"></span></span>' +
          '<span class="prog-num">' + got + "/" + tot + "</span></div>";
      }).join("") + "</div>";

    // achievement badges
    var nc = cities.length, ncountry = Object.keys(countries).length, ncont = Object.keys(continents).length, badges = [];
    [[1, "🥇"], [5, "🎖️"], [10, "🏅"], [25, "🏆"], [50, "👑"], [100, "🌟"]].forEach(function (m) { if (nc >= m[0]) badges.push({ e: m[1], l: m[0] + " " + t("collectedCities") }); });
    [[5, "🚩"], [10, "🗺️"], [20, "🧭"], [30, "🌐"]].forEach(function (m) { if (ncountry >= m[0]) badges.push({ e: m[1], l: m[0] + " " + t("collectedCountries") }); });
    if (ncont >= 3) badges.push({ e: "🌍", l: "3 " + t("collectedContinents") });
    if (contCodes.length && ncont >= contCodes.length) badges.push({ e: "🌏", l: "★ " + t("collectedContinents") });
    if (badges.length) html += '<div class="block"><h2>' + esc(t("badgesTitle")) + '</h2><div class="badges">' +
      badges.map(function (b) { return '<div class="badge-item"><span class="be">' + b.e + '</span><span class="bl">' + esc(b.l) + "</span></div>"; }).join("") + "</div></div>";

    if (!cities.length) html += '<div class="loading">📖 ' + esc(t("passportEmpty")) + "</div>";
    else html += '<div class="block"><div class="grid">' + cities.map(cityCardHTML).join("") + "</div></div>";
    html += "</section>";
    app.innerHTML = html;
    document.title = t("myPassport") + " — TourForChild"; setMeta(t("passportIntro")); window.scrollTo(0, 0);
  }

  /* ---------- Quiz ---------- */
  var quiz = null;
  function buildQuiz() {
    var pool = shuffle(INDEX.cities).slice(0, 5);
    var types = ["country", "continent", "city"];
    return pool.map(function (c, i) {
      var type = types[Math.floor(Math.random() * types.length)];
      var country = countryByCode(c.country) || {};
      if (type === "continent") {
        var correct = continentLabel(country.continent);
        var others = shuffle(Object.keys(I18N.continents).filter(function (k) { return k !== country.continent; })).slice(0, 3).map(continentLabel);
        return { q: t("qContinent"), subject: (c.emoji || "📍") + " " + L(c.name), options: shuffle([correct].concat(others)), answer: correct };
      }
      if (type === "city") {
        var others2 = shuffle(INDEX.cities.filter(function (x) { return x.id !== c.id; })).slice(0, 3).map(function (x) { return L(x.name); });
        return { q: t("qCity"), subject: "“" + L(c.tagline) + "”", options: shuffle([L(c.name)].concat(others2)), answer: L(c.name) };
      }
      var oc = shuffle(INDEX.countries.filter(function (x) { return x.code !== c.country; })).slice(0, 3).map(function (x) { return L(x.name); });
      return { q: t("qCountry"), subject: (c.emoji || "📍") + " " + L(c.name), options: shuffle([L(country.name)].concat(oc)), answer: L(country.name) };
    });
  }
  function viewQuizStart() {
    app.innerHTML = '<a class="back-link" href="#/">← ' + esc(t("backHome")) + "</a>" +
      '<section class="section fade-in quiz-wrap"><div class="quiz-card">' +
      '<div class="quiz-emoji">🎮</div><h2>' + esc(t("quizTitle")) + "</h2>" +
      "<p>" + esc(t("quizIntro")) + '</p><button class="btn" id="quizStart">' + esc(t("quizStart")) + "</button></div></section>";
    on("quizStart", "click", function () { quiz = { qs: buildQuiz(), i: 0, score: 0 }; renderQuiz(); });
    document.title = t("quizTitle") + " — TourForChild"; window.scrollTo(0, 0);
  }
  function renderQuiz() {
    if (!quiz) return viewQuizStart();
    if (quiz.i >= quiz.qs.length) {
      app.innerHTML = '<section class="section fade-in quiz-wrap"><div class="quiz-card">' +
        '<div class="quiz-emoji">' + (quiz.score >= 4 ? "🏆" : quiz.score >= 2 ? "🎉" : "🌱") + "</div>" +
        "<h2>" + esc(t("quizScore")) + " " + quiz.score + " " + esc(t("quizScoreSuffix")) + "</h2>" +
        '<button class="btn" id="again">' + esc(t("playAgain")) + '</button> ' +
        '<a class="btn ghost" href="#/">' + esc(t("backHome")) + "</a></div></section>";
      on("again", "click", function () { quiz = { qs: buildQuiz(), i: 0, score: 0 }; renderQuiz(); });
      return;
    }
    var cur = quiz.qs[quiz.i];
    app.innerHTML = '<section class="section fade-in quiz-wrap"><div class="quiz-card">' +
      '<div class="quiz-progress">' + (quiz.i + 1) + " / " + quiz.qs.length + "</div>" +
      "<h2>" + esc(cur.q) + '</h2><div class="quiz-subject">' + esc(cur.subject) + "</div>" +
      '<div class="quiz-opts">' + cur.options.map(function (o, k) {
        return '<button class="quiz-opt" data-opt="' + k + '">' + esc(o) + "</button>";
      }).join("") + "</div><div class=\"quiz-feedback\" id=\"qfb\"></div></div></section>";
    var opts = document.querySelectorAll(".quiz-opt");
    opts.forEach(function (b) {
      b.addEventListener("click", function () {
        var chosen = cur.options[+b.getAttribute("data-opt")];
        var ok = chosen === cur.answer;
        if (ok) quiz.score++;
        opts.forEach(function (x) {
          x.disabled = true;
          if (x.textContent === cur.answer) x.classList.add("correct");
          else if (x === b) x.classList.add("wrong");
        });
        var last = quiz.i === quiz.qs.length - 1;
        document.getElementById("qfb").innerHTML =
          '<div class="' + (ok ? "fb-ok" : "fb-no") + '">' + esc(ok ? t("correct") : t("wrong")) +
          (ok ? "" : ' <span class="ans">' + esc(t("answerWas")) + " " + esc(cur.answer) + "</span>") + "</div>" +
          '<button class="btn" id="qnext">' + esc(last ? t("finish") : t("next")) + "</button>";
        on("qnext", "click", function () { quiz.i++; renderQuiz(); });
      });
    });
    window.scrollTo(0, 0);
  }

  /* ============================================================
     City page
     ============================================================ */
  function viewCity(id) {
    stopTTS();
    app.innerHTML = '<div class="loading"><div class="spinner"></div>' + esc(t("loading")) + "</div>";
    getCity(id).then(function (city) { if (!city) { app.innerHTML = notFoundHTML(); return; } renderCity(city); });
  }
  function notFoundHTML() {
    return '<a class="back-link" href="#/">← ' + esc(t("backHome")) + "</a><div class=\"loading\">😅 " + esc(t("cityNotFound")) + "</div>";
  }

  function renderCity(city) {
    var country = countryByCode(city.country) || {};
    var story = (city.story && (city.story[lang] || city.story.en)) || (city.intro ? [L(city.intro)] : null);
    var facts = city.funFacts && (city.funFacts[lang] || city.funFacts.en);
    var places = city.places || [];

    var html = '<div class="city-hero fade-in" id="cityHero">' +
      '<span class="bg-emoji">' + (city.emoji || "🌍") + "</span>" +
      '<div class="crumbs"><a href="#/">' + esc(t("backHome")) + '</a> › <a href="#/country/' + esc(city.country) + '">' + esc(L(country.name)) + "</a></div>" +
      '<h1><span class="emoji">' + (city.emoji || "") + "</span> " + esc(L(city.name)) + "</h1>" +
      (city.tagline ? '<div class="tagline">' + esc(L(city.tagline)) + "</div>" : "") +
      '<div class="hero-actions">' +
        (isVisited(city.id)
          ? '<span class="stamped-note">' + esc(t("stamped")) + "</span>"
          : '<button class="btn stamp-btn" id="stampBtn">' + esc(t("stampBtn")) + "</button>") +
        '<button class="btn ghost mini" id="shareBtn">' + esc(t("share")) + "</button>" +
        '<button class="btn ghost mini" id="printBtn">' + esc(t("print")) + "</button>" +
      "</div>" +
      '<div class="photo-credit" id="photoCredit"></div></div>';

    if (story && story.length) {
      html += '<div class="block fade-in"><div class="block-head"><h2>' + esc(t("story")) + "</h2>" +
        '<button class="tts-btn" id="ttsBtn">' + esc(t("readAloud")) + "</button></div>" +
        story.map(function (p) { return '<p class="intro-text">' + esc(p) + "</p>"; }).join("") + "</div>";
    }
    if (facts && facts.length) {
      html += '<div class="block fade-in"><h2>' + esc(t("funFacts")) + '</h2><ul class="facts">' +
        facts.map(function (f, i) { return '<li><span class="n">' + (i + 1) + "</span><span>" + esc(f) + "</span></li>"; }).join("") + "</ul></div>";
    }
    if (city.kidQuestion && L(city.kidQuestion))
      html += '<div class="kidq fade-in"><span class="label">' + esc(t("kidQuestionLabel")) + "</span>" + esc(L(city.kidQuestion)) + "</div>";

    var mapPoints = [];
    if (city.coords) mapPoints.push({ coords: city.coords, name: L(city.name), main: true });
    places.forEach(function (p) { if (p.coords) mapPoints.push({ coords: p.coords, name: L(p.name) }); });
    if (mapPoints.length)
      html += '<div class="block fade-in"><h2>' + esc(t("mapTitle")) + '</h2><div id="map"></div><div class="map-note">' + esc(t("mapNote")) + "</div></div>";

    if (places.length) {
      html += '<div class="block fade-in"><h2>' + esc(t("placesTitle")) + '</h2><div class="places">' +
        places.map(function (p) {
          var q = p.coords ? p.coords[0] + "," + p.coords[1] : encodeURIComponent(L(p.name) + " " + L(city.name));
          return '<div class="place"><h4>📍 ' + esc(L(p.name)) + "</h4><p>" + esc(L(p.blurb)) + "</p>" +
            '<a class="maplink" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + q + '">' + esc(t("openInMaps")) + "</a></div>";
        }).join("") + "</div></div>";
    }

    // related cities (same continent)
    var related = INDEX.cities.filter(function (x) {
      var co = countryByCode(x.country); return x.id !== city.id && co && co.continent === country.continent;
    });
    related = shuffle(related).slice(0, 4);
    if (related.length)
      html += '<div class="block fade-in"><h2>' + esc(t("related")) + '</h2><div class="grid">' + related.map(cityCardHTML).join("") + "</div></div>";

    html += '<a class="back-link" href="#/country/' + esc(city.country) + '">← ' + esc(L(country.name)) + "</a>";

    app.innerHTML = html;
    document.title = L(city.name) + " — TourForChild";
    setMeta(L(city.tagline) || (story && story[0]) || L(city.name));
    injectCityJsonLd(city, country, story);

    // wire stamp / share / print
    on("stampBtn", "click", function () {
      addVisited(city.id);
      var b = document.getElementById("stampBtn");
      if (b) { var span = document.createElement("span"); span.className = "stamped-note pop"; span.textContent = t("stamped"); b.replaceWith(span); }
      confetti();
    });
    on("shareBtn", "click", function () { shareCity(city); });
    on("printBtn", "click", function () { window.print(); });
    // wire TTS
    wireTTS(story);
    // map + photo
    if (mapPoints.length) initMap(mapPoints);
    loadCityPhoto(city);
    window.scrollTo(0, 0);
  }

  /* ---------- Wikipedia photo ---------- */
  var WIKI_OVERRIDES = {
    newyork: "New York City", washington: "Washington, D.C.", losangeles: "Los Angeles",
    sanfrancisco: "San Francisco", goldcoast: "Gold Coast, Queensland", lafortuna: "La Fortuna, Costa Rica",
    maui: "Maui", sardinia: "Sardinia", crete: "Crete", palma: "Palma de Mallorca", macau: "Macau",
    grandcanyon: "Grand Canyon", yellowstone: "Yellowstone National Park", banff: "Banff, Alberta",
    niagara: "Niagara Falls", masaimara: "Maasai Mara", kruger: "Kruger National Park",
    halong: "Hạ Long Bay", petra: "Petra", cappadocia: "Cappadocia", cinqueterre: "Cinque Terre",
    montsaintmichel: "Mont-Saint-Michel", puntacana: "Punta Cana", uluru: "Uluru", easterisland: "Easter Island",
    zhangjiajie: "Zhangjiajie", chiangmai: "Chiang Mai", siemreap: "Siem Reap", hochiminh: "Ho Chi Minh City",
    hoian: "Hội An", danang: "Da Nang", jeju: "Jeju Province", busan: "Busan", gyeongju: "Gyeongju",
    fiji: "Fiji", maldives: "Maldives", bali: "Bali", pompeii: "Pompeii"
  };
  function loadCityPhoto(city) {
    var title = WIKI_OVERRIDES[city.id] || (city.name && city.name.en) || city.id;
    var cacheKey = "tfc_img_" + city.id;
    var cached = null; try { cached = localStorage.getItem(cacheKey); } catch (e) {}
    if (cached === "none") return;
    if (cached) return applyPhoto(cached);
    var api = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=1000&titles=" + encodeURIComponent(title);
    fetch(api).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var url = null;
      try { var pages = j.query.pages, k = Object.keys(pages)[0]; if (pages[k].thumbnail) url = pages[k].thumbnail.source; } catch (e) {}
      try { localStorage.setItem(cacheKey, url || "none"); } catch (e) {}
      if (url) applyPhoto(url);
    }).catch(function () {});
  }
  function applyPhoto(url) {
    var hero = document.getElementById("cityHero");
    if (!hero) return;
    hero.classList.add("has-photo");
    hero.style.backgroundImage =
      "linear-gradient(135deg, rgba(255,107,107,.82), rgba(106,140,255,.72)), url('" + url + "')";
    var credit = document.getElementById("photoCredit");
    if (credit) credit.textContent = t("photoBy") + ": Wikipedia";
  }

  /* ---------- Text-to-speech ---------- */
  var ttsOn = false;
  function ttsLangCode() { return { ko: "ko-KR", en: "en-US", ja: "ja-JP", zh: "zh-CN" }[lang] || "en-US"; }
  function stopTTS() { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {} ttsOn = false; }
  function wireTTS(story) {
    var btn = document.getElementById("ttsBtn");
    if (!btn) return;
    if (!("speechSynthesis" in window) || !story || !story.length) { btn.style.display = "none"; return; }
    btn.addEventListener("click", function () {
      if (ttsOn) { stopTTS(); btn.textContent = t("readAloud"); btn.classList.remove("on"); return; }
      var u = new SpeechSynthesisUtterance(story.join(" "));
      u.lang = ttsLangCode();
      var voices = window.speechSynthesis.getVoices();
      var v = voices.find(function (x) { return x.lang === u.lang; }) || voices.find(function (x) { return x.lang && x.lang.indexOf(lang) === 0; });
      if (v) u.voice = v;
      u.onend = function () { ttsOn = false; btn.textContent = t("readAloud"); btn.classList.remove("on"); };
      u.onerror = u.onend;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      ttsOn = true; btn.textContent = t("reading"); btn.classList.add("on");
    });
  }

  /* ---------- Leaflet ---------- */
  function ensureLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (window.__leafletP) return window.__leafletP;
    window.__leafletP = new Promise(function (resolve) {
      var css = document.createElement("link"); css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
      var s = document.createElement("script"); s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = function () { resolve(window.L); }; s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
    return window.__leafletP;
  }
  function pinIcon(Lm, emoji) { return Lm.divIcon({ html: '<div class="tfc-pin">' + (emoji || "📍") + "</div>", className: "tfc-pin-wrap", iconSize: [30, 30], iconAnchor: [15, 28], popupAnchor: [0, -26] }); }
  function initMap(points) {
    ensureLeaflet().then(function (Lm) {
      var mapEl = document.getElementById("map");
      if (!Lm || !mapEl) { if (mapEl) mapEl.style.display = "none"; return; }
      var map = Lm.map(mapEl, { scrollWheelZoom: false });
      Lm.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
      var group = [];
      points.forEach(function (p) {
        var m = Lm.marker(p.coords, { icon: pinIcon(Lm, p.main ? "⭐" : "📍") }).addTo(map).bindPopup("<b>" + esc(p.name) + "</b>");
        group.push(m); if (p.main) m.openPopup();
      });
      if (group.length === 1) map.setView(points[0].coords, 13);
      else map.fitBounds(Lm.featureGroup(group).getBounds().pad(0.25));
    });
  }
  function initHomeMap() {
    if (window.__homeMapDone) return;
    ensureLeaflet().then(function (Lm) {
      var el = document.getElementById("homeMap");
      if (!Lm || !el) return;
      window.__homeMapDone = true;
      var map = Lm.map(el, { scrollWheelZoom: false, worldCopyJump: true }).setView([25, 10], 2);
      Lm.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
      INDEX.cities.forEach(function (c) {
        if (!c.coords) return;
        var m = Lm.marker(c.coords, { icon: pinIcon(Lm, c.emoji) }).addTo(map);
        m.bindPopup('<b>' + esc(L(c.name)) + "</b><br><a href=\"#/city/" + c.id + "\">" + esc(t("exploreMore")) + " →</a>");
      });
    });
  }

  /* ---------- SEO helpers ---------- */
  function setMeta(desc) {
    var m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
    m.content = desc || "";
  }
  function injectCityJsonLd(city, country, story) {
    var old = document.getElementById("city-jsonld"); if (old) old.remove();
    var data = { "@context": "https://schema.org", "@type": "TouristDestination", name: L(city.name),
      description: L(city.tagline) || (story && story[0]) || "", address: { "@type": "PostalAddress", addressCountry: L(country.name) } };
    if (city.coords) data.geo = { "@type": "GeoCoordinates", latitude: city.coords[0], longitude: city.coords[1] };
    var s = document.createElement("script"); s.type = "application/ld+json"; s.id = "city-jsonld";
    s.textContent = JSON.stringify(data); document.head.appendChild(s);
  }

  /* ---------- Router ---------- */
  function route() {
    stopTTS();
    var parts = (location.hash || "#/").replace(/^#/, "").split("/").filter(Boolean);
    if (parts[0] === "city" && parts[1]) return viewCity(decodeURIComponent(parts[1]));
    if (parts[0] === "country" && parts[1]) return viewCountry(decodeURIComponent(parts[1]));
    if (parts[0] === "continent" && parts[1]) return viewHome(decodeURIComponent(parts[1]));
    if (parts[0] === "themes") return viewThemes();
    if (parts[0] === "theme" && parts[1]) return viewTheme(decodeURIComponent(parts[1]));
    if (parts[0] === "passport") return viewPassport();
    if (parts[0] === "quiz") return viewQuizStart();
    return viewHome();
  }

  function initScrollTop() {
    var btn = document.createElement("button");
    btn.className = "scrolltop"; btn.setAttribute("aria-label", "top"); btn.textContent = "⬆️";
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(btn);
    window.addEventListener("scroll", function () { btn.classList.toggle("show", window.scrollY > 500); }, { passive: true });
  }

  window.addEventListener("hashchange", route);
  function boot() { document.documentElement.lang = lang; renderChrome(); route(); initScrollTop(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
