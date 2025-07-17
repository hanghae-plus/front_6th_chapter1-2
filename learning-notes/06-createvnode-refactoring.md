# createVNode 리팩토링 검토

## 📝 제안된 코드 분석

```javascript
export function createVNode(type, props, ...children) {
  // children 배열을 평탄화하고 정리
  const flattenedChildren = children
    .flat(Infinity)
    .filter((child) => child != null && child !== false && child !== true);

  // props가 null이면 빈 객체로 초기화
  const normalizedProps = props || null;

  // vNode 객체 생성
  return {
    type,
    props: normalizedProps,
    children: flattenedChildren,
  };
}
```

## ⚠️ 기존 테스트와의 차이점

### 1. children 처리 방식 변경

**기존**:

- 자식이 1개 → 문자열/객체 직접
- 자식이 여러 개 → 배열

**제안된 코드**:

- 항상 배열로 반환

### 2. falsy 값 필터링 추가

**제안된 코드**: `null`, `false`, `true` 제거
**기존**: 모든 값 유지

### 3. props 처리 변경

**기존**: `props || {}`
**제안된 코드**: `props || null`

## 🧪 테스트 영향 확인

### 실패할 가능성이 있는 테스트:

```javascript
// 기존 테스트 기대값
const vNode = createVNode("div", { id: "test" }, "Hello");
expect(vNode.children).toBe("Hello"); // 문자열 기대

// 제안된 코드 결과
expect(vNode.children).toEqual(["Hello"]); // 배열로 변경됨
```

## 💡 수정 제안

테스트를 통과하려면:

```javascript
export function createVNode(type, props, ...children) {
  const flattenedChildren = children.flat(Infinity);

  return {
    type,
    props: props || {},
    children: flattenedChildren.length === 1 ? flattenedChildren[0] : flattenedChildren,
  };
}
```

이렇게 하면:

- ✅ 코드가 간결해짐 (`flat(Infinity)` 사용)
- ✅ 기존 테스트 통과
- ✅ 의도한 리팩토링 목표 달성
