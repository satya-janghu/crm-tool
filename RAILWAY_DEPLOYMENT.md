# Railway Deployment Guide

## Prerequisites
- Railway CLI installed (`npm install -g @railway/cli`)
- Railway account
- Git repository initialized

## Initial Setup

1. Login to Railway:
```bash
railway login
```

2. Initialize Railway project:
```bash
railway init
```

3. Add PostgreSQL database:
```bash
railway add plugin postgresql
```

## Environment Variables

1. Set up backend environment variables:
```bash
railway variables set \
  FLASK_APP=app \
  FLASK_ENV=production \
  JWT_SECRET_KEY=your-secure-secret-key \
  SECRET_KEY=your-secure-secret-key \
  DATABASE_URL=$RAILWAY_DATABASE_URL \
  BASE_URL=https://your-frontend-url.railway.app
```

2. Set up frontend environment variables:
```bash
railway variables set \
  REACT_APP_API_URL=https://your-backend-url.railway.app \
  REACT_APP_BASE_URL=https://your-frontend-url.railway.app
```

## Deployment

1. Deploy both services:
```bash
railway up
```

2. Deploy individual services:
```bash
# Deploy backend
cd backend
railway up

# Deploy frontend
cd frontend
railway up
```

## Monitoring and Maintenance

1. View logs:
```bash
railway logs
```

2. View service status:
```bash
railway status
```

3. Connect to PostgreSQL:
```bash
railway connect postgresql
```

## Domain Configuration

1. Add custom domain:
```bash
railway domain add your-domain.com
```

2. Configure DNS:
- Add CNAME record pointing to `your-service.railway.app`
- Wait for DNS propagation

## Common Tasks

1. Run database migrations:
```bash
railway run flask db upgrade
```

2. Access production shell:
```bash
railway shell
```

3. View environment variables:
```bash
railway variables
```

## Troubleshooting

1. Check build logs:
```bash
railway logs --build
```

2. Verify environment variables:
```bash
railway variables list
```

3. Common issues:
- Database connection: Check `DATABASE_URL` format
- Build failures: Check Nixpacks configuration
- Frontend API connection: Verify `REACT_APP_API_URL`

## Rollback

1. List deployments:
```bash
railway deployments
```

2. Rollback to previous deployment:
```bash
railway rollback
```

## Monitoring

1. Set up monitoring:
```bash
railway monitoring enable
```

2. View metrics:
```bash
railway metrics
```

## Security

1. Enable SSL:
```bash
railway ssl enable
```

2. Configure CORS in backend:
```python
CORS_ORIGINS = ['https://your-frontend-url.railway.app']
```

## CI/CD Integration

1. Get deployment token:
```bash
railway tokens create
```

2. Add to GitHub Secrets:
- `RAILWAY_TOKEN`: Your deployment token

3. GitHub Actions workflow:
```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Railway
        run: npm install -g @railway/cli
      - name: Deploy
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
``` 