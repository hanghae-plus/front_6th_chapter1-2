# [Virtual DOM] key 없는 리스트 + index-기반 diff 로 인한 ‘뒤섞임’ 사례 복기

## 0. TL;DR

정렬을 바꾸고 새로고침했더니 상품 카드의 **이미지·텍스트·이벤트가 서로 뒤섞여** 보였다.
알고 보니 diff 알고리즘 자체가 고장난 게 아니라 **“key 없는 리스트를 index 기준으로만 매칭”** 하는 현재 구현의 한계를 그대로 드러낸 것이다.
따라서

1. **각 항목에 key 부여**
2. **diff 에 key 매칭 + DOM 이동 로직 추가**
   두 가지를 적용해 정상 동작을 확보했다.

---

## 1. 현상 & 재현 절차

1. `/` 페이지 상품 목록에서 ‘이름순’ 정렬 클릭 → 화면 즉시 정상 재배열.
2. 같은 URL 을 새로고침(F5) → 카드 A 자리엔 이미지 B, 텍스트 C … UI 뒤섞임.
3. DevTools Elements 탭을 보면 DOM 노드는 재사용됐지만, **잘못된 vNode ↔ DOM 매칭**으로 내용이 달라짐.

```jsx
// 정렬 옵션 변경
<ProductList products={sortedProducts} />
```

---

## 2. 원인 분석

| 구분            | 내용                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------- |
| 리스트 구조     | `<ProductCard />` 여러 개를 그리드로 렌더링                                                       |
| diff 전략(기존) | 자식 배열을 **index 동일성**만으로 비교·패치                                                      |
| 문제 조건       | ① 항목마다 key 없음 ② 위치 이동 발생                                                              |
| 결과            | 위치가 바뀐 노드도 “같은 index” 라고 판단→ DOM 은 그대로 두고 **내용만 바꿔치기** → 시각적 뒤섞임 |

> 요컨대 **keyless 리스트 + index-only diff** = 잘못된 매칭 가능성 O.

---

## 3. 해결 단계

### 3-1 컴포넌트에 key 부여

```jsx
{
  products.map((p) => <ProductCard key={p.productId} {...p} />);
}
```

### 3-2 diff 알고리즘 개선 (`src/lib/updateElement.js`)

1. 자식 노드를 순회해 **`key → {vnode, dom}` Map** 구축.
2. 새 리스트 순회 중
   • 같은 key 존재 → 필요 시 `insertBefore` 로 DOM 재배치 + 재귀 diff.
   • key 미존재 → 새 노드 생성.
3. old 리스트에만 있던 key 는 DOM 제거.

> 핵심 코드

```38:92:src/lib/updateElement.js
const oldKeyMap = new Map();
oldChildren.forEach((c, i) => oldKeyMap.set(getKey(c,i), { vnode:c, dom: existingDom.childNodes[i] }));
...
if (match) {
  if (match.dom !== desiredPos) existingDom.insertBefore(match.dom, desiredPos);
  updateElement(existingDom, child, match.vnode, nextIdx);
} else {
  updateElement(existingDom, child, undefined, nextIdx);
}
```

---

## 4. 결과 검증

- 정렬 변경 후 새로고침해도 카드 순서·내용·이벤트 일관성 유지.
- 기존 테스트 + 수동 QA 모두 통과.

---

## 5. 회고 / 배운 점

1. **key 는 필수 UX 안전장치**: 위치가 바뀌는 리스트라면 반드시 고유 key 제공.
2. **index-only diff 는 빠르지만 불안정**: 이동이 빈번한 리스트엔 부적합.
3. UI 버그는 종종 “알고리즘 버그” 보다 “제한 사항을 간과” 해서 생긴다.
4. 테스트가 녹색이어도, 실제 사용자 플로우에서 edge-case 가 존재할 수 있으니 **시나리오 기반 QA** 가 중요.
