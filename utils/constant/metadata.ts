/**
 * ============================================================================
 * METADATA.TS - SINGLE SOURCE OF TRUTH FOR FORM/DROPDOWN CONSTANTS
 * ============================================================================
 */
export const metaData = {
  version: '1.4.1',
  data: {
    // =========================
    // Common
    // =========================
    gender: [
      { id: 1, label: 'Male', value: 'male' },
      { id: 2, label: 'Female', value: 'female' },
      { id: 3, label: 'Other', value: 'other' },
    ],

    job_types: [
      { id: 1, label: 'Full Time', value: 'full_time' },
      { id: 2, label: 'Part Time', value: 'part_time' },
      { id: 3, label: 'Casual', value: 'casual' },
    ],

    /** Work experience employment types (same shape as job_types; includes internship) */
    work_experience_employment_types: [
      { id: 1, label: 'Full Time', value: 'full_time' },
      { id: 2, label: 'Part Time', value: 'part_time' },
      { id: 3, label: 'Casual', value: 'casual' },
      { id: 4, label: 'Internship', value: 'internship' },
    ],

    countryList: [
      {
        id: 1,
        label: 'Canada',
        value: 'CA',
        dial_code: '+1',
        flag: '🇨🇦',
      },
      {
        id: 2,
        label: 'India',
        value: 'IN',
        dial_code: '+91',
        flag: '🇮🇳',
      },
    ],

    social_media_platforms: [
      { id: 1, label: 'LinkedIn', value: 'linkedin' },
      { id: 2, label: 'Portfolio Website', value: 'portfolio' },
      { id: 3, label: 'Other', value: 'other' },
    ],

    organisation_type: [
      { id: 1, label: 'Hospital', value: 'hospital' },
      {
        id: 2,
        label: 'Continuing Care Facility',
        value: 'continuing_care_facility',
      },
      {
        id: 3,
        label: 'Medical Clinic',
        value: 'medical_clinic',
      },
      {
        id: 4,
        label: 'Community Health Care Center',
        value: 'community_health_care_center',
      },
      {
        id: 5,
        label: 'Home Care Agency',
        value: 'home_care_agency',
      },
      {
        id: 6,
        label: 'Staffing Agency',
        value: 'staffing_agency',
      },
    ],

    canadian_provinces: [
      {
        id: 1,
        label: 'Alberta',
        value: 'alberta',
        abvName: 'AB',
        cities: [
          { id: 1, label: 'Calgary', value: 'calgary' },
          { id: 2, label: 'Edmonton', value: 'edmonton' },
          { id: 3, label: 'Red Deer', value: 'red_deer' },
          { id: 4, label: 'Lethbridge', value: 'lethbridge' },
          { id: 5, label: 'Medicine Hat', value: 'medicine_hat' },
          { id: 6, label: 'Grande Prairie', value: 'grande_prairie' },
          { id: 7, label: 'Fort McMurray', value: 'fort_mcmurray' },
          { id: 8, label: 'Airdrie', value: 'airdrie' },
          { id: 9, label: 'St. Albert', value: 'st_albert' },
          { id: 10, label: 'Sherwood Park', value: 'sherwood_park' },
          { id: 11, label: 'Banff', value: 'banff' },
          { id: 12, label: 'Brooks', value: 'brooks' },
          { id: 13, label: 'Jasper', value: 'jasper' },
        ],
      },
      {
        id: 2,
        label: 'British Columbia',
        value: 'british_columbia',
        abvName: 'BC',
        cities: [
          { id: 1, label: 'Vancouver', value: 'vancouver' },
          { id: 2, label: 'Surrey', value: 'surrey' },
          { id: 3, label: 'Burnaby', value: 'burnaby' },
          { id: 4, label: 'Richmond', value: 'richmond' },
          { id: 5, label: 'Victoria', value: 'victoria' },
          { id: 6, label: 'Kelowna', value: 'kelowna' },
          { id: 7, label: 'Kamloops', value: 'kamloops' },
          { id: 8, label: 'Nanaimo', value: 'nanaimo' },
          { id: 9, label: 'Prince George', value: 'prince_george' },
          { id: 10, label: 'Coquitlam', value: 'coquitlam' },
          { id: 11, label: 'Delta', value: 'delta' },
          { id: 12, label: 'New Westminster', value: 'new_westminster' },
          { id: 13, label: 'Prince Rupert', value: 'prince_rupert' },
          { id: 14, label: 'Vernon', value: 'vernon' },
          { id: 15, label: 'Chilliwack', value: 'chilliwack' },
          { id: 16, label: 'Cranbrook', value: 'cranbrook' },
        ],
      },
      {
        id: 3,
        label: 'Manitoba',
        value: 'manitoba',
        abvName: 'MB',
        cities: [
          { id: 1, label: 'Winnipeg', value: 'winnipeg' },
          { id: 2, label: 'Brandon', value: 'brandon' },
          { id: 3, label: 'Portage la Prairie', value: 'portage_la_prairie' },
          { id: 4, label: 'Dauphin', value: 'dauphin' },
          { id: 5, label: 'Selkirk', value: 'selkirk' },
          { id: 6, label: 'Steinbach', value: 'steinbach' },
          { id: 7, label: 'Thompson', value: 'thompson' },
          { id: 8, label: 'Flin Flon', value: 'flin_flon' },
          { id: 9, label: 'Winkler', value: 'winkler' },
          { id: 10, label: 'Churchill', value: 'churchill' },
          { id: 11, label: 'Swan River', value: 'swan_river' },
          { id: 12, label: 'The Pas', value: 'the_pas' },
        ],
      },
      {
        id: 4,
        label: 'New Brunswick',
        value: 'new_brunswick',
        abvName: 'NB',
        cities: [
          { id: 1, label: 'Moncton', value: 'moncton' },
          { id: 2, label: 'Saint John', value: 'saint_john' },
          { id: 3, label: 'Fredericton', value: 'fredericton' },
          { id: 4, label: 'Miramichi', value: 'miramichi' },
          { id: 5, label: 'Bathurst', value: 'bathurst' },
          { id: 6, label: 'Riverview', value: 'riverview' },
          { id: 7, label: 'Dieppe', value: 'dieppe' },
          { id: 8, label: 'Edmundston', value: 'edmundston' },
          { id: 9, label: 'Quispamsis', value: 'quispamsis' },
          { id: 10, label: 'Rothesay', value: 'rothesay' },
          { id: 11, label: 'Caraquet', value: 'caraquet' },
          { id: 12, label: 'Dalhousie', value: 'dalhousie' },
        ],
      },
      {
        id: 5,
        label: 'Newfoundland and Labrador',
        value: 'newfoundland_and_labrador',
        abvName: 'NL',
        cities: [
          { id: 1, label: "St. John's", value: 'st_johns' },
          { id: 2, label: 'Corner Brook', value: 'corner_brook' },
          { id: 3, label: 'Mount Pearl', value: 'mount_pearl' },
          { id: 4, label: 'Conception Bay South', value: 'conception_bay_south' },
          { id: 5, label: 'Paradise', value: 'paradise' },
          { id: 6, label: 'Grand Falls-Windsor', value: 'grand_falls_windsor' },
          { id: 7, label: 'Gander', value: 'gander' },
          { id: 8, label: 'Labrador City', value: 'labrador_city' },
          { id: 9, label: 'Happy Valley-Goose Bay', value: 'happy_valley_goose_bay' },
          { id: 10, label: 'Placentia', value: 'placentia' },
          { id: 11, label: 'Saint Anthony', value: 'saint_anthony' },
        ],
      },
      {
        id: 6,
        label: 'Nova Scotia',
        value: 'nova_scotia',
        abvName: 'NS',
        cities: [
          { id: 1, label: 'Halifax', value: 'halifax' },
          { id: 2, label: 'Dartmouth', value: 'dartmouth' },
          { id: 3, label: 'Sydney', value: 'sydney' },
          { id: 4, label: 'Glace Bay', value: 'glace_bay' },
          { id: 5, label: 'Truro', value: 'truro' },
          { id: 6, label: 'New Glasgow', value: 'new_glasgow' },
          { id: 7, label: 'Amherst', value: 'amherst' },
          { id: 8, label: 'Yarmouth', value: 'yarmouth' },
          { id: 9, label: 'Bedford', value: 'bedford' },
          { id: 10, label: 'Lunenburg', value: 'lunenburg' },
          { id: 11, label: 'Pictou', value: 'pictou' },
          { id: 12, label: 'Port Hawkesbury', value: 'port_hawkesbury' },
        ],
      },
      {
        id: 7,
        label: 'Ontario',
        value: 'ontario',
        abvName: 'ON',
        cities: [
          { id: 1, label: 'Toronto', value: 'toronto' },
          { id: 2, label: 'Ottawa', value: 'ottawa' },
          { id: 3, label: 'Mississauga', value: 'mississauga' },
          { id: 4, label: 'Brampton', value: 'brampton' },
          { id: 5, label: 'Hamilton', value: 'hamilton' },
          { id: 6, label: 'London', value: 'london' },
          { id: 7, label: 'Kitchener', value: 'kitchener' },
          { id: 8, label: 'Windsor', value: 'windsor' },
          { id: 9, label: 'Markham', value: 'markham' },
          { id: 10, label: 'Vaughan', value: 'vaughan' },
          { id: 11, label: 'Burlington', value: 'burlington' },
          { id: 12, label: 'Sudbury', value: 'sudbury' },
          { id: 13, label: 'Thunder Bay', value: 'thunder_bay' },
          { id: 14, label: 'Kingston', value: 'kingston' },
          { id: 15, label: 'Guelph', value: 'guelph' },
          { id: 16, label: 'Oshawa', value: 'oshawa' },
          { id: 17, label: 'Barrie', value: 'barrie' },
          { id: 18, label: 'Niagara Falls', value: 'niagara_falls' },
          { id: 19, label: 'St. Catharines', value: 'st_catharines' },
          { id: 20, label: 'Waterloo', value: 'waterloo' },
          { id: 21, label: 'Peterborough', value: 'peterborough' },
          { id: 22, label: 'Sault Ste. Marie', value: 'sault_ste_marie' },
          { id: 23, label: 'North Bay', value: 'north_bay' },
          { id: 24, label: 'Timmins', value: 'timmins' },
        ],
      },
      {
        id: 8,
        label: 'Prince Edward Island',
        value: 'prince_edward_island',
        abvName: 'PEI',
        cities: [
          { id: 1, label: 'Charlottetown', value: 'charlottetown' },
          { id: 2, label: 'Summerside', value: 'summerside' },
          { id: 3, label: 'Stratford', value: 'stratford' },
          { id: 4, label: 'Borden', value: 'borden' },
          { id: 5, label: 'Cavendish', value: 'cavendish' },
          { id: 6, label: 'Souris', value: 'souris' },
        ],
      },
      {
        id: 9,
        label: 'Quebec',
        value: 'quebec',
        abvName: 'QC',
        cities: [
          { id: 1, label: 'Montréal', value: 'montreal' },
          { id: 2, label: 'Québec City', value: 'quebec_city' },
          { id: 3, label: 'Laval', value: 'laval' },
          { id: 4, label: 'Gatineau', value: 'gatineau' },
          { id: 5, label: 'Longueuil', value: 'longueuil' },
          { id: 6, label: 'Sherbrooke', value: 'sherbrooke' },
          { id: 7, label: 'Trois-Rivières', value: 'trois_rivieres' },
          { id: 8, label: 'Lévis', value: 'levis' },
          { id: 9, label: 'Drummondville', value: 'drummondville' },
          { id: 10, label: 'Shawinigan', value: 'shawinigan' },
          { id: 11, label: 'Baie-Comeau', value: 'baie_comeau' },
          { id: 12, label: 'Rimouski', value: 'rimouski' },
        ],
      },
      {
        id: 10,
        label: 'Saskatchewan',
        value: 'saskatchewan',
        abvName: 'SK',
        cities: [
          { id: 1, label: 'Regina', value: 'regina' },
          { id: 2, label: 'Saskatoon', value: 'saskatoon' },
          { id: 3, label: 'Moose Jaw', value: 'moose_jaw' },
          { id: 4, label: 'Prince Albert', value: 'prince_albert' },
          { id: 5, label: 'Swift Current', value: 'swift_current' },
          { id: 6, label: 'Yorkton', value: 'yorkton' },
          { id: 7, label: 'North Battleford', value: 'north_battleford' },
          { id: 8, label: 'Weyburn', value: 'weyburn' },
          { id: 9, label: 'Estevan', value: 'estevan' },
          { id: 10, label: 'Lloydminster', value: 'lloydminster' },
        ],
      },
      {
        id: 11,
        label: 'Northwest Territories',
        value: 'northwest_territories',
        abvName: 'NT',
        cities: [
          { id: 1, label: 'Yellowknife', value: 'yellowknife' },
          { id: 2, label: 'Hay River', value: 'hay_river' },
          { id: 3, label: 'Fort Smith', value: 'fort_smith' },
          { id: 4, label: 'Inuvik', value: 'inuvik' },
          { id: 5, label: 'Tuktoyaktuk', value: 'tuktoyaktuk' },
          { id: 6, label: 'Norman Wells', value: 'norman_wells' },
          { id: 7, label: 'Aklavik', value: 'aklavik' },
          { id: 8, label: 'Behchoko', value: 'behchoko' },
        ],
      },
      {
        id: 12,
        label: 'Nunavut',
        value: 'nunavut',
        abvName: 'NU',
        cities: [
          { id: 1, label: 'Iqaluit', value: 'iqaluit' },
          { id: 2, label: 'Cambridge Bay', value: 'cambridge_bay' },
          { id: 3, label: 'Baker Lake', value: 'baker_lake' },
          { id: 4, label: 'Arviat', value: 'arviat' },
          { id: 5, label: 'Rankin Inlet', value: 'rankin_inlet' },
          { id: 6, label: 'Kugluktuk', value: 'kugluktuk' },
          { id: 7, label: 'Gjoa Haven', value: 'gjoa_haven' },
          { id: 8, label: 'Taloyoak', value: 'taloyoak' },
        ],
      },
      {
        id: 13,
        label: 'Yukon',
        value: 'yukon',
        abvName: 'YT',
        cities: [
          { id: 1, label: 'Whitehorse', value: 'whitehorse' },
          { id: 2, label: 'Dawson', value: 'dawson' },
          { id: 3, label: 'Haines Junction', value: 'haines_junction' },
          { id: 4, label: 'Mayo', value: 'mayo' },
          { id: 5, label: 'Carcross', value: 'carcross' },
          { id: 6, label: 'Teslin', value: 'teslin' },
          { id: 7, label: 'Marsh Lake', value: 'marsh_lake' },
        ],
      },
    ],

    work_eligibility: [
      {
        id: 1,
        label: 'Canadian Citizen',
        value: 'canadian_citizen',
      },
      {
        id: 2,
        label: 'Permanent Resident',
        value: 'permanent_resident',
      },
      {
        id: 3,
        label: 'Work Permit Holder',
        value: 'work_permit_holder',
      },
    ],

    shift_types: [
      { id: 1, label: 'Morning', value: 'morning' },
      { id: 2, label: 'Evening', value: 'evening' },
      { id: 3, label: 'Night', value: 'night' },
      { id: 4, label: 'General', value: 'general' },
    ],

    interview_types: [
      { id: 1, label: 'Self Interview', value: 'SELF' },
      { id: 2, label: 'Job Interview', value: 'JOB' },
    ],

    // =========================
    // Documents (unchanged – already structured well)
    // =========================
    candidateCommonRequiredIdentityDocument: [
      {
        id: 0,
        type: 'passport',
        label: 'Passport',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['CA'],
        isRequired: true,
      },
    ],

    nonCanadianCandidateDocument: [
      {
        id: 0,
        type: 'permanent_resident_card',
        label: 'Permanent Resident (PR) Card',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['IN', 'CA'],
        isRequired: false,
      },
      {
        id: 1,
        type: 'work_permit',
        label: 'Work Permit',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['IN', 'CA'],
        isRequired: false,
      },
    ],

    professionalCertificates: [
      {
        type: 'medical_license',
        label: 'Medical License',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['CA'],
        isRequired: true,
      },
      {
        type: 'first_aid_certificate',
        label: 'First Aid Certificate',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['CA'],
        isRequired: true,
      },
      {
        type: 'professional_liability_insurance',
        label: 'Professional Liability Insurance',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['CA'],
        isRequired: true,
      },
      {
        type: 'flu_vaccination_certificate',
        label: 'Flu Vaccination Certificate',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['CA'],
        isRequired: true,
      },
      {
        type: 'covid_vaccination_certificate',
        label: 'COVID Vaccination Certificate',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['CA'],
        isRequired: true,
      },
      {
        type: 'tb_screening_certificate',
        label: 'TB Screening Certificate',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['CA'],
        isRequired: true,
      },
      {
        type: 'criminal_record',
        label: 'Criminal Record Check Less Than 6 month',
        sides: 1,
        personal_dropdown: true,
        unique: true,
        countries_allowed: ['CA'],
        isRequired: true,
      },
    ],
  },
}

