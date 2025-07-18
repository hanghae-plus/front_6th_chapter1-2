import { addEvent } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";

export function createElement(vNode) {
  if (vNode === null || vNode === undefined) {
    return document.createTextNode("");
  }

  // 함수형 컴포넌트는 createElement로 직접 처리할 수 없다.
  // normalizeVNode를 통해 일반 vNode로 변환된 후에 처리되어야 한다.
  if (typeof vNode.type === "function") {
    throw new Error("Components cannot be rendered directly with createElement. They must be normalized first.");
  }

  const normalized = normalizeVNode(vNode);

  if (normalized === "" || normalized === null || normalized === undefined) {
    return document.createTextNode("");
  }

  if (typeof normalized === "string" || typeof normalized === "number") {
    return document.createTextNode(String(normalized));
  }

  if (Array.isArray(normalized)) {
    const fragment = document.createDocumentFragment();
    normalized.forEach((child) => fragment.appendChild(createElement(child)));
    return fragment;
  }

  const $el = document.createElement(normalized.type);

  updateAttributes($el, normalized.props);

  // normalizeVNode에서 이미 자식들을 처리했으므로, 여기서는 그대로 사용
  normalized.children.forEach((child) => {
    $el.appendChild(createElement(child));
  });

  return $el;
}

function updateAttributes($el, props) {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
    } else if (key === "className") {
      $el.setAttribute("class", value);
    } else if (typeof value === "boolean") {
      if (value) {
        $el.setAttribute(key, "");
      } else {
        $el.removeAttribute(key);
      }
    } else if (value !== null && value !== undefined) {
      $el.setAttribute(key, value);
    }
  }
}
