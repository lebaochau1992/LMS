# Quy ước dựng màn hình – EGO LMS Cổng quản trị (bản demo)

Thư mục: `/home/claude/lms/demo/`. Mỗi màn hình là **một file .html** cùng thư mục, được `index.html` nạp vào iframe theo `cau-hinh-menu.js`.
Mọi màn hình dùng chung `edot.css` (design token EDOT) và `lms-core.js` (kho dữ liệu + thư viện UI). ĐỌC KỸ hai file này trước khi viết.

## Khung file bắt buộc
```html
<!doctype html>
<html lang="vi"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tên màn hình · EGO LMS</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap">
<link rel="stylesheet" href="edot.css">
<style>/* chỉ CSS riêng của màn hình, dùng biến --ems-* */</style>
</head><body>
<div class="page" id="app"></div>
<script src="lms-core.js"></script>
<script>
(function(){ 'use strict'; var db=LMS.db, U=LMS.ui, esc=U.esc; /* ... */ })();
</script>
</body></html>
```
- Không dùng thư viện ngoài. Không `alert/confirm/prompt` (dùng `U.confirm`, `U.modal`, `U.toast`). Không màu hardcode: chỉ `var(--ems-*)`.
- Luôn đọc `LMS.db` tại thời điểm render (sau `LMS.reset()` đối tượng db đổi). Viết `var db = LMS.db` bên trong hàm render, hoặc dùng `LMS.db.x` trực tiếp.
- Gọi `LMS.onChange(render)` để vẽ lại khi màn khác sửa dữ liệu.
- Sau mọi thao tác ghi: `LMS.commit('Hành động', 'Đối tượng', 'Tóm tắt', truoc, sau)` → lưu + ghi nhật ký + báo shell.
- Chuyển màn hình: `LMS.go('lop-hoc.html', {lop:'lop2'})`; màn đích đọc `LMS.param('lop-hoc.html')` khi khởi động (trả `null` nếu không có).
- Tiếng Việt chuẩn, nhãn nghiệp vụ, không hiện mã kỹ thuật (gv/self/ego). Ngày `dd/mm/yyyy` qua `LMS.fmtDate`, giờ `LMS.fmtDT`, tiền `U.money`.
- Trạng thái rỗng: hiển thị "Chưa có dữ liệu", không hiển thị 0% khi mẫu số = 0.
- Không có dòng ghi chú/giải thích dài trên form; nếu cần, gom vào nút `?` bật/tắt.
- Responsive: bảng nằm trong `.tbl-wrap` (U.table đã có); lưới dùng `.grid .g2/.g3/.g4`, `.form-grid`.

## Bố cục chuẩn một màn hình
```html
<div class="page-head"><div><h1>Tiêu đề</h1><div class="sub">mô tả ngắn / số lượng</div></div><div class="actions">…nút…</div></div>
<div class="kpis">…(tuỳ màn)…</div>
<div class="panel"><div class="panel-head filters">…bộ lọc…</div><div id="tbl"></div></div>
```

