import React from 'react';
import '../styles/Card.css';

const Card = ({ title, badgeText, badgeType, children, actions, hoverable = false }) => {
  return (
    <div className={`academia-card ${hoverable ? 'academia-card-hoverable' : ''}`}>
      
      {/* Top Bar Header */}
      {title && (
        <div className="academia-card-header">
          <h3 className="academia-title">{title}</h3>
          {badgeText && (
            <span className={`academia-badge academia-badge-${badgeType}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}

      {/* Main Metadata Details */}
      <div className="academia-card-body">
        {children}
      </div>

      {/* Control Action Buttons */}
      {actions && (
        <div className="academia-card-actions">
          {actions}
        </div>
      )}

    </div>
  );
};

export default Card;

