import React, { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';

export default function ImageUpload({ onImageUpload, currentImage, userInfo }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    setError('');

    // Validare tip de fișier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload only image files (JPG, PNG, GIF)');
      setUploading(false);
      return;
    }

    // Validare dimensiune (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/products/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      // Trimite calea imaginii la componenta părinte
      onImageUpload(response.data.imagePath);
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label">Product Image</label>

      {/* Drag & Drop Area */}
      <div
        className={`border border-2 border-dashed p-4 text-center ${
          dragging ? 'border-primary bg-light' : 'border-secondary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ cursor: 'pointer' }}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Uploading...</span>
            </div>
            <p className="mt-2">Uploading image...</p>
          </div>
        ) : (
          <div>
            <i className="bi bi-cloud-upload" style={{ fontSize: '2rem' }}></i>
            <p>Drag & drop an image here, or click to select</p>
            <p className="text-muted small">
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Current image preview */}
      {currentImage && (
        <div className="mt-3">
          <p className="text-muted">Current image:</p>
          <img
            src={currentImage}
            alt="Current"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              objectFit: 'cover',
              border: '1px solid #dee2e6',
              borderRadius: '0.375rem',
            }}
          />
          <p className="small text-muted mt-1">{currentImage}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}
    </div>
  );
}
