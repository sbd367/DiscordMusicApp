require('dotenv').config();
const axios = require('axios');

exports.getPOTD = async () => {
    let request = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`);
    return request.data;
}