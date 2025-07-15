//가비지 컬렉션 되면 자동제거
const eventStore = new Map();

export function setupEventListeners(root) {
  console.log(eventStore);

  for (const event in eventStore) {
    root.addEventListener(event, (e) => {
      // console.log(event);
      eventStore[event].forEach(({ element, handler }) => {
        if (element.contains(e.target)) handler(e);
      });
    });
  }
}

export function addEvent(element, eventType, handler) {
  if (!eventStore[eventType]) eventStore[eventType] = new Set();
  eventStore[eventType].add({ element, handler });
}

export function removeEvent(element, eventType, handler) {
  if (eventStore[eventType]) {
    eventStore[eventType].forEach((item) => {
      if (item.element === element && item.handler === handler) {
        eventStore[eventType].delete(item);
      }
    });
  }
}
