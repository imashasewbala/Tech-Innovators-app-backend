exports = async function ({ query }) {
  try {
    const mongodb = context.services.get("mongodb-atlas");
    const collection = mongodb.db("project").collection("feedback");

    // Extract the email from the request parameters
    const email = query.email;

    // Check if email is provided
    if (!email) {
      return { error: "Email is missing in the request parameters." };
    }

    // Execute a Find in MongoDB based on the provided token_id
    const findResult = await collection
      .find({ email: email })
      .limit(100)
      .toArray();

    return { data: findResult, success: true };
  } catch (err) {
    console.log("Error occurred while executing find:", err.message);
    return { error: err.message, success: false };
  }
};
