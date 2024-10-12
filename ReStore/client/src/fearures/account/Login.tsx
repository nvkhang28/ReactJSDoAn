import { LockOutlined } from "@mui/icons-material";
import {
  Container,
  Paper,
  Avatar,
  Typography,
  Box,
  TextField,
  Grid,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FieldValues, useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { useAppDispatch } from "../../app/api/store/configureStore";
import { signInUser } from "./accountSlice";

export default function Login() {
  const navigate = useNavigate(); //đc nhiều để điều hướng trang
  const location = useLocation(); //để lấy thông tin hiện tại của trang
  const dispatch = useAppDispatch(); // Hook tùy chỉnh để lấy dispatch từ Redux store, dùng để dispatch các action.
  const {
    register, //Hàm dùng để đăng ký các input vào form.
    handleSubmit, //Hàm xử lý khi form được submit
    formState: { isSubmitting, errors, isValid }, //sSubmitting: Trạng thái khi form đang được submit -  errors: Các lỗi của các trường trong form -  isValid: Trạng thái hợp lệ của form.
  } = useForm({
    mode: "onTouched",
  });
  //Hàm bất đồng bộ được gọi khi form được submit
  async function submitForm(data: FieldValues) {
    try {
      await dispatch(signInUser(data)); // Dispatch action signInUser với dữ liệu từ form để thực hiện quá trình đăng nhập
      navigate(location.state?.from || "/catalog"); //Sau khi đăng nhập thành công, điều hướng người dùng đến trang trước đó hoặc đến trang /catalog nếu không có trang trước đó.
    } catch (error) {
      console.log(error); //Nếu có lỗi xảy ra trong quá trình đăng nhập, lỗi sẽ được log ra console.
    }
  }

  return (
    <Container
      component={Paper}
      maxWidth="sm"
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <LockOutlined />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(submitForm)}
        noValidate
        sx={{ mt: 1 }}
      >
        <TextField
          margin="normal"
          fullWidth
          label="Username"
          autoComplete="username"
          autoFocus
          {...register("username", { required: "Username is required" })}
          error={!!errors.username}
          helperText={errors?.username?.message as string}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register("password", { required: "Password is required" })}
          error={!!errors.password}
          helperText={errors.password?.message as string}
        />
        <LoadingButton
          loading={isSubmitting}
          disabled={!isValid}
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </LoadingButton>
        <Grid container>
          <Grid item>
            <Link to="/register" style={{ textDecoration: "none" }}>
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