export const DEFAULT_NEIGHBORHOOD_TYPES = [
  "Independent Living",
  "Assisted Living",
  "Dementia / Memory Care",
  "Complex Dementia Care",
  "Adult Mental Health",
];

export const CDSW_NEIGHBORHOOD_TYPES = [
  "Group Home / Community Residential Home",
  "Intermediate Care / Community Care Facility for Developmental Disabilities",
  "Supported Independent Living (SIL)",
  "Board-and-Care / Adult Foster Care Homes",
  "Specialized Nursing Homes / Skilled Nursing for Disabilities",
  "Rehabilitation and Step-down Residential Care Programs",
];

type MetadataLabelValueOption = {
  label: string;
  value: string;
};

export type CanadianCityOption = {
  id: number | string;
  label: string;
  value: string;
};

export type CanadianProvinceOption = {
  id: number | string;
  label: string;
  value: string;
  abvName?: string;
  cities?: CanadianCityOption[];
};

type JobTypeOption = { id: number; label: string; value: string };

/** Cities for a province value, label, or abbreviation. */
export function getCitiesForProvince(
  provinces: readonly CanadianProvinceOption[],
  provinceValue?: string | null,
): CanadianCityOption[] {
  if (!provinceValue?.trim()) return [];

  const normalized = provinceValue.trim().toLowerCase().replace(/-/g, "_");
  const province = provinces.find((option) => {
    const abv = (option.abvName ?? "").toLowerCase();
    return (
      option.value === normalized ||
      option.label.toLowerCase() === normalized ||
      abv === normalized ||
      abv === provinceValue.trim().toLowerCase()
    );
  });

  return province?.cities ?? [];
}

