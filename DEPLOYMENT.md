# 🚀 Deployment Checklist - SkillSwap Improvements

## Pre-Deployment (Do This First)

### 1. Install Server Dependencies
```bash
cd server
npm install
```

This installs the security packages added earlier:
- helmet
- express-rate-limit
- express-validator
- xss-clean

### 2. Test Locally (Important!)

#### Start Backend
```bash
cd server
npm run dev
# or
node server.js
```

#### Start Frontend (New Terminal)
```bash
cd client
npm run dev
```

#### Quick Tests
- [ ] Visit http://localhost:5173
- [ ] Sign up new user
- [ ] Login with existing user
- [ ] Send a chat message
- [ ] Upload an image in chat
- [ ] Logout (check console - socket should disconnect)
- [ ] Check browser console for errors

### 3. Verify No Errors
```bash
# In server terminal, look for:
✅ "Connected to MongoDB"
✅ "Server is running on port 5000"
✅ No red error messages

# In browser console, look for:
✅ No red errors
✅ "Socket connection" or similar messages
```

---

## Deployment

### Backend (Render)

1. **Commit and Push Changes**
```bash
git add .
git commit -m "feat: Add socket auth, DB indexes, error boundary, and performance improvements"
git push origin main
```

2. **Render Auto-Deploy**
- Render will detect the push and start building
- Wait 2-5 minutes for deployment
- Check Render dashboard for build status

3. **Verify Deployment**
- Open: https://skillswapv2.onrender.com/api/health
- Should see: `{"status":"healthy","uptime":...}`
- If error, check Render logs

4. **Check Render Logs**
```
Look for:
✅ "Connected to MongoDB"
✅ "Server is running"
✅ No authentication errors
```

### Frontend (Vercel)

1. **Auto-Deploy Trigger**
- Vercel watches your repo
- Push to main triggers deployment
- Usually takes 1-3 minutes

2. **Verify Deployment**
- Open: https://skillswappie.vercel.app
- Should load normally
- No errors in browser console

3. **Check Vercel Dashboard**
- Go to Vercel dashboard
- Check deployment status
- Review build logs if needed

---

## Post-Deployment Testing

### Critical Tests (5 minutes)

1. **Authentication**
- [ ] Sign up new user on live site
- [ ] Login with test account
- [ ] Verify token expires (wait 24h or check JWT)

2. **Real-Time Features**
- [ ] Open chat with another user
- [ ] Send message
- [ ] Verify message appears instantly
- [ ] Open in another browser/incognito
- [ ] Verify real-time sync works

3. **Group Chat**
- [ ] Open a group
- [ ] Send message
- [ ] Message to @vally
- [ ] Check no duplicates

4. **File Upload**
- [ ] Upload image (JPEG/PNG)
- [ ] Upload PDF
- [ ] Try unsupported type (should reject)
- [ ] Download uploaded file

5. **Error Handling**
- [ ] Logout and verify socket disconnects
- [ ] Try accessing chat without login
- [ ] Invalid token should redirect to login

### Performance Check
- [ ] Pages load quickly
- [ ] Search is fast
- [ ] Chat messages load instantly
- [ ] No lag in typing/sending

---

## Rollback Plan (If Something Breaks)

### Quick Rollback - Render
1. Go to Render dashboard
2. Click your service
3. Click "Rollback to previous deploy"
4. Select last working deployment

### Quick Rollback - Vercel
1. Go to Vercel dashboard
2. Click your project
3. Find previous deployment
4. Click "Promote to Production"

### Manual Rollback - Git
```bash
# Find last working commit
git log --oneline

# Revert to that commit
git revert <commit-hash>

# Push
git push origin main
```

---

## Environment Variables Check

### Render (Backend)
Verify these exist in Render dashboard:
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Your secret key
- [ ] `CLIENT_URL` - https://skillswappie.vercel.app
- [ ] `EMAIL_USER` - Gmail for contact form
- [ ] `EMAIL_PASS` - Gmail app password
- [ ] `GOOGLE_API_KEY` - For Vally AI
- [ ] `NODE_ENV` - Should be "production"

### Vercel (Frontend)
Verify in Vercel dashboard:
- [ ] `VITE_API_URL` - https://skillswapv2.onrender.com/api
- [ ] `VITE_SOCKET_URL` - https://skillswapv2.onrender.com

---

## Common Issues & Fixes

### Issue: "Authentication error" on socket connection
**Fix**: 
- Token might be expired
- User should logout and login again
- Check JWT_SECRET matches on server

### Issue: Database indexes not working
**Fix**: 
- Wait 5 minutes after deployment
- Restart Render service
- Indexes auto-create on first query

### Issue: File uploads not working
**Fix**:
- Check file MIME type is in whitelist
- Verify file size < 10MB
- Check Render logs for multer errors

### Issue: Error boundary showing up
**Fix**:
- Check browser console for actual error
- Could be network issue
- Try reload

### Issue: Messages not appearing in real-time
**Fix**:
- Check socket is connected (console.log)
- Verify WebSocket connection in Network tab
- Check Render free tier hasn't spun down

---

## Success Indicators

✅ **You're good if you see:**
- Health endpoint returns 200 OK
- Login works on live site
- Chat messages appear in real-time
- File uploads work
- No console errors
- Search is fast
- Users can signup/login

❌ **Something's wrong if:**
- 500 errors on API calls
- Socket connection fails
- Can't login
- Chat doesn't update
- White screen appears

---

## Monitoring

### First 24 Hours
- [ ] Check Render logs hourly
- [ ] Monitor user signups
- [ ] Test chat functionality
- [ ] Verify no error spikes

### First Week
- [ ] Monitor token expiration (24h)
- [ ] Check database performance
- [ ] Review any user complaints
- [ ] Test all features daily

---

## Contact/Support

If issues occur:
1. Check Render logs first
2. Check Vercel deployment logs
3. Check browser console
4. Review this checklist
5. Test locally to isolate issue

---

## 🎉 Deployment Complete!

Once all tests pass:
- ✅ Backend deployed and healthy
- ✅ Frontend deployed and working
- ✅ Real-time features working
- ✅ Authentication secure
- ✅ Performance improved
- ✅ Error handling in place

**Your app is production-ready!** 🚀

Remember: JWT tokens now expire in 24 hours, so users will need to login daily.
