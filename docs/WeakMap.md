# WeakMap

`WeakMap`은 키(key)가 약한 참조(weak reference)를 유지하는 특별한 종류의 맵(Map) 객체입니다. 이는 키로 사용된 객체에 대한 다른 참조가 없을 경우, 가비지 컬렉터(GC)가 해당 객체를 메모리에서 제거할 수 있음을 의미합니다. 이 때 WeakMap에서도 해당 키와 값(value)이 자동으로 제거됩니다. 이를 통해 메모리 누수를 방지할 수 있습니다.

## 주요 특징

- **키(Key)는 반드시 객체여야 합니다.** 원시값(Primitive values: string, number, boolean 등)은 키로 사용할 수 없습니다.
- **키 객체는 '약한 참조'로 연결됩니다.** 이로 인해 키 객체가 다른 곳에서 참조되지 않으면 가비지 컬렉션의 대상이 됩니다.
- **열거(iterable)할 수 없습니다.** `keys()`, `values()`, `entries()`, `forEach()`, `size`와 같은 메서드나 속성이 없습니다. 이는 가비지 컬렉터의 동작 시점을 예측할 수 없기 때문입니다.

## Map과의 비교

| 구분 | `Map` | `WeakMap` |
| :--- | :--- | :--- |
| **키의 참조 방식** | 강한 참조 (Strong Reference) | 약한 참조 (Weak Reference) |
| **사용 가능한 키 타입** | 모든 값 (객체, 원시값 등) | 객체만 가능 |
| **열거 가능 여부** | 가능 (iterable) | 불가능 (not iterable) |
| **메모리 누수 위험** | 키 객체 참조를 직접 해제하지 않으면 발생 가능 | 키 객체가 다른 곳에서 참조되지 않으면 자동으로 제거되어 위험이 낮음 |

## 사용 예시 (캐싱)

객체에 대한 추가 정보를 저장하대, 해당 객체가 더 이상 필요 없어지면 정보도 함께 메모리에서 해제되도록 하고 싶을 때 유용합니다.

```javascript
let cache = new WeakMap();

// 이 객체는 DOM 요소라고 가정합니다.
let element = { id: 'my-element' }; 

// element 객체에 대한 캐시 데이터(예: 이벤트 리스너 정보)를 저장합니다.
cache.set(element, { event: 'click', listener: () => console.log('Clicked!') });

console.log(cache.has(element)); // true

// 웹페이지에서 element가 제거되어 더 이상 참조하지 않게 됨
element = null; 

// 이 시점 이후, 가비지 컬렉터가 동작하면
// WeakMap에 저장되었던 element 키와 그 값은 자동으로 메모리에서 제거됩니다.
// 따라서 메모리 누수를 걱정할 필요가 없습니다.
```
