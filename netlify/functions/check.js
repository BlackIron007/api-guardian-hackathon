// The modern, robust, production-ready Netlify Function

exports.handler = async function (event, context) {
  // Get the URL from the request.
  const urlToTest = event.queryStringParameters.url;

  // 1. Check if a URL was even provided.
  if (!urlToTest) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Error', message: 'URL parameter is required.' }),
    };
  }

  // 2. The main part: Try to check the URL.
  try {
    // This is the correct, modern way to handle timeouts.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    const startTime = Date.now();
    const response = await fetch(urlToTest, {
      signal: controller.signal, // Connect the timeout to the request
      headers: { 'User-Agent': 'API-Guardian/1.0' },
    });
    clearTimeout(timeoutId); // Important: cancel the timeout if the request succeeds
    const endTime = Date.now();

    // Grab all the headers from the response.
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // 3. Send back a successful response with all our data.
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: response.ok ? 'OK' : 'Error',
        responseTime: endTime - startTime,
        headers: responseHeaders,
      }),
    };

  } catch (error) {
    // 4. If ANYTHING goes wrong (timeout, bad URL, etc.), send back a clear error.
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'Error', message: error.message }),
    };
  }
};