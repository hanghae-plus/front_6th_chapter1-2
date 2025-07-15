// 이벤트 관리 저장소
const eventStore = new WeakMap(); // 엘리먼트 기준으로 이벤트 핸들러 저장
const allEvents = new Set(); // 등록된 이벤트 타입 추적 (중복 방지)

export function setupEventListeners(root) {
  // 모든 이벤트 타입을 순회하며 이벤트 리스너를 설정
  allEvents.forEach((eventType) => {
    root.addEventListener(eventType, (event) => {
      const target = event.target;
      const elementEvents = eventStore.get(target);

      if (!elementEvents || !elementEvents[eventType]) return;

      elementEvents[eventType].forEach((handler) => {
        handler(event);
      });
    });
  });
}

export function addEvent(element, eventType, handler) {
  console.log("addEvent", element, eventType, handler);
  if (!eventStore.has(element)) {
    eventStore.set(element, {});
  }

  const elementEvents = eventStore.get(element);

  if (!elementEvents[eventType]) {
    elementEvents[eventType] = new Set();
  }

  elementEvents[eventType].add(handler);

  allEvents.add(eventType);
}

export function removeEvent(element, eventType, handler) {
  const elementEvents = eventStore.get(element);

  if (!elementEvents) return;

  const handlers = elementEvents[eventType];
  if (!handlers) return;

  handlers.delete(handler);
}
