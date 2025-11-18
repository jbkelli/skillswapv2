import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AuthInput from '../components/AuthInput';
import SkillInput from '../components/SkillInput';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';
import { allLocations } from '../data/locations';

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    profilePic: '',
    location: '',
    phone: '',
    linkedin: '',
    github: '',
    twitter: ''
  });

  const [skillsHave, setSkillsHave] = useState([]);
  const [skillsWant, setSkillsWant] = useState([]);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please upload a valid image file', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        // Time to compress this image
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large (max 800x800)
          const maxSize = 800;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.8 quality)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setImagePreview(compressedDataUrl);
          setFormData({ ...formData, profilePic: compressedDataUrl });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await userService.getMyProfile();
      const user = response.user;
      
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        profilePic: user.profilePic || '',
        location: user.location || '',
        phone: user.contacts?.phone || '',
        linkedin: user.contacts?.linkedin || '',
        github: user.contacts?.github || '',
        twitter: user.contacts?.twitter || ''
      });
      
      setSkillsHave(user.skillsHave || []);
      setSkillsWant(user.skillsWant || []);
    } catch (err) {
      showNotification('Failed to load profile', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        profilePic: formData.profilePic,
        location: formData.location,
        contacts: {
          phone: formData.phone,
          linkedin: formData.linkedin,
          github: formData.github,
          twitter: formData.twitter
        },
        skillsHave,
        skillsWant
      });

      showNotification('Profile updated successfully!', 'success');
      setEditing(false);
      
      // Update local storage
      const updatedUser = {
        ...currentUser,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        skillsHave,
        skillsWant
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Profile update error:', err);
      showNotification(err.response?.data?.message || err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative flex flex-col">
      <NeuralBackground />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        {/* Profile Content */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">My Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {editing ? (
            <form onSubmit={handleSubmit}>
              {/* Profile Picture */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Profile Picture</h3>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold overflow-hidden">
                    {imagePreview || formData.profilePic ? (
                      <img src={imagePreview || formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{formData.firstName?.[0]}{formData.lastName?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <label className="block text-sm text-gray-400 mb-2">Upload from computer:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-sm text-gray-400 mb-2">Or enter image URL:</label>
                      <AuthInput
                        icon="🖼️"
                        type="url"
                        name="profilePic"
                        placeholder="https://example.com/photo.jpg"
                        value={formData.profilePic}
                        onChange={(e) => {
                          handleChange(e);
                          setImagePreview('');
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <AuthInput
                    icon="👤"
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <AuthInput
                    icon="👤"
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">📍</div>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">Select Location</option>
                    {allLocations.map((location, idx) => (
                      <option key={idx} value={location}>{location}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">About Me</h3>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell others about yourself..."
                  maxLength={500}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Skills</h3>
                <SkillInput
                  label="Skills I Have"
                  skills={skillsHave}
                  setSkills={setSkillsHave}
                  placeholder="e.g., React, JavaScript, Python"
                  icon="💡"
                />
                <SkillInput
                  label="Skills I Want to Learn"
                  skills={skillsWant}
                  setSkills={setSkillsWant}
                  placeholder="e.g., Cybersecurity, Machine Learning"
                  icon="🎯"
                />
              </div>

              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <AuthInput
                  icon="📱"
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <AuthInput
                  icon="💼"
                  type="url"
                  name="linkedin"
                  placeholder="LinkedIn URL"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
                <AuthInput
                  icon="💻"
                  type="url"
                  name="github"
                  placeholder="GitHub URL"
                  value={formData.github}
                  onChange={handleChange}
                />
                <AuthInput
                  icon="🐦"
                  type="url"
                  name="twitter"
                  placeholder="Twitter/X URL"
                  value={formData.twitter}
                  onChange={handleChange}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition-colors font-semibold disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-8">
                <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-bold overflow-hidden">
                  {formData.profilePic ? (
                    <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{formData.firstName?.[0]}{formData.lastName?.[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl font-bold mb-2">{formData.firstName} {formData.lastName}</h3>
                  <p className="text-gray-400 text-lg mb-2">@{currentUser.username}</p>
                  <p className="text-gray-400 mb-2">{currentUser.email}</p>
                  {formData.location && (
                    <p className="text-gray-400">📍 {formData.location}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {formData.bio && (
                <div className="mb-8">
                  <h4 className="text-2xl font-bold mb-3">About</h4>
                  <p className="text-gray-300 leading-relaxed">{formData.bio}</p>
                </div>
              )}

              {/* Skills I Have */}
              <div className="mb-8">
                <h4 className="text-2xl font-bold mb-4 text-blue-400">💡 Skills I Have</h4>
                <div className="flex flex-wrap gap-3">
                  {skillsHave.length > 0 ? (
                    skillsHave.map((skill, idx) => (
                      <span key={idx} className="bg-blue-600/30 border border-blue-500 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills added yet</p>
                  )}
                </div>
              </div>

              {/* Skills I Want */}
              <div className="mb-8">
                <h4 className="text-2xl font-bold mb-4 text-purple-400">🎯 Skills I Want to Learn</h4>
                <div className="flex flex-wrap gap-3">
                  {skillsWant.length > 0 ? (
                    skillsWant.map((skill, idx) => (
                      <span key={idx} className="bg-purple-600/30 border border-purple-500 text-purple-300 px-4 py-2 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills added yet</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {(formData.phone || formData.linkedin || formData.github || formData.twitter) && (
                <div>
                  <h4 className="text-2xl font-bold mb-4">📞 Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.phone && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="text-white">{formData.phone}</p>
                      </div>
                    )}
                    {formData.linkedin && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">LinkedIn</p>
                        <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                          {formData.linkedin}
                        </a>
                      </div>
                    )}
                    {formData.github && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">GitHub</p>
                        <a href={formData.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                          {formData.github}
                        </a>
                      </div>
                    )}
                    {formData.twitter && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Twitter/X</p>
                        <a href={formData.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                          {formData.twitter}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  </div>
  );
}
