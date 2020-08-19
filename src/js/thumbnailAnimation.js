import { gsap } from 'gsap';
import { EventEmitter } from 'events';
import { calcWinsize } from './utils';

// Calculate the viewport size
let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

export default class ThumbnailAnimation extends EventEmitter {
    constructor(el) {
        super();
        // Cache some DOM elements
        this.getDOMElems();
        this.config = {
            // True if not yet expanded
            isThumbView: true
        };
        // Calculate the necessary transforms to adjust the middle image size and position
        this.layout();
        this.initEvents();
    }
    getDOMElems() {
        this.DOM = {contentEl : document.querySelector('.content')};
        this.DOM.intro = this.DOM.contentEl.querySelector('.content__intro');
        this.DOM.introImg = this.DOM.contentEl.querySelector('.content__intro-img');
        this.DOM.introImgWrap = this.DOM.contentEl.querySelector('.content__intro-imgWrap');
        this.DOM.meta = this.DOM.contentEl.querySelector('.content__meta');
        this.DOM.metaTitle = this.DOM.contentEl.querySelector('.content__meta-title');
        this.DOM.titleBlock = this.DOM.contentEl.querySelector('.content__title > .anim-block');
        this.DOM.subtitleBlock = this.DOM.contentEl.querySelector('.content__subtitle > .anim-block');
    }
    layout() {
        // Hide main title and subtitle
        gsap.set(this.DOM.titleBlock, {y: '100%'});
        gsap.set(this.DOM.subtitleBlock, {y: '100%'});

        const bodyComputedStyle = getComputedStyle(document.body);

        // Get the image settings from the variables set in the stylesheet
        let imageSettings = {
            imageWidthStart: winsize.width,
            imageHeightStart: parseFloat(bodyComputedStyle.getPropertyValue('--image-height-start')),
            imageWidthEnd: parseFloat(bodyComputedStyle.getPropertyValue('--image-width-end')),
            imageHeightEnd: parseFloat(bodyComputedStyle.getPropertyValue('--image-height-end')),
            metaOffset: parseFloat(bodyComputedStyle.getPropertyValue('--meta-offset'))
        };

        // Set the scale value from the initial and the target dimensions
        // and move the intro image wrap to the center of the screen.
        // We want to set the full width image to be the size of a thumbnail.
        // For that we scale down the outer wrapper and set a counter scale to
        // the inner image, followed by another scale so that the inner image
        // becomes the size of the thumbnail, too.
        let introRect = this.DOM.intro.getBoundingClientRect();
        let introTransform = {
            scaleX: imageSettings.imageWidthEnd / imageSettings.imageWidthStart,
            scaleY: imageSettings.imageHeightEnd / imageSettings.imageHeightStart,
            y: (winsize.height/2 - introRect.top) - introRect.height/2
        };
        gsap.set(this.DOM.intro, {
            y: introTransform.y,
            scaleX: introTransform.scaleX,
            scaleY: introTransform.scaleY
        });

        // Apply the counter scale and again the target dimension scale to the inner image
        gsap.set(this.DOM.introImg, {
            scaleX: 1/introTransform.scaleX * imageSettings.imageWidthEnd / this.DOM.introImg.clientWidth,
            scaleY: 1/introTransform.scaleY * imageSettings.imageHeightEnd / this.DOM.introImg.clientHeight
        });

        // Calculate new sizes/positions (after transform)
        introRect = this.DOM.intro.getBoundingClientRect();
        // content__meta size/position
        const metaRect = this.DOM.meta.getBoundingClientRect();
        let metaTransform = {
            x: introRect.left - metaRect.left,
            y: introRect.top - metaRect.top
        };
        gsap.set(this.DOM.meta, {
            x: metaTransform.x,
            y: metaTransform.y - imageSettings.metaOffset
        });

        // Show the meta title element
        gsap.set(this.DOM.metaTitle, {opacity: 1});
    }
    initEvents() {
        this.onClickIntroFn = () => this.onClickIntro();
        this.onMouseenterIntroFn = () => this.onMouseenterIntro();
        this.onMouseleaveIntroFn = () => this.onMouseleaveIntro();
        this.onResizeFn = () => this.onResize();
        this.DOM.intro.addEventListener('click', this.onClickIntroFn);
        this.DOM.intro.addEventListener('mouseenter', this.onMouseenterIntroFn);
        this.DOM.intro.addEventListener('mouseleave', this.onMouseleaveIntroFn);
        window.addEventListener('resize', this.onResizeFn);
    }
    onResize() {
        if ( !this.config.isThumbView ) return false;
        // Reset transforms
        this.DOM.intro.style.transform = 'none';
        this.DOM.introImg.style.transform ='none';
        this.DOM.meta.style.transform = 'none';
        // Re layout
        this.layout();
    }
    onClickIntro() {
        // For demo purposes, remove the click event once clicked
        // We are just showcasing the effect
        // In a real case scenario there would be a back to slideshow button and the click event wouldn't need to be removed
        this.DOM.intro.removeEventListener('click', this.onClickIntroFn);
        this.config.isThumbView = false;
        
        // Animate all the elements (image, title, subtitle, meta)
        gsap
        .timeline({
            onStart: () => this.emit('start'),
            onComplete: () => this.emit('end')
        })
        .to(this.DOM.intro, {
            duration: 1,
            ease: 'expo.inOut',
            y: 0,
            scaleX: 1,
            scaleY: 1,
            onComplete: () => {
                this.DOM.contentEl.classList.add('content--scroll');
                this.emit('scrollready');
            }
        })
        .to(this.DOM.introImg, {
            duration: 1,
            ease: 'expo.inOut',
            scaleX: 1,
            scaleY: 1
        }, 0)
        .to(this.DOM.introImgWrap, {
            duration: 1,
            ease: 'expo.inOut',
            scale: 1
        }, 0)
        .to(this.DOM.metaTitle, {
            duration: 0.6,
            ease: 'expo.inOut',
            opacity: 0
        }, 0)
        .to(this.DOM.meta, {
            duration: 1,
            ease: 'expo.inOut',
            x: 0,
            y: 0
        }, 0)
        .to([this.DOM.titleBlock, this.DOM.subtitleBlock], {
            duration: 0.8,
            ease: 'expo',
            startAt: {rotation: 3},
            y: '0%',
            rotation: 0,
            stagger: 0.3
        }, 0.7);
    }
    // On mouseenter animate the scale of the intro image wrapper
    // This wrapper is necessary so we don't have to play with the image itself (which has already a transform applied)
    onMouseenterIntro() {
        if ( !this.config.isThumbView ) return false;
        this.emit('enter');
        
        gsap
        .to(this.DOM.introImgWrap, {
            duration: 1,
            ease: 'expo',
            scale: 1.2
        });
    }
    // On mouseleave reset/animate the scale of the intro image wrapper
    onMouseleaveIntro() {
        if ( !this.config.isThumbView ) return false;
        this.emit('leave');

        gsap
        .to(this.DOM.introImgWrap, {
            duration: 1,
            ease: 'expo',
            scale: 1
        });
    }
}