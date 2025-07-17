import sqlite3
import os
import hashlib
import secrets
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'users.db')
CORS(app)

# Ensure DB exists and has schema
with open(os.path.join(os.path.dirname(__file__), 'schema.sql')) as f:
    schema = f.read()
conn = sqlite3.connect(DB_PATH)
conn.executescript(schema)
conn.close()

def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    email = data.get('email', '').strip()
    if username == '' or password == '' or email == '':
        return jsonify({'error': 'Empty fields'}), 400
    salt = secrets.token_hex(16)
    password_hash = hash_password(password, salt)
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)',
                    (username, email, password_hash, salt))
        conn.commit()
        conn.close()
        return jsonify({'success': True}), 201
    except sqlite3.IntegrityError as e:
        return jsonify({'error': str(e)}), 409

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    if username == '' or password == '':
        return jsonify({'error': 'Empty fields'}), 400
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT password_hash, salt FROM users WHERE username = ?', (username,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Invalid username or password'}), 401
    password_hash, salt = row
    if hash_password(password, salt) == password_hash:
        return jsonify({'success': True}), 200  # JWT to be added later
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

if __name__ == '__main__':
    app.run(debug=True) 