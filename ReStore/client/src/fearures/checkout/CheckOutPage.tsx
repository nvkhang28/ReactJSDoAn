import {
  Box,
  Button,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import AddressForm from "./AddressFrom";
import PaymentForm from "./PaymentForm";
import Review from "./Review";
import { useForm, FieldValues, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { validationSchema } from "./checkoutValidation";
import {
  useAppDispatch,
  useAppSelector,
} from "../../app/api/store/configureStore";
import agent from "../../app/api/agent";
import { clearBasket } from "../basket/basketSlice";
import { LoadingButton } from "@mui/lab";
import { StripeElementType } from "@stripe/stripe-js";
import {
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

// Khai báo các bước trong quy trình thanh toán
const steps = ["Shipping address", "Review your order", "Payment details"];

export default function CheckoutPage() {
  // Sử dụng useState để quản lý trạng thái của các bước
  const [activeStep, setActiveStep] = useState(0); // Bước hiện tại
  const [orderNumber, setOrderNumber] = useState(0); // Số đơn hàng sau khi thanh toán thành công
  const [loading, setLoading] = useState(false); // Trạng thái loading khi gửi đơn hàng
  const dispatch = useAppDispatch(); // Khởi tạo dispatch từ Redux
  const [cardState, setCardState] = useState<{
    elementError: { [key in StripeElementType]?: string };
  }>({ elementError: {} }); // Trạng thái lỗi của các thành phần thẻ
  const [cardComplete, setCardComplete] = useState<any>({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  }); // Trạng thái hoàn thành của các trường thẻ
  const [paymentMessage, setPaymentMessage] = useState(""); // Thông báo thanh toán
  const [paymentSucceeded, setPaymentSucceeded] = useState(false); // Trạng thái thành công của thanh toán
  const { basket } = useAppSelector((state) => state.basket); // Lấy giỏ hàng từ state Redux
  const stripe = useStripe(); // Khởi tạo Stripe instance
  const elements = useElements(); // Khởi tạo Elements instance của Stripe

  // Hàm lấy nội dung của từng bước
  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return <AddressForm />; // Bước nhập địa chỉ
      case 1:
        return <Review />; // Bước xem lại đơn hàng
      case 2:
        return (
          <PaymentForm
            cardState={cardState}
            onCardInputChange={onCardInputChange}
          />
        ); // Bước nhập chi tiết thanh toán
      default:
        throw new Error("Unknown step");
    }
  }

  // Hàm xử lý thay đổi trên các trường thẻ thanh toán
  function onCardInputChange(event: any) {
    setCardState({
      ...cardState,
      elementError: {
        ...cardState.elementError,
        [event.elementType]: event.error?.message,
      },
    }); // Cập nhật trạng thái lỗi của thẻ
    setCardComplete({ ...cardComplete, [event.elementType]: event.complete }); // Cập nhật trạng thái hoàn thành của thẻ
  }

  const currentValidationSchema = validationSchema[activeStep]; // Schema xác thực hiện tại cho bước hiện tại

  const methods = useForm({
    mode: "onTouched",
    resolver: yupResolver(currentValidationSchema),
  }); // Khởi tạo các phương thức form từ React Hook Form với yup resolver

  // Lấy địa chỉ người dùng từ API khi component được mount
  useEffect(() => {
    agent.Account.fetchAddress().then((response) => {
      if (response) {
        methods.reset({
          ...methods.getValues(),
          ...response,
          saveAddress: false,
        }); // Đặt lại giá trị form với địa chỉ từ API
      }
    });
  }, [methods]);

  // Hàm gửi đơn hàng
  async function submitOrder(data: FieldValues) {
    setLoading(true); // Bật trạng thái loading
    const { nameOnCard, saveAddress, ...shippingAddress } = data; // Lấy thông tin từ form
    if (!basket?.clientSecret || !stripe || !elements) return; // Stripe chưa sẵn sàng
    try {
      const cardElement = elements.getElement(CardNumberElement); // Lấy phần tử thẻ
      const paymentResult = await stripe.confirmCardPayment(
        basket.clientSecret,
        {
          payment_method: {
            card: cardElement!,
            billing_details: {
              name: nameOnCard,
            },
          },
        }
      ); // Xác nhận thanh toán bằng Stripe
      console.log(paymentResult);
      if (paymentResult.paymentIntent?.status === "succeeded") {
        const orderNumber = await agent.Orders.create({
          saveAddress,
          shippingAddress,
        }); // Tạo đơn hàng mới
        setOrderNumber(orderNumber); // Cập nhật số đơn hàng
        setPaymentSucceeded(true); // Cập nhật trạng thái thành công của thanh toán
        setPaymentMessage("Thank you - we have received your payment"); // Đặt thông báo thanh toán thành công
        setActiveStep(activeStep + 1); // Chuyển sang bước tiếp theo
        dispatch(clearBasket()); // Xóa giỏ hàng
        setLoading(false); // Tắt trạng thái loading
      } else {
        setPaymentMessage(paymentResult.error?.message || "Payment failed"); // Đặt thông báo lỗi thanh toán
        setPaymentSucceeded(false); // Cập nhật trạng thái thanh toán thất bại
        setLoading(false); // Tắt trạng thái loading
        setActiveStep(activeStep + 1); // Chuyển sang bước tiếp theo
      }
    } catch (error) {
      console.log(error);
      setLoading(false); // Tắt trạng thái loading khi có lỗi
    }
  }

  // Hàm xử lý chuyển sang bước tiếp theo
  const handleNext = async (data: FieldValues) => {
    if (activeStep === steps.length - 1) {
      await submitOrder(data); // Gửi đơn hàng nếu là bước cuối cùng
    } else {
      setActiveStep(activeStep + 1); // Chuyển sang bước tiếp theo
    }
  };

  // Hàm xử lý quay lại bước trước
  const handleBack = () => {
    setActiveStep(activeStep - 1); // Quay lại bước trước đó
  };

  // Hàm kiểm tra nút submit có bị vô hiệu hóa không
  function submitDisabled(): boolean {
    if (activeStep === steps.length - 1) {
      return (
        !cardComplete.cardCvc ||
        !cardComplete.cardExpiry ||
        !cardComplete.cardNumber ||
        !methods.formState.isValid
      ); // Vô hiệu hóa nếu các trường thẻ chưa hoàn thành hoặc form không hợp lệ
    } else {
      return !methods.formState.isValid; // Vô hiệu hóa nếu form không hợp lệ ở các bước khác
    }
  }

  // Render giao diện người dùng
  return (
    <FormProvider {...methods}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="center">
          Checkout
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <>
          {activeStep === steps.length ? ( // Nếu đã hoàn thành tất cả các bước
            <>
              <Typography variant="h5" gutterBottom>
                {paymentMessage} // Hiển thị thông báo thanh toán
              </Typography>
              {paymentSucceeded ? (
                <Typography variant="subtitle1">
                  Your order number is #{orderNumber}. We have not emailed your
                  order confirmation, and will not send you an update when your
                  order has shipped as this is a fake store!
                </Typography> // Thông báo số đơn hàng khi thanh toán thành công
              ) : (
                <Button variant="contained" onClick={handleBack}>
                  Go back and try again // Nút quay lại để thử thanh toán lại
                </Button>
              )}
            </>
          ) : (
            <form onSubmit={methods.handleSubmit(handleNext)}>
              {getStepContent(activeStep)} // Hiển thị nội dung bước hiện tại
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back // Nút quay lại nếu không phải bước đầu tiên
                  </Button>
                )}
                <LoadingButton
                  loading={loading}
                  disabled={submitDisabled()}
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3, ml: 1 }}
                >
                  {activeStep === steps.length - 1 ? "Place order" : "Next"}
                  // Hiển thị "Place order" nếu là bước cuối cùng, ngược lại
                  hiển thị "Next"
                </LoadingButton>
              </Box>
            </form>
          )}
        </>
      </Paper>
    </FormProvider>
  );
}
