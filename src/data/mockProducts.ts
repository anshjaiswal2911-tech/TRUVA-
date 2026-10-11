import { Product, NotificationItem } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'fortune-refined-oil-1l',
    inspectionId: 'INS-2026-F0RT72',
    name: 'Avol Fortune Refined Oil',
    subtitle: 'Edible Oils & Fats • Pure Refined Cooking Oil',
    category: 'Edible Oil & Packaged Commodity',
    barcode: '8906007281092',
    mrp: '₹ 210.00 (incl. of all taxes)',
    volume: '1 L',
    quantity: '1 L (Net Quantity Verified)',
    mfgDate: '12/04/2024',
    expDate: '11/10/2025',
    countryOfOrigin: 'India',
    manufacturerName: 'Adani Wilmar Limited',
    inspectionDate: '11 Oct 2026',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Fortune Refined Oil Pouch Pack',
    overallVerdict: 'Compliant',
    overallSummary: {
      declarations: { status: 'Compliant', label: 'Mandatory Declarations', icon: 'gavel', type: 'success' },
      netQuantity: { status: 'Compliant', label: 'Net Quantity Verification', icon: 'scale', type: 'success' },
      mrpTax: { status: 'Compliant', label: 'MRP Tax Inclusion', icon: 'payments', type: 'success' },
      evidence: { status: 'Verified', label: 'Rule Compliance Evidence', icon: 'assignment', type: 'success' }
    },
    keyFindings: [
      { id: '1', text: 'All mandatory declarations under Legal Metrology Rule 6(1) verified.', type: 'compliant' },
      { id: '2', text: 'Net Quantity: 1 L declared in standard SI metric units (Schedule II compliant).', type: 'compliant' },
      { id: '3', text: 'MRP ₹ 210.00 declared inclusive of all taxes.', type: 'compliant' },
      { id: '4', text: 'Manufactured by Adani Wilmar Limited with complete packing address & consumer helpline.', type: 'compliant' },
    ],
    modules: {
      declarations: {
        title: 'Mandatory Declarations Check',
        icon: 'gavel',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1) Statutory Compliance',
        primaryFinding: 'Name, address of manufacturer, commodity name, and consumer care details present.',
        details: [
          { label: 'Commodity Name', value: 'Avol Fortune Refined Oil' },
          { label: 'Manufacturer / Packer', value: 'Adani Wilmar Limited' },
          { label: 'Manufacture Date', value: '12/04/2024' },
          { label: 'Expiry Date', value: '11/10/2025' },
          { label: 'Country of Origin', value: 'Made in India' },
        ]
      },
      netQuantity: {
        title: 'Net Quantity Verification',
        icon: 'scale',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 11 & Schedule II Metric Compliance',
        primaryFinding: 'Declared Net Quantity 1 L conforms to Schedule II font height and permissible limits.',
        details: [
          { label: 'Declared Net Quantity', value: '1 L' },
          { label: 'Metric Symbol', value: 'L (Compliant)' },
          { label: 'Font Height', value: '≥4.0 mm' },
        ]
      },
      mrpTax: {
        title: 'MRP & Tax Declaration Check',
        icon: 'payments',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1)(e) Compliance',
        primaryFinding: 'MRP stated as ₹ 210.00 inclusive of all taxes.',
        details: [
          { label: 'Maximum Retail Price', value: '₹ 210.00' },
          { label: 'Tax Statement', value: 'Inclusive of all taxes' },
        ]
      },
      evidence: {
        title: 'Statutory Evidence & Rule Audit',
        icon: 'assignment',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Legal Metrology Rules, 2011',
        primaryFinding: 'Passes 8/8 statutory metrology verification rules.',
        details: [
          { label: 'Statutory Act', value: 'Legal Metrology Act, 2009' },
          { label: 'Status', value: 'Likely Compliant' },
        ]
      }
    }
  },
  {
    id: 'fmcg-packaged-basket',
    inspectionId: 'INS-2026-8841',
    name: 'Indian FMCG & Packaged Groceries Assortment',
    subtitle: 'Kitchen Staples • Atta, Salt, Tea, Ghee, Noodles & Spices',
    category: 'Packaged Food Commodity',
    barcode: '8901491101853',
    mrp: '₹2,450.00 (Assorted Batch Total)',
    volume: 'Multi-SKU Basket',
    quantity: 'Multi-Pack (Net Weight Verified)',
    mfgDate: '12 Jan 2026',
    expDate: '11 Jan 2028',
    countryOfOrigin: 'India',
    manufacturerName: 'Tata Consumer, HUL, Nestlé, ITC, Britannia, Dabur, Adani Wilmar',
    inspectionDate: '26 Aug 2026',
    imageUrl: '/images/fmcg_packaged_goods.jpg',
    imageAlt: 'Indian FMCG Packaged Goods Assortment',
    overallVerdict: 'Compliant',
    overallSummary: {
      declarations: { status: 'Compliant', label: 'Mandatory Declarations', icon: 'gavel', type: 'success' },
      netQuantity: { status: 'Compliant', label: 'Net Quantity Verification', icon: 'scale', type: 'success' },
      mrpTax: { status: 'Compliant', label: 'MRP Tax Inclusion', icon: 'payments', type: 'success' },
      evidence: { status: 'Verified', label: 'Rule Compliance Evidence', icon: 'assignment', type: 'success' }
    },
    keyFindings: [
      { id: '1', text: 'All 8 mandatory declarations under Rule 6 of Legal Metrology (Packaged Commodities) Rules, 2011 verified across all SKUs.', type: 'compliant' },
      { id: '2', text: 'Net Quantity statements comply with Schedule II minimum numeral font height standards (>4.0mm for >500g categories).', type: 'compliant' },
      { id: '3', text: 'MRP is stated with statutory "(inclusive of all taxes)" and Unit Sale Price (USP) declarations.', type: 'compliant' }
    ],
    modules: {
      declarations: {
        title: 'Mandatory Declaration Check',
        icon: 'gavel',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1) Compliance',
        primaryFinding: 'All statutory declarations including packer addresses, country of origin (India), net weight, and customer care details fully verified.',
        details: [
          { label: 'Name & Address of Manufacturer/Packer', value: 'Present: Verified on all packages' },
          { label: 'Country of Origin Declaration', value: 'Present: Made in India' },
          { label: 'Common or Generic Name of Commodity', value: 'Present: Atta, Salt, Tea, Ghee, Noodles, Spices' },
          { label: 'Month & Year of Manufacture', value: 'Present: 01/2026' },
          { label: 'Consumer Care Cell Details', value: 'Present: Toll-free & Email verified' }
        ]
      },
      netQuantity: {
        title: 'Net Quantity Verification',
        icon: 'scale',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 11 & Schedule II Verification',
        primaryFinding: 'Declared Net Quantities (1kg, 5kg, 500g, 70g) prominently displayed with standard SI metric unit symbols.',
        details: [
          { label: 'Declared Net Quantities', value: 'Standard metric units (kg, g, L, ml)' },
          { label: 'Prescribed Font Height', value: '≥4.0 mm (Meets Schedule II standards)' },
          { label: 'Unit Symbol Compliance', value: 'Compliant ("g", "kg", "ml", "L" correctly formatted)' },
          { label: 'Maximum Permissible Error (MPE)', value: 'Within ±1.5% statutory allowance' }
        ]
      },
      mrpTax: {
        title: 'Retail Price & Tax Declaration Check',
        icon: 'payments',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1)(e) Compliance',
        primaryFinding: 'Retail prices declared with explicit "(inclusive of all taxes)" and mandatory Unit Sale Price (₹/g, ₹/kg).',
        details: [
          { label: 'Maximum Retail Price (MRP)', value: 'Explicitly declared on each SKU' },
          { label: 'Tax Inclusive Statement', value: 'Present: "(Incl. of all taxes)"' },
          { label: 'Unit Sale Price Declaration', value: 'Rule 6(1)(s) Unit Sale Price present' },
          { label: 'Smudged/Overprinted Price Check', value: 'No overprinting or smudging detected' }
        ]
      },
      evidence: {
        title: 'Applicable Statutory Rule & Evidence',
        icon: 'assignment',
        status: 'Verified',
        statusType: 'success',
        subtitle: 'Legal Metrology (Packaged Commodities) Rules, 2011',
        primaryFinding: 'Full alignment with Legal Metrology (Packaged Commodities) Rules 2011, Section 18 of Legal Metrology Act 2009.',
        details: [
          { label: 'Statutory Act', value: 'Legal Metrology Act, 2009 (Act 1 of 2010)' },
          { label: 'Applicable Rules', value: 'Legal Metrology (Packaged Commodities) Rules, 2011' },
          { label: 'Rule Section Citation', value: 'Rule 6(1)(a)-(g), Rule 11 & Schedule II' },
          { label: 'Enforcement Action Status', value: 'No action required — Fully Compliant' }
        ]
      }
    },
    nutritionFacts: {
      servingSize: 'Assorted Servings',
      calories: 250,
      totalSugars: '4g',
      sodium: '120mg',
      protein: '8.5g',
      totalFat: '3.5g'
    },
    primaryIngredients: ['Whole Wheat', 'Iodized Salt', 'Black Tea Leaf', 'Edible Vegetable Oil', 'Spices & Condiments'],
    fdaStatus: 'FSSAI Licences Verified',
    publicDataAvailability: 'High'
  },
  {
    id: 'cold-drinks-beverages',
    inspectionId: 'INS-2026-9120',
    name: 'Packaged Cold Drinks & Ready-to-Serve Beverages',
    subtitle: 'Beverages • Carbonated Soft Drinks, Fruit Juices & Energy Cans',
    category: 'Beverages & Soft Drinks',
    barcode: '8901262010041',
    mrp: '₹40.00 - ₹95.00 (Per Bottle / Can)',
    volume: '250ml - 2000ml Bottles',
    quantity: 'Assorted PET Bottles & Cans',
    mfgDate: '10 Feb 2026',
    expDate: '10 Aug 2026',
    countryOfOrigin: 'India',
    manufacturerName: 'Coca-Cola India, PepsiCo, Parle Agro, Dabur Real, Hector Beverages (Paper Boat)',
    inspectionDate: '25 Aug 2026',
    imageUrl: '/images/beverages_cold_drinks.jpg',
    imageAlt: 'Packaged Cold Drinks and Juices Assortment',
    overallVerdict: 'Compliant',
    overallSummary: {
      declarations: { status: 'Compliant', label: 'Mandatory Declarations', icon: 'gavel', type: 'success' },
      netQuantity: { status: 'Compliant', label: 'Net Quantity Verification', icon: 'scale', type: 'success' },
      mrpTax: { status: 'Compliant', label: 'MRP Tax Inclusion', icon: 'payments', type: 'success' },
      evidence: { status: 'Verified', label: 'Rule Compliance Evidence', icon: 'assignment', type: 'success' }
    },
    keyFindings: [
      { id: '1', text: 'Unit Sale Price (₹/ml) clearly declared on all bottle sizes as mandated under Rule 6(1)(s).', type: 'compliant' },
      { id: '2', text: 'Volume declarations in standard metric units (ml, L) with Schedule II minimum font height adherence.', type: 'compliant' },
      { id: '3', text: 'Caffeine warning, added sugar declarations, and best before dates prominently stated.', type: 'compliant' }
    ],
    modules: {
      declarations: {
        title: 'Mandatory Declaration Check',
        icon: 'gavel',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1) Compliance',
        primaryFinding: 'All 8 mandatory declarations present across carbonated soft drinks, juices, and energy drinks.',
        details: [
          { label: 'Name & Address of Bottler/Packer', value: 'Present: Authorized bottling plants across India' },
          { label: 'Date of Packing & Best Before', value: 'Present: Month & Year on crown/neck' },
          { label: 'Unit Sale Price', value: 'Present: e.g., ₹0.08 / ml (Compliant)' }
        ]
      },
      netQuantity: {
        title: 'Net Quantity Verification',
        icon: 'scale',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 11 & Schedule II Compliance',
        primaryFinding: 'Volume declarations (250 ml, 600 ml, 750 ml, 1.25 L, 2 L) meet minimum numeral height (3.0mm - 6.0mm).',
        details: [
          { label: 'Declared Volumes', value: '250 ml, 600 ml, 1 L, 2 L' },
          { label: 'Numeral Height', value: '4.5 mm (Meets Schedule II standard)' }
        ]
      },
      mrpTax: {
        title: 'Retail Price & Tax Declaration Check',
        icon: 'payments',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1)(e) Compliance',
        primaryFinding: 'MRP clearly marked inclusive of all taxes on bottle caps, neck labels, and carton panels.',
        details: [
          { label: 'Maximum Retail Price', value: '₹40.00 / ₹95.00 (Incl. of all taxes)' }
        ]
      },
      evidence: {
        title: 'Applicable Statutory Rule & Evidence',
        icon: 'assignment',
        status: 'Verified',
        statusType: 'success',
        subtitle: 'Legal Metrology Rules, 2011',
        primaryFinding: 'Full statutory compliance recorded across beverage lines.',
        details: [
          { label: 'Enforcement Status', value: 'Clear — Certified Batch' }
        ]
      }
    },
    nutritionFacts: {
      servingSize: '200 ml',
      calories: 88,
      totalSugars: '21g',
      sodium: '35mg',
      protein: '0g',
      totalFat: '0g'
    },
    primaryIngredients: ['Carbonated Water', 'Sugar', 'Acidity Regulator (338)', 'Caffeine', 'Natural Flavours'],
    fdaStatus: 'FSSAI Standard Certified',
    publicDataAvailability: 'High'
  },
  {
    id: 'packaged-snacks-biscuits',
    inspectionId: 'INS-2026-6410',
    name: 'Indian Packaged Snacks, Biscuits & Namkeen Lineup',
    subtitle: 'Snack Foods • Parle-G, Good Day, Kurkure, Lay\'s, Haldiram\'s, Bikaji & Bourbon',
    category: 'Packaged Snack Commodity',
    barcode: '8901491102998',
    mrp: '₹5.00 - ₹35.00 (Per Pack)',
    volume: '30g - 200g Packs',
    quantity: 'Multi-Pack Snack Assortment',
    mfgDate: '01 Feb 2026',
    expDate: '01 Aug 2026',
    countryOfOrigin: 'India',
    manufacturerName: 'Parle Products, Britannia Industries, PepsiCo India, Haldiram Foods, Bikaji Foods',
    inspectionDate: '27 Aug 2026',
    imageUrl: '/images/packaged_snacks_biscuits.jpg',
    imageAlt: 'Indian Packaged Snacks and Biscuits Lineup',
    overallVerdict: 'Compliant',
    overallSummary: {
      declarations: { status: 'Compliant', label: 'Mandatory Declarations', icon: 'gavel', type: 'success' },
      netQuantity: { status: 'Compliant', label: 'Net Quantity Verification', icon: 'scale', type: 'success' },
      mrpTax: { status: 'Compliant', label: 'MRP Tax Inclusion', icon: 'payments', type: 'success' },
      evidence: { status: 'Verified', label: 'Rule Compliance Evidence', icon: 'assignment', type: 'success' }
    },
    keyFindings: [
      { id: '1', text: 'Rule 6(1)(s): Unit Sale Price (USP) clearly declared per gram on small ₹5 & ₹10 value packs.', type: 'compliant' },
      { id: '2', text: 'Rule 6(1)(c): Net quantity font height complies with Schedule II requirements across all pillow pouches.', type: 'compliant' },
      { id: '3', text: 'Shrinkflation check passed: Weight conforms to standard declared metric grammage.', type: 'compliant' }
    ],
    modules: {
      declarations: {
        title: 'Mandatory Declaration Check',
        icon: 'gavel',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1) Compliance',
        primaryFinding: 'Manufacturer names, consumer care helpline numbers, veg green logo, and batch numbers verified.',
        details: [
          { label: 'Manufacturer Declarations', value: 'Present: Parle, Britannia, PepsiCo, Haldiram' },
          { label: 'Consumer Helpline Phone', value: '1800-22-7766 (Present)' },
          { label: 'Unit Sale Price', value: '₹0.20 - ₹0.45 per g' }
        ]
      },
      netQuantity: {
        title: 'Net Quantity Verification',
        icon: 'scale',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 11 Compliance',
        primaryFinding: 'Net weight declarations (38g, 50g, 70g, 150g) conform to Schedule II standards.',
        details: [
          { label: 'Declared Net Quantity', value: 'Multi-pack net weights' },
          { label: 'Prescribed Font Height', value: '≥3.0 mm (Meets standard)' }
        ]
      },
      mrpTax: {
        title: 'Retail Price & Tax Declaration Check',
        icon: 'payments',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1)(e) Compliance',
        primaryFinding: 'MRP declared with explicit "(inclusive of all taxes)".',
        details: [
          { label: 'Declared MRP', value: '₹5.00, ₹10.00, ₹20.00, ₹35.00' },
          { label: 'Unit Sale Price Declaration', value: 'Rule 6(1)(s) Verified' }
        ]
      },
      evidence: {
        title: 'Statutory Rule Evidence',
        icon: 'assignment',
        status: 'Verified',
        statusType: 'success',
        subtitle: 'Compliant Record',
        primaryFinding: 'Full statutory compliance verified under Legal Metrology Rules 2011.',
        details: [
          { label: 'Enforcement Status', value: 'Certified Batch — Fully Compliant' }
        ]
      }
    },
    nutritionFacts: {
      servingSize: '30g',
      calories: 145,
      totalSugars: '7.5g',
      sodium: '110mg',
      protein: '2.1g',
      totalFat: '6.5g'
    },
    primaryIngredients: ['Wheat Flour', 'Edible Vegetable Oil', 'Sugar', 'Gram Flour (Besan)', 'Spices & Condiments'],
    fdaStatus: 'FSSAI Certified',
    publicDataAvailability: 'High'
  },
  {
    id: 'personal-care-household',
    inspectionId: 'INS-2026-5380',
    name: 'Personal Care, Hygiene & Household Commodities',
    subtitle: 'Non-Food FMCG • Dettol, Lifebuoy, Surf Excel, Ariel, Colgate, Parachute & Lizol',
    category: 'Personal Care & Detergents',
    barcode: '8901030388219',
    mrp: '₹35.00 - ₹265.00 (Per Pack / Bottle)',
    volume: '75g - 1kg / 100ml - 500ml',
    quantity: 'Household & Hygiene Assortment',
    mfgDate: '05 Jan 2026',
    expDate: '04 Jan 2028',
    countryOfOrigin: 'India',
    manufacturerName: 'Reckitt Benckiser, HUL, Procter & Gamble, Colgate-Palmolive, Marico',
    inspectionDate: '28 Aug 2026',
    imageUrl: '/images/personal_care_household.jpg',
    imageAlt: 'Personal Care and Household Commodities Lineup',
    overallVerdict: 'Compliant',
    overallSummary: {
      declarations: { status: 'Compliant', label: 'Mandatory Declarations', icon: 'gavel', type: 'success' },
      netQuantity: { status: 'Compliant', label: 'Net Quantity Verification', icon: 'scale', type: 'success' },
      mrpTax: { status: 'Compliant', label: 'MRP Tax Inclusion', icon: 'payments', type: 'success' },
      evidence: { status: 'Verified', label: 'Rule Compliance Evidence', icon: 'assignment', type: 'success' }
    },
    keyFindings: [
      { id: '1', text: 'Rule 6(1)(a)-(g): Mandatory manufacturer addresses, batch code, expiry, and customer care toll-free numbers verified.', type: 'compliant' },
      { id: '2', text: 'Schedule II numeral height verified for detergent packs (1kg) and liquid bottles (500ml).', type: 'compliant' },
      { id: '3', text: 'Unit Sale Price (₹/g, ₹/ml) compliant on all soap bars, toothpastes, and hair oils.', type: 'compliant' }
    ],
    modules: {
      declarations: {
        title: 'Mandatory Declaration Check',
        icon: 'gavel',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1) Non-Food Standards',
        primaryFinding: 'All statutory non-food packaging declarations are compliant.',
        details: [
          { label: 'Manufacturer Name', value: 'Reckitt, HUL, P&G, Colgate, Marico' },
          { label: 'Customer Helpline Email', value: 'care@unilever.com / care@colgate.in' }
        ]
      },
      netQuantity: {
        title: 'Net Quantity Verification',
        icon: 'scale',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Schedule II Numeral Standard',
        primaryFinding: 'Net weight / volume (75g, 150g, 500ml, 1kg) complies with standard font sizes.',
        details: [
          { label: 'Net Volume / Weight', value: 'Standard metric SI units' },
          { label: 'Numeral Height', value: '≥4.0 mm for 1kg / 500ml packs' }
        ]
      },
      mrpTax: {
        title: 'Retail Price & Tax Declaration Check',
        icon: 'payments',
        status: 'Compliant',
        statusType: 'success',
        subtitle: 'Rule 6(1)(e) Compliance',
        primaryFinding: 'MRP explicitly inclusive of all statutory taxes.',
        details: [
          { label: 'MRP Statement', value: 'MRP (Incl. of all taxes) verified' },
          { label: 'Unit Sale Price', value: 'Present on all SKUs' }
        ]
      },
      evidence: {
        title: 'Statutory Rule Evidence',
        icon: 'assignment',
        status: 'Verified',
        statusType: 'success',
        subtitle: 'Legal Metrology Rules 2011',
        primaryFinding: 'Standard compliance achieved across hygiene and cleaning commodities.',
        details: [
          { label: 'Verdict', value: 'Fully Compliant — No Infractions' }
        ]
      }
    },
    nutritionFacts: {
      servingSize: 'External Use Only',
      calories: 0,
      totalSugars: '0g',
      sodium: '0mg',
      protein: '0g',
      totalFat: '0g'
    },
    primaryIngredients: ['Sodium Palmate', 'Surfactants', 'Pure Coconut Oil', 'Fluoride Formulation', 'Disinfectant Actives'],
    fdaStatus: 'Drugs & Cosmetics / BIS Standards Verified',
    publicDataAvailability: 'High'
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Statutory Notice Drafted: Form A',
    description: 'Automated compounding memo generated for Packaged Detergent under Section 36.',
    timeAgo: '10m ago',
    type: 'error',
    isUnread: true,
    actionRequired: true,
  },
  {
    id: 'n2',
    title: 'State Ledger Synchronized',
    description: 'Cryptographic SHA-256 seal verified for 14 batch inspections.',
    timeAgo: '1h ago',
    type: 'sync',
    isUnread: true,
  },
  {
    id: 'n3',
    title: 'Shrinkflation Advisory Active',
    description: '12% volume reduction detected on snack commodities in Zone 4.',
    timeAgo: '2h ago',
    type: 'analytics',
    isUnread: false,
  },
];

export const MOCK_INSPECTION_STATS = {
  totalScans: 142,
  totalInspections: 142,
  compliantCount: 118,
  violationCount: 19,
  flaggedCount: 5,
  complianceRate: 83.1,
  averageConfidence: 94.6,
  compoundingRevenue: '₹4,75,000',
  totalPenaltiesCompounded: '₹4,75,000',
  noticesIssued: 14,
  inspectionsToday: 18,
  activeOfficersOnline: 18,
  zone: 'Delhi NCR (Central)',
};
