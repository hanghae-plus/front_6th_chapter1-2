// 이벤트 핸들러를 저장할 Map
const eventHandlers = new Map();
const rootElements = new Set();

// 이벤트 ID를 저장할 WeakMap (DOM에 직접 속성을 추가하지 않음)
const eventIds = new WeakMap();

/**
 * root 엘리먼트에 이벤트 리스너를 설정하는 함수입니다.
 * 이벤트 위임(Event Delegation) 패턴을 사용합니다.
 *
 * @param {HTMLElement} root - 이벤트를 설정할 루트 엘리먼트
 */
export function setupEventListeners(root) {
  if (rootElements.has(root)) return;
  rootElements.add(root);

  // 등록된 모든 이벤트 타입에 대해 리스너 설정
  const eventTypes = new Set();
  for (const key of eventHandlers.keys()) {
    const [, eventType] = key.split("|");
    eventTypes.add(eventType);
  }

  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, (event) => {
      let target = event.target;

      // 이벤트가 발생한 요소부터 루트까지 순회하며 핸들러 확인
      while (target && target !== root) {
        const eventId = eventIds.get(target);
        if (eventId) {
          const key = `${eventId}|${eventType}`;
          const handler = eventHandlers.get(key);

          if (handler) {
            handler(event);
            if (event.cancelBubble) break;
          }
        }
        target = target.parentElement;
      }
    });
  });
}

/**
 * 엘리먼트에 이벤트 핸들러를 추가하는 함수입니다.
 *
 * @param {HTMLElement} element - 이벤트를 추가할 엘리먼트
 * @param {string} eventType - 이벤트 타입 (예: 'click', 'input' 등)
 * @param {Function} handler - 이벤트 핸들러 함수
 */
export function addEvent(element, eventType, handler) {
  if (!element || !eventType || !handler) return;

  // 이벤트 ID 생성 및 저장
  let eventId = eventIds.get(element);
  if (!eventId) {
    eventId = Math.random().toString(36).substr(2, 9);
    eventIds.set(element, eventId);
  }

  const key = `${eventId}|${eventType}`;

  // 이전 핸들러 제거
  if (eventHandlers.has(key)) {
    removeEvent(element, eventType, eventHandlers.get(key));
  }

  eventHandlers.set(key, handler);
}

/**
 * 엘리먼트에서 이벤트 핸들러를 제거하는 함수입니다.
 *
 * @param {HTMLElement} element - 이벤트를 제거할 엘리먼트
 * @param {string} eventType - 이벤트 타입 (예: 'click', 'input' 등)
 * @param {Function} handler - 제거할 이벤트 핸들러 함수
 */
export function removeEvent(element, eventType, handler) {
  if (!element || !eventType || !handler) return;

  const eventId = eventIds.get(element);
  if (!eventId) return;

  const key = `${eventId}|${eventType}`;
  if (eventHandlers.get(key) === handler) {
    eventHandlers.delete(key);
    eventIds.delete(element);
  }
}
