const notBubblingEvents = new Set(["focus", "blur"]);

let events = {};
let abortController = new AbortController();

export function setupEventListeners(root) {
  for (const eventType in events) {
    if (notBubblingEvents.has(eventType)) {
      events[eventType].forEach(({ element, handler }) => {
        element.addEventListener(eventType, handler, abortController);
      });
      continue;
    }

    root.addEventListener(
      eventType,
      (e) => {
        events[eventType].forEach(({ element, handler }) => {
          if (element.contains(e.target)) {
            handler(e);
          }
        });
      },
      abortController,
    );
  }
}

export function addEvent(element, eventType, handler) {
  events[eventType] ??= new Set();
  events[eventType].add({ element, handler });
}

export function removeEvent(element, eventType, handler) {
  events[eventType]?.forEach((item) => {
    const hasElementHandler = item.element === element && item.handler === handler;
    if (hasElementHandler) {
      events[eventType].delete(item);
    }
  });
}

export function cleanupEventListeners() {
  events = {};
  abortController.abort();
  abortController = new AbortController();
}
