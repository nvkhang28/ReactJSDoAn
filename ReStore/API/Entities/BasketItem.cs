using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;
//à một lớp trong mô hình dữ liệu được ánh xạ trực tiếp đến một bảng trong cơ sở dữ liệu. Mỗi instance của lớp entity tương ứng với một hàng (row) trong bảng đó.
[Table("BasketItems")]
public class BasketItem
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; }
    public int BasketId { get; set; }
    public Basket Basket { get; set; }
}