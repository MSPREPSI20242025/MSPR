"use client";

import { useEffect, useState } from "react";
import { Card, CardStat } from "@/components/ui/Card";
import { api, CovidData, CovidTotals } from "@/services/api";
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

export default function CovidPage() {
    const [covidTotals, setCovidTotals] = useState<CovidTotals | null>(null);
    const [aggregatedData, setAggregatedData] = useState<CovidData[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>("Global");
    const [timeRange, setTimeRange] = useState<number>(90); // Default to 90 days
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [totals, allData] = await Promise.all([
                    api.getCovidTotals(),
                    api.getAllCovidData(undefined, 100_000_000),
                ]);
                setCovidTotals(totals);
                const aggregated = aggregateByWeek(allData);
                setAggregatedData(aggregated);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Unable to load data. Please check if the API server and database are running.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCountryChange = async (country: string) => {
        setSelectedCountry(country);
        try {
            setError(null);
            const data = await api.getAllCovidData(country === "Global" ? undefined : country, 1000);
            const aggregated = aggregateByWeek(data);
            setAggregatedData(aggregated);
        } catch (error) {
            console.error("Error fetching country data:", error);
            setError("Unable to load country data. Please check if the API server and database are running.");
        }
    };

    // Function to get week start date (Monday)
    const getWeekStart = (date: Date): string => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    };

    // Function to aggregate data by week
    const aggregateByWeek = (data: CovidData[]): CovidData[] => {
        const aggregated: { [key: string]: CovidData } = {};

        data.forEach((item) => {
            const itemDate = new Date(item.date);
            const weekStart = getWeekStart(itemDate);

            if (!aggregated[weekStart]) {
                aggregated[weekStart] = {
                    date: weekStart,
                    country:
                        selectedCountry === "Global" ? "Global" : item.country,
                    total_cases: 0,
                    new_cases: 0,
                    total_deaths: 0,
                    new_deaths: 0,
                };
            }

            aggregated[weekStart].total_cases += item.total_cases;
            aggregated[weekStart].new_cases += item.new_cases;
            aggregated[weekStart].total_deaths += item.total_deaths;
            aggregated[weekStart].new_deaths += item.new_deaths;
        });

        return Object.values(aggregated).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    // Function to filter data by time range
    const filterDataByTimeRange = (
        data: CovidData[],
        days: number
    ): CovidData[] => {
        if (days === 0) return data; // 0 means all data

        const today = new Date();
        const cutoffDate = new Date(today);
        cutoffDate.setDate(today.getDate() - days);

        return data.filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate >= cutoffDate;
        });
    };

    // Get data filtered by the selected time range
    const filteredData = filterDataByTimeRange(aggregatedData, timeRange);

    const activeCases = "N/A";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600 dark:text-gray-400">Loading data...</div>
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
                    COVID-19 Dashboard
                </h1>
                <div className="flex items-center space-x-4">
                    <div>
                        <label
                            htmlFor="timeRange"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Time Range
                        </label>
                        <select
                            id="timeRange"
                            value={timeRange}
                            onChange={(e) =>
                                setTimeRange(Number(e.target.value))
                            }
                            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            aria-label="Select time range">
                            <option value="0">All time</option>
                            <option value="90">Last 90 days</option>
                            <option value="180">Last 180 days</option>
                            <option value="365">Last 365 days</option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="countrySelect"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country
                        </label>
                        <select
                            id="countrySelect"
                            value={selectedCountry}
                            onChange={(e) =>
                                handleCountryChange(e.target.value)
                            }
                            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            aria-label="Select country">
                            <option value="Global">Global</option>
                            <option value="USA">United States</option>
                            <option value="UK">United Kingdom</option>
                            <option value="France">France</option>
                            <option value="Germany">Germany</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardStat
                        title="Total Cases"
                        value={
                            Number(covidTotals?.total_cases).toLocaleString() ||
                            "Loading..."
                        }
                        trend="up"
                    />
                </Card>
                <Card>
                    <CardStat
                        title="Total Deaths"
                        value={
                            Number(
                                covidTotals?.total_deaths
                            ).toLocaleString() || "Loading..."
                        }
                        trend="down"
                    />
                </Card>
                <Card>
                    <CardStat
                        title="Active Cases"
                        value={activeCases}
                        trend="down"
                    />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Weekly New Cases">
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
                                    dataKey="new_cases"
                                    stroke="#8884d8"
                                    name="New Cases"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Weekly New Deaths">
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
                                    dataKey="new_deaths"
                                    stroke="#82ca9d"
                                    name="New Deaths"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Weekly Cases Distribution">
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
                                    dataKey="new_cases"
                                    fill="#8884d8"
                                    name="New Cases"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Weekly Deaths Distribution">
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
                                    dataKey="new_deaths"
                                    fill="#82ca9d"
                                    name="New Deaths"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
