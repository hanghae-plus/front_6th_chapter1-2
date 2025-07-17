const eventHandlers = {};

/**
 * 이벤트를 위임받아 처리하는 메인 함수입니다.
 * @param {Event} e - 발생한 이벤트 객체
 */
const handleEvents = (e) => {
  const handlers = eventHandlers[e.type];
  if (!handlers) return;

  let currentElement = e.target;

  // 이벤트가 발생한 요소부터 시작하여 이벤트 리스너가 부착된 최상위 요소까지 탐색합니다.
  while (currentElement) {
    const handler = handlers.get(currentElement);

    if (handler) {
      // 등록된 핸들러를 찾으면 실행하고, 루프를 종료합니다.
      handler(e);
      return;
    }

    // 이벤트 리스너가 부착된 요소(e.currentTarget)에 도달하면 탐색을 멈춥니다.
    if (currentElement === e.currentTarget) {
      break;
    }

    currentElement = currentElement.parentElement;
  }
};

/**
 * 지정된 root 요소에 이벤트 리스너를 위임하여 설정합니다.
 * @param {Element} root - 이벤트 리스너를 부착할 최상위 요소
 */
export const setupEventListeners = (root) => {
  // 이미 등록된 이벤트 타입에 대해서는 다시 등록하지 않도록 함
  const registeredEvents = Object.keys(eventHandlers);

  registeredEvents.forEach((eventType) => {
    // 이미 등록된 이벤트 타입에 대해서는 다시 등록하지 않도록 함
    root.addEventListener(eventType, handleEvents);
  });
};

/**
 * 특정 요소에 이벤트 핸들러를 추가(등록)합니다.
 * @param {Element} element - 이벤트를 추가할 DOM 요소
 * @param {string} eventType - 이벤트 타입 (e.g., 'click', 'mouseover')
 * @param {Function} handler - 실행할 이벤트 핸들러 함수
 */
export const addEvent = (element, eventType, handler) => {
  if (!eventHandlers[eventType]) {
    eventHandlers[eventType] = new WeakMap();
  }

  const elementHandlerMap = eventHandlers[eventType];
  elementHandlerMap.set(element, handler);
};

/**
 * 특정 요소의 이벤트 핸들러를 제거합니다.
 * @param {Element} element - 이벤트를 제거할 DOM 요소
 * @param {string} eventType - 제거할 이벤트 타입
 * @param {Function} handler - 제거할 특정 이벤트 핸들러 함수
 */
export const removeEvent = (element, eventType, handler) => {
  const elementHandlerMap = eventHandlers[eventType];
  if (!elementHandlerMap) return;

  // 이 요소에 등록된 핸들러가 VDOM이 제거하려는 핸들러와 일치하는 경우에만 제거함
  if (elementHandlerMap.get(element) === handler) {
    elementHandlerMap.delete(element);
  }
};
