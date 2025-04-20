import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReviewsAnalysis.css';

function ReviewsAnalysis({ productId }) {
  // Almacenamos los datos de las reviews pero no los usamos directamente
  // Los usamos para generar el análisis
  const [, setReviews] = useState([]);
  const [analysisData, setAnalysisData] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    },
    sentimentAnalysis: {
      positive: 0,
      neutral: 0,
      negative: 0
    },
    keywordAnalysis: [],
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // جلب التعليقات من الخادم
        const response = await axios.get(`http://localhost:8000/api/products/${productId}/reviews/`);
        setReviews(response.data);

        // تحليل التعليقات
        analyzeReviews(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('حدث خطأ أثناء تحميل التعليقات');
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // تحليل التعليقات وإنشاء البيانات التحليلية
  const analyzeReviews = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) {
      setAnalysisData({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
        keywordAnalysis: [],
        recentReviews: []
      });
      return;
    }

    // حساب متوسط التقييم
    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviewsData.length;

    // حساب توزيع التقييمات
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++;
      }
    });

    // تحليل المشاعر (تبسيط)
    const sentimentAnalysis = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    reviewsData.forEach(review => {
      if (review.rating >= 4) {
        sentimentAnalysis.positive++;
      } else if (review.rating === 3) {
        sentimentAnalysis.neutral++;
      } else {
        sentimentAnalysis.negative++;
      }
    });

    // تحليل الكلمات المفتاحية (محاكاة)
    // في التطبيق الحقيقي، يمكن استخدام خوارزميات معالجة اللغة الطبيعية
    const keywordAnalysis = [
      { keyword: 'جودة عالية', count: Math.floor(Math.random() * reviewsData.length * 0.7) + 1 },
      { keyword: 'سعر مناسب', count: Math.floor(Math.random() * reviewsData.length * 0.5) + 1 },
      { keyword: 'سرعة التوصيل', count: Math.floor(Math.random() * reviewsData.length * 0.4) + 1 },
      { keyword: 'سهولة الاستخدام', count: Math.floor(Math.random() * reviewsData.length * 0.6) + 1 },
      { keyword: 'خدمة العملاء', count: Math.floor(Math.random() * reviewsData.length * 0.3) + 1 }
    ].sort((a, b) => b.count - a.count);

    // أحدث التعليقات
    const recentReviews = [...reviewsData]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    setAnalysisData({
      averageRating,
      totalReviews: reviewsData.length,
      ratingDistribution,
      sentimentAnalysis,
      keywordAnalysis,
      recentReviews
    });
  };

  // حساب النسبة المئوية لكل تقييم
  const calculateRatingPercentage = (rating) => {
    if (analysisData.totalReviews === 0) return 0;
    return (analysisData.ratingDistribution[rating] / analysisData.totalReviews) * 100;
  };

  // حساب النسبة المئوية للمشاعر
  const calculateSentimentPercentage = (sentiment) => {
    if (analysisData.totalReviews === 0) return 0;
    return (analysisData.sentimentAnalysis[sentiment] / analysisData.totalReviews) * 100;
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="reviews-analysis-container loading">
        <div className="loading-spinner"></div>
        <p>جاري تحليل التعليقات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-analysis-container error">
        <p>{error}</p>
      </div>
    );
  }

  if (analysisData.totalReviews === 0) {
    return (
      <div className="reviews-analysis-container empty">
        <h2>تحليل التعليقات</h2>
        <p>لا توجد تعليقات لهذا المنتج بعد. كن أول من يقيم هذا المنتج!</p>
      </div>
    );
  }

  return (
    <div className="reviews-analysis-container">
      <h2>تحليل التعليقات والآراء</h2>

      <div className="analysis-summary">
        <div className="average-rating">
          <div className="rating-value">{analysisData.averageRating.toFixed(1)}</div>
          <div className="rating-stars">
            {'★'.repeat(Math.round(analysisData.averageRating))}
            {'☆'.repeat(5 - Math.round(analysisData.averageRating))}
          </div>
          <div className="total-reviews">{analysisData.totalReviews} تقييم</div>
        </div>

        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(rating => (
            <div className="rating-bar" key={rating}>
              <div className="rating-label">{rating} ★</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${calculateRatingPercentage(rating)}%` }}
                ></div>
              </div>
              <div className="rating-count">{analysisData.ratingDistribution[rating]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-details">
        <div className="sentiment-analysis">
          <h3>تحليل المشاعر</h3>
          <div className="sentiment-chart">
            <div
              className="sentiment-bar positive"
              style={{ width: `${calculateSentimentPercentage('positive')}%` }}
            >
              <span className="sentiment-label">إيجابي</span>
              <span className="sentiment-value">{analysisData.sentimentAnalysis.positive}</span>
            </div>
            <div
              className="sentiment-bar neutral"
              style={{ width: `${calculateSentimentPercentage('neutral')}%` }}
            >
              <span className="sentiment-label">محايد</span>
              <span className="sentiment-value">{analysisData.sentimentAnalysis.neutral}</span>
            </div>
            <div
              className="sentiment-bar negative"
              style={{ width: `${calculateSentimentPercentage('negative')}%` }}
            >
              <span className="sentiment-label">سلبي</span>
              <span className="sentiment-value">{analysisData.sentimentAnalysis.negative}</span>
            </div>
          </div>
        </div>

        <div className="keyword-analysis">
          <h3>الكلمات المفتاحية الأكثر تكرارًا</h3>
          <div className="keyword-cloud">
            {analysisData.keywordAnalysis.map((keyword, index) => (
              <div
                className="keyword-tag"
                key={index}
                style={{
                  fontSize: `${Math.max(0.8, Math.min(1.5, 0.8 + (keyword.count / analysisData.totalReviews)))}rem`
                }}
              >
                {keyword.keyword} ({keyword.count})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-reviews">
        <h3>أحدث التعليقات</h3>
        {analysisData.recentReviews.map((review, index) => (
          <div className="review-card" key={index}>
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.user.name ? review.user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="reviewer-name">{review.user.name || 'مستخدم مجهول'}</div>
              </div>
              <div className="review-rating">
                <span className="rating-value">{review.rating}</span>
                <span className="rating-stars">{'★'.repeat(review.rating)}</span>
              </div>
            </div>
            <div className="review-content">
              {review.comment || 'لا يوجد تعليق'}
            </div>
            <div className="review-date">
              {formatDate(review.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewsAnalysis;
