# Real-Time Features Testing Guide 🚀

This guide will help you test all the real-time features we've implemented including WebSocket connections, live monitor updates, alerts, and toast notifications.

## 🐳 Step 1: Start the Application

First, make sure both containers are running:

```bash
# From the project root
docker-compose up --build
```

**Expected Output:**
- Backend running on http://localhost:5000
- Frontend running on http://localhost:3000
- No rate limiter security errors
- Socket.io server initialized

## 🔐 Step 2: Authentication Setup

1. **Open your browser** and go to http://localhost:3000
2. **Login or Register** with your account
3. **Check Network Tab** (F12 → Network) for successful API calls
4. **Verify Token** is stored (localStorage → `auth_token`)

## 🔌 Step 3: Test WebSocket Connection

### Visual Connection Status
1. **Navigate to Dashboard** (http://localhost:3000/dashboard)
2. **Look for Connection Indicator** in the dashboard header
3. **Expected Status:** Green "Connected" indicator with Socket.io icon

### Browser DevTools Testing
1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Look for Socket.io logs:**
   ```
   Socket.io: Connected to server
   Socket.io: Joined user room: user_[your-user-id]
   ```

### Network Tab Verification
1. **Network Tab → WS (WebSocket)**
2. **Should see:** `socket.io/?EIO=4&transport=websocket`
3. **Status:** 101 Switching Protocols (Green)

## 📊 Step 4: Test Real-Time Monitor Updates

### Create Test Monitors
1. **Go to Monitors page** (/dashboard/monitors)
2. **Add 2-3 test monitors:**
   - ✅ **Working URL:** https://httpstat.us/200 (always returns 200 OK)
   - ❌ **Failing URL:** https://httpstat.us/500 (always returns 500 error)
   - ⏱️ **Slow URL:** https://httpstat.us/200?sleep=5000 (5-second delay)

### Monitor Real-Time Updates
1. **Stay on Dashboard** with DevTools Console open
2. **Wait for monitor checks** (every 5 minutes by default)
3. **Expected Console Logs:**
   ```javascript
   Monitor check received: { id: 1, status: "up", responseTime: 245, timestamp: "..." }
   Monitor check received: { id: 2, status: "down", error: "500 Internal Server Error" }
   ```

### Visual Dashboard Updates
1. **Watch Monitor Cards** update in real-time
2. **Status indicators** should change color:
   - 🟢 Green for "up" status
   - 🔴 Red for "down" status
   - 🟡 Yellow for "checking" status

## 🚨 Step 5: Test Alert System

### Create Alert Conditions
1. **Go to Monitor Settings**
2. **Enable alerts** for your test monitors
3. **Set low timeout values** for faster testing (e.g., 3 seconds)

### Test Alert Triggers
1. **Use failing URL** (https://httpstat.us/500)
2. **Monitor Console** for alert events:
   ```javascript
   Alert received: { monitorId: 2, type: "down", message: "Monitor is down" }
   ```

### Toast Notification Testing
1. **Stay on any page** with the app open
2. **When alert triggers**, expect:
   - 🍞 **Toast popup** in bottom-right corner
   - 📱 **Browser notification** (if permissions granted)
   - 🔔 **Alert sound** (if enabled)

## 🎯 Step 6: Test Toast Notification System

### Manual Toast Testing
Open browser console and run these commands:

```javascript
// Test success toast
window.dispatchEvent(new CustomEvent('show-toast', {
  detail: { 
    title: 'Test Success', 
    description: 'This is a success message', 
    type: 'success' 
  }
}));

// Test error toast
window.dispatchEvent(new CustomEvent('show-toast', {
  detail: { 
    title: 'Test Error', 
    description: 'This is an error message', 
    type: 'error' 
  }
}));

// Test info toast
window.dispatchEvent(new CustomEvent('show-toast', {
  detail: { 
    title: 'Test Info', 
    description: 'This is an info message', 
    type: 'info' 
  }
}));
```

### Expected Toast Behavior
- ✅ **Appears** in bottom-right corner
- ✅ **Auto-dismisses** after 5 seconds
- ✅ **Click to dismiss** manually
- ✅ **Multiple toasts** stack properly
- ✅ **Proper styling** with icons and colors

## 📈 Step 7: Test Real-Time Analytics

### Analytics Dashboard
1. **Go to Analytics page** (/dashboard/analytics)
2. **Monitor real-time updates** to charts and metrics
3. **Expected updates:**
   - Response time graphs update with new data
   - Uptime percentages recalculate
   - Status distribution charts refresh

### Live Data Flow
1. **Open DevTools Network tab**
2. **Look for Socket.io events:**
   ```
   analytics-update: { uptime: 95.2, avgResponseTime: 340, totalChecks: 1247 }
   ```

## 🔄 Step 8: Test Browser Notifications

### Enable Permissions
1. **Click notification permission** when prompted
2. **Or manually enable** in browser settings (🔒 icon in address bar)

### Test Notification Flow
1. **Trigger an alert** (failing monitor)
2. **Expected behavior:**
   - Browser notification appears
   - Notification includes monitor name and status
   - Clicking notification opens dashboard

## 🧪 Step 9: Advanced Testing Scenarios

### Connection Recovery Testing
1. **Stop backend container:**
   ```bash
   docker-compose stop backend
   ```
2. **Watch dashboard** show "Disconnected" status
3. **Restart backend:**
   ```bash
   docker-compose start backend
   ```
4. **Verify automatic reconnection**

### Multiple Tab Testing
1. **Open dashboard** in multiple browser tabs
2. **Trigger alerts** in one tab
3. **Verify all tabs** receive real-time updates

### Mobile Testing
1. **Open dashboard** on mobile device
2. **Verify real-time updates** work on mobile
3. **Test toast notifications** on smaller screens

## 🐛 Troubleshooting

### Common Issues and Solutions

#### WebSocket Connection Failed
```bash
# Check if backend is running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Restart containers
docker-compose restart
```

#### No Toast Notifications
1. **Check console** for JavaScript errors
2. **Verify ToastProvider** is mounted (React DevTools)
3. **Test manual toast** commands above

#### No Real-Time Updates
1. **Check Socket.io connection** in Network tab
2. **Verify user authentication** (valid token)
3. **Check backend worker** is running (logs should show periodic monitor checks)

#### Browser Notifications Not Working
1. **Check permissions** in browser settings
2. **Try different browser** (Chrome, Firefox, Edge)
3. **Ensure HTTPS** for production deployment

## ✅ Success Checklist

Mark off each item as you test:

- [ ] 🐳 Containers start successfully
- [ ] 🔐 User authentication works
- [ ] 🔌 WebSocket connection established
- [ ] 📊 Real-time monitor updates received
- [ ] 🚨 Alert system triggers correctly
- [ ] 🍞 Toast notifications appear
- [ ] 📱 Browser notifications work
- [ ] 📈 Analytics update in real-time
- [ ] 🔄 Connection recovery works
- [ ] 📱 Mobile compatibility confirmed

## 🎉 Next Steps

Once all real-time features are working:

1. **GraphQL Integration** - Apollo Server & Client
2. **API Documentation** - Swagger/OpenAPI
3. **Redis Caching** - Performance optimization
4. **CI/CD Pipeline** - GitHub Actions
5. **Production Deployment** - Render/Railway/Vercel

---

**Happy Testing! 🚀**

*If you encounter any issues, check the browser console for detailed error messages and refer to the troubleshooting section above.*
