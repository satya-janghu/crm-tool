# Frontend Deployment Guide

## Prerequisites
- Node.js 16 or higher
- npm or yarn package manager
- Backend API server running
- Modern web browser

## Initial Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create environment configuration (create .env file):
```env
REACT_APP_API_URL=http://localhost:5000  # Backend API URL
REACT_APP_BASE_URL=http://localhost:3000  # Frontend URL
```

## Development

1. Start the development server:
```bash
npm start
# or
yarn start
```

2. Run tests:
```bash
npm test
# or
yarn test
```

3. Run linter:
```bash
npm run lint
# or
yarn lint
```

## Production Build

1. Create production build:
```bash
npm run build
# or
yarn build
```

2. Test production build locally:
```bash
npm install -g serve
serve -s build
```

## Production Deployment

### Option 1: Static Hosting (e.g., Nginx)

1. Install Nginx:
```bash
sudo apt-get install nginx
```

2. Create Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/crm-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Deploy the build:
```bash
sudo mkdir -p /var/www/crm-frontend
sudo cp -r build/* /var/www/crm-frontend/
sudo chown -R www-data:www-data /var/www/crm-frontend
```

4. Enable and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/crm-frontend /etc/nginx/sites-enabled
sudo systemctl restart nginx
```

### Option 2: Docker Deployment

1. Create Dockerfile:
```dockerfile
# Build stage
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create nginx.conf:
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

3. Build and run Docker container:
```bash
docker build -t crm-frontend .
docker run -d -p 80:80 crm-frontend
```

### Option 3: Cloud Platform Deployment

#### Vercel
```bash
npm install -g vercel
vercel login
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy
```

## Environment-Specific Configurations

1. Create environment-specific files:
```
.env.development
.env.production
.env.staging
```

2. Build for specific environment:
```bash
# Development
REACT_APP_ENV=development npm run build

# Production
REACT_APP_ENV=production npm run build

# Staging
REACT_APP_ENV=staging npm run build
```

## Performance Optimization

1. Analyze bundle size:
```bash
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json
```

2. Enable source maps for production:
```bash
GENERATE_SOURCEMAP=true npm run build
```

## Maintenance

1. Update dependencies:
```bash
npm outdated
npm update
```

2. Security audit:
```bash
npm audit
npm audit fix
```

3. Clean and rebuild:
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

## Monitoring and Analytics

1. Add Google Analytics:
```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
```

2. Add error tracking (e.g., Sentry):
```bash
npm install @sentry/react
```

## Security Considerations

1. Enable security headers in Nginx:
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self';";
```

2. Configure SSL/TLS:
```bash
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

1. Clear browser cache:
```bash
# Add to index.html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
```

2. Check for build issues:
```bash
npm run build -- --verbose
```

3. Test API connectivity:
```bash
curl -I http://localhost:5000/api/health
```

4. Common issues:
- CORS errors: Check backend CORS configuration
- 404 errors: Verify Nginx configuration for SPA routing
- API connection: Check environment variables and API URL
- Build failures: Check Node.js version and dependencies 