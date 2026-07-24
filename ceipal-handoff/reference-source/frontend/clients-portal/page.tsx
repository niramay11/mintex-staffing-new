import { Metadata } from "next";
import PortalClient from "./PortalClient";

export const metadata: Metadata = {
    title: "Client Portal - Mintex Staffing",
    description: "View and manage candidate applications month-wise",
};

export default function PortalPage() {
    return <PortalClient />;
}
