import { Offset } from './offset-types';

export default function getIframeOffset(el: HTMLElement) {
  const offset: Offset = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };

  const refWindow = el.ownerDocument.defaultView;

  if (refWindow && refWindow.self !== refWindow.parent) {
    const iframe = refWindow.frameElement as HTMLIFrameElement;

    const rect = iframe.getBoundingClientRect();

    offset.left = rect.left;
    offset.top = rect.top;
    offset.right = rect.left;
    offset.bottom = rect.top;
  }

  return offset;
}
