using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController : BaseApiController
{
    private readonly UserManager<User> _userManager;
    private readonly TokenService _tokenService;
    private readonly StoreContext _context;

    public AccountController(UserManager<User> userManager, TokenService tokenService, StoreContext context)
    {
        _context = context; // để quán lý các hd luên quan đến người dùng như tạo mới xác thực và quản lý
        _tokenService = tokenService;// một dv để tạo token xác thực JWT
        _userManager = userManager;// Context của ENtity để truy cập csdl
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await _userManager.FindByNameAsync(loginDto.Username);//tìm người dùng bằng tên đăng nhập 
        if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))//ktr mật khẩu
            return Unauthorized();

        var userBasket = await RetrieveBasket(loginDto.Username);//lấy giỏ hàng của người dùng 
        var anonBasket = await RetrieveBasket(Request.Cookies["buyerId"]);//và giỏ hàng ẩn danh

        if (anonBasket != null)
        {
            //Nếu có giỏ hàng ẩn danh và giỏ hàng người dùng, xóa giỏ hàng người dùng và cập nhật giỏ hàng ẩn danh với BuyerId là tên đăng nhập của người dùng.
            if (userBasket != null) _context.Baskets.Remove(userBasket);
            anonBasket.BuyerId = user.UserName;
            Response.Cookies.Delete("buyerId");
            await _context.SaveChangesAsync();
        }

        //Trả về UserDto chứa email, token và giỏ hàng đã hợp nhất.
        return new UserDto
        {
            Email = user.Email,
            Token = await _tokenService.GenerateToken(user),
            Basket = anonBasket != null ? anonBasket.MapBasketToDto() : userBasket?.MapBasketToDto()
        };
    }

    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
    {
        //tạo người dùng ms vs username mà Email
        var user = new User { UserName = registerDto.Username, Email = registerDto.Email };//Tạo người dùng mới với thông tin từ RegisterDto.
        //lưu kq ở resultus
        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            //Nếu có lỗi, thêm lỗi vào ModelState và trả về lỗi xác thực.
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return ValidationProblem();
        }

        //Nếu thành công, thêm người dùng vào vai trò "Member".
        await _userManager.AddToRoleAsync(user, "Member");

        return StatusCode(201);
    }

    [Authorize]
    [HttpGet("currentUser")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        //Lấy người dùng hiện tại bằng tên đăng nhập từ User.Identity.Name
        var user = await _userManager.FindByNameAsync(User.Identity.Name);
        //Lấy giỏ hàng của người dùng
        var userBasket = await RetrieveBasket(User.Identity.Name);

        //Trả về UserDto chứa email, token và giỏ hàng của người dùng
        return new UserDto
        {
            Email = user.Email,
            Token = await _tokenService.GenerateToken(user),
            Basket = userBasket?.MapBasketToDto()
        };
    }
    [Authorize]
    [HttpGet("savedAddress")]
    public async Task<ActionResult<UserAddress>> GetSavedAddress()
    {
        return await _userManager.Users
            .Where(x => x.UserName == User.Identity.Name)
            .Select(user => user.Address)
            .FirstOrDefaultAsync();
    }

    private async Task<Basket> RetrieveBasket(string buyerId)//Lấy giỏ hàng theo buyerId.
    {
        //Nếu buyerId trống hoặc null, xóa cookie buyerId và trả về null.
        if (string.IsNullOrEmpty(buyerId))
        {
            Response.Cookies.Delete("buyerId");
            return null;
        }
        //Truy vấn giỏ hàng từ cơ sở dữ liệu, bao gồm cả các mục và sản phẩm trong giỏ hàng.

        return await _context.Baskets
            .Include(i => i.Items)
            .ThenInclude(p => p.Product)
            .FirstOrDefaultAsync(basket => basket.BuyerId == buyerId);
    }
}