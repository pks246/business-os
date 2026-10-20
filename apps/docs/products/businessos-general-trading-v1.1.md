# BusinessOS General Trading — V1 Product Scope

**Status:** Initial product brief for implementation planning  
**Version:** 0.2  
**Target segment:** B2B general trading and distribution  
**Initial examples:** Building materials, hardware, safety equipment, electrical products, wood, and industrial consumables  
**Last updated:** 20 October 2026

**Scope update:** Version 0.2 adds an optional website chatbot with human escalation and practical invoicing in the admin workspace.

This is a starting product scope based on the selected reference websites. It is intentionally narrow enough to implement progressively and broad enough to support several kinds of trading business. The first release should validate the platform with a coherent buyer-to-enquiry workflow, human-assisted chatbot support, and practical invoicing—not attempt to deliver a complete ERP or accounting system.

## 1. Product goal

Let a general-trading business owner set up a professional public website and catalogue, customise its design and content, receive product enquiries or quotation requests, and manage those requests through an authenticated admin workspace—without needing a separate software project for that customer.

The same platform should support multiple independent businesses. One owner may manage several business workspaces; each business has separate branding, catalogue, customers, staff permissions, website settings, and trading records.

## 2. Target workflow

1. An owner creates a business workspace and chooses the General Trading template.
2. The platform creates a safe default configuration, website preset, and starter admin navigation.
3. The owner enters company information, uploads a logo, selects brand/theme settings, configures catalogue categories, and adds products/brands.
4. The owner customises the homepage by selecting, configuring, hiding, and reordering approved sections; previews the site before publishing.
5. A buyer browses and searches the catalogue. Depending on the business's configured selling mode, they can contact the business about one product or submit a request for quotation for one or more products and quantities.
6. The request is stored against the correct tenant and site, and authorised staff can review it, follow up, and record its status.
7. The owner can change branding, content, product visibility, and supported workflow settings without code. Changes in one business do not affect another.
8. Buyers can ask questions through an optional website chatbot. When the bot cannot resolve an enquiry or the buyer requests a person, the conversation is handed to the business team with context preserved.
9. Authorised staff can create invoices in the admin workspace, and the application can prepare an invoice draft from a supported quote/order workflow.

## 3. Essential owner-facing UI customisation

The website builder must not be an afterthought. The first iteration can be simple, but the data model and renderer should support future expansion.

### Theme controls

- logo and favicon;
- brand/accent and background colours using validated design tokens;
- heading/body font choices from an approved set;
- button style and common spacing/layout presets;
- reusable image assets and alt text.

### Page and section controls

- create and edit supported pages from approved templates;
- edit titles, subtitles, text, links, images, and calls to action;
- show/hide and reorder approved sections;
- select supported section layouts and card styles;
- preview draft changes before publishing;
- retain a clear separation between draft configuration and the published site.

### Initial page/section library

The initial General Trading template should offer a configurable homepage with sections such as:

- hero with a value proposition and clear `Browse Products` / `Request a Quote` actions;
- product category grid;
- featured product groups or selected products;
- represented/distributed brands;
- company information and trading strengths;
- industries/customers served;
- contact details and enquiry call-to-action.

It should also provide reusable product category, search/results, product details, about, contact, and request-for-quotation page templates. Owners configure content and supported appearance settings; they do not edit or inject executable code.

## 4. Catalogue requirements

### Categories

- configurable hierarchical categories, with ordering and visibility controls;
- categories belong to a tenant and cannot leak across businesses;
- products can be assigned to one or more categories if supported by the chosen data model;
- URL slugs and page metadata should be stable and validated.

### Products

A product should support, at minimum:

- tenant-scoped ID and a human-readable SKU/product code;
- name/title, short and long description;
- category assignment;
- one or more images with alt text;
- brand or manufacturer (optional);
- configurable technical attributes/specifications;
- units of measure and packaging information where relevant;
- minimum order quantity or order increment where applicable;
- visibility/draft state;
- selling mode/price policy, rather than assuming a visible fixed price;
- timestamps and audit-relevant metadata.

A product may have technical attributes that vary by category—for example, diameter, size, grade, material, voltage, length, colour, or packaging. The platform should support validated attribute definitions rather than adding a new database column for every industry's product specification. Do not build a full enterprise product-information-management system in V1; start with a bounded schema-driven attribute model.

