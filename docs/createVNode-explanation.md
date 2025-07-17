# createVNode.js 완전 분석

## 🎯 함수의 목적

**JSX 문법을 Virtual DOM 객체로 변환하는 핵심 함수**

```javascript
// JSX (개발자가 작성)
<div className="hello">
  <h1>안녕하세요</h1>
  <p>반갑습니다</p>
</div>

// ↓ Babel이 변환 ↓

// JavaScript 함수 호출
createVNode('div', { className: 'hello' },
  createVNode('h1', null, '안녕하세요'),
  createVNode('p', null, '반갑습니다')
)

// ↓ createVNode 실행 결과 ↓

// Virtual DOM 객체
{
  type: 'div',
  props: { className: 'hello' },
  children: [
    { type: 'h1', props: {}, children: ['안녕하세요'] },
    { type: 'p', props: {}, children: ['반갑습니다'] }
  ]
}
```

## 📝 함수 파라미터

```javascript
export function createVNode(type, props, ...children) {
```

- **`type`**: HTML 태그명 ('div', 'h1') 또는 컴포넌트 함수
- **`props`**: 엘리먼트 속성들 ({ className: 'hello', id: 'test' })
- **`...children`**: 자식 노드들 (여러 개 가능, 스프레드 문법)

## 🔄 1단계: 배열 평탄화 (Flattening)

```javascript
const flattenedChildren = children.flat(Infinity);
```

### 왜 필요한가?

JSX에서 `map()` 사용 시 중첩 배열이 생성됨:

```jsx
// 이런 JSX
<div>
  {categories.map((category) =>
    items.map((item) => (
      <span key={item}>
        {category}: {item}
      </span>
    )),
  )}
</div>;

// children 배열이 이렇게 됨
children = [
  [<span>과일: 사과</span>, <span>과일: 바나나</span>],
  [<span>채소: 당근</span>, <span>채소: 양파</span>],
][
  // flat(Infinity) 후
  ((<span>과일: 사과</span>), (<span>과일: 바나나</span>), (<span>채소: 당근</span>), (<span>채소: 양파</span>))
];
```

### `Infinity`를 쓰는 이유

```javascript
const nested = [1, [2, [3, [4, 5]]]];

// 레벨별 비교
nested.flat(1); // [1, 2, [3, [4, 5]]]     - 1단계만
nested.flat(2); // [1, 2, 3, [4, 5]]       - 2단계까지
nested.flat(3); // [1, 2, 3, 4, 5]         - 3단계까지
nested.flat(Infinity); // [1, 2, 3, 4, 5]         - 모든 단계
```

**`Infinity`의 특수 성질**:

- `Infinity > 0` → 항상 `true`
- `Infinity - 1` → 여전히 `Infinity`
- 결과: 아무리 깊게 중첩되어도 완전히 평탄화

### 재귀 과정 시각화

```javascript
// flat(Infinity) 내부 동작
function flattenRecursive(arr, depth) {
  const result = [];
  for (let item of arr) {
    if (Array.isArray(item) && depth > 0) {
      // 배열이면 재귀 호출
      result.push(...flattenRecursive(item, depth - 1));
    } else {
      // 배열이 아니면 결과에 추가
      result.push(item);
    }
  }
  return result;
}

// [1, [2, [3]]] 처리 과정:
// 1단계: depth=Infinity, [1, [2, [3]]]
// 2단계: depth=Infinity, [2, [3]] (1은 결과에 추가)
// 3단계: depth=Infinity, [3] (2는 결과에 추가)
// 4단계: 3은 배열이 아니므로 결과에 추가, 종료
// 최종: [1, 2, 3]
```

## 🧹 2단계: Falsy 값 필터링

```javascript
const filteredChildren = flattenedChildren.filter(
  (child) => child !== null && child !== undefined && child !== false && child !== true,
);
```

### 왜 필요한가?

JSX 조건부 렌더링이 falsy 값을 만들어냄:

```jsx
function UserProfile({ user, isLoggedIn, showEmail }) {
  return (
    <div>
      <h1>프로필</h1>
      {isLoggedIn && <p>환영합니다!</p>} // false일 때 false
      {user?.name && <span>{user.name}</span>} // undefined일 때 undefined
      {showEmail ? <span>{user.email}</span> : null} // null 가능
    </div>
  );
}
```

### 문제 상황

