import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useState } from "react";

interface Props {
  items: string[];
  checked?: string[];
  onChange: (items: string[]) => void;
}

export default function CheckboxButtons({ items, checked, onChange }: Props) {
  const [checkedItems, setCheckedItems] = useState(checked || []);

  //Hàm này nhận vào giá trị của một mục và cập nhật trạng thái checkedItems.
  // currentIndex xác định vị trí của mục trong mảng checkedItems.
  // Nếu mục không có trong mảng (index là -1), mục được thêm vào mảng.
  // Nếu mục đã có trong mảng, mục được loại bỏ khỏi mảng.
  // setCheckedItems cập nhật trạng thái checkedItems với mảng mới.
  // onChange được gọi với mảng mới để thông báo rằng danh sách các mục được chọn đã thay đổi.
  function handleChecked(value: string) {
    const currentIndex = checkedItems.findIndex((item) => item === value);
    let newChecked: string[] = [];
    if (currentIndex === -1) newChecked = [...checkedItems, value];
    else newChecked = checkedItems.filter((i) => i !== value);
    setCheckedItems(newChecked);
    onChange(newChecked);
  }

  return (
    <FormGroup>
      {items.map((item) => (
        <FormControlLabel
          key={item}
          control={
            <Checkbox
              checked={checkedItems.indexOf(item) !== -1}
              onClick={() => handleChecked(item)}
            />
          }
          label={item}
        />
      ))}
    </FormGroup>
  );
}
