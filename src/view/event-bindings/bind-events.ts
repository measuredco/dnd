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

let loaded = false;

function bindEvent(win: Window, binding: EventBinding, options: EventOptions) {
  let timer: number | undefined;

  if (!loaded) {
    // Some browsers require us to defer binding events, i.e. Safari
    timer = setInterval(() => {
      if ((win as Window).document.readyState === 'complete') {
        win.addEventListener(binding.eventName, binding.fn, options);
        loaded = true;
      }
    }, 100);
  } else {
    win.addEventListener(binding.eventName, binding.fn, options);
  }

  return timer;
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
        '[data-rfd-iframe]',
      ) as HTMLIFrameElement[];

      const windows = [el, ...iframes.map((iframe) => iframe.contentWindow)];

      return windows.map((win) => {
        if (!win) return function unbind() {};

        const options = getOptions(sharedOptions, binding.options);

        const timer = bindEvent(win as Window, binding, options);

        return function unbind() {
          clearInterval(timer);
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
