// ========================
// js/config.js
// ========================

export const API_CONFIG = {
    // Configuration pour votre API locale (vu dans votre capture d'écran)
    baseURL: "http://localhost:3000", 
    
    endpoints: {
        cars: "/api/cars",
        carById: (id) => `/api/cars/${id}`
    }
};