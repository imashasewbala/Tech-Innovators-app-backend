exports = async function ({ body }, response) {
  try {
    const mongodb = context.services.get("mongodb-atlas");
    const collection = mongodb.db("project").collection("users");

    // Parse the JSON data from the request body
    const data = JSON.parse(body.text());

    // Extract email and password from the request body
    const { email, password } = data;

    // Check if email and password are provided
    if (!email || !password) {
      response.setStatusCode(400);
      response.setBody(
        JSON.stringify({
          error: "Email or password is missing in the request body.",
        })
      );
      return;
    }

    // Execute a Find in MongoDB based on the provided email
    const user = await collection.findOne({ email: email });

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      response.setStatusCode(401); // Unauthorized
      response.setBody(JSON.stringify({ error: "Invalid email or password." }));
      return;
    }

    // Return the user data excluding the password
    const { password: _, ...userData } = user;
    response.setStatusCode(200);
    response.setBody(JSON.stringify({ data: userData, success: true }));
  } catch (err) {
    console.log("Error occurred while executing login:", err.message);
    response.setStatusCode(500);
    response.setBody(JSON.stringify({ error: err.message, success: false }));
  }
};
