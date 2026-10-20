# BusinessOS Architecture Principles and Decisions

**Status:** Proposed baseline for implementation  
**Version:** 0.2  
**Initial industry:** B2B general trading and distribution  
**Last updated:** 20 October 2026

This document records the product and architecture decisions that new BusinessOS work should follow. It describes the intended design; it does not claim that all listed capabilities are already implemented.

## 1. Product vision

BusinessOS is a multi-tenant platform that lets business owners create and operate independently configured businesses using a shared software foundation. Each business should be able to enable the capabilities it needs and customise its customer-facing website without hiring a developer for routine content and visual changes.

The first complete industry product will be **B2B general trading and distribution**, with a starting focus on wholesalers and distributors of building materials, hardware, safety equipment, electrical products, wood, and industrial consumables. This is a first vertical, not a permanent limitation on the shared platform.

The platform is not intended to make every business look or behave identically. It should share the underlying engine while allowing each business to have a distinct website, catalogue, workflow configuration, branding, records, and permissions.

## 2. Core product decisions

### 2.1 Build a reusable platform and launch with one vertical

- Shared foundations should be reusable across industries: identity, access control, tenant isolation, configuration resolution, module lifecycle, common party records, product/catalogue primitives, and website rendering.
- The first fully implemented template is General Trading. It must be coherent and useful end-to-end before we try to make every industry equally complete.
- Future templates (for example, restaurant, gym, school, or hospital) can reuse proven foundations and add industry-specific extensions.
- Do not generalise a capability beyond its real requirements merely to claim broad industry coverage.

### 2.2 Separate owner identity, business workspace, site, and party

These concepts have different responsibilities and must not be conflated.

- **User identity:** A person who signs in to BusinessOS.
- **Tenant / business workspace:** A customer's isolated business account and primary data/security boundary. A user may belong to multiple tenants, with different permissions in each.
- **Site / website:** A public-facing website owned by a tenant. It has a domain or subdomain, branding, navigation, pages, publication state, and presentation settings. A tenant may eventually have more than one site.
- **Party:** A real-world person or organisation involved in the tenant's workflows, such as a customer, supplier, contact, or employee. A `Party` whose type is `ORGANISATION` is not the same thing as a tenant.

The existing `Organisation` model currently plays the tenant-like role. Do not rename it in the same change as template-resolution improvements. First inventory every database, API, frontend, and test dependency, then handle a rename as a separate, reviewed migration if we decide it is worth doing.

### 2.3 A business must be customisable without code

Business-owner customisation is a first-class product requirement, especially for the public website.

Owners should be able to configure, within supported controls:

- logo, brand colours, typography, imagery, and other design tokens;
- navigation, page content, page order, and which approved sections appear on a page;
- supported layouts and section settings (for example, hero, category grid, featured products, brand strip, company profile, contact details, and enquiry call-to-action);
- catalogue categories, product visibility, product details, and how customers request pricing;
- enabled capabilities and supported workflow options.

Build the website as a **schema-driven renderer** using approved, versioned page templates, sections, and theme settings. Store configuration as validated data. Do not execute arbitrary tenant-supplied JavaScript, HTML, server code, or database queries. This reduces security risk and lets the renderer evolve while keeping customer configuration understandable.

The first version does not need a fully free-form drag-and-drop builder. It should use configurable page templates and reorderable approved sections, with a design that can support a richer visual editor later without rewriting the website rendering architecture.

### 2.4 Templates are versioned blueprints, not customer instances

- A template provides starting defaults: capabilities, settings, workflows, roles/policies, and (where relevant) website/page presets.
- A tenant is pinned to a specific template ID and version. Existing customers must not silently change when a newer template is released.
- Template versions should be immutable after release. A changed template is a new version.
- Template upgrades are explicit operations, with a preview/diff, compatibility validation, and a migration plan for data/configuration changes where necessary.
- Templates should be seeded or registered deterministically at application startup; importing a template file should not cause uncontrolled global registration side effects.

