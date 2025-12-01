# API Documentation - Backend Management Access

Base URL: `http://localhost:4000/api`

## Authentication

Semua endpoint (kecuali login dan select-role) memerlukan Bearer Token di header:

```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### 1. Login
**POST** `/auth/login`

Login dengan username dan password. Jika user memiliki multiple roles, akan diminta memilih role.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Single Role):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id_users": 1,
      "username": "admin",
      "full_name": "Administrator",
      "email": "admin@example.com"
    },
    "role": {
      "id_roles": 1,
      "role_name": "Admin"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

**Response (Multiple Roles):**
```json
{
  "success": true,
  "message": "Please select a role to continue",
  "data": {
    "user": {
      "id_users": 2,
      "username": "john",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "roles": [
      {
        "id_roles": 2,
        "role_name": "Manager",
        "is_default": true
      },
      {
        "id_roles": 3,
        "role_name": "Staff",
        "is_default": false
      }
    ],
    "requires_role_selection": true
  }
}
```

### 2. Select Role
**POST** `/auth/select-role`

Memilih role untuk user dengan multiple roles.

**Request Body:**
```json
{
  "id_users": 2,
  "id_roles": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role selected successfully",
  "data": {
    "user": { ... },
    "role": { ... },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

### 3. Refresh Token
**POST** `/auth/refresh-token`

Refresh access token menggunakan refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

### 4. Logout
**POST** `/auth/logout`

Logout dan hapus refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

### 5. Get Current User
**GET** `/auth/me`

Mendapatkan info user yang sedang login.

---

## 👤 User Endpoints

### 1. Get All Users
**GET** `/users?page=1&limit=10&search=john&is_active=active`

**Access:** Admin, Manager

### 2. Get User by ID
**GET** `/users/:id`

**Access:** Admin, Manager

### 3. Create User
**POST** `/users`

**Access:** Admin

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "full_name": "New User",
  "email": "newuser@example.com",
  "is_active": "active"
}
```

### 4. Update User
**PUT** `/users/:id`

**Access:** Admin

### 5. Delete User
**DELETE** `/users/:id`

**Access:** Admin

### 6. Get User's Roles
**GET** `/users/:id/roles`

**Access:** Admin, Manager

### 7. Assign Role to User
**POST** `/users/:id/roles`

**Access:** Admin

**Request Body:**
```json
{
  "id_roles": 2,
  "is_default": true
}
```

### 8. Remove Role from User
**DELETE** `/users/:id/roles/:roleId`

**Access:** Admin

---

## 🎭 Role Endpoints

### 1. Get All Roles
**GET** `/roles?page=1&limit=10&search=admin&is_active=active`

**Access:** Admin, Manager

### 2. Get Role by ID
**GET** `/roles/:id`

**Access:** Admin, Manager

### 3. Create Role
**POST** `/roles`

**Access:** Admin

**Request Body:**
```json
{
  "role_name": "Manager",
  "description": "Manager level access",
  "is_active": "active"
}
```

### 4. Update Role
**PUT** `/roles/:id`

**Access:** Admin

### 5. Delete Role
**DELETE** `/roles/:id`

**Access:** Admin

### 6. Get Role's Users
**GET** `/roles/:id/users`

**Access:** Admin, Manager

### 7. Get Role's Menu Access
**GET** `/roles/:id/menus`

**Access:** Admin, Manager

---

## 📋 Menu Endpoints

### 1. Get All Menus (Flat)
**GET** `/menus?page=1&limit=10&search=dashboard&is_active=active`

**Access:** Admin, Manager

### 2. Get Menu Tree (Hierarchical)
**GET** `/menus/tree?is_active=active`

**Access:** Admin, Manager

**Response:**
```json
{
  "success": true,
  "message": "Menu tree retrieved successfully",
  "data": [
    {
      "id_menus": 1,
      "menu_name": "Dashboard",
      "menu_url": "/dashboard",
      "menu_icon": "dashboard",
      "level": 1,
      "children": []
    },
    {
      "id_menus": 2,
      "menu_name": "Master Data",
      "menu_url": "/master",
      "level": 1,
      "children": [
        {
          "id_menus": 3,
          "menu_name": "Users",
          "menu_url": "/master/users",
          "level": 2,
          "children": []
        }
      ]
    }
  ]
}
```

### 3. Get User's Menus
**GET** `/menus/user`

**Access:** All authenticated users

Mendapatkan menu yang bisa diakses user berdasarkan role-nya.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_menus": 1,
      "menu_name": "Dashboard",
      "menu_url": "/dashboard",
      "permissions": {
        "can_view": true,
        "can_create": false,
        "can_update": false,
        "can_delete": false
      },
      "children": []
    }
  ]
}
```

### 4. Get Menu by ID
**GET** `/menus/:id`

**Access:** Admin, Manager

### 5. Create Menu
**POST** `/menus`

**Access:** Admin

**Request Body:**
```json
{
  "menu_name": "Settings",
  "menu_url": "/settings",
  "menu_icon": "settings",
  "parent_id": null,
  "order_number": 4,
  "is_active": "active"
}
```

### 6. Update Menu
**PUT** `/menus/:id`

**Access:** Admin

### 7. Delete Menu
**DELETE** `/menus/:id`

**Access:** Admin

---

## 🔐 Access Management Endpoints

### 1. Get All Access
**GET** `/access?page=1&limit=10&id_roles=1&id_menus=2`

**Access:** Admin, Manager

### 2. Get Access by ID
**GET** `/access/:id`

**Access:** Admin, Manager

### 3. Assign Menu Access to Role
**POST** `/access`

**Access:** Admin

**Request Body:**
```json
{
  "id_roles": 1,
  "id_menus": 3,
  "can_view": true,
  "can_create": true,
  "can_update": true,
  "can_delete": true
}
```

### 4. Bulk Assign Access
**POST** `/access/bulk`

**Access:** Admin

**Request Body:**
```json
{
  "id_roles": 2,
  "menus": [
    {
      "id_menus": 1,
      "can_view": true,
      "can_create": false,
      "can_update": false,
      "can_delete": false
    },
    {
      "id_menus": 2,
      "can_view": true,
      "can_create": true,
      "can_update": true,
      "can_delete": false
    }
  ]
}
```

### 5. Update Access
**PUT** `/access/:id`

**Access:** Admin

### 6. Delete Access
**DELETE** `/access/:id`

**Access:** Admin

### 7. Remove All Role Access
**DELETE** `/access/role/:roleId`

**Access:** Admin

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Required roles: Admin"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing dengan cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Get All Users (dengan token)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGc..."
```

### Create Menu
```bash
curl -X POST http://localhost:3000/api/menus \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "menu_name": "Reports",
    "menu_url": "/reports",
    "menu_icon": "chart",
    "order_number": 3
  }'
```