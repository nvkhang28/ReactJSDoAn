import { Button, Menu, Fade, MenuItem } from "@mui/material";
import { useState } from "react";
import { signOut } from "../../fearures/account/accountSlice";
import {
  useAppDispatch,
  useAppSelector,
} from "../../app/api/store/configureStore";
import { clearBasket } from "../../fearures/basket/basketSlice";
import { Link } from "react-router-dom";

//SignedInMenu là một thành phần React sử dụng Material-UI để hiển thị menu cho người dùng đã đăng nhập. Menu này bao gồm các tùy chọn như "Profile", "My orders" và "Logout".
export default function SignedInMenu() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.account);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button color="inherit" onClick={handleClick} sx={{ typography: "h6" }}>
        {user?.email}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem component={Link} to="/orders">
          My orders
        </MenuItem>
        <MenuItem
          onClick={() => {
            dispatch(signOut());
            dispatch(clearBasket());
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
