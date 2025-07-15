import { CartItem } from "./CartItem";
import { clearCart, deselectAllCart, removeSelectedFromCart, selectAllCart } from "../services";
import { UI_ACTIONS, uiStore } from "../stores";
import { PublicImage } from "./PublicImage";

/**
 * 장바구니 모달 컴포넌트
 */

// 이벤트 핸들러들
const close = () => {
  uiStore.dispatch({ type: UI_ACTIONS.CLOSE_CART_MODAL });
};

const handleSelectAllChange = (e) => {
  if (e.target.checked) {
    selectAllCart();
  } else {
    deselectAllCart();
  }
};
const checkout = () => {
  uiStore.dispatch({
    type: UI_ACTIONS.SHOW_TOAST,
    payload: {
      message: "구매 기능은 추후 구현 예정입니다.",
      type: "info",
    },
  });
};

// ESC 키 이벤트 등록
let escHandlerRegistered = false;

const handleEscKey = (e) => {
  if (e.key === "Escape") {
    const cartModalState = uiStore.getState().cartModal;
    if (cartModalState.isOpen) {
      uiStore.dispatch({ type: UI_ACTIONS.CLOSE_CART_MODAL });
    }
    document.removeEventListener("keydown", handleEscKey);
    escHandlerRegistered = false;
  }
};

const registerEscHandler = () => {
  if (escHandlerRegistered) return;

  document.addEventListener("keydown", handleEscKey);
  escHandlerRegistered = true;
};

export function CartModal({ items = [], selectedAll = false, isOpen = false }) {
  // ESC 키 핸들러 등록
  registerEscHandler();

  if (!isOpen) {
    return "";
  }

  // 선택된 아이템들
  const selectedItems = items.filter((item) => item.selected);
  const selectedCount = selectedItems.length;

  // 총 금액 계산
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto cart-modal">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay" onClick={close} />

      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div className="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <PublicImage src="/cart-icon.svg" alt="장바구니" className="w-5 h-5 mr-2" />
              장바구니
              {items.length > 0 && <span className="text-sm font-normal text-gray-600 ml-1">({items.length})</span>}
            </h2>

            <button id="cart-modal-close-btn" className="text-gray-400 hover:text-gray-600 p-1" onClick={close}>
              <PublicImage src="/close-icon.svg" alt="닫기" className="w-6 h-6" />
            </button>
          </div>

          {/* 컨텐츠 */}
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <PublicImage src="/empty-cart-icon.svg" alt="빈 장바구니" className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
                <p className="text-gray-600">원하는 상품을 담아보세요!</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col max-h-[calc(90vh-120px)]">
              {/* 전체 선택 섹션 */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    id="cart-modal-select-all-checkbox"
                    checked={selectedAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                    onChange={handleSelectAllChange}
                  />
                  전체선택 ({items.length}개)
                </label>
              </div>

              {/* 아이템 목록 */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <CartItem {...item} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 하단 액션 */}
          {items.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              {/* 선택된 아이템 정보 */}
              {selectedCount > 0 && (
                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="text-gray-600">선택한 상품 ({selectedCount}개)</span>
                  <span className="font-medium">{selectedAmount.toLocaleString()}원</span>
                </div>
              )}

              {/* 총 금액 */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">총 금액</span>
                <span className="text-xl font-bold text-blue-600">{totalAmount.toLocaleString()}원</span>
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-2">
                {selectedCount > 0 && (
                  <button
                    id="cart-modal-remove-selected-btn"
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md
                                 hover:bg-red-700 transition-colors text-sm"
                    onClick={removeSelectedFromCart}
                  >
                    선택한 상품 삭제 ({selectedCount}개)
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    id="cart-modal-clear-cart-btn"
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md
                                 hover:bg-gray-700 transition-colors text-sm"
                    onClick={clearCart}
                  >
                    전체 비우기
                  </button>
                  <button
                    id="cart-modal-checkout-btn"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md
                                 hover:bg-blue-700 transition-colors text-sm"
                    onClick={checkout}
                  >
                    구매하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