## Thư viện `LMS` (lms-core.js)
- Ngày: `LMS.TODAY` (Date, 0h hôm nay – dùng ngày thật), `iso(d)`, `parse(s)`, `addDays(d,n)`, `fmtDate(s)`, `fmtDT(s)`, `daysBetween(a,b)` (= b − a, số ngày), `THU` (['CN','T2',…]).
- Dữ liệu: `byId(coll,id)`, `nextId(prefix)`, `name(coll,id,key)`, `donViTen(id)`, `hocPhanOfLop(lop)`, `ghiDanhLop(lopId, all)`, `soHV(lopId)`, `buoiCuaLop(lopId)`, `buoiStatus(b)` → {key:'sap'|'hom-nay'|'dang'|'cho-xn'|'chua-dd'|'xong'|'huy', label, tone, sub}, `cfgDD()` → quy tắc điểm danh, `ddTuDong(b,hvId,xinPhep?)` → {tt,phut,pct,muon,thieu,vao,ra,lan,trongPhong}, `hvBuoi(b)`, `buoiMoc(b)` → {bd,kt}, `hanXacNhan(b)`, `danhSoBuoi(lopId)`, `dongBoBuoi(chiKetThuc)` (chốt nhật ký buổi đã kết thúc, tự chốt buổi quá hạn), `chuyenCanHV(lopId,hvId)` → {co,tong,pct,vangLienTiep}|null, `tienDoHV(lopId,hvId)` → {done,tong,pct,lastAt,quiz}, `keHoachPct(lop)`, `diemCot(lop,hvId,idx)`, `diemTongKet(lop,hvId)` (null nếu thiếu cột), `trangThaiThoiGian(lop)` → {label,tone}, `TT_LOP[trangThai]` → [label,tone], `lopStats(lopId)` → {soHV,dangHoc,soBai,buoiTong,buoiDaDay,buoiDaChot,buoiChoXN,buoiChuaDD,chuyenCan,tienDo,keHoach,coDiem,dat,hp,lop}, `riskOf(lopId,hvId)` → {score,reasons[],muc:'cao'|'tb'|'thap'}|null, `kyThiStatus(ky)` → {key,label,tone}, `fileUsage(fileId)` → [{hp,bai}], `refsOf(type,id)` → mảng mô tả nơi đang dùng (type: hocPhan, chuongTrinh, lop, nganHang, cauHoi, deThi, donVi, khoanThu, file, nhomQuyen). **Trước khi xóa phải gọi refsOf; nếu có tham chiếu → `U.blocked(title, refs, hint)` và không xóa (gợi ý Ngưng dùng/Lưu trữ).**
- Ghi: `LMS.commit(hanhDong, doiTuong, tomTat, truoc, sau)`, `LMS.save()`, `LMS.reset()`.
- UI `LMS.ui` (= U): `esc`, `norm` (bỏ dấu, để tìm kiếm), `hl(text,q)` tô chữ khớp, `money`, `badge(text,tone)` tone: ''|'navy'|'ok'|'warn'|'bad'|'info', `prog(pct,tone,label)`, `person(name,subHtml)`, `initials`, `opts(list,valKey,labelKey|fn,selected,placeholder)` → chuỗi `<option>`, `toast(msg,'ok'|'bad')`, `modal({title,body(html|node),size:'sm'|'lg',foot:[{label,cls,onClick(api)→false để giữ mở,close}],onOpen(api),onClose})` → api {el,body,close}, `confirm({title,message|html,ok,danger})` → Promise<bool>, `blocked(title,refs,hint)`, `menu(anchorEl,[{label,onClick,danger,disabled,title}|'-'])`, `table(host,{columns:[{key,label,render(row),sortVal(row),cls:'num'|'c',w,sortable:false}],rows: fn|array,pageSize,empty,onRowClick(row),select:true,onSelect(ids),sort,dir})` → {render(resetPage),selected(),clearSel()}, `barChart(el,{labels,values,unit,max,color,colors,refLine,refLabel,height})`, `lineChart(el,{labels,values,unit,min,max,refLine,refLabel})`, `hbars(el,[{label,value,text,tone}],{max,unit})`, `formVals(root)` (theo thuộc tính name), `fieldErr(root,name,msg)`.
- Lớp CSS có sẵn (edot.css): page, page-head, panel, panel-head, panel-body, eyebrow, btn (primary, danger, danger solid, ghost, sm), icon-btn, inp, sel, field (+label, .req, .err, .hint, .invalid), form-grid (.full), filters, check, tbl (t-main, t-sub, num, c), badge, tag, kpis/kpi (k-label,k-val,k-sub; warn/bad/ok; clickable/active), bar/prog, tabs/tab(.on), seg (button.on), note (warn/bad/ok/info), kv (dl), avatar, person, dot(ok/warn/bad), legend, grid g2/g3/g4, row, stack, grow, right, muted, small, mono, num, tree/tree-row/tree-toggle, mark.
- Quy ước kiểu chữ: toàn bộ giao diện dùng một họ chữ Inter (biến --font). Mã định danh (mã HV, mã GV, mã lớp, mã học phần, mã kỳ thi, SBD, mã đề, mã đơn, tên đăng nhập…) bọc trong class `mono`: cùng font Inter, số tabular, không xuống dòng; trong bảng hiển thị 13px/500, nằm trong dòng phụ (`t-sub`) thì theo cỡ 12px/400 của dòng phụ. Mã ở cột tham chiếu (cột Lớp, Đề thi, Ngân hàng…) cũng dùng `mono`, kể cả khi là liên kết. Biến --mono giữ lại để tương thích và trỏ về --font; chỉ ô soạn mã HTML trong khối nội dung dùng --code (phông đơn cách). Cỡ chữ theo thang 11 / 12 / 13 / 14 / 15 / 20px, không dùng cỡ lẻ .5px.

