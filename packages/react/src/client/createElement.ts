import { addEvent } from "./eventManager.ts";
import { EventHandler, VNodeChild, VNodeProps, VNodeTagName } from "../core/types.ts";

export function createElement(vNode: VNodeChild): Node {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child)));
    return fragment;
  }

  const $el = document.createElement(vNode.type as VNodeTagName);

  updateAttributes($el, vNode.props ?? {});

  $el.append(...vNode.children.map(createElement));

  return $el;
}

function updateAttributes($el: Element, props: VNodeProps): void {
  Object.entries(props).forEach(([attr, value]) => {
    if (attr.startsWith("on") && typeof value === "function") {
      const eventType = attr.toLowerCase().slice(2);
      addEvent($el, eventType, value as EventHandler);
    } else if (attr === "className") {
      $el.setAttribute("class", value);
    } else if (attr === "style" && typeof value === "object") {
      Object.assign(($el as HTMLElement).style, value);
    } else if (typeof value === "boolean") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      $el[attr] = value;
    } else {
      $el.setAttribute(attr, String(value));
    }
  });
}
