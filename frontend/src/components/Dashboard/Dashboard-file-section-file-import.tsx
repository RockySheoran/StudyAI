import { Dashboard_hero } from "./Dashboard-hero";
import { Interview_history } from "./Interview-history";
import { Summary_history } from "./Summary-history";

export const Dashboard_file_section_file_import = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 gap-7 flex flex-col">
            <Dashboard_hero />
            <Summary_history />
            <Interview_history />
        </div>
    )
}