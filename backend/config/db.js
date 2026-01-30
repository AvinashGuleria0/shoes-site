const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Fix for the phone unique index issue (null duplicates)
    try {
        const User = mongoose.model('User');
        await User.collection.dropIndex('phone_1');
        console.log('Successfully dropped phone_1 index to fix duplicate nulls');
    } catch (err) {
        // Index might not exist or already be dropped, ignore
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
