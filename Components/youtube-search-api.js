require('dotenv').config();
const axios = require('axios');

const convert_id_to_url = id => `https://www.youtube.com/watch?v=${id}`;

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
            url: convert_id_to_url(videoId)
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
            q: searchStr
        }
    }
    const videoId = await axios.request(reqParams).then( resp => {
        let songData = resp.data.items[0],
            songId = songData.id.videoId;
        return convert_id_to_url(songId)
    }).catch(err => {
        console.warn('ERROR', err);
    });
    return videoId;
}

exports.listRequest = listRequest;
exports.videoRequest = videoRequest;