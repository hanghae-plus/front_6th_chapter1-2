import { isNil } from "../utils/isNil";

export function normalizeVNode(vNode) {
  return convert(vNode, { earlyTermination: true })
    .when((val) => isNil(val) || typeof val === "boolean")
    .then("")
    .when((val) => typeof val === "string" || typeof val === "number")
    .then((val) => val.toString())
    .when((val) => val && typeof val === "object" && typeof val.type === "function")
    .then((val) => {
      const propsWithChildren = {
        ...val.props,
        children: val.children,
      };
      const result = val.type(propsWithChildren);

      return normalizeVNode(result);
    })
    .when((val) => val && typeof val === "object" && val.type && val.children)
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

function convert(input, { earlyTermination = true } = {}) {
  return new Converter(input, { earlyTermination });
}

class Converter {
  constructor(input, options = {}) {
    this.value = input;
    this.earlyTermination = options.earlyTermination ?? true;
    this.hasTransformed = false;
    this.pendingCondition = null;
  }

  when(condition) {
    if (this.hasTransformed && this.earlyTermination) {
      return this;
    }

    this.pendingCondition = condition;
    return this;
  }

  then(transform) {
    if (this.hasTransformed && this.earlyTermination) {
      return this;
    }

    if (this.pendingCondition) {
      const shouldApply =
        typeof this.pendingCondition === "function" ? this.pendingCondition(this.value) : this.pendingCondition;

      if (shouldApply) {
        this.value = typeof transform === "function" ? transform(this.value) : transform;
        this.hasTransformed = true;
      }

      this.pendingCondition = null;
    }

    return this;
  }

  otherwise(fallback) {
    if (!this.hasTransformed) {
      this.value = typeof fallback === "function" ? fallback(this.value) : fallback;
    }
    return this;
  }

  end() {
    return this.value;
  }
}
