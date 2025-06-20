# Client App Implementation Guide

This guide provides the code and implementation details needed for your client app to integrate with the server app's membership, recharge, and chat systems.

## 🔧 **PocketBase Collections Used**

Based on your schema, the client app should interact with these collections:

### **1. Authentication**
- **Collection**: `clients` (auth collection)
- **Fields**: username, name, email, avatar, role

### **2. Membership System**
- **Collection**: `membership_plans` (read-only)
- **Collection**: `membership_logs` (read customer's active memberships)

### **3. Recharge System**
- **Collection**: `recharge_plans` (read-only)
- **Collection**: `recharge_logs` (read customer's recharge history)
- **Collection**: `customers` (update wallet balance)

### **4. Chat System**
- **Collection**: `message`
- **Fields**: sender, device, message, is_from_client, is_read, created, updated

## 📱 **Client App Implementation**

### **1. Authentication Setup**

```javascript
// lib/pocketbase.js
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://your-server-url:8090'); // Your PocketBase URL

export default pb;
```

```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import pb from '../lib/pocketbase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    if (pb.authStore.isValid) {
      setUser(pb.authStore.model);
      setIsAuthenticated(true);
    }

    // Listen for auth changes
    pb.authStore.onChange((token, model) => {
      setUser(model);
      setIsAuthenticated(!!model);
    });
  }, []);

  const login = async (username, password) => {
    try {
      const authData = await pb.collection('clients').authWithPassword(username, password);
      setUser(authData.record);
      setIsAuthenticated(true);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### **2. Membership System**

```javascript
// components/MembershipPlans.jsx
import { useState, useEffect } from 'react';
import pb from '../lib/pocketbase';

export default function MembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [userMemberships, setUserMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembershipData();
  }, []);

  const fetchMembershipData = async () => {
    try {
      // Fetch available membership plans
      const plansData = await pb.collection('membership_plans').getFullList({
        filter: 'status = "Active"',
        sort: 'price'
      });
      setPlans(plansData);

      // Fetch user's active memberships
      if (pb.authStore.isValid) {
        const customer = await pb.collection('customers').getFirstListItem(
          `user.username = "${pb.authStore.model.username}"`
        );
        
        const memberships = await pb.collection('membership_logs').getFullList({
          filter: `customer_id = "${customer.id}" && expires_on > @now`,
          expand: 'plan_id',
          sort: '-created'
        });
        setUserMemberships(memberships);
      }
    } catch (error) {
      console.error('Error fetching membership data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading memberships...</div>;

  return (
    <div className="membership-container">
      <h2>Available Membership Plans</h2>
      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan.id} className="plan-card">
            <h3>{plan.name}</h3>
            <p className="price">₹{plan.price}</p>
            <p className="duration">{plan.duration} days</p>
            <p className="description">{plan.description}</p>
            {plan.features && (
              <ul className="features">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            )}
            <button onClick={() => requestMembership(plan.id)}>
              Request Membership
            </button>
          </div>
        ))}
      </div>

      <h2>My Active Memberships</h2>
      <div className="active-memberships">
        {userMemberships.map(membership => (
          <div key={membership.id} className="membership-card">
            <h3>{membership.expand.plan_id.name}</h3>
            <p>Expires: {new Date(membership.expires_on).toLocaleDateString()}</p>
            <p>Status: {new Date(membership.expires_on) > new Date() ? 'Active' : 'Expired'}</p>
          </div>
        ))}
      </div>
    </div>
  );

  async function requestMembership(planId) {
    // This would typically involve a payment process
    // For now, just show a message that admin needs to assign it
    alert('Please contact admin to purchase this membership plan');
  }
}
```

### **3. Recharge System**

```javascript
// components/RechargeSystem.jsx
import { useState, useEffect } from 'react';
import pb from '../lib/pocketbase';

