document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const feedbackInput = document.getElementById('feedback');
    const ratingInput = document.getElementById('rating'); // Hidden input for rating
    const ratingStars = document.getElementById('ratingStars');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const feedbackError = document.getElementById('feedbackError');
    const ratingError = document.getElementById('ratingError');

    const formSuccessMessage = document.getElementById('formSuccessMessage');
    const formErrorMessage = document.getElementById('formErrorMessage');

    let selectedRating = 0;

    // --- Star Rating Logic ---
    ratingStars.addEventListener('mouseover', (event) => {
        const hoveredStar = event.target.closest('span');
        if (hoveredStar) {
            const value = parseInt(hoveredStar.dataset.value);
            highlightStars(value);
        }
    });

    ratingStars.addEventListener('mouseout', () => {
        highlightStars(selectedRating); // Revert to selected rating on mouseout
    });

    ratingStars.addEventListener('click', (event) => {
        const clickedStar = event.target.closest('span');
        if (clickedStar) {
            selectedRating = parseInt(clickedStar.dataset.value);
            ratingInput.value = selectedRating; // Update hidden input value
            highlightStars(selectedRating);
            validateRating(); // Validate immediately on click
        }
    });

    function highlightStars(count) {
        const stars = ratingStars.querySelectorAll('span');
        stars.forEach((star, index) => {
            if (index < count) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    // --- Validation Functions ---
    function validateName() {
        if (nameInput.value.trim() === '') {
            nameError.textContent = 'Name is required.';
            return false;
        } else {
            nameError.textContent = '';
            return true;
        }
    }

    function validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value.trim() === '') {
            emailError.textContent = 'Email is required.';
            return false;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            emailError.textContent = 'Please enter a valid email address.';
            return false;
        } else {
            emailError.textContent = '';
            return true;
        }
    }

    function validateSubject() {
        if (subjectInput.value.trim() === '') {
            subjectError.textContent = 'Subject is required.';
            return false;
        } else {
            subjectError.textContent = '';
            return true;
        }
    }

    function validateFeedback() {
        if (feedbackInput.value.trim() === '') {
            feedbackError.textContent = 'Feedback is required.';
            return false;
        } else if (feedbackInput.value.trim().length < 10) {
            feedbackError.textContent = 'Feedback must be at least 10 characters long.';
            return false;
        } else {
            feedbackError.textContent = '';
            return true;
        }
    }

    function validateRating() {
        if (selectedRating === 0) {
            ratingError.textContent = 'Please select a rating.';
            return false;
        } else {
            ratingError.textContent = '';
            return true;
        }
    }

    function validateForm() {
        // Run all validations and check if any return false
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isSubjectValid = validateSubject();
        const isFeedbackValid = validateFeedback();
        const isRatingValid = validateRating();

        return isNameValid && isEmailValid && isSubjectValid && isFeedbackValid && isRatingValid;
    }

    // --- Event Listeners for Validation ---
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    subjectInput.addEventListener('input', validateSubject);
    feedbackInput.addEventListener('input', validateFeedback);
    // Rating validation is handled on click and during form submission

    // --- Form Submission Logic ---
    feedbackForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        formSuccessMessage.classList.add('hidden'); // Hide previous messages
        formErrorMessage.classList.add('hidden');

        if (validateForm()) { // Only proceed if client-side validation passes
            const formData = new FormData(feedbackForm);

            try {
                // Formspree requires a POST request
                const response = await fetch(feedbackForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Important for Formspree to return JSON response
                    }
                });

                if (response.ok) {
                    formSuccessMessage.classList.remove('hidden');
                    feedbackForm.reset(); // Clear the form
                    selectedRating = 0; // Reset rating state
                    highlightStars(0); // Clear star visual
                } else {
                    // Handle non-OK responses (e.g., server errors, Formspree rate limits)
                    const errorData = await response.json();
                    console.error('Form submission error:', errorData);
                    formErrorMessage.textContent = errorData.error || 'Failed to send feedback. Please try again.';
                    formErrorMessage.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Network or submission error:', error);
                formErrorMessage.textContent = 'A network error occurred. Please check your connection and try again.';
                formErrorMessage.classList.remove('hidden');
            }
        }
    });

    // Initial validation check to ensure errors are not shown on page load
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    subjectInput.addEventListener('blur', validateSubject);
    feedbackInput.addEventListener('blur', validateFeedback);
});