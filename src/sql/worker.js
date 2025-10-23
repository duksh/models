import schema from "./schema";
import alasql from "alasql";

let loaded = false;

/** @param {import("../dataFormat").DataFormat} data  */
function loadData(data) {
    // Add the vendors
    const vendorsPrep = alasql.compile("INSERT INTO vendors (vendor_id, clean_name, learn_more_url, eu_or_uk_regions) VALUES (?, ?, ?, ?)");
    const vendorRegionsPrep = alasql.compile("INSERT INTO vendor_regions (vendor_id, region_code, category, region_name) VALUES (?, ?, ?, ?)");
    for (const [vendorId, vendorData] of Object.entries(data.vendors)) {
        vendorsPrep([vendorId, vendorData.cleanName, vendorData.learnMoreUrl, vendorData.euOrUKRegions]);
        for (const [categoryOrEmpty, regions] of Object.entries(vendorData.regionCleanNames)) {
            const category = categoryOrEmpty === "" ? null : categoryOrEmpty;
            for (const [regionCode, regionName] of Object.entries(regions)) {
                vendorRegionsPrep([vendorId, regionCode, category, regionName]);
            }
        }
    }

    // Add the models
    const modelsPrep = alasql.compile("INSERT INTO models (model_id, clean_name, brand, company_country_code, selfhostable, reasoning, humanitys_last_exam_percentage, swe_bench_resolved_percentage, skatebench_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const modelsTokenisersPrep = alasql.compile("INSERT INTO models_tokenisers (model_id, tokeniser, url) VALUES (?, ?, ?)");
    const modelsVendorsPrep = alasql.compile("INSERT INTO models_vendors (model_id, vendor_id, latency_ms, tokens_per_second, low_capacity) VALUES (?, ?, ?, ?, ?)");
    const modelsVendorsRegionsPrep = alasql.compile("INSERT INTO models_vendors_regions (model_id, vendor_id, region_code, input_token_cost, output_token_cost) VALUES (?, ?, ?, ?, ?)");
    for (const [modelId, modelData] of Object.entries(data.models)) {
        modelsPrep([
            modelId,
            modelData.cleanName,
            modelData.brand,
            modelData.companyCountryCode,
            modelData.selfhostable,
            modelData.reasoning,
            modelData.humanitysLastExamPercentage ?? null,
            modelData.sweBenchResolvedPercentage ?? null,
            modelData.skatebenchScore ?? null,
        ]);
        switch (modelData.tokeniser.type) {
            case "site-api":
                modelsTokenisersPrep([modelId, "site-api", modelData.tokeniser.url]);
                break;
            case "tiktoken":
                modelsTokenisersPrep([modelId, "tiktoken", modelData.tokeniser.bpePath]);
                break;
            case "transformers":
                modelsTokenisersPrep([modelId, "transformers", modelData.tokeniser.pretrainedPath]);
                break;
            default:
                throw new Error(`Unknown tokeniser type: ${modelData.tokeniser.type}`);
        }
        for (const vendor of modelData.vendors) {
            modelsVendorsPrep([
                modelId,
                vendor.vendorRef,
                vendor.latencyMs,
                vendor.tokensPerSecond,
                vendor.lowCapacity,
            ]);
            for (const [regionCode, [inputTokenCost, outputTokenCost]] of Object.entries(vendor.regionPricing)) {
                modelsVendorsRegionsPrep([
                    modelId,
                    vendor.vendorRef,
                    regionCode,
                    inputTokenCost,
                    outputTokenCost,
                ]);
            }
        }
    }
}

const compilationCache = new Map();

self.onmessage = (event) => {
    if (!loaded) {
        loaded = true;
        const data = event.data;
        alasql(schema);
        loadData(data);
        self.postMessage(null);
        return;
    }

    const [id, query, param] = event.data;
    if (id === 0) {
        let prep = compilationCache.get(query);
        if (!prep) {
            prep = alasql.compile(query);
            compilationCache.set(query, prep);
        }
        const res = prep(param);
        self.postMessage(res[0] ?? null);
        return;
    }

    let prep = compilationCache.get(query);
    if (!prep) {
        prep = alasql.compile(query);
        compilationCache.set(query, prep);
    }
    const res = prep();
    self.postMessage(res);
};
