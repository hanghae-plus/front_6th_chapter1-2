// 이벤트 핸들러를 저장할 WeakMap
const eventHandlers = new WeakMap();

export function setupEventListeners(root) {
  // 이벤트 위임을 위한 이벤트 리스너 설정
  const eventTypes = ["click", "mouseover", "focus", "keydown", "submit", "change", "input"];

  // react의 이벤트 위임 방식처럼 root요소에 eventListener를 등록해서 이벤트를 위임
  eventTypes.forEach((eventType) => {
    root.addEventListener(
      eventType,
      (event) => {
        // 이벤트가 발생한 타겟요소 가지고오기
        const element = event.target;
        // 이벤트 핸들러 가지고 오기
        const handlers = eventHandlers.get(element);

        // 핸들러가 있고 그안에 이벤트 타입이 있다면
        if (handlers && handlers[eventType]) {
          // 핸들러가 있고 그안에 이벤트 타입이 있다면 핸들러를 실행
          handlers[eventType].forEach((handler) => {
            handler(event);
          });
        }
      },
      false, // 버블링 단계에서 처리
    );
  });
}

/**
 *
 * {
 * type: "div",
 * props: {
 *   onClick: () => alert("클릭됨!"),
 *   children: "버튼"
 * }
 * }
 * 이런 형태로 들어올껀데 여기서 이벤트 리스너를 등록.
 */
export function addEvent(element, eventType, handler) {
  // 이벤트 핸들러가 없으면 생성
  if (!eventHandlers.has(element)) {
    eventHandlers.set(element, {});
  }

  // 이벤트 타입이 없으면 생성
  if (!eventHandlers.get(element)[eventType]) {
    eventHandlers.get(element)[eventType] = [];
  }

  // 이벤트 핸들러 배열에 추가
  eventHandlers.get(element)[eventType].push(handler);
}

export function removeEvent(element, eventType, handler) {
  const handlers = eventHandlers.get(element);
  if (handlers && handlers[eventType]) {
    const index = handlers[eventType].indexOf(handler);
    if (index > -1) {
      handlers[eventType].splice(index, 1);
    }
  }
}
