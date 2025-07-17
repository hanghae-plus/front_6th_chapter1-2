/** @jsx createVNode */
import { createVNode } from "../lib";
import { cartStore, uiStore, UI_ACTIONS } from "../stores";
import { CartModal, Footer, PublicImage, Toast } from "../components";

// 장바구니 모달 열기 핸들러
const close = () => {
  uiStore.dispatch({ type: UI_ACTIONS.OPEN_CART_MODAL });
};

export const PageWrapper = ({ headerLeft, children }) => {
  const cart = cartStore.getState();
  const { cartModal, toast } = uiStore.getState();
  const cartSize = cart.items ? cart.items.length : 0;

  const cartCount = (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {cartSize > 99 ? "99+" : cartSize}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {headerLeft}
            <div className="flex items-center space-x-2">
              {/* 장바구니 아이콘 */}
              <button
                id="cart-icon-btn"
                className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
                onClick={close}
              >
                <PublicImage src="/cart-header-icon.svg" alt="장바구니" className="w-6 h-6" />
                {cartSize > 0 && cartCount}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">{children}</main>

      <CartModal {...cart} isOpen={cartModal.isOpen} />

      <Toast {...toast} />

      <Footer />
    </div>
  );
};
