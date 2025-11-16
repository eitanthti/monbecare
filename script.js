// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('mobile-open');
}

// Password protection for pitch page
function checkPassword(event) {
    event.preventDefault();
    
    const password = document.getElementById('passwordInput').value;
    const correctPassword = 'monbe2025';
    const errorElement = document.getElementById('passwordError');
    
    if (password === correctPassword) {
        // Hide password container and show pitch content
        document.getElementById('passwordContainer').style.display = 'none';
        document.getElementById('pitchContent').classList.add('unlocked');
        
        // Store access in session
        sessionStorage.setItem('pitchAccess', 'granted');
    } else {
        // Show error message
        errorElement.classList.add('show');
        document.getElementById('passwordInput').value = '';
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorElement.classList.remove('show');
        }, 3000);
    }
}

// Check if user already has access when navigating to pitch page
function checkPitchAccess() {
    // Session-based access
    if (sessionStorage.getItem('pitchAccess') === 'granted') {
        const passwordContainer = document.getElementById('passwordContainer');
        const pitchContent = document.getElementById('pitchContent');
        if (passwordContainer && pitchContent) {
            passwordContainer.style.display = 'none';
            pitchContent.classList.add('unlocked');
        }
        return;
    }

    // URL parameter based access (e.g., pitch.html?access=monbe2025)
    const urlParams = new URLSearchParams(window.location.search);
    const accessParam = urlParams.get('access');
    if (accessParam && accessParam === 'monbe2025') {
        sessionStorage.setItem('pitchAccess', 'granted');
        const passwordContainer = document.getElementById('passwordContainer');
        const pitchContent = document.getElementById('pitchContent');
        if (passwordContainer && pitchContent) {
            passwordContainer.style.display = 'none';
            pitchContent.classList.add('unlocked');
        }
        // Clean the URL so the param doesn't persist on refresh/share
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
}

// Form submission handler for contact form
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Simple validation
            if (firstName && lastName && email && message) {
                // Submit to Netlify
                fetch('/', {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(formData).toString()
                })
                .then(() => {
                    alert('Thank you for your message! We\'ll get back to you soon.');
                    this.reset();
                })
                .catch((error) => {
                    alert('Sorry, there was an error sending your message. Please try again.');
                });
            } else {
                // Show exactly which fields are missing
                const missing = [];
                if (!firstName) missing.push('First Name');
                if (!lastName) missing.push('Last Name');
                if (!email) missing.push('Email');
                if (!message) missing.push('Message');
                alert('Please fill in all required fields. Missing: ' + missing.join(', '));
            }
        });
    }
}

