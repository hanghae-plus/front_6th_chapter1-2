const eventMap = new WeakMap();
const delegatedEvents = new Set();
let rootElement = null;

export function setupEventListeners(root) {
  rootElement = root;

  delegatedEvents.forEach((eventType) => {
    // 중복 방지: 이미 등록되어 있으면 제거
    root.removeEventListener(eventType, handleEvent);
    root.addEventListener(eventType, handleEvent);
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }

  const elementEvents = eventMap.get(element);
  elementEvents.set(eventType, handler);

  delegatedEvents.add(eventType);
}

export function removeEvent(element, eventType) {
  const elementEvents = eventMap.get(element);
  elementEvents.delete(eventType);
}

// 이벤트 위임 핸들러
function handleEvent(event) {
  let target = event.target;

  while (target && target !== rootElement) {
    const elementEvents = eventMap.get(target);

    if (elementEvents?.has(event.type)) {
      const handler = elementEvents.get(event.type);
      handler();

      return;
    }

    target = target.parentNode;
  }
}
