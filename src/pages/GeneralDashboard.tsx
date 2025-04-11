import React from 'react';
import { ContentHeader } from '@components';
import GeneralSensorChart from '@app/components/GeneralSensorChart';

const GeneralDashboard = () => {
  return (
    <div className="content-wrapper">
      <ContentHeader title="Dashboard General" />
      
      <section className="content">
        <div className="container-fluid">
          <GeneralSensorChart showCard={true} showStats={false} />
        </div>
      </section>
    </div>
  );
};

export default GeneralDashboard; 