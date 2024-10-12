import { createAsyncThunk, createSlice,isAnyOf } from "@reduxjs/toolkit";
import { Basket } from "../../app/models/basket";
import agent from '../../app/api/agent';
import { getCookie } from "../../app/util/util";


//file này tạo ra để xử lý giúp tổ chức mã nguồn 1 cách rõ tàng , giống như file agent.ts nhưng phải này xử lý những chức năng phức tạp hơn
interface BasketState {
    basket: Basket | null; // giao diện là một giỏ hàng có thể là 1 giỏ hàng hoặc là rỗng
    status: string; // là một chuỗi theo dõi trạng thái hiện tại
}

const initialState: BasketState = {
	basket: null, // khởi động  trạng thái ban đầu vs basket là null 
    status: 'idle' // idle là trạng thái nhàn dỗi
}
export const fetchBasketAsync = createAsyncThunk<Basket>(
    'basket/fetchBasketAsync',
    async (_, thunkAPI) => {
        try {
            return await agent.Basket.get();
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    },
    {
        condition: () => {
            if (!getCookie('buyerId')) return false;
        }
    }
)

//thêm mục vào giỏ hàng
//hàm addBassketItemAsync là một async thunk thêm mục vào giỏ hàng , nso thực hiện 1 yêu cầu API để thêm mục và trả về giỏ hàng cập nhật nếu thành công 
//nếu có lỗi nếu sẽ trả về thông qua thùnkAPI.rejectWithValue
export const addBasketItemAsync = createAsyncThunk<Basket, {productId: number, quantity?: number}>(
    'basket/addBasketItemAsync',
    async ({productId, quantity = 1}, thunkAPI) => {
        try {
            return await agent.Basket.addItem(productId, quantity);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)
//như trên
export const removeBasketItemAsync = createAsyncThunk<void, 
    {productId: number, quantity: number, name?: string}>(
    'basket/removeBasketItemASync',
    async ({productId, quantity}, thunkAPI) => {
        try {
            await agent.Basket.removeItem(productId, quantity);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)

//tạo silce cho giỏ hàng vs tên basket trạng thái ban đầu và các reducer để cập nhật trạng thái giỏ hàng
export const basketSlice = createSlice({
    name: 'basket',
    initialState,
    reducers: {//Reducers là các hàm để thay đổi state một cách đồng bộ dựa trên các action được dispatch
        setBasket: (state, action) => {
            state.basket = action.payload//Cập nhật giỏ hàng với dữ liệu mới từ action.payload
        },
        clearBasket: (state) => {
            state.basket = null;
        }
    },
    extraReducers: builder => {
        builder.addCase(addBasketItemAsync.pending, (state, action) => {
            state.status = 'pendingAddItem' + action.meta.arg.productId;
        });
        builder.addCase(removeBasketItemAsync.pending, (state, action) => {
            state.status = 'pendingRemoveItem' + action.meta.arg.productId + action.meta.arg.name;
        })
        builder.addCase(removeBasketItemAsync.fulfilled, (state, action) => {
            const { productId, quantity } = action.meta.arg;
            const itemIndex = state.basket?.items.findIndex(i => i.productId === productId);
            if (itemIndex === -1 || itemIndex === undefined) return;
            state.basket!.items[itemIndex].quantity -= quantity;
            if (state.basket?.items[itemIndex].quantity === 0)
                state.basket.items.splice(itemIndex, 1);
            state.status = 'idle';
        });
        builder.addCase(removeBasketItemAsync.rejected, (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        });
        builder.addMatcher(isAnyOf(addBasketItemAsync.fulfilled, fetchBasketAsync.fulfilled), (state, action) => {
            state.basket = action.payload;
            state.status = 'idle';
        });
        builder.addMatcher(isAnyOf(addBasketItemAsync.rejected, fetchBasketAsync.rejected), (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        });
    }
})

export const { setBasket, clearBasket } = basketSlice.actions;