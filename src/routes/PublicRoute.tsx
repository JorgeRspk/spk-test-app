import { useAppSelector } from '@app/store/store';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoute;
