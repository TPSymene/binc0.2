import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, shopData, ownerData }) {
  if (!isOpen) return null;

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        {shopData && shopData.logo ? (
          <img src={shopData.logo} alt={shopData.name} className="shop-logo" />
        ) : (
          <div className="shop-logo-placeholder">
            {shopData ? shopData.name.charAt(0) : 'M'}
          </div>
        )}
        <h2 className="shop-name">{shopData ? shopData.name : 'متجري'}</h2>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {ownerData ? ownerData.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-info">
          <h3 className="user-name">{ownerData ? ownerData.username : 'المستخدم'}</h3>
          <p className="user-role">مالك المتجر</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/owner-dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-tachometer-alt"></i>
              <span>الرئيسية</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner-dashboard/products" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-box"></i>
              <span>المنتجات</span>
            </NavLink>
          </li>
          {/* تم إزالة قسم الطلبات لأن المنصة للعرض فقط */}
          <li>
            <NavLink to="/owner-dashboard/specifications" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-list-ul"></i>
              <span>المواصفات</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner-dashboard/brands" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-tag"></i>
              <span>العلامات التجارية</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner-dashboard/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-chart-bar"></i>
              <span>التحليلات</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner-dashboard/notifications" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-bell"></i>
              <span>الإشعارات</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner-dashboard/settings" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-cog"></i>
              <span>إعدادات المتجر</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/" className="view-store-btn">
          <i className="fas fa-store"></i>
          <span>عرض المتجر</span>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
