import { addEvent } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";

export function createElement(vNode) {
  if (vNode == null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  const normalized = normalizeVNode(vNode);

  if (typeof normalized === "string" || typeof normalized === "number") {
    return document.createTextNode(normalized);
  }

  if (Array.isArray(normalized)) {
    const $el = document.createDocumentFragment();
    for (const node of normalized) {
      $el.appendChild(createElement(node));
    }

    return $el;
  }

  if (typeof vNode === "object" && typeof vNode.type === "function") {
    // Element 는 Function Component 를 다루지 않는다.
    throw new Error("Function is not supported");
  }

  const $el = document.createElement(normalized.type);

  updateAttributes($el, normalized.props ?? {});

  for (const child of normalized.children ?? []) {
    $el.appendChild(createElement(child));
  }

  return $el;
}

const BOOLEAN_PROPS = ["checked", "disabled", "selected", "readOnly"];
function updateAttributes($el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") {
      if (value) {
        $el.setAttribute("class", value);
      } else {
        $el.removeAttribute("class");
      }
      continue;
    } else if (key.startsWith("on")) {
      addEvent($el, key.slice(2).toLowerCase(), value);
    } else if (BOOLEAN_PROPS.includes(key)) {
      if (key === "readOnly" || key === "disabled") {
        if (key === "readOnly") {
          $el.readOnly = !!value;
        } else {
          $el.disabled = !!value;
        }
        if (value) $el.setAttribute(key, "");
        else $el.removeAttribute(key);
      } else {
        if (key === "selected") {
          $el.selected = !!value;
        } else if (key === "checked") {
          $el.checked = !!value;
        }
        $el.removeAttribute(key);
      }
    } else {
      $el.setAttribute(key, value);
    }
  }
}
