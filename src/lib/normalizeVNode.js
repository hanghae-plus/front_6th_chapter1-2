export function normalizeVNode(vNode) {  
  if (vNode == null || vNode == undefined || typeof(vNode) == "boolean") {
    return "";
  }
  
  if (typeof(vNode) == "number" || typeof(vNode) == "string") {
    return String(vNode);
  }
  
  if (typeof vNode.type === "function") {
    // Component 는 인자 값을 props 로 받음.
    // props 에 children 정보를 보내서 함수를 실행 시킴 
    // type이 컴포넌트 -> (함수의 역할) , 컴포넌트를 실행하기 위해선 <Component() /> 처럼 실행
    // 이런 형태로 children 이라는 인자를 넘겨주기 UnorderedList({children : vNode.children})
    // {
    //   type: [Function: UnorderedList],
    //   props: null,
    //   children: [
    //     { type: [Function: ListItem], props: [Object], children: [Array] },
    //     { type: [Function: ListItem], props: [Object], children: [Array] },
    //     { type: [Function: ListItem], props: [Object], children: [Array] }
    //   ]
    // }
    // 다시 정규화를 진행하면 vNode는 아래와 같은 형태가 된다.
    // <ul {...{}}>
    //   { type: [Function: ListItem], props: [Object], children: [Array] },
    //   { type: [Function: ListItem], props: [Object], children: [Array] },
    //   { type: [Function: ListItem], props: [Object], children: [Array] }
    // </ul>,
    return normalizeVNode(vNode.type({ ...vNode.props, children : vNode.children }));
  }
  
  /*
  {
    type: 'ul',
    props: {},
    children: [
      { type: [Function: ListItem], props: [Object], children: [Array] },
      { type: [Function: ListItem], props: [Object], children: [Array] },
      { type: [Function: ListItem], props: [Object], children: [Array] }
    ]
  }
  */

  return {
    type: vNode.type,
    props: vNode.props || null,
    children: vNode.children.map(normalizeVNode).filter(Boolean),
  };
}