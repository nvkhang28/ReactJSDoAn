using API.Data;
using API.DTOs;
using API.Entities.OrderAggregate;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace API.Controllers
{
    // PaymentsController xử lý các yêu cầu liên quan đến thanh toán
    public class PaymentsController : BaseApiController
    {
        private readonly PaymentService _paymentService;
        private readonly StoreContext _context;
        private readonly IConfiguration _config;

        // Constructor tiêm vào các dịch vụ và ngữ cảnh cần thiết
        public PaymentsController(PaymentService paymentService, StoreContext context, IConfiguration config)
        {
            _config = config;
            _context = context;
            _paymentService = paymentService;
        }

        // Phương thức này yêu cầu người dùng phải xác thực
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent()
        {
            // Lấy giỏ hàng của người dùng hiện tại
            var basket = await _context.Baskets
                .RetrieveBasketWithItems(User.Identity.Name) // Lấy giỏ hàng với các mặt hàng
                .FirstOrDefaultAsync();

            // Nếu giỏ hàng không tồn tại, trả về NotFound
            if (basket == null) return NotFound();

            // Tạo hoặc cập nhật PaymentIntent
            var intent = await _paymentService.CreateOrUpdatePaymentIntent(basket);

            // Nếu không thể tạo hoặc cập nhật PaymentIntent, trả về BadRequest
            if (intent == null) return BadRequest(new ProblemDetails { Title = "Problem creating payment intent" });

            // Cập nhật PaymentIntentId và ClientSecret trong giỏ hàng
            basket.PaymentIntentId = basket.PaymentIntentId ?? intent.Id;
            basket.ClientSecret = basket.ClientSecret ?? intent.ClientSecret;

            // Cập nhật giỏ hàng trong ngữ cảnh cơ sở dữ liệu
            _context.Update(basket);

            // Lưu các thay đổi vào cơ sở dữ liệu và kiểm tra kết quả
            var result = await _context.SaveChangesAsync() > 0;

            // Nếu không lưu được thay đổi, trả về BadRequest
            if (!result) return BadRequest(new ProblemDetails { Title = "Problem updating basket with intent" });

            // Trả về DTO của giỏ hàng
            return basket.MapBasketToDto();
        }

        // Phương thức này cho phép truy cập ẩn danh (không yêu cầu xác thực)
        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<ActionResult> StripeWebhook()
        {
            // Đọc dữ liệu từ body của yêu cầu
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            // Tạo sự kiện Stripe từ dữ liệu JSON
            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"],
                _config["StripeSettings:WhSecret"]);

            // Lấy thông tin về charge từ sự kiện Stripe
            var charge = (Charge)stripeEvent.Data.Object;

            // Tìm đơn hàng liên quan dựa trên PaymentIntentId
            var order = await _context.Orders.FirstOrDefaultAsync(x =>
                x.PaymentIntentId == charge.PaymentIntentId);

            // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng
            if (charge.Status == "succeeded") order.OrderStatus = OrderStatus.PaymentReceived;

            // Lưu các thay đổi vào cơ sở dữ liệu
            await _context.SaveChangesAsync();

            // Trả về EmptyResult để xác nhận đã xử lý webhook thành công
            return new EmptyResult();
        }
    }
}