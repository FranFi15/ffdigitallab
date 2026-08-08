document.addEventListener('DOMContentLoaded', () => {
    // 1. Actualizar el año en el footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Navbar: hide on scroll down, show on scroll up + show on mouse near top
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    let navbarVisible = true;

    function setNavbarVisible(visible) {
        navbarVisible = visible;
        if (visible) {
            header.classList.remove('nav-hidden');
        } else {
            header.classList.add('nav-hidden');
        }
    }

    window.addEventListener('scroll', () => {
        const currentY = window.scrollY;

        // Clase scrolled (fondo semi-transparente)
        if (currentY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide / show según dirección de scroll
        if (currentY < 80) {
            // Siempre visible en el tope
            setNavbarVisible(true);
        } else if (currentY > lastScrollY + 5) {
            // Scroll hacia abajo → ocultar
            setNavbarVisible(false);
        } else if (currentY < lastScrollY - 5) {
            // Scroll hacia arriba → mostrar
            setNavbarVisible(true);
        }

        lastScrollY = currentY;
    }, { passive: true });

    // Mostrar al acercar el mouse al borde superior (top 60px)
    document.addEventListener('mousemove', (e) => {
        if (e.clientY < 60) {
            setNavbarVisible(true);
        }
    });

    // 3. Animación simple al hacer scroll (Reveal)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Seleccionamos elementos para animar
    const animatedElements = document.querySelectorAll('.service-card, .project-card, .section-title, .contact-container, .tech-card');

    animatedElements.forEach(el => {
        // Estado inicial
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";

        // Observar
        observer.observe(el);
    });

    // ==========================================================
    // Servicios — Timed Cards Gallery (GSAP)
    // ==========================================================
    const SERVICES = [
        { category: 'Desarrollo', title: 'APPS', title2: 'MÓVILES', description: 'Creación, compilación y despliegue de aplicaciones nativas/híbridas (React Native) con ciclo completo de publicación en Apple App Store y Google Play Store.', icon: '📱', gradient: 'linear-gradient(135deg,#711caa,#2d0845)', image: 'assets/appsmoviles.png' },
        { category: 'Desarrollo', title: 'WEB', title2: 'FULL STACK', description: 'Construcción de plataformas complejas y sistemas a medida utilizando el stack Node.js, Express, React y bases de datos.', icon: '🌐', gradient: 'linear-gradient(135deg,#1a237e,#4a148c)', image: 'assets/web.png' },
        { category: 'Datos', title: 'BASES DE', title2: 'DATOS SQL y NoSQL', description: 'Arquitectura, modelado y optimización de bases de datos orientadas a documentos.', icon: '🗄️', gradient: 'linear-gradient(135deg,#880e4f,#4a148c)', image: 'assets/basedatos.png' },
        { category: 'Creativo', title: 'DISEÑO', title2: 'DIGITAL', description: 'Elaboración de recursos visuales, gráficos dinámicos y contenido multimedia publicitario para marcas y redes sociales.', icon: '🎨', gradient: 'linear-gradient(135deg,#b71c1c,#880e4f)', image: 'assets/diseño.png' },
        { category: 'Consultoría', title: 'AUDITORÍA', title2: 'WEB', description: 'Diagnóstico técnico, análisis de usabilidad (UX/UI) y optimización de rendimiento para landing pages y sitios corporativos.', icon: '🔍', gradient: 'linear-gradient(135deg,#bf360c,#4a148c)', image: 'assets/auditoria.png' }
    ];

    const srvDemo = document.getElementById('srv-demo');
    if (!srvDemo || typeof gsap === 'undefined') return;

    // Build DOM
    const srvCards = SERVICES.map((s, i) => {
        // Si hay imagen la usamos; si no, usamos el degradado de color
        const bgStyle = s.image
            ? `background-image: url('${s.image}'); background-size: cover; background-position: center;`
            : `background: ${s.gradient};`;
        const emojiHtml = s.image ? '' : `<div class="srv-card-emoji">${s.icon}</div>`;
        return `<div class="srv-card" id="srv-card${i}" style="${bgStyle}">${emojiHtml}</div>`;
    }).join('');

    const srvCardContents = SERVICES.map((s, i) => `
        <div class="srv-card-content" id="srv-card-content-${i}">
            <div class="srv-content-start"></div>
            <div class="srv-content-category">${s.category}</div>
            <div class="srv-content-title-1">${s.title}</div>
            <div class="srv-content-title-2">${s.title2}</div>
        </div>`).join('');

    const srvSlideNumbers = SERVICES.map((_, i) =>
        `<div class="srv-slide-item" id="srv-slide-item-${i}">${i + 1}</div>`).join('');

    srvDemo.innerHTML = srvCards + srvCardContents;
    document.getElementById('srv-slide-numbers').innerHTML = srvSlideNumbers;

    // Helpers
    const getSrvCard = i => `#srv-card${i}`;
    const getSrvContent = i => `#srv-card-content-${i}`;
    const getSrvSlide = i => `#srv-slide-item-${i}`;
    const srvAnimate = (target, dur, props) => new Promise(res => gsap.to(target, { ...props, duration: dur, onComplete: res }));

    let srvOrder = SERVICES.map((_, i) => i);
    let srvDetailsEven = true;

    const srvEase = 'sine.inOut';
    const cardW = 200, cardH = 300, cardGap = 40, numberSize = 50;
    let srvOffsetTop, srvOffsetLeft;

    function getSrvSection() {
        return document.getElementById('servicios');
    }

    function srvInit() {
        const section = getSrvSection();
        const W = section.offsetWidth;
        const H = section.offsetHeight;
        srvOffsetTop = H - 430;
        srvOffsetLeft = W - 830;

        const [active, ...rest] = srvOrder;
        const detailsActive = srvDetailsEven ? '#srv-details-even' : '#srv-details-odd';
        const detailsInactive = srvDetailsEven ? '#srv-details-odd' : '#srv-details-even';

        // Set initial active card
        gsap.set(getSrvCard(active), { x: 0, y: 0, width: W, height: H });
        gsap.set(getSrvContent(active), { x: 0, y: 0, opacity: 0 });
        gsap.set(detailsActive, { opacity: 0, zIndex: 22, x: -200 });
        gsap.set(detailsInactive, { opacity: 0, zIndex: 12 });
        gsap.set(`${detailsInactive} .srv-text`, { y: 100 });
        gsap.set(`${detailsInactive} .srv-title-1`, { y: 100 });
        gsap.set(`${detailsInactive} .srv-title-2`, { y: 100 });
        gsap.set(`${detailsInactive} .srv-desc`, { y: 50 });
        gsap.set(`${detailsInactive} .srv-cta`, { y: 60 });
        gsap.set('#srv-pagination', { top: srvOffsetTop + 330, left: srvOffsetLeft, y: 200, opacity: 0, zIndex: 60 });
        gsap.set('.srv-progress-sub-foreground', { width: 300 * (1 / srvOrder.length) * (active + 1) });

        // Populate active details
        document.querySelector(`${detailsActive} .srv-text`).textContent = SERVICES[active].category;
        document.querySelector(`${detailsActive} .srv-title-1`).textContent = SERVICES[active].title;
        document.querySelector(`${detailsActive} .srv-title-2`).textContent = SERVICES[active].title2;
        document.querySelector(`${detailsActive} .srv-desc`).textContent = SERVICES[active].description;

        // Position thumbnails
        rest.forEach((i, index) => {
            gsap.set(getSrvCard(i), { x: srvOffsetLeft + 400 + index * (cardW + cardGap), y: srvOffsetTop, width: cardW, height: cardH, zIndex: 30, borderRadius: 10 });
            gsap.set(getSrvContent(i), { x: srvOffsetLeft + 400 + index * (cardW + cardGap), zIndex: 40, y: srvOffsetTop + cardH - 100 });
            gsap.set(getSrvSlide(i), { x: (index + 1) * numberSize });
        });

        const startDelay = 0.5;
        gsap.to('.srv-cover', { x: W + 400, delay: 0.3, ease: srvEase, onComplete: () => setTimeout(srvLoop, 400) });
        rest.forEach((i, index) => {
            gsap.to(getSrvCard(i), { x: srvOffsetLeft + index * (cardW + cardGap), zIndex: 30, ease: srvEase, delay: startDelay + 0.05 * index });
            gsap.to(getSrvContent(i), { x: srvOffsetLeft + index * (cardW + cardGap), zIndex: 40, ease: srvEase, delay: startDelay + 0.05 * index });
        });
        gsap.to('#srv-pagination', { y: 0, opacity: 1, ease: srvEase, delay: startDelay });
        gsap.to(detailsActive, { opacity: 1, x: 0, ease: srvEase, delay: startDelay });
    }

    function srvStep() {
        return new Promise(resolve => {
            srvOrder.push(srvOrder.shift());
            srvDetailsEven = !srvDetailsEven;

            const detailsActive = srvDetailsEven ? '#srv-details-even' : '#srv-details-odd';
            const detailsInactive = srvDetailsEven ? '#srv-details-odd' : '#srv-details-even';
            const [active, ...rest] = srvOrder;
            const prv = rest[rest.length - 1];
            const section = getSrvSection();
            const W = section.offsetWidth;
            const H = section.offsetHeight;

            document.querySelector(`${detailsActive} .srv-text`).textContent = SERVICES[active].category;
            document.querySelector(`${detailsActive} .srv-title-1`).textContent = SERVICES[active].title;
            document.querySelector(`${detailsActive} .srv-title-2`).textContent = SERVICES[active].title2;
            document.querySelector(`${detailsActive} .srv-desc`).textContent = SERVICES[active].description;

            gsap.set(detailsActive, { zIndex: 22 });
            gsap.to(detailsActive, { opacity: 1, delay: 0.4, ease: srvEase });
            gsap.to(`${detailsActive} .srv-text`, { y: 0, delay: 0.1, duration: 0.7, ease: srvEase });
            gsap.to(`${detailsActive} .srv-title-1`, { y: 0, delay: 0.15, duration: 0.7, ease: srvEase });
            gsap.to(`${detailsActive} .srv-title-2`, { y: 0, delay: 0.15, duration: 0.7, ease: srvEase });
            gsap.to(`${detailsActive} .srv-desc`, { y: 0, delay: 0.3, duration: 0.4, ease: srvEase });
            gsap.to(`${detailsActive} .srv-cta`, { y: 0, delay: 0.35, duration: 0.4, ease: srvEase });
            gsap.set(detailsInactive, { zIndex: 12 });

            gsap.set(getSrvCard(prv), { zIndex: 10 });
            gsap.set(getSrvCard(active), { zIndex: 20 });
            gsap.to(getSrvCard(prv), { scale: 1.5, ease: srvEase });
            gsap.to(getSrvContent(active), { y: srvOffsetTop + cardH - 10, opacity: 0, duration: 0.3, ease: srvEase });
            gsap.to(getSrvSlide(active), { x: 0, ease: srvEase });
            gsap.to(getSrvSlide(prv), { x: -numberSize, ease: srvEase });
            gsap.to('.srv-progress-sub-foreground', { width: 300 * (1 / srvOrder.length) * (active + 1), ease: srvEase });

            gsap.to(getSrvCard(active), {
                x: 0, y: 0, ease: srvEase, width: W, height: H, borderRadius: 0,
                onComplete: () => {
                    const xNew = srvOffsetLeft + (rest.length - 1) * (cardW + cardGap);
                    gsap.set(getSrvCard(prv), { x: xNew, y: srvOffsetTop, width: cardW, height: cardH, zIndex: 30, borderRadius: 10, scale: 1 });
                    gsap.set(getSrvContent(prv), { x: xNew, y: srvOffsetTop + cardH - 100, opacity: 1, zIndex: 40 });
                    gsap.set(getSrvSlide(prv), { x: rest.length * numberSize });
                    gsap.set(detailsInactive, { opacity: 0 });
                    gsap.set(`${detailsInactive} .srv-text`, { y: 100 });
                    gsap.set(`${detailsInactive} .srv-title-1`, { y: 100 });
                    gsap.set(`${detailsInactive} .srv-title-2`, { y: 100 });
                    gsap.set(`${detailsInactive} .srv-desc`, { y: 50 });
                    gsap.set(`${detailsInactive} .srv-cta`, { y: 60 });
                    resolve();
                }
            });

            rest.forEach((i, index) => {
                if (i !== prv) {
                    const xNew = srvOffsetLeft + index * (cardW + cardGap);
                    gsap.set(getSrvCard(i), { zIndex: 30 });
                    gsap.to(getSrvCard(i), { x: xNew, y: srvOffsetTop, width: cardW, height: cardH, ease: srvEase, delay: 0.1 * (index + 1) });
                    gsap.to(getSrvContent(i), { x: xNew, y: srvOffsetTop + cardH - 100, opacity: 1, zIndex: 40, ease: srvEase, delay: 0.1 * (index + 1) });
                    gsap.to(getSrvSlide(i), { x: (index + 1) * numberSize, ease: srvEase });
                }
            });
        });
    }

    // ── Timer gestionado con setTimeout ──────────────────────────────
    const SRV_INTERVAL = 4000; // ms entre cambios automáticos
    let srvTimerId = null;
    let srvIsAnimating = false;

    function srvScheduleNext() {
        clearTimeout(srvTimerId);
        srvTimerId = setTimeout(() => {
            if (!srvIsAnimating) srvAdvance();
        }, SRV_INTERVAL);
    }

    async function srvAdvance() {
        srvIsAnimating = true;
        await srvStep();
        srvIsAnimating = false;
        srvScheduleNext();
    }

    // Arranca el loop automático (llamado desde srvInit vía .srv-cover onComplete)
    function srvLoop() {
        srvScheduleNext();
    }

    // Arrow click handlers — cancelan el timer y reinician el contador
    document.querySelector('.srv-arrow-right')?.addEventListener('click', () => {
        if (srvIsAnimating) return;          // ignorar si ya está animando
        clearTimeout(srvTimerId);            // cancelar timer automático
        srvIsAnimating = true;
        srvStep().then(() => {
            srvIsAnimating = false;
            srvScheduleNext();               // reiniciar timer desde cero
        });
    });
    document.querySelector('.srv-arrow-left')?.addEventListener('click', () => {
        if (srvIsAnimating) return;
        clearTimeout(srvTimerId);
        // Reverse: mover el último al frente dos veces para ir hacia atrás
        srvOrder.unshift(srvOrder.pop());
        srvOrder.unshift(srvOrder.pop());
        srvIsAnimating = true;
        srvStep().then(() => {
            srvIsAnimating = false;
            srvScheduleNext();
        });
    });

    srvInit();

    // ==========================================================
    // Lógica de Enlarge Gallery (Proyectos)
    // ==========================================================
    // Los datos vienen de data/projects.js (script cargado antes que éste)
    // Mostramos un máximo de 5 proyectos en la galería de inicio
    const ITEMS = typeof PROJECTS_DATA !== 'undefined' ? PROJECTS_DATA.slice(0, 5) : [];

    const track = document.getElementById('gallery-track');
    const galleryContent = document.getElementById('gallery-content');
    const kicker = galleryContent?.querySelector('.gallery-kicker');
    const title = galleryContent?.querySelector('.gallery-title');
    const desc = galleryContent?.querySelector('.gallery-description');
    const link = galleryContent?.querySelector('#gallery-link');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (track && galleryContent) {
        let activeIndex = 0;
        let thumbOrder = ITEMS.slice(1).map(item => item.id);

        const itemElements = [];

        const initGallery = () => {
            track.innerHTML = '';
            ITEMS.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'gallery-item';

                const slideEl = document.createElement('div');
                slideEl.className = 'gallery-slide';

                slideEl.addEventListener('click', () => {
                    if (activeIndex !== index) goToIndex(index);
                });

                const iframe = document.createElement('iframe');
                iframe.src = item.src;
                iframe.title = item.title || item.alt;
                iframe.className = 'gallery-iframe';
                iframe.setAttribute('scrolling', 'no');
                iframe.style.pointerEvents = 'none';

                slideEl.appendChild(iframe);
                itemEl.appendChild(slideEl);
                track.appendChild(itemEl);

                itemElements.push({ itemEl, slideEl });
            });
        };

        const updateTrack = () => {
            ITEMS.forEach((item, index) => {
                const isActive = index === activeIndex;
                let offset = 0;

                if (!isActive) {
                    offset = thumbOrder.indexOf(item.id) - (thumbOrder.length - 1) / 2;
                }

                const { itemEl, slideEl } = itemElements[index];
                itemEl.setAttribute('data-active', isActive);
                slideEl.style.setProperty('--offset', offset);
            });
        };

        const renderContent = () => {
            const item = ITEMS[activeIndex];

            // Re-trigger animation
            galleryContent.style.animation = 'none';
            galleryContent.offsetHeight; // trigger reflow
            galleryContent.style.animation = null;

            if (kicker) kicker.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(ITEMS.length).padStart(2, '0')}`;
            if (title) title.textContent = item.title;
            if (desc) desc.innerHTML = item.description;
            if (link) link.href = item.link;
        };

        const goToIndex = (newIndex) => {
            if (newIndex === activeIndex) return;
            const oldIndex = activeIndex;
            activeIndex = newIndex;

            // Intercambiar la tarjeta vieja con el lugar exacto de la nueva en la fila de miniaturas
            const newId = ITEMS[newIndex].id;
            const oldId = ITEMS[oldIndex].id;
            const position = thumbOrder.indexOf(newId);
            
            if (position !== -1) {
                thumbOrder[position] = oldId;
            } else {
                // Fallback de seguridad
                thumbOrder.push(oldId);
            }

            updateTrack();
            renderContent();
        };

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                const targetId = thumbOrder[thumbOrder.length - 1];
                const targetIndex = ITEMS.findIndex(i => i.id === targetId);
                if (targetIndex !== -1) goToIndex(targetIndex);
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                const targetId = thumbOrder[0];
                const targetIndex = ITEMS.findIndex(i => i.id === targetId);
                if (targetIndex !== -1) goToIndex(targetIndex);
            });
        }

        // Initialize
        initGallery();
        updateTrack();
        renderContent();

        // Mostrar botón Ver Todos debajo de la galería si hay > 5 proyectos en total
        if (typeof PROJECTS_DATA !== 'undefined' && PROJECTS_DATA.length > 5) {
            const verTodosStatic = document.getElementById('gallery-ver-mas-static');
            if (verTodosStatic) {
                verTodosStatic.style.display = 'inline-flex';
            }
        }
    }

});
