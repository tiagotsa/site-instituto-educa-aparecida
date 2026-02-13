// ===== MOBILE MENU TOGGLE =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNavMenu = document.querySelector('.nav-links');

// Se existir o arquivo supabase_config.js ele deverá definir window.SUPABASE_CONFIG
if (window.SUPABASE_CONFIG) {
    EMAIL_ENDPOINT = window.SUPABASE_CONFIG.EMAIL_ENDPOINT || EMAIL_ENDPOINT;
    SUPABASE_URL = window.SUPABASE_CONFIG.SUPABASE_URL || SUPABASE_URL;
    SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
}

// Inicializa cliente Supabase (via CDN `supabase` disponível em index.html)
let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
// Debug: mostrar estado inicial (não expõe a anon key completa)
console.info('Supabase URL:', SUPABASE_URL ? SUPABASE_URL.replace(/(^https?:\/\/|\/.+$)/g, '$1...') : 'not set');
console.info('Supabase client configured?', !!supabaseClient);

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileNavMenu.classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', mobileNavMenu.classList.contains('active'));
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNavMenu.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

// ===== FORM HANDLING =====
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validação dos campos
        if (!validateForm()) {
            return;
        }

        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date().toISOString()
        };

        console.debug('Form submit:', { name: data.name, email: data.email, subject: data.subject });

        // Mostrar mensagem de envio
        showFormMessage('Enviando mensagem...', 'info');

        try {
            // Validação adicional de segurança
            if (!isValidEmail(data.email)) {
                throw new Error('E-mail inválido');
            }

            if (data.name.length < 3 || data.name.length > 100) {
                throw new Error('Nome deve ter entre 3 e 100 caracteres');
            }

            if (data.message.length < 10 || data.message.length > 1000) {
                throw new Error('Mensagem deve ter entre 10 e 1000 caracteres');
            }

            // Simular envio (em produção, seria uma chamada para um endpoint real)
            await simulateSendEmail(data);

            // Sucesso
            showFormMessage('✓ Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            contactForm.reset();
            
            // Guardar dados no localStorage para backup (GDPR compliant)
            saveFormDataLocally(data);

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            showFormMessage(`✗ Erro: ${error.message}. Por favor, tente novamente ou envie um e-mail direto para contato.educaraparecida@outlook.com`, 'error');
        }
    });
}

/**
 * Validar formulário em tempo real
 */
function validateForm() {
    const inputs = contactForm.querySelectorAll('input, select, textarea');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.style.borderColor = 'var(--danger)';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });

    return isValid;
}

/**
 * Validar formato de e-mail
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 100;
}

/**
 * Simular envio de e-mail (em produção, usar um serviço real como EmailJS, Formspree, etc.)
 */
