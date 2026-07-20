<div align="center">

<img src="icons/icon128.png" width="96" alt="PixPluck logo" />

# PixPluck

**Grab any video or image from Pexels, in a single click.**

PixPluck is a small, no-nonsense browser extension for Chrome and Edge. It reads the Pexels page you are on, shows you every video and image with real previews, and lets you download one, a few, or all of them at once. No hunting for links, no detour sites, no sign up.

<p>
  <img src="https://img.shields.io/badge/version-1.0.0-05A081?style=flat-square" alt="Version 1.0.0" />
  <img src="https://img.shields.io/badge/manifest-v3-05A081?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/built%20with-vanilla%20JS-05A081?style=flat-square" alt="Built with Vanilla JS" />
  <img src="https://img.shields.io/badge/license-MIT-05A081?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Chrome%20%7C%20Edge-supported-05A081?style=flat-square" alt="Chrome and Edge supported" />
</p>

</div>

---

## See it in action

<div align="center">

<table>
  <tr>
    <td align="center" width="33%"><img src="screenshots/videos-light.png" alt="Videos tab, light theme" /></td>
    <td align="center" width="33%"><img src="screenshots/images-dark.png" alt="Images tab, dark theme" /></td>
    <td align="center" width="33%"><img src="screenshots/downloading.png" alt="Downloading a batch with a cancel button" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Videos, light theme</b></sub></td>
    <td align="center"><sub><b>Images, dark theme</b></sub></td>
    <td align="center"><sub><b>Batch download with cancel</b></sub></td>
  </tr>
</table>

</div>

---

## Why I built it

Grabbing stock footage from Pexels had quietly become a chore. Every clip meant opening a new tab, clicking through to its download page, choosing a size, then repeating the whole dance for the next one. Pulling together twenty clips for a single project was twenty little errands.

PixPluck collapses all of that into one click. It sits quietly in your toolbar, wakes up only on Pexels, and hands you everything on the page at once, ready to save. That is the whole idea: less clicking, more doing.

---

## What it does for you

| The usual way | With PixPluck |
| --- | --- |
| Open each item in its own tab | Everything on the page, listed at once |
| Guess what you are about to download | See a real preview first |
| Take whatever size is offered | Pick the exact resolution yourself |
| Save files one at a time | Save one, a selection, or the whole page |
| No way to stop a large batch | One button stops it instantly |
| Copy links by hand | Copy a direct link or open it in a tab |

---

## Features

- **Two clear tabs.** Videos and Images live side by side, so you always know what you are collecting.
- **Real previews.** Photos show a thumbnail, and videos play a muted preview the moment you hover them.
- **Every resolution.** For videos, a dropdown lists each size PixPluck can find and defaults to the sharpest one.
- **Download your way.** Save a single item, tick a few and grab the selection, or take the entire page in one go.
- **A real stop button.** Started a huge batch by accident? Press Cancel and nothing else begins downloading.
- **Search and filter.** Narrow a long list of results by id or resolution.
- **Copy or open.** Every item has a button to copy its direct link or open it in a new tab.
- **Light and dark themes.** It follows your system automatically and remembers if you change it.
- **Choose where files go.** By default they save straight to your Downloads folder. Set a subfolder to keep things tidy, or turn on "ask where to save" to pick any location per file.
- **Genuinely private.** No account, no analytics, no server of its own. Nothing about you ever leaves your browser.

---

## Installation

PixPluck is not on the Chrome Web Store yet, so you load it as an unpacked extension. There is no build step and nothing to compile, so the whole thing takes about a minute.

### Step 1: Download the extension

Get the code whichever way is easier for you.

- **The simple way:** click the green **Code** button near the top of this page, choose **Download ZIP**, then unzip it somewhere you will remember.
- **With git:**

  ```bash
  git clone https://github.com/m-abdullah-awais/pixpluck-pexels-downloader-extension.git
  ```

