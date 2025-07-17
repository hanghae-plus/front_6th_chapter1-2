import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, newProps, oldProps) {
	// DOM 요소의 속성을 업데이트합니다.
	// - 이전 props에서 제거된 속성 처리
	// - 새로운 props의 속성 추가 또는 업데이트
	// - 이벤트 리스너, className, style 등 특별한 경우 처리
	//   <이벤트 리스너 처리>
	//     - TODO: 'on'으로 시작하는 속성을 이벤트 리스너로 처리
	//     - 주의: 직접 addEventListener를 사용하지 않고, eventManager의 addEvent와 removeEvent 함수를 사용하세요.
	
	if (oldProps) {
		Object.keys(oldProps).forEach((key) => {
			if (key.startsWith("on")) {
				const eventType = key.substring(2).toLowerCase();
				removeEvent(target, eventType, oldProps[key]);
			}

			if (key === "className") {
				target.removeAttribute("class");
      } else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
        target[key] = false;
      } else {
				target.removeAttribute(key);
			}
		});
	}

	if (newProps) {
		Object.entries(newProps).forEach(([key, value]) => {
			if (key.startsWith("on")) {
				const eventType = key.substring(2).toLowerCase();
				addEvent(target, eventType, value);				
			}

			if (key === "className") {
				target.setAttribute("class", value);
      } else if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
        target[key] = value;
			} else {
				target.setAttribute(key, value);
			}
		});
	}
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 1. 노드 제거 (newNode가 없고 oldNode가 있는 경우)
  // TODO: oldNode만 존재하는 경우, 해당 노드를 DOM에서 제거
  if (!newNode && oldNode) {
    // oldNode만 존재하는 경우, 해당 노드를 DOM에서 제거
    const child = parentElement.childNodes[index];

    if (child) {
      parentElement.removeChild(child);
    }
    return;
  }

  // 2. 새 노드 추가 (newNode가 있고 oldNode가 없는 경우)
  // TODO: newNode만 존재하는 경우, 새 노드를 생성하여 DOM에 추가
  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 3. 텍스트 노드 업데이트
  // TODO: newNode와 oldNode가 둘 다 문자열 또는 숫자인 경우
  // TODO: 내용이 다르면 텍스트 노드 업데이트
  if (typeof newNode == "string" || typeof oldNode == "string") {
    if (oldNode !== newNode) {
      const newTextNode = document.createTextNode(newNode);
			if (parentElement.childNodes[index]) {
				parentElement.replaceChild(newTextNode, parentElement.childNodes[index]);
      } else {
				parentElement.appendChild(newTextNode);
			}
    }
    return;
  }

  // 4. 노드 교체 (newNode와 oldNode의 타입이 다른 경우)
  // TODO: 타입이 다른 경우, 이전 노드를 제거하고 새 노드로 교체
  if (newNode.type !== oldNode.type) {
    if (parentElement.childNodes[index]) {
			parentElement.replaceChild(createElement(newNode), parentElement.childNodes[index]);
    } else {
			parentElement.appencChild(createElement(newNode));
    } 
    return;
  }

  // 5. 같은 타입의 노드 업데이트
  const childNodes = parentElement.childNodes[index];
  if (childNodes) {
    // 5-1. 속성 업데이트
    // TODO: updateAttributes 함수를 호출하여 속성 업데이트
    updateAttributes(childNodes, newNode.props || {}, oldNode.props || {});

    // 5-2. 자식 노드 재귀적 업데이트
    // TODO: newNode와 oldNode의 자식 노드들을 비교하며 재귀적으로 updateElement 호출
    // HINT: 최대 자식 수를 기준으로 루프를 돌며 업데이트
    const newNodeChildren = newNode.children || [];
    const oldNodeChildren = oldNode.children || [];
    const maxLength = Math.max(newNodeChildren.length, oldNodeChildren.length);
    for (let i = 0; i < maxLength; i++) {
			updateElement(childNodes, newNodeChildren[i], oldNodeChildren[i], i);
    }

    // 5-3. 불필요한 자식 노드 제거
    // TODO: oldNode의 자식 수가 더 많은 경우, 남은 자식 노드들을 제거
    if (oldNodeChildren.length > newNodeChildren.length) {
      for (let i = oldNodeChildren.length - 1; i >= newNodeChildren.length; i--) {
        if (childNodes.childNodes && childNodes.childNodes[i]) {
          childNodes.removeChild(childNodes.childNodes[i]);
        }
			}
    }
  }
}
