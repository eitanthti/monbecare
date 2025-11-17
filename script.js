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
        setTimeout(function () {
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
        // Clean the URL so the param does not persist on refresh/share
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
}

// Form submission handler for contact form
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        // Form does not exist on this page - silently return
        return;
    }

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const message = formData.get('message');

        // Simple validation
        if (firstName && lastName && email && message) {
            // Ensure form-name is included (Netlify requirement)
            if (!formData.has('form-name')) {
                formData.append('form-name', 'contact');
            }

            // Encode data
            const encodedData = new URLSearchParams(formData).toString();
            console.log('Contact form data:', encodedData.substring(0, 200));

            // Submit to Netlify
            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: encodedData
            })
                .then(function (response) {
                    console.log('Contact form response status:', response.status);
                    if (response.ok || response.status === 200) {
                        alert("Thank you for your message! We will get back to you soon.");
                        contactForm.reset();
                    } else {
                        console.error('Contact form submission failed with status:', response.status);
                        alert('Sorry, there was an error sending your message. Please try again.');
                    }
                })
                .catch(function (error) {
                    console.error('Contact form submission error:', error);
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

// Form submission handler for interview form
// Step 1 - validate and store answers in sessionStorage, then go to review page
function handleInterviewForm() {
    const interviewForm = document.getElementById('interviewForm');
    if (!interviewForm) return;

    interviewForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // HTML5 validation
        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const numChildren = parseInt(
            document.getElementById('numberOfChildren').value || '0',
            10
        );

        let missingPS = [];
        let missingAids = [];

        for (let i = 1; i <= numChildren; i++) {
            const ps = document.querySelectorAll(
                'input[name="professionalSupport_child' + i + '"]'
            );
            const aids = document.querySelectorAll(
                'input[name="aidsUsed_child' + i + '"]'
            );

            if (!Array.from(ps).some(cb => cb.checked)) {
                missingPS.push('Child ' + i);
            }
            if (!Array.from(aids).some(cb => cb.checked)) {
                missingAids.push('Child ' + i);
            }
        }

        if (missingPS.length > 0) {
            alert(
                'Select at least one professional support option for: ' +
                missingPS.join(', ')
            );
            return;
        }

        if (missingAids.length > 0) {
            alert(
                'Select at least one aids option for: ' +
                missingAids.join(', ')
            );
            return;
        }

        const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        const formData = new FormData(this);
        formData.set('selectedLanguage', selectedLanguage);

        const entries = [];
        formData.forEach((value, key) => {
            // Do not store Netlify meta fields
            if (key === 'form-name' || key === 'bot-field') return;
            entries.push({ name: key, value: value });
        });

        // Store in sessionStorage for the review page
        sessionStorage.setItem('interviewSubmission', JSON.stringify(entries));

        // Go to review page
        window.location.href = 'interview-review.html';
    });
}

