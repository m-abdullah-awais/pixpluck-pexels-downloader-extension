/*
 * PixPluck - scraper.js
 *
 * scrapeMedia(kind) is written as a single self-contained function on purpose.
 * The popup passes it to chrome.scripting.executeScript({ func: scrapeMedia }),
 * which serializes the function source and runs it inside the Pexels page.
 * Because of that it must not reference anything outside its own body, so every
 * helper lives inside it.
 *
 * kind is either "video" or "image". It returns { kind, items, count }.
 */
function scrapeMedia(kind) {
  // The whole page HTML also carries the embedded JSON that Pexels ships, so a
  // single scan of it picks up both the visible media and the lazy data.
  var raw = document.documentElement ? document.documentElement.outerHTML : "";
  var text = raw.replace(/\\\//g, "/").replace(/&amp;/g, "&");

  // Collect every Pexels video file url and remember which id it belongs to.
  var videoRe = /https:\/\/videos\.pexels\.com\/video-files\/(\d+)\/[^"'\\\s)]+?\.mp4/g;
  var videoUrls = {};
  var match;
  while ((match = videoRe.exec(text)) !== null) {
    videoUrls[match[0]] = match[1];
  }

  // Collect every Pexels image url (video posters live under /videos, photos under /photos).
  var imageRe = /https:\/\/images\.pexels\.com\/(?:videos|photos)\/(\d+)\/[^"'\\\s)]+?\.(?:jpe?g|png|webp)(?:\?[^"'\\\s)]*)?/g;
  var imageUrls = {};
  while ((match = imageRe.exec(text)) !== null) {
    imageUrls[match[0]] = match[1];
  }

  // Map each id to a clean poster image so video cards have a thumbnail.
  var posterById = {};
  Object.keys(imageUrls).forEach(function (url) {
    var poster = url.match(/images\.pexels\.com\/videos\/(\d+)\//);
    if (poster) {
      var id = poster[1];
      if (!posterById[id]) {
        var base = url.split("?")[0];
        posterById[id] = base + "?auto=compress&cs=tinysrgb&w=600";
      }
    }
  });

  if (kind === "video") {
    var groups = {};
    Object.keys(videoUrls).forEach(function (url) {
      var id = videoUrls[url];
      var tail = url.split("/").pop();
      var dims = tail.match(/_(\d+)_(\d+)_(\d+)fps/);
      var tagged = tail.match(/-([a-z0-9]+)_\d+_\d+_\d+fps/i);
      var w = dims ? parseInt(dims[1], 10) : 0;
      var h = dims ? parseInt(dims[2], 10) : 0;
      var fps = dims ? parseInt(dims[3], 10) : 0;
      var variant = {
        url: url,
        width: w,
        height: h,
        fps: fps,
        tag: tagged ? tagged[1].toUpperCase() : "",
        pixels: w * h,
        label: w && h ? w + "x" + h : "source"
      };
      if (!groups[id]) {
        groups[id] = [];
      }
      groups[id].push(variant);
    });

    var videoItems = Object.keys(groups).map(function (id) {
      var variants = groups[id].sort(function (a, b) {
        return b.pixels - a.pixels;
      });
      // Drop duplicate resolutions that differ only by cache path.
      var seen = {};
      variants = variants.filter(function (v) {
        var key = v.label + "_" + v.fps;
        if (seen[key]) {
          return false;
        }
        seen[key] = true;
        return true;
      });
      return {
        id: id,
        poster: posterById[id] || "",
        preview: variants.length ? variants[variants.length - 1].url : "",
        variants: variants,
        best: variants[0]
      };
    });
    videoItems.sort(function (a, b) {
      return parseInt(b.id, 10) - parseInt(a.id, 10);
    });
    return { kind: "video", items: videoItems, count: videoItems.length };
  }

  // Images: dedupe by the url without its sizing query so each photo appears once.
  var baseMap = {};
  Object.keys(imageUrls).forEach(function (url) {
    var id = imageUrls[url];
    var base = url.split("?")[0];
    if (baseMap[base]) {
      return;
    }
    baseMap[base] = {
      id: id,
      downloadUrl: base,
      previewUrl: base + "?auto=compress&cs=tinysrgb&w=400"
    };
  });
  var imageItems = Object.keys(baseMap).map(function (key) {
    return baseMap[key];
  });
  imageItems.sort(function (a, b) {
    return parseInt(b.id, 10) - parseInt(a.id, 10);
  });
  return { kind: "image", items: imageItems, count: imageItems.length };
}

// Exported for the headless Node parser test. Ignored inside the browser.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { scrapeMedia: scrapeMedia };
}
