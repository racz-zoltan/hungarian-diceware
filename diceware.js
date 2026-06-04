/* CarryPass Diceware Generator — controller
 * All randomness comes from window.crypto.getRandomValues (browser CSPRNG).
 * No data leaves the browser.
 */
(function () {
  "use strict";

  // ---------- Wordlist registry ----------
  // Each list declares its expected size. Entropy/word is log2(size).
  // - Short list: 1296 words (6^4) → 10.34 bits/word
  // - Long list:  7776 words (6^5) → 12.92 bits/word
  const LISTS = {
    short: {
      key: "short",
      label: "Rövid (memorizálható) — 1296 szó",
      expected: 1296,
      diceRoll: 4,
      words: (typeof HUNGARIAN_WORDS_SHORT !== "undefined") ? HUNGARIAN_WORDS_SHORT : null
    },
    long: {
      key: "long",
      label: "Hosszú (EFF-stílusú) — 7776 szó",
      expected: 7776,
      diceRoll: 5,
      words: (typeof HUNGARIAN_WORDS_LONG !== "undefined") ? HUNGARIAN_WORDS_LONG : null
    }
  };

  const SYMBOLS = "#@$=!%|[]:<>";

  const state = {
    listKey: "long",      
    words: [],      
    separator: "-",     
    randomCaps: false,  
    appendSymbol: false, 
    deaccent: false    
  };


  const DEACCENT_MAP = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o',
    'ú': 'u', 'ü': 'u', 'ű': 'u',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ö': 'O', 'Ő': 'O',
    'Ú': 'U', 'Ü': 'U', 'Ű': 'U'
  };
  function deaccentString(s) {
    let out = '';
    for (const ch of s) {
      out += DEACCENT_MAP[ch] || ch;
    }
    return out;
  }


  function secureRandomInt(maxExclusive) {
    
    if (maxExclusive <= 0 || maxExclusive > 0x100000000) {
      throw new RangeError("maxExclusive out of range");
    }
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    const buf = new Uint32Array(1);
    let r;
    do {
      window.crypto.getRandomValues(buf);
      r = buf[0];
    } while (r >= limit);
    return r % maxExclusive;
  }

  function secureRandomWord(listKey) {
    const list = LISTS[listKey];
    if (!list.words || list.words.length !== list.expected) {
      throw new Error(`Hibás szólista: "${listKey}". Várt ${list.expected} szó, kapott ${list.words ? list.words.length : 0}.`);
    }
    return list.words[secureRandomInt(list.words.length)];
  }

  function secureRandomSymbol() {
    return SYMBOLS[secureRandomInt(SYMBOLS.length)];
  }


  function secureShuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }


  function bitsPerWord(listKey) {
    return Math.log2(LISTS[listKey].expected);
  }


  function entropyBits(s) {
    const bpw = bitsPerWord(s.listKey);
    let bits = s.words.length * bpw;
    if (s.appendSymbol) bits += Math.log2(SYMBOLS.length);
    if (s.randomCaps && s.words.length > 0) bits += Math.log2(s.words.length);
    return bits;
  }


  function renderPassphrase(s) {
    if (s.words.length === 0) return "";
    let words = s.words.slice();

    if (s.randomCaps && s._capsIndex != null && s._capsIndex < words.length) {
      const i = s._capsIndex;
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }

    let out;
    if (s.separator === "") {
    
      out = words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join("");
    } else {
      out = words.join(s.separator);
    }

    if (s.appendSymbol && s._symbolChar) {
      out += s._symbolChar;
    }
  
    if (s.deaccent) {
      out = deaccentString(out);
    }
    return out;
  }

  const ATTACKERS = [
    { id: "online-throttled", label: "Online, korlátozott (10/s)",            gps: 10 },
    { id: "online-fast",      label: "Online, gyors (10³/s)",                gps: 1e3 },
    { id: "offline-slow",     label: "Offline, lassú hash (10⁴/s)",          gps: 1e4 },
    { id: "offline-fast",     label: "Offline, gyors hash (10¹⁰/s)",         gps: 1e10 },
    { id: "massive",          label: "Nagy szervezet (10¹⁴/s)",              gps: 1e14 }
  ];

  function formatDuration(seconds) {
    if (!isFinite(seconds)) return "∞";
    if (seconds < 1e-6) return "azonnal";
    if (seconds < 1)    return "< 1 másodperc";

    const units = [
      { n: "másodperc", s: 1 },
      { n: "perc",      s: 60 },
      { n: "óra",       s: 3600 },
      { n: "nap",       s: 86400 },
      { n: "év",        s: 86400 * 365.25 }
    ];

    let chosen = units[0];
    for (const u of units) {
      if (seconds / u.s >= 1) chosen = u;
    }
    let value = seconds / chosen.s;

    if (chosen.n === "év") {
      if (value >= 1e15) return "az univerzum kora többszöröse";
      if (value >= 1e12) return formatBigNumber(value) + " év (≈ univerzum kora)";
      if (value >= 1e9)  return formatBigNumber(value) + " év";
      if (value >= 1e6)  return formatBigNumber(value) + " év";
      if (value >= 1e3)  return formatBigNumber(value) + " év";
      return Math.round(value).toLocaleString("hu-HU") + " év";
    }
    return Math.round(value).toLocaleString("hu-HU") + " " + chosen.n;
  }

  function formatBigNumber(v) {
   
    if (v >= 1e15) return v.toExponential(2).replace("e+", " × 10^").replace("+", "");
    const exp = Math.floor(Math.log10(v));
    const mantissa = v / Math.pow(10, exp);
    return mantissa.toFixed(2) + " × 10^" + exp;
  }

  function crackSeconds(bits, gps) {

    const log2_seconds = (bits - 1) - Math.log2(gps);
    if (log2_seconds > 1023) return Infinity; 
    return Math.pow(2, log2_seconds);
  }


  function entropyClass(bits) {
    if (bits < 50)  return { cls: "weak",      label: "Gyenge",     pct: clampPct(bits, 0, 50)  * 0.20 };
    if (bits < 75)  return { cls: "fair",      label: "Közepes",    pct: 20 + clampPct(bits - 50, 0, 25) * 0.20 };
    if (bits < 100) return { cls: "good",      label: "Jó",         pct: 40 + clampPct(bits - 75, 0, 25) * 0.20 };
    if (bits < 128) return { cls: "strong",    label: "Erős",       pct: 60 + clampPct(bits - 100, 0, 28) * 0.20 };
    return            { cls: "excellent", label: "Kiváló",     pct: Math.min(100, 80 + clampPct(bits - 128, 0, 64) * 0.3125) };
  }

  function clampPct(v, lo, hi) {
    const x = Math.max(lo, Math.min(hi, v));
    return ((x - lo) / (hi - lo)) * 100;
  }


  function generate(n) {
    state.words = [];
    for (let i = 0; i < n; i++) state.words.push(secureRandomWord(state.listKey));
    refreshExtras();
    render();
  }

  function addWord() {
    state.words.push(secureRandomWord(state.listKey));
    refreshExtras();
    render();
  }

  function shuffle() {
    if (state.words.length === 0) return;
    state.words = secureShuffle(state.words);
    refreshExtras();
    render();
  }

  function refreshExtras() {
    if (state.words.length > 0) {
      state._capsIndex = secureRandomInt(state.words.length);
    } else {
      state._capsIndex = null;
    }
    state._symbolChar = secureRandomSymbol();
  }


  function $(id) { return document.getElementById(id); }

  function setListKey(key) {
    if (!LISTS[key]) return;
    state.listKey = key;
    document.querySelectorAll("[data-list]").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.list === key);
    });
    updateListMeta();

    const defaultCount = (key === "short") ? 8 : 6;
    try {
      generate(defaultCount);
    } catch (e) {
      state.words = [];
      render();
      showListError(e.message);
    }
  }

  function updateListMeta() {
    const list = LISTS[state.listKey];
    const haveList = !!(list.words && list.words.length === list.expected);
    const meta = $("listMeta");
    if (haveList) {
      meta.innerHTML =
        `Aktív lista: <strong>${escapeHtml(list.label)}</strong> · ` +
        `Entrópia / szó: <strong>${bitsPerWord(state.listKey).toFixed(2)} bit</strong> · ` +
        `Dobás / szó: <strong>${list.diceRoll} kockadobás</strong>`;
      meta.classList.remove("is-error");
    } else {
      const got = list.words ? list.words.length : 0;
      meta.innerHTML =
        `⚠ A "<strong>${escapeHtml(list.label)}</strong>" lista nem tölthető be — ` +
        `várt <strong>${list.expected}</strong> szó, kapott <strong>${got}</strong>. ` +
        `Cseréld le a <code>diceware_hungarian_long.js</code> tartalmát a teljes listára.`;
      meta.classList.add("is-error");
    }
  }

  function showListError(msg) {
    const out = $("passphraseOutput");
    out.value = "";
    out.placeholder = msg;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  function render() {
    const passphrase = renderPassphrase(state);
    const out = $("passphraseOutput");
    out.value = passphrase;
    out.placeholder = "A jelmondat itt fog megjelenni…";

    $("wordCount").textContent = state.words.length;

    const bits = entropyBits(state);
    $("entropyBits").textContent = bits.toFixed(1) + " bit";
    $("entropyLengthInfo").textContent =
      passphrase.length > 0
        ? `${passphrase.length} karakter`
        : "—";

    const cls = entropyClass(bits);
    const meter = $("entropyMeterFill");
    meter.style.width = (state.words.length === 0 ? 0 : cls.pct) + "%";
    meter.className = "meter-fill meter-" + cls.cls;
    $("entropyLabel").textContent = state.words.length === 0 ? "—" : cls.label;
    $("entropyLabel").className = "entropy-label entropy-" + cls.cls;

    renderCrackTable(bits, state.words.length === 0);

    $("copyBtn").disabled = state.words.length === 0;
    $("shuffleBtn").disabled = state.words.length < 2;
    $("addWordBtn").disabled = state.words.length === 0;
  }

  function renderCrackTable(bits, empty, tbodyId) {
    const tbody = $(tbodyId || "crackTableBody");
    tbody.innerHTML = "";
    for (const a of ATTACKERS) {
      const tr = document.createElement("tr");
      const tdAttacker = document.createElement("td");
      tdAttacker.textContent = a.label;
      const tdTime = document.createElement("td");
      tdTime.className = "crack-time";
      if (empty) {
        tdTime.textContent = "—";
      } else {
        const s = crackSeconds(bits, a.gps);
        tdTime.textContent = formatDuration(s);
      }
      tr.appendChild(tdAttacker);
      tr.appendChild(tdTime);
      tbody.appendChild(tr);
    }
  }

  function wireUp() {

    document.querySelectorAll("[data-list]").forEach(btn => {
      btn.addEventListener("click", () => setListKey(btn.dataset.list));
    });

    document.querySelectorAll("[data-count]").forEach(btn => {
      btn.addEventListener("click", () => {
        try { generate(parseInt(btn.dataset.count, 10)); }
        catch (e) { showListError(e.message); }
      });
    });

    $("addWordBtn").addEventListener("click", () => {
      try { addWord(); } catch (e) { showListError(e.message); }
    });
    $("shuffleBtn").addEventListener("click", shuffle);

    document.querySelectorAll("input[name='separator']").forEach(r => {
      r.addEventListener("change", () => {
        state.separator = r.value;
        render();
      });
    });

    $("randomCapsToggle").addEventListener("change", e => {
      state.randomCaps = e.target.checked;
      if (state.randomCaps && state.words.length > 0) {
        state._capsIndex = secureRandomInt(state.words.length);
      }
      render();
    });

    $("appendSymbolToggle").addEventListener("change", e => {
      state.appendSymbol = e.target.checked;
      if (state.appendSymbol) state._symbolChar = secureRandomSymbol();
      render();
    });

    $("deaccentToggle").addEventListener("change", e => {
      state.deaccent = e.target.checked;
      render();
    });

    $("copyBtn").addEventListener("click", async () => {
      const text = $("passphraseOutput").value;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        flashCopyButton(true);
      } catch (e) {
        const out = $("passphraseOutput");
        out.select();
        try {
          document.execCommand("copy");
          flashCopyButton(true);
        } catch (_) {
          flashCopyButton(false);
        }
        out.setSelectionRange(0, 0);
      }
    });

    const diceState = {
      listKey: "long",
      words: [],
      separator: "-",
      deaccent: false
    };

    function diceEntropyBits() {
      const bpw = Math.log2(LISTS[diceState.listKey].expected);
      return diceState.words.length * bpw;
    }

    function diceRenderPassphrase() {
      if (diceState.words.length === 0) return "";
      let words = diceState.words.slice();
      if (diceState.deaccent) words = words.map(deaccentString);
      if (diceState.separator === "") {
        return words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join("");
      }
      return words.join(diceState.separator);
    }

    function diceRenderUI() {
      const wrap = $("diceCollectedWrap");
      const n    = diceState.words.length;
      if (n === 0) { wrap.hidden = true; return; }
      wrap.hidden = false;

      $("diceWordCount").textContent = n;

      const chipList = $("diceWordList");
      chipList.innerHTML = "";
      diceState.words.forEach((w, i) => {
        const chip = document.createElement("span");
        chip.className = "dw-dice-chip";
        const label = document.createElement("span");
        label.textContent = diceState.deaccent ? deaccentString(w) : w;
        const del = document.createElement("button");
        del.type = "button";
        del.className = "dw-dice-chip-del";
        del.setAttribute("aria-label", `${w} törlése`);
        del.textContent = "×";
        del.addEventListener("click", () => {
          diceState.words.splice(i, 1);
          diceRenderUI();
        });
        chip.appendChild(label);
        chip.appendChild(del);
        chipList.appendChild(chip);
      });

      const phrase = diceRenderPassphrase();
      $("dicePassphraseOutput").value = phrase;

      const bits = diceEntropyBits();
      $("diceEntropyBits").textContent = bits.toFixed(1) + " bit";
      $("diceEntropyLengthInfo").textContent = phrase.length + " karakter";
      const cls = entropyClass(bits);
      $("diceEntropyMeterFill").style.width = cls.pct + "%";
      $("diceEntropyMeterFill").className = "meter-fill meter-" + cls.cls;
      $("diceEntropyLabel").textContent = cls.label;
      $("diceEntropyLabel").className = "entropy-label entropy-" + cls.cls;

      renderCrackTable(bits, false, "diceCrackTableBody");

      $("diceCopyBtn").disabled = false;
    }

    const diceListSelect = $("diceListSelect");
    const diceRollInput  = $("diceRollInput");
    const diceResult     = $("diceResult");
    const diceAddBtn     = $("diceAddBtn");

    function lookupDiceWord() {
      const listKey  = diceListSelect ? diceListSelect.value : "long";
      const list     = LISTS[listKey];
      const raw      = diceRollInput ? diceRollInput.value.trim() : "";

      if (!raw) {
        diceResult.textContent = "";
        if (diceAddBtn) diceAddBtn.disabled = true;
        return;
      }

      const digits   = raw.replace(/[^1-6]/g, "");
      const expected = list.diceRoll;

      if (digits.length !== expected) {
        diceResult.textContent =
          `⚠ ${expected} db 1–6 közötti számjegy szükséges (pl. ${expected === 4 ? "2341" : "13456"}).`;
        diceResult.className = "dw-dice-result dw-dice-error";
        if (diceAddBtn) diceAddBtn.disabled = true;
        return;
      }

      let index = 0;
      for (const ch of digits) {
        index = index * 6 + (parseInt(ch, 10) - 1);
      }

      if (!list.words || index >= list.words.length) {
        diceResult.textContent = "⚠ Szó nem található a listában.";
        diceResult.className = "dw-dice-result dw-dice-error";
        if (diceAddBtn) diceAddBtn.disabled = true;
        return;
      }

      const word = list.words[index];
      diceResult.textContent = `🎲 ${digits}  →  ${word}`;
      diceResult.className = "dw-dice-result dw-dice-ok";
      if (diceAddBtn) { diceAddBtn.disabled = false; diceAddBtn._currentWord = word; }
    }

    function diceAddWord() {
      const word = diceAddBtn && diceAddBtn._currentWord;
      if (!word) return;
      diceState.listKey = diceListSelect ? diceListSelect.value : "long";
      diceState.words.push(word);
      diceRollInput.value = "";
      diceResult.textContent = "";
      diceAddBtn.disabled = true;
      diceAddBtn._currentWord = null;
      diceRollInput.focus();
      diceRenderUI();
    }

    if (diceRollInput) {
      diceRollInput.addEventListener("input", lookupDiceWord);
      diceRollInput.addEventListener("keydown", e => {
        if (e.key === "Enter" && diceAddBtn && !diceAddBtn.disabled) diceAddWord();
      });
    }
    if (diceAddBtn) {
      diceAddBtn.addEventListener("click", diceAddWord);
    }
    if (diceListSelect) {
      diceListSelect.addEventListener("change", () => {
        diceState.listKey = diceListSelect.value;
        diceState.words   = [];
        if (diceRollInput) diceRollInput.value = "";
        if (diceResult)    diceResult.textContent = "";
        if (diceAddBtn)    { diceAddBtn.disabled = true; diceAddBtn._currentWord = null; }
        diceRenderUI();
        lookupDiceWord();
      });
    }

    document.querySelectorAll("input[name='diceSeparator']").forEach(r => {
      r.addEventListener("change", () => {
        diceState.separator = r.value;
        diceRenderUI();
      });
    });

    const diceDeaccentToggle = $("diceDeaccentToggle");
    if (diceDeaccentToggle) {
      diceDeaccentToggle.addEventListener("change", e => {
        diceState.deaccent = e.target.checked;
        diceRenderUI();
      });
    }


    $("diceClearBtn").addEventListener("click", () => {
      diceState.words = [];
      if (diceRollInput) { diceRollInput.value = ""; diceRollInput.focus(); }
      if (diceResult)    diceResult.textContent = "";
      if (diceAddBtn)    { diceAddBtn.disabled = true; diceAddBtn._currentWord = null; }
      diceRenderUI();
    });


    $("diceCopyBtn").addEventListener("click", async () => {
      const text = $("dicePassphraseOutput").value;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        flashDiceCopyButton(true);
      } catch (e) {
        const out = $("dicePassphraseOutput");
        out.select();
        try { document.execCommand("copy"); flashDiceCopyButton(true); }
        catch (_) { flashDiceCopyButton(false); }
        out.setSelectionRange(0, 0);
      }
    });

    function flashDiceCopyButton(ok) {
      const btn = $("diceCopyBtn");
      const orig = btn.textContent;
      btn.textContent = ok ? "✓ Vágólapra másolva" : "✗ Másolás sikertelen";
      btn.classList.add(ok ? "copy-ok" : "copy-fail");
      setTimeout(() => { btn.textContent = orig; btn.classList.remove("copy-ok", "copy-fail"); }, 1800);
    }


    $("themeToggle").addEventListener("click", () => {
      const html = document.documentElement;
      const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      try { localStorage.setItem("dw-theme", next); } catch (_) {}
      updateThemeButton();
    });


    try {
      const saved = localStorage.getItem("dw-theme");
      if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
    } catch (_) {}
    updateThemeButton();
  }

  function updateThemeButton() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const wrap = $("themeToggle");
    let icon = document.getElementById("themeToggleIcon");
    if (!icon) {
      icon = document.createElement("i");
      icon.id = "themeToggleIcon";
      icon.setAttribute("aria-hidden", "true");
      wrap.insertBefore(icon, wrap.firstChild);
    } else if (icon.tagName.toLowerCase() === "svg") {
    
      const newIcon = document.createElement("i");
      newIcon.id = "themeToggleIcon";
      newIcon.setAttribute("aria-hidden", "true");
      icon.replaceWith(newIcon);
      icon = newIcon;
    }
    icon.setAttribute("data-lucide", isDark ? "sun" : "moon");
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  function flashCopyButton(ok) {
    const btn = $("copyBtn");
    const orig = btn.textContent;
    btn.textContent = ok ? "✓ Vágólapra másolva" : "✗ Másolás sikertelen";
    btn.classList.add(ok ? "copy-ok" : "copy-fail");
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove("copy-ok", "copy-fail");
    }, 1800);
  }

  function init() {
    wireUp();
    setListKey("long"); 
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
