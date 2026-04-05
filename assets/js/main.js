
// Supabase Configuration
const SUPABASE_URL = 'https://upyacxomckqityziuqji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweWFjeG9tY2txaXR5eml1cWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Nzc1OTMsImV4cCI6MjA4NTE1MzU5M30.8Gk5FxIwkzNEPN_SpE7yJ254CKifvfphq7yqfiajIe4';

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- APP STATE ---
let projects = [];
let skills = [];

// --- DOM ELEMENTS ---
const elements = {
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('nav-toggle'),
    navMenu: document.getElementById('nav-menu'),
    heroData: document.getElementById('hero-data'),
    heroLoader: document.getElementById('hero-loader'),
    heroTitle: document.getElementById('hero-title'),
    heroBody: document.getElementById('hero-body'),
    aboutContainer: document.getElementById('about-container'),
    skillsGrid: document.getElementById('skills-grid'),
    experienceStats: document.getElementById('experience-stats'),
    servicesGrid: document.getElementById('services-grid'),
    servicesLoader: document.getElementById('services-loader'),
    projectsGrid: document.getElementById('projects-grid'),
    projectFilters: document.getElementById('project-filters'),
    contactForm: document.getElementById('contact-form'),
    contactStatus: document.getElementById('contact-status'),
    contactDetails: document.getElementById('contact-details'),
    currentYear: document.getElementById('current-year'),
    projectModal: document.getElementById('project-modal'),
    modalBody: document.getElementById('modal-body'),
    modalClose: document.getElementById('modal-close'),
    servicesPrev: document.getElementById('services-prev'),
    servicesNext: document.getElementById('services-next'),
    socialLinks: document.getElementById('social-links')
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Basic UI items
    elements.currentYear.textContent = new Date().getFullYear();
    setupNavbar();

    // Fetch and Render Data
    await Promise.all([
        fetchHero(),
        fetchAbout(),
        fetchServices(),
        fetchSkills(),
        fetchExperience(),
        fetchProjects(),
        fetchSettings()
    ]);

    // Setup Animations
    setupScrollAnimations();
    setupContactToggle();
}

// --- UI HELPERS ---

function setupNavbar() {
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            elements.navbar.classList.add('scrolled');
        } else {
            elements.navbar.classList.remove('scrolled');
        }
    });

    // Mobile Toggle
    elements.navToggle.addEventListener('click', () => {
        elements.navMenu.classList.toggle('active');
        elements.navToggle.classList.toggle('active');
    });

    // Close menu on link click
    elements.navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            elements.navMenu.classList.remove('active');
            elements.navToggle.classList.remove('active');
        });
    });

    // Modal Close
    elements.modalClose.addEventListener('click', closeModal);
    elements.projectModal.addEventListener('click', (e) => {
        if (e.target === elements.projectModal) closeModal();
    });
}

