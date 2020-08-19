import { preloadImages, preloadFonts } from './utils';
import { gsap } from 'gsap';
import Cursor from './cursor';
import LocomotiveScroll from 'locomotive-scroll';
import ThumbnailAnimation from './thumbnailAnimation';

// Preload  images and fonts
Promise.all([preloadImages(), preloadFonts('lne5uqk')]).then(() => {
    // Remove loader (loading class)
    document.body.classList.remove('loading');

    // Initialize custom cursor
    const cursor = new Cursor(document.querySelector('.cursor'));

    // Initialize the thumb animation obj
    const thumbAnimation = new ThumbnailAnimation();

    // In a real case scenario the visible thumbs would be part of some sort of slideshow
    // We are just showing how to do the click/expand animation, so for now let's just animate out the two thumbs (left and right) once we click the thumb in the middle.
    const sideThumbs = document.querySelectorAll('.thumbs > .thumb');

    // Mouse entering the middle thumb
    thumbAnimation.on('enter', () => {
        cursor.enter();

        // Slightly move the side thumbs away
        gsap.to(sideThumbs, {
            duration: 1,
            ease: 'expo',
            opacity: 0.8,
            x: i => i ? '25%' : '-25%',
            //scale: 1.1,
            rotateY: i => i ? -15 : 15,
            z: 40
        });
    });

    // Mouse leaving the middle thumb
    thumbAnimation.on('leave', () => {
        cursor.leave();

        // Move the side thumbs back into its original position
        gsap.to(sideThumbs, {
            duration: 1,
            ease: 'expo',
            opacity: 1,
            x: '0%',
            //scale: 1
            rotateY: 0,
            z: 0
        });
    });

    // Middle thumb click and start animation
    thumbAnimation.on('start', () => {
        cursor.leave();

        // Move the side thumbs away
        gsap.to(sideThumbs, {
            duration: 0.8,
            ease: 'power3.inOut',
            opacity: 0,
            x: i => i ? '150%' : '-150%',
            //scale: 0.6
            rotateY: i => i ? -45 : 45,
            z: 200
        });
    });

    // Middle thumb image got fully expanded
    thumbAnimation.on('scrollready', () => {
        // Initialize the Locomotive scroll
        new LocomotiveScroll({
            el: document.querySelector('[data-scroll-container]'),
            smooth: true
        });
    });

    [...document.querySelectorAll('a')].forEach(link => {
        link.addEventListener('mouseenter', () => cursor.enter());
        link.addEventListener('mouseleave', () => cursor.leave());
    });
});