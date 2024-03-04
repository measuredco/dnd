import { Position } from 'css-box-model';
import { applyTransformPoint, getTransform } from '../../../transform';

export default function offsetPoint(
  x: number,
  y: number,
  win: Window,
): Position {
  // const { clientX, clientY } = event;

  // const win = event.currentTarget as Window;

  let offsetX = 0;
  let offsetY = 0;

  if (win.parent !== win.self) {
    const iframe = win.frameElement as HTMLIFrameElement;
    const rect = iframe.getBoundingClientRect();

    const transform = getTransform(iframe);

    offsetX = rect.left;
    offsetY = rect.top;

    if (transform) {
      const { x: transformedX, y: transformedY } = applyTransformPoint(
        x,
        y,
        transform.matrix,
        transform.origin,
      );

      const point: Position = {
        x: transformedX + offsetX,
        y: transformedY + offsetY,
      };

      console.log(transformedX, transformedY);

      return point;
    }
  }

  const point: Position = {
    x: x + offsetX,
    y: y + offsetY,
  };

  return point;
}
