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

// SHA-256 hash function for password verification
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Password protection for pitch page
async function checkPassword(event) {
    event.preventDefault();

    const passwordInput = document.getElementById('passwordInput');
    const errorElement = document.getElementById('passwordError');
    
    if (!passwordInput || !errorElement) return;

    const password = passwordInput.value.trim();
    // Hashed version of the password - more secure than plain text
    // To generate a new hash: echo -n "your-password" | openssl dgst -sha256
    const correctPasswordHash = '73095a13bb5b2e0b829a8057cd5abc0819c8a78ecd5ad797337389fcae96f313';
    
    try {
        const passwordHash = await hashPassword(password);
        
        if (passwordHash === correctPasswordHash) {
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
    } catch (error) {
        console.error('Password hashing error:', error);
        errorElement.textContent = 'An error occurred. Please try again.';
        errorElement.classList.add('show');
    }
}

// Check if user already has access when navigating to pitch page
async function checkPitchAccess() {
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
    if (accessParam) {
        try {
            const correctPasswordHash = '73095a13bb5b2e0b829a8057cd5abc0819c8a78ecd5ad797337389fcae96f313';
            const paramHash = await hashPassword(accessParam);
            
            if (paramHash === correctPasswordHash) {
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
        } catch (error) {
            console.error('Password verification error:', error);
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

    // Let the form submit naturally to Netlify
    // No e.preventDefault() - form will submit natively
    contactForm.addEventListener('submit', function (e) {
        console.log('Contact form submitting naturally to Netlify...');
        // Form will submit to action="/thank-you.html" with Netlify processing
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
    m = fieldName.match(/^feeding6to9_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - feeding age 6 to 9 months';
    m = fieldName.match(/^feeding9to12_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - feeding age 9 to 12 months';
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
    m = fieldName.match(/^notBreastfeedingReasonDetails_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - not breastfeeding reason details';

    m = fieldName.match(/^professionalSupport_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - professional support';
    m = fieldName.match(/^aidsUsed_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - aids used';
    m = fieldName.match(/^section3Comments_child(\d+)$/);
    if (m) return 'Child ' + m[1] + ' - additional comments';

    if (fieldName === 'interviewMethod') return 'Preferred interview method';
    if (fieldName === 'recordingConsent') return 'Recording consent';
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

    console.log('=== APPLYING ENTRIES TO FORM ===');
    let applied = 0;
    let notFound = 0;

    entries.forEach(function (entry) {
        var name = entry.name;
        var value = entry.value || '';
        if (!name) return;

        var fields = form.querySelectorAll('[name="' + name + '"]');
        
        if (!fields || fields.length === 0) {
            console.warn('Field NOT FOUND in form:', name, '=', value);
            notFound++;
            return;
        }

        fields.forEach(function (field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
                // For checkboxes or radios, match by value
                if (field.value === value) {
                    field.checked = true;
                    applied++;
                    if (applied <= 10) {
                        console.log('✓ Checkbox checked:', name, '=', value);
                    }
                }
            } else {
                // For all other fields (inputs, textareas), set value directly
                field.value = value;
                applied++;
                if (applied <= 10) {
                    console.log('✓ Field set:', name, '=', value);
                }
            }
        });
    });
    
    console.log(`✅ Applied ${applied} values, ${notFound} fields not found in HTML`);
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

    // STEP 1: Create a Set of field names that have data (BEFORE filling)
    const fieldsWithData = new Set();
    entries.forEach(function(entry) {
        if (entry.name && entry.value) {
            fieldsWithData.add(entry.name);
        }
    });

    console.log('Fields with data:', Array.from(fieldsWithData));

    // STEP 2: Remove unused fields BEFORE filling them
    const hiddenFieldsDiv = reviewForm.querySelector('.hidden-fields');
    if (hiddenFieldsDiv) {
        const allFields = hiddenFieldsDiv.querySelectorAll('input, select, textarea');
        let removedCount = 0;
        allFields.forEach(function(field) {
            const fieldName = field.getAttribute('name');
            
            if (field.type === 'checkbox' || field.type === 'radio') {
                // For checkboxes/radios, keep only if this specific value should be checked
                const shouldKeep = entries.some(function(entry) {
                    return entry.name === fieldName && entry.value === field.value;
                });
                if (!shouldKeep) {
                    field.remove();
                    removedCount++;
                }
            } else {
                // For other fields, remove if this field name has no data
                if (!fieldsWithData.has(fieldName)) {
                    field.remove();
                    removedCount++;
                }
            }
        });
        console.log('Removed', removedCount, 'unused fields');
    }

    // STEP 3: Now fill the remaining fields with data
    applyEntriesToForm(reviewForm, entries);
    
    console.log('Form ready for submission with only relevant fields');

    const editBtn = document.getElementById('editInterviewBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            window.location.href = 'interview.html';
        });
    }

    // When user submits, log what's being sent and clear storage
    reviewForm.addEventListener('submit', function (e) {
        // Log what's being submitted before it goes
        const formData = new FormData(reviewForm);
        console.log('=== FORM SUBMITTING TO NETLIFY ===');
        console.log('Total fields being submitted:', Array.from(formData.keys()).length);
        console.log('Field names:', Array.from(formData.keys()));
        console.log('First 10 fields with values:');
        let count = 0;
        for (let [name, value] of formData.entries()) {
            if (count < 10) {
                console.log(`  ${name}: ${value}`);
                count++;
            }
        }
        
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