async function simulateSendEmail(data) {
    console.debug('simulateSendEmail start');
    // Tenta enviar via endpoint (Formspree) se configurado; caso contrário, usa mailto: como fallback.
    // Retorna quando o envio for considerado iniciado/sucesso.
    // 1) Tentar inserir em Supabase via cliente (se configurado)
    if (supabaseClient) {
        console.debug('Attempting insert via supabaseClient');
        const payload = { name: data.name, email: data.email, subject: data.subject, message: data.message, timestamp: data.timestamp };
        try {
            const { error } = await supabaseClient.from('contacts').insert([payload]);
            if (error) {
                console.warn('Supabase insert falhou:', error);
            } else {
                return; // sucesso
            }
        } catch (err) {
            console.warn('Erro ao inserir no Supabase via client:', err);
        }
    }
    console.debug('Supabase client not used or insert failed, continuing to Formspree/mailto');

    // 2) Tentar enviar para o serviço (Formspree) se configurado
    if (EMAIL_ENDPOINT && !EMAIL_ENDPOINT.includes('YOUR_FORM_ID')) {
        const payload = {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            timestamp: data.timestamp
        };

        const res = await fetch(EMAIL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Falha no envio (status ${res.status}) ${text}`);
        }

        return;
    }

    // 3) Fallback: abrir cliente de e-mail local via mailto: (depende do usuário)
    return new Promise((resolve, reject) => {
        try {
            const to = 'contato.educaraparecida@outlook.com';
            const subject = `[Contato site] ${data.subject || 'Sem assunto'} - ${data.name}`;
            const bodyLines = [
                `Nome: ${data.name}`,
                `E-mail: ${data.email}`,
                `Assunto: ${data.subject}`,
                '',
                `${data.message}`,
                '',
                `Enviado em: ${data.timestamp}`
            ];

            const body = encodeURIComponent(bodyLines.join('\n'));
            const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;

            window.location.href = mailto;

            setTimeout(() => resolve(), 500);
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Guardar dados do formulário no localStorage (com privacidade)
 */
function saveFormDataLocally(data) {
    try {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push(data);
        // Manter apenas as últimas 10 mensagens
        if (messages.length > 10) {
            messages.shift();
        }
        localStorage.setItem('contactMessages', JSON.stringify(messages));
    } catch (error) {
        console.warn('Não foi possível salvar dados localmente:', error);
    }
}

/**
 * Mostrar mensagem de feedback do formulário
 */
function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = type;
    
    if (type === 'success') {
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = '';
        }, 5000);
    }
}

// ===== SMOOTH SCROLL ENHANCEMENT =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            const offsetTop = target.offsetTop - 80; // Levar em conta a altura do header
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== ANIMAÇÃO DE SCROLL =====
const scrollObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, scrollObserverOptions);

// Aplicar observador em cards e seções
document.querySelectorAll('.value-card, .project-active, .volunteer-card, .partnership-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    scrollObserver.observe(el);
});

// ===== PERFORMANCE: LAZY LOADING IMAGES =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== DETECÇÃO DE NAVEGAÇÃO ATIVA =====
const sections = document.querySelectorAll('main > section');
const navItems = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    });
}, { threshold: 0.5 });

sections.forEach(section => {
    sectionObserver.observe(section);
});

// ===== ANALYTICS E TRACKING (Optional - sem cookies) =====
function trackEvent(eventName, eventData = {}) {
    // Aqui você poderia integrar com Google Analytics ou outro serviço
    // Exemplo: gtag('event', eventName, eventData);
    console.log('Event tracked:', eventName, eventData);
}

// Rastrear cliques em CTAs
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const buttonText = btn.textContent;
        trackEvent('button_click', { button_text: buttonText });
    });
});

// ===== ACESSIBILIDADE: GERENCIAMENTO DE FOCO =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.focus();
    }
});

// ===== DETECÇÃO DE MODO ESCURO DO SISTEMA =====
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
prefersDark.addEventListener('change', (e) => {
    if (e.matches) {
        document.documentElement.style.colorScheme = 'dark';
    } else {
        document.documentElement.style.colorScheme = 'light';
    }
});

// ===== FEEDBACK VISUAL DE CARREGAMENTO =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

document.body.style.opacity = '0.95';

// ===== ACTIVE NAVIGATION LINK =====
// Detectar qual seção está visível e destacar link correspondente
const navLinks = document.querySelectorAll('.nav-links a');

const observerOptions = {
    root: null,
    rootMargin: '0px 0px -70% 0px',
    threshold: 0.1
};

const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Remove active de todos os links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });

            // Adiciona active ao link correspondente
            const targetId = entry.target.id;
            const activeLink = Array.from(navLinks).find(link => link.getAttribute('href') === `#${targetId}`);
            
            if (activeLink) {
                activeLink.classList.add('active');
                console.log('Seção ativa:', targetId);
            }
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

// Observar apenas as seções que têm links no menu
const menuSectionIds = ['home', 'quem-somos', 'projetos', 'voluntariado', 'contato'];
menuSectionIds.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
        observer.observe(section);
        console.log('Observando seção:', id);
    }
});

// ===== SEGURANÇA: Prevenir ataques simples =====
// CSP (Content Security Policy) deve ser configurado no servidor
// CORS deve ser configurado apropriadamente no backend

console.log('🎓 Educar Aparecida - Landing Page carregada com sucesso!');
