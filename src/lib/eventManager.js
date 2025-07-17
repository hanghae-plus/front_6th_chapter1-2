const eventMap = new WeakMap();

export function setupEventListeners(root) {
  const allEventTypes = ["click", "mouseover", "focus", "keydown", "input", "change", "submit"];

  allEventTypes.forEach((type) => {
    root.addEventListener(type, (event) => {
      let target = event.target;

      while (target && target !== root) {
        const handlersByType = eventMap.get(target);
        const handlers = handlersByType?.[type];

        if (handlers) {
          handlers.forEach((handler) => handler(event));
        }

        target = target.parentNode;
      }
    });
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, {});
  }

  const handlersByType = eventMap.get(element);
  if (!handlersByType[eventType]) {
    handlersByType[eventType] = new Set();
  }

  handlersByType[eventType].add(handler);
}

export function removeEvent(element, eventType, handler) {
  const handlersByType = eventMap.get(element);
  if (!handlersByType || !handlersByType[eventType]) return;

  handlersByType[eventType].delete(handler);

  if (handlersByType[eventType].size === 0) {
    delete handlersByType[eventType];
  }

  if (Object.keys(handlersByType).length === 0) {
    eventMap.delete(element);
  }
}