## Mô hình dữ liệu `LMS.db`
- `donVi[]` {id, ma, ten, cha, laKhoa}
- `chuongTrinh[]` {id, ma, ten, cha, khoa(donVi id), hocPhan:[hpId], trangThai:'hoat-dong'|'ngung'} — cây theo `cha`.
- `hocPhan[]` {id, ma, ten, khoa, soTC, trangThai:'hoat-dong'|'nhap'|'ngung', moTa, chuanDauRa[] (mục tiêu học phần), phanLoai(chuongTrinh id|null), quyTac:'tien-quyet'|'mo-toan-bo', tieuChi:{xemOn, xem, quizOn, quizKieu:'diem'|'pct', quizDiem, quizPct, tuDong}, bai:[…]}
- `bai` {id, ten, giay (thời lượng), xuatBan, hocThu, hien, tienQuyet:[baiId], tieuChiRieng:null|{…như tieuChi}, dinhKem:[fileId], khoi:[khối]} và các trường tóm tắt do `LMS.syncBai(bai)` suy ra từ khối: phut, video, taiLieu, quiz (số câu). Màn khác chỉ đọc trường tóm tắt; sửa nội dung thì sửa `khoi` rồi gọi `syncBai`.
- Khối `{id, loai, …}`: tieu-de{text,cap}, doan-van{html}, cong-thuc{tex,kieu}, anh{file,chuThich,size}, video{file,chuThich,xemToiThieu,batBuoc,tuaNhanh,dauChim,giay}, am-thanh{file,chuThich,soLan,loiThoaiHien,loiThoai,ngheToiThieu,tuaCau,tocDo,luyenCau,tuPhat,giay}, pdf{file,chuThich,taiVe}, nut{nhan,url,tabMoi}, quiz{tieuDe,cauHoi[]}, nhung{url}, html{code}, trang-tt{html,cao}, duong-ke{kieu}, nhom{tieuDe,con[]}, bo-cuc{layout,cot[[]]}, luoi{dong,soCot,tiLe[],o[[]]}. Duyệt lồng nhau bằng `LMS.walkKhoi(list, fn)`; tệp đang dùng của bài: `LMS.baiFiles(bai)`.
- Câu quiz trong bài `{id, loai:'mot'|'nhieu'|'dung-sai'|'ngan'|'noi'|'sap-xep'|'gach-chan'|'tu-luan', noiDung, pa[{t,dung}], dung, dapAn[], cap[{trai,phai}], muc[], doanVan (từ cần gạch trong [[ ]]), goiY, nguon (id câu ngân hàng nếu nhập từ ngân hàng)}`
- `lop[]` {id, ma, ten, chuongTrinh, hocPhan, khoa, batDau, ketThuc (iso), giangVien:[gvId], hinhThuc:'truc-tuyen-gv'|'truc-tiep'|'tu-hoc', sucChua, khoanThu(id|null), tuDangKy, trangThai:'ke-hoach'|'tuyen-sinh'|'dang-hoc'|'ket-thuc'|'huy', cotDiem:[{ten, ts(trọng số %), nguon:'diem-danh'|'ky-thi'|'nhap'|'bai-tap', kyThi, baiTap:[btId], gop:'trung-binh'|'cao-nhat', khongNop:'tinh-0'|'bo-trong'}], diemDat}
- `ghiDanh[]` {id, lop, hv, ngay, trangThai:'dang-hoc'|'hoan-thanh'|'thoi-hoc'|'bao-luu'|'cho-khai-giang', hinhThuc}
- `dangKy[]` {id, lop, hv, ngay, trangThai:'cho-duyet'|'cho-thanh-toan'|'da-duyet'|'tu-choi'}
- `thanhToan[]` {id, ma, hv, lop, khoanThu, soTien, trangThai:'cho-thanh-toan'|'da-thanh-toan'|'hoan-tien', kenh, ngay}
- `hocVien[]` {id, ma, hoTen, gioiTinh, ngaySinh, cccd(12 số), sdt, email, diaChi, trangThai:'hoat-dong'|'vo-hieu', taiKhoan(id|null), ngayTao}
- `giangVien[]` {id, ma, hoTen, hocHam, email, sdt, donVi, taiKhoan, trangThai}
- `taiKhoan[]` {id, ten, hoTen, email, loai:'nv'|'gv'|'hv', nhom:[nqId], donVi, trangThai:'hoat-dong'|'ngung', lanCuoi}
- `nhomQuyen[]` {id, ma, ten, moTa, pham:'toan-bo'|'don-vi'|'lop-phan-cong'|'ca-nhan', quyen:'all'|[menuId]}
- `buoiHoc[]` {id, lop, ten, chuDe, ngay, gio, den, gv, hinhThuc, phong, huy, lyDoHuy, hocBu (id buổi bị hủy), buBang, thamGia: {hvId:{vao, ra, phut, lan}} | null khi không có nhật ký, loiPhong / ngoaiHeThong (buổi điểm danh thủ công), diemDanh: null|{hvId:'co'|'vang'|'phep'}, dieuChinh: {hvId:{tu, den, ghiChu, boi, luc}}, xinPhep: {hvId:{lyDo, luc, tt:'cho'|'duyet'|'tu-choi', boi}}, chot: null|{boi: mã GV | tài khoản | 'he-thong', luc, sua}}
- `cauHinhDD` {nguong: % thời lượng tối thiểu để tính có mặt, muon: số phút tính đi muộn, hanXN: số giờ giảng viên xác nhận sau buổi, tuDongChot}
- Luồng buổi học và điểm danh (lớp trực tuyến có giảng viên):
  1. Phòng đào tạo tạo lịch tại Lớp học › Buổi học và điểm danh (định kỳ hoặc từng buổi); kiểm tra trùng lịch lớp và giảng viên; đổi lịch, hủy buổi có tùy chọn gửi thông báo cho học viên, hủy buổi có tùy chọn tạo buổi học bù.
  2. Trước buổi học: học viên gửi đơn xin vắng trên cổng học viên, giảng viên duyệt hoặc từ chối.
  3. Trong buổi: học viên vào phòng học trực tuyến từ lịch học; hệ thống ghi giờ vào, giờ rời, số lần vào, tổng phút tham gia.
  4. Kết thúc buổi: hệ thống tính kết quả theo `cauHinhDD` (đủ ngưỡng → có mặt, đánh dấu đi muộn; không đủ ngưỡng và có đơn được duyệt → có phép; còn lại → vắng).
  5. Giảng viên rà soát trong `hanXN` giờ: điều chỉnh kết quả bắt buộc ghi lý do, duyệt đơn xin vắng gửi muộn, rồi xác nhận (chốt). Quá hạn, hệ thống tự chốt.
  6. Sau khi chốt, chỉ Phòng đào tạo điều chỉnh (có lý do, ghi nhật ký). Buổi không có nhật ký phòng học (sự cố, dạy ngoài hệ thống) điểm danh thủ công.
  7. Chuyên cần tính trên các buổi đã có kết quả (tạm tính khi chưa chốt); cột Chuyên cần trong bảng điểm lấy từ đây.
