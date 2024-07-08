exports = async function ({ body, headers }, response) {
  try {
    const mongodb = context.services.get("mongodb-atlas");
    const collection = mongodb.db("project").collection("users");

    // Parse the JSON data from the request body
    const data = JSON.parse(body.text() || "{}");

    // Check if the email already exists in the collection
    const existingDocument = await collection.findOne({ email: data.email });
    if (existingDocument) {
      response.setStatusCode(400);
      response.setBody(JSON.stringify({ error: "email already exists" }));
      return;
    }

    // Validate if required fields are present in the data
    if (
      !data.first_name ||
      !data.last_name ||
      !data.email ||
      !data.phone ||
      !data.password
    ) {
      response.setStatusCode(400);
      response.setBody(JSON.stringify({ error: "Fields do not match" }));
      return;
    }

    // Execute an Insert in MongoDB with the provided data
    const insertResult = await collection.insertOne(data);

    console.log("User Registered successfully");
    response.setStatusCode(201);
    response.setBody(JSON.stringify({ success: true }));
  } catch (err) {
    console.error("Error occurred while User Registration:", err.message);
    response.setStatusCode(500);
    response.setBody(JSON.stringify({ error: err.message }));
  }
};
