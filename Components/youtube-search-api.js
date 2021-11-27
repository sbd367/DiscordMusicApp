require('dotenv').config();
const axios = require('axios');

const listRequest = async playlistInfo => {
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

const videoRequest = async searchStr => {
    let reqParams = {
        method: 'GET',
        accept: '*/*',
        url: `https://www.googleapis.com/youtube/v3/search`,
        params: {
            key: process.env.YOUTUBE_API_KEY,
            part: 'id, snippet',
            maxResults: '1',
            type: 'video',
            q: searchStr.join(' ')
        }
    }
    const videoId = await axios.request(reqParams).then( resp => {
        let songData = resp.items[0];
        const obj = {
            title: songData.snippet.title,
            url: songData.id.videoId
        }
        return obj;
    });
    
    return videoId;
}

exports.listRequest = listRequest;
exports.videoRequest = videoRequest;