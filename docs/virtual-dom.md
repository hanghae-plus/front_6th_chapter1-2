# 가상 DOM이란 무엇인가?

가상 DOM(Virtual DOM)은 실제 DOM의 가벼운 JavaScript 표현으로, 메모리에서 빠르게 조작할 수 있는 객체입니다. 실제 DOM 조작은 비용이 많이 들기 때문에, 가상 DOM을 통해 변경사항을 미리 계산하고 최소한의 DOM 업데이트만 수행하여 성능을 크게 향상시킵니다.

## 가상 DOM의 장점

성능 최적화: 실제 DOM 조작을 최소화하여 렌더링 속도 향상
일관된 API: 선언적 프로그래밍 모델로 개발자 경험 개선
크로스 브라우저 호환성: 브라우저별 차이점을 추상화
배치 업데이트: 여러 변경사항을 한 번에 처리

## 가상 DOM의 핵심 컴포넌트


우리가 구현한 가상 DOM 시스템은 다음과 같은 핵심 컴포넌트들로 구성됩니다:

### 1. 가상 노드 (VNode) 구조

```ts
{
  type: string,           // HTML 태그명 또는 컴포넌트 함수
  props: Object | null,   // 속성과 이벤트 핸들러
  children: Array | null  // 자식 노드들
}
```

### 2. 시스템 아키텍처

`JSX 코드 → createVNode → normalizeVNode → renderElement → 실제 DOM
                                      ↓
                              updateElement (리렌더링 시)`

## 가상 노드 생성과 정규화

### createVNode: 가상 노드 생성

```js
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: flattenChildren(children),
  };
}
```

```jsx
// JSX 코드
<div className="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// 트랜스파일된 코드
createVNode("div", { className: "container" },
  createVNode("h1", null, "Hello"),
  createVNode("p", null, "World")
)
```

#### flattenChildren 중첩 배열 평탄화

```js
/**
 * @param {Array<VNode|string|null>} children
 * @returns {Array<VNode|string|null>}
 */
const flattenChildren = (children) => {
  return children.reduce((flat, item) => {
    if (item == null || typeof item === "boolean") {
      return flat;
    }
    if (Array.isArray(item)) {
      return flat.concat(flattenChildren(item));
    }
    return flat.concat(item);
  }, []);
};

```


이 함수는 조건부 렌더링과 리스트 렌더링에서 발생하는 중첩 구조의 문제를 해결합니다!

```jsx
// 이런 코드가
<div>
  {isVisible && <span>Visible</span>}
  {items.map(item => <p key={item.id}>{item.name}</p>)}
</div>

// 이런 구조로 변환됩니다
[
  isVisible ? VNode : null,
  [VNode, VNode, VNode] // 배열 렌더링 결과
]
```

### normalizeVNode: 노드 정규화

```js
export function normalizeVNode(vNode) {
  // null, undefined, boolean 처리
  if (vNode == null || vNode === undefined || vNode === true || vNode === false) {
    return "";
  }

  // 원시 타입을 문자열로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 함수 컴포넌트 처리
  if (typeof vNode.type === "function") {
    const props = { ...vNode.props };
    if (vNode.children?.length > 0) {
      props.children = vNode.children.map(child => normalizeVNode(child));
    }
    const result = vNode.type(props);
    return normalizeVNode(result);
  }

  // 자식 노드 정규화
  const normalizedChildren = Array.isArray(vNode.children)
    ? vNode.children.map(child => normalizeVNode(child))
        .filter(child => child !== "" && child != null)
    : vNode.children ? [normalizeVNode(vNode.children)] : [];

  return {
    type: vNode.type,
    props: vNode.props || null,
    children: normalizedChildren.length > 0 ? normalizedChildren : undefined,
  };
}
```

이 함수는 다양한 타입의 노드를 일관된 형태로 변환하고, 함수 컴포넌트를 실행하여 최종 VNode 구조를 만듭니다.

## DOM 생성과 렌더링

### createElement: 가상 DOM → 실제 DOM 변환

