import { Button, ButtonGroup, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../app/api/store/configureStore";
import { decrement, increment } from "../../fearures/contact/counterSlice";

export default function ContactPage() {
  const dispatch = useDispatch(); // sử dispath để gửi hành đọng tới counterReducer
  const { data, title } = useAppSelector((state) => state.counter);

  return (
    <>
      <Typography gutterBottom variant="h3">
        {title}
      </Typography>
      <Typography variant="h4">The data is: {data}</Typography>
      <ButtonGroup>
        <Button
          onClick={() => dispatch(decrement(1))} // sử biến dispatch xong sd các hành động dercement của counterReducer
          variant="contained"
          color="error"
        >
          Decrement
        </Button>
        <Button
          onClick={() => dispatch(increment(1))} //c sử biến dispatch xong sd các hành động inrcement của counterReducer
          variant="contained"
          color="primary"
        >
          Increment
        </Button>
        <Button
          onClick={() => dispatch(increment(5))}
          variant="contained"
          color="secondary"
        >
          Increment by 5
        </Button>
      </ButtonGroup>
    </>
  );
}
