import React from "react";
import "@/styles/pages/user/about.scss";

const About5AE: React.FC = () => {
  return (
    <div className="about5ae">
      <h1>Giới thiệu về 5AE – Thế giới linh kiện điện tử</h1>
      <img
        src="public/assets/about_banner_AI.png"
        alt="banner giới thiệu về chúng tôi"
      />

      <div className="section">
        <h2>1. Về chúng tôi</h2>
        <p>
          5AE là đơn vị chuyên cung cấp các loại linh kiện điện tử phục vụ học
          tập, nghiên cứu và sản xuất như: điện trở, tụ điện, IC, cảm biến,
          module, vi điều khiển, relay, dây cắm và nhiều loại thiết bị khác.
        </p>
        <p>
          Chúng tôi luôn đặt tiêu chí “Chất lượng – Uy tín – Tận tâm” lên hàng
          đầu nhằm mang đến trải nghiệm mua hàng tốt nhất cho khách hàng từ sinh
          viên, kỹ sư đến các đơn vị sản xuất.
        </p>
      </div>

      <div className="section">
        <h2>2. Sản phẩm đa dạng – Giá cả cạnh tranh</h2>
        <p>
          5AE cung cấp hàng nghìn loại linh kiện điện tử từ cơ bản đến nâng cao,
          hỗ trợ từ những người mới bắt đầu đến chuyên gia trong lĩnh vực điện –
          điện tử.
        </p>
        <ul>
          <li>Linh kiện cơ bản: điện trở, tụ điện, diode, transistor,...</li>
          <li>Module chức năng: relay, cảm biến, LCD, bluetooth,...</li>
          <li>Vi điều khiển: Arduino, ESP8266, STM32,...</li>
          <li>Phụ kiện: board test, dây cắm, nguồn, socket,...</li>
        </ul>
      </div>

      <div className="section">
        <h2>3. Cam kết chất lượng và dịch vụ</h2>
        <div className="highlight">
          Tất cả sản phẩm đều được kiểm tra kỹ trước khi giao hàng. Đổi trả dễ
          dàng nếu sản phẩm gặp lỗi do nhà sản xuất.
        </div>
        <p>
          Đội ngũ kỹ thuật luôn sẵn sàng hỗ trợ tư vấn sử dụng, chọn linh kiện
          phù hợp cho từng dự án. Chúng tôi cũng cập nhật thường xuyên các dòng
          linh kiện mới, đáp ứng xu hướng công nghệ.
        </p>
      </div>

      <div className="section">
        <h2>4. Giao hàng toàn quốc – Thanh toán linh hoạt</h2>
        <p>
          5AE hỗ trợ giao hàng toàn quốc với chi phí hợp lý và nhiều hình thức
          thanh toán: chuyển khoản, COD, ví điện tử. Giao hàng nhanh chóng, đóng
          gói cẩn thận.
        </p>
      </div>

      <div className="section contact-info">
        <h2>5. Liên hệ với chúng tôi</h2>
        <p>
          <strong>Địa chỉ:</strong> Quận 12, QL1A, Tân Thới Hiệp, TP.HCM
        </p>
        <p>
          <strong>Email:</strong> 5anhem@gmail.com
        </p>
        <p>
          <strong>Hotline:</strong> 0123 456 789
        </p>
        <p>
          <strong>Website:</strong> www.5aelinhkien.vn
        </p>
      </div>
    </div>
  );
};

export default About5AE;
