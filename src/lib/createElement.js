import { addEvent } from "./eventManager";
import { convert } from "../utils/converter";
import { isNil } from "../utils/isNil";

const BOOLEAN_ATTRIBUTES = [
  "autoFocus",
  "autoPlay",
  "async",
  "checked",
  "controls",
  "defer",
  "disabled",
  "hidden",
  "loop",
  "multiple",
  "muted",
  "open",
  "readOnly",
  "required",
  "reversed",
  "selected",
  "autoComplete",
  "capture",
  "defaultChecked",
  "defaultSelected",
  "itemScope",
  "noValidate",
];

export function createElement(vNode) {
  return basicCreateElement(vNode)
    .merge(() => componentCreateElement(vNode))
    .default((val) => {
      const $el = document.createElement(val.type);
      updateAttributes($el, val.props);
      if (val.children && val.children.length > 0) {
        const $children = createElement(val.children);
        $el.appendChild($children);
      }
      return $el;
    })
    .end();
}

const basicCreateElement = (vNode) => {
  return convert(vNode, { earlyTermination: true })
    .case((val) => isNil(val) || typeof val === "boolean")
    .to(() => document.createTextNode(""))
    .case((val) => typeof val === "string" || typeof val === "number")
    .to((val) => document.createTextNode(val.toString()))
    .case((val) => Array.isArray(val))
    .to((val) => {
      const $df = new DocumentFragment();
      val.forEach((child) => {
        const $child = createElement(child);
        $df.appendChild($child);
      });
      return $df;
    });
};

const isUnnormalizedComponent = (vNode) => {
  return typeof vNode === "object" && typeof vNode.type === "function";
};

const componentCreateElement = (vNode) => {
  return convert(vNode, { earlyTermination: true })
    .case(isUnnormalizedComponent)
    .error("Component should be normalized");
};

function updateAttributes($el, props) {
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith("on")) {
        if (typeof value !== "function") {
          throw new Error(`Event handler must be a function: ${key}`);
        }
        addEvent($el, key.substring(2).toLowerCase(), value);
      } else if (BOOLEAN_ATTRIBUTES.includes(key)) {
        $el[key] = Boolean(value);
      } else {
        $el.setAttribute(normalizeAttributeKey(key), value);
      }
    });
  }
}

const normalizeAttributeKey = (key) => {
  switch (key) {
    case "className":
      return "class";
    case "htmlFor":
      return "for";
    default:
      return key;
  }
};
