import { PropsWithChildren, createContext, useContext, useState } from "react";
import { Basket } from "../models/basket";

//mô tả cấu trúc của đối tượng mà context sẽ cung cấp
interface StoreContextValue {
  removeItem: (productId: number, quantity: number) => void; // xóa sản phẩm nhập vào sản phẩm ID và số lượng
  setBasket: (basket: Basket) => void; // basket để thiết lập lại giỏ hàng
  basket: Basket | null; // giỏ hàng có thể có đối tượng basket hoặc null
}
// được tạo ra bằng createContext giá trị mặc định là undefined
export const StoreContext = createContext<StoreContextValue | undefined>(
  undefined
);

//useStoreContext là một hook tùy chỉnh giúp dễ dàng sử dụng StoreContext. Nó kiểm tra xem context có undefined hay không, và nếu có, nó sẽ ném ra một lỗi.
export function useStoreContext() {
  const context = useContext(StoreContext);

  if (context === undefined) {
    throw Error(
      "Oops - we are not inside the app.tsx so we do not have access to the context"
    );
  }

  return context;
}
// là một component cung cấp context cho các component con
export function StoreProvider({ children }: PropsWithChildren<unknown>) {
  const [basket, setBasket] = useState<Basket | null>(null); //useState được sử dụng để tạo state'basket' và hàm 'setBasket' để cập nhập giỏ hàng

  function removeItem(productId: number, quantity: number) {
    if (!basket) return; //nếu basket ko tồn tại hàm sẽ trả về ngay lập tức
    const items = [...basket.items]; // tạo một mạng ms items sao chép từ basket.items
    const itemIndex = items.findIndex((i) => i.productId === productId); //tìm chỉ số của sản phẩm trong mang item dựa trên productID
    if (itemIndex >= 0) {
      // nếu tìm thấy sản phẩm >= 0 giảm số lượng đi quantity
      items[itemIndex].quantity -= quantity;
      if (items[itemIndex].quantity === 0) items.splice(itemIndex, 1); //nếu sản phẩm = 0  thì xóa khỏi giỏ hàng
      setBasket((prevState) => {
        // cập nhập giỏ hàng bằng setBasket
        return { ...prevState!, items };
      });
    }
  }

  return (
    //cung cấp giá trị của Basket , SetBasket và RemoveItem thông qua StoreContext.Provider cho các component con
    <StoreContext.Provider value={{ basket, setBasket, removeItem }}>
      {children}
    </StoreContext.Provider>
  );
}
