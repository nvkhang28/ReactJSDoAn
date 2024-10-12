using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
//dùng để truyền tải dữ liệu của một mục hàng trong giỏ hàng giữa các tầng của ứng dụng hoặc giữa server và client
namespace API.DTOs
{
    public class BasketItemDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string PictureUrl { get; set; }
        public string Type { get; set; }
        public string Brand { get; set; }
        public int Quantity { get; set; }
    }
}