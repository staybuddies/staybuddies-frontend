// src/router/adminGuard.js
export function adminGuard(to, from, next) {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
  
    if (!adminToken || !adminUser) {
      next('/admin/login');
      return;
    }
  
    try {
      const user = JSON.parse(adminUser);
      if (user.role !== 'ADMIN') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        next('/admin/login');
        return;
      }
    } catch (e) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      next('/admin/login');
      return;
    }
  
    next();
  }