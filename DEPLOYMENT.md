# Vercel Deployment Guide

## Required Environment Variables

You must add these environment variables in your Vercel dashboard for the `student-panel-Luminous` project:

### Database Configuration (Required)
```
DB_HOST=your-supabase-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
```

### JWT Configuration (Required)
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### Application Configuration (Required)
```
NODE_ENV=production
APP_URL=https://student-panel-luminous.vercel.app
PORT=3000
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://student-panel-luminous.vercel.app
```

### bKash Configuration (Optional - for payments)
```
NEXT_PUBLIC_MANUAL_BKASH_NUMBER=01XXXXXXXXX
BKASH_API_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=4f6o0cjiki2rfm34kfdadl1eqq
BKASH_APP_SECRET=2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b
BKASH_USERNAME=sandboxTokenizedUser02
BKASH_PASSWORD=sandboxTokenizedUser02@12345
BKASH_SANDBOX_PAYER_MSISDN=01770618575
```

### Email Configuration (Optional)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### File Upload Configuration (Optional)
```
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

## Quick Setup Steps

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `student-panel-Luminous`
3. **Go to Settings → Environment Variables**
4. **Add all required variables** from above

## Database Setup (Recommended: Supabase)

1. **Create a Supabase account**: https://supabase.com
2. **Create a new project**
3. **Get connection details** from Settings → Database
4. **Add database variables** to Vercel (see above)
5. **Run the SQL migrations** from the `database/` folder in Supabase SQL Editor

## Alternative: Railway/PlanetScale Database

If you prefer other database providers:
- **Railway**: https://railway.app
- **PlanetScale**: https://planetscale.com

Just update the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` accordingly.

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all required environment variables are set
2. **Database connection fails**: Verify database credentials and network access
3. **Runtime errors**: Check Vercel Function Logs for specific error messages

### Debug Steps:

1. Check Vercel deployment logs
2. Verify environment variables in Vercel dashboard
3. Test database connection locally with same credentials
4. Check that all dependencies are properly installed

## Production Optimizations

After initial deployment, consider:
- Setting up custom domain
- Configuring CDN for static assets
- Setting up monitoring and error tracking
- Configuring backup strategies

## Support

If you still face issues:
1. Check the exact error message in Vercel logs
2. Verify all environment variables are correctly set
3. Ensure database is accessible from Vercel's network
4. Contact support with specific error details
