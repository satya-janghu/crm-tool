from .. import create_app, db
from ..models.user import User

def init_db():
    app = create_app()
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Check if admin user exists
        admin = User.query.filter_by(email='satya@pixeljab.com').first()
        if not admin:
            # Create admin user
            admin = User(
                email='satya@pixeljab.com',
                first_name='Admin',
                last_name='User',
                role='admin',
                is_active=True
            )
            admin.set_password('V33rT3jaji!')
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully")
        else:
            print("Admin user already exists")

if __name__ == '__main__':
    init_db() 