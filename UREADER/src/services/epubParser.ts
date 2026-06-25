import * as FileSystem from 'expo-file-system';

export interface EpubMetadata {
  title: string;
  author: string;
  publisher?: string;
  language?: string;
  description?: string;
  isbn?: string;
  coverPath?: string;
}

export interface EpubChapter {
  id: string;
  title: string;
  href: string;
  order: number;
  content?: string;
}

export interface ParsedEpub {
  metadata: EpubMetadata;
  chapters: EpubChapter[];
  coverBase64?: string;
}

export const getEpubReaderHtml = (options: {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  textAlign: string;
  backgroundColor: string;
  textColor: string;
  margins: number;
}): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/epub.js/0.3.93/epub.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: ${options.backgroundColor};
      color: ${options.textColor};
      overflow: hidden;
      font-family: ${options.fontFamily};
      -webkit-tap-highlight-color: transparent;
    }
    #viewer {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    #viewer iframe {
      border: none !important;
    }
    #prev-zone, #next-zone, #menu-zone {
      position: fixed;
      top: 0;
      height: 100%;
      z-index: 10;
    }
    #prev-zone { left: 0; width: 30%; }
    #menu-zone { left: 30%; width: 40%; }
    #next-zone { right: 0; width: 30%; }
    #loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 18px;
      color: ${options.textColor};
    }
  </style>
</head>
<body>
  <div id="loading">Loading...</div>
  <div id="viewer"></div>
  <div id="prev-zone"></div>
  <div id="menu-zone"></div>
  <div id="next-zone"></div>

  <script>
    let book, rendition, currentCfi;
    const viewer = document.getElementById('viewer');
    const loading = document.getElementById('loading');

    function sendMessage(type, data) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
    }

    function openBook(url, cfi) {
      book = ePub(url);
      rendition = book.renderTo(viewer, {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'paginated',
      });

      rendition.themes.default({
        body: {
          'font-size': '${options.fontSize}px !important',
          'font-family': '${options.fontFamily} !important',
          'line-height': '${options.lineHeight} !important',
          'text-align': '${options.textAlign} !important',
          'color': '${options.textColor} !important',
          'background-color': '${options.backgroundColor} !important',
          'padding': '${options.margins}px !important',
        },
        'p, div, span, h1, h2, h3, h4, h5, h6, li, td, th': {
          'color': '${options.textColor} !important',
        }
      });

      const displayed = cfi ? rendition.display(cfi) : rendition.display();

      displayed.then(() => {
        loading.style.display = 'none';
      });

      rendition.on('relocated', (location) => {
        currentCfi = location.start.cfi;
        const progress = book.locations.percentageFromCfi(currentCfi);
        sendMessage('locationChanged', {
          cfi: currentCfi,
          progress: Math.round((progress || 0) * 100),
          chapter: location.start.index,
          page: location.start.displayed?.page || 0,
          totalPages: location.start.displayed?.total || 0,
        });
      });

      rendition.on('selected', (cfiRange, contents) => {
        const text = rendition.getRange(cfiRange).toString();
        sendMessage('textSelected', { cfi: cfiRange, text });
      });

      book.ready.then(() => {
        return book.locations.generate(1600);
      }).then(() => {
        sendMessage('bookReady', {
          title: book.packaging.metadata.title,
          author: book.packaging.metadata.creator,
          totalLocations: book.locations.length(),
        });
      });

      book.loaded.navigation.then((nav) => {
        const toc = nav.toc.map((ch, i) => ({
          id: ch.id,
          title: ch.label.trim(),
          href: ch.href,
          level: 0,
          children: (ch.subitems || []).map((sub, j) => ({
            id: sub.id,
            title: sub.label.trim(),
            href: sub.href,
            level: 1,
            children: [],
          })),
        }));
        sendMessage('tocLoaded', { toc });
      });
    }

    function nextPage() { if (rendition) rendition.next(); }
    function prevPage() { if (rendition) rendition.prev(); }
    function goTo(target) { if (rendition) rendition.display(target); }

    function updateTheme(settings) {
      if (!rendition) return;
      rendition.themes.default({
        body: {
          'font-size': settings.fontSize + 'px !important',
          'font-family': settings.fontFamily + ' !important',
          'line-height': settings.lineHeight + ' !important',
          'text-align': settings.textAlign + ' !important',
          'color': settings.textColor + ' !important',
          'background-color': settings.backgroundColor + ' !important',
          'padding': settings.margins + 'px !important',
        },
        'p, div, span, h1, h2, h3, h4, h5, h6, li, td, th': {
          'color': settings.textColor + ' !important',
        }
      });
      document.body.style.backgroundColor = settings.backgroundColor;
    }

    function searchText(query) {
      if (!book) return;
      Promise.all(
        book.spine.spineItems.map(item =>
          item.load(book.load.bind(book))
            .then(item.find.bind(item, query))
            .finally(item.unload.bind(item))
        )
      ).then(results => {
        sendMessage('searchResults', { results: results.flat() });
      });
    }

    document.getElementById('prev-zone').addEventListener('click', prevPage);
    document.getElementById('next-zone').addEventListener('click', nextPage);
    document.getElementById('menu-zone').addEventListener('click', () => {
      sendMessage('toggleMenu', {});
    });

    window.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case 'open': openBook(msg.url, msg.cfi); break;
        case 'next': nextPage(); break;
        case 'prev': prevPage(); break;
        case 'goTo': goTo(msg.target); break;
        case 'updateTheme': updateTheme(msg.settings); break;
        case 'search': searchText(msg.query); break;
      }
    });
  </script>
</body>
</html>`;
};
