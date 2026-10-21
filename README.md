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
- **Khôi phục dữ liệu mẫu** nằm trong nhóm Công cụ bản demo ở chân menu (bật trong Cấu hình menu) — đưa dữ liệu về trạng thái ban đầu.
- Ngày tháng tính theo ngày thực tế của máy: trạng thái lớp, buổi học, kỳ thi tự đổi theo thời gian.

## Cổng học viên

Mở `cong-hoc-vien/kham-pha.html` (trang mặc định của cổng) hoặc `cong-hoc-vien/index.html` (Tổng quan sau đăng nhập), hoặc bấm **Cổng học viên demo ↗** trong nhóm Công cụ bản demo ở chân menu Cổng quản trị. Thanh chọn vai trò ở góc dưới trang Khám phá chuyển giữa góc nhìn khách chưa có tài khoản và học viên đã đăng nhập. Hai cổng dùng chung dữ liệu: học viên nộp bài, làm bài thi, gửi khảo sát, đặt câu hỏi, xin vắng, đăng ký lớp thì các màn quản trị tương ứng (Bài tập, Chấm bài, Giám sát thi, Khảo sát, Hỏi đáp, Buổi học và điểm danh, Thu học phí) thấy ngay.

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

## Phần chỉ có ở bản demo — không triển khai

Bản demo có một số công cụ chỉ để trình diễn. AI hoặc đội phát triển đọc bản demo để làm hệ thống thật **bỏ qua toàn bộ các phần này**, không code lại. Trong mã nguồn chúng được đánh dấu `DEMO-ONLY` (HTML: `DEMO-ONLY:START … DEMO-ONLY:END`, thuộc tính `data-demo-only`; JS: `/* DEMO-ONLY:START */ … /* DEMO-ONLY:END */`).

| Phần | Vị trí | Ghi chú |
|---|---|---|
| Cấu hình menu (sửa menu trên giao diện, xuất `cau-hinh-menu.js`) | `index.html`, nút ở chân menu | Hệ thống thật cấu hình menu theo nhóm quyền ở máy chủ |
| Công cụ bản demo: Cổng học viên demo, Khôi phục dữ liệu mẫu, Giả định tài khoản | `index.html`, chân menu, trên nút Cấu hình menu | **Mặc định ẩn.** Bật/tắt bằng ô "Hiện công cụ bản demo ở chân menu" đầu ngăn Cấu hình menu |
| Gợi ý "mật khẩu bất kỳ" ở màn đăng nhập | `index.html` | Hệ thống thật xác thực tài khoản thật |
| Xem với học viên khác, Khôi phục dữ liệu mẫu (demo) | `cong-hoc-vien/hv-core.js`, menu tài khoản | |
| Thanh chọn vai trò khách / học viên | `cong-hoc-vien/kham-pha.html` | |

**Giả định tài khoản:** popup liệt kê tài khoản nhân sự nhóm theo phạm vi dữ liệu (Toàn Học viện, Phòng Đào tạo và đơn vị trực thuộc, từng khoa). Chọn một tài khoản → Áp dụng: tên đăng nhập ở góc phải thanh tiêu đề đổi theo, mọi màn hình nạp lại theo phạm vi của tài khoản đó. Đây chỉ là cách trình diễn ràng buộc phạm vi; hệ thống thật lấy phạm vi theo tài khoản đăng nhập thật.

