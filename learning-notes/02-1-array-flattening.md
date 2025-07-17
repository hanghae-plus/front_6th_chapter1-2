# 배열 평탄화(Array Flattening)가 왜 필요한가?

## 🤔 문제 상황

### 실제 JSX 코드 예시
```jsx
function TodoList({ items }) {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.text}</li>)}
    </ul>
  );
}

// 사용
<TodoList items={[
  { id: 1, text: "할일 1" },
  { id: 2, text: "할일 2" }
]} />
```

### 이 JSX가 createVNode 호출로 어떻게 변환되나?

#### 1단계: map의 결과 
```javascript
items.map(item => <li key={item.id}>{item.text}</li>)
```
이 코드는 **배열**을 반환합니다:
```javascript
[
  createVNode("li", { key: 1 }, "할일 1"),
  createVNode("li", { key: 2 }, "할일 2")
]
```

#### 2단계: 전체 JSX 변환
```jsx
<ul>
  {items.map(item => <li key={item.id}>{item.text}</li>)}
</ul>
```

이것이 다음과 같이 변환됩니다:
```javascript
createVNode("ul", null, 
  [
    createVNode("li", { key: 1 }, "할일 1"),
    createVNode("li", { key: 2 }, "할일 2")
  ]
)
```

### 🚨 평탄화가 없으면 어떻게 될까?

```javascript
// children 파라미터로 들어오는 것:
children = [
  [
    createVNode("li", { key: 1 }, "할일 1"),
    createVNode("li", { key: 2 }, "할일 2")
  ]
]

// 최종 결과:
{
  type: "ul",
  props: {},
  children: [
    [
      { type: "li", props: { key: 1 }, children: "할일 1" },
      { type: "li", props: { key: 2 }, children: "할일 2" }
    ]
  ]
}
```

**문제점**: children이 `배열 안의 배열` 형태가 됨!

### ✅ 평탄화 후의 결과

```javascript
// 평탄화 적용 후:
{
  type: "ul",
  props: {},
  children: [
    { type: "li", props: { key: 1 }, children: "할일 1" },
    { type: "li", props: { key: 2 }, children: "할일 2" }
  ]
}
```

**결과**: children이 깔끔한 1차원 배열이 됨!

## 🔍 더 복잡한 예시

### 중첩된 배열 상황
```jsx
<div>
  텍스트
  {showItems && items.map(item => <span key={item.id}>{item.name}</span>)}
  더 많은 텍스트
  {showMoreItems && moreItems.map(item => <p key={item.id}>{item.content}</p>)}
</div>
```

### 변환된 createVNode 호출
```javascript
createVNode("div", null,
  "텍스트",
  showItems && [
    createVNode("span", { key: 1 }, "아이템 1"),
    createVNode("span", { key: 2 }, "아이템 2")
  ],
  "더 많은 텍스트",
  showMoreItems && [
    createVNode("p", { key: 3 }, "더 많은 내용 1"),
    createVNode("p", { key: 4 }, "더 많은 내용 2")
  ]
)
```

### 평탄화 전 children
```javascript
children = [
  "텍스트",
  [
    createVNode("span", { key: 1 }, "아이템 1"),
    createVNode("span", { key: 2 }, "아이템 2")
  ],
  "더 많은 텍스트",
  [
    createVNode("p", { key: 3 }, "더 많은 내용 1"),
    createVNode("p", { key: 4 }, "더 많은 내용 2")
  ]
]
```

### 평탄화 후 children
```javascript
children = [
  "텍스트",
  createVNode("span", { key: 1 }, "아이템 1"),
  createVNode("span", { key: 2 }, "아이템 2"),
  "더 많은 텍스트",
  createVNode("p", { key: 3 }, "더 많은 내용 1"),
  createVNode("p", { key: 4 }, "더 많은 내용 2")
]
```

## 💡 평탄화 함수 동작 원리

### 현재 구현된 코드
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

### 단계별 실행 과정

#### 입력 데이터
```javascript
children = ["텍스트", ["span1", "span2"], "더 많은 텍스트"]
```

#### 실행 과정
1. **첫 번째 반복**: `child = "텍스트"`
   - 배열이 아니므로 `result.push("텍스트")`
   - `result = ["텍스트"]`

2. **두 번째 반복**: `child = ["span1", "span2"]`
   - 배열이므로 `flattenChildren(["span1", "span2"])` 재귀 호출
   - 재귀 결과: `["span1", "span2"]`
   - `result.push(...["span1", "span2"])`
   - `result = ["텍스트", "span1", "span2"]`

3. **세 번째 반복**: `child = "더 많은 텍스트"`
   - 배열이 아니므로 `result.push("더 많은 텍스트")`
   - `result = ["텍스트", "span1", "span2", "더 많은 텍스트"]`

## 🎯 왜 이렇게 해야 하나?

### 1. **일관성**: 모든 children이 같은 구조를 가짐
```javascript
// 좋음: 일관된 구조
children = [item1, item2, item3]

// 나쁨: 중첩된 구조
children = [item1, [item2, item3], item4]
```

### 2. **처리 용이성**: 나중에 DOM을 생성할 때 간단함
```javascript
// 평탄화된 children 처리 (간단)
children.forEach(child => {
  parentElement.appendChild(createElement(child));
});

// 중첩된 children 처리 (복잡)
children.forEach(child => {
  if (Array.isArray(child)) {
    child.forEach(nestedChild => {
      parentElement.appendChild(createElement(nestedChild));
    });
  } else {
    parentElement.appendChild(createElement(child));
  }
});
```

### 3. **예측 가능성**: 개발자가 children 구조를 예측할 수 있음

## 🧪 실제 테스트로 확인

테스트에서 확인할 수 있는 케이스:
```javascript
it("자식 배열을 평탄화해야 한다", () => {
  const vNode = createVNode("div", null, ["Hello", ["world", "!"]]);
  expect(vNode.children).toEqual(["Hello", "world", "!"]);
});
```

이 테스트가 통과하려면 평탄화가 반드시 필요합니다!
