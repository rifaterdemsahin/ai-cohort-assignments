// AI Cohort Assignments — shared site behavior

(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Self-assessment scoring engine ---------- */
  // Any page with [data-assessment="cohort-id"] wrapping <input type="checkbox" data-points>
  // gets automatic scoring, localStorage persistence and an emoji rating.
  function initAssessment() {
    var root = document.querySelector("[data-assessment]");
    if (!root) return;

    var storageKey = "aicohort-assessment-" + root.getAttribute("data-assessment");
    var checkboxes = Array.prototype.slice.call(root.querySelectorAll('input[type="checkbox"]'));
    var fill = root.querySelector(".progress-bar-fill");
    var scoreText = root.querySelector(".score-text");
    var scoreEmoji = root.querySelector(".score-emoji");
    var scoreLabel = root.querySelector(".score-label");
    var resetBtn = root.querySelector("[data-reset]");

    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (e) {
      saved = {};
    }

    checkboxes.forEach(function (box) {
      if (saved[box.id]) box.checked = true;
      box.addEventListener("change", function () {
        saved[box.id] = box.checked;
        localStorage.setItem(storageKey, JSON.stringify(saved));
        updateScore();
      });
    });

    function ratingFor(pct) {
      if (pct >= 100) return { emoji: "🏆", label: "Mastered — you've completed every item!" };
      if (pct >= 75) return { emoji: "🌳", label: "Strong progress — almost there." };
      if (pct >= 40) return { emoji: "🌿", label: "Growing — keep going." };
      if (pct > 0) return { emoji: "🌱", label: "Just getting started." };
      return { emoji: "⬜", label: "Not started yet." };
    }

    function updateScore() {
      var total = checkboxes.length;
      var checked = checkboxes.filter(function (b) { return b.checked; }).length;
      var pct = total === 0 ? 0 : Math.round((checked / total) * 100);
      if (fill) fill.style.width = pct + "%";
      if (scoreText) scoreText.textContent = checked + " / " + total + " (" + pct + "%)";
      var rating = ratingFor(pct);
      if (scoreEmoji) scoreEmoji.textContent = rating.emoji;
      if (scoreLabel) scoreLabel.textContent = rating.label;
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!confirm("Reset all checked items for this session? This cannot be undone.")) return;
        checkboxes.forEach(function (b) { b.checked = false; });
        saved = {};
        localStorage.setItem(storageKey, JSON.stringify(saved));
        updateScore();
      });
    }

    updateScore();
  }

  /* ---------- Generic live search: filters `itemSelector` elements by text match ---------- */
  function initLiveSearch(inputSelector, itemSelector) {
    var input = document.querySelector(inputSelector);
    var items = Array.prototype.slice.call(document.querySelectorAll(itemSelector));
    if (!input || items.length === 0) return;
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var visibleCount = 0;
      items.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var match = q.length === 0 || text.indexOf(q) !== -1;
        item.classList.toggle("hidden", !match);
        if (match) visibleCount++;
      });
      var countEl = document.querySelector(inputSelector + "-count");
      if (countEl) countEl.textContent = q.length === 0 ? "" : visibleCount + " match" + (visibleCount === 1 ? "" : "es");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initAssessment();
    initLiveSearch(".glossary-search", ".glossary-term");
    initLiveSearch(".proc-search", ".procedure");
  });
})();
