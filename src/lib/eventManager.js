/** @typedef {Function} EventHandler */
/** @typedef {Map<HTMLElement, Set<EventHandler>>} ElementHandlerMap */

/**
 * 이벤트 저장소
 * 구조: Map<eventType, Map<element, Set<handler>>>
 * @type {Map<string, ElementHandlerMap>}
 */
const eventMap = new Map();

/**
 * 루트 요소에 이벤트 위임 리스너를 설정
 * 등록된 모든 이벤트 타입에 대해 위임 방식으로 이벤트를 처리
 *
 * @param {HTMLElement} rootElement - 이벤트 위임의 루트 요소
 */
export function setupEventListeners(rootElement) {
  eventMap.forEach((handlers, eventType) => {
    rootElement.addEventListener(eventType, (event) => {
      let currentTarget = event.target;

      // 이벤트가 발생한 요소부터 루트까지 버블링하면서 핸들러 찾기
      while (currentTarget && currentTarget !== rootElement) {
        const elementHandlers = handlers.get(currentTarget);
        if (elementHandlers) elementHandlers.forEach((handler) => handler(event));

        // 부모 요소로 이동하여 버블링 효과 구현
        currentTarget = currentTarget.parentElement;
      }
    });
  });
}

/**
 * 특정 요소에 이벤트 핸들러를 등록
 * 중복 등록 방지를 위해 Set을 사용
 *
 * @param {HTMLElement} element - 이벤트를 등록할 DOM 요소
 * @param {string} eventType - 이벤트 타입
 * @param {EventHandler} handler - 실행할 이벤트 핸들러 함수
 */
export function addEvent(element, eventType, handler) {
  if (!eventMap.has(eventType)) eventMap.set(eventType, new Map());
  const handlers = eventMap.get(eventType);

  if (!handlers.has(element)) handlers.set(element, new Set());
  handlers.get(element).add(handler);
}

/**
 * 특정 요소에서 이벤트 핸들러를 제거
 * 메모리 최적화를 위해 빈 Set은 정리
 *
 * @param {HTMLElement} element - 이벤트를 제거할 DOM 요소
 * @param {string} eventType - 이벤트 타입
 * @param {EventHandler} handler - 제거할 핸들러 함수
 */
export function removeEvent(element, eventType, handler) {
  const handlers = eventMap.get(eventType);

  // 해당 이벤트 타입과 요소가 존재하는 경우에만 처리
  if (handlers && handlers.has(element)) {
    handlers.get(element).delete(handler);
    if (handlers.get(element).size === 0) {
      handlers.delete(element);
    }
  }
}
