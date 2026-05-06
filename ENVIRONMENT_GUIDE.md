# Environment Variables Setup Guide

## 🎯 Required Variables

### Database Configuration
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=luminous_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### Authentication
```env
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### Email Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### External Services
```env
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key_here
CORS_ORIGIN=https://yourdomain.vercel.app
```

## 🔧 How to Add

1. **Open `.env.local`** in your project root
2. **Add variables** using KEY=VALUE format
3. **Save the file**
4. **Restart your development server**

## ⚠️ Important Notes

- **Never commit** `.env.local` to version control
- **Use different values** for production vs development
- **Keep secrets secure** - don't share actual values

## 🚀 Deployment Variables

For Vercel deployment, you'll need to add these same variables to your Vercel dashboard environment settings.
