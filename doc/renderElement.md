# renderElement

JSX 를 렌더링 하는 renderElement 함수를 구현 한다.

- [renderElement 함수 구현 하기](#renderElement)
- [renderElement 의 역할](#renderElement-role)

<a id="renderElement"></a>

## renderElement 함수 구현 하기

```js
export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.

  cleanupEventListeners();
  const $el = createElement(normalizeVNode(vNode));
  container.innerHTML = "";
  container.appendChild($el);
  setupEventListeners(container);
}
```

renderElement 함수는 이전에 만든 함수들을 조합하는 함수이다.
이전에 만든 함수를  JSX -> createVNode -> normalizeVNode -> createElement 과정으로 실행을 해준다. 실행 결과 완성된 Element 를 container 에 추가한다. 이 과정 전/후로 이벤트를 초기화/설정 해준다.

> createVNode 함수가 renderElement 함수 내에 포함되지 않은 이유는 컴파일 단게에서 수행이 된다.

renderElement 함수 구현 후 테스트를 진행하면 실패하는 케이스가 발생한다. 테스트 통과를 위해 이전에 작업한 함수들을 일부 수정해줘야 한다.

> - [버블링이 발생하지 않는 이벤트 예외처리 추가](https://github.com/JiHoon-0330/front_6th_chapter1-2/issues/5)
> - [이벤트 설정을 초기화하는 cleanupEventListeners 함수 구현](https://github.com/JiHoon-0330/front_6th_chapter1-2/issues/6)
> - [props 에 포함된 이벤트 설정하기](https://github.com/JiHoon-0330/front_6th_chapter1-2/issues/7)

<a id="renderElement-role"></a>

## renderElement 의 역할

renderElement 는 JSX 를 올바른 위치에 렌더링 되도록 하는 함수이다.
이 과정에서 가상 돔을 표준화, DOM Element 로 생성, 이벤트 등록/초기화 와 같은 일들이 필요하다.