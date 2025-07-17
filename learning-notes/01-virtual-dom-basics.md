# Virtual DOM 기초 개념

## 🤔 Virtual DOM이 뭔가요?

### 일반적인 DOM 조작의 문제
```javascript
// 이런 식으로 DOM을 직접 조작하면
const div = document.createElement('div');
div.id = 'test';
div.textContent = 'Hello';
document.body.appendChild(div);

// 나중에 내용을 바꾸려면
div.textContent = 'Hello World';
```

**문제점:**
- DOM 조작은 비싸다 (느리다)
- 복잡한 UI에서는 어디서 변경이 일어났는지 추적하기 어렵다
- 직접 DOM을 건드리면 버그가 생기기 쉽다

### Virtual DOM의 아이디어
```javascript
// 실제 DOM 대신 JavaScript 객체로 표현
const virtualDiv = {
  type: 'div',
  props: { id: 'test' },
  children: ['Hello']
};

// 변경이 필요하면 새로운 객체 생성
const newVirtualDiv = {
  type: 'div',
  props: { id: 'test' },
  children: ['Hello World']
};

// 그 다음에 차이점만 실제 DOM에 반영
```

## 🎯 Virtual DOM 시스템의 구성 요소

1. **createVNode**: JSX를 Virtual DOM 객체로 변환
2. **normalizeVNode**: 컴포넌트를 일반 vNode로 변환
3. **createElement**: Virtual DOM을 실제 DOM으로 변환
4. **updateElement**: 기존 DOM과 새 Virtual DOM을 비교해서 변경된 부분만 업데이트
5. **renderElement**: 전체 렌더링 프로세스 관리
6. **eventManager**: 이벤트 위임 방식으로 효율적인 이벤트 처리

## 🔄 Virtual DOM 플로우

```
JSX → createVNode → normalizeVNode → createElement/updateElement → Real DOM
```

1. JSX가 createVNode 함수 호출로 변환됨
2. createVNode가 Virtual DOM 객체 생성
3. normalizeVNode가 컴포넌트를 일반 vNode로 정규화
4. createElement가 Virtual DOM을 실제 DOM으로 변환 (첫 렌더링)
5. updateElement가 기존 DOM과 비교해서 필요한 부분만 업데이트 (재렌더링)
