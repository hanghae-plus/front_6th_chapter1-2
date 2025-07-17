// 가상 노드객체를 생성하는 함수
export function createVNode(type, props, ...children) {
  // 자바스크립트에서 0은 falsy값이라 테스트코드에서는 출력이 안될수 있으므로
  // 예외처리를 해줘야할거 같음
  // console.log("type => ", type);

  return {
    type,
    props,
    children: flattenChildren(children),
  };
}

function flattenChildren(children) {
  return children.flat(Infinity).filter((child) => !isFalsy(child));
}

function isFalsy(value) {
  return value === false || value === null || value === undefined;
}