### Brands and product groups

- businesses can list brands they distribute;
- brand pages/listings can be shown or hidden on the website;
- product-to-brand relationships must be tenant-scoped.

### Search

V1 should support keyword search over visible products and basic category filtering. More advanced facets, ranking, multilingual synonyms, and external search services can be added later.

## 5. Sales and enquiry model

Not every wholesaler wants public pricing or an online checkout. Storefront behaviour must be configurable.

### Initial selling modes

- **Enquiry-led:** show product details and a contact/request-quote action, without showing a price.
- **Quote-led catalogue:** buyer adds products and quantities to an RFQ basket, then submits contact details and requirements.
- **Visible pricing:** allow selected products to display approved prices, if the owner enables this mode.

Full online checkout, payment gateway integration, tax calculation, shipping/carrier integrations, and automated order capture are later capabilities unless a validated first customer requires one earlier.

### RFQ/enquiry lifecycle

V1 should define a basic lifecycle, such as:

`Submitted → In Review → Responded → Accepted / Declined / Closed`

Exact state names can be adjusted during implementation, but transitions should be explicit and tested. Requests should capture:

- tenant and originating site;
- request reference and creation time;
- contact name and at least one contact channel;
- company name when supplied;
- requested products and quantities (when applicable);
- buyer notes/requirements;
- status and internal staff notes kept separate from public information.

A public buyer must not need an account just to submit a basic enquiry. Create a persistent Party/contact only when the workflow or business policy calls for it; do not create duplicate customer records for every anonymous enquiry by default. The enquiry itself must be stored securely and linked to the tenant. Protect public endpoints with validation, abuse controls, and safe rate limits.

Staff should be able to view, search, update status, and record follow-up against a request. Sending automated email or WhatsApp messages is not mandatory for the first functional slice; keep notification delivery behind a later integration boundary.

## 6. Website enquiry chatbot and human handoff

The public website may offer an owner-configurable chatbot to answer common pre-sales and product questions and route unresolved cases to a human. The feature must be useful without making the chatbot a mandatory gate for reaching the business.

### Customer experience

- The owner can enable or disable the chatbot per business/site.
- The chatbot clearly identifies itself as an automated assistant and offers a visible way to contact a human.
- It can answer from approved business content, published website pages, catalogue information, and owner-managed FAQs or knowledge entries.
- It may help visitors find relevant product categories and products and explain how to submit an enquiry or RFQ.
- It must not invent prices, stock availability, certifications, technical specifications, delivery commitments, or commercial terms. If the approved sources do not support an answer, it should say so and offer human follow-up.
- A visitor can explicitly request a person at any time.

### Escalation and staff workflow

- Escalate when the visitor requests a human, the bot cannot find a reliable answer, the conversation repeatedly fails to resolve the question, or the topic is configured to require staff review.
- Create a tenant-scoped conversation/enquiry record containing the conversation transcript, timestamp, source site, relevant page/product context, and contact details only when supplied or needed for follow-up.
- Give the visitor a clear handoff confirmation and, where appropriate, a reference number and an expectation that the business team will respond.
- Put escalated conversations in an admin queue with status, assignment/ownership, internal notes, and a resolution outcome. Staff must be able to reply or mark a case resolved in the admin workspace.
- Keep internal staff notes separate from messages shown to the visitor. Preserve the transcript and handoff context so the buyer does not need to repeat the question.
- Provide basic abuse protection, input validation, rate limits, and controls for retaining or deleting conversation data.
- Do not let the bot take consequential actions such as promising a price, confirming stock, accepting an order, issuing a credit, or changing an invoice without an authorised workflow and confirmation.

### V1 implementation boundary

Start with an explicit chatbot capability backed by approved tenant content and a reliable escalation workflow. Keep the AI/model provider behind an integration boundary so the platform is not tied to one provider. If AI responses are unavailable or disabled, the site must still provide a contact/enquiry form and the human queue must continue to work. Usage limits and enablement must be configurable per tenant. Detailed analytics, multilingual conversations, omnichannel messaging, and complex agent automation can follow later.

## 7. Invoicing for trading businesses

Provide practical invoice creation and management directly in the admin workspace. The application should support staff-created invoices and preparing invoice drafts from supported commercial workflows, rather than requiring users to create every invoice in external software.

### Invoice creation and lifecycle

