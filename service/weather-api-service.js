require('dotenv').config();
const axios = require('axios');

exports.getByZipCode = async options => {
    let reqParams = {
        method: 'GET',
        accept: '*/*',
        url: `http://api.weatherapi.com/v1/current.json`,
        params: {
            key: process.env.WEATHER_API_KEY,
            q: options
        }
    }
    const data = await axios.request(reqParams).then(res => {
        const data = res.data,
        {current, location} = data,
            stuffWeCareAbout = {
                location: {
                    place: location.name,
                    state: location.region
                },
                humidity: current.humidity,
                feels_like: current.feelslike_f,
                actual_temp: current.temp_f,
                condition: {
                    type: current.condition.text,
                    icon: current.condition.icon
                },
                uv_ind: current.uv
            }
        return stuffWeCareAbout;
    }).catch(err => {
        console.warn('------Error in response to weather request-------', err);
    });

    return await data;
}