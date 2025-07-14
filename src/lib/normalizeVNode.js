import { convert } from "../utils/converter";
import { isNil } from "../utils/isNil";

export function normalizeVNode(vNode) {
  return convert(vNode, { earlyTermination: true })
    .case((val) => isNil(val) || typeof val === "boolean")
    .to("")
    .case((val) => typeof val === "string" || typeof val === "number")
    .to((val) => val.toString())
    .case(isUnnormalizedComponent)
    .to((val) =>
      normalizeVNode(
        val.type({
          ...val.props,
          children: val.children,
        }),
      ),
    )
    .case((val) => typeof val === "object" && val.type && val.children)
    .to((val) => ({
      ...val,
      children: val.children.map((child) => normalizeVNode(child)).filter((child) => child !== ""),
    }))
    .default((val) => val)
    .end();
}

const isUnnormalizedComponent = (val) => typeof val === "object" && typeof val.type === "function";
