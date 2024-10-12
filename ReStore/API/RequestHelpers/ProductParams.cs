using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.RequestHelpers
{
    public class ProductParams : PaginationParams
    {
        public string OrderBy { get; set; } // Thuộc tính để xác định tiêu chí sắp xếp sản phẩm 
        public string SearchTerm { get; set; } // Thuộc tính để tìm kiếm sản phẩm theo từ khóa.
        public string Types { get; set; } // Thuộc tính để lọc sản phẩm theo loại (type).
        public string Brands { get; set; } // Thuộc tính để lọc sản phẩm theo thương hiệu (brand).
        public new int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}