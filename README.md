# Emotions Detector

A web application that detects emotions from text input using a FastAPI backend and a modern web frontend.

## Prerequisites

- Python 3.8 or higher
- Node.js 16.x or higher
- npm (comes with Node.js)

## Project Structure

- `/API` - Contains the FastAPI backend code
- `/public` - Static files served by the frontend
- `/src` - Frontend source code
- `/node_modules` - Node.js dependencies (created after running npm install)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the API directory:
   ```bash
   cd API
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     .\.venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up the database:
   - The application uses SQLite with a file named `database.db`
   - The database file will be automatically created in the API directory when you first run the application
   - If you need to reset the database, simply restart the application

### 2. Frontend Setup

1. Navigate to the project root directory:
   ```bash
   cd ..
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the Backend

1. Make sure you're in the API directory and the virtual environment is activated
2. Run the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```
   The API will be available at `http://localhost:8000`

### Start the Frontend

1. In a new terminal, navigate to the project root directory
2. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

[//]: # (## Environment Variables)

[//]: # ()
[//]: # (Set up your environment variables in your preferred way, such as directly in your shell or through your IDE's run configuration. The application expects the following variables to be available:)

[//]: # ()
[//]: # (```)

[//]: # (DATABASE_URL=sqlite:///./database.db)

[//]: # (SECRET_KEY=your_secret_key)

[//]: # (```)

[//]: # (## API Endpoints)

[//]: # ()
[//]: # (- `POST /analyze` - Analyze text for emotions)

[//]: # (- `GET /history` - Get analysis history)

## Development

- Frontend: React (JavaScript/TypeScript)
- Backend: FastAPI (Python)
- Database: SQLite

[//]: # (## License)

[//]: # (This project is licensed under the MIT License - see the [LICENSE]&#40;LICENSE&#41; file for details.)