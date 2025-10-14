// Image Gallery Functions
function changeImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('mainImage');
    mainImage.src = imageSrc;
    
    document.querySelectorAll('.thumbnail-image').forEach(img => {
        img.classList.remove('active');
    });
    
    thumbnail.classList.add('active');
}

// Price Calculation
let basePrice = 34.99;
let extraCharges = {
    myVoice: 0,
    proposedStory: 0,
    endCover: 0,
    coverImage: 0,
    backgroundMusic: 0,
    soundEffect: 0
};

function updateTotalPrice() {
    const total = basePrice + 
        extraCharges.myVoice + 
        extraCharges.proposedStory + 
        extraCharges.endCover + 
        extraCharges.coverImage + 
        extraCharges.backgroundMusic + 
        extraCharges.soundEffect;
    
    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
    
    // Show/hide extra price rows
    document.getElementById('myVoicePrice').style.display = extraCharges.myVoice > 0 ? 'flex' : 'none';
    document.getElementById('proposedStoryPrice').style.display = extraCharges.proposedStory > 0 ? 'flex' : 'none';
    document.getElementById('endCoverPrice').style.display = extraCharges.endCover > 0 ? 'flex' : 'none';
    document.getElementById('coverImagePrice').style.display = extraCharges.coverImage > 0 ? 'flex' : 'none';
    document.getElementById('backgroundMusicPrice').style.display = extraCharges.backgroundMusic > 0 ? 'flex' : 'none';
    document.getElementById('soundEffectPrice').style.display = extraCharges.soundEffect > 0 ? 'flex' : 'none';
}

// Theme Selection - Show/Hide Other Input
document.getElementById('theme').addEventListener('change', function() {
    const otherInput = document.getElementById('themeOther');
    if (this.value === 'other') {
        otherInput.style.display = 'block';
        otherInput.required = true;
    } else {
        otherInput.style.display = 'none';
        otherInput.required = false;
    }
});

// Voice Over Selection
document.getElementById('voiceOver').addEventListener('change', function() {
    const voiceRecordingSection = document.getElementById('voiceRecordingSection');
    
    if (this.value === 'my-voice') {
        voiceRecordingSection.style.display = 'block';
        extraCharges.myVoice = 100;
        initializeRecording();
    } else {
        voiceRecordingSection.style.display = 'none';
        extraCharges.myVoice = 0;
        cleanupRecording();
    }
    
    updateTotalPrice();
});

// Character Count for Special Instructions
document.getElementById('specialInstructions').addEventListener('input', function() {
    document.getElementById('instructionsCount').textContent = this.value.length;
});

// Image to Cartoon Radio Buttons
document.querySelectorAll('input[name="imageToCartoon"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const uploadSection = document.getElementById('uploadImageSection');
        const detailsSection = document.getElementById('characterDetailsSection');
        
        if (this.value === 'yes') {
            uploadSection.style.display = 'block';
            detailsSection.style.display = 'none';
            document.getElementById('characterImage').required = true;
        } else {
            uploadSection.style.display = 'none';
            detailsSection.style.display = 'block';
            document.getElementById('characterImage').required = false;
        }
    });
});

// Proposed Story Radio Buttons
document.querySelectorAll('input[name="proposedStory"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const proposedStorySection = document.getElementById('proposedStorySection');
        
        if (this.value === 'yes') {
            proposedStorySection.style.display = 'block';
            extraCharges.proposedStory = 5;
        } else {
            proposedStorySection.style.display = 'none';
            extraCharges.proposedStory = 0;
        }
        
        updateTotalPrice();
    });
});

// Character Count for Proposed Story
document.getElementById('proposedStoryText').addEventListener('input', function() {
    document.getElementById('storyCount').textContent = this.value.length;
});

// End Cover Radio Buttons
document.querySelectorAll('input[name="endCover"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const endCoverSection = document.getElementById('endCoverSection');
        
        if (this.value === 'yes') {
            endCoverSection.style.display = 'block';
            extraCharges.endCover = 10;
        } else {
            endCoverSection.style.display = 'none';
            extraCharges.endCover = 0;
        }
        
        updateTotalPrice();
    });
});

