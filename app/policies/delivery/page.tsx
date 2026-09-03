import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/PolicyPage";
import { policies } from "@/lib/policies/content";

export const metadata: Metadata = { title: policies.delivery.title, description: policies.delivery.description };
export default function DeliveryPolicyPage() { return <PolicyPage policy={policies.delivery} />; }
