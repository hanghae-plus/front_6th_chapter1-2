import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  if (Array.isArray(vNode)) {
    const frament = document.createDocumentFragment();
    vNode.forEach((child) => {
      frament.appendChild(createElement(child));
    });
    return frament;
  }

  if (typeof vNode === "object" && vNode.type) {
    const $el = document.createElement(vNode.type);

    if (vNode.props) {
      updateAttributes($el, vNode.props);
    }

    if (vNode.children) {
      vNode.children.forEach((child) => {
        $el.appendChild(createElement(child));
      });
    }

    return $el;
  }
}

function updateAttributes($el, props) {
  for (const [key, value] in Object.entries(props)) {
    // on으로 시작하면 함수이니 addEvent로 분기
    if (key.startsWith("on")) {
      addEvent($el, key.substring(2), value);
    } else if (key === "className") {
      $el.setAttribute("class", value);
    } else if (key.startsWith("data-")) {
      $el.dataset[key.substring(5)] = value;
    }
  }
}
