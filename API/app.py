import os
import sqlite3
import hashlib
import secrets
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

app = FastAPI()
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure DB exists and has schema
with open(os.path.join(os.path.dirname(__file__), 'schema.sql')) as f:
    schema = f.read()
conn = sqlite3.connect(DB_PATH)
conn.executescript(schema)
conn.close()


def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post('/register')
def register(req: RegisterRequest):
    username = req.username.strip()
    password = req.password.strip()
    email = req.email.strip()
    if username == '' or password == '' or email == '':
        raise HTTPException(status_code=400, detail='Empty fields')
    salt = secrets.token_hex(16)
    password_hash = hash_password(password, salt)
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)',
                    (username, email, password_hash, salt))
        conn.commit()
        conn.close()
        return {"success": True}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=409, detail=str(e))


@app.post('/login')
def login(req: LoginRequest):
    username = req.username.strip()
    password = req.password.strip()
    if username == '' or password == '':
        raise HTTPException(status_code=400, detail='Empty fields')
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT password_hash, salt FROM users WHERE username = ?', (username,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail='Invalid username or password')
    password_hash, salt = row
    if hash_password(password, salt) == password_hash:
        return {"success": True}  # JWT to be added later
    else:
        raise HTTPException(status_code=401, detail='Invalid username or password')

# To run: uvicorn API.app:app --reload
