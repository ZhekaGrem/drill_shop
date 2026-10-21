// src/shared/utils/site-closed-page.ts
// Сторінка «Сайт закрито» (shared/config/site-closed.ts): одне вікно Windows 98 на бірюзовому робочому столі, як
// решта дизайну (docs/windows-95-98-encyclopedia.md). На табличці лише два рядки: «Сайт закрито» у смузі заголовка
// (це й є h1) і «Може, потім відкриємося.» поруч з іконкою. Самодостатній HTML без жодного зовнішнього файлу:
// middleware віддає його відразу, не чіпаючи ні React, ні Supabase, ні статику збірки.

// Інформаційна «бульбашка» Windows із синьою «і».
const INFO_ICON =
  '<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
  '<path d="M16 2.5C8.5 2.5 3 7.4 3 13.5c0 3.9 2.2 7.2 5.6 9.2L7 29l7.1-4.6c.6.1 1.2.1 1.9.1 7.5 0 13-4.9 13-11S23.5 2.5 16 2.5Z" fill="#fff" stroke="#000"/>' +
  '<circle cx="16" cy="8.2" r="2.1" fill="#000080"/><path d="M13 12h4.4v8.5H19v2.2h-6.2v-2.2h1.4V14.2H13Z" fill="#000080"/></svg>';

const STYLES = `
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:16px;background:#008080;color:#000;font:15px/1.45 Tahoma,Verdana,"Segoe UI",Arial,sans-serif}
.window{width:min(400px,100%);padding:3px;background:#c0c0c0;box-shadow:inset 1px 1px #dfdfdf,inset -1px -1px #000,inset 2px 2px #fff,inset -2px -2px #808080,4px 4px 0 rgb(0 0 0/35%)}
h1{display:flex;align-items:center;min-height:28px;margin:0;padding:3px 8px;background:linear-gradient(90deg,#000080,#1084d0);color:#fff;font-size:14px;font-weight:700;line-height:1.3}
.body{display:flex;gap:16px;align-items:center;padding:22px 20px 24px}
.body svg{flex:none}
p{margin:0;font-size:16px}
@media (forced-colors:active){.window{border:1px solid CanvasText}}
`;

/** Повний HTML сторінки «Сайт закрито» */
export function siteClosedHtml(): string {
  return `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#008080">
<title>Сайт закрито</title>
<style>${STYLES}</style>
</head>
<body>
<main class="window" aria-labelledby="closed-title">
<h1 id="closed-title">Сайт закрито</h1>
<div class="body">${INFO_ICON}<p>Може, потім відкриємося.</p></div>
</main>
</body>
</html>`;
}
