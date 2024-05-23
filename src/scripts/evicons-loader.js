import * as eviconsV1 from './eviconsV1.js';

document.addEventListener('DOMContentLoaded', () => {
    // Dependencies.
    if (typeof CryptoJS === 'undefined') {
        console.error('CryptoJS is not loaded');
        return;
    }

    if (typeof eviconsV1 === 'undefined') {
        console.error('Error rendering evicons.');
        return;
    }

    eviconsV1.renderAllEviconsOnPage();
});