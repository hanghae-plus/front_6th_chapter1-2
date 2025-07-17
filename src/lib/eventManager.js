// 이벤트 위임을 위한 이벤트 저장소
const eventStore = new Map();
const registeredRoots = new Set();

export function setupEventListeners(root) {
  const eventTypes = ["click", "mouseover", "focus", "keydown", "change"];

  // 이미 등록된 root라면 기존 이벤트 리스너 제거
  if (registeredRoots.has(root)) {
    eventTypes.forEach((eventType) => {
      root.removeEventListener(eventType, root[`_${eventType}Handler`]);
    });
  }

  eventTypes.forEach((eventType) => {
    const handler = (e) => {
      let target = e.target;

      // 이벤트 버블링을 통해 모든 상위 요소를 확인
      while (target && target !== root) {
        const handlers = eventStore.get(target)?.[eventType] || [];

        handlers.forEach((handler) => {
          handler(e);
        });

        target = target.parentElement;
      }
    };

    // 핸들러를 root 객체에 저장하여 나중에 제거할 수 있도록 함
    root[`_${eventType}Handler`] = handler;
    root.addEventListener(eventType, handler);
  });

  registeredRoots.add(root);
}

export function addEvent(element, eventType, handler) {
  if (!eventStore.has(element)) {
    eventStore.set(element, {});
  }

  if (!eventStore.get(element)[eventType]) {
    eventStore.get(element)[eventType] = [];
  }

  eventStore.get(element)[eventType].push(handler);
}

export function removeEvent(element, eventType, handler) {
  const elementEvents = eventStore.get(element);
  if (!elementEvents || !elementEvents[eventType]) return;

  const handlers = elementEvents[eventType];
  const index = handlers.indexOf(handler);

  if (index > -1) {
    handlers.splice(index, 1);
  }
}
