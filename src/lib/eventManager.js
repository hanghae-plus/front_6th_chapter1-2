// [key: Element]: Map<string, Set<function>>
const eventManager = new WeakMap();
const eventTypes = new Set();

// root별로 등록된 이벤트 핸들러를 추적
const rootEventHandlers = new WeakMap();

/**
 * @param {Element} element
 * @param {string} eventType
 * @param {function} handler
 */
export function addEvent(element, eventType, handler) {
  if (!eventManager.has(element)) {
    eventManager.set(element, new Map());
  }

  const eventMap = eventManager.get(element);
  if (!eventMap.has(eventType)) {
    eventMap.set(eventType, new Set());
  }

  const handlerSet = eventMap.get(eventType);
  handlerSet.add(handler);

  // eventType을 전역 Set에 추가
  eventTypes.add(eventType);
}

export function removeEvent(element, eventType, handler) {
  const eventMap = eventManager.get(element);

  if (!eventMap) return;

  const handlerSet = eventMap.get(eventType);

  if (!handlerSet) return;

  handlerSet.delete(handler);

  if (handlerSet.size === 0) {
    eventMap.delete(eventType);
  }

  if (eventMap.size === 0) eventManager.delete(element);
}

export function setupEventListeners(root) {
  // 이미 등록된 핸들러가 있다면 제거
  if (rootEventHandlers.has(root)) {
    const existingHandlers = rootEventHandlers.get(root);
    existingHandlers.forEach((handler, eventType) => {
      root.removeEventListener(eventType, handler);
    });
  }

  // 새로운 핸들러 맵 생성
  const handlers = new Map();
  rootEventHandlers.set(root, handlers);

  // eventTypes를 순회하여 각 이벤트 타입에 대해 위임된 핸들러 설정
  eventTypes.forEach((eventType) => {
    const handleEvent = (e) => {
      let currentTarget = e.target;

      // 이벤트 버블링을 통해 상위 요소까지 핸들러 검색
      while (currentTarget && currentTarget !== root) {
        const eventMap = eventManager.get(currentTarget);

        if (eventMap && eventMap.has(eventType)) {
          const handlerSet = eventMap.get(eventType);
          handlerSet.forEach((handler) => {
            handler(e);
          });
        }

        currentTarget = currentTarget.parentElement;
      }
    };

    // 핸들러 등록 및 추적
    handlers.set(eventType, handleEvent);
    root.addEventListener(eventType, handleEvent);
  });
}
