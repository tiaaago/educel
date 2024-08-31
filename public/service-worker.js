self.addEventListener('push', event => {
    let options = event.data?.json() ?? {
        body: 'EduCEL',
        icon: './favicon.ico'
    };

    event.waitUntil(self.registration.showNotification('EduCEL', options))
})

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});