const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const url = event.queryStringParameters.url;

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Error', message: 'URL is required' })
    };
  }

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'API-Guardian/1.0' },
      timeout: 10000 // 10 second timeout
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: response.ok ? 'OK' : 'Error',
        responseTime: responseTime,
        headers: responseHeaders
      })
    };
  } catch (error) {
    console.error('Error checking URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'Error', message: error.message })
    };
  }
};