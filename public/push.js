const webpush = require('web-push')

var vapidKeys = {
    publicKey: 'BBZ7nYgAKjkqFCblUz1gusqGGfUrkSkKb-3VHNjbsBTRNuBLxg_WmepvHFDWV4-IPz1YoWD0w3a40vo6-FpW31A',
    privateKey: 'sasrrBIO0ONQL0uxEn0gT73zOyMEABPgN5_PDFcDMIk'
}

webpush.setGCMAPIKey('334647227187')
webpush.setVapidDetails('mailto:web-push-book@gauntface.com', vapidKeys.publicKey, vapidKeys.privateKey)

webpush.sendNotification({"endpoint":"https://fcm.googleapis.com/fcm/send/fuAWMZf7guE:APA91bGsbJn4022XWEd0X4Vwv6YHKHQEu96jEH69VVhaAoHB4wNwPmmOnlaMth-lGPHBo-hD-LjVW0og4HcTFhhs7YneYjY9kG-Vda2ogDFPhH0bYkL2X0PkjpN7IXKzANw2bFS--e3l","expirationTime":null,"keys":{"p256dh":"BJuWlZGoDIi28-Wzyn9J2sdfkMtab1oirOK7zVbTTg69KfWrLE7sRXGD3AWordVEj0GK8p2F9ofWH-AmxSPL5f8","auth":"vgykaTrBohqbhBWjGXsGAQ"}})