## Cấu hình menu (chỉ bản demo)

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
| Đào tạo | Chương trình đào tạo | Khung học phần học trực tuyến để mở lớp trên cổng: danh sách chương trình, chi tiết gồm nhóm học phần và các học phần lý thuyết theo thứ tự học; mỗi học phần hiện trạng thái nội dung (sẵn sàng mở lớp, đang biên soạn, chưa có nội dung), số bài và giờ học liệu, học phần học trước, lớp đang mở; mở lớp ngay từ học phần; thêm học phần đã biên soạn hoặc học phần dự kiến; mã đối chiếu với hệ thống Quản lý đào tạo; chặn gỡ khi đã mở lớp (DL-19). Khung đầy đủ của ngành (tín chỉ, học kỳ, thực hành, chuẩn đầu ra) không quản lý ở đây; danh mục chương trình dạng cây thư mục (Đào tạo đại học, Đào tạo sau đại học, Đào tạo cho người đi làm…) thu gọn / mở rộng được, quản trị thêm, đổi tên, lồng mục con, sắp xếp, xóa mục; kéo thả chương trình để chuyển mục hoặc đổi thứ tự, chọn mục ngay khi tạo chương trình |
| | Học phần | Tương ứng menu "Nội dung học tập" của hệ thống: danh sách có lọc trạng thái/chương trình/khoa, tạo ở trạng thái Nháp, nhân bản; danh sách có thẻ số liệu gọn theo trạng thái, cột Mã tách riêng, cột Số bài; học phần không khai báo tín chỉ (quản lý bên hệ thống Quản lý đào tạo), chọn chương trình khi tạo là gắn luôn; chi tiết có dải chỉ số gọn (bài giảng, thời lượng, cách mở bài, học viên, chương trình) và 5 tab (Thông tin, Bài giảng, Nội dung học tập, Học viên, Chương trình đang dùng); trình soạn bài giảng 16 loại khối (đoạn văn, công thức, ảnh, video có cấu hình xem, âm thanh có cấu hình nghe, PDF, nút, quiz 8 dạng câu và nhập từ ngân hàng, nhúng, HTML, trang tương tác, đường kẻ, nhóm, bố cục cột, lưới), tài liệu đính kèm, mục lục học liệu, xem trước theo góc nhìn học viên; điều kiện mở bài nhiều bài, tiêu chí hoàn thành mặc định và riêng từng bài, ẩn/hiện bài (NT-01, DL-19) |
| | Lớp học | Đủ các tab như hệ thống: Thông tin lớp (ảnh bìa, loại học tập, tính chất lớp, số tín chỉ, tính điểm, ghi chú), Học viên, Nội dung học tập, Tiến độ học tập (theo học viên, theo bài, ma trận), Kế hoạch học tập (chia bài theo tuần, mốc bài tập và kiểm tra, tỷ lệ học viên đạt mốc từng tuần, điều chỉnh kế hoạch, quy tắc nhắc học, gửi kế hoạch tuần), Mức độ học tập (nhịp học từng học viên, lần học gần nhất, dải 28 ngày, khoảng cách giữa các lần học, tuần có học, nhắc học, xuất CSV), Điểm, Hỏi đáp / Thảo luận (như hệ thống: nhóm theo bài giảng, lọc Chưa trả lời / Đã trả lời / Gửi riêng giảng viên, bung/thu gọn, xuất Excel; bổ sung trả lời, sửa, xóa của quản trị và giảng viên lớp ở câu hỏi gốc và từng trả lời, trả lời một người có gắn @tên), Thông báo, Khảo sát, Giảng viên (giảng viên chính, trợ giảng), Quản lý đăng ký học. Thông báo: phân loại, mẫu nội dung tự điền, chọn người nhận theo nhóm (nguy cơ, chậm tiến độ, chuyên cần thấp…), email, ghim, yêu cầu xác nhận đã đọc, hẹn giờ, nháp, đính kèm, theo dõi đã xem, nhắc người chưa xem, thu hồi. Khảo sát: tạo từ mẫu, 4 dạng câu hỏi, bắt buộc, ẩn danh, thông báo mời và nhắc tự động, kết quả theo từng câu, danh sách chưa phản hồi, xuất CSV, khóa câu hỏi khi đã có phiếu; giảng viên phụ trách chọn bằng ô chọn nhiều dạng thẻ (form mở lớp và tab Thông tin lớp), danh sách lấy theo khoa phụ trách học phần, có tùy chọn hiện giảng viên khoa khác, người đứng đầu là giảng viên chính |
| | Theo dõi học tập | Thay cho Lịch buổi học và điểm danh. Mức độ tự học của học viên các lớp đang học: phân nhóm Học đều, Học thưa, Gián đoạn, Ngưng học, Chưa bắt đầu; lượt vào học mỗi ngày trong 28 ngày; danh sách học viên cần nhắc với lần học gần nhất, dải 28 ngày, khoảng cách giữa các lần học, tiến độ; chọn nhiều và gửi nhắc học; bảng theo lớp; quy tắc đánh giá nhịp học cấu hình được; xuất CSV |
| | Giám sát lớp | Mức "Chưa đủ dữ liệu", cảnh báo có lý do cụ thể (DL-07) |
| | Hỏi đáp / Thảo luận | Bố cục như hệ thống: danh sách lớp kèm số câu chờ trả lời, luồng hỏi đáp theo lớp với lọc Tất cả/Chưa trả lời, trả lời ngay trong luồng với tư cách giảng viên hoặc quản trị, xóa từng trả lời; bổ sung trạng thái Đã trả lời/Đã giải quyết, chọn câu trả lời đúng, trả lời kèm @nhắc tên, mẫu trả lời, ghim, chuyển bài, chuyển loại, nhắc giảng viên khi quá 48 giờ, xóa mềm có lý do và khôi phục, xuất CSV thời gian phản hồi |
| | Báo cáo đào tạo | Số liệu khớp chi tiết lớp, xuất CSV (DL-05) |
| Học liệu | Thư viện tài nguyên | Bố cục theo màn Thư viện của hệ thống: lọc theo chương trình đào tạo, cây thư mục (Tất cả, Chưa phân thư mục, thư mục lồng nhau), lưới thẻ tệp có Di chuyển / Copy khoá, chọn nhiều, cấu hình base-URL server media / CDN theo loại; giữ thẻ số liệu (tổng tệp, dung lượng, chưa sử dụng, trùng nội dung). Thư mục có thông tin riêng: tên, thư mục cha, phòng ban – khoa quản lý, chương trình đào tạo, ghi chú; thêm, sửa, xóa thư mục. Đơn vị quản lý thư mục mới được tải tệp lên, đổi tên, di chuyển, xóa tệp; thư mục dùng chung toàn Học viện thì đơn vị khác chỉ xem |
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
| | Giảng viên | Liên kết tài khoản, cảnh báo giảng viên chưa đăng nhập được (DL-21); xóa hồ sơ chỉ khi chưa có tài khoản và chưa phụ trách lớp nào (kể cả lớp đã kết thúc), ngược lại chỉ chuyển Ngừng sử dụng và tài khoản liên kết ngừng theo; chi tiết gồm Thông tin và Lớp phụ trách |
| | Tài khoản | Liên kết hồ sơ, thao tác hàng loạt; ba phân loại Quản trị hệ thống / Nhân sự / Học viên (giảng viên là nhân sự), ô Admin hệ thống theo phân loại, tài khoản nhân sự bắt buộc liên kết hồ sơ nhân sự (lọc theo phòng ban, khoa), tài khoản học viên cố định nhóm Học viên; tên đăng nhập sửa được, chỉ gồm chữ không dấu a–z và số 0–9, không khoảng trắng, không ký tự đặc biệt, không trùng (áp dụng cả khi tạo mới và khi cấp tài khoản ở màn Giảng viên); nhóm quyền chọn nhiều ở form và ở thao tác Đổi nhóm quyền; xóa tài khoản: chưa liên kết thì xóa, đang liên kết thì chọn xóa liên kết rồi xóa hoặc ngừng sử dụng |
| | Nhóm quyền | Ma trận quyền theo màn hình và thao tác, phạm vi dữ liệu |
| | Đơn vị – phòng ban | Đếm thành viên, lớp, học viên theo đơn vị (DL-20); danh sách một cột toàn chiều rộng, chi tiết / sửa / tài khoản của đơn vị mở dạng popup; xóa đơn vị: chưa có tham chiếu thì xóa, có tham chiếu thì chuyển tài khoản, nhân sự, học phần, khung chương trình, lớp sang đơn vị khác rồi xóa (đơn vị trực thuộc chuyển lên cấp trên) |
| | Nhật ký hoạt động | Việt hóa hành động, so sánh trước/sau (CN-11) |
| Phân tích & cảnh báo | Nhóm học viên theo dõi | Nhóm tính trực tiếp mỗi lần mở, có thời điểm tính (DL-08) |

