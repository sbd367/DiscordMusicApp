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
            part: 'snippet',
            playlistId: playlistInfo.listId,
            maxResults: 10,
            snippet: true
        }
    };

    const data = await axios.request(reqPar).then(res => {
        let data = res.data;
        return data;
    }).catch(err => {
        console.warn('------Error in response to playlist request-------', err);
        return interaction.reply({content: 'there was an issue with your YouTube request...\n I\'d sugest checking your quota', ephemoral: true})
    });

    const details = data.items.map((arrItem, ind) => {
        const {snippet} = arrItem;
        return {
            title: arrItem.snippet.title,
            thumbnail: arrItem.snippet.thumbnails.default,
            url: convert_id_to_url(snippet.resourceId.videoId)
        }
    }); 

    return details;
};

const mood = async mood => {
    console.log(mood + ' music')
    let reqParams = {
        method: 'GET',
        accept: '*/*',
        url: `https://www.googleapis.com/youtube/v3/search`,
        params: {
            key: process.env.YOUTUBE_API_KEY,
            part: 'id, snippet',
            maxResults: '1',
            type: 'playlist',
            q: mood + ' music'
        }
    }
    const videoId = await axios.request(reqParams).then( resp => {
        let respon = listRequest({listId: resp.data.items[0].id.playlistId}).then(res => {
            return res;
        });
        return respon;
    }).catch(err => {
        console.warn('------Error in response to song request-------', err);
        return interaction.editReply({content: 'there was an issue with your YouTube request...\n I\'d sugest checking your quota', ephemoral: true})
    });
    return videoId;
}


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
            songId = songData.id.videoId,
            songUrl = convert_id_to_url(songId);
        return {title: songData.snippet.title, url: songUrl, thumbnail: songData.snippet.thumbnails.default}
    }).catch(err => {
        console.warn('------Error in response to song request-------', err);
        return interaction.editReply({content: 'there was an issue with your YouTube request...\n I\'d sugest checking your quota', ephemoral: true})
    });
    return videoId;
}

exports.listRequest = listRequest;
exports.videoRequest = videoRequest;
exports.mood = mood;