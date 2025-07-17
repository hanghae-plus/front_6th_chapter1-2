## 과제 셀프회고

<!-- 과제에 대한 회고를 작성해주세요 -->

1주차 때 과제를 다 끝내고 회고를 진행하려고 하다 보니 내가 어떤 고민을 했고, 어떻게 해결하려고 글로 쓰려니 어려움을 느꼈다. 그래서 2주차 부터는 과제를 진행하면서 고민한 내용들을 그날 그날 적어보는 것을 목표로 했다.

[과제를 진행하면서 남겼던 글들](https://github.com/JiHoon-0330/front_6th_chapter1-2/issues)

마침 같은 팀인 정석님이 동기부여를 원하셔서 매일 학습 내용 적기를 공유하기도 했다.

실제로 매일 학습 내용을 공유해준 5팀 최고 👍

![TIL](https://velog.velcdn.com/images/jihoon0330/post/3d31515a-95c4-4368-8891-4df83b45f233/image.png)

기본 과제에선 테스트코드에 알맞은 코드를 작성하고, 작성하는 과정에서 JSX를 가상돔으로 만들기 위해 어떤 일들이 필요한지 학습을 하는 방향으로 공부를 진행했다. 코드를 작성하는 부분에서는 구현 난이도가 높지 않아 코드 스타일이나, 어떤 매서드를 사용할지와 같은 부분에 집중을 했다.

심화 과제는 생각보다 어렵게 느껴졌다. 비교를 해야 한다는 건 알았지만, children 값을 비교하고 DOM 에 적용시키는 부분이 조금 막막했던 것 같다. 개수가 다를 수 있는 부분과, 텍스트와 엘리먼트인 경우 어떻게 하면 좋을지? 텍스트인데 길이가 다른 경우 등등..

그래서 Gemini를 활용해 DOM 추가/변경/삭제 하는 API 목록을 얻어서 정리하는 시간을 가졌다.
심화 과제에서 엘리먼트 노드를 다루기 위해 필요한 매서드들은 `appendChild`, `removeChild`, `replaceChild` 3종류가 있었고, 리액트 처럼 목록을 key로 관리한다면 `insertBefore` 매서드가 추가로 필요할 것 같다.

추가/삭제/변경을 하는 코드를 작성하고, 유닛 테스트도 다 통과를 한 시점에 베이직에서 통과했던 e2e 테스트를 실패해 서비스를 실행해보니

![오류 이미지](https://velog.velcdn.com/images/jihoon0330/post/fe93884f-385b-4de7-b560-0bfe13775521/image.png)

총 {스켈레톤} 340개 와 같은 화면이 나왔다. 당황..

이후에도 아래와 같이 상품이 하나씩 보이는 오류가 있었다.

![오류 이미지2](https://velog.velcdn.com/images/jihoon0330/post/d5fdb5fb-d4f5-47ad-8601-bb20dd91101d/image.png)

이런 문제를 겪다 보니 심화 과제를 진행하면서 디버깅이 많이 익숙해졌다.

문제는 엘리먼트를 추가할 때 원래 위치보다 더 상위 요소에 추가를 하고 있었던 것과, newNode, oldNode 값이 존재하는지와 비교하는 과정에 빠트린 부분이 있는 것이 원인이었다.

심화 과제를 쉽게 푸는 팀원들을 보고 스스로 부족한 영역을 인지하게 된 것 같다. 개인적으로 이런 알고리즘 문제가 어려운 것 같다.

### 기술적 성장
<!-- 예시
- 새로 학습한 개념
- 기존 지식의 재발견/심화
- 구현 과정에서의 기술적 도전과 해결
-->

#### setAttribute 와 property

setAttribute 는 요소에 문자열로 된 값만을 설정할 수 있고, boolean 값을 다루는 속성의 경우 키 값의 존재 여부만 파악하기 때문에 setAttribute("disabled", "false"); 로 설정하면 disabled 값이 true 가 된다는 것을 과거엔 그냥 지나쳤던 것 같은데, 이번에 props 를 설정하면서 확실하게 알게 되었다. 추가적으로 요소 노드 인터페이스에 존재하는 값들은 setAttribute 를 사용하지 않고 설정하는 것이 권장되고, 성능이 더 좋다는 것도 알게 되었다.

> 테스트 코드 돌리면서 왜 실패하는지 파악하기 어려웠다.

#### XSS 공격

href, src 와 같이 URL 관련 속성을 사용할 때 XSS 공격을 주의해야 하는 것을 배웠다.
실행 가능한 자바스크립트 코드로 해석하고 실행하도록 설계 된 부분에 보안을 유지할 수 있는 장치를 추가해야 한다. 헌재 프로젝트에서는 href, src 값을 할당할 때 URL 생성자를 통해 올바른 url 만 설정할 수 있도록 설정했다.

> 추가로 알게 된 사실은 `data:image/png;base64` 형태의 값도 URL 생성자에 사용할 수 있다.
> css 에서 사용하는 url 값 에도 적용이 가능하다고 한다.

innerHTML 의 경우도 문자열을 파싱하는 과정에서 XSS 공격을 주의해야 한다. 단순히 텍스트를 설정하는 경우 textContent 를 사용하는 것이 좋다.

> 텍스트 노드를 생성할 때와, nodeValue 사용해 값을 할당 하는 것도 XSS 방어에 도움이 된다.

#### DOM 노드

이번에 DOM 노드를 다루면 좀 더 세밀한 제어가 가능한 것을 경험했다.
텍스트 노드 라는 것이 존재한다는 것은 알았지만, 보통 innerHTML 이나, textContent 같은 것들을 사용했는데 텍스트를 노드 단위로 조작하는 것을 경험하게 되었다.

추가적으로 알게 된 사실은 텍스트 노드를 생성할 때 `document.createTextNode()` 와 같은 방식으로 생성할 수도 있지만, `Text` 라는 생성자를 통해서도 직접 생성이 가능하다는 걸 알게 되었다. 이외에도 Element 노드를 제외한 다른 노드들도 생성자를 통해 생성이 가능했고, Element 노드의 경우 `document.createElement()` 매서드를 직접적으로 대체하는 생성자는 없다는 걸 알게 되었다.

> [The HTML DOM API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API) 페이지에서 목록에 있는 각 요소들을 들어가보면 생성자가 있는 요소와 없는 요소가 있는데, 아마 모든 요소의 생성자가 구현된 상태가 아니기 때문이 아닐까 추측된다.

#### 목록의 업데이트

현재 방식에선 목록을 업데이트 할 때 index 에 해당하는 값 끼리 비교를 해서 업데이트를 진행하는데, 최상단에 데이터가 추가된 경우 모든 목록을 새로 생성해야 하는 단점이 있었다. 리액트에서 배열을 사용해 렌더링을 할 때 key 값을 꼭 유니크하게 넣어줘야 하는 이유를 유추해 볼 수 있었다.

#### 버블링이 되지 않는 이벤트

focus, blur 와 같은 이벤트 들은 버블링을 지원하지 않는 걸 알게 되었다.
버블링을 사용하려면 `focusin` 같은 버블링을 지원하는 이벤트를 사용하거나, 캡쳐를 활성화 해 캡쳐링 단계에서 위임을 할 수 있다.


#### 이벤트매니저 stopPropagation 고려하기

이벤트를 메모리 효율적으로 관리하기 위해 최상위 객체에 이벤트리스너를 설정할 수 있다. 하지만 stopPropagation 와 같은 매서드를 사용하기 위해선 별도로 구현을 해주어야 한다.

1주차에선 셀렉터만을 이용해 이벤트 관리를 했는데, id 값 처럼 페이지에서 유일한 값을 사용하지 않으면 부모-자식 관계를 파악하기 어려웠고, stopPropagation 와 같은 매서드를 구현하는데 한계가 있다고 느꼈다.

>1주차 과제에서는 셀렉터를 이용해 이벤트가 발생한 요소와, 이벤트를 등록한 요소를 비교했다.
>eventType 에 해당하는 셀렉터와 핸들러 쌍을 배열이나, Set에 저장한 다음 반복문을 돌며 이벤트가 발생한 요소가 셀렉터와 같거나 자식 요소이면 핸들러를 실행하는 방식이다.
>이 방식에선 문제가 있었는데, 중첩된 요소에 같은 eventType 에 해당하는 이벤트가 등록되면 중복 호출된다는 점이다.
>
>```html
><!-- 상품카드에 클릭 이벤트 설정 -->
><div id="상품카드">
>  <img src="..." />
>  <h3>...</h3>
>  <!-- 장바구니담기 버튼에 클릭 이벤트 설정 -->
>  <button type="button" id="장바구니담기">장바구니 담기</button>
></div>
>```
>
>```js
>$root.addEventListener(eventType, (e) => {
>  for( "저장한 셀렉터와 핸들러 쌍들.." ) {
>    if(e.target.closest(셀렉터)) {
>      /**
>       * 장바구니담기 버튼을 클릭했을 때 
>       * 상품카드와, 장바구니담기 핸들러 모두 실행된다.
>       */
>      핸들러(e)
>    }
>  }
>});
>```
>자식 요소를 배열의 앞쪽에 위치시키고, 조건을 만족하는 경우 반복문에서 빠져 나온다면 중복 호출은 방지할 수 있다. 단점은 페이지 전체가 렌더링 되지 않고, 일부만 변경되는 경우 배열의 순서를 지키기 어렵다 생각한다. 또한 id를 제외한 값은 중복이 가능하기 때문에 셀렉터 만으로 부모-자식 관계를 알기 어렵다.

2주차 과제에선 요소를 키로 사용하는 방법을 사용했다. 요소를 키로 사용하는 방법의 장점은 여러 요소가 있을 때 부모-자식 관계가 명확해 진다는 점이다.

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

기존 stopPropagation 매서드와 동일한 역할을 할 수 있도록 새로운 값을 덮어썼다.

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

### 코드 품질
<!-- 예시
- 특히 만족스러운 구현
- 리팩토링이 필요한 부분
- 코드 설계 관련 고민과 결정
-->

#### createVNode 평탄화 구현하기

평탄화 이후 렌더링 가능한 항목만 필터링 하는 과정을 한 번의 순회를 통해 작업하고 싶었다.
검색 결과 `Array.flat` 매서드의 경우 속도가 느리다 라는 말이 있었다. 성능 밴치마크를 봤을 때 현재는 이 논의가 있던 시기보다는 개선이 된 것 같지만, 가상 돔에서 많은 배열을 다뤄야 한다면 성능에서 이점이 있을 거라 생각했다.

>네이티브 flat 보다 빠르다고 나와있는 es-toolkit 의 flatten 함수를 참고했다.
>[es-toolkit flatten 구현 코드](https://github.com/toss/es-toolkit/blob/main/src/array/flatten.ts)

```js
function flattenRenderableChildren(children) {
  const result = [];

  const flatten = (value) => {
    if (isNotRenderable(value)) {
      return;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        flatten(value[i]);
      }
    } else {
      result.push(value);
    }
  };

  flatten(children);
  return result;
}
```

#### createElement 요소 생성하기 (코드 스타일)

Element 노드를 생성할 때 `document.createElement()` 방식을 사용해야 하기 때문에, 다른 노드를 생성할 때도 document 매서드를 사용해 일관성을 지켰다. 개별 노드나, 생성자를 지원하는 엘리먼트를 다룰 땐 생성자를 사용해 볼 수 있을 것 같다.

#### 자식 요소 업데이트 하기 (개선이 필요한 부분)

updateElement 함수에서 vNode 의 children 값을 반복문으로 돌 때 요소를 삭제하는 경우 i 의 값을 유지하면서 maxChildrenLength 값을 줄이고 있는데, 나중에 다시 봤을 때 이 부분 코드가 이해하기 어려울 것 같다.

```js
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  ...

  // updateElement 함수 내부에서
  let i = 0;
  let maxChildrenLength = Math.max(newNode.children.length, oldNode.children.length);
  while (i < maxChildrenLength) {
    const newChild = newNode.children[i];
    const oldChild = oldNode.children[i];
    if (!newChild && oldChild) {
      // 삭제 한 다음 dom이 현재 i 값에 위치하기 때문에 증가시키지 않는다
      // 반복하는 횟수만 중요하기 때문에 i 값을 유지하면서 newChild, oldChild 에 할당하는 값은 신경쓰지 않음
      updateElement(currentDomNode, null, oldChild, i);
      maxChildrenLength -= 1;
    } else {
      updateElement(currentDomNode, newChild, oldChild, i);
      i += 1;
    }
  }
}
```

반복문을 아래와 같이 분리하면 조금 더 의도가 명확해 지는 것 같은데, 어떻게 생각하시나요?

```js
// 함수로 선언

function removeChildren(parent, newNode, oldNode) {
  const newChildrenLength = newNode.children.length;
  const oldChildrenLength = oldNode.children.length;

  if (newChildrenLength >= oldChildrenLength) {
    return;
  }

  const count = oldChildrenLength - newChildrenLength;
  for (let i = 0; i < count; i++) {
    parent.removeChild(parent.childNodes[newChildrenLength]);
  }
}

function updateChildren(parent, newNode, oldNode) {
  for (let i = 0; i < newNode.children.length; i++) {
    const newChild = newNode.children[i];
    const oldChild = oldNode.children[i];
    updateElement(parent, newChild, oldChild, i);
  }
}
```

### 학습 효과 분석
<!-- 예시
- 가장 큰 배움이 있었던 부분
- 추가 학습이 필요한 영역
- 실무 적용 가능성
-->

- 리액트를 사용하면 XSS 방어가 가능하다는 것을 막연하게 알고는 있었는데, 직접 돔을 조작하면서 내부적으로 신경써야 하는 점들을 알게 되었다.
- 이벤트 위임의 제약에 대해 생각해 볼 수 있었다. 리액트에선 이벤트 처리를 위해 어떤 방법을 사용하는지 추가 학습이 필요할 것 같다.

### 과제 피드백
<!-- 예시
- 과제에서 모호하거나 애매했던 부분
- 과제에서 좋았던 부분
-->

- 테스트 코드가 꼼꼼하게 되어있어서 좋았습니다.
- JSX 의 변환에 대해 생각해 볼 수 있어 좋았습니다.
- 과제를 진행하면서 리액트의 내부 동작에 대해 더 알아보고 싶다는 호기심이 생겨서 긍정적인 부분이라 생각합니다.

## 리뷰 받고 싶은 내용

<!--
피드백 받고 싶은 내용을 구체적으로 남겨주세요
모호한 요청은 피드백을 남기기 어렵습니다.

참고링크: https://chatgpt.com/share/675b6129-515c-8001-ba72-39d0fa4c7b62

모호한 요청의 예시)
- 코드 스타일에 대한 피드백 부탁드립니다.
- 코드 구조에 대한 피드백 부탁드립니다.
- 개념적인 오류에 대한 피드백 부탁드립니다.
- 추가 구현이 필요한 부분에 대한 피드백 부탁드립니다.

구체적인 요청의 예시)
- 현재 함수와 변수명을 보면 직관성이 떨어지는 것 같습니다. 함수와 변수를 더 명확하게 이름 지을 수 있는 방법에 대해 조언해주실 수 있나요?
- 현재 파일 단위로 코드가 분리되어 있지만, 모듈화나 계층화가 부족한 것 같습니다. 어떤 기준으로 클래스를 분리하거나 모듈화를 진행하면 유지보수에 도움이 될까요?
- MVC 패턴을 따르려고 했는데, 제가 구현한 구조가 MVC 원칙에 맞게 잘 구성되었는지 검토해주시고, 보완할 부분을 제안해주실 수 있을까요?
- 컴포넌트 간의 의존성이 높아져서 테스트하기 어려운 상황입니다. 의존성을 낮추고 테스트 가능성을 높이는 구조 개선 방안이 있을까요?
-->

성능을 고려하는 기준을 어떻게 잡으면 좋을까요? 과제에서 `flat().filter()` 두 번 순회하는 작업을 한 번 순회하는 작업으로 만들면서 이 부분에서는 이런 이유 떄문에 이렇게 작성해야 한다는 기준을 잡지는 못했습니다. 실무에서 함수 단위의 성능 개선을 위한 기준이 있으신가요?

>```js
>function flattenRenderableChildren(children) {
>  const result = [];
>
>  const flatten = (value) => {
>    if (isNotRenderable(value)) {
>      return;
>    }
>
>    if (Array.isArray(value)) {
>      for (let i = 0; i < value.length; i++) {
>        flatten(value[i]);
>      }
>    } else {
>      result.push(value);
>    }
>  };
>
>  flatten(children);
>  return result;
>}
>```

이벤트를 위임하지 않고, 각 요소에 이벤트리스너를 설정한 환경을 구현하고 싶었습니다.
반복문을 돌면서 이벤트가 발생한 타겟의 부모 핸들러를 호출 하는 것과, `stopPropagation` 기능을 구현하기 위해 이벤트 발생시 이벤트 타겟의 부모 요소들을 필터링 하고, 정렬하는 과정을 거치게 됩니다.

지금 생각으로는 이벤트를 추가할 때 정렬해서 저장하는 것과, 이벤트가 발생할 때 정렬해서 사용하는 방법이 있을 것 같은데, 현재 쇼핑몰과 같은 서비스에서 어떤 방법이 더 효율적이라 생각 하시나요?

이외에 다른 방법도 있는지 궁금합니다.

>```js
>$root.addEventListener(eventType, (e) => {
>  let isStopped = false;
>  Object.defineProperty(e, "stopPropagation", {
>    value: () => {
>      isStopped = true;
>    },
>  });
>
>  const deepestElements = getDeepestContainingElements(e.target, eventsRecord[eventType]);
>  for (const [, handler] of deepestElements) {
>    if (isStopped) {
>      // 자식 요소에서 stopPropagation 매서드를 호출한 경우 부모 요소의 핸들러 실행을 멈춘다.
>      break;
>    }
>
>    handler(e);
>  }
>});
>```