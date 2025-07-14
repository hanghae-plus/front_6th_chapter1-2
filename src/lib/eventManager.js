export const eventMap = new Map();

export function setupEventListeners(root) {
  const eventTypes = ["click", "mouseover", "focus", "keydown"];

  for (const eventType of eventTypes) {
    root.addEventListener(eventType, (e) => {
      const events = eventMap.get(eventType);
      if (events == null) {
        return;
      }

      for (const { element, handler } of events) {
        if (element === e.target.closest(element.tagName.toLowerCase())) {
          handler(e);
          break;
        }
      }
    });
  }
}

export function addEvent(element, eventType, handler) {
  let events = eventMap.get(eventType);
  if (events == null) {
    events = [];
    eventMap.set(eventType, events);
  }

  events.push({ element, handler });
  eventMap.set(eventType, events);
}

export function removeEvent(element, eventType, handler) {
  const events = eventMap.get(eventType);
  if (events == null) {
    return;
  }

  const filtered = events.filter((x) => !(x.element === element && x.handler === handler));
  if (filtered.length === 0) {
    eventMap.delete(eventType);
  } else {
    eventMap.set(eventType, filtered);
  }
}
