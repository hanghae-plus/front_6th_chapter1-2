const eventMap = new WeakMap();
const eventTypes = new Set();
const setupRoots = new WeakSet();

export function setupEventListeners(root) {
  if (setupRoots.has(root)) {
    return;
  }

  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, (e) => {
      // 이벤트 버블링
      let currentElement = e.target;
      while (currentElement && currentElement !== root.parentElement) {
        const handler = eventMap.get(currentElement)?.[eventType];
        if (handler) {
          handler(e);
          return;
        }
        currentElement = currentElement.parentElement;
      }
    });
  });

  setupRoots.add(root);
}

export function addEvent(element, eventType, handler) {
  const event = eventMap.get(element) || {};
  event[eventType] = handler;
  eventMap.set(element, event);
  eventTypes.add(eventType);
}

export function removeEvent(element, eventType) {
  const event = eventMap.get(element) || {};

  delete event[eventType];
  eventMap.set(element, event);
}
