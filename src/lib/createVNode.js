export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: (children ?? [])
      .flat(Infinity)
      // normalizeVNode 으로 하면 "배열 렌더링"에서 실패함
      // .map((x) => normalizeVNode(x))
      .map((x) => (x == null || typeof x === "boolean" ? "" : x))
      .filter((x) => x !== ""),
  };
}
