import { BoxModel, getBox } from 'css-box-model';
import { DraggableDimension, DraggingState } from '../../../types';
import querySelectorAllIframe from '../../../view/iframe/query-selector-all-iframe';
import getScroll from './get-scroll';
import { AutoScrollerOptions } from './auto-scroller-options-types';
import { Transform, getTransform } from '../../../view/transform';

const resetToOrigin = (box: BoxModel, transform: Transform | null) => {
  const { scaleX = 1, scaleY = 1 } = transform?.matrix || {};

  const width = box.marginBox.width / scaleX;
  const height = box.marginBox.height / scaleY;

  return {
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    center: {
      x: width / 2,
      y: height / 2,
    },
    x: 0,
    y: 0,
  };
};

/**
 * Get the scroll for a draggable inside an iframe
 *
 * - Since iframes are not fully managed by the state, we have to access the elements directly.
 * - This will not work with multiple draggable contexts
 */
export default ({
  draggable,
  dragStartTime,
  getAutoScrollerOptions,
  shouldUseTimeDampening,
  state,
}: {
  state: DraggingState;
  draggable: DraggableDimension;
  dragStartTime: number;
  shouldUseTimeDampening: boolean;
  getAutoScrollerOptions: () => AutoScrollerOptions;
}) => {
  const el = querySelectorAllIframe(
    `[data-rfd-draggable-id="${state.critical.draggable.id}"]`,
  )[0];

  const win = el?.ownerDocument.defaultView || window;

  const isInIframe = win !== window && win.frameElement;

  if (isInIframe) {
    const iframe = win.frameElement as HTMLIFrameElement;
    const viewportBox = getBox(iframe);
    const box = getBox(el);
    const transform = getTransform(iframe);

    const change = getScroll({
      dragStartTime,
      container: resetToOrigin(viewportBox, transform), // Reset to origin because we don't care about position of the iframe
      subject: draggable.client.marginBox,
      center: box.borderBox.center,
      shouldUseTimeDampening,
      getAutoScrollerOptions,
    });

    return { change, window: win };
  }

  return null;
};
