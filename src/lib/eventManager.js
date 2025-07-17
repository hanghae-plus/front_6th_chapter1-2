const eventMap = new WeakMap();

export function setupEventListeners(root) {
  const eventTypeList = ["click", "input", "change", "submit", "keydown", "keyup", "mouseover", "focus"];
  eventTypeList.forEach((eventType) => {
    root.addEventListener(eventType, (e) => {
      // 이벤트 버블링을 따라 올라가면서 핸들러 찾기
      let currentTarget = e.target;

      while (currentTarget && currentTarget !== root.parentNode) {
        const events = eventMap.get(currentTarget);
        if (events) {
          const handlers = events.get(eventType);
          if (handlers) {
            handlers.forEach((handler) => {
              handler(e);
            });
            // 핸들러를 찾았으면 더 이상 올라가지 않음
          }
        }
        currentTarget = currentTarget.parentNode;
      }
    });
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }

  const events = eventMap.get(element);
  if (!events.has(eventType)) {
    events.set(eventType, new Set());
  }

  const handlers = events.get(eventType);
  handlers.add(handler);
}

export function removeEvent(element, eventType, handler) {
  const events = eventMap.get(element);
  if (!events) return;

  const handlers = events.get(eventType);
  if (!handlers) return;

  handlers.delete(handler);

  // 핸들러 집합이 비면 eventType 제거
  if (handlers.size === 0) {
    events.delete(eventType);
  }

  // eventType Map도 비었으면 element 자체 제거
  if (events.size === 0) {
    eventMap.delete(element);
  }
}
