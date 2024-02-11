import { getBox } from 'css-box-model';
import getIframeOffset from './get-iframe-offset';
import applyOffset from './apply-offset';

export default function getOffsettedBox(el: HTMLElement) {
  const box = getBox(el);

  const offset = getIframeOffset(el);

  return {
    ...box,
    borderBox: applyOffset(box.borderBox, offset),
    marginBox: applyOffset(box.marginBox, offset),
    paddingBox: applyOffset(box.paddingBox, offset),
    contentBox: applyOffset(box.contentBox, offset),
  };
}
