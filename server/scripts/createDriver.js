import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const createDriver = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Driver details - Modify these as needed
        const driverData = {
            username: 'Driver Name',
            email: 'driver1@example.com',
            phone: '7075519982',
            password: 'driver123', // Will be hashed
            role: 'rider',
            location: {
                lat: '17.444710699380163',
                lng: '78.38515224449033'
            },
            status: 'free'
        };

        // Check if driver already exists
        const existingUser = await User.findOne({ email: driverData.email });
        if (existingUser) {
            console.log('❌ Driver with this email already exists');
            process.exit(1);
        }

        const existingPhone = await User.findOne({ phone: driverData.phone });
        if (existingPhone) {
            console.log('❌ Driver with this phone number already exists');
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(driverData.password, salt);

        // Create new driver
        const newDriver = new User({
            username: driverData.username,
            email: driverData.email,
            phone: driverData.phone,
            password: hashedPassword,
            role: driverData.role,
            location: driverData.location,
            status: driverData.status
        });

        await newDriver.save();

        console.log('✅ Driver created successfully!');
        console.log('📧 Email:', driverData.email);
        console.log('📱 Phone:', driverData.phone);
        console.log('🔑 Password:', driverData.password);
        console.log('👤 Role:', driverData.role);
        console.log('🆔 Driver ID:', newDriver._id);

    } catch (error) {
        console.error('❌ Error creating driver:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

createDriver();