- `lms-hoidap.js` (nạp ở hoi-dap.html và lop-hoc.html) — `LMS.hoiDapUI.render(host, list, o)` vẽ chủ đề và gắn toàn bộ thao tác: trả lời (gắn @tên khi trả lời một trả lời), chọn câu trả lời đúng, sửa, xóa có lý do, khôi phục; o = {st, tuongDoi, hienLop, hienBai, flat, menu, onChange, moNhom}. Quản trị và giảng viên của lớp sửa, xóa được câu hỏi gốc và mọi trả lời; sửa nội dung của học viên hiện nhãn "đã sửa bởi …", nội dung gốc giữ trong noiDungGoc và nhật ký.
- `lms-buoi.js` (nạp sau lms-core.js ở lop-hoc.html và buoi-hoc.html) — `LMS.buoiUI`: chiTiet(b, ctx), form(b|null, {lop, onDone}), dinhKy({lop, onDone}), huy(b, {onDone}), khoiPhuc(b, {onDone}), quyTac({vaiTro, onDone}), menu(anchor, b, ctx), oTrangThai(b), oDiemDanh(b), hanhDongChinh(b). ctx = {vaiTro:'pdt'|'gv', gv, onDone}. Hai màn gọi chung một bộ hộp thoại, không viết lại logic buổi học ở từng màn.
- `tienDo` {lopId:{hvId:{done, lastAt, quiz:{baiId:điểm}, phutXem}}}
- `nganHang[]` {id, ma, ten, hocPhan, trangThai}; `cauHoi[]` {id, nh, bai, noiDung, loai:'mot-dap-an'|'nhieu-dap-an'|'tu-luan', doKho:'De'|'TrungBinh'|'Kho', phuongAn, dapAn, phienBan, trangThai, ngay}
- `deThi[]` {id, ma, ten, nh, cauHoi:[qId], thoiLuong, thang, diemDat, tronCau, trangThai:'nhap'|'xuat-ban'}
- `kyThi[]` {id, ma, ten, lop, de, cot (chỉ số cột điểm của lớp), moLuc, dongLuc (ISO datetime), doiTuong:'theo-lop', congBo:bool}
- `kyThi[]` bổ sung: giamThi:[taiKhoanId], kichHoat:null|{luc,nguoi}, maVao, cheDo:{toanManHinh,chanChuyenTab,chanSaoChep,yeuCauMa,tuDongNop,viPhamToiDa}, tamDung:null|{luc,lyDo}, ketThuc:null|{luc,nguoi}, ghiChuGT, nhatKyGT[].
- `phienThi[]` {id, ky, hv, sbd, lan, trangThai:'chua-vao'|'dang-lam'|'mat-ket-noi'|'khoa'|'da-nop'|'dinh-chi'|'vang', batDau, cong(phút cộng), dungMs, dungLuc, nopLuc, cau, tong, suKien:[{id,t,loai,ct,xl}], ip, tb, lanVao, lichSu[], lanTruoc[]}. Hàm: `LMS.phienKy(kyId)`, `LMS.conLai(p, ky)`, `LMS.SK` (loại sự kiện và trọng số).
- `baiLam[]` {id, ky, hv, nop, traLoi:{qId:bool}, diemTN, diem(null nếu chờ chấm), trangThai:'cho-cham'|'da-cham', lichSu:[]}
- `baiTap[]` {id, ma, ten, lop, hocPhan, gv, phamVi:{loai:'bai'|'nhieu-bai'|'hoc-phan', bai:[baiId]}, loai:'trac-nghiem'|'tu-luan'|'nop-tep'|'ket-hop', cauHoi:[qId], deTL, rubric:[{ten,diem}], taiLieu:[fileId], tyLe:{tn,tl}, giaoLuc, hanNop, nopMuon:{cho,truPct,toiDa}, soLan, cachLay:'cao-nhat'|'lan-cuoi'|'trung-binh', tronCau, hienDapAn, doiTuong:'ca-lop'|'chon', hvChon, trangThai:'nhap'|'da-giao'|'da-dong', thongBao, nhacTruocHan, chuyenDiem:null|{cot,luc,nguoi}, cotDuKien} — chỉ giảng viên thuộc `lop.giangVien` được giao/chấm/chuyển điểm.
- `baiNop[]` {id, bt, hv, lan, nopLuc, traLoi:{qId:bool}, baiLamTL, tep, diemTN, rubric:[điểm], diemTL, truMuon(%), diem, trangThai:'cho-cham'|'da-cham'|'tra-lai', nhanXet, nguoiCham, lichSu:[]}
- Hàm bài tập: `LMS.btStatus(bt)`, `LMS.btStats(bt)`, `LMS.btDoiTuong(bt)`, `LMS.nopCuaHV(bt,hv)`, `LMS.diemBaiTap(bt,hv)`, `LMS.btHetHan(bt)`; `LMS.diemCot` tự tính cột nguồn `bai-tap` từ các bài tập đã chuyển điểm.
- `hoiDap[]` {id, lop, bai, hv, noiDung, ngay, rieng(chỉ GV thấy), loai:'cau-hoi'|'binh-luan', ghim, an, giaiQuyet(id trả lời được chọn|null), sua:null|{luc, nguoi:'qt:tk'|'gv:id', ten}, noiDungGoc, xoa:null|{nguoi,vaiTro,luc,lyDo}, traLoi:[{id, nguoi(hvId|gvId|tên tài khoản QT), vaiTro:'hv'|'gv'|'qt', noiDung, ngay, traLoiCho(id trả lời được nhắc @), sua, noiDungGoc, xoa}]} — đếm câu chờ trả lời bằng `LMS.hdChoTL(t)`, đã có phản hồi của GV/QT: `LMS.hdDaTraLoi(t)`.
- `thuVien[]` {id, ten, loai:'Video'|'PDF'|'Ảnh'|'Audio', thuMuc, kb, hash, ngay, nguoiTai}
- `khoanThu[]` {id, ma, ten, loai, donGia, vat, trangThai:'dang-dung'|'ngung'}
- `khaoSat[]` {id, ten, lop, guiDi, phanHoi, diemTB, trangThai, cauHoi}
- `thongBao[]`, `nhatKy[]` {id,t,user,hanhDong,doiTuong,tomTat,truoc,sau}
- `db.meta.user` {ten, hoTen, email}

