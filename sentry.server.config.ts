import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a84265884108f42564fb7d5a7f2012f1@o4510138100023296.ingest.us.sentry.io/4511016165507072",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  // Enable logs to be sent to Sentry
  enableLogs: true,
});
