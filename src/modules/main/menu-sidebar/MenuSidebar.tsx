import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Image } from '@profabric/react-components';
import styled from 'styled-components';
import { SidebarSearch } from '@app/components/sidebar-search/SidebarSearch';
import { useAppSelector } from '@app/store/store';

export interface IMenuItem {
    name: string;
    icon?: string;
    path?: string;
    children?: Array<IMenuItem>;
}

export const MENU: IMenuItem[] = [
    {
        name: 'Inicio',
        icon: 'fas fa-home',
        path: '/home'
    },
    {
        name: 'Sensores',
        icon: 'fas fa-tachometer-alt',
        path: '/dashboard'
    },
    {
        name: 'Dashboard General',
        icon: 'fas fa-chart-line',
        path: '/general-dashboard'
    },
    {
        name: 'Diagrama',
        icon: 'fas fa-project-diagram',
        path: '/diagrama'
    }
];

const StyledBrandImage = styled(Image)`
    float: left;
    line-height: 0.8;
    margin: -1px 8px 0 6px;
    opacity: 0.8;
    --pf-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19),
        0 6px 6px rgba(0, 0, 0, 0.23) !important;
`;

const StyledUserImage = styled(Image)`
    --pf-box-shadow: 0 3px 6px #00000029, 0 3px 6px #0000003b !important;
`;

const MenuSidebar = () => {
    const [t] = useTranslation();
    const currentUser = useAppSelector((state) => state.auth.currentUser);
    const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);
    const menuItemFlat = useAppSelector((state) => state.ui.menuItemFlat);
    const menuChildIndent = useAppSelector((state) => state.ui.menuChildIndent);

    const renderMenuItem = (menuItem: IMenuItem) => (
        <li key={menuItem.path || menuItem.name} className={`nav-item${menuItem.children ? ' menu-is-opening menu-open' : ''}`}>
            <Link to={menuItem.path || '#'} className="nav-link">
                <i className={`nav-icon ${menuItem.icon}`} />
                <p>
                    {menuItem.name}
                    {menuItem.children && <i className="right fas fa-angle-left" />}
                </p>
            </Link>
            {menuItem.children && (
                <ul className="nav nav-treeview">
                    {menuItem.children.map((child) => renderMenuItem(child))}
                </ul>
            )}
        </li>
    );

    return (
        <aside className={`main-sidebar elevation-4 ${sidebarSkin}`}>
            <Link to="/" className="brand-link">
                <span className="brand-text" style={{ marginLeft: '10px', fontSize: '1.5rem', letterSpacing: '1px' }}>
                    <span style={{ fontWeight: '800' }}>SPK</span>{' '}
                    <span style={{ fontSize: '1.2rem', fontWeight: '300', opacity: '0.8' }}>IoT</span>
                </span>
            </Link>
            <div className="sidebar pt-3">
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div className="image">
                        <StyledUserImage
                            src={currentUser?.photoURL}
                            fallbackSrc="/img/default-profile.png"
                            alt="User"
                            width={34}
                            height={34}
                            rounded
                        />
                    </div>
                    <div className="info">
                        <Link to="/profile" className="d-block">
                            {currentUser?.username || currentUser?.email?.split('@')[0] || 'Invitado'}
                        </Link>
                    </div>
                </div>

                <div className="form-inline">
                    <SidebarSearch />
                </div>

                <nav className="mt-2" style={{ overflowY: 'hidden' }}>
                    <ul
                        className={`nav nav-pills nav-sidebar flex-column${
                            menuItemFlat ? ' nav-flat' : ''
                        }${menuChildIndent ? ' nav-child-indent' : ''}`}
                        data-widget="treeview"
                        role="navigation"
                    >
                        {MENU.map((menuItem) => renderMenuItem(menuItem))}
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default MenuSidebar;
