document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Content Customization based on UTM / Query Params
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('v') || urlParams.get('utm_video') || urlParams.get('ref');

    // DOM Elements to personalize
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    const heroVideo = document.getElementById('hero-video');
    const videoCaptionTitle = document.getElementById('video-caption-title');
    const badgeContainer = document.getElementById('badge-container');
    const specHighlightImage = document.getElementById('spec-highlight-image');

    // Default configuration (Fallback)
    let config = {
        title: 'Lightest Smart Ring. <span class="gradient-text">Zero Monthly Subscriptions.</span>',
        description: 'Track sleep, recovery, and movement with aircraft-grade titanium. The Red Dot Award-winning design features hypoallergenic inner lining with zero sensor bumps.',
        videoSrc: 'assets/video2.mp4',
        posterSrc: 'assets/frames/v2_03.jpg',
        caption: 'Ultrahuman Ring AIR',
        specHighlightImg: 'assets/frames/v2_15.jpg',
        badges: [
            { text: 'Red Dot Winner', icon: 'award' },
            { text: 'No Subscription', icon: 'check' },
            { text: 'Sizing Kit Included', icon: 'box' }
        ]
    };

    // Video 1 Custom Configuration (Cinematic: Zero Bumps / Comfort / Flow)
    if (videoParam === '1' || videoParam === 'cinematic') {
        config = {
            title: 'Engineered for Flow. <span class="gradient-text">Zero Bumps.</span> Ultimate Comfort.',
            description: 'Crafted with fighter-jet grade titanium and a smooth hypoallergenic resin lining, free of intrusive sensor bumps. Engineered to monitor sleep, restorative sleep, and heart rate drop seamlessly.',
            videoSrc: 'assets/video1.mp4',
            posterSrc: 'assets/frames/v1_03.jpg',
            caption: 'Cinematic Spotlight: Zero-Bump Fluid Comfort',
            specHighlightImg: 'assets/frames/v1_13.jpg',
            badges: [
                { text: 'Zero Bumps', icon: 'sparkles' },
                { text: 'Fighter-Jet Titanium', icon: 'shield' },
                { text: 'Ergonomic Excellence', icon: 'award' }
            ]
        };
    } 
    // Video 2 Custom Configuration (UGC: Sleep, Recovery & No Subscription)
    else if (videoParam === '2' || videoParam === 'ugc') {
        config = {
            title: 'Track Sleep, Recovery & Movement. <span class="gradient-text">Zero Subscriptions.</span>',
            description: 'Ditch monthly fees forever. Monitor sleep cycles, movement, and temperature beautifully. Order today and receive a free physical sizing kit to guarantee a perfect fit.',
            videoSrc: 'assets/video2.mp4',
            posterSrc: 'assets/frames/v2_03.jpg',
            caption: 'UGC Review: Zero Subscription Health Tracker',
            specHighlightImg: 'assets/frames/v2_09.jpg',
            badges: [
                { text: 'Zero Subscription', icon: 'check' },
                { text: 'Free Sizing Kit', icon: 'box' },
                { text: 'Lightweight (2.4g)', icon: 'feather' }
            ]
        };
    }

    // Apply configuration to DOM
    if (heroTitle) heroTitle.innerHTML = config.title;
    if (heroDescription) heroDescription.textContent = config.description;
    
    if (heroVideo) {
        heroVideo.setAttribute('poster', config.posterSrc);
        heroVideo.src = config.videoSrc;
        heroVideo.load();
    }
    
    if (videoCaptionTitle) videoCaptionTitle.textContent = config.caption;
    if (specHighlightImage) specHighlightImage.src = config.specHighlightImg;

    // Apply Badges
    if (badgeContainer) {
        badgeContainer.innerHTML = '';
        config.badges.forEach(b => {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'badge';
            if (b.text === 'Zero Bumps' || b.text === 'Zero Subscription' || b.text === 'Red Dot Winner') {
                badgeEl.classList.add('gold');
            }
            
            // Inline SVG select depending on icon type
            let svgIcon = '';
            if (b.icon === 'award') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
            } else if (b.icon === 'check') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
            } else if (b.icon === 'box') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M22 3.41L16.75 8.66 12 3.91l-4.75 4.75L2 3.41V20l10 3.5 10-3.5V3.41zM12 6.74l3 3-3 3-3-3 3-3zM4 6.27l6.5 6.5V20.8L4 18.5V6.27zm16 12.23l-6.5 2.3v-8.03l6.5-6.5v12.23z"/></svg>`;
            } else if (b.icon === 'shield') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M12 2L2 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-10-3z"/></svg>`;
            } else if (b.icon === 'feather') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M21.2 3.4c-.6-.6-1.5-.6-2.1 0L10.3 12.2c-.3.3-.5.7-.6 1.1l-.8 3c-.1.3 0 .7.3.9.2.2.5.3.8.3.1 0 .2 0 .3-.1l3-.8c.4-.1.8-.3 1.1-.6l8.8-8.8c.6-.6.6-1.5 0-2.1l-1.7-1.7zm-8.8 9.5l6.4-6.4 1.1 1.1-6.4 6.4-1.1-1.1z"/></svg>`;
            } else if (b.icon === 'sparkles') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M9 12.27l2.1-4.27 4.27-2.1-4.27-2.1L9 1.63 6.9 5.9 2.63 8l4.27 2.1L9 12.27zm8.5 7.1l1.05-2.13 2.13-1.05-2.13-1.05-1.05-2.13-1.05 2.13-2.13 1.05 2.13 1.05 1.05 2.13zM6 19.37l.7-1.4 1.4-.7-1.4-.7-.7-1.4-.7 1.4-1.4.7 1.4.7.7 1.4z"/></svg>`;
            }
            
            badgeEl.innerHTML = `${svgIcon} <span>${b.text}</span>`;
            badgeContainer.appendChild(badgeEl);
        });
    }

    // 2. Custom Video Player Logic (Autoplay Muted + Tap to Unmute / Play Control)
    const playToggleBtn = document.getElementById('play-toggle-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    if (heroVideo) {
        // Initial setup for quick loading and background autoplay capability
        heroVideo.muted = true;
        heroVideo.setAttribute('playsinline', '');
        
        // Attempt autoplay
        heroVideo.play().catch(e => {
            console.log('Autoplay was blocked by browser. Ready for user click.');
        });

        // Toggle state function
        const toggleVideoState = () => {
            if (heroVideo.paused) {
                heroVideo.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                heroVideo.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        };

        // If player is clicked, toggle play state and unmute
        if (playToggleBtn) {
            playToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (heroVideo.muted) {
                    heroVideo.muted = false;
                }
                toggleVideoState();
            });
        }

        // Tap on the video frame container also triggers play/pause
        heroVideo.addEventListener('click', () => {
            if (heroVideo.muted) {
                heroVideo.muted = false;
            }
            toggleVideoState();
        });

        // Sync button icons with actual video playback states
        heroVideo.addEventListener('play', () => {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        });

        heroVideo.addEventListener('pause', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        });
    }

    // 3. Sizing Selection Interaction & Cart URL Mapping (CAR Optimizer)
    const sizePills = document.querySelectorAll('.size-pill');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const stickyCta = document.getElementById('sticky-cta');
    const activeSizeText = document.getElementById('active-size-text');
    let selectedSize = null;

    // Direct purchasing URL base (Ultrahuman checkout page mock link or direct checkout API integration)
    const CHECKOUT_BASE_URL = 'https://ultrahuman.com/checkout';

    const updateCheckoutButtonState = () => {
        if (selectedSize) {
            if (selectedSize === 'kit') {
                addToCartBtn.innerHTML = `Order Sizing Kit First <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;
                if (stickyCta) stickyCta.textContent = 'Order Sizing Kit';
                if (activeSizeText) activeSizeText.innerHTML = 'Selected: <span class="kit-highlight">Free Sizing Kit</span> (Recommended for precise sizing)';
            } else {
                addToCartBtn.innerHTML = `Buy Size ${selectedSize} Now <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
                if (stickyCta) stickyCta.textContent = `Buy Size ${selectedSize}`;
                if (activeSizeText) activeSizeText.innerHTML = `Selected Size: <strong>US ${selectedSize}</strong>`;
            }
        }
    };

    sizePills.forEach(pill => {
        pill.addEventListener('click', () => {
            sizePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedSize = pill.getAttribute('data-size');
            updateCheckoutButtonState();
        });
    });

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            let checkoutUrl = '';
            if (!selectedSize) {
                // If clicked without picking a size, default to the sizing kit to reduce conversion friction
                checkoutUrl = `${CHECKOUT_BASE_URL}?product=ring-air&size=kit`;
                // Pulse the sizing warning or proceed directly to sizing kit checkout
                window.location.href = checkoutUrl;
            } else {
                checkoutUrl = `${CHECKOUT_BASE_URL}?product=ring-air&size=${selectedSize}`;
                window.location.href = checkoutUrl;
            }
        });
    }

    if (stickyCta) {
        stickyCta.addEventListener('click', (e) => {
            e.preventDefault();
            if (selectedSize) {
                window.location.href = `${CHECKOUT_BASE_URL}?product=ring-air&size=${selectedSize}`;
            } else {
                // Scroll smoothly to checkout widget if no size chosen yet
                const widget = document.getElementById('checkout-widget');
                if (widget) {
                    widget.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // 4. FAQ Accordion Logic
    const faqCards = document.querySelectorAll('.faq-card');

    faqCards.forEach(card => {
        const btn = card.querySelector('.faq-question-btn');
        const answer = card.querySelector('.faq-answer');

        if (btn && answer) {
            btn.addEventListener('click', () => {
                const isOpen = card.classList.contains('open');
                
                // Close all other FAQs first for clean accordion UI
                faqCards.forEach(c => {
                    c.classList.remove('open');
                    const ans = c.querySelector('.faq-answer');
                    if (ans) ans.style.maxHeight = '0px';
                });

                if (!isOpen) {
                    card.classList.add('open');
                    // Calculate heights dynamically for height transition animations
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    card.classList.remove('open');
                    answer.style.maxHeight = '0px';
                }
            });
        }
    });

    // 5. Mobile Sticky Buy Bar Scroll Trigger
    const checkoutWidget = document.getElementById('checkout-widget');
    const mobileStickyBar = document.querySelector('.mobile-sticky-bar');

    if (checkoutWidget && mobileStickyBar) {
        window.addEventListener('scroll', () => {
            const widgetRect = checkoutWidget.getBoundingClientRect();
            // Show sticky bar only when user has scrolled past the main top checkout widget
            if (widgetRect.bottom < 0 && window.innerWidth <= 768) {
                mobileStickyBar.style.display = 'flex';
            } else {
                mobileStickyBar.style.display = 'none';
            }
        });
    }
});