## Cổng học viên (`cong-hoc-vien/`)
- Mỗi trang nạp `../edot.css`, `hv.css`, `../lms-core.js`, `hv-core.js`, sau đó một khối `<script>` riêng của trang; trang gọi `HV.shell(tenFile, {title})` để dựng khung (menu, tìm kiếm, chuông thông báo, tài khoản) và nhận vùng nội dung.
- Học viên đang xem: `HV.id()` / `HV.me()`; đổi học viên lưu ở localStorage `egoLmsDemo.hv`.
- Quyền truy cập: `HV.duocVao(lop)` — chỉ lớp có ghi danh; học viên chờ khai giảng, bảo lưu, thôi học xem được thông tin, không vào bài.
- Tiến độ: `HV.td(lopId)` đọc, `HV.tdGhi(lopId)` ghi; `HV.baiState(lop, i)` trả xong / mo / khoa theo quy tắc tiên quyết; `HV.dieuKienBai(lop, bai)` so thời lượng xem và điểm câu hỏi củng cố với tiêu chí của học phần.
- Việc cần làm: `HV.viecCanLam()` gom buổi đang diễn ra, bài tập sắp hạn, kỳ thi mở, khảo sát chưa làm, thông báo cần xác nhận.
- Dữ liệu học viên ghi vào kho chung:
  - `tienDo[lop][hv]` {done, lastAt, quiz, phutXem, xem:{baiId:%}, ghiChu:{baiId:[{nd, moc (giây video), luc}]}}
  - `baiNop[]` khi nộp bài tập; `phienThi[]`, `baiLam[]` {luaChon, tuLuan} khi làm bài thi; `LMS.suKien` ghi vi phạm
  - `buoiHoc[].thamGia[hv]` khi vào phòng học; `buoiHoc[].xinPhep[hv]` khi xin vắng
  - `khaoSat[].phieu[]` {hv, luc, tl:{câu: trả lời}} rồi gọi `LMS.ksDongBo(ks)`
  - `hoiDap[]` câu hỏi, trả lời của học viên; `hvXem` lưu thời điểm học viên xem chủ đề
  - `thongBao[].xem`, `thongBao[].xacNhan`
  - `dangKy[]`, `thanhToan[]` khi đăng ký và thanh toán; `phucKhao[]` {id, hv, ky, lyDo, luc, tt:'cho-xu-ly'}
  - `luyenTap[lop][hv]` lịch sử luyện tập; `hocVien[].caiDat` cài đặt thông báo
