🚀 Phase 1: Clone the Repository

Open a terminal and run :

```bash
git clone https://github.com/RishitaChourey/AI-powered-quality-check-and-analysis-plateform.git
cd AI-powered-quality-check-and-analysis-plateform
```

⚙️ Phase 2: Python Environment and Dependencies
This phase installs all standard libraries and links the custom YOLOv12 submodule to the Python path.

1️⃣ Create and Activate Virtual Environment
```bash
python -m venv venv

**if the user doesn't have the persmissions to create virtual env, run the folowing:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

🪟 Windows
.\venv\Scripts\activate
🐧 macOS / Linux
source venv/bin/activate
```
2️⃣ Navigate to the Backend Folder
```bash
cd backend
```
3️⃣ Install Standard Dependencies
Make sure you have a requirements.txt file in the backend folder.

```bash
pip install -r requirements.txt
```

▶️ Phase 3: Run the Application
🧠 1️⃣ Start the Backend API (Terminal 1)
Ensure your model weights (e.g., weights/best.pt) are present inside the backend directory.

Start the FastAPI server:

```bash
uvicorn app:app --reload
```
✅ The backend should now be running at:

```bash
http://127.0.0.1:8000

```
2️⃣ Run the Login Backend (Terminal 2)

Open a new terminal window, activate your virtual environment again (if not already), and then navigate to the login backend folder if applicable.

Run the following command:
```bash
python login.py
```

✅ The login backend will start running locally.
You can log in using these credentials:
```bash
Email: a@gmail.com  
Password: 123456
```

💻 2️⃣ Run the Frontend (Terminal 3)
Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
npm install
npm start
```
✅ The React app should open automatically at:
```bash
http://localhost:3000
```