function openModal() {
    elements.projectModal.style.display = 'flex';
    setTimeout(() => elements.projectModal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.projectModal.classList.remove('active');
    setTimeout(() => elements.projectModal.style.display = 'none', 300);
    document.body.style.overflow = 'auto';
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    
    // Skill bars
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.querySelector('.skill-progress');
                if (progress) {
                    const value = progress.dataset.progress;
                    progress.style.width = value + '%';
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.skill-item').forEach(el => skillObserver.observe(el));
}

// --- DATA FETCHING ---

async function fetchHero() {
    try {
        const { data, error } = await supabaseClient
            .from('contents')
            .select('*')
            //.eq('type', 'hero')  // removing strict check to handle case variations if needed, but keeping simple for now
            .in('type', ['hero', 'Hero']) // Allow capitalized Hero
            .eq('is_published', true)
            .order('order_index')
            .limit(1);

        if (error) throw error;
        const hero = data && data.length > 0 ? data[0] : null;

        if (hero) {
            let titleHtml = hero.title;
            if (hero.subtitle) {
                titleHtml += ` <br><span class="gradient-text">${hero.subtitle}</span>`;
            }
            elements.heroTitle.innerHTML = titleHtml;
            elements.heroBody.textContent = hero.body;
        }
        
        elements.heroLoader.style.display = 'none';
        elements.heroData.style.display = 'block';
    } catch (err) {
        console.error('Error fetching hero:', err);
        elements.heroLoader.textContent = 'Failed to load hero content.';
    }
}

async function fetchAbout() {
    try {
        const { data, error } = await supabaseClient
            .from('contents')
            .select('*')
            .eq('type', 'about')
            .eq('is_published', true)
            .order('order_index')
            .limit(1);

        if (error) throw error;
        const about = data && data.length > 0 ? data[0] : null;

        if (!about) {
            elements.aboutContainer.innerHTML = '<p>No about content found.</p>';
            return;
        }

        const imgUrl = about.image_url || 'https://via.placeholder.com/600x600?text=Developer';
        const paragraphs = about.body ? about.body.split('\n\n') : ['I am a passionate developer.'];

        elements.aboutContainer.innerHTML = `
            <div class="about-image animate-on-scroll">
                <img src="${imgUrl}" alt="Profile Photo">
            </div>
            <div class="about-content animate-on-scroll">
                <h2>${about.title || "Hello, I'm a Developer"}</h2>
                ${paragraphs.map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`).join('')}
            </div>
        `;

        // Re-trigger scroll observations for the new content
        setupScrollAnimations();
    } catch (err) {
        console.error('Error fetching about:', err);
        elements.aboutContainer.innerHTML = '<p class="error">Failed to load about content.</p>';
    }
}

async function fetchServices() {
    try {
        const { data, error } = await supabaseClient
            .from('contents')
            .select('*')
            .eq('type', 'service')
            .eq('is_published', true)
            .order('order_index');

        if (error) throw error;

        if (data && data.length > 0) {
            elements.servicesGrid.innerHTML = data.map(service => {
                const points = service.body ? service.body.split('\n').filter(line => line.trim()) : [];
                const bodyHtml = points.length > 0 
                    ? `<ul class="service-features">${points.map(p => `<li>${p.replace(/^[-\u2022]\s*/, '')}</li>`).join('')}</ul>` 
                    : '';
                
                return `
                <div class="service-card animate-on-scroll">
                    <h3>${service.title}</h3>
                    ${service.subtitle ? `<div class="service-price">${service.subtitle}</div>` : ''}
                    ${bodyHtml}
                </div>
                `;
            }).join('');
        } else {
            elements.servicesGrid.innerHTML = '<p class="empty-state">No services offered at the moment.</p>';
        }

        elements.servicesLoader.style.display = 'none';
        setupScrollAnimations();
        setupServicesCarousel();
    } catch (err) {
        console.error('Error fetching services:', err);
        if (elements.servicesLoader) {
            elements.servicesLoader.textContent = 'Failed to load services.';
        }
    }
}

function setupServicesCarousel() {
    const { servicesGrid, servicesPrev, servicesNext } = elements;
    if (!servicesGrid || !servicesPrev || !servicesNext) return;

    // Scroll amount = width of container (shows 3 items)
    const scrollAmount = () => servicesGrid.clientWidth;

    servicesPrev.addEventListener('click', () => {
        servicesGrid.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    servicesNext.addEventListener('click', () => {
        servicesGrid.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });

    // Update button states
    const updateButtons = () => {
        // Tolerance for rounding errors
        const tolerance = 5;
        const reachedStart = servicesGrid.scrollLeft <= tolerance;
        const reachedEnd = servicesGrid.scrollLeft + servicesGrid.clientWidth >= servicesGrid.scrollWidth - tolerance;

        servicesPrev.disabled = reachedStart;
        servicesNext.disabled = reachedEnd;
        
        servicesPrev.style.opacity = reachedStart ? '0.5' : '1';
        servicesNext.style.opacity = reachedEnd ? '0.5' : '1';
    };

    servicesGrid.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    
    // Initial check
    setTimeout(updateButtons, 100);
}

async function fetchSkills() {
    try {
        const { data, error } = await supabaseClient
            .from('skills')
            .select('*')
            .order('order_index');

        if (error) throw error;

        elements.skillsGrid.innerHTML = data.map(skill => `
            <div class="skill-item animate-on-scroll">
                <span class="skill-icon">${skill.icon || '💻'}</span>
                <span class="skill-name">${skill.name}</span>
                <div class="skill-bar">
                    <div class="skill-progress" data-progress="${skill.proficiency}"></div>
                </div>
            </div>
        `).join('');

        setupScrollAnimations();
    } catch (err) {
        console.error('Error fetching skills:', err);
        elements.skillsGrid.innerHTML = '<p class="error">Failed to load skills.</p>';
    }
}

async function fetchExperience() {
    try {
        const { data, error } = await supabaseClient
            .from('contents')
            .select('*')
            .eq('type', 'experience')
            .eq('is_published', true)
            .order('order_index');

        if (error) throw error;

        elements.experienceStats.innerHTML = data.map(exp => `
            <div class="card card-glass animate-on-scroll" style="text-align: center; padding: var(--space-xl);">
                <h3 class="gradient-text" style="font-size: 3rem; margin-bottom: 0.5rem;">${exp.title}</h3>
                <p style="font-size: 1.1rem; color: var(--text-secondary); margin: 0;">${exp.subtitle || ''}</p>
            </div>
        `).join('');

        setupScrollAnimations();
    } catch (err) {
        console.error('Error fetching experience:', err);
    }
}

async function fetchProjects() {
    try {
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('is_published', true)
            .order('order_index');

        if (error) throw error;
        projects = data;

        // Render dynamic filters
        const techCounts = {};
        const techDisplayNames = {}; // maps lower -> original

        projects.forEach(p => {
            try {
                const stack = Array.isArray(p.tech_stack) ? p.tech_stack : JSON.parse(p.tech_stack);
                (stack || []).forEach(tech => {
                    const lower = tech.toLowerCase().trim();
                    techCounts[lower] = (techCounts[lower] || 0) + 1;
                    // Keep the first or most "formal" looking capitalization (starts with upper)
                    if (!techDisplayNames[lower] || (tech[0] === tech[0].toUpperCase() && techDisplayNames[lower][0] === techDisplayNames[lower][0].toLowerCase())) {
                        techDisplayNames[lower] = tech.trim();
                    }
                });
            } catch (e) {}
        });

        const allTech = Object.keys(techDisplayNames).sort().map(lower => techDisplayNames[lower]);

        elements.projectFilters.innerHTML += allTech.slice(0, 10).map(tech => `
            <button class="btn btn-secondary filter-btn" data-filter="${tech.toLowerCase()}">${tech}</button>
        `).join('');

        setupFilters();
        renderProjects('all');
        setupScrollAnimations();
    } catch (err) {
        console.error('Error fetching projects:', err);
        elements.projectsGrid.innerHTML = '<p class="error">Failed to load projects.</p>';
    }
}

function renderProjects(filter) {
    const filtered = filter === 'all' 
        ? projects 
        : projects.filter(p => {
            try {
                const stack = Array.isArray(p.tech_stack) ? p.tech_stack : JSON.parse(p.tech_stack);
                return stack && stack.some(s => s.toLowerCase().trim() === filter.toLowerCase().trim());
            } catch(e) { return false; }
        });

    elements.projectsGrid.innerHTML = filtered.map(p => {
        let techStack = [];
        try {
            techStack = Array.isArray(p.tech_stack) ? p.tech_stack : JSON.parse(p.tech_stack);
        } catch(e) {}

        return `
            <article class="project-card animate-on-scroll visible" data-id="${p.id}" style="cursor: pointer;">
                ${p.featured ? '<span class="featured-badge">Featured</span>' : ''}
                <div class="project-image">
                    ${p.image_url ? `<img src="${p.image_url}" alt="${p.title}">` : '<div class="placeholder-img">💻</div>'}
                    <div class="project-overlay">
                        <div class="project-links">
                            ${p.github_url ? `
                                <a href="${p.github_url}" class="btn btn-secondary btn-icon" target="_blank" rel="noopener">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                            ` : ''}
                            ${p.demo_url ? `
                                <a href="${p.demo_url}" class="btn btn-primary btn-icon" target="_blank" rel="noopener">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="project-content">
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <div class="tech-stack">
                        ${techStack.slice(0, 4).map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function setupFilters() {
    elements.projectFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            elements.projectFilters.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            renderProjects(e.target.dataset.filter);
        }
    });

    // Project click leads to modal
    elements.projectsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (card) {
            const projectId = card.dataset.id;
            const project = projects.find(p => p.id == projectId);
            if (project) showProjectDetails(project);
        }
    });
}

function showProjectDetails(p) {
    let techStack = [];
    try {
        techStack = Array.isArray(p.tech_stack) ? p.tech_stack : JSON.parse(p.tech_stack);
    } catch(e) {}

    elements.modalBody.innerHTML = `
        ${p.image_url ? `<img src="${p.image_url}" alt="${p.title}" class="project-hero-image">` : ''}
        <h2>${p.title}</h2>
        <div class="project-meta">
            ${techStack.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
        <div class="project-links mb-xl" style="display: flex; gap: 1rem;">
            ${p.github_url ? `<a href="${p.github_url}" class="btn btn-secondary" target="_blank">View GitHub</a>` : ''}
            ${p.demo_url ? `<a href="${p.demo_url}" class="btn btn-primary" target="_blank">Live Demo</a>` : ''}
        </div>
        <div class="project-body">
            ${p.content ? p.content.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('') : `<p>${p.description}</p>`}
        </div>
    `;
    openModal();
}

async function fetchSettings() {
    try {
        const { data, error } = await supabaseClient
            .from('settings')
            .select('*');

        if (error) throw error;
        
        const settings = data.reduce((acc, curr) => ({ ...acc, [curr.key.toLowerCase()]: curr.value }), {});
        
        // Render Social Links
        const socialPlatforms = ['github', 'linkedin', 'twitter', 'instagram', 'facebook'];
        const socialIcons = {
            github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>',
            linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
            twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>',
            instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.469h3.047v-2.643c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z"/></svg>'
        };

        if (elements.socialLinks) {
            elements.socialLinks.innerHTML = socialPlatforms
                .filter(p => settings[p])
                .map(platform => `
                    <a href="${settings[platform]}" target="_blank" class="social-link" aria-label="${platform}">
                        ${socialIcons[platform]}
                    </a>
                `).join('');
        }

        if (settings.email) {
            elements.contactDetails.innerHTML = `
                <a href="mailto:${settings.email}" class="contact-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <div><strong>Email</strong><span>${settings.email}</span></div>
                </a>
            `;
        }

        if (settings.whatsapp) {
            const whatsappBtn = document.getElementById('whatsapp-btn');
            if (whatsappBtn) {
                const number = settings.whatsapp.replace(/[^0-9]/g, '');
                whatsappBtn.href = `https://wa.me/${number}`;
            }
        }
    } catch (err) {
        console.error('Error fetching settings:', err);
    }
}

