require('dotenv').config();
const axios = require('axios');

const convert_id_to_url = id => `https://www.youtube.com/watch?v=${id}`;
let reqPar = {
    method: 'GET',
    accept: '*/*',
    params: {
        key: process.env.YOUTUBE_API_KEY,
        part: 'snippet'
    }
};

exports.listRequest = async playlistInfo => {
    let {params} = reqPar,
        newParams = {
            ...params,
            maxResults: 10,
            playlistId: playlistInfo.listId,
            snippet: true
        };
    reqPar.url = `https://www.googleapis.com/youtube/v3/playlistItems`;
    reqPar.params = newParams;

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

exports.mood = async mood => {
    let {params} = reqPar,
        newParams = {
            ...params,
            maxResults: 1,
            type: 'playlist',
            part: 'id, snippet',
            q: mood + ' music'
        };
    reqPar.url = `https://www.googleapis.com/youtube/v3/search`;
    reqPar.params = newParams;
    
    const videoId = await axios.request(reqPar).then( resp => {
        let respon = listRequest({listId: resp.data.items[0].id.playlistId}).then(res => {
            return res;
        });
        return respon;
    }).catch(err => {
        console.warn('------Error in response to song request-------', err);
        return interaction.editReply({content: 'there was an issue with your YouTube request...\n I\'d sugest checking your quota', ephemoral: true})
    });
    return videoId;
};


exports.videoRequest = async searchStr => {
    let {params} = reqPar,
        newParams = {
            ...params,
            maxResults: 1,
            type: 'video',
            q: searchStr
        };
    reqPar.url = `https://www.googleapis.com/youtube/v3/search`;
    reqPar.params = newParams;
    
    const videoId = await axios.request(reqPar).then( resp => {
        let songData = resp.data.items[0],
            songId = songData.id.videoId,
            songUrl = convert_id_to_url(songId);
        return {title: songData.snippet.title, url: songUrl, thumbnail: songData.snippet.thumbnails.default}
    }).catch(err => {
        console.warn('------Error in response to song request-------', err);
        return interaction.editReply({content: 'there was an issue with your YouTube request...\n I\'d sugest checking your quota', ephemoral: true})
    });
    return videoId;
};