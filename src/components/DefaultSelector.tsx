import React from "react";
import { defaultQueries } from "../constants";
import type { ColumnQuery } from "./Table";

export default function DefaultSelector({
    queries,
    setQueries,
}: {
    queries: ColumnQuery[];
    setQueries: (cb: (prev: ColumnQuery[]) => ColumnQuery[]) => void;
}) {
    const checkedQueries = React.useMemo(() => {
        return defaultQueries.filter((dq) =>
            queries.find((q) => q.query === dq.query),
        ).map((dq) => dq.name);
    }, [queries]);

    const handleChange = React.useCallback(
        (name: string) => {
            const dq = defaultQueries.find((dq) => dq.name === name);
            if (!dq) return;
            if (checkedQueries.includes(name)) {
                // Unchecked
                setQueries((prev) =>
                    prev.filter((q) => q.query !== dq.query),
                );
            } else {
                // Checked
                setQueries((prev) => {
                    const filter = prev.filter((q) => q.query !== dq.query);
                    return [...filter, {
                        ...dq,
                        columnFilters: {},
                        columnOrdering: {},
                    }];
                });
            }
        },
        [checkedQueries],
    );

    return (
        <div className="p-4">
            <h2 className="text-lg font-medium mb-4">Select Default Columns</h2>
            <form>
                {defaultQueries.map((dq) => (
                    <div key={dq.name} className="mb-2">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={checkedQueries.includes(dq.name)}
                                onChange={() => handleChange(dq.name)}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="ml-2">{dq.name}</span>
                        </label>
                    </div>
                ))}
            </form>
        </div>
    )
}
