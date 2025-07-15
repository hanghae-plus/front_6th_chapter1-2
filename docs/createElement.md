# createElement 함수 정리

## 1. createElement란?

createElement 함수는 가상 DOM(Virtual DOM, VDom) 객체(vNode)를 실제 브라우저의 DOM 요소로 변환하는 역할을 합니다. React의 createElement와는 다르며, 실제로는 React의 render와 유사한 역할을 합니다.

---

## 2. 왜 필요한가?

- 가상 DOM 객체는 실제로 브라우저에 그릴 수 없으므로, 이를 실제 DOM 요소로 변환해야 합니다.
- createElement는 vNode 구조를 해석하여, 실제 DOM 노드(HTMLElement, TextNode 등)를 생성하고, 속성(props)과 이벤트를 바인딩합니다.
- 이 과정을 통해 선언적으로 작성한 UI가 실제로 브라우저에 렌더링됩니다.

---

## 3. 주요 동작 원리 및 코드별 설명

### 1) 입력값

- vNode: createVNode/normalizeVNode로 생성된 가상 DOM 객체 또는 텍스트/숫자 등

### 2) 타입별 처리

- **문자열/숫자:** 텍스트 노드로 변환
- **배열:** 여러 vNode를 DocumentFragment로 묶어 반환
- **vNode 객체:**
  - type이 문자열이면 해당 태그의 HTMLElement 생성
  - type이 함수(컴포넌트)면, normalizeVNode로 정규화 후 재귀적으로 처리

### 3) 속성(props) 및 이벤트 처리

- props를 DOM 요소에 속성/이벤트로 바인딩
- 예: className, id, data-\*, onClick 등
- **boolean prop 처리:**
  - checked, selected: property만 true/false로 설정, attribute는 제거
  - disabled: property와 attribute 모두 true/false로 설정
  - readOnly: property는 readOnly, attribute는 readonly로 설정

### 4) 자식(children) 처리

- children을 재귀적으로 createElement로 변환하여, 부모 요소에 append

---

## 4. 결론

createElement는 가상 DOM 객체를 실제 DOM 요소로 변환하여, 선언적 UI를 실제 브라우저에 그릴 수 있게 해줍니다. 타입별 분기, 속성/이벤트 바인딩, 자식 처리 등 다양한 입력에도 일관된 렌더링을 보장합니다.
