// 이벤트 저장소: element -> eventType -> handlers Set
const eventMap = new Map();

// 이미 설정된 루트 요소들
const initializedRoots = new Set();

/**
 * 루트 요소에 이벤트 위임 리스너를 설정
 * @param {HTMLElement} root - 이벤트 위임을 설정할 루트 요소
 */
export function setupEventListeners(root) {
  // 1단계: 이미 설정된 루트인지 확인
  if (initializedRoots.has(root)) return;

  const eventTypes = ["click", "focus", "blur", "keydown", "keyup", "mouseover", "mouseout", "change", "input"];

  // 2단계: 모든 이벤트 타입에 대해 위임 리스너 등록
  eventTypes.forEach((eventType) => {
    root.addEventListener(
      eventType,
      (event) => {
        handleDelegatedEvent(event, root, eventType); // 실제 핸들러 탐색 위임
      },
      false, // 버블링 처리
    );
  });

  // 3단계: 루트 요소 설정 완료
  initializedRoots.add(root);
}

/**
 * 이벤트 위임을 통한 이벤트 처리
 * @param {Event} event - 발생한 이벤트 객체
 * @param {HTMLElement} root - 이벤트 위임의 루트 요소
 * @param {string} eventType - 처리할 이벤트 타입
 */
function handleDelegatedEvent(event, root, eventType) {
  // 1단계: 실제 클릭된 요소부터 시작 (event.target)
  let currentTarget = event.target;

  // 2단계: 버블링을 따라 올라가면서 핸들러 찾기
  while (currentTarget && currentTarget !== root) {
    const elementEvents = eventMap.get(currentTarget);

    if (elementEvents && elementEvents.has(eventType)) {
      const handlers = elementEvents.get(eventType);

      // 3단계: 모든 핸들러 실행
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`이벤트 핸들러 오류 (${eventType}):`, error);
        }
      });

      // 4단계: 이벤트 전파 중단
      event.stopPropagation();
      return;
    }

    // 5단계: 부모 element로 이동하여 계속 탐색
    currentTarget = currentTarget.parentNode;
  }
}

/**
 * element에 이벤트 핸들러 등록
 * @param {HTMLElement} element - 이벤트를 등록할 DOM element
 * @param {string} eventType - 이벤트 타입 (예: 'click', 'keydown')
 * @param {Function} handler - 이벤트 핸들러 함수
 */
export function addEvent(element, eventType, handler) {
  // 1단계: element에 대한 Map이 없으면 생성
  if (!eventMap.has(element)) {
    eventMap.set(element, new Map());
  }

  const elementEvents = eventMap.get(element);

  // 2단계: eventType에 대한 Set이 없으면 생성
  if (!elementEvents.has(eventType)) {
    elementEvents.set(eventType, new Set());
  }

  // 3단계: 핸들러를 Set에 추가 (중복 자동 제거)
  elementEvents.get(eventType).add(handler);
}

/**
 * element에서 이벤트 핸들러 제거
 * @param {HTMLElement} element - 이벤트를 제거할 DOM element
 * @param {string} eventType - 이벤트 타입 (예: 'click', 'keydown')
 * @param {Function} handler - 제거할 이벤트 핸들러 함수
 */
export function removeEvent(element, eventType, handler) {
  // 1단계: element에 대한 Map 존재 확인
  const elementEvents = eventMap.get(element);
  if (!elementEvents) return;

  // 2단계: eventType에 대한 Set 존재 확인
  const handlers = elementEvents.get(eventType);
  if (!handlers) return;

  // 3단계: 핸들러를 Set에서 제거
  handlers.delete(handler);

  // 4단계: 빈 Set/Map 정리 (메모리 누수 방지)
  if (handlers.size === 0) {
    elementEvents.delete(eventType);
  }
  if (elementEvents.size === 0) {
    eventMap.delete(element);
  }
}
