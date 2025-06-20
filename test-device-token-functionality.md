# Test Device Token Functionality

## 🧪 **Testing Checklist**

### **Prerequisites**
- [ ] PocketBase server is running
- [ ] Device schema has been updated with required fields (see `fix-device-token-schema.md`)
- [ ] Server app is running
- [ ] Client app is set up with real-time listeners

### **Test 1: Schema Verification**
1. **Open PocketBase Admin** (http://localhost:8090/_/)
2. **Go to Collections → devices**
3. **Verify these fields exist:**
   - [ ] `token` (text field)
   - [ ] `client_id` (text field)
   - [ ] `client_username` (text field)
   - [ ] `client_name` (text field)
   - [ ] `client_email` (text field)
   - [ ] `login_time` (date field)
   - [ ] `client_record` (json field)

### **Test 2: Server-Side Device Double-Click Login**
1. **Open Server App**
2. **Navigate to Main Page** (/)
3. **Double-click any Available device**
4. **Verify:**
   - [ ] Login popup opens
   - [ ] Login form is displayed
   - [ ] Username and password fields are present

### **Test 3: Client Authentication**
1. **In the login popup, enter client credentials:**
   - Username: `test_client` (or any valid client username)
   - Password: `password123` (or valid password)
2. **Click Login**
3. **Verify:**
   - [ ] Login succeeds (no error message)
   - [ ] UI switches to session tab
   - [ ] `clientLoggedIn` state becomes true

### **Test 4: Device Token Storage**
1. **After successful login, check PocketBase:**
2. **Go to Collections → devices**
3. **Find the device you logged into**
4. **Verify the device record contains:**
   - [ ] `token`: Non-empty string
   - [ ] `client_id`: Client's ID
   - [ ] `client_username`: Client's username
   - [ ] `client_name`: Client's display name
   - [ ] `client_email`: Client's email (if available)
   - [ ] `login_time`: Current timestamp
   - [ ] `client_record`: JSON string with full client data

### **Test 5: Real-time Token Detection (Client App)**
1. **In your client app, implement the token listener:**
```javascript
const deviceId = 'your-device-id'; // Replace with actual device ID
const tokenData = useDeviceTokenListener(deviceId);

useEffect(() => {
  if (tokenData) {
    console.log('Token detected:', tokenData);
    // Auto-login should trigger here
  }
}, [tokenData]);
```

2. **Verify:**
   - [ ] Client app detects token immediately
   - [ ] `tokenData` contains client information
   - [ ] Auto-login function is called
   - [ ] Client session starts automatically

### **Test 6: Session Creation**
1. **In server app, after client login:**
2. **Fill session form:**
   - Select customer
   - Set duration
   - Choose payment type
3. **Click "Create Session"**
4. **Verify:**
   - [ ] Session is created successfully
   - [ ] Device status changes to "Occupied"
   - [ ] Session includes client information

### **Test 7: Session Termination & Token Cleanup**
1. **End the active session:**
   - Right-click device → "End Session"
   - OR click "End Session" button in device details
2. **Verify:**
   - [ ] Session status changes to "Closed"
   - [ ] Device status changes to "Available"
   - [ ] All client fields in device record are cleared (null)
   - [ ] Client app detects token removal

### **Test 8: Error Handling**
1. **Test with invalid credentials:**
   - Enter wrong username/password
   - Verify error message appears
2. **Test without schema fields:**
   - If schema fields are missing, verify error is logged
   - Check console for helpful error messages

## 🔍 **Debugging Commands**

### **Check Device Record in Console**
```javascript
// In browser console (server app)
pb.collection('devices').getOne('device-id-here').then(console.log);
```

### **Monitor Real-time Updates**
```javascript
// In browser console (client app)
pb.collection('devices').subscribe('device-id-here', function(e) {
  console.log('Device updated:', e.record);
});
```

### **Check Client Authentication**
```javascript
// In browser console (client app)
console.log('Auth store:', pb.authStore);
console.log('Is valid:', pb.authStore.isValid);
console.log('User:', pb.authStore.model);
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: "no such column" Error**
**Problem:** Device schema missing required fields
**Solution:** Follow `fix-device-token-schema.md` to add missing fields

### **Issue 2: Token Not Detected in Client App**
**Problem:** Real-time subscription not working
**Solution:** 
- Check PocketBase connection
- Verify device ID is correct
- Ensure subscription is active

### **Issue 3: Auto-login Fails**
**Problem:** Token is invalid or expired
**Solution:**
- Check token format
- Verify client record is valid JSON
- Implement token refresh logic

### **Issue 4: Client Login Popup Doesn't Open**
**Problem:** Event handlers not working
**Solution:**
- Check device status (not in maintenance)
- Verify double-click event is bound
- Check console for JavaScript errors

## ✅ **Expected Results**

### **Successful Flow:**
1. **Server:** Double-click device → Login popup opens
2. **Server:** Enter credentials → Login succeeds
3. **Server:** Device record updated with token + client info
4. **Client:** Token detected via real-time subscription
5. **Client:** Auto-login triggered with stored credentials
6. **Client:** Session starts automatically
7. **Server:** End session → Client info cleared from device
8. **Client:** Token removal detected → Session ends

### **Performance Expectations:**
- **Login:** < 2 seconds
- **Token Storage:** Immediate (real-time)
- **Token Detection:** < 1 second
- **Auto-login:** < 3 seconds
- **Session Creation:** < 2 seconds

## 📊 **Test Results Template**

```
Date: ___________
Tester: ___________

Schema Verification: ✅ / ❌
Device Double-Click: ✅ / ❌
Client Authentication: ✅ / ❌
Token Storage: ✅ / ❌
Real-time Detection: ✅ / ❌
Session Creation: ✅ / ❌
Session Termination: ✅ / ❌
Error Handling: ✅ / ❌

Overall Status: ✅ PASS / ❌ FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

Run through this checklist to verify your device token functionality is working correctly!
