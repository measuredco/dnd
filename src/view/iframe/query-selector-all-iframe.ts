import { querySelectorAll } from '../../query-selector-all';

/**
 * querySelectorAllIframe
 *
 * An proxy of querySelectorAll that also queries all iframes
 */
export default function querySelectorAllIframe(selector: string) {
  const iframes = querySelectorAll(
    document,
    '[data-rfd-iframe]',
  ) as HTMLIFrameElement[];

  const iframePossible = iframes.reduce<HTMLElement[]>(
    (acc, iframe) => [
      ...acc,
      ...querySelectorAll(iframe.contentWindow!.document, selector),
    ],
    [],
  );

  return [...querySelectorAll(document, selector), ...iframePossible];
}
