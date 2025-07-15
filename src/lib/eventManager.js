//가비지 컬렉션 되면 자동제거
const eventStore = new WeakMap();

export function setupEventListeners(root) {
  root.addEventListener("click", (e) => {
    let target = e.target;
    // console.log("target:", target);
    if (target) {
      const handlers = eventStore.get(target);
      // console.log(handlers);
      if (handlers && handlers["click"]) {
        handlers["click"].forEach((fn) => fn(e));
      }
      // console.log(e.cancelBubble);
      if (e.cancelBubble) return; // stopPropagation
      target = target.parentNode;
    }
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventStore.has(element)) {
    eventStore.set(element, {});
  }
  const handlers = eventStore.get(element);

  if (!handlers[eventType]) {
    handlers[eventType] = new Set();
  }

  handlers[eventType].add(handler);
  console.log(handlers);
}

export function removeEvent(element, eventType, handler) {
  console.log(element, handler, eventType);
}
