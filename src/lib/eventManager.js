// 이벤트 핸들러를 저장하는 Map
const eventHandlers = new Map();

// 이벤트 위임을 위한 루트 요소
let rootElement = null;
let isInitialized = false;

export function setupEventListeners(root) {
  // 이미 초기화되었으면 중복 설정 방지
  if (isInitialized && rootElement === root) {
    return;
  }

  rootElement = root;
  isInitialized = true;

  // 캡처 단계에서 처리해야 하는 이벤트들 (버블링되지 않는 이벤트)
  const captureEvents = ["mouseover", "mouseout", "focus", "blur"];

  // 버블링 단계에서 처리하는 이벤트들
  const bubbleEvents = ["click", "input", "change", "submit", "keydown", "keyup"];

  // 캡처 이벤트 등록
  captureEvents.forEach((eventType) => {
    root.addEventListener(eventType, handleEventDelegation, true);
  });

  // 버블링 이벤트 등록
  bubbleEvents.forEach((eventType) => {
    root.addEventListener(eventType, handleEventDelegation, false);
  });
}

// 이벤트 위임을 처리하는 핸들러 -> listenr 콜백함수
function handleEventDelegation(event) {
  const target = event.target;
  const eventType = event.type;

  // 이벤트 타입에 등록된 모든 핸들러를 확인
  const handlersForType = eventHandlers.get(eventType);
  if (!handlersForType) return;

  // 타겟 요소와 그 상위 요소들에 등록된 핸들러들을 찾아 실행
  let currentElement = target;

  while (currentElement && currentElement !== rootElement) {
    const elementHandlers = handlersForType.get(currentElement);

    if (elementHandlers) {
      // 해당 요소에 등록된 모든 핸들러를 실행
      elementHandlers.forEach((handler) => {
        try {
          handler.call(currentElement, event);
          // stopPropagation이 호출되었으면 이벤트 전파 중단
          if (event.defaultPrevented || event.cancelBubble) {
            return;
          }
        } catch (error) {
          console.error("Event handler error:", error);
        }
      });
    }

    // stopPropagation이 호출되었으면 상위 요소로 전파하지 않음
    if (event.defaultPrevented || event.cancelBubble) {
      break;
    }

    currentElement = currentElement.parentElement;
  }
}

export function addEvent(element, eventType, handler) {
  if (!element || !eventType || typeof handler !== "function") {
    console.warn("Invalid parameters for addEvent:", { element, eventType, handler });
    return;
  }

  // 이벤트 타입에 대한 핸들러 맵이 없으면 생성
  if (!eventHandlers.has(eventType)) {
    eventHandlers.set(eventType, new Map());
  }

  const handlersForType = eventHandlers.get(eventType);

  // 요소에 대한 핸들러 배열이 없으면 생성
  if (!handlersForType.has(element)) {
    handlersForType.set(element, []);
  }

  const elementHandlers = handlersForType.get(element);

  // 중복 핸들러 방지
  if (!elementHandlers.includes(handler)) {
    elementHandlers.push(handler);
  }
}

export function removeEvent(element, eventType, handler) {
  if (!element || !eventType) {
    console.warn("Invalid parameters for removeEvent:", { element, eventType });
    return;
  }

  const handlersForType = eventHandlers.get(eventType);
  if (!handlersForType) return;

  const elementHandlers = handlersForType.get(element);
  if (!elementHandlers) return;

  if (handler) {
    // 특정 핸들러만 제거
    const index = elementHandlers.indexOf(handler);
    if (index > -1) {
      elementHandlers.splice(index, 1);
    }
  } else {
    // 해당 요소의 모든 핸들러 제거
    handlersForType.delete(element);
  }

  // 이벤트 타입에 핸들러가 없으면 타입도 제거
  if (handlersForType.size === 0) {
    eventHandlers.delete(eventType);
  }
}

export function removeAllEvents(element) {
  if (!element) return;

  eventHandlers.forEach((handlersForType, eventType) => {
    handlersForType.delete(element);

    // 이벤트 타입에 핸들러가 없으면 타입도 제거
    if (handlersForType.size === 0) {
      eventHandlers.delete(eventType);
    }
  });
}

export function cleanup() {
  eventHandlers.clear();

  if (rootElement) {
    const captureEvents = ["mouseover", "mouseout", "focus", "blur"];
    const bubbleEvents = ["click", "input", "change", "submit", "keydown", "keyup"];

    // 캡처 이벤트 제거
    captureEvents.forEach((eventType) => {
      rootElement.removeEventListener(eventType, handleEventDelegation, true);
    });

    // 버블링 이벤트 제거
    bubbleEvents.forEach((eventType) => {
      rootElement.removeEventListener(eventType, handleEventDelegation, false);
    });

    rootElement = null;
    isInitialized = false;
  }
}
