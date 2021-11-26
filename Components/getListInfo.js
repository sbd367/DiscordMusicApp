require('dotenv').config();
const axios = require('axios');

const youTubeReq = async playlistInfo => {
    const reqPar = {
        method: 'GET',
        accept: '*/*',
        url: `https://www.googleapis.com/youtube/v3/playlistItems`,
        params: {
            key: process.env.YOUTUBE_API_KEY,
            part: 'contentDetails',
            playlistId: playlistInfo.listId,
            maxResults: '10'
        }
    };

    const data = await axios.request(reqPar).then(res => {
        let data = res.data;
        return data;
    }), details = data.items.map((arrItem, ind) => {
        const videoId = arrItem.contentDetails.videoId
        return {
            title: `playlist song #${ind}`,
            url: `https://www.youtube.com/watch?v=${videoId}`
        }
    }); 

    return details;
};

exports.youTubeReq = youTubeReq;