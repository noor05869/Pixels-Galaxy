import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/PolicyPage";
import { policies } from "@/lib/policies/content";

export const metadata: Metadata = { title: policies.privacy.title, description: policies.privacy.description };
export default function PrivacyPolicyPage() { return <PolicyPage policy={policies.privacy} />; }
