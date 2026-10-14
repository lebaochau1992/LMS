/* EGO LMS · Cổng học viên (bản demo) — khung giao diện và nghiệp vụ phía học viên.
   Dùng chung kho dữ liệu với Cổng quản trị (lms-core.js): bài nộp, bài thi, phiếu khảo sát, câu hỏi, đơn xin vắng,
   xác nhận thông báo, đơn đăng ký do học viên tạo hiển thị ngay ở các màn quản trị tương ứng. */
(function () {
  'use strict';
  var U = LMS.ui, esc = U.esc, KHV = 'egoLmsDemo.hv';
  function D() { return LMS.db; }

  /* ---------- biểu tượng ---------- */
  var IC = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    cal: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    task: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    grade: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    form: '<path d="M9 11l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12h11l2-8H6.2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/>',
    exam: '<path d="M12 3l9 4-9 4-9-4z"/><path d="M7 9v5c0 1.7 2.2 3 5 3s5-1.3 5-3V9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
  };
  function svg(k, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (w ? ' style="width:' + w + 'px;height:' + w + 'px"' : '') + '>' + (IC[k] || '') + '</svg>'; }

  /* ---------- học viên đang đăng nhập (demo cho phép đổi) ---------- */
  function hvId() { try { var v = localStorage.getItem(KHV); if (v && LMS.byId('hocVien', v)) return v; } catch (e) { } return 'hv99'; }
  function me() { return LMS.byId('hocVien', hvId()); }
  function tkMe() { var h = me(); return h && h.taiKhoan ? LMS.byId('taiKhoan', h.taiKhoan) : null; }
  function qp(k) { return new URLSearchParams(location.search).get(k); }
  function url(page, o) { var s = Object.keys(o || {}).filter(function (k) { return o[k] != null && o[k] !== ''; }).map(function (k) { return k + '=' + encodeURIComponent(o[k]); }).join('&'); return page + (s ? '?' + s : ''); }
  function now() { return Date.now(); }

  var TT_GD = { 'dang-hoc': ['Đang học', 'ok'], 'hoan-thanh': ['Hoàn thành', 'navy'], 'bao-luu': ['Bảo lưu', 'warn'], 'thoi-hoc': ['Thôi học', 'bad'], 'cho-khai-giang': ['Chờ khai giảng', 'info'] };
  var HT = { 'truc-tuyen-gv': 'Trực tuyến có giảng viên', 'tu-hoc': 'Tự học trực tuyến' };
  function gds() { return D().ghiDanh.filter(function (g) { return g.hv === hvId(); }); }
  function gdLop(lopId) { return gds().find(function (g) { return g.lop === lopId; }) || null; }
  function lopCuaToi(opt) { opt = opt || {}; return gds().filter(function (g) { return opt.all || g.trangThai !== 'thoi-hoc'; }).map(function (g) { return { g: g, l: LMS.byId('lop', g.lop) }; }).filter(function (x) { return x.l; }); }
  function dangHoc() { return lopCuaToi().filter(function (x) { return x.g.trangThai === 'dang-hoc'; }); }
  function duocVao(lopId) { var g = gdLop(lopId); return !!g && (g.trangThai === 'dang-hoc' || g.trangThai === 'hoan-thanh'); }
  function gvTen(id) { var g = LMS.byId('giangVien', id); return g ? g.hoTen : '—'; }
  function coverCls(l) { var n = +String(l.hocPhan).replace(/\D/g, '') || 1; return 'cv-' + ((n - 1) % 6 + 1); }

  /* ---------- tiến độ bài giảng ---------- */
  function td(lopId) { var m = D().tienDo[lopId] || {}; return m[hvId()] || { done: 0, lastAt: null, quiz: {}, phutXem: 0 }; }
  function tdGhi(lopId) { var m = D().tienDo[lopId] = D().tienDo[lopId] || {}; if (!m[hvId()]) m[hvId()] = { done: 0, lastAt: null, quiz: {}, phutXem: 0 }; var t = m[hvId()]; t.quiz = t.quiz || {}; t.xem = t.xem || {}; return t; }
  function baiCua(lop) { var hp = LMS.hocPhanOfLop(lop); return hp ? hp.bai.filter(function (b) { return b.xuatBan !== false && b.hien !== false; }) : []; }
  function tieuChi(lop, b) { var hp = LMS.hocPhanOfLop(lop); return LMS.tieuChiBai(hp, b) || { xemOn: true, xem: 80, quizOn: true, quizDiem: 5 }; }
  function baiState(lop, i) {
    var g = gdLop(lop.id), t = td(lop.id);
    if (g && g.trangThai === 'hoan-thanh') return 'xong';
    if (i < t.done) return 'xong';
    if (i === t.done) return 'mo';
    return 'khoa';
  }
  function quizKhoi(b) { var out = []; LMS.walkKhoi(b.khoi, function (k) { if (k.loai === 'quiz') out.push(k); }); return out; }
  function videoKhoi(b) { var v = null; LMS.walkKhoi(b.khoi, function (k) { if (k.loai === 'video' && !v) v = k; }); return v; }
  function dieuKienBai(lop, b) {
    var tc = tieuChi(lop, b), t = td(lop.id), xem = (t.xem || {})[b.id] || 0, qs = quizKhoi(b).length, dq = (t.quiz || {})[b.id];
    var vOk = !videoKhoi(b) || !tc.xemOn || xem >= tc.xem, qOk = !qs || !tc.quizOn || (dq != null && dq >= (tc.quizDiem || 5));
    return { xem: xem, canXem: tc.xem, vOk: vOk, coQuiz: qs > 0, diemQuiz: dq, canDiem: tc.quizDiem || 5, qOk: qOk, ok: vOk && qOk, coVideo: !!videoKhoi(b) };
  }
  function tienDoLop(lop) { var n = baiCua(lop).length, g = gdLop(lop.id), d = g && g.trangThai === 'hoan-thanh' ? n : Math.min(n, td(lop.id).done); return { done: d, tong: n, pct: n ? Math.round(d / n * 100) : 0 }; }
  /* phương án trả lời hiển thị cho câu hỏi trong bài: lấy theo câu gốc trong ngân hàng */
  function paQuiz(item, b) {
    if (item.loai === 'dung-sai') return [{ t: 'Đúng', dung: !!item.dung }, { t: 'Sai', dung: !item.dung }];
    if (item.nguon) { var q = LMS.byId('cauHoi', item.nguon); if (q) { var ts = LMS.phuongAnCH(q), da = ['A', 'B', 'C', 'D'].indexOf(q.dapAn); return ts.map(function (t, i) { return { t: t, dung: i === da }; }); } }
    var ten = (b ? b.ten : '').replace(/^Bài \d+\s*[–-]\s*/, '');
    return (item.pa || []).map(function (p, i) { var t = /^Phương án [A-D]$/.test(p.t) ? (p.dung ? 'Nội dung trọng tâm của bài "' + ten + '" được trình bày trong video và tài liệu' : ['Chỉ là nội dung đọc thêm, không thuộc yêu cầu bài học', 'Không liên quan đến thực hành lâm sàng', 'Chỉ áp dụng cho y học hiện đại'][i % 3]) : p.t; return { t: t, dung: p.dung }; });
  }

  /* ---------- buổi học, điểm danh ---------- */
  function buoiCuaToi(opt) {
    opt = opt || {}; var ids = lopCuaToi().filter(function (x) { return x.g.trangThai !== 'bao-luu' || opt.all; }).map(function (x) { return x.l.id; });
    return D().buoiHoc.filter(function (b) { return ids.indexOf(b.lop) >= 0; }).sort(function (a, b) { return (a.ngay + a.gio) < (b.ngay + b.gio) ? -1 : 1; });
  }
  function ddCuaToi(b) {
    var h = hvId(), s = LMS.buoiStatus(b).key;
    if (s === 'huy') return { key: 'huy', label: 'Buổi đã hủy', tone: '' };
    if (s === 'sap' || s === 'hom-nay') { var x = (b.xinPhep || {})[h]; return x ? { key: 'xp', label: x.tt === 'duyet' ? 'Đã duyệt xin vắng' : x.tt === 'tu-choi' ? 'Đơn xin vắng bị từ chối' : 'Đã gửi đơn xin vắng', tone: x.tt === 'duyet' ? 'ok' : x.tt === 'tu-choi' ? 'bad' : 'warn' } : { key: 'sap', label: '', tone: '' }; }
    if (s === 'dang') { var t = (b.thamGia || {})[h]; return t ? { key: 'dang', label: t.ra ? 'Đã rời phòng' : 'Đang trong phòng', tone: 'info' } : { key: 'dang', label: 'Chưa vào phòng', tone: 'warn' }; }
    if (!b.diemDanh) return { key: 'cho', label: 'Chờ giảng viên điểm danh', tone: '' };
    var v = b.diemDanh[h]; if (!v) return { key: 'na', label: '—', tone: '' };
    var a = b.thamGia ? LMS.ddTuDong(b, h) : null;
    return { key: v, label: { co: 'Có mặt', vang: 'Vắng', phep: 'Có phép' }[v] + (v === 'co' && a && a.muon ? ' · muộn ' + a.muon + ' phút' : ''), tone: { co: 'ok', vang: 'bad', phep: 'warn' }[v], tam: !b.chot, a: a };
  }
  function vaoPhong(b) {
    var h = hvId(), t; b.thamGia = b.thamGia || {};
    var d = new Date(), hm = LMS.m2hm(d.getHours() * 60 + d.getMinutes());
    t = b.thamGia[h];
    if (!t) b.thamGia[h] = { vao: hm, ra: null, tu: hm, phut: 0, lan: 1 };
    else if (t.ra) { t.phut = LMS.ddTuDong(b, h).phut; t.ra = null; t.tu = hm; t.lan = (t.lan || 1) + 1; }
    LMS.commit(null);
    U.toast('Đã vào ' + b.phong + '. Hệ thống ghi nhận thời gian tham gia để điểm danh.', 'ok');
  }

  /* ---------- bài tập, kỳ thi, khảo sát ---------- */
  function btCuaToi() {
    var ids = lopCuaToi().map(function (x) { return x.l.id; });
    return (D().baiTap || []).filter(function (b) { return ids.indexOf(b.lop) >= 0 && b.trangThai !== 'nhap' && new Date(b.giaoLuc).getTime() <= now() && LMS.btDoiTuong(b).indexOf(hvId()) >= 0; });
  }
  function btTT(b) {
    var ns = LMS.nopCuaHV(b, hvId()), s = LMS.btStatus(b), d = LMS.diemBaiTap(b, hvId()), conLan = (b.soLan || 1) - ns.length;
    if (ns.some(function (n) { return n.trangThai === 'tra-lai'; }) && s.key !== 'het' && s.key !== 'dong') return { key: 'lam-lai', label: 'Được trả lại, làm lại', tone: 'warn', nop: true, co: true };
    if (d != null) return { key: 'cham', label: 'Đã chấm · ' + d + ' điểm', tone: 'ok', diem: d, co: conLan > 0 && (s.key === 'mo' || s.key === 'muon') };
    if (ns.length) return { key: 'nop', label: 'Đã nộp · chờ chấm', tone: 'navy', co: conLan > 0 && (s.key === 'mo' || s.key === 'muon') };
    if (s.key === 'mo') return { key: 'chua', label: 'Chưa nộp · ' + s.sub, tone: s.tone === 'warn' ? 'warn' : 'navy', co: true, can: true };
    if (s.key === 'muon') return { key: 'muon', label: 'Quá hạn · nhận nộp muộn', tone: 'warn', co: true, can: true };
    return { key: 'qua', label: 'Quá hạn, không nộp', tone: 'bad', co: false };
  }
  function kyCuaToi() {
    var ids = lopCuaToi({ all: false }).map(function (x) { return x.l.id; });
    return D().kyThi.filter(function (k) { return k.de && ids.indexOf(k.lop) >= 0 && (k.doiTuong !== 'chon' || (k.hvChon || []).indexOf(hvId()) >= 0); });
  }
  function kyTT(k) {
    var bl = D().baiLam.find(function (b) { return b.ky === k.id && b.hv === hvId(); }), p = (D().phienThi || []).find(function (x) { return x.ky === k.id && x.hv === hvId(); });
    var mo = new Date(k.moLuc).getTime(), dong = new Date(k.dongLuc).getTime(), t = now();
    if (bl) return k.congBo ? { key: 'kq', label: 'Đã công bố · ' + bl.diem + ' điểm', tone: bl.diem >= (LMS.byId('deThi', k.de).diemDat || 5) ? 'ok' : 'bad', bl: bl } : { key: 'nop', label: 'Đã nộp · chờ công bố điểm', tone: 'navy', bl: bl };
    if (p && p.trangThai === 'dinh-chi') return { key: 'dc', label: 'Bị đình chỉ', tone: 'bad' };
    if (t < mo) return { key: 'sap', label: 'Mở lúc ' + LMS.fmtDT(k.moLuc), tone: 'navy' };
    if (t <= dong && !k.ketThuc) return { key: 'mo', label: p && p.trangThai === 'dang-lam' ? 'Đang làm dở' : 'Đang mở', tone: 'info', p: p };
    return { key: 'vang', label: 'Không dự thi', tone: 'bad' };
  }
  function ksCuaToi() {
    var ids = lopCuaToi().map(function (x) { return x.l.id; });
    return (D().khaoSat || []).filter(function (k) { return k.trangThai !== 'nhap' && Array.isArray(k.cauHoi) && (k.lop ? ids.indexOf(k.lop) >= 0 : true); });
  }
  function ksDaLam(k) { return (k.phieu || []).some(function (p) { return p.hv === hvId(); }); }
  function ksMo(k) { var t = LMS.iso(LMS.TODAY); return k.trangThai === 'dang-mo' && (!k.batDau || k.batDau <= t) && (!k.ketThuc || k.ketThuc >= t); }

  /* ---------- thông báo ---------- */
  function tbCuaToi() {
    var h = hvId();
    return (D().thongBao || []).filter(function (t) { return (t.nguoiNhan || []).indexOf(h) >= 0 && (!t.trangThai || t.trangThai === 'da-gui') && !t.thuHoi; }).sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; });
  }
  function tbChuaDoc() { var h = hvId(); return tbCuaToi().filter(function (t) { return !(t.xem || {})[h]; }); }
  function docTB(t) { var h = hvId(); t.xem = t.xem || {}; if (!t.xem[h]) { t.xem[h] = new Date().toISOString(); LMS.commit(null); } }

  /* ---------- hỏi đáp ---------- */
  function hdCuaToi() { var h = hvId(); return D().hoiDap.filter(function (t) { return !t.xoa && !t.an && (t.hv === h || (t.traLoi || []).some(function (r) { return r.nguoi === h && !r.xoa; })); }); }
  function hdMoi(t) { var h = hvId(), moc = (t.hvXem || {})[h] || t.ngay; return (t.traLoi || []).filter(function (r) { return !r.xoa && r.nguoi !== h && r.ngay > moc; }).length; }

  /* ---------- việc cần làm ---------- */
  function viecCanLam() {
    var out = [];
    buoiCuaToi().forEach(function (b) { var s = LMS.buoiStatus(b).key; if (s === 'dang') out.push({ uu: 0, ic: 'video', tone: 'info', t: 'Đang diễn ra: ' + LMS.byId('lop', b.lop).ma + ' · ' + b.ten, s: (b.chuDe || '') + ' · ' + b.gio + '–' + b.den + ' · ' + b.phong, go: url('lich-hoc.html', { buoi: b.id }), cta: 'Vào phòng học' }); else if (s === 'hom-nay') out.push({ uu: 1, ic: 'cal', tone: '', t: 'Hôm nay ' + b.gio + ': ' + LMS.byId('lop', b.lop).ma + ' · ' + b.ten, s: (b.chuDe || '') + ' · ' + b.phong, go: url('lich-hoc.html', { buoi: b.id }), cta: 'Xem lịch' }); });
    kyCuaToi().forEach(function (k) { var s = kyTT(k); if (s.key === 'mo') out.push({ uu: 0, ic: 'exam', tone: 'bad', t: 'Kỳ thi đang mở: ' + k.ten, s: 'Đóng lúc ' + LMS.fmtDT(k.dongLuc), go: url('thi.html', { ky: k.id }), cta: s.p ? 'Làm tiếp' : 'Vào thi' }); else if (s.key === 'sap' && new Date(k.moLuc).getTime() - now() < 7 * 86400000) out.push({ uu: 2, ic: 'exam', tone: 'warn', t: 'Sắp thi: ' + k.ten, s: 'Mở lúc ' + LMS.fmtDT(k.moLuc), go: url('thi.html', { ky: k.id }), cta: 'Xem quy chế' }); });
    btCuaToi().forEach(function (b) { var s = btTT(b); if (s.key === 'chua' || s.key === 'muon' || s.key === 'lam-lai') out.push({ uu: s.key === 'muon' ? 1 : 2, ic: 'task', tone: s.key === 'chua' ? 'warn' : 'bad', t: (s.key === 'lam-lai' ? 'Làm lại: ' : 'Nộp bài: ') + b.ten, s: LMS.byId('lop', b.lop).ma + ' · hạn ' + LMS.fmtDT(b.hanNop) + (s.key === 'muon' ? ' · đang nhận nộp muộn' : ''), go: url('bai-tap.html', { bt: b.id }), cta: 'Làm bài' }); });
    ksCuaToi().forEach(function (k) { if (ksMo(k) && !ksDaLam(k)) out.push({ uu: 3, ic: 'form', tone: 'info', t: 'Khảo sát: ' + k.ten, s: 'Hạn ' + LMS.fmtDate(k.ketThuc) + ' · ' + (k.anDanh ? 'ẩn danh' : 'ghi tên'), go: url('khao-sat.html', { ks: k.id }), cta: 'Trả lời' }); });
    tbCuaToi().forEach(function (t) { if (t.yeuCauXacNhan && !(t.xacNhan || {})[hvId()]) out.push({ uu: 2, ic: 'bell', tone: 'warn', t: 'Xác nhận đã đọc: ' + t.tieuDe, s: LMS.fmtDT(t.ngay), go: url('thong-bao.html', { tb: t.id }), cta: 'Xem' }); });
    hdCuaToi().forEach(function (t) { var n = hdMoi(t); if (n) out.push({ uu: 3, ic: 'chat', tone: 'ok', t: n + ' trả lời mới cho câu hỏi của bạn', s: '"' + t.noiDung.slice(0, 70) + (t.noiDung.length > 70 ? '…' : '') + '"', go: url('hoi-dap.html', { hd: t.id }), cta: 'Xem' }); });
    return out.sort(function (a, b) { return a.uu - b.uu; });
  }

  /* ---------- khung trang ---------- */
  var MENU = [
    ['Học tập'],
    ['index.html', 'Tổng quan', 'home'],
    ['lop-cua-toi.html', 'Lớp của tôi', 'book', ['lop.html', 'hoc.html']],
    ['lich-hoc.html', 'Lịch học', 'cal'],
    ['bai-tap.html', 'Bài tập & kiểm tra', 'task', ['thi.html']],
    ['ket-qua.html', 'Kết quả học tập', 'grade'],
    ['Tương tác'],
    ['hoi-dap.html', 'Hỏi đáp', 'chat'],
    ['thong-bao.html', 'Thông báo', 'bell'],
    ['khao-sat.html', 'Khảo sát', 'form'],
    ['Tài khoản'],
    ['dang-ky.html', 'Đăng ký học & học phí', 'cart'],
    ['ho-so.html', 'Hồ sơ & cài đặt', 'user']
  ];
  function dem() {
    var v = { 'thong-bao.html': tbChuaDoc().length, 'khao-sat.html': ksCuaToi().filter(function (k) { return ksMo(k) && !ksDaLam(k); }).length, 'hoi-dap.html': hdCuaToi().filter(function (t) { return hdMoi(t) > 0; }).length };
    v['bai-tap.html'] = btCuaToi().filter(function (b) { var s = btTT(b).key; return s === 'chua' || s === 'muon' || s === 'lam-lai'; }).length + kyCuaToi().filter(function (k) { return kyTT(k).key === 'mo'; }).length;
    v['lich-hoc.html'] = buoiCuaToi().filter(function (b) { return LMS.buoiStatus(b).key === 'dang'; }).length;
    return v;
  }
  function shell(active, o) {
    o = o || {};
    try { localStorage.setItem('egoLmsDemo.kp', 'hv'); } catch (e) { }
    var h = me(), page = location.pathname.split('/').pop() || 'index.html', c = dem();
    document.title = (o.title ? o.title + ' · ' : '') + 'Cổng học viên · EGO LMS';
    var nav = MENU.map(function (m) {
      if (m.length === 1) return '<div class="grp">' + m[0] + '</div>';
      var on = m[0] === (active || page) || (m[3] && m[3].indexOf(active || page) >= 0), n = c[m[0]];
      return '<a href="' + m[0] + '"' + (on ? ' class="on" aria-current="page"' : '') + '>' + svg(m[2]) + '<span>' + m[1] + '</span>' + (n ? '<span class="cnt' + (m[0] === 'lich-hoc.html' ? ' warn' : '') + '">' + n + '</span>' : '') + '</a>';
    }).join('');
    var nTB = c['thong-bao.html'];
    document.body.innerHTML = '<div class="hv-shell" id="hvShell"><aside class="hv-side" aria-label="Điều hướng"><a class="hv-brand" href="index.html"><span class="logo">EGO</span><span><b>Cổng học viên</b><small>Học viện Y Dược học cổ truyền VN</small></span></a><nav class="hv-nav">' + nav + '</nav><div class="foot"><a href="kham-pha.html">' + svg('globe', 14) + ' Khám phá khóa học</a></div></aside><div class="hv-mask" id="hvMask"></div>' +
      '<div class="hv-main"><header class="hv-top"><button class="icon-btn burger" id="hvBurger" aria-label="Mở menu">' + svg('menu', 20) + '</button>' +
      '<div class="hv-search">' + svg('search') + '<input class="inp" id="hvQ" placeholder="Tìm lớp, bài giảng, bài tập, câu hỏi…" aria-label="Tìm kiếm" autocomplete="off"><div class="hv-sr" id="hvSR" hidden></div></div>' +
      '<div class="right"><div class="hv-bell" style="position:relative"><button class="icon-btn" id="hvBell" aria-label="Thông báo">' + svg('bell', 20) + (nTB ? '<span class="dot">' + nTB + '</span>' : '') + '</button><div class="hv-pop" id="hvBellPop" hidden></div></div>' +
      '<div style="position:relative"><button class="hv-user" id="hvUser"><span class="avatar">' + esc(U.initials(h.hoTen)) + '</span><span class="nm"><b>' + esc(h.hoTen) + '</b><small>' + esc(h.ma) + '</small></span></button><div class="hv-pop" id="hvUserPop" hidden style="width:240px"></div></div></div></header>' +
      '<main class="hv-page" id="app"></main></div></div>';
    var sh = document.getElementById('hvShell');
    document.getElementById('hvBurger').onclick = function () { sh.classList.add('nav-open'); };
    document.getElementById('hvMask').onclick = function () { sh.classList.remove('nav-open'); };
    timKiem(); chuong(); taiKhoan();
    return document.getElementById('app');
  }
  function dongPop(ex) { ['hvBellPop', 'hvUserPop', 'hvSR'].forEach(function (id) { if (id !== ex) { var e = document.getElementById(id); if (e) e.hidden = true; } }); }
  document.addEventListener('mousedown', function (e) { if (!e.target.closest('.hv-pop,.hv-sr,#hvBell,#hvUser,#hvQ')) dongPop(); });
  function chuong() {
    var b = document.getElementById('hvBell'), p = document.getElementById('hvBellPop');
    b.onclick = function () {
      dongPop('hvBellPop'); if (!p.hidden) { p.hidden = true; return; }
      var ds = tbCuaToi().slice(0, 6), h = hvId();
      p.innerHTML = '<div class="ph"><b>Thông báo</b><button class="lnk right" style="margin-left:auto;font-size:12px" id="hvDocHet">Đánh dấu đã đọc tất cả</button></div>' + (ds.length ? ds.map(function (t) { var l = LMS.byId('lop', t.lop); return '<a class="it' + ((t.xem || {})[h] ? '' : ' unread') + '" href="' + url('thong-bao.html', { tb: t.id }) + '"><b>' + esc(t.tieuDe) + '</b><small>' + (l ? esc(l.ma) + ' · ' : '') + LMS.fmtDT(t.ngay) + '</small></a>'; }).join('') : '<div class="empty">Chưa có thông báo</div>') + '<a class="it" href="thong-bao.html" style="text-align:center;font-weight:600;color:var(--ems-navy)">Xem tất cả thông báo</a>';
      p.hidden = false;
      document.getElementById('hvDocHet').onclick = function () { tbCuaToi().forEach(function (t) { t.xem = t.xem || {}; if (!t.xem[h]) t.xem[h] = new Date().toISOString(); }); LMS.commit(null); location.reload(); };
    };
  }
  function taiKhoan() {
    var b = document.getElementById('hvUser'), p = document.getElementById('hvUserPop');
    b.onclick = function () {
      dongPop('hvUserPop'); if (!p.hidden) { p.hidden = true; return; }
      var h = me(), tk = tkMe();
      p.innerHTML = '<div class="ph" style="flex-direction:column;align-items:flex-start"><b>' + esc(h.hoTen) + '</b><small class="muted">' + esc(tk ? tk.ten : h.ma) + ' · ' + esc(h.email) + '</small></div><a class="it" href="ho-so.html">Hồ sơ & cài đặt</a><a class="it" href="ket-qua.html?tab=cc">Chứng chỉ của tôi</a><a class="it" href="#" id="hvDoiHV">Xem với học viên khác (demo)</a><a class="it" href="#" id="hvReset">Khôi phục dữ liệu mẫu (demo)</a><a class="it" href="kham-pha.html?vai=khach">Đăng xuất</a>';
      p.hidden = false;
      document.getElementById('hvDoiHV').onclick = function (e) { e.preventDefault(); p.hidden = true; doiHV(); };
      document.getElementById('hvReset').onclick = function (e) { e.preventDefault(); p.hidden = true; U.confirm({ title: 'Khôi phục dữ liệu mẫu', message: 'Xóa mọi thao tác đã thực hiện trên trình duyệt này (cả ở Cổng quản trị) và nạp lại dữ liệu mẫu?', ok: 'Khôi phục', danger: true }).then(function (y) { if (!y) return; LMS.reset(); try { localStorage.removeItem(KHV); } catch (x) { } location.href = 'index.html'; }); };
    };
  }
  function doiHV() {
    var ds = D().hocVien.map(function (h) { var g = D().ghiDanh.filter(function (x) { return x.hv === h.id && x.trangThai !== 'thoi-hoc'; }); return { h: h, g: g }; }).filter(function (x) { return x.g.length; });
    var api = U.modal({ title: 'Xem cổng với học viên khác', body: '<div class="field"><input class="inp" id="dq" placeholder="Tìm theo tên, mã học viên hoặc lớp"></div><div id="dl" style="max-height:52vh;overflow:auto;margin-top:8px"></div>', noFocus: false, foot: [{ label: 'Đóng', close: true }] });
    function ve(q) { var n = U.norm(q); api.body.querySelector('#dl').innerHTML = ds.filter(function (x) { return !n || U.norm(x.h.hoTen + ' ' + x.h.ma + ' ' + x.g.map(function (g) { return LMS.name('lop', g.lop, 'ma'); }).join(' ')).indexOf(n) >= 0; }).slice(0, 60).map(function (x) { return '<button class="hv-user" style="width:100%;border-bottom:1px solid var(--ems-border);border-radius:0;padding:8px" data-hv="' + x.h.id + '"><span class="avatar">' + esc(U.initials(x.h.hoTen)) + '</span><span><b>' + esc(x.h.hoTen) + (x.h.id === hvId() ? ' · đang xem' : '') + '</b><small>' + esc(x.h.ma) + ' · ' + x.g.map(function (g) { return LMS.name('lop', g.lop, 'ma') + ' ' + TT_GD[g.trangThai][0].toLowerCase(); }).join(', ') + '</small></span></button>'; }).join(''); api.body.querySelectorAll('[data-hv]').forEach(function (b) { b.onclick = function () { try { localStorage.setItem(KHV, b.dataset.hv); } catch (e) { } location.href = 'index.html'; }; }); }
    api.body.querySelector('#dq').oninput = function (e) { ve(e.target.value); }; ve('');
  }
  function timKiem() {
    var inp = document.getElementById('hvQ'), box = document.getElementById('hvSR'), timer;
    inp.oninput = function () { clearTimeout(timer); timer = setTimeout(chay, 120); };
    inp.onfocus = function () { if (inp.value.trim()) chay(); };
    inp.onkeydown = function (e) { if (e.key === 'Escape') { box.hidden = true; inp.blur(); } if (e.key === 'Enter') { var a = box.querySelector('a'); if (a) location.href = a.getAttribute('href'); } };
    function chay() {
      var q = U.norm(inp.value.trim()); if (q.length < 2) { box.hidden = true; return; }
      var g = [];
      var lops = lopCuaToi().filter(function (x) { return U.norm(x.l.ma + ' ' + x.l.ten).indexOf(q) >= 0; }).slice(0, 4).map(function (x) { return '<a href="' + url('lop.html', { lop: x.l.id }) + '">' + U.hl(x.l.ten, inp.value) + '<small>' + esc(x.l.ma) + ' · ' + TT_GD[x.g.trangThai][0] + '</small></a>'; });
      if (lops.length) g.push('<div class="g">Lớp</div>' + lops.join(''));
      var bais = []; lopCuaToi().forEach(function (x) { baiCua(x.l).forEach(function (b, i) { if (U.norm(b.ten).indexOf(q) >= 0) bais.push('<a href="' + (baiState(x.l, i) === 'khoa' ? url('lop.html', { lop: x.l.id, tab: 'bai' }) : url('hoc.html', { lop: x.l.id, bai: b.id })) + '">' + U.hl(b.ten, inp.value) + '<small>' + esc(x.l.ma) + (baiState(x.l, i) === 'khoa' ? ' · chưa mở' : baiState(x.l, i) === 'xong' ? ' · đã học' : ' · đang học') + '</small></a>'); }); });
      if (bais.length) g.push('<div class="g">Bài giảng</div>' + bais.slice(0, 6).join(''));
      var bts = btCuaToi().filter(function (b) { return U.norm(b.ma + ' ' + b.ten).indexOf(q) >= 0; }).slice(0, 4).map(function (b) { return '<a href="' + url('bai-tap.html', { bt: b.id }) + '">' + U.hl(b.ten, inp.value) + '<small>' + esc(b.ma) + ' · ' + btTT(b).label + '</small></a>'; });
      if (bts.length) g.push('<div class="g">Bài tập</div>' + bts.join(''));
      var hds = D().hoiDap.filter(function (t) { return !t.xoa && !t.an && duocVao(t.lop) && (!t.rieng || t.hv === hvId()) && U.norm(t.noiDung).indexOf(q) >= 0; }).slice(0, 4).map(function (t) { return '<a href="' + url('hoi-dap.html', { hd: t.id }) + '">' + U.hl(t.noiDung.slice(0, 90), inp.value) + '<small>' + esc(LMS.name('lop', t.lop, 'ma')) + ' · ' + (t.traLoi || []).filter(function (r) { return !r.xoa; }).length + ' trả lời</small></a>'; });
      if (hds.length) g.push('<div class="g">Hỏi đáp</div>' + hds.join(''));
      box.innerHTML = g.length ? g.join('') : '<div class="empty" style="padding:16px">Không tìm thấy kết quả cho "' + esc(inp.value.trim()) + '"</div>';
      dongPop('hvSR'); box.hidden = false;
    }
  }
  function tabs(host, list, cur, onPick) {
    host.innerHTML = '<div class="tabs" role="tablist">' + list.map(function (t) { return '<button class="tab' + (t[0] === cur ? ' on' : '') + '" role="tab" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
    host.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { onPick(b.dataset.t); }; });
  }

  window.HV = { svg: svg, id: hvId, me: me, tk: tkMe, qp: qp, url: url, TT_GD: TT_GD, HT: HT, gds: gds, gdLop: gdLop, lopCuaToi: lopCuaToi, dangHoc: dangHoc, duocVao: duocVao, gvTen: gvTen, coverCls: coverCls,
    td: td, tdGhi: tdGhi, baiCua: baiCua, baiState: baiState, tieuChi: tieuChi, quizKhoi: quizKhoi, videoKhoi: videoKhoi, dieuKienBai: dieuKienBai, tienDoLop: tienDoLop, paQuiz: paQuiz,
    buoiCuaToi: buoiCuaToi, ddCuaToi: ddCuaToi, vaoPhong: vaoPhong, btCuaToi: btCuaToi, btTT: btTT, kyCuaToi: kyCuaToi, kyTT: kyTT, ksCuaToi: ksCuaToi, ksDaLam: ksDaLam, ksMo: ksMo,
    tbCuaToi: tbCuaToi, tbChuaDoc: tbChuaDoc, docTB: docTB, hdCuaToi: hdCuaToi, hdMoi: hdMoi, viecCanLam: viecCanLam, shell: shell, tabs: tabs };
})();
