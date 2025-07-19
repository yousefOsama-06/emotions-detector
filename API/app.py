import os
import sqlite3
import hashlib
import secrets
import jwt
import datetime

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi import UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from starlette.responses import JSONResponse

app = FastAPI()
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

# python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY = "majyT3QhVBB_BtqDy4aeBMble7Tu25k2ToJw9ToDr_8"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 1

security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open(os.path.join(os.path.dirname(__file__), 'schema.sql')) as f:
    schema = f.read()
conn = sqlite3.connect(DB_PATH)
conn.executescript(schema)
conn.close()


def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()


def create_access_token(user_id: int):
    payload = {
        "sub": str(user_id),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
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
    cur.execute('SELECT id, password_hash, salt FROM users WHERE username = ?', (username,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail='Invalid username or password')
    user_id, password_hash, salt = row
    if hash_password(password, salt) == password_hash:
        token = create_access_token(user_id)
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
    
    photo_dir = os.path.join(os.path.dirname(__file__), "uploaded_photos")
    os.makedirs(photo_dir, exist_ok=True)

    full_path = os.path.join(photo_dir, unique_filename)
    with open(full_path, "wb") as f:
        f.write(await photo.read())

    mood = "happy"
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO moods (user_id, mood, timestamp, photo_path) VALUES (?, ?, ?, ?)",
        (user_id, mood, timestamp, full_path)
    )
    conn.commit()
    conn.close()

    return {
        "success": True,
        "mood": mood,
        "message": "You look happy!",
        "image_saved_as": unique_filename
    }
from fastapi import Path

@app.delete("/moods/{mood_id}")
def delete_mood(
    mood_id: int = Path(..., description="ID of the mood to delete"),
    user_id: int = Depends(verify_token)
):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT * FROM moods WHERE id = ? AND user_id = ?", (mood_id, user_id))
    mood = cur.fetchone()

    if not mood:
        conn.close()
        raise HTTPException(status_code=404, detail="Mood not found or unauthorized")

    if mood[4] and os.path.exists(mood[4]):
        try:
            os.remove(mood[4])
        except Exception:
            pass  
    cur.execute("DELETE FROM moods WHERE id = ?", (mood_id,))
    conn.commit()
    conn.close()

    return {"success": True, "message": f"Mood with ID {mood_id} deleted successfully"}