- `kham-pha.html` không dùng `HV.shell`; trang tự dựng thanh tiêu đề, chân trang và đọc vai trò xem trang ở localStorage `egoLmsDemo.kp` ('khach' | 'hv', tham số `?vai=`). Các trang trong cổng ghi 'hv' khi mở; Đăng xuất chuyển về `kham-pha.html?vai=khach`. Tham số `?hp=` mở chi tiết học phần, `?dk=` mở đăng ký lớp.
  - Đơn của khách: tạo `hocVien` mới (taiKhoan null, nguon 'dang-ky-truc-tuyen', doiTuong, noiCongTac) nếu CCCD chưa có, rồi `dangKy` {ma 'DK' + 6 số, kenh, doiTuong}; CCCD/email thuộc hồ sơ đã có tài khoản thì yêu cầu đăng nhập.
  - `nhanTin[]` {hp, hv | email, luc} đăng ký nhận thông báo mở lớp; `yeuCauDonVi[]` yêu cầu đào tạo của đơn vị.
  - Mã chứng nhận: `VUTM-<mã học phần>-<số hiệu học viên>`, xác thực theo ghi danh hoàn thành.
- Trang có CSS riêng đặt `src/<tên>.css` cạnh `src/<tên>.js`; bước dựng trang chèn liên kết CSS vào đầu trang.
- Thêm trang mới: tạo file HTML theo khung trên, bổ sung mục menu trong `HV.shell` (mảng menu trong `hv-core.js`).

