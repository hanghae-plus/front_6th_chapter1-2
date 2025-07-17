/**
 * 이벤트 정보를 저장하는 전역 맵
 * Map<element, Map<eventType, Set<handler>>>
 */
const eventStore = new WeakMap();

/**
 * 특정 DOM 요소에 이벤트 핸들러를 등록
 * @param {Element} element - 이벤트를 등록할 요소
 * @param {string} eventType - 이벤트 타입 (예: 'click')
 * @param {Function} handler - 이벤트 핸들러
 */
export function addEvent(element, eventType, handler) {
  if (!eventStore.has(element)) {
    eventStore.set(element, new Map());
  }
  const typeMap = eventStore.get(element);
  if (!typeMap.has(eventType)) {
    typeMap.set(eventType, new Set());
  }
  typeMap.get(eventType).add(handler);
}

/**
 * 특정 DOM 요소에서 이벤트 핸들러를 제거
 * @param {Element} element - 이벤트를 제거할 요소
 * @param {string} eventType - 이벤트 타입
 * @param {Function} handler - 이벤트 핸들러
 */
export function removeEvent(element, eventType, handler) {
  const typeMap = eventStore.get(element);
  if (!typeMap) return;
  const handlers = typeMap.get(eventType);
  if (!handlers) return;
  handlers.delete(handler);
  if (handlers.size === 0) {
    typeMap.delete(eventType);
  }
  if (typeMap.size === 0) {
    eventStore.delete(element);
  }
}

/**
 * 루트 컨테이너에 이벤트 위임 리스너를 한 번만 등록
 * @param {Element} root - 이벤트 위임의 루트 컨테이너
 */
export function setupEventListeners(root) {
  // 이미 리스너가 등록되어 있다면 중복 등록 방지
  if (root.__eventDelegationSetup) return;
  root.__eventDelegationSetup = true;

  // 지원할 이벤트 타입 목록 (필요시 확장 가능)
  const eventTypes = ["click", "input", "change", "focus", "blur", "keydown", "keyup", "mouseover", "mouseout"];

  eventTypes.forEach((eventType) => {
    root.addEventListener(
      eventType,
      (event) => {
        let target = event.target;
        // 이벤트 타겟에서 부모 방향으로 핸들러 탐색
        while (target && target !== root) {
          const typeMap = eventStore.get(target);
          if (typeMap && typeMap.has(eventType)) {
            // 등록된 모든 핸들러 실행
            typeMap.get(eventType).forEach((handler) => {
              handler.call(target, event);
            });
          }
          // stopPropagation이 호출되면 상위로 전파 중단
          if (event.cancelBubble) break;
          target = target.parentElement;
        }
      },
      false,
    ); // 버블 단계에서 처리
  });
}
