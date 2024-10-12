using System.Text.Json;
using API.RequestHelpers;

namespace API.Extensions
{
    public static class HttpExtensions
    {
        public static void AddPaginationHeader(this HttpResponse response, MetaData metaData)
        {
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

            // Sử dụng Append để thêm hoặc cập nhật tiêu đề
            if (response.Headers.ContainsKey("Pagination"))
            {
                response.Headers["Pagination"] = JsonSerializer.Serialize(metaData, options);
            }
            else
            {
                response.Headers.Append("Pagination", JsonSerializer.Serialize(metaData, options));
            }

            // Sử dụng Append để thêm tiêu đề Access-Control-Expose-Headers
            if (!response.Headers.ContainsKey("Access-Control-Expose-Headers"))
            {
                response.Headers.Append("Access-Control-Expose-Headers", "Pagination");
            }
        }
    }
}