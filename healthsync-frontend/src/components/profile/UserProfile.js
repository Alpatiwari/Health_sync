import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../hooks/useHealthData';
import LoadingSpinner from '../common/LoadingSpinner';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { healthProfile, updateHealthProfile } = useHealthData();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    medicalConditions: [],
    medications: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  useEffect(() => {
    if (user && healthProfile) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dateOfBirth: healthProfile.dateOfBirth || '',
        gender: healthProfile.gender || '',
        height: healthProfile.height || '',
        weight: healthProfile.weight || '',
        activityLevel: healthProfile.activityLevel || 'moderate',
        medicalConditions: healthProfile.medicalConditions || [],
        medications: healthProfile.medications || [],
        emergencyContact: healthProfile.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        }
      });
    }
  }, [user, healthProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user info
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });

      // Update health profile
      await updateHealthProfile({
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        activityLevel: formData.activityLevel,
        medicalConditions: formData.medicalConditions,
        medications: formData.medications,
        emergencyContact: formData.emergencyContact
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error (show notification)
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return '';
    const heightM = height / 100; // Convert cm to m
    const bmi = weight / (heightM * heightM);
    return bmi.toFixed(1);
  };

  if (!user || !healthProfile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={user.avatar || '/default-avatar.png'} 
            alt={`${formData.firstName} ${formData.lastName}`}
            className="avatar-image"
          />
        </div>
        <div className="profile-info">
          <h1>{formData.firstName} {formData.lastName}</h1>
          <p className="profile-email">{formData.email}</p>
          {formData.dateOfBirth && (
            <p className="profile-age">Age: {calculateAge(formData.dateOfBirth)}</p>
          )}
        </div>
        <button 
          className={`edit-btn ${isEditing ? 'cancel' : 'edit'}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3>👤 Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label>Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="very-active">Very Active</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>📏 Physical Measurements</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  min="50"
                  max="250"
                />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="20"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>🏥 Medical Information</h3>
            <div className="form-group">
              <label>Medical Conditions (comma-separated)</label>
              <textarea
                value={formData.medicalConditions.join(', ')}
                onChange={(e) => handleArrayInput('medicalConditions', e.target.value)}
                placeholder="e.g., Diabetes, Hypertension, Asthma"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Current Medications (comma-separated)</label>
              <textarea
                value={formData.medications.join(', ')}
                onChange={(e) => handleArrayInput('medications', e.target.value)}
                placeholder="e.g., Metformin, Lisinopril"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>🚨 Emergency Contact</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleInputChange}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-display">
          <div className="info-section">
            <h3>📊 Health Overview</h3>
            <div className="health-stats">
              {formData.height && formData.weight && (
                <div className="stat-card">
                  <h4>BMI</h4>
                  <p className="stat-value">{calculateBMI(formData.height, formData.weight)}</p>
                </div>
              )}
              <div className="stat-card">
                <h4>Activity Level</h4>
                <p className="stat-value">{formData.activityLevel}</p>
              </div>
              {formData.height && (
                <div className="stat-card">
                  <h4>Height</h4>
                  <p className="stat-value">{formData.height} cm</p>
                </div>
              )}
              {formData.weight && (
                <div className="stat-card">
                  <h4>Weight</h4>
                  <p className="stat-value">{formData.weight} kg</p>
                </div>
              )}
            </div>
          </div>

          {formData.medicalConditions.length > 0 && (
            <div className="info-section">
              <h3>🏥 Medical Conditions</h3>
              <div className="conditions-list">
                {formData.medicalConditions.map((condition, index) => (
                  <span key={index} className="condition-tag">{condition}</span>
                ))}
              </div>
            </div>
          )}

          {formData.medications.length > 0 && (
            <div className="info-section">
              <h3>💊 Current Medications</h3>
              <div className="medications-list">
                {formData.medications.map((medication, index) => (
                  <span key={index} className="medication-tag">{medication}</span>
                ))}
              </div>
            </div>
          )}

          {formData.emergencyContact.name && (
            <div className="info-section">
              <h3>🚨 Emergency Contact</h3>
              <div className="emergency-contact">
                <p><strong>Name:</strong> {formData.emergencyContact.name}</p>
                <p><strong>Phone:</strong> {formData.emergencyContact.phone}</p>
                <p><strong>Relationship:</strong> {formData.emergencyContact.relationship}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;