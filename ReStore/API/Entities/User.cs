using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class User : IdentityUser<int> // ko cần thêm bất kỳ thuộc tính nào vì nó kế thử từ IdentityUser hết rồi
    {
        public UserAddress Address { get; set; }
    }
}