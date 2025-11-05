import type { ColumnDataType } from "./components/Table";

function singleValue(key: string, niceName: string, dataType?: ColumnDataType) {
    return {
        name: niceName,
        query: `SELECT ${key} AS \`${niceName}\` FROM models
    WHERE model_id = ?`,
        columnExplicitlySetDataTypes: dataType ? { [niceName]: dataType } : {},
    };
}

export const defaultQueries = [
    singleValue("brand", "Brand"),
    singleValue("company_country_code", "Company Country Code", "country"),
    singleValue("selfhostable", "Self-hostable", "boolean"),
    singleValue("reasoning", "Supports Reasoning", "boolean"),
    singleValue("humanitys_last_exam_percentage", "Humanity's Last Exam %"),
    singleValue("swe_bench_resolved_percentage", "SWE-Bench Resolved %"),
    singleValue("skatebench_score", "SkateBench Score"),
];
