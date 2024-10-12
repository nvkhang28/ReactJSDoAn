import { createSlice } from "@reduxjs/toolkit";

interface CounterState {
  title: string;
  data: number;
}

const initialState: CounterState = {
  title: "Redux with redux toolkit example",
  data: 42,
};

export const counterSlice = createSlice({
  name: "counter", // Tên của slice của counter
  initialState, // State ban đầu của slice
  reducers: {
    // Các reducer để xử lý các hành động
    increment: (state, action) => {
      state.data += action.payload; // Xử lý hành động increment
    },
    decrement: (state, action) => {
      state.data -= action.payload; // Xử lý hành động decrement
    },
  },
});
//Tự động tạo ra các action creators tương ứng với các reducer đã định nghĩa (increment và decrement).
export const { increment, decrement } = counterSlice.actions;