- Authorised staff can create an invoice manually or prepare a draft from an accepted quotation/RFQ or a supported order when that workflow is available.
- Reuse recipient and line-item details already captured in the relevant enquiry/quote/order to reduce double entry; allow authorised staff to review and correct the draft before issuing it.
- Capture a business-specific invoice number, issuer/business details, bill-to customer details, issue date, due date, currency, line descriptions/SKUs, quantities, unit prices, discounts where applicable, tax treatment/rates where configured, subtotal, tax total, and grand total.
- Allow additional notes, payment instructions, and payment terms from approved editable fields.
- Generate a professional PDF invoice that can be previewed and downloaded. Keep invoice layouts template-driven so businesses can customise supported branding and business details without editing code.
- Track a clear lifecycle such as `Draft → Issued → Partially Paid / Paid`, with `Overdue` derived from due date and outstanding balance. Permit void/cancellation according to explicit rules; do not silently delete issued invoices.
- Record payments against invoices manually in V1, including payment date, amount, method/reference, and notes. Do not represent this as automatic payment processing or bank reconciliation.
- Keep an issued invoice's key commercial details as a snapshot so later changes to a product, customer profile, or website do not silently alter an invoice already sent. Corrections should use a defined revision/void process.
- Keep invoice numbering and all invoice data strictly tenant-scoped. Invoice numbers must be unique within the intended business scope and allocated safely under concurrent use.
- Enforce role-based permissions for creating, editing drafts, issuing, recording payments, and voiding invoices. Log material status and amount changes.

### Tax, compliance, and sample templates

Tax labels, rates, currency, legal entity details, and payment terms should be configurable rather than hard-coded to one country. The first implementation should not claim to be a jurisdiction-complete accounting or tax-compliance product. Validate required invoice fields and legal formatting for the first target market before production use. The user can provide sample invoices later; use those samples to refine the invoice layout and fields, while avoiding unnecessary storage of sensitive real-customer information in test fixtures.

### V1 boundaries

Include manual invoice creation, draft creation from supported quote/order data, PDF preview/download, and manual payment-status recording. Automated tax filing, accounting ledgers, bank feeds/reconciliation, recurring invoices, credit-note workflows, e-invoicing network integrations, and payment-gateway collection are separate later capabilities unless a first customer requirement makes one essential.

## 8. Admin capabilities for the first slice

Required for an initial end-to-end demo:

- tenant-scoped business profile, contact details, and website settings;
- product category CRUD;
- product CRUD including images/metadata and configurable attributes;
- brand CRUD or an equivalent simple brand-management flow;
- configure catalogue visibility and selling mode;
- view and manage submitted enquiries/RFQs;
- optionally enable the website chatbot and manage escalated conversations in a human follow-up queue;
- create, preview, issue, download, and track invoices, including recording payments manually;
- set up theme and homepage sections;
- preview and publish the website;
- role-checked admin access and clear tenant switching.

Supplier management, purchase orders, multi-warehouse inventory, detailed stock movements, full sales-order fulfilment, accounting, CRM automation, and import/export logistics are important candidates for later modules. Their future needs should inform extension points, but V1 must not pretend these workflows exist before they are implemented.

## 9. Suggested module boundaries

The current repository already defines broad module concepts. The following is a target functional breakdown, not a claim that all modules are currently implemented:

- **Core identity and tenancy:** users, tenant memberships, roles/permissions, strict tenant isolation. Platform foundation, not a customer-toggleable module.
- **Website and content:** site settings, themes, pages, approved sections, draft/publish state, domain resolution.
- **Product catalogue:** products, categories, brands, attributes, images, public search.
- **Enquiries / RFQ:** public submission, request lifecycle, staff follow-up.
- **Website chatbot / human handoff:** optional bot experience, approved knowledge sources, conversation records, escalation queue, staff resolution. AI-provider integration is replaceable; the enquiry form and human queue do not depend on AI being available.
- **Invoicing:** tenant-scoped invoice drafts, issue lifecycle, PDF generation, manual payment records, invoice permissions and audit history.
- **Parties / contacts:** persistent customers, suppliers, employees and contact details, when needed by workflows.
- **Inventory:** later-stage module for locations, on-hand availability, stock movements and reservations; catalogue product records must not be treated as inventory accounting.
- **Purchasing / suppliers:** future module for supplier orders and receiving.
- **Sales orders / fulfilment:** later module after the RFQ flow has been validated; invoice generation may consume a supported quote/order contract without requiring the entire fulfilment module in the first slice.
- **Payments processing:** optional later integration for collecting payments online. Manual payment recording on invoices is not the same as payment gateway processing.

