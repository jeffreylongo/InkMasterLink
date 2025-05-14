const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);
    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid email" })
      };
    }

    const filePath = path.resolve(__dirname, "emails.json");
    const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];

    if (!existing.includes(email)) {
      existing.push(email);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email saved" })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal error", detail: e.message })
    };
  }
};
