/*
 * PixPluck - popup.js
 * Owns the popup: theme, tabs, fetching media from the active Pexels tab,
 * rendering cards, filtering, selection, and handing downloads to the worker.
 */
(function () {
  "use strict";

  // Small inline icons kept as trusted static markup.
  var ICON_CHECK = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M5 12.5 10 17 19 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  var ICON_DOWNLOAD = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 3v10m0 0 3.5-3.5M12 13 8.5 9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_COPY = '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="9" y="9" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_OPEN = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M14 4h6v6M20 4l-8 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_EMPTY = '<svg viewBox="0 0 64 64" width="52" height="52"><rect x="10" y="16" width="44" height="32" rx="5" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="22" cy="28" r="4" fill="currentColor"/><path d="M14 46 L28 33 L37 41 L45 34 L50 39" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_WARN = '<svg viewBox="0 0 64 64" width="52" height="52"><path d="M32 10 58 52H6z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><line x1="32" y1="27" x2="32" y2="39" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><circle cx="32" cy="45" r="1.9" fill="currentColor"/></svg>';
  var ICON_GLOBE = '<svg viewBox="0 0 64 64" width="52" height="52"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.6"/><ellipse cx="32" cy="32" rx="10" ry="22" fill="none" stroke="currentColor" stroke-width="2.4"/><line x1="10" y1="32" x2="54" y2="32" stroke="currentColor" stroke-width="2.6"/><line x1="14" y1="21" x2="50" y2="21" stroke="currentColor" stroke-width="2.2"/><line x1="14" y1="43" x2="50" y2="43" stroke="currentColor" stroke-width="2.2"/></svg>';

  // ---- element references ----
  var themeToggle = document.getElementById("themeToggle");
  var settingsToggle = document.getElementById("settingsToggle");
  var settingsPanel = document.getElementById("settings");
  var folderInput = document.getElementById("folderInput");
  var askWhere = document.getElementById("askWhere");
  var tabsEl = document.querySelector(".tabs");
  var toolbarEl = document.querySelector(".toolbar");
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var fetchBtn = document.getElementById("fetchBtn");
  var fetchLabel = document.getElementById("fetchLabel");
  var searchInput = document.getElementById("searchInput");
  var subbar = document.getElementById("subbar");
  var selectAll = document.getElementById("selectAll");
  var countChip = document.getElementById("countChip");
  var downloadSelected = document.getElementById("downloadSelected");
  var downloadAll = document.getElementById("downloadAll");
  var results = document.getElementById("results");
  var progressEl = document.getElementById("progress");
  var progressText = document.getElementById("progressText");
  var progressCount = document.getElementById("progressCount");
  var progressBar = document.getElementById("progressBar");
  var cancelBtn = document.getElementById("cancelBtn");
  var toastEl = document.getElementById("toast");

  // ---- state ----
  var state = {
    tab: "video",
    data: { video: null, image: null },
    selected: { video: new Set(), image: new Set() },
    cards: { video: new Map(), image: new Map() }
  };

  // ---- tiny DOM helper ----
  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (key) {
        if (key === "class") {
          node.className = props[key];
        } else if (key === "text") {
          node.textContent = props[key];
        } else if (key === "html") {
          node.innerHTML = props[key];
        } else if (key === "dataset") {
          Object.assign(node.dataset, props[key]);
        } else {
          node.setAttribute(key, props[key]);
        }
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || typeof child === "undefined") {
        return;
      }
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  // ---- toast ----
  var toastTimer;
  function toast(message, isError) {
    toastEl.textContent = message;
    toastEl.classList.toggle("is-error", !!isError);
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  // ---- theme ----
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  themeToggle.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    chrome.storage.local.set({ theme: next });
  });

  // ---- settings (save location) ----
  settingsToggle.addEventListener("click", function () {
    var willOpen = settingsPanel.hidden;
    settingsPanel.hidden = !willOpen;
    settingsToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });

  folderInput.addEventListener("change", function () {
    chrome.storage.local.set({ downloadFolder: folderInput.value.trim() });
  });

  askWhere.addEventListener("change", function () {
    chrome.storage.local.set({ askWhere: askWhere.checked });
  });

  // ---- tabs ----
  function switchTab(kind) {
    state.tab = kind;
    tabsEl.dataset.active = kind;
    tabButtons.forEach(function (btn) {
      var active = btn.dataset.tab === kind;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    fetchLabel.textContent = kind === "video" ? "Fetch videos" : "Fetch images";
    searchInput.value = "";
    renderResults(kind);
    chrome.storage.local.set({ lastTab: kind });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchTab(btn.dataset.tab);
    });
  });

  // ---- active tab helpers ----
  function getActiveTab() {
    return chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
      return tabs && tabs.length ? tabs[0] : null;
    });
  }

  function isPexels(url) {
    return typeof url === "string" && /^https?:\/\/([a-z0-9-]+\.)*pexels\.com\//i.test(url);
  }

  // ---- fetch ----
  fetchBtn.addEventListener("click", function () {
    fetchMedia(state.tab);
  });

  async function fetchMedia(kind) {
    var tab;
    try {
      tab = await getActiveTab();
    } catch (err) {
      tab = null;
    }

    if (!tab || !isPexels(tab.url)) {
      showState(buildState(ICON_WARN, "You are not on Pexels", "Open a <strong>pexels.com</strong> page in this tab, then hit fetch again."));
      toast("Open a pexels.com page first", true);
      return;
    }

    showSkeletons();
    fetchBtn.disabled = true;

    try {
      var injection = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeMedia,
        args: [kind]
      });
      var payload = injection && injection[0] && injection[0].result ? injection[0].result : { items: [], count: 0 };
      state.data[kind] = payload.items || [];
      state.selected[kind] = new Set();
      renderResults(kind);
      if (payload.count) {
        toast("Found " + payload.count + " " + (kind === "video" ? "videos" : "images"));
      }
    } catch (err) {
      state.data[kind] = null;
      showState(buildState(ICON_WARN, "Could not read this page", "Reload the Pexels tab and try again. Some pages block scripts until they finish loading."));
      toast("Could not read this page", true);
    } finally {
      fetchBtn.disabled = false;
    }
  }

  // ---- rendering ----
  function showState(node) {
    results.innerHTML = "";
    results.appendChild(node);
    subbar.hidden = true;
  }

  // Shows the normal interactive UI (used when the active tab is a Pexels page).
  function showMainUi() {
    tabsEl.hidden = false;
    toolbarEl.hidden = false;
  }

  // Shown when the popup is opened on any page that is not Pexels. It hides the
  // fetch and download controls entirely and offers a link to open Pexels.
  function showOffSiteGate() {
    tabsEl.hidden = true;
    toolbarEl.hidden = true;
    subbar.hidden = true;
    progressEl.hidden = true;

    var wrap = el("div", { class: "state" }, [
      el("div", { class: "state-art", html: ICON_GLOBE }),
      el("h2", { text: "Open Pexels to get started" }),
      el("p", { html: "PixPluck works on <strong>pexels.com</strong>. Head over, find the videos or images you want, then open PixPluck again." })
    ]);
    var action = el("div", { class: "gate-action" });
    var go = el("button", { class: "btn btn-primary", type: "button", html: ICON_OPEN + "<span>Go to Pexels</span>" });
    go.addEventListener("click", function () {
      chrome.tabs.create({ url: "https://www.pexels.com/" });
      window.close();
    });
    action.appendChild(go);
    wrap.appendChild(action);

    results.innerHTML = "";
    results.appendChild(wrap);
  }

  function buildState(iconHtml, title, text) {
    return el("div", { class: "state" }, [
      el("div", { class: "state-art", html: iconHtml }),
      el("h2", { text: title }),
      el("p", { html: text })
    ]);
  }

  function buildIntro(kind) {
    var label = kind === "video" ? "Fetch videos" : "Fetch images";
    var word = kind === "video" ? "videos" : "images";
    return buildState(
      ICON_EMPTY,
      "Ready when you are",
      "Open a Pexels page, then hit <strong>" + label + "</strong> to pull the " + word + " into view. Scroll the page first to load more."
    );
  }

  function buildEmpty(kind) {
    var word = kind === "video" ? "videos" : "images";
    return buildState(
      ICON_EMPTY,
      "Nothing found yet",
      "We could not spot any " + word + " on this page. Scroll down to load more, then fetch again."
    );
  }

  function showSkeletons() {
    results.innerHTML = "";
    subbar.hidden = true;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 5; i++) {
      frag.appendChild(
        el("div", {
          class: "skeleton",
          html: '<div class="sk-thumb"></div><div class="sk-lines"><div class="sk-line mid"></div><div class="sk-line short"></div><div class="sk-line"></div></div>'
        })
      );
    }
    results.appendChild(frag);
  }

  function renderResults(kind) {
    var items = state.data[kind];
    results.innerHTML = "";
    state.cards[kind] = new Map();

    if (items === null || typeof items === "undefined") {
      results.appendChild(buildIntro(kind));
      subbar.hidden = true;
      return;
    }
    if (!items.length) {
      results.appendChild(buildEmpty(kind));
      subbar.hidden = true;
      return;
    }

    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      var card = kind === "video" ? buildVideoCard(item) : buildImageCard(item);
      state.cards[kind].set(item.id, card);
      frag.appendChild(card);
    });
    results.appendChild(frag);
    subbar.hidden = false;
    applyFilter();
    updateSubbar();
  }

  function buildVideoCard(item) {
    var card = el("div", { class: "card" });
    card._item = item;

    var thumb = el("div", { class: "card-thumb", tabindex: "0", role: "button", "aria-label": "Select video " + item.id });
    var media = el("video", { muted: "", loop: "", playsinline: "", preload: item.poster ? "none" : "metadata" });
    media.muted = true;
    if (item.poster) {
      media.poster = item.poster;
    }
    if (item.preview) {
      var source = document.createElement("source");
      source.src = item.preview;
      source.type = "video/mp4";
      media.appendChild(source);
    }
    var badge = el("span", { class: "play-badge", html: ICON_PLAY });
    var tag = el("span", { class: "tag-chip", text: item.best && item.best.tag ? item.best.tag : "VIDEO" });
    var check = el("span", { class: "check-overlay", html: ICON_CHECK });
    thumb.append(media, badge, tag, check);

    thumb.addEventListener("mouseenter", function () {
      var playing = media.play();
      if (playing && playing.catch) {
        playing.catch(function () {});
      }
    });
    thumb.addEventListener("mouseleave", function () {
      media.pause();
      try {
        media.currentTime = 0;
      } catch (e) {}
    });
    thumb.addEventListener("click", function () {
      toggleSelect("video", item.id);
    });
    thumb.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSelect("video", item.id);
      }
    });

    var body = el("div", { class: "card-body" });
    var title = el("div", { class: "card-title" }, [
      el("span", { text: "#" + item.id }),
      el("span", { class: "dot", text: "•" }),
      el("span", { class: "muted", text: item.best ? item.best.label : "video" })
    ]);

    var select = el("select", { class: "quality", "aria-label": "Video quality for " + item.id });
    item.variants.forEach(function (variant, index) {
      var opt = el("option", { value: variant.url });
      opt.dataset.label = variant.label;
      opt.textContent = (variant.tag ? variant.tag + " " : "") + variant.label + (variant.fps ? " (" + variant.fps + " fps)" : "");
      if (index === 0) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    var actions = el("div", { class: "card-actions" });
    var dl = el("button", { class: "btn btn-solid btn-sm", type: "button", html: ICON_DOWNLOAD + "<span>Download</span>" });
    dl.addEventListener("click", function () {
      var label = select.selectedOptions[0] ? select.selectedOptions[0].dataset.label : item.best.label;
      downloadItems([{ url: select.value, filename: "pexels-video-" + item.id + "-" + label + ".mp4" }]);
    });
    var copyBtn = el("button", { class: "mini-btn", type: "button", "aria-label": "Copy link", title: "Copy link", html: ICON_COPY });
    copyBtn.addEventListener("click", function () {
      copyLink(select.value);
    });
    var openBtn = el("button", { class: "mini-btn", type: "button", "aria-label": "Open in new tab", title: "Open in new tab", html: ICON_OPEN });
    openBtn.addEventListener("click", function () {
      openLink(select.value);
    });
    actions.append(dl, copyBtn, openBtn);

    body.append(title, select, actions);
    card.append(thumb, body);
    return card;
  }

  function buildImageCard(item) {
    var card = el("div", { class: "card" });
    card._item = item;

    var thumb = el("div", { class: "card-thumb", tabindex: "0", role: "button", "aria-label": "Select image " + item.id });
    var img = el("img", { alt: "Pexels photo " + item.id, loading: "lazy" });
    img.src = item.previewUrl;
    img.addEventListener("error", function () {
      if (img.src !== item.downloadUrl) {
        img.src = item.downloadUrl;
      }
    });
    var tag = el("span", { class: "tag-chip", text: "IMG" });
    var check = el("span", { class: "check-overlay", html: ICON_CHECK });
    thumb.append(img, tag, check);

    thumb.addEventListener("click", function () {
      toggleSelect("image", item.id);
    });
    thumb.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSelect("image", item.id);
      }
    });

    var ext = (item.downloadUrl.match(/\.(jpe?g|png|webp)/i) || ["", "jpeg"])[1].toLowerCase();
    var body = el("div", { class: "card-body" });
    var title = el("div", { class: "card-title" }, [
      el("span", { text: "#" + item.id }),
      el("span", { class: "dot", text: "•" }),
      el("span", { class: "muted", text: "Photo" })
    ]);
    var actions = el("div", { class: "card-actions" });
    var dl = el("button", { class: "btn btn-solid btn-sm", type: "button", html: ICON_DOWNLOAD + "<span>Download</span>" });
    dl.addEventListener("click", function () {
      downloadItems([{ url: item.downloadUrl, filename: "pexels-photo-" + item.id + "." + ext }]);
    });
    var copyBtn = el("button", { class: "mini-btn", type: "button", "aria-label": "Copy link", title: "Copy link", html: ICON_COPY });
    copyBtn.addEventListener("click", function () {
      copyLink(item.downloadUrl);
    });
    var openBtn = el("button", { class: "mini-btn", type: "button", "aria-label": "Open in new tab", title: "Open in new tab", html: ICON_OPEN });
    openBtn.addEventListener("click", function () {
      openLink(item.downloadUrl);
    });
    actions.append(dl, copyBtn, openBtn);

    body.append(title, actions);
    card.append(thumb, body);
    return card;
  }

  // ---- selection ----
  function toggleSelect(kind, id) {
    var selected = state.selected[kind];
    var card = state.cards[kind].get(id);
    if (!card) {
      return;
    }
    if (selected.has(id)) {
      selected.delete(id);
      card.classList.remove("is-selected");
    } else {
      selected.add(id);
      card.classList.add("is-selected");
    }
    updateSubbar();
  }

  function getVisibleIds(kind) {
    var ids = [];
    state.cards[kind].forEach(function (card, id) {
      if (card.style.display !== "none") {
        ids.push(id);
      }
    });
    return ids;
  }

  selectAll.addEventListener("change", function () {
    var kind = state.tab;
    var visibleIds = getVisibleIds(kind);
    var shouldSelect = selectAll.checked;
    visibleIds.forEach(function (id) {
      var card = state.cards[kind].get(id);
      if (shouldSelect) {
        state.selected[kind].add(id);
      } else {
        state.selected[kind].delete(id);
      }
      if (card) {
        card.classList.toggle("is-selected", shouldSelect);
      }
    });
    updateSubbar();
  });

  function updateSubbar() {
    var kind = state.tab;
    var items = state.data[kind];
    var hasData = Array.isArray(items) && items.length > 0;
    subbar.hidden = !hasData;
    if (!hasData) {
      return;
    }
    var selCount = state.selected[kind].size;
    countChip.textContent = items.length + " found";
    downloadSelected.disabled = selCount === 0;
    downloadSelected.textContent = selCount ? "Download selected (" + selCount + ")" : "Download selected";

    var visibleIds = getVisibleIds(kind);
    var selectedVisible = visibleIds.filter(function (id) {
      return state.selected[kind].has(id);
    });
    selectAll.checked = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
    selectAll.indeterminate = selectedVisible.length > 0 && selectedVisible.length < visibleIds.length;
  }

  // ---- search filter ----
  function applyFilter() {
    var kind = state.tab;
    var query = searchInput.value.trim().toLowerCase();
    state.cards[kind].forEach(function (card, id) {
      var item = card._item;
      var hay = String(id);
      if (kind === "video" && item.variants) {
        hay += " " + item.variants.map(function (v) {
          return v.label + " " + v.tag;
        }).join(" ");
      }
      card.style.display = hay.toLowerCase().indexOf(query) !== -1 ? "" : "none";
    });
    updateSubbar();
  }

  searchInput.addEventListener("input", applyFilter);

  // ---- link actions ----
  function copyLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () {
          toast("Link copied to clipboard");
        },
        function () {
          toast("Could not copy link", true);
        }
      );
    } else {
      toast("Could not copy link", true);
    }
  }

  function openLink(url) {
    chrome.tabs.create({ url: url });
  }

  // ---- downloads ----
  function collectItems(kind, ids) {
    var list = [];
    ids.forEach(function (id) {
      var card = state.cards[kind].get(id);
      if (!card) {
        return;
      }
      var item = card._item;
      if (kind === "video") {
        var select = card.querySelector(".quality");
        var url = select ? select.value : item.best.url;
        var label = select && select.selectedOptions[0] ? select.selectedOptions[0].dataset.label : (item.best ? item.best.label : "video");
        list.push({ url: url, filename: "pexels-video-" + id + "-" + label + ".mp4" });
      } else {
        var ext = (item.downloadUrl.match(/\.(jpe?g|png|webp)/i) || ["", "jpeg"])[1].toLowerCase();
        list.push({ url: item.downloadUrl, filename: "pexels-photo-" + id + "." + ext });
      }
    });
    return list;
  }

  downloadAll.addEventListener("click", function () {
    var kind = state.tab;
    var items = state.data[kind];
    if (!items || !items.length) {
      return;
    }
    var ids = items.map(function (item) {
      return item.id;
    });
    downloadItems(collectItems(kind, ids));
  });

  downloadSelected.addEventListener("click", function () {
    var kind = state.tab;
    var ids = Array.prototype.slice.call(state.selected[kind]);
    if (!ids.length) {
      return;
    }
    downloadItems(collectItems(kind, ids));
  });

  // One port for the popup's lifetime. The worker may sleep and drop it, so it
  // is rebuilt on demand rather than held onto blindly.
  var port = null;
  var cancelRequested = false;

  function getPort() {
    if (port) {
      return port;
    }
    port = chrome.runtime.connect({ name: "pixpluck-downloads" });
    port.onMessage.addListener(handleWorkerMessage);
    port.onDisconnect.addListener(function () {
      port = null;
    });
    return port;
  }

  function handleWorkerMessage(message) {
    if (message.type === "progress") {
      progressEl.hidden = false;
      updateProgress(message.done, message.total);
      return;
    }
    if (message.type !== "done" && message.type !== "cancelled") {
      return;
    }

    updateProgress(message.done, message.total);
    var saved = message.done - message.failed;

    if (message.type === "cancelled") {
      var skipped = message.total - message.done;
      progressText.textContent = "Stopped";
      toast("Stopped. " + saved + " saved, " + skipped + " skipped");
    } else {
      var suffix = message.failed ? " (" + message.failed + " failed)" : "";
      toast("Saved " + saved + " of " + message.total + suffix, message.failed > 0);
    }
    setTimeout(hideProgress, 1400);
  }

  function downloadItems(items) {
    if (!items || !items.length) {
      return;
    }
    showProgress(0, items.length);
    getPort().postMessage({
      type: "download",
      items: items,
      folder: folderInput.value.trim(),
      saveAs: askWhere.checked
    });
  }

  cancelBtn.addEventListener("click", function () {
    cancelRequested = true;
    cancelBtn.disabled = true;
    progressText.textContent = "Stopping";
    getPort().postMessage({ type: "cancel" });
  });

  function showProgress(done, total) {
    progressEl.hidden = false;
    cancelRequested = false;
    cancelBtn.disabled = false;
    updateProgress(done, total);
  }

  function updateProgress(done, total) {
    if (!cancelRequested) {
      progressText.textContent = done >= total ? "Finishing up" : "Downloading";
    }
    progressCount.textContent = done + " / " + total;
    progressBar.style.width = total ? Math.round((done / total) * 100) + "%" : "0%";
  }

  function hideProgress() {
    progressEl.hidden = true;
    progressBar.style.width = "0%";
    cancelRequested = false;
    cancelBtn.disabled = false;
  }

  // ---- boot ----
  // Light is the default. If the user has toggled the theme before, that saved
  // choice is applied instead.
  applyTheme("light");
  chrome.storage.local.get(["theme", "lastTab", "downloadFolder", "askWhere"], function (stored) {
    if (stored.theme) {
      applyTheme(stored.theme);
    }
    if (typeof stored.downloadFolder === "string") {
      folderInput.value = stored.downloadFolder;
    }
    askWhere.checked = !!stored.askWhere;
    // The full interface only makes sense on Pexels. Anywhere else, show a gate
    // that points the user to the site instead.
    getActiveTab().then(function (tab) {
      if (tab && isPexels(tab.url)) {
        showMainUi();
        switchTab(stored.lastTab === "image" ? "image" : "video");
        // If a batch is still running from an earlier popup session, show it
        // again so it stays cancellable.
        getPort().postMessage({ type: "status" });
      } else {
        showOffSiteGate();
      }
    }).catch(function () {
      showOffSiteGate();
    });
  });
})();
