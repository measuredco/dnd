import type { DraggableId, ContextId } from '../../types';
import * as attributes from '../data-attributes';
import { warning } from '../../dev-warning';
import isHtmlElement from '../is-type-of-element/is-html-element';
import querySelectorAllIframe from '../iframe/query-selector-all-iframe';

export default function findDraggable(
  contextId: ContextId,
  draggableId: DraggableId,
): HTMLElement | null {
  // cannot create a selector with the draggable id as it might not be a valid attribute selector
  const selector = `[${attributes.draggable.contextId}="${contextId}"]`;

  const possible = querySelectorAllIframe(selector);

  const draggable = possible.find((el): boolean => {
    return el.getAttribute(attributes.draggable.id) === draggableId;
  });

  if (!draggable) {
    return null;
  }

  if (!isHtmlElement(draggable)) {
    warning('Draggable element is not a HTMLElement');
    return null;
  }

  return draggable;
}
