# normalizeVNode 완성!

## ✅ 구현된 모든 기능

### 1. Falsy 값 처리

```javascript
normalizeVNode(null); // → ""
normalizeVNode(undefined); // → ""
normalizeVNode(true); // → ""
normalizeVNode(false); // → ""
```

### 2. 타입 변환

```javascript
normalizeVNode(123); // → "123"
normalizeVNode("hello"); // → "hello"
```

### 3. 함수형 컴포넌트 실행

```javascript
const MyComponent = ({ children }) => <div>{children}</div>;
normalizeVNode(<MyComponent>Hello</MyComponent>);
// → { type: "div", props: {}, children: "Hello" }
```

### 4. 배열 정규화

```javascript
normalizeVNode([null, "Hello", false, "World"]);
// → ["Hello", "World"] (falsy 값 제거됨)
```

### 5. children 정규화

```javascript
normalizeVNode(
  <div>
    유효한 값{null}
    {undefined}
    {false}
    <span>자식 노드</span>
  </div>,
);
// falsy 값들이 제거되고 각 child가 정규화됨
```

## 🔄 normalizeVNode의 역할

**Before (raw vNode)**:

```javascript
{
  type: MyComponent,
  props: { title: "Hello" },
  children: [null, "text", false, otherComponent]
}
```

**After (normalized vNode)**:

```javascript
{
  type: "div",           // 컴포넌트가 실행되어 일반 태그로 변환
  props: {},
  children: ["text", normalizedOtherComponent] // falsy 값 제거, 재귀 정규화
}
```

## 🎯 다음 단계: createElement

이제 normalizeVNode가 완성되었으니, 다음은 **createElement**를 구현해서 정규화된 vNode를 실제 DOM 요소로 변환해야 합니다!

createElement가 하는 일:

- 문자열/숫자 → TextNode
- vNode 객체 → HTML Element
- 배열 → DocumentFragment
- props를 실제 DOM 속성으로 설정
- 이벤트 핸들러 등록
