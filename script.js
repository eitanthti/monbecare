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
        document.getElementById('passwordContainer').style.display = 'none';
        document.getElementById('pitchContent').classList.add('unlocked');
        sessionStorage.setItem('pitchAccess', 'granted');
    } else {
        errorElement.classList.add('show');
        document.getElementById('passwordInput').value = '';
        setTimeout(function () {
            errorElement.classList.remove('show');
        }, 3000);
    }
}

// Check if user already has access when navigating to pitch page
function checkPitchAccess() {
    if (sessionStorage.getItem('pitchAccess') === 'granted') {
        const passwordContainer = document.getElementById('passwordContainer');
        const pitchContent = document.getElementById('pitchContent');
        if (passwordContainer && pitchContent) {
            passwordContainer.style.display = 'none';
            pitchContent.classList.add('unlocked');
        }
        return;
    }

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
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
}

// Form submission handler for contact form
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const message = formData.get('message');

        if (firstName && lastName && email && message) {
            if (!formData.has('form-name')) {
                formData.append('form-name', 'contact');
            }

            const encodedData = new URLSearchParams(formData).toString();

            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: encodedData
            })
                .then(function (response) {
                    if (response.ok || response.status === 200) {
                        alert("Thank you for your message! We will get back to you soon.");
                        contactForm.reset();
                    } else {
                        alert('Sorry, there was an error sending your message. Please try again.');
                    }
                })
                .catch(function (error) {
                    console.error('Contact form error:', error);
                    alert('Sorry, there was an error sending your message. Please try again.');
                });
        } else {
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
function handleInterviewForm() {
    const interviewForm = document.getElementById('interviewForm');
    if (!interviewForm) return;

    interviewForm.addEventListener('submit', function (e) {
        e.preventDefault();

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
            if (key === 'form-name' || key === 'bot-field') return;
            entries.push({ name: key, value: value });
        });

        sessionStorage.setItem('interviewSubmission', JSON.stringify(entries));
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

function populateReviewFormFields(entries) {
    const container = document.getElementById('formFieldsContainer');
    if (!container) {
        console.error('❌ formFieldsContainer not found!');
        return 0;
    }
    
    container.innerHTML = '';
    console.log('=== POPULATING REAL FORM FIELDS ===');

    // Group entries by name (for checkboxes that have multiple values)
    const grouped = {};
    entries.forEach(({ name, value }) => {
        if (name === 'form-name' || name === 'bot-field') return;
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(value || '');
    });

    let fieldCount = 0;
    
    // Create real form fields based on field type
    Object.keys(grouped).forEach((name) => {
        const values = grouped[name];
        
        // Determine field type based on name pattern
        if (name.includes('professionalSupport_') || name.includes('aidsUsed_')) {
            // Checkboxes - create one for each value
            values.forEach((value) => {
                if (value) { // Only create if value exists
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = name;
                    checkbox.value = value;
                    checkbox.checked = true; // They were selected
                    container.appendChild(checkbox);
                    fieldCount++;
                }
            });
        } else if (name.includes('importantFeatures') || 
                   name.includes('additionalComments') || 
                   name.includes('section3AdditionalComments_') ||
                   name.includes('stoppingReason_') ||
                   name.includes('section3Comments_')) {
            // Textareas
            const textarea = document.createElement('textarea');
            textarea.name = name;
            textarea.value = values[0] || '';
            container.appendChild(textarea);
            fieldCount++;
        } else if (name.includes('productInterest') ||
                   name.includes('interviewMethod') ||
                   name.includes('feeding') ||
                   name.includes('breastfeedingAfter') ||
                   name.includes('stoppedAgeYears') ||
                   name.includes('stoppedAgeMonths') ||
                   name.includes('notBreastfeedingReason')) {
            // Selects - create select with value
            const select = document.createElement('select');
            select.name = name;
            const option = document.createElement('option');
            option.value = values[0] || '';
            option.textContent = values[0] || '';
            option.selected = true;
            select.appendChild(option);
            container.appendChild(select);
            fieldCount++;
        } else {
            // Regular text/number inputs
            const input = document.createElement('input');
            input.type = 'text';
            input.name = name;
            input.value = values[0] || '';
            container.appendChild(input);
            fieldCount++;
        }
        
        // Debug first 5 fields
        if (fieldCount <= 5) {
            console.log('Created field:', name, '=', (values[0] || '').substring(0, 50));
        }
    });

    console.log('✅ Created', fieldCount, 'real form fields');
    
    // Verify they're in the DOM and form
    const allFields = container.querySelectorAll('input, select, textarea');
    console.log('Verification: Found', allFields.length, 'form fields in DOM');
    
    const form = document.getElementById('interviewReviewForm');
    if (form) {
        const fieldsInForm = form.querySelectorAll('input, select, textarea');
        console.log('Fields inside form:', fieldsInForm.length);
    }
    
    return fieldCount;
}

// Step 2 on review page - CRITICAL FIX
function handleInterviewReviewPage() {
    const reviewForm = document.getElementById('interviewReviewForm');
    if (!reviewForm) return;

    const stored = sessionStorage.getItem('interviewSubmission');
    if (!stored) {
        window.location.href = 'interview.html';
        return;
    }

    const entries = JSON.parse(stored);
    console.log('=== REVIEW PAGE LOADED ===');
    console.log('Entries from sessionStorage:', entries.length);

    // Show summary
    populateReviewSummary(entries);
    
    // Create hidden inputs IMMEDIATELY
    const inputCount = populateReviewFormFields(entries);
    
    if (inputCount === 0) {
        console.error('❌ CRITICAL: No hidden inputs were created!');
        alert('Error loading form data. Please go back and try again.');
        return;
    }

    const editBtn = document.getElementById('editInterviewBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            window.location.href = 'interview.html';
        });
    }

    // Form submission to Netlify
    reviewForm.addEventListener('submit', function (e) {
        console.log('=== FORM SUBMISSION STARTED ===');

        const container = document.getElementById('formFieldsContainer');
        const formFields = container ? container.querySelectorAll('input, select, textarea') : [];
        
        console.log('Form fields at submit time:', formFields.length);
        
        // Validate that we have data
        if (formFields.length === 0) {
            e.preventDefault(); // Only prevent if no data
            alert('No form data found. Please go back and fill out the form again.');
            window.location.href = 'interview.html';
            return;
        }

        // Verify all fields are actually in the form
        const allFormFields = reviewForm.querySelectorAll('input, select, textarea');
        console.log('Total form fields in form:', allFormFields.length);
        
        if (allFormFields.length < formFields.length) {
            console.warn('⚠️ Some form fields may not be in the form!');
        }

        // Log what we're submitting (first 5 fields for debugging)
        console.log('Submitting to Netlify with', formFields.length, 'fields');
        formFields.forEach(function(field, index) {
            if (index < 5) {
                const value = field.type === 'checkbox' ? (field.checked ? field.value : '') : field.value;
                console.log('Field:', field.name, '=', (value || '').substring(0, 50));
            }
        });
        
        // Clean up sessionStorage
        sessionStorage.removeItem('interviewSubmission');
        
        // Let the form submit naturally to Netlify
        // (don't call preventDefault, so natural HTML form submission happens)
        console.log('Form submitting naturally to Netlify with real form fields...');
    });
}

