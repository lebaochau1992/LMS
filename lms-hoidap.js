/* EGO LMS · Hỏi đáp / Thảo luận — hiển thị chủ đề và thao tác dùng chung cho màn Hỏi đáp và tab Hỏi đáp của Lớp học.
   Quản trị hoặc giảng viên của lớp được trả lời, sửa, xóa ở câu hỏi gốc và ở từng trả lời bên trong.
   render(host, list, o) — o: { st: {open, box, boxTo, who, an, q, hl}, tuongDoi, hienLop, menu, onChange } */
(function () {
  'use strict';
  var U = LMS.ui, esc = U.esc, H48 = 48 * 3600000;
  var MAU = [
    ['Đã trả lời trong bài', 'Nội dung này có trong phần video bài giảng, em xem lại từ phút … nhé.'],
    ['Xem tài liệu', 'Em xem thêm mục … trong tài liệu đính kèm của bài để nắm chi tiết.'],
    ['Chuyển buổi học', 'Câu hỏi hay, cô/thầy sẽ giải đáp kỹ trong buổi học trực tiếp tới.'],
    ['Hỗ trợ kỹ thuật', 'Em gửi ảnh chụp màn hình lỗi qua mục Hỗ trợ để Phòng Đào tạo kiểm tra giúp em.']
  ];
  var LY_DO = ['Nội dung không phù hợp', 'Trùng lặp', 'Spam / thử nghiệm', 'Thông tin cá nhân', 'Khác'];

  (function css() {
    if (document.getElementById('hd-css')) return;
    var s = document.createElement('style'); s.id = 'hd-css';
    s.textContent =
      '.threads{display:flex;flex-direction:column;gap:12px}' +
      '.th{border:1px solid var(--ems-border);border-radius:var(--r-card);background:var(--ems-surface);padding:12px 14px}' +
      '.th.overdue{box-shadow:inset 3px 0 0 var(--ems-danger)}.th.pin{border-color:var(--ems-navy-line)}.th.an,.th.del{opacity:.6}.th.hl{box-shadow:0 0 0 3px var(--ems-focus)}' +
      '.threads.flat{gap:0}.threads.flat .th{border:0;border-radius:0;border-bottom:1px solid var(--ems-border);padding:12px 4px}.threads.flat .th:last-child{border-bottom:0}' +
      '.post{display:flex;gap:10px}.post .avatar{flex:none}.post .pb{flex:1;min-width:0}' +
      '.ph{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--ems-muted)}.ph b{color:var(--ems-text);font-size:13px}.ph .t{margin-left:auto;white-space:nowrap}' +
      '.pt{margin:4px 0 6px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;line-height:1.55}.pt .mention{color:var(--ems-navy);font-weight:600}.pt.del{color:var(--ems-muted);font-style:italic}' +
      '.pa{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.pa button{border:0;background:transparent;padding:0;font:600 12px var(--font);color:var(--ems-navy);cursor:pointer}.pa button.danger{color:var(--ems-danger)}.pa button:hover{text-decoration:underline}' +
      '.replies{margin:10px 0 0 22px;padding-left:14px;border-left:2px solid var(--ems-border);display:flex;flex-direction:column;gap:10px}' +
      '.rep.gv .pb,.rep.qt .pb{background:var(--ems-navy-soft);border-radius:var(--r-ctl);padding:8px 10px}.rep.qt .pb{background:var(--ems-warning-bg)}.rep.best .pb{outline:2px solid var(--ems-success-line)}' +
      '.best-tag{color:var(--ems-success);font-weight:700;font-size:12px}.sua-tag{cursor:help}' +
      '.lnk{background:none;border:0;padding:0;font:inherit;color:var(--ems-navy);cursor:pointer}.lnk:hover{text-decoration:underline}' +
      '.box{margin:10px 0 0 22px;border:1px solid var(--ems-border);border-radius:var(--r-ctl);padding:10px;display:flex;flex-direction:column;gap:8px;background:var(--ems-surface-2)}.box textarea{min-height:70px}.box .row{gap:8px}' +
      '.more-r{font-size:12px}' +
      '@media (max-width:900px){.replies,.box{margin-left:6px}.ph .t{margin-left:0}}';
    document.head.appendChild(s);
  })();

  /* ---------- tiện ích ---------- */
  function D() { return LMS.db; }
  function T(id) { return LMS.byId('hoiDap', id); }
  function R(t, rid) { return (t.traLoi || []).find(function (r) { return r.id === rid; }); }
  function hvTen(id) { var h = LMS.byId('hocVien', id); return h ? h.hoTen : '—'; }
  function gvTen(id) { var g = LMS.byId('giangVien', id); return g ? g.hoTen : '—'; }
  function qtTen() { return D().meta.user.hoTen; }
  function tenNguoi(r) { return r.vaiTro === 'gv' ? gvTen(r.nguoi) : r.vaiTro === 'qt' ? qtTen() : hvTen(r.nguoi); }
  function tagVT(v) { return v === 'gv' ? U.badge('Giảng viên', 'navy') : v === 'qt' ? U.badge('Quản trị', 'warn') : U.badge('Học viên', ''); }
  function baiOf(t) { var l = LMS.byId('lop', t.lop), hp = l && LMS.hocPhanOfLop(l); return hp ? hp.bai.find(function (x) { return x.id === t.bai; }) || null : null; }
  function daTL(t) { return LMS.hdDaTraLoi(t); }
  function cho(t) { return LMS.hdChoTL(t); }
  function quaHan(t) { return cho(t) && Date.now() - new Date(t.ngay).getTime() > H48; }
  function tuoi(d) { var h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000); return h < 1 ? 'vừa xong' : h < 48 ? h + ' giờ' : Math.floor(h / 24) + ' ngày'; }
  function truoc(d) { var m = (Date.now() - new Date(d).getTime()) / 60000; if (m < 1) return 'vừa xong'; if (m < 60) return Math.floor(m) + ' phút trước'; if (m < 1440) return Math.floor(m / 60) + ' giờ trước'; return Math.floor(m / 1440) + ' ngày trước'; }
  function reps(t, all) { return (t.traLoi || []).filter(function (r) { return all || !r.xoa; }); }
  function lastAt(t) { var r = reps(t); return r.length ? r[r.length - 1].ngay : t.ngay; }
  function lopMa(t) { var l = LMS.byId('lop', t.lop); return l ? l.ma : ''; }
  function mention(txt) { return esc(txt).replace(/(^|\s)@([^\s:,]+(?:\s[^\s:,@]+){0,3}):/g, '$1<span class="mention">@$2</span>:'); }
  function gio(d, o) { return '<span class="t" title="' + LMS.fmtDT(d) + '">' + (o.tuongDoi ? truoc(d) : LMS.fmtDT(d)) + '</span>'; }
  function whoList(t) {
    var l = LMS.byId('lop', t.lop), gvs = (l ? l.giangVien : []).map(function (g) { return LMS.byId('giangVien', g); }).filter(Boolean);
    return [{ v: 'qt:' + D().meta.user.ten, t: 'Quản trị · ' + qtTen() }].concat(gvs.map(function (g) { return { v: 'gv:' + g.id, t: 'Giảng viên · ' + g.hoTen }; }));
  }
  function whoMacDinh(t, o) { var ds = whoList(t), w = o.st.who; if (w && ds.some(function (x) { return x.v === w; })) return w; return ds[0].v; }
  function whoTen(v) { var p = String(v).split(':'); return p[0] === 'gv' ? gvTen(p[1]) : qtTen(); }
  function suaTag(x, tacGia) {
    if (!x) return '';
    var s = typeof x === 'string' ? { luc: x } : x, khac = s.ten && s.ten !== tacGia;
    return '<span class="sua-tag" title="Sửa ' + (s.ten ? 'bởi ' + esc(s.ten) + ' ' : '') + 'lúc ' + LMS.fmtDT(s.luc) + '">(đã sửa' + (khac ? ' bởi ' + esc(s.ten) : '') + ')</span>';
  }
  function statusBadge(t) {
    if (t.xoa) return U.badge('Đã xóa', 'bad');
    if (t.loai === 'binh-luan') return U.badge('Bình luận', '');
    if (t.giaiQuyet) return U.badge('Đã giải quyết', 'ok');
    if (daTL(t)) return U.badge('Đã trả lời', 'navy');
    if (quaHan(t)) return U.badge('Chưa trả lời · ' + tuoi(t.ngay), 'bad');
    return U.badge('Chưa trả lời', 'warn');
  }

  /* ---------- hiển thị ---------- */
  function threadHtml(t, o) {
    var st = o.st, l = LMS.byId('lop', t.lop), b = baiOf(t), all = reps(t, st.an), open = st.open[t.id], shown = open || all.length <= 4 ? all : all.slice(-3), n = reps(t).length;
    var h = '<div class="th' + (quaHan(t) ? ' overdue' : '') + (t.ghim ? ' pin' : '') + (t.an ? ' an' : '') + (t.xoa ? ' del' : '') + '" id="t_' + t.id + '"><div class="post"><span class="avatar">' + esc(U.initials(hvTen(t.hv))) + '</span><div class="pb">' +
      '<div class="ph"><b>' + esc(hvTen(t.hv)) + '</b>' + tagVT('hv') + (o.hienBai !== false ? (b ? '<span>·</span><button class="lnk" data-bai="' + t.id + '" title="Mở bài giảng">' + esc(b.ten) + '</button>' : '<span>· Chung</span>') : '') + (o.hienLop && l ? '<span>· ' + esc(l.ma) + '</span>' : '') +
      statusBadge(t) + (t.ghim ? U.badge('Đã ghim', 'navy') : '') + (t.rieng ? U.badge('Riêng với giảng viên', 'info') : '') + (t.an ? U.badge('Đã ẩn', '') : '') + suaTag(t.sua, hvTen(t.hv)) + gio(t.ngay, o) + '</div>' +
      (t.xoa ? '<div class="pt del">Câu hỏi đã bị xóa bởi ' + esc(t.xoa.nguoi) + ' lúc ' + LMS.fmtDT(t.xoa.luc) + ' · Lý do: ' + esc(t.xoa.lyDo) + '</div>' : '<div class="pt">' + (st.q ? U.hl(t.noiDung, st.q) : mention(t.noiDung)) + '</div>') +
      '<div class="pa">' + (t.xoa ? '<button data-restore="' + t.id + '">Khôi phục</button>'
        : '<button data-rep="' + t.id + '">💬 Trả lời</button><button data-edit="' + t.id + '">Sửa</button>' + (o.menu ? '<button data-more="' + t.id + '">⋯ Thao tác</button>' : '') + '<button class="danger" data-del="' + t.id + '">🗑 Xóa ' + (t.loai === 'binh-luan' ? 'chủ đề' : 'câu hỏi') + '</button>') +
      '<span class="small muted">' + n + (t.loai === 'binh-luan' ? ' bình luận' : ' trả lời') + (n ? ' · hoạt động ' + tuoi(lastAt(t)) + ' trước' : '') + '</span></div></div></div>';
    if (all.length || st.box === t.id) {
      h += '<div class="replies">';
      if (shown.length < all.length) h += '<button class="lnk more-r" data-open="' + t.id + '">Xem thêm ' + (all.length - shown.length) + ' trả lời trước</button>';
      h += shown.map(function (r) { return repHtml(t, r, o); }).join('');
      h += '</div>';
    }
    if (st.box === t.id) h += boxHtml(t, o);
    return h + '</div>';
  }
  function repHtml(t, r, o) {
    var best = t.giaiQuyet === r.id, ten = tenNguoi(r);
    return '<div class="post rep ' + r.vaiTro + (best ? ' best' : '') + '" id="r_' + r.id + '"><span class="avatar">' + esc(U.initials(ten)) + '</span><div class="pb"><div class="ph"><b>' + esc(ten) + '</b>' + tagVT(r.vaiTro) + (best ? '<span class="best-tag">✓ Câu trả lời được chọn</span>' : '') + suaTag(r.sua, ten) + gio(r.ngay, o) + '</div>' +
      (r.xoa ? '<div class="pt del">Trả lời đã bị xóa bởi ' + esc(r.xoa.nguoi) + ' · Lý do: ' + esc(r.xoa.lyDo) + '</div>' : '<div class="pt">' + mention(r.noiDung) + '</div>') +
      (r.xoa || t.xoa ? (r.xoa && !t.xoa ? '<div class="pa"><button data-rrestore="' + t.id + '|' + r.id + '">Khôi phục</button></div>' : '')
        : '<div class="pa"><button data-rep="' + t.id + '" data-to="' + r.id + '">↩ Trả lời</button>' + (t.loai !== 'binh-luan' ? '<button data-best="' + t.id + '|' + r.id + '">' + (best ? 'Bỏ chọn' : '✓ Chọn là câu trả lời đúng') + '</button>' : '') + '<button data-redit="' + t.id + '|' + r.id + '">Sửa</button><button class="danger" data-rdel="' + t.id + '|' + r.id + '">🗑 Xóa</button></div>') + '</div></div>';
  }
  function boxHtml(t, o) {
    var st = o.st, to = st.boxTo ? R(t, st.boxTo) : null;
    return '<div class="box" data-box="' + t.id + '"><div class="row"><label class="small" for="who">Trả lời với tư cách</label><select class="sel" id="who" style="width:auto">' + U.opts(whoList(t), 'v', 't', whoMacDinh(t, o)) + '</select>' +
      (to ? '<span class="tag">Trả lời ' + esc(tenNguoi(to)) + ' <button class="lnk" data-noto aria-label="Bỏ trả lời người này">✕</button></span>' : '') +
      '<select class="sel right" id="mau" style="width:auto" aria-label="Chèn mẫu trả lời"><option value="">Chèn mẫu trả lời…</option>' + MAU.map(function (m, i) { return '<option value="' + i + '">' + esc(m[0]) + '</option>'; }).join('') + '</select></div>' +
      '<textarea id="rtxt" maxlength="2000" placeholder="Trả lời với tư cách giảng viên/quản trị… (Ctrl + Enter để gửi)">' + (to ? '@' + esc(tenNguoi(to)) + ': ' : '') + '</textarea>' +
      '<div class="row"><label class="check small"><input type="checkbox" id="rdone"' + (t.loai === 'binh-luan' ? ' disabled' : '') + '> Đánh dấu đã giải quyết sau khi gửi</label>' + (t.rieng ? '<span class="small muted">Chủ đề riêng: chỉ học viên hỏi thấy trả lời</span>' : '<span class="small muted">Học viên nhận thông báo khi có trả lời</span>') +
      '<span class="right row" style="gap:6px"><button class="btn sm" data-cancel>Hủy</button><button class="btn sm primary" data-send="' + t.id + '">Gửi</button></span></div></div>';
  }
  function render(host, list, o) {
    o.st.open = o.st.open || {};
    host.innerHTML = '<div class="threads' + (o.flat ? ' flat' : '') + '">' + list.map(function (t) { return threadHtml(t, o); }).join('') + '</div>';
    bind(host, o);
    if (o.st.hl) { var el = host.querySelector('#t_' + o.st.hl); if (el) { el.classList.add('hl'); el.scrollIntoView({ block: 'center' }); setTimeout(function () { el.classList.remove('hl'); }, 2200); o.st.hl = null; } }
  }

  /* ---------- thao tác ---------- */
  function bind(host, o) {
    var st = o.st, done = function () { if (o.onChange) o.onChange(); };
    host.querySelectorAll('[data-open]').forEach(function (b) { b.onclick = function () { st.open[b.dataset.open] = 1; done(); }; });
    host.querySelectorAll('[data-rep]').forEach(function (b) { b.onclick = function () {
      st.box = b.dataset.rep; st.boxTo = b.dataset.to || null; st.open[b.dataset.rep] = 1; if (o.moNhom) o.moNhom(T(st.box)); done();
      var ta = document.getElementById('rtxt'); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); ta.scrollIntoView({ block: 'center' }); }
    }; });
    host.querySelectorAll('[data-bai]').forEach(function (b) { b.onclick = function () { var t = T(b.dataset.bai), l = LMS.byId('lop', t.lop); LMS.go('hoc-phan.html', { hocPhan: l.hocPhan, tab: 'bai', bai: t.bai }); }; });
    host.querySelectorAll('[data-more]').forEach(function (b) { b.onclick = function () { moreMenu(b, T(b.dataset.more), o); }; });
    host.querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { editModal(T(b.dataset.edit), null, o); }; });
    host.querySelectorAll('[data-redit]').forEach(function (b) { var p = b.dataset.redit.split('|'); b.onclick = function () { var t = T(p[0]); editModal(t, R(t, p[1]), o); }; });
    host.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { delModal(T(b.dataset.del), null, o); }; });
    host.querySelectorAll('[data-rdel]').forEach(function (b) { var p = b.dataset.rdel.split('|'); b.onclick = function () { var t = T(p[0]); delModal(t, R(t, p[1]), o); }; });
    host.querySelectorAll('[data-restore]').forEach(function (b) { b.onclick = function () { var t = T(b.dataset.restore); t.xoa = null; LMS.commit('Khôi phục', 'Hỏi đáp', lopMa(t) + ' · ' + t.noiDung.slice(0, 60)); U.toast('Đã khôi phục câu hỏi', 'ok'); done(); }; });
    host.querySelectorAll('[data-rrestore]').forEach(function (b) { var p = b.dataset.rrestore.split('|'); b.onclick = function () { var t = T(p[0]), r = R(t, p[1]); r.xoa = null; LMS.commit('Khôi phục trả lời', 'Hỏi đáp', lopMa(t) + ' · ' + r.noiDung.slice(0, 60)); U.toast('Đã khôi phục trả lời', 'ok'); done(); }; });
    host.querySelectorAll('[data-best]').forEach(function (b) { var p = b.dataset.best.split('|'); b.onclick = function () { var t = T(p[0]), on = t.giaiQuyet !== p[1]; t.giaiQuyet = on ? p[1] : null; LMS.commit(on ? 'Chọn câu trả lời' : 'Bỏ chọn câu trả lời', 'Hỏi đáp', lopMa(t) + ' · ' + t.noiDung.slice(0, 60)); U.toast(on ? 'Đã chọn câu trả lời đúng, câu hỏi chuyển sang Đã giải quyết' : 'Đã bỏ chọn, câu hỏi mở lại', 'ok'); done(); }; });
    var box = host.querySelector('[data-box]');
    if (!box) return;
    var ta = box.querySelector('#rtxt');
    box.querySelector('[data-cancel]').onclick = function () { var dong = function () { st.box = null; st.boxTo = null; done(); }; if (ta.value.replace(/^@[^:]*:\s*/, '').trim()) U.confirm({ title: 'Bỏ câu trả lời đang soạn?', message: 'Nội dung đang nhập sẽ không được lưu.', ok: 'Bỏ' }).then(function (y) { if (y) dong(); }); else dong(); };
    box.querySelector('#who').onchange = function (e) { st.who = e.target.value; };
    var nt = box.querySelector('[data-noto]'); if (nt) nt.onclick = function () { st.boxTo = null; ta.value = ta.value.replace(/^@[^:]*:\s*/, ''); nt.parentNode.remove(); };
    box.querySelector('#mau').onchange = function (e) { if (e.target.value === '') return; ta.value = (ta.value ? ta.value.replace(/\s*$/, ' ') : '') + MAU[+e.target.value][1]; e.target.value = ''; ta.focus(); };
    ta.onkeydown = function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } };
    box.querySelector('[data-send]').onclick = send;
    function send() {
      var t = T(box.dataset.box), v = ta.value.trim(), body = v.replace(/^@[^:]*:\s*/, '').trim();
      if (body.length < 2) { U.toast('Nhập nội dung trả lời', 'bad'); ta.focus(); return; }
      var w = box.querySelector('#who').value.split(':'); st.who = w.join(':');
      var to = st.boxTo ? R(t, st.boxTo) : null;
      var r = { id: LMS.nextId('tl'), nguoi: w[1], vaiTro: w[0], noiDung: v, ngay: new Date().toISOString(), xoa: null, traLoiCho: to ? to.id : null };
      t.traLoi = t.traLoi || []; t.traLoi.push(r);
      if (box.querySelector('#rdone').checked && t.loai !== 'binh-luan') t.giaiQuyet = r.id;
      var nhan = [t.hv]; if (to && to.vaiTro === 'hv' && to.nguoi !== t.hv) nhan.push(to.nguoi);
      var d = D(); d.thongBao = d.thongBao || []; d.thongBao.push({ id: LMS.nextId('tb'), lop: t.lop, loai: 'tu-dong', tieuDe: 'Có trả lời mới trong hỏi đáp', noiDung: v.slice(0, 160), nguoiNhan: nhan, ngay: r.ngay, nguoiGui: w[1], trangThai: 'da-gui', kenh: { portal: true, email: false }, xem: {}, xacNhan: {}, dinhKem: [] });
      LMS.commit('Trả lời', 'Hỏi đáp', lopMa(t) + ' · ' + t.noiDung.slice(0, 60), null, { nguoi: tenNguoi(r), noiDung: v.slice(0, 120) });
      st.box = null; st.boxTo = null; st.open[t.id] = 1;
      U.toast('Đã gửi trả lời' + (t.giaiQuyet === r.id ? ' và đánh dấu đã giải quyết' : '') + '; ' + (nhan.length > 1 ? nhan.length + ' học viên' : 'học viên') + ' nhận thông báo', 'ok'); done();
    }
  }
  function editModal(t, r, o) {
    var goc = r || t, tacGia = r ? tenNguoi(r) : hvTen(t.hv), laHV = r ? r.vaiTro === 'hv' : true;
    U.modal({
      title: r ? 'Sửa trả lời' : (t.loai === 'binh-luan' ? 'Sửa chủ đề' : 'Sửa câu hỏi'),
      body: '<div class="small muted">' + (r ? 'Trả lời' : 'Câu hỏi') + ' của <b>' + esc(tacGia) + '</b> · ' + LMS.fmtDT(goc.ngay) + '</div>' +
        '<div class="field"><label for="edWho">Thực hiện với tư cách</label><select class="sel" id="edWho" name="who">' + U.opts(whoList(t), 'v', 't', whoMacDinh(t, o)) + '</select></div>' +
        '<div class="field"><label for="ed">Nội dung <span class="req">*</span></label><textarea id="ed" name="nd" rows="5" maxlength="2000">' + esc(goc.noiDung) + '</textarea></div>' +
        (laHV ? '<div class="note info">Sửa nội dung của học viên: bài hiển thị nhãn "đã sửa bởi …", nội dung gốc lưu trong nhật ký hoạt động.</div>' : ''),
      foot: [{ label: 'Hủy', close: true }, { label: 'Lưu', cls: 'primary', onClick: function (a) {
        var v = U.formVals(a.body);
        if (!v.nd || v.nd.length < 2) { U.fieldErr(a.body, 'nd', 'Nhập nội dung'); return false; }
        if (v.nd === goc.noiDung) { U.toast('Nội dung không thay đổi'); return; }
        var cu = goc.noiDung; goc.noiDung = v.nd; goc.sua = { luc: new Date().toISOString(), nguoi: v.who, ten: whoTen(v.who) }; if (!goc.noiDungGoc) goc.noiDungGoc = cu;
        o.st.who = v.who;
        LMS.commit(r ? 'Sửa trả lời' : 'Sửa câu hỏi', 'Hỏi đáp', lopMa(t) + ' · ' + (r ? tacGia + ' · ' : '') + t.noiDung.slice(0, 60) + ' · ' + whoTen(v.who), { noiDung: cu.slice(0, 160) }, { noiDung: v.nd.slice(0, 160) });
        U.toast('Đã lưu nội dung', 'ok'); if (o.onChange) o.onChange();
      } }]
    });
  }
  function delModal(t, r, o) {
    var n = reps(t).length, what = r ? 'trả lời của ' + tenNguoi(r) : (t.loai === 'binh-luan' ? 'chủ đề' : 'câu hỏi') + ' của ' + hvTen(t.hv);
    var con = r ? reps(t).filter(function (x) { return x.traLoiCho === r.id; }).length : 0;
    U.modal({
      title: 'Xóa ' + (r ? 'trả lời' : t.loai === 'binh-luan' ? 'chủ đề' : 'câu hỏi'), size: 'sm',
      body: '<div class="small">Xóa ' + esc(what) + '?' + (!r && n ? ' Có ' + n + ' trả lời bên trong, tất cả ẩn theo câu hỏi.' : '') + (con ? ' Có ' + con + ' trả lời nhắc tới nội dung này, các trả lời đó vẫn giữ.' : '') + (r && t.giaiQuyet === r.id ? ' Đây là câu trả lời được chọn; câu hỏi sẽ mở lại.' : '') + '</div>' +
        '<div class="field"><label for="dWho">Thực hiện với tư cách</label><select class="sel" id="dWho" name="who">' + U.opts(whoList(t), 'v', 't', whoMacDinh(t, o)) + '</select></div>' +
        '<div class="field"><label for="ly">Lý do <span class="req">*</span></label><select class="sel" id="ly" name="ly">' + U.opts(LY_DO, null, null, '') + '</select></div><div class="muted small">Nội dung lưu vết trong nhật ký và khôi phục được khi cần.</div>',
      foot: [{ label: 'Hủy', close: true }, { label: 'Xóa', cls: 'danger solid', onClick: function (a) {
        var v = U.formVals(a.body), x = { nguoi: whoTen(v.who), vaiTro: v.who.split(':')[0], luc: new Date().toISOString(), lyDo: v.ly };
        if (r) { r.xoa = x; if (t.giaiQuyet === r.id) t.giaiQuyet = null; } else t.xoa = x;
        o.st.who = v.who; if (o.st.box === t.id && !r) o.st.box = null;
        LMS.commit('Xóa', 'Hỏi đáp', lopMa(t) + ' · ' + (r ? r.noiDung : t.noiDung).slice(0, 60) + ' · ' + v.ly + ' · ' + x.nguoi, { noiDung: (r ? r.noiDung : t.noiDung).slice(0, 160) }, null);
        U.toast('Đã xóa ' + (r ? 'trả lời' : t.loai === 'binh-luan' ? 'chủ đề' : 'câu hỏi'), 'ok'); if (o.onChange) o.onChange();
      } }]
    });
  }
  function moreMenu(btn, t, o) {
    var l = LMS.byId('lop', t.lop), c = cho(t), done = function () { if (o.onChange) o.onChange(); };
    U.menu(btn, [
      { label: t.ghim ? 'Bỏ ghim' : 'Ghim lên đầu lớp', onClick: function () { t.ghim = !t.ghim; LMS.commit(t.ghim ? 'Ghim' : 'Bỏ ghim', 'Hỏi đáp', lopMa(t) + ' · ' + t.noiDung.slice(0, 60)); U.toast(t.ghim ? 'Đã ghim chủ đề' : 'Đã bỏ ghim', 'ok'); done(); } },
      t.loai !== 'binh-luan' ? { label: t.giaiQuyet ? 'Mở lại câu hỏi' : 'Đánh dấu đã giải quyết', onClick: function () { if (t.giaiQuyet) t.giaiQuyet = null; else { var g = reps(t).filter(function (r) { return r.vaiTro !== 'hv'; }); t.giaiQuyet = g.length ? g[g.length - 1].id : '__dong'; } LMS.commit(t.giaiQuyet ? 'Đánh dấu giải quyết' : 'Mở lại', 'Hỏi đáp', lopMa(t) + ' · ' + t.noiDung.slice(0, 60)); U.toast(t.giaiQuyet ? 'Đã đánh dấu đã giải quyết' : 'Đã mở lại câu hỏi', 'ok'); done(); } } : null,
      { label: t.loai === 'binh-luan' ? 'Chuyển thành câu hỏi' : 'Chuyển thành bình luận', onClick: function () { var cu = t.loai; t.loai = cu === 'binh-luan' ? 'cau-hoi' : 'binh-luan'; if (t.loai === 'binh-luan') t.giaiQuyet = null; LMS.commit('Đổi loại', 'Hỏi đáp', lopMa(t) + ' · ' + t.noiDung.slice(0, 60), { loai: cu === 'binh-luan' ? 'Bình luận' : 'Câu hỏi' }, { loai: t.loai === 'binh-luan' ? 'Bình luận' : 'Câu hỏi' }); U.toast('Đã chuyển loại chủ đề', 'ok'); done(); } },
      { label: 'Chuyển sang bài giảng khác', onClick: function () { moveModal(t, o); } },
      c ? { label: 'Nhắc giảng viên trả lời', disabled: !(l && l.giangVien.length), title: 'Lớp chưa phân công giảng viên', onClick: function () { remindGV(t, o); } } : null,
      { label: t.rieng ? 'Chuyển thành công khai' : 'Chuyển thành riêng với giảng viên', onClick: function () { t.rieng = !t.rieng; LMS.commit('Đổi phạm vi', 'Hỏi đáp', lopMa(t) + ' · ' + t.noiDung.slice(0, 60), { rieng: !t.rieng }, { rieng: t.rieng }); U.toast(t.rieng ? 'Chỉ học viên hỏi và giảng viên thấy chủ đề' : 'Cả lớp thấy chủ đề', 'ok'); done(); } },
      '-',
      { label: t.an ? 'Hiện lại với học viên' : 'Ẩn với học viên', onClick: function () { var go = function () { t.an = !t.an; LMS.commit(t.an ? 'Ẩn' : 'Hiện lại', 'Hỏi đáp', lopMa(t) + ' · ' + t.noiDung.slice(0, 60)); U.toast(t.an ? 'Đã ẩn chủ đề' : 'Đã hiện lại chủ đề', 'ok'); done(); }; if (!t.an) U.confirm({ title: 'Ẩn chủ đề', message: 'Học viên sẽ không thấy chủ đề này; quản trị vẫn xem được khi bật "Hiện chủ đề đã ẩn/xóa".', ok: 'Ẩn chủ đề' }).then(function (y) { if (y) go(); }); else go(); } }
    ]);
  }
  function moveModal(t, o) {
    var l = LMS.byId('lop', t.lop), hp = l && LMS.hocPhanOfLop(l); if (!hp) return;
    U.modal({ title: 'Chuyển sang bài giảng khác', size: 'sm', body: '<div class="field"><label for="mb">Bài giảng</label><select class="sel" id="mb" name="b">' + U.opts(hp.bai, 'id', 'ten', t.bai, 'Chung (không gắn bài)') + '</select></div><div class="muted small">Dùng khi học viên đặt câu hỏi nhầm bài; câu hỏi sẽ hiện dưới bài giảng mới.</div>',
      foot: [{ label: 'Hủy', close: true }, { label: 'Chuyển', cls: 'primary', onClick: function (a) { var nb = U.formVals(a.body).b || null, cu = baiOf(t); t.bai = nb; LMS.commit('Chuyển bài', 'Hỏi đáp', lopMa(t) + ' · ' + t.noiDung.slice(0, 60), { bai: cu ? cu.ten : 'Chung' }, { bai: baiOf(t) ? baiOf(t).ten : 'Chung' }); U.toast('Đã chuyển chủ đề', 'ok'); if (o.onChange) o.onChange(); } }] });
  }
  function remindGV(t, o) {
    var l = LMS.byId('lop', t.lop), gvs = l.giangVien.map(function (g) { return LMS.byId('giangVien', g); }).filter(Boolean);
    U.modal({ title: 'Nhắc giảng viên trả lời', size: 'sm', body: '<div class="small">Gửi tới: <b>' + esc(gvs.map(function (g) { return g.hoTen; }).join(', ')) + '</b></div><div class="field"><label for="nh">Nội dung</label><textarea id="nh" name="nd" rows="4">Lớp ' + esc(l.ma) + ' có câu hỏi của học viên ' + esc(hvTen(t.hv)) + ' đã chờ ' + tuoi(t.ngay) + ': "' + esc(t.noiDung.slice(0, 120)) + '". Thầy/cô vui lòng phản hồi giúp.</textarea></div>',
      foot: [{ label: 'Hủy', close: true }, { label: 'Gửi nhắc', cls: 'primary', onClick: function (a) { var v = U.formVals(a.body).nd; var d = D(); d.thongBao = d.thongBao || []; d.thongBao.push({ id: LMS.nextId('tb'), lop: l.id, loai: 'tu-dong', tieuDe: 'Nhắc trả lời hỏi đáp', noiDung: v, nguoiNhan: l.giangVien.slice(), ngay: new Date().toISOString(), nguoiGui: D().meta.user.ten, trangThai: 'da-gui', kenh: { portal: true, email: true }, xem: {}, xacNhan: {}, dinhKem: [] }); t.nhacLuc = new Date().toISOString(); LMS.commit('Nhắc giảng viên', 'Hỏi đáp', l.ma + ' · ' + t.noiDung.slice(0, 60)); U.toast('Đã gửi nhắc tới ' + gvs.length + ' giảng viên', 'ok'); if (o.onChange) o.onChange(); } }] });
  }
  function csvRows(list) {
    var rows = [['Lớp', 'Bài giảng', 'Học viên', 'Nội dung', 'Ngày hỏi', 'Loại', 'Phạm vi', 'Trạng thái', 'Số trả lời', 'Trả lời đầu tiên của GV/QT', 'Thời gian phản hồi (giờ)']];
    list.forEach(function (t) { var b = baiOf(t), f = reps(t).find(function (r) { return r.vaiTro !== 'hv'; }); rows.push([lopMa(t), b ? b.ten : 'Chung', hvTen(t.hv), t.noiDung, LMS.fmtDT(t.ngay), t.loai === 'binh-luan' ? 'Bình luận' : 'Câu hỏi', t.rieng ? 'Riêng' : 'Công khai', t.xoa ? 'Đã xóa' : t.giaiQuyet ? 'Đã giải quyết' : daTL(t) ? 'Đã trả lời' : 'Chưa trả lời', reps(t).length, f ? LMS.fmtDT(f.ngay) : '', f ? Math.round((new Date(f.ngay) - new Date(t.ngay)) / 3600000) : '']); });
    return rows;
  }
  function taiCsv(ten, rows) {
    var csv = '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = ten; document.body.appendChild(a); a.click(); a.remove(); U.toast('Đã xuất ' + (rows.length - 1) + ' chủ đề', 'ok'); } catch (e) { U.toast('Trình duyệt chặn tải tệp', 'bad'); }
  }

  LMS.hoiDapUI = { render: render, cho: cho, quaHan: quaHan, daTL: daTL, reps: reps, lastAt: lastAt, baiOf: baiOf, hvTen: hvTen, gvTen: gvTen, tenNguoi: tenNguoi, tuoi: tuoi, lopMa: lopMa, csvRows: csvRows, taiCsv: taiCsv };
})();
