# BackendCourse-Tasks_and_Auth

📽️ REQUIRED: Code Walkthrough Video

This assignment requires a 3–5 minute video recording of your solution.

Please review the full instructions on the Code Walkthrough 3 assignment page before you start coding! 

In this module , you learned how to authenticate users and enforce access control using Express middleware:

Resource Ownership Authorization: Restricting PUT /posts/:id and DELETE /posts/:id so only the original author can modify or delete content.

Role-Based Access Control (RBAC): Protecting administrative endpoints like GET /api/users so only accounts with the ADMIN role can access them.

In this assignment, you will take these authorization concepts and apply them to a relational Task API. You will build a multi-tenant task system where standard users manage their own tasks under /api/tasks, while administrative users manage tasks system-wide under /api/admin/tasks.

1. Prerequisites & Setup: 

Make sure you have watched all Module 8 videos and mastered JWT authentication, role-based access control (RBAC), and resource ownership authorization demonstrated in the lectures using the Blog API.
Download the starter codeDownload starter codeDownload starter code, unzip it, and open the folder in VS Code.

Open your terminal and run npm install to install all dependencies.

Your repository comes pre-configured with the authentication plumbing built during Module 8:

task-api/
├── prisma/
│   ├── migrations/             # Database migration history
│   └── schema.prisma           # Contains User model and Role enum
├── src/
│   ├── config/
│   │   └── db.js               # Shared PrismaClient instance
│   ├── controllers/
│   │   ├── authController.js   # Working Signup & Login handlers
│   │   └── taskController.js   # Task handler logic (Your Work)
│   ├── middleware/
│   │   ├── auth.js             # Authentication & Authorization guards (Your Work)
│   │   └── validators.js         # Input validation middleware
│   ├── repositories/
│   │   ├── userRepo.js   # Auth DB queries
│   │   └── taskRepo.js   # Task DB queries (Your Work)
│   ├── routes/
│   │   ├── adminRoutes.js      # Administrative routes (/api/admin/tasks) (Your Work)
│   │   ├── authRoutes.js       # Auth routes (/api/auth) 
│   │   └── taskRoutes.js       # Standard user routes (/api/tasks) (Your Work)
│   ├── services/
│   │   ├── authServices.js     # Auth business logic (JWT signing, password hashing)
│   │   └── taskService.js      # Task business logic & orchestrations (Your Work)
│   └── server.js               # Express app entry point
├── .env.example
└── package.json

Environment Configuration Setup

Your starter repository includes an .env.example file containing required environment variable placeholders.

Create Local .env: Rename .env.example to .env in the root directory of your project (or copy it using cp .env.example .env).

Configure Environment Variables: Open your local .env file and replace any placeholder values with proper local values (e.g., your database connection string and JWT secret) before running migrations or starting the server.
IMPORTANT: Your starter code is pre-configured with the exact folder structure and file names required by the autograder. Do not rename, delete, or relocate these files, and do not change any function names or parameter signatures, or your submission will fail.

2. Database Schema & Relational Modeling 

Similar to how Post was related to User in section 8.2, update prisma/schema.prisma to include a Task model with a one-to-many relationship to the existing User model:

Task Model Fields:

id: Integer (Primary Key)

title: String (Required task description)

completed: Boolean (Default: false)

userId: String (Foreign key referencing User.id)

Required Table Mapping & Relations::

The underlying database table name MUST be "tasks" (use @@map("tasks") inside your Task model).
A User can have many Task records.

A Task belongs to exactly one User.

Migration & Client Generation Commands:

Run npx prisma migrate dev --name add_task_model to generate and apply your database migration.
Run npx prisma generate to regenerate the Prisma client.

3. Access Control Middleware 

Applying the custom authorization middleware patterns demonstrated in section 8.5, build three modular middleware functions inside src/middleware/auth.js:

authenticate: Handles identity verification. Ensures incoming requests supply a valid JWT before proceeding. Returns 401 Unauthorized if authentication fails (missing authorization header, malformatted authorization header, and JWT verification failure)
requireAdmin: Enforces role-based access control (RBAC). Restricts routes to administrative accounts. Responds with 403 Forbidden for unauthorized roles.

requireTaskOwnership: Enforces resource-level authorization. Ensures non-admin users can only interact with tasks they own. Responds with 404 Not Found if the task does not exist, or 403 Forbidden if the user is not the task owner.

4. API Route Contracts

Your application must export and mount two distinct Express routers to enforce security boundaries cleanly:

1) Standard User Routes (mounted under /api/tasks)

GET /api/tasks

Description: Returns only the tasks owned by the current authenticated user (Tenant Isolated).

Access: Authenticated users only

Success Status Code: 200 OK

Error Status Codes: 401 Unauthorized

POST /api/tasks

Description: Creates a new task automatically attached to the current authenticated user.

Access: Authenticated users only

Success Status Code: 201 Created

Error Status Codes: 400 Bad Request, 401 Unauthorized

GET /api/tasks/:id

Description: Fetches an owned task by ID.

Access: Task Owner

Success Status Code: 200 OK

Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

PUT /api/tasks/:id

Description: Updates the title and/or status of an owned task.

Access: Task Owner

Success Status Code: 200 OK

Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

DELETE /api/tasks/:id

Description: Removes an owned task from the database.

Access: Task Owner

Success Status Code: 204 No Content

Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

User Route Authorization & Error Rules

400 Bad Request: Payload or route parameter (e.g., non-numeric ID) fails input validation.
401 Unauthorized: Request lacks a valid authentication token.

403 Forbidden: A standard user attempts to read, update, or delete a task owned by another user.

404 Not Found: Requested task ID does not exist in the database.

2) Administrative Routes (mounted under /api/admin/tasks)

GET /api/admin/tasks

Description: Returns all tasks across all users in the system.

Access: Admin only

Success Status Code: 200 OK

Error Status Codes: 401 Unauthorized, 403 Forbidden

GET /api/admin/tasks/:id

Description: Fetches any task by ID across the system, regardless of ownership.

Access: Admin only

Success Status Code: 200 OK

Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

PUT /api/admin/tasks/:id

Description: Updates any task by ID across the system, regardless of ownership.

Access: Admin only

Success Status Code: 200 OK

Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

DELETE /api/admin/tasks/:id

Description: Deletes any task by ID across the system, regardless of ownership.

Access: Admin only

Success Status Code: 204 No Content

Error Status Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

Admin Route Error Rules:

400 Bad Request: Payload or route parameter (e.g., non-numeric ID) fails input validation.

401 Unauthorized: Request lacks a valid authentication token.

403 Forbidden: A non-admin user attempts to access any /api/admin/tasks route.

404 Not Found: Requested task ID does not exist in the database.

CRITICAL: Architectural & Testing Requirements

Layered Architecture and modularity is Mandatory: You must separate concerns into Repository, Service, Controller and Middleware modules as taught in lecture. 
Direct Layer Unit Testing: The autograder does not only test HTTP endpoints. It also runs isolated unit tests directly against your functions in:

src/controllers/taskController.js

src/repositories/taskRepository.js
src/services/taskService.js

src/middleware/auth.js 

Do Not Bypass Layers or Embed Logic in Routes: Putting data access, business logic, or authorization checks directly inside your controller handlers (or skipping repo/service/middleware files) will cause unit tests to fail immediately.
5. Test Endpoints

Use Postman to thoroughly test all task endpoints before submitting. Ensure your API outputs match the specified HTTP status codes and standard JSON error/success response structures.
