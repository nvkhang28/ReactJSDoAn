using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService
{
    private readonly UserManager<User> _userManager; // quản lí người dùng cấp các chức năng liên quan đến việc tạo cập nhật xóa
    private readonly IConfiguration _config;// cấu hình ứng dụng chứa các thông tin cấu hình 

    //Hàm khởi tạo nhận vào UserManager<User> và IConfiguration để khởi tạo các biến thành viên.
    public TokenService(UserManager<User> userManager, IConfiguration config)
    {
        _config = config;
        _userManager = userManager;
    }
    //Phương thức này tạo ra một JWT cho người dùng được truyền vào
    public async Task<string> GenerateToken(User user)
    {
        //claims  là danh sách các thông tin về người dùng sẽ được lưu trong token. Bao gồm email và tên người dùng.
        var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName)
            };

        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }
        //tạo khóa bí mật
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWTSettings:TokenKey"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

        var tokenOptions = new JwtSecurityToken(
            issuer: null,//issuer: Đặt là null trong ví dụ này, thường dùng để chỉ định ai là người phát hành token.
            audience: null,//audience: Đặt là null, thường dùng để chỉ định ai là người nhận token.
            claims: claims,//claims: Danh sách các claims đã được tạo từ trước (chứa thông tin về người dùng).
            expires: DateTime.Now.AddDays(7),//expires: Thời gian hết hạn của token. Ở đây là 7 ngày kể từ thời điểm hiện tại
            signingCredentials: creds//Thông tin ký đã được tạo ở bước trước.
        );
        //new JwtSecurityTokenHandler().WriteToken(tokenOptions): Sử dụng JwtSecurityTokenHandler để chuyển đổi JwtSecurityToken thành chuỗi.
        return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
    }
}