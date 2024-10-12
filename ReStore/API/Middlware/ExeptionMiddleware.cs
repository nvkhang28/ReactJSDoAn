using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace API.Middlware
{
    public class ExeptionMiddleware
    {
        private readonly RequestDelegate _next; //chuyển đến middlware khác khi không có lỗi
        private readonly ILogger<ExeptionMiddleware> _logger;// được sử dụng để ghi lại thông tin nhật ký , đăc biệt khi xảy ra lỗi
        private readonly IHostEnvironment _env;// sử dụng để ktr môi trường hiện tại 

        public ExeptionMiddleware(RequestDelegate next, ILogger<ExeptionMiddleware> logger, IHostEnvironment env)
        {
            _env = env;
            _logger = logger;
            _next = next;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);// sẽ chuyển sang middlware tiếp theo nếu không xảy ra lỗi
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);// dược sử dụng để ghi lại thông điệp lỗi
                context.Response.ContentType = "application/json";// đặt nội dụng phản hồi là Json mã trạng thái HTTP là 500
                context.Response.StatusCode = 500;

                var response = new ProblemDetails// Tạo phản hồi lỗi chuẩn với thông tin về trạng thái, tiêu đề và chi tiết lỗi
                {
                    Status = 500,
                    Detail = _env.IsDevelopment() ? ex.StackTrace?.ToString() : null,
                    Title = ex.Message
                };

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var json = JsonSerializer.Serialize(response, options);
                await context.Response.WriteAsync(json);


            }
        }
    }
}