// Form submission handler for interview form
function handleInterviewForm() {
    const interviewForm = document.getElementById('interviewForm');
    if (!interviewForm) {
        console.error('Interview form not found!');
        return;
    }
    
    console.log('Interview form handler attached');
    
    interviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submit event triggered');
        
        // Check if form is valid using HTML5 validation first
        if (!this.checkValidity()) {
            console.log('Form validation failed');
            this.reportValidity();
            return;
        }
        
        console.log('Form HTML5 validation passed');
        
        // Validate checkboxes - at least one professional support must be selected per child
        const numberOfChildren = parseInt(document.getElementById('numberOfChildren')?.value) || 0;
        console.log('Number of children:', numberOfChildren);
        
        let checkboxValid = true;
        let missingCheckboxes = [];
        
        for (let i = 1; i <= numberOfChildren; i++) {
            const checkboxes = document.querySelectorAll(`input[name="professionalSupport_child${i}"]`);
            const checked = Array.from(checkboxes).some(cb => cb.checked);
            if (!checked) {
                checkboxValid = false;
                missingCheckboxes.push(`Child ${i}`);
            }
        }
        
        if (!checkboxValid) {
            alert('Please select at least one option for professional breastfeeding support for: ' + missingCheckboxes.join(', '));
            return;
        }
        
        // Validate aids checkboxes - at least one aid must be selected per child
        let aidsCheckboxValid = true;
        let missingAidsCheckboxes = [];
        
        for (let i = 1; i <= numberOfChildren; i++) {
            const aidsCheckboxes = document.querySelectorAll(`input[name="aidsUsed_child${i}"]`);
            const checked = Array.from(aidsCheckboxes).some(cb => cb.checked);
            if (!checked) {
                aidsCheckboxValid = false;
                missingAidsCheckboxes.push(`Child ${i}`);
            }
        }
        
        if (!aidsCheckboxValid) {
            alert('Please select at least one option for aids used during the first periods for: ' + missingAidsCheckboxes.join(', '));
            return;
        }
        
        // Get form data using FormData (handles most fields automatically)
        const formData = new FormData(this);
        console.log('Form data collected, submitting...');
        
        // Build URL-encoded string, handling multiple checkbox values
        // Netlify Forms expects URL-encoded format with form-name
        const formDataPairs = [];
        
        // Process all inputs to handle multiple checkbox values correctly
        const inputs = this.querySelectorAll('input, select, textarea');
        const processedFields = new Set();
        
        inputs.forEach(input => {
            const name = input.name;
            if (!name || processedFields.has(name)) return;
            
            if (input.type === 'checkbox') {
                // Handle checkboxes - collect all checked values with the same name
                const checkboxes = this.querySelectorAll(`input[name="${name}"]:checked`);
                checkboxes.forEach(cb => {
                    formDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(cb.value));
                });
                processedFields.add(name);
            } else if (input.type === 'radio') {
                // Handle radio buttons - only the checked one
                const checked = this.querySelector(`input[name="${name}"]:checked`);
                if (checked) {
                    formDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(checked.value));
                    processedFields.add(name);
                }
            } else {
                // For all other inputs (text, select, textarea, hidden, etc.)
                const value = input.value || '';
                formDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
                processedFields.add(name);
            }
        });
        
        // Ensure form-name is first (Netlify requirement)
        const formNameIndex = formDataPairs.findIndex(pair => pair.startsWith('form-name='));
        if (formNameIndex > 0) {
            // Move form-name to the beginning
            const formNamePair = formDataPairs.splice(formNameIndex, 1)[0];
            formDataPairs.unshift(formNamePair);
        } else if (formNameIndex === -1) {
            // Add form-name if missing
            formDataPairs.unshift('form-name=' + encodeURIComponent('interview'));
        }
        
        const formDataString = formDataPairs.join('&');
        console.log('Submitting form data (full):', formDataString);
        console.log('Form data length:', formDataString.length);
        console.log('Number of field pairs:', formDataPairs.length);
        
        // Submit to Netlify Forms
        // Netlify Forms expects POST to the same URL with form-name in the body
        fetch('/', {
            method: 'POST',
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formDataString
        })
        .then(async (response) => {
            console.log('Form submission response status:', response.status);
            console.log('Form submission response headers:', response.headers);
            
            // Try to read response text for debugging
            const responseText = await response.text();
            console.log('Form submission response body (first 500 chars):', responseText.substring(0, 500));
            
            // Netlify Forms returns 200 on success, sometimes with a redirect
            if (response.ok || response.status === 200 || response.status === 302) {
                console.log('Form submitted successfully to Netlify');
                // Get current language for thank you message
                const currentLang = localStorage.getItem('selectedLanguage') || 'en';
                const thankYouMessages = {
                    en: 'Thank you! We will be in touch soon.',
                    de: 'Vielen Dank! Wir werden uns bald bei Ihnen melden.',
                    fr: 'Merci! Nous vous contacterons bientôt.',
                    he: 'תודה! ניצור קשר בקרוב.',
                    ar: 'شكراً! سنتواصل معك قريباً.',
                    es: '¡Gracias! Nos pondremos en contacto pronto.'
                };
                const thankYouMessage = thankYouMessages[currentLang] || thankYouMessages.en;
                
                alert(thankYouMessage);
                
                // Reset form
                this.reset();
                
                // Clear dynamically generated fields
                const agesContainer = document.getElementById('childrenAgesContainer');
                const questionsContainer = document.getElementById('childrenQuestionsContainer');
                if (agesContainer) agesContainer.innerHTML = '';
                if (questionsContainer) questionsContainer.innerHTML = '';
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch((error) => {
            console.error('Form submission error:', error);
            const currentLang = localStorage.getItem('selectedLanguage') || 'en';
            const errorMessages = {
                en: 'Sorry, there was an error submitting your survey. Please try again.',
                de: 'Entschuldigung, beim Absenden Ihrer Umfrage ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
                fr: 'Désolé, une erreur s\'est produite lors de l\'envoi de votre questionnaire. Veuillez réessayer.',
                he: 'מצטערים, אירעה שגיאה בשליחת השאלון. אנא נסה שוב.',
                ar: 'عذراً، حدث خطأ أثناء إرسال الاستبيان. يرجى المحاولة مرة أخرى.',
                es: 'Lo sentimos, hubo un error al enviar su cuestionario. Por favor, inténtelo de nuevo.'
            };
            const errorMessage = errorMessages[currentLang] || errorMessages.en;
            alert(errorMessage);
        });
    });
}

// Animation sequence for home page
function startAnimation() {
    const hero = document.querySelector('.hero');
    const brandName = document.getElementById('brandName');
    const tagline = document.getElementById('tagline');
    const connectBtn = document.getElementById('connectBtn');

    if (!hero || !brandName || !tagline || !connectBtn) return;

    // Step 1: After 1 second, start fade out of MonBe and transition background
    setTimeout(function() {
        brandName.classList.add('fade-out');
        hero.classList.add('color-transition');
    }, 1000);

    // Step 2: After 1.5 seconds, fade in the tagline (overlapping with MonBe fade)
    setTimeout(function() {
        tagline.classList.add('fade-in');
    }, 1500);

    // Step 3: After 2.5 seconds, fade in the button
    setTimeout(function() {
        connectBtn.classList.add('fade-in');
    }, 2500);
}

// FAQ Toggle Function
function toggleFAQ(faqNumber) {
    const answer = document.getElementById(`faq-${faqNumber}`);
    const icon = answer.previousElementSibling.querySelector('.faq-icon');
    const question = answer.previousElementSibling;
    
    if (answer.style.maxHeight === '0px' || answer.style.maxHeight === '') {
        // Close all other FAQs
        document.querySelectorAll('.faq-answer').forEach(faq => {
            if (faq.id !== `faq-${faqNumber}`) {
                faq.style.maxHeight = '0px';
                faq.previousElementSibling.querySelector('.faq-icon').textContent = '+';
                faq.previousElementSibling.style.backgroundColor = '';
            }
        });
        
        // Open current FAQ
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.textContent = '−';
        question.style.backgroundColor = '#f8f9fa';
    } else {
        // Close current FAQ
        answer.style.maxHeight = '0px';
        icon.textContent = '+';
        question.style.backgroundColor = '';
    }
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing pitch access
    checkPitchAccess();
    
    // Handle contact form
    handleContactForm();
    
    // Handle interview form
    handleInterviewForm();
    
    // Start animation sequence for home page after 0.5 seconds
    setTimeout(function() {
        startAnimation();
    }, 500);

    // (Removed QR rendering on-site by request)
});
