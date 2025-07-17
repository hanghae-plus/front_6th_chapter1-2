// // 1. test 실패

// // 두번 클릭이 되는듯
// 맵,셋,위크맵

// 맵은 키가 중복 될수 없으므로, 이벤트 헨들러를 저장하는게 좋음

let eventHandlers = new Set();
const delegatedRoot = new Set();
// 이벤트를 위임하기 위한
export function setupEventListeners(root) {
  // 이벤트 헨들러가 가지고 있는 타입을 가져오고,
  // root에 등록

  if (!root) return;
  // 중복 등록 방지
  if (delegatedRoot.has(root)) {
    delegatedRoot.delete(root); // 이벤트 위임 루트 추가
  }
  delegatedRoot.add(root); // 이벤트 위임 루트 추가

  // 이벤트 타입들을 모아서 중복 방지
  const eventTypes = new Set();
  // 이벤트 타입 중복 방지
  for (const { eventType } of eventHandlers) {
    eventTypes.add(eventType);
  }
  // 이벤트타입
  eventTypes.forEach((eventType) => {
    root.addEventListener(eventType, (e) => {
      eventHandlers.forEach(({ element, handler }) => {
        // 클릭한 요소가 맞다면 핸들러 동작
        if (element === e.target) {
          handler(e);
        }
      });
    });
  });
}

// 이벤트 핸들러를 저장 등록
export function addEvent(element, eventType, handler) {
  if (!element || !eventType || !handler) return;
  // const eventTypes = new Set();

  eventHandlers.add({ element, eventType, handler });
}

export function removeEvent(element, eventType, handler) {
  if (!element || !eventType || !handler) return;

  for (const item of eventHandlers) {
    if (item.element === element && item.eventType === eventType && item.handler === handler) {
      eventHandlers.delete(item);
    }
  }
}

// AI 선생님이 만든 코드

// //1. addEvent와 removeEvent를 통해 element에 대한 이벤트 함수를 어딘가에 저장하거나 삭제합니다.
// // 2. setupEventListeners를 이용해서 이벤트 함수를 가져와서 한 번에 root에 이벤트를 등록합니다.

// // 핸들러 저장 "요소 Id | 이벤트 타입" => handler
// const eventMap = new Map();

// //요소 - 아이디 : 돔 요소 => 고유 아이디 생성
// const elementIdMap = new WeakMap();

// // 중복 등록 방지용 위임된 엘리먼트 루트
// const delegatedRoot = new Set();

// // 이벤트 위임
// export function setupEventListeners(root) {
//   if (!root) return;
//   // event를 수집

//   if (delegatedRoot.has(root)) {
//     return root;
//   }
//   delegatedRoot.add(root);

//   const eventTypes = new Set();
//   for (const key of eventMap.keys()) {
//     const [, eventType] = key.split("|");
//     eventTypes.add(eventType);
//   }

//   eventTypes.forEach((eventType) => {
//     root.addEventListener(eventType, (event) => {
//       // 위임된 함수를 집어넣는다.
//       delegatedEvent(event, root);
//     });
//   });

//   return root;
// }

// function delegatedEvent(event, root) {
//   // 클릭된 요소
//   let target = event.target;
//   while (target !== root && target) {
//     const elementId = elementIdMap.get(target);
//     if (elementId) {
//       const key = `${elementId}|${event.type}`;
//       const handler = eventMap.get(key);
//       if (handler) {
//         handler(event);
//         break;
//       }
//     }
//     // 없으면 무한루프가 돌음
//     target = target.parentElement;
//   }
// }
// // 이벤트 핸들러 등록
// export function addEvent(element, eventType, handler) {
//   // 1. 요소에 고유 ID 부여 (없으면)
//   // 2. "ID|eventType" 키로 핸들러 저장
//   // 3. 끝 (실제 addEventListener 안함!)

//   if (!element || !eventType || !handler) return;

//   let elementId = elementIdMap.get(element);

//   // 엘리먼트 아이디가 없다면 만드는 이유?
//   // 핸들러에 이벤트맵에 저장하려면 키가 필요한데 id가 없다면 키를 못만듬
//   if (elementId === undefined) {
//     elementId = Math.random().toString(36).substring(2, 9);
//     elementIdMap.set(element, elementId);
//   }
//   const key = `${elementId}|${eventType}`;

//   // 핸들러를 키로 이벤트맵에 저장
//   eventMap.set(key, handler);
// }
// export function removeEvent(element, eventType, handler) {
//   if (!element || !eventType || !handler) return;
//   let elementId = elementIdMap.get(element);
//   if (elementId === undefined) return;
//   const key = `${elementId}|${eventType}`;
//   console.log(key);
//   eventMap.delete(key);
// }
