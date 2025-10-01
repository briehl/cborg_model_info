import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, modelData }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{modelData?.model_name || 'Model Details'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <pre className="json-display">
            {JSON.stringify(modelData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Modal;