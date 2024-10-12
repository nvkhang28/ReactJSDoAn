using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
// File này chứa các phương thức mở rộng cho product cho phép thêm chức năng ms mà ko cần phải kế thừa hay thay đổi mã nguồn gốc 
// query là một đối tượng truy vấn LINQ (Language Integrated Query) mà bạn có thể sử dụng để thực hiện các thao tác truy vấn cơ sở dữ liệu như lọc, sắp xếp, nhóm, và chọn dữ liệu. 
//Trong các ứng dụng .NET, query thường là một đối tượng IQueryable<T>, nơi T là loại của các đối tượng bạn đang truy vấn (ví dụ: Product).
namespace API.Extensions
{
    //khai báo lớp tĩnh để chứa các phương thức mở rộng
    public static class ProductExtensions
    {
        //định nghĩa phương thức mở rộng sort cho IQueryable<Product>
        public static IQueryable<Product> Sort(this IQueryable<Product> query, string orderBy)
        {
            //Kiểm tra nếu orderBy là null, rỗng hoặc chỉ chứa khoảng trắng thì sắp xếp theo tên của sản phẩm.
            if (string.IsNullOrWhiteSpace(orderBy)) return query.OrderBy(p => p.Name);
            query = orderBy switch// sử dụng phương thức switch để xd tiêu chí sắp xêp 
            {
                "price" => query.OrderBy(p => p.Price),// sắp xếp theo giá tăng dần 
                "priceDesc" => query.OrderByDescending(p => p.Price),// sắp xếp theo giá giảm dần 
                _ => query.OrderBy(p => p.Name)// sắp xếp theo tên sản phẩm 
            };
            return query;
        }

        //tìm kiếm sản phẩm 
        // IQuery<Product>Search: Phương thức này trả về một IQueryable<Product> cho phép tiếp tục truy vấn
        //this IQueryable<Product> query: this chỉ ra rằng đây là một phương thức mở rộng cho đối tượng IQueryable<Product>. Nó cho phép gọi phương thức Search trên bất kỳ IQueryable<Product> nào.
        // string searchTerm tham só tìm kiếm đc sử dụng dể lọc các sp 
        public static IQueryable<Product> Search(this IQueryable<Product> query, string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm)) return query;// nếu searchTerm là null hoặc rỗng thì trả về query ban đầu không thực hiên thêm bất kỳ lọc nào 
            var lowerCaseSearchTerm = searchTerm.Trim().ToLower();//trim loại bỏ khoảng trăng 2 đầu , ToLower chuyển đổi thành chữ thường để ko phân biệt chữ hoa chữ thường
            return query.Where(p => p.Name.ToLower().Contains(lowerCaseSearchTerm));//lọc các sản phẩm sau khi chuển thành chữ thường , container() ktr xem sản phẩm có chứa chuỗi xử lý hay ko 
        }

        //lọc sản phẩm 
        public static IQueryable<Product> Filter(this IQueryable<Product> query, string brands, string types)
        {
            //tạo 2 ds troong để lưu thương hiệu vs loại sản phẩm 
            var brandList = new List<string>();
            List<string> typeList = new();

            //Kiểm tra nếu brands không phải là null hoặc rỗng.
            //Chuyển đổi chuỗi brands thành chữ thường, tách nó thành các phần tử dựa trên dấu phẩy, và thêm các phần tử vào brandList.
            if (!string.IsNullOrEmpty(brands))
            {
                brandList.AddRange(brands.ToLower().Split(",").ToList());
            }
            //Kiểm tra nếu types không phải là null hoặc rỗng.
            //Chuyển đổi chuỗi types thành chữ thường, tách nó thành các phần tử dựa trên dấu phẩy, và thêm các phần tử vào typeList.
            if (!string.IsNullOrEmpty(types))
            {
                typeList.AddRange(types.ToLower().Split(",").ToList());
            }

            //Nếu brandList rỗng, không lọc theo thương hiệu.
            //Nếu brandList không rỗng, chỉ giữ lại các sản phẩm có thương hiệu nằm trong brandList.
            query = query.Where(p => brandList.Count == 0 || brandList.Contains(p.Brand.ToLower()));

            //Nếu typeList rỗng, không lọc theo loại sản phẩm.
            //Nếu typeList không rỗng, chỉ giữ lại các sản phẩm có loại nằm trong typeList.
            query = query.Where(p => typeList.Count == 0 || typeList.Contains(p.Type.ToLower()));

            return query;
        }

    }
}

// page: Chỉ định số trang mà người dùng muốn truy cập. Thông thường, trang đầu tiên là 1.
// pageSize (hoặc limit): Chỉ định số lượng mục (items) trên mỗi trang. Ví dụ, nếu pageSize là 10, mỗi trang sẽ chứa 10 mục.
// offset: Chỉ định số mục cần bỏ qua trước khi bắt đầu lấy dữ liệu. Thường dùng thay thế cho page trong một số API.
// sort: Chỉ định thứ tự sắp xếp của dữ liệu (ví dụ: theo asc hoặc desc).
// orderBy: Chỉ định trường (field) nào trong dữ liệu sẽ được sử dụng để sắp xếp.