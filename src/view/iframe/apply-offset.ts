import { BoxModel, Rect } from 'css-box-model';
import { Offset } from './offset-types';

export default function applyOffset(rect: Partial<Rect>, offset: Offset): Rect {
  return {
    ...rect,
    top: (rect.top || 0) + offset.top,
    left: (rect.left || 0) + offset.left,
    right: (rect.right || 0) + offset.right,
    bottom: (rect.bottom || 0) + offset.bottom,
    x: (rect.x || 0) + offset.left,
    y: (rect.y || 0) + offset.top,
    center: {
      x: (rect.center?.x || 0) + offset.left,
      y: (rect.center?.y || 0) + offset.top,
    },
    width: rect.width || 0,
    height: rect.height || 0,
  };
}

export const applyOffsetBox = (box: BoxModel, offset: Offset): BoxModel => {
  return {
    ...box,
    borderBox: applyOffset(box.borderBox, offset),
    marginBox: applyOffset(box.marginBox, offset),
    paddingBox: applyOffset(box.paddingBox, offset),
    contentBox: applyOffset(box.contentBox, offset),
  };
};