// Character Count for End Cover Message
document.getElementById('endCoverMessage').addEventListener('input', function() {
    document.getElementById('messageCount').textContent = this.value.length;
});

// Cover Image Radio Buttons
document.querySelectorAll('input[name="coverImage"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const coverImageSection = document.getElementById('coverImageSection');
        
        if (this.value === 'yes') {
            coverImageSection.style.display = 'block';
            extraCharges.coverImage = 10;
        } else {
            coverImageSection.style.display = 'none';
            extraCharges.coverImage = 0;
        }
        
        updateTotalPrice();
    });
});

// Background Music Radio Buttons
document.querySelectorAll('input[name="backgroundMusic"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'yes') {
            extraCharges.backgroundMusic = 20;
        } else {
            extraCharges.backgroundMusic = 0;
        }
        
        updateTotalPrice();
    });
});

// Sound Effect Radio Buttons
document.querySelectorAll('input[name="soundEffect"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'yes') {
            extraCharges.soundEffect = 20;
        } else {
            extraCharges.soundEffect = 0;
        }
        
        updateTotalPrice();
    });
});

// Voice Recording Variables
let mediaRecorder;
let recordedChunks = [];
let audioUrl;
let recordingTimer;
let recordingTime = 0;
let audioContext;
let analyser;
let dataArray;
let animationId;
let stream;

// Initialize Recording
function initializeRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100
            }
        })
        .then(audioStream => {
            stream = audioStream;
            
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4'
            ];
            let selectedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
            
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: selectedMimeType,
                audioBitsPerSecond: 128000
            });
            
            // Setup audio context for visualization
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            
            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: selectedMimeType });
                audioUrl = URL.createObjectURL(blob);
                document.getElementById('playRecording').disabled = false;
                recordedChunks = [];
                
                document.getElementById('recordingStatus').textContent = '✅ Recording completed! Click play to preview.';
                
                // Convert to base64
                const reader = new FileReader();
                reader.onloadend = () => {
                    document.getElementById('audioData').value = reader.result;
                    document.getElementById('audioDuration').value = `${recordingTime} seconds`;
                };
                reader.readAsDataURL(blob);
            };
            
            setupRecordingControls();
        })
        .catch(err => {
            document.getElementById('recordingStatus').textContent = '🚫 Microphone access required. Please allow microphone access.';
            console.error('Microphone error:', err);
        });
    } else {
        document.getElementById('recordingStatus').textContent = '🚫 Voice recording not supported in this browser.';
    }
}

// Recording Controls
function setupRecordingControls() {
    document.getElementById('startRecording').addEventListener('click', startRecording);
    document.getElementById('stopRecording').addEventListener('click', stopRecording);
    document.getElementById('playRecording').addEventListener('click', playRecording);
}

function startRecording() {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
        recordedChunks = [];
        mediaRecorder.start(100);
        
        document.getElementById('startRecording').disabled = true;
        document.getElementById('startRecording').classList.add('recording');
        document.getElementById('stopRecording').disabled = false;
        document.getElementById('playRecording').disabled = true;
        
        recordingTime = 0;
        document.getElementById('recordingStatus').textContent = '🎤 Recording... Speak clearly!';
        
        recordingTimer = setInterval(() => {
            recordingTime++;
            updateTimer();
            if (recordingTime >= 120) {
                stopRecording();
            }
        }, 1000);
        
        visualizeAudio();
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        clearInterval(recordingTimer);
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        document.getElementById('startRecording').disabled = false;
        document.getElementById('startRecording').classList.remove('recording');
        document.getElementById('stopRecording').disabled = true;
        
        const canvas = document.getElementById('audioVisualizer');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function playRecording() {
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
        document.getElementById('recordingStatus').textContent = '🔊 Playing recording...';
        audio.onended = () => {
            document.getElementById('recordingStatus').textContent = '✅ Playback complete!';
        };
    }
}

