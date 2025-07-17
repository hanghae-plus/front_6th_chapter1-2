// 이벤트 저장소 - 요소별 이벤트 관리 (element -> Map(eventType -> Set(handlers)))
const eventMap = new WeakMap();
// 전체 시스템에서 사용 중인 이벤트 타입들 추적
const delegatedEvents = new Set();
// 루트 요소 저장
let rootElement = null;

/**
 * @param {HTMLElement} root - 이벤트 리스너를 등록할 루트 엘리먼트
 */
export function setupEventListeners(root) {
  // 루트 요소 저장
  rootElement = root;

  // 리스너 등록
  delegatedEvents.forEach((eventType) => {
    rootElement.removeEventListener(eventType, handleEvent);
    root.addEventListener(eventType, handleEvent, false);
  });
}

// 이벤트 핸들러 생성
function handleEvent(event) {
  let target = event.target;

  while (target && target !== rootElement) {
    const eventTypeMap = eventMap.get(target);
    if (eventTypeMap) {
      const handlers = eventTypeMap.get(event.type);
      if (handlers) {
        handlers.forEach((handler) => handler(event));
        return;
      }
    }
    target = target.parentElement;
  }
}

/**
 * 특정 요소에 이벤트 핸들러를 등록합니다.
 * @param {HTMLElement} element - 이벤트를 등록할 요소
 * @param {string} eventType - 이벤트 타입 (예: 'click')
 * @param {Function} handler - 이벤트 핸들러 함수
 */
export function addEvent(element, eventType, handler) {
  // 해당 요소에 대한 이벤트 맵이 없으면 새 Map 생성
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }

  // 요소에 등록된 이벤트 맵 가져오기
  const elementEvents = eventMap.get(element);

  // 해당 이벤트 타입에 대한 핸들러 Set이 없으면 새 Set 생성
  if (!elementEvents.has(eventType)) {
    elementEvents.set(eventType, new Set());
  }

  // 이벤트 핸들러 등록
  elementEvents.get(eventType).add(handler);

  // 새로운 이벤트 타입이면 delegatedEvents에 추가하고 루트에 리스너 재등록
  if (!delegatedEvents.has(eventType)) {
    delegatedEvents.add(eventType);

    // 루트 요소를 찾아서 새로운 이벤트 타입 리스너 등록
    let current = element;
    while (current) {
      if (current._eventHandler) {
        current.removeEventListener(eventType, current._eventHandler);
        current.addEventListener(eventType, current._eventHandler, false);
        break;
      }
      current = current.parentElement;
    }
  }
}

/**
 * 지정한 요소에서 특정 이벤트 타입의 핸들러를 제거합니다.
 *
 * @param {HTMLElement} element - 이벤트를 제거할 대상 요소
 * @param {string} eventType - 이벤트 타입 (예: "click", "keydown")
 * @param {Function} handler - 제거할 이벤트 핸들러 함수
 */
export function removeEvent(element, eventType, handler) {
  // 해당 요소에 등록된 이벤트 맵이 없으면 종료
  const elementEvents = eventMap.get(element);
  if (!elementEvents) return;

  // 해당 이벤트 타입에 등록된 핸들러 집합이 없으면 종료
  const handlers = elementEvents.get(eventType);
  if (!handlers) return;

  // 핸들러 제거
  handlers.delete(handler);

  // 해당 타입에 더 이상 핸들러가 없으면 타입 삭제
  if (handlers.size === 0) {
    elementEvents.delete(eventType);
  }

  // 해당 요소에 더 이상 이벤트 타입이 없으면 요소 자체 삭제
  if (elementEvents.size === 0) {
    eventMap.delete(element);
  }
}
