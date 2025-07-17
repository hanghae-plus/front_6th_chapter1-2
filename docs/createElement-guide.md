# createElement.js 완전 가이드

## 🌟 개요

`createElement.js`는 Virtual DOM의 세 번째 단계를 담당하는 핵심 모듈입니다. 정규화된 Virtual DOM 객체를 실제 브라우저 DOM 요소로 변환하는 역할을 합니다.

## ✨ 왜 이 단계가 필요한가?

- **Virtual DOM의 한계**: Virtual DOM은 JavaScript 객체일 뿐, 브라우저는 이해할 수 없음
- **브라우저 렌더링**: 브라우저가 화면에 표시하려면 실제 DOM Element가 필요함
- **Web API 활용**: `document.createElement` 같은 Web API를 사용해서 실제 DOM 생성

## 🔄 변환 과정

1. **JavaScript 객체 → 실제 DOM Element**
2. **속성 설정** (id, class, 이벤트 핸들러 등)
3. **자식 요소들을 재귀적으로 처리**해서 추가
4. **완전한 DOM 트리 구조 완성**

## 📋 createElement 함수 처리 단계

### 1단계: Falsy 값 처리

```javascript
// normalizeVNode에서 처리되지 않은 falsy 값들이나
// 직접 createElement를 호출할 때를 위한 안전장치
if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
  return document.createTextNode(""); // 화면에는 아무것도 표시되지 않음
}
```

### 2단계: 텍스트 노드 변환

```javascript
// DOM에서 텍스트는 TextNode라는 특별한 노드 타입으로 표현됨
if (typeof vNode === "string" || typeof vNode === "number") {
  return document.createTextNode(String(vNode));
}
```

### 3단계: 배열을 DocumentFragment로 변환

```javascript
// DocumentFragment: 여러 DOM 노드를 묶어서 한 번에 DOM에 추가할 수 있는 임시 컨테이너
// 성능상 이점: 하나씩 추가하는 것보다 한 번에 추가하는 것이 빠름
if (Array.isArray(vNode)) {
  const fragment = document.createDocumentFragment();
  vNode.forEach((child) => {
    fragment.appendChild(createElement(child)); // 각 자식을 재귀적으로 변환해서 추가
  });
  return fragment;
}
```

### 4단계: 함수형 컴포넌트 에러 처리

```javascript
// 이 단계에서 컴포넌트 함수가 들어오면 normalizeVNode를 먼저 실행하지 않았다는 뜻
if (typeof vNode.type === "function") {
  throw new Error("컴포넌트는 createElement로 직접 처리할 수 없습니다. normalizeVNode를 먼저 사용하세요.");
}
```

### 5단계: HTML 요소 변환

- vNode 객체를 실제 HTML 요소로 변환
- 속성 설정 및 자식 요소 추가

## 🎨 updateAttributes 함수

DOM 요소에 속성을 설정하는 함수로, Virtual DOM의 props를 실제 DOM 속성으로 변환합니다.

### 처리하는 속성 타입

#### 1. 이벤트 핸들러

- `onClick`, `onMouseOver` 등 → 이벤트 위임으로 등록
- `'on'`으로 시작하고 함수인 경우 이벤트 핸들러로 간주
- `"onClick"` → `"click"`으로 변환

#### 2. className 속성

- JSX에서는 `className`을 사용하지만, HTML에서는 `class` 속성을 사용
- `className` → `class`로 자동 변환

#### 3. 불리언 속성

- `disabled`, `checked`, `selected` 등
- HTML에서 불리언 속성은 값이 있으면 true, 없으면 false
- `true`면 `<input disabled>` (값 없이 속성명만)
- `false`면 속성을 아예 설정하지 않음

#### 4. 일반 속성

- `id`, `title`, `data-*` 등
- 그대로 설정

## 💡 사용 예시

### 간단한 변환

```javascript
// 입력 (Virtual DOM)
const vNode = {
  type: "div",
  props: { id: "test" },
  children: ["Hello"],
};

// 출력 (실제 DOM)
// <div id="test">Hello</div>
```

### 복합 구조 변환

```javascript
// 입력 (Virtual DOM)
const vNode = {
  type: "div",
  props: {},
  children: [
    { type: "h1", props: {}, children: ["제목"] },
    { type: "p", props: {}, children: ["내용"] },
  ],
};

// 출력 (실제 DOM)
// <div><h1>제목</h1><p>내용</p></div>
```

## 🔍 주요 개념

### DocumentFragment란?

- 여러 DOM 노드를 묶어서 한 번에 DOM에 추가할 수 있는 임시 컨테이너
- **성능상 이점**: 하나씩 추가하는 것보다 한 번에 추가하는 것이 빠름
- 메모리상에만 존재하며, DOM에 추가될 때 자동으로 해제됨

### 이벤트 위임

- 각 요소에 직접 이벤트를 붙이지 않고, 상위 요소에서 이벤트를 관리
- 메모리 효율성과 성능 향상
- `eventManager`를 통해 처리

## ⚠️ 주의사항

1. **Falsy 값 처리**: `null`, `undefined`, `false`, `true` 등은 건너뛰고 렌더링하지 않음
2. **컴포넌트 함수**: 직접 처리할 수 없으며, `normalizeVNode`를 먼저 실행해야 함
3. **속성 타입**: 각 속성의 타입에 따라 다른 방식으로 처리됨

## 🔗 관련 파일

- `normalizeVNode.js`: Virtual DOM 정규화 (이전 단계)
- `eventManager.js`: 이벤트 위임 관리
- `updateElement.js`: DOM 업데이트 처리
