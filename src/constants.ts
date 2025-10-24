export const defaultQueries = [
    {
        name: "Testing",
        query: "SELECT selfhostable AS `Self-hostable`, brand FROM models WHERE model_id = ?",
        columnExplicitlySetDataTypes: {
            "Self-hostable": "boolean" as const,
        },
    },
];
