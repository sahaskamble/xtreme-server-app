# Fix Device Token Schema Issue

## 🚨 **Problem Identified**

The device double-click login functionality is **NOT working** because:

1. **Missing Schema Fields**: The `devices` collection in your PocketBase schema does NOT have the required fields to store client login information
2. **Code Expects Fields That Don't Exist**: Your code tries to update `token` and `record` fields on devices, but these fields don't exist in the schema

## 🔧 **Required Schema Changes**

You need to add these fields to your `devices` collection in PocketBase:

### **Fields to Add to `devices` Collection:**

1. **`token`** (text field)
   - Type: text
   - Required: false
   - Description: Stores the client login token

2. **`client_id`** (text field)
   - Type: text  
   - Required: false
   - Description: Stores the logged-in client's ID

3. **`client_username`** (text field)
   - Type: text
   - Required: false
   - Description: Stores the logged-in client's username

4. **`client_name`** (text field)
   - Type: text
   - Required: false
   - Description: Stores the logged-in client's display name

5. **`client_email`** (text field)
   - Type: text
   - Required: false
   - Description: Stores the logged-in client's email

6. **`login_time`** (date field)
   - Type: date
   - Required: false
   - Description: Stores when the client logged in

7. **`client_record`** (json field)
   - Type: json
   - Required: false
   - Description: Stores the complete client record as JSON

## 🛠️ **How to Fix in PocketBase Admin**

1. **Open PocketBase Admin Panel** (usually http://localhost:8090/_/)
2. **Go to Collections** → **devices**
3. **Click "Edit Collection"**
4. **Add the following fields:**

```
Field Name: token
Type: Text
Required: No
Max Length: 0 (unlimited)

Field Name: client_id  
Type: Text
Required: No
Max Length: 0 (unlimited)

Field Name: client_username
Type: Text
Required: No
Max Length: 0 (unlimited)

Field Name: client_name
Type: Text
Required: No
Max Length: 0 (unlimited)

Field Name: client_email
Type: Text
Required: No
Max Length: 0 (unlimited)

Field Name: login_time
Type: Date
Required: No

Field Name: client_record
Type: JSON
Required: No
```

5. **Save the collection**

## 🔄 **Updated Server Code**

After adding the schema fields, update your server code to store the correct fields:

```javascript
// In src/pages/page.jsx - Update the handleClientLogin function
const handleClientLogin = async () => {
  try {
    setLoginError("");

    // Authenticate with PocketBase clients collection
    const authData = await pb.collection('clients').authWithPassword(clientUsername, clientPassword);

    // Create comprehensive client information object
    const clientInfo = {
      token: authData.token || `client_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      client_id: authData.record.id,
      client_username: authData.record.username,
      client_name: authData.record.name || clientUsername,
      client_email: authData.record.email || '',
      login_time: new Date().toISOString(),
      client_record: JSON.stringify(authData.record)
    };

    // Store login info in localStorage for server-side reference
    localStorage.setItem('clientLoginInfo', JSON.stringify(authData.record));

    // Update the device record with client information
    if (sessionDevice?.id) {
      try {
        await pb.collection('devices').update(sessionDevice.id, clientInfo);
        console.log(`Updated device ${sessionDevice.id} with client information:`, clientInfo);
      } catch (deviceUpdateError) {
        console.error("Error updating device with client information:", deviceUpdateError);
        // Continue with login process even if device update fails
      }
    }

    // Update UI state
    setClientLoggedIn(true);
    setActiveTab("session");

  } catch (error) {
    console.error("Login error:", error);
    setLoginError("Invalid username or password");
  }
};
```

## 📱 **Client App Real-time Token Detection**

For your client app to detect the token and auto-login, add this code:

```javascript
// In your client app - Add this hook to detect device token changes
import { useEffect, useState } from 'react';
import pb from './lib/pocketbase';

export function useDeviceTokenListener(deviceId) {
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    if (!deviceId) return;

    // Subscribe to device changes
    const unsubscribe = pb.collection('devices').subscribe(deviceId, function (e) {
      console.log('Device updated:', e.record);
      
      // Check if token was added/updated
      if (e.record.token && e.record.client_record) {
        try {
          const clientRecord = JSON.parse(e.record.client_record);
          setTokenData({
            token: e.record.token,
            client: clientRecord,
            loginTime: e.record.login_time
          });
        } catch (error) {
          console.error('Error parsing client record:', error);
        }
      }
    });

    // Also check for existing token on mount
    pb.collection('devices').getOne(deviceId)
      .then(device => {
        if (device.token && device.client_record) {
          try {
            const clientRecord = JSON.parse(device.client_record);
            setTokenData({
              token: device.token,
              client: clientRecord,
              loginTime: device.login_time
            });
          } catch (error) {
            console.error('Error parsing existing client record:', error);
          }
        }
      })
      .catch(error => {
        console.error('Error fetching device:', error);
      });

    return () => {
      unsubscribe();
    };
  }, [deviceId]);

  return tokenData;
}

// Usage in your client app component:
function ClientApp() {
  const deviceId = 'your-device-id'; // Get this from your device identification
  const tokenData = useDeviceTokenListener(deviceId);

  useEffect(() => {
    if (tokenData) {
      console.log('Auto-login triggered with token:', tokenData.token);
      console.log('Client data:', tokenData.client);
      
      // Auto-login the client
      autoLoginClient(tokenData.client, tokenData.token);
    }
  }, [tokenData]);

  const autoLoginClient = async (clientRecord, token) => {
    try {
      // Set the auth store with the token and client record
      pb.authStore.save(token, clientRecord);
      
      // Verify the token is still valid
      await pb.collection('clients').authRefresh();
      
      console.log('Auto-login successful!');
      
      // Start your client session here
      startClientSession(clientRecord);
      
    } catch (error) {
      console.error('Auto-login failed:', error);
      // Token might be expired, clear it
      pb.authStore.clear();
    }
  };

  const startClientSession = (clientRecord) => {
    // Your session start logic here
    console.log('Starting session for client:', clientRecord.name);
    // Update UI, start timers, etc.
  };

  return (
    <div>
      {/* Your client app UI */}
    </div>
  );
}
```

## ✅ **Testing the Fix**

After implementing the schema changes:

1. **Test Device Double-Click**: Double-click a device in the server app
2. **Test Client Login**: Enter client credentials and login
3. **Check Device Record**: Verify the device record now contains client information
4. **Test Client App**: Ensure the client app detects the token and auto-logs in
5. **Test Real-time Updates**: Verify changes propagate immediately

## 🎯 **Expected Behavior After Fix**

1. **Server Side**: Double-click device → Login popup → Enter credentials → Device stores token + client info
2. **Client Side**: Device token detected → Auto-login with stored credentials → Session starts automatically
3. **Real-time**: All changes happen instantly via PocketBase real-time subscriptions

The functionality should work perfectly once you add the missing schema fields!
