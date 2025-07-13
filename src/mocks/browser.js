import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { BASE_URL } from "../constants";

// MSW 워커 설정
export const worker = setupWorker(...handlers);

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
