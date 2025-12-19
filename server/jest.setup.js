// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom')

// Polyfill fetch API (includes Request, Response, Headers)
// This works better with jsdom than undici
require('whatwg-fetch')
