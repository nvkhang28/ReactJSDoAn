import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { User } from "../../app/models/user";
import { FieldValues } from "react-hook-form";
import agent from "../../app/api/agent";
import { router } from "../../app/router/Routes";
import { toast } from "react-toastify";
import { setBasket } from "../basket/basketSlice";

// để lưu trữ kết quả redux
//đây là một trạng thái giao diện , đây sẽ là 1 loại người dùng
interface AccountState {
  user: User | null;
}
//trạng thái ban đầu của người dùng là null
const initialState: AccountState = {
  user: null,
};

//User: Kiểu dữ liệu của kết quả trả về (ở đây là đối tượng người dùng).
//FieldValues: Kiểu dữ liệu của tham số đầu vào (dữ liệu form).
export const signInUser = createAsyncThunk<User, FieldValues>(
  "account/signInUser", //tên
  async (data, thunkAPI) => {
    //data: Tham số đầu vào, chứa dữ liệu form (username, password) để đăng nhập.
    try {
      //agent.Account.login(data): Gửi yêu cầu đăng nhập tới API với dữ liệu form và chờ kết quả trả về.
      const userDto = await agent.Account.login(data);
      const { basket, ...user } = userDto; //Giải nén đối tượng trả về từ API thành basket và các thuộc tính khác của người dùng (user).
      if (basket) thunkAPI.dispatch(setBasket(basket)); //Nếu giỏ hàng (basket) tồn tại, dispatch action setBasket để cập nhật giỏ hàng trong Redux store
      localStorage.setItem("user", JSON.stringify(user)); //Lưu thông tin người dùng (không bao gồm giỏ hàng) vào localStorage để duy trì phiên đăng nhập
      return user;
    } catch (error: any) {
      //Nếu có lỗi xảy ra trong quá trình đăng nhập, catch sẽ bắt lỗi và trả về rejectWithValue với thông tin lỗi để có thể xử lý trong reducer hoặc UI.
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<User>( //user kiểu dữ liệu của kq tra về đối tượng người dùng
  "account/fetchCurrentUser",
  async (_, thunkAPI) => {
    //_: Đối số đầu vào không được sử dụng, nhưng vẫn cần phải có để khớp với chữ ký của hàm createAsyncThunk.
    thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem("user")!))); //Lấy thông tin người dùng từ localStorage. - Dispatch action setUser để cập nhật thông tin người dùng trong Redux store.
    try {
      const userDto = await agent.Account.currentUser(); //Gửi yêu cầu lấy thông tin người dùng hiện tại từ API và chờ kết quả trả về.
      const { basket, ...user } = userDto; //Giải nén đối tượng trả về từ API thành basket và các thuộc tính khác của người dùng (user).
      if (basket) thunkAPI.dispatch(setBasket(basket)); // Nếu giỏ hàng (basket) tồn tại, dispatch action setBasket để cập nhật giỏ hàng trong Redux store.
      localStorage.setItem("user", JSON.stringify(user)); //Lưu lại thông tin người dùng (không bao gồm giỏ hàng) vào localStorage để duy trì phiên đăng nhập.
      return user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  },
  {
    condition: () => {
      if (!localStorage.getItem("user")) return false; //nếu tồn tại thông tin người dùng trong localStorage nó sẽ trả về false
    },
  }
);

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    signOut: (state) => {
      state.user = null; //Khởi tạo trạng thái ban đầu cho account slice, bao gồm trạng thái user ban đầu là null.
      localStorage.removeItem("user"); //Xóa mục user khỏi localStorage.
      router.navigate("/"); //Điều hướng về trang chủ (/).
    },
    setUser: (state, action) => {
      //Đặt state.user bằng giá trị payload từ action.
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.user = null;
      localStorage.removeItem("user");
      toast.error("Session expired - please login again");
      router.navigate("/");
    });
    builder.addMatcher(
      isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled),
      (state, action) => {
        state.user = action.payload;
      }
    );
    builder.addMatcher(isAnyOf(signInUser.rejected), (_state, action) => {
      throw action.payload;
    });
  },
});

export const { signOut, setUser } = accountSlice.actions;
