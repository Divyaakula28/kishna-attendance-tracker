import React from 'react';

const FluteFontAwesomeIcon = ({ className = '', style = {} }) => {
  return (
    <i
      className={`fa-thin fa-flute ${className}`}
      style={{ color: '#74C0FC', ...style }}
    ></i>
  );
};

export default FluteFontAwesomeIcon;
