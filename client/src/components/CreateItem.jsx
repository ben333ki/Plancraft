import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/CreateItem.css';
import { API_URL } from '../config/constants';

const CATEGORIES = [
    'Tools', 
    'Combat', 
    'Ingredients', 
    'Foods', 
    'Building Blocks',
    'Colored Blocks', 
    'Functional Blocks', 
    'Redstone Blocks', 
    'Natural Blocks'
];

const CreateItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    item_name: '',
    item_description: '',
    item_category: ''
  });
  const [itemImage, setItemImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // First upload the image
      let imageUrl = '';
      if (itemImage) {
        imageUrl = await uploadImage(itemImage);
      }

      // Then create the item with the image URL
      const response = await fetch(`${API_URL}/api/create-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          item_name: formData.item_name,
          item_description: formData.item_description,
          item_category: formData.item_category,
          item_image: imageUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create item');
      }

      // Redirect to items list or show success message
      navigate('/craft');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-item-page">
        <div className="create-item-container">
          <div className="create-item-box">
            <h1>Create New Item</h1>
            
            {error && <div className="create-item-error">{error}</div>}

            <form onSubmit={handleSubmit} className="create-item-form">
              <div className="create-item-form-group">
                <label htmlFor="item_name">Item Name</label>
                <input
                  type="text"
                  id="item_name"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter item name"
                />
              </div>

              <div className="create-item-form-group">
                <label htmlFor="item_category">Category</label>
                <select
                  id="item_category"
                  name="item_category"
                  value={formData.item_category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="create-item-form-group">
                <label htmlFor="item_description">Description</label>
                <textarea
                  id="item_description"
                  name="item_description"
                  value={formData.item_description}
                  onChange={handleInputChange}
                  placeholder="Enter item description"
                  rows="4"
                />
              </div>

              <div className="create-item-form-group">
                <label htmlFor="item_image">Item Image</label>
                <div className="create-item-image-upload">
                  <div 
                    className="create-item-image-preview"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" />
                    ) : (
                      <div className="create-item-image-placeholder">
                        <span>Click to upload image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="item_image"
                    name="item_image"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                    required
                  />
                </div>
              </div>

              <div className="create-item-form-actions">
                <button 
                  type="submit" 
                  className="create-item-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Item'}
                </button>
                <button 
                  type="button" 
                  className="create-item-cancel-btn"
                  onClick={() => navigate('/craft')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateItem;