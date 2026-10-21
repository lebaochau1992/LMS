/* =====================================================================
   lms-sach.js — GIÁO TRÌNH LẬT TRANG (dùng chung Cổng quản trị và Cổng học viên)
   ---------------------------------------------------------------------
   Khối nội dung loại 'giao-trinh': giảng viên gắn một tệp giáo trình PDF hoặc Word
   (.pdf, .doc, .docx); học viên đọc trực tuyến dạng sách, lật từng trang.

   API
     LMS.sach.mount(host, o)   dựng trình đọc vào phần tử host, trả về controller
        o.file      bản ghi thư viện (LMS.byId('thuVien', id))
        o.tieuDe    tiêu đề hiển thị trên thanh công cụ
        o.cheDo     'tu-dong' (mặc định: 2 trang khi đủ rộng, 1 trang khi hẹp) | 'doi' | 'don'
        o.taiVe     true → hiện nút Tải về
        o.daXem     mảng số thứ tự trang (0-based) đã đọc trước đó — để tô tiến độ
        o.onTrang   function(daXem[], tongTrang) gọi mỗi khi có trang mới được mở
        o.ghiChu    dòng chú thích nhỏ dưới sách (tùy chọn)
     LMS.sach.trang(file)      Promise → mảng trang { html } hoặc { ve: function(el) } (PDF thật)
     LMS.sach.ghiTep(id, File) giữ nội dung tệp vừa tải lên trong phiên (bản demo không lưu nội dung tệp)
     LMS.sach.demTrang(File)   Promise → số trang thật của tệp (PDF: pdf.js; Word: phân trang sau chuyển đổi)

   NGUỒN TRANG (theo thứ tự ưu tiên)
     1. Tệp vừa tải lên trong phiên: PDF dựng bằng pdf.js, Word chuyển sang HTML bằng mammoth rồi phân trang.
     2. Tệp mẫu có khóa file.mau → nội dung trong GT_MAU bên dưới, phân trang tự động.
     3. Còn lại: trang giữ chỗ (đánh số trang, tên tệp) theo file.soTrang.
   Hệ thống thật: máy chủ chuyển Word → PDF khi tải lên (LibreOffice headless), lưu số trang vào
   thuVien.soTrang, trả từng trang dạng ảnh/PDF theo quyền xem (không cho tải nếu khối tắt taiVe).

   PHÂN TRANG HTML: mỗi trang thiết kế cố định 480 × 679 px (tỉ lệ A4), lề 36/40 px, chữ 13px.
   Phần tử được xếp lần lượt vào trang, tràn thì sang trang mới. Trang hiển thị được phóng/thu
   bằng transform: scale theo bề rộng thực — bố cục trang không đổi theo màn hình.

   TIẾN ĐỘ ĐỌC: trang được tính "đã đọc" khi hiển thị ≥ 3 giây. Điều kiện hoàn thành bài dùng
   tỉ lệ trang đã đọc so với tiêu chí "Xem nội dung đạt tối thiểu x%" của học phần (xem hv-core.js
   dieuKienBai).
   ===================================================================== */
