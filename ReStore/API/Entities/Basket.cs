using System.Collections.Generic;

namespace API.Entities
{
    public class Basket
    {
        public int Id { get; set; } //id này là id của sản phẩn
        public string BuyerId { get; set; } // id này là id của người mua

        // tạo một id ngẫu nhiên để theo dỗi xem giỏ hàng này là của ai 
        // tạo ra ds các mặt hàng có trong giỏ hàng
        public List<BasketItem> Items { get; set; } = new List<BasketItem>();
        public string PaymentIntentId { get; set; }
        public string ClientSecret { get; set; }


        //phướng thức này để thêm sản phẩm vào giỏ hàng,Product product là thêm sản phẩm nào vào trong giỏ hàng còn Quantity là để bt số lượng là bao nhiêu 
        public void AddItem(Product product, int quantity)
        {
            // đẩu tiền nó sẽ là 1 tệp rỗng và sẽ sử dụng phương thức all để kiểm tra xem bên trong giỏ hàng của mk có sản phẩm đố chưa, 
            // nếu chưa có thì sẽ trả ra sản phẩm ms trong giỏ hàng 
            if (Items.All(item => item.ProductId != product.Id))
            {
                // nếu ko có sản phẩm này trong giỏ hàng thì sẽ tạo một giỏ hàng ms vs sản phẩm và số lươnhgj
                Items.Add(new BasketItem { Product = product, Quantity = quantity });
            }

            // Đoạn mã bạn cung cấp được sử dụng để tìm một mục (item) trong giỏ hàng (Items) có ProductId trùng với Id của sản phẩm (product.Id) mà bạn muốn thêm vào. Nếu tìm thấy mục đó, nó sẽ cập nhật số lượng (Quantity) của mục đó bằng cách thêm số lượng mới (quantity
            var existingItem = Items.FirstOrDefault(item => item.ProductId == product.Id);
            if (existingItem != null) existingItem.Quantity += quantity;
        }

        public void RemoveItem(int productId, int quantity)
        {
            var item = Items.FirstOrDefault(item => item.ProductId == productId);
            if (item == null) return;
            item.Quantity -= quantity;
            if (item.Quantity == 0) Items.Remove(item);
        }
    }
}