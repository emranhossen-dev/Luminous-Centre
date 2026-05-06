# Role-Based Access Control (RBAC) System

## Role Definitions

### 1. **Admin** 🛡️
**Purpose**: System administrator with complete control
**Permissions**: `["*"]` (Full access)

**Can do**:
- Manage all users (create, update, delete, activate/deactivate)
- Manage all courses (full CRUD)
- Manage system settings
- View all reports and analytics
- Assign roles to users
- Manage batches and schedules
- Access all system logs
- Override any restrictions

**Cannot be restricted**: Has unlimited access

---

### 2. **Employee** 👨‍💼
**Purpose**: Course management and operations
**Permissions**: 
```json
[
  "courses.create",
  "courses.read", 
  "courses.update",
  "courses.delete",
  "students.read"
]
```

**Can do**:
- Create, edit, update, delete courses
- Manage course content (modules, lessons, projects)
- View student information (read-only)
- Manage course schedules and batches
- Generate course reports
- Upload course materials

**Cannot do**:
- Delete or manage other users
- Change user roles
- Access system settings
- View sensitive user data beyond course-related info

---

### 3. **Mentor** 👨‍🏫
**Purpose**: Teaching and student guidance
**Permissions**:
```json
[
  "courses.read",
  "students.create", 
  "students.read",
  "students.update",
  "grades.create",
  "grades.read", 
  "grades.update"
]
```

**Can do**:
- View assigned courses
- Manage enrolled students
- Create and grade assignments
- Track student progress
- Provide feedback and guidance
- Generate student reports
- Manage class schedules (for assigned batches)

**Cannot do**:
- Delete or create courses
- Manage other mentors/employees
- Access system administration
- View students not assigned to them

---

### 4. **Student** 🎓
**Purpose**: Learning and course participation
**Permissions**:
```json
[
  "courses.read",
  "enrollments.create",
  "enrollments.read", 
  "progress.read"
]
```

**Can do**:
- View available courses
- Enroll in courses
- Access enrolled course content
- Track personal progress
- Submit assignments
- View grades and feedback
- Download certificates

**Cannot do**:
- Create or manage courses
- Access other students' data
- Modify system settings
- Access admin/employee panels

---

## Permission Matrix

| Action | Admin | Employee | Mentor | Student |
|--------|--------|----------|--------|---------|
| View All Courses | ✅ | ✅ | ✅ (assigned) | ✅ |
| Create Course | ✅ | ✅ | ❌ | ❌ |
| Edit Course | ✅ | ✅ | ❌ | ❌ |
| Delete Course | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| View Students | ✅ | ✅ (all) | ✅ (assigned) | ❌ |
| Grade Students | ✅ | ❌ | ✅ (assigned) | ❌ |
| View Reports | ✅ | ✅ (course) | ✅ (student) | ✅ (personal) |
| System Settings | ✅ | ❌ | ❌ | ❌ |

---

## Implementation Workflow

### Phase 1: Database Setup
1. Create PostgreSQL database
2. Run schema.sql to create tables
3. Set up indexes and triggers
4. Insert initial data

### Phase 2: Authentication System
1. JWT token-based authentication
2. Role-based middleware
3. Password hashing with bcrypt
4. Session management

### Phase 3: API Development
1. User management APIs
2. Course management APIs  
3. Enrollment APIs
4. Progress tracking APIs

### Phase 4: Frontend Panels
1. Admin dashboard
2. Employee course panel
3. Mentor teaching panel
4. Student learning portal

---

## Security Considerations

1. **Password Security**: Use bcrypt with salt rounds
2. **JWT Tokens**: Short expiration with refresh tokens
3. **Role Validation**: Server-side permission checks
4. **Input Validation**: Sanitize all inputs
5. **Rate Limiting**: Prevent brute force attacks
6. **Audit Logging**: Track all user actions

---

## Database Relationships

```
Users (1) → (N) Courses (created_by)
Users (1) → (N) Batches (instructor_id)
Users (1) → (N) Enrollments (student_id)
Courses (1) → (N) Modules
Modules (1) → (N) Lessons
Courses (1) → (N) Projects
Courses (1) → (N) Batches
Batches (1) → (N) Batch Enrollments
```
