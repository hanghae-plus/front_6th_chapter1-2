# [Virtual DOM] createVNode 구현 학습 노트

## 필요성

가상 DOM 파이프라인의 **첫 단계**로, JSX(혹은 `h()` 형태)의 호출을 **순수 JavaScript 객체**로 직렬화한다.

- 렌더링 엔진은 DOM 대신 경량 객체(vNode)를 다루어 **계산 비용을 절감**한다.
- 이후 단계인 `normalizeVNode → createElement → renderElement` 가 **예측 가능한 데이터 구조**를 요구하므로, `createVNode` 는 최소 형태(`{ type, props, children }`)로 정제된 트리를 제공한다.
- React 의 `React.createElement` 와 대응되는 부분이며, 프레임워크 독립적인 **표준 인터페이스** 역할을 한다.

### 왜 굳이 DOM 을 바로 만들지 않고 vNode를 거칠까?

1. **비교(diff) 알고리즘의 재료**
   - Virtual DOM 의 핵심은 *변경점 계산*이다. 실제 DOM 은 노드 수십만 개를 순회하기 비싸지만, vNode 객체 트리는 메모리에 있어 **순수 함수**로 빠르게 비교할 수 있다.

2. **플랫폼 추상화**
   - 웹뿐만 아니라 _네이티브_·_캔버스_·_서버 사이드 렌더링(SSR)_ 등으로 확장할 때, vNode 구조만 유지하면 밑단(Renderer)만 교체해 재사용이 가능하다.

3. **불변성(Immutability)의 장점**
   - vNode 는 한 번 생성되면 수정하지 않는다. 이 불변성 덕분에 **시간 여행 디버깅**, **상태 스냅샷** 등의 개발 편의 기능이 쉽다.

4. **테스트 용이성**
   - DOM 대신 vNode 구조를 스냅샷으로 비교하면 **브라우저 환경 없이도** UI 로직을 단위 테스트할 수 있다. (본 프로젝트도 vitest로 vNode를 직접 비교)

5. **언어 레벨 최적화**
   - 컴파일러(Babel)는 JSX를 `createVNode` 호출로 변환하면서 **정적 분석**·**dead code elimination** 등을 적용할 수 있다. 즉, vNode 레이어가 있으면 빌드 타임 최적화 여지가 커진다.

> 요약: `createVNode` 는 _UI를 설명하는 선언적 데이터를 만들고_, 그 데이터를 중심으로 **성능 · 확장성 · 테스트성**을 모두 잡기 위한 출발점이다.

`normalizeVNode` 는 `createVNode` 가 반환한 트리를 받아 추가 정규화(텍스트 · 컴포넌트 처리 등)를 진행한다. 두 함수는 **연속된 파이프라인**으로 작동한다.

## 1. 배운 것

JSX → `createVNode` 호출 과정을 따라가며 가상 돔 노드를 만드는 함수를 작성했다.

## 2. 요구 사항 다시보기

```
function createVNode(type, props, ...children) {}
```

- **type**: 태그 이름 혹은 함수형 컴포넌트
- **props**: 속성 객체 (없으면 `null`)
- **children**: 가변 인자, 자식 노드들
- 반환 객체: `{ type, props, children }`

## 3. 구현 포인트 & 삽질 기록

1. **중첩 배열 평탄화**
   - `children.flat()` 은 한 단계만 평탄화 → `flat(Infinity)` 로 재귀적 평탄화 필요.
2. **렌더링 대상이 아닌 값 필터링**
   - `null`, `undefined`, `false`, `true` 는 실제 화면에 그려지지 않는다.
   - 조건부 렌더링(`false && <div/>`) 에서 `false` 가 넘어오는 버그 해결.
3. **props 기본값**
   - 테스트에서는 `props: null` 을 기대한다.
   - `props ?? null` 로 통일 (빈 객체 반환 시 deepEqual 실패 경험).