function setupContactToggle() {
    const toggles = document.querySelectorAll('.toggle-btn');
    const methods = document.querySelectorAll('.contact-method');

    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.dataset.method;
            
            // Update toggles
            toggles.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');

            // Update contents
            methods.forEach(m => {
                // If it's the target, show it
                if ((method === 'system' && m.id === 'contact-form') || 
                    (method === 'whatsapp' && m.id === 'contact-whatsapp')) {
                    m.style.display = 'block';
                    m.classList.add('active');
                } else {
                    m.style.display = 'none';
                    m.classList.remove('active');
                }
            });
        });
    });
}

// --- FORM HANDLING ---

elements.contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const formData = new FormData(elements.contactForm);
    const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        subject: 'Contact from Portfolio'
    };

    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert([payload]);

        if (error) throw error;

        // Send WhatsApp notification via TextMeBot (fire-and-forget)
        sendWhatsAppNotification(payload).catch(err => {
            console.warn('WhatsApp notification failed (non-critical):', err);
        });

        elements.contactStatus.innerHTML = '<div class="alert alert-success">Message sent successfully!</div>';
        elements.contactForm.reset();
    } catch (err) {
        console.error('Error sending message:', err);
        elements.contactStatus.innerHTML = '<div class="alert alert-error">Failed to send message. Please try again.</div>';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// --- WHATSAPP NOTIFICATION ---
async function sendWhatsAppNotification(data) {
    try {
        const response = await fetch('/myportfolio/api/notify.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message
            })
        });
        const result = await response.json();
        if (result.success) {
            console.log('WhatsApp notification sent successfully');
        } else {
            console.warn('WhatsApp notification issue:', result.error);
        }
    } catch (err) {
        console.warn('Could not send WhatsApp notification:', err);
    }
}

// --- SECRET ADMIN ACCESS ---
// Double-click the footer logo to access the admin panel
document.addEventListener('DOMContentLoaded', () => {
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
        footerLogo.addEventListener('dblclick', () => {
            window.location.href = 'admin/login.html';
        });
    }
});
