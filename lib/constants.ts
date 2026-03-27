export const GRADE_OPTIONS = [
  { value: "K", label: "Kindergarten" },
  { value: "1", label: "1st Grade" },
  { value: "2", label: "2nd Grade" },
  { value: "3", label: "3rd Grade" },
  { value: "4", label: "4th Grade" },
  { value: "5", label: "5th Grade" },
  { value: "6+", label: "6th Grade+" },
] as const;

export const EQUIPMENT_TYPES = [
  { value: "shoes", label: "Curling Shoes" },
  { value: "broom", label: "Broom" },
] as const;

export const EQUIPMENT_CONDITIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
] as const;

export const EQUIPMENT_STATUSES = [
  { value: "available", label: "Available" },
  { value: "checked_out", label: "Checked Out" },
  { value: "retired", label: "Retired" },
] as const;

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number]["value"];
export type EquipmentCondition = (typeof EQUIPMENT_CONDITIONS)[number]["value"];
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number]["value"];
export type Grade = (typeof GRADE_OPTIONS)[number]["value"];

export const SHOE_SIZES = [
  "Y10", "Y11", "Y12", "Y13",
  "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5",
  "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5",
  "9", "9.5", "10", "10.5", "11", "11.5", "12",
] as const;
