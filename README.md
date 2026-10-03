# EGO LMS · Cổng quản trị và Cổng học viên — bản demo tương tác

Bản demo dựng lại Cổng quản trị theo EDOT Portal Design System (Inter, navy #00327d, bảng màu slate) và theo các điều chỉnh trong Báo cáo đánh giá hệ thống LMS ngày 26/09/2026. Dữ liệu mẫu theo chương trình Y học cổ truyền của Học viện Y Dược học cổ truyền Việt Nam.

## Cấu trúc thư mục

| File | Vai trò |
|---|---|
| `index.html` | Khung chính: menu, thanh tiêu đề, tài khoản người dùng, cấu hình menu; nạp từng màn hình vào khung nội dung |
| `cau-hinh-menu.js` | Cấu hình menu chức năng (`MENU_CONFIG`) và danh sách màn hình (`MENU_PAGES`) — nguồn duy nhất của menu |
| `edot.css` | Token màu, chữ, thành phần giao diện dùng chung (sáng/tối) |
| `lms-core.js` | Kho dữ liệu dùng chung, quy tắc tính toán, thư viện bảng/biểu mẫu/biểu đồ |
| `*.html` (26 file) | Mỗi file một màn hình chức năng |
| `cong-hoc-vien/` | Cổng học viên: 14 màn hình, `hv-core.js` (khung trang, quyền truy cập, tiến độ, việc cần làm), `hv.css`; dùng chung `lms-core.js` và dữ liệu với Cổng quản trị |
| `HUONG-DAN-DEV.md` | Quy ước dựng thêm màn hình mới |

## Chạy bản demo

- Mở trực tiếp `index.html` bằng Chrome/Edge, hoặc đưa cả thư mục lên GitHub Pages / máy chủ web tĩnh. Không cần build.
- Dữ liệu lưu trong trình duyệt (localStorage). Mọi thao tác thêm/sửa/xóa ở màn này phản ánh ngay ở các màn khác.
- Nút **Khôi phục dữ liệu mẫu** trên thanh tiêu đề đưa dữ liệu về trạng thái ban đầu.
- Ngày tháng tính theo ngày thực tế của máy: trạng thái lớp, buổi học, kỳ thi tự đổi theo thời gian.

## Cổng học viên

Mở `cong-hoc-vien/kham-pha.html` (trang mặc định của cổng) hoặc `cong-hoc-vien/index.html` (Tổng quan sau đăng nhập), hoặc bấm **Cổng học viên ↗** trên thanh tiêu đề Cổng quản trị. Thanh chọn vai trò ở góc dưới trang Khám phá chuyển giữa góc nhìn khách chưa có tài khoản và học viên đã đăng nhập. Hai cổng dùng chung dữ liệu: học viên nộp bài, làm bài thi, gửi khảo sát, đặt câu hỏi, xin vắng, đăng ký lớp thì các màn quản trị tương ứng (Bài tập, Chấm bài, Giám sát thi, Khảo sát, Hỏi đáp, Buổi học và điểm danh, Thu học phí) thấy ngay.

- Học viên mặc định: Trịnh Gia Khánh (HV0099) — đang học L0020 Châm cứu 1, L0028 Giải phẫu 1, đã hoàn thành L0034 Dược học cổ truyền.
- Đổi học viên: menu tài khoản › **Xem với học viên khác (demo)**. Ví dụ chọn học viên lớp L0026 để vào ca thi KT008 đang mở.
- Menu tài khoản › **Khôi phục dữ liệu mẫu (demo)** xóa thao tác đã làm trên trình duyệt (cả hai cổng).

| Màn hình | File | Chức năng chính |
|---|---|---|
| Khám phá khóa học | `kham-pha.html` | Trang mặc định của cổng, hai chế độ. Khách: tìm kiếm, lớp đang nhận đăng ký, thẻ theo học phần có đợt tuyển sinh, lọc và sắp xếp, chi tiết học phần (giới thiệu, nội dung, học thử, lớp và lịch khai giảng, giảng viên), đơn đăng ký có kiểm tra trùng CCCD/email, hướng dẫn đăng ký, lộ trình, tra cứu chứng nhận và đơn, câu hỏi thường gặp, yêu cầu đào tạo cho đơn vị. Học viên đã đăng nhập: buổi đang diễn ra, học tiếp, việc cần làm, trạng thái cá nhân trên từng học phần, học phần tiếp theo trong lộ trình, đăng ký một bước |
| Tổng quan | `index.html` | Buổi học đang diễn ra, chỉ số học tập, việc cần làm theo mức ưu tiên, lớp đang học, học tiếp, lịch 7 ngày, thông báo, giảng viên |
| Lớp của tôi | `lop-cua-toi.html` | Lọc theo trạng thái ghi danh, tiến độ, buổi kế tiếp |
| Chi tiết lớp | `lop.html` | Tổng quan, Bài giảng, Lịch học và điểm danh, Bài tập và kiểm tra, Điểm, Thông báo, Hỏi đáp; chặn truy cập lớp chưa ghi danh |
| Học bài | `hoc.html` | Điều kiện hoàn thành từng bài, video ghi nhận thời lượng xem (có watermark, không tua vượt), tài liệu, câu hỏi củng cố, tự hoàn thành và mở bài tiếp; hỏi đáp theo bài, ghi chú, báo lỗi nội dung |
| Lịch học | `lich-hoc.html` | Lịch tuần (buổi học, kỳ thi, hạn nộp), danh sách buổi, chuyên cần theo lớp; vào phòng học, xin vắng và rút đơn, xuất lịch .ics |
| Bài tập và kiểm tra | `bai-tap.html`, `thi.html` | Làm và nộp bài tập (trắc nghiệm, tự luận, kết hợp, nộp tệp), nộp muộn có trừ điểm; màn chuẩn bị thi (quy chế, cam kết, mã vào thi), làm bài có đồng hồ, danh sách câu, đánh dấu, ghi nhận vi phạm, nộp bài; luyện tập |
| Kết quả học tập | `ket-qua.html` | Bảng điểm theo cột điểm của lớp, điểm chữ, điểm hệ 4, tín chỉ tích lũy; chứng chỉ có mã tra cứu; đề nghị phúc khảo |
| Hỏi đáp | `hoi-dap.html` | Câu hỏi của tôi, có trả lời mới, toàn lớp; đặt câu hỏi công khai hoặc riêng giảng viên; trả lời, chọn câu trả lời đúng, sửa/xóa câu hỏi chưa có trả lời |
| Thông báo | `thong-bao.html` | Lọc, đánh dấu đã đọc, xác nhận đã đọc với thông báo bắt buộc |
| Khảo sát | `khao-sat.html` | Danh sách khảo sát mở, điền phiếu (thang điểm, lựa chọn, nhiều lựa chọn, tự luận), sửa phiếu trước hạn |
| Đăng ký học và học phí | `dang-ky.html` | Lớp đang tuyển sinh, chặn đăng ký trùng lớp và trùng học phần, gửi đơn, thanh toán, hủy đơn, hóa đơn |
| Hồ sơ và cài đặt | `ho-so.html` | Thông tin cá nhân (thông tin định danh chỉ xem, đề nghị điều chỉnh), quá trình học tập, cài đặt thông báo, đổi mật khẩu và phiên đăng nhập |

## Cấu hình menu

1. Bấm **Cấu hình menu** ở chân thanh menu.
2. Đổi tên, sắp xếp, ẩn/hiện, thêm chức năng; gắn màn hình bằng tên file HTML cùng thư mục.
3. **Lưu nháp** để thử ngay trên trình duyệt đang dùng.
4. **Xuất file .js** (hoặc **Sao chép nội dung .js**) → thay file `cau-hinh-menu.js` trong thư mục → commit.
5. **Đọc lại từ file** để bỏ bản nháp.

Thêm màn hình mới: đặt file HTML vào thư mục, bổ sung tên file vào `MENU_PAGES`, rồi gắn ở Cấu hình menu.

## Danh mục màn hình và điều chỉnh đã áp dụng

| Nhóm | Màn hình | Điều chỉnh chính (mã vấn đề trong báo cáo) |
|---|---|---|
| Tổng quan | Bảng điều khiển | 8 chỉ số quản lý, tiến độ theo khoa/lớp so với kế hoạch, phễu học tập, chuyên cần theo tuần, phổ điểm, việc cần xử lý, học viên nguy cơ, lịch 14 ngày; số liệu thống nhất với các màn chi tiết (DL-01, DL-02, HT-01) |
| Đào tạo | Chương trình đào tạo | Cây nhiều cấp có lọc; số học phần/lớp/học viên tự tính; chặn xóa khi đang dùng (DL-19) |
| | Học phần | Tương ứng menu "Nội dung học tập" của hệ thống: danh sách có lọc trạng thái/chương trình/khoa, tạo ở trạng thái Nháp, nhân bản; chi tiết 5 tab (Thông tin, Bài giảng, Nội dung học tập, Học viên, Chương trình đang dùng); trình soạn bài giảng 16 loại khối (đoạn văn, công thức, ảnh, video có cấu hình xem, âm thanh có cấu hình nghe, PDF, nút, quiz 8 dạng câu và nhập từ ngân hàng, nhúng, HTML, trang tương tác, đường kẻ, nhóm, bố cục cột, lưới), tài liệu đính kèm, mục lục học liệu, xem trước theo góc nhìn học viên; điều kiện mở bài nhiều bài, tiêu chí hoàn thành mặc định và riêng từng bài, ẩn/hiện bài (NT-01, DL-19) |
| | Lớp học | Đủ các tab như hệ thống: Thông tin lớp (ảnh bìa, loại học tập, tính chất lớp, số tín chỉ, tính điểm, ghi chú), Học viên, Nội dung học tập, Tiến độ học tập (theo học viên, theo bài, ma trận), Buổi học và điểm danh (tạo lịch định kỳ, thêm, dời, hủy buổi, rà soát và xác nhận điểm danh tự động, bảng chuyên cần học viên × buổi, xuất CSV), Điểm, Hỏi đáp / Thảo luận (như hệ thống: nhóm theo bài giảng, lọc Chưa trả lời / Đã trả lời / Gửi riêng giảng viên, bung/thu gọn, xuất Excel; bổ sung trả lời, sửa, xóa của quản trị và giảng viên lớp ở câu hỏi gốc và từng trả lời, trả lời một người có gắn @tên), Thông báo, Khảo sát, Giảng viên (giảng viên chính, trợ giảng), Quản lý đăng ký học. Thông báo: phân loại, mẫu nội dung tự điền, chọn người nhận theo nhóm (nguy cơ, chậm tiến độ, chuyên cần thấp…), email, ghim, yêu cầu xác nhận đã đọc, hẹn giờ, nháp, đính kèm, theo dõi đã xem, nhắc người chưa xem, thu hồi. Khảo sát: tạo từ mẫu, 4 dạng câu hỏi, bắt buộc, ẩn danh, thông báo mời và nhắc tự động, kết quả theo từng câu, danh sách chưa phản hồi, xuất CSV, khóa câu hỏi khi đã có phiếu |
| | Lịch buổi học | Màn điều phối xuyên lớp cho Phòng đào tạo và lịch dạy của giảng viên (chọn vai trò). Theo dõi buổi đang diễn ra theo nhật ký phòng học, buổi chờ giảng viên xác nhận điểm danh, buổi thiếu dữ liệu, đơn xin vắng chờ duyệt; lịch tuần; quy tắc điểm danh tự động. Thêm, sửa, dời, hủy buổi (kèm thông báo học viên, tạo buổi học bù) dùng chung bộ thao tác với tab Buổi học của Lớp học |
| | Giám sát lớp | Mức "Chưa đủ dữ liệu", cảnh báo có lý do cụ thể (DL-07) |
| | Hỏi đáp / Thảo luận | Bố cục như hệ thống: danh sách lớp kèm số câu chờ trả lời, luồng hỏi đáp theo lớp với lọc Tất cả/Chưa trả lời, trả lời ngay trong luồng với tư cách giảng viên hoặc quản trị, xóa từng trả lời; bổ sung trạng thái Đã trả lời/Đã giải quyết, chọn câu trả lời đúng, trả lời kèm @nhắc tên, mẫu trả lời, ghim, chuyển bài, chuyển loại, nhắc giảng viên khi quá 48 giờ, xóa mềm có lý do và khôi phục, xuất CSV thời gian phản hồi |
| | Báo cáo đào tạo | Số liệu khớp chi tiết lớp, xuất CSV (DL-05) |
| Học liệu | Thư viện tài nguyên | Cột "Đang dùng ở", lọc tệp chưa dùng, phát hiện trùng (DL-26) |
| | Khảo sát | Số phiếu gửi tính theo sĩ số lớp |
| Khảo thí | Ngân hàng câu hỏi | Học phần chọn từ danh sách, số câu tự tính, phiên bản câu hỏi, phát hiện câu trùng (DL-10, DL-11, DL-24) |
| | Đề thi | Dựng đề từ ngân hàng theo ma trận độ khó |
| | Kỳ thi | Gắn lớp, đề và cột điểm; thí sinh lấy từ lớp; công bố điểm tự vào bảng điểm lớp (DL-12, DL-13, DL-14) |
| | Giám sát thi | Giám thị đăng nhập bằng tài khoản được phân công, chỉ thấy ca thi của mình; kích hoạt ca thi (kiểm tra điều kiện, mã vào thi), theo dõi trực tiếp từng thí sinh (còn lại, tiến độ câu, thiết bị/IP), cộng giờ, reset thời gian, cho làm lại từ đầu, mở khóa/cho vào lại, nhắc nhở, thu bài, đình chỉ; tab giám sát bất thường (rời tab, thoát toàn màn hình, sao chép, thiết bị thứ hai, đổi IP, mất kết nối, không thao tác, nộp quá nhanh); tạm dừng/gia hạn/kết thúc ca; nhật ký và biên bản ca thi |
| | Bài tập & giao bài | Giao theo bài giảng/chương của lớp, đề lấy từ ngân hàng câu hỏi hoặc tự luận có tiêu chí chấm; chỉ giảng viên phụ trách lớp được giao, chấm và chuyển điểm; hàng đợi chấm, trả lại làm lại, lịch sử chấm lại; chuyển điểm vào cột có sẵn hoặc cột mới kèm cân lại trọng số, bảng điểm lớp tự cập nhật |
| | Chấm bài | Rubric tự luận, lịch sử chấm lại/phúc khảo |
| | Phân tích câu hỏi | Chỉ dùng bài làm thật; tỷ lệ đúng, độ phân biệt, cảnh báo cần rà soát (DL-15) |
| Tài chính | Danh mục khoản thu | Chặn xóa khi lớp đang dùng |
| | Thu học phí | Ghi nhận thanh toán → tự ghi danh; duyệt đơn đăng ký; phiếu thu (CN-09) |
| Người dùng & hệ thống | Hồ sơ học viên | 1 học viên – 1 hồ sơ – nhiều lượt ghi danh; CCCD 12 số không trùng; cấp tài khoản đồng loạt (DL-22, DL-23) |
| | Giảng viên | Liên kết tài khoản, cảnh báo giảng viên chưa đăng nhập được (DL-21) |
| | Tài khoản | Liên kết hồ sơ, thao tác hàng loạt |
| | Nhóm quyền | Ma trận quyền theo màn hình và thao tác, phạm vi dữ liệu |
| | Đơn vị – phòng ban | Đếm thành viên, lớp, học viên theo đơn vị (DL-20) |
| | Nhật ký hoạt động | Việt hóa hành động, so sánh trước/sau (CN-11) |
| Phân tích & cảnh báo | Nhóm học viên theo dõi | Nhóm tính trực tiếp mỗi lần mở, có thời điểm tính (DL-08) |

## Giới hạn của bản demo

- Không có máy chủ: đăng nhập nhận tên và mật khẩu bất kỳ; email, thông báo, thanh toán trực tuyến chỉ mô phỏng.
- Tệp tải lên chỉ lưu thông tin tệp, không lưu nội dung.
- Tín hiệu từ trình duyệt thí sinh ở màn Giám sát thi là mô phỏng; ca KT008 luôn được dời về quanh thời điểm mở bản demo để có ca đang thi, ca KT009 luôn ở trạng thái chờ kích hoạt.
- Dữ liệu riêng từng trình duyệt; xóa dữ liệu trình duyệt sẽ quay về dữ liệu mẫu.
