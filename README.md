# PixPluck - Pexels Media Grabber

PixPluck is a small Chrome and Edge extension that pulls the videos and images out of any Pexels page and lets you download them without hunting for links. Open a Pexels page, click the icon, and grab one item, a handful, or everything on the page.

It is built with plain HTML, CSS, and JavaScript. No frameworks, no trackers, no accounts. Everything happens locally in your browser.

![PixPluck logo](icons/icon128.png)

## What it does

- Reads the current Pexels tab and finds every video and image on it.
- Shows real previews inside the popup, not a wall of raw links.
- Detects the different resolutions a video ships with and lets you pick the one you want, defaulting to the highest.
- Downloads a single item, a selection you tick off, or the whole page in one go.
- Sorts your files into a tidy `PixPluck` folder inside your Downloads.

## Features

- **Two tabs, one job each.** A Videos tab and an Images tab, so you always know what you are grabbing.
- **Live previews.** Images show a thumbnail. Videos play a muted preview when you hover the thumbnail.
- **Quality picker.** Each video card has a dropdown with every resolution PixPluck could find.
- **Pick and choose.** Tap any thumbnail to select it, use Select all, then Download selected.
- **Search and filter.** Filter the fetched results by id or by resolution.
- **Copy or open.** Every card has a button to copy the direct link or open the file in a new tab.
- **Light and dark themes.** Follows your system by default, and remembers your choice.
- **Progress you can see.** A live progress bar tracks batch downloads.

## Install (load unpacked)

PixPluck is not on the Web Store yet, so you load it as an unpacked extension. It takes about a minute.

1. Download or clone this repository to a folder on your computer.
2. Open `chrome://extensions` in Chrome, or `edge://extensions` in Edge.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and choose this project folder.
5. PixPluck appears in your toolbar. Pin it so it is always one click away.

## How to use it

1. Go to any Pexels page. A search results page, a video page, or a photo page all work.
2. If you are on a grid of results, scroll down a little first so the page loads more items.
3. Click the PixPluck icon.
4. Pick the **Videos** or **Images** tab and press **Fetch**.
5. Browse the previews. For a video, choose a resolution from the dropdown.
6. Download in whatever way suits you:
   - Press **Download** on a single card.
   - Tap thumbnails to select several, then press **Download selected**.
   - Press **Download all** to grab everything on the page.

Your files land in `Downloads/PixPluck`.

## A note on video resolutions

Pexels serves each video in several sizes, from 360p up to 4K. On a video's own page the full list of resolutions is usually available, so the quality dropdown fills up nicely. On a busy grid of search results the page often exposes only the preview quality, so a video there may show just one option. If you want every resolution for a specific clip, open that clip's own page and fetch again.

## Permissions, and why

PixPluck asks for the smallest set of permissions it can:

- **Access to pexels.com pages** so it can read the media on the page you are viewing.
- **Downloads** so it can save the files you pick.
- **Storage** so it can remember your theme and last used tab.

It does not talk to any server of its own, collect anything about you, or touch pages that are not on Pexels.

## Privacy

Everything runs on your machine. There is no analytics, no external API, and no data leaves your browser other than the normal requests your browser makes to download the media you asked for.

## Tech notes

- Manifest V3, vanilla JavaScript, no build step for the shipped code.
- The popup injects a small self-contained scraper into the active tab with `chrome.scripting.executeScript`, then renders whatever it returns.
- Downloads run in the background service worker so a large batch keeps going even if you close the popup.
- The only dev-time dependency is `sharp`, used once to turn `assets/logo.master.svg` into the PNG icon set. Regenerate the icons any time with `npm install` then `npm run icons`.

## Project layout

```
manifest.json     extension manifest (MV3)
popup.html        popup markup
popup.css         design system and both themes
popup.js          popup logic: tabs, fetch, render, select, download, theme
scraper.js        the self-contained page scraper
background.js     download worker
icons/            generated PNG icon set
assets/           logo source and the icon generator
```

## Developer

Made by **Muhammad Abdullah Awais**, Full Stack Developer.
Website: [www.abdullahawais.com](https://www.abdullahawais.com)

## License

Released under the [MIT License](LICENSE). Use it, learn from it, build on it.

## A friendly reminder

Pexels content is free to use, but please respect the [Pexels License](https://www.pexels.com/license/) and credit creators where you can. PixPluck is a convenience tool for media you already have the right to use.