function getReviewLabel(fieldName) {
    if (fieldName === 'firstName') return 'First name';
    if (fieldName === 'lastName') return 'Last name';
    if (fieldName === 'email') return 'Email';
    if (fieldName === 'phone') return 'Phone number';
    if (fieldName === 'numberOfChildren') return 'Number of children';
    if (fieldName === 'selectedLanguage') return 'Selected language';

    let m = fieldName.match(/^childAgeYears_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - age (years)';
    m = fieldName.match(/^childAgeMonths_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - age (months)';

    m = fieldName.match(/^feeding0to3_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - feeding age 0 to 3 months';
    m = fieldName.match(/^feeding3to6_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - feeding age 3 to 6 months';
    m = fieldName.match(/^feeding6to12_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - feeding age 6 to 12 months';
    m = fieldName.match(/^breastfeedingAfter1_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - breastfeeding after age 1';
    m = fieldName.match(/^section3AdditionalComments_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - feeding comments';

    m = fieldName.match(/^stoppedAgeYears_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - age stopped breastfeeding (years)';
    m = fieldName.match(/^stoppedAgeMonths_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - age stopped breastfeeding (months)';
    m = fieldName.match(/^stoppingReason_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - reason for stopping breastfeeding';
    m = fieldName.match(/^notBreastfeedingReason_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - reason for not breastfeeding';

    m = fieldName.match(/^professionalSupport_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - professional support';
    m = fieldName.match(/^aidsUsed_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - aids used';
    m = fieldName.match(/^section3Comments_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - additional comments';

    if (fieldName === 'productInterest') return 'Interest in breastfeeding monitor';
    if (fieldName === 'importantFeatures') return 'Important features';
    if (fieldName === 'interviewMethod') return 'Preferred interview method';
    if (fieldName === 'bestTime') return 'Best time to reach you';
    if (fieldName === 'additionalComments') return 'Additional comments';

    return fieldName;
}

function populateReviewSummary(entries) {
    const summaryList = document.getElementById('reviewSummaryList');
    if (!summaryList) return;

    summaryList.innerHTML = '';

    const grouped = {};
    entries.forEach(({ name, value }) => {
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(value);
    });

    Object.keys(grouped).forEach((name) => {
        const values = grouped[name];

        const row = document.createElement('div');
        row.className = 'review-row';

        const label = document.createElement('span');
        label.className = 'review-label';
        label.textContent = getReviewLabel(name);

        const val = document.createElement('span');
        val.className = 'review-value';
        val.textContent = values.join(', ');

        row.appendChild(label);
        row.appendChild(val);
        summaryList.appendChild(row);
    });
}

// Create hidden form inputs for all entries - Netlify will submit these naturally
function populateReviewFormFields(entries) {
    const container = document.getElementById('finalFieldsContainer');
    if (!container) return;
    container.innerHTML = '';

    // Group entries by name to handle multiple values (checkboxes)
    const groupedEntries = {};
    entries.forEach(({ name, value }) => {
        if (name === 'form-name' || name === 'bot-field') return;
        if (!groupedEntries[name]) {
            groupedEntries[name] = [];
        }
        groupedEntries[name].push(value);
    });

    // Create hidden inputs for all fields
    // For fields with multiple values (checkboxes), create multiple inputs with same name
    Object.keys(groupedEntries).forEach(name => {
        groupedEntries[name].forEach(value => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            container.appendChild(input);
        });
    });

    console.log('Created hidden inputs for', Object.keys(groupedEntries).length, 'unique field names');
    console.log('Total hidden inputs:', container.querySelectorAll('input[type="hidden"]').length);
}

// Step 2 on review page - show summary and send to Netlify on confirm
function handleInterviewReviewPage() {
    const reviewForm = document.getElementById('interviewReviewForm');
    if (!reviewForm) return;

    const stored = sessionStorage.getItem('interviewSubmission');
    if (!stored) {
        window.location.href = 'interview.html';
        return;
    }

    const entries = JSON.parse(stored);
    console.log('Review page - entries loaded:', entries.length, 'fields');
    console.log('Sample entries:', entries.slice(0, 5));

    // Show a nice summary
    populateReviewSummary(entries);
    // Create hidden inputs for Netlify submission
    populateReviewFormFields(entries);
    
    // Verify hidden inputs were created
    const container = document.getElementById('finalFieldsContainer');
    if (container) {
        const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
        console.log('Hidden inputs created:', hiddenInputs.length);
        if (hiddenInputs.length > 0) {
            console.log('Sample hidden input:', hiddenInputs[0].name, '=', hiddenInputs[0].value);
        }
    }

    const editBtn = document.getElementById('editInterviewBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            window.location.href = 'interview.html';
        });
    }

    reviewForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get the stored entries from sessionStorage (this is the source of truth)
        const stored = sessionStorage.getItem('interviewSubmission');
        if (!stored) {
            alert('No form data found. Please go back and fill out the form again.');
            window.location.href = 'interview.html';
            return;
        }

        const entries = JSON.parse(stored);
        console.log('Submitting interview form with', entries.length, 'total entries from sessionStorage');

        // Verify hidden inputs were created
        const container = document.getElementById('finalFieldsContainer');
        const hiddenInputs = container ? container.querySelectorAll('input[type="hidden"]') : [];
        console.log('Hidden inputs in DOM:', hiddenInputs.length);
        
        if (hiddenInputs.length === 0) {
            alert('No form data found. Please go back and fill out the form again.');
            window.location.href = 'interview.html';
            return;
        }

        // Build FormData explicitly from entries to ensure ALL data is included
        // This is more reliable than relying on FormData(this) for dynamically added fields
        const formData = new FormData();
        
        // Add form-name (required by Netlify)
        formData.append('form-name', 'interview');
        
        // Add bot-field (empty, for honeypot)
        formData.append('bot-field', '');
        
        // Add ALL entries from sessionStorage (this ensures we get everything from interview-review)
        // Group entries by name to handle multiple values (checkboxes)
        const groupedEntries = {};
        entries.forEach(({ name, value }) => {
            // Skip Netlify meta fields (we already added them above)
            if (name === 'form-name' || name === 'bot-field') return;
            
            if (!groupedEntries[name]) {
                groupedEntries[name] = [];
            }
            groupedEntries[name].push(value);
        });

        // Add all fields to FormData (multiple values for checkboxes)
        Object.keys(groupedEntries).forEach(name => {
            groupedEntries[name].forEach(value => {
                formData.append(name, value);
            });
        });

        // Verify all fields are in FormData
        const allFieldNames = Array.from(formData.keys());
        console.log('Total unique field names in FormData:', allFieldNames.length);
        console.log('Field names:', allFieldNames);
        
        // Count total entries (including multiple values for same field)
        let totalEntries = 0;
        formData.forEach(() => totalEntries++);
        console.log('Total field entries (including multiple values):', totalEntries);
        
        // Log sample values for verification
        const sampleFields = [];
        formData.forEach((value, key) => {
            if (sampleFields.length < 15) {
                const displayValue = typeof value === 'string' ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : value;
                sampleFields.push(key + '=' + displayValue);
            }
        });
        console.log('Sample fields being submitted:', sampleFields);
        
        // Submit to Netlify using AJAX (as per Netlify docs for JavaScript-rendered forms)
        // Requirements: URL-encode body, include Content-Type header
        const encodedData = new URLSearchParams(formData).toString();
        console.log('Encoded data length:', encodedData.length, 'characters');
        
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: encodedData
        })
            .then(function (response) {
                console.log('Interview form response status:', response.status);
                if (response.ok || response.status === 200) {
                    // Clear sessionStorage on success
                    sessionStorage.removeItem('interviewSubmission');
                    alert("Thank you! Your interview submission has been received. We'll be in touch soon.");
                    // Redirect to home page
                    window.location.href = 'index.html';
                } else {
                    console.error('Interview form submission failed with status:', response.status);
                    alert('Sorry, there was an error submitting your form. Please try again.');
                }
            })
            .catch(function (error) {
                console.error('Interview form submission error:', error);
                alert('Sorry, there was an error submitting your form. Please try again.');
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
    setTimeout(function () {
        brandName.classList.add('fade-out');
        hero.classList.add('color-transition');
    }, 1000);

    // Step 2: After 1.5 seconds, fade in the tagline
    setTimeout(function () {
        tagline.classList.add('fade-in');
    }, 1500);

    // Step 3: After 2.5 seconds, fade in the button
    setTimeout(function () {
        connectBtn.classList.add('fade-in');
    }, 2500);
}

// FAQ Toggle Function
function toggleFAQ(faqNumber) {
    const answer = document.getElementById('faq-' + faqNumber);
    const icon = answer.previousElementSibling.querySelector('.faq-icon');
    const question = answer.previousElementSibling;

    if (answer.style.maxHeight === '0px' || answer.style.maxHeight === '') {
        // Close all other FAQs
        document.querySelectorAll('.faq-answer').forEach(function (faq) {
            if (faq.id !== 'faq-' + faqNumber) {
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
document.addEventListener('DOMContentLoaded', function () {
    // Check for existing pitch access
    checkPitchAccess();

    // Handle contact form
    handleContactForm();

    // Handle interview form (on interview.html)
    handleInterviewForm();

    // Handle review page (on interview-review.html)
    handleInterviewReviewPage();

    // Start animation sequence for home page after 0.5 seconds
    setTimeout(function () {
        startAnimation();
    }, 500);

    // (Removed QR rendering on-site by request)
});