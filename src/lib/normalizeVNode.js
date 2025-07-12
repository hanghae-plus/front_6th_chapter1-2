import { convert } from "../utils/converter";
import { isNil } from "../utils/isNil";

export function normalizeVNode(vNode) {
  return convert(vNode, { earlyTermination: true })
    .when((val) => isNil(val) || typeof val === "boolean")
    .then("")
    .when((val) => typeof val === "string" || typeof val === "number")
    .then((val) => val.toString())
    .when((val) => typeof val === "object" && typeof val.type === "function")
    .then((val) => {
      const propsWithChildren = {
        ...val.props,
        children: val.children,
      };
      const result = val.type(propsWithChildren);

      return normalizeVNode(result);
    })
    .when((val) => typeof val === "object" && val.type && val.children)
    .then((val) => {
      const normalizedChildren = val.children.map((child) => normalizeVNode(child)).filter((child) => child !== ""); // falsy 값 제거

      return {
        ...val,
        children: normalizedChildren,
      };
    })
    .otherwise((val) => val)
    .end();
}
