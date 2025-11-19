from flask import Flask, request, jsonify
from flask_cors import CORS
from save_user import register_user, check_login

app = Flask(__name__)
CORS(app)  # Enable CORS

# Signup endpoint
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    username = data.get('username') or data.get('email')
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password required.'}), 400

    success, message = register_user(username, email, password)
    if success:
        return jsonify({'message': message}), 201
    else:
        return jsonify({'message': message}), 409

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password required.'}), 400

    success, message = check_login(email, password)
    if success:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 401

if __name__ == "__main__":
    app.run(debug=True)
