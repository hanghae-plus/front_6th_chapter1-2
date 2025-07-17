export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Infinity).filter((child) => {
      return child !== false && child !== null && child !== undefined;
    }),
  };
}

//

// children.flat().flat() => 무한 평탄화 => flat(Infinity)
// 자식 false인것들은 제거 ..,,?