function updateTimer() {
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function visualizeAudio() {
    const canvas = document.getElementById('audioVisualizer');
    const canvasCtx = canvas.getContext('2d');
    
    function draw() {
        animationId = requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.fillStyle = 'rgba(155, 88, 124, 0.1)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height;
            const intensity = dataArray[i] / 255;
            canvasCtx.fillStyle = `rgba(255, ${Math.floor(105 + intensity * 150)}, ${Math.floor(180 + intensity * 75)}, 0.8)`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    
    draw();
}

function cleanupRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (audioContext) {
        audioContext.close();
    }
}

// Voice Upload Handler
document.getElementById('voiceUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const maxSize = 10485760; // 10MB
    
    if (file && file.size > maxSize) {
        document.getElementById('recordingStatus').textContent = '🚫 File too large! Max 10MB.';
        this.value = '';
    } else if (file) {
        document.getElementById('recordingStatus').textContent = `✅ Audio file "${file.name}" uploaded!`;
        
        const reader = new FileReader();
        reader.onloadend = () => {
            document.getElementById('audioData').value = reader.result;
            document.getElementById('audioDuration').value = 'Uploaded file';
        };
        reader.readAsDataURL(file);
    }
});

// Form Submission
document.getElementById('storybookForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
        alert('⚠️ Please login to add items to cart');
        window.location.href = 'signup.html';
        return;
    }
    
    // Collect form data
    const formData = {
        childName: document.getElementById('childName').value,
        childAge: document.getElementById('childAge').value,
        storyStyle: document.getElementById('storyStyle').value,
        storyLanguage: document.getElementById('storyLanguage').value,
        theme: document.getElementById('theme').value === 'other' ? 
               document.getElementById('themeOther').value : 
               document.getElementById('theme').value,
        voiceOver: document.getElementById('voiceOver').value,
        specialInstructions: document.getElementById('specialInstructions').value,
        imageToCartoon: document.querySelector('input[name="imageToCartoon"]:checked').value,
        hairColor: document.getElementById('hairColor').value,
        hairType: document.getElementById('hairType').value,
        eyesColor: document.getElementById('eyesColor').value,
        skinTone: document.getElementById('skinTone').value,
        proposedStory: document.querySelector('input[name="proposedStory"]:checked').value,
        proposedStoryText: document.getElementById('proposedStoryText').value,
        endCover: document.querySelector('input[name="endCover"]:checked').value,
        endCoverName: document.getElementById('endCoverName').value,
        relationship: document.getElementById('relationship').value,
        endCoverMessage: document.getElementById('endCoverMessage').value,
        coverImage: document.querySelector('input[name="coverImage"]:checked').value,
        backgroundMusic: document.querySelector('input[name="backgroundMusic"]:checked').value,
        soundEffect: document.querySelector('input[name="soundEffect"]:checked').value,
        totalPrice: document.getElementById('totalPrice').textContent,
        extraCharges: { ...extraCharges },
        audioData: document.getElementById('audioData').value,
        timestamp: new Date().toISOString()
    };
    
    // Show loading
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding to cart...';
    
    // Add to cart
    const success = await cart.addItem(formData);
    
    if (success) {
        // Show success popup
        showSuccessPopup();
    } else {
        alert('❌ Failed to add to cart. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

function showSuccessPopup() {
    const popup = document.getElementById('cartSuccessPopup');
    popup.classList.add('show');
    
    let countdown = 3;
    const countdownElement = document.getElementById('redirectCountdown');
    const countdownText = document.getElementById('countdownText');
    
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        countdownText.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            window.location.href = 'cart.html';
        }
    }, 1000);
}

function closePopup() {
    const popup = document.getElementById('cartSuccessPopup');
    popup.classList.remove('show');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    cleanupRecording();
});

// Initialize price on load
updateTotalPrice();