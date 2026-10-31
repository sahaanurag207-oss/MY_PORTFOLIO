document.addEventListener('DOMContentLoaded', () => {

    const selectionIncludesProtectedText = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            return false;
        }

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

    document.addEventListener('copy', (event) => {
        if (selectionIncludesProtectedText()) {
            event.preventDefault();
        }
    });

    document.addEventListener('cut', (event) => {
        if (selectionIncludesProtectedText()) {
            event.preventDefault();
        }
    });

    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' &&
            selectionIncludesProtectedText()) {
            event.preventDefault();
        }
    });

    const cgpaOutput = document.querySelector('#current-cgpa');
    if (cgpaOutput) {
        // Add or remove semester entries here; the displayed CGPA recalculates from this list.
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
            const totalCredits = semesters.reduce((sum, semester) => sum + semester.credits, 0);
            const weightedPoints = semesters.reduce(
                (sum, semester) => sum + semester.sgpa * semester.credits,
                0
            );
            cgpaOutput.textContent = (weightedPoints / totalCredits).toFixed(2);
        }
    }

    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('#site-navigation');

    const setMenuOpen = (isOpen) => {
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        navigation.classList.toggle('is-open', isOpen);
    };

    menuToggle.addEventListener('click', () => {
        setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    navigation.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            setMenuOpen(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
            setMenuOpen(false);
            menuToggle.focus();
        }
    });

    window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
        if (event.matches) {
            setMenuOpen(false);
        }
    });

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.section-title, .skill-card, .timeline-item, .project-card, .cert-card, .award-card, .contact-container');

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        revealObserver.observe(el);
    });

    window.requestAnimationFrame(() => {
        revealElements.forEach(el => {
            if (el.getBoundingClientRect().top <= window.innerHeight) {
                el.classList.add('revealed');
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                revealObserver.unobserve(el);
            }
        });
    });

    window.addEventListener('scroll', () => {
        revealElements.forEach(el => {
            if (el.classList.contains('revealed')) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (!target) {
                return;
            }
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const status = contactForm.querySelector('.form-status');
            const emailLink = document.querySelector('.contact-info a[href^="mailto:"]');

            if (!emailLink) {
                status.textContent = 'Email contact is currently unavailable. Please try again later.';
                return;
            }

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            const recipient = emailLink.getAttribute('href').slice('mailto:'.length);
            const subject = encodeURIComponent(`Portfolio contact from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

            status.textContent = `Your email app should open with your message ready to send. If it doesn't, email ${recipient}.`;
            window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
        });
    }

});
