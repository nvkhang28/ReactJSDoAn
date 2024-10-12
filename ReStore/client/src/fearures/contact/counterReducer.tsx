//là các hằng số đại diện cho các loại hành đông, được sử dụng để thay đổi trạng thái
export const INCREMENT_COUNTER = "INCREMENT_COUNTER";
export const DECREMENT_COUNTER = "DECREMENT_COUNTER";

// là một giao diện bộ đếm gồm 2 thuộc tính data(1 số đại diện cho giá trị của bộ đếm ) title(một chuỗi mô tả tiêu đề của bộ đếm )
export interface CounterState {
  data: number;
  title: string;
}

//initialState là một trạng thái ban đầu của bộ đếm , vs data đc gán bằng 42 va tiếu để là Yarc
const initialState: CounterState = {
  data: 42,
  title: "YARC (yet another redux counter)",
};

// là hàm tạo hành động trả về một đối tượng hành động , mỗi đối tượng chứa 2 thuộc tính
//type: loại hành động có thể là Incerment_counter hoặc Derement_counter
export function increment(amount = 1) {
  return {
    type: INCREMENT_COUNTER,
    payload: amount,
  };
}

export function decrement(amount = 1) {
  return {
    type: DECREMENT_COUNTER,
    payload: amount,
  };
}

// là một giao diện định nghĩa cấu tróc của hành động gửi tới reducer
// type: loại hành động
// payload: giá trị tải của hanhd động
interface CounterAction {
  type: string;
  payload: number;
}

// là 1 hàm reducter có 2 tham số là state()là trạng thái hiện tại của bộ đếm  và action(hành động được gửi tới reducer)
export default function counterReducer(
  state = initialState,
  action: CounterAction
) {
  // Nếu action.type là INCREMENT_COUNTER, nó sẽ trả về một đối tượng state mới với giá trị data được tăng lên bằng action.payload.
  // Nếu action.type là DECREMENT_COUNTER, nó sẽ trả về một đối tượng state mới với giá trị data được giảm xuống bằng action.payload.
  // Nếu không có loại hành động nào khớp, reducer sẽ trả về trạng thái hiện tại (state).

  switch (action.type) {
    case INCREMENT_COUNTER:
      return {
        ...state,
        data: state.data + action.payload,
      };
    case DECREMENT_COUNTER:
      return {
        ...state,
        data: state.data - action.payload,
      };
    default:
      return state;
  }
}
