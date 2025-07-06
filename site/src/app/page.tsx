"use client";

import { useEffect, useState } from "react";
import { Card, CardStat } from "@/components/ui/Card";
import { api, CovidTotals, StatsSummary } from "@/services/api";
import { useTranslation } from "@/components/TranslationProvider";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function Home() {
    const { t } = useTranslation();
    const [covidTotals, setCovidTotals] = useState<CovidTotals | null>(null);
    const [statsSummary, setStatsSummary] = useState<StatsSummary | null>(null);
    const [latestCovidData, setLatestCovidData] = useState<any[]>([]);
    const [sortField, setSortField] = useState<string>("country");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [totals, summary, latest] = await Promise.all([
                    api.getCovidTotals(),
                    api.getStatsSummary(),
                    api.getLatestCovidData(),
                ]);
                setCovidTotals(totals);
                setStatsSummary(summary);
                setLatestCovidData(latest);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedData = [...latestCovidData].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        if (sortField === "date") {
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const getSortIcon = (field: string) => {
        if (sortField !== field) return "↕";
        return sortDirection === "asc" ? "↑" : "↓";
    };

    return (
        <div className="flex flex-col  overflow-hidden p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t("home.title")}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardStat
                        title={t("data.totalCases", "Total COVID Cases")}
                        value={
                            Number(covidTotals?.total_cases).toLocaleString() ||
                            "Loading..."
                        }
                        trend="up"
                    />
                </Card>
                <Card>
                    <CardStat
                        title={t("data.totalDeaths", "Total COVID Deaths")}
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
                        title={t("data.totalCases", "Total MPOX Cases")}
                        value={
                            statsSummary?.mpox.total_cases.toLocaleString() ||
                            "Loading..."
                        }
                        trend="up"
                    />
                </Card>
                <Card>
                    <CardStat
                        title={t("data.totalDeaths", "Total MPOX Deaths")}
                        value={
                            statsSummary?.mpox.total_deaths.toLocaleString() ||
                            "Loading..."
                        }
                        trend="down"
                    />
                </Card>
            </div>

            <Card
                title={t("data.latestUpdates", "Latest COVID-19 Updates")}
                className="flex flex-col overflow-hidden">
                <div className="overflow-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleSort("country")}>
                                    {t("data.country", "Country")}{" "}
                                    {getSortIcon("country")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleSort("date")}>
                                    {t("data.date", "Date")}{" "}
                                    {getSortIcon("date")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleSort("new_cases")}>
                                    {t("data.newCases", "New Cases")}{" "}
                                    {getSortIcon("new_cases")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleSort("new_deaths")}>
                                    {t("data.newDeaths", "New Deaths")}{" "}
                                    {getSortIcon("new_deaths")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedData.map((data, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {data.country}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(
                                            data.date
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {data.new_cases.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {data.new_deaths.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
