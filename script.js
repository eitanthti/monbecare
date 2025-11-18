// ============================================
// IN-MEMORY + SESSION STORAGE WRAPPER
// ============================================
// Uses sessionStorage when available so data survives between pages
// Falls back to simple in-memory object if not available (for bots, old browsers, etc.)
const inMemoryStorage = (() => {
    const memoryStore = {
        data: {},
        getItem: function (key) {
            return Object.prototype.hasOwnProperty.call(this.data, key)
                ? this.data[key]
                : null;
        },
        setItem: function (key, value) {
            this.data[key] = String(value);
        },
        removeItem: function (key) {
            delete this.data[key];
        }
    };

    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            return {
                getItem: function (key) {
                    return window.sessionStorage.getItem(key);
                },
                setItem: function (key, value) {
                    window.sessionStorage.setItem(key, String(value));
                },
                removeItem: function (key) {
                    window.sessionStorage.removeItem(key);
                }
            };
        }
    } catch (err) {
        console.warn('Session storage not available - using in-memory fallback', err);
    }

    return memoryStore;
})();

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('mobile-open');
    }
}

// Password protection for pitch page
function checkPassword(event) {
    event.preventDefault();

    const passwordInput = document.getElementById('passwordInput');
    const errorElement = document.getElementById('passwordError');
    
    if (!passwordInput || !errorElement) return;

    const password = passwordInput.value.trim();
    const correctPassword = 'monbe2025'; // Note: Move to server-side for real security
    
    if (password === correctPassword) {
        const passwordContainer = document.getElementById('passwordContainer');
        const pitchContent = document.getElementById('pitchContent');
        
        if (passwordContainer && pitchContent) {
            passwordContainer.style.display = 'none';
            pitchContent.classList.add('unlocked');
            inMemoryStorage.setItem('pitchAccess', 'granted');
        }
    } else {
        errorElement.classList.add('show');
        passwordInput.value = '';
        setTimeout(function () {
            errorElement.classList.remove('show');
        }, 3000);
    }
}

// Check if user already has access when navigating to pitch page
function checkPitchAccess() {
    if (inMemoryStorage.getItem('pitchAccess') === 'granted') {
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
        inMemoryStorage.setItem('pitchAccess', 'granted');
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

// Sanitize input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Form submission handler for contact form
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const firstName = sanitizeInput(formData.get('firstName'));
        const lastName = sanitizeInput(formData.get('lastName'));
        const email = sanitizeInput(formData.get('email'));
        const message = sanitizeInput(formData.get('message'));

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
                    if (response.ok) {
                        alert("Thank you for your message! We will get back to you soon.");
                        contactForm.reset();
                    } else {
                        throw new Error('Form submission failed');
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

        const numChildrenInput = document.getElementById('numberOfChildren');
        if (!numChildrenInput) return;

        const numChildren = parseInt(numChildrenInput.value || '0', 10);

        let missingPS = [];
        let missingAids = [];

        for (let i = 1; i <= numChildren; i++) {
            const ps = document.querySelectorAll(
                'input[name="professionalSupport_child' + i + '"]'
            );
            const aids = document.querySelectorAll(
                'input[name="aidsUsed_child' + i + '"]'
            );

            if (ps.length > 0 && !Array.from(ps).some(cb => cb.checked)) {
                missingPS.push('Child ' + i);
            }
            if (aids.length > 0 && !Array.from(aids).some(cb => cb.checked)) {
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

        const selectedLanguage = inMemoryStorage.getItem('selectedLanguage') || 'en';
        const formData = new FormData(this);
        formData.set('selectedLanguage', selectedLanguage);

        const entries = [];
        formData.forEach((value, key) => {
            if (key === 'form-name' || key === 'bot-field') return;
            entries.push({ name: key, value: sanitizeInput(value) });
        });

        // Save to storage so review page can read it
        inMemoryStorage.setItem('interviewSubmission', JSON.stringify(entries));
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

// Helper to apply entries into the static form fields
function applyEntriesToForm(form, entries) {
    if (!form || !Array.isArray(entries)) return;

    entries.forEach(function (entry) {
        var name = entry.name;
        var value = entry.value || '';
        if (!name) return;

        var fields = form.querySelectorAll('[name="' + name + '"]');
        if (!fields || fields.length === 0) return;

        fields.forEach(function (field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
                // For checkboxes or radios, match by value
                if (field.value === value) {
                    field.checked = true;
                }
            } else if (field.tagName === 'SELECT') {
                field.value = value;
            } else {
                field.value = value;
            }
        });
    });
}

// Step 2 on review page - FIXED
function handleInterviewReviewPage() {
    const reviewForm = document.getElementById('interviewReviewForm');
    if (!reviewForm) return;

    const stored = inMemoryStorage.getItem('interviewSubmission');
    console.log('=== REVIEW PAGE LOADED ===');

    if (!stored) {
        console.warn('No stored submission found - redirecting back to interview');
        window.location.href = 'interview.html';
        return;
    }

    let entries;
    try {
        entries = JSON.parse(stored);
        console.log('Entries loaded:', entries.length);
    } catch (error) {
        console.error('Error parsing stored data:', error);
        alert('Error loading form data. Please go back and try again.');
        window.location.href = 'interview.html';
        return;
    }

    if (!Array.isArray(entries) || entries.length === 0) {
        console.error('Stored entries are empty');
        alert('Error loading form data. Please go back and try again.');
        window.location.href = 'interview.html';
        return;
    }

    // Show summary on the page
    populateReviewSummary(entries);

    // Fill the static fields inside the review form
    applyEntriesToForm(reviewForm, entries);

    const editBtn = document.getElementById('editInterviewBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            window.location.href = 'interview.html';
        });
    }

    // When user submits, let browser submit normally and clear storage
    reviewForm.addEventListener('submit', function () {
        inMemoryStorage.removeItem('interviewSubmission');
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
    if (!answer || !answer.previousElementSibling) return;
    
    const icon = answer.previousElementSibling.querySelector('.faq-icon');
    const question = answer.previousElementSibling;
    
    if (!icon) return;

    const currentMaxHeight = answer.style.maxHeight;
    const isClosed = !currentMaxHeight || currentMaxHeight === '0px';

    if (isClosed) {
        document.querySelectorAll('.faq-answer').forEach(function (faq) {
            if (faq.id !== 'faq-' + faqNumber) {
                faq.style.maxHeight = '0px';
                const otherIcon = faq.previousElementSibling ? faq.previousElementSibling.querySelector('.faq-icon') : null;
                if (otherIcon) otherIcon.textContent = '+';
                if (faq.previousElementSibling) faq.previousElementSibling.style.backgroundColor = '';
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
const APP_VERSION = '2.0.1';
// ============================================

// Version logging
function logVersion() {
    console.log('v' + APP_VERSION);
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function () {
    logVersion();
    
    checkPitchAccess();
    handleContactForm();
    handleInterviewForm();
    handleInterviewReviewPage();

    setTimeout(function () {
        startAnimation();
    }, 500);
});