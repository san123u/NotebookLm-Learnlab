# Company & EPM Code Separation - Architecture Plan

## Problem Statement

Currently, company data and EPM codes are mixed together in a single collection (`ref_company`). This creates issues:

1. **Name Matching Complexity**: Script tries to match company names to EPM aliases using fuzzy matching, which fails for:
   - Renamed companies: "Bay Engineering Group Ltd (Formerly 'Bayanat Engineering Group Ltd')"
   - Slight variations in names
   - Parent labels using old names

2. **Single Script Dependency**: One script (`create_company_seed.py`) handles:
   - Master Template parsing
   - EPM Entity List parsing
   - Name matching
   - Hierarchy building
   - This is fragile and hard to maintain

3. **No Clear Source of Truth**:
   - Company identity mixed with EPM codes
   - Hard to know which is authoritative

---

## Proposed Architecture

### Two Separate Collections with Clear Ownership

```
┌─────────────────────────────────────┐     ┌─────────────────────────────────────┐
│          ref_company                │     │          ref_epm_codes              │
│    (Source: Master Template)        │     │    (Source: EPM Entity List)        │
├─────────────────────────────────────┤     ├─────────────────────────────────────┤
│ • Company identity                  │     │ • EPM code identity                 │
│ • Hierarchy (from label rows)       │     │ • EPM hierarchy                     │
│ • Business attributes               │     │ • Active/inactive status            │
│ • Group, segment, ownership         │     │ • Full alias, derived name          │
│                                     │     │ • Entity type (C/S/ICRP)            │
└─────────────────────────────────────┘     └─────────────────────────────────────┘
              │                                           │
              │         ┌─────────────────────┐          │
              └────────►│  company_epm_links  │◄─────────┘
                        │   (Mapping Table)   │
                        ├─────────────────────┤
                        │ • company_uuid      │
                        │ • epm_base_code     │
                        │ • is_primary        │
                        │ • match_method      │
                        │ • manual_override   │
                        └─────────────────────┘
```

---

## Data Models

### 1. ref_company (Companies from Master Template)

**Source**: `/Users/darkmirror/Downloads/Copy of Copy of Templates v2.xlsx`

```javascript
{
  // Identity
  uuid: string,              // Generated UUID (stable across re-seeds)
  name: string,              // From Name column
  short_name: string | null,

  // Hierarchy (derived from label rows)
  parent_uuid: string | null,
  hierarchy_path: string[],   // Array of ancestor UUIDs
  hierarchy_level: number,

  // Business Classification
  group_code: string,         // "IHC", "ADH", "ESG", etc.
  group_name: string,
  segment: string | null,
  place_of_incorporation: string | null,
  principal_activities: string | null,

  // Ownership
  ownership_percentages: {
    "2025": number,
    "2024": number,
    // ...
  },

  // Flags
  can_extract_from_epm: boolean,  // "Yes" in EPM Extract column
  is_active: boolean,
  is_root: boolean,

  // Source tracking
  master_template_row: number,

  // Timestamps
  created_at: datetime,
  updated_at: datetime
}
```

**Total Records**: ~1,250 companies
**Indexes**: uuid (unique), name (text), parent_uuid, group_code, hierarchy_level

---

### 2. ref_epm_codes (EPM Codes from Entity List)

**Source**: `/Users/darkmirror/Downloads/IHC Entity List-111225 (1).xlsx`

```javascript
{
  // Identity
  code: string,              // Full code: "1511_C", "1511", "1802_ICRP"
  base_code: string,         // Numeric base: "1511", "1802"

  // Classification
  entity_type: "CONSOLIDATED" | "STANDALONE" | "ICRP",

  // Names
  full_alias: string,        // Full alias from Excel: "ESG_Companies Management SP LLC (Consolidated)_"
  derived_name: string,      // Cleaned name without suffix/type markers

  // EPM Hierarchy
  parent_code: string | null,  // Parent EPM code

  // Status
  is_active: boolean,        // false if "inactive" in alias

  // Timestamps
  created_at: datetime,
  updated_at: datetime
}
```

**Total Records**: ~1,510 EPM codes
- CONSOLIDATED (_C): 236
- STANDALONE: 1,267
- ICRP (_ICRP): 7

**Indexes**: code (unique), base_code, entity_type, is_active

---

### 3. company_epm_links (Mapping Table)

**Purpose**: Links companies to EPM codes. Can be auto-generated or manually set.

