import { isArray, isBoolean, isNil, isNumber, isString } from "../utils";
import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (isNil(vNode) || isBoolean(vNode)) {
    return document.createTextNode("");
  }

  if (isString(vNode) || isNumber(vNode)) {
    return document.createTextNode(vNode.toString());
  }

  if (isArray(vNode)) {
    const $el = document.createDocumentFragment();
    vNode.forEach((child) => $el.appendChild(createElement(child)));
    return $el;
  }

  const $el = document.createElement(vNode.type);
  updateAttributes($el, vNode.props ?? {});
  (vNode.children ?? []).forEach((child) => $el.appendChild(createElement(child)));
  return $el;
}

function updateAttributes($el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") {
      $el.setAttribute("class", value);
    } else if (key.startsWith("on")) {
      addEvent($el, key.slice(2).toLowerCase(), value);
    } else {
      $el.setAttribute(key, value);
    }
  }
}
