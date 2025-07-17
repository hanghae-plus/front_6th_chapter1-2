import { eventInstance } from "./eventManager";
import { VNodeType } from "./types";

export function createElement(vNode: VNodeType): HTMLElement | Text | DocumentFragment {
  if (vNode == null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 2. 문자열, 숫자 → 텍스트 노드
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 3. 함수 → 함수 컴포넌트 호출
  if (typeof vNode.type === "function") {
    throw new Error("error");
  }

  // 4. 배열 → DocumentFragment
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  // 5. 객체(vNode) → 실제 DOM 요소 생성
  const { type, props = {}, children = [] } = vNode;

  const $el = document.createElement(type);

  updateAttributes($el, props);

  // children이 배열이 아닐 수도 있으니 배열로 변환
  const childArray = Array.isArray(children) ? children : [children];
  childArray.forEach((child) => {
    $el.appendChild(createElement(child));
  });

  return $el;
}

function updateAttributes($el, props) {
  for (const [key, value] of Object.entries(props || {})) {
    if (key.startsWith("on") && typeof value === "function") {
      // 이벤트 리스너
      eventInstance.addEvent($el, key.slice(2).toLowerCase() as keyof HTMLElementEventMap, value as EventListener);
      continue;
    }
    if (key === "className") {
      $el.className = value;
      continue;
    }

    if (key === "style" && typeof value === "object") {
      Object.assign($el.style, value);
      continue;
    }

    if (typeof value === "boolean") {
      $el[key] = value;
      continue;
    }

    $el.setAttribute(key, value);
  }
}
