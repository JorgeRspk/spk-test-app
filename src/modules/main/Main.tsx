import { useState, useEffect, useCallback, useRef } from 'react';
import { toggleSidebarMenu } from '@app/store/reducers/ui';
import {
  addWindowClass,
  removeWindowClass,
  scrollbarVisible,
} from '@app/utils/helpers';
import ControlSidebar from '@app/modules/main/control-sidebar/ControlSidebar';
import Header from '@app/modules/main/header/Header';
import Footer from '@app/modules/main/footer/Footer';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import MenuSidebar from './menu-sidebar/MenuSidebar';
import { styled } from 'styled-components';
import { Outlet } from 'react-router-dom';
import { Loading } from '@app/components/Loading';
import ChatBot from '@app/components/ChatBot';

const MENU_WIDTH = 250;

export const Container = styled.div<{ $isScrollbarVisible: boolean }>`
  min-height: 100%;
  ${(props) =>
    `width: calc(100% - ${props.$isScrollbarVisible ? '16px' : '0px'});`};
`;

export const ContentWrapper = styled.div<{ $marginLeft: string }>`
  margin-left: ${props => props.$marginLeft};
  min-height: 100vh;
  padding: 0;
  transition: margin-left 0.3s ease-in-out;
  background-color: #f4f6f9;
`;

const Main = () => {
  const dispatch = useAppDispatch();
  const menuSidebarCollapsed = useAppSelector(
    (state) => state.ui.menuSidebarCollapsed
  );
  const controlSidebarCollapsed = useAppSelector(
    (state) => state.ui.controlSidebarCollapsed
  );
  const layoutBoxed = useAppSelector((state) => state.ui.layoutBoxed);
  const topNavigation = useAppSelector((state) => state.ui.topNavigation);

  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);
  const mainRef = useRef<HTMLDivElement | undefined>();

  const handleToggleMenuSidebar = () => {
    dispatch(toggleSidebarMenu());
  };

  useEffect(() => {
    setIsAppLoaded(Boolean(currentUser));
  }, [currentUser]);

  useEffect(() => {
    removeWindowClass('register-page');
    removeWindowClass('login-page');
    removeWindowClass('hold-transition');

    addWindowClass('sidebar-mini');

    return () => {
      removeWindowClass('sidebar-mini');
    };
  }, []);

  useEffect(() => {
    removeWindowClass('sidebar-closed');
    removeWindowClass('sidebar-collapse');
    removeWindowClass('sidebar-open');
    if (menuSidebarCollapsed && screenSize === 'lg') {
      addWindowClass('sidebar-collapse');
    } else if (menuSidebarCollapsed && screenSize === 'xs') {
      addWindowClass('sidebar-open');
    } else if (!menuSidebarCollapsed && screenSize !== 'lg') {
      addWindowClass('sidebar-closed');
      addWindowClass('sidebar-collapse');
    }
  }, [screenSize, menuSidebarCollapsed]);

  useEffect(() => {
    if (controlSidebarCollapsed) {
      removeWindowClass('control-sidebar-slide-open');
    } else {
      addWindowClass('control-sidebar-slide-open');
    }
  }, [screenSize, controlSidebarCollapsed]);

  const handleUIChanges = () => {
    setIsScrollbarVisible(scrollbarVisible(window.document.body));
  };

  useEffect(() => {
    window.document.addEventListener('scroll', handleUIChanges);
    window.document.addEventListener('resize', handleUIChanges);

    return () => {
      window.document.removeEventListener('scroll', handleUIChanges);
      window.document.removeEventListener('resize', handleUIChanges);
    };
  }, []);

  useEffect(() => {
    handleUIChanges();
  }, [mainRef.current]);

  const getAppTemplate = useCallback(() => {
    if (!isAppLoaded) {
      return <Loading />;
    }

    const marginLeft = !['sm', 'xs'].includes(screenSize)
      ? topNavigation
        ? '0'
        : `${MENU_WIDTH}px`
      : '0';

    return (
      <>
        <Header
          containered={layoutBoxed}
          style={{
            marginLeft
          }}
        />

        {!topNavigation && <MenuSidebar />}

        <ContentWrapper
          ref={mainRef as any}
          className="content-wrapper"
          $marginLeft={marginLeft}
        >
          <section className="content" style={{ margin: 0, padding: 0 }}>
            <div style={{ margin: 0, padding: 0 }}>
              <Outlet />
            </div>
          </section>
        </ContentWrapper>

        <Footer
          containered={layoutBoxed}
          style={{
            marginLeft
          }}
        />
        <ControlSidebar />
        <div
          id="sidebar-overlay"
          role="presentation"
          onClick={handleToggleMenuSidebar}
          onKeyDown={() => {}}
          style={{
            display:
              screenSize === 'sm' && menuSidebarCollapsed ? 'block' : undefined,
          }}
        />
      </>
    );
  }, [
    isAppLoaded,
    menuSidebarCollapsed,
    screenSize,
    layoutBoxed,
    topNavigation
  ]);

  return (
    <Container $isScrollbarVisible={isScrollbarVisible} className="wrapper">
      {getAppTemplate()}
      <ChatBot />
    </Container>
  );
};

export default Main;
