import getIframe from './get-iframe';
import { Offset } from './offset-types';

export default function getIframeOffset(el: HTMLElement) {
  const offset: Offset = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };

  const iframe = getIframe(el);

  if (iframe) {
    const rect = iframe.getBoundingClientRect();

    offset.left = rect.left;
    offset.top = rect.top;
    offset.right = rect.left;
    offset.bottom = rect.top;
  }

  return offset;
}
