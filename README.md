# School Management System

This project consists of a Strapi backend and a React frontend for a school management system.

## Backend Setup (Strapi)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install # or yarn install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the `backend` directory based on `.env.example`. At minimum, you'll need:
    ```
    HOST=0.0.0.0
    PORT=1337
    APP_KEYS="your_app_keys_here" # Generate using: node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
    API_TOKEN_SALT="your_api_token_salt_here" # Generate similarly
    ADMIN_JWT_SECRET="your_admin_jwt_secret_here" # Generate similarly
    JWT_SECRET="your_jwt_secret_here" # Generate similarly
    DATABASE_CLIENT=sqlite
    DATABASE_FILENAME=.tmp/data.db
    ```

4.  **Start the Strapi development server:**
    ```bash
    npm run develop # or yarn develop
    ```
    Strapi will usually open in your browser at `http://localhost:1337/admin`.

5.  **Initial Admin User Setup:**
    If this is your first time running Strapi, it will prompt you to create an administrator account in the browser. Complete this setup.

6.  **Set Permissions (Crucial for Frontend Interaction):**
    *   Go to `http://localhost:1337/admin`.
    *   Navigate to `Settings` -> `Users & Permissions Plugin` -> `Roles`.
    *   Click on the `Public` role.
    *   For both **`API::Student`** and **`API::Guardian`** (and any other content types your frontend interacts with for creation/reading):
        *   Expand the section.
        *   Check the `find`, `findOne`, and **`create`** checkboxes.
    *   Click the **`Save`** button.
    *   **Restart your Strapi backend server after saving permissions.**

## Frontend Setup (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install # or yarn install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the `frontend` directory based on `.env.example` (if available). At minimum, you'll need:
    ```
    REACT_APP_API_URL=http://localhost:1337/api
    ```
    This variable should point to your running Strapi backend API.

4.  **Start the React development server:**
    ```bash
    npm start # or yarn start
    ```
    The frontend application will usually open in your browser at `http://localhost:3000` (or another available port).
