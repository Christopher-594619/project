// Makes the Android Back button go back one page inside the app.
// Without this, Back closes the app straight away. Does nothing in a
// normal web browser, so the website is unaffected.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

// Pages where Back should leave the app instead of going further back
const HOME_PAGES = ['/', '/login', '/dashboard/student', '/dashboard/tutor', '/dashboard/admin'];

export function setupAndroidBackButton() {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener('backButton', ({ canGoBack }) => {
    const path = window.location.pathname;
    if (canGoBack && !HOME_PAGES.includes(path)) {
      window.history.back();
    } else {
      // Like other Android apps: send the app to the background rather than
      // killing it, so reopening is instant and the user stays logged in.
      App.minimizeApp();
    }
  });
}
