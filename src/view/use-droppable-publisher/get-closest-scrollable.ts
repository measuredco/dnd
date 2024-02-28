import { invariant } from '../../invariant';
import { warning } from '../../dev-warning';
import getBodyElement from '../get-body-element';

interface Overflow {
  overflowX: string;
  overflowY: string;
}

const isEqual =
  (base: string) =>
  (value: string): boolean =>
    base === value;
const isScroll = isEqual('scroll');
const isAuto = isEqual('auto');
const isVisible = isEqual('visible');
const isEither = (overflow: Overflow, fn: (value: string) => boolean) =>
  fn(overflow.overflowX) || fn(overflow.overflowY);
const isBoth = (overflow: Overflow, fn: (value: string) => boolean) =>
  fn(overflow.overflowX) && fn(overflow.overflowY);

const isElementScrollable = (el: Element): boolean => {
  const style: CSSStyleDeclaration =
    el.ownerDocument.defaultView!.getComputedStyle(el);
  const overflow: Overflow = {
    overflowX: style.overflowX,
    overflowY: style.overflowY,
  };

  return isEither(overflow, isScroll) || isEither(overflow, isAuto);
};

// Special case for a body element
// Playground: https://codepen.io/alexreardon/pen/ZmyLgX?editors=1111
const isBodyScrollable = (el: HTMLElement): boolean => {
  // Because we always return false for now, we can skip any actual processing in production
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  const body: HTMLBodyElement = getBodyElement();
  const html: HTMLElement | null = el.ownerDocument.documentElement;
  invariant(html);

  // 1. The `body` has `overflow-[x|y]: auto | scroll`
  if (!isElementScrollable(body)) {
    return false;
  }

  const htmlStyle: CSSStyleDeclaration =
    el.ownerDocument.defaultView!.getComputedStyle(html);
  const htmlOverflow: Overflow = {
    overflowX: htmlStyle.overflowX,
    overflowY: htmlStyle.overflowY,
  };

  if (isBoth(htmlOverflow, isVisible)) {
    return false;
  }

  warning(`
    We have detected that your <body> element might be a scroll container.
    We have found no reliable way of detecting whether the <body> element is a scroll container.
    Under most circumstances a <body> scroll bar will be on the <html> element (document.documentElement)

    Because we cannot determine if the <body> is a scroll container, and generally it is not one,
    we will be treating the <body> as *not* a scroll container

    More information: https://github.com/hello-pangea/dnd/blob/main/docs/guides/how-we-detect-scroll-containers.md
  `);
  return false;
};

const getClosestScrollable = (el?: HTMLElement | null): HTMLElement | null => {
  // cannot do anything else!
  if (el == null) {
    return null;
  }

  // not allowing us to go higher then body
  if (el === el.ownerDocument.body) {
    if (isBodyScrollable(el)) {
      return el;
    }

    if (el.ownerDocument.defaultView?.frameElement) {
      return el.ownerDocument.defaultView?.frameElement as HTMLElement;
    }

    return null;
  }

  // Should never get here, but just being safe
  if (el === el.ownerDocument.documentElement) {
    return null;
  }

  if (!isElementScrollable(el)) {
    // keep recursing
    return getClosestScrollable(el.parentElement);
  }

  // success!
  return el;
};

export default getClosestScrollable;
