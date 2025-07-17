// 이벤트 저장소
const eventStore = new Map();

export function setupEventListeners(root) {
  // 루트 요소에 이벤트 위임 설정 (모든 하위 요소의 이벤트를 여기서 처리)
  root.addEventListener("click", handleEvent);
  root.addEventListener("change", handleEvent);
  root.addEventListener("input", handleEvent);
  root.addEventListener("keydown", handleEvent);
  root.addEventListener("keyup", handleEvent);
  root.addEventListener("submit", handleEvent);
  root.addEventListener("mouseover", handleEvent);
  root.addEventListener("focus", handleEvent);
  root.addEventListener("blur", handleEvent);
  // 필요한 다른 이벤트들도 추가 가능
}

function handleEvent(event) {
  const element = event.target; // 실제 클릭된 요소
  const eventType = event.type; // 이벤트 타입 (click, change 등)

  // 해당 요소에 등록된 이벤트 핸들러들 찾기
  const handlers = eventStore.get(element);
  if (handlers && handlers[eventType]) {
    handlers[eventType].forEach((handler) => {
      handler.call(element, event); // this를 element로 바인딩해서 호출
    });
  }
}

export function addEvent(element, eventType, handler) {
  if (!eventStore.has(element)) {
    eventStore.set(element, {});
  }

  const elementEvents = eventStore.get(element);
  if (!elementEvents[eventType]) {
    elementEvents[eventType] = [];
  }

  elementEvents[eventType].push(handler);
}

export function removeEvent(element, eventType, handler) {
  const elementEvents = eventStore.get(element);
  if (elementEvents && elementEvents[eventType]) {
    const index = elementEvents[eventType].indexOf(handler);
    if (index > -1) {
      elementEvents[eventType].splice(index, 1);
    }
    // 핸들러가 없으면 배열 제거
    if (elementEvents[eventType].length === 0) {
      delete elementEvents[eventType];
    }
  }
}
