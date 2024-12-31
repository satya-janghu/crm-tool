from app import create_app
from app.utils.init_db import init_db

app = create_app()

if __name__ == '__main__':
    init_db()  # Initialize database and create admin user if needed
    app.run(debug=True, host='0.0.0.0', port=5000) 