/* ==========================================================================
   Voyage — main.js  (vanilla JS only, zero libraries)
   Guard-claused feature inits.
   ========================================================================== */
(function () {
  "use strict";

  /* Mark JS as available so CSS can safely hide-then-reveal (content stays
     visible for no-JS users). Set immediately, before first reveal paints. */
  document.documentElement.classList.add("js");

  /* --- Sticky header shadow on scroll --- */
  function initStickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile navigation panel --- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var panel = document.getElementById("mobileNav");
    var closeBtn = document.getElementById("navClose");
    if (!toggle || !panel) return;

    var open = function () {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    var close = function () {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };

    toggle.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) close();
    });
  }

  /* --- Smooth-scroll for in-page anchors (respects reduced motion) --- */
  function initSmoothScroll() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      link.addEventListener("click", function (e) {
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 74;
        window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
        if (history.replaceState) history.replaceState(null, "", id);
      });
    });
  }

  /* --- Scroll reveal via IntersectionObserver --- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* --- Scrollspy: highlight active nav link on the homepage --- */
  function initScrollSpy() {
    var links = document.querySelectorAll('.nav-menu a[href^="#"]');
    if (!links.length) return;
    var map = {};
    var sections = [];
    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) { map[id] = link; sections.push(sec); }
    });
    if (!sections.length) return;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          var active = map[entry.target.id];
          if (active) active.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* --- Demo forms: friendly no-op so nothing 404s --- */
  function initForms() {
    document.querySelectorAll("form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (!btn) return;
        var original = btn.innerHTML;
        btn.innerHTML = "Thanks! ✓";
        btn.disabled = true;
        setTimeout(function () {
          btn.innerHTML = original;
          btn.disabled = false;
          form.reset();
        }, 2200);
      });
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initStickyHeader();
    initMobileNav();
    initSmoothScroll();
    initReveal();
    initScrollSpy();
    initForms();
  });
})();
// === Chatbot Logic ===
document.getElementById("chatbot-btn").onclick = function() {
  let chatWindow = document.getElementById("chat-window");
  chatWindow.style.display = chatWindow.style.display === "none" ? "block" : "none";
};

async function sendMessage() {
  let input = document.getElementById("user-input").value;
  let chatLog = document.getElementById("chat-log");

  chatLog.innerHTML += "<p><b>You:</b> " + input + "</p>";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY" // Replace with your OpenAI key
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: input }]
    })
  });

  const data = await response.json();
  const reply = data.choices[0].message.content;

  chatLog.innerHTML += "<p><b>Trek Assistant:</b> " + reply + "</p>";
  document.getElementById("user-input").value = "";
}

