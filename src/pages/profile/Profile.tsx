import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentHeader } from '@components';
import { Image, Button as RawButton } from '@profabric/react-components';
import styled from 'styled-components';
import ActivityTab from './ActivityTab';
import TimelineTab from './TimelineTab';
import SettingsTab from './SettingsTab';
import { Button } from '@app/styles/common';
import { useAppSelector } from '@app/store/store';

const StyledUserImage = styled(Image)`
  --pf-border: 3px solid #adb5bd;
  --pf-padding: 3px;
`;

export const TabButton = styled(RawButton)`
  margin-right: 0.25rem;
  --pf-width: 8rem;
`;

const Profile = () => {
  const [activeTab, setActiveTab] = useState('SETTINGS');
  const [t] = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const toggle = (tab: string) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <>
      <ContentHeader title="Profile" />
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3">
              <div className="card card-primary card-outline">
                <div className="card-body box-profile">
                  <div className="text-center">
                    <StyledUserImage
                      width={100}
                      height={100}
                      rounded
                      src={currentUser?.photoURL}
                      fallbackSrc="/img/default-profile.png"
                      alt="User profile"
                    />
                  </div>
                  <h3 className="profile-username text-center">
                    {currentUser?.displayName}
                  </h3>
                  <p className="text-muted text-center">{currentUser?.username}</p>
                  <ul className="list-group list-group-unbordered mb-3">
                  </ul>
                </div>
                {/* /.card-body */}
              </div>
              <div className="card card-primary">
              </div>
            </div>
            <div className="col-md-9">
              <div className="card">
                <div className="card-header p-2">
                  <ul className="nav nav-pills">
                    <li className="nav-item">
                      <TabButton
                        variant={activeTab === 'SETTINGS' ? 'primary' : 'light'}
                        onClick={() => toggle('SETTINGS')}
                      >
                        {t('main.label.settings')}
                      </TabButton>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <div className="tab-content">
                    <SettingsTab isActive={activeTab === 'SETTINGS'} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