```javascript
{
  _id: ObjectId,

  // Link
  company_uuid: string,       // Reference to ref_company.uuid
  epm_base_code: string,      // Reference to ref_epm_codes.base_code

  // Flags
  is_primary: boolean,        // true = current/default EPM code for this company

  // Audit
  match_method: "auto" | "manual",
  match_score: number | null,  // Similarity score if auto-matched
  manual_override: boolean,    // true = admin explicitly set this link

  // Timestamps
  created_at: datetime,
  updated_at: datetime,
  created_by: ObjectId | null
}
```

**Total Records**: Variable (one per company-EPM pair)
**Indexes**: company_uuid, epm_base_code, (company_uuid + is_primary)

---

## Seed Scripts

### Script 1: seed_companies.py

**Input**: Master Template Excel
**Output**: ref_company collection

```python
def seed_companies(excel_path: str):
    """
    Parse Master Template and create ref_company documents.

    Steps:
    1. Read Excel, parse label rows for hierarchy
    2. Generate stable UUIDs (hash of name + row number)
    3. Build parent-child relationships from labels
    4. Insert into ref_company collection
    """
    pass
```

**Key Features**:
- Parses "Below are the subsidiaries of X:" labels
- Builds hierarchy using label context
- Handles "(Formerly ...)" name patterns
- Generates deterministic UUIDs for stability

---

### Script 2: seed_epm_codes.py

**Input**: EPM Entity List Excel
**Output**: ref_epm_codes collection

```python
def seed_epm_codes(excel_path: str):
    """
    Parse EPM Entity List and create ref_epm_codes documents.

    Steps:
    1. Read Excel (Entity Code, Parent Member, Alias columns)
    2. Derive entity_type from code suffix
    3. Extract derived_name from alias (remove type suffixes)
    4. Detect inactive status from alias
    5. Insert into ref_epm_codes collection
    """
    pass
```

**Key Features**:
- Simple 1:1 mapping from Excel rows
- Derives entity_type from code suffix (_C, _ICRP, or standalone)
- Cleans alias to get derived_name
- Detects inactive from alias text

---

### Script 3: link_companies_to_epm.py

**Input**: ref_company + ref_epm_codes collections
**Output**: company_epm_links collection

```python
def link_companies_to_epm(auto_match: bool = True):
    """
    Create links between companies and EPM codes.

    Steps:
    1. For each company with can_extract_from_epm=true
    2. Find matching EPM codes by name similarity
    3. Create link records
    4. Mark best match as is_primary
    """
    pass
```

**Key Features**:
- Uses fuzzy matching (rapidfuzz) for auto-linking
- Respects existing manual overrides
- Logs unmatched companies for review
- Can be run incrementally

---

## API Changes

### Updated CompanyV2Service

```python
class CompanyV2Service:
    async def get_company(self, uuid: str) -> CompanyDetail:
        """Get company with linked EPM codes."""
        company = await self.db.ref_company.find_one({"uuid": uuid})

        # Get linked EPM codes from mapping table
        links = await self.db.company_epm_links.find(
            {"company_uuid": uuid}
        ).to_list(None)

        epm_codes = []
        for link in links:
            epm = await self.db.ref_epm_codes.find_one(
                {"base_code": link["epm_base_code"]}
            )
            if epm:
                epm_codes.append({
                    **epm,
                    "is_primary": link["is_primary"]
                })

        return CompanyDetail(
            **company,
            epm_codes=epm_codes,
            current_epm_base=next((l["epm_base_code"] for l in links if l["is_primary"]), None)
        )

    async def get_financials(self, uuid: str, epm_base: str = None):
        """Get financials using linked EPM codes."""
        # Get primary EPM link if not specified
        if not epm_base:
            link = await self.db.company_epm_links.find_one({
                "company_uuid": uuid,
                "is_primary": True
            })
            epm_base = link["epm_base_code"] if link else None

        # Query financial data by EPM code
        # ... existing logic ...
```

---

## Admin UI for Manual Linking

### New Admin Page: Company-EPM Links

**Features**:
1. List companies without EPM links (unmatched)
2. Search EPM codes by alias
3. Manually create/update links
4. Override auto-matched links
5. Set primary EPM code for company

