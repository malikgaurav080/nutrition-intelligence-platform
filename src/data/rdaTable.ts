// ============================================================
// Personalised Micronutrient RDA Lookup Table
// PRD Reference: Section 3.5
// Source: U.S. National Academies — Dietary Reference Intakes (DRIs)
// ============================================================

import type { RDAProfile, MicroRDA } from '../types/nutrition.types';

/**
 * Returns the personalised daily micronutrient RDA for a given profile.
 * Lookup logic: age + gender + pregnancy/breastfeeding status.
 * PRD Section 3.5.
 */
export function getRDA(profile: RDAProfile): MicroRDA {
  const { age, gender, isPregnant, isBreastfeeding } = profile;
  const isFemale = gender === 'Female';

  return {
    // --- Vitamin A (µg) ---
    vitA: (() => {
      if (age <= 3) return 300;
      if (age <= 8) return 400;
      if (age <= 13) return 600;
      if (age <= 18) {
        if (isBreastfeeding) return 1200;
        if (isPregnant) return 750;
        return isFemale ? 700 : 900;
      }
      if (isBreastfeeding) return 1300;
      if (isPregnant) return 770;
      return isFemale ? 700 : 900;
    })(),

    // --- Vitamin C (mg) ---
    vitC: (() => {
      if (age <= 3) return 15;
      if (age <= 8) return 25;
      if (age <= 13) return 45;
      if (age <= 18) {
        if (isBreastfeeding) return 115;
        if (isPregnant) return 80;
        return isFemale ? 65 : 75;
      }
      if (isBreastfeeding) return 120;
      if (isPregnant) return 85;
      return isFemale ? 75 : 90;
    })(),

    // --- Vitamin D (µg) ---
    vitD: (() => {
      if (age <= 70) return 15;
      return 20;
    })(),

    // --- Vitamin E (mg) ---
    vitE: (() => {
      if (age <= 3) return 6;
      if (age <= 8) return 7;
      if (age <= 13) return 11;
      if (isBreastfeeding) return 19;
      return 15;
    })(),

    // --- Vitamin K (µg) ---
    vitK: (() => {
      if (age <= 3) return 30;
      if (age <= 8) return 55;
      if (age <= 13) return 60;
      if (age <= 18) return 75;
      return isFemale ? 90 : 120;
    })(),

    // --- Vitamin B1 / Thiamin (mg) ---
    vitB1: (() => {
      if (age <= 3) return 0.5;
      if (age <= 8) return 0.6;
      if (age <= 13) return 0.9;
      if (age <= 18) {
        if (isPregnant || isBreastfeeding) return 1.4;
        return isFemale ? 1.0 : 1.2;
      }
      if (isPregnant || isBreastfeeding) return 1.4;
      return isFemale ? 1.1 : 1.2;
    })(),

    // --- Vitamin B2 / Riboflavin (mg) ---
    vitB2: (() => {
      if (age <= 3) return 0.5;
      if (age <= 8) return 0.6;
      if (age <= 13) return 0.9;
      if (age <= 18) {
        if (isBreastfeeding) return 1.6;
        if (isPregnant) return 1.4;
        return isFemale ? 1.0 : 1.3;
      }
      if (isBreastfeeding) return 1.6;
      if (isPregnant) return 1.4;
      return isFemale ? 1.1 : 1.3;
    })(),

    // --- Vitamin B3 / Niacin (mg) ---
    vitB3: (() => {
      if (age <= 3) return 6;
      if (age <= 8) return 8;
      if (age <= 13) return 12;
      if (age <= 18) {
        if (isBreastfeeding) return 17;
        if (isPregnant) return 18;
        return isFemale ? 14 : 16;
      }
      if (isBreastfeeding) return 17;
      if (isPregnant) return 18;
      return isFemale ? 14 : 16;
    })(),

    // --- Vitamin B5 / Pantothenic Acid (mg) ---
    vitB5: (() => {
      if (age <= 3) return 2;
      if (age <= 8) return 3;
      if (age <= 13) return 4;
      if (isBreastfeeding) return 7;
      if (isPregnant) return 6;
      return 5;
    })(),

    // --- Vitamin B6 (mg) ---
    vitB6: (() => {
      if (age <= 3) return 0.5;
      if (age <= 8) return 0.6;
      if (age <= 13) return 1.0;
      if (age <= 18) {
        if (isBreastfeeding) return 2.0;
        if (isPregnant) return 1.9;
        return isFemale ? 1.2 : 1.3;
      }
      if (age <= 50) {
        if (isBreastfeeding) return 2.0;
        if (isPregnant) return 1.9;
        return 1.3;
      }
      // 51+
      return isFemale ? 1.5 : 1.7;
    })(),

    // --- Biotin / B7 (µg) ---
    biotin: (() => {
      if (age <= 3) return 8;
      if (age <= 8) return 12;
      if (age <= 13) return 20;
      if (age <= 18) {
        if (isBreastfeeding) return 35;
        if (isPregnant) return 30;
        return 25;
      }
      if (isBreastfeeding) return 35;
      return 30;
    })(),

    // --- Folate / B9 (µg) ---
    folate: (() => {
      if (age <= 3) return 150;
      if (age <= 8) return 200;
      if (age <= 13) return 300;
      if (isBreastfeeding) return 500;
      if (isPregnant) return 600;
      return 400;
    })(),

    // --- Vitamin B12 (µg) ---
    vitB12: (() => {
      if (age <= 3) return 0.9;
      if (age <= 8) return 1.2;
      if (age <= 13) return 1.8;
      if (isBreastfeeding) return 2.8;
      if (isPregnant) return 2.6;
      return 2.4;
    })(),

    // --- Calcium (mg) ---
    calcium: (() => {
      if (age <= 3) return 700;
      if (age <= 8) return 1000;
      if (age <= 18) return 1300;
      if (age <= 50) return 1000;
      if (age <= 70) return isFemale ? 1200 : 1000;
      return 1200;
    })(),

    // --- Iron (mg) ---
    iron: (() => {
      if (age <= 3) return 7;
      if (age <= 8) return 10;
      if (age <= 13) return 8;
      if (age <= 18) {
        if (isBreastfeeding) return 10;
        if (isPregnant) return 27;
        return isFemale ? 15 : 11;
      }
      if (age <= 50) {
        if (isBreastfeeding) return 9;
        if (isPregnant) return 27;
        return isFemale ? 18 : 8;
      }
      return 8;
    })(),

    // --- Magnesium (mg) ---
    magnesium: (() => {
      if (age <= 3) return 80;
      if (age <= 8) return 130;
      if (age <= 13) return 240;
      if (age <= 18) {
        if (isBreastfeeding) return 360;
        if (isPregnant) return 400;
        return isFemale ? 360 : 410;
      }
      if (age <= 30) {
        if (isBreastfeeding) return 310;
        if (isPregnant) return 350;
        return isFemale ? 310 : 400;
      }
      // 31+
      if (isBreastfeeding) return 320;
      if (isPregnant) return 360;
      return isFemale ? 320 : 420;
    })(),

    // --- Potassium (mg) ---
    potassium: (() => {
      if (age <= 3) return 2000;
      if (age <= 8) return 2300;
      if (age <= 13) return isFemale ? 2300 : 2500;
      if (isBreastfeeding) return 2800;
      if (isPregnant) return 2900;
      return isFemale ? 2600 : 3400;
    })(),

    // --- Zinc (mg) ---
    zinc: (() => {
      if (age <= 3) return 3;
      if (age <= 8) return 5;
      if (age <= 13) return 8;
      if (age <= 18) {
        if (isBreastfeeding) return 13;
        if (isPregnant) return 12;
        return isFemale ? 9 : 11;
      }
      if (isBreastfeeding) return 12;
      if (isPregnant) return 11;
      return isFemale ? 8 : 11;
    })(),

    // --- Phosphorus (mg) ---
    phosphorus: (() => {
      if (age <= 3) return 460;
      if (age <= 8) return 500;
      if (age <= 18) return 1250;
      return 700;
    })(),

    // --- Selenium (µg) ---
    selenium: (() => {
      if (age <= 3) return 20;
      if (age <= 8) return 30;
      if (age <= 13) return 40;
      if (isBreastfeeding) return 70;
      if (isPregnant) return 60;
      return 55;
    })(),

    // --- Iodine (µg) ---
    iodine: (() => {
      if (age <= 8) return 90;
      if (age <= 13) return 120;
      if (isBreastfeeding) return 290;
      if (isPregnant) return 220;
      return 150;
    })(),

    // --- Omega-3 (g) ---
    omega3: (() => {
      if (age <= 3) return 0.7;
      if (age <= 8) return 0.9;
      if (age <= 13) return isFemale ? 1.0 : 1.2;
      if (age <= 18) {
        if (isBreastfeeding) return 1.3;
        if (isPregnant) return 1.4;
        return isFemale ? 1.1 : 1.6;
      }
      if (isBreastfeeding) return 1.3;
      if (isPregnant) return 1.4;
      return isFemale ? 1.1 : 1.6;
    })(),
  };
}
