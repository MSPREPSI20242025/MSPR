import axios from "axios";

const API_URL = "http://localhost:4455/api";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "";

// Types based on the OpenAPI specification
export interface CovidData {
    id?: number;
    date: string;
    country: string;
    total_cases: number;
    new_cases: number;
    total_deaths: number;
    new_deaths: number;
}

export interface MpoxData {
    id?: number;
    date: string;
    country: string;
    total_cases: number;
    new_cases: number;
    total_deaths: number;
    new_deaths: number;
}

export interface CovidTotals {
    total_cases: number;
    total_deaths: number;
}

export interface MpoxSummary {
    country: string;
    latest_cases: number;
}

export interface StatsSummary {
    covid: {
        total_cases: number;
        total_deaths: number;
    };
    mpox: {
        total_cases: number;
        total_deaths: number;
    };
}

// API Services
export const api = {
    // COVID public endpoints
    getLatestCovidData: async (): Promise<CovidData[]> => {
        const response = await axios.get(`${API_URL}/covid/public/latest`);
        return response.data;
    },

    getCovidDataByCountry: async (country: string): Promise<CovidData[]> => {
        const response = await axios.get(
            `${API_URL}/covid/public/country/${country}`
        );
        return response.data;
    },

    getCovidTotals: async (): Promise<CovidTotals> => {
        const response = await axios.get(`${API_URL}/covid/public/totals`);
        return response.data;
    },

    // MPOX public endpoints
    getMpoxSummary: async (): Promise<MpoxSummary[]> => {
        const response = await axios.get(`${API_URL}/mpox/public/summary`);
        return response.data;
    },

    // Statistics
    getStatsSummary: async (): Promise<StatsSummary> => {
        const response = await axios.get(`${API_URL}/stats/summary`, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
            },
        });
        console.log(response.data);
        return response.data;
    },

    // Protected COVID endpoints
    getAllCovidData: async (
        country?: string,
        limit?: number
    ): Promise<CovidData[]> => {
        const params = new URLSearchParams();
        if (country) params.append("country", country);
        if (limit) params.append("limit", limit.toString());

        const response = await axios.get(
            `${API_URL}/covid/data?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                },
            }
        );
        return response.data;
    },

    // Protected MPOX endpoints
    getAllMpoxData: async (
        country?: string,
        limit?: number
    ): Promise<MpoxData[]> => {
        const params = new URLSearchParams();
        if (country) params.append("country", country);
        if (limit) params.append("limit", limit.toString());

        const response = await axios.get(
            `${API_URL}/mpox/data?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                },
            }
        );
        return response.data;
    },
};
