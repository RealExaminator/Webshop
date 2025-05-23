# WebShop Application

## Student Information
- **Name:** Ikenna Ihetu
- **Email:** Ikenna.Ihetu@abo.fi

## Implemented Requirements

**Mandatory:**
- [X] 1. Project folder (readme.md, backend/requirements.txt, frontend/package.json)
- [X] 2. Backend (Django, API, JSON/HTML serving, SQLite)
- [X] 3. Frontend (React)
- [X] 4. Automatic DB population
- [X] 5. Browse items
- [X] 6. Create account
- [X] 7. Login
- [X] 8. Add item
- [X] 9. Add to cart

**Optional Requirements Implemented:**
- [X] 10. Search items (by title)
- [X] 11. Remove from the cart (Implemented as part of CartPage)
- [X] 12. Pay 
- [X] 13. Routing (SPA: "/", "/signup" and others handled by React Router)

*(Mark [X] for completed, [ ] for not completed or partially completed. Add notes if a requirement is partially met.)*

## How to Run the Project

### Prerequisites
- Python 3.8+ (with pip and venv)
- Node.js 16+ and npm

### Backend Setup
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # On Windows:
    # venv\Scripts\activate
    # On macOS/Linux:
    # source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Apply database migrations:
    ```bash
    python manage.py makemigrations api 
    python manage.py migrate
    ```
5.  (Optional) Create a superuser for Django admin access:
    ```bash
    python manage.py createsuperuser
    ```
6.  Start the Django development server (usually on `http://127.0.0.1:8000`):
    ```bash
    python manage.py runserver
    ```

### Frontend Setup
1.  Navigate to the `frontend` directory (from the project root):
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server (usually on `http://localhost:3000`):
    ```bash
    npm start
    ```

### Accessing the Application
-   The **Django-served landing page** (with DB population link) will be available at `http://127.0.0.1:8000/`.
-   The **React shop application (SPA)** will be available at `http://localhost:3000/`.
    
- The React app proxies API requests to the Django backend.
-   The Django admin interface is at `http://127.0.0.1:8000/admin/`.

### Populating the Database
Visit the landing page at `http://127.0.0.1:8000/` and click the "Automatically Populate/Re-populate Database" button. This will clear existing non-superuser users, items, and cart items, then generate 6 test users and 30 items.