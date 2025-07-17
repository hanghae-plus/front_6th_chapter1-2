# createVNode 다른 버전 비교 분석

## 📋 제안된 새로운 코드 분석

```javascript
export function createVNode(type, props, ...children) {
  // 재귀적으로 배열을 평탄화하고 null, undefined, boolean 값을 필터링하는 함수
  const flattenChildren = (arr) => {
    return arr.reduce((flat, item) => {
      if (item == null || typeof item === "boolean") {
        return flat;
      }
      if (Array.isArray(item)) {
        return flat.concat(flattenChildren(item));
      }
      return flat.concat(item);
    }, []);
  };

  return {
    type,
    props,
    children: flattenChildren(children),
  };
}
```

## 🔍 기존 코드와의 주요 차이점

### 1. **children 구조 변경**

**현재 코드**:

```javascript
// 자식이 1개면 직접 값, 여러 개면 배열
children: flattenedChildren.length === 1 ? flattenedChildren[0] : flattenedChildren;
```

**제안된 코드**:

```javascript
// 항상 배열로 반환
children: flattenChildren(children);
```

### 2. **falsy 값 처리 시점**

**현재**: `normalizeVNode`에서 처리
**제안된 코드**: `createVNode`에서 미리 필터링

### 3. **props 처리**

**현재**: `props || {}` (null이면 빈 객체)
**제안된 코드**: `props` 그대로 (null 허용)

## ⚠️ 기존 테스트와의 호환성 문제

### 실패할 가능성이 있는 테스트들:

#### 1. children 구조 테스트

```javascript
// 기존 테스트
const vNode = createVNode("div", { id: "test" }, "Hello");
expect(vNode.children).toBe("Hello"); // 문자열 기대

// 제안된 코드 결과
expect(vNode.children).toEqual(["Hello"]); // 배열로 반환됨 ❌
```

#### 2. props null 테스트

```javascript
// 기존 테스트
const vNode = createVNode("div", null, "Hello");
expect(vNode.props).toEqual({}); // 빈 객체 기대

// 제안된 코드 결과
expect(vNode.props).toBe(null); // null 그대로 ❌
```

#### 3. falsy 값 처리

```javascript
// 기존: normalizeVNode에서 처리하므로 createVNode에서는 유지
createVNode("div", null, null, "Hello", false);
// 현재: children = [null, "Hello", false]
// 제안: children = ["Hello"] (falsy 값 제거됨)
```

## 💡 어떤 방향을 선택할까?

### Option 1: 기존 테스트 호환성 유지 (현재 코드)

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

### Option 2: 새로운 접근 방식 (제안된 코드)

- 더 명확한 책임 분리
- createVNode에서 정리 작업까지
- 하지만 기존 테스트 수정 필요

## 🤔 추천 사항

기존 테스트가 있는 상황에서는 **Option 1 (현재 코드)**를 유지하는 것이 좋습니다.

이유:

1. **테스트 호환성**: 기존 테스트가 모두 통과
2. **역할 분리**: createVNode는 구조 생성, normalizeVNode는 정리 작업
3. **점진적 개선**: 나중에 필요하면 단계적으로 변경 가능
