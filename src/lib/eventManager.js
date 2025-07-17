/**
 * @type {WeakMap<Element, Map<string, Set<Function>>>}
 * DOM 요소를 키로 사용하여 이벤트 핸들러를 저장하는 WeakMap입니다.
 * 각 요소는 이벤트 타입별로 핸들러 Set을 가집니다.
 */
const eventMap = new WeakMap();

/**
 * 루트 요소에 이벤트 위임을 설정합니다.
 * 지정된 모든 이벤트 유형에 대해 단일 리스너를 루트에 연결하고,
 * 이벤트 발생 시 실제 대상 요소를 찾아 해당 핸들러를 실행합니다.
 *
 * @param {HTMLElement} root - 이벤트 리스너를 부착할 최상위 DOM 요소.
 */
export function setupEventListeners(root) {
  const allEventTypes = [
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "mouseover",
    "mouseout",
    "mousemove",
    "contextmenu",
    "keydown",
    "keyup",
    "keypress",
    "focus",
    "blur",
    "change",
    "input",
    "submit",
  ];

  allEventTypes.forEach((type) => {
    root.addEventListener(type, (e) => {
      // 이벤트가 발생한 대상에서 위로 올라가며 matching handler 실행
      let target = e.target;
      while (target && target !== root) {
        const typeMap = eventMap.get(target);
        if (typeMap) {
          const handlers = typeMap.get(type);
          if (handlers) {
            handlers.forEach((fn) => fn(e));
          }
        }
        // 이벤트가 발생한 대상의 부모로 이동
        target = target.parentElement;
      }
    });
  });
}

/**
 * 특정 DOM 요소에 이벤트 핸들러를 추가합니다.
 * 이벤트는 `eventMap`에 저장되며, `setupEventListeners`에 의해 위임 처리됩니다.
 *
 * @param {Element} element - 이벤트를 추가할 DOM 요소.
 * @param {string} eventType - 이벤트 타입 (예: 'click', 'change').
 * @param {Function} handler - 실행될 이벤트 핸들러 함수.
 */
export function addEvent(element, eventType, handler) {
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }
  const typeMap = eventMap.get(element);

  if (!typeMap.has(eventType)) {
    typeMap.set(eventType, new Set());
  }
  typeMap.get(eventType).add(handler);
}

/**
 * 특정 DOM 요소에서 이벤트 핸들러를 제거합니다.
 * `eventMap`에서 해당 핸들러를 찾아 제거하고, 더 이상 핸들러가 없으면 맵에서 해당 엔트리를 정리합니다.
 *
 * @param {Element} element - 이벤트를 제거할 DOM 요소.
 * @param {string} eventType - 이벤트 타입.
 * @param {Function} handler - 제거할 이벤트 핸들러 함수.
 */
export function removeEvent(element, eventType, handler) {
  const typeMap = eventMap.get(element);
  if (!typeMap) return;
  const handlers = typeMap.get(eventType);
  if (!handlers) return;

  handlers.delete(handler);

  if (handlers.size === 0) {
    typeMap.delete(eventType);
  }

  if (typeMap.size === 0) {
    eventMap.delete(element);
  }
}
