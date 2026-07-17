/*
 * Headless test for the background download queue.
 * Loads the real background.js with a mocked chrome API, starts a big batch,
 * cancels part way, and proves no further downloads start afterwards.
 *
 *   node assets/queue.test.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "background.js"), "utf8");

function loadWorker() {
  const state = { started: [], onConnect: null };
  const chrome = {
    runtime: {
      lastError: null,
      onConnect: {
        addListener: function (fn) {
          state.onConnect = fn;
        }
      }
    },
    downloads: {
      download: function (opts, cb) {
        state.started.push(opts.filename);
        const id = state.started.length;
        setTimeout(function () {
          cb(id);
        }, 1);
      }
    }
  };
  // Run background.js with our fake chrome instead of the browser's.
  new Function("chrome", source)(chrome);
  return state;
}

function connect(state) {
  const port = { name: "pixpluck-downloads", sent: [] };
  port.postMessage = function (m) {
    port.sent.push(m);
  };
  port.onMessage = {
    addListener: function (fn) {
      port.receive = fn;
    }
  };
  port.onDisconnect = { addListener: function () {} };
  state.onConnect(port);
  return port;
}

function sleep(ms) {
  return new Promise(function (r) {
    setTimeout(r, ms);
  });
}

let failures = 0;
function check(name, condition) {
  if (condition) {
    console.log("  ok   " + name);
  } else {
    failures++;
    console.log("  FAIL " + name);
  }
}

const items = [];
for (let i = 0; i < 60; i++) {
  items.push({ url: "https://videos.pexels.com/video-files/" + i + "/" + i + "-sd_360_640_30fps.mp4", filename: "clip-" + i + ".mp4" });
}

console.log("download queue:");
const state = loadWorker();
const port = connect(state);

port.receive({ type: "download", items: items });
await sleep(900);

const startedBeforeCancel = state.started.length;
check("downloads start when queued", startedBeforeCancel > 0);
check("does not dump all 60 at once", startedBeforeCancel < items.length);

port.receive({ type: "cancel" });
await sleep(1600);

const startedAfterCancel = state.started.length;
check("no new downloads start after cancel", startedAfterCancel <= startedBeforeCancel + 1);
check("the rest of the queue is dropped", startedAfterCancel < items.length);

const summary = port.sent.filter(function (m) {
  return m.type === "cancelled";
});
check("popup is told the batch was cancelled", summary.length === 1);
check("cancel summary reports fewer done than total", summary.length === 1 && summary[0].done < summary[0].total);

// Nothing should trickle in after the batch is torn down.
const settled = state.started.length;
await sleep(700);
check("queue stays stopped", state.started.length === settled);

console.log("");
console.log("started " + settled + " of " + items.length + " before cancel took effect");
if (failures) {
  console.log(failures + " check(s) failed");
  process.exit(1);
} else {
  console.log("All checks passed");
}
