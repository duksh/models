import type { DataFormat } from "@/src/dataFormat";
import scrapeAwsData from "./scrapers/aws";

async function main() {
    const fmt: DataFormat = {
        vendors: {},
        models: {},
    };
    await Promise.all([
        scrapeAwsData(fmt),
        // Add other scrapers here as needed
    ]);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
