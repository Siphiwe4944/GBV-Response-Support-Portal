// SafeVoice Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states to buttons
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                submitBtn.disabled = true;
            }
        });
    });

    // Emergency button click tracking
    document.querySelectorAll('.btn-emergency, .btn-emergency-call, .btn-emergency-footer').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // In a real application, this would log emergency calls for support purposes
            console.log('Emergency contact clicked:', this.href);
        });
    });

    // Auto-resize textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });

    // Form validation feedback
    document.querySelectorAll('.form-control, .form-select').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && this.value.trim()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    });

    // Character count for textareas
    document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        const charCounter = document.createElement('div');
        charCounter.className = 'form-text text-end';
        charCounter.innerHTML = `<span class="char-count">0</span>/${maxLength} characters`;
        textarea.parentNode.appendChild(charCounter);

        textarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            const counter = this.parentNode.querySelector('.char-count');
            counter.textContent = currentLength;
            
            if (currentLength > maxLength * 0.9) {
                counter.parentNode.classList.add('text-warning');
            } else {
                counter.parentNode.classList.remove('text-warning');
            }
        });
    });

    // Privacy mode toggle (for sensitive forms)
    const privacyToggle = document.getElementById('privacyMode');
    if (privacyToggle) {
        privacyToggle.addEventListener('change', function() {
            const sensitiveFields = document.querySelectorAll('.sensitive-field');
            sensitiveFields.forEach(field => {
                if (this.checked) {
                    field.type = 'password';
                } else {
                    field.type = 'text';
                }
            });
        });
    }

    // Auto-save for safety planning form
    const safetyPlanForm = document.querySelector('.safety-plan-form');
    if (safetyPlanForm) {
        const formInputs = safetyPlanForm.querySelectorAll('textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', debounce(function() {
                const formData = new FormData(safetyPlanForm);
                const data = Object.fromEntries(formData);
                localStorage.setItem('safetyPlanDraft', JSON.stringify(data));
                showAutoSaveIndicator();
            }, 2000));
        });

        // Load draft data
        const savedDraft = localStorage.getItem('safetyPlanDraft');
        if (savedDraft) {
            const draftData = JSON.parse(savedDraft);
            Object.keys(draftData).forEach(key => {
                const field = safetyPlanForm.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = draftData[key];
                }
            });
            showDraftLoadedMessage();
        }
    }

    // Clear stored draft when form is submitted
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            localStorage.removeItem('safetyPlanDraft');
        });
    });
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showAutoSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'auto-save-indicator';
    indicator.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i>Draft saved automatically';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateY(-20px)';
        setTimeout(() => indicator.remove(), 300);
    }, 3000);
}

function showDraftLoadedMessage() {
    const message = document.createElement('div');
    message.className = 'alert alert-info alert-dismissible fade show';
    message.innerHTML = `
        <i class="fas fa-info-circle me-2"></i>
        Your previous draft has been loaded. You can continue where you left off.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.querySelector('.safety-plan-form');
    if (form) {
        form.insertBefore(message, form.firstChild);
    }
}

// Security functions
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Export functions for use in other files
window.SafeVoice = {
    debounce,
    sanitizeInput,
    validatePhoneNumber,
    validateEmail,
    showAutoSaveIndicator
};