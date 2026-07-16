/*
 * Headless test for scraper.js.
 * Loads the real scrapeMedia function, feeds it fixture HTML that mimics a
 * Pexels page (including escaped slashes and html entities), and checks the
 * parsing without needing a browser.
 *
 *   node assets/parser.test.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "scraper.js"), "utf8");

// Build a callable scrapeMedia with an injected document, dodging module systems.
function makeScraper(html) {
  const factory = new Function("document", source + "\nreturn scrapeMedia;");
  return factory({ documentElement: { outerHTML: html } });
}

// Fixture: two videos (one with three resolutions), a video poster, and a photo.
const fixture = `
<html><body>
  <video><source src="https:\\/\\/videos.pexels.com\\/video-files\\/7423713\\/7423713-sd_360_640_30fps.mp4"></video>
  <script>{"link":"https://videos.pexels.com/video-files/7423713/7423713-hd_720_1280_30fps.mp4"}</script>
  <a href="https://videos.pexels.com/video-files/7423713/7423713-uhd_1440_2560_30fps.mp4">4k</a>
  <video><source src="https://videos.pexels.com/video-files/999888/999888-sd_640_360_25fps.mp4"></video>
  <source src="https://videos.pexels.com/video-files/999888/999888-hd_1280_720_25fps.mp4">
  <img src="https://images.pexels.com/videos/7423713/pexels-photo-7423713.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=500">
  <img src="https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg?cs=srgb&amp;dl=x&amp;w=1200">
</body></html>`;

let failures = 0;
function check(name, condition) {
  if (condition) {
    console.log("  ok   " + name);
  } else {
    failures++;
    console.log("  FAIL " + name);
  }
}

const scrapeMedia = makeScraper(fixture);

console.log("videos:");
const videos = scrapeMedia("video");
check("finds 2 videos", videos.count === 2);
const v = videos.items.find(function (item) { return item.id === "7423713"; });
check("groups all resolutions for id 7423713", v && v.variants.length === 3);
check("sorts best resolution first", v && v.best.label === "1440x2560");
check("lowest resolution is last", v && v.variants[v.variants.length - 1].label === "360x640");
check("parses fps", v && v.best.fps === 30);
check("has a poster image", v && v.poster.indexOf("images.pexels.com/videos/7423713") !== -1);
check("second video keeps its two variants", (function () {
  const other = videos.items.find(function (item) { return item.id === "999888"; });
  return other && other.variants.length === 2 && other.best.label === "1280x720";
})());

console.log("images:");
const images = scrapeMedia("image");
check("finds 2 images", images.count === 2);
check("image download url has no query", images.items.every(function (i) { return i.downloadUrl.indexOf("?") === -1; }));
check("keeps the photo id", images.items.some(function (i) { return i.id === "1234567"; }));
check("keeps the video poster id", images.items.some(function (i) { return i.id === "7423713"; }));
check("preview url adds sizing params", images.items.every(function (i) { return i.previewUrl.indexOf("w=400") !== -1; }));

console.log("");
if (failures) {
  console.log(failures + " check(s) failed");
  process.exit(1);
} else {
  console.log("All checks passed");
}