### Step 2: Open your browser's extensions page

Type the matching address into your address bar and press Enter.

| Browser | Address |
| --- | --- |
| Chrome | `chrome://extensions` |
| Edge | `edge://extensions` |
| Brave | `brave://extensions` |

### Step 3: Turn on Developer mode

Flip the **Developer mode** switch in the top right corner. This is what lets a browser run an unpacked extension.

### Step 4: Load PixPluck

Click **Load unpacked**, then choose the extension folder (the one that has `manifest.json` inside it). PixPluck shows up in your list straight away.

### Step 5 (optional): Pin it to your toolbar

Click the puzzle piece icon in your toolbar, find PixPluck, and click the pin beside it. Its icon now stays in your toolbar, always a single click away. You can skip this, but pinning makes it far quicker to reach.

> That is it. PixPluck is installed and ready. On to the fun part.

---

## How to use it

### Step 1: Open a Pexels page

Head to any page on [pexels.com](https://www.pexels.com). Search results, a single video, or a photo page all work.

### Step 2: Load more results (optional)

On a grid of search results, scroll down a little first. Pexels loads items as you scroll, and PixPluck grabs whatever the page has loaded, so a quick scroll gives you more to choose from.

### Step 3: Open PixPluck

Click the PixPluck icon in your toolbar. If you did not pin it, click the puzzle piece icon first and pick it from the list.

### Step 4: Choose a tab and fetch

Select the **Videos** or **Images** tab, then press **Fetch**. PixPluck reads the page and lays out everything it finds, each with a preview.

### Step 5: Preview and choose a quality

Browse the results. Hover any video to watch a quick preview. For videos, pick the resolution you want from the dropdown, which starts on the highest available.

### Step 6: Download

Save your media whichever way suits the moment.

- Press **Download** on a card to save just that one.
- Tick a few thumbnails, then press **Download selected**.
- Press **Download all** to take the whole page at once.

By default your files land straight in your Downloads folder. You can change that in the next section.

---

## Good to know

**Choosing where files save.** Click the folder icon in the top right of the popup to open the save location settings. Type a name to save into a subfolder of your Downloads, for example `Pexels Clips`, or leave it empty to save directly to Downloads. If you would rather pick any folder on your computer, turn on "Ask where to save each file" and your browser will show a folder picker for each download. Browsers only let extensions save inside your Downloads folder automatically, which is why choosing a location outside it uses the picker.

**The Cancel button.** While a batch runs, you get a progress bar with a **Cancel** button beside it. Downloads are queued one at a time with a small gap between them, so even a big page never floods your machine. Press Cancel and the queue stops on the spot. Files that already started will finish on their own, and you can manage those from your browser's own downloads page.

**Video resolutions.** Pexels offers each video in several sizes, from 360p up to 4K. On a video's own page the full list is usually available, so the quality dropdown fills right up. On a busy search grid, the page often only exposes the preview size, so a clip there may show a single option. Want every resolution for one specific clip? Open that clip's own page and fetch again.

---

## Permissions and privacy

PixPluck asks for the smallest set of permissions it possibly can, and nothing beyond them.

| Permission | Why it is needed |
| --- | --- |
| Access to `pexels.com` pages | To read the media on the page you are viewing. It cannot touch any other site. |
| Downloads | To save the files you choose. |
| Storage | To remember your theme and last used tab. |

Everything runs on your own machine. There is no server behind PixPluck, no analytics, and no tracking of any kind. The only network requests are the ordinary ones your browser makes to load the previews and the files you asked for.

---

## FAQ

**Does this work on sites other than Pexels?**
No, and that is by design. It only has permission for pexels.com and stays dormant everywhere else.

**Why does a video only show one resolution?**
You are most likely on a search grid, which only loads the preview file. Open that clip's own page and fetch again to see every size.

**Nothing showed up when I pressed Fetch. Why?**
The page may still have been loading, or it may simply have no media on it. Scroll down a little and try again.

**Can I use these files commercially?**
That is between you and the [Pexels License](https://www.pexels.com/license/), not this tool. Pexels content is free to use under generous terms, but please read the license and credit creators where you can.

**Will downloading a whole page slow down my computer?**
No. Downloads are queued one at a time with a short gap between them, and you can stop the queue at any moment with Cancel.

---

## For developers

PixPluck is built with plain HTML, CSS, and JavaScript on Manifest V3. No framework, no bundler, no build step for the shipped code.

- The popup injects a small, self contained scraper into the active tab with `chrome.scripting.executeScript`, then renders whatever it returns.
- Downloads run through a cancellable queue in the background service worker, so a batch keeps going even if you close the popup, and a single Cancel stops everything.
- The only dev time dependency is `sharp`, used once to turn `assets/logo.master.svg` into the PNG icon set.

Regenerate the icons after editing the logo:

```bash
npm install
npm run icons
```

Run the tests:

```bash
node assets/parser.test.mjs   # checks the media parser
node assets/queue.test.mjs    # checks the download queue and cancel
```

**Project layout**

```
manifest.json     extension manifest (MV3)
popup.html        popup markup
popup.css         design system and both themes
popup.js          popup logic: tabs, fetch, render, select, download, theme
scraper.js        the self contained page scraper
background.js     cancellable download queue
icons/            generated PNG icon set
assets/           logo source, icon generator, tests
screenshots/      images used in this README
```

---

## Contributing

Issues and pull requests are genuinely welcome. If you hit a Pexels page where the fetch comes up short, [open an issue](https://github.com/m-abdullah-awais/pixpluck-pexels-downloader-extension/issues) with the URL and I will take a look.

## License

Released under the [MIT License](LICENSE). Use it, learn from it, build on it.

---

<div align="center">

## The developer

<img src="icons/icon128.png" width="64" alt="PixPluck" />

### Muhammad Abdullah Awais

**Full Stack Developer**

I build fast, clean, practical tools that scratch a real itch. PixPluck came straight out of one of mine: needing a pile of stock clips and not wanting to click through fifty download pages to get them. If it saves you some of that time too, that makes my day.

🌐 [www.abdullahawais.com](https://www.abdullahawais.com) &nbsp;&nbsp;|&nbsp;&nbsp; 📧 [contact@abdullahawais.com](mailto:contact@abdullahawais.com)

<p>
  <a href="https://www.abdullahawais.com"><img src="https://img.shields.io/badge/Website-05A081?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Website" /></a>
  <a href="https://github.com/m-abdullah-awais"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://www.linkedin.com/in/m-abdullah-awais-programmer"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://www.youtube.com/@m_abdullah_awais"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" /></a>
  <a href="https://www.instagram.com/m_abdullah_awais"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
  <a href="mailto:contact@abdullahawais.com"><img src="https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>
</p>

</div>

---

<div align="center">

### Found PixPluck useful?

If it saved you some time, a star on the repo genuinely helps other people find it.

<a href="https://github.com/m-abdullah-awais/pixpluck-pexels-downloader-extension">
  <img src="https://img.shields.io/github/stars/m-abdullah-awais/pixpluck-pexels-downloader-extension?style=for-the-badge&logo=github&color=05A081&labelColor=181717" alt="Star this repo on GitHub" />
</a>

<br />
<br />

<sub>Built with care by <a href="https://www.abdullahawais.com"><b>Muhammad Abdullah Awais</b></a></sub>

<br />
<br />

<sub><b>Not affiliated with Pexels.</b> PixPluck is an independent, unofficial tool and is not endorsed by or connected to Pexels in any way. Pexels and the Pexels logo are trademarks of their respective owner. It only helps you download media you are already free to use, so please follow the <a href="https://www.pexels.com/license/">Pexels License</a> and credit creators where you can.</sub>

</div>
