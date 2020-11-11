const imagesLoaded = require('imagesloaded');

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

// Gets the mouse position
const getMousePos = e => {
    return { 
        x : e.clientX, 
        y : e.clientY 
    };
};

const calcWinsize = () => {
    return {width: window.innerWidth, height: window.innerHeight};
};

// Preload images
const preloadImages = (selector = 'img') => {
    return new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll(selector), resolve);
    });
};

// Preload images
const preloadFonts = (id) => {
    return new Promise((resolve) => {
        WebFont.load({
            typekit: {
                id: id
            },
            active: resolve
        });
    });
};

export { 
    lerp,
    getMousePos,
    calcWinsize,
    preloadImages, 
    preloadFonts 
};
