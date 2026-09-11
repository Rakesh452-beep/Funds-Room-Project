import api from './api';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};

export const customerApi = {
  getCustomers: async (params?: any) => {
    const res = await api.get('/customers', { params });
    return res.data.data;
  },
  getCustomer: async (id: string) => {
    const res = await api.get(`/customers/${id}`);
    return res.data.data;
  },
  createCustomer: async (data: any) => {
    const res = await api.post('/customers', data);
    return res.data;
  },
  updateCustomer: async (id: string, data: any) => {
    const res = await api.put(`/customers/${id}`, data);
    return res.data;
  },
  deleteCustomer: async (id: string) => {
    const res = await api.delete(`/customers/${id}`);
    return res.data;
  },
  addFollowUp: async (id: string, note: string) => {
    const res = await api.post(`/customers/${id}/follow-ups`, { note });
    return res.data;
  },
};

export const productApi = {
  getProducts: async (params?: any) => {
    const res = await api.get('/products', { params });
    return res.data.data;
  },
  getProduct: async (id: string) => {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  },
  createProduct: async (data: any) => {
    const res = await api.post('/products', data);
    return res.data;
  },
  updateProduct: async (id: string, data: any) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
  logStockMovement: async (id: string, data: any) => {
    const res = await api.post(`/products/${id}/stock`, data);
    return res.data;
  },
  getStockMovements: async (params?: any) => {
    const res = await api.get('/products/stock-movements', { params });
    return res.data.data;
  },
  getLowStock: async () => {
    const res = await api.get('/products/low-stock');
    return res.data.data;
  },
};

export const challanApi = {
  getChallans: async (params?: any) => {
    const res = await api.get('/challans', { params });
    return res.data.data;
  },
  getChallan: async (id: string) => {
    const res = await api.get(`/challans/${id}`);
    return res.data.data;
  },
  createChallan: async (data: any) => {
    const res = await api.post('/challans', data);
    return res.data;
  },
  updateChallan: async (id: string, data: any) => {
    const res = await api.put(`/challans/${id}`, data);
    return res.data;
  },
  confirmChallan: async (id: string) => {
    const res = await api.post(`/challans/${id}/confirm`);
    return res.data;
  },
  cancelChallan: async (id: string) => {
    const res = await api.post(`/challans/${id}/cancel`);
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await api.get('/challans/dashboard/stats');
    return res.data.data;
  },
  getPublicStats: async () => {
    const res = await api.get('/challans/public/stats');
    return res.data.data;
  },
  downloadInvoice: async (id: string) => {
    const res = await api.get(`/challans/${id}/invoice`, { responseType: 'blob' });
    return res.data;
  },
};

export const userApi = {
  getUsers: async (params?: any) => {
    const res = await api.get('/users', { params });
    return res.data.data;
  },
  createUser: async (data: any) => {
    const res = await api.post('/users', data);
    return res.data;
  },
  updateUser: async (id: string, data: any) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
};