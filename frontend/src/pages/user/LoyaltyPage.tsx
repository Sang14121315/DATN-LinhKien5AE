import React, { useState, useEffect } from "react";
import {
  getLoyaltyInfo,
  getLoyaltyHistory,
  LoyaltyInfo,
  LoyaltyTransaction,
  getCouponList,
  redeemCoupon,
  Coupon,
  getUserCouponCountInMonth,
  getMyCoupons,
} from "@/api/user/userAPI";
import { FaMedal, FaCoins, FaCrown, FaTicketAlt } from "react-icons/fa";
import "@/styles/pages/user/loyalty.scss";
import { AxiosError } from "axios";

const LoyaltyPage: React.FC = () => {
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransaction[]>([]);
  const [redeemingCouponId, setRedeemingCouponId] = useState<string | null>(null);
  const [couponList, setCouponList] = useState<Coupon[]>([]);
  const [couponRedeemCounts, setCouponRedeemCounts] = useState<{ [couponId: string]: number }>({});
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    fetchLoyalty();
    fetchCoupons();
    fetchMyCoupons();
  }, []);

  useEffect(() => {
    if (couponList.length > 0) {
      fetchCouponRedeemCounts(couponList);
    }
  }, [couponList]);

  const fetchLoyalty = async () => {
    try {
      const info = await getLoyaltyInfo();
      setLoyaltyInfo(info);
      const history = await getLoyaltyHistory();
      setLoyaltyHistory(history);
    } catch (e) {
      console.error('Lỗi lấy thông tin khách hàng thân thiết:', e);
    }
  };

  const fetchCoupons = async () => {
    try {
      const allCoupons = await getCouponList();
      const now = new Date();
      const filtered = allCoupons.filter(c =>
        c.pointsRequired > 0 &&
        c.is_active !== false &&
        new Date(c.start_date) <= now &&
        new Date(c.end_date) >= now
      );
      setCouponList(filtered);
    } catch {
      setCouponList([]);
    }
  };

  const fetchCouponRedeemCounts = async (coupons: Coupon[]) => {
    const counts: { [couponId: string]: number } = {};
    await Promise.all(
      coupons.map(async (coupon) => {
        if (coupon.limitMonth) {
          try {
            counts[coupon._id] = await getUserCouponCountInMonth(coupon._id);
          } catch {
            counts[coupon._id] = 0;
          }
        }
      })
    );
    setCouponRedeemCounts(counts);
  };

  const fetchMyCoupons = async () => {
    try {
      const coupons = await getMyCoupons();
      setMyCoupons(coupons);
    } catch {
      setMyCoupons([]);
    }
  };

  const handleRedeemCoupon = async (couponId: string) => {
    setRedeemingCouponId(couponId);
    try {
      const coupon = couponList.find(c => c._id === couponId);
      if (coupon && coupon.limitMonth) {
        const count = couponRedeemCounts[couponId] || 0;
        if (count >= coupon.limitMonth) {
          alert('Bạn đã hết lượt đổi tháng này.');
          setRedeemingCouponId(null);
          return;
        }
      }
      const res = await redeemCoupon(couponId);
      alert(res.message || `Đã đổi điểm lấy coupon!`);
      fetchLoyalty();
      fetchCoupons();
      fetchMyCoupons(); // GỌI LẠI SAU KHI ĐỔI ĐIỂM
      if (coupon && coupon.limitMonth) {
        setCouponRedeemCounts(prev => ({ ...prev, [couponId]: (prev[couponId] || 0) + 1 }));
      }
    } catch (e: unknown) {
      let message = 'Lỗi đổi điểm lấy coupon!';
      if (e && typeof e === 'object' && 'isAxiosError' in e && (e as AxiosError).isAxiosError) {
        const err = e as AxiosError<{ message?: string }>;
        message = err.response?.data?.message || message;
      }
      alert(message);
    } finally {
      setRedeemingCouponId(null);
    }
  };

  return (
    <div className="loyalty-page">
      <h1 className="loyalty-title"><FaMedal style={{color:'#1976d2', marginRight:8}}/>Khách hàng thân thiết</h1>
      {loyaltyInfo && (
        <div className="loyalty-info-card">
          <div className="loyalty-points">
            <FaCoins className="loyalty-icon" />
            <span className="points-value">{loyaltyInfo.loyaltyPoints}</span>
            <span className="points-label">Điểm</span>
          </div>
          <div className="loyalty-meta">
            <span className="loyalty-rank"><FaCrown style={{color:'#1565c0', marginRight:4}}/>{loyaltyInfo.memberLevel}</span>
            <span className="loyalty-spent">Tổng chi tiêu: <b>{loyaltyInfo.totalSpent.toLocaleString()}đ</b></span>
          </div>
        </div>
      )}
      {/* Danh sách coupon có thể đổi */}
      <div className="reward-section">
        <h2 className="reward-title"><FaTicketAlt style={{marginRight:6}}/>Voucher có thể đổi</h2>
        <div className="reward-list-grid">
          {couponList.length === 0 ? (
            <div className="reward-empty">Chưa có voucher nào khả dụng.</div>
          ) : (
            couponList.map(coupon => {
              const count = couponRedeemCounts[coupon._id] || 0;
              const limit = coupon.limitMonth || 0;
              const remaining = limit > 0 ? limit - count : undefined;
              return (
                <div className="reward-item" key={coupon._id}>
                  <div className="reward-code"><b>{coupon.code}</b></div>
                  <div className="reward-desc">{coupon.description}</div>
                  <div className="reward-points">Điểm cần: <b>{coupon.pointsRequired}</b></div>
                  <div className="reward-date">Hiệu lực: {new Date(coupon.start_date).toLocaleDateString()} - {new Date(coupon.end_date).toLocaleDateString()}</div>
                  {limit > 0 && (
                    <div className="reward-limit">Lượt còn lại tháng này: <b>{remaining}</b>/{limit}</div>
                  )}
                  <button
                    disabled={!!redeemingCouponId || (loyaltyInfo && loyaltyInfo.loyaltyPoints < coupon.pointsRequired) || (limit > 0 && remaining === 0)}
                    onClick={() => handleRedeemCoupon(coupon._id)}
                  >
                    {redeemingCouponId === coupon._id ? 'Đang đổi...' : (limit > 0 && remaining === 0 ? 'Hết lượt' : 'Đổi điểm')}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Lịch sử giao dịch điểm */}
      <div className="loyalty-history-section">
        <h3 className="history-title">Lịch sử giao dịch điểm</h3>
        {loyaltyHistory.length === 0 ? (
          <div className="history-empty">Chưa có giao dịch điểm nào.</div>
        ) : (
          <table className="loyalty-history-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Điểm</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {loyaltyHistory.map(tx => (
                <tr key={tx._id}>
                  <td>{new Date(tx.created_at).toLocaleString()}</td>
                  <td>{tx.type === 'earn' ? 'Tích điểm' : 'Quy đổi'}</td>
                  <td className={tx.type === 'earn' ? 'history-plus' : 'history-minus'}>{tx.type === 'earn' ? '+' : '-'}{tx.points}</td>
                  <td>{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPage;
