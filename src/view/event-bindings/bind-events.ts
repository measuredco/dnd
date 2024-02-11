import { IframeHTMLAttributes } from 'react';
import { querySelectorAll } from '../../query-selector-all';
import type {
  AnyEventBinding,
  EventBinding,
  EventOptions,
} from './event-types';

type UnbindFn = () => void;

function getOptions(
  shared?: EventOptions,
  fromBinding?: EventOptions | null,
): EventOptions {
  return {
    ...shared,
    ...fromBinding,
  };
}

export default function bindEvents(
  el: HTMLElement | Window,
  bindings: AnyEventBinding[],
  sharedOptions?: EventOptions,
): () => void {
  const unbindings: UnbindFn[] = (bindings as EventBinding[]).flatMap(
    (binding): UnbindFn[] => {
      const iframes: HTMLIFrameElement[] = querySelectorAll(
        window.document,
        'iframe',
      ) as HTMLIFrameElement[];

      const windows = [el, ...iframes.map((iframe) => iframe.contentWindow)];

      return windows.map((win) => {
        if (!win) return function unbind() {};

        const options = getOptions(sharedOptions, binding.options);

        win.addEventListener(binding.eventName, binding.fn, options);

        return function unbind() {
          win.removeEventListener(binding.eventName, binding.fn, options);
        };
      });
    },
  );

  // Return a function to unbind events
  return function unbindAll() {
    unbindings.forEach((unbind: UnbindFn) => {
      unbind();
    });
  };
}
