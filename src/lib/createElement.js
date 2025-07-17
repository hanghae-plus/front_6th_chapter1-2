import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") return document.createTextNode("");
  if (typeof vNode === "string" || typeof vNode === "number") return document.createTextNode(vNode);
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  // 위의 경우가 아니라면 일반 DOM 요소 처리
  // 1. vNode.type으로 엘리먼트 생성
  const $el = document.createElement(vNode.type);
  // 2.vNode.props를 통해 속성, 이벤트, 클래스 등을 DOM 요소에 설정
  if (vNode.props) updateAttributes($el, vNode.props);
  // 3.vNode.children을 재귀적으로 DOM으로 만들어서 자식으로 추가
  if (vNode.children) {
    vNode.children.forEach((child) => {
      $el.appendChild(createElement(child));
    });
  }

  return $el;
}

// 가상 노드의 props를 실제 DOM 요소인 $el에 적용
// 해야 하는 일: setAttribute, className -> class, 이벤트리스너 바인딩
// TODO: 아래 분기처리에서 처리되지 않는 속성은 없는지 고민..
function updateAttributes($el, props) {
  const booleanProps = ["checked", "disabled", "selected", "readonly", "multiple", "autofocus", "required"];
  const propertyOnlyBooleanProps = ["checked", "selected"];
  const propToAttributeMap = {
    readOnly: "readonly",
  };

  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      $el.setAttribute("class", value);
    } else if (key.startsWith("on") && typeof value === "function") {
      addEvent($el, key.toLowerCase().slice(2), value);
    } else if (booleanProps.includes(key) || key === "readOnly") {
      const propKey = key === "readOnly" ? "readOnly" : key;
      const attrKey = propToAttributeMap[key] || key;

      $el[propKey] = Boolean(value);
      if (value && !propertyOnlyBooleanProps.includes(propKey)) {
        $el.setAttribute(attrKey, "");
      } else {
        $el.removeAttribute(attrKey);
      }
    } else {
      $el.setAttribute(key, value ?? "");
    }
  });
}
