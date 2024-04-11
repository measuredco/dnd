import { BoxModel, Rect, Spacing } from 'css-box-model';

const createCol = (name: string) => `((?<${name}>-?((\\d|\\.)+))(,\\s)?)`;

const matrixPattern = new RegExp(
  `^matrix\\(${createCol('scaleX')}${createCol('skewY')}${createCol(
    'skewX',
  )}${createCol('scaleY')}${createCol('translateX')}${createCol(
    'translateY',
  )}\\)`,
);

const originPattern = /(?<x>(\d|\.)+)px (?<y>(\d|\.)+)px/;

export interface Matrix<T = number> {
  scaleX: T;
  skewY: T;
  skewX: T;
  scaleY: T;
  translateX: T;
  translateY: T;
}

export interface Origin<T = number> {
  x: T;
  y: T;
}

export interface Transform<T = number> {
  matrix: Matrix<T>;
  origin: Origin<T>;
}

export const getMatrix = (transform: string): Matrix | null => {
  const match = matrixPattern.exec(transform);

  if (match?.groups) {
    const stringMatrix = match.groups! as unknown as Matrix<string>;
    return Object.keys(stringMatrix).reduce<Matrix>(
      (acc, key) => ({ ...acc, [key]: Number(match.groups![key]) }),
      {
        scaleX: 1,
        skewY: 0,
        skewX: 0,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
      },
    );
  }

  return null;
};

const USE_GLOBAL_ORIGIN = true;

export const getOrigin = (transformOrigin: string): Origin | null => {
  if (USE_GLOBAL_ORIGIN) {
    return { x: 0, y: 0 };
  }

  const match = originPattern.exec(transformOrigin);

  if (match?.groups) {
    const stringOrigin = match.groups! as unknown as Origin<string>;

    return Object.keys(stringOrigin).reduce<Origin>(
      (acc, key) => ({
        ...acc,
        [key]: Number(match.groups![key].replace('px', '')),
      }),
      { x: 0, y: 0 },
    );
  }

  return null;
};

const findNearestTransform = (el: HTMLElement): HTMLElement | null => {
  const styles = window.getComputedStyle(el);

  if (styles.transform !== 'none') {
    return el;
  }

  if (!el.parentElement) {
    const refWindow = el.ownerDocument.defaultView;

    if (
      refWindow &&
      refWindow.self !== refWindow.parent &&
      refWindow.frameElement
    ) {
      const iframe = refWindow.frameElement as HTMLIFrameElement;

      return findNearestTransform(iframe);
    }

    return null;
  }

  return findNearestTransform(el.parentElement);
};

const defaultTransform = {
  matrix: {
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    translateX: 0,
    translateY: 0,
  },
  origin: { x: 0, y: 0 },
};

/**
 * Gets the transform of the element based on transform styles
 * applied either directly to the element, or a parent element.
 *
 * Will only apply the first transform it encounters.
 * @param el
 * @param origin
 * @returns
 */
export const getTransform = (
  el: HTMLElement,
  origin?: Origin,
): Transform | null => {
  const transformEl = findNearestTransform(el);

  if (!transformEl) return defaultTransform;

  const styles = window.getComputedStyle(transformEl);

  const matrix = getMatrix(styles.transform);
  const calculatedOrigin = getOrigin(styles.transformOrigin);

  if (matrix) {
    return {
      matrix,
      origin: origin || calculatedOrigin || { x: 0, y: 0 },
    };
  }

  return defaultTransform;
};

export const applyTransformPoint = (
  x: number,
  y: number,
  transform: Matrix,
  origin: Origin,
) => {
  return {
    x: transform.scaleX * (x - origin.x) + origin.x,
    y: transform.scaleY * (y - origin.y) + origin.y,
  };
};

export const removeTransformPoint = (
  x: number,
  y: number,
  transform: Matrix,
  origin: Origin,
) => {
  return {
    x: (x - origin.x) / transform.scaleX + origin.x,
    y: (y - origin.y) / transform.scaleY + origin.y,
  };
};

export const applyTransformRect = (
  rect: Rect,
  transform: Matrix,
  origin: Origin,
): Rect => {
  const { x, y } = applyTransformPoint(rect.x, rect.y, transform, origin);

  const width = rect.width * transform.scaleX;
  const height = rect.height * transform.scaleY;

  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;

  return {
    x,
    y,
    width,
    height,
    top,
    left,
    right,
    bottom,
    center: {
      x: (right + left) / 2,
      y: (bottom + top) / 2,
    },
  };
};

export const applyTransformDOMRect = (
  rect: DOMRect,
  transform: Matrix,
  origin: Origin,
): DOMRect => {
  const { x, y } = applyTransformPoint(rect.x, rect.y, transform, origin);

  const width = rect.width * transform.scaleX;
  const height = rect.height * transform.scaleY;

  return new DOMRect(x, y, width, height);
};

export const applyTransformSpacing = (
  spacing: Spacing,
  transform: Matrix,
): Spacing => {
  return {
    top: spacing.top * transform.scaleY,
    bottom: spacing.bottom * transform.scaleY,
    left: spacing.left * transform.scaleY,
    right: spacing.right * transform.scaleY,
  };
};

export const removeTransformRect = (
  rect: DOMRect | Rect,
  transform: Matrix,
  origin: Origin,
): DOMRect => {
  const { x, y } = removeTransformPoint(rect.x, rect.y, transform, origin);

  return new DOMRect(
    x,
    y,
    rect.width / transform.scaleX,
    rect.height / transform.scaleY,
  );
};

export const applyTransformBox = (
  box: BoxModel,
  transform: Transform,
): BoxModel => {
  return {
    borderBox: applyTransformRect(
      box.borderBox,
      transform.matrix,
      transform.origin,
    ),
    marginBox: applyTransformRect(
      box.marginBox,
      transform.matrix,
      transform.origin,
    ),
    paddingBox: applyTransformRect(
      box.paddingBox,
      transform.matrix,
      transform.origin,
    ),
    contentBox: applyTransformRect(
      box.contentBox,
      transform.matrix,
      transform.origin,
    ),
    border: applyTransformSpacing(box.border, transform.matrix),
    margin: applyTransformSpacing(box.margin, transform.matrix),
    padding: applyTransformSpacing(box.padding, transform.matrix),
  };
};
