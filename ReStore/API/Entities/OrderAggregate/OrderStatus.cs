namespace API.Entities.OrderAggregate
{
    public enum OrderStatus
    {
        Pending, //chờ xử lý 
        PaymentReceived,// thanh toán đơn hnagf thành công
        PaymentFailed//đơn hnafg thất bại hoặc đã bị hủy
    }
}