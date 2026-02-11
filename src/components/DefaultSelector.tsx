import React from "react";
import { defaultQueries, defaultImageQueries } from "../constants";
import type { ColumnQuery } from "./Table";

const QUERY_COLORS = [
    "#7c3aed",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#14b8a6",
    "#6366f1",
    "#f59e0b",
    "#06b6d4",
    "#84cc16",
];

export default function DefaultSelector({
    queries,
    setQueries,
    modelType,
}: {
    queries: ColumnQuery[];
    setQueries: (cb: (prev: ColumnQuery[]) => ColumnQuery[]) => void;
    modelType: "llm" | "image";
}) {
    const availableDefaults = modelType === "llm" ? defaultQueries : defaultImageQueries;

    const checkedQueries = React.useMemo(() => {
        return availableDefaults
            .filter((dq) => queries.find((q) => q.query === dq.query))
            .map((dq) => dq.name);
    }, [queries, availableDefaults]);

    const handleChange = React.useCallback(
        (name: string) => {
            const dq = availableDefaults.find((dq) => dq.name === name);
            if (!dq) return;
            if (checkedQueries.includes(name)) {
                setQueries((prev) => prev.filter((q) => q.query !== dq.query));
            } else {
                setQueries((prev) => {
                    const filter = prev.filter((q) => q.query !== dq.query);
                    return [
                        ...filter,
                        {
                            ...dq,
                            columnFilters: {},
                            columnOrdering: {},
                        },
                    ];
                });
            }
        },
        [checkedQueries, availableDefaults]
    );

    return (
        <div className="flex flex-col gap-0.5">
            {availableDefaults.map((dq, idx) => {
                const isChecked = checkedQueries.includes(dq.name);
                const color = QUERY_COLORS[idx % QUERY_COLORS.length];
                return (
                    <label
                        key={dq.name}
                        className="flex items-center gap-2.5 py-1.5 px-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors"
                    >
                        <span
                            className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border"
                            style={{
                                backgroundColor: isChecked ? color : "transparent",
                                borderColor: color,
                            }}
                        >
                            {isChecked && (
                                <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </span>
                        <span className="text-sm">{dq.name}</span>
                    </label>
                );
            })}
        </div>
    );
}
