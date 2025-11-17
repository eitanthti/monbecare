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

// This is now only visual, Netlify submission uses fetch from entries
function populateReviewFormFields(entries) {
    const container = document.getElementById('finalFieldsContainer');
    if (!container) return;
    container.innerHTML = '';

    entries.forEach(({ name, value }) => {
        if (name === 'form-name' || name === 'bot-field') return;

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        container.appendChild(input);
    });
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

    // Show a nice summary
    populateReviewSummary(entries);
    // Optional: keep hidden inputs for debugging etc.
    populateReviewFormFields(entries);

    const editBtn = document.getElementById('editInterviewBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            window.location.href = 'interview.html';
        });
    }

    reviewForm.addEventListener('submit', function () {
        // Clear sessionStorage on submit - let the form submit normally to Netlify
        // All hidden inputs created by populateReviewFormFields() will be submitted
        sessionStorage.removeItem('interviewSubmission');
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