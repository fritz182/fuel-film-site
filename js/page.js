/* Shared script for the inner pages (production.html).
   Header, mobile menu, scroll reveal, example-work tiles with the video
   player, and the enquiry form. The homepage keeps its own main.js. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var CFG = window.FUEL_CONFIG || {};
  var PROJECTS = window.FUEL_PROJECTS || [];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  var HOSTS = { instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", vimeo: "Vimeo" };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function playable(p) { return (p.host === "youtube" || p.host === "vimeo") && p.embed !== false; }

  /* ---------- example work: <div class="grid" data-cats="corporate,broadcast" data-limit="6"> ---------- */
  var player = $("player"), frame = $("player-frame");
  function openPlayer(p) {
    if (!player) { window.open(p.url, "_blank", "noopener"); return; }
    var src = p.host === "youtube"
      ? "https://www.youtube-nocookie.com/embed/" + p.id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1"
      : "https://player.vimeo.com/video/" + p.id + "?autoplay=1&dnt=1&title=0&byline=0&portrait=0";
    var f = el("iframe");
    f.src = src; f.title = p.title;
    f.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
    f.allowFullscreen = true;
    f.referrerPolicy = "strict-origin-when-cross-origin";
    frame.textContent = ""; frame.appendChild(f);
    $("player-client").textContent = p.client || "";
    $("player-title").textContent = p.title;
    $("player-role").textContent = p.role || "";
    $("player-link").href = p.url;
    $("player-link").textContent = "Open on " + HOSTS[p.host] + " ↗";
    if (player.showModal) player.showModal(); else player.setAttribute("open", "");
    document.body.classList.add("locked");
  }
  if (player) {
    var closePlayer = function () { if (player.open) player.close(); };
    player.addEventListener("close", function () { frame.textContent = ""; document.body.classList.remove("locked"); });
    player.querySelector(".player-close").addEventListener("click", closePlayer);
    player.addEventListener("click", function (e) { if (e.target === player) closePlayer(); });
  }

  function tile(p, i) {
    var a = el("a", "tile" + (p.thumb ? "" : " tile-text"));
    a.href = p.url; a.target = "_blank"; a.rel = "noopener";
    a.style.animationDelay = Math.min(i, 11) * 35 + "ms";
    var media = el("div", "tile-media");
    if (p.thumb) {
      var img = el("img"); img.src = p.thumb; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
      media.appendChild(img);
      var play = el("span", "play");
      if (playable(p)) { play.appendChild(el("span", "tri")); play.appendChild(document.createTextNode("Play")); }
      else play.textContent = "Watch on " + HOSTS[p.host] + " ↗";
      media.appendChild(play);
    } else {
      media.appendChild(el("span", "tt-host", "Watch on " + HOSTS[p.host] + " ↗"));
      media.appendChild(el("span", "tt-title", p.client || p.title));
    }
    a.appendChild(media);
    var meta = el("div", "tile-meta");
    if (p.client) meta.appendChild(el("span", "tile-client", p.client));
    meta.appendChild(el("h3", null, p.title));
    meta.appendChild(el("span", "tile-role", p.role));
    a.appendChild(meta);
    if (playable(p)) a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); openPlayer(p);
    });
    return a;
  }
  // <div class="grid" data-ids="id1,id2"> shows exactly those projects, in that order
  Array.prototype.forEach.call(document.querySelectorAll("[data-ids]"), function (grid) {
    grid.getAttribute("data-ids").split(",").forEach(function (id, i) {
      var p = PROJECTS.filter(function (x) { return x.id === id.trim(); })[0];
      if (p) grid.appendChild(tile(p, i));
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-cats]"), function (grid) {
    var cats = grid.getAttribute("data-cats").split(",");
    var limit = parseInt(grid.getAttribute("data-limit") || "6", 10);
    PROJECTS.filter(function (p) { return cats.indexOf(p.cat) !== -1 && p.thumb; })
      .slice(0, limit).forEach(function (p, i) { grid.appendChild(tile(p, i)); });
  });

  /* ---------- header + mobile menu ---------- */
  var head = document.querySelector(".site-head"), menu = $("menu"), menuBtn = document.querySelector(".menu-btn");
  function onScroll() { head.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("locked", open);
  }
  menuBtn.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* ---------- enquiry form (opens the visitor's email app, like the homepage) ---------- */
  var links = $("contact-links");
  if (links && CFG.email) {
    var li = el("li"), a = el("a", null, CFG.email);
    a.href = "mailto:" + CFG.email; li.appendChild(a); links.appendChild(li);
  }
  var form = $("contact-form"), note = $("form-note");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { note.textContent = "Please fill in your name, email and a short message."; return; }
    var d = new FormData(form);
    var extra = d.get("company") ? "\nCompany: " + d.get("company") : "";
    var body = d.get("message") + "\n\n" + d.get("name") + "\n" + d.get("email") + extra;
    window.location.href = "mailto:" + CFG.email +
      "?subject=" + encodeURIComponent("New enquiry: " + d.get("type")) +
      "&body=" + encodeURIComponent(body);
    note.textContent = "Your email app should now open with the message ready to send.";
  });


  /* buttons with data-type="..." pick that option in the enquiry form */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-type]");
    var sel = document.querySelector('#contact-form select[name="type"]');
    if (!b || !sel) return;
    var want = b.getAttribute("data-type");
    Array.prototype.forEach.call(sel.options, function (o) { if (o.text === want) sel.value = o.value || o.text; });
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(reveals, function (n) { io.observe(n); });
  } else {
    Array.prototype.forEach.call(reveals, function (n) { n.classList.add("in"); });
  }
  var y = $("year"); if (y) y.textContent = new Date().getFullYear();
})();
