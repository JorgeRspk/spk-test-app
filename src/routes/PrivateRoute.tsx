import { useAppSelector } from '@app/store/store';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