## Giới hạn của bản demo

- Không có máy chủ: đăng nhập nhận tên và mật khẩu bất kỳ; email, thông báo, thanh toán trực tuyến chỉ mô phỏng.
- Tệp tải lên chỉ lưu thông tin tệp, không lưu nội dung.
- Lớp trên cổng là lớp tự học: không có buổi học trực tuyến, không điểm danh. Nhật ký tự học (ngày học, số phút) trong dữ liệu mẫu là mô phỏng.
- Tín hiệu từ trình duyệt thí sinh ở màn Giám sát thi là mô phỏng; ca KT008 luôn được dời về quanh thời điểm mở bản demo để có ca đang thi, ca KT009 luôn ở trạng thái chờ kích hoạt.
- Dữ liệu riêng từng trình duyệt; xóa dữ liệu trình duyệt sẽ quay về dữ liệu mẫu.

## Co dãn theo độ phân giải

Toàn bộ màn hình dùng chung quy tắc trong `edot.css`, không khai báo riêng từng trang:

| Bề rộng vùng hiển thị | Cách hiển thị |
|---|---|
| Dưới 760px (điện thoại) | Một cột; thẻ số liệu xếp 2 cột; bộ lọc và nút thao tác chiếm trọn hàng; bảng giữ bề rộng tối thiểu và cuộn ngang trong khung; hộp thoại gần toàn màn hình |
| 760 – 1100px (máy tính bảng) | Lưới 2 cột, menu trái thu thành ngăn kéo (dưới 860px) |
| 1100 – 2100px (laptop, Full HD) | Bố cục đầy đủ, nội dung giãn tối đa 1840px |
| Từ 2100px (2K) và 2900px (4K) | Phóng toàn giao diện 115% và 140% để giữ cỡ chữ dễ đọc |

