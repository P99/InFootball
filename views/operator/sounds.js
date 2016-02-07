// init bunch of sounds
ion.sound({
    sounds: [{
        name: "badresponse"
    }, {
        name: "goodresponse"
    }, {
        name: "notification"
    }, {
        name: "skipquery"
    }],

    // main config
    path: "assets/sounds/",
    preload: true,
    multiplay: false,
    volume: 0.5
});
