import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setWindowSize } from '@app/store/reducers/ui';
import { setCurrentUser } from '@app/store/reducers/auth';
import Main from '@app/modules/main/Main';
import Login from '@app/modules/login/Login';
import Register from '@app/modules/register/Register';
import ForgetPassword from '@app/modules/forgot-password/ForgotPassword';
import RecoverPassword from '@app/modules/recover-password/RecoverPassword';
import { useWindowSize } from '@app/hooks/useWindowSize';
import { calculateWindowSize } from '@app/utils/helpers';
import { useAppSelector } from '@app/store/store';
import Dashboard from '@app/pages/Dashboard';
import Blank from '@app/pages/Blank';
import SubMenu from '@app/pages/SubMenu';
import Profile from '@app/pages/profile/Profile';
import Home from '@app/pages/Home';
import Diagrama from '@app/pages/Diagrama';
import { GeneralDashboard } from '@app/pages';

const App = () => {
    const windowSize = useWindowSize();
    const dispatch = useDispatch();
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

    React.useEffect(() => {
        const size = calculateWindowSize(windowSize.width);
        dispatch(setWindowSize(size));
    }, [windowSize, dispatch]);

    React.useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            dispatch(setCurrentUser(JSON.parse(user)));
        }
    }, [dispatch]);

    return (
        <Routes>
            {!isLoggedIn ? (
                <>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgetPassword />} />
                    <Route path="/recover-password" element={<RecoverPassword />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>
            ) : (
                <Route path="/" element={<Main />}>
                    <Route index element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/general-dashboard" element={<GeneralDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/diagrama" element={<Diagrama />} />
                    <Route path="/blank" element={<Blank />} />
                    <Route path="/sub-menu-1" element={<SubMenu />} />
                    <Route path="/sub-menu-2" element={<Blank />} />
                </Route>
            )}
        </Routes>
    );
};

export default App;
