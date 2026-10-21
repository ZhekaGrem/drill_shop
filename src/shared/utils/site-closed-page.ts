// src/shared/utils/site-closed-page.ts
// Сторінка «Сайт закрито» (shared/config/site-closed.ts): одне вікно Windows 98 на бірюзовому робочому столі, як
// решта дизайну (docs/windows-95-98-encyclopedia.md). Самодостатній HTML без жодного зовнішнього файлу: middleware
// віддає його відразу, не чіпаючи ні React, ні Supabase, ні статику збірки.
import { siteConfig } from '@/shared/config/site';

// Інформаційна «бульбашка» Windows із синьою «і».
const INFO_ICON =
  '<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
  '<path d="M16 2.5C8.5 2.5 3 7.4 3 13.5c0 3.9 2.2 7.2 5.6 9.2L7 29l7.1-4.6c.6.1 1.2.1 1.9.1 7.5 0 13-4.9 13-11S23.5 2.5 16 2.5Z" fill="#fff" stroke="#000"/>' +
  '<circle cx="16" cy="8.2" r="2.1" fill="#000080"/><path d="M13 12h4.4v8.5H19v2.2h-6.2v-2.2h1.4V14.2H13Z" fill="#000080"/></svg>';

const STYLES = `
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:16px;background:#008080;color:#000;font:15px/1.45 Tahoma,Verdana,"Segoe UI",Arial,sans-serif}
.window{width:min(480px,100%);padding:3px;background:#c0c0c0;box-shadow:inset 1px 1px #dfdfdf,inset -1px -1px #000,inset 2px 2px #fff,inset -2px -2px #808080,4px 4px 0 rgb(0 0 0/35%)}
.title{display:flex;align-items:center;min-height:28px;padding:3px 8px;background:linear-gradient(90deg,#000080,#1084d0);color:#fff;font-size:14px;font-weight:700}
.body{display:flex;gap:16px;align-items:flex-start;padding:20px 18px 6px}
.body svg{flex:none}
h1{margin:0 0 8px;font-size:18px;line-height:1.3}
p{margin:0 0 8px}
.actions{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:12px 18px 16px}
.button{display:inline-flex;align-items:center;justify-content:center;min-width:112px;min-height:34px;padding:4px 16px;background:#c0c0c0;color:#000;text-decoration:none;box-shadow:inset 1px 1px #fff,inset -1px -1px #000,inset 2px 2px #dfdfdf,inset -2px -2px #808080}
.button.default{font-weight:700;box-shadow:0 0 0 1px #000,inset 1px 1px #fff,inset -1px -1px #000,inset 2px 2px #dfdfdf,inset -2px -2px #808080}
.button:active{padding:5px 15px 3px 17px;box-shadow:inset 1px 1px #000,inset -1px -1px #fff,inset 2px 2px #808080,inset -2px -2px #dfdfdf}
.button:focus-visible{outline:1px dotted #000;outline-offset:-5px}
.status{display:flex;gap:3px}
.status span{flex:1;padding:2px 8px;font-size:12px;box-shadow:inset 1px 1px #808080,inset -1px -1px #fff}
@media (max-width:480px){.button{flex:1;min-height:44px}.button.default{flex-basis:100%}}
@media (forced-colors:active){.window,.button,.status span{border:1px solid CanvasText}}
`;

/** Повний HTML сторінки «Сайт закрито» */
export function siteClosedHtml(): string {
  const { instagram, telegram } = siteConfig.socials;
  return `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#008080">
<title>Сайт закрито — Є.Дріл</title>
<style>${STYLES}</style>
</head>
<body>
<main class="window" aria-labelledby="closed-title">
<div class="title" aria-hidden="true">Є.Дріл — Сайт закрито</div>
<div class="body">${INFO_ICON}<div>
<h1 id="closed-title">Сайт тимчасово закрито</h1>
<p>Ми допрацьовуємо дизайн магазину. Завтра відкриємось — заходь трохи згодом.</p>
<p>Новини — в Instagram і Telegram.</p>
</div></div>
<div class="actions">
<a class="button default" href="">Спробувати ще раз</a>
<a class="button" href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
<a class="button" href="${telegram}" target="_blank" rel="noopener noreferrer">Telegram</a>
</div>
<div class="status"><span>Є.Дріл / 98</span><span>Відкриємось завтра</span></div>
</main>
</body>
</html>`;
}
