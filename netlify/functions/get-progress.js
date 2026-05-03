exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const internID = event.queryStringParameters.id;
  // Your Google Web App URL (Same as the save function)
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwH1UfUPeMKBhvvRz0euTGpsUCaXpHqtsmQeRVZyJgp0WWJwCcZdifbQX0-820so30ORw/exec";

  try {
    // We ask Google for data for this specific ID
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?internID=${internID}`, {
      method: "GET",
      redirect: "follow"
    });
    
    const data = await response.json();
    
    return { 
      statusCode: 200, 
      body: JSON.stringify(data) // Returns { completedCount: X }
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};