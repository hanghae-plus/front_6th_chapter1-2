const eventMap = new WeakMap();
const delegatedEvents = new Set();

export function setupEventListeners(root) {
  delegatedEvents.forEach((eventType) => {
    root.removeEventListener(eventType, handleDelegatedEvent);
    root.addEventListener(eventType, handleDelegatedEvent);
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }

  const elementEvents = eventMap.get(element);
  elementEvents.set(eventType, handler);

  delegatedEvents.add(eventType);
}

export function removeEvent(element, eventType) {
  const elementEvents = eventMap.get(element);
  elementEvents.delete(eventType);
}

function handleDelegatedEvent(event) {
  let target = event.target;

  // NOTE: cancelBubble 속성은 deprecated이므로 다른 방법으로 구현해야 함
  while (target && !event.cancelBubble) {
    const elementEvents = eventMap.get(target);

    if (elementEvents?.has(event.type)) {
      const handler = elementEvents.get(event.type);
      handler(event);
    }

    target = target.parentNode;
  }
}
