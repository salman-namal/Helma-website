document.addEventListener('DOMContentLoaded', () => {
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
            new Swiper('.hero-swiper', {
                loop: true,
                effect: 'fade',
                autoplay: { delay: 4500, disableOnInteraction: false },
                pagination: { el: '.hero-swiper .swiper-pagination', clickable: true }
            });
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
});
