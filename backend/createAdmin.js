const dotenv = require('dotenv');
const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

dotenv.config();

const createAdmin = async () => {
  try {
    const adminEmail = 'admin@mail.com';
    const adminPassword = 'admin'; // Change this!

    // Wait for the connection just to be sure, Prisma auto-connects
    const userExists = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (userExists) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'SUPERADMIN' }
      });
      console.log('User updated to Super Admin in Postgres');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'SUPERADMIN'
        }
      });
      console.log('Super Admin user created successfully in Postgres!');
    }

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();