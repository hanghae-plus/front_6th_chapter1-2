# normalizeVNode.js 완전 가이드

## 🌟 개요

`normalizeVNode.js`는 Virtual DOM의 두 번째 단계를 담당하는 핵심 모듈입니다. 컴포넌트 함수를 실행하고 다양한 타입의 값들을 표준화하는 역할을 합니다.

## ✨ 왜 정규화가 필요한가?

- **컴포넌트 함수 실행**: `createVNode`는 단순히 객체를 만들 뿐, 컴포넌트 함수는 실행하지 않음
- **React 패러다임**: React 컴포넌트들은 결국 함수이므로 실행해서 실제 DOM 요소로 변환해야 함
- **조건부 렌더링**: 조건부 렌더링에서 나오는 `null`, `false` 같은 값들을 정리해야 함

## 🔄 정규화 과정

1. **함수형 컴포넌트 → 실행 → 일반 HTML 요소**
2. **falsy 값들** (`null`, `undefined`, `false`) → 빈 문자열 또는 제거
3. **숫자 → 문자열 변환** (DOM에서는 모든 텍스트가 문자열)
4. **배열 → 각 요소를 재귀적으로 정규화**

## 📋 함수 시그니처

```javascript
normalizeVNode(vNode);
```

### 매개변수

- **vNode**: `any` - 정규화할 Virtual DOM 노드 (모든 타입 가능)

### 반환값

- `string|Object|Array` - 정규화된 Virtual DOM 노드

## 💡 처리 단계별 상세 설명

### 1단계: Falsy 값 처리

```javascript
// 조건부 렌더링에서 {condition && <Component />} 패턴
// condition이 false일 때 false 값이 들어옴
if (vNode == null || typeof vNode === "boolean") {
  return ""; // 화면에 표시하지 않기 위해 빈 문자열로 변환
}
```

### 2단계: 숫자를 문자열로 변환

```javascript
// DOM에서는 모든 텍스트 노드가 문자열이어야 함
// 예: {count} → "5" (count가 5일 때)
if (typeof vNode === "number") {
  return String(vNode);
}
```

### 3단계: 문자열 그대로 반환

```javascript
// 이미 올바른 형태이므로 추가 처리 불필요
if (typeof vNode === "string") {
  return vNode;
}
```

### 4단계: 함수형 컴포넌트 처리 (핵심!)

```javascript
// React의 핵심 개념: 컴포넌트는 함수
if (vNode && typeof vNode === "object" && typeof vNode.type === "function") {
  const component = vNode.type;
  const props = { ...vNode.props };

  // children을 props에 추가 (React의 children prop)
  if (vNode.children && vNode.children.length > 0) {
    props.children = Array.isArray(vNode.children) ? vNode.children : [vNode.children];
  }

  // 컴포넌트 함수 실행!
  const result = component(props);

  // 결과를 재귀적으로 정규화
  return normalizeVNode(result);
}
```

### 5단계: 배열 처리

```javascript
// map으로 생성된 컴포넌트 리스트나 조건부 렌더링이 포함된 배열
if (Array.isArray(vNode)) {
  return vNode
    .map(normalizeVNode) // 각 요소를 재귀적으로 정규화
    .filter((v) => v !== ""); // 빈 문자열(falsy 값에서 변환된 것) 제거
}
```

### 6단계: 일반 vNode 처리

```javascript
// HTML 태그 요소들 (div, span, button 등)의 자식들을 정규화
if (vNode && typeof vNode === "object" && vNode.type) {
  return {
    ...vNode,
    children: Array.isArray(vNode.children)
      ? vNode.children.map(normalizeVNode).filter((v) => v !== "")
      : vNode.children != null
        ? normalizeVNode(vNode.children)
        : [],
  };
}
```

## 💡 사용 예시

### 컴포넌트 함수 실행

```javascript
function Button({ text }) {
  return <button>{text}</button>;
}

// 입력
const vNode = {
  type: Button,
  props: { text: "클릭" },
  children: [],
};

// 출력
const normalized = {
  type: "button",
  props: {},
  children: ["클릭"],
};
```

### 조건부 렌더링 정리

```javascript
// 입력
const vNode = [<span>Hello</span>, false, null, <span>World</span>];

// 출력 (falsy 값 제거됨)
const normalized = [<span>Hello</span>, <span>World</span>];
```

## 🔍 주요 개념

### React의 children prop

- JSX에서 `<Component>내용</Component>` 형태로 쓸 때
- "내용"이 `children` prop이 됨
- 컴포넌트 함수에서 `props.children`으로 접근 가능

### 재귀적 정규화

- 컴포넌트가 또 다른 컴포넌트를 반환할 수 있음
- 모든 컴포넌트가 HTML 요소로 변환될 때까지 재귀 호출

### Falsy 값 필터링

- 조건부 렌더링: `{condition && <Component />}`
- `condition`이 `false`일 때 `false` 값이 나옴
- 이런 값들을 화면에 표시하지 않기 위해 제거

## ⚠️ 주의사항

1. **무한 재귀 방지**: 컴포넌트가 자기 자신을 반환하지 않도록 주의
2. **Props 불변성**: 원본 props 변경 방지를 위해 복사 후 사용
3. **타입 안전성**: 예상치 못한 타입이 들어와도 안전하게 처리

## 🔗 관련 파일

- `createVNode.js`: Virtual DOM 생성 (이전 단계)
- `createElement.js`: DOM 요소 생성 (다음 단계)
- React 컴포넌트들: 정규화 대상이 되는 함수들
