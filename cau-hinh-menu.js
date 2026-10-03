/* Cấu hình menu chức năng — EGO LMS · Cổng quản trị
   Nguồn duy nhất cho menu của index.html. Sửa trên giao diện (Cấu hình menu) rồi Xuất file .js để thay file này.
   Mỗi mục: id (duy nhất), label (tên hiển thị), path (file HTML cùng thư mục), icon, hidden (ẩn khỏi menu). */
window.MENU_PAGES = [
  'bang-dieu-khien.html', 'chuong-trinh.html', 'hoc-phan.html', 'lop-hoc.html', 'buoi-hoc.html', 'giam-sat-lop.html',
  'hoi-dap.html', 'bao-cao-dao-tao.html', 'thu-vien.html', 'khao-sat.html', 'ngan-hang-cau-hoi.html', 'de-thi.html',
  'ky-thi.html', 'cham-bai.html', 'bai-tap.html', 'giam-sat-thi.html', 'phan-tich-cau-hoi.html', 'khoan-thu.html', 'thu-hoc-phi.html', 'hoc-vien.html',
  'giang-vien.html', 'tai-khoan.html', 'nhom-quyen.html', 'don-vi.html', 'nhat-ky.html', 'nhom-theo-doi.html'
];

window.MENU_CONFIG = [
  { id: 'g-tong-quan', label: 'Tổng quan', items: [
    { id: 'bang-dieu-khien', label: 'Bảng điều khiển', path: 'bang-dieu-khien.html', icon: 'dashboard' }
  ] },
  { id: 'g-dao-tao', label: 'Đào tạo', items: [
    { id: 'chuong-trinh', label: 'Chương trình đào tạo', path: 'chuong-trinh.html', icon: 'tree' },
    { id: 'hoc-phan', label: 'Học phần', path: 'hoc-phan.html', icon: 'book' },
    { id: 'lop-hoc', label: 'Lớp học', path: 'lop-hoc.html', icon: 'class' },
    { id: 'buoi-hoc', label: 'Lịch buổi học', path: 'buoi-hoc.html', icon: 'calendar' },
    { id: 'giam-sat-lop', label: 'Giám sát lớp', path: 'giam-sat-lop.html', icon: 'pulse' },
    { id: 'hoi-dap', label: 'Hỏi đáp / Thảo luận', path: 'hoi-dap.html', icon: 'chat' },
    { id: 'bao-cao-dao-tao', label: 'Báo cáo đào tạo', path: 'bao-cao-dao-tao.html', icon: 'report' }
  ] },
  { id: 'g-hoc-lieu', label: 'Học liệu', items: [
    { id: 'thu-vien', label: 'Thư viện tài nguyên', path: 'thu-vien.html', icon: 'folder' },
    { id: 'khao-sat', label: 'Khảo sát', path: 'khao-sat.html', icon: 'survey' }
  ] },
  { id: 'g-khao-thi', label: 'Khảo thí', items: [
    { id: 'ngan-hang-cau-hoi', label: 'Ngân hàng câu hỏi', path: 'ngan-hang-cau-hoi.html', icon: 'bank' },
    { id: 'de-thi', label: 'Đề thi', path: 'de-thi.html', icon: 'paper' },
    { id: 'ky-thi', label: 'Kỳ thi', path: 'ky-thi.html', icon: 'exam' },
    { id: 'giam-sat-thi', label: 'Giám sát thi', path: 'giam-sat-thi.html', icon: 'eye' },
    { id: 'bai-tap', label: 'Bài tập & giao bài', path: 'bai-tap.html', icon: 'task' },
    { id: 'cham-bai', label: 'Chấm bài', path: 'cham-bai.html', icon: 'check' },
    { id: 'phan-tich-cau-hoi', label: 'Phân tích câu hỏi', path: 'phan-tich-cau-hoi.html', icon: 'chart' }
  ] },
  { id: 'g-tai-chinh', label: 'Tài chính', items: [
    { id: 'khoan-thu', label: 'Danh mục khoản thu', path: 'khoan-thu.html', icon: 'tag' },
    { id: 'thu-hoc-phi', label: 'Thu học phí', path: 'thu-hoc-phi.html', icon: 'wallet' }
  ] },
  { id: 'g-nguoi-dung', label: 'Người dùng & hệ thống', items: [
    { id: 'hoc-vien', label: 'Hồ sơ học viên', path: 'hoc-vien.html', icon: 'users' },
    { id: 'giang-vien', label: 'Giảng viên', path: 'giang-vien.html', icon: 'teacher' },
    { id: 'tai-khoan', label: 'Tài khoản', path: 'tai-khoan.html', icon: 'key' },
    { id: 'nhom-quyen', label: 'Nhóm quyền', path: 'nhom-quyen.html', icon: 'shield' },
    { id: 'don-vi', label: 'Đơn vị – phòng ban', path: 'don-vi.html', icon: 'org' },
    { id: 'nhat-ky', label: 'Nhật ký hoạt động', path: 'nhat-ky.html', icon: 'log' }
  ] },
  { id: 'g-phan-tich', label: 'Phân tích & cảnh báo', items: [
    { id: 'nhom-theo-doi', label: 'Nhóm học viên theo dõi', path: 'nhom-theo-doi.html', icon: 'alert' }
  ] }
];
