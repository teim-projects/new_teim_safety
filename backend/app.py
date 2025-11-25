from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import sqlite3
import io, shutil, os, glob, sys
from moviepy import VideoFileClip
from collections import Counter

# ==========================================================
# Add YOLOv12 folder to PYTHON PATH (for custom model layers)
# ==========================================================
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

# ==========================================================
# FastAPI Application
# ==========================================================
app = FastAPI(title="PPE Detection + Auth API", version="2.0")

# ==========================================================
# CORS Policy
# ==========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*",'teimsafety.com'],          # allow all domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Database Setup / Utility Functions
# ==========================================================
DB_FILE = "users.db"

def ensure_user_table():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

def register_user(name, email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, password)
        )
        conn.commit()
        return True, "User registered successfully."
    except sqlite3.IntegrityError:
        return False, "Email already exists."
    finally:
        conn.close()

def check_login(email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return False, "User does not exist. Please sign up first."

    _, _, _, db_password = user
    if db_password == password:
        return True, "Login successful."
    else:
        return False, "Incorrect password."


# ==========================================================
# User Model
# ==========================================================
class User(BaseModel):
    name: str | None = None
    email: str
    password: str


# ==========================================================
# AUTH ROUTES (Signup + Login)
# ==========================================================
@app.post("/api/signup")
async def signup(user: User):
    success, message = register_user(user.name, user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=201)
    else:
        return JSONResponse({"message": message}, status_code=400)

@app.post("/api/login")
async def login(user: User):
    success, message = check_login(user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=200)
    else:
        return JSONResponse({"message": message}, status_code=401)


# ==========================================================
# Load YOLO Model on Startup ONLY ONCE
# ==========================================================
@app.on_event("startup")
async def load_model():
    global model
    weight_path = "weights/best(3).pt"

    if not os.path.exists(weight_path):
        raise RuntimeError(f"Model file not found: {weight_path}")

    model = YOLO(weight_path)
    print("🚀 YOLOv12 Model Loaded Successfully!")


# ==========================================================
# Static Files Configuration
# ==========================================================
app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/detections", exist_ok=True)


# ==========================================================
# Utility: Convert YOLO .avi to .mp4
# ==========================================================
def convert_avi_to_mp4(input_path: str) -> str:
    if not input_path.lower().endswith(".avi"):
        return input_path

    output_path = input_path.replace(".avi", ".mp4")
    with VideoFileClip(input_path) as clip:
        clip.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            fps=clip.fps or 20
        )
    os.remove(input_path)
    return output_path


