import React from 'react';
import NamamIcon from './NamamIcon';
import PeacockFeatherIcon from './PeacockFeatherIcon';
import FlowerIcon from './FlowerIcon';
import CowIcon from './CowIcon';

const KrishnaThemeHeader = () => {
  return (
    <div className="krishna-theme-header">
      <div className="krishna-icons-left">
        <PeacockFeatherIcon />
        <FlowerIcon />
      </div>
      <div className="krishna-title">
        <NamamIcon className="namam-large" />
        <h1>Krishna Attendance</h1>
        <NamamIcon className="namam-large" />
      </div>
      <div className="krishna-icons-right">
        <CowIcon />
        <FlowerIcon />
      </div>
    </div>
  );
};

export default KrishnaThemeHeader;