(function () {
  'use strict';
  if (!window.LMS) return;
  var esc = LMS.ui.esc;
  var PW = 480, PH = 679;               /* kích thước trang thiết kế (px) */
  var CDN = {
    pdf: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    pdfWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    mammoth: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
  };
  var blobs = {};                        /* id tệp → File (chỉ trong phiên) */
  var cache = {};

  /* ---------------- nội dung giáo trình mẫu ---------------- */
  /* mỗi phần tử: ['h1'|'h2'|'h3'|'p'|'li'|'hinh'|'note'|'bia'|'ngat', nội dung] */
  var GT_MAU = {
    'cc1-ch1': {
      ten: 'Giáo trình Châm cứu 1 — Chương I. Đại cương châm cứu',
      noi: [
        ['bia', { tren: 'HỌC VIỆN Y DƯỢC HỌC CỔ TRUYỀN VIỆT NAM', ten: 'GIÁO TRÌNH<br>CHÂM CỨU 1', phu: 'Chương I. Đại cương châm cứu', duoi: 'Dùng cho đào tạo bác sĩ Y học cổ truyền<br>Tài liệu mẫu của bản demo' }],
        ['muc-luc', null],
        ['h1', 'Lời nói đầu'],
        ['p', 'Châm cứu là một phương pháp chữa bệnh độc đáo của y học cổ truyền phương Đông, đã được nhân dân ta sử dụng từ lâu đời và ngày càng được thế giới thừa nhận. Giáo trình Châm cứu 1 được biên soạn nhằm cung cấp cho sinh viên những kiến thức nền tảng về lịch sử, cơ chế tác dụng, học thuyết kinh lạc và hệ thống huyệt vị thường dùng.'],
        ['p', 'Chương I trình bày khái quát về châm cứu: khái niệm, lịch sử hình thành và phát triển, cơ chế tác dụng theo y học cổ truyền và y học hiện đại, chỉ định và chống chỉ định chung. Đây là cơ sở để sinh viên học tiếp các chương về kinh lạc, huyệt vị và kỹ thuật châm cứu.'],
        ['note', 'Nội dung trong giáo trình mẫu chỉ dùng để minh họa chức năng đọc giáo trình lật trang của hệ thống.'],
        ['ngat'],
        ['h1', '1. Khái niệm châm cứu'],
        ['p', 'Châm cứu là tên gọi chung của hai phương pháp: châm và cứu. Châm là dùng kim châm vào huyệt để kích thích, điều hòa hoạt động của kinh lạc, tạng phủ. Cứu là dùng sức nóng (thường từ ngải cứu khô) tác động lên huyệt để làm ấm kinh lạc, khu hàn, hành khí hoạt huyết.'],
        ['p', 'Hai phương pháp có chung cơ sở lý luận là học thuyết âm dương, ngũ hành, tạng phủ và kinh lạc; cùng tác động lên hệ thống huyệt vị nhằm lập lại cân bằng âm dương của cơ thể. Trong thực hành, châm và cứu có thể dùng riêng hoặc phối hợp tùy theo chứng bệnh.'],
        ['h2', '1.1. Châm'],
        ['p', 'Dụng cụ châm đã phát triển từ kim đá (biếm thạch) thời cổ, kim xương, kim tre đến kim kim loại. Ngày nay thường dùng hào châm bằng thép không gỉ, dùng một lần. Ngoài hào châm còn có các phương pháp châm khác như điện châm, thủy châm, nhĩ châm, mai hoa châm, cấy chỉ.'],
        ['h2', '1.2. Cứu'],
        ['p', 'Cứu dùng điếu ngải hoặc mồi ngải đặt trên huyệt hoặc hơ gần huyệt. Các cách cứu thường gặp: cứu điếu ngải (cứu ấm, cứu mổ cò, cứu xoay tròn), cứu mồi ngải trực tiếp hoặc gián tiếp qua lát gừng, tỏi, muối. Cứu đặc biệt thích hợp với các chứng hàn, hư.'],
        ['hinh', { ten: 'Hình 1.1. Một số dụng cụ châm cứu thường dùng', ve: 'kim' }],
        ['h1', '2. Lịch sử châm cứu'],
        ['h2', '2.1. Trên thế giới'],
        ['p', 'Châm cứu ra đời từ rất sớm ở vùng Đông Á. Những mảnh đá mài nhọn (biếm thạch) được xem là dụng cụ châm đầu tiên. Lý luận châm cứu được hệ thống hóa trong bộ Hoàng Đế Nội Kinh, đặc biệt là phần Linh Khu, trình bày về kinh lạc, huyệt vị và phép châm.'],
        ['p', 'Qua các triều đại, nhiều tác phẩm chuyên về châm cứu tiếp tục được biên soạn, hệ thống huyệt được bổ sung và chuẩn hóa vị trí. Từ thế kỷ XVII, châm cứu được giới thiệu sang châu Âu; đến nửa sau thế kỷ XX, châm cứu lan rộng ra nhiều nước và được nghiên cứu theo phương pháp của y học hiện đại.'],
        ['p', 'Tổ chức Y tế Thế giới đã xây dựng danh pháp chuẩn quốc tế cho huyệt châm cứu và vị trí huyệt, tạo điều kiện cho việc giảng dạy, nghiên cứu và trao đổi học thuật giữa các nước.'],
        ['h2', '2.2. Ở Việt Nam'],
        ['p', 'Châm cứu được sử dụng ở nước ta từ lâu đời, gắn với nền y học dân tộc. Danh y Tuệ Tĩnh (thế kỷ XIV) chủ trương "Nam dược trị Nam nhân", trong các tác phẩm của ông có phần nói về châm cứu và các huyệt thường dùng. Hải Thượng Lãn Ông Lê Hữu Trác (thế kỷ XVIII) trong bộ Hải Thượng y tông tâm lĩnh cũng đề cập đến việc phối hợp châm cứu trong điều trị.'],
        ['p', 'Sau năm 1954, y học cổ truyền được Nhà nước quan tâm phát triển theo hướng kết hợp với y học hiện đại. Các cơ sở nghiên cứu và điều trị bằng châm cứu được thành lập; nhiều phương pháp như điện châm, thủy châm, cấy chỉ được ứng dụng rộng rãi trong giảm đau, phục hồi chức năng và điều trị nhiều chứng bệnh.'],
        ['p', 'Ngày nay, châm cứu là học phần bắt buộc trong chương trình đào tạo bác sĩ y học cổ truyền và được giảng dạy ở các cơ sở đào tạo y khoa trong cả nước.'],
        ['h1', '3. Cơ chế tác dụng theo y học cổ truyền'],
        ['p', 'Theo y học cổ truyền, bệnh tật phát sinh khi cân bằng âm dương bị phá vỡ, khí huyết vận hành trong kinh lạc bị ứ trệ hoặc hư suy. Châm cứu tác động vào huyệt trên đường kinh để điều hòa âm dương, phù chính khu tà và sơ thông kinh lạc.'],
        ['h2', '3.1. Điều hòa âm dương'],
        ['p', 'Châm cứu giúp lập lại thế cân bằng giữa âm và dương: bệnh do dương thịnh thì dùng phép tả, bệnh do âm hư thì dùng phép bổ. Việc chọn huyệt, chọn thủ pháp bổ tả và thời gian lưu kim đều nhằm mục đích này.'],
        ['h2', '3.2. Phù chính khu tà'],
        ['p', 'Chính khí là sức đề kháng của cơ thể, tà khí là các tác nhân gây bệnh. Châm cứu vừa nâng cao chính khí (phép bổ, phép cứu), vừa đuổi tà khí ra ngoài (phép tả), giúp cơ thể chống lại bệnh tật.'],
        ['h2', '3.3. Sơ thông kinh lạc'],
        ['p', 'Kinh lạc là đường vận hành khí huyết, nối liền tạng phủ với bên ngoài cơ thể. Khi kinh lạc bị bế tắc sẽ gây đau ("thống tắc bất thông"). Châm cứu làm thông kinh lạc, khí huyết lưu thông thì hết đau.'],
        ['hinh', { ten: 'Hình 1.2. Sơ đồ vận hành khí huyết trong hệ kinh lạc', ve: 'kinh' }],
        ['h1', '4. Cơ chế tác dụng theo y học hiện đại'],
        ['p', 'Nhiều giả thuyết đã được đưa ra để giải thích tác dụng của châm cứu. Các giả thuyết bổ sung cho nhau, chưa có giả thuyết nào giải thích được toàn bộ tác dụng lâm sàng.'],
        ['h2', '4.1. Học thuyết thần kinh'],
        ['p', 'Kích thích của kim châm tại huyệt tạo ra cung phản xạ mới, ức chế cung phản xạ bệnh lý. Theo thuyết "cổng kiểm soát" do Melzack và Wall đề xuất năm 1965, các xung động từ sợi thần kinh có đường kính lớn do châm kích thích sẽ đóng "cổng" ở sừng sau tủy sống, làm giảm dẫn truyền cảm giác đau lên não.'],
        ['h2', '4.2. Học thuyết thể dịch'],
        ['p', 'Châm cứu làm tăng tiết các chất giảm đau nội sinh như endorphin, enkephalin; đồng thời ảnh hưởng đến các chất dẫn truyền thần kinh như serotonin, noradrenalin. Đây là cơ sở của châm tê và điều trị giảm đau bằng châm cứu.'],
        ['h2', '4.3. Tác dụng điều hòa miễn dịch, tuần hoàn'],
        ['p', 'Nhiều nghiên cứu ghi nhận châm cứu có tác dụng điều hòa chức năng miễn dịch, cải thiện vi tuần hoàn tại chỗ, giãn cơ và chống viêm, góp phần vào hiệu quả điều trị các chứng đau và rối loạn chức năng.'],
        ['h1', '5. Chỉ định và chống chỉ định'],
        ['h2', '5.1. Chỉ định'],
        ['li', 'Các chứng đau: đau đầu, đau vai gáy, đau thắt lưng, đau dây thần kinh.'],
        ['li', 'Rối loạn chức năng: mất ngủ, rối loạn tiêu hóa, rối loạn kinh nguyệt.'],
        ['li', 'Phục hồi chức năng sau liệt dây thần kinh VII ngoại biên, sau tai biến mạch máu não.'],
        ['li', 'Châm tê để tiến hành một số phẫu thuật.'],
        ['h2', '5.2. Chống chỉ định'],
        ['li', 'Các trường hợp bệnh lý cấp cứu cần can thiệp ngoại khoa hoặc hồi sức.'],
        ['li', 'Người bệnh đang đói, quá mệt, vừa lao động nặng, tinh thần quá căng thẳng.'],
        ['li', 'Không châm vào vùng da bị viêm nhiễm, lở loét; thận trọng với phụ nữ có thai ở các huyệt vùng bụng, thắt lưng.'],
        ['li', 'Người có rối loạn đông máu hoặc đang dùng thuốc chống đông liều cao.'],
        ['h1', 'Câu hỏi ôn tập'],
        ['li', '1. Trình bày khái niệm châm và cứu. Nêu điểm giống và khác nhau giữa hai phương pháp.'],
        ['li', '2. Tóm tắt lịch sử phát triển châm cứu ở Việt Nam.'],
        ['li', '3. Trình bày cơ chế tác dụng của châm cứu theo y học cổ truyền.'],
        ['li', '4. Giải thích tác dụng giảm đau của châm cứu theo thuyết cổng kiểm soát và thuyết thể dịch.'],
        ['li', '5. Nêu các chỉ định và chống chỉ định chung của châm cứu.']
      ]
    },
    'cc2-b1': {
      ten: 'Giáo trình Châm cứu 2 — Bài 1. Nguyên tắc chọn huyệt',
      noi: [
        ['bia', { tren: 'HỌC VIỆN Y DƯỢC HỌC CỔ TRUYỀN VIỆT NAM', ten: 'GIÁO TRÌNH<br>CHÂM CỨU 2', phu: 'Bài 1. Nguyên tắc chọn huyệt', duoi: 'Bản Word — chuyển đổi để đọc trực tuyến<br>Tài liệu mẫu của bản demo' }],
        ['muc-luc', null],
        ['h1', 'Mục tiêu'],
        ['li', 'Trình bày được các nguyên tắc chọn huyệt cơ bản trong điều trị bằng châm cứu.'],
        ['li', 'Vận dụng được cách phối hợp huyệt cho một số chứng bệnh thường gặp.'],
        ['h1', '1. Chọn huyệt tại chỗ'],
        ['p', 'Huyệt tại chỗ là huyệt nằm ở vùng bị bệnh hoặc gần vùng bị bệnh. Đây là cách chọn huyệt phổ biến nhất, dựa trên tác dụng tại chỗ của huyệt. Ví dụ: đau vai chọn Kiên ngung, Kiên trinh; đau gối chọn Độc tỵ, Tất nhãn.'],
        ['h1', '2. Chọn huyệt lân cận'],
        ['p', 'Huyệt lân cận là huyệt nằm gần vùng bị bệnh, thường dùng phối hợp với huyệt tại chỗ hoặc thay thế khi vùng bệnh không châm được (vết thương, viêm nhiễm). Ví dụ: bệnh ở mắt chọn Phong trì, Thái dương.'],
        ['h1', '3. Chọn huyệt theo đường kinh'],
        ['p', 'Dựa vào đường đi của kinh lạc, bệnh ở đâu thuộc kinh nào thì chọn huyệt ở xa trên đường kinh đó, thường là các huyệt ở dưới khuỷu tay và đầu gối. Ví dụ: đau răng hàm dưới chọn Hợp cốc thuộc kinh Thủ dương minh Đại trường; bệnh vùng thắt lưng chọn Ủy trung thuộc kinh Túc thái dương Bàng quang.'],
        ['hinh', { ten: 'Hình 1. Huyệt Hợp cốc và đường đi kinh Đại trường', ve: 'kinh' }],
        ['h1', '4. Chọn huyệt theo triệu chứng'],
        ['p', 'Một số huyệt có tác dụng đặc hiệu với triệu chứng: sốt chọn Đại chùy, Khúc trì; mất ngủ chọn Thần môn, Tam âm giao; nôn chọn Nội quan, Túc tam lý.'],
        ['h1', '5. Phối hợp huyệt'],
        ['p', 'Trong thực hành thường phối hợp nhiều cách chọn huyệt: huyệt tại chỗ với huyệt ở xa, huyệt trên với huyệt dưới, huyệt trước với huyệt sau, huyệt du với huyệt mộ, huyệt nguyên với huyệt lạc. Số lượng huyệt mỗi lần châm nên vừa đủ, tránh dàn trải.'],
        ['note', 'Tài liệu mẫu minh họa giáo trình dạng Word: hệ thống chuyển đổi sang trang sách để học viên đọc trực tuyến.'],
        ['h1', 'Câu hỏi ôn tập'],
        ['li', '1. Kể tên và cho ví dụ các nguyên tắc chọn huyệt.'],
        ['li', '2. Nêu các cách phối hợp huyệt thường dùng.']
      ]
    }
  };

  /* hình vẽ minh họa trong giáo trình mẫu (SVG đơn sắc) */
  function hinh(ve) {
    if (ve === 'kim') return '<svg viewBox="0 0 300 110" width="100%"><g stroke="#334155" stroke-width="2" fill="none"><line x1="20" y1="20" x2="280" y2="20"/><rect x="20" y="15" width="60" height="10" rx="2" fill="#cbd5e1"/><line x1="20" y1="55" x2="220" y2="55"/><rect x="20" y="50" width="50" height="10" rx="2" fill="#cbd5e1"/><line x1="20" y1="90" x2="160" y2="90"/><rect x="20" y="85" width="40" height="10" rx="2" fill="#cbd5e1"/></g><g font-size="10" fill="#475569" font-family="Inter,Arial"><text x="200" y="38">Hào châm 75 mm</text><text x="150" y="73">Hào châm 50 mm</text><text x="100" y="108">Hào châm 25 mm</text></g></svg>';
    return '<svg viewBox="0 0 300 140" width="100%"><g fill="none" stroke="#334155" stroke-width="1.6"><ellipse cx="150" cy="30" rx="18" ry="20"/><path d="M150 50 L150 110 M150 62 L105 95 M150 62 L195 95 M150 110 L125 138 M150 110 L175 138"/></g><path d="M105 95 C120 80 135 70 150 62 C165 54 175 40 168 22" stroke="#00327d" stroke-width="2.4" fill="none" stroke-dasharray="5 4"/><g fill="#b45309"><circle cx="105" cy="95" r="4"/><circle cx="130" cy="74" r="4"/><circle cx="168" cy="22" r="4"/></g><g font-size="10" fill="#475569" font-family="Inter,Arial"><text x="20" y="100">Huyệt đầu kinh</text><text x="200" y="22">Huyệt cuối kinh</text></g></svg>';
  }

  /* ---------------- phân trang HTML ---------------- */
  function mauHtml(it, toc) {
    var t = it[0], v = it[1];
    if (t === 'h1') return '<h1 data-toc="' + toc.length + '">' + esc(v) + '</h1>';
    if (t === 'h2') return '<h2>' + esc(v) + '</h2>';
    if (t === 'h3') return '<h3>' + esc(v) + '</h3>';
    if (t === 'p') return '<p>' + esc(v) + '</p>';
    if (t === 'li') return '<p class="fb-li">' + esc(v) + '</p>';
    if (t === 'note') return '<p class="fb-nt">' + esc(v) + '</p>';
    if (t === 'hinh') return '<figure>' + hinh(v.ve) + '<figcaption>' + esc(v.ten) + '</figcaption></figure>';
    return '';
  }
  var measurer;
  function doLuong() {
    if (measurer) return measurer;
    measurer = document.createElement('div');
    measurer.className = 'fb-pi fb-measure';
    measurer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(measurer);
    return measurer;
  }
  /* xếp danh sách chuỗi HTML (mỗi chuỗi một phần tử khối) vào các trang cao PH */
  function phanTrang(parts, dau) {
    var m = doLuong(), pages = [], cur = [], body;
    function moi() { m.innerHTML = '<div class="fb-body"></div>'; body = m.firstChild; cur = []; }
    function dong() { if (cur.length) pages.push(cur.join('')); moi(); }
    moi();
    parts.forEach(function (h) {
      if (h === '<!--ngat-->') { dong(); return; }
      body.insertAdjacentHTML('beforeend', h); cur.push(h);
      if (m.scrollHeight > PH + 1 && cur.length > 1) {
        body.removeChild(body.lastChild); cur.pop();
        /* tiêu đề không nằm cuối trang */
        var tail = [];
        while (cur.length > 1 && /^<h[123]/.test(cur[cur.length - 1])) { tail.unshift(cur.pop()); }
        dong(); tail.concat([h]).forEach(function (x) { body.insertAdjacentHTML('beforeend', x); cur.push(x); });
      }
    });
    dong();
    return (dau || []).concat(pages);
  }
  function tuMau(key, file) {
    var g = GT_MAU[key]; if (!g) return null;
    var toc = [], parts = [], bia = null, coML = false;
    g.noi.forEach(function (it) {
      if (it[0] === 'bia') { bia = it[1]; return; }
      if (it[0] === 'muc-luc') { coML = true; return; }
      if (it[0] === 'ngat') { parts.push('<!--ngat-->'); return; }
      if (it[0] === 'h1') toc.push({ t: it[1] });
      parts.push(mauHtml(it, toc.length ? toc.slice(0, -1) : toc));
    });
    /* đánh dấu h1 bằng chỉ số mục lục */
    var k = 0; parts = parts.map(function (h) { return /^<h1 /.test(h) ? h.replace(/data-toc="\d+"/, 'data-toc="' + (k++) + '"') : h; });
    var dau = [];
    if (bia) dau.push('<div class="fb-cover"><div class="t1">' + esc(bia.tren) + '</div><div class="t2">' + bia.ten + '</div><div class="t3">' + esc(bia.phu) + '</div><div class="t4">' + bia.duoi + '</div></div>');
    var pages = phanTrang(parts, dau.concat(coML ? ['<!--ml-->'] : []));
    /* xác định trang của từng mục */
    pages.forEach(function (p, i) { var re = /data-toc="(\d+)"/g, mm; while ((mm = re.exec(p))) toc[+mm[1]].p = i; });
    var out = pages.map(function (p) {
      if (p === '<!--ml-->') return '<div class="fb-body"><h1>Mục lục</h1>' + toc.map(function (x) { return '<div class="toc-r"><span>' + esc(x.t) + '</span><i></i><b>' + (x.p + 1) + '</b></div>'; }).join('') + '</div>';
      return /^<div class="fb-(cover|body)/.test(p) ? p : '<div class="fb-body">' + p + '</div>';
    });
    return { pages: out.map(function (h) { return { html: h }; }), toc: toc.map(function (x) { return { t: x.t, p: x.p }; }) };
  }
  function giuCho(file) {
    var n = Math.max(1, +file.soTrang || 12), pages = [];
    for (var i = 0; i < n; i++) pages.push({ html: '<div class="fb-body fb-ph"><div class="ph-h">' + esc(file.ten) + '</div>' + (i === 0 ? '<h1>' + esc(file.ten.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ')) + '</h1>' : '') + '<div class="ph-l"></div><div class="ph-l"></div><div class="ph-l s"></div><div class="ph-l"></div><div class="ph-l"></div><div class="ph-l s"></div><div class="ph-l"></div><div class="ph-l m"></div><div class="ph-note">Nội dung trang ' + (i + 1) + ' hiển thị từ tệp gốc trên hệ thống thật</div></div>' });
    return { pages: pages, toc: [] };
  }

  /* ---------------- tải thư viện ngoài khi cần ---------------- */
  var nap = {};
  function napScript(src) {
    if (nap[src]) return nap[src];
    nap[src] = new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { delete nap[src]; no(new Error('Không tải được ' + src)); }; document.head.appendChild(s); });
    return nap[src];
  }
  function laPdf(f) { return /\.pdf$/i.test(f.name || f.ten || '') || f.type === 'application/pdf'; }
  function laWord(f) { return /\.docx?$/i.test(f.name || f.ten || ''); }
  function pdfDoc(blob) {
    return napScript(CDN.pdf).then(function () {
      var lib = window.pdfjsLib; lib.GlobalWorkerOptions.workerSrc = CDN.pdfWorker;
      return blob.arrayBuffer().then(function (buf) { return lib.getDocument({ data: buf }).promise; });
    });
  }
  function tuPdf(blob) {
    return pdfDoc(blob).then(function (doc) {
      var pages = [];
      for (var i = 1; i <= doc.numPages; i++) (function (n) {
        pages.push({ ve: function (el) {
          if (el.dataset.ve) return; el.dataset.ve = '1';
          doc.getPage(n).then(function (pg) {
            var v0 = pg.getViewport({ scale: 1 }), sc = (PW * 2) / v0.width, vp = pg.getViewport({ scale: sc });
            var c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; c.className = 'fb-canvas';
            el.innerHTML = ''; el.appendChild(c);
            pg.render({ canvasContext: c.getContext('2d'), viewport: vp });
          });
        } });
      })(i);
      return { pages: pages, toc: [] };
    });
  }
  function tuWord(blob) {
    return napScript(CDN.mammoth).then(function () {
      return blob.arrayBuffer().then(function (buf) { return window.mammoth.convertToHtml({ arrayBuffer: buf }); });
    }).then(function (r) {
      var box = document.createElement('div'); box.innerHTML = r.value;
      var parts = [], toc = [];
      [].slice.call(box.children).forEach(function (el) {
        if (/^H1$/.test(el.tagName)) { el.setAttribute('data-toc', toc.length); toc.push({ t: el.textContent }); }
        parts.push(el.outerHTML);
      });
      var pages = phanTrang(parts);
      pages.forEach(function (p, i) { var re = /data-toc="(\d+)"/g, mm; while ((mm = re.exec(p))) toc[+mm[1]].p = i; });
      return { pages: pages.map(function (h) { return { html: '<div class="fb-body">' + h + '</div>' }; }), toc: toc };
    });
  }
  /* Promise → { pages:[], toc:[{t,p}] } */
  function trang(file) {
    if (!file) return Promise.resolve(giuCho({ ten: 'Giáo trình', soTrang: 1 }));
    if (cache[file.id]) return cache[file.id];
    var b = blobs[file.id], p;
    if (b && laPdf(b)) p = tuPdf(b).catch(function () { return giuCho(file); });
    else if (b && laWord(b)) p = tuWord(b).catch(function () { return giuCho(file); });
    else if (file.mau && GT_MAU[file.mau]) p = Promise.resolve(tuMau(file.mau, file));
    else p = Promise.resolve(giuCho(file));
    cache[file.id] = p;
    return p;
  }
  function demTrang(blob) {
    if (laPdf(blob)) return pdfDoc(blob).then(function (d) { return d.numPages; });
    if (laWord(blob)) return tuWord(blob).then(function (r) { return r.pages.length; });
    return Promise.reject(new Error('Không phải PDF/Word'));
  }

  /* ---------------- trình đọc lật trang ---------------- */
  var SVG = {
    l: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    r: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    fs: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    book: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5c3-1.5 7-1.5 10 1 3-2.5 7-2.5 10-1v14c-3-1.5-7-1.5-10 1-3-2.5-7-2.5-10-1z"/><path d="M12 6v14"/></svg>'
  };
  function mount(host, o) {
    o = o || {};
    var file = o.file || null, seen = {}, pages = [], toc = [], idx = 0, two = false, zoom = 1, busy = false, timer = null;
    (o.daXem || []).forEach(function (n) { seen[n] = 1; });
    host.innerHTML = '<div class="fb" tabindex="0" role="region" aria-label="Giáo trình ' + esc(o.tieuDe || (file && file.ten) || '') + '">' +
      '<div class="fb-bar"><span class="fb-ic">' + SVG.book + '</span><div class="fb-t"><b>' + esc(o.tieuDe || (file ? file.ten : 'Giáo trình')) + '</b><span class="fb-sub">' + esc(file ? file.ten : '') + '</span></div>' +
      '<div class="fb-tools"><select class="fb-toc" aria-label="Mục lục" hidden></select><div class="fb-seg" role="group" aria-label="Chế độ xem"><button data-m="don" title="Một trang">1 trang</button><button data-m="doi" title="Hai trang">2 trang</button></div>' +
      '<div class="fb-zoom"><button data-z="-1" aria-label="Thu nhỏ">−</button><span>100%</span><button data-z="1" aria-label="Phóng to">+</button></div>' +
      (o.taiVe ? '<button class="fb-btn" data-tai>Tải về</button>' : '') + '<button class="fb-btn ic" data-fs aria-label="Toàn màn hình" title="Toàn màn hình">' + SVG.fs + '</button></div></div>' +
      '<div class="fb-stage"><button class="fb-nav prev" aria-label="Trang trước">' + SVG.l + '</button><div class="fb-scroll"><div class="fb-book"><div class="fb-loading">Đang mở giáo trình…</div></div></div><button class="fb-nav next" aria-label="Trang sau">' + SVG.r + '</button></div>' +
      '<div class="fb-foot"><span class="fb-pg"></span><input type="range" class="fb-range" min="1" max="1" value="1" aria-label="Chuyển trang"><span class="fb-read"><i><b></b></i><span></span></span></div>' +
      (o.ghiChu ? '<div class="fb-note">' + esc(o.ghiChu) + '</div>' : '') + '</div>';
    var root = host.querySelector('.fb'), book = root.querySelector('.fb-book'), scroll = root.querySelector('.fb-scroll');
    var rng = root.querySelector('.fb-range'), lblPg = root.querySelector('.fb-pg'), selToc = root.querySelector('.fb-toc');

    function cheDo() {
      var w = root.clientWidth;
      if (o.cheDo === 'doi' && w >= 560) return true;
      if (o.cheDo === 'don') return false;
      return w >= 720;
    }
    /* trang 0 (bìa) đứng một mình bên phải; sau đó từng cặp (1,2), (3,4)… */
    function spreadOf(i) { if (!two) return [i]; if (i === 0) return [null, 0]; var l = i % 2 ? i : i - 1; return [l, l + 1 < pages.length ? l + 1 : null]; }
    function firstOf(sp) { return sp[0] == null ? sp[1] : sp[0]; }
    function pageEl(i, side) {
      var d = document.createElement('div'); d.className = 'fb-page fb-' + side + (i == null ? ' fb-blank' : '');
      if (i != null) {
        var pi = document.createElement('div'); pi.className = 'fb-pi';
        var pg = pages[i];
        if (pg.html) pi.innerHTML = pg.html; else if (pg.ve) pg.ve(pi);
        d.appendChild(pi);
        var n = document.createElement('span'); n.className = 'fb-no'; n.textContent = i + 1; d.appendChild(n);
        d.dataset.i = i;
      }
      return d;
    }
    function kichThuoc() {
      var stageW = scroll.clientWidth - 4, vh = (document.fullscreenElement === root ? window.innerHeight - 150 : Math.min(window.innerHeight * 0.78, 900));
      var pw = Math.min(two ? stageW / 2 : stageW, vh / (PH / PW));
      pw = Math.max(160, Math.floor(pw * zoom));
      book.style.setProperty('--pw', pw + 'px');
      book.style.setProperty('--fbk', (pw / PW).toFixed(4));
      book.classList.toggle('fb-2', two);
    }
    function ve() {
      var sp = spreadOf(idx);
      book.innerHTML = '';
      if (two) { book.appendChild(pageEl(sp[0], 'l')); book.appendChild(pageEl(sp[1], 'r')); }
      else book.appendChild(pageEl(sp[0], 'r'));
      capNhat();
    }
    function capNhat() {
      var sp = spreadOf(idx).filter(function (x) { return x != null; });
      lblPg.textContent = 'Trang ' + sp.map(function (x) { return x + 1; }).join('–') + ' / ' + pages.length;
      rng.max = pages.length; rng.value = sp[0] + 1;
      root.querySelector('.prev').disabled = firstOf(spreadOf(idx)) === 0;
      var last = spreadOf(idx).filter(function (x) { return x != null; }).pop();
      root.querySelector('.next').disabled = last >= pages.length - 1;
      root.querySelectorAll('[data-m]').forEach(function (b) { b.classList.toggle('on', (b.dataset.m === 'doi') === two); });
      root.querySelector('.fb-zoom span').textContent = Math.round(zoom * 100) + '%';
      if (toc.length) { var cur = 0; toc.forEach(function (t, k) { if (t.p <= sp[sp.length - 1]) cur = k; }); selToc.value = String(cur); }
      clearTimeout(timer);
      timer = setTimeout(function () { var moi = false; sp.forEach(function (x) { if (!seen[x]) { seen[x] = 1; moi = true; } }); doc(); if (moi && o.onTrang) o.onTrang(Object.keys(seen).map(Number).sort(function (a, b) { return a - b; }), pages.length); }, 3000);
      doc();
    }
    function doc() {
      var n = Object.keys(seen).filter(function (k) { return +k < pages.length; }).length, pct = pages.length ? Math.round(n / pages.length * 100) : 0;
      root.querySelector('.fb-read b').style.width = pct + '%';
      root.querySelector('.fb-read span').textContent = 'Đã đọc ' + n + '/' + pages.length + ' trang';
    }
    function den(i, huong) {
      if (busy || !pages.length) return;
      i = Math.max(0, Math.min(pages.length - 1, i));
      var a = spreadOf(idx), b = spreadOf(i);
      if (firstOf(a) === firstOf(b)) return;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || Math.abs(firstOf(b) - firstOf(a)) > (two ? 2 : 1) && !huong) { idx = i; ve(); return; }
      var fwd = firstOf(b) > firstOf(a);
      busy = true;
      var leaf = document.createElement('div'); leaf.className = 'fb-leaf ' + (fwd ? 'fb-fwd' : 'fb-bwd') + (two ? '' : ' fb-one');
      var front, back;
      if (two) {
        front = pageEl(fwd ? a[1] : a[0], fwd ? 'r' : 'l');
        back = pageEl(fwd ? b[0] : b[1], fwd ? 'l' : 'r');
        /* trang nằm dưới lá đang lật */
        var under = book.querySelector(fwd ? '.fb-page.fb-r' : '.fb-page.fb-l');
        book.replaceChild(pageEl(fwd ? b[1] : b[0], fwd ? 'r' : 'l'), under);
      } else {
        front = pageEl(fwd ? a[0] : b[0], 'r');
        back = document.createElement('div'); back.className = 'fb-page fb-r fb-blank';
        var u1 = book.querySelector('.fb-page.fb-r');
        if (fwd) book.replaceChild(pageEl(b[0], 'r'), u1);
      }
      front.classList.add('fb-face', 'fb-front'); back.classList.add('fb-face', 'fb-back');
      leaf.appendChild(front); leaf.appendChild(back);
      book.appendChild(leaf);
      requestAnimationFrame(function () { requestAnimationFrame(function () { leaf.classList.add('fb-go'); }); });
      var xong = function () { if (!busy) return; busy = false; idx = i; ve(); };
      leaf.addEventListener('transitionend', xong);
      setTimeout(xong, 900);
    }
    function sau() { var sp = spreadOf(idx), last = sp[sp.length - 1] == null ? sp[0] : sp[sp.length - 1]; den(last + 1, 1); }
    function truoc() { var f = firstOf(spreadOf(idx)); den(f - 1, -1); }
    root.querySelector('.next').onclick = sau;
    root.querySelector('.prev').onclick = truoc;
    book.addEventListener('click', function (e) { var p = e.target.closest('.fb-page'); if (!p || busy) return; if (p.classList.contains('fb-l')) truoc(); else if (two || e.offsetX > p.clientWidth / 2) sau(); else truoc(); });
    root.addEventListener('keydown', function (e) { if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return; if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); sau(); } if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); truoc(); } if (e.key === 'Home') den(0); if (e.key === 'End') den(pages.length - 1); });
    var sx = null;
    book.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    book.addEventListener('pointerup', function (e) { if (sx == null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) { e.stopPropagation(); if (dx < 0) sau(); else truoc(); } });
    rng.oninput = function () { den(+rng.value - 1); };
    selToc.onchange = function () { var t = toc[+selToc.value]; if (t) den(t.p, 1); };
    root.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { o.cheDo = b.dataset.m; two = cheDo(); kichThuoc(); ve(); }; });
    root.querySelectorAll('[data-z]').forEach(function (b) { b.onclick = function () { zoom = Math.max(.6, Math.min(2, Math.round((zoom + (+b.dataset.z) * .2) * 10) / 10)); kichThuoc(); capNhat(); }; });
    var fsb = root.querySelector('[data-fs]');
    fsb.onclick = function () { if (document.fullscreenElement) document.exitFullscreen(); else if (root.requestFullscreen) root.requestFullscreen().catch(function () { root.classList.toggle('fb-max'); kichThuoc(); }); else { root.classList.toggle('fb-max'); kichThuoc(); } };
    var tai = root.querySelector('[data-tai]'); if (tai) tai.onclick = function () { LMS.ui.toast('Đã tải ' + (file ? file.ten : 'giáo trình'), 'ok'); };
    document.addEventListener('fullscreenchange', function () { setTimeout(function () { two = cheDo(); kichThuoc(); ve(); }, 60); });
    var ro = window.ResizeObserver ? new ResizeObserver(function () { if (!pages.length || busy) return; var t = cheDo(); if (t !== two) { two = t; kichThuoc(); ve(); } else kichThuoc(); }) : null;

    trang(file).then(function (r) {
      pages = r.pages; toc = r.toc || [];
      if (toc.length) { selToc.hidden = false; selToc.innerHTML = toc.map(function (t, k) { return '<option value="' + k + '">' + esc(t.t) + ' · tr. ' + (t.p + 1) + '</option>'; }).join(''); }
      if (!pages.length) { book.innerHTML = '<div class="fb-loading">Tệp chưa có trang để hiển thị</div>'; return; }
      idx = Math.max(0, Math.min(pages.length - 1, +o.batDau || 0));
      two = cheDo(); kichThuoc(); ve();
      if (ro) ro.observe(root);
    });
    return {
      el: root, sau: sau, truoc: truoc, den: den,
      daXem: function () { return Object.keys(seen).map(Number); },
      tong: function () { return pages.length; },
      huy: function () { clearTimeout(timer); if (ro) ro.disconnect(); }
    };
  }

  LMS.sach = {
    mount: mount, trang: trang, demTrang: demTrang, GT_MAU: GT_MAU,
    ghiTep: function (id, blob) { blobs[id] = blob; delete cache[id]; },
    coTep: function (id) { return !!blobs[id]; }
  };
})();
