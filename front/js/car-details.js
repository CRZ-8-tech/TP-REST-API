// ========================
// car-details.js
// ========================
// Logique spécifique à la page de détails (car.html)

import { fetchCarById } from './api.js';
import { getCarIdFromURL } from './validation.js';
import { displayCarDetails, showLoading, showError } from './dom.js';

/**
 * Initialise la page de détails
 */
export const initCarDetails = async () => {
	const container = document.querySelector('.detail-container') || document.querySelector('article');

	try {
		// Récupérer l'ID de la voiture
		const carId = getCarIdFromURL();
		if (!carId) {
			showError(container, "Aucun ID de voiture fourni. Veuillez retourner à la liste.");
			return;
		}

		// Afficher le chargement
		showLoading(container);

		// Récupérer et afficher les détails
		const car = await fetchCarById(carId);
		displayCarDetails(car);

		console.log('✅ Page de détails initialisée pour la voiture:', carId);
	} catch (error) {
		console.error('Erreur lors du chargement des détails:', error);
		showError(container, error.message || 'Impossible de charger les détails de la voiture.');
	}
};

// Lancer l'initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', initCarDetails);
