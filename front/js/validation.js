// ========================
// validation.js
// ========================
// Fonctions de validation des données

/**
 * Valide les données du formulaire
 * @param {Object} data - Les données du formulaire
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateCarData = (data) => {
	const errors = [];
	const currentYear = new Date().getFullYear();

	// Champs requis
	if (!data.brand || data.brand.trim() === "") {
		errors.push("La marque est requise.");
	}
	if (!data.model || data.model.trim() === "") {
		errors.push("Le modèle est requis.");
	}
	if (!data.color || data.color.trim() === "") {
		errors.push("La couleur est requise.");
	}

	// Année
	if (!data.year) {
		errors.push("L'année est requise.");
	} else {
		const year = parseInt(data.year);
		if (isNaN(year) || year < 1900 || year > currentYear) {
			errors.push(`L'année doit être entre 1900 et ${currentYear}.`);
		}
	}

	// Prix
	if (!data.price) {
		errors.push("Le prix est requis.");
	} else {
		const price = parseFloat(data.price);
		if (isNaN(price) || price < 0) {
			errors.push("Le prix doit être un nombre positif.");
		}
	}

	// Kilométrage
	if (!data.mileage) {
		errors.push("Le kilométrage est requis.");
	} else {
		const mileage = parseInt(data.mileage);
		if (isNaN(mileage) || mileage < 0) {
			errors.push("Le kilométrage doit être un nombre positif.");
		}
	}

	// Optionnel : imageUrl (si fourni, doit être valide)
	if (data.imageUrl && data.imageUrl.trim() !== "") {
		try {
			new URL(data.imageUrl);
		} catch {
			errors.push("L'URL de l'image doit être valide.");
		}
	}

	return {
		isValid: errors.length === 0,
		errors: errors
	};
};

/**
 * Extrait l'ID de la voiture de l'URL
 * @returns {string|null} L'ID de la voiture ou null
 */
export const getCarIdFromURL = () => {
	const params = new URLSearchParams(window.location.search);
	return params.get("id");
};

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number} num - Le nombre à formater
 * @returns {string} Le nombre formaté
 */
export const formatNumber = (num) => {
	return new Intl.NumberFormat("fr-FR").format(num);
};
