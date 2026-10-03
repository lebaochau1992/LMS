/* EGO LMS · Buổi học & điểm danh — thao tác dùng chung cho màn Lớp học (tab Buổi học) và màn Lịch buổi học.
   Hai màn gọi cùng một bộ hộp thoại nên quy tắc, kiểm tra trùng lịch và nhật ký thao tác luôn thống nhất.
   ctx: { vaiTro: 'pdt' | 'gv', gv: mã giảng viên khi vaiTro = 'gv', onDone: hàm vẽ lại màn gọi } */
(function () {
  'use strict';
  var U = LMS.ui, esc = U.esc;
  function D() { return LMS.db; }
  var TT = { co: ['Có mặt', 'ok'], vang: ['Vắng', 'bad'], phep: ['Có phép', 'warn'] };
  var PHONG = ['Phòng học trực tuyến 01', 'Phòng học trực tuyến 02', 'Phòng học trực tuyến 03', 'Phòng học trực tuyến 04', 'Phòng học trực tuyến 05'];

  (function css() {
    if (document.getElementById('bh-css')) return;
    var st = document.createElement('style'); st.id = 'bh-css';
    st.textContent =
      '.lnk{background:none;border:0;padding:0;font:inherit;color:var(--ems-navy);cursor:pointer;font-weight:600;text-align:left}.lnk:hover{text-decoration:underline}.txt-bad{color:var(--ems-danger)}' +
      '.bh-head{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}.bh-head .grow{min-width:0}' +
      '.bh-chips{display:flex;gap:6px;flex-wrap:wrap;align-items:center}' +
      '.bh-rule{font-size:12px;color:var(--ems-text-2);background:var(--ems-surface-2);border:1px solid var(--ems-border);border-radius:var(--r-ctl);padding:8px 10px}' +
      '.bh-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
      '.bh-list{border:1px solid var(--ems-border);border-radius:var(--r-ctl);max-height:52vh;overflow:auto}' +
      '.bh-list table{width:100%;border-collapse:collapse;font-size:13px}' +
      '.bh-list th{position:sticky;top:0;z-index:1;background:var(--ems-surface-2);color:var(--ems-text-2);font-size:12px;font-weight:600;text-align:left;padding:8px 10px;border-bottom:1px solid var(--ems-border);white-space:nowrap}' +
      '.bh-list td{padding:8px 10px;border-bottom:1px solid var(--ems-border);vertical-align:top}' +
      '.bh-list tr:last-child td{border-bottom:0}.bh-list tr.dc td{background:var(--ems-warning-bg)}' +
      '.bh-log{white-space:nowrap;font-variant-numeric:tabular-nums}.bh-log .bar{width:90px;display:inline-block;vertical-align:middle;margin-right:6px}' +
      '.bh-log .bar span{display:block;height:100%;background:var(--ems-success)}.bh-log .bar.bad span{background:var(--ems-danger)}' +
      '.bh-flag{display:inline-block;font-size:11px;font-weight:600;border-radius:4px;padding:0 5px;margin:2px 4px 0 0;background:var(--ems-surface-2);color:var(--ems-text-2);border:1px solid var(--ems-border)}' +
      '.bh-flag.warn{background:var(--ems-warning-bg);color:var(--ems-warning);border-color:var(--ems-warning-line)}' +
      '.bh-flag.info{background:var(--ems-navy-soft);color:var(--ems-navy);border-color:var(--ems-navy-line)}' +
      '.bh-xp{font-size:12px;margin-top:4px;color:var(--ems-text-2)}.bh-xp .btn{margin-top:4px}' +
      '.bh-res{white-space:nowrap;min-width:190px}.bh-res .seg button{padding:4px 8px;white-space:nowrap}.bh-res .seg button.on[data-v=vang]{background:var(--ems-danger)}.bh-res .seg button.on[data-v=phep]{background:var(--ems-warning)}.bh-res .seg button.on[data-v=co]{background:var(--ems-success)}' +
      '.bh-res .inp{margin-top:6px;width:100%;font-size:12px;padding:5px 8px}' +
      '.bh-note{font-size:12px;color:var(--ems-muted);margin-top:4px;max-width:260px}' +
      '.thu-list{display:flex;gap:6px;flex-wrap:wrap}.thu-list label{border:1px solid var(--ems-border-strong);border-radius:var(--r-ctl);padding:5px 10px;font-size:13px;cursor:pointer;display:inline-flex;gap:5px;align-items:center}' +
      '.bh-sub{margin-top:10px;padding:10px 12px;border:1px dashed var(--ems-border-strong);border-radius:var(--r-ctl)}' +
      '@media (max-width:700px){.bh-list th:nth-child(1),.bh-list td:nth-child(1){display:none}}';
    document.head.appendChild(st);
  })();

  /* ---------- tiện ích ---------- */
  function lopOf(b) { return LMS.byId('lop', b.lop); }
  function gvTen(id) { var g = LMS.byId('giangVien', id); return g ? g.hoTen : '—'; }
  function thu(s) { return LMS.THU[LMS.parse(s).getDay()]; }
  function ngayGio(b) { return thu(b.ngay) + ' ' + LMS.fmtDate(b.ngay) + ' · ' + b.gio + '–' + b.den; }
  function copy(o) { return JSON.parse(JSON.stringify(o || {})); }
  function ctxOf(ctx) {
    ctx = ctx || {};
    if (ctx.vaiTro === 'gv') { ctx.id = ctx.gv; ctx.ten = gvTen(ctx.gv); }
    else { ctx.vaiTro = 'pdt'; ctx.id = D().meta.user.ten; ctx.ten = D().meta.user.hoTen; }
    return ctx;
  }
  function daBatDau(b) { return Date.now() >= LMS.buoiMoc(b).bd.getTime(); }
  function daKetThuc(b) { return Date.now() >= LMS.buoiMoc(b).kt.getTime(); }
  function nguoiChot(c) { if (!c) return ''; if (c.boi === 'he-thong') return 'hệ thống tự chốt'; var g = LMS.byId('giangVien', c.boi); return g ? 'GV ' + g.hoTen : (c.ten || c.boi); }
  function dem(b) {
    if (!b.diemDanh) return null;
    var o = { co: 0, vang: 0, phep: 0, tong: 0 }; Object.keys(b.diemDanh).forEach(function (k) { o[b.diemDanh[k]]++; o.tong++; });
    o.pct = o.tong ? Math.round(o.co / o.tong * 100) : null; o.dc = Object.keys(b.dieuChinh || {}).length; return o;
  }
  function choDuyet(b) { return Object.keys(b.xinPhep || {}).filter(function (k) { return b.xinPhep[k].tt === 'cho'; }).length; }
  function trongPhong(b) { return b.thamGia ? Object.keys(b.thamGia).filter(function (k) { return !b.thamGia[k].ra; }).length : 0; }
  function quyTacText() { var c = LMS.cfgDD(); return 'Có mặt khi tham gia phòng học từ ' + c.nguong + '% thời lượng buổi; vào sau ' + c.muon + ' phút tính đi muộn. Học viên có đơn xin vắng được duyệt và không đủ thời lượng tính Có phép. Giảng viên xác nhận trong ' + c.hanXN + ' giờ sau buổi học' + (c.tuDongChot ? ', quá hạn hệ thống tự chốt theo kết quả tự động.' : '.'); }
  function thongBaoLop(lop, tieuDe, noiDung) {
    var ids = D().ghiDanh.filter(function (g) { return g.lop === lop.id && g.trangThai !== 'thoi-hoc'; }).map(function (g) { return g.hv; });
    D().thongBao.push({ id: LMS.nextId('tb'), lop: lop.id, loai: 'lich-hoc', tieuDe: tieuDe, noiDung: noiDung, nguoiNhan: ids, ngay: new Date().toISOString(), nguoiGui: D().meta.user.ten, trangThai: 'da-gui', henGio: null, ghim: false, kenh: { portal: true, email: true }, yeuCauXacNhan: false, dinhKem: [], xem: {}, xacNhan: {}, thuHoi: null });
    return ids.length;
  }

  /* ---------- ô hiển thị dùng trong bảng ---------- */
  function oTrangThai(b) { var s = LMS.buoiStatus(b); return U.badge(s.label, s.tone) + (s.sub ? '<div class="t-sub' + (s.key === 'chua-dd' ? ' txt-bad' : '') + '">' + esc(s.sub) + '</div>' : ''); }
  function oDiemDanh(b) {
    var s = LMS.buoiStatus(b).key;
    if (s === 'dang') return '<b>' + trongPhong(b) + '</b>/' + LMS.hvBuoi(b).length + '<div class="t-sub">đang trong phòng</div>';
    var d = dem(b); if (!d) { var n = choDuyet(b); return n ? '<span class="small" style="color:var(--ems-warning)">' + n + ' đơn xin vắng</span>' : '<span class="muted">—</span>'; }
    return '<b>' + d.co + '</b>/' + d.tong + '<div class="t-sub">' + d.pct + '%' + (d.phep ? ' · ' + d.phep + ' có phép' : '') + (d.dc ? ' · ' + d.dc + ' điều chỉnh' : '') + '</div>';
  }
  function hanhDongChinh(b) {
    var k = LMS.buoiStatus(b).key;
    if (k === 'dang') return { label: 'Theo dõi', cls: '' };
    if (k === 'cho-xn') return { label: 'Rà soát', cls: 'primary' };
    if (k === 'chua-dd') return { label: 'Điểm danh', cls: 'primary' };
    if (k === 'xong') return { label: 'Xem', cls: '' };
    if ((k === 'sap' || k === 'hom-nay') && choDuyet(b)) return { label: 'Duyệt đơn vắng', cls: '' };
    return null;
  }

  /* ---------- chi tiết buổi: theo dõi, rà soát, xác nhận điểm danh ---------- */
  function chiTiet(b, ctx) {
    ctx = ctxOf(ctx);
    var l = lopOf(b), st = LMS.buoiStatus(b), key = st.key;
    var mode = key === 'dang' ? 'live' : (key === 'sap' || key === 'hom-nay') ? 'truoc' : key === 'chua-dd' ? 'thu-cong' : key === 'huy' ? 'huy' : 'ra-soat';
    var laChu = ctx.vaiTro === 'pdt' || b.gv === ctx.gv;
    var m = copy(b.diemDanh), xp = copy(b.xinPhep), ghiChu = {}, sauChot = false, loc = 'all', q = '', doi = false;
    Object.keys(b.dieuChinh || {}).forEach(function (h) { ghiChu[h] = b.dieuChinh[h].ghiChu; });
    var hvs = LMS.hvBuoi(b).map(function (h) { return LMS.byId('hocVien', h); }).filter(Boolean);
    function suaDuoc() { if (!laChu) return false; if (mode === 'thu-cong') return !b.chot || sauChot; if (mode === 'ra-soat') return !b.chot || sauChot; return false; }
    function auto(h) { return mode === 'thu-cong' ? null : LMS.ddTuDong(b, h, xp); }
    function canRaSoat(h) { var a = auto(h), x = xp[h]; if (x && x.tt === 'cho') return true; if (!a) return !m[h]; return a.muon || a.thieu || a.tt === 'vang' || (m[h] && m[h] !== a.tt); }

    var api = U.modal({
      title: (mode === 'truoc' ? 'Buổi học · ' : mode === 'live' ? 'Theo dõi buổi học · ' : 'Điểm danh · ') + l.ma + ' · ' + b.ten, size: 'lg', body: '<div></div>', noFocus: true,
      foot: [
        { label: 'Đóng', close: true },
        { id: 'bhRefresh', label: 'Làm mới', onClick: function () { paint(); return false; } },
        { id: 'bhAdj', label: 'Điều chỉnh sau chốt', onClick: function () { sauChot = true; paint(); return false; } },
        { id: 'bhSaveXP', label: 'Lưu đơn xin vắng', cls: 'primary', onClick: function () { return luuXP(); } },
        { id: 'bhSave', label: 'Lưu rà soát', onClick: function () { return luu(false); } },
        { id: 'bhOk', label: 'Xác nhận điểm danh', cls: 'primary', onClick: function () { return luu(true); } }
      ]
    });
    function show(id, on) { var e = api.el.querySelector('#' + id); if (e) e.style.display = on ? '' : 'none'; }

    function paint() {
      var s = LMS.buoiStatus(b), cfg = LMS.cfgDD(), tl = LMS.thoiLuongBuoi(b), sua = suaDuoc();
      var h = '<div class="stack" style="gap:10px">';
      h += '<div class="bh-head"><div class="grow"><div><b>' + esc(l.ma) + ' · ' + esc(b.ten) + '</b>' + (b.chuDe ? ' · ' + esc(b.chuDe) : '') + '</div><div class="small muted">' + esc(ngayGio(b)) + ' · GV ' + esc(gvTen(b.gv)) + ' · ' + esc(b.phong) + '</div></div>' + U.badge(s.label, s.tone) + '</div>';
      if (mode === 'huy') { h += '<div class="note">Buổi đã hủy' + (b.lyDoHuy ? ': ' + esc(b.lyDoHuy) : '') + '</div></div>'; api.body.innerHTML = h; ['bhRefresh', 'bhAdj', 'bhSaveXP', 'bhSave', 'bhOk'].forEach(function (x) { show(x, false); }); return; }
      if (mode === 'ra-soat' || mode === 'live') h += '<div class="bh-rule">' + esc(quyTacText()) + ' Buổi ' + tl + ' phút → cần tối thiểu ' + Math.ceil(tl * cfg.nguong / 100) + ' phút.</div>';
      if (mode === 'thu-cong') h += '<div class="note warn">Buổi không có nhật ký phòng học trực tuyến (' + (b.loiPhong ? 'sự cố phòng học' : 'buổi dạy ngoài phòng học hệ thống') + '). Giảng viên điểm danh thủ công và xác nhận.</div>';
      if (b.chot) h += '<div class="note ok">Đã chốt ' + esc(nguoiChot(b.chot)) + ' lúc ' + LMS.fmtDT(b.chot.luc) + (b.chot.sua ? ' · điều chỉnh sau chốt ' + LMS.fmtDT(b.chot.sua) : '') + '.' + (ctx.vaiTro === 'gv' ? ' Cần sửa, liên hệ Phòng đào tạo.' : '') + '</div>';
      if (sauChot) h += '<div class="note warn">Đang điều chỉnh sau chốt: mỗi thay đổi cần ghi lý do, thao tác được lưu nhật ký.</div>';
      if (!laChu && mode !== 'truoc') h += '<div class="note info">Chỉ giảng viên dạy buổi này và Phòng đào tạo được rà soát điểm danh.</div>';

      /* tổng hợp */
      var c = { co: 0, vang: 0, phep: 0, muon: 0, thieu: 0, dc: 0, chua: 0, trong: 0, roi: 0, chuaVao: 0, xpCho: 0 };
      hvs.forEach(function (hv) {
        var a = auto(hv.id), r = mode === 'live' ? null : (m[hv.id] || (a ? a.tt : null));
        if (xp[hv.id] && xp[hv.id].tt === 'cho') c.xpCho++;
        if (mode === 'live') { if (!a.vao) c.chuaVao++; else if (a.trongPhong) c.trong++; else c.roi++; return; }
        if (mode === 'truoc') return;
        if (!r) { c.chua++; return; }
        c[r]++; if (a && a.muon && r === 'co') c.muon++; if (a && a.thieu) c.thieu++; if (a && r !== a.tt) c.dc++;
      });
      if (mode === 'live') h += '<div class="bh-chips">' + U.badge('Trong phòng ' + c.trong, 'info') + U.badge('Đã rời ' + c.roi, '') + U.badge('Chưa vào ' + c.chuaVao, c.chuaVao ? 'warn' : '') + '<span class="small muted">Kết quả tạm tính, hệ thống chốt nhật ký khi buổi kết thúc lúc ' + b.den + '.</span></div>';
      else if (mode === 'truoc') h += '<div class="bh-chips"><span class="small muted">' + hvs.length + ' học viên · điểm danh tự động khi buổi học bắt đầu.</span>' + (c.xpCho ? U.badge(c.xpCho + ' đơn xin vắng chờ duyệt', 'warn') : '') + '</div>';
      else h += '<div class="bh-chips">' + U.badge('Có mặt ' + c.co, 'ok') + (c.muon ? '<span class="small muted">trong đó muộn ' + c.muon + '</span>' : '') + U.badge('Vắng ' + c.vang, 'bad') + (c.thieu ? '<span class="small muted">' + c.thieu + ' chưa đủ thời lượng</span>' : '') + U.badge('Có phép ' + c.phep, 'warn') + (c.dc ? U.badge(c.dc + ' điều chỉnh', 'navy') : '') + (c.xpCho ? U.badge(c.xpCho + ' đơn chờ duyệt', 'warn') : '') + (c.chua ? U.badge('Chưa chọn ' + c.chua, '') : '') + '</div>';

      /* lọc */
      var nCan = hvs.filter(function (hv) { return canRaSoat(hv.id); }).length;
      h += '<div class="bh-tools">';
      if (mode === 'ra-soat' || mode === 'thu-cong') h += '<div class="seg" data-loc>' + [['all', 'Tất cả ' + hvs.length], ['can', 'Cần rà soát ' + nCan], ['co', 'Có mặt'], ['vang', 'Vắng'], ['phep', 'Có phép']].map(function (x) { return '<button type="button" data-v="' + x[0] + '"' + (loc === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join('') + '</div>';
      h += '<input class="inp" data-q placeholder="Tìm học viên" value="' + esc(q) + '" style="max-width:220px">';
      if (mode === 'thu-cong' && sua) h += '<button class="btn sm right" data-allco>Tất cả có mặt</button>';
      h += '</div>';

      var nq = U.norm(q);
      var rows = hvs.filter(function (hv) {
        if (nq && U.norm(hv.hoTen + ' ' + hv.ma).indexOf(nq) < 0) return false;
        if (loc === 'can') return canRaSoat(hv.id);
        if (loc === 'co' || loc === 'vang' || loc === 'phep') { var a = auto(hv.id); return (m[hv.id] || (a && a.tt)) === loc; }
        return true;
      });
      if (mode === 'truoc') rows.sort(function (x, y) { return (xp[y.id] ? 1 : 0) - (xp[x.id] ? 1 : 0); });
      h += '<div class="bh-list"><table><thead><tr><th>#</th><th>Học viên</th>' + (mode === 'truoc' ? '<th>Đơn xin vắng</th>' : '<th>Nhật ký phòng học</th><th>' + (mode === 'live' ? 'Hiện tại' : 'Hệ thống ghi nhận') + '</th>' + (mode === 'live' ? '' : '<th>Kết quả điểm danh</th>')) + '</tr></thead><tbody>';
      rows.forEach(function (hv) {
        var i = hvs.indexOf(hv) + 1, a = auto(hv.id), x = xp[hv.id], r = m[hv.id] || (a ? a.tt : ''), doiKQ = a && r && r !== a.tt;
        h += '<tr' + (doiKQ ? ' class="dc"' : '') + '><td class="small muted num">' + i + '</td><td>' + U.person(hv.hoTen, '<span class="mono">' + esc(hv.ma) + '</span>') + '</td>';
        if (mode === 'truoc') { h += '<td>' + oXinPhep(hv.id, x, true) + '</td></tr>'; return; }
        /* nhật ký */
        if (!a) h += '<td class="small muted">Không có dữ liệu</td>';
        else if (!a.vao) h += '<td class="small muted">Không vào phòng</td>';
        else h += '<td class="bh-log"><div>' + a.vao + ' – ' + (a.trongPhong ? '<span style="color:var(--ems-info)">đang trong phòng</span>' : a.ra) + (a.lan > 1 ? ' · ' + a.lan + ' lần vào' : '') + '</div><div class="small"><span class="bar' + (a.pct < cfg.nguong ? ' bad' : '') + '"><span style="width:' + a.pct + '%"></span></span>' + a.phut + ' phút · ' + a.pct + '%</div></td>';
        /* hệ thống */
        if (mode === 'live') { h += '<td>' + (a.trongPhong ? U.badge('Trong phòng', 'info') : a.vao ? U.badge('Đã rời phòng', '') : U.badge('Chưa vào phòng', 'warn')) + '<div>' + (a.vao && LMS.hm2m(a.vao) - LMS.hm2m(b.gio) > cfg.muon ? '<span class="bh-flag warn">vào muộn ' + (LMS.hm2m(a.vao) - LMS.hm2m(b.gio)) + ' phút</span>' : '') + '</div>' + oXinPhep(hv.id, x, laChu) + '</td></tr>'; return; }
        if (!a) h += '<td class="small muted">—' + oXinPhep(hv.id, x, sua) + '</td>';
        else h += '<td>' + U.badge(TT[a.tt][0], TT[a.tt][1]) + '<div>' + (a.muon ? '<span class="bh-flag warn">muộn ' + a.muon + ' phút</span>' : '') + (a.thieu ? '<span class="bh-flag warn">chưa đủ ' + cfg.nguong + '%</span>' : '') + '</div>' + oXinPhep(hv.id, x, sua || (mode === 'live' && laChu)) + '</td>';
        if (mode === 'live') { h += '</tr>'; return; }
        /* kết quả */
        h += '<td class="bh-res">';
        if (sua) {
          h += '<div class="seg" data-hv="' + esc(hv.id) + '">' + ['co', 'vang', 'phep'].map(function (v) { return '<button type="button" data-v="' + v + '"' + (r === v ? ' class="on"' : '') + '>' + TT[v][0] + '</button>'; }).join('') + '</div>';
          if (doiKQ) h += '<input class="inp" data-gc="' + esc(hv.id) + '" maxlength="200" placeholder="Lý do điều chỉnh (bắt buộc)" value="' + esc(ghiChu[hv.id] || '') + '">';
        } else {
          h += r ? U.badge(TT[r][0], TT[r][1]) : '<span class="muted">—</span>';
          var dc = (b.dieuChinh || {})[hv.id];
          if (dc) h += '<div class="bh-note">Điều chỉnh từ ' + TT[dc.tu][0].toLowerCase() + ': ' + esc(dc.ghiChu) + '</div>';
        }
        h += '</td></tr>';
      });
      if (!rows.length) h += '<tr><td colspan="5" class="muted" style="text-align:center;padding:18px">' + (hvs.length ? 'Không có học viên phù hợp' : 'Lớp chưa có học viên') + '</td></tr>';
      h += '</tbody></table></div><div class="note bad" data-err hidden></div></div>';
      api.body.innerHTML = h;

      show('bhRefresh', mode === 'live');
      show('bhSaveXP', (mode === 'truoc' || mode === 'live') && laChu && doi);
      show('bhSave', sua && !b.chot && mode === 'ra-soat');
      show('bhOk', sua);
      var ok = api.el.querySelector('#bhOk'); if (ok) ok.textContent = sauChot ? 'Lưu điều chỉnh' : 'Xác nhận điểm danh';
      show('bhAdj', !!b.chot && !sauChot && ctx.vaiTro === 'pdt' && (mode === 'ra-soat' || mode === 'thu-cong'));

      var B = api.body;
      B.querySelectorAll('[data-loc] button').forEach(function (x) { x.onclick = function () { loc = x.dataset.v; paint(); }; });
      var qi = B.querySelector('[data-q]'); qi.oninput = function () { q = qi.value; var p = qi.selectionStart; paint(); var n = api.body.querySelector('[data-q]'); n.focus(); n.setSelectionRange(p, p); };
      var all = B.querySelector('[data-allco]'); if (all) all.onclick = function () { hvs.forEach(function (hv) { m[hv.id] = 'co'; }); paint(); };
      B.querySelectorAll('[data-hv] button').forEach(function (x) { x.onclick = function () { m[x.parentNode.dataset.hv] = x.dataset.v; paint(); }; });
      B.querySelectorAll('[data-gc]').forEach(function (x) { x.oninput = function () { ghiChu[x.dataset.gc] = x.value; }; });
      B.querySelectorAll('[data-xp]').forEach(function (x) { x.onclick = function () {
        var h2 = x.dataset.xp, v = x.dataset.act, cu = xp[h2];
        if (v === 'duyet' || v === 'tu-choi') { cu.tt = v; cu.boi = ctx.id; cu.xuLy = new Date().toISOString(); doi = true;
          if (mode === 'ra-soat' || mode === 'thu-cong') { var a2 = auto(h2); if (!(b.dieuChinh || {})[h2]) m[h2] = a2 ? a2.tt : (v === 'duyet' ? 'phep' : m[h2]); }
        }
        paint(); }; });
    }
    function oXinPhep(h, x, choSua) {
      if (!x) return mode === 'truoc' ? '<span class="muted small">—</span>' : '';
      var tt = x.tt === 'cho' ? '<span class="bh-flag warn">đơn xin vắng chờ duyệt</span>' : x.tt === 'duyet' ? '<span class="bh-flag info">đơn xin vắng đã duyệt</span>' : '<span class="bh-flag">đơn xin vắng bị từ chối</span>';
      var s = '<div class="bh-xp">' + tt + '<div>' + esc(x.lyDo) + ' · gửi ' + LMS.fmtDT(x.luc) + '</div>';
      if (x.tt === 'cho' && choSua) s += '<div class="row" style="gap:6px"><button class="btn sm" data-xp="' + esc(h) + '" data-act="duyet">Duyệt</button><button class="btn sm" data-xp="' + esc(h) + '" data-act="tu-choi">Từ chối</button></div>';
      return s + '</div>';
    }
    function luuXP() {
      b.xinPhep = xp;
      var n = Object.keys(xp).filter(function (k) { return xp[k].xuLy && xp[k].boi === ctx.id; }).length;
      LMS.commit('Duyệt đơn xin vắng', 'Buổi học', l.ma + ' · ' + b.ten + ' · ' + n + ' đơn · ' + ctx.ten);
      U.toast('Đã lưu ' + n + ' đơn xin vắng', 'ok'); if (ctx.onDone) ctx.onDone();
    }
    function luu(xacNhan) {
      var err = api.body.querySelector('[data-err]'), thieu = [], khongLyDo = [], doiSo = 0, out = {}, dcMoi = {};
      hvs.forEach(function (hv) {
        var a = auto(hv.id), r = m[hv.id] || (a ? a.tt : null);
        if (!r) { thieu.push(hv.hoTen); return; }
        out[hv.id] = r;
        if (a && r !== a.tt) { doiSo++; var g = (ghiChu[hv.id] || '').trim(); if (!g) khongLyDo.push(hv.hoTen); var cu = (b.dieuChinh || {})[hv.id]; dcMoi[hv.id] = cu && cu.den === r && cu.ghiChu === g ? cu : { tu: a.tt, den: r, ghiChu: g, boi: ctx.id, luc: new Date().toISOString() }; }
      });
      if (thieu.length) { err.hidden = false; err.textContent = 'Còn ' + thieu.length + ' học viên chưa chọn kết quả: ' + thieu.slice(0, 3).join(', ') + (thieu.length > 3 ? '…' : ''); return false; }
      if (khongLyDo.length) { loc = 'can'; paint(); err = api.body.querySelector('[data-err]'); err.hidden = false; err.textContent = 'Nhập lý do điều chỉnh cho ' + khongLyDo.length + ' học viên có kết quả khác hệ thống ghi nhận: ' + khongLyDo.slice(0, 3).join(', ') + (khongLyDo.length > 3 ? '…' : ''); var f = api.body.querySelector('[data-gc]'); if (f) f.focus(); return false; }
      var d0 = dem(b), truoc = d0 ? { coMat: d0.co, vang: d0.vang, coPhep: d0.phep } : null;
      b.diemDanh = out; b.dieuChinh = dcMoi; b.xinPhep = xp; if (mode === 'thu-cong') b.thuCong = true;
      var d = dem(b), hanhDong;
      if (sauChot) { b.chot.sua = new Date().toISOString(); hanhDong = 'Điều chỉnh sau chốt'; }
      else if (xacNhan) { b.chot = { boi: ctx.vaiTro === 'gv' ? ctx.gv : ctx.id, ten: ctx.ten, luc: new Date().toISOString() }; hanhDong = mode === 'thu-cong' ? 'Điểm danh thủ công' : 'Xác nhận điểm danh'; }
      else hanhDong = 'Lưu rà soát điểm danh';
      LMS.commit(hanhDong, 'Buổi học', l.ma + ' · ' + b.ten + ' · có mặt ' + d.co + '/' + d.tong + (doiSo ? ' · ' + doiSo + ' điều chỉnh' : '') + ' · ' + ctx.ten, truoc, { coMat: d.co, vang: d.vang, coPhep: d.phep });
      U.toast(sauChot ? 'Đã lưu điều chỉnh sau chốt' : xacNhan ? 'Đã xác nhận điểm danh ' + b.ten + ' – ' + l.ma : 'Đã lưu rà soát, chưa chốt', 'ok');
      if (ctx.onDone) ctx.onDone();
    }
    paint();
    if (mode === 'ra-soat' && !b.chot && laChu) { loc = 'can'; paint(); }
    return api;
  }

  /* ---------- kiểm tra trùng lịch ---------- */
  function trungLich(lopId, gv, ngay, gio, den, selfId) {
    var a = LMS.hm2m(gio), z = LMS.hm2m(den), out = [];
    D().buoiHoc.forEach(function (x) {
      if (x.id === selfId || x.huy || x.ngay !== ngay) return;
      if (!(LMS.hm2m(x.gio) < z && a < LMS.hm2m(x.den))) return;
      var l = lopOf(x);
      if (x.lop === lopId) out.push('Lớp đã có ' + x.ten + ' (' + x.gio + '–' + x.den + ')');
      else if (x.gv === gv) out.push('GV ' + gvTen(gv) + ' đang dạy ' + (l ? l.ma : '') + ' · ' + x.ten + ' (' + x.gio + '–' + x.den + ')');
    });
    return out;
  }
  function lopChonDuoc() { return D().lop.filter(function (l) { return l.trangThai !== 'huy' && l.trangThai !== 'ket-thuc' && LMS.coDiemDanh(l); }); }
  function gvOpts(lop, sel) { return U.opts((lop ? lop.giangVien : []).map(function (id) { return LMS.byId('giangVien', id); }).filter(Boolean), 'id', function (g) { return g.hoTen; }, sel, '— Chọn giảng viên —'); }
  function chuDeList(lop) { var hp = lop ? LMS.hocPhanOfLop(lop) : null; return hp ? hp.bai.map(function (x) { return typeof x === 'string' ? x : x.ten; }) : []; }

  /* ---------- thêm / sửa buổi ---------- */
  function form(b, opt) {
    opt = opt || {};
    var isNew = !b, lop0 = b ? lopOf(b) : (opt.lop ? LMS.byId('lop', opt.lop) : null);
    var khoaGio = b && daBatDau(b);
    var body = '<div class="form-grid">' +
      (isNew && !opt.lop ? '<div class="field full"><label>Lớp <span class="req">*</span></label><select class="sel" name="lop">' + U.opts(lopChonDuoc(), 'id', function (l) { return l.ma + ' · ' + l.ten; }, lop0 ? lop0.id : '', '— Chọn lớp —') + '</select><div class="hint" data-lophint></div></div>'
        : '<div class="field full"><label>Lớp</label><input class="inp" readonly value="' + esc(lop0.ma + ' · ' + lop0.ten + (b ? ' · ' + b.ten : '')) + '"><div class="hint">Thời gian lớp: ' + LMS.fmtDate(lop0.batDau) + ' – ' + LMS.fmtDate(lop0.ketThuc) + '</div></div>') +
      '<div class="field full"><label>Chủ đề buổi học</label><input class="inp" name="chuDe" list="dsChuDe" maxlength="150" value="' + esc(b ? b.chuDe || '' : '') + '" placeholder="Bài giảng hoặc nội dung chính của buổi"><datalist id="dsChuDe">' + chuDeList(lop0).map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div>' +
      '<div class="field"><label>Ngày <span class="req">*</span></label><input class="inp" type="date" name="ngay" value="' + (b ? b.ngay : '') + '"' + (khoaGio ? ' disabled' : '') + '></div>' +
      '<div class="field"><label>Giảng viên <span class="req">*</span></label><select class="sel" name="gv"' + (khoaGio ? ' disabled' : '') + '>' + gvOpts(lop0, b ? b.gv : (lop0 ? lop0.giangVien[0] : '')) + '</select></div>' +
      '<div class="field"><label>Bắt đầu <span class="req">*</span></label><input class="inp" type="time" name="gio" value="' + (b ? b.gio : '13:30') + '"' + (khoaGio ? ' disabled' : '') + '></div>' +
      '<div class="field"><label>Kết thúc <span class="req">*</span></label><input class="inp" type="time" name="den" value="' + (b ? b.den : '16:30') + '"' + (khoaGio ? ' disabled' : '') + '></div>' +
      '<div class="field full"><label>Phòng học trực tuyến <span class="req">*</span></label><select class="sel" name="phong"' + (khoaGio ? ' disabled' : '') + '>' + U.opts(PHONG, null, null, b ? b.phong : PHONG[0]) + '</select><div class="hint">Học viên vào phòng từ lịch học trên cổng học viên; hệ thống ghi nhật ký vào/rời phòng để điểm danh.</div></div>' +
      (!isNew && !khoaGio ? '<label class="check full"><input type="checkbox" name="baoHV" checked> Gửi thông báo đổi lịch cho học viên khi thay đổi ngày, giờ hoặc phòng</label>' : '') +
      '</div>' + (khoaGio ? '<div class="note info">Buổi đã bắt đầu: chỉ sửa được chủ đề. Ngày, giờ, giảng viên gắn với nhật ký phòng học nên không đổi.</div>' : '') +
      '<div class="note warn" data-qua hidden>Buổi nằm trong quá khứ: không có nhật ký phòng học, điểm danh thủ công sau khi thêm.</div><div class="note bad" data-err hidden></div>';
    U.modal({
      title: isNew ? 'Thêm buổi học' : 'Sửa buổi học', body: body,
      onOpen: function (api) {
        var r = api.body, ls = r.querySelector('[name="lop"]');
        function lopDoi() { var l = LMS.byId('lop', ls.value); r.querySelector('[data-lophint]').textContent = l ? 'Thời gian lớp: ' + LMS.fmtDate(l.batDau) + ' – ' + LMS.fmtDate(l.ketThuc) + ' · hiện có ' + LMS.buoiCuaLop(l.id).filter(function (x) { return !x.huy; }).length + ' buổi' : ''; r.querySelector('[name="gv"]').innerHTML = gvOpts(l, l ? l.giangVien[0] : ''); r.querySelector('#dsChuDe').innerHTML = chuDeList(l).map(function (x) { return '<option value="' + esc(x) + '">'; }).join(''); var ni = r.querySelector('[name="ngay"]'); if (l) { ni.min = l.batDau; ni.max = l.ketThuc; } }
        if (ls) { ls.onchange = lopDoi; lopDoi(); } else { var ni = r.querySelector('[name="ngay"]'); ni.min = lop0.batDau; ni.max = lop0.ketThuc; }
        function qua() { var v = U.formVals(r); r.querySelector('[data-qua]').hidden = !(isNew && v.ngay && v.den && LMS.buoiMoc({ ngay: v.ngay, gio: v.gio, den: v.den }).kt.getTime() < Date.now()); }
        r.querySelectorAll('[name="ngay"],[name="den"]').forEach(function (e) { e.addEventListener('change', qua); });
      },
      foot: [{ label: 'Hủy', close: true }, { label: isNew ? 'Thêm buổi' : 'Lưu', cls: 'primary', onClick: function (api) {
        var r = api.body, v = U.formVals(r), ok = true, lop = isNew && !opt.lop ? LMS.byId('lop', v.lop) : lop0;
        if (khoaGio) { var t0 = b.chuDe; b.chuDe = v.chuDe; LMS.commit('Sửa', 'Buổi học', lop.ma + ' · ' + b.ten + ' · chủ đề', { chuDe: t0 }, { chuDe: b.chuDe }); U.toast('Đã cập nhật chủ đề ' + b.ten, 'ok'); if (opt.onDone) opt.onDone(); return; }
        if (isNew && !opt.lop) { U.fieldErr(r, 'lop', lop ? '' : 'Chọn lớp'); if (!lop) ok = false; }
        var en = !v.ngay ? 'Chọn ngày' : (lop && (v.ngay < lop.batDau || v.ngay > lop.ketThuc) ? 'Ngoài thời gian lớp (' + LMS.fmtDate(lop.batDau) + ' – ' + LMS.fmtDate(lop.ketThuc) + ')' : '');
        if (!en && !isNew && LMS.buoiMoc({ ngay: v.ngay, gio: v.gio, den: v.den }).bd.getTime() < Date.now()) en = 'Không dời buổi chưa diễn ra về thời điểm đã qua';
        U.fieldErr(r, 'ngay', en); if (en) ok = false;
        U.fieldErr(r, 'gv', v.gv ? '' : 'Chọn giảng viên'); if (!v.gv) ok = false;
        var eg = !v.gio || !v.den ? 'Nhập giờ' : (LMS.hm2m(v.den) <= LMS.hm2m(v.gio) ? 'Giờ kết thúc phải sau giờ bắt đầu' : '');
        U.fieldErr(r, 'den', eg); if (eg) ok = false;
        if (!ok) return false;
        var cf = trungLich(lop.id, v.gv, v.ngay, v.gio, v.den, b ? b.id : null), err = r.querySelector('[data-err]');
        if (cf.length) { err.hidden = false; err.textContent = 'Trùng lịch: ' + cf.join('; '); return false; }
        if (isNew) {
          var n = { id: LMS.nextId('b'), lop: lop.id, ten: 'Buổi 0', chuDe: v.chuDe, ngay: v.ngay, gio: v.gio, den: v.den, gv: v.gv, hinhThuc: 'Trực tuyến', phong: v.phong, huy: false, diemDanh: null, xinPhep: {} };
          if (LMS.buoiMoc(n).kt.getTime() < Date.now()) { n.ngoaiHeThong = true; n.thamGia = null; }
          D().buoiHoc.push(n); LMS.danhSoBuoi(lop.id);
          LMS.commit('Thêm', 'Buổi học', lop.ma + ' · ' + n.ten + ' · ' + LMS.fmtDate(n.ngay) + ' ' + n.gio, null, { ngay: n.ngay, gio: n.gio + '–' + n.den, gv: gvTen(n.gv), phong: n.phong });
          U.toast('Đã thêm ' + n.ten + ' – ' + lop.ma, 'ok');
        } else {
          var truoc = { ngay: b.ngay, gio: b.gio + '–' + b.den, gv: gvTen(b.gv), phong: b.phong, chuDe: b.chuDe || '' };
          var doiLich = b.ngay !== v.ngay || b.gio !== v.gio || b.den !== v.den || b.phong !== v.phong;
          b.ngay = v.ngay; b.gio = v.gio; b.den = v.den; b.gv = v.gv; b.phong = v.phong; b.chuDe = v.chuDe; LMS.danhSoBuoi(lop.id);
          var nTB = doiLich && v.baoHV ? thongBaoLop(lop, 'Đổi lịch ' + b.ten + ' – ' + lop.ma, b.ten + (b.chuDe ? ' (' + b.chuDe + ')' : '') + ' chuyển sang ' + ngayGio(b) + ', ' + b.phong + '. Học viên vào phòng học từ lịch học trên cổng học viên.') : 0;
          LMS.commit('Sửa', 'Buổi học', lop.ma + ' · ' + b.ten + (nTB ? ' · đã báo ' + nTB + ' học viên' : ''), truoc, { ngay: b.ngay, gio: b.gio + '–' + b.den, gv: gvTen(b.gv), phong: b.phong, chuDe: b.chuDe || '' });
          U.toast('Đã cập nhật ' + b.ten + (nTB ? ', đã gửi thông báo cho ' + nTB + ' học viên' : ''), 'ok');
        }
        if (opt.onDone) opt.onDone();
      } }]
    });
  }

  /* ---------- hủy / khôi phục ---------- */
  function huy(b, opt) {
    opt = opt || {};
    if (daBatDau(b)) { U.blocked('Không thể hủy ' + b.ten, ['Buổi đã bắt đầu, hệ thống đang hoặc đã ghi nhật ký phòng học'], 'Buổi đã diễn ra giữ lại để tính chuyên cần.'); return; }
    var l = lopOf(b);
    U.modal({
      title: 'Hủy buổi học', body:
        '<div><b>' + esc(l.ma) + ' · ' + esc(b.ten) + '</b>' + (b.chuDe ? ' · ' + esc(b.chuDe) : '') + '<div class="small muted">' + esc(ngayGio(b)) + ' · GV ' + esc(gvTen(b.gv)) + '</div></div>' +
        '<div class="field"><label>Lý do hủy <span class="req">*</span></label><textarea name="lyDo" maxlength="300" placeholder="VD: Giảng viên đi công tác theo quyết định của Học viện"></textarea></div>' +
        '<label class="check"><input type="checkbox" name="baoHV" checked> Gửi thông báo hủy buổi cho học viên</label>' +
        '<label class="check"><input type="checkbox" name="bu"> Tạo buổi học bù</label>' +
        '<div class="bh-sub form-grid" data-bu hidden><div class="field"><label>Ngày học bù <span class="req">*</span></label><input class="inp" type="date" name="nBu" min="' + LMS.iso(LMS.addDays(LMS.TODAY, 1)) + '" max="' + l.ketThuc + '"></div><div class="field"><label>Giảng viên</label><select class="sel" name="gvBu">' + gvOpts(l, b.gv) + '</select></div><div class="field"><label>Bắt đầu</label><input class="inp" type="time" name="gBu" value="' + b.gio + '"></div><div class="field"><label>Kết thúc</label><input class="inp" type="time" name="dBu" value="' + b.den + '"></div></div>' +
        '<div class="note bad" data-err hidden></div>',
      onOpen: function (api) { var cb = api.body.querySelector('[name="bu"]'); cb.onchange = function () { api.body.querySelector('[data-bu]').hidden = !cb.checked; }; },
      foot: [{ label: 'Đóng', close: true }, { label: 'Hủy buổi', cls: 'danger solid', onClick: function (api) {
        var r = api.body, v = U.formVals(r), ok = true, err = r.querySelector('[data-err]');
        U.fieldErr(r, 'lyDo', v.lyDo ? '' : 'Nhập lý do hủy'); if (!v.lyDo) ok = false;
        var bu = null;
        if (v.bu) {
          var e1 = !v.nBu ? 'Chọn ngày' : (v.nBu > l.ketThuc ? 'Sau ngày kết thúc lớp' : ''); U.fieldErr(r, 'nBu', e1); if (e1) ok = false;
          var e2 = LMS.hm2m(v.dBu) <= LMS.hm2m(v.gBu) ? 'Giờ kết thúc phải sau giờ bắt đầu' : ''; U.fieldErr(r, 'dBu', e2); if (e2) ok = false;
          if (ok) { var cf = trungLich(l.id, v.gvBu, v.nBu, v.gBu, v.dBu, b.id); if (cf.length) { err.hidden = false; err.textContent = 'Buổi học bù trùng lịch: ' + cf.join('; '); return false; } }
          bu = { id: LMS.nextId('b'), lop: l.id, ten: 'Buổi 0', chuDe: b.chuDe || '', ngay: v.nBu, gio: v.gBu, den: v.dBu, gv: v.gvBu, hinhThuc: 'Trực tuyến', phong: b.phong, huy: false, diemDanh: null, xinPhep: {}, hocBu: b.id };
        }
        if (!ok) return false;
        b.huy = true; b.lyDoHuy = v.lyDo; var tenCu = b.ten;
        if (bu) { D().buoiHoc.push(bu); b.buBang = bu.id; }
        LMS.danhSoBuoi(l.id);
        var nTB = v.baoHV ? thongBaoLop(l, 'Hủy ' + tenCu + ' – ' + l.ma, tenCu + ' ngày ' + LMS.fmtDate(b.ngay) + ' (' + b.gio + '–' + b.den + ') tạm hủy. Lý do: ' + v.lyDo + '.' + (bu ? ' Buổi học bù: ' + ngayGio(bu) + ', ' + bu.phong + '.' : ' Lịch học bù sẽ thông báo sau.')) : 0;
        LMS.commit('Hủy', 'Buổi học', l.ma + ' · ' + tenCu + ' · ' + LMS.fmtDate(b.ngay) + ' · ' + v.lyDo + (bu ? ' · học bù ' + LMS.fmtDate(bu.ngay) : ''), { huy: false }, { huy: true, lyDo: v.lyDo, hocBu: bu ? LMS.fmtDate(bu.ngay) + ' ' + bu.gio : '—' });
        U.toast('Đã hủy ' + tenCu + (bu ? ', tạo buổi học bù ' + LMS.fmtDate(bu.ngay) : '') + (nTB ? ', đã báo ' + nTB + ' học viên' : ''), 'ok');
        if (opt.onDone) opt.onDone();
      } }]
    });
  }
  function khoiPhuc(b, opt) {
    opt = opt || {};
    var l = lopOf(b);
    if (daBatDau(b)) { U.blocked('Không thể khôi phục', ['Thời gian buổi học đã qua'], 'Thêm buổi mới nếu cần dạy bù.'); return; }
    var cf = trungLich(b.lop, b.gv, b.ngay, b.gio, b.den, b.id);
    if (cf.length) { U.blocked('Không thể khôi phục', cf, 'Đổi ngày giờ buổi khác trước.'); return; }
    U.confirm({ title: 'Khôi phục buổi học', message: 'Khôi phục buổi ' + LMS.fmtDate(b.ngay) + ' của lớp ' + l.ma + '?' + (b.buBang ? ' Buổi học bù đã tạo vẫn giữ nguyên.' : ''), ok: 'Khôi phục' }).then(function (y) {
      if (!y) return;
      b.huy = false; delete b.lyDoHuy; LMS.danhSoBuoi(b.lop);
      LMS.commit('Khôi phục', 'Buổi học', l.ma + ' · ' + LMS.fmtDate(b.ngay), { huy: true }, { huy: false });
      U.toast('Đã khôi phục buổi học', 'ok'); if (opt.onDone) opt.onDone();
    });
  }

  /* ---------- tạo lịch định kỳ ---------- */
  function dinhKy(opt) {
    opt = opt || {};
    var lop0 = opt.lop ? LMS.byId('lop', opt.lop) : null; if (lop0 && lopChonDuoc().indexOf(lop0) < 0) lop0 = null;
    var THU_ORDER = [1, 2, 3, 4, 5, 6, 0], plan = [];
    var body = '<div class="form-grid">' +
      (opt.lop && lop0 ? '<input type="hidden" name="lop" value="' + esc(lop0.id) + '"><div class="field full"><label>Lớp</label><input class="inp" readonly value="' + esc(lop0.ma + ' · ' + lop0.ten) + '"><div class="hint" data-lophint></div></div>'
        : '<div class="field full"><label>Lớp <span class="req">*</span></label><select class="sel" name="lop">' + U.opts(lopChonDuoc(), 'id', function (l) { return l.ma + ' · ' + l.ten; }, lop0 ? lop0.id : '', '— Chọn lớp —') + '</select><div class="hint" data-lophint></div></div>') +
      '<div class="field full"><label>Thứ trong tuần <span class="req">*</span></label><div class="thu-list">' + THU_ORDER.map(function (d) { return '<label><input type="checkbox" data-thu="' + d + '"' + (d === 2 || d === 5 ? ' checked' : '') + '>' + LMS.THU[d] + '</label>'; }).join('') + '</div></div>' +
      '<div class="field"><label>Từ ngày <span class="req">*</span></label><input class="inp" type="date" name="tu"></div>' +
      '<div class="field"><label>Đến ngày <span class="req">*</span></label><input class="inp" type="date" name="denNgay"></div>' +
      '<div class="field"><label>Bắt đầu <span class="req">*</span></label><input class="inp" type="time" name="gio" value="13:30"></div>' +
      '<div class="field"><label>Kết thúc <span class="req">*</span></label><input class="inp" type="time" name="den" value="16:30"></div>' +
      '<div class="field"><label>Giảng viên <span class="req">*</span></label><select class="sel" name="gv"></select></div>' +
      '<div class="field"><label>Phòng học trực tuyến</label><select class="sel" name="phong">' + U.opts(PHONG, null, null, PHONG[0]) + '</select></div>' +
      '<label class="check full"><input type="checkbox" name="ganCD" checked> Gán chủ đề buổi theo thứ tự bài giảng của học phần</label>' +
      '</div><div class="note info" data-preview>Chọn lớp để xem trước lịch.</div>';
    U.modal({
      title: 'Tạo lịch định kỳ', body: body,
      onOpen: function (api) {
        var r = api.body, ls = r.querySelector('[name="lop"]');
        function lopDoi() {
          var l = LMS.byId('lop', ls.value);
          r.querySelector('[data-lophint]').textContent = l ? 'Thời gian lớp: ' + LMS.fmtDate(l.batDau) + ' – ' + LMS.fmtDate(l.ketThuc) + ' · hiện có ' + LMS.buoiCuaLop(l.id).filter(function (x) { return !x.huy; }).length + ' buổi' : '';
          r.querySelector('[name="gv"]').innerHTML = gvOpts(l, l ? l.giangVien[0] : '');
          var tu = r.querySelector('[name="tu"]'), dn = r.querySelector('[name="denNgay"]');
          if (l) { var s = l.batDau > LMS.iso(LMS.TODAY) ? l.batDau : LMS.iso(LMS.addDays(LMS.TODAY, 1)); if (s > l.ketThuc) s = l.ketThuc; tu.value = s; dn.value = l.ketThuc; tu.min = dn.min = l.batDau; tu.max = dn.max = l.ketThuc; }
          xem();
        }
        function xem() {
          var box = r.querySelector('[data-preview]'), v = U.formVals(r), l = LMS.byId('lop', v.lop), thus = [];
          r.querySelectorAll('[data-thu]').forEach(function (c) { if (c.checked) thus.push(+c.dataset.thu); });
          plan = [];
          if (!l) { box.className = 'note info'; box.textContent = 'Chọn lớp để xem trước lịch.'; return; }
          if (!v.tu || !v.denNgay || v.tu > v.denNgay) { box.className = 'note warn'; box.textContent = 'Khoảng ngày không hợp lệ.'; return; }
          if (!thus.length) { box.className = 'note warn'; box.textContent = 'Chọn ít nhất một thứ trong tuần.'; return; }
          var trung = 0, a = LMS.parse(v.tu < l.batDau ? l.batDau : v.tu), z = LMS.parse(v.denNgay > l.ketThuc ? l.ketThuc : v.denNgay), co = {};
          LMS.buoiCuaLop(l.id).forEach(function (b) { if (!b.huy) co[b.ngay] = 1; });
          for (var d = a; d <= z; d = LMS.addDays(d, 1)) { if (thus.indexOf(d.getDay()) < 0) continue; var di = LMS.iso(d); if (co[di]) { trung++; continue; } plan.push(di); }
          box.className = plan.length ? 'note ok' : 'note warn';
          box.innerHTML = plan.length ? 'Sẽ tạo <b>' + plan.length + ' buổi</b> từ ' + LMS.fmtDate(plan[0]) + ' đến ' + LMS.fmtDate(plan[plan.length - 1]) + (trung ? ' · bỏ qua ' + trung + ' ngày lớp đã có buổi' : '') + '<div class="small muted" style="margin-top:4px">' + plan.slice(0, 8).map(function (x) { return thu(x) + ' ' + LMS.fmtDate(x).slice(0, 5); }).join(', ') + (plan.length > 8 ? ', …' : '') + '</div>' : 'Không có ngày nào để tạo' + (trung ? ' (' + trung + ' ngày đã có buổi)' : '') + '.';
        }
        if (ls.tagName === 'SELECT') ls.onchange = lopDoi;
        r.querySelectorAll('[data-thu],[name="tu"],[name="denNgay"]').forEach(function (e) { e.onchange = xem; e.oninput = xem; });
        if (ls.value) lopDoi();
      },
      foot: [{ label: 'Hủy', close: true }, { label: 'Tạo lịch', cls: 'primary', onClick: function (api) {
        var r = api.body, v = U.formVals(r), l = LMS.byId('lop', v.lop), ok = true;
        U.fieldErr(r, 'lop', l ? '' : 'Chọn lớp'); if (!l) ok = false;
        if (l) {
          var e1 = !v.tu ? 'Chọn ngày' : (v.tu < l.batDau ? 'Trước ngày khai giảng' : ''); U.fieldErr(r, 'tu', e1); if (e1) ok = false;
          var e2 = !v.denNgay ? 'Chọn ngày' : (v.denNgay > l.ketThuc ? 'Sau ngày kết thúc lớp' : (v.tu && v.denNgay < v.tu ? 'Phải sau Từ ngày' : '')); U.fieldErr(r, 'denNgay', e2); if (e2) ok = false;
        }
        var eg = LMS.hm2m(v.den) <= LMS.hm2m(v.gio) ? 'Giờ kết thúc phải sau giờ bắt đầu' : ''; U.fieldErr(r, 'den', eg); if (eg) ok = false;
        U.fieldErr(r, 'gv', v.gv ? '' : 'Chọn giảng viên'); if (!v.gv) ok = false;
        if (!ok) return false;
        if (!plan.length) { U.toast('Không có buổi nào để tạo', 'bad'); return false; }
        var cf = []; plan.forEach(function (di) { trungLich(l.id, v.gv, di, v.gio, v.den, null).forEach(function (c) { cf.push(LMS.fmtDate(di) + ': ' + c); }); });
        if (cf.length) { U.blocked('Trùng lịch giảng viên', cf, 'Đổi giờ, giảng viên hoặc bỏ bớt thứ trong tuần.'); return false; }
        var cds = chuDeList(l), daCo = LMS.buoiCuaLop(l.id).filter(function (x) { return !x.huy && x.chuDe; }).length;
        plan.forEach(function (di, i) { D().buoiHoc.push({ id: LMS.nextId('b') + i, lop: l.id, ten: 'Buổi 0', chuDe: v.ganCD && cds.length ? cds[(daCo + i) % cds.length] : '', ngay: di, gio: v.gio, den: v.den, gv: v.gv, hinhThuc: 'Trực tuyến', phong: v.phong, huy: false, diemDanh: null, xinPhep: {} }); });
        LMS.danhSoBuoi(l.id);
        LMS.commit('Tạo lịch định kỳ', 'Buổi học', l.ma + ' · ' + plan.length + ' buổi · ' + LMS.fmtDate(plan[0]) + ' – ' + LMS.fmtDate(plan[plan.length - 1]), null, { soBuoi: plan.length, gio: v.gio + '–' + v.den, gv: gvTen(v.gv) });
        U.toast('Đã tạo ' + plan.length + ' buổi cho ' + l.ma, 'ok');
        if (opt.onDone) opt.onDone(l.id);
      } }]
    });
  }

  /* ---------- quy tắc điểm danh ---------- */
  function quyTac(opt) {
    opt = opt || {};
    var c = LMS.cfgDD(), sua = opt.vaiTro !== 'gv';
    var body = '<div class="bh-rule">Áp dụng cho các lớp trực tuyến có giảng viên. Nhật ký phòng học ghi giờ vào, giờ rời và tổng thời gian tham gia của từng học viên; khi buổi kết thúc hệ thống tính kết quả theo quy tắc dưới đây.</div>' +
      '<div class="form-grid" style="margin-top:12px">' +
      '<div class="field"><label>Ngưỡng có mặt (% thời lượng buổi)</label><input class="inp" type="number" name="nguong" min="30" max="100" step="5" value="' + c.nguong + '"' + (sua ? '' : ' disabled') + '><div class="hint">Buổi 150 phút, ngưỡng 70% → tối thiểu 105 phút</div></div>' +
      '<div class="field"><label>Tính đi muộn khi vào sau (phút)</label><input class="inp" type="number" name="muon" min="0" max="60" value="' + c.muon + '"' + (sua ? '' : ' disabled') + '><div class="hint">Đi muộn vẫn tính có mặt nếu đủ ngưỡng, được đánh dấu để giảng viên theo dõi</div></div>' +
      '<div class="field"><label>Hạn giảng viên xác nhận (giờ sau buổi học)</label><input class="inp" type="number" name="hanXN" min="12" max="168" value="' + c.hanXN + '"' + (sua ? '' : ' disabled') + '></div>' +
      '<label class="check" style="align-self:end"><input type="checkbox" name="tuDongChot"' + (c.tuDongChot ? ' checked' : '') + (sua ? '' : ' disabled') + '> Quá hạn hệ thống tự chốt theo kết quả tự động</label>' +
      '</div><div class="small muted" style="margin-top:8px">Thay đổi áp dụng cho các buổi chưa chốt; buổi đã chốt giữ nguyên kết quả.</div>';
    U.modal({
      title: 'Quy tắc điểm danh tự động', body: body,
      foot: sua ? [{ label: 'Hủy', close: true }, { label: 'Lưu quy tắc', cls: 'primary', onClick: function (api) {
        var v = U.formVals(api.body), ok = true;
        var n1 = +v.nguong, n2 = +v.muon, n3 = +v.hanXN;
        U.fieldErr(api.body, 'nguong', n1 >= 30 && n1 <= 100 ? '' : 'Từ 30 đến 100'); if (!(n1 >= 30 && n1 <= 100)) ok = false;
        U.fieldErr(api.body, 'muon', n2 >= 0 && n2 <= 60 ? '' : 'Từ 0 đến 60'); if (!(n2 >= 0 && n2 <= 60)) ok = false;
        U.fieldErr(api.body, 'hanXN', n3 >= 12 && n3 <= 168 ? '' : 'Từ 12 đến 168 giờ'); if (!(n3 >= 12 && n3 <= 168)) ok = false;
        if (!ok) return false;
        var truoc = JSON.parse(JSON.stringify(c));
        D().cauHinhDD = { nguong: n1, muon: n2, hanXN: n3, tuDongChot: !!v.tuDongChot };
        var n = 0;
        D().buoiHoc.forEach(function (b) { if (b.chot || !b.diemDanh || !b.thamGia) return; n++; Object.keys(b.diemDanh).forEach(function (h) { if (!(b.dieuChinh || {})[h]) b.diemDanh[h] = LMS.ddTuDong(b, h).tt; }); });
        LMS.commit('Sửa quy tắc điểm danh', 'Buổi học', 'Ngưỡng ' + n1 + '% · muộn ' + n2 + ' phút · hạn ' + n3 + ' giờ' + (n ? ' · tính lại ' + n + ' buổi chưa chốt' : ''), truoc, D().cauHinhDD);
        U.toast('Đã lưu quy tắc' + (n ? ', tính lại ' + n + ' buổi chưa chốt' : ''), 'ok');
        if (opt.onDone) opt.onDone();
      } }] : [{ label: 'Đóng', close: true }]
    });
  }

  /* ---------- menu thao tác của một buổi ---------- */
  function menu(anchor, b, ctx) {
    ctx = ctxOf(ctx);
    var pdt = ctx.vaiTro === 'pdt', s = LMS.buoiStatus(b).key, l = lopOf(b), items = [];
    var chinh = hanhDongChinh(b);
    items.push({ label: chinh ? chinh.label : 'Chi tiết buổi', onClick: function () { chiTiet(b, ctx); } });
    if (s === 'dang' || s === 'hom-nay') items.push({ label: pdt ? 'Mở phòng học (giám sát)' : 'Vào phòng dạy', onClick: function () { U.toast('Mở ' + b.phong + ' · ' + l.ma + ' ' + b.ten, 'ok'); } });
    if (pdt) {
      items.push('-');
      items.push({ label: s === 'sap' || s === 'hom-nay' ? 'Sửa / dời buổi' : 'Sửa chủ đề', disabled: b.huy, title: 'Buổi đã hủy', onClick: function () { form(b, { onDone: ctx.onDone }); } });
      if (ctx.tuLich) items.push({ label: 'Mở lớp ' + (l ? l.ma : ''), onClick: function () { LMS.go('lop-hoc.html', { lop: b.lop, tab: 'buoi' }); } });
      items.push('-');
      items.push(b.huy ? { label: 'Khôi phục buổi', onClick: function () { khoiPhuc(b, { onDone: ctx.onDone }); } } : { label: 'Hủy buổi', danger: true, disabled: daBatDau(b), title: 'Buổi đã bắt đầu', onClick: function () { huy(b, { onDone: ctx.onDone }); } });
    }
    U.menu(anchor, items);
  }

  LMS.buoiUI = { chiTiet: chiTiet, form: form, huy: huy, khoiPhuc: khoiPhuc, dinhKy: dinhKy, quyTac: quyTac, menu: menu, oTrangThai: oTrangThai, oDiemDanh: oDiemDanh, hanhDongChinh: hanhDongChinh, dem: dem, choDuyet: choDuyet, trongPhong: trongPhong, quyTacText: quyTacText, TT: TT };
})();
