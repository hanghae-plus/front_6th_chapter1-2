// el -> event type -> handlers
const handlerMap = new Map();

export function setupEventListeners(root) {
  const activeEventTypes = new Set();
  for (const elementEventsMap of handlerMap.values()) {
    for (const eventType of elementEventsMap.keys()) {
      activeEventTypes.add(eventType);
    }
  }

  for (const eventType of activeEventTypes) {
    const delegatedHandler = function (event) {
      let targetElement = event.target;

      while (targetElement !== root.parentNode) {
        if (handlerMap.has(targetElement)) {
          const elementEvents = handlerMap.get(targetElement);

          if (elementEvents.has(eventType)) {
            const handlersSet = elementEvents.get(eventType);

            for (const handler of handlersSet) {
              handler.call(targetElement, event);
            }
          }
        }
        targetElement = targetElement.parentElement;
      }
    };

    root.addEventListener(eventType, delegatedHandler);
  }
}

export function addEvent(element, eventType, handler) {
  if (!handlerMap.has(element)) {
    handlerMap.set(element, new Map());
  }
  const elementEvents = handlerMap.get(element);

  if (!elementEvents.has(eventType)) {
    elementEvents.set(eventType, new Set());
  }
  const handlersSet = elementEvents.get(eventType);

  handlersSet.add(handler);
}

export function removeEvent(element, eventType, handler) {
  if (!handlerMap.has(element)) return;

  const elementEvents = handlerMap.get(element);
  if (!elementEvents.has(eventType)) return;

  const handlersSet = elementEvents.get(eventType);
  handlersSet.delete(handler);

  if (handlersSet.size === 0) {
    elementEvents.delete(eventType);
  }
}
