// Minimal service worker whose only job is push notifications — Stryder
// isn't an offline-first app (it needs the network for shared sync anyway),
// so this deliberately does NOT cache pages or intercept fetch requests.
// See lib/push-client.ts for how this gets registered, and lib/push-server.ts
// for what sends the pushes this responds to.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "Stryder", body: "New update.", url: "/today" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Non-JSON push payload — fall back to the default above.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon.png",
      badge: "/icon.png",
      data: { url: payload.url || "/today" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/today", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === targetUrl && "focus" in client) return client.focus();
      }
      // No matching tab open — try focusing any Stryder tab, else open a new one.
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) return client.navigate(targetUrl);
          return;
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
