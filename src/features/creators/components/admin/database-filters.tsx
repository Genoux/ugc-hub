"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { NumberDot } from "@/shared/components/ui/number-dot";
import type {
  AgeDemographic,
  ContentFormat,
  Ethnicity,
  GenderIdentity,
  Language,
  OverallRatingTier,
  SocialPlatform,
  UgcCategory,
} from "@/shared/lib/constants";
import {
  AGE_DEMOGRAPHICS,
  CONTENT_FORMATS,
  COUNTRIES,
  ETHNICITIES,
  GENDER_IDENTITIES,
  LANGUAGES,
  OVERALL_RATING_TIERS,
  SOCIAL_PLATFORMS,
  UGC_CATEGORIES,
} from "@/shared/lib/constants";

export interface Filters {
  overallRating: OverallRatingTier[];
  ugcCategories: UgcCategory[];
  contentFormats: ContentFormat[];
  genderIdentity: GenderIdentity[];
  ageDemographic: AgeDemographic[];
  ethnicity: Ethnicity[];
  socialPlatforms: SocialPlatform[];
  languages: Language[];
  countries: string[];
}

export const emptyFilters: Filters = {
  overallRating: [],
  ugcCategories: [],
  contentFormats: [],
  genderIdentity: [],
  ageDemographic: [],
  ethnicity: [],
  socialPlatforms: [],
  languages: [],
  countries: [],
};

export function hasActiveFilters(f: Filters): boolean {
  return (
    f.overallRating.length > 0 ||
    f.ugcCategories.length > 0 ||
    f.contentFormats.length > 0 ||
    f.genderIdentity.length > 0 ||
    f.ageDemographic.length > 0 ||
    f.ethnicity.length > 0 ||
    f.socialPlatforms.length > 0 ||
    f.languages.length > 0 ||
    f.countries.length > 0
  );
}

export function countActiveFilters(f: Filters): number {
  return [
    f.overallRating,
    f.ugcCategories,
    f.contentFormats,
    f.genderIdentity,
    f.ageDemographic,
    f.ethnicity,
    f.socialPlatforms,
    f.languages,
    f.countries,
  ].reduce((n, arr) => n + arr.length, 0);
}

export function getActiveFilterLabels(f: Filters): string[] {
  return [
    ...f.overallRating,
    ...f.ugcCategories,
    ...f.contentFormats,
    ...f.genderIdentity,
    ...f.ageDemographic,
    ...f.ethnicity,
    ...f.socialPlatforms,
    ...f.languages,
    ...f.countries,
  ];
}

function FilterSection({
  title,
  defaultOpen = false,
  activeCount,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  activeCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2">
      <Button
        className="w-full flex items-center justify-between"
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2">{title}</span>
          <NumberDot count={activeCount} />
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </Button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

function CheckOption({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label
        htmlFor={id}
        className="text-sm font-normal capitalize cursor-pointer text-muted-foreground data-[state=checked]:text-foreground"
      >
        {label}
      </Label>
    </div>
  );
}

function MultiSelect<T extends string>({
  options,
  selected,
  onChange,
  prefix,
}: {
  options: readonly T[];
  selected: T[];
  onChange: (v: T[]) => void;
  prefix: string;
}) {
  return (
    <>
      {options.map((o) => (
        <CheckOption
          key={o}
          id={`${prefix}-${o}`}
          label={o}
          checked={selected.includes(o)}
          onChange={(on) => onChange(on ? [...selected, o] : selected.filter((s) => s !== o))}
        />
      ))}
    </>
  );
}

interface DatabaseFiltersProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function DatabaseFilters({ filters, onChange }: DatabaseFiltersProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <FilterSection title="Rating" defaultOpen activeCount={filters.overallRating.length}>
        <MultiSelect
          prefix="rating"
          options={OVERALL_RATING_TIERS}
          selected={filters.overallRating}
          onChange={(v) => onChange({ ...filters, overallRating: v })}
        />
      </FilterSection>

      <FilterSection title="Channels" activeCount={filters.socialPlatforms.length}>
        <MultiSelect
          prefix="channel"
          options={SOCIAL_PLATFORMS.map((p) => p.value)}
          selected={filters.socialPlatforms}
          onChange={(v) => onChange({ ...filters, socialPlatforms: v })}
        />
      </FilterSection>

      <FilterSection title="UGC Categories" activeCount={filters.ugcCategories.length}>
        <MultiSelect
          prefix="ugc"
          options={UGC_CATEGORIES}
          selected={filters.ugcCategories}
          onChange={(v) => onChange({ ...filters, ugcCategories: v })}
        />
      </FilterSection>

      <FilterSection title="Content Formats" activeCount={filters.contentFormats.length}>
        <MultiSelect
          prefix="format"
          options={CONTENT_FORMATS}
          selected={filters.contentFormats}
          onChange={(v) => onChange({ ...filters, contentFormats: v })}
        />
      </FilterSection>

      <FilterSection title="Gender" activeCount={filters.genderIdentity.length}>
        <MultiSelect
          prefix="gender"
          options={GENDER_IDENTITIES}
          selected={filters.genderIdentity}
          onChange={(v) => onChange({ ...filters, genderIdentity: v })}
        />
      </FilterSection>

      <FilterSection title="Age" activeCount={filters.ageDemographic.length}>
        <MultiSelect
          prefix="age"
          options={AGE_DEMOGRAPHICS}
          selected={filters.ageDemographic}
          onChange={(v) => onChange({ ...filters, ageDemographic: v })}
        />
      </FilterSection>

      <FilterSection title="Ethnicity" activeCount={filters.ethnicity.length}>
        <MultiSelect
          prefix="ethnicity"
          options={ETHNICITIES}
          selected={filters.ethnicity}
          onChange={(v) => onChange({ ...filters, ethnicity: v })}
        />
      </FilterSection>

      <FilterSection title="Languages" activeCount={filters.languages.length}>
        <MultiSelect
          prefix="language"
          options={LANGUAGES}
          selected={filters.languages}
          onChange={(v) => onChange({ ...filters, languages: v })}
        />
      </FilterSection>

      <FilterSection title="Country" activeCount={filters.countries.length}>
        <MultiSelect
          prefix="country"
          options={COUNTRIES}
          selected={filters.countries}
          onChange={(v) => onChange({ ...filters, countries: v })}
        />
      </FilterSection>
    </div>
  );
}
