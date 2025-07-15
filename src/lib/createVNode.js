function flattenArray(arr) { 
	const result = []; 
	
	for (const item of arr) { 
		if (Array.isArray(item)) { 
			result.push(...flattenArray(item)); 
		} else if (item !== null && item !== undefined && item !== false) {
      result.push(item); 
    }
	} 
	
	return result; 
}

export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: flattenArray(children),
  };
}
