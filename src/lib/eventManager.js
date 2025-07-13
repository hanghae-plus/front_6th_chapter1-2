// root 아래의 모든 DOM에 이벤트 연결
export function setupEventListeners(root) {
  const elements = root.querySelectorAll("*");

  elements.forEach((el) => {
    const props = el.vDOMProps;

    if (!props) return;
    Object.entries(props).forEach(([attr, handler]) => {
      if (attr.startsWith("on")) {
        const eventType = attr.slice(2).toLowerCase();
        addEvent(el, eventType, handler);
      }
    });
  });
}

// 특정 요소에 이벤트 등록
export function addEvent(element, eventType, handler) {
  element.addEventListener(eventType, handler);
}

// 특정 요소에 이벤트 삭제
export function removeEvent(element, eventType, handler) {
  element.removeEventListener(eventType, handler);
}
