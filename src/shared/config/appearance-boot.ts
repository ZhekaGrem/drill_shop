import { DESIGN_FALLBACK, DESIGN_IDS } from './design';
import { rotationSnippet } from './design-rotation';

// Runs before paint. Keep theme rules aligned with theme.ts; parity is tested.
export const appearanceBootScript =
  `(function(){try{var d=document.documentElement;` +
  `var IDS=${JSON.stringify(DESIGN_IDS)};` +
  `var ds=localStorage.getItem('design');` +
  `if(IDS.indexOf(ds)<0){ds=${JSON.stringify(DESIGN_FALLBACK)};${rotationSnippet()}}` +
  `if(ds!=='diia'){d.setAttribute('data-design',ds);}else{d.removeAttribute('data-design');}` +
  `var t=localStorage.getItem('theme');` +
  `if(t!=='dark'&&t!=='light'){` +
  `if(ds==='streetwear'){t='dark';}` +
  `else if(ds==='cupertino'||ds==='editorial'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}` +
  `else{var h=new Date().getHours();t=h>=18||h<6?'dark':'light';}}` +
  `d.setAttribute('data-theme',t);d.setAttribute('data-mantine-color-scheme',t);` +
  `}catch(e){}})();`;
