import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

// 속성 업데이트
function updateAttributes(target, newProps, oldProps) {
  const allKeys = new Set([
    ...Object.keys(oldProps || {}),
    ...Object.keys(newProps || {})
  ]);
  
  allKeys.forEach(key => {
    const newValue = newProps?.[key];
    const oldValue = oldProps?.[key];
    
    if (newValue === oldValue) return;
    
    // 이벤트 핸들러 처리
    if (key.startsWith('on') && typeof oldValue === 'function') {
      const eventType = key.slice(2).toLowerCase();
      removeEvent(target, eventType, oldValue);
    }
    if (key.startsWith('on') && typeof newValue === 'function') {
      const eventType = key.slice(2).toLowerCase();
      addEvent(target, eventType, newValue);
      return;
    }
    
    // className 처리
    if (key === 'className') {
      if (newValue) {
        target.className = newValue;
      } else {
        target.removeAttribute('class');
      }
      return;
    }
    
    // checked와 selected는 property만 설정 (attribute 건드리지 않음)
    if (key === 'checked' || key === 'selected') {
      target[key] = !!newValue;
      return;
    }
    
    // 다른 Boolean 속성들 (disabled, readOnly)
    const otherBooleanProps = ['disabled', 'readOnly'];
    if (otherBooleanProps.includes(key)) {
      target[key] = !!newValue;
      if (newValue) {
        target.setAttribute(key, '');
      } else {
        target.removeAttribute(key);
      }
      return;
    }
    
    // 일반 속성 처리
    if (newValue == null || newValue === false) {
      target.removeAttribute(key);
    } else {
      target.setAttribute(key, String(newValue));
    }
  });
}

// 엘리먼트 업데이트
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 1. 새 노드가 없으면 기존 노드 제거
  if (!newNode && oldNode) {
    const childToRemove = parentElement.childNodes[index];
    if (childToRemove) {
      parentElement.removeChild(childToRemove);
    }
    return;
  }
  
  // 2. 기존 노드가 없으면 새 노드 추가
  if (newNode && !oldNode) {
    const newElement = createElement(newNode);
    parentElement.appendChild(newElement);
    return;
  }
  
  // 3. 둘 다 텍스트 노드면서 다를 경우 업데이트
  if (typeof newNode === 'string' && typeof oldNode === 'string') {
    if (newNode !== oldNode) {
      parentElement.childNodes[index].textContent = newNode;
    }
    return;
  }
  
  // 4. 노드 타입이 다르면 교체
  if (newNode.type !== oldNode.type) {
    const newElement = createElement(newNode);
    const oldElement = parentElement.childNodes[index];
    parentElement.replaceChild(newElement, oldElement);
    return;
  }
  
  // 5. 같은 타입이면 속성과 자식만 업데이트
  const currentElement = parentElement.childNodes[index];
  updateAttributes(currentElement, newNode.props, oldNode.props);
  
  // 6. 자식 노드들 업데이트
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);
  
  // 7. 먼저 기존 자식들을 새로운 자식들과 비교/업데이트
  for (let i = 0; i < Math.min(newChildren.length, oldChildren.length); i++) {
    updateElement(currentElement, newChildren[i], oldChildren[i], i);
  }
  
  // 8. 새로운 자식이 더 많으면 추가
  for (let i = oldChildren.length; i < newChildren.length; i++) {
    const newElement = createElement(newChildren[i]);
    currentElement.appendChild(newElement);
  }
  
  // 9. 기존 자식이 더 많으면 제거
  // 인덱스 관리를 위해 역순으로 처리
  for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
    const childToRemove = currentElement.childNodes[i];
    if (childToRemove) {
      currentElement.removeChild(childToRemove);
    }
  }
}