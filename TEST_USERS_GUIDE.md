# Test Users & Permission System Guide

## Quick Start

### 1. Create Test Users

Run these commands in the backend directory:

```bash
cd backend
npm run seed:users
npm run setup:permissions
```

This will create three test users with different permission levels and configure their API access.

### 2. Test User Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|------------|
| **Clerk** | clerk@test.com | ClerkTest123! | • Move applications to Waiting<br>• Start Processing applications<br>• Prepare for Principal review |
| **Principal** | principal@test.com | PrincipalTest123! | • Approve enrollments<br>• Reject applications<br>• Final enrollment decisions |
| **Student/Parent** | student@test.com | StudentTest123! | • View-only access<br>• Check application status |

## Testing the Permission System

### Step 1: Start the Application

```bash
# Terminal 1 - Start backend
cd backend
npm run develop

# Terminal 2 - Start frontend
cd frontend
npm start
```

### Step 2: Test as Clerk

1. Login with `clerk@test.com` / `ClerkTest123!`
2. Navigate to student enrollment section
3. You should see:
   - Yellow "Move to Waiting List" button for new enquiries
   - Blue "Start Processing" button for waiting applications
   - NO approve/reject buttons (principal only)

### Step 3: Test as Principal

1. Logout and login with `principal@test.com` / `PrincipalTest123!`
2. Navigate to student enrollment section
3. You should see:
   - Green "Approve Enrollment" button for applications in Processing/Waiting
   - Red "Reject Application" button
   - NO clerk processing buttons

### Step 4: Test as Student/Parent

1. Logout and login with `student@test.com` / `StudentTest123!`
2. Navigate to student enrollment section
3. You should see:
   - Read-only view with status information
   - NO action buttons
   - Message: "You have read-only access"

## Enrollment Workflow

```
[Enquiry] ---(Clerk)---> [Waiting/Processing] ---(Principal)---> [Enrolled/Rejected]
```

1. **Enquiry**: Initial application submitted
2. **Waiting**: Clerk moves application to waiting list
3. **Processing**: Clerk starts processing the application
4. **Enrolled**: Principal approves the application
5. **Rejected**: Principal rejects the application

## Manual User Creation (Alternative)

If the seed script doesn't work, you can create users through Strapi Admin:

1. Access Strapi Admin at `http://localhost:1337/admin`
2. Go to Content Manager → Users
3. Click "Create new entry"
4. Fill in user details and assign appropriate role
5. Save the user

## Creating Custom Roles in Strapi Admin

1. Go to Settings → Users & Permissions → Roles
2. Click "Create new role"
3. Name it "Clerk" or "Principal"
4. Set the type field to "clerk" or "principal"
5. Configure permissions as needed
6. Save the role

## Troubleshooting

### Users not created?
- Make sure Strapi is running: `npm run develop`
- Check console for error messages
- Verify database connection

### Roles not working?
- Check the role type in Strapi admin
- Verify role names match: clerk, principal, authenticated
- Check RoleBasedActions.jsx for role detection logic

### Can't see action buttons?
- Verify user role assignment
- Check enrollment status matches expected workflow
- Open browser console for JavaScript errors

## Testing Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] Test users created successfully
- [ ] Clerk can move to waiting/processing
- [ ] Clerk cannot approve/reject
- [ ] Principal can approve/reject
- [ ] Principal cannot do clerk actions
- [ ] Regular users see read-only view
- [ ] Workflow progresses correctly
- [ ] Role badges display correctly
- [ ] Status updates save properly