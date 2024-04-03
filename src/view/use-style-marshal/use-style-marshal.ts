import memoizeOne from 'memoize-one';
import { useMemo, useCallback } from 'use-memo-one';
import { invariant } from '../../invariant';
import type { StyleMarshal } from './style-marshal-types';
import type { ContextId, DropReason } from '../../types';
import getStyles from './get-styles';
import type { Styles } from './get-styles';
import { prefix } from '../data-attributes';
import useLayoutEffect from '../use-isomorphic-layout-effect';
import { querySelectorAll } from '../../query-selector-all';
import querySelectorAllIframe from '../iframe/query-selector-all-iframe';

const getHead = (doc: Document): HTMLHeadElement | null => {
  const head: HTMLHeadElement | null = doc.querySelector('head');
  return head;
};

const createStyleEl = (nonce?: string): HTMLStyleElement => {
  const el: HTMLStyleElement = document.createElement('style');
  if (nonce) {
    el.setAttribute('nonce', nonce);
  }
  el.type = 'text/css';
  return el;
};

const alwaysDataAttr = `${prefix}-always`;
const dynamicDataAttr = `${prefix}-dynamic`;

export default function useStyleMarshal(contextId: ContextId, nonce?: string) {
  const styles: Styles = useMemo(() => getStyles(contextId), [contextId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setDynamicStyle = useCallback(
    // Using memoizeOne to prevent frequent updates to textContext
    memoizeOne((proposed: string) => {
      const selector = `[${dynamicDataAttr}="${contextId}"]`;

      querySelectorAllIframe(selector).forEach((el) => {
        invariant(el, 'Cannot set dynamic style element if it is not set');
        el.textContent = proposed;
      });
    }),
    [contextId],
  );

  const setAlwaysStyle = useCallback(
    (proposed: string) => {
      const selector = `[${alwaysDataAttr}="${contextId}"]`;

      querySelectorAllIframe(selector).forEach((el) => {
        invariant(el, 'Cannot set dynamic style element if it is not set');
        el.textContent = proposed;
      });
    },
    [contextId],
  );

  // using layout effect as programatic dragging might start straight away (such as for cypress)
  useLayoutEffect(() => {
    const alwaysSelector = `[${alwaysDataAttr}="${contextId}"]`;
    const dynamicSelector = `[${dynamicDataAttr}="${contextId}"]`;

    const heads = [
      getHead(document),
      ...(
        querySelectorAll(document, `[${prefix}-iframe]`) as HTMLIFrameElement[]
      )
        .filter((iframe) => iframe.contentWindow?.document)
        .map((iframe) => getHead(iframe.contentWindow!.document)),
    ];

    // Create initial style elements
    heads.forEach((head) => {
      if (!head) return;

      const alwaysElements = querySelectorAll(
        head.ownerDocument,
        alwaysSelector,
      );
      const dynamicElements = querySelectorAll(
        head.ownerDocument,
        dynamicSelector,
      );

      if (
        alwaysElements.length >= heads.length ||
        dynamicElements.length >= heads.length
      ) {
        return;
      }

      const always: HTMLStyleElement = createStyleEl(nonce);
      const dynamic: HTMLStyleElement = createStyleEl(nonce);

      // for easy identification
      always.setAttribute(alwaysDataAttr, contextId);
      dynamic.setAttribute(dynamicDataAttr, contextId);

      head.appendChild(always);
      head.appendChild(dynamic);

      // set initial style
      setAlwaysStyle(styles.always);
      setDynamicStyle(styles.resting);
    });

    return () => {
      const remove = (selector: string) => {
        const elements = querySelectorAllIframe(selector);

        elements.forEach((el) => {
          invariant(el, 'Cannot unmount element as it is not set');
          el.ownerDocument.head.removeChild(el);
        });
      };

      remove(alwaysSelector);
      remove(dynamicSelector);
    };
  }, [
    nonce,
    setAlwaysStyle,
    setDynamicStyle,
    styles.always,
    styles.resting,
    contextId,
  ]);

  const dragging = useCallback(
    () => setDynamicStyle(styles.dragging),
    [setDynamicStyle, styles.dragging],
  );
  const dropping = useCallback(
    (reason: DropReason) => {
      if (reason === 'DROP') {
        setDynamicStyle(styles.dropAnimating);
        return;
      }
      setDynamicStyle(styles.userCancel);
    },
    [setDynamicStyle, styles.dropAnimating, styles.userCancel],
  );
  const resting = useCallback(() => {
    setDynamicStyle(styles.resting);
  }, [setDynamicStyle, styles.resting]);

  const marshal: StyleMarshal = useMemo(
    () => ({
      dragging,
      dropping,
      resting,
    }),
    [dragging, dropping, resting],
  );

  return marshal;
}
