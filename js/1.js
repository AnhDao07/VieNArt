(function () {
  "use strict";

  var KHOA_GIO = "vienart_giohang_v2";
  function $(sel, goc) {
    return (goc || document).querySelector(sel);
  }
  function $$(sel, goc) {
    return Array.prototype.slice.call((goc || document).querySelectorAll(sel));
  }
  function chuanHoa(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
  function giaSo(s) {
    return parseInt(String(s).replace(/[^\d]/g, ""), 10) || 0;
  }
  function dinhDangTien(n) {
    return n.toLocaleString("vi-VN") + " VNĐ";
  }
  function thoat(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  var hopThongBao = null;
  var henGio = null;
  function thongBao(noiDung, loai) {
    if (hopThongBao) hopThongBao.remove();
    clearTimeout(henGio);
    var mau = loai === "loi" ? "#e74c3c" : "#fecb2e";
    var dau = loai === "loi" ? "!" : "\u2713";
    var hop = document.createElement("div");
    hop.style.cssText =
      "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); z-index: 99999; min-width: 260px; max-width: 90%; padding: 22px 30px; background-color: #1a1a1a; color: #ffffff; text-align: center; border-radius: 10px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); opacity: 0; transition: 0.3s ease;";
    hop.innerHTML =
      '<div style="width: 44px; height: 44px; line-height: 44px; margin: 0 auto 10px auto; border-radius: 50%; background-color: ' +
      mau +
      '; color: #111111; font-size: 22px; font-weight: 700;">' +
      dau +
      "</div>" +
      '<div style="font-size: 15px; font-weight: 600;">' +
      thoat(noiDung) +
      "</div>";
    document.body.appendChild(hop);
    hopThongBao = hop;
    setTimeout(function () {
      hop.style.opacity = "1";
      hop.style.transform = "translate(-50%, -50%) scale(1)";
    }, 20);
    henGio = setTimeout(function () {
      hop.style.opacity = "0";
      setTimeout(function () {
        hop.remove();
      }, 300);
    }, 1600);
  }

  function sauKhiThongBao(viec, troChoi) {
    setTimeout(viec, troChoi || 1200);
  }

  function docGio() {
    try {
      return JSON.parse(localStorage.getItem(KHOA_GIO)) || [];
    } catch (e) {
      return [];
    }
  }

  function ghiGio(ds) {
    try {
      localStorage.setItem(KHOA_GIO, JSON.stringify(ds));
    } catch (e) {}
  }

  function tongSoLuong(ds) {
    return ds.reduce(function (t, x) {
      return t + x.soLuong;
    }, 0);
  }

  function capNhatSoGio(n) {
    $$(".LienKetGioHang").forEach(function (a) {
      a.textContent = "Giỏ hàng (" + n + ")";
    });
  }

  function khoiTaoThemGio() {
    $$(".NutXemTrangShop").forEach(function (nut) {
      nut.addEventListener("click", function (e) {
        e.preventDefault();
        var the = nut.closest(".TheTranh");
        if (!the) return;

        var ten = $(".TenTranh", the).textContent.trim();
        var ds = docGio();
        var co = ds.filter(function (x) {
          return x.ten === ten;
        })[0];

        if (co) {
          co.soLuong += 1;
        } else {
          var anh = $("img", the);
          var nguon = $(".TenNgheNhan", the);
          var chat = $(".ChatLieuTranh", the);
          var dong = the.closest(".PhanKhuDongTranh");
          var tenDong = dong ? $(".TenDongTranh", dong) : null;
          ds.push({
            ten: ten,
            anh: anh ? anh.src : "",
            dong: tenDong
              ? tenDong.textContent.trim()
              : nguon
                ? nguon.textContent.trim()
                : "",
            chatLieu: chat ? chat.textContent.trim() : "",
            gia: giaSo($(".GiaTienTranh", the).textContent),
            soLuong: 1,
          });
        }
        ghiGio(ds);
        capNhatSoGio(tongSoLuong(ds));
        thongBao('Đã thêm "' + ten + '" vào giỏ hàng');
      });
    });
  }

  function veGioHang() {
    var bang = $(".BangGioHang tbody");
    if (!bang) return;
    var ds = docGio();
    if (!ds.length) return;

    bang.innerHTML = ds
      .map(function (x, i) {
        return (
          "<tr>" +
          '<td class="OThongTinTranh">' +
          '<img src="' +
          thoat(x.anh) +
          '" alt="' +
          thoat(x.ten) +
          '" class="AnhTranhNho">' +
          '<div class="ChiTietTranhGio"><h4>' +
          thoat(x.ten) +
          "</h4>" +
          '<p class="DongDongTranh">' +
          thoat(x.dong) +
          "</p>" +
          '<p class="DongChatLieu">' +
          thoat(x.chatLieu) +
          "</p>" +
          '<a href="#" data-xoa="' +
          i +
          '" style="font-size: 12px; text-decoration: underline; color: #c0392b;">Xóa tác phẩm</a>' +
          "</div></td>" +
          '<td class="SoLuongTranh">' +
          x.soLuong +
          "</td>" +
          '<td class="DonGiaTranh CanPhai">' +
          dinhDangTien(x.gia * x.soLuong) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    var tong = ds.reduce(function (t, x) {
      return t + x.gia * x.soLuong;
    }, 0);
    var tam = $(".DongTomTat .GiaTriDam");
    var cuoi = $(".DongTongCong span:last-child");
    if (tam) tam.textContent = dinhDangTien(tong);
    if (cuoi) cuoi.textContent = dinhDangTien(tong);
    capNhatSoGio(tongSoLuong(ds));
  }

  function khoiTaoGioHang() {
    var bang = $(".BangGioHang tbody");
    if (bang) {
      bang.addEventListener("click", function (e) {
        var a = e.target.closest("[data-xoa]");
        if (!a) return;
        e.preventDefault();
        var moi = docGio();
        moi.splice(parseInt(a.getAttribute("data-xoa"), 10), 1);
        ghiGio(moi);
        thongBao("Đã xóa tranh khỏi giỏ hàng");
        if (moi.length) {
          veGioHang();
        } else {
          sauKhiThongBao(function () {
            location.reload();
          }, 800);
        }
      });
    }
    var bieuMau = $(".BieuMauThanhToan");
    if (bieuMau) {
      bieuMau.addEventListener("submit", function (e) {
        e.preventDefault();
        ghiGio([]);
        thongBao("Đặt hàng thành công! Cảm ơn bạn đã ủng hộ VieNArt");
        sauKhiThongBao(function () {
          location.href = "../index.html";
        }, 1600);
      });
    }
  }

  function khoiTaoDangNhap() {
    var hopDangNhap = $("#HopDangNhap");
    if (!hopDangNhap) return;
    var hopDangKy = $("#HopDangKy");
    var hopQuen = $("#HopQuenMatKhau");

    function hienHop(hop) {
      [hopDangNhap, hopDangKy, hopQuen].forEach(function (h) {
        if (h) h.style.display = h === hop ? "block" : "none";
      });
    }
    function dangNhapXong() {
      thongBao("Đăng nhập thành công");
      sauKhiThongBao(function () {
        location.href = "../index.html";
      });
    }

    var formDN = $("form", hopDangNhap);
    if (formDN) {
      formDN.addEventListener("submit", function (e) {
        e.preventDefault();
        dangNhapXong();
      });
    }
    $$('button[type="button"]', hopDangNhap).forEach(function (nut) {
      nut.addEventListener("click", dangNhapXong);
    });

    if (hopDangKy) {
      var formDK = $("form", hopDangKy);
      if (formDK) {
        formDK.addEventListener("submit", function (e) {
          e.preventDefault();
          thongBao("Tạo tài khoản thành công");
          sauKhiThongBao(function () {
            hienHop(hopDangNhap);
          });
        });
      }
    }

    if (hopQuen) {
      var formQuen = $("form", hopQuen);
      if (formQuen) {
        formQuen.addEventListener("submit", function (e) {
          e.preventDefault();
          thongBao("Đã gửi email khôi phục mật khẩu");
          sauKhiThongBao(function () {
            hienHop(hopDangNhap);
          });
        });
      }
    }
  }

  function khoiTaoTimKiem() {
    $$(".HopTimKiem input").forEach(function (o) {
      o.name = "q";
    });
  }

  function locCuaHang() {
    if (!$(".PhanKhuDongTranh")) return;
    var tuKhoa = new URLSearchParams(location.search).get("q");
    var q = chuanHoa(tuKhoa);
    if (!q) return;

    $$(".HopTimKiem input").forEach(function (o) {
      o.value = tuKhoa;
    });

    var tong = 0;
    $$(".PhanKhuDongTranh").forEach(function (khu) {
      var thay = 0;
      $$(".TheTranh", khu).forEach(function (the) {
        var khop =
          chuanHoa(the.textContent + " " + ($("img", the) || {}).alt).indexOf(
            q,
          ) !== -1;
        the.style.display = khop ? "" : "none";
        if (khop) thay++;
      });
      khu.style.display = thay ? "" : "none";
      tong += thay;
    });

    if (!tong) {
      var tb = document.createElement("p");
      tb.style.cssText =
        "text-align: center; color: #e74c3c; font-weight: bold; padding: 30px 0; font-size: 16px;";
      tb.textContent =
        "Không tìm thấy tác phẩm tranh phù hợp với từ khóa tìm kiếm.";
      $(".KhoiTrangShop").appendChild(tb);
    }
  }

  function khoiTaoTrinhChieu() {
    var luoi = $(".LuoiDichVu");
    var vung = $(".KhuVucTrinhChieu");
    if (!luoi || !vung) return;

    var trai = $(".NutChuyenTrai");
    var phai = $(".NutChuyenPhai");
    if (trai && !trai.textContent.trim()) trai.innerHTML = "&lsaquo;";

    function tien() {
      luoi.appendChild(luoi.firstElementChild);
    }
    function lui() {
      luoi.insertBefore(luoi.lastElementChild, luoi.firstElementChild);
    }

    if (phai) phai.addEventListener("click", tien);
    if (trai) trai.addEventListener("click", lui);

    var tuChay = setInterval(tien, 5000);
    vung.addEventListener("mouseenter", function () {
      clearInterval(tuChay);
    });
    vung.addEventListener("mouseleave", function () {
      tuChay = setInterval(tien, 5000);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    khoiTaoTimKiem();
    khoiTaoThemGio();
    locCuaHang();
    veGioHang();
    khoiTaoGioHang();
    khoiTaoDangNhap();
    khoiTaoTrinhChieu();

    var ds = docGio();
    if (ds.length) capNhatSoGio(tongSoLuong(ds));
  });
})();
