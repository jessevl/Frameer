/**
 * @file stageScroll.ts
 * @description What a view that scrolls on its own puts on its scroll container so its content scrolls under the docked bar: a marker (the stage then adds no inset of its own) and a top inset of `--stage-top`, the bar's height on desktop and 0 elsewhere (`shell.css` declares the 0). Scroll padding keeps a row scrolled into view from hiding under the bar. `scrollStageToTop` is what tapping the current phone tab does.
 * Spread `stageScroll` on the scroll container and add `STAGE_SCROLL` to its classes.
 * Used by: SidePanel, PhoneTabBar and every stage view with its own scroll container.
 */

/** Spread on the scroll container. */
export const stageScroll = { 'data-stage-scroll': '' } as const;

/** The top inset and scroll padding of a stage scroll container. */
export const STAGE_SCROLL = 'pt-[var(--stage-top)] [scroll-padding-top:var(--stage-top)]';

/** Smooth-scrolls every scroll container of the stage (`[data-stage-scroll]`, or the stage's own first level) to its top. `root` is the stage's selector. */
export function scrollStageToTop(root = 'main#main'): void {
  document.querySelectorAll<HTMLElement>(`${root} [data-stage-scroll], ${root} > div`).forEach((element) => element.scrollTo({ top: 0, behavior: 'smooth' }));
}
