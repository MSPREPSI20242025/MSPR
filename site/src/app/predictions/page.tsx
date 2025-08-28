"use client";

import { useEffect, useState } from "react";
import { Card, CardStat } from "@/components/ui/Card";
import { api, PredictionData } from "@/services/api";
import { useTranslation } from "@/components/TranslationProvider";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function PredictionsPage() {
    const { t } = useTranslation();
    const [predictions, setPredictions] = useState<PredictionData[]>([]);
    const [aggregatedData, setAggregatedData] = useState<PredictionData[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>("Global");
    const [timeRange, setTimeRange] = useState<number>(90);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await api.getPredictions();
                setPredictions(data);
                
                const aggregated = aggregateByWeek(data, "Global");
                setAggregatedData(aggregated);
            } catch (error) {
                console.error("Error fetching predictions:", error);
                setError("Unable to load predictions. Please check if the API server is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchPredictions();
    }, []);

    const handleCountryChange = (country: string) => {
        setSelectedCountry(country);
        const filteredPredictions = country === "Global" ? predictions : predictions.filter(p => p.country === country);
        const aggregated = aggregateByWeek(filteredPredictions, country);
        setAggregatedData(aggregated);
    };

    // Function to get week start date (Monday)
    const getWeekStart = (date: Date): string => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    };

    // Function to aggregate data by week
    const aggregateByWeek = (data: PredictionData[], country: string = selectedCountry): PredictionData[] => {
        const aggregated: { [key: string]: any } = {};

        data.forEach((item) => {
            const itemDate = new Date(item.date);
            const weekStart = getWeekStart(itemDate);

            if (!aggregated[weekStart]) {
                aggregated[weekStart] = {
                    date: weekStart,
                    country: country === "Global" ? "Global" : item.country,
                    predicted_total_cases: 0,
                    predicted_new_cases: 0,
                    predicted_total_deaths: 0,
                    predicted_new_deaths: 0,
                };
            }

            aggregated[weekStart].predicted_total_cases += item.predicted_total_cases;
            aggregated[weekStart].predicted_new_cases += item.predicted_new_cases;
            aggregated[weekStart].predicted_total_deaths += item.predicted_total_deaths;
            aggregated[weekStart].predicted_new_deaths += item.predicted_new_deaths;
        });

        return Object.values(aggregated).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    const getUniqueCountries = () => {
        const countries = Array.from(new Set(predictions.map(p => p.country)));
        return countries.sort();
    };

    // Function to filter data by time range (for predictions, we limit to a number of weeks)
    const filterDataByTimeRange = (data: PredictionData[], days: number): PredictionData[] => {
        if (days === 0) return data;

        // Sort data by date first
        const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (sortedData.length === 0) return [];

        const startDate = new Date(sortedData[0].date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);

        return sortedData.filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });
    };

    const filteredData = filterDataByTimeRange(aggregatedData, timeRange);

    const getTotalStats = () => {
        const latestData = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;
        const totalNewCases = filteredData.reduce((sum, p) => sum + p.predicted_new_cases, 0);
        const totalNewDeaths = filteredData.reduce((sum, p) => sum + p.predicted_new_deaths, 0);
        
        return {
            totalPredictedCases: latestData?.predicted_total_cases || 0,
            totalPredictedDeaths: latestData?.predicted_total_deaths || 0,
            newPredictedCases: totalNewCases,
            newPredictedDeaths: totalNewDeaths,
        };
    };

    const stats = getTotalStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600 dark:text-gray-400">Loading predictions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Predictions
                </h1>
                <div className="flex items-center space-x-4">
                    <div>
                        <label
                            htmlFor="countrySelect"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country
                        </label>
                        <select
                            id="countrySelect"
                            value={selectedCountry}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            aria-label="Select country">
                            <option value="Global">Global</option>
                            {getUniqueCountries().map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="timeRange"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Time Range
                        </label>
                        <select
                            id="timeRange"
                            value={timeRange}
                            onChange={(e) => setTimeRange(Number(e.target.value))}
                            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            aria-label="Select time range">
                            <option value="0">All time</option>
                            <option value="30">Next 30 days</option>
                            <option value="90">Next 90 days</option>
                            <option value="180">Next 180 days</option>
                            <option value="365">Next 365 days</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardStat
                        title="Predicted Total Cases"
                        value={stats.totalPredictedCases.toLocaleString()}
                        trend="up"
                    />
                </Card>
                <Card>
                    <CardStat
                        title="Predicted Total Deaths"
                        value={stats.totalPredictedDeaths.toLocaleString()}
                        trend="down"
                    />
                </Card>
                <Card>
                    <CardStat
                        title="Predicted New Cases"
                        value={stats.newPredictedCases.toLocaleString()}
                        trend="up"
                    />
                </Card>
                <Card>
                    <CardStat
                        title="Predicted New Deaths"
                        value={stats.newPredictedDeaths.toLocaleString()}
                        trend="down"
                    />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Predicted Weekly New Cases">
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="predicted_new_cases"
                                    stroke="#8884d8"
                                    name="Predicted New Cases"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Predicted Weekly New Deaths">
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="predicted_new_deaths"
                                    stroke="#82ca9d"
                                    name="Predicted New Deaths"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Predicted Weekly Cases Distribution">
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="predicted_new_cases"
                                    fill="#8884d8"
                                    name="Predicted New Cases"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Predicted Weekly Deaths Distribution">
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="predicted_new_deaths"
                                    fill="#82ca9d"
                                    name="Predicted New Deaths"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="mt-8">
                <Card title="Predictions Data Table">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Country
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Predicted New Cases
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Predicted Total Cases
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Predicted New Deaths
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Predicted Total Deaths
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredData.slice(0, 50).map((prediction, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {prediction.country}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {new Date(prediction.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {prediction.predicted_new_cases.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {prediction.predicted_total_cases.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {prediction.predicted_new_deaths.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {prediction.predicted_total_deaths.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}