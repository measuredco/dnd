import { calculateBox, withScroll } from 'css-box-model';
import type { BoxModel, Position } from 'css-box-model';
import type {
  DraggableDescriptor,
  DraggableDimension,
  Placeholder,
} from '../../types';
import { origin } from '../../state/position';
import getIframeOffset from '../iframe/get-iframe-offset';
import applyOffset from '../iframe/apply-offset';

export default function getDimension(
  descriptor: DraggableDescriptor,
  el: HTMLElement,
  windowScroll: Position = origin,
): DraggableDimension {
  const computedStyles: CSSStyleDeclaration = window.getComputedStyle(el);

  const offset = getIframeOffset(el);

  const client: BoxModel = calculateBox(
    el.getBoundingClientRect(),
    computedStyles,
  );
  const page: BoxModel = withScroll(
    calculateBox(
      applyOffset(el.getBoundingClientRect(), offset),
      computedStyles,
    ),
    windowScroll,
  );

  const placeholder: Placeholder = {
    client,
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
  };

  return dimension;
}
