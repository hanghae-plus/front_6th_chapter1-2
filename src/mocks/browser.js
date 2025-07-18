import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// MSW 워커 설정
export const worker = setupWorker(...handlers);
