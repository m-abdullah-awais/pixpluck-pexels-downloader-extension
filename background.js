/*
 * PixPluck - background.js (service worker)
 *
 * Downloads are handled here rather than in the popup so a large batch keeps
 * going even after the popup window closes.
 *
 * Everything runs through one cancellable queue. That way a "download all" on a
 * huge page can be stopped instantly, and pressing Download while a batch is
 * already running just adds to the same queue instead of racing it.
 */

const DOWNLOAD_FOLDER = "PixPluck";
const STEP_DELAY_MS = 350;

// The one active batch, or null when nothing is running.
let current = null;

// Post functions for every connected popup, so progress reaches whoever is open.
const listeners = new Set();

function broadcast(message) {
  listeners.forEach(function (post) {
    post(message);
  });
}

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

async function runQueue() {
  if (!current || current.running) {
    return;
  }
  current.running = true;

  while (current.queue.length && !current.cancelled) {
    const item = current.queue.shift();
    const ok = await startDownload(item.url, item.filename);
    current.done += 1;
    if (!ok) {
      current.failed += 1;
    }
    broadcast({ type: "progress", done: current.done, total: current.total, failed: current.failed });

    if (current.cancelled) {
      break;
    }
    if (current.queue.length) {
      await wait(STEP_DELAY_MS);
    }
  }

  // Anything still queued is dropped here, so no further downloads ever start.
  const summary = {
    type: current.cancelled ? "cancelled" : "done",
    done: current.done,
    total: current.total,
    failed: current.failed
  };
  current = null;
  broadcast(summary);
}

function enqueue(items) {
  if (!current) {
    current = { queue: [], cancelled: false, running: false, done: 0, total: 0, failed: 0 };
  }
  items.forEach(function (item) {
    current.queue.push(item);
  });
  current.total += items.length;
  broadcast({ type: "progress", done: current.done, total: current.total, failed: current.failed });
  runQueue();
}

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name !== "pixpluck-downloads") {
    return;
  }

  let connected = true;

  // Posting to a closed port throws, so guard every send.
  const post = function (message) {
    if (!connected) {
      return;
    }
    try {
      port.postMessage(message);
    } catch (err) {
      connected = false;
      listeners.delete(post);
    }
  };

  listeners.add(post);

  port.onDisconnect.addListener(function () {
    connected = false;
    listeners.delete(post);
  });

  port.onMessage.addListener(function (message) {
    if (!message) {
      return;
    }
    if (message.type === "download" && Array.isArray(message.items) && message.items.length) {
      enqueue(message.items);
    } else if (message.type === "cancel") {
      if (current) {
        current.cancelled = true;
        current.queue.length = 0;
      }
    } else if (message.type === "status") {
      // Lets a reopened popup pick a running batch back up.
      if (current) {
        post({ type: "progress", done: current.done, total: current.total, failed: current.failed });
      }
    }
  });
});
