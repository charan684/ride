
import axios from 'axios';

const sendOneSignalNotification = async (playerIds, title, message, additionalData = {}) => {
  const ONESIGNAL_APP_ID = 'b1bc24f2-cac7-4677-9f0d-42b0e8f3de2e';
  const ONESIGNAL_REST_API_KEY = 'os_v2_app_wg6cj4wky5dhphynikyor466fycsiozrppxufl55gwwwoxoawtafnvzt5kpufmryz4pug6s45buee2hilpwdxmnbhyxfizpn5churbi';
  
  const notificationData = {
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: playerIds,
    headings: { en: title },
    contents: { en: message },
    data: additionalData,
    android_background_data: true,
    priority: 10,
  };
  
  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      notificationData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
      }
    );
    
    console.log('OneSignal notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('OneSignal notification error:', error.response?.data || error.message);
    throw error;
  }
};

// Example: Send notification when new ride is assigned


export default sendOneSignalNotification