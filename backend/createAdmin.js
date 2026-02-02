const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminEmail = 'admin@kicks.com';
    const adminPassword = 'adminpassword123'; // Change this!

    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
      userExists.role = 'superadmin';
      await userExists.save();
      console.log('User updated to Super Admin');
    } else {
      const adminUser = new User({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '1234567890',
        role: 'superadmin'
      });
      // Password hashing is handled in User.js pre-save hook
      await adminUser.save();
      console.log('Super Admin User Created');
    }

    console.log(`\nDefault Super Admin Credentials:\nEmail: ${adminEmail}\nPassword: ${adminPassword}\n`);
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();