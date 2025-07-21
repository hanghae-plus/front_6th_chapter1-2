// 평탄화 하기 위해 재귀적으로 평탄화 해줌, 그리고 falsy 값들 제거!
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: makeFlat(children).filter(
      (child) => child !== null && child !== undefined && child !== false && child !== true,
    ),
  };
}

const makeFlat = (arr) => {
  return arr.reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      return acc.concat(makeFlat(curr));
    }
    return acc.concat(curr);
  }, []);
};
