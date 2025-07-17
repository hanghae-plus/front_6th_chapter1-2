import { setupWorker } from "msw/browser";
import { handlers } from "./handlers.js";
import { BASE_URL } from "../constants.js";

export const worker = setupWorker(...handlers);

// MSW 워커 설정
// Worker start 옵션을 export하여 main.js에서 사용
export const workerOptions = import.meta.env.PROD
  ? {
      serviceWorker: {
        url: `${BASE_URL}/mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }
  : {
      onUnhandledRequest: "bypass",
    };
