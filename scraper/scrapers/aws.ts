import type { DataFormat } from "@/src/dataFormat";
import { isReasoningModel, isSelfHostableModel } from "../constants";

type PriceDimension = {
    pricePerUnit?: {
        USD?: string;
    };
    unit?: string;
};

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const PROVIDERS = {
    Meta: "US",
    Anthropic: "US",
    OpenAI: "US",
    Qwen: "CN",
    DeepSeek: "CN",
    Mistral: "FR",
} as const;

function providerToCountryCode(provider: string): string {
    const res = PROVIDERS[provider as keyof typeof PROVIDERS];
    if (!res) throw new Error(`Unknown provider: ${provider}. You probably need to add it to the PROVIDERS map in scraper/scrapers/aws.ts.`);
    return res;
}

function processPriceDimension(
    fmt: DataFormat,
    priceDimension: PriceDimension,
    attributes: Record<string, string>
) {
    // No provider or model is things not overly useful to us
    if (!attributes.provider || !attributes.model) return;

    const slugifiedModel = slugify(attributes.model);
    let modelEntry = fmt.models[slugifiedModel];
    if (!modelEntry) {
        modelEntry = {
            cleanName: attributes.model,
            brand: attributes.provider,
            companyCountryCode: providerToCountryCode(attributes.provider),
            vendors: [],
            reasoning: isReasoningModel(slugifiedModel),
            selfhostable: isSelfHostableModel(slugifiedModel, attributes.provider),
            // TODO
        };
        fmt.models[slugifiedModel] = modelEntry;
    }
}

type Term = {
    priceDimensions?: Record<string, PriceDimension>;
};

type PricingFile = {
    products: Record<string, {
        attributes: Record<string, string>;
    }>;
    terms: Record<string, Record<string, Record<string, Term>>>;
};

async function getBedrockPricingFile(): Promise<PricingFile> {
    const response = await fetch(
        'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonBedrock/current/index.json'
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch pricing file: ${response.statusText}`);
    }
    const data: PricingFile = await response.json();
    return data;
}

export default async function scrapeAwsData(fmt: DataFormat) {
    const pricingFile = await getBedrockPricingFile();

    const regions: Record<string, string> = {};
    for (const [sku, product] of Object.entries(pricingFile.products)) {
        // Add the region if it isn't present already
        if (
            product.attributes.location &&
            product.attributes.locationType === "AWS Region" &&
            product.attributes.regionCode
        ) {
            regions[product.attributes.regionCode] = product.attributes.location;
        }

        // Find the pricing terms
        const termHolder = pricingFile.terms.OnDemand[sku as any];
        if (!termHolder) {
            throw new Error(`No OnDemand terms found for SKU: ${sku}`);
        }
        const keys = Object.keys(termHolder);
        if (keys.length === 0) {
            throw new Error(`No terms found for SKU: ${sku}`);
        }
        if (keys.length > 1) {
            throw new Error(`Multiple terms found for SKU: ${sku}`);
        }
        const term = termHolder[keys[0]];

        // Process each pricing term
        if (term.priceDimensions) {
            for (const priceDimension of Object.values<PriceDimension>(term.priceDimensions)) {
                processPriceDimension(fmt, priceDimension, product.attributes);
            }
        }
    }

    fmt.vendors["aws"] = {
        cleanName: "AWS Bedrock",
        learnMoreUrl: "https://aws.amazon.com/bedrock",
        euOrUKRegions: Object.keys(regions).filter(code => code.startsWith('eu-')),
        regionCleanNames: {
            "": regions
        }
    };
}
