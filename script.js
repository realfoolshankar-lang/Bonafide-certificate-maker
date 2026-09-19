document.addEventListener('DOMContentLoaded', function () {

    const DEFAULTS = {
        studentName: 'SIMRAN KUMARI',
        relationship: 'Daughter',
        parentName: 'KISHORI RAY',
        dob: '20/05/2007',
        collegeName: 'GANGA SINGH COLLEGE CHAPRA',
        district: 'SARAN',
        state: 'BIHAR',
        rollNumber: '93',
        course: 'Bachelor of ARTS in ECONOMICS (Major)',
        admissionYear: '2024-2028',
        domicileState: 'Bihar'
    };

    // Form Input References
    const inputs = {
        studentName: document.getElementById('studentName'),
        relationship: document.getElementById('relationship'),
        parentName: document.getElementById('parentName'),
        dob: document.getElementById('dob'),
        collegeName: document.getElementById('collegeName'),
        district: document.getElementById('district'),
        state: document.getElementById('state'),
        rollNumber: document.getElementById('rollNumber'),
        course: document.getElementById('course'),
        admissionYear: document.getElementById('admissionYear'),
        domicileState: document.getElementById('domicileState')
    };

    // Preview Element References
    const previews = {
        studentName: document.getElementById('prevStudentName'),
        relationship: document.getElementById('prevRelationship'),
        parentName: document.getElementById('prevParentName'),
        dob: document.getElementById('prevDob'),
        collegeName: document.getElementById('prevCollegeName'),
        district: document.getElementById('prevDistrict'),
        state: document.getElementById('prevState'),
        rollNumber: document.getElementById('prevRollNumber'),
        course: document.getElementById('prevCourse'),
        admissionYear: document.getElementById('prevAdmissionYear'),
        domicileState: document.getElementById('prevDomicileState')
    };

    // Photo Upload Reference Handling
    const photoUpload = document.getElementById('photoUpload');
    const uploadedPhotoImg = document.getElementById('uploadedPhotoImg');
    const photoIcon = document.getElementById('photoIcon');
    const photoBoxText = document.getElementById('photoBoxText');

    if (photoUpload) {
        photoUpload.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    uploadedPhotoImg.src = evt.target.result;
                    uploadedPhotoImg.classList.remove('hidden');
                    if (photoIcon) photoIcon.classList.add('hidden');
                    if (photoBoxText) photoBoxText.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                resetPhotoBox();
            }
        });
    }

    function resetPhotoBox() {
        if (uploadedPhotoImg) {
            uploadedPhotoImg.src = '';
            uploadedPhotoImg.classList.add('hidden');
        }
        if (photoIcon) photoIcon.classList.remove('hidden');
        if (photoBoxText) photoBoxText.classList.remove('hidden');
        if (photoUpload) photoUpload.value = '';
    }

    /* ------------------------------------------------------------------
       DATE OF BIRTH — automatic DD/MM/YYYY masking.
       The user only ever types digits; the "/" separators are inserted
       automatically. Backspace/Delete right next to an auto-inserted
       slash removes the slash together with its neighbouring digit so
       editing feels natural, and pasted text is cleaned up the same way.
       ------------------------------------------------------------------ */
    function formatDobDigits(raw) {
        const digits = raw.replace(/\D/g, '').slice(0, 8);
        if (digits.length > 4) {
            return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
        } else if (digits.length > 2) {
            return digits.slice(0, 2) + '/' + digits.slice(2);
        }
        return digits;
    }

    if (inputs.dob) {
        const dobField = inputs.dob;
        dobField.setAttribute('inputmode', 'numeric');
        dobField.setAttribute('autocomplete', 'off');

        // Let backspace/delete "eat" the auto-inserted slash along with a digit
        dobField.addEventListener('keydown', function (e) {
            const pos = this.selectionStart;
            const hasSelection = this.selectionStart !== this.selectionEnd;
            if (hasSelection) return;

            if (e.key === 'Backspace' && pos > 0 && this.value[pos - 1] === '/') {
                e.preventDefault();
                const newRaw = this.value.slice(0, pos - 2) + this.value.slice(pos);
                const formatted = formatDobDigits(newRaw);
                this.value = formatted;
                const newPos = Math.max(0, pos - 2);
                this.setSelectionRange(newPos, newPos);
                updatePreview();
            } else if (e.key === 'Delete' && this.value[pos] === '/') {
                e.preventDefault();
                const newRaw = this.value.slice(0, pos) + this.value.slice(pos + 2);
                const formatted = formatDobDigits(newRaw);
                this.value = formatted;
                this.setSelectionRange(pos, pos);
                updatePreview();
            }
        });

        dobField.addEventListener('input', function () {
            const caretFromEnd = this.value.length - this.selectionStart;
            const formatted = formatDobDigits(this.value);
            this.value = formatted;
            const newPos = Math.max(0, formatted.length - caretFromEnd);
            this.setSelectionRange(newPos, newPos);
            updatePreview();
        });

        dobField.addEventListener('paste', function (e) {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text');
            const formatted = formatDobDigits(pasted);
            this.value = formatted;
            const pos = formatted.length;
            this.setSelectionRange(pos, pos);
            updatePreview();
        });
    }

    function updatePreview() {
        Object.keys(inputs).forEach(key => {
            if (inputs[key] && previews[key]) {
                let rawVal = inputs[key].value;
                let upperVal = rawVal ? rawVal.toUpperCase() : '';
                previews[key].textContent = upperVal;
            }
        });
    }

    // Attach listeners to all inputs for live updating (dob has its own listeners above)
    Object.keys(inputs).forEach(key => {
        if (inputs[key] && key !== 'dob') {
            inputs[key].addEventListener('input', updatePreview);
            inputs[key].addEventListener('change', updatePreview);
        }
    });

    // Action Buttons
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const resetFormBtn = document.getElementById('resetFormBtn');
    const certContainer = document.getElementById('certificate-preview');

    // Reset Form Handler
    resetFormBtn.addEventListener('click', function () {
        Object.keys(DEFAULTS).forEach(key => {
            if (inputs[key]) {
                inputs[key].value = DEFAULTS[key];
            }
        });
        resetPhotoBox();
        updatePreview();
        showToast('Form reset to default values', 'info');
    });

    let currentZoom = 1.0;
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomFitBtn = document.getElementById('zoomFitBtn');
    const zoomLevelText = document.getElementById('zoomLevelText');

    function setZoom(scale) {
        currentZoom = Math.min(Math.max(scale, 0.3), 1.5);
        certContainer.style.transform = `scale(${currentZoom})`;
        certContainer.style.transformOrigin = 'top center';
        zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
    }

    function fitToScreen() {
        const wrapperWidth = document.querySelector('.preview-viewport-wrapper').clientWidth - 32;
        const a4WidthInPx = 794;
        if (wrapperWidth < a4WidthInPx) {
            const fitScale = wrapperWidth / a4WidthInPx;
            setZoom(fitScale);
        } else {
            setZoom(1.0);
        }
    }

    zoomInBtn.addEventListener('click', () => setZoom(currentZoom + 0.1));
    zoomOutBtn.addEventListener('click', () => setZoom(currentZoom - 0.1));
    zoomFitBtn.addEventListener('click', fitToScreen);

    fitToScreen();
    window.addEventListener('resize', fitToScreen);
    window.addEventListener('orientationchange', fitToScreen);

    downloadPdfBtn.addEventListener('click', async function () {
        const originalText = downloadPdfBtn.innerHTML;

        try {
            downloadPdfBtn.disabled = true;
            downloadPdfBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-base"></i><span>Generating PDF...</span>`;
            showToast('Preparing high-resolution PDF...', 'info');

            const previousTransform = certContainer.style.transform;
            certContainer.style.transform = 'none';

            window.scrollTo(0, 0);

            const canvas = await html2canvas(certContainer, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200
            });

            certContainer.style.transform = previousTransform;

            const imgData = canvas.toDataURL('image/jpeg', 0.98);

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            pdf.save('Bonafide_Student_Certificate.pdf');

            showToast('Certificate PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            showToast('Failed to generate PDF. Please try again.', 'error');
        } finally {
            downloadPdfBtn.disabled = false;
            downloadPdfBtn.innerHTML = originalText;
        }
    });

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toastNotification');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');

        toastMessage.textContent = message;

        if (type === 'success') {
            toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-lg';
        } else if (type === 'error') {
            toastIcon.className = 'fa-solid fa-circle-xmark text-rose-400 text-lg';
        } else {
            toastIcon.className = 'fa-solid fa-circle-info text-sky-400 text-lg';
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');

        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3500);
    }

    updatePreview();
});