```js
export function createElement(vNode) {
  // 원시 타입 처리
  if (vNode === undefined || vNode === null || vNode === false || vNode === true) {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 배열 처리 (Fragment)
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      if (child != null) {
        const element = createElement(child);
        fragment.appendChild(element);
      }
    });
    return fragment;
  }

  // DOM 엘리먼트 생성
  const $element = document.createElement(vNode.type);

  // 속성 설정
  if (vNode.props) {
    Object.entries(vNode.props).forEach(([name, value]) => {
      // 이벤트 리스너
      if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        addEvent($element, eventType, value);
        return;
      }

      // className 특별 처리
      if (name === "className") {
        $element.className = value;
        return;
      }

      // boolean 속성 처리
      if (BOOLEAN_ATTRIBUTES.includes(name)) {
        $element[name] = !!value;
        if (value) {
          $element.setAttribute(name, "");
        }
        return;
      }

      // 일반 속성 처리
      if (value !== false && value != null) {
        $element.setAttribute(name, value);
      }
    });
  }

  // 자식 요소 처리
  if (vNode.children) {
    vNode.children.forEach((child) => {
      if (!child) return;
      const childElement = createElement(child);
      $element.appendChild(childElement);
    });
  }

  return $element;
}
```

### renderElement: 렌더링 엔트리 포인트

```js
export function renderElement(vNode, $targetEl) {
  // vNode 정규화
  const normalizedVNode = normalizeVNode(vNode);

  // 이전 렌더링 결과 가져오기
  const oldVNode = $targetEl._vNode;

  if (!oldVNode) {
    // 최초 렌더링
    const $newEl = createElement(normalizedVNode);
    $targetEl.innerHTML = "";
    $targetEl.appendChild($newEl);
  } else {
    // 재렌더링: DOM 업데이트
    const $prevEl = $targetEl.firstElementChild;
    if (!$prevEl) {
      const $nextEl = createElement(normalizedVNode);
      $targetEl.appendChild($nextEl);
    } else {
      updateElement($targetEl, normalizedVNode, oldVNode, 0);
    }
  }

  // 현재 vNode 저장
  $targetEl._vNode = normalizedVNode;

  // 이벤트 리스너 설정
  if (!$targetEl._hasEventListeners) {
    setupEventListeners($targetEl);
    $targetEl._hasEventListeners = true;
  }

  return $targetEl.firstElementChild;
}
```

## 효율적인 업데이트 시스템

### updateElement: 차분 업데이트 알고리즘

```js
export function updateElement($parent, newNode, oldNode, index = 0) {
  // 노드 삭제
  if (!newNode) {
    const childNode = $parent.childNodes[index];
    if (childNode) {
      $parent.removeChild(childNode);
    }
    return;
  }

  // 노드 추가
  if (!oldNode) {
    const newElement = createElement(newNode);
    if (index < $parent.childNodes.length) {
      $parent.insertBefore(newElement, $parent.childNodes[index]);
    } else {
      $parent.appendChild(newElement);
    }
    return;
  }

  // 텍스트 노드 업데이트
  if (typeof newNode === "string" && typeof oldNode === "string") {
    const childNode = $parent.childNodes[index];
    if (childNode && newNode !== oldNode) {
      childNode.textContent = newNode;
    }
    return;
  }

  // 노드 타입이 다른 경우 교체
  if (
    typeof newNode !== typeof oldNode ||
    newNode.type !== oldNode.type
  ) {
    const childNode = $parent.childNodes[index];
    const newElement = createElement(newNode);
    if (childNode) {
      $parent.replaceChild(newElement, childNode);
    } else {
      $parent.appendChild(newElement);
    }
    return;
  }

  // 속성 업데이트
  const currentNode = $parent.childNodes[index];
  updateAttributes(currentNode, newNode.props, oldNode.props);

  // 자식 노드 재귀 업데이트
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < maxLength; i++) {
    updateElement(currentNode, newChildren[i], oldChildren[i], i);
  }
}
```

### updateAttributes: 속성 업데이트

```js
function updateAttributes($element, newProps, oldProps) {
  newProps = newProps || {};
  oldProps = oldProps || {};

  // 이전 속성 제거
  for (const [name, value] of Object.entries(oldProps)) {
    if (!(name in newProps)) {
      if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        removeEvent($element, eventType, value);
      } else if (name === "className") {
        $element.className = "";
      } else {
        $element.removeAttribute(name);
      }
    }
  }

  // 새로운 속성 추가/업데이트
  for (const [name, value] of Object.entries(newProps)) {
    if (value === oldProps[name]) continue;

    if (name.startsWith("on")) {
      const eventType = name.toLowerCase().substring(2);
      if (oldProps[name]) {
        removeEvent($element, eventType, oldProps[name]);
      }
      addEvent($element, eventType, value);
    } else if (name === "className") {
      $element.className = value || "";
    } else {
      $element.setAttribute(name, value);
    }
  }
}
```

## 이벤트 위임으로 성능 최적화

