import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StyledBigUserImage, StyledSmallUserImage, Button } from '@app/styles/common';
import {
  UserBody,
  UserFooter,
  UserHeader,
  UserMenuDropdown,
} from '@app/styles/dropdown-menus';
import { logout } from '@app/services/auth';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { setCurrentUser } from '@app/store/reducers/auth';
import { DateTime } from 'luxon';
import { toast } from 'react-toastify';

const UserDropdown = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(setCurrentUser(null));
      navigate('/login');
    } catch (error: any) {
      toast.error('Error al cerrar sesión');
    }
  };

  const navigateToProfile = (event: any) => {
    event.preventDefault();
    setDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <UserMenuDropdown isOpen={dropdownOpen} hideArrow>
      <StyledSmallUserImage
        slot="head"
        src={currentUser?.photoURL}
        fallbackSrc="/img/default-profile.png"
        alt="User"
        width={25}
        height={25}
        rounded
      />
      <div slot="body">
        <UserHeader className=" bg-primary">
          <StyledBigUserImage
            src={currentUser?.photoURL}
            fallbackSrc="/img/default-profile.png"
            alt="User"
            width={90}
            height={90}
            rounded
          />
          <p>
            {currentUser?.username || currentUser?.email?.split('@')[0] || 'Invitado'}
            <small>
              <span>Miembro desde </span>
              {currentUser?.metadata?.creationTime && (
                <span>
                  {DateTime.fromRFC2822(
                    currentUser?.metadata?.creationTime
                  ).toFormat('dd LLL yyyy')}
                </span>
              )}
            </small>
          </p>
        </UserHeader>
        <UserBody>
          <div className="row">
            <div className="col-4 text-center">
              <Link to="/">{t('header.user.followers')}</Link>
            </div>
            <div className="col-4 text-center">
              <Link to="/">{t('header.user.sales')}</Link>
            </div>
            <div className="col-4 text-center">
              <Link to="/">{t('header.user.friends')}</Link>
            </div>
          </div>
        </UserBody>
        <UserFooter>
          <button
            type="button"
            className="btn btn-default btn-flat"
            onClick={navigateToProfile}
          >
            {t('header.user.profile')}
          </button>
          <Button onClick={handleLogout}>
            {t('login.button.signOut')}
          </Button>
        </UserFooter>
      </div>
    </UserMenuDropdown>
  );
};

export default UserDropdown;