## Nguyên tắc nghiệp vụ phải thể hiện (từ báo cáo rà soát)
1. Mọi số đếm tự tính từ dữ liệu, không có ô nhập tay số lượng (số câu, số bài, số thí sinh, số môn…).
2. Chọn tham chiếu bằng danh sách chọn, không nhập chữ tự do (môn/học phần, ngân hàng, đề, lớp, đơn vị).
3. Chặn xóa khi đang được dùng (refsOf) → gợi ý Ngưng dùng / Lưu trữ; xóa được thì hỏi xác nhận bằng U.confirm.
4. Kiểm tra dữ liệu: ngày kết thúc > ngày bắt đầu, mã không trùng, CCCD 12 số và không trùng, email/SĐT đúng định dạng.
5. Trạng thái tính theo thời gian thực (LMS.TODAY / Date.now()).
6. Thuật ngữ: Chương trình đào tạo → Học phần → Lớp học → Buổi học / Bài giảng; Ngân hàng câu hỏi → Đề thi → Kỳ thi.
7. Mỗi màn hình có ít nhất: tiêu đề + số lượng, bộ lọc/tìm kiếm (bỏ dấu), bảng, thao tác thêm/sửa/xem chi tiết, thao tác ⋯ theo dòng, liên kết sang màn liên quan bằng LMS.go.
