import { addEvent } from "./eventManager";

export function createElement(vNode) {
  // 함수형 컴포넌트는 처리할 수 없음
  if (typeof vNode === "function") {
    throw new Error("함수형 컴포넌트는 createElement로 처리할 수 없습니다.");
  }

  // 1. null, undefined, boolean은 빈 텍스트 노드 반환
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 2. vNode가 문자열이나 숫자면 텍스트 노드를 생성하여 반환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  // 3. vNode가 배열인 경우
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();

    vNode.forEach((child) => {
      const el = createElement(child);
      if (el) fragment.appendChild(el);
    });

    return fragment;
  }

  // 4. 실제 DOM 요소 생성
  const el = document.createElement(vNode.type);
  const props = vNode.props ?? {};

  for (const [key, value] of Object.entries(props)) {
    if (key === "className") {
      el.setAttribute("class", value);
    } else if (["checked", "disabled", "selected"].includes(key)) {
      el[key] = value;
    } else if (key.startsWith("on")) {
      addEvent(el, key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }

  vNode.children?.forEach((child) => {
    const childEl = createElement(child);
    if (childEl) el.appendChild(childEl);
  });

  return el;
}

// function updateAttributes($el, props) {}
