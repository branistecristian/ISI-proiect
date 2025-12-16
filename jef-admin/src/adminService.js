import api from './api';

// #########################################
// Functii pentru Dashboard (Statistici)
// #########################################

export const fetchDashboardStats = async () => {
    try {
        const response = await api.get('/stats');
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};


// #########################################
// Functii pentru Insule (Islands CRUD)
// #########################################

export const fetchIslands = async () => {
    const response = await api.get('/islands');
    return response.data;
};

export const createIsland = async (islandData) => {
    const response = await api.post('/islands', islandData);
    return response.data;
};

export const updateIsland = async (id, islandData) => {
    const response = await api.put(`/islands/${id}`, islandData);
    return response.data;
};

export const deleteIsland = async (id) => {
    await api.delete(`/islands/${id}`);
};


// #########################################
// Functii pentru Avioane (Jets CRUD)
// #########################################

export const fetchJets = async () => {
    const response = await api.get('/jets');
    return response.data;
};

export const createJet = async (jetData) => {
    const response = await api.post('/jets', jetData);
    return response.data;
};

export const updateJet = async (id, jetData) => {
    const response = await api.put(`/jets/${id}`, jetData);
    return response.data;
};

export const deleteJet = async (id) => {
    await api.delete(`/jets/${id}`);
};


// #########################################
// Functii pentru Rezervari (Booking Status Update)
// #########################################

export const fetchBookings = async () => {
    const response = await api.get('/bookings');
    return response.data;
};

export const updateBookingStatus = async (bookingId, newStatus) => {
    const response = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
    return response.data;
};

// #########################################
// AUTENTIFICARE
// #########################################

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data; 
    } catch (error) {
        throw error.response ? error.response.data : { message: "Eroare de server" };
    }
};