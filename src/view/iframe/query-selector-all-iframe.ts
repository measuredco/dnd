/**
 * querySelectorAllIframe
 *
 * An proxy of querySelectorAll that also queries all iframes
 */

import { querySelectorAll } from '../../query-selector-all';

export default function querySelectorAllIframe(selector: string) {
  const iframes = querySelectorAll(document, 'iframe') as HTMLIFrameElement[];

  const iframePossible = iframes.reduce<HTMLElement[]>(
    (acc, iframe) => [
      ...acc,
      ...querySelectorAll(iframe.contentWindow!.document, selector),
    ],
    [],
  );

  return [...querySelectorAll(document, selector), ...iframePossible];
}
