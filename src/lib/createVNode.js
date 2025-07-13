export function createVNode(type, props, ...children) {
  const flatChildren = children.flat(Infinity);
  // 자바스크립트에서 0은 falsy값이라 테스트코드에서는 출력이 안될수 있으므로
  // 예외처리를 해줘야할거 같음
  // console.log("type => ", type);

  return {
    type,
    props,
    children: flatChildren.filter((child) => (child !== 0 ? child : "0")),
  };
}
