import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

interface Props {
  options: any[]; //mảng của đối tượng chứa các tùy chọn cho các radio mỗi đối tượng có thuộc tính như value và label
  onChange: (event: any) => void; // xử lý skienj khi đc thay đổi
  selectedValue: string; //giá trị hiện tại của nút radio
}
//RadioButtonGroup là một function component nhận vào các props được định nghĩa bởi interface Props.
export default function RadioButtonGroup({
  options,
  onChange,
  selectedValue,
}: Props) {
  return (
    //RadioGroup: Một thành phần của Material-UI, chứa các nút radio. onChange là hàm xử lý sự kiện khi giá trị được chọn thay đổi, và value là giá trị hiện tại được chọn.
    <FormControl component="fieldset">
      <RadioGroup onChange={onChange} value={selectedValue}>
        {options.map(({ value, label }) => (
          <FormControlLabel
            value={value}
            control={<Radio />}
            label={label}
            key={value}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
