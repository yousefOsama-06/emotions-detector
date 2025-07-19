import os
import sqlite3
import hashlib
import secrets
import jwt
import datetime

import uuid
import shutil

from fastapi import FastAPI, HTTPException, Request, Depends, UploadFile, File, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from starlette.responses import JSONResponse, Response

app = FastAPI()
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

# python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY = "majyT3QhVBB_BtqDy4aeBMble7Tu25k2ToJw9ToDr_8"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 1

security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

photo_dir = os.path.join(os.path.dirname(__file__), "uploaded_photos")
os.makedirs(photo_dir, exist_ok=True)


def clear_database():
    # Clear uploaded_photos directory
    for filename in os.listdir(photo_dir):
        file_path = os.path.join(photo_dir, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

    # clear database
    with open(os.path.join(os.path.dirname(__file__), 'schema.sql')) as f:
        schema = f.read()
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(schema)
    conn.close()


clear_database()


def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()


def create_access_token(user_id: int):
    payload = {
        "sub": str(user_id),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(request: Request):
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Token not found")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


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
        return {"success": True}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=409, detail=str(e))
    finally:
        if conn:
            conn.close()


@app.post('/login')
def login(response: Response, req: LoginRequest):
    username = req.username.strip()
    password = req.password.strip()
    if username == '' or password == '':
        raise HTTPException(status_code=400, detail='Empty fields')
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT id, password_hash, salt FROM users WHERE username = ?', (username,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail='Invalid username or password')
    user_id, password_hash, salt = row
    if hash_password(password, salt) == password_hash:
        token = create_access_token(user_id)
        response.set_cookie(
            key="token",
            value=token,
            httponly=True,
            samesite="lax",
            secure=False
        )
        return {"success": True, "token": token}
    else:
        raise HTTPException(status_code=401, detail='Invalid username or password')


@app.get('/moods')
async def get_moods(user_id: int = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This enables name-based access to columns
    cur = conn.cursor()
    cur.execute('SELECT * FROM moods WHERE user_id = ? ORDER BY timestamp DESC', (user_id,))
    moods = [dict(row) for row in cur.fetchall()]
    conn.close()
    return moods


@app.post("/analyze-image")
async def analyze_image(
        photo: UploadFile = File(...),
        user_id: int = Depends(verify_token)
):
    file_extension = os.path.splitext(photo.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    full_path = os.path.join(photo_dir, unique_filename)
    with open(full_path, "wb") as f:
        f.write(await photo.read())

    mood = "happy"
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO moods (user_id, image_path, mood, timestamp) VALUES (?, ?, ?, ?)",
        (user_id, full_path, mood, timestamp)
    )
    conn.commit()
    conn.close()

    return {
        "success": True,
        "image_saved_as": unique_filename,
        "analysis": {
            "Mood": mood,
            "Advice": "You look happy!",
        }
    }


from fastapi import Path


@app.delete("/moods/{mood_id}")
def delete_mood(
        mood_id: int = Path(..., description="ID of the mood to delete"),
        user_id: int = Depends(verify_token)
):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This enables name-based access to columns
    cur = conn.cursor()

    cur.execute("SELECT * FROM moods WHERE id = ? AND user_id = ?", (mood_id, user_id))
    mood = cur.fetchone()

    if not mood:
        conn.close()
        raise HTTPException(status_code=404, detail="Mood not found or unauthorized")

    if mood["image_path"] and os.path.exists(mood["image_path"]):
        try:
            os.remove(mood["image_path"])
        except Exception:
            pass
    cur.execute("DELETE FROM moods WHERE id = ?", (mood_id,))
    conn.commit()
    conn.close()

    return {"success": True, "message": f"Mood with ID {mood_id} deleted successfully"}
