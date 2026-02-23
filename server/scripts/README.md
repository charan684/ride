# Database Scripts

This folder contains scripts to manually create users, admins, and drivers in the MongoDB database.

## Available Scripts

### 1. Create User
Creates a regular user (passenger) account.

```bash
node scripts/createUser.js
```

### 2. Create Admin
Creates an admin account with administrative privileges.

```bash
node scripts/createAdmin.js
```

### 3. Create Driver
Creates a driver (rider) account.

```bash
node scripts/createDriver.js
```

## How to Use

1. **Edit the script** you want to run and modify the user details:
   - `username` - Full name
   - `email` - Email address (must be unique)
   - `phone` - Phone number (must be unique)
   - `password` - Plain text password (will be hashed automatically)
   - `location` - Default location coordinates

2. **Make sure your `.env` file** has the correct `MONGO_URL` configured.

3. **Run the script** from the server directory:
   ```bash
   node scripts/createUser.js
   # or
   node scripts/createAdmin.js
   # or
   node scripts/createDriver.js
   ```

## Default Credentials

### User (createUser.js)
- Email: `john.doe@example.com`
- Phone: `9876543210`
- Password: `password123`
- Role: `user`

### Admin (createAdmin.js)
- Email: `admin@rideapp.com`
- Phone: `9999999999`
- Password: `admin123`
- Role: `admin`

### Driver (createDriver.js)
- Email: `driver@example.com`
- Phone: `8888888888`
- Password: `driver123`
- Role: `rider`

## Important Notes

- ⚠️ **Change the default credentials** before running in production
- ✅ Passwords are automatically hashed using bcrypt
- ✅ Scripts check for duplicate email/phone before creating
- ✅ Scripts automatically close database connection after execution
- 📝 The plain text password is displayed in the console for your reference

## Example Output

```
✅ Connected to MongoDB
✅ Admin created successfully!
📧 Email: admin@rideapp.com
📱 Phone: 9999999999
🔑 Password: admin123
👤 Role: admin
🆔 Admin ID: 65f1a2b3c4d5e6f7g8h9i0j1
🔌 Database connection closed
```
