export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  table?: Array<{ label: string; value: string }>;
};

export type PolicyDocument = {
  title: string;
  description: string;
  href: string;
  updated: string;
  sections: PolicySection[];
};

const contact = "Email support@pixelsgalaxy.com or WhatsApp +92 332 4468116.";

export const policies: Record<"delivery" | "returns" | "privacy" | "faq", PolicyDocument> = {
  delivery: {
    title: "Delivery Policy",
    description: "Delivery coverage, timing, charges, tracking, and damaged-parcel guidance for Pixels Galaxy orders.",
    href: "/policies/delivery",
    updated: "September 3, 2026",
    sections: [
      { heading: "Delivery coverage", paragraphs: ["Pixels Galaxy currently delivers within Pakistan only. International delivery is not available."] },
      { heading: "Estimated delivery time", paragraphs: ["Delivery timing depends on the courier, destination, and service availability."], table: [
        { label: "Major cities", value: "2-4 working days" },
        { label: "Other cities and towns", value: "3-6 working days" },
        { label: "Remote areas", value: "Subject to courier coverage" },
      ] },
      { heading: "Order confirmation", paragraphs: ["We may confirm Cash on Delivery orders by phone or WhatsApp before dispatch. Incomplete contact or address details may delay an order until they are confirmed."] },
      { heading: "Delivery charges and tracking", paragraphs: ["Delivery charges are shown before checkout confirmation. Any free-delivery offer is displayed on the product page and checkout.", "When tracking is available, we share it by SMS, WhatsApp, or email after dispatch."] },
      { heading: "Failed or damaged delivery", paragraphs: ["If delivery fails because the customer is unavailable, refuses the parcel, or supplied an incorrect address, the parcel may be returned. Repeat failed delivery may require advance payment.", "If a parcel looks badly damaged, take photos before opening it and contact us as soon as possible. " + contact] },
    ],
  },
  returns: {
    title: "Return and Refund Policy",
    description: "Eligibility, time limits, approval steps, refunds, and exchanges for Ku String orders.",
    href: "/policies/returns",
    updated: "September 3, 2026",
    sections: [
      { heading: "Return window", paragraphs: ["Report any return, replacement, or refund request within 3 days of receiving the order. Requests made later may be refused unless Pixels Galaxy confirms a valid product issue."] },
      { heading: "Valid return reasons", bullets: ["The wrong product or colour was delivered.", "The product arrived damaged.", "The package is incomplete or missing parts.", "The product does not match its description or pictures.", "A manufacturing fault is reported within the return window."] },
      { heading: "Change of mind", paragraphs: ["Change-of-mind returns require approval before the product is sent back. Return courier charges are the customer's responsibility."], bullets: ["The toy must be unused and in its original packaging.", "All parts, accessories, manuals, tags, and free items must be included.", "Packaging must not be damaged, torn, or missing.", "The request must be made within 3 days of delivery."] },
      { heading: "Non-returnable cases", bullets: ["The toy has been used, damaged, altered, exposed to water or heat, or handled incorrectly.", "Any part, accessory, manual, tag, free item, or packaging is missing.", "The issue is reported after the return window.", "The item is sent back without approval.", "The item was bought from an unauthorised seller or marketplace account."] },
      { heading: "Return approval process", steps: ["Contact Pixels Galaxy support.", "Share your order number, phone number, reason, and clear photos or video.", "Wait for approval and return instructions before sending the item.", "Send the product back or follow the arranged pickup process.", "After inspection, we confirm a replacement, refund, store credit, or rejection."] },
      { heading: "Refunds and exchanges", paragraphs: ["Refunds are processed after the returned item is received and inspected. Prepaid refunds are returned through the original payment method where possible; the method for a Cash on Delivery refund is confirmed with the customer. Delivery charges may be non-refundable unless Pixels Galaxy caused the issue.", "A colour exchange may be approved when the requested colour is in stock and the original product is unused, complete, and reported within 3 days. The customer pays courier costs unless Pixels Galaxy sent the wrong colour."] },
      { heading: "Contact support", paragraphs: ["Do not return an item before approval. " + contact] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "How Pixels Galaxy collects, uses, shares, and protects customer information.",
    href: "/policies/privacy",
    updated: "September 3, 2026",
    sections: [
      { heading: "Information we collect", bullets: ["Name, phone number, delivery address, and city.", "Email address when provided.", "Order details and payment method.", "Website activity used for analytics and advertising."] },
      { heading: "How we use information", bullets: ["Process and confirm orders.", "Deliver parcels and share tracking updates.", "Handle returns and customer support.", "Improve website performance and advertising."] },
      { heading: "Sharing information", paragraphs: ["We may share the information needed to operate the store with courier partners, payment providers, website and hosting providers, analytics tools, and authorised support or operations team members. Pixels Galaxy does not sell customer personal information."] },
      { heading: "Messages and marketing", paragraphs: ["Customers may receive order-related updates by WhatsApp, SMS, phone, or email. Promotional messages are sent responsibly, and customers can ask to be removed from promotional lists."] },
      { heading: "Data security and contact", paragraphs: ["Customer information is stored in approved business systems and protected from unnecessary access.", "For privacy questions or removal requests, " + contact] },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    description: "Answers about Ku String pricing, colours, delivery, payment, returns, and support.",
    href: "/faq",
    updated: "September 3, 2026",
    sections: [
      { heading: "What is Ku String?", paragraphs: ["Ku String is a rechargeable flying-string toy sold by Pixels Galaxy. It moves a soft glowing loop through the air for waves, circles, and tricks."] },
      { heading: "What age is it for?", paragraphs: ["Ku String is marked for ages 3+. Adult supervision is recommended."] },
      { heading: "Which colours and sizes are available?", paragraphs: ["Choose blue, green, or pink. Every colour has the same size and product type."] },
      { heading: "What is the price?", paragraphs: ["One Ku String costs PKR 1,999. The Pick Any 2 bundle costs PKR 3,500 and includes free delivery across Pakistan."] },
      { heading: "Is Cash on Delivery available?", paragraphs: ["Yes, subject to courier availability and order confirmation. We may confirm an order by phone or WhatsApp before dispatch."] },
      { heading: "How long does delivery take?", paragraphs: ["Major cities usually take 2-4 working days, other cities and towns usually take 3-6 working days, and remote-area timing depends on courier coverage."] },
      { heading: "Can I return or exchange it?", paragraphs: ["Contact us within 3 days of delivery. Returns may be approved for damaged, wrong, incomplete, incorrectly described, or faulty products. Change-of-mind and colour exchanges require the toy to be unused, complete, and in its original packaging. Courier charges may apply."] },
      { heading: "How do I contact support?", paragraphs: [contact] },
    ],
  },
};
