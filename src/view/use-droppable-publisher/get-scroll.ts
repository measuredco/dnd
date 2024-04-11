import type { Position } from 'css-box-model';
import { getTransform } from '../transform';

export default (el: Element): Position => {
  const isIframe = el.tagName === 'IFRAME';

  if (isIframe) {
    const win = (el as HTMLIFrameElement).contentWindow!;

    const transform = getTransform(el as HTMLElement);

    return {
      x: win.scrollX * (transform?.matrix.scaleX || 1),
      y: win.scrollY * (transform?.matrix.scaleY || 1),
    };
  }

  return {
    x: el.scrollLeft,
    y: el.scrollTop,
  };
};
