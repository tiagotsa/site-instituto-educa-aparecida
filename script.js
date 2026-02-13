// =====================================================================
// ARQUIVO SCRIPT.JS CORRIGIDO
// =====================================================================

// 1. DECLARAMOS AS VARIÁVEIS PRIMEIRO, ANTES DE QUALQUER USO
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';
let EMAIL_ENDPOINT = '';
let supabaseClient = null;

// 2. TENTAMOS CARREGAR AS CONFIGURAÇÕES DO ARQUIVO GERADO PELO VERCEL
// Este arquivo (supabase_config.js) só vai existir no Vercel após o build
if (window.SUPABASE_CONFIG) {
    EMAIL_ENDPOINT = window.SUPABASE_CONFIG.EMAIL_ENDPOINT || '';
    SUPABASE_URL = window.SUPABASE_CONFIG.SUPABASE_URL || '';
    SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.SUPABASE_ANON_KEY || '';
}

// 3. AGORA, COM AS VARIÁVEIS PREENCHIDAS, INICIALIZAMOS O CLIENTE SUPABASE
if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
    // Verificação extra para não usar chaves de exemplo
    if (!SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT')) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
}

// 4. LOGS DE DIAGNÓSTICO PARA SABER SE FUNCIONOU
console.info('Configuração do Supabase:', SUPABASE_URL ? 'Chaves Carregadas' : 'Chaves Vazias');
console.info('Cliente Supabase:', supabaseClient ? '✅ PRONTO PARA USO' : '❌ NÃO CONFIGURADO');

// ===== A PARTIR DAQUI, O RESTO DO SEU CÓDIGO PERMANECE IGUAL =====

// ===== MOBILE MENU TOGGLE =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNavMenu = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileNavMenu.classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', mobileNavMenu.classList.contains('active'));
    });

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
        if (!validateForm()) return;

        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date().toISOString()
        };

        console.debug('Dados do formulário:', data);
        showFormMessage('Enviando mensagem...', 'info');

        try {
            if (!isValidEmail(data.email) || data.name.length < 3 || data.message.length < 10) {
                throw new Error('Por favor, preencha todos os campos corretamente.');
            }

            await sendData(data); // Função unificada para enviar

            showFormMessage('✓ Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            contactForm.reset();
            saveFormDataLocally(data);

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            showFormMessage(`✗ Erro: ${error.message}. Por favor, tente novamente.`, 'error');
        }
    });
}

/**
 * Função unificada para enviar para o Supabase.
 */
async function sendData(data) {
    // 1. A primeira e única opção é o Supabase
    if (supabaseClient) {
        console.debug('Tentando inserir via Supabase...');
        const { error } = await supabaseClient.from('contacts').insert([data]);
        if (error) {
            console.error('Falha no Supabase:', error);
            // Lança o erro para ser pego pelo bloco catch
            throw new Error('Não foi possível conectar ao nosso sistema.');
        } else {
            console.log('Dados inseridos no Supabase com sucesso!');
            return; // Sucesso
        }
    }

    // 2. Se o cliente Supabase não estiver configurado, lança um erro.
    console.error('Cliente Supabase não inicializado. Verifique as configurações no Vercel.');
    throw new Error('O serviço de formulário está temporariamente indisponível.');
}

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

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 100;
}

function saveFormDataLocally(data) {
    try {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push(data);
        if (messages.length > 10) messages.shift();
        localStorage.setItem('contactMessages', JSON.stringify(messages));
    } catch (error) {
        console.warn('Não foi possível salvar dados localmente:', error);
    }
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    if (type === 'success') {
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }, 5000);
    }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    });
});

// ===== ANIMAÇÃO DE SCROLL =====
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.value-card, .project-active, .volunteer-card, .partnership-card').forEach(el => {
    el.classList.add('fade-in-element');
    scrollObserver.observe(el);
});

// ===== FEEDBACK VISUAL DE CARREGAMENTO (CORRIGIDO) =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});
// A linha abaixo causava o erro "body is not defined"
document.body.style.opacity = '0.95'; // CORRIGIDO

// Adicione este CSS no seu arquivo estilos.css para a animação funcionar
/*
.fade-in-element {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.fade-in-element.visible {
    opacity: 1;
    transform: translateY(0);
}
*/

console.log('🎓 Educar Aparecida - Landing Page carregada com sucesso!');