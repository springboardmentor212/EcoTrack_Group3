import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const isAdminRequest = req.url.includes('/api/admin/');

  const token = isAdminRequest
    ? localStorage.getItem('ecotrack_admin_token')
    : localStorage.getItem('ecotrack_token');

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  return next(req);
};