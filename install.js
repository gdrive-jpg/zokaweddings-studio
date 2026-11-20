const installGuide = document.getElementById('install-guide');
const installButton = document.getElementById('install-button');
let installPrompt;

if (navigator.standalone) {
  installGuide.hidden = true;
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  const prompt = installPrompt;
  if (!prompt) return;

  installPrompt = undefined;
  installButton.hidden = true;
  try {
    await prompt.prompt();
  } catch {
    // The guide remains available if the browser declines the native prompt.
  }
});

window.addEventListener('appinstalled', () => {
  installPrompt = undefined;
  installGuide.hidden = true;
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(error => {
    console.warn('Offline support could not be enabled.', error);
  });
}
