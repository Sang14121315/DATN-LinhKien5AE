import React from "react";
import EmailTest from "../../components/admin/EmailTest";

const EmailTestPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🧪 Test Email Service</h1>
      <p>
        Trang này chỉ dùng để test chức năng gửi email trong môi trường
        development.
      </p>
      <EmailTest />
    </div>
  );
};

export default EmailTestPage;
