import { LRUCache } from 'lru-cache';
import { querySelectorAll } from '../../query-selector-all';

const iframeCache = new LRUCache<string, HTMLIFrameElement[]>({
  max: 1,
  ttl: 1000,
});

/**
 * querySelectorAllIframe
 *
 * An proxy of querySelectorAll that also queries all iframes
 */
export default function querySelectorAllIframe(selector: string) {
  let iframes = iframeCache.get('iframes');

  if (!iframes) {
    iframes = querySelectorAll(document, 'iframe') as HTMLIFrameElement[];

    // Quicker than running the [data-rbd-frame] query
    iframes = iframes.filter((iframe) =>
      iframe.hasAttribute('data-rfd-iframe'),
    );

    iframeCache.set('iframes', iframes);
  }

  const iframePossible = iframes.reduce<HTMLElement[]>(
    (acc, iframe) => [
      ...acc,
      ...(iframe.contentWindow?.document
        ? querySelectorAll(iframe.contentWindow.document, selector)
        : []),
    ],
    [],
  );

  return [...querySelectorAll(document, selector), ...iframePossible];
}
