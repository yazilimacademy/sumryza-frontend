// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('languageSelect');
    const notification = document.getElementById('notification');

    // Kaydedilmiş dili yükle
    chrome.storage.sync.get(['preferredLanguage'], (result) => {
        if (result.preferredLanguage) {
            languageSelect.value = result.preferredLanguage;
        }
    });

    // Dil değiştiğinde kaydet ve bildirim göster
    languageSelect.addEventListener('change', () => {
        const selectedLanguage = languageSelect.value;
        chrome.storage.sync.set({ preferredLanguage: selectedLanguage }, () => {
            console.log("Preferred language saved:", selectedLanguage);
            showNotification("Tercih edilen dil kaydedildi!");
        });
    });

    // Bildirim gösterme fonksiyonu
    function showNotification(message) {
        // Önceki animasyonu temizle
        notification.classList.remove('show');
        notification.style.animation = 'none';
        notification.offsetHeight; // Reflow
        notification.style.animation = null;
        
        notification.textContent = message;
        notification.classList.add('show');
        
        // Animasyon bittiğinde sınıfı kaldır
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2300); // 2s bekle + 0.3s fadeout
    }
});

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

// Tema değişikliklerini dinlemek için
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (e.matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});