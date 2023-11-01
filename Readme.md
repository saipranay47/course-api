## Course Purchasing API

This is a Node.js Express application that implements JWT authentication and authorization. The application has two types of users: admins and users. Admins can create, update, and delete courses. Users can purchase and view purchased courses.

### Requirements

* Node.js
* Express
* Mongoose
* JWT

### Setup

1. Clone the repository
2. Install the dependencies
3. Start the development server

```
npm install
npm start
```

### Usage

**Admin routes**

* **POST /admin/signup:** Create a new admin account.
* **POST /admin/login:** Login as an admin.
* **GET /admin/me:** Get the current admin user.
* **POST /admin/courses:** Create a new course.
* **PUT /admin/courses/:courseId:** Update an existing course.
* **GET /admin/courses:** Get all courses.

**User routes**

* **POST /users/signup:** Create a new user account.
* **POST /users/login:** Login as a user.
* **GET /users/courses:** Get all published courses.
* **POST /users/courses/:courseId:** Purchase a course.
* **GET /users/purchasedCourses:** Get all purchased courses.

### Authentication

All admin routes require authentication. To authenticate, send a JWT token in the `Authorization` header. The token can be obtained by logging in as an admin.

### Authorization

Only admins can access admin routes. Users can only access user routes.

### Example usage

```
# Create a new admin account
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password",
    "email": "admin@example.com"
  }' \
  http://localhost:3000/admin/signup

# Login as an admin
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }' \
  http://localhost:3000/admin/login

# Get the current admin user
curl -X GET \
  -H "Authorization: Bearer <token>" \
  http://localhost:3000/admin/me

# Create a new course
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "My Course",
    "description": "This is a great course!",
    "price": 100,
    "imageLink": "https://example.com/image.png",
    "published": true
  }' \
  http://localhost:3000/admin/courses

# Purchase a course
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  http://localhost:3000/users/courses/:courseId
```