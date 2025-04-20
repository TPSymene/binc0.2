import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterShop() {
    const [shopName, setShopName] = useState('');
    const [shopAddress, setShopAddress] = useState('');
    const [shopUrl, setShopUrl] = useState('');
    const [shopLogo, setShopLogo] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasShop, setHasShop] = useState(false);
    const navigate = useNavigate();

    // التحقق من وجود متجر للمستخدم عند تحميل الصفحة
    useEffect(() => {
        const checkShop = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/');
                    return;
                }

                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.user_type !== 'owner') {
                    navigate('/products');
                    return;
                }

                setLoading(true);
                // التحقق من وجود متجر للمالك
                console.log('Checking if owner has a shop...');
                const response = await axios.get('http://localhost:8000/api/shop/check/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.has_shop) {
                    setHasShop(true);
                    setSuccess('لديك متجر بالفعل! سيتم توجيهك إلى صفحة المنتجات.');
                    setTimeout(() => {
                        navigate('/products');
                    }, 2000);
                }
            } catch (err) {
                console.error('Error checking shop:', err);
                // إذا كان الخطأ 404، فهذا يعني أن المستخدم ليس لديه متجر
                if (err.response && err.response.status === 404) {
                    setHasShop(false);
                } else if (err.response && err.response.status === 401) {
                    // إذا كان الخطأ 401، فهذا يعني أن المستخدم غير مصرح له
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    navigate('/');
                } else {
                    setError('حدث خطأ أثناء التحقق من المتجر. يرجى المحاولة مرة أخرى.');
                }
            } finally {
                setLoading(false);
            }
        };

        checkShop();
    }, [navigate]);

    const handleLogoChange = (e) => {
        setShopLogo(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // التحقق من البيانات
        if (!shopName || !shopAddress || !shopUrl || !shopLogo) {
            setError('جميع الحقول مطلوبة');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');

            // إنشاء FormData لإرسال الملف
            const formData = new FormData();
            formData.append('name', shopName);
            formData.append('address', shopAddress);
            formData.append('url', shopUrl);
            formData.append('logo', shopLogo);

            console.log('Registering shop with data:', { name: shopName, address: shopAddress, url: shopUrl });
            await axios.post('http://localhost:8000/api/shop/register/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('تم تسجيل المتجر بنجاح! سيتم توجيهك إلى صفحة المنتجات.');
            setTimeout(() => {
                navigate('/products');
            }, 2000);
        } catch (err) {
            console.error('Error registering shop:', err);

            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Status code:', err.response.status);

                // معالجة رسائل الخطأ
                const errorData = err.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                    setError(errorMessages);
                } else if (typeof errorData === 'string') {
                    setError(errorData);
                } else {
                    setError(`خطأ في الخادم (${err.response.status})`);
                }
            } else if (err.request) {
                setError('لم يتم تلقي استجابة من الخادم. تأكد من تشغيل الخادم.');
            } else {
                setError('فشل تسجيل المتجر. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '600px', margin: 'auto', paddingTop: '50px', textAlign: 'center' }}>
                <h2>جاري التحميل...</h2>
            </div>
        );
    }

    if (hasShop) {
        return (
            <div style={{ maxWidth: '600px', margin: 'auto', paddingTop: '50px', textAlign: 'center' }}>
                <div style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '15px',
                    borderRadius: '5px',
                    marginBottom: '20px'
                }}>
                    {success}
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', paddingTop: '50px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>تسجيل متجر جديد</h2>

            {success && (
                <div style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '15px',
                    borderRadius: '5px',
                    marginBottom: '20px'
                }}>
                    {success}
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '15px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    whiteSpace: 'pre-line'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم المتجر</label>
                    <input
                        type="text"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>عنوان المتجر</label>
                    <input
                        type="text"
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>رابط المتجر</label>
                    <input
                        type="url"
                        value={shopUrl}
                        onChange={(e) => setShopUrl(e.target.value)}
                        required
                        placeholder="https://example.com"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>شعار المتجر</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'جاري التسجيل...' : 'تسجيل المتجر'}
                </button>
            </form>
        </div>
    );
}

export default RegisterShop;
