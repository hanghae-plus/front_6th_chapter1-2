export function createVNode(type, props, ...children) {
  // 평탄화 함수: 중첩 배열을 1차원 배열로
  function flatten(arr) {
    return arr.reduce((acc, val) => {
      if (Array.isArray(val)) {
        acc.push(...flatten(val));
      } else if (val !== null && val !== undefined && val !== false) {
        acc.push(val);
      }
      return acc;
    }, []);
  }

  const flatChildren = flatten(children);

  return {
    type,
    props: props ?? null, // props가 없으면 null로 통일
    children: flatChildren,
  };
}
