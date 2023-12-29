export const checkAuth = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};
