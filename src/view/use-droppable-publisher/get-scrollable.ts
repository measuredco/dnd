export default (scrollable: HTMLElement) => {
  const scrollableIsIframe = scrollable.tagName === 'IFRAME';

  const scrollableTarget = scrollableIsIframe
    ? (scrollable as HTMLIFrameElement).contentWindow!
    : scrollable;

  return scrollableTarget;
};
