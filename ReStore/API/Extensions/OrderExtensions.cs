using API.DTOs;
using API.Entities.OrderAggregate;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    // Lớp mở rộng (extension) cho IQueryable<Order>
    public static class OrderExtensions
    {
        // Phương thức mở rộng để chuyển đổi từ Order sang OrderDto
        public static IQueryable<OrderDto> ProjectOrderToOrderDto(this IQueryable<Order> query)
        {
            return query
                .Select(order => new OrderDto
                {
                    Id = order.Id, // ID của đơn hàng
                    BuyerId = order.BuyerId, // ID người mua
                    OrderDate = order.OrderDate, // Ngày đặt hàng
                    ShippingAddress = order.ShippingAddress, // Địa chỉ giao hàng
                    DeliveryFee = order.DeliveryFee, // Phí giao hàng
                    Subtotal = order.Subtotal, // Tổng phụ (chưa bao gồm phí giao hàng và thuế)
                    OrderStatus = order.OrderStatus.ToString(), // Trạng thái đơn hàng (chuỗi)
                    Total = order.GetTotal(), // Tổng số tiền của đơn hàng
                    OrderItems = order.OrderItems.Select(item => new OrderItemDto
                    {
                        ProductId = item.ItemOrdered.ProductId, // ID sản phẩm
                        Name = item.ItemOrdered.Name, // Tên sản phẩm
                        PictureUrl = item.ItemOrdered.PictureUrl, // URL hình ảnh sản phẩm
                        Price = item.Price, // Giá sản phẩm
                        Quantity = item.Quantity // Số lượng sản phẩm
                    }).ToList() // Chuyển đổi sang danh sách OrderItemDto
                })
                .AsNoTracking(); // Đảm bảo không theo dõi các thay đổi của các thực thể trả về
        }
    }
}