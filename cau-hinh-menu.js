/* Cấu hình menu chức năng — EGO LMS
   Nguồn cấu hình duy nhất của ego-lms-index.html. Trang chủ nạp file này bằng thẻ script,
   không dựng menu mặc định trong mã nguồn nữa.

   Màn hình gắn vào một mục menu là file HTML nằm cùng thư mục với file này trên repo,
   khai báo theo tên file, không dùng đường dẫn tuyệt đối.

   source
     path     file HTML cùng thư mục, tên file đặt ở thuộc tính path
     builtin  màn hình mẫu dựng sẵn trong trang chủ, mã màn hình đặt ở thuộc tính target
     bỏ trống chức năng chưa gắn màn hình

   MENU_PAGES là danh sách file HTML đang có trong thư mục, dùng để gợi ý khi chọn màn hình
   ở màn Cấu hình menu. Thêm file mới vào repo thì khai báo thêm một dòng ở đây.
*/
window.MENU_PAGES = [
  "quan-ly-lop-hoc-demo.html",
  "tai-khoan.html",
  "nhom-quyen.html"
];

window.MENU_CONFIG = [
  {
    "id": "m1",
    "label": "Bảng điều khiển",
    "icon": "gauge",
    "target": "dashboard",
    "source": "builtin"
  },
  {
    "id": "m2",
    "label": "Học liệu",
    "icon": "book",
    "open": true,
    "children": [
      {
        "id": "m2a",
        "label": "Môn học",
        "icon": "file"
      },
      {
        "id": "m2b",
        "label": "Nhóm môn học",
        "icon": "grid"
      },
      {
        "id": "m2c",
        "label": "Danh mục",
        "icon": "list"
      },
      {
        "id": "m2d",
        "label": "Thư viện",
        "icon": "library"
      },
      {
        "id": "m2e",
        "label": "Khảo sát",
        "icon": "edit"
      }
    ]
  },
  {
    "id": "m3",
    "label": "Tổ chức đào tạo",
    "icon": "calendar",
    "open": true,
    "children": [
      {
        "id": "m3a",
        "label": "Chương trình đào tạo",
        "icon": "grid",
        "target": "chuong-trinh",
        "source": "builtin"
      },
      {
        "id": "m3b",
        "label": "Khóa học",
        "icon": "file",
        "target": "khoa-hoc",
        "source": "builtin"
      },
      {
        "id": "m3c",
        "label": "Quản lý lớp",
        "icon": "users",
        "source": "path",
        "path": "quan-ly-lop-hoc-demo.html"
      },
      {
        "id": "m3d",
        "label": "Buổi học",
        "icon": "calendar"
      },
      {
        "id": "m3e",
        "label": "Giám sát lớp",
        "icon": "monitor"
      },
      {
        "id": "m3f",
        "label": "Báo cáo",
        "icon": "chart"
      }
    ]
  },
  {
    "id": "m4",
    "label": "Thi sát hạch",
    "icon": "shield",
    "children": [
      {
        "id": "m4a",
        "label": "Ngân hàng đề",
        "icon": "file"
      },
      {
        "id": "m4b",
        "label": "Ca thi",
        "icon": "calendar"
      },
      {
        "id": "m4c",
        "label": "Kết quả thi",
        "icon": "chart"
      }
    ]
  },
  {
    "id": "m5",
    "label": "Quản lý",
    "icon": "cog",
    "open": true,
    "children": [
      {
        "id": "m5a",
        "label": "Quản lý tài khoản",
        "icon": "users",
        "source": "path",
        "path": "tai-khoan.html"
      },
      {
        "id": "m5b",
        "label": "Nhóm quyền người dùng",
        "icon": "shield",
        "source": "path",
        "path": "nhom-quyen.html"
      },
      {
        "id": "m5c",
        "label": "Nhật ký hệ thống",
        "icon": "list"
      }
    ]
  }
];
