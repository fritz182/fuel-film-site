(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var CFG = window.FUEL_CONFIG || {};
  var PROJECTS = window.FUEL_PROJECTS || [];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  var CATS = [
    ["all", "All"],
    ["animation", "Animation"],
    ["docs", "3D Documentaries"],
    ["corporate", "Corporate, Docs & Events"],
    ["property", "Property"],
    ["interviews", "Podcasts & Interviews"],
    ["social", "Social"],
    ["music", "Music"],
    ["underwater", "Underwater"],
    ["broadcast", "Broadcast Crew"]
  ];
  var CLIENTS = ["BBC", "ITV", "Matchroom Boxing", "LADbible", "Udemy", "McLaren", "Tracsis", "Westfield",
    "Oceania Cruises", "Malaysia Airlines", "Halkin", "Flint Engineering", "Mossy Earth", "Echo", "Dark Revolution", "1440 Sports", "BeeHerd", "Modal.Live", "Outside-Inside"];
  var HOSTS = { instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", vimeo: "Vimeo" };
  // how many projects show before the "Show all" button: 3 on phones, 21 on larger screens
  var PAGE = window.matchMedia("(max-width: 720px)").matches ? 3 : 21;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function playable(p) { return (p.host === "youtube" || p.host === "vimeo") && p.embed !== false; }

  /* ---------- tiles ---------- */
  function tile(p, i) {
    var a = el("a", "tile" + (p.thumb ? "" : " tile-text"));
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.style.animationDelay = Math.min(i, 11) * 35 + "ms";
    var media = el("div", "tile-media");
    if (p.thumb) {
      var img = el("img");
      img.src = p.thumb; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
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

  /* ---------- selected work ---------- */
  var features = $("features");
  PROJECTS.filter(function (p) { return p.featured; })
    .sort(function (a, b) { return a.featured - b.featured; }).forEach(function (p, i) {
    var t = tile(p, i); t.classList.add("reveal"); t.style.animationDelay = ""; features.appendChild(t);
  });

  /* ---------- filterable grid ---------- */
  var grid = $("grid"), filters = $("filters"), more = $("more");
  var current = "all", expanded = false;

  function listFor(cat) {
    // "All" leaves out the Selected Work pieces so nothing is shown twice in a row
    return PROJECTS.filter(function (p) { return cat === "all" ? !p.featured : p.cat === cat; });
  }
  function render() {
    var list = listFor(current);
    var show = current === "all" && !expanded ? list.slice(0, PAGE) : list;
    grid.textContent = "";
    show.forEach(function (p, i) { grid.appendChild(tile(p, i)); });
    more.hidden = show.length === list.length;
    more.textContent = "Show all " + list.length + " projects";
  }
  CATS.forEach(function (c) {
    var n = listFor(c[0]).length;
    if (!n) return;
    var b = el("button", "filter");
    b.type = "button"; b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", c[0] === current ? "true" : "false");
    b.appendChild(document.createTextNode(c[1]));
    b.appendChild(el("sup", null, String(n)));
    b.addEventListener("click", function () {
      current = c[0]; expanded = false;
      Array.prototype.forEach.call(filters.children, function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      render();
    });
    filters.appendChild(b);
  });
  more.addEventListener("click", function () { expanded = true; render(); });
  render();

  /* ---------- client marquee ---------- */
  var mq = $("marquee");
  for (var r = 0; r < 2; r++) CLIENTS.forEach(function (c) {
    var s = el("span", null, c); if (r) s.setAttribute("aria-hidden", "true"); mq.appendChild(s);
  });

  /* ---------- video player ---------- */
  var player = $("player"), frame = $("player-frame");
  function openPlayer(p) {
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
  function closePlayer() { if (player.open) player.close(); }
  player.addEventListener("close", function () { frame.textContent = ""; document.body.classList.remove("locked"); });
  player.querySelector(".player-close").addEventListener("click", closePlayer);
  player.addEventListener("click", function (e) { if (e.target === player) closePlayer(); });

  /* ---------- hero reel ---------- */
  var reel = CFG.reel || {}, holder = $("reel");
  var reelProject = PROJECTS.filter(function (p) { return p.id === reel.youtube; })[0];
  $("play-reel").addEventListener("click", function () {
    if (reelProject) openPlayer(reelProject);
    else if (reel.youtube) openPlayer({ host: "youtube", id: reel.youtube, title: "Showreel", client: "Fuel-Film", role: "", url: "https://www.youtube.com/watch?v=" + reel.youtube });
  });
  if (!reduced) {
    if (reel.file) {
      var v = el("video");
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.src = reel.file;
      v.addEventListener("playing", function () { holder.classList.add("on"); });
      holder.appendChild(v);
    } else if (reel.youtube) {
      var bg = el("iframe");
      bg.src = "https://www.youtube-nocookie.com/embed/" + reel.youtube +
        "?autoplay=1&mute=1&loop=1&playlist=" + reel.youtube +
        "&controls=0&playsinline=1&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&fs=0";
      bg.allow = "autoplay; encrypted-media";
      bg.tabIndex = -1; bg.title = "Background showreel";
      bg.referrerPolicy = "strict-origin-when-cross-origin";
      // fade in once YouTube's own title overlay has cleared
      bg.addEventListener("load", function () { setTimeout(function () { holder.classList.add("on"); }, 3200); });
      holder.appendChild(bg);
    }
    // pause the background while the player is open or the hero is off screen
    player.addEventListener("close", function () { holder.style.visibility = ""; });
    new MutationObserver(function () { holder.style.visibility = player.open ? "hidden" : ""; })
      .observe(player, { attributes: true, attributeFilter: ["open"] });
  }

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

  /* ---------- contact ---------- */
  var links = $("contact-links");
  function addLink(label, href) {
    if (!href) return;
    var li = el("li"), a = el("a", null, label);
    a.href = href;
    if (href.indexOf("mailto:") !== 0) { a.target = "_blank"; a.rel = "noopener"; }
    li.appendChild(a); links.appendChild(li);
  }
  if (CFG.email) addLink(CFG.email, "mailto:" + CFG.email);
  addLink("Instagram ↗", CFG.instagram);
  addLink("TikTok ↗", CFG.tiktok);
  addLink("YouTube ↗", CFG.youtube);

  var form = $("contact-form"), note = $("form-note");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { note.textContent = "Please fill in your name, email and a short message."; return; }
    var d = new FormData(form);
    var body = d.get("message") + "\n\n" + d.get("name") + "\n" + d.get("email");
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

  $("year").textContent = new Date().getFullYear();
})();
