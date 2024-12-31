# Backend Deployment Guide

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- SQLite or PostgreSQL database
- Gmail API credentials (Service Account with domain-wide delegation)

## Initial Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (create .env file):
```env
# Database
DATABASE_URL=sqlite:///crm.db  # Or your PostgreSQL URL
FLASK_APP=app
FLASK_ENV=development  # Change to 'production' in production

# JWT Configuration
JWT_SECRET_KEY=your-secure-secret-key
SECRET_KEY=your-secure-secret-key

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password

# Application
BASE_URL=http://localhost:3000  # Frontend URL
```

4. Set up Gmail API credentials:
   - Go to Google Cloud Console
   - Create a new project
   - Enable Gmail API
   - Create a Service Account
   - Download credentials and save as `credentials.json` in the backend root directory
   - Enable domain-wide delegation for the service account
   - Configure the OAuth consent screen

5. Initialize the database:
```bash
flask db upgrade
```

## Development

1. Start the development server:
```bash
flask run --port 5000
```

2. Run with debug mode:
```bash
FLASK_DEBUG=1 flask run --port 5000
```

## Production Deployment

1. Install production dependencies:
```bash
pip install gunicorn psycopg2-binary
```

2. Update environment variables for production:
```env
FLASK_ENV=production
DATABASE_URL=postgresql://user:password@localhost/dbname
```

3. Set up a production database (PostgreSQL recommended):
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE crmdb;
CREATE USER crmuser WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE crmdb TO crmuser;
```

4. Run database migrations:
```bash
flask db upgrade
```

5. Start the production server with Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

## Nginx Configuration (Production)

1. Install Nginx:
```bash
sudo apt-get install nginx
```

2. Create Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

3. Enable and start Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled
sudo systemctl restart nginx
```

## Systemd Service Configuration (Production)

1. Create a systemd service file:
```bash
sudo nano /etc/systemd/system/crm.service
```

2. Add the following configuration:
```ini
[Unit]
Description=CRM Tool Backend
After=network.target

[Service]
User=your-user
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 "app:create_app()"
Restart=always

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:
```bash
sudo systemctl enable crm
sudo systemctl start crm
```

## Maintenance

1. View logs:
```bash
# Application logs
tail -f /var/log/crm/app.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

2. Backup database:
```bash
# SQLite
cp crm.db crm.db.backup

# PostgreSQL
pg_dump -U crmuser crmdb > backup.sql
```

3. Update application:
```bash
git pull
source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
sudo systemctl restart crm
```

## Security Considerations

1. Set up SSL/TLS certificates using Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

2. Configure firewall:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

3. Regular updates:
```bash
sudo apt-get update
sudo apt-get upgrade
```

## Troubleshooting

1. Check service status:
```bash
sudo systemctl status crm
```

2. Check logs:
```bash
sudo journalctl -u crm
```

3. Test database connection:
```bash
flask shell
>>> from app import db
>>> db.engine.connect()
```

4. Test email configuration:
```bash
flask shell
>>> from app.utils.gmail_service import create_gmail_service, send_email
>>> service = create_gmail_service()
>>> send_email(service, "test@example.com", "Test Subject", "Test Body")
``` 