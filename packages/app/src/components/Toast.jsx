import { UI_ACTIONS, uiStore } from "../stores";
import { PublicImage } from "./PublicImage";

/**
 * 토스트 알림 컴포넌트
 */

// 토스트 닫기 핸들러
const close = () => {
  uiStore.dispatch({ type: UI_ACTIONS.HIDE_TOAST });
};

export function Toast({ isVisible = false, message = "", type = "info" }) {
  if (!isVisible) {
    return "";
  }

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-600",
          icon: <PublicImage src="/success-icon.svg" alt="성공" className="w-5 h-5" />,
        };
      case "error":
        return {
          bg: "bg-red-600",
          icon: <PublicImage src="/error-icon.svg" alt="오류" className="w-5 h-5" />,
        };
      case "warning":
        return {
          bg: "bg-yellow-600",
          icon: <PublicImage src="/warning-icon.svg" alt="경고" className="w-5 h-5" />,
        };
      default: // info
        return {
          bg: "bg-blue-600",
          icon: <PublicImage src="/info-icon.svg" alt="정보" className="w-5 h-5" />,
        };
    }
  };

  const { bg, icon } = getIconAndColor();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 toast-container">
      <div className={`${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm`}>
        <div className="flex-shrink-0">{icon}</div>
        <p className="text-sm font-medium">{message}</p>
        <button id="toast-close-btn" className="flex-shrink-0 ml-2 text-white hover:text-gray-200" onClick={close}>
          <PublicImage src="/close-icon-white.svg" alt="닫기" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