export function getCityLabel(
  provinces: readonly CanadianProvinceOption[],
  provinceValue: string | null | undefined,
  cityValue: string | null | undefined,
): string {
  if (!cityValue) return "";
  const cities = getCitiesForProvince(provinces, provinceValue);
  const normalizedCity = cityValue.trim().toLowerCase().replace(/-/g, "_");
  const match = cities.find(
    (city) =>
      city.value === cityValue ||
      city.value === normalizedCity ||
      city.label === cityValue ||
      city.label.toLowerCase() === normalizedCity,
  );
  if (match) return match.label;

  return cityValue
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getJobTypeLabel(value: string): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  const found = metaData.data.job_types.find(
    (opt: JobTypeOption) => opt.value === trimmed,
  );
  if (found) return found.label;
  return trimmed
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getProvinceLabel(value: string): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  const found = metaData.data.canadian_provinces.find(
    (opt: CanadianProvinceOption) =>
      opt.value === trimmed.toLowerCase() ||
      opt.label === trimmed ||
      opt.abvName?.toUpperCase() === trimmed.toUpperCase(),
  );
  if (found) return found.label;
  return trimmed
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getMetadataLabel(
  options: readonly MetadataLabelValueOption[],
  value: string | null | undefined,
): string {
  if (!value) return "";
  return (
    options.find((option) => option.value === value || option.label === value)?.label ??
    value
  );
}

export function getMetadataValue(
  options: readonly MetadataLabelValueOption[],
  labelOrValue: string | null | undefined,
): string | undefined {
  if (!labelOrValue) return undefined;
  return options.find(
    (option) => option.value === labelOrValue || option.label === labelOrValue,
  )?.value;
}

// ============================================================================
// PROVINCE CONVERTERS
// ============================================================================

export function convertProvinceToFrontend(backendValue: string | null | undefined): string | undefined {
  return getMetadataValue(metaData.data.canadian_provinces, backendValue);
}

// ✅ Use this for jobs (snake_case)
export const convertProvinceToJobBackend = (province: string | undefined): string | null => {
  if (!province) return null;
  return (
    getMetadataValue(metaData.data.canadian_provinces, province) ??
    province.toLowerCase().replace(/\s+/g, "_")
  );
};
