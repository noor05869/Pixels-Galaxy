import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/PolicyPage";
import { policies } from "@/lib/policies/content";

export const metadata: Metadata = { title: policies.faq.title, description: policies.faq.description };
export default function FaqPage() { return <PolicyPage policy={policies.faq} />; }
