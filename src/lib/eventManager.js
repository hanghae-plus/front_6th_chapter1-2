// 이벤트 핸들러를 저장할 WeakMap (root와 일반 엘리먼트 모두 관리)
const eventHandlers = new WeakMap();

export function setupEventListeners(root) {
  // root에 __delegated 플래그가 있으면 중복 등록 방지
  const rootMeta = eventHandlers.get(root);
  if (rootMeta && rootMeta.__delegated) return;

  // 플래그 세팅
  eventHandlers.set(root, { __delegated: true });

  // 이벤트 위임을 위한 이벤트 리스너 설정
  const eventTypes = ["click", "mouseover", "focus", "keydown", "submit", "change", "input"];

  eventTypes.forEach((eventType) => {
    root.addEventListener(
      eventType,
      (event) => {
        const element = event.target;
        const handlers = eventHandlers.get(element);
        // root(container)에는 __delegated만 있으므로, 일반 엘리먼트만 핸들러 실행
        if (handlers && handlers[eventType]) {
          handlers[eventType].forEach((handler) => {
            handler(event);
          });
        }
      },
      false,
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
  // root(container)는 핸들러 배열 관리하지 않음
  if (!eventHandlers.has(element)) {
    eventHandlers.set(element, {});
  }
  const handlers = eventHandlers.get(element);
  // root에 __delegated만 있는 경우, 핸들러 배열 관리하지 않음
  if (handlers.__delegated) return;
  if (!handlers[eventType]) handlers[eventType] = [];
  if (!handlers[eventType].includes(handler)) {
    handlers[eventType].push(handler);
  }
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