```javascript
// user=null, isLoggedIn=false, showEmail=false일 때
const children = [
  "프로필",     // ✅ 정상 텍스트
  false,       // ❌ 조건부 렌더링 결과
  undefined,   // ❌ user?.name 결과
  null         // ❌ 삼항 연산자 결과
];

// 필터링 없이 DOM에 렌더링하면
<div>
  프로필
  false        <!-- ❌ 화면에 "false" 텍스트 표시 -->
  undefined    <!-- ❌ 화면에 "undefined" 텍스트 표시 -->
  null         <!-- ❌ 화면에 "null" 텍스트 표시 -->
</div>
```

### 필터링 결과

```javascript
// 필터링 후
const filteredChildren = ["프로필"]; // ✅ 깔끔!

// DOM 결과
<div>
  프로필       <!-- ✅ 원하는 결과만 표시 -->
</div>
```

### 각 falsy 값이 생기는 경우

```jsx
// null
{
  condition ? <Component /> : null;
}

// undefined
{
  user?.name && <span>{user.name}</span>;
}

// false
{
  isVisible && <div>내용</div>;
}

// true (거의 없지만 가능)
{
  isLoading || <div>완료</div>;
} // isLoading이 true면 true 반환
```

## 🏗️ 3단계: Virtual DOM 객체 생성

```javascript
return {
  type,
  props: props === undefined ? {} : props, // undefined만 빈 객체로, null은 null 유지
  children: filteredChildren,
};
```

### props 처리 로직

```javascript
// props가 undefined인 경우
<div>내용</div>  // props = undefined → {}

// props가 null인 경우
<div {...null}>내용</div>  // props = null → null (유지)

// props가 객체인 경우
<div className="test">내용</div>  // props = { className: "test" }
```

**왜 이렇게 처리하나?**

- `undefined`: JSX에서 props 없을 때의 기본값
- `null`: 명시적으로 null을 전달한 경우 (의도적)
- 구분해서 처리하여 개발자 의도 보존

## 🔄 전체 흐름 예시

```jsx
// 복잡한 JSX 예시
<div className="container">
  {users.map((user) => [
    user.isActive && <h3 key={user.id}>{user.name}</h3>,
    user.posts?.map((post) => (post.published ? <p key={post.id}>{post.title}</p> : null)),
  ])}
</div>
```

**1단계 - 함수 호출**:

```javascript
createVNode(
  "div",
  { className: "container" },
  // users.map 결과가 중첩 배열로 들어옴
  [
    [true, [<p>포스트1</p>, null, <p>포스트2</p>]],
    [false, [<p>포스트3</p>]],
  ],
);
```

**2단계 - 평탄화**:

```javascript
// children.flat(Infinity) 결과
[true, <p>포스트1</p>, null, <p>포스트2</p>, false, <p>포스트3</p>];
```

**3단계 - 필터링**:

```javascript
// filter 결과
[<p>포스트1</p>, <p>포스트2</p>, <p>포스트3</p>];
```

**4단계 - Virtual DOM 객체**:

```javascript
{
  type: 'div',
  props: { className: 'container' },
  children: [
    { type: 'p', props: {}, children: ['포스트1'] },
    { type: 'p', props: {}, children: ['포스트2'] },
    { type: 'p', props: {}, children: ['포스트3'] }
  ]
}
```

## 💡 핵심 포인트

### 1. **React 호환성**

- React와 동일한 방식으로 JSX 처리
- 조건부 렌더링 패턴 완벽 지원

### 2. **성능 최적화**

- `flat(Infinity)`: 한 번의 호출로 모든 중첩 해결
- `filter()`: 불필요한 값들 사전 제거

### 3. **개발자 경험**

- 예측 가능한 결과
- 조건부 렌더링 시 안전한 동작
- 디버깅 용이성

### 4. **확장성**

- 컴포넌트 함수도 type으로 받을 수 있음
- 다양한 JSX 패턴 지원

## 🧪 테스트 케이스

```javascript
// 기본 사용
createVNode("div", { className: "test" }, "hello");
// → { type: 'div', props: { className: 'test' }, children: ['hello'] }

// 중첩 배열
createVNode("div", null, ["a", ["b", ["c"]]]);
// → { type: 'div', props: {}, children: ['a', 'b', 'c'] }

// 조건부 렌더링
createVNode("div", null, true, false, null, undefined, "content");
// → { type: 'div', props: {}, children: ['content'] }

// 복합
createVNode(
  "ul",
  null,
  items.map((item) => item.visible && createVNode("li", null, item.name)),
);
// → 보이는 항목들만 li로 변환
```

이렇게 `createVNode`는 **JSX를 Virtual DOM으로 변환하는 핵심 엔진** 역할을 합니다! 🚀
