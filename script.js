document.addEventListener('DOMContentLoaded', () => {

    /* --- Copy Protection --- */
    const selectionIncludesProtectedText = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return false;

        return Array.from(document.querySelectorAll('.no-copy')).some((element) =>
            Array.from({ length: selection.rangeCount }, (_, index) =>
                selection.getRangeAt(index).intersectsNode(element)
            ).some(Boolean)
        );
    };

    document.addEventListener('contextmenu', (event) => {
        if (event.target instanceof Element && event.target.closest('.no-copy')) {
            event.preventDefault();
        }
    });

    ['copy', 'cut'].forEach(evt => {
        document.addEventListener(evt, (event) => {
            if (selectionIncludesProtectedText()) event.preventDefault();
        });
    });

    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && selectionIncludesProtectedText()) {
            event.preventDefault();
        }
    });

    /* --- Dynamic CGPA Recalculation --- */
    const cgpaOutput = document.querySelector('#current-cgpa');
    if (cgpaOutput) {
        const semesters = [
            { sgpa: 8.29, credits: 20 },
            { sgpa: 8.49, credits: 20 },
            { sgpa: 9.00, credits: 21 },
            { sgpa: 10.00, credits: 21 }
        ];
        const validSemesters = semesters.length > 0 && semesters.every(({ sgpa, credits }) =>
            Number.isFinite(sgpa) && sgpa >= 0 && sgpa <= 10 &&
            Number.isFinite(credits) && credits > 0
        );

        if (!validSemesters) {
            cgpaOutput.textContent = 'Unavailable';
        } else {
            const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
            const weightedPoints = semesters.reduce((sum, s) => sum + s.sgpa * s.credits, 0);
            cgpaOutput.textContent = (weightedPoints / totalCredits).toFixed(2);
        }
    }

    /* --- Mobile Navigation --- */
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('#site-navigation');

    if (menuToggle && navigation) {
        const setMenuOpen = (isOpen) => {
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
            navigation.classList.toggle('is-open', isOpen);
        };

        menuToggle.addEventListener('click', () => {
            setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
        });

        navigation.addEventListener('click', (event) => {
            if (event.target.closest('a')) setMenuOpen(false);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
                setMenuOpen(false);
                menuToggle.focus();
            }
        });

        window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
            if (event.matches) setMenuOpen(false);
        });
    }

    /* --- Unified 120 FPS Scroll Handler (Header & Active Links) --- */
    const header = document.querySelector('header');
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = Array.from(document.querySelectorAll('nav ul li a'));

    // Cache section layout offsets on load/resize to eliminate layout thrashing during scroll
    let cachedOffsets = [];
    const updateCachedOffsets = () => {
        cachedOffsets = sections.map(section => ({
            id: section.id,
            top: section.offsetTop,
            height: section.offsetHeight
        }));
    };
    updateCachedOffsets();
    window.addEventListener('resize', updateCachedOffsets, { passive: true });

    let isScrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!isScrollTicking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // 1. Header scroll class
                if (header) {
                    header.classList.toggle('header-scrolled', scrollY > 50);
                }

                // 2. Active nav link tracking using cached positions
                let currentId = '';
                for (let i = 0; i < cachedOffsets.length; i++) {
                    if (scrollY >= cachedOffsets[i].top - 160) {
                        currentId = cachedOffsets[i].id;
                    }
                }

                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    link.classList.toggle('active', href && href.endsWith(`#${currentId}`));
                });

                isScrollTicking = false;
            });
            isScrollTicking = true;
        }
    }, { passive: true });

    /* --- Smooth Navigation Anchors --- */
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });

    /* --- Hardware-Accelerated Reveal Animations --- */
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    });

    const revealElements = document.querySelectorAll(
        '.section-title, .skill-card, .timeline-item, .project-card, .cert-card, .award-card, .contact-container'
    );

    revealElements.forEach(el => {
        el.classList.add('reveal-item');
        revealObserver.observe(el);
    });

    /* --- Contact Form Handler --- */
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const status = contactForm.querySelector('.form-status');
            const emailLink = document.querySelector('.contact-info a[href^="mailto:"]');

            if (!emailLink) {
                if (status) status.textContent = 'Email contact is currently unavailable. Please try again later.';
                return;
            }

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            const recipient = emailLink.getAttribute('href').slice('mailto:'.length);
            const subject = encodeURIComponent(`Portfolio contact from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

            if (status) {
                status.textContent = `Your email app should open with your message ready to send. If it doesn't, email ${recipient}.`;
            }
            window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
        });
    }
});
