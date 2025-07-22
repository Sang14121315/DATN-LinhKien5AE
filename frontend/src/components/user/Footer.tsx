import React from "react";
import "../../styles/components/user/footer.scss";
import { FaFacebookF, FaTiktok, FaGoogle } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { MdLocationOn, MdEmail } from "react-icons/md";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* Cột 1: Giới thiệu */}
          <div className="footer__col">
            <h4>Về 5AE</h4>
            <p>
              Chuyên bán linh kiện điện tử uy tín, nhanh chóng. Luôn tìm kiếm
              những sản phẩm vì quý khách hàng.
            </p>
            <div className="footer__social">
              <FaFacebookF />
              <FaTiktok />
              <SiZalo />
              <FaGoogle />
            </div>
          </div>

          {/* Cột 2: Liên hệ */}
          <div className="footer__col">
            <h4>Thông tin liên hệ</h4>
            <p>
              <MdLocationOn /> Quận 12, QL1A, Tân Thới Hiệp, TP.HCM
            </p>
            <p>
              <MdEmail /> 5anhem@gmail.com
            </p>
          </div>

          {/* Cột 3: Ngân hàng */}
          <div className="footer__col">
            <h4>Tài Khoản Ngân Hàng</h4>
            <ul>
              <li>Ngân hàng Vietcombank</li>
              <li>Ngân hàng MB Bank</li>
              <li>Ngân hàng TP Bank</li>
              <li>Phương thức thanh toán</li>
            </ul>
          </div>

          {/* Cột 4: Chính sách */}
          <div className="footer__col">
            <h4>Chính sách</h4>
            <ul>
              <li>Chính sách bảo mật</li>
              <li>Quy định bảo hành</li>
              <li>Chính sách đổi trả</li>
              <li>Điều khoản sử dụng</li>
              <li>Chính sách vận chuyển & kiểm hàng</li>
              <li>Phân định trách nhiệm dịch vụ</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        © 2025 5AE – Chuyên bán linh kiện điện tử uy tín, nhanh chóng.
      </div>
    </footer>
  );
};

export default Footer;