A module toggle must reflect actual backend and UI capability. If a module is disabled, the UI must not offer its workflow and backend endpoints must reject calls that require it. Shared identity, tenant security, audit controls and safety controls can never be disabled.

## 10. Non-functional requirements

- Every tenant-owned entity and request is isolated by tenant. Test attempts to read or change another tenant's data.
- Website rendering uses validated configuration and approved components; it never executes arbitrary user-supplied code.
- Public pages are responsive and usable on mobile, accessible by keyboard where appropriate, and include editable page titles/descriptions and alt text.
- Product images and uploads require file type/size validation and safe storage. Authorisation must be checked before serving private files.
- Public forms and chatbot inputs validate data, limit abuse, and do not expose stack traces or internal record IDs unnecessarily.
- Chatbot answers must be grounded in approved tenant information; unsupported answers should trigger a clear human-handoff option rather than fabricated commercial claims.
- Chat transcripts, escalations and invoice records must not cross tenant boundaries; sensitive internal notes must never appear in public responses or PDF invoices.
- Invoice totals must be calculated and validated on the server, not trusted from browser-submitted totals. Monetary values should use safe decimal arithmetic and explicit currency handling.
- Issued invoices preserve their commercial snapshot and an audit trail; product/customer edits do not rewrite historical invoices.
- Template and page-schema versions must be handled explicitly to avoid breaking sites when code evolves.
- Changes to a draft site should not unintentionally alter the published version until the owner publishes them.

## 11. Acceptance criteria for the first end-to-end milestone

A milestone is complete only when all of these can be demonstrated:

1. Two different tenants can be created from the same General Trading template without sharing data or settings.
2. Each tenant can configure different logo/theme settings and a different homepage section order.
3. Each tenant can create categories, brands, and products with category-specific attributes.
4. The public website for each tenant resolves to the correct published configuration using a tenant-specific development subdomain or another explicit local routing mechanism.
5. A visitor can find products and submit an enquiry/RFQ without creating a login.
6. An authorised staff member can view and manage only their tenant's enquiries.
7. Disabling a required capability blocks its UI and backend workflow consistently.
8. An owner can enable/disable the chatbot; a visitor can request a human or reach escalation after an unsupported answer; the staff queue retains the transcript and tenant/site/product context.
9. Staff can create an invoice manually and prepare a draft from supported quote/order data, preview/download a PDF, issue it, and record a manual payment; invoice numbering, totals, permissions, and tenant isolation are tested.
10. Issued invoice contents are not silently changed by later edits to product/customer records; authorised correction/void behaviour is explicit.
11. Automated tests cover configuration validation, product tenant isolation, public enquiry/chatbot validation, human escalation, invoice calculations and lifecycle, and cross-tenant access rejection.
12. Database changes are represented by Prisma migrations and the Jest suite passes.

## 12. Out of scope for the first slice

- a free-form code editor or execution of customer-written scripts;
- complete ERP/accounting software, statutory reporting, or jurisdiction-complete tax compliance;
- bank feeds/reconciliation, recurring invoicing, credit-note automation, e-invoicing networks, or automated debt collection;
- payment-gateway collection and full sales-order, warehouse, shipping, and fulfilment automation;
- advanced chatbot analytics, autonomous commercial actions, multilingual omnichannel support, or a guarantee that AI will always resolve an enquiry;
- mandatory customer accounts and public checkout for every business;
- full marketplace/multi-vendor features;
- every industry template;
- a promise of native mobile apps.

These may be considered after learning from the first General Trading customers.

## 13. Reference businesses reviewed

- [Advanced Prism General Trading](https://www.adprism.ae/) — product and brand presentation for industrial supplies, with company/contact information.
- [Trade Circle Enterprises](https://tce-group.ae/) — multiple product categories including hardware, electricals, safety and wood, product listings, brands, and catalogue navigation.
- [New Trend Building Materials Trading](https://ntbmtrading.com/) — product search, category pages, product listings, and bulk-purchase messaging.

The goal is to learn from these business patterns, not copy a site's exact branding, text, or assets.
