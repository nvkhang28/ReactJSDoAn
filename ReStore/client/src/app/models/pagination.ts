export interface MetaData {
    currentPage: number; //trang hiện tại
    totalPages: number;//Tổng số trang
    pageSize: number;// SỐ lượng mực items mỗi trang
    totalCount: number;//Tổng số mục trong toàn bộ dữ liệu
}

//là một lớp tổng quát (generic class) được sử dụng để gói gọn dữ liệu đã phân trang cùng với các thông tin phân trang (metadata). 
export class PaginatedResponse<T> {
    items: T;//Các mục dữ liệu cho trang hiện tại. T là một kiểu tổng quát (generic type) cho phép linh hoạt sử dụng bất kỳ loại dữ liệu nào
    metaData: MetaData;//Thông tin phân trang đi kèm với dữ liệu, được định nghĩa bởi interface MetaData

    constructor(items: T, metaData: MetaData) {
        this.items = items;//các mục dữ liệu cho trang hiện tại
        this.metaData = metaData;// thông tin phân trang
    }
}