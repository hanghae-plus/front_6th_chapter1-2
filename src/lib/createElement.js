import { addEvent } from "./eventManager";

export function createElement(vNode) {
  if (vNode == null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "number" || typeof vNode === "string") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    return createFragment(vNode);
  }

  if (typeof vNode.type === "function") {
    throw new Error("컴포넌트는 직접 createElement로 사용할 수 없습니다.");
  }

  return createDOMElement(vNode);
}

function createFragment(vNode) {
  const fragment = document.createDocumentFragment();
  vNode.forEach((node) => {
    fragment.appendChild(createElement(node));
  });
  return fragment;
}

function createDOMElement(vNode) {
  const element = document.createElement(vNode.type);

  if (vNode.props) {
    updateAttributes(element, vNode.props);
  }

  if (hasChildren(vNode)) {
    appendChildren(element, vNode.children);
  }

  return element;
}

function hasChildren(vNode) {
  return Array.isArray(vNode.children) && vNode.children.length > 0;
}

function appendChildren(parentElement, children) {
  children.forEach((child) => {
    const childElement = createElement(child);
    parentElement.appendChild(childElement);
  });
}

function updateAttributes($el, props) {
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
      return;
    }

    if (key === "className") {
      $el.setAttribute("class", value);
      return;
    }

    if (key === "children") {
      return;
    }

    if (key === "style") {
      Object.assign($el.style, value);
      return;
    }

    if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
      const attrName = key === "readOnly" ? "readonly" : key;
      if (value === true) {
        $el[key] = true;
        if (key === "disabled" || key === "readOnly") {
          $el.setAttribute(attrName, "");
        } else {
          $el.removeAttribute(attrName);
        }
      } else {
        $el[key] = false;
        $el.removeAttribute(attrName);
      }
      return;
    }

    $el.setAttribute(key, value);
  });
}
