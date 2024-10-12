using API.Data;
using API.DTOs;
using API.Entities;
using API.Entities.OrderAggregate;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class OrdersController : BaseApiController
{
    // Sử dụng StoreContext để tương tác với cơ sở dữ liệu
    private readonly StoreContext _context;

    // Constructor nhận vào StoreContext
    public OrdersController(StoreContext context)
    {
        _context = context;
    }

    // Phương thức GET để lấy danh sách các đơn hàng của người dùng hiện tại
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders()
    {
        // Truy vấn cơ sở dữ liệu để lấy các đơn hàng và chuyển đổi thành OrderDto
        var orders = await _context.Orders
            .ProjectOrderToOrderDto() // Chuyển đổi Order thành OrderDto
            .Where(x => x.BuyerId == User.Identity.Name) // Lọc các đơn hàng theo BuyerId
            .ToListAsync(); // Chuyển đổi kết quả thành danh sách

        // Trả về danh sách đơn hàng
        return orders;
    }

    // Phương thức GET để lấy chi tiết một đơn hàng cụ thể
    [HttpGet("{id}", Name = "GetOrder")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        // Truy vấn cơ sở dữ liệu để lấy đơn hàng cụ thể và chuyển đổi thành OrderDto
        return await _context.Orders
            .ProjectOrderToOrderDto() // Chuyển đổi Order thành OrderDto
            .Where(x => x.BuyerId == User.Identity.Name && x.Id == id) // Lọc theo BuyerId và Id
            .FirstOrDefaultAsync(); // Lấy kết quả đầu tiên (hoặc null nếu không có)
    }

    // Phương thức POST để tạo một đơn hàng mới
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
    {
        // Lấy giỏ hàng của người dùng hiện tại
        var basket = await _context.Baskets
            .RetrieveBasketWithItems(User.Identity.Name) // Truy vấn giỏ hàng kèm các mặt hàng
            .FirstOrDefaultAsync(); // Lấy kết quả đầu tiên (hoặc null nếu không có)

        // Nếu không tìm thấy giỏ hàng, trả về lỗi
        if (basket == null) return BadRequest(new ProblemDetails { Title = "Could not locate basket" });

        var items = new List<OrderItem>(); // Tạo danh sách các mặt hàng trong đơn hàng

        // Duyệt qua các mặt hàng trong giỏ hàng
        foreach (var item in basket.Items)
        {
            var productItem = await _context.Products.FindAsync(item.ProductId); // Lấy thông tin sản phẩm
            var itemOrdered = new ProductItemOrdered
            {
                ProductId = productItem.Id,
                Name = productItem.Name,
                PictureUrl = productItem.PictureUrl
            };
            var orderItem = new OrderItem
            {
                ItemOrdered = itemOrdered,
                Price = productItem.Price,
                Quantity = item.Quantity
            };
            items.Add(orderItem); // Thêm mặt hàng vào danh sách
            productItem.QuantityInStock -= item.Quantity; // Giảm số lượng tồn kho
        }

        var subtotal = items.Sum(item => item.Price * item.Quantity); // Tính tổng giá trị đơn hàng
        var deliveryFee = subtotal > 10000 ? 0 : 500; // Tính phí giao hàng

        var order = new Order
        {
            OrderItems = items,
            BuyerId = User.Identity.Name,
            ShippingAddress = orderDto.ShippingAddress,
            Subtotal = subtotal,
            DeliveryFee = deliveryFee,
            PaymentIntentId = basket.PaymentIntentId
        };

        _context.Orders.Add(order); // Thêm đơn hàng vào cơ sở dữ liệu
        _context.Baskets.Remove(basket); // Xóa giỏ hàng sau khi tạo đơn hàng

        // Nếu người dùng muốn lưu địa chỉ giao hàng
        if (orderDto.SaveAddress)
        {
            var user = await _context.Users
                .Include(a => a.Address) // Bao gồm địa chỉ của người dùng
                .FirstOrDefaultAsync(x => x.UserName == User.Identity.Name);

            var address = new UserAddress
            {
                FullName = orderDto.ShippingAddress.FullName,
                Address1 = orderDto.ShippingAddress.Address1,
                Address2 = orderDto.ShippingAddress.Address2,
                City = orderDto.ShippingAddress.City,
                State = orderDto.ShippingAddress.State,
                Zip = orderDto.ShippingAddress.Zip,
                Country = orderDto.ShippingAddress.Country
            };
            user.Address = address; // Cập nhật địa chỉ của người dùng
        }

        var result = await _context.SaveChangesAsync() > 0; // Lưu thay đổi vào cơ sở dữ liệu

        // Nếu tạo đơn hàng thành công, trả về thông tin đơn hàng
        if (result) return CreatedAtRoute("GetOrder", new { id = order.Id }, order.Id);

        // Nếu tạo đơn hàng thất bại, trả về lỗi
        return BadRequest("Problem creating order");
    }
}

