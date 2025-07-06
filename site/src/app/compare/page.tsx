"use client";

import { useEffect, useState } from "react";
import { Card, CardStat } from "@/components/ui/Card";
import { api, CovidData, MpoxData, StatsSummary } from "@/services/api";
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

export default function ComparePage() {
    const { t } = useTranslation();
    const [statsSummary, setStatsSummary] = useState<StatsSummary | null>(null);
    const [aggregatedCovidData, setAggregatedCovidData] = useState<CovidData[]>(
        []
    );
    const [aggregatedMpoxData, setAggregatedMpoxData] = useState<MpoxData[]>(
        []
    );
    const [selectedCountry, setSelectedCountry] = useState<string>("Global");
    const [covidTimeRange, setCovidTimeRange] = useState<number>(90); // Default to 90 days
    const [mpoxTimeRange, setMpoxTimeRange] = useState<number>(90); // Default to 90 days
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [summary, covidData, mpoxData] = await Promise.all([
                    api.getStatsSummary(),
                    api.getAllCovidData(undefined, 100_000_000),
                    api.getAllMpoxData(undefined, 100_000_000),
                ]);
                setStatsSummary(summary);

                const aggregatedCovid = aggregateByWeek(covidData, "covid");
                const aggregatedMpox = aggregateByWeek(mpoxData, "mpox");

                setAggregatedCovidData(aggregatedCovid);
                setAggregatedMpoxData(aggregatedMpox);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(t('pages.compare.error', 'Unable to load data. Please check if the API server and database are running.'));
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
            const [covidData, mpoxData] = await Promise.all([
                api.getAllCovidData(country === "Global" ? undefined : country, 1000),
                api.getAllMpoxData(country === "Global" ? undefined : country, 1000),
            ]);

            const aggregatedCovid = aggregateByWeek(covidData, "covid");
            const aggregatedMpox = aggregateByWeek(mpoxData, "mpox");

            setAggregatedCovidData(aggregatedCovid);
            setAggregatedMpoxData(aggregatedMpox);
        } catch (error) {
            console.error("Error fetching country data:", error);
            setError(t('pages.compare.error', 'Unable to load country data. Please check if the API server and database are running.'));
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
    const aggregateByWeek = (data: any[], type: "covid" | "mpox"): any[] => {
        const aggregated: { [key: string]: any } = {};

        data.forEach((item) => {
            const itemDate = new Date(item.date);
            const weekStart = getWeekStart(itemDate);

            if (!aggregated[weekStart]) {
                aggregated[weekStart] = {
                    date: weekStart,
                    country:
                        selectedCountry === "Global"
                            ? "Global"
                            : item.country,
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

    // Function to filter data by time range for COVID
    const filterCovidDataByTimeRange = (data: any[], days: number): any[] => {
        if (days === 0) return data; // 0 means all data

        const today = new Date();
        const cutoffDate = new Date(today);
        cutoffDate.setDate(today.getDate() - days);

        return data.filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate >= cutoffDate;
        });
    };

    // Function to filter data by time range for MPOX
    const filterMpoxDataByTimeRange = (data: any[], days: number): any[] => {
        if (days === 0) return data; // 0 means all data

        const today = new Date();
        const cutoffDate = new Date(today);
        cutoffDate.setDate(today.getDate() - days);

        return data.filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate >= cutoffDate;
        });
    };

    // Get filtered data for both datasets
    const filteredCovidData = filterCovidDataByTimeRange(
        aggregatedCovidData,
        covidTimeRange
    );
    const filteredMpoxData = filterMpoxDataByTimeRange(
        aggregatedMpoxData,
        mpoxTimeRange
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600 dark:text-gray-400">{t('data.loading')}</div>
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
                    {t('pages.compare.title')}
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
                        title={t('data.covidCases')}
                        value={
                            statsSummary?.covid.total_cases.toLocaleString() ||
                            "Loading..."
                        }
                        trend="up"
                    />
                </Card>
                <Card>
                    <CardStat
                        title={t('data.covidDeaths')}
                        value={
                            statsSummary?.covid.total_deaths.toLocaleString() ||
                            "Loading..."
                        }
                        trend="down"
                    />
                </Card>
                <Card>
                    <CardStat
                        title={t('data.mpoxCases')}
                        value={
                            statsSummary?.mpox.total_cases.toLocaleString() ||
                            "Loading..."
                        }
                        trend="up"
                    />
                </Card>
                <Card>
                    <CardStat
                        title={t('data.mpoxDeaths')}
                        value={
                            statsSummary?.mpox.total_deaths.toLocaleString() ||
                            "Loading..."
                        }
                        trend="down"
                    />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={t('charts.covidWeeklyNewCases')}>
                    <div className="flex justify-end mb-2">
                        <div>
                            <label
                                htmlFor="covidTimeRange"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Time Range (COVID)
                            </label>
                            <select
                                id="covidTimeRange"
                                value={covidTimeRange}
                                onChange={(e) =>
                                    setCovidTimeRange(Number(e.target.value))
                                }
                                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                aria-label="Select time range for COVID data">
                                <option value="0">All time</option>
                                <option value="90">Last 90 days</option>
                                <option value="180">Last 180 days</option>
                                <option value="365">Last 365 days</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredCovidData}>
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
                                    name="COVID New Cases"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title={t('charts.covidWeeklyNewDeaths')}>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredCovidData}>
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
                                    name="COVID New Deaths"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={t('charts.mpoxWeeklyNewCases')}>
                    <div className="flex justify-end mb-2">
                        <div>
                            <label
                                htmlFor="mpoxTimeRange"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Time Range (MPOX)
                            </label>
                            <select
                                id="mpoxTimeRange"
                                value={mpoxTimeRange}
                                onChange={(e) =>
                                    setMpoxTimeRange(Number(e.target.value))
                                }
                                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                aria-label="Select time range for MPOX data">
                                <option value="0">All time</option>
                                <option value="90">Last 90 days</option>
                                <option value="180">Last 180 days</option>
                                <option value="365">Last 365 days</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredMpoxData}>
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
                                    name="MPOX New Cases"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title={t('charts.mpoxWeeklyNewDeaths')}>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredMpoxData}>
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
                                    name="MPOX New Deaths"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={t('charts.covidWeeklyCasesDistribution')}>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredCovidData}>
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
                                    name="COVID New Cases"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title={t('charts.covidWeeklyDeathsDistribution')}>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredCovidData}>
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
                                    name="COVID New Deaths"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={t('charts.mpoxWeeklyCasesDistribution')}>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredMpoxData}>
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
                                    name="MPOX New Cases"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title={t('charts.mpoxWeeklyDeathsDistribution')}>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredMpoxData}>
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
                                    name="MPOX New Deaths"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
