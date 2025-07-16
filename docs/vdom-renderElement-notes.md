# [Virtual DOM] renderElement 구현 학습 노트

## 필요성

`renderElement` 는 **Virtual DOM의 메인 진입점**으로, 사용자에게는 `renderElement(<App />, root)` 단 한 줄의 API를 제공한다.

- 파이프라인 오케스트레이션: `normalizeVNode → (초기) createElement / (이후) updateElement → setupEventListeners`.
- React 의 `ReactDOM.render`(v17) · `createRoot().render`(v18) 포지션과 동일.

## 1. 배운 것

- 컨테이너별 이전 vNode 보존: `WeakMap<container, prevVNode>` 로 누수 없이 상태 저장.
- **초기 마운트 vs 업데이트** 분기.
- `replaceChildren` 로 기존 DOM 일괄 교체해 reflow 최소화.
- DOM이 완성된 후 `setupEventListeners` 호출하여 위임 리스너 설정.

## 2. 요구 사항 다시보기

```
function renderElement(vNode, container): void
```

1. 첫 호출: vNode → DOM 생성(`createElement`) 후 `container` 내부 교체.
2. 이후 호출: (현재 버전) 전체 DOM 재생성. _추후 diff 알고리즘 도입 시 `updateElement` 로 최소 패치_.
3. 렌더 완료 후 `setupEventListeners(container)` 로 이벤트 위임 초기화.
4. 컨테이너마다 직전 vNode 를 저장해 다음 렌더 비교에 활용.

## 3. 구현 포인트 & 삽질 기록

1. **WeakMap vs Map**
   - 루트 노드가 DOM에서 제거되면 GC 가 가능해야 하므로 WeakMap 선택.
2. **전체 재렌더 전략**
   - 과제 스펙에선 성능 이슈가 작아 `createElement` 재호출이 간단.
   - diff 알고리즘 준비를 위해 `updateElement` 를 주석으로 남겨 둠.
3. **replaceChildren vs innerHTML**
   - 문자열 템플릿 사용 없이 Node 를 직접 넣어 *XSS 안전*하며, reflow 1회.
4. **버그 경험**
   - 이벤트 위임을 DOM 교체 이전에 호출하면 target 요소가 없어 spy 가 실패 → 순서 중요!
