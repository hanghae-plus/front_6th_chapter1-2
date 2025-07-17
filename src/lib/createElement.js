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

const BOOLEAN_PROPS = new Set(["checked", "disabled", "selected", "readOnly"]);

function updateAttributes($el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") {
      $el.setAttribute("class", value);
      continue;
    }

    if (key.startsWith("on")) {
      addEvent($el, key.slice(2).toLowerCase(), value);
      continue;
    }

    if (BOOLEAN_PROPS.has(key)) {
      $el[key] = !!value;
      continue;
    }

    $el.setAttribute(key, value);
  }
}
