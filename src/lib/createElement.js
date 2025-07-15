import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode == null || vNode == undefined || typeof vNode == "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode == "number" || typeof vNode == "string") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  // - vNode.type에 해당하는 요소를 생성
  const $el = document.createElement(vNode.type);

  // - vNode.props의 속성들을 적용 (이벤트 리스너, className, 일반 속성 등 처리)
  updateAttributes($el, vNode.props ?? {});

  // - vNode.children의 각 자식에 대해 createElement를 재귀 호출하여 추가
  $el.append(...vNode.children.map(createElement));

  return $el;

  function updateAttributes($el, props) {
    Object.entries(props).forEach(([attr, value]) => {
      if (attr.startsWith("on") && typeof value === "function") {
        const eventType = attr.toLowerCase().slice(2);
        addEvent($el, eventType, value);
      } else if (["checked", "disabled", "selected", "readOnly"].includes(attr)) {
        $el[attr] = Boolean(value);
      } else if (attr === "className") {
        $el.setAttribute("class", value);
      } else if (attr === "style" && typeof value === "object") {
        Object.assign($el.style, value);
      } else {
        $el.setAttribute(attr, value);
      }
    });
  }
}
