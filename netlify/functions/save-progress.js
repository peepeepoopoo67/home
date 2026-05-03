exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };
  
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwH1UfUPeMKBhvvRz0euTGpsUCaXpHqtsmQeRVZyJgp0WWJwCcZdifbQX0-820so30ORw/exec"; // Use your actual URL

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body, 
      redirect: "follow" // Forces the bridge to follow Google's redirect
    });
    return { statusCode: 200, body: JSON.stringify({ message: "Sent" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};