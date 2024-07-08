exports = async function ({ body, headers }, response) {
  try {
    const mongodb = context.services.get("mongodb-atlas");
    const collection = mongodb.db("project").collection("feedback");

    // Parse the JSON data from the request body
    const data = JSON.parse(body.text() || "{}");

    // Validate if required fields are present in the data
    if (!data.email || !data.rating) {
      response.setStatusCode(400);
      response.setBody(JSON.stringify({ error: "Fields do not match" }));
      return;
    }

    // Execute an Insert in MongoDB with the provided data
    const insertResult = await collection.insertOne(data);

    console.log("Feedback Added successfully");
    response.setStatusCode(201);
    response.setBody(JSON.stringify({ success: true }));
  } catch (err) {
    console.error("Error occurred while Feedback:", err.message);
    response.setStatusCode(500);
    response.setBody(JSON.stringify({ error: err.message }));
  }
};
