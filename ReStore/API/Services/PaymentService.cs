using API.Entities;
using Stripe;

namespace API.Services
{
    public class PaymentService
    {
        // Đối tượng cấu hình, được tiêm vào qua Dependency Injection
        private readonly IConfiguration _config;

        // PaymentService là một dịch vụ được sử dụng để quản lý các thanh toán. Nó sử dụng Stripe API để tạo hoặc cập nhật PaymentIntent.
        //PaymentService(IConfiguration config) là constructor của lớp, nó nhận một đối tượng IConfiguration và lưu trữ nó trong biến _config. Điều này cho phép lớp truy cập các cấu hình (như khóa API của Stripe) từ file cấu hình
        public PaymentService(IConfiguration config)
        {
            _config = config;
        }

        // Phương thức để tạo hoặc cập nhật PaymentIntent cho một giỏ hàng
        public async Task<PaymentIntent> CreateOrUpdatePaymentIntent(Basket basket)
        {
            // Thiết lập khóa API của Stripe từ cấu hình
            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            // Tạo dịch vụ PaymentIntent của Stripe
            var service = new PaymentIntentService();

            var intent = new PaymentIntent();

            // Tính tổng phụ dựa trên số lượng và giá của các mặt hàng trong giỏ
            var subtotal = basket.Items.Sum(i => i.Quantity * i.Product.Price);

            // Tính phí giao hàng, miễn phí nếu tổng phụ lớn hơn 10000
            var deliveryFee = subtotal > 10000 ? 0 : 500;

            // Nếu PaymentIntentId của giỏ hàng rỗng, tạo một PaymentIntent mới
            if (string.IsNullOrEmpty(basket.PaymentIntentId))
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = subtotal + deliveryFee, // Số tiền thanh toán (tổng phụ + phí giao hàng)
                    Currency = "usd", // Đơn vị tiền tệ là USD
                    PaymentMethodTypes = new List<string> { "card" } // Loại phương thức thanh toán là thẻ
                };
                intent = await service.CreateAsync(options); // Tạo PaymentIntent mới
            }
            // Nếu không, cập nhật PaymentIntent hiện có với số tiền mới
            else
            {
                var options = new PaymentIntentUpdateOptions
                {
                    Amount = subtotal + deliveryFee // Số tiền thanh toán mới
                };
                await service.UpdateAsync(basket.PaymentIntentId, options); // Cập nhật PaymentIntent
            }

            return intent; // Trả về PaymentIntent đã tạo hoặc cập nhật
        }
    }
}
