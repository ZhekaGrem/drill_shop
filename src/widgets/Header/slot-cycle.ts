// src/widgets/Header/slot-cycle.ts
// Коло фаз слота хедера. Окремо від хука, бо це чиста функція: її перевіряє
// scripts/check-news.mjs, а хук лише крутить по ній індекс.
//
// Дзвіночок стоїть у колі ЗАВЖДИ, коли новини взагалі є (рішення власника
// 2026-09-20): прочитане теж треба мати як перечитати. Непрочитане міняє не
// коло, а лише червону крапку на кнопці.
//
// Меню лишається «домом»: у довгому колі воно займає половину часу, чат і
// дзвіночок — по чверті.
export type SlotPhase = 'menu' | 'chat' | 'news';

const CYCLE_PLAIN: SlotPhase[] = ['menu', 'chat'];
const CYCLE_NEWS: SlotPhase[] = ['menu', 'chat', 'menu', 'news'];

/** hasNews — чи є хоч одна новина (не «чи є непрочитана») */
export const slotCycle = (hasNews: boolean): SlotPhase[] => (hasNews ? CYCLE_NEWS : CYCLE_PLAIN);

/** Фаза за номером тіку: індекс береться за модулем, тож зміна довжини кола
 *  (новини зникли з конфіга) не лишає такт у неіснуючій фазі. */
export const slotPhaseAt = (step: number, hasNews: boolean): SlotPhase => {
  const cycle = slotCycle(hasNews);
  return cycle[((step % cycle.length) + cycle.length) % cycle.length];
};