### 2.5 Configuration resolution follows one documented precedence

For tenant-level functional configuration, use:

1. platform safety constraints and schema defaults;
2. the immutable, pinned template version;
3. tenant-specific overrides.

For public website presentation, a site's validated presentation overrides may layer over tenant defaults, but they cannot bypass module availability, permissions, workflow validation, or platform safety rules.

An absent override means “inherit the applicable default”; it must not be confused with an explicit false/disabled value. Configuration responses should expose the effective value and, where useful to the admin UI, whether the value is inherited or overridden.

When validating a change, validate the tenant's **complete effective configuration**, including current overrides and dependencies. Do not validate only the template's original module list.

The merge policy for nested settings must be defined per schema. Do not assume arbitrary recursive JSON merging is safe; replacing a settings object should be explicit where that is the intended behaviour.

### 2.6 Modules are executable capabilities, not visibility toggles

A module is a cohesive capability with a clear contract. Depending on its purpose, that contract can include:

- a versioned configuration schema and validation;
- declared dependencies and compatibility rules;
- backend services, API routes, data model, and business invariants;
- permissions and tenant-scoped access checks;
- admin UI and/or public website components;
- lifecycle rules for enabling, disabling, migration, and data retention;
- automated tests.

A module registry entry or UI toggle alone is not a complete module. Disabling a module should prevent its workflows from being used and hide its UI, while handling existing data safely. Modules must not be allowed to violate core tenant isolation or security controls.

### 2.7 Use extensions for genuinely industry-specific behaviour

The shared core should expose stable contracts. A trusted, versioned extension can add specialized backend logic, UI blocks, integrations, or workflow steps for an industry. Do not put every future industry condition into one generic service, and do not permit customers to upload arbitrary executable code as a shortcut to customisation.

### 2.8 General Trading is the first complete product

The initial product model is B2B trading/distribution rather than a retail-only ecommerce store. It should support:

- a searchable, category-based product catalogue with brands and product specifications;
- pricing policies that can support quote-only, visible prices, and bulk/quantity-based requests;
- product or basket enquiries / requests for quotation (RFQs);
- a workflow for staff to review enquiries and prepare a quote;
- customer and supplier records when needed for business operations;
- a foundation for purchase orders, stock locations/inventory, sales orders, fulfilment, and invoices as these workflows are implemented;
- a professional company website that can be visually customised by its owner.

Do not force payment processing, publicly visible prices, or checkout on every general-trading business. Those are configurable capabilities for a later phase when an initial customer segment requires them.

## 3. Security and tenancy decisions

- Authentication establishes who the caller is; authorisation establishes what they can do. Both are required.
- Every authenticated tenant-scoped request must resolve a verified user-to-tenant membership and permissions. An organisation/tenant ID in a URL is a selector, not proof of access.
- Tenant-scoped queries, database relationships, background jobs, files, caches, and event handlers must preserve tenant context. Tenant isolation cannot rely only on developers remembering to filter queries.
- Public website requests resolve from a verified host/domain mapping to an active site and tenant configuration. The browser must not be able to choose an arbitrary tenant by manipulating an ID.
- Cross-tenant access tests are required before public deployment, including tests for list, read, create, update, and delete operations.
- Tenant isolation, access control, and platform safety rules cannot be disabled by template or site configuration.
- Public unauthenticated workflows (for example, product enquiries) must expose only the intended fields and actions, apply abuse controls, and avoid leaking internal tenant data.

## 4. General Trading website experience

The initial website engine should support a page structure assembled from approved sections. The default General Trading preset should offer sections such as:

- hero / value proposition with catalogue and quote actions;
- category tiles;
- featured products or product groups;
- brands represented/distributed;
- service strengths, sourcing capability, and industries served;
- company/about section;
- contact details, enquiry form, and location;
- optional catalogue search and RFQ basket.

