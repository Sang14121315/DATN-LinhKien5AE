import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendContact } from '@/api/user/contactAPI';
import '@/styles/pages/user/contact.scss';

interface FormData {
  name: string;
  email: string;
  phone: string;
  title: string;
  message: string;
}

const initialForm: FormData = {
  name: '',
  email: '',
  phone: '',
  title: '',
  message: '',
};

const faqList = [
  {
    question: 'Tôi có thể mua linh kiện ở đâu?',
    answer: 'Bạn có thể mua trực tiếp tại cửa hàng hoặc đặt hàng online qua website 5AnhEmPC.',
  },
  {
    question: 'Phương thức thanh toán nào được hỗ trợ?',
    answer: 'Chúng tôi hỗ trợ chuyển khoản, thẻ ngân hàng, ví điện tử như Momo, ZaloPay.',
  },
  {
    question: 'Thời gian giao hàng là bao lâu?',
    answer: 'Giao hàng nội thành trong 24h, các tỉnh từ 2–5 ngày làm việc.',
  },
  {
    question: 'Chính sách đổi trả như thế nào?',
    answer: 'Đổi trả trong vòng 7 ngày nếu sản phẩm lỗi do nhà sản xuất. Vui lòng giữ hóa đơn mua hàng.',
  },
];

const ContactPage = () => {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendContact(formData);
      setToast('✅ Tin nhắn của bạn đã được gửi thành công!');
      setFormData(initialForm);
      firstInputRef.current?.focus();
      setTimeout(() => setToast(null), 2000);
    } catch (error) {
      let msg = '❌ Gửi tin nhắn thất bại!';
      if (error instanceof Error && 'response' in error) {
        // @ts-expect-error: error có thể là AxiosError có thuộc tính response
        msg = error.response?.data?.message || msg;
      }
      setToast(msg);
      setTimeout(() => setToast(null), 2000);
    }
  }, [formData]);

  return (
    <main className="contact-page beautiful-bg">
      {/* Header minh họa lớn */}
      <section className="contact-hero">
        <div className="hero-icon">
          <span role="img" aria-label="contact">📬</span>
        </div>
        <h1>Liên hệ với <span className="brand-gradient">5AnhEmPC</span></h1>
        <p className="hero-desc">
          Chúng tôi luôn sẵn sàng hỗ trợ mọi thắc mắc của bạn.<br />Hãy gửi thông tin liên hệ nếu cần giúp đỡ!
        </p>
      </section>

      {/* Info */}
      <section className="contact-intro">
        <div className="contact-info">
          <div><span>📞</span> <strong>Hotline:</strong> 0909 123 456</div>
          <div><span>✉️</span> <strong>Email:</strong> hotro@5anhempc.vn</div>
          <div><span>🏢</span> <strong>Địa chỉ:</strong> 123 Đường Công Nghệ, Quận Kỹ Thuật, TP.HCM</div>
          <div><span>🕒</span> <strong>Giờ làm việc:</strong> Thứ 2 – Thứ 7, 8:00 – 18:00</div>
        </div>
      </section>

      {/* Form */}
      <section className="contact-form-wrapper glass-form">
        <h2>Gửi Yêu Cầu hoặc Câu Hỏi</h2>
        <form className="contact-form" onSubmit={handleSubmit} autoComplete="off">
          {[
            { label: 'Chủ đề', name: 'title', type: 'text', placeholder: 'Nhập chủ đề liên hệ', ref: firstInputRef },
            { label: 'Họ và Tên', name: 'name', type: 'text', placeholder: 'Nhập họ và tên của bạn' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'Nhập email của bạn' },
            { label: 'Số điện thoại', name: 'phone', type: 'text', placeholder: 'Nhập số điện thoại (10 chữ số)' },
          ].map(({ label, name, type, placeholder, ref }) => (
            <div key={name} className="form-group">
              <label htmlFor={name}>{label}</label>
              <input
                type={type}
                name={name}
                id={name}
                value={formData[name as keyof FormData]}
                onChange={handleChange}
                placeholder={placeholder}
                required
                ref={ref}
              />
            </div>
          ))}
          <div className="form-group">
            <label htmlFor="message">Nội dung chi tiết</label>
            <textarea
              name="message"
              id="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Nhập nội dung chi tiết"
              required
            />
          </div>
          <button type="submit" className="submit-btn gradient-btn">GỬI YÊU CẦU</button>
        </form>
      </section>

      {/* FAQ */}
      <section className="faq-section beautiful-faq">
        <h2>Câu Hỏi Thường Gặp</h2>
        <p>Giải đáp nhanh những thắc mắc phổ biến</p>
        <div className="faq-accordion">
          {faqList.map((item, index) => (
            <div key={index} className={`faq-item${activeIndex === index ? ' active' : ''}`}> 
              <button
                className={`faq-question${activeIndex === index ? ' active' : ''}`}
                onClick={() => setActiveIndex(index === activeIndex ? null : index)}
                type="button"
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                {item.question}
                <span className="toggle-icon">{activeIndex === index ? '−' : '+'}</span>
              </button>
              <div
                className="faq-answer-wrapper"
                id={`faq-answer-${index}`}
                style={{ maxHeight: activeIndex === index ? 200 : 0 }}
                aria-hidden={activeIndex !== index}
              >
                {activeIndex === index && (
                  <div className="faq-answer">{item.answer}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      {toast && (
        <div className={`contact-toast-popup user-toast`}>{toast}</div>
      )}
    </main>
  );
};

export default ContactPage;
