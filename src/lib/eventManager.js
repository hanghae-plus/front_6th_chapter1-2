// 이벤트 핸들러를 저장할 Map
const eventHandlers = new Map();

export function setupEventListeners(root) {
  // 이벤트 위임을 위한 이벤트 리스너 설정
  const eventTypes = ["click", "mouseover", "focus", "keydown", "input", "change", "submit"];

  eventTypes.forEach((eventType) => {
    root.addEventListener(
      eventType,
      (event) => {
        // 이벤트가 발생한 요소에서 핸들러 찾기
        let target = event.target;

        while (target && target !== root) {
          const handlers = eventHandlers.get(target);
          if (handlers && handlers[eventType]) {
            // 핸들러 실행
            handlers[eventType].forEach((handler) => {
              handler(event);
            });
            // 이벤트가 처리되었으므로 더 이상 전파하지 않음
            return;
          }
          target = target.parentNode;
        }
      },
      false,
    ); // 버블링 단계에서 이벤트 처리
  });
}

export function addEvent(element, eventType, handler) {
  if (!eventHandlers.has(element)) {
    eventHandlers.set(element, {});
  }

  const elementHandlers = eventHandlers.get(element);
  if (!elementHandlers[eventType]) {
    elementHandlers[eventType] = [];
  }

  elementHandlers[eventType].push(handler);
}

export function removeEvent(element, eventType, handler) {
  const elementHandlers = eventHandlers.get(element);
  if (elementHandlers && elementHandlers[eventType]) {
    const handlers = elementHandlers[eventType];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }

    // 핸들러가 없으면 해당 이벤트 타입 제거
    if (handlers.length === 0) {
      delete elementHandlers[eventType];
    }

    // 요소에 핸들러가 없으면 Map에서 제거
    if (Object.keys(elementHandlers).length === 0) {
      eventHandlers.delete(element);
    }
  }
}
