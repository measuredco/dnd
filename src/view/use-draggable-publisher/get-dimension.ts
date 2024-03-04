import { calculateBox, withScroll } from 'css-box-model';
import type { Position } from 'css-box-model';
import type {
  DraggableDescriptor,
  DraggableDimension,
  Placeholder,
} from '../../types';
import { origin } from '../../state/position';
import getIframeOffset from '../iframe/get-iframe-offset';
import { applyTransformBox, getTransform } from '../transform';
import { applyOffsetBox } from '../iframe/apply-offset';

export default function getDimension(
  descriptor: DraggableDescriptor,
  el: HTMLElement,
  windowScroll: Position = origin,
): DraggableDimension {
  const computedStyles: CSSStyleDeclaration = window.getComputedStyle(el);

  const originalClient = calculateBox(
    el.getBoundingClientRect(),
    computedStyles,
  );
  let client = { ...originalClient };
  let page = withScroll(
    calculateBox(el.getBoundingClientRect(), computedStyles),
    windowScroll,
  );

  const transform = getTransform(el, { x: 0, y: 0 });

  if (transform) {
    client = applyTransformBox(client, transform);
    page = applyTransformBox(page, transform);
  }

  const iframeOffset = getIframeOffset(el);

  if (iframeOffset) {
    page = applyOffsetBox(page, iframeOffset);
  }

  const placeholder: Placeholder = {
    client: originalClient,
    tagName: el.tagName.toLowerCase(),
    display: computedStyles.display,
  };
  const displaceBy: Position = {
    x: client.marginBox.width,
    y: client.marginBox.height,
  };

  const dimension: DraggableDimension = {
    descriptor,
    placeholder,
    displaceBy,
    client,
    page,
    transform,
  };

  return dimension;
}
