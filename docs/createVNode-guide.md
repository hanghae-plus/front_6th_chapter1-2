# createVNode.js 완전 가이드

## 🌟 개요

`createVNode.js`는 Virtual DOM의 첫 번째 단계를 담당하는 핵심 모듈입니다. JSX 문법을 JavaScript 객체(Virtual DOM)로 변환하는 역할을 합니다.

## ✨ Virtual DOM이란?

- **정의**: 실제 DOM을 JavaScript 객체로 표현한 것
- **장점**: 메모리에서 빠르게 조작할 수 있어 성능이 좋음
- **사용처**: React, Vue 등 모든 현대 프레임워크가 사용하는 핵심 개념

## 🔄 JSX 변환 과정

1. **개발자가 JSX로 코드 작성**: `<div>Hello</div>`
2. **Babel이 함수 호출로 변환**: `createVNode("div", null, "Hello")`
3. **createVNode가 객체로 변환**: `{ type: "div", props: null, children: ["Hello"] }`

## 📋 함수 시그니처

```javascript
createVNode(type, props, ...children);
```

### 매개변수

- **type**: `string|Function` - HTML 엘리먼트의 태그명 ('div', 'span') 또는 React 컴포넌트 함수
- **props**: `Object|null` - HTML 엘리먼트의 속성들 (id, className, onClick 등)
- **children**: `...any` - 자식 노드들 (가변 인자)

### 반환값

```javascript
{
  type: string|Function,
  props: Object|null,
  children: Array<any>
}
```

## 💡 사용 예시

### 간단한 예시

```javascript
// JSX
<div id="test">Hello</div>

// 변환됨
createVNode("div", { id: "test" }, "Hello")

// 결과
{
  type: "div",
  props: { id: "test" },
  children: ["Hello"]
}
```

### 여러 자식이 있는 경우

```javascript
// JSX
<div>Hello <span>World</span></div>

// 변환됨
createVNode("div", null, "Hello ", createVNode("span", null, "World"))

// 결과
{
  type: "div",
  props: null,
  children: [
    "Hello ",
    { type: "span", props: null, children: ["World"] }
  ]
}
```

### 중첩된 배열 평탄화

```javascript
// JSX
(
  <div>
    {[1, 2, 3].map((n) => (
      <span key={n}>{n}</span>
    ))}
  </div>
)[
  // 자식이 중첩 배열로 들어올 수 있음
  ("Hello", [span1, span2, span3])
][
  // flat(Infinity)로 평탄화
  ("Hello", span1, span2, span3)
];
```

## 🔧 핵심 기능: 배열 평탄화

### 왜 필요한가?

- JSX에서 `{items.map(...)}` 같은 코드가 중첩 배열을 만들기 때문
- 예: `["Hello", [<span>1</span>, <span>2</span>]]` → `["Hello", <span>1</span>, <span>2</span>]`

### 구현 방법

```javascript
const flattenedChildren = children.flat(Infinity);
```

## ⚠️ 중요한 처리 규칙

### props 처리

- `undefined`만 빈 객체 `{}`로 변환
- `null`은 `null` 유지 (테스트 요구사항)

### children 처리

- 항상 배열로 반환 (일관성을 위해)
- 중첩 배열은 완전히 평탄화

## 🔗 관련 파일

- `normalizeVNode.js`: Virtual DOM 정규화 (다음 단계)
- `createElement.js`: DOM 요소 생성 (최종 단계)
- Babel 설정: JSX → createVNode 변환 설정
