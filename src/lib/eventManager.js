function findParent(element, target) {
  if (element == null) {
    return null;
  }

  if (element === target) {
    return element;
  }

  return findParent(element.parentElement, target);
}

export const eventMap = new Map();

export function setupEventListeners(root) {
  const eventTypes = ["click", "mouseover", "focus", "keydown", "change"];

  for (const eventType of eventTypes) {
    root.addEventListener(eventType, (e) => {
      const events = eventMap.get(eventType);
      if (events == null) {
        return;
      }

      for (const { element, handler } of events) {
        if (findParent(e.target, element) != null) {
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
  let events = eventMap.get(eventType);
  if (events == null) {
    return;
  }

  events = events
    .filter((x) => !(x.element === element && x.handler === handler))
    .filter((x) => document.contains(x.element));

  if (events.length === 0) {
    eventMap.delete(eventType);
  } else {
    eventMap.set(eventType, events);
  }
}
