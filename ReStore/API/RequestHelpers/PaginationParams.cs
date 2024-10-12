using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.RequestHelpers
{
    //dùng để phân trang , giúp chia nhỏ dữ liệu thành các trang nhỏ hơn để dễ dàng quản lý truy xuất
    public class PaginationParams
    {
        private const int MaxPageSize = 50;//giá trị kích thước tối đa
        public int PageNumber { get; set; } = 1; // số trang mặc định là 1  Giá trị mặc định được đặt là 1, tức là nếu người dùng không chỉ định số trang, API sẽ trả về dữ liệu của trang đầu tiên.
        private int _pageSize = 6; // Biến private lưu trữ kích thước trang mặc định
        public int pageSize
        {
            get => _pageSize;// Getter trả về giá trị của _pageSize
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;// Setter kiểm tra và giới hạn kích thước trang
        }
    }
}