export default function RechargeSystem() {
  const [rechargePlans, setRechargePlans] = useState([]);
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRechargeData();
  }, []);

  const fetchRechargeData = async () => {
    try {
      // Fetch available recharge plans
      const plansData = await pb.collection('recharge_plans').getFullList({
        filter: 'status = "Active"',
        sort: 'price'
      });
      setRechargePlans(plansData);

      // Fetch user's wallet balance and recharge history
      if (pb.authStore.isValid) {
        const customer = await pb.collection('customers').getFirstListItem(
          `user.username = "${pb.authStore.model.username}"`
        );
        setWalletBalance(customer.wallet || 0);
        
        const history = await pb.collection('recharge_logs').getFullList({
          filter: `customer_id = "${customer.id}"`,
          expand: 'recharge_id',
          sort: '-created',
          limit: 10
        });
        setRechargeHistory(history);
      }
    } catch (error) {
      console.error('Error fetching recharge data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading recharge options...</div>;

  return (
    <div className="recharge-container">
      <div className="wallet-balance">
        <h2>Wallet Balance: ₹{walletBalance}</h2>
      </div>

      <h2>Recharge Plans</h2>
      <div className="recharge-plans">
        {rechargePlans.map(plan => (
          <div key={plan.id} className="recharge-card">
            <h3>{plan.name}</h3>
            <p className="price">Pay ₹{plan.price}</p>
            <p className="value">Get ₹{plan.value}</p>
            {plan.total_hours > 0 && (
              <p className="hours">{plan.total_hours} hours included</p>
            )}
            <p className="note">{plan.note}</p>
            <button onClick={() => requestRecharge(plan.id)}>
              Recharge Now
            </button>
          </div>
        ))}
      </div>

      <h2>Recharge History</h2>
      <div className="recharge-history">
        {rechargeHistory.map(recharge => (
          <div key={recharge.id} className="history-item">
            <div className="plan-name">{recharge.expand.recharge_id.name}</div>
            <div className="amount">₹{recharge.expand.recharge_id.value}</div>
            <div className="date">{new Date(recharge.recharged_on).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );

  async function requestRecharge(planId) {
    // This would typically involve a payment gateway
    // For now, just show a message that admin needs to process it
    alert('Please contact admin to process this recharge');
  }
}
```

### **4. Chat System**

```javascript
// components/ChatSystem.jsx
import { useState, useEffect, useRef } from 'react';
import pb from '../lib/pocketbase';

export default function ChatSystem({ deviceId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    
    return () => {
      // Cleanup subscription
      pb.collection('message').unsubscribe();
    };
  }, [deviceId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const messagesList = await pb.collection('message').getFullList({
        filter: `device = "${deviceId}"`,
        sort: 'created',
        expand: 'sender'
      });
      setMessages(messagesList);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = async () => {
    // Subscribe to real-time message updates
    pb.collection('message').subscribe('*', function (e) {
      if (e.record.device === deviceId) {
        if (e.action === 'create') {
          setMessages(prev => [...prev, e.record]);
          
          // Mark server messages as read automatically
          if (!e.record.is_from_client) {
            markAsRead(e.record.id);
          }
        } else if (e.action === 'update') {
          setMessages(prev => prev.map(msg => 
            msg.id === e.record.id ? e.record : msg
          ));
        }
      }
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        message: newMessage.trim(),
        device: deviceId,
        sender: pb.authStore.model?.id,
        is_from_client: true,
        is_read: false
      };

      await pb.collection('message').create(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await pb.collection('message').update(messageId, { is_read: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) return <div>Loading chat...</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat with Support</h3>
      </div>
      
      <div className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.is_from_client ? 'client' : 'server'}`}
          >
            <div className="message-content">
              <p>{message.message}</p>
              <div className="message-meta">
                <span className="sender">
                  {message.is_from_client ? 'You' : 'Support'}
                </span>
                <span className="time">
                  {new Date(message.created).toLocaleTimeString()}
                </span>
                {message.is_from_client && (
                  <span className={`status ${message.is_read ? 'read' : 'sent'}`}>
                    {message.is_read ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}
```

## 🔗 **Integration Points**

### **Server App → Client App Communication**
1. **Membership Assignment**: Server admin assigns membership → Client sees active membership
2. **Wallet Recharge**: Server admin processes recharge → Client wallet balance updates
3. **Chat Messages**: Server sends message → Client receives real-time notification

### **Client App → Server App Communication**
1. **Membership Requests**: Client requests membership → Server admin gets notification
2. **Recharge Requests**: Client initiates recharge → Server admin processes payment
3. **Chat Messages**: Client sends message → Server admin sees in chat interface

## 📋 **Required Environment Variables**

```env
# .env file in client app
VITE_POCKETBASE_URL=http://your-server-url:8090
```

## 🎨 **CSS Styling Examples**

```css
/* Basic styling for the components */
.membership-container, .recharge-container, .chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.plans-grid, .recharge-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.plan-card, .recharge-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.chat-container {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ddd;
  margin: 10px 0;
}

.message {
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
}

.message.client {
  background: #007bff;
  color: white;
  margin-left: 20%;
}

.message.server {
  background: #f8f9fa;
  margin-right: 20%;
}

.message-form {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.send-button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

This implementation guide provides everything needed to integrate the client app with your server app's new features!
