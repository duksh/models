import { PlusIcon, XIcon } from "lucide-react";
import CurrencyPicker from "./CurrencyPicker";
import { clearState } from "../state";

export default function PortalRoot({ modelType }: { modelType: "llm" | "image" }) {
    return (
        <>
            <button
                onClick={() => clearState()}
                className="mr-2 py-1 px-2 flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
            >
                <XIcon className="w-3.5 h-3.5" />
                Clear Filters
            </button>
            <button
                id="portal-add-button"
                onClick={() => {
                    document.getElementById("add-button")?.click();
                }}
                className="mr-2 py-1 px-2 border border-white/30 rounded cursor-pointer text-sm hover:bg-white/10 transition-colors"
            >
                <PlusIcon className="inline mr-1" size={14} />
                Add Query
            </button>
            <CurrencyPicker modelType={modelType} />
        </>
    );
}
