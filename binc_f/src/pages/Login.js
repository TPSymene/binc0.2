import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            console.log('Sending login data:', { email, password });

            // استخدام خدمة المصادقة
            const userData = await authService.login(email, password);
            console.log('Login successful:', userData);

            // فحص هيكل البيانات المرجعة
            console.log('User data structure:', {
                'userData.user_type': userData.user_type,
                'userData.user': userData.user,
                'userData.user?.user_type': userData.user?.user_type,
                'userData.role': userData.role,
                'userData.user?.role': userData.user?.role
            });

            // التحقق من نوع المستخدم مباشرة من البيانات
            const isOwner = userData.user_type === 'owner' ||
                          (userData.user && userData.user.user_type === 'owner') ||
                          userData.role === 'owner' ||
                          (userData.user && userData.user.role === 'owner');

            console.log('Is owner (direct check):', isOwner);
            console.log('Is owner (service check):', authService.isOwner());

            // التوجيه بناءً على نوع المستخدم
            if (isOwner) {
                console.log('Navigating to owner dashboard');
                navigate('/owner-dashboard');
            } else {
                console.log('Navigating to products page');
                navigate('/products');
            }
        } catch (err) {
            console.error('Login error:', err);

            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Status code:', err.response.status);

                // Handle specific error messages from the API
                const errorData = err.response.data;
                if (typeof errorData === 'object' && errorData.error) {
                    setError(errorData.error);
                } else if (typeof errorData === 'object') {
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
                // Request was made but no response received
                console.error('No response received:', err.request);
                setError('لم يتم تلقي استجابة من الخادم. تأكد من تشغيل الخادم.');
            } else {
                // Error in setting up the request
                console.error('Error setting up request:', err.message);
                setError('فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.');
            }
        }
    };

    // تم إزالة fetchData لأن المسار /api/some-data/ غير موجود في الخادم

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '100px' }}>
            <h2>تسجيل الدخول</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <input
                    type="password"
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <button type="submit" style={{ width: '100%', padding: '8px' }}>
                    دخول
                </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                ليس لديك حساب؟ <Link to="/signup" style={{ color: '#4CAF50', textDecoration: 'none' }}>إنشاء حساب جديد</Link>
            </div>
            {error && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '10px',
                    borderRadius: '5px',
                    marginTop: '15px',
                    marginBottom: '15px',
                    whiteSpace: 'pre-line'
                }}>
                    {error}
                </div>
            )}
            {/* تم إزالة عرض البيانات */}
        </div>
    );
}

export default Login;
