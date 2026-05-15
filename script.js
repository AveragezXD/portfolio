// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Remove active class from all buttons and tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        
        // Add active class to clicked button and corresponding tab
        this.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    const buttons = Array.from(document.querySelectorAll('.tab-btn'));
    const currentButton = document.querySelector('.tab-btn.active');
    const currentIndex = buttons.indexOf(currentButton);
    
    if (event.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex].click();
    } else if (event.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        buttons[prevIndex].click();
    }
});

// CTA Button - scroll to portfolio
document.querySelectorAll('.cta-btn').forEach(button => {
    if (button.textContent.includes('View My Work')) {
        button.addEventListener('click', function() {
            document.querySelector('[data-tab="portfolio"]').click();
        });
    }
});

// Contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Simple validation
        if (name && email && message) {
            // Show success message (in a real scenario, this would send to a server)
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '✨ Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(34, 197, 94, 0.4))';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                contactForm.reset();
            }, 3000);
        } else {
            alert('Please fill in all fields!');
        }
    });
}

// Portfolio item hover effect
document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) rotateY(5deg)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});