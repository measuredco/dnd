import { LRUCache } from 'lru-cache';
import type { DraggableId, ContextId } from '../../types';
import { dragHandle as dragHandleAttr } from '../data-attributes';
import { warning } from '../../dev-warning';
import isHtmlElement from '../is-type-of-element/is-html-element';
import querySelectorAllIframe from '../iframe/query-selector-all-iframe';

const dragHandleCache = new LRUCache<string, HTMLElement>({
  max: 5000,
  ttl: 1000,
});

export default function findDragHandle(
  contextId: ContextId,
  draggableId: DraggableId,
): HTMLElement | null {
  // cannot create a selector with the draggable id as it might not be a valid attribute selector
  const selector = `[${dragHandleAttr.contextId}="${contextId}"]`;

  const cachedHandle = dragHandleCache.get(selector);

  if (cachedHandle) {
    return cachedHandle;
  }

  const possible = querySelectorAllIframe(selector);

  if (!possible.length) {
    warning(
      `Unable to find any drag handles in the context "${contextId}" ${selector}`,
    );
    return null;
  }

  const handle = possible.find((el): boolean => {
    return el.getAttribute(dragHandleAttr.draggableId) === draggableId;
  });

  if (!handle) {
    warning(
      `Unable to find drag handle with id "${draggableId}" as no handle with a matching id was found`,
    );
    return null;
  }

  if (!isHtmlElement(handle)) {
    warning('drag handle needs to be a HTMLElement');
    return null;
  }

  dragHandleCache.set(selector, handle);

  return handle;
}
