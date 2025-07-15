// 엘리먼트별 이벤트 핸들러들을 저장할 WeakMap
// 구조 예: WeakMap<HTMLElement, { click: [handler1, handler2], ... }>
const eventHandlers = new WeakMap();

// 루트에 중복 이벤트 등록 방지를 위한 Set
const delegatedEvents = new Set();

// 루트에 이벤트 리스너를 등록하는 함수
export function setupEventListeners(root) {
  // 현재까지 등록된 이벤트 타입들(delegatedEvents) 반복
  delegatedEvents.forEach((eventType) => {
    // 혹시라도 중복 방지를 위해 removeEventListener 먼저 호출
    root.removeEventListener(eventType, handleEvent);
    // 루트 엘리먼트에 handleEvent를 이벤트 리스너로 등록
    root.addEventListener(eventType, handleEvent);
  });
}

// 루트에 등록된 이벤트 리스너로, 모든 이벤트는 여기로 들어옴
function handleEvent(event) {
  let target = event.target; // 이벤트 발생한 실제 엘리먼트
  const root = event.currentTarget; // 이벤트 리스너가 붙은 루트 엘리먼트

  // target에서 root까지 부모로 거슬러 올라가며 탐색
  while (target) {
    const handlersMap = eventHandlers.get(target); // 현재 엘리먼트의 핸들러 목록 가져오기

    // 해당 엘리먼트에 현재 이벤트 타입의 핸들러가 있으면 실행
    if (handlersMap && handlersMap[event.type] && handlersMap[event.type].length > 0) {
      handlersMap[event.type].forEach((handler) => handler(event)); // 모든 핸들러 실행
      return; // 첫 발견한 엘리먼트에서만 실행하고 탐색 종료
    }

    // root까지 도달하면 루프 종료 (root 이상은 안 올라감)
    if (target === root) break;

    // 부모 엘리먼트로 이동
    target = target.parentElement;
  }
}

// 엘리먼트에 이벤트 핸들러를 등록하는 함수
export function addEvent(element, eventType, handler) {
  // 해당 엘리먼트에 아직 등록된 게 없으면 초기화
  if (!eventHandlers.has(element)) {
    eventHandlers.set(element, {});
  }

  const handlersMap = eventHandlers.get(element);

  // 해당 이벤트 타입의 핸들러 배열 초기화
  if (!handlersMap[eventType]) {
    handlersMap[eventType] = [];
  }

  // 이미 같은 핸들러가 있으면 중복 등록 방지
  if (!handlersMap[eventType].includes(handler)) {
    handlersMap[eventType].push(handler);
  }

  // 루트에 이 이벤트 타입이 아직 안 등록됐다면 추가
  if (!delegatedEvents.has(eventType)) {
    delegatedEvents.add(eventType);
  }
}

// 엘리먼트에서 특정 이벤트 핸들러를 제거하는 함수
export function removeEvent(element, eventType, handler) {
  const handlersMap = eventHandlers.get(element);

  // 해당 엘리먼트에 해당 이벤트 타입의 핸들러가 없으면 종료
  if (!handlersMap || !handlersMap[eventType]) return;

  const index = handlersMap[eventType].indexOf(handler);
  if (index > -1) {
    handlersMap[eventType].splice(index, 1); // 해당 핸들러 배열에서 제거
  }
}
