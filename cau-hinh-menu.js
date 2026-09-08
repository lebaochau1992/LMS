/* Cấu hình menu chức năng — EGO LMS
   Xuất từ màn Cấu hình menu ngày 8/9/2026.
   Đặt cùng thư mục với ego-lms-index.html và các file màn hình.
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
        "label": "Biên soạn học phần",
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
        "path": "tai-khoan.html",
        "source": "path"
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
