(() => {
    const LIGHT_HEADER_BG = 'rgba(248, 250, 252, 0.92)';
    const DARK_HEADER_BG = 'rgba(10, 10, 10, 0.88)';

    document.addEventListener('DOMContentLoaded', () => {
        const root = document.documentElement;
        const header = document.querySelector('header');
        const sections = document.querySelectorAll('.animated-section');
        const navLinks = document.querySelectorAll('nav ul li a');
        const shapes = document.querySelectorAll('.shape');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        const hamburger = document.querySelector('.hamburger');
        const mobileNavLinks = document.querySelector('.nav-links');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isSmallScreen = window.matchMedia('(max-width: 900px)').matches;

        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        document.body.appendChild(themeToggle);

        const savedTheme = localStorage.getItem('theme') || 'dark';
        root.setAttribute('data-theme', savedTheme);

        const updateHeaderBackground = () => {
            if (!header) {
                return;
            }

            const isLight = root.getAttribute('data-theme') === 'light';
            const hasScrolled = window.scrollY > 40;

            header.style.background = isLight
                ? (hasScrolled ? LIGHT_HEADER_BG : 'rgba(248, 250, 252, 0.82)')
                : (hasScrolled ? DARK_HEADER_BG : 'rgba(2, 22, 17, 0.9)');
            header.style.backdropFilter = hasScrolled ? 'blur(20px) saturate(160%)' : 'blur(16px)';
        };

        updateHeaderBackground();

        themeToggle.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme');
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', nextTheme);
            localStorage.setItem('theme', nextTheme);
            updateHeaderBackground();
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                const targetId = link.getAttribute('href');
                if (!targetId || !targetId.startsWith('#')) {
                    return;
                }

                const targetElement = document.querySelector(targetId);
                if (!targetElement) {
                    return;
                }

                event.preventDefault();
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 24;

                window.scrollTo({
                    top: targetPosition,
                    behavior: reducedMotion ? 'auto' : 'smooth'
                });

                if (mobileNavLinks?.classList.contains('active')) {
                    mobileNavLinks.classList.remove('active');
                    hamburger?.classList.remove('active');
                }
            });
        });

        if ('IntersectionObserver' in window) {
            const sectionObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12 });

            sections.forEach((section) => sectionObserver.observe(section));
        } else {
            sections.forEach((section) => section.classList.add('visible'));
        }

        // Active nav tracking
        const nav = document.querySelector('nav');
        const allSections = document.querySelectorAll('section[id]');

        if ('IntersectionObserver' in window) {
            const navObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        navLinks.forEach((link) => {
                            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                        });
                    }
                });
            }, { threshold: 0.35 });

            allSections.forEach((s) => navObserver.observe(s));
        }

        // Nav scroll state
        const updateNavState = () => {
            if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', updateNavState, { passive: true });
        updateNavState();

        // Stat counter animation
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length && 'IntersectionObserver' in window) {
            const counterObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const raw = el.textContent.replace(/\D/g, '');
                    const target = parseInt(raw, 10);
                    const suffix = el.textContent.replace(/\d/g, '');
                    if (!target) return;
                    let current = 0;
                    const step = Math.ceil(target / 28);
                    const tick = setInterval(() => {
                        current = Math.min(current + step, target);
                        el.textContent = current + suffix;
                        if (current >= target) clearInterval(tick);
                    }, 40);
                    observer.unobserve(el);
                });
            }, { threshold: 0.8 });
            statNumbers.forEach((el) => counterObserver.observe(el));
        }

        const skillHeaders = document.querySelectorAll('.skill-category-header');
        skillHeaders.forEach((skillHeader) => {
            skillHeader.setAttribute('role', 'button');
            skillHeader.setAttribute('tabindex', '0');

            const toggleCategory = () => {
                const category = skillHeader.parentElement;
                if (!category) {
                    return;
                }

                const isActive = category.classList.contains('active');
                document.querySelectorAll('.skill-category.active').forEach((activeCategory) => {
                    activeCategory.classList.remove('active');
                });

                if (!isActive) {
                    category.classList.add('active');
                }
            };

            skillHeader.addEventListener('click', toggleCategory);
            skillHeader.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleCategory();
                }
            });
        });

        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter') || 'all';

                filterButtons.forEach((btn) => btn.classList.remove('active'));
                button.classList.add('active');

                projectCards.forEach((card) => {
                    const categories = (card.getAttribute('data-category') || '').split(' ');
                    const show = filter === 'all' || categories.includes(filter);
                    if (show) {
                        card.classList.remove('is-hidden');
                        card.style.display = 'flex';
                    } else {
                        card.classList.add('is-hidden');
                        setTimeout(() => {
                            if (card.classList.contains('is-hidden')) card.style.display = 'none';
                        }, 220);
                    }
                });
            });
        });

        hamburger?.addEventListener('click', () => {
            mobileNavLinks?.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        const lazyDataImages = document.querySelectorAll('img[data-src]');
        if (lazyDataImages.length && 'IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const image = entry.target;
                    if (image instanceof HTMLImageElement && image.dataset.src) {
                        image.src = image.dataset.src;
                    }

                    observer.unobserve(image);
                });
            }, { rootMargin: '120px 0px' });

            lazyDataImages.forEach((image) => imageObserver.observe(image));
        }

        const certificateCards = document.querySelectorAll('.certificate-card');
        if (certificateCards.length && 'IntersectionObserver' in window) {
            const certificateObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.12 });

            certificateCards.forEach((card) => {
                card.classList.add('is-pending');
                certificateObserver.observe(card);
            });
        }

        let isTicking = false;
        const handleScroll = () => {
            if (isTicking) {
                return;
            }

            isTicking = true;
            requestAnimationFrame(() => {
                updateHeaderBackground();

                if (!reducedMotion && !isSmallScreen && shapes.length > 0) {
                    const scrollOffset = window.scrollY;
                    shapes.forEach((shape, index) => {
                        const speed = 0.04 + index * 0.006;
                        shape.style.transform = `translate3d(0, ${Math.round(scrollOffset * speed)}px, 0)`;
                    });
                }

                isTicking = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateHeaderBackground, { passive: true });
    });
})();
