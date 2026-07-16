/*
 * PixPluck - background.js (service worker)
 *
 * Downloads are handled here rather than in the popup so a large "download all"
 * batch keeps going even after the popup window closes. The popup opens a port,
 * sends the list of files, and we stream progress back while it is still open.
 */

const DOWNLOAD_FOLDER = "PixPluck";
const STEP_DELAY_MS = 350;

function wait(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// Keep only characters that are safe inside a download path.
function safeName(name) {
  return String(name || "file").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim();
}

function startDownload(url, filename) {
  return new Promise(function (resolve) {
    chrome.downloads.download(
      {
        url: url,
        filename: DOWNLOAD_FOLDER + "/" + safeName(filename),
        conflictAction: "uniquify",
        saveAs: false
      },
      function (downloadId) {
        if (chrome.runtime.lastError || typeof downloadId === "undefined") {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

async function runBatch(items, post) {
  const total = items.length;
  let done = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const ok = await startDownload(item.url, item.filename);
    done += 1;
    if (!ok) {
      failed += 1;
    }
    post({ type: "progress", done: done, total: total, failed: failed });
    if (i < items.length - 1) {
      await wait(STEP_DELAY_MS);
    }
  }

  post({ type: "done", total: total, failed: failed });
}

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name !== "pixpluck-downloads") {
    return;
  }

  let connected = true;
  port.onDisconnect.addListener(function () {
    connected = false;
  });

  // Posting to a closed port throws, so guard every send. Downloads still finish.
  const post = function (message) {
    if (!connected) {
      return;
    }
    try {
      port.postMessage(message);
    } catch (err) {
      connected = false;
    }
  };

  port.onMessage.addListener(function (message) {
    if (message && message.type === "download" && Array.isArray(message.items) && message.items.length) {
      runBatch(message.items, post);
    }
  });
});
