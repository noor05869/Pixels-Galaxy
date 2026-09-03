import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/PolicyPage";
import { policies } from "@/lib/policies/content";

export const metadata: Metadata = { title: policies.returns.title, description: policies.returns.description };
export default function ReturnsPolicyPage() { return <PolicyPage policy={policies.returns} />; }
