/* EGO LMS · Cổng quản trị (bản demo) — dữ liệu dùng chung + thư viện giao diện
   Mọi màn hình đọc/ghi cùng một kho dữ liệu (localStorage) nên thao tác ở màn này phản ánh ngay ở màn khác. */
(function () {
  'use strict';
  var KEY = 'egoLmsDemo.db.v13';
  var DD_MAC_DINH = { nguong: 70, muon: 15, hanXN: 48, tuDongChot: true };
  var KS_MAU = {
    'giua-ky': { ten: 'Khảo sát giữa kỳ', moTa: 'Lấy ý kiến giữa học phần để điều chỉnh cách dạy.', cau: [['Mục tiêu học phần được giới thiệu rõ ràng', 'thang'], ['Tốc độ giảng dạy phù hợp với khả năng tiếp thu', 'thang'], ['Tài liệu, video bài giảng đầy đủ và dễ truy cập', 'thang'], ['Mức độ khó của nội dung đến thời điểm này', 'lua-chon', ['Quá dễ', 'Phù hợp', 'Khó', 'Quá khó']], ['Nội dung anh/chị muốn giảng viên giảng kỹ hơn', 'nhieu', ['Lý thuyết kinh lạc', 'Vị trí huyệt', 'Kỹ thuật châm', 'Ca lâm sàng']], ['Góp ý cho nửa sau học phần', 'tu-luan']] },
    'cuoi-ky': { ten: 'Đánh giá cuối học phần', moTa: 'Đánh giá chất lượng học phần sau khi kết thúc.', cau: [['Nội dung bài giảng phù hợp với chuẩn đầu ra', 'thang'], ['Giảng viên truyền đạt dễ hiểu, có ví dụ lâm sàng', 'thang'], ['Giảng viên phản hồi câu hỏi kịp thời', 'thang'], ['Hình thức kiểm tra, đánh giá phản ánh đúng năng lực', 'thang'], ['Cổng học trực tuyến hoạt động ổn định', 'thang'], ['Mức độ hài lòng chung với học phần', 'thang'], ['Hình thức học mong muốn cho học phần tiếp theo', 'lua-chon', ['Trực tuyến hoàn toàn', 'Kết hợp trực tuyến và trực tiếp', 'Trực tiếp tại Học viện']], ['Điều anh/chị thấy hữu ích nhất', 'tu-luan'], ['Đề xuất cải tiến cho học phần', 'tu-luan']] },
    'buoi-hoc': { ten: 'Đánh giá buổi học', moTa: 'Phiếu ngắn sau buổi học trực tuyến.', cau: [['Buổi học đạt được mục tiêu đã nêu', 'thang'], ['Chất lượng âm thanh, hình ảnh phòng học trực tuyến', 'thang'], ['Thời lượng buổi học', 'lua-chon', ['Quá ngắn', 'Vừa đủ', 'Quá dài']], ['Nội dung chưa rõ sau buổi học', 'tu-luan']] },
    'giang-vien': { ten: 'Đánh giá giảng viên', moTa: 'Đánh giá phương pháp và thái độ giảng dạy.', cau: [['Giảng viên chuẩn bị bài chu đáo', 'thang'], ['Giảng viên truyền đạt rõ ràng, dễ hiểu', 'thang'], ['Giảng viên khuyến khích học viên đặt câu hỏi', 'thang'], ['Giảng viên đúng giờ, đảm bảo thời lượng', 'thang'], ['Nhận xét khác về giảng viên', 'tu-luan']] }
  };
  var KS_NX = ['Video minh họa kỹ thuật châm rõ, mong có thêm video thực hành trên mô hình.', 'Nên bổ sung câu hỏi ôn tập cuối mỗi bài.', 'Giảng viên nhiệt tình, trả lời câu hỏi nhanh.', 'Một số video tải chậm vào buổi tối.', 'Tài liệu PDF nên có mục lục để tra cứu nhanh.', 'Mong có thêm ca lâm sàng để thảo luận nhóm.', 'Nên mở thêm buổi hỏi đáp trước kỳ thi.', 'Hình ảnh giải phẫu trong slide cần rõ hơn.'];
  var DAY = 86400000;

  /* ---------------- tiện ích ngày ---------------- */
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  var TODAY = startOfDay(new Date());
  function addDays(d, n) { return new Date(startOfDay(d).getTime() + n * DAY); }
  function iso(d) { d = new Date(d); var m = d.getMonth() + 1, dd = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd; }
  function parse(s) { if (!s) return null; if (s instanceof Date) return startOfDay(s); var p = String(s).slice(0, 10).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtDate(s) { var d = s instanceof Date ? s : parse(s); if (!d || isNaN(d)) return '—'; var dd = d.getDate(), mm = d.getMonth() + 1; return (dd < 10 ? '0' : '') + dd + '/' + (mm < 10 ? '0' : '') + mm + '/' + d.getFullYear(); }
  function fmtDT(s) { if (!s) return '—'; var d = new Date(s); var h = d.getHours(), mi = d.getMinutes(); return fmtDate(d) + ' ' + (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi; }
  function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / DAY); }
  var THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  /* ---------------- sinh dữ liệu mẫu ---------------- */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function seed() {
    var R = rng(20260926);
    function pick(a) { return a[Math.floor(R() * a.length)]; }
    function int(a, b) { return a + Math.floor(R() * (b - a + 1)); }
    var T = TODAY;
    var db = { meta: { version: 13, seededAt: iso(T), user: { ten: 'admin02', hoTen: 'Lê Bảo Châu', email: 'chaulb@vutm.edu.vn' } } };

    db.donVi = [
      { id: 'dv1', ma: 'BGD', ten: 'Ban Giám đốc', cha: null, laKhoa: false },
      { id: 'dv2', ma: 'PDT', ten: 'Phòng Đào tạo', cha: null, laKhoa: false },
      { id: 'dv3', ma: 'PKT', ten: 'Phòng Khảo thí và Đảm bảo chất lượng', cha: null, laKhoa: false },
      { id: 'dv4', ma: 'PTC', ten: 'Phòng Tài chính – Kế toán', cha: null, laKhoa: false },
      { id: 'dv5', ma: 'PCN', ten: 'Phòng Công nghệ thông tin', cha: null, laKhoa: false },
      { id: 'dv6', ma: 'KYHLS', ten: 'Khoa Y học lâm sàng', cha: 'dv2', laKhoa: true },
      { id: 'dv7', ma: 'KKHYS', ten: 'Khoa Khoa học y sinh', cha: 'dv2', laKhoa: true },
      { id: 'dv8', ma: 'KDUOC', ten: 'Khoa Dược', cha: 'dv2', laKhoa: true },
      { id: 'dv9', ma: 'KKHCB', ten: 'Khoa Khoa học cơ bản', cha: 'dv2', laKhoa: true }
    ];

    var HP = [
      { id: 'hp1', ma: 'TRAD4113', ten: 'Châm cứu 1', khoa: 'dv6', soTC: 3, bai: ['Lịch sử và đại cương châm cứu', 'Cơ chế tác dụng của châm cứu', 'Khái quát học thuyết kinh lạc', 'Kinh Thủ thái âm Phế', 'Kinh Thủ dương minh Đại trường', 'Kinh Túc dương minh Vị', 'Kinh Túc thái âm Tỳ', 'Kinh Thủ thiếu âm Tâm', 'Kinh Thủ thái dương Tiểu trường', 'Kinh Túc thái dương Bàng quang', 'Kinh Túc thiếu âm Thận', 'Kinh Thủ quyết âm Tâm bào', 'Kinh Thủ thiếu dương Tam tiêu', 'Kinh Túc thiếu dương Đởm', 'Kinh Túc quyết âm Can', 'Mạch Nhâm', 'Mạch Đốc', 'Kỹ thuật châm và cứu', 'Ôn tập Châm cứu 1'] },
      { id: 'hp2', ma: 'TRAD5116', ten: 'Châm cứu 2', khoa: 'dv6', soTC: 3, bai: ['Nguyên tắc chọn huyệt', 'Châm cứu điều trị đau đầu', 'Châm cứu điều trị mất ngủ', 'Châm cứu điều trị liệt dây VII ngoại biên', 'Châm cứu điều trị đau vai gáy', 'Châm cứu điều trị đau thắt lưng', 'Châm cứu điều trị tăng huyết áp', 'Điện châm', 'Thủy châm', 'Nhĩ châm', 'Cấy chỉ', 'Tai biến khi châm và xử trí', 'Ôn tập Châm cứu 2'] },
      { id: 'hp3', ma: 'BIOM2101', ten: 'Giải phẫu 1', khoa: 'dv7', soTC: 2, bai: ['Mở đầu', 'Hệ xương', 'Bài tập ôn luyện bài 1 + 2', 'Hệ khớp', 'Hệ cơ', 'Hệ thần kinh 1 – Thần kinh trung ương', 'Hệ thần kinh 2 – Thần kinh ngoại biên', 'Các giác quan', 'Hệ nội tiết'] },
      { id: 'hp4', ma: 'BIOM2102', ten: 'Giải phẫu 2', khoa: 'dv7', soTC: 2, bai: ['Hệ tuần hoàn 1: Tim và trung thất', 'Hệ tuần hoàn 2: Hệ thống mạch máu', 'Hệ hô hấp', 'Hệ tiêu hóa 1: Ống tiêu hóa', 'Hệ tiêu hóa 2: Tuyến tiêu hóa', 'Hệ tiết niệu, hệ sinh dục', 'Ôn tập Giải phẫu 2'] },
      { id: 'hp5', ma: 'PHAR3104', ten: 'Thực vật – Dược liệu', khoa: 'dv8', soTC: 3, bai: ['Đại cương thực vật dược', 'Tế bào và mô thực vật', 'Cơ quan dinh dưỡng: rễ, thân, lá', 'Cơ quan sinh sản: hoa, quả, hạt', 'Phân loại thực vật', 'Họ Hoa môi (Lamiaceae)', 'Họ Cúc (Asteraceae)', 'Họ Đậu (Fabaceae)', 'Dược liệu chứa flavonoid', 'Thực hành nhận biết dược liệu'] },
      { id: 'hp6', ma: 'PHAR3201', ten: 'Dược học cổ truyền', khoa: 'dv8', soTC: 2, bai: ['Đại cương dược học cổ truyền', 'Tính vị, quy kinh', 'Bào chế thuốc cổ truyền', 'Thuốc giải biểu', 'Thuốc thanh nhiệt', 'Thuốc bổ', 'Thuốc hoạt huyết, chỉ huyết', 'Ôn tập Dược học cổ truyền'] }
    ];

    /* thư viện tài nguyên */
    db.thuVien = [];
    var fid = 0;
    function addFile(ten, loai, thuMuc, kb, hash) { fid++; var f = { id: 'f' + fid, ten: ten, loai: loai, thuMuc: thuMuc, kb: kb, hash: hash || ('h' + fid), ngay: iso(addDays(T, -int(20, 120))), nguoiTai: pick(['admin02', 'annt', 'thuyanh', 'vananh']) }; db.thuVien.push(f); return f.id; }

    db.hocPhan = HP.map(function (h, hi) {
      var bai = h.bai.map(function (t, i) {
        var slug = t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
        var vid = addFile(h.ma + '-b' + (i + 1) + '-' + slug + '.mp4', 'Video', h.ten, int(80000, 420000));
        var pdf = R() < .6 ? addFile(h.ma + '-b' + (i + 1) + '-tai-lieu.pdf', 'PDF', h.ten, int(600, 5200)) : null;
        var quiz = /Ôn tập|Bài tập/.test(t) ? int(10, 20) : (R() < .45 ? int(5, 12) : 0);
        return { id: h.id + '-b' + (i + 1), ten: 'Bài ' + (i + 1) + ' – ' + t, phut: int(15, 95), video: vid, taiLieu: pdf, quiz: quiz, tienQuyet: i ? [h.id + '-b' + i] : [] };
      });
      return { id: h.id, ma: h.ma, ten: h.ten, khoa: h.khoa, soTC: h.soTC, trangThai: 'hoat-dong', moTa: 'Học phần ' + h.ten + ' thuộc chương trình đào tạo Y học cổ truyền trình độ đại học.', chuanDauRa: ['Trình bày được kiến thức nền tảng của học phần', 'Vận dụng vào tình huống lâm sàng cơ bản'], quyTac: 'tien-quyet', tieuChi: { xem: 80, quizDiem: 5 }, bai: bai };
    });
    /* tệp chưa gắn bài nào + tệp trùng */
    addFile('Banner cổng đào tạo trực tuyến.png', 'Ảnh', 'Chưa phân thư mục', 820);
    addFile('Logo Học viện.png', 'Ảnh', 'Chưa phân thư mục', 140);
    addFile('Logo Học viện (1).png', 'Ảnh', 'Chưa phân thư mục', 140, 'h' + (fid));
    addFile('Hướng dẫn sử dụng cổng học viên.pdf', 'PDF', 'Hướng dẫn', 2300);
    addFile('Bản đồ huyệt vị toàn thân.pdf', 'PDF', 'Châm cứu 1', 7800);
    addFile('video-gioi-thieu-khoa.mp4', 'Video', 'Chưa phân thư mục', 245000);
    addFile('Bản đồ huyệt vị toàn thân - copy.pdf', 'PDF', 'Chưa phân thư mục', 7800, 'h' + (fid - 1));
    [['Phát âm tên huyệt – kinh Thủ thái âm Phế.mp3', 'Audio', 'Châm cứu 1', 2100, 185], ['Hướng dẫn tư thế khi châm – thuyết minh.mp3', 'Audio', 'Châm cứu 1', 3400, 312], ['Sơ đồ đường kinh Phế.png', 'Ảnh', 'Châm cứu 1', 460, 0], ['Vị trí huyệt Hợp cốc.jpg', 'Ảnh', 'Châm cứu 1', 380, 0], ['Tiêu bản xương sọ.jpg', 'Ảnh', 'Giải phẫu 1', 910, 0], ['Video thực hành kỹ thuật châm.mp4', 'Video', 'Châm cứu 1', 256000, 1260]].forEach(function (x, k) { db.thuVien.push({ id: 'fm' + (k + 1), ten: x[0], loai: x[1], thuMuc: x[2], kb: x[3], giay: x[4] || null, hash: 'hm' + (k + 1), ngay: iso(addDays(T, -30 - k * 4)), nguoiTai: 'thuyanh' }); });
    addFile('Âm thanh thiền dưỡng sinh.mp3', 'Audio', 'Chưa phân thư mục', 5400);

    db.chuongTrinh = [
      { id: 'ct1', ma: 'YHCT', ten: 'Y học cổ truyền – Đại học', cha: null, khoa: 'dv6', hocPhan: [], trangThai: 'hoat-dong' },
      { id: 'ct2', ma: 'KTN_CC', ten: 'Khối kiến thức Châm cứu', cha: 'ct1', khoa: 'dv6', hocPhan: [], trangThai: 'hoat-dong' },
      { id: 'ct3', ma: 'CC1', ten: 'Châm cứu 1', cha: 'ct2', khoa: 'dv6', hocPhan: ['hp1'], trangThai: 'hoat-dong' },
      { id: 'ct4', ma: 'CC2', ten: 'Châm cứu 2', cha: 'ct2', khoa: 'dv6', hocPhan: ['hp2'], trangThai: 'hoat-dong' },
      { id: 'ct5', ma: 'KTN_GP', ten: 'Khối kiến thức Giải phẫu', cha: 'ct1', khoa: 'dv7', hocPhan: [], trangThai: 'hoat-dong' },
      { id: 'ct6', ma: 'GP1', ten: 'Giải phẫu 1', cha: 'ct5', khoa: 'dv7', hocPhan: ['hp3'], trangThai: 'hoat-dong' },
      { id: 'ct7', ma: 'GP2', ten: 'Giải phẫu 2', cha: 'ct5', khoa: 'dv7', hocPhan: ['hp4'], trangThai: 'hoat-dong' },
      { id: 'ct8', ma: 'KTN_DL', ten: 'Khối kiến thức Dược', cha: 'ct1', khoa: 'dv8', hocPhan: [], trangThai: 'hoat-dong' },
      { id: 'ct9', ma: 'TVDL', ten: 'Thực vật – Dược liệu', cha: 'ct8', khoa: 'dv8', hocPhan: ['hp5'], trangThai: 'hoat-dong' },
      { id: 'ct10', ma: 'DHCT', ten: 'Dược học cổ truyền', cha: 'ct8', khoa: 'dv8', hocPhan: ['hp6'], trangThai: 'hoat-dong' }
    ];

    /* tài khoản, nhóm quyền */
    db.nhomQuyen = [
      { id: 'nq1', ma: 'GRP-ADMIN', ten: 'Quản trị hệ thống', moTa: 'Toàn quyền, gồm cấu hình phân quyền và nhật ký.', pham: 'toan-bo', quyen: 'all' },
      { id: 'nq2', ma: 'GRP-DT', ten: 'Chuyên viên đào tạo', moTa: 'Chương trình, học phần, lớp học, ghi danh.', pham: 'toan-bo', quyen: ['bang-dieu-khien', 'chuong-trinh', 'hoc-phan', 'lop-hoc', 'buoi-hoc', 'giam-sat-lop', 'bao-cao', 'hoc-vien', 'thu-vien'] },
      { id: 'nq3', ma: 'GRP-KT', ten: 'Chuyên viên khảo thí', moTa: 'Ngân hàng câu hỏi, đề thi, kỳ thi, chấm bài.', pham: 'toan-bo', quyen: ['ngan-hang-cau-hoi', 'de-thi', 'ky-thi', 'cham-bai', 'giam-sat-thi', 'phan-tich-cau-hoi'] },
      { id: 'nq4', ma: 'GRP-GV', ten: 'Giảng viên', moTa: 'Lớp được phân công: buổi học, điểm danh, hỏi đáp, chấm bài.', pham: 'lop-phan-cong', quyen: ['lop-hoc', 'buoi-hoc', 'hoi-dap', 'cham-bai', 'bai-tap'] },
      { id: 'nq5', ma: 'GRP-TC', ten: 'Kế toán học phí', moTa: 'Khoản thu, thu học phí, đối soát.', pham: 'toan-bo', quyen: ['khoan-thu', 'thu-hoc-phi'] },
      { id: 'nq6', ma: 'GRP-KHOA', ten: 'Quản lý khoa', moTa: 'Xem báo cáo, lớp, học viên thuộc khoa.', pham: 'don-vi', quyen: ['bang-dieu-khien', 'lop-hoc', 'giam-sat-lop', 'bao-cao', 'hoc-vien'] },
      { id: 'nq7', ma: 'GRP-ATTT', ten: 'An toàn thông tin', moTa: 'Tra cứu nhật ký, phân quyền; không sửa dữ liệu nghiệp vụ.', pham: 'toan-bo', quyen: ['nhat-ky', 'nhom-quyen', 'tai-khoan'] },
      { id: 'nq8', ma: 'GRP-HV', ten: 'Học viên', moTa: 'Cổng học viên.', pham: 'ca-nhan', quyen: [] },
      { id: 'nq9', ma: 'GRP-GT', ten: 'Giám thị', moTa: 'Giám sát ca thi được phân công: kích hoạt, xử lý sự cố thí sinh, lập biên bản.', pham: 'ky-thi-phan-cong', quyen: ['giam-sat-thi'] }
    ];
    db.taiKhoan = [
      { id: 'tk1', ten: 'admin02', hoTen: 'Lê Bảo Châu', email: 'chaulb@vutm.edu.vn', loai: 'nv', nhom: ['nq1'], donVi: 'dv5', trangThai: 'hoat-dong', lanCuoi: new Date(T.getTime() + 8 * 3600000).toISOString() },
      { id: 'tk2', ten: 'daotao01', hoTen: 'Phạm Thị Hồng', email: 'hongpt@vutm.edu.vn', loai: 'nv', nhom: ['nq2'], donVi: 'dv2', trangThai: 'hoat-dong', lanCuoi: addDays(T, -1).toISOString() },
      { id: 'tk3', ten: 'khaothi01', hoTen: 'Trần Minh Đức', email: 'ductm@vutm.edu.vn', loai: 'nv', nhom: ['nq3'], donVi: 'dv3', trangThai: 'hoat-dong', lanCuoi: addDays(T, -2).toISOString() },
      { id: 'tk4', ten: 'ketoan01', hoTen: 'Nguyễn Thu Trang', email: 'trangnt@vutm.edu.vn', loai: 'nv', nhom: ['nq5'], donVi: 'dv4', trangThai: 'hoat-dong', lanCuoi: addDays(T, -3).toISOString() },
      { id: 'tk6', ten: 'giamthi01', hoTen: 'Hoàng Văn Nam', email: 'namhv@vutm.edu.vn', loai: 'nv', nhom: ['nq9'], donVi: 'dv3', trangThai: 'hoat-dong', lanCuoi: addDays(T, -1).toISOString() },
      { id: 'tk7', ten: 'giamthi02', hoTen: 'Lý Thu Hà', email: 'halt@vutm.edu.vn', loai: 'nv', nhom: ['nq9'], donVi: 'dv3', trangThai: 'hoat-dong', lanCuoi: addDays(T, -4).toISOString() },
      { id: 'tk5', ten: 'truongkhoa.yhls', hoTen: 'PGS.TS Đặng Văn Hùng', email: 'hungdv@vutm.edu.vn', loai: 'nv', nhom: ['nq6'], donVi: 'dv6', trangThai: 'hoat-dong', lanCuoi: addDays(T, -5).toISOString() }
    ];

    var GV = [['Nguyễn Thanh An', 'annt', 'dv6'], ['Đỗ Thị Thúy Anh', 'thuyanh', 'dv6'], ['Cao Thị Vân Anh', 'vananh.cao', 'dv6'], ['Nguyễn Võ Hoàng Anh', 'hoanganh', 'dv6'], ['Vũ Thị Lan Anh', 'lananh.vu', 'dv7'], ['Bùi Thị Lan Anh', 'lananh.bui', 'dv7'], ['Đinh Nguyễn An', 'andn', 'dv8'], ['Nguyễn Thị Vân Anh', 'vananh.nguyen', 'dv8']];
    db.giangVien = GV.map(function (g, i) {
      var tkId = null;
      if (i < 7) { tkId = 'tkg' + (i + 1); db.taiKhoan.push({ id: tkId, ten: g[1], hoTen: g[0], email: g[1] + '@vutm.edu.vn', loai: 'gv', nhom: ['nq4'], donVi: g[2], trangThai: 'hoat-dong', lanCuoi: addDays(T, -int(0, 6)).toISOString() }); }
      return { id: 'gv' + (i + 1), ma: 'GV' + String(i + 11).padStart(4, '0'), hoTen: g[0], email: g[1] + '@vutm.edu.vn', sdt: '09' + int(10000000, 99999999), donVi: g[2], taiKhoan: tkId, trangThai: 'hoat-dong' };
    });

    /* học viên */
    var HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Phan', 'Trịnh', 'Mai', 'Đinh', 'Tạ', 'Quách'];
    var DEM_N = ['Văn', 'Hữu', 'Đức', 'Minh', 'Quang', 'Thành', 'Tuấn', 'Gia', 'Hoàng', 'Anh'], DEM_F = ['Thị', 'Ngọc', 'Thu', 'Thanh', 'Khánh', 'Mai', 'Hải', 'Phương', 'Bảo', 'Tuyết'];
    var TEN_N = ['An', 'Bình', 'Cường', 'Dũng', 'Đức', 'Hải', 'Hiếu', 'Hùng', 'Khánh', 'Long', 'Minh', 'Nam', 'Phong', 'Quân', 'Sơn', 'Thắng', 'Toàn', 'Trung', 'Tùng', 'Vinh', 'Bảo', 'Huy'];
    var TEN_F = ['Anh', 'Chi', 'Dung', 'Giang', 'Hà', 'Hạnh', 'Hoa', 'Hương', 'Lan', 'Liên', 'Linh', 'Mai', 'Ngân', 'Nhung', 'Oanh', 'Phương', 'Quyên', 'Thảo', 'Trang', 'Tuyền', 'Vy', 'Yến'];
    function noAcc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
    db.hocVien = [];
    for (var i = 1; i <= 184; i++) {
      var nu = R() < .56, ho = pick(HO), dem = pick(nu ? DEM_F : DEM_N), ten = pick(nu ? TEN_F : TEN_N);
      var ma = 'HV' + String(i).padStart(4, '0');
      var email = noAcc(ten) + noAcc(ho).charAt(0) + noAcc(dem).charAt(0) + i + '@st.vutm.edu.vn';
      var hv = { id: 'hv' + i, ma: ma, hoTen: ho + ' ' + dem + ' ' + ten, gioiTinh: nu ? 'Nữ' : 'Nam', ngaySinh: iso(new Date(2002 + int(0, 5), int(0, 11), int(1, 28))), cccd: '0' + int(10, 99) + (nu ? '3' : '2') + String(int(10000000, 99999999)), sdt: '0' + pick(['9', '8', '3', '7']) + String(int(10000000, 99999999)), email: email, diaChi: pick(['Hà Đông, Hà Nội', 'Thanh Xuân, Hà Nội', 'Nam Định', 'Thái Bình', 'Nghệ An', 'Thanh Hóa', 'Bắc Ninh', 'Hải Dương']), trangThai: 'hoat-dong', taiKhoan: null, ngayTao: iso(addDays(T, -int(30, 400))) };
      db.hocVien.push(hv);
    }
    /* cấp tài khoản cho phần lớn học viên, chừa 14 hồ sơ chưa có */
    db.hocVien.forEach(function (hv, idx) { if (idx % 13 === 5) return; var id = 'tkh' + hv.id; hv.taiKhoan = id; db.taiKhoan.push({ id: id, ten: hv.ma.toLowerCase(), hoTen: hv.hoTen, email: hv.email, loai: 'hv', nhom: ['nq8'], donVi: null, trangThai: 'hoat-dong', lanCuoi: R() < .8 ? addDays(T, -int(0, 20)).toISOString() : null }); });

    /* khoản thu */
    db.khoanThu = [
      { id: 'kt1', ma: 'HP-GP1', ten: 'Học phí lớp mở rộng Giải phẫu 1', loai: 'Học phí', donGia: 4500000, vat: 0, trangThai: 'dang-dung' },
      { id: 'kt2', ma: 'HP-CC-CME', ten: 'Học phí đào tạo liên tục Châm cứu', loai: 'Học phí', donGia: 6800000, vat: 0, trangThai: 'dang-dung' },
      { id: 'kt3', ma: 'LP-THI-LAI', ten: 'Lệ phí thi lại', loai: 'Lệ phí', donGia: 150000, vat: 0, trangThai: 'dang-dung' },
      { id: 'kt4', ma: 'TL-GT', ten: 'Tài liệu giáo trình in', loai: 'Tài liệu', donGia: 220000, vat: 8, trangThai: 'ngung' }
    ];

    /* lớp học — mốc thời gian tính theo ngày hiện tại */
    var LOP = [
      ['L0019', 'Lớp Châm cứu 1 - K26', 'ct3', 'hp1', 'dv6', -150, -40, ['gv1'], 32, null],
      ['L0020', 'Lớp Châm cứu 1 - K27', 'ct3', 'hp1', 'dv6', -45, 48, ['gv2', 'gv3'], 30, null],
      ['L0026', 'Lớp Châm cứu 2 - K26', 'ct4', 'hp2', 'dv6', -30, 90, ['gv3'], 31, null],
      ['L0027', 'Lớp Châm cứu 2 - K27', 'ct4', 'hp2', 'dv6', -20, 96, ['gv4'], 30, null],
      ['L0028', 'Lớp Giải phẫu 1 - K26', 'ct6', 'hp3', 'dv7', -28, 60, ['gv5'], 31, null],
      ['L0029', 'Lớp Giải phẫu 2 - K26', 'ct7', 'hp4', 'dv7', -16, 96, ['gv6'], 30, null],
      ['L0030', 'Lớp Giải phẫu 1 - K27 (mở rộng)', 'ct6', 'hp3', 'dv7', 19, 127, ['gv5'], 0, 'kt1', 'tu-hoc'],
      ['L0031', 'Lớp Giải phẫu 2 - K27', 'ct7', 'hp4', 'dv7', 19, 127, ['gv6'], 0, null],
      ['L0032', 'Lớp Thực vật – Dược liệu - K26', 'ct9', 'hp5', 'dv8', -16, 65, ['gv7'], 28, null, 'tu-hoc'],
      ['L0034', 'Lớp Dược học cổ truyền - K25', 'ct10', 'hp6', 'dv8', -170, -35, ['gv8'], 26, null]
    ];
    db.lop = LOP.map(function (l, i) {
      var bd = addDays(T, l[5]), kt = addDays(T, l[6]);
      var tt = l[6] < 0 ? 'ket-thuc' : (l[5] > 0 ? 'tuyen-sinh' : 'dang-hoc');
      return { id: 'lop' + (i + 1), ma: l[0], ten: l[1], chuongTrinh: l[2], hocPhan: l[3], khoa: l[4], batDau: iso(bd), ketThuc: iso(kt), giangVien: l[7], hinhThuc: l[10] || 'truc-tuyen-gv', sucChua: 40, khoanThu: l[9], tuDangKy: tt === 'tuyen-sinh', trangThai: tt, siSoSeed: l[8], cotDiem: (l[10] === 'tu-hoc' ? [] : [{ ten: 'Chuyên cần', ts: 10, nguon: 'diem-danh' }]).concat([{ ten: 'Kiểm tra giữa kỳ', ts: l[10] === 'tu-hoc' ? 40 : 40, nguon: 'ky-thi', kyThi: null }, { ten: 'Thi cuối kỳ', ts: l[10] === 'tu-hoc' ? 60 : 50, nguon: 'ky-thi', kyThi: null }]), diemDat: 5 };
    });

    /* ghi danh: không trùng học viên trong 1 lớp; 1 học viên có thể học nhiều lớp */
    db.ghiDanh = []; var gdId = 0;
    var pool = db.hocVien.slice();
    db.lop.forEach(function (lop, li) {
      var n = lop.siSoSeed; if (!n) return;
      var start = (li * 23) % pool.length;
      for (var k = 0; k < n; k++) {
        var hv = pool[(start + k * 3) % pool.length];
        gdId++;
        var st = lop.trangThai === 'ket-thuc' ? (R() < .92 ? 'hoan-thanh' : 'thoi-hoc') : (R() < .03 ? 'bao-luu' : 'dang-hoc');
        db.ghiDanh.push({ id: 'gd' + gdId, lop: lop.id, hv: hv.id, ngay: iso(addDays(parse(lop.batDau), -int(1, 10))), trangThai: st, hinhThuc: 'moi' });
      }
    });
    /* đơn đăng ký lớp tuyển sinh (L0030 có thu phí) */
    db.dangKy = []; db.thanhToan = [];
    var l30 = db.lop[6];
    for (var q = 0; q < 14; q++) {
      var hvq = db.hocVien[120 + q]; var paid = q < 7, pend = q >= 7 && q < 11;
      db.dangKy.push({ id: 'dk' + (q + 1), lop: l30.id, hv: hvq.id, ngay: iso(addDays(T, -int(1, 12))), trangThai: paid ? 'da-duyet' : (pend ? 'cho-thanh-toan' : 'cho-duyet') });
      if (paid || pend) db.thanhToan.push({ id: 'tt' + (q + 1), ma: 'DH' + (260900 + q + 1), hv: hvq.id, lop: l30.id, khoanThu: 'kt1', soTien: 4500000, trangThai: paid ? 'da-thanh-toan' : 'cho-thanh-toan', kenh: paid ? pick(['VNPay', 'Chuyển khoản', 'Tiền mặt']) : '—', ngay: iso(addDays(T, -int(0, 10))) });
      if (paid) { gdId++; db.ghiDanh.push({ id: 'gd' + gdId, lop: l30.id, hv: hvq.id, ngay: iso(addDays(T, -int(0, 6))), trangThai: 'cho-khai-giang', hinhThuc: 'moi' }); }
    }

    /* buổi học 2 buổi/tuần cho lớp trực tuyến có giảng viên.
       Điểm danh lấy từ nhật ký phòng học trực tuyến (thamGia), giảng viên rà soát rồi xác nhận (chot). */
    db.cauHinhDD = { nguong: 70, muon: 15, hanXN: 48, tuDongChot: true };
    db.buoiHoc = []; var bId = 0;
    var LY_DO_PHEP = ['Ốm, có giấy khám bệnh', 'Trực bệnh viện theo lịch khoa', 'Việc gia đình đột xuất', 'Tham gia hội nghị chuyên môn', 'Đi công tác theo quyết định của đơn vị'];
    function chuDeLop(lop, n) { var hp = db.hocPhan.filter(function (x) { return x.id === lop.hocPhan; })[0]; if (!hp || !hp.bai.length) return ''; return tenChuDe(hp.bai, n - 1); }
    db.lop.forEach(function (lop) {
      if (!coDiemDanh(lop)) return;
      if (lop.trangThai === 'tuyen-sinh') {
        for (var w = 0; w < 4; w++) { bId++; db.buoiHoc.push({ id: 'b' + bId, lop: lop.id, ten: 'Buổi ' + (w + 1), chuDe: chuDeLop(lop, w + 1), ngay: iso(addDays(parse(lop.batDau), w * 3)), gio: '13:30', den: '16:30', gv: lop.giangVien[0], hinhThuc: 'Trực tuyến', phong: 'Phòng học trực tuyến 0' + (w % 3 + 1), huy: false, diemDanh: null }); }
        return;
      }
      var s = parse(lop.batDau), e = parse(lop.ketThuc), n = 0;
      var hvLopDD = db.ghiDanh.filter(function (g) { return g.lop === lop.id && g.trangThai !== 'cho-khai-giang'; }).map(function (g) { return g.hv; });
      for (var d = new Date(s); d <= e; d = addDays(d, 1)) {
        var wd = d.getDay(); if (wd !== 2 && wd !== 5) continue;
        n++; bId++;
        var ngay = iso(d), past = d < T;
        var b = { id: 'b' + bId, lop: lop.id, ten: 'Buổi ' + n, chuDe: chuDeLop(lop, n), ngay: ngay, gio: wd === 2 ? '07:30' : '13:30', den: wd === 2 ? '10:30' : '16:30', gv: lop.giangVien[n % lop.giangVien.length], hinhThuc: 'Trực tuyến', phong: 'Phòng học trực tuyến 0' + (n % 3 + 1), huy: false, diemDanh: null };
        if (past) {
          var gap = daysBetween(ngay, T);
          var tuNhien = gap <= 6 && R() < .55; /* nhóm buổi không định trước kết quả */
          b.thamGia = {}; b.xinPhep = {}; b.dieuChinh = {};
          if (!tuNhien) {
            hvLopDD.forEach(function (h) {
              var p = hvSkill(h); var r = R();
              var want = r < .78 + p * .18 ? 'co' : (r < .9 + p * .05 ? 'phep' : 'vang');
              if (want === 'phep') { b.xinPhep[h] = { lyDo: LY_DO_PHEP[Math.floor(hashR(h + b.id) * LY_DO_PHEP.length)], luc: new Date(addDays(d, -1 - Math.floor(hashR(b.id + h) * 3)).getTime() + (7 * 60 + Math.floor(hashR(h + 'g') * 780)) * 60000).toISOString(), tt: 'duyet', boi: lop.giangVien[0] }; return; }
              var t = moPhongTG(b, h, want); if (t) b.thamGia[h] = t;
            });
          } else if (gap >= 3 && hashR(b.id + 'loi') < .3) {
            b.thamGia = null; b.loiPhong = true;
          } else {
            hvLopDD.forEach(function (h) { var t = moPhongTG(b, h); if (t) b.thamGia[h] = t; });
          }
          if (b.thamGia) {
            b.diemDanh = {};
            hvLopDD.forEach(function (h) { b.diemDanh[h] = ddTuDong(b, h).tt; });
            /* một vài trường hợp giảng viên điều chỉnh sau khi rà soát */
            hvLopDD.forEach(function (h) { var a = ddTuDong(b, h); if (a.thieu && hashR(h + b.id + 'dc') < .35) { b.diemDanh[h] = 'co'; b.dieuChinh[h] = { tu: 'vang', den: 'co', ghiChu: 'Mất kết nối mạng giữa buổi, đã báo giảng viên và tham gia lại qua điện thoại', boi: b.gv, luc: new Date(parse(ngay).getTime() + hm2m(b.den) * 60000 + 5 * 3600000).toISOString() }; } });
            var ht = buoiMoc(b).kt.getTime();
            if (gap >= 3) b.chot = hashR(b.id + 'c') < .75 ? { boi: b.gv, luc: new Date(ht + (2 + Math.floor(hashR(b.id + 'h') * 30)) * 3600000).toISOString() } : { boi: 'he-thong', luc: new Date(ht + 48 * 3600000).toISOString() };
          }
        }
        db.buoiHoc.push(b);
      }
    });
    /* đơn xin vắng gửi trước cho các buổi sắp tới */
    db.lop.filter(function (l) { return l.trangThai === 'dang-hoc' && coDiemDanh(l); }).slice(0, 3).forEach(function (lop, i) {
      var tiep = db.buoiHoc.filter(function (b) { return b.lop === lop.id && parse(b.ngay) > T; }).sort(function (a, b) { return a.ngay < b.ngay ? -1 : 1; })[0];
      var hs = db.ghiDanh.filter(function (g) { return g.lop === lop.id && g.trangThai === 'dang-hoc'; });
      if (!tiep || hs.length < 6) return;
      tiep.xinPhep = {};
      [2 + i, 5 + i].forEach(function (k, j) { tiep.xinPhep[hs[k].hv] = { lyDo: LY_DO_PHEP[(i + j * 2) % LY_DO_PHEP.length], luc: new Date(addDays(T, -1 - j).getTime() + (8 * 60 + 17 + i * 95) * 60000).toISOString(), tt: j === 0 ? 'cho' : 'duyet', boi: j === 0 ? null : tiep.gv }; });
    });
    function hvSkill(hid) { var k = +String(hid).replace(/\D/g, ''); return ((k * 37) % 100) / 100; }

    /* tiến độ bài giảng + quiz */
    db.tienDo = {};
    db.lop.forEach(function (lop) {
      var hp = db.hocPhan.find(function (h) { return h.id === lop.hocPhan; }); var tot = hp.bai.length;
      var frac = Math.max(0, Math.min(1, daysBetween(lop.batDau, T) / Math.max(1, daysBetween(lop.batDau, lop.ketThuc))));
      var m = db.tienDo[lop.id] = {};
      db.ghiDanh.filter(function (g) { return g.lop === lop.id; }).forEach(function (g) {
        if (g.trangThai === 'cho-khai-giang') return;
        var sk = hvSkill(g.hv);
        var done = lop.trangThai === 'ket-thuc' ? (g.trangThai === 'hoan-thanh' ? tot : int(2, tot - 2)) : Math.round(tot * frac * (0.45 + sk * 0.85) + (R() - .5) * 2);
        if (sk < .1 && lop.trangThai === 'dang-hoc') done = Math.min(done, 1);
        done = Math.max(0, Math.min(tot, done));
        var quiz = {};
        hp.bai.forEach(function (b, bi) { if (bi < done && b.quiz) quiz[b.id] = Math.min(10, Math.round((4.5 + sk * 5 + R() * 1.5) * 10) / 10); });
        m[g.hv] = { done: done, lastAt: iso(addDays(T, -int(0, sk < .15 ? 14 : 5))), quiz: quiz, phutXem: Math.round(done * 38 * (0.8 + R() * .5)) };
      });
    });

    /* ngân hàng câu hỏi */
    var STEM = {
      hp3: ['Giải phẫu học chủ yếu nghiên cứu nội dung nào sau đây?', 'Tư thế giải phẫu chuẩn của cơ thể người được mô tả như thế nào?', 'Xương nào sau đây thuộc xương trục?', 'Loại khớp có khả năng vận động rộng nhất là:', 'Thành phần nào làm giảm ma sát giữa các diện khớp?', 'Dịch hoạt dịch nằm chủ yếu trong:', 'Dây chằng quanh khớp có vai trò quan trọng nhất là:', 'Cơ nào sau đây là cơ vân?', 'Tủy gai kết thúc ở ngang mức đốt sống nào ở người trưởng thành?', 'Dây thần kinh sọ số VII chi phối:', 'Tuyến nội tiết nào nằm ở hố yên xương bướm?', 'Cấu trúc nào của mắt có chức năng điều tiết?', 'Giải phẫu học chủ yếu nghiên cứu nội dung nào sau đây?', 'Kiến thức Giải phẫu 1 là nền tảng cho các môn học nào sau đây?', 'Xương đùi khớp với xương chậu tại:', 'Cơ hoành được chi phối bởi dây thần kinh nào?'],
      hp1: ['Kinh Thủ thái âm Phế bắt đầu từ đâu?', 'Huyệt Hợp cốc thuộc đường kinh nào?', 'Phản ứng "đắc khí" khi châm kim được mô tả là:', 'Huyệt Túc tam lý nằm ở vị trí nào?', 'Chống chỉ định châm cứu tuyệt đối gồm:', 'Mạch Nhâm đi ở vị trí nào trên cơ thể?', 'Huyệt Bách hội nằm trên đường kinh nào?', 'Theo YHHĐ, cơ chế giảm đau của châm cứu liên quan đến:', 'Số huyệt trên kinh Túc thái dương Bàng quang là:', 'Cứu ngải có tác dụng chủ yếu nào?', 'Thời gian lưu kim thông thường là:', 'Huyệt Nội quan thuộc kinh nào?', 'Huyệt Tam âm giao là nơi giao hội của các kinh nào?', 'Mạch Đốc có chức năng chủ yếu:']
    };
    db.nganHang = []; db.cauHoi = []; var qid = 0;
    db.hocPhan.forEach(function (hp, i) {
      var nh = { id: 'nh' + (i + 1), ma: 'NHCH-' + hp.ma, ten: 'Ngân hàng câu hỏi ' + hp.ten, hocPhan: hp.id, trangThai: 'hoat-dong' };
      db.nganHang.push(nh);
      var stems = STEM[hp.id] || hp.bai.map(function (b) { return 'Nội dung nào sau đây đúng với bài "' + b.ten.replace(/^Bài \d+ – /, '') + '"?'; }).concat(hp.bai.slice(0, 6).map(function (b) { return 'Chọn phát biểu sai về "' + b.ten.replace(/^Bài \d+ – /, '') + '".'; }));
      stems.forEach(function (s, k) {
        qid++;
        db.cauHoi.push({ id: 'q' + qid, nh: nh.id, bai: hp.bai[k % hp.bai.length].id, noiDung: s, loai: k % 7 === 6 ? 'tu-luan' : (k % 5 === 4 ? 'nhieu-dap-an' : 'mot-dap-an'), doKho: pick(['De', 'TrungBinh', 'TrungBinh', 'Kho']), phuongAn: ['A', 'B', 'C', 'D'], dapAn: pick(['A', 'B', 'C', 'D']), phienBan: 1, trangThai: 'hoat-dong', ngay: iso(addDays(T, -int(40, 200))) });
      });
    });

    /* nội dung bài giảng dạng khối — dựng sau ngân hàng để quiz trong bài lấy câu từ ngân hàng */
    var MO_DAU = {
      hp1: 'Trong các phương pháp điều trị không dùng thuốc của Đông y, châm cứu là phương pháp tiêu biểu: thầy thuốc dùng kim có kích thước khác nhau tác động lên huyệt vị để điều hòa khí huyết, phòng và chữa bệnh.',
      hp2: 'Bài học vận dụng hệ thống kinh lạc – huyệt vị vào chẩn đoán và điều trị các chứng bệnh thường gặp trên lâm sàng.',
      hp3: 'Giải phẫu học nghiên cứu hình thái, cấu trúc cơ thể người – nền tảng cho các học phần y học cơ sở và lâm sàng.',
      hp4: 'Học phần tiếp nối Giải phẫu 1, tập trung vào các hệ cơ quan nội tạng và liên quan lâm sàng.',
      hp5: 'Nhận biết đặc điểm hình thái thực vật làm thuốc và các nhóm dược liệu thường dùng trong y học cổ truyền.',
      hp6: 'Tính vị, quy kinh, công năng chủ trị và cách bào chế các vị thuốc cổ truyền.'
    };
    var bid = 0;
    function K(loai, o) { bid++; var k = { id: 'k' + bid, loai: loai }; for (var x in o) k[x] = o[x]; return k; }
    db.hocPhan.forEach(function (hp, hi) {
      var ct = db.chuongTrinh.filter(function (c) { return c.hocPhan.indexOf(hp.id) >= 0; });
      hp.phanLoai = ct.length ? ct[ct.length - 1].id : null;
      hp.tieuChi = { xemOn: true, xem: 80, quizOn: true, quizKieu: 'diem', quizDiem: 5, quizPct: 70, tuDong: true };
      hp.bai.forEach(function (b, i) {
        var bank = db.cauHoi.filter(function (q) { return q.bai === b.id && q.loai !== 'tu-luan'; });
        var qs = [];
        if (b.quiz) {
          bank.slice(0, b.quiz).forEach(function (q) { var ok = 'ABCD'.indexOf(q.dapAn), ok2 = (ok + 2) % 4; qs.push({ id: 'qq' + (++bid), loai: q.loai === 'nhieu-dap-an' ? 'nhieu' : 'mot', noiDung: q.noiDung, pa: ['A', 'B', 'C', 'D'].map(function (l, j) { return { t: 'Phương án ' + l, dung: j === ok || (q.loai === 'nhieu-dap-an' && j === ok2) }; }), nguon: q.id }); });
          var ten = b.ten.replace(/^Bài \d+ – /, '');
          while (qs.length < Math.min(b.quiz, 5)) { var n = qs.length; qs.push(n % 3 === 1 ? { id: 'qq' + (++bid), loai: 'dung-sai', noiDung: 'Nội dung trọng tâm của bài "' + ten + '" được trình bày trong video bài giảng.', dung: true } : n % 3 === 2 ? { id: 'qq' + (++bid), loai: 'ngan', noiDung: 'Nêu thuật ngữ chính của bài "' + ten + '".', dapAn: [ten] } : { id: 'qq' + (++bid), loai: 'mot', noiDung: 'Ý nào sau đây đúng với bài "' + ten + '"?', pa: [{ t: 'Phương án A', dung: true }, { t: 'Phương án B', dung: false }, { t: 'Phương án C', dung: false }, { t: 'Phương án D', dung: false }] }); }
        }
        var giay = b.phut * 60 + ((i * 37 + hi * 11) % 60);
        var fv = db.thuVien.find(function (x) { return x.id === b.video; }); if (fv) fv.giay = giay;
        var khoi = [
          K('doan-van', { html: '<p>' + (MO_DAU[hp.id] || '') + '</p>' }),
          K('duong-ke', { kieu: 'ngang' }),
          K('tieu-de', { text: 'Nội dung bài giảng:', cap: 2 }),
          K('video', { file: b.video, chuThich: '', xemToiThieu: 80, batBuoc: true, tuaNhanh: false, dauChim: true, giay: giay })
        ];
        if (b.taiLieu) khoi.push(K('pdf', { file: b.taiLieu, chuThich: 'Tài liệu đọc thêm', taiVe: true }));
        if (qs.length) khoi.push(K('quiz', { tieuDe: 'Câu hỏi củng cố', cauHoi: qs }));
        b.khoi = khoi; b.giay = giay; b.xuatBan = true; b.hocThu = i === 0; b.hien = true; b.tieuChiRieng = null; b.dinhKem = [];
        b.quiz = qs.length;
      });
    });
    /* một học phần đang soạn để minh họa trạng thái Nháp */
    db.hocPhan.push({ id: 'hp7', ma: 'TRAD3105', ten: 'Xoa bóp – Bấm huyệt', khoa: 'dv6', soTC: 2, trangThai: 'nhap', moTa: 'Kỹ thuật xoa bóp, bấm huyệt theo y học cổ truyền và ứng dụng phục hồi chức năng.', chuanDauRa: ['Thực hiện đúng 15 thủ thuật xoa bóp cơ bản', 'Chỉ định và chống chỉ định của xoa bóp – bấm huyệt'], quyTac: 'tien-quyet', tieuChi: { xemOn: true, xem: 80, quizOn: true, quizKieu: 'diem', quizDiem: 5, quizPct: 70, tuDong: true }, phanLoai: null,
      bai: [{ id: 'hp7-b1', ten: 'Bài 1 – Đại cương xoa bóp bấm huyệt', phut: 30, giay: 1800, video: null, taiLieu: null, quiz: 0, tienQuyet: [], khoi: [K('doan-van', { html: '<p>Bản thảo – đang biên soạn nội dung.</p>' })], xuatBan: false, hocThu: false, hien: true, tieuChiRieng: null, dinhKem: [] }] });

    /* đề thi, kỳ thi, bài làm */
    db.deThi = []; db.kyThi = []; db.baiLam = [];
    function makeDe(nh, ten, n, suffix) {
      var qs = db.cauHoi.filter(function (q) { return q.nh === nh.id; }).slice(0, n).map(function (q) { return q.id; });
      var d = { id: 'de' + (db.deThi.length + 1), ma: 'DE-' + nh.ma.replace('NHCH-', '') + '-' + suffix, ten: ten, nh: nh.id, cauHoi: qs, thoiLuong: 45, thang: 10, diemDat: 5, tronCau: true, trangThai: 'xuat-ban' };
      db.deThi.push(d); return d;
    }
    var KT = [['lop2', 'hp1', 1, 'Kiểm tra giữa kỳ Châm cứu 1 - K27', -10, 'GK'], ['lop2', 'hp1', 2, 'Thi cuối kỳ Châm cứu 1 - K27', 44, 'CK'], ['lop5', 'hp3', 1, 'Kiểm tra giữa kỳ Giải phẫu 1 - K26', -3, 'GK'], ['lop10', 'hp6', 1, 'Kiểm tra giữa kỳ Dược học cổ truyền - K25', -100, 'GK'], ['lop10', 'hp6', 2, 'Thi cuối kỳ Dược học cổ truyền - K25', -38, 'CK'], ['lop1', 'hp1', 1, 'Kiểm tra giữa kỳ Châm cứu 1 - K26', -95, 'GK'], ['lop1', 'hp1', 2, 'Thi cuối kỳ Châm cứu 1 - K26', -42, 'CK']];
    KT.forEach(function (k, i) {
      var nh = db.nganHang.find(function (n) { return n.hocPhan === k[1]; });
      var de = db.deThi.find(function (d) { return d.nh === nh.id && d.ma.slice(-2) === k[5]; }) || makeDe(nh, (k[5] === 'GK' ? 'Đề kiểm tra giữa kỳ ' : 'Đề thi cuối kỳ ') + db.hocPhan.find(function (h) { return h.id === k[1]; }).ten, Math.min(12, db.cauHoi.filter(function (q) { return q.nh === nh.id; }).length), k[5]);
      var mo = addDays(T, k[4]); mo.setHours(8, 0);
      var ky = { id: 'ky' + (i + 1), ma: 'KT' + String(i + 1).padStart(3, '0'), ten: k[3], lop: k[0], de: de.id, cot: k[2], moLuc: mo.toISOString(), dongLuc: new Date(mo.getTime() + 2 * 3600000).toISOString(), doiTuong: 'theo-lop', congBo: k[4] < -5, trangThai: 'x' };
      db.kyThi.push(ky);
      var lop = db.lop.find(function (l) { return l.id === k[0]; }); lop.cotDiem[k[2]].kyThi = ky.id;
      if (k[4] >= 0) return;
      db.ghiDanh.filter(function (g) { return g.lop === lop.id && g.trangThai !== 'thoi-hoc'; }).forEach(function (g, gi) {
        if (R() < .04) return; /* vắng thi */
        var sk = hvSkill(g.hv); var tl = {}; var dung = 0, tn = 0, coTL = false;
        de.cauHoi.forEach(function (qId) { var q = db.cauHoi.find(function (x) { return x.id === qId; }); if (q.loai === 'tu-luan') { coTL = true; return; } tn++; var diff = q.doKho === 'De' ? .85 : q.doKho === 'Kho' ? .35 : .62; var ok = R() < Math.min(.97, diff * (0.6 + sk * .75)); tl[qId] = ok; if (ok) dung++; });
        var pending = coTL && k[4] > -5 && gi % 3 === 0;
        var diem = Math.round((dung / Math.max(1, tn)) * 10 * 10) / 10;
        if (coTL && !pending) diem = Math.min(10, Math.round((diem * .8 + (4 + sk * 6) * .2) * 10) / 10);
        db.baiLam.push({ id: 'bl' + (db.baiLam.length + 1), ky: ky.id, hv: g.hv, nop: new Date(mo.getTime() + int(20, 44) * 60000).toISOString(), traLoi: tl, diemTN: Math.round((dung / Math.max(1, tn)) * 10 * 10) / 10, diem: pending ? null : diem, trangThai: pending ? 'cho-cham' : 'da-cham', lichSu: [] });
      });
    });

    db.kyThi.forEach(function (k, i) { k.giamThi = i % 2 ? ['tk3', 'tk7'] : ['tk3', 'tk6']; k.kichHoat = { luc: k.moLuc, nguoi: 'khaothi01' }; k.cheDo = { toanManHinh: true, chanChuyenTab: true, chanSaoChep: true, viPhamToiDa: 5, tuDongNop: false, yeuCauMa: true }; k.maVao = 'KT' + (4821 + i * 37); k.tamDung = null; k.ketThuc = null; k.ghiChuGT = ''; });
    db.phienThi = [];
    [['lop3', 'hp2', 1, 'Kiểm tra giữa kỳ Châm cứu 2 - K26', 'GK', 'live'], ['lop6', 'hp4', 1, 'Kiểm tra giữa kỳ Giải phẫu 2 - K26', 'GK', 'sap']].forEach(function (k) {
      var nh = db.nganHang.find(function (n) { return n.hocPhan === k[1]; });
      var de = makeDe(nh, 'Đề kiểm tra giữa kỳ ' + db.hocPhan.find(function (h) { return h.id === k[1]; }).ten, Math.min(12, db.cauHoi.filter(function (q) { return q.nh === nh.id && q.loai !== 'tu-luan'; }).length), k[4]);
      de.cauHoi = de.cauHoi.filter(function (q) { var c = db.cauHoi.find(function (x) { return x.id === q; }); return c.loai !== 'tu-luan'; });
      var n = db.kyThi.length + 1;
      var ky = { id: 'ky' + n, ma: 'KT' + String(n).padStart(3, '0'), ten: k[3], lop: k[0], de: de.id, cot: k[2], moLuc: T.toISOString(), dongLuc: T.toISOString(), soLan: 1, doiTuong: 'theo-lop', congBo: false, giamThi: k[5] === 'live' ? ['tk6', 'tkg3'] : ['tk7'], kichHoat: null, cheDo: { toanManHinh: true, chanChuyenTab: true, chanSaoChep: true, viPhamToiDa: 5, tuDongNop: false, yeuCauMa: true }, maVao: k[5] === 'live' ? 'CC2-7315' : 'GP2-2046', tamDung: null, ketThuc: null, ghiChuGT: '', moPhong: k[5] };
      db.kyThi.push(ky);
      db.lop.find(function (l) { return l.id === k[0]; }).cotDiem[k[2]].kyThi = ky.id;
    });
    /* điểm nhập tay không có (cột điểm lấy từ điểm danh + kỳ thi) */

    /* hỏi đáp */
    var QS = [
      ['lop2', 'hp1-b2', 'Cô ơi, phản ứng "đắc khí" khi châm kim được giải thích theo cơ chế thần kinh hay thể dịch ạ?', 16, false, [['gv2', 'Cả hai cơ chế cùng tham gia; em xem lại mục 2.3 trong tài liệu bài 2 nhé.', 15]]],
      ['lop2', 'hp1-b2', 'Tác dụng chính của châm cứu theo YHCT là gì ạ?', 15, false, []],
      ['lop2', 'hp1-b4', 'Huyệt Thiếu thương nằm ở góc móng ngón cái phía trong hay phía ngoài ạ?', 3, false, []],
      ['lop2', 'hp1-b5', 'Em xin tài liệu hình minh họa kinh Đại trường bản rõ hơn được không ạ?', 1, true, []],
      ['lop5', 'hp3-b4', 'Khớp gối thuộc loại khớp nào ạ? Em thấy tài liệu ghi khác nhau.', 4, false, [['hv', 'Khớp hoạt dịch kiểu lồi cầu bạn ạ.', 4], ['gv5', 'Đúng rồi, khớp gối là khớp hoạt dịch, kiểu bản lề – lồi cầu.', 3]]],
      ['lop5', 'hp3-b5', 'Cơ delta do dây thần kinh nào chi phối ạ?', 2, false, []],
      ['lop3', 'hp2-b3', 'Phác đồ huyệt điều trị mất ngủ thể tâm tỳ hư có thêm Thần môn không ạ?', 6, false, [['gv3', 'Có, phối hợp Thần môn, Tam âm giao, Tâm du, Tỳ du.', 5]]],
      ['lop4', 'hp2-b2', 'Khi châm điều trị đau đầu vùng đỉnh chọn huyệt chính nào ạ?', 5, false, []],
      ['lop6', 'hp4-b1', 'Trung thất giữa gồm những thành phần nào ạ?', 9, false, [['gv6', 'Tim, màng ngoài tim, gốc các mạch lớn và thần kinh hoành.', 8]]],
      ['lop9', 'hp5-b6', 'Tía tô và Kinh giới cùng họ Hoa môi thì phân biệt bằng đặc điểm nào ạ?', 3, false, []],
      ['lop9', 'hp5-b2', 'Em nộp bài thực hành nhận biết tế bào ở đâu ạ?', 1, true, []],
      ['lop2', 'hp1-b3', 'Em cảm ơn cô và các bạn đã giải đáp.', 14, false, []]
    ];
    db.hoiDap = QS.map(function (q, i) {
      var lop = db.lop.find(function (l) { return l.id === q[0]; });
      var gs = db.ghiDanh.filter(function (g) { return g.lop === lop.id; });
      var asker = gs[(i * 5) % gs.length].hv;
      var t = addDays(T, -q[3]); t.setHours(9 + (i % 8), 15);
      return { id: 'hd' + (i + 1), lop: lop.id, bai: q[1], hv: asker, noiDung: q[2], ngay: t.toISOString(), rieng: q[4], loai: /cảm ơn/i.test(q[2]) ? 'binh-luan' : 'cau-hoi', traLoi: q[5].map(function (a) { var at = addDays(T, -a[2]); at.setHours(14, 30); return { nguoi: a[0] === 'hv' ? gs[(i * 5 + 1) % gs.length].hv : a[0], vaiTro: a[0] === 'hv' ? 'hv' : 'gv', noiDung: a[1], ngay: at.toISOString() }; }) };
    });
    var tlid = 0;
    function TL(nguoi, vaiTro, noiDung, d, h, m) { var at = addDays(T, -d); at.setHours(h || 14, m || 30); tlid++; return { id: 'tl' + tlid, nguoi: nguoi, vaiTro: vaiTro, noiDung: noiDung, ngay: at.toISOString(), xoa: null }; }
    db.hoiDap.forEach(function (t) { t.ghim = false; t.giaiQuyet = null; t.xoa = null; t.traLoi.forEach(function (r) { tlid++; r.id = 'tl' + tlid; r.xoa = null; }); });
    (function () {
      var t1 = db.hoiDap[0], gs2 = db.ghiDanh.filter(function (g) { return g.lop === 'lop2'; });
      var ban = gs2[3].hv;
      t1.traLoi = [
        TL('gv2', 'gv', 'Dưới góc độ y học hiện đại, cảm giác đắc khí là kích thích tổng hợp các thụ cảm thể cảm giác (sợi A-beta, A-delta) ở mô liên kết và cơ. Tín hiệu truyền về tủy sống, não bộ, kích hoạt giải phóng endorphin giúp giảm đau và điều hòa tuần hoàn. Em đọc thêm mục 2.3 tài liệu bài 2.', 15, 10, 22),
        TL(ban, 'hv', 'Em bổ sung kinh nghiệm lâm sàng: khi châm đúng huyệt và đắc khí, tay cầm kim cảm nhận rõ độ mút kim nhẹ, như cá cắn câu, đúng không ạ?', 15, 10, 24),
        TL('gv2', 'gv', 'Đúng rồi em, đó là cảm giác dưới kim của thầy thuốc, thường đi kèm cảm giác tê, tức của người bệnh.', 15, 16, 5),
        TL(t1.hv, 'hv', 'Em cảm ơn cô và các bạn.', 14, 8, 45)
      ];
      t1.giaiQuyet = t1.traLoi[0].id;
      var gk = db.hoiDap.find(function (t) { return /Khớp gối/.test(t.noiDung); }); if (gk) { gk.ghim = true; var r = gk.traLoi.find(function (x) { return x.vaiTro === 'gv'; }); if (r) gk.giaiQuyet = r.id; }
      var tk = db.hoiDap.find(function (t) { return /tài liệu hình minh họa/.test(t.noiDung); }); if (tk) tk.traLoi.push(TL('admin02', 'qt', 'Phòng Đào tạo đã bổ sung bản hình minh họa độ phân giải cao vào mục Tài liệu đính kèm của bài 5.', 0, 9, 10));
      var at = addDays(T, -17); at.setHours(9, 41);
      db.hoiDap.push({ id: 'hd' + (db.hoiDap.length + 1), lop: 'lop2', bai: 'hp1-b3', hv: gs2[6].hv, noiDung: 'Thảo luận: cảm nhận sau buổi thực hành xác định huyệt trên mô hình', ngay: at.toISOString(), rieng: false, loai: 'binh-luan', ghim: false, giaiQuyet: null, xoa: null,
        traLoi: [TL(gs2[6].hv, 'hv', 'Mình thấy dùng thốn đồng thân để đo rất tiện, nhưng cần luyện nhiều.', 17, 9, 41), TL(gs2[8].hv, 'hv', 'Bài học dễ tiếp thu, mô hình 3D giúp nhớ vị trí huyệt nhanh hơn.', 17, 9, 42)] });
    })();

    /* khảo sát */
    db.khaoSat = [
      { id: 'ks1', ten: 'Đánh giá học phần Dược học cổ truyền', lop: 'lop10', guiDi: 26, phanHoi: 21, diemTB: 4.3, trangThai: 'da-dong', cauHoi: 12 },
      { id: 'ks2', ten: 'Đánh giá học phần Châm cứu 1 - K26', lop: 'lop1', guiDi: 32, phanHoi: 25, diemTB: 4.1, trangThai: 'da-dong', cauHoi: 12 },
      { id: 'ks3', ten: 'Khảo sát giữa kỳ Châm cứu 1 - K27', lop: 'lop2', guiDi: 30, phanHoi: 17, diemTB: 3.9, trangThai: 'dang-mo', cauHoi: 8 },
      { id: 'ks4', ten: 'Mức độ hài lòng với cổng học trực tuyến', lop: null, guiDi: 184, phanHoi: 96, diemTB: 3.7, trangThai: 'dang-mo', cauHoi: 10 }
    ];


    /* bài tập giao theo bài giảng + bài nộp */
    db.baiTap = []; db.baiNop = [];
    var TL_MAU = ['Kinh Vị đi từ đầu xuống chân ở mặt trước thân, kinh Tỳ đi từ ngón chân cái lên ngực ở mặt trong chi dưới; hai kinh biểu lý với nhau.', 'Em trình bày đường đi theo sơ đồ trong giáo trình, bổ sung các huyệt chính và liên hệ chứng bệnh thường gặp.', 'Khớp gối là khớp hoạt dịch, các dây chằng chéo giữ vững theo chiều trước sau, sụn chêm tăng độ khớp.', 'Bài làm nêu đủ vị trí, cấu tạo, liên quan; phần chức năng còn sơ lược.', 'Em vẽ lại sơ đồ và đánh dấu các cơ nhóm gấp, duỗi theo bài học.'];
    function mkBT(o) {
      var lop = db.lop.find(function (l) { return l.id === o.lop; }); var hp = db.hocPhan.find(function (h) { return h.id === lop.hocPhan; }); var nh = db.nganHang.find(function (n) { return n.hocPhan === hp.id; });
      var qs = o.soTN ? db.cauHoi.filter(function (q) { return q.nh === nh.id && q.loai !== 'tu-luan'; }).slice(o.qFrom || 0, (o.qFrom || 0) + o.soTN).map(function (q) { return q.id; }) : [];
      var giao = addDays(T, o.giao); giao.setHours(7, 30); var han = addDays(T, o.han); han.setHours(23, 59);
      var bt = { id: 'bt' + (db.baiTap.length + 1), ma: 'BT' + String(db.baiTap.length + 1).padStart(3, '0'), ten: o.ten, lop: lop.id, hocPhan: hp.id, gv: o.gv, phamVi: { loai: o.pv.length > 1 ? 'nhieu-bai' : 'bai', bai: o.pv.map(function (i) { return hp.id + '-b' + i; }) }, loai: o.loai, cauHoi: qs, deTL: o.deTL || '', rubric: o.rubric || [], taiLieu: [], tyLe: o.tyLe || { tn: qs.length ? 100 : 0, tl: qs.length ? 0 : 100 }, giaoLuc: giao.toISOString(), hanNop: han.toISOString(), nopMuon: o.nopMuon || { cho: false, truPct: 10, toiDa: 3 }, soLan: o.soLan || 1, cachLay: 'cao-nhat', tronCau: true, hienDapAn: 'sau-han', doiTuong: 'ca-lop', hvChon: [], trangThai: o.nhap ? 'nhap' : 'da-giao', thongBao: true, nhacTruocHan: true, chuyenDiem: null, ngayTao: addDays(T, o.giao - 1).toISOString() };
      db.baiTap.push(bt);
      if (o.nhap) return bt;
      var span = Math.max(1, o.han - o.giao), elapsed = Math.min(1, -o.giao / span);
      db.ghiDanh.filter(function (g) { return g.lop === lop.id && g.trangThai === 'dang-hoc'; }).forEach(function (g, gi) {
        var sk = hvSkill(g.hv); var p = o.han < 0 ? .68 + sk * .3 : elapsed * (.35 + sk * .55);
        if (R() > p) return;
        var late = o.han < 0 && bt.nopMuon.cho && R() < .18; var nop = late ? new Date(han.getTime() + int(1, 2) * DAY - 3600000 * int(1, 20)) : new Date(giao.getTime() + R() * (Math.min(Date.now(), han.getTime()) - giao.getTime()));
        var tl = {}, dung = 0; qs.forEach(function (qId) { var q = db.cauHoi.find(function (x) { return x.id === qId; }); var diff = q.doKho === 'De' ? .88 : q.doKho === 'Kho' ? .42 : .66; var ok = R() < Math.min(.97, diff * (.62 + sk * .7)); tl[qId] = ok; if (ok) dung++; });
        var diemTN = qs.length ? Math.round(dung / qs.length * 100) / 10 : null;
        var needTL = bt.tyLe.tl > 0; var graded = !needTL || (gi % 10) / 10 < (o.daCham == null ? 1 : o.daCham);
        var rb = null, diemTL = null; if (needTL && graded) { rb = bt.rubric.map(function (r) { return Math.round(Math.min(r.diem, r.diem * (.45 + sk * .5 + R() * .15)) * 2) / 2; }); var tot = bt.rubric.reduce(function (a, r) { return a + r.diem; }, 0); diemTL = Math.round(rb.reduce(function (a, b) { return a + b; }, 0) / tot * 100) / 10; }
        var tru = late ? Math.min(bt.nopMuon.toiDa, Math.ceil((nop - han) / DAY)) * bt.nopMuon.truPct : 0;
        var diem = graded ? Math.max(0, Math.round(((diemTN || 0) * bt.tyLe.tn / 100 + (diemTL || 0) * bt.tyLe.tl / 100) * (1 - tru / 100) * 10) / 10) : null;
        db.baiNop.push({ id: 'bn' + (db.baiNop.length + 1), bt: bt.id, hv: g.hv, lan: 1, nopLuc: nop.toISOString(), traLoi: tl, baiLamTL: needTL ? pick(TL_MAU) : '', tep: o.loai === 'nop-tep' ? ['so-do-he-co-' + g.hv + '.pdf'] : [], diemTN: diemTN, rubric: rb, diemTL: diemTL, truMuon: tru, diem: diem, trangThai: graded ? 'da-cham' : 'cho-cham', nhanXet: graded && needTL ? pick(['Trình bày rõ, cần bổ sung phần liên hệ lâm sàng.', 'Đúng trọng tâm.', 'Còn thiếu vị trí các huyệt chính.', 'Sơ đồ rõ ràng, chú thích đầy đủ.']) : '', nguoiCham: graded && needTL ? o.gv : null, lichSu: [] });
      });
      return bt;
    }
    var RUB = [{ ten: 'Nội dung đúng, đủ ý', diem: 5 }, { ten: 'Liên hệ lâm sàng', diem: 3 }, { ten: 'Trình bày', diem: 2 }];
    mkBT({ ten: 'Trắc nghiệm kinh Thủ thái âm Phế', lop: 'lop2', gv: 'gv2', pv: [4], loai: 'trac-nghiem', soTN: 8, giao: -12, han: -5 });
    mkBT({ ten: 'Tự luận: so sánh đường đi kinh Vị và kinh Tỳ', lop: 'lop2', gv: 'gv3', pv: [6, 7], loai: 'tu-luan', deTL: 'So sánh đường đi, huyệt khởi – kết và quan hệ biểu lý của kinh Túc dương minh Vị và kinh Túc thái âm Tỳ. Vẽ sơ đồ minh họa.', rubric: RUB, giao: -9, han: -2, daCham: .6, nopMuon: { cho: true, truPct: 10, toiDa: 3 } });
    mkBT({ ten: 'Ôn tập bài 8–10 (trắc nghiệm + tự luận)', lop: 'lop2', gv: 'gv2', pv: [8, 9, 10], loai: 'ket-hop', soTN: 6, qFrom: 6, deTL: 'Nêu 3 huyệt quan trọng trên kinh Tâm và chỉ định chính của từng huyệt.', rubric: RUB, tyLe: { tn: 60, tl: 40 }, giao: -2, han: 3, daCham: .3 });
    var bt4 = mkBT({ ten: 'Bài tập hệ khớp', lop: 'lop5', gv: 'gv5', pv: [4], loai: 'ket-hop', soTN: 6, deTL: 'Mô tả cấu tạo khớp gối và vai trò của các dây chằng chéo.', rubric: RUB, tyLe: { tn: 50, tl: 50 }, giao: -15, han: -8 });
    mkBT({ ten: 'Nộp sơ đồ nhóm cơ chi trên', lop: 'lop5', gv: 'gv5', pv: [5], loai: 'nop-tep', deTL: 'Vẽ sơ đồ các nhóm cơ vùng cánh tay và cẳng tay, ghi chú động tác chính. Nộp tệp PDF hoặc ảnh.', rubric: [{ ten: 'Đúng vị trí các cơ', diem: 6 }, { ten: 'Chú thích động tác', diem: 3 }, { ten: 'Trình bày', diem: 1 }], giao: -6, han: -1, daCham: .2, nopMuon: { cho: true, truPct: 10, toiDa: 3 } });
    mkBT({ ten: 'Bài tập nhĩ châm (bản nháp)', lop: 'lop3', gv: 'gv3', pv: [10], loai: 'trac-nghiem', soTN: 5, giao: 2, han: 9, nhap: true });
    /* lớp Giải phẫu 1 - K26: thêm cột "Bài tập" nhận điểm từ BT hệ khớp */
    var l5 = db.lop.find(function (l) { return l.id === 'lop5'; }); var gk5 = l5.cotDiem[1].kyThi;
    l5.cotDiem = [{ ten: 'Chuyên cần', ts: 10, nguon: 'diem-danh' }, { ten: 'Bài tập', ts: 20, nguon: 'bai-tap', baiTap: [bt4.id], gop: 'trung-binh', khongNop: 'tinh-0' }, { ten: 'Kiểm tra giữa kỳ', ts: 30, nguon: 'ky-thi', kyThi: gk5 }, { ten: 'Thi cuối kỳ', ts: 40, nguon: 'ky-thi', kyThi: null }];
    db.kyThi.forEach(function (k) { if (k.id === gk5) k.cot = 2; });
    bt4.chuyenDiem = { cot: 1, luc: addDays(T, -6).toISOString(), nguoi: 'lananh.vu' };

    /* thông báo lớp */
    db.thongBao = [];
    function hvLop(lopId) { return db.ghiDanh.filter(function (g) { return g.lop === lopId && g.trangThai !== 'thoi-hoc'; }).map(function (g) { return g.hv; }); }
    function mkTB(lopId, o) {
      var ids = hvLop(lopId), gui = addDays(T, -(o.truoc || 0)); gui.setHours(o.gio || 8, 15);
      var t = { id: 'tb' + (db.thongBao.length + 1), lop: lopId, tieuDe: o.tieuDe, noiDung: o.noiDung, loai: o.loai || 'chung', nguoiNhan: ids, ngay: gui.toISOString(), nguoiGui: o.nguoiGui || 'admin02', trangThai: o.trangThai || 'da-gui', henGio: null, ghim: !!o.ghim, kenh: { portal: true, email: o.email !== false }, yeuCauXacNhan: !!o.xacNhan, dinhKem: o.dinhKem || [], xem: {}, xacNhan: {}, thuHoi: null };
      if (t.trangThai === 'hen-gio') { var hg = addDays(T, o.sau || 1); hg.setHours(7, 0); t.henGio = hg.toISOString(); t.ngay = hg.toISOString(); }
      if (t.trangThai === 'da-gui') ids.forEach(function (h, i) { var k = ((i * 37 + (o.tieuDe.length * 11)) % 100) / 100; if (k < (o.xem || .8)) { var x = new Date(gui.getTime() + (1 + (i * 53) % 40) * 3600000); if (x < new Date()) t.xem[h] = x.toISOString(); if (t.yeuCauXacNhan && k < (o.xn || .6)) t.xacNhan[h] = x.toISOString(); } });
      db.thongBao.push(t); return t;
    }
    mkTB('lop2', { tieuDe: 'Thông báo xem tài liệu trước buổi học', loai: 'hoc-tap', ghim: true, truoc: 12, xem: .86, noiDung: 'Để chuẩn bị cho các buổi học tới, đề nghị cả lớp đọc trước slide và tài liệu tham khảo của bài mới tại mục Tài liệu trên cổng học trực tuyến, ghi lại câu hỏi chưa rõ để thảo luận trong giờ học.\nTrân trọng,\nCô Thúy Anh', nguoiGui: 'thuyanh' });
    mkTB('lop2', { tieuDe: 'Lịch kiểm tra giữa kỳ Châm cứu 1', loai: 'thi', truoc: 14, xem: .93, xacNhan: true, xn: .8, noiDung: 'Kiểm tra giữa kỳ học phần Châm cứu 1 diễn ra trực tuyến trên hệ thống, thời gian làm bài 45 phút. Học viên kiểm tra thiết bị, đường truyền trước giờ thi và xác nhận đã đọc thông báo này.' });
    mkTB('lop2', { tieuDe: 'Đổi phòng học trực tuyến buổi tới', loai: 'lich-hoc', truoc: 2, gio: 16, xem: .45, noiDung: 'Buổi học tới chuyển sang Phòng học trực tuyến 02, giờ học không đổi. Học viên vào phòng trước 10 phút để điểm danh.' });
    mkTB('lop2', { tieuDe: 'Nhắc hạn nộp bài tập ôn tập bài 8–10', loai: 'bai-tap', trangThai: 'hen-gio', sau: 1, noiDung: 'Bài tập ôn tập bài 8–10 hết hạn nộp vào 23:59 ngày mai. Học viên chưa nộp hoàn thành đúng hạn.' });
    mkTB('lop2', { tieuDe: 'Nghỉ học dịp lễ', loai: 'lich-hoc', trangThai: 'nhap', noiDung: 'Lớp nghỉ học theo lịch nghỉ lễ của Học viện; buổi học bù sẽ thông báo sau.' });
    mkTB('lop5', { tieuDe: 'Tài liệu ôn tập giữa kỳ Giải phẫu 1', loai: 'hoc-tap', truoc: 6, xem: .7, dinhKem: [], noiDung: 'Tài liệu ôn tập đã được đính kèm trong bài 4, học viên tải về ôn trước buổi kiểm tra.', nguoiGui: 'lananh.vu' });
    mkTB('lop3', { tieuDe: 'Kiểm tra giữa kỳ trực tuyến', loai: 'thi', truoc: 3, xem: .9, xacNhan: true, xn: .75, noiDung: 'Kiểm tra giữa kỳ học phần Châm cứu 2 làm bài trực tuyến, có giám sát. Học viên nhận mã vào thi từ giám thị khi bắt đầu ca thi.' });

    /* khảo sát: câu hỏi và phiếu trả lời thật để tính kết quả */
    function ksQ(key) { return KS_MAU[key].cau.map(function (c, i) { return { id: key + '-' + (i + 1), noiDung: c[0], loai: c[1], luaChon: c[2] ? c[2].slice() : [], batBuoc: c[1] !== 'tu-luan' }; }); }
    function ksPhieu(k, n, lech) {
      var ids = hvLop(k.lop).slice(0, n);
      k.phieu = ids.map(function (h, i) { var tl = {}; k.cauHoi.forEach(function (q, qi) { var r = ((i * 31 + qi * 17 + k.id.length * 7) % 100) / 100;
        if (q.loai === 'thang') tl[q.id] = Math.max(1, Math.min(5, Math.round(2.5 + lech + r * 1.9 - (qi % 4 === 3 ? .7 : 0))));
        else if (q.loai === 'lua-chon') tl[q.id] = Math.floor(r * q.luaChon.length * .999);
        else if (q.loai === 'nhieu') tl[q.id] = q.luaChon.map(function (x, j) { return j; }).filter(function (j) { return ((i + j * 3 + qi) % 3) === 0; });
        else if (r < .45) tl[q.id] = KS_NX[(i + qi) % KS_NX.length]; });
        var t = addDays(parse(k.batDau), 1 + (i % 5)); t.setHours(9 + i % 10, (i * 7) % 60); return { hv: h, luc: t.toISOString(), tl: tl }; });
    }
    function mkKS(o) {
      var k = { id: o.id, ten: o.ten, lop: o.lop, moTa: o.moTa || '', batDau: iso(addDays(T, o.bd)), ketThuc: iso(addDays(T, o.kt)), anDanh: o.anDanh !== false, trangThai: o.trangThai, cauHoi: ksQ(o.mau), phieu: [], nhac: [], thongBaoKhiMo: true, nhacTuDong: true, doiTuong: 'dang-hoc', ngayGui: o.trangThai === 'nhap' ? null : iso(addDays(T, o.bd)) };
      if (o.n) ksPhieu(k, o.n, o.lech || .5);
      ksDongBo(k, db); return k;
    }
    db.khaoSat = [
      mkKS({ id: 'ks1', ten: 'Đánh giá học phần Dược học cổ truyền', lop: 'lop10', mau: 'cuoi-ky', bd: -40, kt: -30, trangThai: 'da-dong', n: 21, lech: .8 }),
      mkKS({ id: 'ks2', ten: 'Đánh giá học phần Châm cứu 1 - K26', lop: 'lop1', mau: 'cuoi-ky', bd: -45, kt: -35, trangThai: 'da-dong', n: 25, lech: .6 }),
      mkKS({ id: 'ks3', ten: 'Khảo sát giữa kỳ Châm cứu 1 - K27', lop: 'lop2', mau: 'giua-ky', bd: -5, kt: 4, trangThai: 'dang-mo', n: 17, lech: .4, moTa: 'Ý kiến của anh/chị giúp giảng viên điều chỉnh cách dạy ở nửa sau học phần. Phiếu ẩn danh, mất khoảng 3 phút.' }),
      { id: 'ks4', ten: 'Mức độ hài lòng với cổng học trực tuyến', lop: null, guiDi: 184, phanHoi: 96, diemTB: 3.7, trangThai: 'dang-mo', cauHoi: 10 },
      mkKS({ id: 'ks5', ten: 'Đánh giá buổi học trực tuyến tuần 4', lop: 'lop2', mau: 'buoi-hoc', bd: 1, kt: 6, trangThai: 'nhap' })
    ];
    db.dangKy.push({ id: 'dk-l2-1', lop: 'lop2', hv: db.ghiDanh.filter(function (g) { return g.lop === 'lop2'; })[4].hv, ngay: iso(addDays(T, -18)), trangThai: 'da-duyet' });
    db.hocVien.filter(function (h) { return !db.ghiDanh.some(function (g) { return g.hv === h.id; }); }).slice(0, 3).forEach(function (h, i) { db.dangKy.push({ id: 'dk-l8-' + i, lop: 'lop8', hv: h.id, ngay: iso(addDays(T, -1 - i)), trangThai: i === 2 ? 'tu-choi' : 'cho-duyet', lyDo: i === 2 ? 'Chưa đủ điều kiện tiên quyết học phần Giải phẫu 1' : undefined }); });
    db.nhatKy = [];
    var LOG0 = [['admin02', 'Tạo', 'Lớp học', 'Lớp Giải phẫu 2 - K27', -9], ['daotao01', 'Sửa', 'Học phần', 'Giải phẫu 1 · cập nhật tiêu chí hoàn thành', -8], ['khaothi01', 'Xuất bản', 'Đề thi', 'Đề kiểm tra giữa kỳ Giải phẫu 1', -6], ['annt', 'Điểm danh', 'Buổi học', 'Lớp Châm cứu 1 - K26 · Buổi 18', -41], ['ketoan01', 'Xác nhận thanh toán', 'Thanh toán', 'DH260901 · 4.500.000 ₫', -5], ['admin02', 'Cấp tài khoản', 'Học viên', '12 tài khoản học viên', -4], ['khaothi01', 'Công bố điểm', 'Kỳ thi', 'Kiểm tra giữa kỳ Châm cứu 1 - K27', -3], ['admin02', 'Sửa', 'Nhóm quyền', 'Quản lý khoa · thêm quyền Báo cáo', -2]];
    LOG0.forEach(function (l, i) { var t = addDays(T, l[4]); t.setHours(8 + i, 10 + i * 3); db.nhatKy.push({ id: 'nk' + (i + 1), t: t.toISOString(), user: l[0], hanhDong: l[1], doiTuong: l[2], tomTat: l[3], truoc: null, sau: null }); });
    return db;
  }

  /* ---------------- lưu trữ ---------------- */
  var db;
  function load() { try { var s = localStorage.getItem(KEY); if (s) { var o = JSON.parse(s); if (o && o.meta && o.meta.version === 13) return o; } } catch (e) { } return null; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { } }
  db = load();
  if (!db) { db = seed(); }
  var dbCa = dongBoCaMoPhong(), dbBuoi = dongBoBuoi();
  if (dbCa || dbBuoi || !load()) save();
  function reset() { db = seed(); dongBoCaMoPhong(); dongBoBuoi(); save(); LMS.db = db; }

  /* ---------------- truy vấn ---------------- */
  function byId(coll, id) { var a = db[coll] || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function nextId(p) { return p + Date.now().toString(36) + Math.floor(Math.random() * 1000); }
  function name(coll, id, key) { var o = byId(coll, id); return o ? o[key || 'ten'] || o.hoTen : '—'; }
  function donViTen(id) { return name('donVi', id); }
  function hocPhanOfLop(lop) { return byId('hocPhan', lop.hocPhan); }
  function ghiDanhLop(lopId, all) { return db.ghiDanh.filter(function (g) { return g.lop === lopId && (all || g.trangThai === 'dang-hoc' || g.trangThai === 'hoan-thanh'); }); }
  function soHV(lopId) { return db.ghiDanh.filter(function (g) { return g.lop === lopId && g.trangThai !== 'thoi-hoc'; }).length; }
  function buoiCuaLop(lopId) { return db.buoiHoc.filter(function (b) { return b.lop === lopId; }).sort(function (a, b) { return a.ngay < b.ngay ? -1 : 1; }); }
  /* ---- buổi học & điểm danh tự động ----
     Học viên vào phòng học trực tuyến của buổi → hệ thống ghi nhật ký (thamGia: giờ vào, giờ rời, số phút, số lần vào).
     Kết thúc buổi, hệ thống tính kết quả theo quy tắc (cauHinhDD); giảng viên rà soát, điều chỉnh có ghi chú rồi xác nhận (chot).
     Quá hạn xác nhận, hệ thống tự chốt. Buổi không có nhật ký (sự cố phòng học, dạy ngoài hệ thống) điểm danh thủ công. */
  function cfgDD() { return (db && db.cauHinhDD) || DD_MAC_DINH; }
  function hashR(x) { var h = 2166136261; x = String(x); for (var i = 0; i < x.length; i++) { h ^= x.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
  function hm2m(h) { var p = String(h || '0:0').split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function m2hm(m) { m = Math.max(0, Math.min(1439, Math.round(m))); var h = Math.floor(m / 60), mi = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi; }
  function buoiMoc(b) { var d = parse(b.ngay).getTime(); return { bd: new Date(d + hm2m(b.gio) * 60000), kt: new Date(d + hm2m(b.den) * 60000) }; }
  function thoiLuongBuoi(b) { return Math.max(0, hm2m(b.den) - hm2m(b.gio)); }
  function hanXacNhan(b) { return new Date(buoiMoc(b).kt.getTime() + cfgDD().hanXN * 3600000); }
  function moPhongTG(b, hv, want) {
    /* nhật ký phòng học mô phỏng, cố định theo mã buổi + mã học viên */
    var r = hashR(b.id + '|' + hv), r2 = hashR(hv + '|' + b.id + '|x'), g0 = hm2m(b.gio), g1 = hm2m(b.den), tl = g1 - g0;
    if (!want) { var k = +String(hv).replace(/\D/g, ''), p = ((k * 37) % 100) / 100; want = r < .8 + p * .15 ? 'co' : 'vang'; }
    if (want === 'phep') return null;
    if (want === 'vang') { if (r2 < .7) return null; var v0 = g0 + 5 + Math.floor(r2 * 40), ph0 = Math.round(tl * (.15 + r * .35)); return { vao: m2hm(v0), ra: m2hm(v0 + ph0), phut: ph0, lan: r < .5 ? 1 : 2 }; }
    var late = r2 < .12, v = g0 - 10 + Math.floor(r * 12) + (late ? 16 + Math.floor(r2 * 1000) % 14 : 0);
    var ra = g1 - Math.floor(r2 * 8), lan = r < .2 ? 2 : 1, gap = lan > 1 ? 3 + Math.floor(r * 8) : 0;
    return { vao: m2hm(v), ra: m2hm(ra), phut: Math.max(0, Math.min(ra, g1) - Math.max(v, g0) - gap), lan: lan };
  }
  function ddTuDong(b, hv, xp) {
    var c = cfgDD(), tl = thoiLuongBuoi(b), t = b.thamGia && b.thamGia[hv], ph = 0;
    if (t) ph = t.ra ? t.phut : (t.phut || 0) + Math.max(0, Math.round((Math.min(Date.now(), buoiMoc(b).kt.getTime()) - Math.max(parse(b.ngay).getTime() + hm2m(t.tu || t.vao) * 60000, buoiMoc(b).bd.getTime())) / 60000));
    var pct = tl ? Math.min(100, Math.round(ph / tl * 100)) : 0;
    var x = (xp || b.xinPhep || {})[hv];
    var tt = t && pct >= c.nguong ? 'co' : (x && x.tt === 'duyet' ? 'phep' : 'vang');
    var tre = t ? hm2m(t.vao) - hm2m(b.gio) : 0;
    return { tt: tt, phut: ph, pct: pct, muon: tt === 'co' && tre > c.muon ? tre : 0, thieu: tt !== 'co' && ph > 0, vao: t ? t.vao : null, ra: t ? t.ra : null, lan: t ? t.lan : 0, trongPhong: !!t && !t.ra };
  }
  function hvBuoi(b) { return b.diemDanh ? Object.keys(b.diemDanh) : ghiDanhLop(b.lop).map(function (g) { return g.hv; }); }
  function ddAuto(b) { var o = {}; hvBuoi(b).forEach(function (h) { o[h] = ddTuDong(b, h).tt; }); return o; }
  function buoiStatus(b) {
    if (b.huy) return { key: 'huy', label: 'Đã hủy', tone: '' };
    var now = Date.now(), m = buoiMoc(b), diff = daysBetween(TODAY, b.ngay);
    if (now < m.bd.getTime()) return diff > 0 ? { key: 'sap', label: 'Sắp diễn ra', tone: 'navy', sub: 'còn ' + diff + ' ngày' } : { key: 'hom-nay', label: 'Hôm nay', tone: 'navy', sub: 'bắt đầu ' + b.gio };
    if (now < m.kt.getTime()) { var n = b.thamGia ? Object.keys(b.thamGia).filter(function (k) { return !b.thamGia[k].ra; }).length : 0; return { key: 'dang', label: 'Đang diễn ra', tone: 'info', sub: n + ' học viên trong phòng' }; }
    if (!b.diemDanh) return { key: 'chua-dd', label: 'Chưa có điểm danh', tone: 'bad', sub: b.loiPhong ? 'không có nhật ký phòng học' : 'buổi dạy ngoài phòng học hệ thống' };
    if (!b.chot) return { key: 'cho-xn', label: 'Chờ xác nhận', tone: 'warn', sub: (cfgDD().tuDongChot ? 'tự chốt ' : 'hạn ') + fmtDT(hanXacNhan(b)) };
    return { key: 'xong', label: 'Đã chốt', tone: 'ok', sub: b.chot.boi === 'he-thong' ? 'hệ thống tự chốt' : (byId('giangVien', b.chot.boi) ? 'GV xác nhận ' : 'PĐT xác nhận ') + fmtDT(b.chot.luc).slice(0, 10) };
  }
  function danhSoBuoi(lopId) {
    var bs = db.buoiHoc.filter(function (b) { return b.lop === lopId; }).sort(function (a, b) { return (a.ngay + a.gio) < (b.ngay + b.gio) ? -1 : 1; });
    var n = 0; bs.forEach(function (b) { if (b.huy) return; n++; if (/^Buổi \d+$/.test(b.ten)) b.ten = 'Buổi ' + n; });
  }
  function tenChuDe(bai, i) {
    /* buổi vượt quá số bài giảng dùng cho thực hành, ôn tập theo vòng bài */
    var x = bai[i % bai.length], t = typeof x === 'string' ? x : x.ten;
    return i < bai.length ? t : 'Thực hành, ôn tập: ' + t.replace(/^Bài \d+\s*[–-]\s*/, '');
  }
  function ganChuDe(lopId) {
    /* chủ đề các buổi theo thứ tự bài giảng của học phần (dùng khi chèn buổi mô phỏng vào lịch có sẵn) */
    var hp = hocPhanOfLop(byId('lop', lopId)); if (!hp || !hp.bai.length) return;
    buoiCuaLop(lopId).filter(function (b) { return !b.huy; }).sort(function (a, b) { return (a.ngay + a.gio) < (b.ngay + b.gio) ? -1 : 1; }).forEach(function (b, i) { b.chuDe = tenChuDe(hp.bai, i); });
  }
  function ketThucBuoi(b) {
    /* chốt nhật ký phòng học khi buổi kết thúc và tính kết quả điểm danh tự động */
    Object.keys(b.thamGia).forEach(function (k) { var t = b.thamGia[k]; if (!t.ra) { t.phut = ddTuDong(b, k).phut; t.ra = b.den; delete t.tu; } });
    var o = {}; ghiDanhLop(b.lop).forEach(function (g) { o[g.hv] = ddTuDong(b, g.hv).tt; });
    b.diemDanh = o; b.dieuChinh = b.dieuChinh || {};
  }
  function dongBoBuoi(chiKetThuc) {
    if (!db || !db.buoiHoc) return false;
    var now = Date.now(), ch = false, c = cfgDD();
    if (!db.cauHinhDD) { db.cauHinhDD = JSON.parse(JSON.stringify(DD_MAC_DINH)); ch = true; }
    /* hai buổi mô phỏng quanh thời điểm mở demo: một buổi đang học, một buổi vừa kết thúc chờ giảng viên xác nhận */
    var lops = chiKetThuc ? [] : db.lop.filter(function (l) { return l.trangThai === 'dang-hoc' && coDiemDanh(l) && ghiDanhLop(l.id).length >= 8; });
    function datGio(b, ngay, bd, kt) { b.ngay = iso(ngay); b.gio = m2hm(bd); b.den = m2hm(kt); }
    (chiKetThuc ? [] : [['live', lops[0]], ['vua-xong', lops[2] || lops[0]], ['vua-xong-2', lops[3] || lops[0]]]).forEach(function (x) {
      var kieu = x[0], lop = x[1]; if (!lop) return;
      var b = db.buoiHoc.filter(function (y) { return y.moPhong === kieu; })[0];
      var d = new Date(), phutNay = d.getHours() * 60 + d.getMinutes(), hom = startOfDay(d);
      var can = !b;
      if (b && kieu === 'live') { var m = buoiMoc(b); if (now < m.bd.getTime() || now > m.kt.getTime() - 30 * 60000 || b.huy) can = true; }
      if (b && kieu !== 'live') { var mk = buoiMoc(b); if (now < mk.kt.getTime() || now - mk.kt.getTime() > 30 * 3600000 || b.huy) can = true; }
      if (!can) return;
      if (!b) { b = { id: 'bmp-' + kieu, lop: lop.id, ten: 'Buổi 0', chuDe: '', hinhThuc: 'Trực tuyến', phong: kieu === 'live' ? 'Phòng học trực tuyến 04' : kieu === 'vua-xong' ? 'Phòng học trực tuyến 05' : 'Phòng học trực tuyến 02', huy: false, moPhong: kieu }; db.buoiHoc.push(b); }
      b.lop = lop.id; b.gv = lop.giangVien[0]; b.huy = false; delete b.lyDoHuy; b.diemDanh = null; b.chot = null; b.dieuChinh = {}; b.thamGia = {}; b.xinPhep = {}; delete b.loiPhong;
      var bd0 = Math.floor((phutNay - 50) / 5) * 5;
      if (kieu === 'live') { if (bd0 < 0) bd0 = 0; datGio(b, hom, bd0, Math.min(1435, bd0 + 150)); }
      else if (kieu === 'vua-xong') { var bd1 = Math.floor((phutNay - 290) / 5) * 5; if (bd1 >= 360) datGio(b, hom, bd1, bd1 + 150); else datGio(b, addDays(hom, -1), 13 * 60 + 30, 16 * 60); }
      else datGio(b, addDays(hom, -1), 18 * 60, 20 * 60 + 30);
      var hs = ghiDanhLop(lop.id).map(function (g) { return g.hv; }), g0 = hm2m(b.gio);
      hs.forEach(function (h, i) {
        var r = hashR(h + kieu), r2 = hashR(kieu + h + 'z');
        if (kieu !== 'live') {
          if (i === 3 && kieu === 'vua-xong') { b.xinPhep[h] = { lyDo: 'Ốm, có giấy khám bệnh', luc: new Date(now - 26 * 3600000).toISOString(), tt: 'cho', boi: null }; return; }
          var t = moPhongTG(b, h, r < .1 ? 'vang' : 'co'); if (i === 5) t = { vao: m2hm(g0 + 20), ra: m2hm(g0 + 70), phut: 50, lan: 1 }; if (i === 7) t = { vao: m2hm(g0 + 24), ra: b.den, phut: 126, lan: 1 }; if (t) b.thamGia[h] = t; return;
        }
        if (r < .12) return; /* chưa vào phòng */
        var vao = g0 - 8 + Math.floor(r2 * 14) + (r2 > .85 ? 18 : 0);
        if (vao > phutNay) return;
        if (r > .93) { var ra = Math.min(phutNay, vao + 15 + Math.floor(r2 * 20)); b.thamGia[h] = { vao: m2hm(vao), ra: m2hm(ra), phut: ra - Math.max(vao, g0), lan: 1 }; return; }
        b.thamGia[h] = { vao: m2hm(vao), ra: null, tu: m2hm(vao), phut: 0, lan: r2 < .15 ? 2 : 1 };
      });
      if (kieu !== 'live') ketThucBuoi(b);
      danhSoBuoi(lop.id); ganChuDe(lop.id); ch = true;
    });
    db.buoiHoc.forEach(function (b) {
      if (b.huy) return;
      var kt = buoiMoc(b).kt.getTime();
      if (now < kt) return;
      if (!b.diemDanh && b.thamGia === undefined && !b.loiPhong && !b.ngoaiHeThong) {
        b.thamGia = {}; ghiDanhLop(b.lop).forEach(function (g) { var t = moPhongTG(b, g.hv); var x = (b.xinPhep || {})[g.hv]; if (x && x.tt === 'duyet' && hashR(b.id + g.hv) < .8) t = null; if (t) b.thamGia[g.hv] = t; }); ch = true;
      }
      if (!b.diemDanh && b.thamGia) { ketThucBuoi(b); ch = true; }
      if (b.diemDanh && !b.chot && c.tuDongChot && now > hanXacNhan(b).getTime()) { b.chot = { boi: 'he-thong', luc: hanXacNhan(b).toISOString() }; ch = true; }
    });
    return ch;
  }
  var CC_CANH_BAO = 80, CC_NGUY_CO = 70;
  function coDiemDanh(lop) { return !!lop && lop.hinhThuc === 'truc-tuyen-gv' && (lop.giangVien || []).length > 0; }
  function chuyenCanHV(lopId, hvId) {
    if (!coDiemDanh(byId('lop', lopId))) return null;
    var bs = buoiCuaLop(lopId).filter(function (b) { return !b.huy && b.diemDanh && b.diemDanh[hvId]; });
    if (!bs.length) return null;
    var co = bs.filter(function (b) { return b.diemDanh[hvId] === 'co'; }).length, phep = bs.filter(function (b) { return b.diemDanh[hvId] === 'phep'; }).length;
    return { co: co, phep: phep, vang: bs.length - co - phep, tong: bs.length, pct: Math.round(co / bs.length * 100), vangLienTiep: (function () { var c = 0; for (var i = bs.length - 1; i >= 0; i--) { if (bs[i].diemDanh[hvId] === 'vang') c++; else break; } return c; })() };
  }
  function tienDoHV(lopId, hvId) {
    var lop = byId('lop', lopId); var hp = hocPhanOfLop(lop); var t = (db.tienDo[lopId] || {})[hvId];
    var tot = hp.bai.length, done = t ? t.done : 0;
    return { done: done, tong: tot, pct: tot ? Math.round(done / tot * 100) : 0, lastAt: t && t.lastAt, quiz: t ? t.quiz : {} };
  }
  function keHoachPct(lop) { var tot = Math.max(1, daysBetween(lop.batDau, lop.ketThuc)); return Math.max(0, Math.min(100, Math.round(daysBetween(lop.batDau, TODAY) / tot * 100))); }
  function diemCot(lop, hvId, idx) {
    var c = lop.cotDiem[idx];
    if (c.nguon === 'diem-danh') { if (!coDiemDanh(lop)) return null; var cc = chuyenCanHV(lop.id, hvId); return cc ? Math.round(cc.pct / 10 * 10) / 10 : null; }
    if (c.nguon === 'ky-thi' && c.kyThi) { var ky = byId('kyThi', c.kyThi); if (!ky || !ky.congBo) return null; var bl = db.baiLam.find(function (b) { return b.ky === ky.id && b.hv === hvId; }); return bl && bl.diem != null ? bl.diem : null; }
    if (c.nguon === 'nhap') { var m = (db.diemNhap || {})[lop.id + ':' + hvId + ':' + idx]; return m == null ? null : m; }
    if (c.nguon === 'bai-tap') {
      var vals = [];
      (c.baiTap || []).forEach(function (btId) { var bt = byId('baiTap', btId); if (!bt || !bt.chuyenDiem) return; if (btDoiTuong(bt).indexOf(hvId) < 0) return; var v = diemBaiTap(bt, hvId); if (v == null && c.khongNop === 'tinh-0' && btHetHan(bt) && !nopCuaHV(bt, hvId).length) v = 0; if (v != null) vals.push(v); });
      if (!vals.length) return null;
      if (c.gop === 'cao-nhat') return Math.max.apply(null, vals);
      return Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length * 10) / 10;
    }
    return null;
  }
  /* ---- bài tập ---- */
  function btDoiTuong(bt) { if (bt.doiTuong === 'chon') return (bt.hvChon || []).slice(); return db.ghiDanh.filter(function (g) { return g.lop === bt.lop && (g.trangThai === 'dang-hoc' || g.trangThai === 'hoan-thanh'); }).map(function (g) { return g.hv; }); }
  function nopCuaHV(bt, hvId) { return db.baiNop.filter(function (n) { return n.bt === bt.id && n.hv === hvId; }).sort(function (a, b) { return a.lan - b.lan; }); }
  function btHanCuoi(bt) { var h = new Date(bt.hanNop).getTime(); return bt.nopMuon && bt.nopMuon.cho ? h + bt.nopMuon.toiDa * DAY : h; }
  function btHetHan(bt) { return Date.now() > btHanCuoi(bt) || bt.trangThai === 'da-dong'; }
  function diemBaiTap(bt, hvId) {
    var ns = nopCuaHV(bt, hvId).filter(function (n) { return n.trangThai === 'da-cham' && n.diem != null; }); if (!ns.length) return null;
    if (bt.cachLay === 'lan-cuoi') return ns[ns.length - 1].diem;
    if (bt.cachLay === 'trung-binh') return Math.round(ns.reduce(function (a, n) { return a + n.diem; }, 0) / ns.length * 10) / 10;
    return Math.max.apply(null, ns.map(function (n) { return n.diem; }));
  }
  function btStatus(bt) {
    if (bt.trangThai === 'nhap') return { key: 'nhap', label: 'Nháp', tone: '' };
    if (bt.trangThai === 'da-dong') return { key: 'dong', label: 'Đã đóng', tone: '' };
    var now = Date.now(), g = new Date(bt.giaoLuc).getTime(), h = new Date(bt.hanNop).getTime();
    if (now < g) return { key: 'hen', label: 'Hẹn giao', tone: 'info', sub: 'giao ' + fmtDT(bt.giaoLuc) };
    if (now <= h) { var d = (h - now) / DAY; return { key: 'mo', label: 'Đang mở', tone: d <= 1 ? 'warn' : 'ok', sub: d < 1 ? 'còn ' + Math.max(1, Math.round(d * 24)) + ' giờ' : 'còn ' + Math.floor(d) + ' ngày' }; }
    if (now <= btHanCuoi(bt)) return { key: 'muon', label: 'Nhận nộp muộn', tone: 'warn', sub: 'đến ' + fmtDT(new Date(btHanCuoi(bt))) };
    return { key: 'het', label: 'Hết hạn nộp', tone: 'navy' };
  }
  function btStats(bt) {
    var dt = btDoiTuong(bt), daNop = 0, choCham = 0, daCham = 0, sum = 0, muon = 0;
    dt.forEach(function (h) { var ns = nopCuaHV(bt, h); if (!ns.length) return; daNop++; if (ns.some(function (n) { return n.trangThai === 'cho-cham'; })) choCham++; var d = diemBaiTap(bt, h); if (d != null) { daCham++; sum += d; } if (ns.some(function (n) { return n.truMuon > 0; })) muon++; });
    return { tong: dt.length, daNop: daNop, chuaNop: dt.length - daNop, choCham: choCham, daCham: daCham, muon: muon, tb: daCham ? Math.round(sum / daCham * 10) / 10 : null };
  }
  function diemTongKet(lop, hvId) {
    var s = 0, w = 0, missing = false;
    lop.cotDiem.forEach(function (c, i) { var v = diemCot(lop, hvId, i); if (v == null) { missing = true; return; } s += v * c.ts; w += c.ts; });
    if (missing || !w) return null; return Math.round(s / w * 10) / 10;
  }
  function trangThaiThoiGian(lop) {
    var bd = daysBetween(TODAY, lop.batDau), kt = daysBetween(TODAY, lop.ketThuc);
    if (lop.trangThai === 'huy') return { label: 'Đã hủy', tone: '' };
    if (bd > 0) return { label: 'Khai giảng sau ' + bd + ' ngày', tone: 'navy' };
    if (kt < 0) return { label: 'Đã kết thúc', tone: '' };
    var tot = Math.max(1, daysBetween(lop.batDau, lop.ketThuc)), wk = Math.ceil((daysBetween(lop.batDau, TODAY) + 1) / 7), twk = Math.ceil(tot / 7);
    return { label: 'Tuần ' + wk + '/' + twk, tone: 'ok' };
  }
  var TT_LOP = { 'tuyen-sinh': ['Đang tuyển sinh', 'navy'], 'dang-hoc': ['Đang học', 'ok'], 'ket-thuc': ['Kết thúc', ''], 'ke-hoach': ['Lên kế hoạch', 'warn'], 'huy': ['Đã hủy', 'bad'] };
  function lopStats(lopId) {
    var lop = byId('lop', lopId); var hp = hocPhanOfLop(lop);
    var gds = db.ghiDanh.filter(function (g) { return g.lop === lopId && g.trangThai !== 'thoi-hoc' && g.trangThai !== 'cho-khai-giang'; });
    var apDung = coDiemDanh(lop);
    var bs = apDung ? buoiCuaLop(lopId).filter(function (b) { return !b.huy; }) : []; var nowT = Date.now(); var past = bs.filter(function (b) { return buoiMoc(b).kt.getTime() <= nowT; });
    var ddDone = past.filter(function (b) { return b.diemDanh; }), daChot = ddDone.filter(function (b) { return b.chot; });
    /* chỉ tính học viên còn theo học (đang học, hoàn thành, bảo lưu); học viên thôi học không kéo tỷ lệ của lớp */
    var tinh = {}; db.ghiDanh.forEach(function (g) { if (g.lop === lopId && g.trangThai !== 'thoi-hoc' && g.trangThai !== 'cho-khai-giang') tinh[g.hv] = 1; });
    var co = 0, phep = 0, vang = 0, tong = 0; ddDone.forEach(function (b) { Object.keys(b.diemDanh).forEach(function (k) { if (!tinh[k]) return; tong++; var v = b.diemDanh[k]; if (v === 'co') co++; else if (v === 'phep') phep++; else vang++; }); });
    var duoiNguong = 0; if (apDung) Object.keys(tinh).forEach(function (h) { var c = chuyenCanHV(lopId, h); if (c && c.pct < CC_CANH_BAO) duoiNguong++; });
    var tdSum = 0; gds.forEach(function (g) { tdSum += tienDoHV(lopId, g.hv).pct; });
    var coDiem = 0, dat = 0; gds.forEach(function (g) { var d = diemTongKet(lop, g.hv); if (d != null) { coDiem++; if (d >= lop.diemDat) dat++; } });
    return { lop: lop, hp: hp, soHV: soHV(lopId), dangHoc: gds.length, soBai: hp ? hp.bai.length : 0, buoiTong: bs.length, buoiDaDay: past.length, buoiDaChot: ddDone.length, buoiChotXN: daChot.length, buoiChoXN: ddDone.length - daChot.length, buoiChuaDD: past.length - ddDone.length, apDungDD: apDung, luotDD: tong, coMat: co, vangPhep: phep, vangKhongPhep: vang, hvDuoiNguong: duoiNguong, chuyenCan: apDung && tong ? Math.round(co / tong * 100) : null, tienDo: gds.length ? Math.round(tdSum / gds.length) : null, keHoach: keHoachPct(lop), coDiem: coDiem, dat: dat };
  }
  function riskOf(lopId, hvId) {
    var lop = byId('lop', lopId); if (lop.trangThai !== 'dang-hoc') return null;
    var reasons = [], score = 0;
    var cc = chuyenCanHV(lopId, hvId); var td = tienDoHV(lopId, hvId); var kh = keHoachPct(lop);
    if (cc && cc.vangLienTiep >= 2) { score += 35; reasons.push('Vắng ' + cc.vangLienTiep + ' buổi liên tiếp'); }
    if (cc && cc.pct < CC_CANH_BAO) { score += 25; reasons.push('Chuyên cần ' + cc.pct + '%'); }
    if (kh >= 15 && td.pct < kh * .5) { score += 30; reasons.push('Tiến độ ' + td.pct + '% (kế hoạch ' + kh + '%)'); }
    if (td.lastAt && daysBetween(td.lastAt, TODAY) >= 7) { score += 15; reasons.push('Không học ' + daysBetween(td.lastAt, TODAY) + ' ngày'); }
    var qs = Object.keys(td.quiz).map(function (k) { return td.quiz[k]; }); if (qs.length >= 2) { var avg = qs.reduce(function (a, b) { return a + b; }, 0) / qs.length; if (avg < 5) { score += 20; reasons.push('Điểm quiz TB ' + avg.toFixed(1)); } }
    return { score: Math.min(100, score), reasons: reasons, muc: score >= 50 ? 'cao' : score >= 25 ? 'tb' : 'thap' };
  }
  function kyThiStatus(ky) {
    var now = Date.now(), mo = new Date(ky.moLuc).getTime(), dong = new Date(ky.dongLuc).getTime();
    if (!ky.de || !ky.lop) return { key: 'nhap', label: 'Chưa thiết lập', tone: 'warn' };
    if (now < mo) return { key: 'sap', label: 'Sắp diễn ra', tone: 'navy' };
    if (now <= dong && !ky.ketThuc) return { key: 'dang', label: 'Đang thi', tone: 'info' };
    var bls = db.baiLam.filter(function (b) { return b.ky === ky.id; });
    if (bls.some(function (b) { return b.trangThai === 'cho-cham'; })) return { key: 'cham', label: 'Đang chấm', tone: 'warn' };
    if (!ky.congBo) return { key: 'cho-cb', label: 'Chờ công bố', tone: 'warn' };
    return { key: 'xong', label: 'Đã công bố điểm', tone: 'ok' };
  }
  /* phương án trả lời hiển thị cho học viên: đáp án đúng đặt đúng vị trí dapAn, 3 phương án nhiễu */
  var PA = {
    'Kinh Thủ thái âm Phế bắt đầu từ đâu?': ['Trung tiêu (vùng vị quản)', 'Đầu ngón tay cái', 'Hố nách', 'Huyệt Vân môn'],
    'Huyệt Hợp cốc thuộc đường kinh nào?': ['Thủ dương minh Đại trường', 'Thủ thái âm Phế', 'Túc dương minh Vị', 'Thủ thiếu dương Tam tiêu'],
    'Phản ứng "đắc khí" khi châm kim được mô tả là:': ['Cảm giác tê, tức, nặng lan dọc đường kinh quanh chỗ châm', 'Chảy máu tại vị trí châm', 'Đau nhói, nóng rát trên mặt da', 'Co giật cơ toàn thân'],
    'Huyệt Túc tam lý nằm ở vị trí nào?': ['Dưới hõm ngoài bánh chè 3 thốn, cách mào chày 1 khoát ngón tay', 'Trên lằn chỉ cổ tay 2 thốn, giữa hai gân', 'Trên đỉnh mắt cá trong 3 thốn, sát bờ sau xương chày', 'Giữa nếp lằn khoeo chân'],
    'Chống chỉ định châm cứu tuyệt đối gồm:': ['Các cấp cứu ngoại khoa cần can thiệp ngay', 'Đau thắt lưng mạn tính', 'Mất ngủ kéo dài', 'Liệt dây VII ngoại biên'],
    'Mạch Nhâm đi ở vị trí nào trên cơ thể?': ['Đường giữa mặt trước thân mình', 'Đường giữa lưng', 'Mặt ngoài chi dưới', 'Hai bên cột sống, cách 1,5 thốn'],
    'Huyệt Bách hội nằm trên đường kinh nào?': ['Mạch Đốc', 'Mạch Nhâm', 'Túc thái dương Bàng quang', 'Túc thiếu dương Đởm'],
    'Theo YHHĐ, cơ chế giảm đau của châm cứu liên quan đến:': ['Giải phóng endorphin và cơ chế kiểm soát cổng', 'Tăng tiết dịch vị', 'Giãn mạch toàn thân', 'Ức chế miễn dịch'],
    'Số huyệt trên kinh Túc thái dương Bàng quang là:': ['67 huyệt', '45 huyệt', '27 huyệt', '11 huyệt'],
    'Cứu ngải có tác dụng chủ yếu nào?': ['Ôn thông kinh lạc, trừ hàn thấp', 'Thanh nhiệt giải độc', 'Tả hỏa, an thần', 'Lương huyết, chỉ huyết'],
    'Thời gian lưu kim thông thường là:': ['15–30 phút', '1–2 phút', '60–90 phút', 'Rút kim ngay, không lưu'],
    'Huyệt Nội quan thuộc kinh nào?': ['Thủ quyết âm Tâm bào', 'Thủ thiếu âm Tâm', 'Thủ thiếu dương Tam tiêu', 'Thủ thái âm Phế'],
    'Huyệt Tam âm giao là nơi giao hội của các kinh nào?': ['Tỳ, Can, Thận', 'Phế, Tâm, Tâm bào', 'Vị, Đởm, Bàng quang', 'Đại trường, Tiểu trường, Tam tiêu'],
    'Mạch Đốc có chức năng chủ yếu:': ['Tổng đốc các kinh dương', 'Tổng nhậm các kinh âm', 'Điều hòa kinh nguyệt', 'Chủ vận động chi dưới'],
    'Giải phẫu học chủ yếu nghiên cứu nội dung nào sau đây?': ['Hình thái, cấu trúc các cơ quan của cơ thể người', 'Chức năng sinh lý của tế bào', 'Tác dụng dược lý của thuốc', 'Cơ chế bệnh sinh của bệnh truyền nhiễm'],
    'Tư thế giải phẫu chuẩn của cơ thể người được mô tả như thế nào?': ['Đứng thẳng, mắt nhìn trước, hai tay xuôi, lòng bàn tay hướng ra trước', 'Nằm ngửa, hai tay đặt trên ngực', 'Đứng thẳng, lòng bàn tay áp vào đùi', 'Ngồi thẳng, hai chân khép'],
    'Xương nào sau đây thuộc xương trục?': ['Xương ức', 'Xương cánh tay', 'Xương đùi', 'Xương bả vai'],
    'Loại khớp có khả năng vận động rộng nhất là:': ['Khớp hoạt dịch', 'Khớp sợi', 'Khớp sụn', 'Khớp bất động'],
    'Thành phần nào làm giảm ma sát giữa các diện khớp?': ['Sụn khớp', 'Gân cơ', 'Màng xương', 'Mô mỡ dưới da'],
    'Dịch hoạt dịch nằm chủ yếu trong:': ['Ổ khớp', 'Tủy xương', 'Ống tủy sống', 'Bao gân cơ'],
    'Dây chằng quanh khớp có vai trò quan trọng nhất là:': ['Giữ vững, ổn định khớp', 'Tạo máu', 'Tiết dịch hoạt dịch', 'Chi phối cảm giác của da'],
    'Cơ nào sau đây là cơ vân?': ['Cơ nhị đầu cánh tay', 'Cơ trơn thành ruột', 'Cơ tim', 'Cơ trơn thành mạch'],
    'Tủy gai kết thúc ở ngang mức đốt sống nào ở người trưởng thành?': ['Bờ dưới đốt thắt lưng I – bờ trên đốt thắt lưng II', 'Đốt ngực XII', 'Đốt thắt lưng V', 'Đốt cùng II'],
    'Dây thần kinh sọ số VII chi phối:': ['Các cơ bám da mặt', 'Cơ nhai', 'Cơ vận nhãn ngoài', 'Cơ ức đòn chũm'],
    'Tuyến nội tiết nào nằm ở hố yên xương bướm?': ['Tuyến yên', 'Tuyến tùng', 'Tuyến giáp', 'Tuyến thượng thận'],
    'Cấu trúc nào của mắt có chức năng điều tiết?': ['Thể mi và thể thủy tinh', 'Giác mạc', 'Kết mạc', 'Tuyến lệ'],
    'Kiến thức Giải phẫu 1 là nền tảng cho các môn học nào sau đây?': ['Sinh lý học, bệnh học và các môn lâm sàng', 'Ngoại ngữ chuyên ngành', 'Tin học ứng dụng', 'Giáo dục thể chất'],
    'Xương đùi khớp với xương chậu tại:': ['Ổ cối', 'Lồi cầu xương chày', 'Xương cùng', 'Củ ngồi'],
    'Cơ hoành được chi phối bởi dây thần kinh nào?': ['Thần kinh hoành', 'Thần kinh lang thang', 'Thần kinh liên sườn', 'Thần kinh phụ']
  };
  function phuongAnCH(q) {
    var chu = ['A', 'B', 'C', 'D'], idx = Math.max(0, chu.indexOf(q.dapAn)), goc = PA[q.noiDung];
    if (!goc) { var m = String(q.noiDung).match(/"([^"]+)"/), chuDe = m ? m[1] : 'nội dung bài học'; goc = /sai/.test(q.noiDung) ? ['Nội dung "' + chuDe + '" không cần đối chiếu với thực hành lâm sàng', 'Nội dung "' + chuDe + '" có mục tiêu và yêu cầu cần đạt', '"' + chuDe + '" nằm trong đề cương học phần', 'Học viên cần ôn tập "' + chuDe + '" trước kiểm tra'] : ['Trình bày đúng khái niệm, đặc điểm chính của "' + chuDe + '"', 'Chỉ áp dụng cho y học hiện đại, không liên quan y học cổ truyền', 'Không thuộc nội dung học phần', 'Chỉ có ý nghĩa lịch sử, không dùng trên lâm sàng']; }
    var nhieu = goc.slice(1), out = [];
    for (var i = 0, j = 0; i < 4; i++) out.push(i === idx ? goc[0] : nhieu[j++]);
    return out;
  }
  function walkKhoi(list, fn) { (list || []).forEach(function (k) { fn(k); if (k.con) walkKhoi(k.con, fn); if (k.cot) k.cot.forEach(function (c) { walkKhoi(c, fn); }); if (k.o) k.o.forEach(function (c) { walkKhoi(c, fn); }); }); }
  function baiFiles(b) { var out = []; if (b.video) out.push(b.video); if (b.taiLieu) out.push(b.taiLieu); (b.dinhKem || []).forEach(function (f) { out.push(f); }); walkKhoi(b.khoi, function (k) { if (k.file) out.push(k.file); }); return out.filter(function (x, i, a) { return x && a.indexOf(x) === i; }); }
  function syncBai(b) {
    /* trường tóm tắt suy ra từ khối nội dung — các màn khác đọc các trường này */
    var vid = null, pdf = null, nq = 0; walkKhoi(b.khoi, function (k) { if (k.loai === 'video' && k.file && !vid) vid = k.file; if (k.loai === 'pdf' && k.file && !pdf) pdf = k.file; if (k.loai === 'quiz') nq += (k.cauHoi || []).length; });
    b.video = vid; b.taiLieu = pdf || ((b.dinhKem || []).find(function (f) { var x = byId('thuVien', f); return x && x.loai === 'PDF'; }) || null); b.quiz = nq; b.phut = Math.max(1, Math.round((+b.giay || 0) / 60)); return b;
  }
  /* ---------- giám sát thi ---------- */
  var SK = { 'roi-tab': ['Rời khỏi tab/cửa sổ thi', 2], 'toan-man-hinh': ['Thoát chế độ toàn màn hình', 2], 'sao-chep': ['Sao chép / dán nội dung', 3], 'chuot-phai': ['Nhấp chuột phải', 1], 'hai-thiet-bi': ['Đăng nhập từ thiết bị thứ hai', 5], 'doi-ip': ['Đổi địa chỉ mạng (IP)', 3], 'mat-ket-noi': ['Mất kết nối', 1], 'khong-thao-tac': ['Không thao tác trên 10 phút', 1], 'nop-nhanh': ['Nộp bài quá nhanh', 2] };
  function phienKy(kyId) {
    var a = (db.phienThi || []).filter(function (p) { return p.ky === kyId; }); if (a.length) return a;
    /* ca thi cũ chưa có dữ liệu giám sát: dựng từ bài làm và danh sách lớp */
    var ky = byId('kyThi', kyId); if (!ky || Date.now() < new Date(ky.dongLuc).getTime()) return a;
    var de = byId('deThi', ky.de), tong = de ? de.cauHoi.length : 0, bls = db.baiLam.filter(function (b) { return b.ky === kyId; });
    var ids = db.ghiDanh.filter(function (g) { return g.lop === ky.lop && g.trangThai !== 'cho-khai-giang'; }).map(function (g) { return g.hv; });
    bls.forEach(function (b) { if (ids.indexOf(b.hv) < 0) ids.push(b.hv); });
    return ids.map(function (hv, i) { var b = bls.find(function (x) { return x.hv === hv; }); return { id: 'v' + kyId + '-' + i, ky: kyId, hv: hv, sbd: ky.ma + '-' + String(i + 1).padStart(3, '0'), lan: 1, trangThai: b ? 'da-nop' : 'vang', batDau: b ? new Date(new Date(b.nop).getTime() - 38 * 60000).toISOString() : null, nopLuc: b ? b.nop : null, cau: b ? tong : 0, tong: tong, cong: 0, dungMs: 0, suKien: [], lichSu: [], ip: '', tb: '', lanVao: b ? 1 : 0, ao: true }; });
  }
  function thoiLuongKy(ky) { var d = byId('deThi', ky.de); return d ? d.thoiLuong : 45; }
  function conLai(p, ky, now) {
    now = now || Date.now();
    if (p.trangThai === 'chua-vao') return thoiLuongKy(ky) * 60000;
    if (p.trangThai === 'da-nop' || p.trangThai === 'dinh-chi') return 0;
    var het = new Date(p.batDau).getTime() + (thoiLuongKy(ky) + (p.cong || 0)) * 60000 + (p.dungMs || 0);
    var dungToi = ky.tamDung ? new Date(ky.tamDung.luc).getTime() : (p.trangThai === 'mat-ket-noi' || p.trangThai === 'khoa') && p.dungLuc ? new Date(p.dungLuc).getTime() : now;
    var r = het - Math.min(now, dungToi);
    return Math.max(0, Math.min(r, new Date(ky.dongLuc).getTime() - Math.min(now, dungToi) + (p.cong || 0) * 60000));
  }
  function diemRuiRo(p) { return (p.suKien || []).reduce(function (a, e) { return a + (SK[e.loai] ? SK[e.loai][1] : 1); }, 0); }
  function suKien(p, loai, ct, t) { p.suKien = p.suKien || []; p.suKien.push({ id: 'sk' + Date.now().toString(36) + Math.floor(Math.random() * 1e4), t: (t || new Date()).toISOString(), loai: loai, ct: ct || '', xl: null }); }
  function taoPhien(ky, now) {
    /* dựng trạng thái ca thi mô phỏng theo thời điểm hiện tại */
    db.phienThi = (db.phienThi || []).filter(function (p) { return p.ky !== ky.id; });
    db.baiLam = db.baiLam.filter(function (b) { return b.ky !== ky.id; });
    var de = byId('deThi', ky.de), tong = de.cauHoi.length, dur = de.thoiLuong;
    var gs = db.ghiDanh.filter(function (g) { return g.lop === ky.lop && g.trangThai === 'dang-hoc'; });
    var IP = ['10.20.4.', '10.20.5.', '113.160.22.', '14.232.9.', '42.114.18.'];
    var TB = ['Chrome 128 · Windows 11', 'Edge 127 · Windows 10', 'Chrome 128 · macOS', 'Safari 17 · macOS', 'Chrome 127 · Android'];
    gs.forEach(function (g, i) {
      var p = { id: 'pt' + ky.id + '-' + (i + 1), ky: ky.id, hv: g.hv, sbd: ky.ma + '-' + String(i + 1).padStart(3, '0'), lan: 1, trangThai: 'dang-lam', batDau: null, cong: 0, dungMs: 0, dungLuc: null, nopLuc: null, cau: 0, tong: tong, suKien: [], ip: IP[i % 5] + (20 + i * 3), tb: TB[(i * 3) % 5], lanVao: 1, lichSu: [] };
      if (ky.moPhong === 'sap') { p.trangThai = 'chua-vao'; p.ip = ''; p.tb = ''; p.lanVao = 0; db.phienThi.push(p); return; }
      var m = i % 13, bd = now - (6 + (i * 7) % 28) * 60000;
      if (m === 12 || i === 5) { p.trangThai = 'chua-vao'; p.ip = ''; p.tb = ''; p.lanVao = 0; db.phienThi.push(p); return; }
      p.batDau = new Date(bd).toISOString();
      var el = (now - bd) / 60000; p.cau = Math.min(tong, Math.max(0, Math.round(tong * el / dur * (0.8 + (i % 5) * 0.12))));
      if (m === 3 || m === 9) { p.batDau = new Date(now - 34 * 60000).toISOString(); p.trangThai = 'da-nop'; p.cau = tong; p.nopLuc = new Date(now - (4 + i % 6) * 60000).toISOString(); }
      if (m === 7) { p.batDau = new Date(now - 31 * 60000).toISOString(); p.trangThai = 'da-nop'; p.cau = tong; p.nopLuc = new Date(now - 25 * 60000).toISOString(); suKien(p, 'nop-nhanh', 'Nộp sau 6 phút / 45 phút', new Date(p.nopLuc)); }
      if (m === 4) { p.trangThai = 'mat-ket-noi'; p.dungLuc = new Date(now - 3 * 60000).toISOString(); suKien(p, 'mat-ket-noi', 'Không nhận tín hiệu từ trình duyệt', new Date(p.dungLuc)); }
      if (m === 1 && i > 1) { suKien(p, 'roi-tab', 'Rời tab 7 giây', new Date(now - 5 * 60000)); }
      if (m === 1 && i === 1) { [18, 14, 11, 7, 3].forEach(function (x, k) { suKien(p, 'roi-tab', 'Rời tab ' + (8 + k * 5) + ' giây', new Date(now - x * 60000)); }); suKien(p, 'toan-man-hinh', '', new Date(now - 9 * 60000)); p.trangThai = 'khoa'; p.dungLuc = new Date(now - 3 * 60000).toISOString(); p.lichSu.push({ t: p.dungLuc, nguoi: 'Hệ thống', hd: 'Tạm khóa bài làm', ct: 'Vượt ngưỡng 5 lần vi phạm' }); }
      if (m === 6) { suKien(p, 'hai-thiet-bi', 'Thiết bị mới: Chrome 128 · Android, IP 42.114.18.77', new Date(now - 6 * 60000)); suKien(p, 'doi-ip', '10.20.4.38 → 42.114.18.77', new Date(now - 6 * 60000)); }
      if (m === 8) { suKien(p, 'sao-chep', 'Dán 214 ký tự vào câu ' + Math.max(1, p.cau), new Date(now - 4 * 60000)); suKien(p, 'chuot-phai', '', new Date(now - 4 * 60000)); }
      if (m === 10) { suKien(p, 'roi-tab', 'Rời tab 12 giây', new Date(now - 8 * 60000)); suKien(p, 'roi-tab', 'Rời tab 5 giây', new Date(now - 2 * 60000)); }
      if (m === 11) { p.cau = Math.max(1, Math.round(p.cau / 3)); suKien(p, 'khong-thao-tac', 'Không thao tác 11 phút', new Date(now - 1 * 60000)); }
      if (p.trangThai === 'da-nop') { var d = Math.round((4 + ((i * 17) % 60) / 10) * 10) / 10; db.baiLam.push({ id: 'bl' + ky.id + '-' + i, ky: ky.id, hv: g.hv, nop: p.nopLuc, traLoi: {}, diemTN: d, diem: d, trangThai: 'da-cham', lichSu: [] }); }
      db.phienThi.push(p);
    });
  }
  function dongBoCaMoPhong() {
    /* giữ ca thi mô phỏng luôn diễn ra quanh thời điểm mở bản demo */
    var now = Date.now(), changed = false;
    (db.kyThi || []).forEach(function (ky) {
      if (ky.moPhong === 'live') { var mo = new Date(ky.moLuc).getTime(), dong = new Date(ky.dongLuc).getTime(); if (now < mo || now > dong - 50 * 60000) { ky.moLuc = new Date(now - 40 * 60000).toISOString(); ky.dongLuc = new Date(now + 140 * 60000).toISOString(); ky.kichHoat = { luc: ky.moLuc, nguoi: 'giamthi01' }; ky.tamDung = null; ky.ketThuc = null; taoPhien(ky, now); changed = true; } }
      if (ky.moPhong === 'sap') { var m2 = new Date(ky.moLuc).getTime(), d2 = new Date(ky.dongLuc).getTime(); if ((!ky.kichHoat && (now > m2 - 5 * 60000 || m2 - now > 6 * 3600000)) || now > d2) { ky.moLuc = new Date(now + 25 * 60000).toISOString(); ky.dongLuc = new Date(now + 145 * 60000).toISOString(); ky.kichHoat = null; ky.ketThuc = null; taoPhien(ky, now); changed = true; } }
    });
    return changed;
  }
  function ksDongBo(k, dd) {
    var D0 = dd || db;
    /* đồng bộ các số tổng hợp mà màn Khảo sát chung đang đọc */
    if (!Array.isArray(k.phieu)) return k;
    k.phanHoi = k.phieu.length; k.guiDi = k.lop ? D0.ghiDanh.filter(function (g) { return g.lop === k.lop && g.trangThai !== 'thoi-hoc'; }).length : k.guiDi;
    var s = 0, n = 0; k.phieu.forEach(function (p) { k.cauHoi.forEach(function (q) { if (q.loai === 'thang' && p.tl[q.id] != null) { s += p.tl[q.id]; n++; } }); });
    k.diemTB = n ? Math.round(s / n * 100) / 100 : null; return k;
  }
  function ksTrangThai(k) {
    var t = iso(TODAY);
    if (k.trangThai === 'nhap') return { key: 'nhap', label: 'Nháp', tone: 'warn' };
    if (k.trangThai === 'da-dong' || (k.ketThuc && k.ketThuc < t)) return { key: 'dong', label: 'Đã đóng', tone: '' };
    if (k.batDau && k.batDau > t) return { key: 'hen', label: 'Hẹn mở ' + fmtDate(k.batDau), tone: 'navy' };
    return { key: 'mo', label: 'Đang mở', tone: 'ok' };
  }
  function hdDaTraLoi(t) { return (t.traLoi || []).some(function (r) { return !r.xoa && (r.vaiTro === 'gv' || r.vaiTro === 'qt'); }); }
  function hdChoTL(t) { return !t.an && !t.xoa && t.loai !== 'binh-luan' && !t.giaiQuyet && !hdDaTraLoi(t); }
  function tieuChiBai(hp, b) { return b && b.tieuChiRieng ? b.tieuChiRieng : hp.tieuChi; }
  function fileUsage(fileId) {
    var out = [];
    db.hocPhan.forEach(function (hp) { hp.bai.forEach(function (b) { if (baiFiles(b).indexOf(fileId) >= 0) out.push({ hp: hp, bai: b }); }); });
    return out;
  }
  function refsOf(type, id) {
    /* nơi đang tham chiếu tới 1 bản ghi — dùng để chặn xóa */
    var r = [];
    if (type === 'hocPhan') { db.chuongTrinh.forEach(function (c) { if (c.hocPhan.indexOf(id) >= 0) r.push('Chương trình ' + c.ten); }); db.lop.forEach(function (l) { if (l.hocPhan === id) r.push('Lớp ' + l.ma); }); db.nganHang.forEach(function (n) { if (n.hocPhan === id) r.push(n.ten); }); }
    if (type === 'chuongTrinh') { db.chuongTrinh.forEach(function (c) { if (c.cha === id) r.push('Chương trình con ' + c.ten); }); db.lop.forEach(function (l) { if (l.chuongTrinh === id) r.push('Lớp ' + l.ma); }); }
    if (type === 'lop') { var n = db.ghiDanh.filter(function (g) { return g.lop === id; }).length; if (n) r.push(n + ' lượt ghi danh'); var b = db.buoiHoc.filter(function (x) { return x.lop === id && x.diemDanh; }).length; if (b) r.push(b + ' buổi đã điểm danh'); var k = db.kyThi.filter(function (x) { return x.lop === id; }).length; if (k) r.push(k + ' kỳ thi'); var bts = (db.baiTap || []).filter(function (x) { return x.lop === id; }).length; if (bts) r.push(bts + ' bài tập'); }
    if (type === 'nganHang') { db.deThi.forEach(function (d) { if (d.nh === id) r.push('Đề ' + d.ma); }); }
    if (type === 'cauHoi') { db.deThi.forEach(function (d) { if (d.cauHoi.indexOf(id) >= 0) r.push('Đề ' + d.ma); }); (db.baiTap || []).forEach(function (b) { if (b.cauHoi.indexOf(id) >= 0) r.push('Bài tập ' + b.ma); }); }
    if (type === 'deThi') { db.kyThi.forEach(function (k) { if (k.de === id) r.push('Kỳ thi ' + k.ma); }); }
    if (type === 'donVi') { db.donVi.forEach(function (d) { if (d.cha === id) r.push('Đơn vị con ' + d.ten); }); db.lop.forEach(function (l) { if (l.khoa === id) r.push('Lớp ' + l.ma); }); db.giangVien.forEach(function (g) { if (g.donVi === id) r.push('GV ' + g.hoTen); }); db.taiKhoan.forEach(function (t) { if (t.donVi === id) r.push('TK ' + t.ten); }); }
    if (type === 'khoanThu') { db.lop.forEach(function (l) { if (l.khoanThu === id) r.push('Lớp ' + l.ma); }); }
    if (type === 'file') { fileUsage(id).forEach(function (u) { r.push(u.hp.ten + ' · ' + u.bai.ten); }); }
    if (type === 'nhomQuyen') { db.taiKhoan.forEach(function (t) { if (t.nhom.indexOf(id) >= 0) r.push(t.ten); }); }
    return r;
  }
  function log(hanhDong, doiTuong, tomTat, truoc, sau) {
    db.nhatKy.unshift({ id: nextId('nk'), t: new Date().toISOString(), user: db.meta.user.ten, hanhDong: hanhDong, doiTuong: doiTuong, tomTat: tomTat, truoc: truoc || null, sau: sau || null });
    if (db.nhatKy.length > 500) db.nhatKy.length = 500;
  }
  function commit(hanhDong, doiTuong, tomTat, truoc, sau) { if (hanhDong) log(hanhDong, doiTuong, tomTat, truoc, sau); save(); notify(); }

  /* ---------------- đồng bộ giữa các màn hình ---------------- */
  var listeners = [];
  function notify() { try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'lms-data-changed' }, '*'); } catch (e) { } }
  window.addEventListener('storage', function (e) { if (e.key === KEY) { var n = load(); if (n) { db = n; LMS.db = n; listeners.forEach(function (f) { f(); }); } } });
  function onChange(fn) { listeners.push(fn); }

  /* điều hướng giữa màn hình (trong khung index hoặc mở trực tiếp) */
  function go(page, param) {
    try { localStorage.setItem('egoLmsDemo.nav', JSON.stringify({ page: page, param: param || null, t: Date.now() })); } catch (e) { }
    if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'lms-nav', page: page, param: param || null }, '*');
    else location.href = page;
  }
  function param(page) {
    try { var s = JSON.parse(localStorage.getItem('egoLmsDemo.nav') || 'null'); if (s && (!page || s.page === page) && Date.now() - s.t < 15000) { localStorage.removeItem('egoLmsDemo.nav'); return s.param; } } catch (e) { }
    return null;
  }

  /* ---------------- UI ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function hl(text, q) { text = esc(text); if (!q) return text; var nt = norm(text), nq = norm(q), i = nt.indexOf(nq); if (i < 0) return text; return text.slice(0, i) + '<mark>' + text.slice(i, i + q.length) + '</mark>' + text.slice(i + q.length); }
  function money(n) { return n == null ? '—' : Math.round(n).toLocaleString('vi-VN') + ' ₫'; }
  function badge(t, tone) { return '<span class="badge ' + (tone || '') + '">' + esc(t) + '</span>'; }
  function prog(pct, tone, label) { if (pct == null) return '<span class="muted">—</span>'; var t = tone || (pct >= 70 ? '' : pct >= 40 ? 'warn' : 'bad'); return '<div class="prog"><div class="bar ' + t + '"><span style="width:' + Math.max(0, Math.min(100, pct)) + '%"></span></div><b>' + (label || pct + '%') + '</b></div>'; }
  function initials(n) { var p = String(n || '?').trim().split(/\s+/); return (p.length > 1 ? p[p.length - 2].charAt(0) : '') + p[p.length - 1].charAt(0); }
  function person(n, sub) { return '<div class="person"><span class="avatar">' + esc(initials(n)) + '</span><div style="min-width:0"><div class="t-main">' + esc(n) + '</div>' + (sub ? '<div class="t-sub">' + sub + '</div>' : '') + '</div></div>'; }
  function opts(list, val, lab, sel, ph) { var h = ph != null ? '<option value="">' + esc(ph) + '</option>' : ''; list.forEach(function (o) { var v = typeof o === 'object' ? o[val] : o, l = typeof o === 'object' ? (typeof lab === 'function' ? lab(o) : o[lab]) : o; h += '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + esc(l) + '</option>'; }); return h; }

  var toastHost;
  function toast(msg, tone) { if (!toastHost) { toastHost = document.createElement('div'); toastHost.className = 'toast-host'; document.body.appendChild(toastHost); } var t = document.createElement('div'); t.className = 'toast ' + (tone || ''); t.textContent = msg; toastHost.appendChild(t); setTimeout(function () { t.remove(); }, 3200); }

  function modal(o) {
    var ov = document.createElement('div'); ov.className = 'overlay';
    ov.innerHTML = '<div class="modal ' + (o.size || '') + '" role="dialog" aria-modal="true"><div class="modal-head"><h2>' + esc(o.title) + '</h2>' + (o.headExtra || '') + '<button class="icon-btn right" data-x aria-label="Đóng">✕</button></div><div class="modal-body"></div><div class="modal-foot"></div></div>';
    var body = ov.querySelector('.modal-body'); if (typeof o.body === 'string') body.innerHTML = o.body; else if (o.body) body.appendChild(o.body);
    var foot = ov.querySelector('.modal-foot');
    var api = { el: ov, body: body, close: function () { ov.remove(); document.removeEventListener('keydown', onKey); if (o.onClose) o.onClose(); } };
    (o.foot || [{ label: 'Đóng', close: true }]).forEach(function (b) { var bt = document.createElement('button'); bt.className = 'btn ' + (b.cls || ''); bt.textContent = b.label; if (b.id) bt.id = b.id; bt.onclick = function () { if (b.onClick) { var r = b.onClick(api); if (r === false) return; } if (b.close !== false) api.close(); }; foot.appendChild(bt); });
    if (!foot.children.length) foot.remove();
    ov.querySelector('[data-x]').onclick = api.close;
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) api.close(); });
    function onKey(e) { if (e.key === 'Escape') api.close(); }
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    if (o.onOpen) o.onOpen(api);
    var f = body.querySelector('input,select,textarea'); if (f && !o.noFocus) setTimeout(function () { f.focus(); }, 30);
    return api;
  }
  function confirmBox(o) {
    return new Promise(function (res) {
      var done = false;
      modal({ title: o.title || 'Xác nhận', size: 'sm', body: '<div>' + (o.html || esc(o.message || '')) + '</div>', onClose: function () { if (!done) res(false); }, foot: [{ label: 'Hủy', close: true }, { label: o.ok || 'Đồng ý', cls: o.danger ? 'danger solid' : 'primary', onClick: function () { done = true; res(true); } }] });
    });
  }
  function blocked(title, refs, hint) {
    modal({ title: title, size: 'sm', body: '<div class="note bad">Không thể thực hiện vì dữ liệu đang được sử dụng:</div><ul style="margin:0;padding-left:18px">' + refs.slice(0, 10).map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + (refs.length > 10 ? '<li>… và ' + (refs.length - 10) + ' mục khác</li>' : '') + '</ul>' + (hint ? '<div class="muted small">' + esc(hint) + '</div>' : '') });
  }
  var openMenu;
  function menu(anchor, items) {
    if (openMenu) openMenu.remove();
    var m = document.createElement('div'); m.className = 'menu';
    items.forEach(function (it) { if (it === '-') { m.appendChild(document.createElement('hr')); return; } if (!it) return; var b = document.createElement('button'); b.textContent = it.label; if (it.danger) b.className = 'danger'; if (it.disabled) { b.disabled = true; b.style.opacity = .45; b.title = it.title || ''; } b.onclick = function () { m.remove(); openMenu = null; it.onClick(); }; m.appendChild(b); });
    document.body.appendChild(m);
    var r = anchor.getBoundingClientRect(); var left = Math.min(window.innerWidth - m.offsetWidth - 8, r.right - m.offsetWidth + window.scrollX); var top = r.bottom + 4 + window.scrollY;
    if (r.bottom + m.offsetHeight > window.innerHeight) top = r.top - m.offsetHeight - 4 + window.scrollY;
    m.style.left = Math.max(8, left) + 'px'; m.style.top = top + 'px';
    openMenu = m;
    setTimeout(function () { document.addEventListener('mousedown', function h(e) { if (!m.contains(e.target)) { m.remove(); if (openMenu === m) openMenu = null; document.removeEventListener('mousedown', h); } }); }, 0);
  }

  /* bảng có sắp xếp, phân trang, chọn nhiều */
  function table(host, o) {
    var st = { page: 1, sort: o.sort || null, dir: o.dir || 1, sel: {} };
    var ps = o.pageSize || 15;
    function render() {
      var rows = (typeof o.rows === 'function' ? o.rows() : o.rows).slice();
      if (st.sort) { var col = o.columns.find(function (c) { return c.key === st.sort; }); var f = col && (col.sortVal || function (r) { return r[col.key]; }); rows.sort(function (a, b) { var x = f(a), y = f(b); if (x == null) return 1; if (y == null) return -1; return (x > y ? 1 : x < y ? -1 : 0) * st.dir; }); }
      var total = rows.length, pages = Math.max(1, Math.ceil(total / ps)); if (st.page > pages) st.page = pages;
      var view = rows.slice((st.page - 1) * ps, st.page * ps);
      var h = '<div class="tbl-wrap"><table class="tbl"><thead><tr>';
      if (o.select) h += '<th style="width:32px"><input type="checkbox" data-all aria-label="Chọn tất cả"></th>';
      o.columns.forEach(function (c) { h += '<th class="' + (c.cls || '') + (c.sortable === false ? '' : ' sortable') + '" data-k="' + c.key + '"' + (c.w ? ' style="width:' + c.w + '"' : '') + '>' + esc(c.label) + (st.sort === c.key ? (st.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>'; });
      h += '</tr></thead><tbody>';
      if (!view.length) h += '<tr><td colspan="' + (o.columns.length + (o.select ? 1 : 0)) + '"><div class="empty">' + (o.empty || 'Không có dữ liệu phù hợp') + '</div></td></tr>';
      view.forEach(function (r, i) {
        h += '<tr data-i="' + i + '"' + (o.onRowClick ? ' class="clickable"' : '') + '>';
        if (o.select) h += '<td><input type="checkbox" data-sel="' + esc(r.id) + '"' + (st.sel[r.id] ? ' checked' : '') + ' aria-label="Chọn"></td>';
        o.columns.forEach(function (c) { var v = c.render ? c.render(r) : esc(r[c.key]); h += '<td class="' + (c.cls || '') + '">' + (v == null ? '' : v) + '</td>'; });
        h += '</tr>';
      });
      h += '</tbody></table></div>';
      if (total > ps) h += '<div class="pager"><span>' + ((st.page - 1) * ps + 1) + '–' + Math.min(total, st.page * ps) + ' / ' + total + '</span><button class="btn sm" data-p="-1"' + (st.page === 1 ? ' disabled' : '') + '>‹</button><span>Trang ' + st.page + '/' + pages + '</span><button class="btn sm" data-p="1"' + (st.page === pages ? ' disabled' : '') + '>›</button></div>';
      else if (o.countLabel !== false) h += '<div class="pager"><span>' + total + ' dòng</span></div>';
      host.innerHTML = h;
      host.querySelectorAll('th.sortable').forEach(function (th) { th.onclick = function () { var k = th.dataset.k; if (st.sort === k) st.dir = -st.dir; else { st.sort = k; st.dir = 1; } render(); }; });
      host.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { st.page += +b.dataset.p; render(); }; });
      if (o.onRowClick) host.querySelectorAll('tbody tr[data-i]').forEach(function (tr) { tr.addEventListener('click', function (e) { if (e.target.closest('button,a,input,select,label')) return; o.onRowClick(view[+tr.dataset.i], e); }); });
      if (o.select) {
        host.querySelectorAll('[data-sel]').forEach(function (cb) { cb.onchange = function () { if (cb.checked) st.sel[cb.dataset.sel] = true; else delete st.sel[cb.dataset.sel]; if (o.onSelect) o.onSelect(Object.keys(st.sel)); }; });
        var all = host.querySelector('[data-all]'); if (all) all.onchange = function () { view.forEach(function (r) { if (all.checked) st.sel[r.id] = true; else delete st.sel[r.id]; }); render(); if (o.onSelect) o.onSelect(Object.keys(st.sel)); };
      }
      if (o.after) o.after(host, view);
    }
    render();
    return { render: function (resetPage) { if (resetPage) st.page = 1; render(); }, selected: function () { return Object.keys(st.sel); }, clearSel: function () { st.sel = {}; render(); if (o.onSelect) o.onSelect([]); } };
  }

  /* biểu đồ SVG gọn, vẽ theo cùng một thang */
  function niceMax(v) { if (v <= 0) return 1; var p = Math.pow(10, Math.floor(Math.log10(v))); var n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
  function barChart(el, o) {
    var W = o.width || 520, H = o.height || 220, L = 36, B = 28, T = 12, Rr = 8, n = o.values.length;
    var max = o.max || niceMax(Math.max.apply(null, o.values.concat([1])));
    var bw = (W - L - Rr) / n, ih = H - T - B, s = '';
    for (var g = 0; g <= 4; g++) { var y = T + ih - ih * g / 4; s += '<line class="grid-line" x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + Math.round(max * g / 4) + (o.unit || '') + '</text>'; }
    o.values.forEach(function (v, i) {
      var h = ih * v / max, x = L + i * bw + bw * .18, w = bw * .64, y = T + ih - h;
      var col = o.colors ? o.colors[i] : (o.color || 'var(--ems-chart-1)');
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + Math.max(0, h) + '" rx="3" fill="' + col + '"><title>' + esc(o.labels[i]) + ': ' + v + (o.unit || '') + '</title></rect>';
      if (o.showValues !== false) s += '<text x="' + (x + w / 2) + '" y="' + (y - 4) + '" text-anchor="middle" style="fill:var(--ems-text-2)">' + v + (o.unit || '') + '</text>';
      s += '<text x="' + (x + w / 2) + '" y="' + (H - 9) + '" text-anchor="middle">' + esc(o.labels[i]) + '</text>';
    });
    if (o.refLine != null) { var ry = T + ih - ih * o.refLine / max; s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + ry + '" y2="' + ry + '" stroke="var(--ems-warning)" stroke-dasharray="4 3"/><text x="' + (W - Rr) + '" y="' + (ry - 4) + '" text-anchor="end" style="fill:var(--ems-warning)">' + esc(o.refLabel || '') + '</text>'; }
    el.innerHTML = '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || '') + '">' + s + '</svg></div>';
  }
  function lineChart(el, o) {
    var W = o.width || 520, H = o.height || 200, L = 36, B = 26, T = 14, Rr = 12, n = o.values.length;
    var min = o.min != null ? o.min : 0, max = o.max || niceMax(Math.max.apply(null, o.values.filter(function (v) { return v != null; }).concat([1])));
    var ih = H - T - B, iw = W - L - Rr, s = '';
    function X(i) { return L + (n === 1 ? iw / 2 : iw * i / (n - 1)); } function Y(v) { return T + ih - ih * (v - min) / (max - min); }
    for (var g = 0; g <= 4; g++) { var gv = min + (max - min) * g / 4, y = Y(gv); s += '<line class="grid-line" x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + Math.round(gv) + (o.unit || '') + '</text>'; }
    var pts = []; o.values.forEach(function (v, i) { if (v != null) pts.push([X(i), Y(v), v, i]); });
    if (pts.length) {
      s += '<path d="M' + pts[0][0] + ' ' + (T + ih) + ' ' + pts.map(function (p) { return 'L' + p[0] + ' ' + p[1]; }).join(' ') + ' L' + pts[pts.length - 1][0] + ' ' + (T + ih) + 'Z" fill="var(--ems-navy-soft)"/>';
      s += '<path d="' + pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ') + '" fill="none" stroke="var(--ems-chart-1)" stroke-width="2"/>';
      pts.forEach(function (p, i) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === pts.length - 1 ? 4.5 : 3) + '" fill="var(--ems-chart-1)" stroke="var(--ems-surface)" stroke-width="2"><title>' + esc(o.labels[p[3]]) + ': ' + p[2] + (o.unit || '') + '</title></circle>'; });
      var lp = pts[pts.length - 1]; s += '<text x="' + (lp[0] - 6) + '" y="' + (lp[1] - 9) + '" text-anchor="end" style="fill:var(--ems-text);font-weight:700">' + lp[2] + (o.unit || '') + '</text>';
    }
    o.labels.forEach(function (lb, i) { if (n > 8 && i % Math.ceil(n / 8) && i !== n - 1) return; s += '<text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="' + (i === n - 1 && n > 1 ? 'end' : i === 0 && n > 1 ? 'start' : 'middle') + '">' + esc(lb) + '</text>'; });
    if (o.refLine != null) { var ry = Y(o.refLine); s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + ry + '" y2="' + ry + '" stroke="var(--ems-warning)" stroke-dasharray="4 3"/><text x="' + (L + 4) + '" y="' + (ry - 4) + '" style="fill:var(--ems-warning)">' + esc(o.refLabel || '') + '</text>'; }
    el.innerHTML = '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || '') + '">' + s + '</svg></div>';
  }
  function hbars(el, items, o) {
    o = o || {}; var max = o.max || Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    el.innerHTML = '<div class="stack" style="gap:10px">' + items.map(function (it) {
      var pct = Math.round(it.value / max * 100);
      return '<div><div class="row small" style="justify-content:space-between"><span>' + esc(it.label) + '</span><b class="num">' + (it.text || it.value + (o.unit || '')) + '</b></div><div class="bar ' + (it.tone || '') + '" style="height:8px;margin-top:4px"><span style="width:' + pct + '%"></span></div></div>';
    }).join('') + '</div>';
  }

  function formVals(root) { var o = {}; root.querySelectorAll('[name]').forEach(function (e) { o[e.name] = e.type === 'checkbox' ? e.checked : e.value.trim(); }); return o; }
  function fieldErr(root, name, msg) { var el = root.querySelector('[name="' + name + '"]'); if (!el) return; var f = el.closest('.field'); if (!f) return; f.classList.toggle('invalid', !!msg); var e = f.querySelector('.err'); if (!e) { e = document.createElement('div'); e.className = 'err'; f.appendChild(e); } e.textContent = msg || ''; }

  /* chủ đề sáng/tối đồng bộ với khung index */
  try { var th = localStorage.getItem('egoLmsDemo.theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) { }
  window.addEventListener('message', function (e) { if (e.data && e.data.type === 'lms-theme') { if (e.data.theme) document.documentElement.setAttribute('data-theme', e.data.theme); else document.documentElement.removeAttribute('data-theme'); } if (e.data && e.data.type === 'lms-reload') location.reload(); });

  var LMS = window.LMS = {
    db: db, save: save, reset: reset, commit: commit, log: log, onChange: onChange, go: go, param: param,
    TODAY: TODAY, iso: iso, parse: parse, addDays: addDays, fmtDate: fmtDate, fmtDT: fmtDT, daysBetween: daysBetween, THU: THU,
    byId: byId, nextId: nextId, name: name, donViTen: donViTen, hocPhanOfLop: hocPhanOfLop, ghiDanhLop: ghiDanhLop, soHV: soHV, buoiCuaLop: buoiCuaLop, buoiStatus: buoiStatus, phuongAnCH: phuongAnCH, cfgDD: cfgDD, ddTuDong: ddTuDong, ddAuto: ddAuto, hvBuoi: hvBuoi, buoiMoc: buoiMoc, thoiLuongBuoi: thoiLuongBuoi, hanXacNhan: hanXacNhan, danhSoBuoi: danhSoBuoi, dongBoBuoi: dongBoBuoi, ketThucBuoi: ketThucBuoi, hm2m: hm2m, m2hm: m2hm,
    chuyenCanHV: chuyenCanHV, tienDoHV: tienDoHV, keHoachPct: keHoachPct, diemCot: diemCot, diemTongKet: diemTongKet, trangThaiThoiGian: trangThaiThoiGian, TT_LOP: TT_LOP,
    lopStats: lopStats, riskOf: riskOf, kyThiStatus: kyThiStatus, fileUsage: fileUsage, walkKhoi: walkKhoi, baiFiles: baiFiles, syncBai: syncBai, tieuChiBai: tieuChiBai, coDiemDanh: coDiemDanh, KS_MAU: KS_MAU, KS_NX: KS_NX, ksDongBo: ksDongBo, ksTrangThai: ksTrangThai, CC_CANH_BAO: CC_CANH_BAO, CC_NGUY_CO: CC_NGUY_CO, hdDaTraLoi: hdDaTraLoi, hdChoTL: hdChoTL, SK: SK, phienKy: phienKy, thoiLuongKy: thoiLuongKy, conLai: conLai, diemRuiRo: diemRuiRo, suKien: suKien, taoPhien: function (ky) { taoPhien(ky, Date.now()); }, refsOf: refsOf,
    btDoiTuong: btDoiTuong, nopCuaHV: nopCuaHV, btHanCuoi: btHanCuoi, btHetHan: btHetHan, diemBaiTap: diemBaiTap, btStatus: btStatus, btStats: btStats,
    ui: { esc: esc, norm: norm, hl: hl, money: money, badge: badge, prog: prog, person: person, initials: initials, opts: opts, toast: toast, modal: modal, confirm: confirmBox, blocked: blocked, menu: menu, table: table, barChart: barChart, lineChart: lineChart, hbars: hbars, formVals: formVals, fieldErr: fieldErr }
  };
})();
