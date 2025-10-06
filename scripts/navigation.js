// Navigation and UI Management
class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupSearch();
        this.setupThemeToggle();
        this.setupActiveNavigation();
        this.setupSidebar();
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mainNav = document.getElementById('mainNav');

        if (mobileMenuBtn && mainNav) {
            mobileMenuBtn.addEventListener('click', () => {
                mainNav.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
                mainNav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }

    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Update active navigation
                    this.updateActiveNav(link);
                }
            });
        });
    }

    setupSearch() {
        const searchToggle = document.getElementById('searchToggle');
        const searchClose = document.getElementById('searchClose');
        const searchBar = document.getElementById('searchBar');

        if (searchToggle && searchBar) {
            searchToggle.addEventListener('click', () => {
                searchBar.classList.toggle('active');
                if (searchBar.classList.contains('active')) {
                    const searchInput = searchBar.querySelector('.search-input');
                    if (searchInput) searchInput.focus();
                }
            });
        }

        if (searchClose && searchBar) {
            searchClose.addEventListener('click', () => {
                searchBar.classList.remove('active');
            });
        }

        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar') && !e.target.closest('.search-toggle')) {
                searchBar.classList.remove('active');
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle?.querySelector('i');

        if (themeToggle) {
            // Check for saved theme preference or default to dark
            const savedTheme = localStorage.getItem('mathsmaster-theme') || 'dark';
            this.applyTheme(savedTheme);

            themeToggle.addEventListener('click', () => {
                const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                this.applyTheme(newTheme);
                localStorage.setItem('mathsmaster-theme', newTheme);
            });
        }
    }

    applyTheme(theme) {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle?.querySelector('i');

        if (theme === 'light') {
            document.body.classList.add('light-theme');
            if (themeIcon) {
                themeIcon.className = 'fas fa-sun';
            }
        } else {
            document.body.classList.remove('light-theme');
            if (themeIcon) {
                themeIcon.className = 'fas fa-moon';
            }
        }
    }

    setupActiveNavigation() {
        // Update active nav based on scroll position
        window.addEventListener('scroll', () => {
            this.updateActiveNavOnScroll();
        });

        // Initial update
        this.updateActiveNavOnScroll();
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSection}` || (currentSection === 'home' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    updateActiveNav(clickedLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
    }

    setupSidebar() {
        // Sidebar toggle for mobile
        const sidebar = document.getElementById('sidebar');
        const sidebarLinks = document.querySelectorAll('.sidebar-links a');

        // Auto-show sidebar on desktop, hide on mobile
        this.updateSidebarVisibility();

        window.addEventListener('resize', () => {
            this.updateSidebarVisibility();
        });

        // Handle sidebar link clicks
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth < 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    updateSidebarVisibility() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        if (window.innerWidth >= 768) {
            sidebar.classList.add('active');
        } else {
            sidebar.classList.remove('active');
        }
    }

    // Page navigation methods
    navigateTo(page) {
        this.currentPage = page;
        this.updatePageTitle(page);
        this.updateBreadcrumb(page);
        this.scrollToTop();
    }

    updatePageTitle(page) {
        const pageTitles = {
            'home': 'MathsMaster LK - Home',
            'trigonometry': 'Trigonometry Calculator - MathsMaster LK',
            'calculus': 'Calculus Tools - MathsMaster LK',
            'algebra': 'Algebra Solver - MathsMaster LK',
            'statistics': 'Statistics Calculator - MathsMaster LK',
            'mechanics': 'Mechanics Tools - MathsMaster LK',
            'pure-maths': 'Pure Mathematics - MathsMaster LK'
        };

        document.title = pageTitles[page] || 'MathsMaster LK';
    }

    updateBreadcrumb(page) {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (!breadcrumb) return;

        const breadcrumbMap = {
            'home': ['Home'],
            'trigonometry': ['Home', 'Trigonometry'],
            'calculus': ['Home', 'Calculus'],
            'algebra': ['Home', 'Algebra'],
            'statistics': ['Home', 'Statistics'],
            'mechanics': ['Home', 'Mechanics'],
            'pure-maths': ['Home', 'Pure Mathematics']
        };

        const items = breadcrumbMap[page] || ['Home'];
        breadcrumb.innerHTML = '';

        items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            const breadcrumbItem = document.createElement('span');
            
            if (isLast) {
                breadcrumbItem.className = 'breadcrumb-item active';
                breadcrumbItem.textContent = item;
            } else {
                breadcrumbItem.className = 'breadcrumb-item';
                const link = document.createElement('a');
                link.href = index === 0 ? 'index.html' : `#${item.toLowerCase()}`;
                link.textContent = item;
                breadcrumbItem.appendChild(link);
            }

            breadcrumb.appendChild(breadcrumbItem);

            if (!isLast) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = ' / ';
                breadcrumb.appendChild(separator);
            }
        });
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Utility methods
    showLoading(container) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        container.innerHTML = '';
        container.appendChild(spinner);
    }

    hideLoading(container) {
        const spinner = container.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}