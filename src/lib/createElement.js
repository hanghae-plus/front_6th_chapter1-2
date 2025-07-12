// import { addEvent } from "./eventManager";
import { convert } from "../utils/converter";
import { isNil } from "../utils/isNil";

export function createElement(vNode) {
  return basicCreateElement(vNode)
    .merge(() => componentCreateElement(vNode))
    .otherwise((val) => {
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
    .when((val) => isNil(val) || typeof val === "boolean")
    .then(() => {
      return document.createTextNode("");
    })
    .when((val) => typeof val === "string" || typeof val === "number")
    .then((val) => {
      return document.createTextNode(val.toString());
    })
    .when((val) => Array.isArray(val))
    .then((val) => {
      if (val.length === 1) {
        return createElement(val[0]);
      }

      const $el = new DocumentFragment();
      val.forEach((child) => {
        const $child = createElement(child);
        $el.appendChild($child);
      });
      return $el;
    });
};

const isUnnormalizedComponent = (vNode) => {
  return typeof vNode === "object" && typeof vNode.type === "function";
};

const componentCreateElement = (vNode) => {
  return convert(vNode, { earlyTermination: true })
    .when(isUnnormalizedComponent)
    .error("Component should be normalized");
};

function updateAttributes($el, props) {
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      $el.setAttribute(normalizeAttributeKey(key), value);
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
