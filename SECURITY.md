# Security Documentation - Password Protection

## Overview

The pitch page (`pitch.html`) is now protected with a hashed password system. Instead of storing the password in plain text, we now store only its SHA-256 hash, making it significantly more secure.

## Current Implementation

### How It Works

1. **Password Hashing**: When a user enters a password, it's hashed using SHA-256
2. **Hash Comparison**: The generated hash is compared to the stored hash
3. **Access Granted**: If the hashes match, access is granted

### Current Password

The current password is: `monbe22`

Its SHA-256 hash is: `536088e2bd66c002d1daa60632a1baa07035ae27d26a316cf4df4c3d6e341cb2`

## How to Change the Password

### Step 1: Generate the Hash

Use one of these methods to generate a SHA-256 hash for your new password:

#### Method A: Using Command Line (macOS/Linux)
```bash
echo -n "your-new-password" | openssl dgst -sha256
```

#### Method B: Using Browser Console
```javascript
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Generate hash
hashPassword('your-new-password').then(hash => console.log('Hash:', hash));
```

### Step 2: Update the Hash in script.js

Open `script.js` and replace the hash in TWO locations:

**Location 1** (around line 72):
```javascript
const correctPasswordHash = 'YOUR-NEW-HASH-HERE';
```

**Location 2** (around line 116):
```javascript
const correctPasswordHash = 'YOUR-NEW-HASH-HERE';
```

### Step 3: Test

1. Clear your browser cache or use an incognito window
2. Navigate to `/pitch.html`
3. Enter your new password
4. Verify access is granted

## Security Notes

### What This Protects Against

✅ Casual users viewing source code can't see the actual password
✅ Password is not transmitted or stored in plain text
✅ Basic protection for non-sensitive content

### What This Does NOT Protect Against

❌ Determined attackers can still bypass client-side security
❌ Users who view the page source can modify the JavaScript to bypass the check
❌ Not suitable for protecting truly sensitive or confidential information

### Recommendations for Enhanced Security

For stronger security, consider:

1. **Server-Side Authentication**: Use Netlify Functions or similar to authenticate on the server
2. **Third-Party Auth**: Integrate with Auth0, Firebase Auth, or similar services
3. **Netlify Identity**: Use Netlify's built-in authentication system
4. **Password Protect via Netlify**: Use Netlify's site-wide password protection feature

## URL Access

Users can also access the pitch page by adding `?access=monbe22` to the URL:
```
https://www.monbecare.com/pitch.html?access=monbe22
```

This URL parameter is also validated using the same hash comparison method.

## Additional Security Measures

The implementation includes:
- Input sanitization to prevent XSS attacks
- Session storage for maintaining access state
- Automatic URL cleanup to hide the password parameter
- Error handling for hash generation failures

## Questions?

If you need help changing the password or implementing stronger security measures, please refer to this documentation or consult with a security professional.

---

**Last Updated**: December 23, 2025

