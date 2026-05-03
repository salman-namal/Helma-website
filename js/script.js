document.addEventListener('DOMContentLoaded', () => {
    const typeHeroTagline = (scope) => {
        const tagline = scope?.querySelector('.hero-tagline');
        if (!tagline) return;

        const fullText = tagline.dataset.fullText || tagline.textContent.trim();
        tagline.dataset.fullText = fullText;
        tagline.textContent = '';
        tagline.classList.add('typing');

        let index = 0;
        const speed = 28;
        const timer = setInterval(() => {
            index += 1;
            tagline.textContent = fullText.slice(0, index);
            if (index >= fullText.length) {
                clearInterval(timer);
                tagline.classList.remove('typing');
            }
        }, speed);
    };

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 700, easing: 'ease-in-out', once: true, offset: 80 });
    }

    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.innerHTML = navLinks.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
        document.querySelectorAll('.nav-links a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    if (typeof Swiper !== 'undefined') {
        if (document.querySelector('.hero-swiper')) {
            const heroSwiper = new Swiper('.hero-swiper', {
                loop: true,
                effect: 'fade',
                autoplay: { delay: 4500, disableOnInteraction: false },
                pagination: { el: '.hero-swiper .swiper-pagination', clickable: true },
                on: {
                    init(swiper) {
                        typeHeroTagline(swiper.slides[swiper.activeIndex]);
                    },
                    slideChangeTransitionStart(swiper) {
                        typeHeroTagline(swiper.slides[swiper.activeIndex]);
                    }
                }
            });

            typeHeroTagline(heroSwiper.slides[heroSwiper.activeIndex]);
        }

        if (document.querySelector('.logo-swiper')) {
            new Swiper('.logo-swiper', {
                loop: true,
                slidesPerView: 1.2,
                spaceBetween: 14,
                autoplay: { delay: 2200, disableOnInteraction: false },
                breakpoints: {
                    640: { slidesPerView: 2.1 },
                    900: { slidesPerView: 3.1 },
                    1200: { slidesPerView: 4 }
                }
            });
        }

        if (document.querySelector('.partner-swiper')) {
            new Swiper('.partner-swiper', {
                loop: true,
                slidesPerView: 1.2,
                spaceBetween: 14,
                autoplay: { delay: 2500, disableOnInteraction: false },
                breakpoints: {
                    640: { slidesPerView: 2.1 },
                    900: { slidesPerView: 3.1 },
                    1200: { slidesPerView: 4 }
                }
            });
        }

        document.querySelectorAll('.service-detail-swiper').forEach((el) => {
            new Swiper(el, {
                loop: true,
                effect: 'fade',
                autoplay: { delay: 2300, disableOnInteraction: false },
                speed: 700
            });
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const old = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            btn.style.backgroundColor = '#10b981';
            contactForm.reset();
            setTimeout(() => { btn.innerHTML = old; btn.style.backgroundColor = ''; }, 2500);
        });
    }

    const careerForm = document.getElementById('career-form');
    if (careerForm) {
        careerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = careerForm.querySelector('button[type="submit"]');
            const old = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Application Received';
            btn.style.backgroundColor = '#10b981';
            careerForm.reset();
            setTimeout(() => { btn.innerHTML = old; btn.style.backgroundColor = ''; }, 2500);
        });
    }

    const interactiveCards = document.querySelectorAll('.services-grid .service-card');
    const canAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tiltRange = 8;
    const hoverTransform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(-8px) scale(1.02)';

    interactiveCards.forEach((card) => {
        let rafId = null;
        let pendingEvent = null;

        const updateCard = () => {
            if (!pendingEvent) return;

            const rect = card.getBoundingClientRect();
            const relX = pendingEvent.clientX - rect.left;
            const relY = pendingEvent.clientY - rect.top;
            const ratioX = Math.max(0, Math.min(1, relX / rect.width));
            const ratioY = Math.max(0, Math.min(1, relY / rect.height));
            const mouseX = ratioX * 100;
            const mouseY = ratioY * 100;

            card.style.setProperty('--mx', `${mouseX}%`);
            card.style.setProperty('--my', `${mouseY}%`);

            if (canAnimate) {
                const rotateY = (ratioX - 0.5) * (tiltRange * 2);
                const rotateX = (0.5 - ratioY) * (tiltRange * 2);
                card.style.transform =
                    `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale(1.02)`;
            }

            rafId = null;
        };

        const queueUpdate = (event) => {
            pendingEvent = event;
            if (rafId) return;
            rafId = window.requestAnimationFrame(updateCard);
        };

        card.addEventListener('mouseenter', () => {
            card.classList.add('is-hovered');
            if (canAnimate) {
                card.style.transform = hoverTransform;
            }
        });

        card.addEventListener('mousemove', queueUpdate, { passive: true });

        card.addEventListener('mouseleave', () => {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
            pendingEvent = null;
            card.classList.remove('is-hovered');
            card.style.transform = '';
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '50%');
        });
    });

    const clientTicker = document.querySelector('.clients-ticker');
    const clientsTrack = document.querySelector('.clients-track');

    if (clientTicker && clientsTrack) {
        const allCards = clientsTrack.querySelectorAll('.client-card');
        const originalCount = Math.floor(allCards.length / 2);
        let currentStep = 0;
        let tickerInterval = null;
        let resetInProgress = false;

        const getGapValue = () => {
            const gapValue = getComputedStyle(clientsTrack).gap;
            return parseInt(gapValue, 10) || 0;
        };

        const getStepDistance = () => {
            const firstCard = clientsTrack.querySelector('.client-card');
            if (!firstCard) return 0;
            return firstCard.offsetWidth + getGapValue();
        };

        const setTransform = (instant = false) => {
            if (instant) {
                clientsTrack.style.transition = 'none';
            } else {
                clientsTrack.style.transition = 'transform 0.55s ease';
            }
            clientsTrack.style.transform = `translateX(-${currentStep * getStepDistance()}px)`;
            if (instant) {
                requestAnimationFrame(() => {
                    clientsTrack.style.transition = 'transform 0.55s ease';
                });
            }
        };

        const moveStep = () => {
            if (resetInProgress) return;
            currentStep += 1;
            setTransform();

            if (currentStep === originalCount) {
                resetInProgress = true;

                const handleTransitionEnd = (event) => {
                    if (event.propertyName !== 'transform') return;
                    clientsTrack.removeEventListener('transitionend', handleTransitionEnd);
                    currentStep = 0;
                    setTransform(true);
                    resetInProgress = false;
                };

                clientsTrack.addEventListener('transitionend', handleTransitionEnd);
            }
        };

        const startTicker = () => {
            if (tickerInterval) return;
            tickerInterval = window.setInterval(moveStep, 3200);
        };

        const stopTicker = () => {
            if (!tickerInterval) return;
            window.clearInterval(tickerInterval);
            tickerInterval = null;
        };

        const refreshTicker = () => {
            setTransform(true);
        };

        clientTicker.addEventListener('mouseenter', stopTicker);
        clientTicker.addEventListener('mouseleave', () => {
            if (!tickerInterval) startTicker();
        });

        window.addEventListener('resize', refreshTicker);

        refreshTicker();
        startTicker();
    }

    const loadPartnerLogos = async () => {
        const partnerGrid = document.querySelector('.partners-grid');
        if (!partnerGrid) return;

        const folderUrl = 'images/logos/partners/';
        const allowedExt = /\.(jpe?g|png|svg|webp)$/i;
        const fallbackLogos = [
            'aiphoneofficial_logo.jpeg',
            'avigilon_logo.jpeg',
            'cofem.png',
            'Cortech.jpeg',
            'detnov.jpg',
            'images.png',
            'naffco_logo_for_websites.png',
            'VIVOTEK.svg'
        ];

        const buildCards = (files) => {
            if (!files.length) {
                partnerGrid.innerHTML = '<div class="loading-message">No partner logos available.</div>';
                return;
            }

            partnerGrid.innerHTML = files.map((fileName) => {
                const altText = fileName.replace(/[-_]/g, ' ').replace(/\.(jpe?g|png|svg|webp)$/i, '');
                return `
                    <div class="partner-card">
                        <img src="${folderUrl}${encodeURIComponent(fileName)}" alt="${altText}" loading="lazy">
                    </div>
                `;
            }).join('');
        };

        try {
            const response = await fetch(folderUrl, { method: 'GET' });
            if (!response.ok) throw new Error(`Server returned ${response.status}`);

            const contentType = response.headers.get('content-type') || '';
            let files = [];

            if (contentType.includes('application/json')) {
                const json = await response.json();
                files = Array.isArray(json) ? json : json.images || [];
            } else {
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                files = Array.from(doc.querySelectorAll('a'))
                    .map((anchor) => anchor.getAttribute('href'))
                    .filter((href) => href && allowedExt.test(href))
                    .map((href) => decodeURIComponent(href))
                    .filter((value, index, self) => self.indexOf(value) === index);
            }

            files = files.filter((file) => allowedExt.test(file));
            files.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

            if (!files.length) throw new Error('No image files found in partner folder');
            buildCards(files);
        } catch (error) {
            console.warn('Partner logo load failed, using fallback list:', error);
            buildCards(fallbackLogos);
        }
    };

    loadPartnerLogos();
});
