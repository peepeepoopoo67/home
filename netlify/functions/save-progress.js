exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Your unique Google Web App URL
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwH1UfUPeMKBhvvRz0euTGpsUCaXpHqtsmQeRVZyJgp0WWJwCcZdifbQX0-820so30ORw/exec";

  try {
    // We use the native fetch (no require needed) and tell it to follow Google's redirects
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body, 
      redirect: "follow" // <-- THIS IS CRITICAL FOR GOOGLE SHEETS
    });
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: "Progress logged to Google Sheets" }) 
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};