### 이벤트 위임 시스템

```js
// 이벤트 핸들러 저장소
const eventHandlers = new Map();
const rootElements = new Set();
const eventIds = new WeakMap();

export function setupEventListeners(root) {
  if (rootElements.has(root)) return;
  rootElements.add(root);

  // 등록된 모든 이벤트 타입 수집
  const eventTypes = new Set();
  for (const key of eventHandlers.keys()) {
    const [, eventType] = key.split("|");
    eventTypes.add(eventType);
  }

  // 루트에 이벤트 리스너 등록
  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, (event) => {
      let target = event.target;

      // 이벤트 버블링을 통해 핸들러 찾기
      while (target && target !== root) {
        const eventId = eventIds.get(target);
        if (eventId) {
          const key = `${eventId}|${eventType}`;
          const handler = eventHandlers.get(key);

          if (handler) {
            handler(event);
            if (event.cancelBubble) break;
          }
        }
        target = target.parentElement;
      }
    });
  });
}
```

### 이벤트 등록과 제거

```js
export function addEvent(element, eventType, handler) {
  if (!element || !eventType || !handler) return;

  // 고유 ID 생성
  let eventId = eventIds.get(element);
  if (!eventId) {
    eventId = Math.random().toString(36).substr(2, 9);
    eventIds.set(element, eventId);
  }

  const key = `${eventId}|${eventType}`;
  
  // 이전 핸들러 제거
  if (eventHandlers.has(key)) {
    removeEvent(element, eventType, eventHandlers.get(key));
  }

  eventHandlers.set(key, handler);
}

export function removeEvent(element, eventType, handler) {
  if (!element || !eventType || !handler) return;

  const eventId = eventIds.get(element);
  if (!eventId) return;

  const key = `${eventId}|${eventType}`;
  if (eventHandlers.get(key) === handler) {
    eventHandlers.delete(key);
    eventIds.delete(element);
  }
}
```

#### 이벤트 위임의 장점

메모리 효율성: 각 엘리먼트마다 이벤트 리스너를 등록하지 않고 루트에만 등록
동적 요소 지원: 새로 추가된 요소도 별도 설정 없이 이벤트 처리 가능
성능 향상: 이벤트 리스너 등록/해제 비용 최소화

## 실제 동작 예시

### 간단한 카운터 앱

#### 1. 최초 렌더링

```jsx
// 컴포넌트 정의
/** @jsx createVNode */
import { createVNode, renderElement } from "./lib";

function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);

  return createVNode("div", { className: "counter" },
    createVNode("h1", null, `Count: ${count}`),
    createVNode("button", { 
      onClick: () => setCount(count + 1) 
    }, "Increment"),
    createVNode("button", { 
      onClick: () => setCount(count - 1) 
    }, "Decrement")
  );
}

// 렌더링
const app = createVNode(Counter, { initialCount: 10 });
renderElement(app, document.getElementById('root'));
```

#### 2. 상태 변경시 리렌더링

```js
// 새로운 VNode 생성
const newVNode = createVNode(Counter, { initialCount: 10 });

// 이전 VNode와 비교하여 업데이트
updateElement($targetEl, newVNode, oldVNode, 0);
```

#### 3. 차분 업데이트

```js
// 텍스트 노드만 업데이트
childNode.textContent = "Count: 11"; // "Count: 10"에서 변경

// 이벤트 핸들러는 그대로 유지
// DOM 구조 변경 없음
```

## 성능 최적화 전략

### 1. 메모리 관리

- WeakMap 사용: DOM 요소가 제거되면 자동으로 메모리에서 해제
- 이벤트 핸들러 재사용: 동일한 핸들러는 재등록하지 않음
- Fragment 활용: 불필요한 래퍼 요소 제거

### 2. 렌더링 최적화

- 조건부 렌더링: falsy 값들을 빈 텍스트 노드로 처리
- 배열 평탄화: 중첩된 배열을 효율적으로 처리
- 타입 체크: 불필요한 DOM 조작 방지

### 3. 이벤트 최적화

- 이벤트 위임: 루트 레벨에서 모든 이벤트 처리
- 핸들러 캐싱: 동일한 핸들러 재사용
- 메모리 누수 방지: 요소 제거 시 이벤트 핸들러도 정리

### 4. DOM 업데이트 최적화

- 최소 변경: 실제로 변경된 부분만 업데이트
- 배치 처리: 여러 변경사항을 한 번에 처리
- 타입 비교: 같은 타입의 노드만 업데이트