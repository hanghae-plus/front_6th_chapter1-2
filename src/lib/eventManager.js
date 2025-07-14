// eslint-disable-next-line no-unused-vars
export function setupEventListeners(_root) {
  // TODO: Implement event listener setup for root element
}

/**
 *
 * {
 * type: "div",
 * props: {
 *   onClick: () => alert("클릭됨!"),
 *   children: "버튼"
 * }
 * }
 * 이런 형태로 들어올껀데 여기서 이벤트 리스너를 등록해야 함.
 */
export function addEvent(element, eventType, handler) {
  element.addEventListener(eventType, handler);
}

export function removeEvent(element, eventType, handler) {
  element.removeEventListener(eventType, handler);
}
