// src/widgets/Header/slot-cycle.ts
// Коло фаз слота хедера. Окремо від хука, бо це чиста функція: її перевіряє
// scripts/check-news.mjs, а хук лише крутить по ній індекс.
//
// Дзвіночок стоїть у колі ЗАВЖДИ, коли новини взагалі є (рішення власника
// 2026-09-20): прочитане теж треба мати як перечитати. Непрочитане міняє не
// коло, а лише червону крапку на кнопці.
//
// Після меню й чату йдуть гра «Дріл Мото» та «Галичина». Дзвіночок лишається доступним у
// довгому колі, а меню повертається перед ним.
export type SlotPhase = 'menu' | 'chat' | 'moto' | 'galychyna' | 'news';

const CYCLE_PLAIN: SlotPhase[] = ['menu', 'chat', 'moto', 'galychyna'];
const CYCLE_NEWS: SlotPhase[] = ['menu', 'chat', 'moto', 'galychyna', 'menu', 'news'];

/** hasNews — чи є хоч одна новина (не «чи є непрочитана») */
export const slotCycle = (hasNews: boolean): SlotPhase[] => (hasNews ? CYCLE_NEWS : CYCLE_PLAIN);

/** Фаза за номером тіку: індекс береться за модулем, тож зміна довжини кола
 *  (новини зникли з конфіга) не лишає такт у неіснуючій фазі. */
export const slotPhaseAt = (step: number, hasNews: boolean): SlotPhase => {
  const cycle = slotCycle(hasNews);
  return cycle[((step % cycle.length) + cycle.length) % cycle.length];
};
