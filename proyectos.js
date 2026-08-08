document.addEventListener('DOMContentLoaded', () => {

    // Año footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Header scroll
    const header = document.getElementById('page-header');
    let lastY = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
        if (y < 80) header.classList.remove('nav-hidden');
        else if (y > lastY + 5) header.classList.add('nav-hidden');
        else if (y < lastY - 5) header.classList.remove('nav-hidden');
        lastY = y;
    }, { passive: true });

    document.addEventListener('mousemove', (e) => {
        if (e.clientY < 60) header.classList.remove('nav-hidden');
    });

    // Renderizar grilla
    const grid = document.getElementById('cat-grid');
    if (!grid) return;

    const items = typeof PROJECTS_DATA !== 'undefined' ? PROJECTS_DATA : [];

    if (items.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No hay proyectos disponibles.</p>';
        return;
    }

    items.forEach((item, i) => {
        const tags = (item.tags || []).map(t => `<span class="cat-tag">${t}</span>`).join('');

        const card = document.createElement('div');
        card.className = 'cat-card';
        card.style.animationDelay = `${i * 0.08}s`;

        card.innerHTML = `
            <div class="cat-card-preview">
                <iframe
                    src="${item.src}"
                    title="${item.title}"
                    scrolling="no"
                    class="cat-iframe"
                    loading="lazy"
                    tabindex="-1"
                ></iframe>
                <div class="cat-card-overlay">
                    <a href="${item.link}" class="cat-visit-btn" target="_blank" rel="noopener noreferrer">
                        Ver sitio
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                        </svg>
                    </a>
                </div>
            </div>
            <div class="cat-card-info">
                <div class="cat-card-tags">${tags}</div>
                <h3 class="cat-card-title">${item.title}</h3>
                ${item.description ? `<p class="cat-card-desc">${item.description}</p>` : ''}
            </div>
        `;

        grid.appendChild(card);
    });
});