**Wireframe**:
```
┌─────────────────────────────────────────────────────────────┐
│ Company-EPM Links Management                                │
├─────────────────────────────────────────────────────────────┤
│ Company: [Bay Engineering Group Ltd ▼]                      │
│                                                             │
│ Current Links:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ★ 3456 (Primary) - Bay Engineering Group Ltd (C)       │ │
│ │   3456 (Standalone) - Bay Engineering Group Ltd (S)    │ │
│ │   [Remove] [Set Primary]                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Add Link:                                                   │
│ Search EPM: [bayanat_________] [Search]                     │
│ Results: 1031 - Bayanat Engineering... [Add Link]           │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Plan

### Phase 1: Create New Collections (Non-Breaking)

1. Create `ref_epm_codes` collection from Entity List
2. Create `company_epm_links` collection (empty initially)
3. Keep existing `ref_company` with embedded EPM codes
4. Run both systems in parallel

### Phase 2: Migrate Data

1. Run auto-linking script to populate `company_epm_links`
2. Verify links match existing embedded codes
3. Fix any mismatches manually

### Phase 3: Switch API

1. Update CompanyV2Service to use `company_epm_links`
2. Update frontend to handle new response format
3. Deploy and test

### Phase 4: Cleanup

1. Remove `epm_codes` field from `ref_company`
2. Remove old seed script
3. Update documentation

---

## Files to Create/Modify

### New Files

```
scripts/
├── seed_companies.py       # Master Template → ref_company
├── seed_epm_codes.py       # EPM Entity List → ref_epm_codes
└── link_companies_to_epm.py # Create company_epm_links

backend/app/
├── odm/
│   └── epm_code.py         # EPMCodeDocument model
├── modules/
│   └── epm_codes/          # New module for EPM code management
│       ├── router.py
│       ├── service.py
│       └── schemas.py
└── db/
    ├── seed_epm_codes.py   # Seed loader
    └── seed_company_links.py

frontend/src/
├── pages/admin/
│   └── CompanyEPMLinks.tsx # Admin UI for manual linking
└── types/
    └── epm.ts              # EPM code types
```

### Modified Files

```
backend/app/
├── modules/companies_v2/
│   ├── service.py          # Use company_epm_links
│   └── schemas.py          # Update response models
├── odm/
│   └── company.py          # Remove epm_codes field (Phase 4)
└── db/
    └── seed_company.py     # Simplify (no EPM matching)

frontend/src/
├── pages/
│   └── CompanyDetail.tsx   # Handle separated EPM codes
└── lib/
    └── api.ts              # Add EPM link API functions
```

---

## Benefits

1. **Clear Source of Truth**:
   - Master Template = Companies & Hierarchy
   - EPM Entity List = EPM Codes
   - Links = Explicit mapping

2. **Easier Maintenance**:
   - Reseed companies without touching EPM codes
   - Reseed EPM codes without touching companies
   - Manual link corrections persist

3. **Better Matching**:
   - Auto-match as starting point
   - Manual override for edge cases
   - Admin UI for corrections

4. **Simpler Scripts**:
   - Each script does one thing
   - No complex fuzzy matching in critical path
   - Easier to debug and maintain

---

## Open Questions

1. **UUID Stability**: Should company UUIDs be deterministic (hash-based) or random?
   - Deterministic = same UUID on reseed
   - Random = need to preserve UUIDs across reseeds

2. **Historical EPM Codes**: How to handle when company had different EPM code before?
   - Add `is_historical` flag to links?
   - Store valid_from/valid_to dates?

3. **Hierarchy Authority**: What if EPM hierarchy differs from Master Template hierarchy?
   - Master Template hierarchy takes precedence for display
   - EPM hierarchy only used for financial data navigation

4. **Inactive Companies vs Inactive EPM Codes**:
   - Company can be active with inactive EPM code

---

## Implementation Status

### Completed ✅

1. **scripts/seed_epm_codes.py** - Generates ref_epm_codes.json from EPM Entity List
   - Extracts 1510 EPM codes (236 consolidated, 1267 standalone, 7 ICRP)
   - Detects inactive codes from alias
   - Outputs JSON seed file

2. **scripts/seed_companies.py** - Generates ref_company.json from Master Template ONLY
   - No EPM code matching/embedding
   - Parses hierarchy from "Below are subsidiaries of..." labels
   - Handles "(Formerly ...)" name patterns

3. **scripts/link_companies_to_epm.py** - Creates company_epm_links.json
   - Fuzzy matching with rapidfuzz (80% threshold)
   - 687/702 companies matched (97.8%)
   - Handles multiple base codes per company

4. **backend/app/odm/epm_code.py** - ODM models
   - EPMCodeDocument
   - CompanyEPMLinkDocument

5. **backend/app/modules/companies_v2/service.py** - Updated to use link table
   - _get_company_epm_codes() helper
   - _get_company_epm_types() helper
   - _get_primary_epm_base() helper
   - All methods updated to use link table

6. **backend/app/db/seed_epm_codes.py** - Seed loaders
   - seed_epm_codes()
   - seed_company_epm_links()

### Pending 🔲

1. **Admin UI for manual linking** - CompanyEPMLinks.tsx
2. **Frontend updates** - Handle new response format
3. **Remove old embedded epm_codes from ref_company documents**
