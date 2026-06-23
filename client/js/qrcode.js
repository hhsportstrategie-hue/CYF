'use strict';

// ── QR Code Scanner ───────────────────────────────────────────────
// Utilise l'API BarcodeDetector (natif Chrome/Android) avec fallback manuel

let qrStream = null;
let qrDetector = null;
let qrInterval = null;

async function startQR() {
  const overlay = document.getElementById('qr-overlay');
  const video   = document.getElementById('qr-video');
  if (!overlay || !video) return;

  try {
    qrStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    video.srcObject = qrStream;
    overlay.classList.add('active');

    // BarcodeDetector API (Chrome 83+, Android)
    if ('BarcodeDetector' in window) {
      qrDetector = new BarcodeDetector({ formats: ['qr_code'] });
      qrInterval = setInterval(async () => {
        try {
          const barcodes = await qrDetector.detect(video);
          if (barcodes.length > 0) {
            const value = barcodes[0].rawValue;
            stopQR();
            handleQRResult(value);
          }
        } catch(e) {}
      }, 500);
    } else {
      // Fallback : afficher un message
      const msg = document.createElement('p');
      msg.textContent = 'Scanner non supporté — entrez le code manuellement';
      msg.style.cssText = 'color:white;text-align:center;padding:1rem;';
      overlay.insertBefore(msg, overlay.lastChild);
    }
  } catch(e) {
    alert('Impossible d\'accéder à la caméra : ' + e.message);
  }
}

function stopQR() {
  const overlay = document.getElementById('qr-overlay');
  const video   = document.getElementById('qr-video');
  if (overlay) overlay.classList.remove('active');
  if (qrInterval) { clearInterval(qrInterval); qrInterval = null; }
  if (qrStream) {
    qrStream.getTracks().forEach(t => t.stop());
    qrStream = null;
  }
  if (video) video.srcObject = null;
}

function handleQRResult(value) {
  // Le QR code contient directement la réponse
  const input = document.getElementById('answer-input');
  if (input) {
    input.value = value.toUpperCase();
    toast('📷 QR Code lu : ' + value);
    // Auto-submit après 800ms
    setTimeout(() => {
      if (typeof submitAnswer === 'function') submitAnswer();
    }, 800);
  }
}

// Exposer globalement
window.startQR = startQR;
window.stopQR  = stopQR;
