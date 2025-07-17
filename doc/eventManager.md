# eventManager

이벤트를 위임하는 eventManager 를 구현한다.

- [테스트 진행 하기](#test-case)
- [eventManager 의 역할](#eventManager-role)

<a id="test-case"></a>

## 테스트 진행 하기

```js
let container;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
});
```
>각 테스트 전/후 실행됩니다.

### 이벤트가 위임 방식으로 등록되어야 한다

```js
it("이벤트가 위임 방식으로 등록되어야 한다", () => {
  const clickHandler = vi.fn();
  const button = document.createElement("button");
  container.appendChild(button);

  addEvent(button, "click", clickHandler);
  setupEventListeners(container);
  button.click();

  expect(clickHandler).toHaveBeenCalledTimes(1);

  const handleClick = (e) => e.stopPropagation();
  button.addEventListener("click", handleClick);
  button.click();
  expect(clickHandler).toHaveBeenCalledTimes(1);

  expect(clickHandler).toHaveBeenCalledTimes(1);
  button.removeEventListener("click", handleClick);
  button.click();
  expect(clickHandler).toHaveBeenCalledTimes(2);
});
```

button 을 클릭했을 때 이벤트가 정상적으로 수신 되어야 한다. stopPropagation 매서드를 사용해 버블링을 막은 경우 이벤트가 수신 되지 않아야 한다. 

```js
const events = {};

export function setupEventListeners(root) {
  for (const eventType in events) {
    root.addEventListener(eventType, (e) => {
      events[eventType].forEach(({ element, handler }) => {
        if (element.contains(e.target)) {
          handler(e);
        }
      });
    });
  }
}

export function addEvent(element, eventType, handler) {
  events[eventType] ??= new Set();
  events[eventType].add({ element, handler });
}
```

타입별로 이벤트 타겟과 핸들러를 담는 구조를 만들어 준다.
이벤트가 발생하면 Set 을 순회하며 이벤트가 발생한 타겟이, 저장한 element 에 속하는지 확인한다. 만약 속한다면 handler 를 실행한다.

이벤트리스너를 container 에 설정했기 때문에 버블링을 막으면 이벤트가 수신되지 않는다.

### 이벤트 핸들러가 제거되면 더 이상 호출되지 않아야 한다

```js
it("이벤트 핸들러가 제거되면 더 이상 호출되지 않아야 한다", () => {
  const clickHandler = vi.fn();
  const button = document.createElement("button");
  container.appendChild(button);

  addEvent(button, "click", clickHandler);
  setupEventListeners(container);
  button.click();
  expect(clickHandler).toHaveBeenCalledTimes(1);

  removeEvent(button, "click", clickHandler);
  button.click();

  expect(clickHandler).toHaveBeenCalledTimes(1);
});
```

removeEvent 를 실행하면 Set 에 저장한 값을 지워주자

```js
const events = {};

export function setupEventListeners(root) {
  for (const eventType in events) {
    root.addEventListener(eventType, (e) => {
      events[eventType].forEach(({ element, handler }) => {
        if (element.contains(e.target)) {
          handler(e);
        }
      });
    });
  }
}

export function addEvent(element, eventType, handler) {
  events[eventType] ??= new Set();
  events[eventType].add({ element, handler });
}

export function removeEvent(element, eventType, handler) {
  events[eventType]?.forEach((item) => {
    if (item.element === element && item.handler === handler) {
      events[eventType].delete(item);
    }
  });
}
```

<a id="eventManager-role"></a>

## eventManager 의 역할

메모리를 효율적으로 관리하고, 동적인 요소 변화에 쉽게 대응하도록 해준다.
이벤트 매니저의 역할을 이해하기 위해서 이벤트 버블링에 대해 알아본다.

### 이벤트 버블링

이벤트 버블링은 특정 요소에서 발생한 이벤트가 부모 요소로 전파되는 것을 의미한다.
button 을 클릭 했을 때 container 에서 이벤트를 수신할 수 있는 이유이다.

#### 이벤트 버블링의 장점

- 이벤트리스너를 이벤트가 발생하는 모든 요소에 설정하지 않아도 된다. 메모리를 효율적으로 사용할 수 있게 해준다.
- 동적인 요소에 대응하기 좋다. 리렌더링을 통해 요소가 변경되는 경우 이벤트리스너를 다시 설정해줘야 한다. 상위 요소에 이벤트리스너를 설정하는 경우 리렌더링이 발생했을 때 관리해야 할 포인트가 줄어든다.

> 이벤트 캡쳐는 버블링과는 반대로 자식 요소로 전파된다.
> 이벤트리스너에서 캡쳐를 수신하는 건 기본적으로 비활성화 되어있고 사용을 원하면 설정이 필요하다.
> 이벤트 전파는 blur, focus 와 같이 일부 이벤트를 제외하고 대부분의 이벤트에 적용 된다.