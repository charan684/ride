import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Admin details - Modify these as needed
        const adminData = {
            username: 'Admin User',
            email: 'admin@rideapp.com',
            phone: '9999999999',
            password: 'admin123', // Will be hashed
            role: 'admin',
            location: {
                lat: '17.385044',
                lng: '78.486671'
            },
            status: 'free'
        };

        // Check if admin already exists
        const existingUser = await User.findOne({ email: adminData.email });
        if (existingUser) {
            console.log('❌ Admin with this email already exists');
            process.exit(1);
        }

        const existingPhone = await User.findOne({ phone: adminData.phone });
        if (existingPhone) {
            console.log('❌ Admin with this phone number already exists');
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Create new admin
        const newAdmin = new User({
            username: adminData.username,
            email: adminData.email,
            phone: adminData.phone,
            password: hashedPassword,
            role: adminData.role,
            location: adminData.location,
            status: adminData.status
        });

        await newAdmin.save();

        console.log('✅ Admin created successfully!');
        console.log('📧 Email:', adminData.email);
        console.log('📱 Phone:', adminData.phone);
        console.log('🔑 Password:', adminData.password);
        console.log('👤 Role:', adminData.role);
        console.log('🆔 Admin ID:', newAdmin._id);

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

createAdmin();
