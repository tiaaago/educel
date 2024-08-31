import push from 'web-push';

export const sendNotification = (sub, payload) => {
    try {
        push.setVapidDetails('mailto:web-push-book@gauntface.com', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE)
        push.setGCMAPIKey('AAAATeqHczM:APA91bH57UlBm4QXK1OMrxw1N2aJ1kA1zrxZLWA91fS2OfkjPdA2-dWkovhv5vVxvwA4BOrhmDs0AbBBZAbvlYx4RgOAnDWhMyQCb1by5JAx3QcF8V5Av8kOJbwNNF6wK1szmOroj_UG')
        return push.sendNotification(sub, JSON.stringify(payload))
    } catch (err) {
        throw err;
    }
}