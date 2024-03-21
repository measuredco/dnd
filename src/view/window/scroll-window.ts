import type { Position } from 'css-box-model';

// Not guaranteed to scroll by the entire amount
export default (change: Position, win: Window = window): void => {
  win.scrollBy(change.x, change.y);
};
