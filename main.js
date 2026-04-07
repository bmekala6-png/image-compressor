document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const editorView = document.getElementById('editor-view');
    const originalPreview = document.getElementById('original-preview');
    const originalInfo = document.getElementById('original-info');
    const qualitySlider = document.getElementById('quality');
    const qualityVal = document.getElementById('quality-val');
    const formatSelect = document.getElementById('format');
    const compressBtn = document.getElementById('compress-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultView = document.getElementById('result-view');
    const compressedPreview = document.getElementById('compressed-preview');
    const compressedInfo = document.getElementById('compressed-info');
    const savingsBadge = document.getElementById('savings-badge');
    const downloadLink = document.getElementById('download-link');

    let originalFile = null;
    let originalImage = new Image();

    // -- File Handling --

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    function handleFile(file) {
        originalFile = file;
        const reader = new FileReader();

        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalPreview.src = e.target.result;
            originalInfo.textContent = formatSize(file.size);
            
            // Show editor
            dropZone.classList.add('hidden');
            editorView.classList.remove('hidden');
            resultView.classList.add('hidden');
            
            // Reset quality and format
            qualitySlider.value = 80;
            qualityVal.textContent = '80%';
        };

        reader.readAsDataURL(file);
    }

    // -- Settings UI --

    qualitySlider.addEventListener('input', (e) => {
        qualityVal.textContent = `${e.target.value}%`;
    });

    // -- Compression Logic --

    compressBtn.addEventListener('click', () => {
        compressImage();
    });

    async function compressImage() {
        const quality = parseInt(qualitySlider.value) / 100;
        const format = formatSelect.value;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Maintain aspect ratio
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;

        ctx.drawImage(originalImage, 0, 0);

        // Convert to blob
        try {
            const blob = await new Promise((resolve) => {
                canvas.toBlob((b) => resolve(b), format, quality);
            });

            if (!blob) throw new Error('Compression failed');

            displayResult(blob);
        } catch (err) {
            console.error(err);
            alert('Compression failed. Please try again.');
        }
    }

    function displayResult(blob) {
        const url = URL.createObjectURL(blob);
        compressedPreview.src = url;
        compressedInfo.textContent = formatSize(blob.size);
        
        // Calculate savings
        const savings = Math.round(((originalFile.size - blob.size) / originalFile.size) * 100);
        savingsBadge.textContent = savings > 0 ? `${savings}% Size Saved` : 'Minimal reduction';
        savingsBadge.style.color = savings > 0 ? 'var(--success)' : 'var(--text-muted)';

        // Setup download
        const ext = formatSelect.value.split('/')[1];
        downloadLink.href = url;
        downloadLink.download = `optipress-${Date.now()}.${ext}`;

        resultView.classList.remove('hidden');
        resultView.scrollIntoView({ behavior: 'smooth' });
    }

    // -- Utils --

    resetBtn.addEventListener('click', () => {
        location.reload(); // Simple reset
    });

    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
