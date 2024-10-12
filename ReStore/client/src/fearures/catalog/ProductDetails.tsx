import {
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../../app/errors/NotFound";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { LoadingButton } from "@mui/lab";
import {
  useAppDispatch,
  useAppSelector,
} from "../../app/api/store/configureStore";
import {
  addBasketItemAsync,
  removeBasketItemAsync,
} from "../basket/basketSlice";
import { fetchProductAsync, productSelectors } from "./catalogSlice";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>(); //lấy id từ URL dùng để xác định sản phẩm cần hiển thị
  const dispatch = useAppDispatch();
  const { basket, status } = useAppSelector((state) => state.basket);
  const product = useAppSelector((state) =>
    productSelectors.selectById(state, id!)
  );
  const { status: productStatus } = useAppSelector((state) => state.catalog);
  const [quantity, setQuantity] = useState(0); //lưu số lương sản phẩm trong giỏ hàng
  const item = basket?.items.find((i) => i.productId === product?.id); //tìm sản phảm hiện tại trong giỏ hàng

  useEffect(() => {
    //nếu iud hoặc item hoặc product thay đổi useEffect sẽ chạy
    if (item) setQuantity(item.quantity); //nếu item tồn tại cập nhâp quantity
    if (!product && id) dispatch(fetchProductAsync(parseInt(id))); //nếu product không tồn tại và có id , tải sản phẩm từ server xuống
  }, [id, item, product, dispatch]);

  //handleInputChange cập nhật quantity khi người dùng thay đổi giá trị trong ô nhập.
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (parseInt(event.currentTarget.value) >= 0)
      setQuantity(parseInt(event.currentTarget.value));
  }

  function handleUpdateCart() {
    if (!product) return; //nếu product không tồn tại hàm sẽ dừng lại và ko thực hiện thêm hành động nào

    //!item kiểm tra sản phẩm chưa có trong giỏ hàng
    //quantity > item?.quantity: Kiểm tra nếu số lượng mới (quantity) lớn hơn số lượng hiện tại trong giỏ hàng (item.quantity).
    if (!item || quantity > item?.quantity) {
      // Nếu sản phẩm đã có trong giỏ hàng (item tồn tại), tính toán số lượng cần thêm vào giỏ hàng (quantity - item.quantity).
      // Nếu sản phẩm chưa có trong giỏ hàng (item không tồn tại), số lượng cần thêm vào giỏ hàng là quantity
      const updatedQuantity = item ? quantity - item.quantity : quantity;
      dispatch(
        //Gửi một action addBasketItemAsync đến Redux store để thêm sản phẩm vào giỏ hàng với số lượng updatedQuantity.
        addBasketItemAsync({ productId: product.id, quantity: updatedQuantity })
      );
    } else {
      //Tính toán số lượng sản phẩm cần bớt đi từ giỏ hàng (item.quantity - quantity).
      const updatedQuantity = item.quantity - quantity;
      dispatch(
        //Gửi một action removeBasketItemAsync đến Redux store để bớt sản phẩm từ giỏ hàng với số lượng updatedQuantity.
        removeBasketItemAsync({
          productId: product.id,
          quantity: updatedQuantity,
        })
      );
    }
  }

  //   Nếu productStatus đang tải, hiển thị thông báo đang tải.
  // Nếu product không tồn tại, hiển thị trang NotFound.
  if (productStatus.includes("pending"))
    return <LoadingComponent message="Loading product..." />;

  if (!product) return <NotFound />;

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <img
          src={product.pictureUrl}
          alt={product.name}
          style={{ width: "100%" }}
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h3">{product.name}</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h4" color="secondary">
          ${(product.price / 100).toFixed(2)}
        </Typography>
        <TableContainer>
          <Table>
            <TableBody sx={{ fontSize: "1.1em" }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{product.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>{product.description}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>{product.type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Brand</TableCell>
                <TableCell>{product.brand}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Quantity in stock</TableCell>
                <TableCell>{product.quantityInStock}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              onChange={handleInputChange}
              variant={"outlined"}
              type={"number"}
              label={"Quantity in Cart"}
              fullWidth
              value={quantity}
            />
          </Grid>
          <Grid item xs={6}>
            <LoadingButton
              disabled={
                item?.quantity === quantity || (!item && quantity === 0)
              }
              loading={status.includes("pending")}
              onClick={handleUpdateCart}
              sx={{ height: "55px" }}
              color={"primary"}
              size={"large"}
              variant={"contained"}
              fullWidth
            >
              {item ? "Update Quantity" : "Add to Cart"}
            </LoadingButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