The owner should be able to change the order, visibility, imagery, text, and supported settings for those sections. Different businesses should be able to select different approved themes and layouts. Site presentation is data and configuration; it must not require a separate frontend codebase for each customer.

The admin application and the customer-facing website are distinct experiences, but they use the same tenant configuration and module availability rules. Public presentation and business-processing APIs must still enforce the same data and permission boundaries.

## 5. Current data and migration principles

- Preserve existing tenant and party data when introducing template versions or new configuration rules.
- Database schema changes must use reviewed Prisma migrations; never treat a schema edit as a substitute for a migration.
- Prefer safe, additive migrations where possible. For a backfill, define deterministic values for existing rows and verify the backfill before relying on new non-null constraints.
- Use database constraints for invariants that the database can reliably enforce; validate other invariants in services and tests.
- Tenant-scoped records must carry an explicit tenant relation or be reachable only through a validated tenant-owned parent relationship.
- Use transactions for multi-record changes that must be atomic.

## 6. Quality and delivery decisions

- The API uses NestJS, TypeScript, Prisma, and PostgreSQL; the web application uses Next.js and TypeScript.
- Use **Jest**, not Vitest, for API tests. Remove the leftover Vitest dependency only after checking the repository for remaining imports/configuration.
- Changes must include unit tests for logic and integration/e2e tests for important database, API, and tenant-boundary behaviour.
- CI should eventually run linting, type checking, unit tests, e2e tests, and migration validation before merge.
- Keep commits small and reviewable. Architecture changes, schema migrations, behaviour changes, and UI features should be separated when doing so reduces risk.
- Do not claim the project is production-ready until authentication, authorisation, tenant isolation, error handling, backups/recovery, and operational checks are implemented and tested.

## 7. Implementation order

1. **Agree and preserve this product/architecture baseline.** Confirm General Trading as the first vertical and business-owner website customisation as a core requirement.
2. **Stabilise template versions and configuration resolution.** Pin tenants to a template version, define effective configuration, and validate complete module dependencies.
3. **Make registries deterministic.** Separate definitions from initialization and remove avoidable import-time side effects.
4. **Repair baseline test failures and add quality checks.** Fix the stale API end-to-end test and audit test scripts/dependencies before expanding features.
5. **Implement identity, tenant memberships, permissions, and enforced tenant isolation.** These are required before production/public access.
6. **Define the Site and website configuration model.** Theme tokens, pages, approved sections, preview/publish state, and domain-to-site resolution.
7. **Complete the General Trading vertical end-to-end.** Product catalogue, quote/enquiry workflow, supplier/customer operations, and the matching public website/admin UI.
8. **Expand only after validating the first vertical.** Add inventory/purchasing/fulfilment integrations and other business templates based on real requirements.

## 8. Reference websites and product observations

These examples inform the first vertical's product and website requirements; they are not templates to copy verbatim:

- [Advanced Prism General Trading](https://www.adprism.ae/) — industrial products, brands, company information, and contact/enquiry-led selling.
- [Trade Circle Enterprises](https://tce-group.ae/) — broad categories across hardware, electrical, safety, and wood, with product listings, brand information, and catalogue navigation.
- [New Trend Building Materials Trading](https://ntbmtrading.com/) — product search, category pages, a product catalogue, and bulk-purchase messaging.

These indicate that B2B general traders vary in catalogue complexity and sales model. BusinessOS should make the website presentation and pricing/enquiry workflow configurable rather than hardcoding one storefront style.

## 9. Decision review rule

When considering a new schema, service, API, or UI design, ask:

1. Can multiple independent businesses use this without sharing data or settings?
2. Can owners safely customise the intended parts without code?
3. Does the feature remain useful to the General Trading first vertical?
4. Are tenant permissions and data boundaries enforced by the backend?
5. Can the feature be configured, tested, upgraded, and eventually extended without tenant-specific forks?

If an approach fails one of these tests, record the trade-off and revisit the design before expanding the implementation.