// Animation sequence for home page
function startAnimation() {
    const hero = document.querySelector('.hero');
    const brandName = document.getElementById('brandName');
    const tagline = document.getElementById('tagline');
    const connectBtn = document.getElementById('connectBtn');

    if (!hero || !brandName || !tagline || !connectBtn) return;

    setTimeout(function () {
        brandName.classList.add('fade-out');
        hero.classList.add('color-transition');
    }, 1000);

    setTimeout(function () {
        tagline.classList.add('fade-in');
    }, 1500);

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
        document.querySelectorAll('.faq-answer').forEach(function (faq) {
            if (faq.id !== 'faq-' + faqNumber) {
                faq.style.maxHeight = '0px';
                faq.previousElementSibling.querySelector('.faq-icon').textContent = '+';
                faq.previousElementSibling.style.backgroundColor = '';
            }
        });

        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.textContent = '−';
        question.style.backgroundColor = '#f8f9fa';
    } else {
        answer.style.maxHeight = '0px';
        icon.textContent = '+';
        question.style.backgroundColor = '';
    }
}

// ============================================
// VERSION - UPDATE THIS WITH EACH COMMIT
// ============================================
const APP_VERSION = '1.3.1';
// ============================================

// Version logging
function logVersion() {
    console.log('v' + APP_VERSION);
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function () {
    // Log version on every page load
    logVersion();
    
    checkPitchAccess();
    handleContactForm();
    handleInterviewForm();
    handleInterviewReviewPage();

    setTimeout(function () {
        startAnimation();
    }, 500);
});