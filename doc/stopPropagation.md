# 이벤트매니저 stopPropagation 고려하기

이벤트를 메모리 효율적으로 관리하기 위해 최상위 객체에 이벤트리스너를 설정할 수 있다.

이때 발생하는 문제들

### 셀렉터만 이용해 구분을 하는 경우

1주차 과제에서는 셀렉터를 이용해 이벤트가 발생한 요소와, 이벤트를 등록한 요소를 비교했다.

```js
$root.addEventListener(eventType, (e) => {
  for( 저장한 셀렉터와 핸들러 쌍들.. ) {
    if(e.target.closest(셀렉터)) {
      핸들러(e)
    }
  }
});
```

eventType 에 해당하는 셀렉터와 핸들러 쌍을 배열이나, Set에 저장한 다음 반복문을 돌며 이벤트가 발생한 요소가 셀렉터와 같거나 자식 요소이면 핸들러를 실행하는 방식이다.

>[MDN Element.closest()](https://developer.mozilla.org/ko/docs/Web/API/Element/closest)

이 방식에선 문제가 있었는데, 중첩된 요소에 같은 eventType 에 해당하는 이벤트가 등록되면 중복 호출된다는 점이다.

```html
<!-- 상품카드에 클릭 이벤트 설정 -->
<div id="상품카드">
  <img src="..." />
  <h3>...</h3>
  <!-- 장바구니담기 버튼에 클릭 이벤트 설정 -->
  <button type="button" id="장바구니담기">장바구니 담기</button>
</div>
```

```js
$root.addEventListener(eventType, (e) => {
  for( 저장한 셀렉터와 핸들러 쌍들.. ) {
    if(e.target.closest(셀렉터)) {
      /**
       * 장바구니담기 버튼을 클릭했을 때 
       * 상품카드와, 장바구니담기 핸들러 모두 실행된다.
       */
      핸들러(e)
    }
  }
});
```

자식 요소를 배열의 앞쪽에 위치시키고, 조건을 만족하는 경우 반복문에서 빠져 나온다면 중복 호출은 방지할 수 있다. 단점은 페이지 전체가 렌더링 되지 않고, 일부만 변경되는 경우 배열의 순서를 지키기 어렵다 생각한다. 또한 id를 제외한 값은 중복이 가능하기 때문에 셀렉터 만으로 부모-자식 관계를 알기 어렵다.

### 요소를 키로 사용하기

2주차 과제에선 요소를 키로 사용하는 방법을 사용했다.
요소를 키로 사용하는 방법의 장점은 여러 요소가 있을 때 부모-자식 관계가 명확해 진다는 점이다.

우선 1주차와 같은 형태로 코드를 작성한다.

```js
$root.addEventListener(eventType, (e) => {
  for (const [element, handler] of eventsRecord[eventType]) {
    if (element.contains(e.target)) {
      handler(e);
    }
  }
});
```

이벤트 처리에 필요한 요소를 정렬하는 기능을 추가한다.

```js
function getDeepestContainingElements(target, eventsMap) {
  return Array.from(eventsMap)
    // 저장한 element 가 e.target 과 같거나 부모인 경우만 필터링 한다.
    .filter(([element]) => element.contains(target))
    .sort((a, b) => {
      // 자식 요소가 앞으로 오도록 정렬한다.
      const aElement = a[0];
      const bElement = b[0];

      if (aElement.contains(bElement)) {
        return 1;
      }

      if (bElement.contains(aElement)) {
        return -1;
      }

      return 0;
    });
}
```

stopPropagation 매서드와 동일한 역할을 할 수 있도록 새로운 값을 덮어썼다.

```js
$root.addEventListener(eventType, (e) => {
  let isStopped = false;
  Object.defineProperty(e, "stopPropagation", {
    value: () => {
      isStopped = true;
    },
  });

  const deepestElements = getDeepestContainingElements(e.target, eventsRecord[eventType]);
  for (const [, handler] of deepestElements) {
    if (isStopped) {
      // 자식 요소에서 stopPropagation 매서드를 호출한 경우 부모 요소의 핸들러 실행을 멈춘다.
      break;
    }

    handler(e);
  }
});
```
