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
		chrome.storage.sync.set({
			preferredLanguage: selectedLanguage
		}, () => {
			console.log(chrome.i18n.getMessage("languageSavedConsoleLog"), selectedLanguage);
			showNotification(chrome.i18n.getMessage("languageSavedNotification"));
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

	// Sayfa başlatıldığında i18n metinlerini uygula
	document.querySelectorAll('[data-i18n]').forEach(element => {
		const key = element.getAttribute('data-i18n');
		const message = chrome.i18n.getMessage(key);
		if (message) {
			if (element.tagName === 'OPTION') {
				element.textContent = message;
			} else {
				element.textContent = message;
			}
		}
	});
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


document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('[data-i18n]').forEach(element => {
		const key = element.getAttribute('data-i18n');
		const message = chrome.i18n.getMessage(key);
		if (message) {
			if (element.tagName === 'OPTION') {
				element.textContent = message;
			} else {
				element.textContent = message;
			}
		}
	});

	const languageSelect = document.getElementById('languageSelect');
	const notification = document.getElementById('notification');

	languageSelect.addEventListener('change', () => {
		const selectedLanguage = languageSelect.value;
		console.log(`Dil seçildi: ${selectedLanguage}`);
		notification.style.display = 'block';
		setTimeout(() => {
			notification.style.display = 'none';
		}, 2000);
	});
});