# [Virtual DOM] normalizeVNode 구현 학습 노트

## 필요성

`createVNode` 가 만든 vNode 트리는 아직 **불완전**하다. 조건부로 삽입된 `false`, `undefined` 나 함수형 컴포넌트·숫자·배열 등의 **다양한 타입**이 섞여 있어 DOM 으로 직행할 수 없다.

- `normalizeVNode` 는 트리를 한 번 더 살펴 **빈 값 제거**, **컴포넌트 언래핑**, **텍스트/숫자 정규화** 작업을 수행한다.
- 이를 통해 `createElement` 단계에서 **일관된 타입 가정**(문자열/객체) 을 할 수 있어, 구현이 단순해지고 렌더 속도가 빨라진다.
- React 의 `React.createElement` 호출 후 내부적으로 수행되는 flatten/normalize 로직과 유사한 역할.

즉, `createVNode` 가 **“구조를 만들고”**, `normalizeVNode` 가 **“정리 및 청소”** 를 담당하며, 두 함수는 Virtual DOM 의 **전처리 듀오**이다.

## 1. 배운 것

가상 돔 노드를 렌더링 가능한 형태로 정규화(normalize)하는 함수를 작성했다.

## 2. 요구 사항 다시보기

```
function normalizeVNode(vNode) => NormalizedVNode
```

- `null | undefined | boolean` → "" (빈 문자열)
- 숫자 → 문자열 (루트에서 변환)
- 배열 → 재귀 정규화 후 평탄화
- 함수형 컴포넌트 → 실행 결과를 정규화
- 자식에서 빈 문자열(child === "") 제거

## 3. 구현 포인트 & 삽질 기록

1. **원시 값 처리**
   - 빈 문자열 반환으로 테스트 통과.
2. **숫자 처리 위치**
   - 루트(`isRoot=true`)에서만 문자열 변환. 그렇지 않으면 `<li>Item {index}: {n}</li>` 케이스가 깨짐.
3. **함수형 컴포넌트 언래핑**
   - `type` 이 함수이면 `type(props)` 호출 후 결과를 normalize.
4. **자식 정규화**
   - 깊이 평탄화(`flat(Infinity)`) + 재귀 노멀라이즈 + falsy 필터.
