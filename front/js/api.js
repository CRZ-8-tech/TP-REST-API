// ========================
// api.js
// ========================
// Toutes les fonctions de communication avec l'API

import { API_CONFIG } from './config.js';

/**
 * Récupère toutes les voitures
 * @returns {Promise<Array>} Tableau de voitures
 */
export const fetchAllCars = async () => {
	try {
		const response = await fetch(
			`${API_CONFIG.baseURL}${API_CONFIG.endpoints.listAll}`,
			{
				headers: {
					"x-api-key": API_CONFIG.apiKey
				}
			}
		);

		if (!response.ok) {
			throw new Error(`Erreur ${response.status}: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la récupération des voitures:", error);
		throw error;
	}
};

/**
 * Récupère une voiture par son ID
 * @param {string|number} id - L'ID de la voiture
 * @returns {Promise<Object>} La voiture
 */
export const fetchCarById = async (id) => {
	try {
		const response = await fetch(
			`${API_CONFIG.baseURL}${API_CONFIG.endpoints.getById}${id}`,
			{
				headers: {
					"x-api-key": API_CONFIG.apiKey
				}
			}
		);

		if (response.status === 404) {
			throw new Error(`Voiture avec l'ID ${id} non trouvée`);
		}

		if (!response.ok) {
			throw new Error(`Erreur ${response.status}: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la récupération de la voiture:", error);
		throw error;
	}
};

/**
 * Crée une nouvelle voiture
 * @param {Object} carData - Les données de la voiture
 * @returns {Promise<Object>} La voiture créée
 */
export const createCar = async (carData) => {
	try {
		const response = await fetch(
			`${API_CONFIG.baseURL}${API_CONFIG.endpoints.create}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": API_CONFIG.apiKey
				},
				body: JSON.stringify(carData)
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.message || `Erreur ${response.status}: ${response.statusText}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la création:", error);
		throw error;
	}
};

/**
 * Supprime une voiture
 * @param {string|number} carId - L'ID de la voiture
 * @returns {Promise<void>}
 */
export const deleteCar = async (carId) => {
	try {
		const response = await fetch(
			`${API_CONFIG.baseURL}${API_CONFIG.endpoints.delete}${carId}`,
			{
				method: "DELETE",
				headers: {
					"x-api-key": API_CONFIG.apiKey
				}
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || `Erreur ${response.status}: ${response.statusText}`
			);
		}

		return await response.json().catch(() => ({}));
	} catch (error) {
		console.error("Erreur lors de la suppression:", error);
		throw error;
	}
};
