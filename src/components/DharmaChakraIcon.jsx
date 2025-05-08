import React from 'react';

const DharmaChakraIcon = ({ className = '', style = {} }) => {
  return (
    <i 
      className={`fa-regular fa-dharmachakra ${className}`} 
      style={{ color: '#1a73e8', ...style }}
    ></i>
  );
};

export default DharmaChakraIcon;
