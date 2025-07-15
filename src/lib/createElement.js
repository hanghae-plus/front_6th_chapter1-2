import { addEvent } from "./eventManager";

function updateAttributes($el, props) {
  if (!props) return;
  
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      // 이벤트는 addEvent 함수 사용
      const eventType = key.slice(2).toLowerCase(); // onClick → click
      addEvent($el, eventType, value);
    } else if (key === 'className') {
      $el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.entries(value).forEach(([styleKey, styleValue]) => {
        $el.style[styleKey] = styleValue;
      });
    } else if (typeof value === 'boolean') {
      if (value) {
        $el.setAttribute(key, '');
      }
    } else if (value != null) {
      $el.setAttribute(key, String(value));
    }
  });
}

export function createElement(vNode) {
  // 1. Falsy 값 처리
  if (vNode == null || typeof vNode === 'boolean') {
    return document.createTextNode("");
  }
  
  // 2. 원시값 처리
  if (typeof vNode === 'string' || typeof vNode === 'number') {
    return document.createTextNode(String(vNode));
  }

  // 3. 배열 처리 - DocumentFragment 생성
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach(child => {
      fragment.appendChild(createElement(child)); // 재귀 호출
    });
    return fragment;
  }

  // 4. 함수 컴포넌트 오류
  if (vNode && typeof vNode === 'object' && typeof vNode.type === 'function') {
    throw new Error('함수 컴포넌트는 normalizeVNode로 먼저 변환해야 합니다.');
  }
  
  // 5. 일반 vNode
  if (vNode && typeof vNode === 'object' && typeof vNode.type === 'string') {
    const $el = document.createElement(vNode.type);
    
    // 기존 updateAttributes 함수 사용
    updateAttributes($el, vNode.props);
    
    // children 처리
    if (vNode.children) {
      vNode.children.forEach(child => {
        $el.appendChild(createElement(child));
      });
    }
    
    return $el;
  }
  
  return document.createTextNode("");
}