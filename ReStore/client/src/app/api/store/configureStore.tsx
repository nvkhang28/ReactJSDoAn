import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "../../../fearures/contact/counterSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { basketSlice } from "../../../fearures/basket/basketSlice";
import { catalogSlice } from "../../../fearures/catalog/catalogSlice";
import { accountSlice } from "../../../fearures/account/accountSlice";

//store được cấu hình để sử dụng configureStore
export const store = configureStore({
  //reducter là một tối tượng chúa các slice reducer cho các tính năng  counter basket catalog
  reducer: {
    counter: counterSlice.reducer,
    basket: basketSlice.reducer,
    catalog: catalogSlice.reducer,
    account: accountSlice.reducer,
  },
});

// RootState là một kiểu dữ liệu đại diện cho trạng thái toàn bộ của store, được suy ra từ hàm getState của store.
// AppDispatch là kiểu dữ liệu của hàm dispatch trong store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// useAppDispatch là một hook tùy chỉnh sử dụng useDispatch từ react-redux. Nó đảm bảo rằng các hành động được dispatch có kiểu chính xác là AppDispatch.
// useAppSelector là một hook tùy chỉnh sử dụng useSelector từ react-redux, với kiểu dữ liệu được xác định là RootState. Điều này giúp đảm bảo rằng các selector được sử dụng trong ứng dụng có kiểu dữ liệu chính xác.
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
