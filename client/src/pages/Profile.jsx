import React from 'react';

const user = {
  _id: "684ab2de535c909cfb0a1874",
  username: "Nithin",
  email: "jv1@gmail.com",
  password: "$2b$10$vhhdIfhVVzuxbZRuNKnZH.EiZ4iFaH.ntzub9VACtOkx80egPNLJW",
  phone: "1234567899",
  role: "user",
  createdAt: "2025-06-12T10:58:38.012+00:00",
  __v: 0
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const UserProfile = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {user.username.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ProfileField label="User ID" value={user._id} />
          <ProfileField label="Username" value={user.username} />
          <ProfileField label="Email" value={user.email} />
          <ProfileField label="Phone" value={user.phone} />
          <ProfileField label="Password (Encrypted)" value={user.password} />
          <ProfileField label="Role" value={user.role} />
          <ProfileField label="Member Since" value={formatDate(user.createdAt)} />
          <ProfileField label="DB Version" value={`v${user.__v}`} />
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium text-gray-900 truncate">{value}</p>
  </div>
);

export default UserProfile;

