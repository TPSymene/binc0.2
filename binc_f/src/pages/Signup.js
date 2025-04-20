import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [userType, setUserType] = useState('customer');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (password !== password2) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }

        try {
            // سجلات الخادم تظهر أن طلبات OPTIONS ناجحة لمسار /api/auth/register/
            console.log('Sending registration data:', { username, email, password, password2, user_type: userType });

            const response = await axios.post('http://localhost:8000/api/auth/register/', {
                username,
                email,
                password,
                password2,
                user_type: userType
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            // استخدام المتغير response لإزالة التحذير
            const userData = response.data;
            console.log('Registration successful:', userData);
            setSuccess('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error('Registration error:', err);

            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Status code:', err.response.status);

                // Handle specific error messages from the API
                const errorData = err.response.data;
                if (typeof errorData === 'object') {
                    // Extract error messages
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
                setError('فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>إنشاء حساب جديد</h2>

            {success && (
                <div style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '15px'
                }}>
                    {success}
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    whiteSpace: 'pre-line'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSignup}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>اسم المستخدم</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>البريد الإلكتروني</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>كلمة المرور</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>تأكيد كلمة المرور</label>
                    <input
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>نوع المستخدم</label>
                    <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="customer">عميل</option>
                        <option value="owner">مالك متجر</option>
                    </select>
                </div>

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        marginBottom: '15px'
                    }}
                >
                    إنشاء حساب
                </button>

                <div style={{ textAlign: 'center' }}>
                    لديك حساب بالفعل؟ <Link to="/" style={{ color: '#4CAF50', textDecoration: 'none' }}>تسجيل الدخول</Link>
                </div>
            </form>
        </div>
    );
}

export default Signup;
