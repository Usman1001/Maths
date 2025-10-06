// UI Handler and Utility Functions
class UIHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupTooltips();
        this.setupModals();
        this.setupToast();
        this.setupFormValidation();
        this.setupExportHandlers();
    }

    // Toast Notification System
    setupToast() {
        // Toast container is already in the HTML
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        // Remove existing toast classes
        toast.className = 'toast';
        
        // Add type class and message
        toast.classList.add(type);
        toast.textContent = message;
        
        // Show toast
        toast.classList.add('show');

        // Auto hide after duration
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);

        // Return toast element for external control
        return toast;
    }

    // Tooltip System
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip);
            element.addEventListener('mouseleave', this.hideTooltip);
        });
    }

    showTooltip(e) {
        const tooltipText = e.target.getAttribute('data-tooltip');
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        
        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';

        e.target._currentTooltip = tooltip;
    }

    hideTooltip(e) {
        if (e.target._currentTooltip) {
            e.target._currentTooltip.remove();
            e.target._currentTooltip = null;
        }
    }

    // Modal System
    setupModals() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const modalId = trigger.getAttribute('data-modal');
                this.openModal(modalId);
            });
        });

        // Close modals when clicking outside or on close button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.active');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // Form Validation
    setupFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = field.getAttribute('data-required-message') || 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Number validation
        if (field.type === 'number' && value) {
            const numValue = parseFloat(value);
            const min = parseFloat(field.getAttribute('min'));
            const max = parseFloat(field.getAttribute('max'));

            if (isNaN(numValue)) {
                isValid = false;
                errorMessage = 'Please enter a valid number';
            } else if (min !== null && numValue < min) {
                isValid = false;
                errorMessage = `Value must be at least ${min}`;
            } else if (max !== null && numValue > max) {
                isValid = false;
                errorMessage = `Value must be at most ${max}`;
            }
        }

        // Pattern validation
        if (field.hasAttribute('pattern') && value) {
            const pattern = new RegExp(field.getAttribute('pattern'));
            if (!pattern.test(value)) {
                isValid = false;
                errorMessage = field.getAttribute('data-pattern-message') || 'Invalid format';
            }
        }

        // Update field state
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Export Handlers
    setupExportHandlers() {
        // PNG Export
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-export="png"]')) {
                this.exportAsPNG(e.target);
            }
            
            if (e.target.matches('[data-export="pdf"]')) {
                this.exportAsPDF(e.target);
            }
            
            if (e.target.matches('[data-export="svg"]')) {
                this.exportAsSVG(e.target);
            }
        });
    }

    exportAsPNG(button) {
        const canvas = button.closest('.graph-container')?.querySelector('canvas');
        if (!canvas) {
            this.showToast('No graph found to export', 'error');
            return;
        }

        try {
            const link = document.createElement('a');
            link.download = `mathsmaster-graph-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            this.showToast('Graph exported as PNG', 'success');
        } catch (error) {
            this.showToast('Failed to export graph', 'error');
            console.error('Export error:', error);
        }
    }

    exportAsPDF(button) {
        this.showToast('PDF export feature coming soon', 'info');
        // PDF export implementation would go here
    }

    exportAsSVG(button) {
        this.showToast('SVG export feature coming soon', 'info');
        // SVG export implementation would go here
    }

    // Utility Methods
    formatNumber(num, precision = 2) {
        if (typeof num !== 'number') return num;
        
        // Handle very small numbers
        if (Math.abs(num) < 0.0001 && num !== 0) {
            return num.toExponential(precision);
        }
        
        // Handle numbers that need scientific notation
        if (Math.abs(num) >= 1000000) {
            return num.toExponential(precision);
        }
        
        return parseFloat(num.toFixed(precision));
    }

    debounce(func, wait) {
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Local Storage Utilities
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`mathsmaster-${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to storage:', error);
            return false;
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`mathsmaster-${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from storage:', error);
            return null;
        }
    }

    removeFromStorage(key) {
        try {
            localStorage.removeItem(`mathsmaster-${key}`);
            return true;
        } catch (error) {
            console.error('Failed to remove from storage:', error);
            return false;
        }
    }

    // Animation Helpers
    animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (range * easeOutQuart);
            
            element.textContent = this.formatNumber(current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update.bind(this));
    }

    // Copy to Clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard', 'success');
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            this.showToast('Failed to copy to clipboard', 'error');
            return false;
        }
    }
}

// Initialize UI handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiHandler = new UIHandler();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIHandler;
}