# ==========================================================
# PPE Detection Route
# ==========================================================
@app.post("/api/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        upload_path = f"static/uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        is_video = file.content_type.startswith("video/")

        # Run YOLO
        results = model.predict(
            source=upload_path,
            save=True,
            conf=0.60,
            project="static",
            name="detections",
            exist_ok=True
        )

        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })

        base_name = os.path.splitext(file.filename)[0]
        output_dir = "static/detections"
        detected_files = glob.glob(f"{output_dir}/{base_name}*")
        annotated_path = detected_files[0].replace("\\", "/") if detected_files else None

        if annotated_path and annotated_path.endswith(".avi"):
            annotated_path = convert_avi_to_mp4(annotated_path)

        summary = Counter([d["class"] for d in detections])

        return JSONResponse({
            "detections": detections,
            "summary": summary,
            "original_image": f"/static/uploads/{file.filename}",
            "annotated_image": "/" + annotated_path if annotated_path else None,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ==========================================================
# ROOT ROUTE
# ==========================================================
@app.get("/")
def root():
    return {"message": "PPE detection API running!"}
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import sqlite3
import io, shutil, os, glob, sys
from moviepy import VideoFileClip
from collections import Counter

# ==========================================================
# Add YOLOv12 folder to PYTHON PATH (for custom model layers)
# ==========================================================
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

# ==========================================================
# FastAPI Application
# ==========================================================
app = FastAPI(title="PPE Detection + Auth API", version="2.0")

# ==========================================================
# CORS Policy
# ==========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Database Setup / Utility Functions
# ==========================================================
DB_FILE = "users.db"

def ensure_user_table():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

def register_user(name, email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, password)
        )
        conn.commit()
        return True, "User registered successfully."
    except sqlite3.IntegrityError:
        return False, "Email already exists."
    finally:
        conn.close()

def check_login(email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return False, "User does not exist. Please sign up first."

    _, _, _, db_password = user
    if db_password == password:
        return True, "Login successful."
    else:
        return False, "Incorrect password."


# ==========================================================
# User Model
# ==========================================================
class User(BaseModel):
    name: str | None = None
    email: str
    password: str


# ==========================================================
# AUTH ROUTES (Signup + Login)
# ==========================================================
@app.post("/api/signup")
async def signup(user: User):
    success, message = register_user(user.name, user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=201)
    else:
        return JSONResponse({"message": message}, status_code=400)

@app.post("/api/login")
async def login(user: User):
    success, message = check_login(user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=200)
    else:
        return JSONResponse({"message": message}, status_code=401)


# ==========================================================
# Load YOLO Model on Startup ONLY ONCE
# ==========================================================
@app.on_event("startup")
async def load_model():
    global model
    weight_path = "weights/best(3).pt"

    if not os.path.exists(weight_path):
        raise RuntimeError(f"Model file not found: {weight_path}")

    model = YOLO(weight_path)
    print("🚀 YOLOv12 Model Loaded Successfully!")


# ==========================================================
# Static Files Configuration
# ==========================================================
app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/detections", exist_ok=True)


# ==========================================================
# Utility: Convert YOLO .avi to .mp4
# ==========================================================
def convert_avi_to_mp4(input_path: str) -> str:
    if not input_path.lower().endswith(".avi"):
        return input_path

    output_path = input_path.replace(".avi", ".mp4")
    with VideoFileClip(input_path) as clip:
        clip.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            fps=clip.fps or 20
        )
    os.remove(input_path)
    return output_path


# ==========================================================
# PPE Detection Route
# ==========================================================
@app.post("/api/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        upload_path = f"static/uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        is_video = file.content_type.startswith("video/")

        # Run YOLO
        results = model.predict(
            source=upload_path,
            save=True,
            conf=0.60,
            project="static",
            name="detections",
            exist_ok=True
        )

        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })

        base_name = os.path.splitext(file.filename)[0]
        output_dir = "static/detections"
        detected_files = glob.glob(f"{output_dir}/{base_name}*")
        annotated_path = detected_files[0].replace("\\", "/") if detected_files else None

        if annotated_path and annotated_path.endswith(".avi"):
            annotated_path = convert_avi_to_mp4(annotated_path)

        summary = Counter([d["class"] for d in detections])

        return JSONResponse({
            "detections": detections,
            "summary": summary,
            "original_image": f"/static/uploads/{file.filename}",
            "annotated_image": "/" + annotated_path if annotated_path else None,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ==========================================================
# ROOT ROUTE
# ==========================================================
@app.get("/")
def root():
    return {"message": "PPE detection API running!"}
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import sqlite3
import io, shutil, os, glob, sys
from moviepy import VideoFileClip
from collections import Counter

# ==========================================================
# Add YOLOv12 folder to PYTHON PATH (for custom model layers)
# ==========================================================
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

# ==========================================================
# FastAPI Application
# ==========================================================
app = FastAPI(title="PPE Detection + Auth API", version="2.0")

# ==========================================================
# CORS Policy
# ==========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Database Setup / Utility Functions
# ==========================================================
DB_FILE = "users.db"

def ensure_user_table():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

def register_user(name, email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, password)
        )
        conn.commit()
        return True, "User registered successfully."
    except sqlite3.IntegrityError:
        return False, "Email already exists."
    finally:
        conn.close()

def check_login(email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return False, "User does not exist. Please sign up first."

    _, _, _, db_password = user
    if db_password == password:
        return True, "Login successful."
    else:
        return False, "Incorrect password."


# ==========================================================
# User Model
# ==========================================================
class User(BaseModel):
    name: str | None = None
    email: str
    password: str


# ==========================================================
# AUTH ROUTES (Signup + Login)
# ==========================================================
@app.post("/api/signup")
async def signup(user: User):
    success, message = register_user(user.name, user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=201)
    else:
        return JSONResponse({"message": message}, status_code=400)

@app.post("/api/login")
async def login(user: User):
    success, message = check_login(user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=200)
    else:
        return JSONResponse({"message": message}, status_code=401)


# ==========================================================
# Load YOLO Model on Startup ONLY ONCE
# ==========================================================
@app.on_event("startup")
async def load_model():
    global model
    weight_path = "weights/best(3).pt"

    if not os.path.exists(weight_path):
        raise RuntimeError(f"Model file not found: {weight_path}")

    model = YOLO(weight_path)
    print("🚀 YOLOv12 Model Loaded Successfully!")


# ==========================================================
# Static Files Configuration
# ==========================================================
app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/detections", exist_ok=True)


# ==========================================================
# Utility: Convert YOLO .avi to .mp4
# ==========================================================
def convert_avi_to_mp4(input_path: str) -> str:
    if not input_path.lower().endswith(".avi"):
        return input_path

    output_path = input_path.replace(".avi", ".mp4")
    with VideoFileClip(input_path) as clip:
        clip.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            fps=clip.fps or 20
        )
    os.remove(input_path)
    return output_path


# ==========================================================
# PPE Detection Route
# ==========================================================
@app.post("/api/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        upload_path = f"static/uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        is_video = file.content_type.startswith("video/")

        # Run YOLO
        results = model.predict(
            source=upload_path,
            save=True,
            conf=0.60,
            project="static",
            name="detections",
            exist_ok=True
        )

        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })

        base_name = os.path.splitext(file.filename)[0]
        output_dir = "static/detections"
        detected_files = glob.glob(f"{output_dir}/{base_name}*")
        annotated_path = detected_files[0].replace("\\", "/") if detected_files else None

        if annotated_path and annotated_path.endswith(".avi"):
            annotated_path = convert_avi_to_mp4(annotated_path)

        summary = Counter([d["class"] for d in detections])

        return JSONResponse({
            "detections": detections,
            "summary": summary,
            "original_image": f"/static/uploads/{file.filename}",
            "annotated_image": "/" + annotated_path if annotated_path else None,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ==========================================================
# ROOT ROUTE
# ==========================================================
@app.get("/")
def root():
    return {"message": "PPE detection API running!"}
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import sqlite3
import io, shutil, os, glob, sys
from moviepy import VideoFileClip
from collections import Counter

# ==========================================================
# Add YOLOv12 folder to PYTHON PATH (for custom model layers)
# ==========================================================
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

# ==========================================================
# FastAPI Application
# ==========================================================
app = FastAPI(title="PPE Detection + Auth API", version="2.0")

# ==========================================================
# CORS Policy
# ==========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Database Setup / Utility Functions
# ==========================================================
DB_FILE = "users.db"

def ensure_user_table():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

def register_user(name, email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, password)
        )
        conn.commit()
        return True, "User registered successfully."
    except sqlite3.IntegrityError:
        return False, "Email already exists."
    finally:
        conn.close()

def check_login(email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return False, "User does not exist. Please sign up first."

    _, _, _, db_password = user
    if db_password == password:
        return True, "Login successful."
    else:
        return False, "Incorrect password."


# ==========================================================
# User Model
# ==========================================================
class User(BaseModel):
    name: str | None = None
    email: str
    password: str


# ==========================================================
# AUTH ROUTES (Signup + Login)
# ==========================================================
@app.post("/api/signup")
async def signup(user: User):
    success, message = register_user(user.name, user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=201)
    else:
        return JSONResponse({"message": message}, status_code=400)

@app.post("/api/login")
async def login(user: User):
    success, message = check_login(user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=200)
    else:
        return JSONResponse({"message": message}, status_code=401)


# ==========================================================
# Load YOLO Model on Startup ONLY ONCE
# ==========================================================
@app.on_event("startup")
async def load_model():
    global model
    weight_path = "weights/best(3).pt"

    if not os.path.exists(weight_path):
        raise RuntimeError(f"Model file not found: {weight_path}")

    model = YOLO(weight_path)
    print("🚀 YOLOv12 Model Loaded Successfully!")


# ==========================================================
# Static Files Configuration
# ==========================================================
app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/detections", exist_ok=True)


# ==========================================================
# Utility: Convert YOLO .avi to .mp4
# ==========================================================
def convert_avi_to_mp4(input_path: str) -> str:
    if not input_path.lower().endswith(".avi"):
        return input_path

    output_path = input_path.replace(".avi", ".mp4")
    with VideoFileClip(input_path) as clip:
        clip.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            fps=clip.fps or 20
        )
    os.remove(input_path)
    return output_path


# ==========================================================
# PPE Detection Route
# ==========================================================
@app.post("/api/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        upload_path = f"static/uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        is_video = file.content_type.startswith("video/")

        # Run YOLO
        results = model.predict(
            source=upload_path,
            save=True,
            conf=0.60,
            project="static",
            name="detections",
            exist_ok=True
        )

        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })

        base_name = os.path.splitext(file.filename)[0]
        output_dir = "static/detections"
        detected_files = glob.glob(f"{output_dir}/{base_name}*")
        annotated_path = detected_files[0].replace("\\", "/") if detected_files else None

        if annotated_path and annotated_path.endswith(".avi"):
            annotated_path = convert_avi_to_mp4(annotated_path)

        summary = Counter([d["class"] for d in detections])

        return JSONResponse({
            "detections": detections,
            "summary": summary,
            "original_image": f"/static/uploads/{file.filename}",
            "annotated_image": "/" + annotated_path if annotated_path else None,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ==========================================================
# ROOT ROUTE
# ==========================================================
@app.get("/")
def root():
    return {"message": "PPE detection API running!"}
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import sqlite3
import io, shutil, os, glob, sys
from moviepy import VideoFileClip
from collections import Counter

# ==========================================================
# Add YOLOv12 folder to PYTHON PATH (for custom model layers)
# ==========================================================
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

# ==========================================================
# FastAPI Application
# ==========================================================
app = FastAPI(title="PPE Detection + Auth API", version="2.0")

# ==========================================================
# CORS Policy
# ==========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Database Setup / Utility Functions
# ==========================================================
DB_FILE = "users.db"

def ensure_user_table():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

def register_user(name, email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, password)
        )
        conn.commit()
        return True, "User registered successfully."
    except sqlite3.IntegrityError:
        return False, "Email already exists."
    finally:
        conn.close()

def check_login(email, password):
    ensure_user_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return False, "User does not exist. Please sign up first."

    _, _, _, db_password = user
    if db_password == password:
        return True, "Login successful."
    else:
        return False, "Incorrect password."


# ==========================================================
# User Model
# ==========================================================
class User(BaseModel):
    name: str | None = None
    email: str
    password: str


# ==========================================================
# AUTH ROUTES (Signup + Login)
# ==========================================================
@app.post("/api/signup")
async def signup(user: User):
    success, message = register_user(user.name, user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=201)
    else:
        return JSONResponse({"message": message}, status_code=400)

@app.post("/api/login")
async def login(user: User):
    success, message = check_login(user.email, user.password)
    if success:
        return JSONResponse({"message": message}, status_code=200)
    else:
        return JSONResponse({"message": message}, status_code=401)


# ==========================================================
# Load YOLO Model on Startup ONLY ONCE
# ==========================================================
@app.on_event("startup")
async def load_model():
    global model
    weight_path = "weights/best(3).pt"

    if not os.path.exists(weight_path):
        raise RuntimeError(f"Model file not found: {weight_path}")

    model = YOLO(weight_path)
    print("🚀 YOLOv12 Model Loaded Successfully!")


# ==========================================================
# Static Files Configuration
# ==========================================================
app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/detections", exist_ok=True)


# ==========================================================
# Utility: Convert YOLO .avi to .mp4
# ==========================================================
def convert_avi_to_mp4(input_path: str) -> str:
    if not input_path.lower().endswith(".avi"):
        return input_path

    output_path = input_path.replace(".avi", ".mp4")
    with VideoFileClip(input_path) as clip:
        clip.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            fps=clip.fps or 20
        )
    os.remove(input_path)
    return output_path


# ==========================================================
# PPE Detection Route
# ==========================================================
@app.post("/api/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        upload_path = f"static/uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        is_video = file.content_type.startswith("video/")

        # Run YOLO
        results = model.predict(
            source=upload_path,
            save=True,
            conf=0.60,
            project="static",
            name="detections",
            exist_ok=True
        )

        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })

        base_name = os.path.splitext(file.filename)[0]
        output_dir = "static/detections"
        detected_files = glob.glob(f"{output_dir}/{base_name}*")
        annotated_path = detected_files[0].replace("\\", "/") if detected_files else None

        if annotated_path and annotated_path.endswith(".avi"):
            annotated_path = convert_avi_to_mp4(annotated_path)

        summary = Counter([d["class"] for d in detections])

        return JSONResponse({
            "detections": detections,
            "summary": summary,
            "original_image": f"/static/uploads/{file.filename}",
            "annotated_image": "/" + annotated_path if annotated_path else None,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ==========================================================
# ROOT ROUTE
# ==========================================================
@app.get("/")
def root():
    return {"message": "PPE detection API running!"}
