from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv
from .utils.error_handlers import init_error_handlers, APIError, handle_api_error

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crm.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')  # Change in production
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)
    
    # Initialize error handlers
    init_error_handlers(app)
    app.register_error_handler(APIError, handle_api_error)
    
    # Register blueprints
    from .routes import auth, leads, users
    app.register_blueprint(auth.bp)
    app.register_blueprint(leads.bp)
    app.register_blueprint(users.bp)
    
    return app 