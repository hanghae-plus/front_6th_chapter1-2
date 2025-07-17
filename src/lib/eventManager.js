const eventHandlers = new Map();
let nextId = 1;

const handleEvent = (event) => {
  const { target, type } = event;

  // 이벤트 버블링을 위해 클릭된 요소부터 상위 요소들을 순회
  let currentElement = target;

  while (currentElement && currentElement !== document.body) {
    if (currentElement._eventId) {
      const elementHandlers = eventHandlers.get(currentElement._eventId);

      if (elementHandlers && elementHandlers.has(type)) {
        const handler = elementHandlers.get(type);
        handler(event);
      }
    }
    currentElement = currentElement.parentElement;
  }
};

export function setupEventListeners(root) {
  const eventTypes = ["click", "mouseover", "focus", "keydown", "submit", "change"];

  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, handleEvent);
  });

  return () => {
    eventTypes.forEach((eventType) => {
      root.removeEventListener(eventType, handleEvent);
    });
  };
}

export function addEvent(element, eventType, handler) {
  if (!element._eventId) {
    element._eventId = `event_${nextId++}`;
  }

  const eventId = element._eventId;
  if (!eventHandlers.has(eventId)) {
    eventHandlers.set(eventId, new Map());
  }
  eventHandlers.get(eventId).set(eventType, handler);
}

export function removeEvent(element, eventType) {
  if (element._eventId) {
    const elementHandlers = eventHandlers.get(element._eventId);
    if (elementHandlers) {
      elementHandlers.delete(eventType);

      if (elementHandlers.size === 0) {
        eventHandlers.delete(element._eventId);
      }
    }
  }
}