Lề trang và khoảng cách co theo bề rộng (`clamp`). Đã kiểm tra tràn ngang ở 390, 768, 1024, 1366, 1920, 2560px cho màn hình danh sách, chi tiết, các tab và hộp thoại tạo mới của từng chức năng.

## Thẻ số liệu

Thẻ số liệu đầu mỗi màn hình dùng chung một kiểu gọn trong `edot.css` (`.kpis` / `.kpi`): số và nhãn trên một dòng, chú thích một dòng nhỏ bên dưới, vạch màu bên trái theo mức cảnh báo (xanh: ổn, cam: cần chú ý, đỏ: cần xử lý).

## Phạm vi dữ liệu theo đơn vị – phòng ban – khoa

Phạm vi được tính theo tài khoản đang đăng nhập và áp dụng cho mọi màn hình (xử lý tập trung trong `lms-core.js`):

| Tài khoản | Phạm vi dữ liệu |
|---|---|
| Quản trị hệ thống, tài khoản bật Admin hệ thống | Toàn Học viện |
| Nhân sự có nhóm quyền phạm vi "Toàn Học viện" (khảo thí, kế toán, an toàn thông tin) | Toàn Học viện |
| Nhân sự thuộc phòng ban | Dữ liệu của phòng ban và mọi khoa, đơn vị trực thuộc |
| Nhân sự thuộc khoa (trưởng khoa, giảng viên) | Dữ liệu của khoa mình |

**Bắt buộc triển khai ở hệ thống thật**, kiểm tra ở máy chủ cho mọi thao tác đọc, ghi, xuất file (bản demo chỉ lọc ở trình duyệt). Quy tắc chi tiết ghi ở đầu mục `[BẮT BUỘC TRIỂN KHAI] PHẠM VI DỮ LIỆU` trong `lms-core.js`.

**Chương trình đào tạo:** nhân sự không phải Admin hệ thống chỉ thấy chương trình có khoa chủ quản thuộc phòng ban, khoa mình được phân công (và đơn vị trực thuộc), kèm toàn bộ nhóm và học phần bên trong. Chương trình do phòng ban, khoa khác đưa lên không hiển thị, kể cả khi trong đó có nhóm học phần do khoa mình giảng dạy hoặc có lớp của khoa mình. Khi thêm, sửa chương trình chỉ chọn được khoa chủ quản trong phạm vi. Ví dụ với dữ liệu mẫu: Khoa Dược chỉ thấy "Dược học – Đại học"; Khoa Y học lâm sàng thấy 3 chương trình của khoa; Khoa Khoa học y sinh không làm chủ quản chương trình nào nên danh mục trống; Phòng Đào tạo thấy cả 4.

Các dữ liệu khác được xác định đơn vị như sau: học phần, lớp học theo khoa phụ trách; ghi danh, theo dõi học tập, hỏi đáp, bài tập, kỳ thi, khảo sát, thông báo, học phí theo lớp; ngân hàng câu hỏi, đề thi theo học phần; thư viện tài nguyên theo phòng ban – khoa quản lý của thư mục (thư mục dùng chung, tệp chưa phân thư mục và tệp do chính người dùng tải lên luôn hiển thị).

Để xem thử theo từng tài khoản (chỉ bản demo): bật Công cụ bản demo trong Cấu hình menu, bấm **Giả định tài khoản** ở chân menu. Phạm vi của tài khoản đang đăng nhập hiện trong menu người dùng ở góc phải. Màn hình đang bị giới hạn phạm vi có dải thông báo ở đầu trang; cột "Đơn vị · phạm vi dữ liệu" ở màn Tài khoản cho biết phạm vi của từng tài khoản.
