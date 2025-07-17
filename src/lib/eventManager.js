// 이벤트 목록 저장소
let eventRegistry = new WeakMap();
const allTypes = new Set([
  "click",
  "mouseover",
  "mouseout",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "change",
  "input",
  "submit",
  "focus",
  "blur",
  "keydown",
  "keyup",
]);

//root 에 이벤트 리스너 등록
export function setupEventListeners(root) {
  // 모든 이벤트 타입에 대해 위임 리스너 등록
  allTypes.forEach((type) => {
    root.addEventListener(type, (e) => {
      let currentElement = e.target;
      // 이벤트 버블링: target에서 root까지 올라가면서 핸들러 찾기
      while (currentElement && root.contains(currentElement)) {
        // WeakMap에서 현재 element의 이벤트 맵 가져오기
        const eventMap = eventRegistry.get(currentElement);

        if (eventMap && eventMap.has(type)) {
          const handlers = eventMap.get(type);

          // 해당 이벤트 타입의 모든 핸들러 실행
          handlers.forEach((handler) => {
            try {
              handler(e);
            } catch (error) {
              console.error("이벤트 핸들러 실행 중 오류:", error);
            }
          });
        }
        // 부모 element로 이동
        currentElement = currentElement.parentElement;
        // root에 도달하면 중단
        if (currentElement === root) break;
      }
    });
  });
}

// eventRegistry -> WeakMap { element => Map { eventType => Set(handlers) } }
export function addEvent(element, eventType, handler) {
  if (!element || typeof handler !== "function") return;

  // element의 이벤트 맵이 없으면 생성
  if (!eventRegistry.has(element)) {
    eventRegistry.set(element, new Map());
  }
  const eventMap = eventRegistry.get(element);

  // eventType의 핸들러 Set이 없으면 생성
  if (!eventMap.has(eventType)) {
    eventMap.set(eventType, new Set());
  }
  const handlers = eventMap.get(eventType);

  // 핸들러 추가
  handlers.add(handler);
}

export function removeEvent(element, eventType, handler) {
  const eventMap = eventRegistry.get(element);
  if (!eventMap) return;

  const handlers = eventMap.get(eventType);
  if (!handlers) return;

  // 핸들러 제거
  handlers.delete(handler);

  // 정리: 빈 컬렉션들 제거
  if (handlers.size === 0) {
    eventMap.delete(eventType);
  }
  if (eventMap.size === 0) {
    eventRegistry.delete(element);
  }
}
