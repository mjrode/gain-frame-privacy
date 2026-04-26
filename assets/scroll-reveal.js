(() => {
    const selector = '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .parallax-float, .badge-pop, .tilt-in, .hero-text-stagger, .hero-image-stagger';

    const reveal = (el) => el.classList.add('visible');

    const elements = document.querySelectorAll(selector);

    if (!('IntersectionObserver' in window)) {
        elements.forEach(reveal);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                reveal(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

    elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            reveal(el);
        } else {
            observer.observe(el);
        }
    });
})();
