const db = require('../config/db.config');
const bcrypt = require('bcryptjs');


exports.updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  // Validate input fields
  if (!email || !newPassword) {
    return res.status(400).send({ message: 'Email and new password are required.' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send({ message: 'Invalid email format.' });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const query = 'UPDATE user_table SET password = ? WHERE email = ?';

    const [result] = await db.promise().query(query, [hashedPassword, email]);

    if (result.affectedRows > 0) {
      return res.status(200).send({ message: 'Password updated successfully.' });
    } else {
      return res.status(404).send({ message: 'User not found.' });
    }
  } catch (err) {
    console.error('Error updating password:', err.message);
    return res.status(500).send({ message: 'Internal server error.' });
  }
};

exports.register = async (req, res) => {
  const { first_name, last_name, email, phone_number, password } = req.body;
  const firstName = first_name;
  const lastName = last_name;
  const phoneNumber = phone_number;

  try {
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({ message: 'Invalid email format' });
    }

    // Check for required fields
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).send({ message: 'All fields are required' });
    }

    // Check if the email is already registered
    const [rows] = await db.promise().query(
      'SELECT * FROM user_table WHERE email = ?',
      [email]
    );
    if (rows.length > 0) {
      return res.status(400).send({ message: 'Email already registered' });
    }

    // Hash password before storing in DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    db.query(
      'INSERT INTO user_table (firstName, lastName, email, phoneNumber, password, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, phoneNumber, hashedPassword, 0],
      (error, results) => {
        if (error) {
          console.error('Error inserting user:', error.message);
          return res.status(500).send({ message: 'Error registering user', error });
        }
      }
    );

    res.status(200).send({
      message: 'User registered successfully. Verification Pending'
    });
  } catch (err) {
    console.error('Error in register function:', err.message);
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).send({ message: 'Email and password are required' });
    }

    // Query the database for the user by email
    const [results] = await db.promise().query(
      'SELECT * FROM user_table WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    // Check if the user account is verified
    if (user.isVerified === 0) {
      return res.status(403).send({ message: 'Account not verified. Please verify your account first.' });
    }

    // Respond with user data excluding sensitive fields like password
    const { password: _, ...userWithoutPassword } = user; // Exclude the password from the response

    res.status(200).send({
      status: 'success',
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).send({ message: 'Internal server error', error: error.message });
  }
};

exports.verify = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({ message: 'Invalid email format' });
    }

    // Check if the user exists with this email
    const [rows] = await db.promise().query(
      'SELECT * FROM user_table WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Update the isVerified field to 1 (true)
    await db.promise().query(
      'UPDATE user_table SET isVerified = ? WHERE email = ?',
      [1, email]
    );

    res.status(200).send({
      message: 'User verification status updated successfully',
    });
  } catch (err) {
    console.error('Error in updateVerificationStatus function:', err.message);
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
};