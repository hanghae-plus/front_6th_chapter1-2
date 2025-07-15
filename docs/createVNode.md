# createVNode 함수 정리

## 1. createVNode란?

createVNode 함수는 JSX 문법으로 작성된 코드를 가상 DOM(Virtual DOM, VDom) 객체로 변환하는 역할을 합니다. React의 createElement와 유사하게, 실제로는 JSX가 함수 호출(createVNode)로 변환되어 동작합니다.

---

## 2. 왜 필요한가?

- JSX 문법(`<div>Hello</div>`)은 브라우저가 바로 이해할 수 없으므로, 내부적으로 가상 DOM 객체로 변환해야 합니다.
- 가상 DOM 객체는 렌더링 엔진이 실제 DOM으로 변환하거나, 변경 사항을 효율적으로 비교(diff)하는 데 사용됩니다.
- createVNode는 이 변환 과정을 담당하여, UI를 선언적으로 기술할 수 있게 해줍니다.

---

## 3. 주요 동작 원리 및 코드별 설명

### 1) 함수 시그니처

```js
export function createVNode(type, props, ...children)
```

- type: 태그명(문자열) 또는 함수형 컴포넌트
- props: 속성 객체 또는 null
- ...children: 자식 노드(여러 개, 중첩 배열 가능)

### 2) children 평탄화

```js
const flatChildren = children.flat(Infinity);
```

- JSX에서 중첩된 children이 들어올 수 있으므로, 1차원 배열로 평탄화합니다.
- 예: `["Hello", ["world", "!"]]` → `["Hello", "world", "!"]`

### 3) Falsy 값 필터링

```js
const filteredChildren = flatChildren.filter(
  (child) => !(child === null || child === undefined || child === false || child === true),
);
```

- null, undefined, false, true 등 렌더링하지 않는 값은 children에서 제거합니다.
- 숫자 0, 빈 문자열 등은 남겨둡니다.

### 4) 가상 DOM 객체 반환

```js
return {
  type,
  props,
  children: filteredChildren,
};
```

- type, props, children(평탄화 및 필터링된 배열)로 구성된 객체를 반환합니다.
- 이 객체가 가상 DOM의 기본 단위가 됩니다.

---

## 4. 결론

createVNode는 JSX를 가상 DOM 객체로 변환하여, 선언적 UI 작성과 효율적인 렌더링을 가능하게 합니다. children 평탄화와 Falsy 값 필터링을 통해, 다양한 입력에도 일관된 구조를 보장합니다.
