# createVNode 함수 상세 분석

## 📝 함수의 역할

### JSX에서 함수 호출로 변환
JSX를 작성하면:
```jsx
<div id="test">Hello</div>
```

Babel이 이렇게 변환합니다:
```javascript
createVNode("div", { id: "test" }, "Hello")
```

### 함수의 목표
이 함수 호출을 다음과 같은 객체로 만드는 것:
```javascript
{
  type: "div",
  props: { id: "test" },
  children: ["Hello"]
}
```

## 🧪 테스트 요구사항 분석

### 1. 기본 구조 테스트
```javascript
it("올바른 구조의 vNode를 생성해야 한다", () => {
  const vNode = createVNode("div", { id: "test" }, "Hello");
  expect(vNode).toEqual({
    type: "div",
    props: { id: "test" },
    children: ["Hello"],
  });
});
```

### 2. 여러 자식 처리 테스트
```javascript
it("여러 자식을 처리해야 한다", () => {
  const vNode = createVNode("div", null, "Hello", "world");
  expect(vNode.children).toEqual(["Hello", "world"]);
});
```

### 3. 배열 평탄화 테스트
```javascript
it("자식 배열을 평탄화해야 한다", () => {
  const vNode = createVNode("div", null, ["Hello", ["world", "!"]]);
  expect(vNode.children).toEqual(["Hello", "world", "!"]);
});
```

### 4. 중첩 구조 테스트
```javascript
it("중첩 구조를 올바르게 표현해야 한다", () => {
  const vNode = createVNode("div", null, 
    createVNode("span", null, "Hello"), 
    createVNode("b", null, "world")
  );
  expect(vNode.type).toBe("div");
  expect(vNode.children.length).toBe(2);
  expect(vNode.children[0].type).toBe("span");
  expect(vNode.children[1].type).toBe("b");
});
```

## 📋 코드 분석

### 현재 구현된 코드
```javascript
export function createVNode(type, props, ...children) {
  // 배열을 평탄화하는 함수
  const flattenChildren = (children) => {
    const result = [];
    for (const child of children) {
      if (Array.isArray(child)) {
        result.push(...flattenChildren(child));
      } else {
        result.push(child);
      }
    }
    return result;
  };

  const flattenedChildren = flattenChildren(children);

  return {
    type,
    props: props || {},
    children: flattenedChildren.length === 1 ? flattenedChildren[0] : flattenedChildren,
  };
}
```

### 단계별 분석

#### 1단계: 함수 시그니처
```javascript
export function createVNode(type, props, ...children) {
```
- `type`: HTML 태그명 또는 컴포넌트 ("div", "span" 등)
- `props`: 속성 객체 (`{ id: "test", className: "container" }`)
- `...children`: 자식 요소들 (Rest 파라미터로 여러 개 받음)

#### 2단계: 배열 평탄화 함수
```javascript
const flattenChildren = (children) => {
  const result = [];
  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child)); // 재귀적으로 평탄화
    } else {
      result.push(child);
    }
  }
  return result;
};
```

**왜 평탄화가 필요한가?**
```javascript
// 이런 경우가 생길 수 있음:
createVNode("div", null, ["Hello", ["world", "!"]]);

// 평탄화 없이면: children = [["Hello", ["world", "!"]]]
// 평탄화 후: children = ["Hello", "world", "!"]
```

#### 3단계: props 처리
```javascript
props: props || {},
```
**왜 이게 필요한가?**
- `<div>Hello</div>` 처럼 props가 없으면 `null`이 들어옴
- 나중에 `props.id` 같은 접근에서 에러를 방지하기 위해 빈 객체로 만듦

#### 4단계: children 개수에 따른 처리
```javascript
children: flattenedChildren.length === 1 ? flattenedChildren[0] : flattenedChildren,
```

**왜 이렇게 하나?**
```javascript
// 자식이 1개일 때
createVNode("div", null, "Hello")
// children = "Hello" (문자열)

// 자식이 여러 개일 때  
createVNode("div", null, "Hello", "World")
// children = ["Hello", "World"] (배열)
```

## 💡 실제 사용 예시

### 간단한 예시
```jsx
// JSX
<div>Hello</div>

// 변환된 함수 호출
createVNode("div", null, "Hello")

// 결과 객체
{
  type: "div",
  props: {},
  children: "Hello"
}
```

### 복잡한 예시
```jsx
// JSX
<div className="container">
  <span>Hello</span>
  <strong>World</strong>
</div>

// 변환된 함수 호출
createVNode("div", { className: "container" },
  createVNode("span", null, "Hello"),
  createVNode("strong", null, "World")
)

// 결과 객체
{
  type: "div",
  props: { className: "container" },
  children: [
    { type: "span", props: {}, children: "Hello" },
    { type: "strong", props: {}, children: "World" }
  ]
}
```
