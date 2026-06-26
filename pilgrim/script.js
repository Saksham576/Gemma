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
    const carouselTrack = document.getElementById('carousel-track');
    const carouselDots = document.getElementById('carousel-dots');

    // Default configuration (Campaign 1: Glass Skin Glow Focus)
    let config = {
        title: 'Reveal Your Glass Skin Glow. <span class="accent-text">Zero Greasiness.</span>',
        description: 'Achieve an instant glass-like skin glow and deep 24-hour hydration. Lightweight gel cream powered by Korean Rice Water, 3% Niacinamide, and Ceramides to strengthen your skin barrier.',
        videoSrc: 'lv_0_20260626144215.mp4',
        posterSrc: 'assets/frames/v1_03.jpg',
        caption: 'Outreach Spotlight: Korean Glass Skin Glow',
        specHighlightImg: 'assets/frames/v1_13.jpg',
        badges: [
            { text: 'Korean Beauty Secret', icon: 'sparkles' },
            { text: '100% Vegan & Safe', icon: 'check' },
            { text: 'Barrier Repair', icon: 'shield' }
        ],
        slideshow: [
            { img: 'assets/frames/v1_03.jpg', tag: '01 / Application', desc: 'Lightweight gel-like consistency absorbs in seconds.' },
            { img: 'assets/frames/v1_08.jpg', tag: '02 / Glass Skin Glow', desc: 'Instant dewy, healthy skin appearance without oily residue.' },
            { img: 'assets/frames/v1_13.jpg', tag: '03 / Barrier Lock', desc: 'Ceramides and Niacinamide lock hydration for 24 hours.' },
            { img: 'assets/frames/v1_18.jpg', tag: '04 / Final Result', desc: 'Hydrated, plump, and glowing skin all day.' }
        ]
    };

    // Campaign 2 Custom Configuration (UGC: Hydration & Clean Formula Focus)
    if (videoParam === '2' || videoParam === 'ugc' || videoParam === 'barrier') {
        config = {
            title: 'Plump & Hydrated Skin. <span class="accent-text">Zero Stickiness.</span> All Day.',
            description: 'Unlock deep multi-level moisture with 5 types of Hyaluronic Acid and Ceramides. A fast-absorbing gel formula that hydrates your skin barrier without leaving any heavy, sticky residue.',
            videoSrc: 'lv_0_20260626144238.mp4',
            posterSrc: 'assets/frames/v2_03.jpg',
            caption: 'UGC Spotlight: Hydration & Texture Test',
            specHighlightImg: 'assets/frames/v2_13.jpg',
            badges: [
                { text: 'Deep Hydration', icon: 'water' },
                { text: 'Dermatologist Tested', icon: 'shield' },
                { text: 'No Toxic Fragrance', icon: 'heart' }
            ],
            slideshow: [
                { img: 'assets/frames/v2_03.jpg', tag: '01 / Texture Check', desc: 'Ultra-light cream gel formulation.' },
                { img: 'assets/frames/v2_08.jpg', tag: '02 / Fast Absorption', desc: 'Quickly penetrates down to deep skin layers.' },
                { img: 'assets/frames/v2_13.jpg', tag: '03 / Moisture Retention', desc: 'Locks in skin barrier lipids to prevent water loss.' }
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
            if (b.text === 'Korean Beauty Secret' || b.text === 'Deep Hydration') {
                badgeEl.classList.add('teal-badge');
            }
            
            // Inline SVGs for badges
            let svgIcon = '';
            if (b.icon === 'sparkles') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M9 12.27l2.1-4.27 4.27-2.1-4.27-2.1L9 1.63 6.9 5.9 2.63 8l4.27 2.1L9 12.27zm8.5 7.1l1.05-2.13 2.13-1.05-2.13-1.05-1.05-2.13-1.05 2.13-2.13 1.05 2.13 1.05 1.05 2.13z"/></svg>`;
            } else if (b.icon === 'check') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
            } else if (b.icon === 'shield') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M12 2L2 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-10-3z"/></svg>`;
            } else if (b.icon === 'water') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
            } else if (b.icon === 'heart') {
                svgIcon = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
            }
            
            badgeEl.innerHTML = `${svgIcon}<span>${b.text}</span>`;
            badgeContainer.appendChild(badgeEl);
        });
    }

    // Apply Carousel Slides
    let currentSlide = 0;
    let slidesCount = config.slideshow.length;

    if (carouselTrack && carouselDots) {
        carouselTrack.innerHTML = '';
        carouselDots.innerHTML = '';
        
        config.slideshow.forEach((slide, index) => {
            // Build Slide
            const slideEl = document.createElement('div');
            slideEl.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            slideEl.setAttribute('data-index', index);
            slideEl.innerHTML = `
                <img src="${slide.img}" alt="${slide.tag}">
                <div class="slide-overlay">
                    <span>${slide.tag}</span>
                    <p>${slide.desc}</p>
                </div>
            `;
            carouselTrack.appendChild(slideEl);
            
            // Build Dot
            const dotEl = document.createElement('span');
            dotEl.className = `dot ${index === 0 ? 'active' : ''}`;
            dotEl.setAttribute('data-index', index);
            carouselDots.appendChild(dotEl);
        });
    }

    // Carousel Actions
    const updateCarousel = (index) => {
        const track = document.getElementById('carousel-track');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        const slides = document.querySelectorAll('.carousel-slide');
        
        if (!track || slides.length === 0) return;
        
        // Boundaries
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;
        
        // Translate track
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Toggle active slide
        slides.forEach(s => s.classList.remove('active'));
        slides[currentSlide].classList.add('active');
        
        // Toggle active dot
        dots.forEach(d => d.classList.remove('active'));
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    };

    // Attach Carousel Button Events
    const nextBtn = document.getElementById('carousel-next');
    const prevBtn = document.getElementById('carousel-prev');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            updateCarousel(currentSlide + 1);
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            updateCarousel(currentSlide - 1);
        });
    }
    
    // Attach Dot Clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('dot')) {
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            updateCarousel(index);
        }
    });

    // 2. Video Mute/Unmute Controls
    const muteBtn = document.getElementById('mute-btn');
    const soundOffIcon = document.querySelector('.sound-off-icon');
    const soundOnIcon = document.querySelector('.sound-on-icon');
    const btnText = document.querySelector('.btn-text');

    if (muteBtn && heroVideo) {
        muteBtn.addEventListener('click', () => {
            if (heroVideo.muted) {
                heroVideo.muted = false;
                soundOffIcon.classList.add('hidden');
                soundOnIcon.classList.remove('hidden');
                btnText.textContent = 'Mute';
            } else {
                heroVideo.muted = true;
                soundOffIcon.classList.remove('hidden');
                soundOnIcon.classList.add('hidden');
                btnText.textContent = 'Tap to Sound On';
            }
        });
    }

    // 3. Interactive Pricing Selector Widget
    const sizePills = document.querySelectorAll('.size-pill');
    const priceNowDisplay = document.querySelector('.price-now');
    const priceOriginalDisplay = document.querySelector('.price-original');
    const priceBadge = document.querySelector('.price-badge');
    const mainCtaBtn = document.getElementById('main-cta-btn');
    const stickyPriceDisplay = document.getElementById('sticky-price-display');
    const stickyTitle = document.querySelector('.sticky-title');

    sizePills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active from all
            sizePills.forEach(p => p.classList.remove('active'));
            
            // Add active to current
            pill.classList.add('active');
            
            // Parse data attributes
            const size = pill.getAttribute('data-size');
            const price = pill.getAttribute('data-price');
            const original = pill.getAttribute('data-orig');
            const discount = pill.getAttribute('data-discount');
            
            // Update Displays
            if (priceNowDisplay) priceNowDisplay.textContent = `₹${price}`;
            if (priceOriginalDisplay) priceOriginalDisplay.textContent = `₹${original}`;
            if (priceBadge) priceBadge.textContent = `Save ${discount}% Off`;
            if (stickyPriceDisplay) stickyPriceDisplay.textContent = `₹${price}`;
            
            // Update Text
            if (size === '1') {
                if (mainCtaBtn) mainCtaBtn.innerHTML = `<span>Get Glass Skin Glow</span><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
                if (stickyTitle) stickyTitle.textContent = '100g Hydra Glow Gel';
            } else {
                if (mainCtaBtn) mainCtaBtn.innerHTML = `<span>Get Pack of 2 (30% Off)</span><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
                if (stickyTitle) stickyTitle.textContent = 'Pack of 2 Hydra Glow Gel';
            }
        });
    });

    // Main CTA redirect
    if (mainCtaBtn) {
        mainCtaBtn.addEventListener('click', () => {
            const activePill = document.querySelector('.size-pill.active');
            const size = activePill ? activePill.getAttribute('data-size') : '1';
            let variantId = '46878271308005'; // Default Variant ID on pilgrim
            if (size === '2') {
                variantId = '46878271340773'; // Example pack of 2 variant ID
            }
            
            // Redirect to cart addition link to increase Cart Addition Rate (CAR)
            window.location.href = `https://discoverpilgrim.com/cart/add?id=${variantId}&quantity=1`;
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
                
                // Close all FAQs first
                faqCards.forEach(c => {
                    c.classList.remove('open');
                    const ans = c.querySelector('.faq-answer');
                    if (ans) ans.style.maxHeight = '0px';
                });
                
                // Toggle current FAQ
                if (!isOpen) {
                    card.classList.add('open');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });

    // 5. Mobile Sticky Footer Bar trigger on scroll
    const checkoutWidget = document.getElementById('checkout-widget');
    const mobileStickyBar = document.getElementById('mobile-sticky-bar');
    const stickyCtaBtn = document.getElementById('sticky-cta-btn');

    if (checkoutWidget && mobileStickyBar) {
        window.addEventListener('scroll', () => {
            const widgetRect = checkoutWidget.getBoundingClientRect();
            // Show sticky bar when the checkout widget leaves the viewport
            if (widgetRect.bottom < 0) {
                mobileStickyBar.classList.add('visible');
            } else {
                mobileStickyBar.classList.remove('visible');
            }
        });
    }
    
    // Mobile sticky CTA redirects to purchase too
    if (stickyCtaBtn) {
        stickyCtaBtn.addEventListener('click', () => {
            const mainCta = document.getElementById('main-cta-btn');
            if (mainCta) mainCta.click();
        });
    }
});
