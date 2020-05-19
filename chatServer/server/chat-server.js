const WebSocket = require('ws');
var models = require('./server.js').models;

const ws = new WebSocket.Server({port: 8080});

ws.on('connection', (ws) => {

    function login(email, pass){
        models.User.login({email: email, password: pass}, (err, result) => {
            if(err){
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    error: err
                }));
        }else {
            models.User.findOne({wher: {id: result.userId}, include: 'Profile'}, (err2, user) => {
                if(err2){
                    ws.send(JSON.stringify({
                        type: 'ERROR',
                        error: err
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'LOGGEDIN',
                        data: {
                            session: result,
                            user: user
                        }
                    }))
                }
            })
        }
    },

    ws.on('message', (message) => {
        console.log("Got Message", JSON.parse(message));
        let parsed = JSON.parse(message);
        if(parsed){
            switch(parsed.type){
                case 'SIGNUP':
                    models.User.create(parsed.data, (err, user) => {
                        if(err){
                            ws.send(JSON.stringify({
                                type: 'ERROR',
                                error: err
                            }));
                        } else {
                            models.Profile.create({
                                userId: user.id,
                                name: parsed.data.nae,
                                email: parsed.data.email
                            }, (profileError, profile) => {

                            })
                        }
                    })
                    case 'LOGIN':
                        login(parsed.data.email, parsed.data.password);

                    default:
                        console.log("Nothing to see here!!");
            }
        }
    }));
}})