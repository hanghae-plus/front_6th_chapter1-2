//diff알고리즘의 본체
import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

//DOM 요소의 속성/이벤트를 비교해서 변경, 추가, 삭제
export function updateAttributes(target, originNewProps, originOldProps = null) {
  Object.keys(originOldProps).forEach((key) => {
    if (!(key in originNewProps)) {
      if (key.startsWith("on")) {
        //console.log("이벤트 변경", key, originNewProps[key], originOldProps[key]);

        removeEvent(target, key.slice(2).toLowerCase(), originOldProps[key]);
        //addEvent와 removeEvent가
        //실제 DOM의 addEventListener/removeEventListener까지 관리해야
        //이벤트가 완전히 제거됩니다.
        //target.removeEventListener(key.slice(2).toLowerCase(), originOldProps[key]);
      } else if (key === "className") {
        target.removeAttribute("class");
      } else if (key === "checked" || key === "disabled" || key === "selected" || key === "readOnly") {
        target[key] = false; // boolean 속성은 false로 설정
        target.removeAttribute(key);
      } else {
        target.removeAttribute(key);
      }
    }
  });

  Object.keys(originNewProps).forEach((key) => {
    if (originNewProps[key] !== originOldProps[key]) {
      //console.log("originNew key : ", originNewProps[key]);
      //console.log("originOld key : ", originOldProps[key]);
      if (key.startsWith("on") && typeof originNewProps[key] === "function") {
        if (originOldProps[key]) {
          removeEvent(target, key.slice(2).toLowerCase(), originOldProps[key]);
          //target.removeEventListener(key.slice(2).toLowerCase(), originOldProps[key]);
          //addEvent(target, key.slice(2).toLowerCase(), originNewProps[key]);
        }
        addEvent(target, key.slice(2).toLowerCase(), originNewProps[key]);
      } else if (key === "className") {
        target.setAttribute("class", originNewProps[key]);
      } else if (key === "style" && typeof originNewProps[key] === "object") {
        Object.entries(originNewProps[key]).forEach(([styleName, styleValue]) => {
          target.style[styleName] = styleValue;
        });
      } else if (key.startsWith("data-")) {
        target.setAttribute(key, originNewProps[key]);
      } else if (key === "checked") {
        target.checked = originNewProps[key]; // checked 속성은 boolean으로 설정
        target.removeAttribute("checked"); // attribute는 항상 제거
      } else if (key === "disabled" || key === "readOnly") {
        target[key] = originNewProps[key]; // boolean 속성은 true로 설정
        if (originNewProps[key])
          target.setAttribute(key, ""); // 속성 추가
        else target.removeAttribute(key); // 속성 제거
      } else if (key === "selected" && target.tagName === "OPTION") {
        target.selected = originNewProps[key]; // selected 속성은 boolean으로 설정
        target.removeAttribute("selected"); // attribute는 항상 제거
      } else if (typeof originNewProps[key] === "boolean") {
        if (originNewProps[key]) target.setAttribute(key, "");
        else target.removeAttribute(key);
      } else {
        target.setAttribute(key, originNewProps[key]);
      }
    }
  });
}

//노드 타입, 태그, 텍스트, children 등을 비교해서 변경된 부분만 실제 DOM에 반영
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!newNode && !oldNode) return;

  if (newNode && !oldNode) {
    //새로운 노드가 있고 기존 노드가 없는 경우
    const newElement = createElement(newNode);
    parentElement.appendChild(newElement);
    return;
  }

  if (!newNode && oldNode) {
    // 실제로 해당 인덱스의 자식이 존재할 때만 삭제
    if (parentElement.childNodes[index]) {
      parentElement.removeChild(parentElement.childNodes[index]);
    }
    return;
  }

  if (newNode.type !== oldNode.type) {
    //타입이 다른 경우
    const newElement = createElement(newNode);
    parentElement.replaceChild(newElement, parentElement.childNodes[index]);
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      parentElement.childNodes[index].nodeValue = String(newNode);
    }
    return;
  }

  updateAttributes(parentElement.childNodes[index], newNode.props || {}, oldNode.props || {});

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < maxLength; i++) {
    updateElement(parentElement.childNodes[index], newChildren[i], oldChildren[i], i);
  }

  if (newChildren.length < oldChildren.length) {
    const parent = parentElement.childNodes[index] || parentElement;
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      if (parent.childNodes[i]) {
        parent.removeChild(parent.childNodes[i]);
      }
    }
  }
}
