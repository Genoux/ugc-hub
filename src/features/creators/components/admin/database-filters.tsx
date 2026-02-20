"use client";

import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ChevronDown,
  Film,
  Globe,
  Grid3X3,
  Shield,
  Star,
  Tv,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import type {
  AgeDemographic,
  ContentFormat,
  CreatorDatabaseStatus,
  Ethnicity,
  GenderIdentity,
  OverallRatingTier,
  UgcCategory,
} from "../../constants";
import {
  AGE_DEMOGRAPHICS,
  CONTENT_FORMATS,
  CREATOR_STATUSES,
  ETHNICITIES,
  GENDER_IDENTITIES,
  OVERALL_RATING_TIERS,
  UGC_CATEGORIES,
} from "../../constants";

export interface Filters {
  status: CreatorDatabaseStatus[];
  overallRating: OverallRatingTier[];
  ugcCategories: UgcCategory[];
  contentFormats: ContentFormat[];
  genderIdentity: GenderIdentity[];
  ageDemographic: AgeDemographic[];
  ethnicity: Ethnicity[];
  hasInstagram: boolean;
  hasTikTok: boolean;
  hasYouTube: boolean;
}

export const emptyFilters: Filters = {
  status: [],
  overallRating: [],
  ugcCategories: [],
  contentFormats: [],
  genderIdentity: [],
  ageDemographic: [],
  ethnicity: [],
  hasInstagram: false,
  hasTikTok: false,
  hasYouTube: false,
};

export function hasActiveFilters(f: Filters): boolean {
  return (
    f.status.length > 0 ||
    f.overallRating.length > 0 ||
    f.ugcCategories.length > 0 ||
    f.contentFormats.length > 0 ||
    f.genderIdentity.length > 0 ||
    f.ageDemographic.length > 0 ||
    f.ethnicity.length > 0 ||
    f.hasInstagram ||
    f.hasTikTok ||
    f.hasYouTube
  );
}

export function countActiveFilters(f: Filters): number {
  return (
    [
      f.status,
      f.overallRating,
      f.ugcCategories,
      f.contentFormats,
      f.genderIdentity,
      f.ageDemographic,
      f.ethnicity,
    ].reduce((n, arr) => n + arr.length, 0) +
    (f.hasInstagram ? 1 : 0) +
    (f.hasTikTok ? 1 : 0) +
    (f.hasYouTube ? 1 : 0)
  );
}

export function getActiveFilterLabels(f: Filters): string[] {
  return [
    ...f.status,
    ...f.overallRating,
    ...f.ugcCategories,
    ...f.contentFormats,
    ...f.genderIdentity,
    ...f.ageDemographic,
    ...f.ethnicity,
    ...(f.hasInstagram ? ["Instagram"] : []),
    ...(f.hasTikTok ? ["TikTok"] : []),
    ...(f.hasYouTube ? ["YouTube"] : []),
  ];
}

function FilterSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
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
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {title}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
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
      <FilterSection title="Rating" icon={Star} defaultOpen>
        <MultiSelect
          prefix="rating"
          options={OVERALL_RATING_TIERS}
          selected={filters.overallRating}
          onChange={(v) => onChange({ ...filters, overallRating: v })}
        />
      </FilterSection>

      <FilterSection title="Status" icon={Shield} defaultOpen>
        <MultiSelect
          prefix="status"
          options={CREATOR_STATUSES}
          selected={filters.status}
          onChange={(v) => onChange({ ...filters, status: v })}
        />
      </FilterSection>

      <FilterSection title="Channels" icon={Tv}>
        <CheckOption
          id="channel-instagram"
          label="Instagram"
          checked={filters.hasInstagram}
          onChange={(v) => onChange({ ...filters, hasInstagram: !!v })}
        />
        <CheckOption
          id="channel-tiktok"
          label="TikTok"
          checked={filters.hasTikTok}
          onChange={(v) => onChange({ ...filters, hasTikTok: !!v })}
        />
        <CheckOption
          id="channel-youtube"
          label="YouTube"
          checked={filters.hasYouTube}
          onChange={(v) => onChange({ ...filters, hasYouTube: !!v })}
        />
      </FilterSection>

      <FilterSection title="UGC Categories" icon={Grid3X3}>
        <MultiSelect
          prefix="ugc"
          options={UGC_CATEGORIES}
          selected={filters.ugcCategories}
          onChange={(v) => onChange({ ...filters, ugcCategories: v })}
        />
      </FilterSection>

      <FilterSection title="Content Formats" icon={Film}>
        <MultiSelect
          prefix="format"
          options={CONTENT_FORMATS}
          selected={filters.contentFormats}
          onChange={(v) => onChange({ ...filters, contentFormats: v })}
        />
      </FilterSection>

      <FilterSection title="Gender" icon={Users}>
        <MultiSelect
          prefix="gender"
          options={GENDER_IDENTITIES}
          selected={filters.genderIdentity}
          onChange={(v) => onChange({ ...filters, genderIdentity: v })}
        />
      </FilterSection>

      <FilterSection title="Age" icon={Calendar}>
        <MultiSelect
          prefix="age"
          options={AGE_DEMOGRAPHICS}
          selected={filters.ageDemographic}
          onChange={(v) => onChange({ ...filters, ageDemographic: v })}
        />
      </FilterSection>

      <FilterSection title="Ethnicity" icon={Globe}>
        <MultiSelect
          prefix="ethnicity"
          options={ETHNICITIES}
          selected={filters.ethnicity}
          onChange={(v) => onChange({ ...filters, ethnicity: v })}
        />
      </FilterSection>
    </div>
  );
}
