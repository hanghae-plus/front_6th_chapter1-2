export const intersection = (set1, set2) => {
  return new Set([...set1].filter((key) => set2.has(key)));
};

export const difference = (set1, set2) => {
  return new Set([...set1].filter((key) => !set2.has(key)));
};

export const union = (set1, set2) => {
  return new Set([...set1, ...set2]);
};

export const isSubset = (set1, set2) => {
  return [...set1].every((key) => set2.has(key));
};

export const isSuperset = (set1, set2) => {
  return [...set2].every((key) => set1.has(key));
};

export const isDisjoint = (set1, set2) => {
  return [...set1].every((key) => !set2.has(key));
};

export const isEqual = (set1, set2) => {
  return [...set1].every((key) => set2.has(key));
};
