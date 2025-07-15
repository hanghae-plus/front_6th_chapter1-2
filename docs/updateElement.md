# updateElement 함수 정리

## 1. updateElement란?

updateElement 함수는 기존의 실제 DOM 요소(oldEl)와 새로운 가상 DOM(newVNode)을 비교(diff)하여, 변경된 부분만 최소한으로 실제 DOM에 반영하는 역할을 합니다. React의 reconciliation(조화)과 유사한 핵심 로직입니다.

---

## 2. 왜 필요한가?

- 전체 DOM을 매번 새로 그리면 성능 저하와 깜빡임이 발생합니다.
- updateElement는 변경된 부분만 찾아서 DOM을 갱신하므로, 효율적이고 부드러운 UI 업데이트가 가능합니다.
- 배열, 중첩 구조, 속성/이벤트/boolean prop 등 다양한 변경 상황을 최적화할 수 있습니다.

---

## 3. 주요 동작 원리 및 코드별 설명

### 1) 입력값

- oldEl: 기존의 실제 DOM 요소
- newVNode: 새롭게 그릴 가상 DOM 객체

### 2) 타입 비교 및 교체

- oldEl과 newVNode의 타입이 다르면, 새로 생성한 요소로 교체
- 타입이 같으면, 속성/이벤트/boolean prop만 갱신

### 3) 속성/이벤트/boolean prop 갱신

- updateAttributes로 속성/이벤트/boolean prop을 비교하여 추가/수정/제거
- **checked, selected: property만 true/false로 설정, attribute는 제거**
- **disabled: property와 attribute 모두 true/false로 설정**
- **readOnly: property는 readOnly, attribute는 readonly로 설정**

### 4) 자식 노드 diff

- 자식 배열의 길이, 순서, key 등을 비교하여 최소한만 추가/제거/갱신
- **초과하는 자식은 역순으로 제거하여 DOM 인덱스 오류 방지**
- 중첩 구조, 빈 배열, 역순 제거 등 다양한 케이스 처리

### 5) 함수형 컴포넌트/중첩 컴포넌트 지원

- 컴포넌트의 props가 바뀌면 필요한 부분만 갱신

### 6) renderElement와의 연동

- renderElement에서 이전 vNode와 비교하여 updateElement를 호출함으로써, 효율적인 업데이트가 가능함

---

## 4. 결론

updateElement는 가상 DOM 기반 UI에서 효율적이고 부드러운 업데이트를 실현하는 핵심 함수입니다. 타입/속성/자식/컴포넌트 등 다양한 변경 상황을 최소한의 DOM 조작으로 처리하여, 최적의 사용자 경험을 제공합니다.
