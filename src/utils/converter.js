export function convert(input, { earlyTermination = true } = {}) {
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

  error(message) {
    if (this.hasTransformed && this.earlyTermination) {
      return this;
    }

    if (this.pendingCondition) {
      const shouldApply =
        typeof this.pendingCondition === "function" ? this.pendingCondition(this.value) : this.pendingCondition;

      if (shouldApply) {
        throw new Error(message);
      }
    }

    return this;
  }

  merge(otherConverter) {
    if (!this.hasTransformed) {
      const actualConverter = otherConverter();
      const otherResult = actualConverter.end();
      if (actualConverter.hasTransformed) {
        this.value = otherResult;
        this.hasTransformed = true;
      }
    }
    return this;
  }

  end() {
    return this.value;
  }
}
