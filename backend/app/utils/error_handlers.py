from flask import jsonify
from werkzeug.exceptions import HTTPException

def init_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_exception(e):
        """Return JSON instead of HTML for HTTP errors."""
        response = {
            "error": e.description,
            "status_code": e.code
        }
        return jsonify(response), e.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        """Handle unexpected errors."""
        app.logger.error(f'An unexpected error occurred: {str(e)}')
        response = {
            "error": "An unexpected error occurred",
            "status_code": 500
        }
        return jsonify(response), 500

class APIError(Exception):
    """Base class for API errors."""
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['error'] = self.message
        rv['status_code'] = self.status_code
        return rv

def handle_api_error(error):
    """Handler for APIError exceptions."""
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response 