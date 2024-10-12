using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace API.Entities.OrderAggregate
{
    //đây là lớp địa chỉ giao hàng kế thừa từ lớp Address
    [Owned]
    public class ShippingAddress : Address
    {

    }
}