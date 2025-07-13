// 실제 가상돔에서 직접 돔에 전달받아서 렌더링 하는 함수

/*
*
1. vNode가 null, undefined, boolean 일 경우, 빈 텍스트 노드를 반환합니다.
2. vNode가 문자열이나 숫자면 텍스트 노드를 생성하여 반환합니다.
3. vNode가 배열이면 DocumentFragment를 생성하고 각 자식에 대해 createElement를 재귀 호출하여 추가합니다.
4. 위 경우가 아니면 실제 DOM 요소를 생성합니다:
    - vNode.type에 해당하는 요소를 생성
    - vNode.props의 속성들을 적용 (이벤트 리스너, className, 일반 속성 등 처리)
    - vNode.children의 각 자식에 대해 createElement를 재귀 호출하여 추가
 * 
 * 
 */
export function createElement(vNode) {
  //1. vNode가 null, undefined, boolean 일 경우, 빈 텍스트 노드를 반환합니다.
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    // 실제 돔 환경에선 document.createTextNode("") 로 빈 문자열로 바꿔줘야 함
    return document.createTextNode("");
  }
  //2. vNode가 문자열이나 숫자면 텍스트 노드를 생성하여 반환합니다.
  if (typeof vNode === "string" || typeof vNode === "number") {
    // 실제 돔 환경에선 document.createTextNode(vNode.toString()) 로 문자열로 바꿔줘야 함
    return document.createTextNode(vNode.toString());
  }

  if (Array.isArray(vNode)) {
    const $el = document.createDocumentFragment();

    vNode.forEach((node) => {
      const childEl = createElement(node);
      return $el.appendChild(childEl);
    });

    return $el;
  }

  const element = document.createElement(vNode.type);

  if (vNode.children) {
    vNode.children.forEach((child) => {
      element.appendChild(createElement(child));
    });
  }

  updateAttributes(element, vNode);
  return element;
}

function updateAttributes($el, props) {
  //   console.log("props => ", props.children);
  //   console.log("element => ", $el);

  console.log("props => ", props.props);
  // 필수 변환하는 것들이 몇 있는거 같다.
  // className -> class
  // onclick -> onClick
  // onsubmit -> onSubmit
  // onreset -> onReset
  // onfocus -> onFocus
  // onblur -> onBlur
  // onkeydown -> onKeyDown
  if (props.props) {
    for (const key in props.props) {
      console.log("key => ", key);
      if (key === "className") {
        console.log("classname 으로 호출");
        $el.setAttribute("class", props.props["className"]);
      } else {
        $el.setAttribute(key, props.props[key]);
      }
    }
  } else {
    return;
  }

  return {
    ...props,
    $el,
  };
}

{
  /* <ul id="item-3" classname="list-item last-item">
  <li>- Item 1</li>
  <li>- Item 2</li>
  <li>- Item 3</li>
</ul>; */
}

{
  /* <ul>
  <li id="item-1" classname="list-item ">- Item 1</li>
<li id="item-2" classname="list-item ">- Item 2</li>
<li id="item-3" classname="list-item last-item">- Item 3</li>
</ul>; */
}

{
  /* <ul>
  <li id="item-1" class="list-item ">- Item 1</li>
  <li id="item-2" class="list-item ">- Item 2</li>
  <li id="item-3" class="list-item last-item">- Item 3</li>
</ul>; */
}

// 왜 classname을 class로 못바꾸나...?
