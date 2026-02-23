import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const createUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // User details - Modify these as needed
        const userData = {
            username: 'John Doe',
            email: 'john.doe@example.com',
            phone: '9876543210',
            password: 'password123', // Will be hashed
            role: 'user',
            location: {
                lat: '17.385044',
                lng: '78.486671'
            },
            status: 'free'
        };

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            console.log('❌ User with this email already exists');
            process.exit(1);
        }

        const existingPhone = await User.findOne({ phone: userData.phone });
        if (existingPhone) {
            console.log('❌ User with this phone number already exists');
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user
        const newUser = new User({
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
            password: hashedPassword,
            role: userData.role,
            location: userData.location,
            status: userData.status
        });

        await newUser.save();

        console.log('✅ User created successfully!');
        console.log('📧 Email:', userData.email);
        console.log('📱 Phone:', userData.phone);
        console.log('🔑 Password:', userData.password);
        console.log('👤 Role:', userData.role);
        console.log('🆔 User ID:', newUser._id);

    } catch (error) {
        console.error('❌ Error creating user:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

createUser();
