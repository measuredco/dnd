import { Position } from 'css-box-model';

export default function offsetPoint(x: number, y: number, win: Window) {
  // const { clientX, clientY } = event;

  // const win = event.currentTarget as Window;

  let offsetX = 0;
  let offsetY = 0;

  if (win.parent !== win.self) {
    const iframe = win.frameElement as HTMLIFrameElement;
    const rect = iframe.getBoundingClientRect();

    offsetX = rect.left;
    offsetY = rect.top;
  }

  const point: Position = {
    x: x + offsetX,
    y: y + offsetY,
  };

  return point;
}
