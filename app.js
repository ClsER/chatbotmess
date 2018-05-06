const login = require("facebook-chat-api");
const fs = require("fs");
var api = require('./scr/assets/const.js').api;
var request = require('request');
var uriencode = require('urlencode');
let database = JSON.parse(fs.readFileSync("/root/botmess/chatbotmess/pp/score.json", "utf8"));
var wikicustomsearch = api.GOOGLESEARCH;
var func = require('./scr/assets/func.js');
var Suspend = {};
var playerAPI = api.PLAYERAPI;
var wiki = api.WIKIVI;

login({
    email: "minhtuanit9910@gmail.com",
    password: "123123..0.1"
}, (err, api) => {
    if (err) return console.error(err); // check error!
    api.setOptions({
        forceLogin: true,
        selfListen: false,
        listenEvents: true,
        logLevel: 'warn'
    });
    var stopListening = api.listen((err, event) => {
        if (err) return console.log(err);
        switch (event.type) {
            case "message":
                api.getUserInfo(event.senderID, (err, ret) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    name = '@' + ret[event.senderID].name;
                    func.log(event.threadID + ': ' + event.body);
                    if (event.body.indexOf("$pause") == 0) {
                        if (event.senderID == "100008101391737") {
                            func.log("Suspend at " + event.threadID + " by admin", -1);
                            Suspend[event.threadID] = true;
                            return api.sendMessage("Đã tạm ngưng hoạt động.", event.threadID);
                        }
                        return;
                    }
                    if (Suspend.hasOwnProperty(event.threadID)) {
                        if (event.senderID == "100008101391737") {
                            if (event.body.indexOf("$continue") == 0) {
                                func.log("Started at " + event.threadID + " by admin", 0);
                                delete Suspend[event.threadID];
                                return api.sendMessage("Đã hoạt động trở lại!", event.threadID);
                            }
                        }
                        return;
                    }
                    // Mark As Read Inbox!
                    api.markAsRead(event.threadID, (err) => {
                        if (err) return console.log(err);
                    });
                    //////////////POINT-SYSTEM ":XXXXX:"///////////////////
                    if (!database[event.senderID]) database[event.senderID] = {
                        points: 0,
                        money: 0,
                        level: 0
                    };
                    let u = database[event.senderID];
                    let curLevel = Math.floor(0.12 * Math.sqrt(u.points));
                    if (event.isGroup) {
                        u.points = u.points + 0.25;
                    }
                    if (curLevel > u.level) {
                        u.level = curLevel;
                        api.sendMessage({
                            body: name + ` đã tăng level lên *${curLevel}*!`,
                            attachment: fs.createReadStream(__dirname + `/scr/images/levelup.png`),
                            mentions: [{
                                tag: name,
                                id: event.senderID,
                            }],
                        }, event.senderID);
                        return;
                    }
                    if (event.body === "$me") {
                        api.sendMessage({
                            body: name + `\n- *LEVEL* : ${u.level}\n- *ĐIỂM* : ${u.points}\n`,
                            mentions: [{
                                tag: name,
                                id: event.senderID,
                            }],
                        }, event.threadID);
                    }
                    fs.writeFile("/root/botmess/chatbotmess/pp/score.json", JSON.stringify(database), (err) => {
                        if (err) console.error(err);
                    });
                    if (event.body.indexOf('$kick') == 0) {
                        if (event.senderID === "100008101391737" || event.senderID === "100007354651779") {
                            for (var i = 0; i < Object.keys(event.mentions).length; i++) {
                                api.removeUserFromGroup(Object.keys(event.mentions)[i], event.threadID);
                                return;
                            }
                        } // else { api.sendMessage("Bạn không có quyền sử dụng câu lệnh này!", event.threadID) }
                        return;
                    }
                    if (event.body == '$crash') {
                        if (event.senderID === "100008101391737") {
                            api.sendMessage({ body: "Crashed By HoaVoSac", mentions: [{ tag: '0x80f700', id: event.senderID }] }, event.threadID);
                            return;
                        }
                    }
                    if (event.body === "$rules") {
                        api.sendMessage("Đang xây dựng!", event.threadID)
                    }
                    if (event.body === "$help") {
                        api.sendMessage("1/ $me: để xem level! \n2/ $getid: để lấy id profile \n3/ $rules: để xem nội quy nhóm!", event.threadID)
                    }
                    if (event.body.indexOf("$getlink") == 0) {
                        //playerAPI
                        if (event.senderID === "100008101391737" || event.senderID === "100007354651779") {
                            var query = (event.body.substring(8, event.body.length)).trim();
                            request(playerAPI + uriencode(query), function (err, res, body) {
                                var results = JSON.parse(body);
                                if (results.status === "0") {
                                    api.sendMessage("Không Tìm được huhu :'(", event.threadID);
                                    return;
                                } else {
                                    var sources = results.data[0].sources[0].file;
                                    api.sendMessage('``` \n ' + sources + ' ```', event.threadID);
                                }
                            });
                        }
                        return;
                    }
                    if (event.body === "$listfilm") {
                        if (event.senderID === "100008101391737" || event.senderID === "100007354651779") {
                            api.sendMessage("Hỗ trợ get link các site sau!\n 1/ anime47.com \n2/ animehay.tv\n3/ banhtv.com\n4/ bilutv.com\n5/ cliphunter.com\n6/ chillax.ws\n7/ drive.google.com\n8/ facebook.com\n9/ hentaiz.net\n10/ heodam.tv\n11/ mp4upload.com\n12/ onedrive.live.com\n13/ oppatv.com\n14/ phim14.net\n15/ 1drv.ms\n16/ phimbathu.com\n17/ photos.google.com\n18/ xhamster.com\n19/ youtube.com ")
                        }
                    }
                    if (event.body.indexOf("$wiki") === 0){
                        var query = (event.body.substring(5, event.body.length)).trim();
                        request(wiki + uriencode(query), function(err, res, body){
                            var results = JSON.parse(body);
                            if(event.senderID === "100008101391737"){
                                if (results.title === "Not found."){
                                    api.sendMessage("Nội dung không tồn tại trên wiki!", event.threadID);
                                }else{
                                    api.sendMessage("Nội dung bạn cần tìm là! \n ``` \n" + results.extract + "```", event.threadID );
                                }
                            }else{
                                if (results.title === "Not found."){
                                    api.sendMessage("Nội dung không tồn tại trên wiki!", event.senderID);
                                }else{
                                    api.sendMessage("Nội dung tìm kiếm đã được gửi vào tin nhắn ban!! @" + ret[event.senderID].name, event.threadID );
                                    api.sendMessage("Nội dung bạn cần tìm là! \n ``` \n" + results.extract + "```", event.senderID );
                                }
                            }
                        })
                    }
                    // END CODE 
                })
        }
    })
})



