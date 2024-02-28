import type { Position } from 'css-box-model';

export default (el: Element): Position => {
  const isIframe = el.tagName === 'IFRAME';

  if (isIframe) {
    const targetEl = (el as HTMLIFrameElement).contentWindow!;

    return { x: targetEl.scrollX, y: targetEl.scrollY };
  }

  return {
    x: el.scrollLeft,
    y: el.scrollTop,
  };
};
