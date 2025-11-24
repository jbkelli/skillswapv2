# EmailJS Setup Guide

EmailJS is a free service that sends emails directly from the client-side without needing a backend server. This is perfect for contact forms!

## Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Sign Up" (free account allows 200 emails/month)
3. Verify your email address

## Step 2: Add Email Service

1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose **Gmail** (or any other provider)
4. Connect your Gmail account: `tech.marval.innovations@gmail.com`
5. Copy the **Service ID** (looks like `service_xxxxxxx`)

## Step 3: Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Set up your template like this:

**Template Settings:**
- Template Name: `Contact Form`
- Subject: `SkillSwap Contact: {{subject}}`

**Email Content:**
```html
<h2>New Contact Form Submission from SkillSwap</h2>

<p><strong>Name:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Subject:</strong> {{subject}}</p>

<h3>Message:</h3>
<p>{{message}}</p>

<hr>
<p><small>This email was sent from the SkillSwap contact form.</small></p>
```

**To Email:** `444mwangialvinm@gmail.com, tech.marval.innovations@gmail.com`

4. Click **Save**
5. Copy the **Template ID** (looks like `template_xxxxxxx`)

## Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (looks like a random string)
3. Copy it

## Step 5: Update ContactPage.jsx

Replace these three values in `client/src/pages/ContactPage.jsx`:

```javascript
// Line 27
window.emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your actual public key

// Line 47-48
'YOUR_SERVICE_ID',    // Replace with your actual service ID
'YOUR_TEMPLATE_ID',   // Replace with your actual template ID
```

## Example:

```javascript
window.emailjs.init('zK8xL9mP2nQ3rS4t'); 

const result = await window.emailjs.send(
  'service_abc123',
  'template_xyz789',
  {
    from_name: formData.name,
    from_email: formData.email,
    subject: formData.subject,
    message: formData.message
  }
);
```

## Step 6: Test

1. Save the file
2. Rebuild and redeploy: `npm run build`
3. Push to GitHub
4. Test the contact form on your live site

## Benefits of EmailJS

✅ No server configuration needed
✅ No SMTP settings
✅ No environment variables
✅ Works on all hosting platforms (Vercel, Netlify, etc.)
✅ 200 free emails per month
✅ Emails sent directly from client
✅ No backend required

## Troubleshooting

- **Emails not sending?** Check browser console for errors
- **Wrong Public Key error?** Make sure you copied it correctly from EmailJS dashboard
- **Template not found?** Verify Template ID matches exactly
- **Service error?** Check Service ID is correct

## Need More Emails?

Free tier: 200 emails/month
Personal plan: $8/month for 1,000 emails
Pro plan: $30/month for 10,000 emails

For a contact form, 200/month is usually plenty!
