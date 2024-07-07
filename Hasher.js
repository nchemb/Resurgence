const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const saltRounds = 10;

// MongoDB connection (update the URI and options as needed)
const mongoURI = 'mongodb+srv://chembur1:Bearzfan509@cluster0.rmjstry.mongodb.net/MainDB?retryWrites=true&w=majority'
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define your User Schema (make sure it matches the schema in your project)
const userSchema = new mongoose.Schema({
  username: String,
  password: String, // Hashed password
  role: String
});

const User = mongoose.model('User', userSchema);

// Function to hash a password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// Function to update user password in the database
const updatePassword = async (username, newPassword) => {
  const hashedPassword = await hashPassword(newPassword);
  await User.updateOne({ username: username }, { $set: { password: hashedPassword } });
  console.log(`Password updated for user: ${username}`);
};

// Example usage - Replace 'your_username' and 'new_password' with actual values
updatePassword('patient', 'patient').then(() => {
  mongoose.disconnect(); // Close the connection after updating
});
