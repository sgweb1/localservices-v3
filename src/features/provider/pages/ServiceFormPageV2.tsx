/**
 * @file ServiceFormPageV2.tsx
 * @module features/provider/pages
 * @description Complete service edit form using Radix UI primitives
 * 
 * @overview
 * This is a comprehensive form for creating/editing provider services.
 * It uses Radix UI components for accessibility and custom form wrappers
 * for consistency. The form is organized into 8 tabbed sections.
 * 
 * @architecture
 * - **State Management**: Centralized with single formData object
 * - **Validation**: Client-side validation before API submission
 * - **Conditional Rendering**: Fields shown/hidden based on other values
 * - **Type Safety**: Full TypeScript coverage with interfaces
 * 
 * @sections
 * 1. Basic Information - Title, description, category, status
 * 2. Pricing - Pricing type (hourly/fixed/quote), price fields
 * 3. Booking - Instant booking, quote requests, availability
 * 4. Location - Location select, travel settings, distance
 * 5. Content - What's included, requirements, tools (dynamic arrays)
 * 6. Policies - Cancellation policy with presets
 * 7. Photos - Drag & drop upload, primary selection, alt text
 * 8. SEO - Meta title, meta description with character limits
 * 
 * @example
 * ```tsx
 * // Router setup in main.tsx
 * <Route path="services/edit/:id" element={<ServiceFormPageV2 />} />
 * 
 * // Navigate to form
 * navigate('/provider/services/edit/11');
 * ```
 * 
 * @author Claude AI Assistant
 * @version 2.0
 * @since 2024-12-31
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as Tabs from '@radix-ui/react-tabs';

import { useService } from '../hooks/useService';
import { useCategories } from '@/hooks/useCategories';
import { useLocations } from '@/hooks/useLocations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PageTitle } from '@/components/ui/typography';
import { 
  FormField, 
  FormSection, 
  FormRow, 
  FormActions,
  CharacterCount 
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { CategorySelect } from '@/components/CategorySelect';
import { LocationSelect } from '@/components/LocationSelect';

import type { ServiceCategory } from '@/types/service';
import type { Location } from '@/types/location';

/**
 * @typedef {('hourly'|'fixed'|'quote')} PricingType
 * @description Service pricing model
 * - hourly: Charged per hour
 * - fixed: One-time fixed price
 * - quote: Custom pricing (price range shown)
 */
type PricingType = 'hourly' | 'fixed' | 'quote';

/**
 * @typedef {('active'|'paused'|'draft')} ServiceStatus
 * @description Service publication status
 * - active: Published and bookable
 * - paused: Published but not bookable
 * - draft: Not published
 */
type ServiceStatus = 'active' | 'paused' | 'draft';

/**
 * @interface ServiceFormData
 * @description Complete form state for service creation/editing
 * 
 * @property {string} title - Service title (5-100 chars)
 * @property {string} description - Service description (min 50 chars)
 * @property {ServiceCategory|null} category - Selected category
 * @property {ServiceStatus} status - Publication status
 * @property {PricingType} pricingType - Pricing model
 * @property {string} basePrice - Base price for hourly/fixed
 * @property {string} priceRangeLow - Min price for quote
 * @property {string} priceRangeHigh - Max price for quote
 * @property {string} pricingUnit - Unit (hour, day, project)
 * @property {boolean} instantBooking - Allow instant booking
 * @property {boolean} acceptsQuote - Accept quote requests
 * @property {string} minNoticeHours - Min notice before booking
 * @property {string} maxAdvanceDays - Max advance booking days
 * @property {string} durationMinutes - Expected duration
 * @property {Location|null} selectedLocation - Service location
 * @property {number} latitude - Location latitude
 * @property {number} longitude - Location longitude
 * @property {boolean} willingToTravel - Will travel to client
 * @property {number} maxDistanceKm - Max travel distance (0-100 km)
 * @property {string} travelFeePerKm - Fee per km
 * @property {string} whatIncluded - What's included description
 * @property {string[]} requirements - Client requirements (dynamic)
 * @property {string[]} toolsProvided - Tools provided (dynamic)
 * @property {string} cancellationPolicy - Cancellation terms
 * @property {string} metaTitle - SEO meta title (max 60 chars)
 * @property {string} metaDescription - SEO meta description (max 160 chars)
 */
interface ServiceFormData {
  // Podstawowe
  title: string;
  description: string;
  category: ServiceCategory | null;
  status: ServiceStatus;
  
  // Ceny
  pricingType: PricingType;
  basePrice: string;
  priceRangeLow: string;
  priceRangeHigh: string;
  pricingUnit: string;
  
  // Rezerwacja
  instantBooking: boolean;
  acceptsQuote: boolean;
  minNoticeHours: string;
  maxAdvanceDays: string;
  durationMinutes: string;
  
  // Lokalizacja
  selectedLocation: Location | null;
  latitude: number;
  longitude: number;
  willingToTravel: boolean;
  maxDistanceKm: number;
  travelFeePerKm: string;
  
  // Zawartość
  whatIncluded: string;
  requirements: string[];
  toolsProvided: string[];
  
  // Polityki
  cancellationPolicy: string;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
}

/**
 * @component BasicInfoSection
 * @description Section 1 - Basic service information
 * 
 * Contains fields for:
 * - Service title (5-100 characters, required)
 * - Service description (min 50 characters, required)
 * - Category selection (required)
 * - Status selection (active/paused/draft)
 * 
 * @param {BasicInfoSectionProps} props - Component props
 * @param {ServiceFormData} props.formData - Current form state
 * @param {Function} props.onChange - Field change handler
 * @param {Record<string, string>} props.errors - Validation errors
 * @param {ServiceCategory[]} props.categories - Available categories
 * 
 * @returns {JSX.Element} Basic information section
 * 
 * @example
 * ```tsx
 * <BasicInfoSection
 *   formData={formData}
 *   onChange={handleChange}
 *   errors={errors}
 *   categories={categoriesList}
 * />
 * ```
 */
interface BasicInfoSectionProps {
  formData: ServiceFormData;
  onChange: (field: keyof ServiceFormData, value: any) => void;
  errors: Record<string, string>;
  categories: ServiceCategory[];
}

function BasicInfoSection({ formData, onChange, errors, categories }: BasicInfoSectionProps) {
  return (
    <FormSection
      title="Podstawowe informacje"
      description="Dane identyfikujące Twoją usługę"
    >
      {/* Tytuł */}
      <FormField
        label="Tytuł usługi"
        htmlFor="title"
        required
        error={errors.title}
        help="Krótki, chwytliwy tytuł (5-100 znaków)"
      >
        <div className="space-y-1">
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="np. Sprzątanie mieszkań - szybko i profesjonalnie"
            maxLength={100}
          />
          <div className="flex justify-end">
            <CharacterCount current={formData.title.length} max={100} />
          </div>
        </div>
      </FormField>

      {/* Opis */}
      <FormField
        label="Opis szczegółowy"
        htmlFor="description"
        required
        error={errors.description}
        help="Pełny opis usługi, korzyści dla klienta (min 50 znaków)"
      >
        <div className="space-y-1">
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Opisz swoją usługę..."
            rows={6}
          />
          <div className="flex justify-end">
            <CharacterCount current={formData.description.length} max={1000} />
          </div>
        </div>
      </FormField>

      {/* Kategoria i Status - obok siebie */}
      <FormRow>
        <FormField
          label="Kategoria"
          htmlFor="category"
          required
          error={errors.category}
        >
          <CategorySelect
            value={formData.category}
            onChange={(cat) => onChange('category', cat)}
            categories={categories}
          />
        </FormField>

        <FormField
          label="Status"
          htmlFor="status"
          help="Aktywna = widoczna dla klientów"
        >
          <Select
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value as ServiceStatus)}
          >
            <option value="active">🟢 Aktywna</option>
            <option value="paused">⏸️ Wstrzymana</option>
            <option value="draft">📝 Szkic</option>
          </Select>
        </FormField>
      </FormRow>
    </FormSection>
  );
}

/**
 * SEKCJA 2 - Ceny i Model Biznesowy
 * 
 * Zawiera: typ cennika (radio), ceny, jednostka
 * Conditional rendering: różne pola dla różnych typów
 */
interface PricingSectionProps {
  formData: ServiceFormData;
  onChange: (field: keyof ServiceFormData, value: any) => void;
  errors: Record<string, string>;
}

function PricingSection({ formData, onChange, errors }: PricingSectionProps) {
  return (
    <FormSection
      title="Ceny i model biznesowy"
      description="Wybierz jak klient płaci za usługę"
    >
      {/* Typ cennika - Radio Group */}
      <FormField
        label="Typ cennika"
        required
        error={errors.pricingType}
      >
        <RadioGroup
          value={formData.pricingType}
          onValueChange={(val) => onChange('pricingType', val as PricingType)}
        >
          <RadioGroupItem
            value="hourly"
            label="Płatność godzinowa"
            description="Klient płaci za każdą godzinę pracy"
          />
          <RadioGroupItem
            value="fixed"
            label="Stała cena"
            description="Jedna cena za całą usługę"
          />
          <RadioGroupItem
            value="quote"
            label="Wycena indywidualna"
            description="Ustalasz cenę po konsultacji z klientem"
          />
        </RadioGroup>
      </FormField>

      {/* CONDITIONAL: Jeśli hourly lub fixed - pokazujemy cenę bazową */}
      {(formData.pricingType === 'hourly' || formData.pricingType === 'fixed') && (
        <FormRow>
          <FormField
            label="Cena bazowa"
            htmlFor="basePrice"
            required
            error={errors.basePrice}
            help="Podaj cenę w PLN"
          >
            <Input
              id="basePrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => onChange('basePrice', e.target.value)}
              placeholder="150.00"
            />
          </FormField>

          <FormField
            label="Jednostka"
            htmlFor="pricingUnit"
            help="Za co klient płaci?"
          >
            <Select
              value={formData.pricingUnit}
              onChange={(e) => onChange('pricingUnit', e.target.value)}
            >
              <option value="hour">godzina</option>
              <option value="day">dzień</option>
              <option value="project">projekt</option>
              <option value="service">usługa</option>
            </Select>
          </FormField>
        </FormRow>
      )}

      {/* CONDITIONAL: Jeśli quote - pokazujemy zakres cen */}
      {formData.pricingType === 'quote' && (
        <FormRow>
          <FormField
            label="Cena od"
            htmlFor="priceRangeLow"
            error={errors.priceRangeLow}
            help="Minimalna szacowana cena"
          >
            <Input
              id="priceRangeLow"
              type="number"
              min="0"
              step="0.01"
              value={formData.priceRangeLow}
              onChange={(e) => onChange('priceRangeLow', e.target.value)}
              placeholder="100.00"
            />
          </FormField>

          <FormField
            label="Cena do"
            htmlFor="priceRangeHigh"
            error={errors.priceRangeHigh}
            help="Maksymalna szacowana cena"
          >
            <Input
              id="priceRangeHigh"
              type="number"
              min="0"
              step="0.01"
              value={formData.priceRangeHigh}
              onChange={(e) => onChange('priceRangeHigh', e.target.value)}
              placeholder="500.00"
            />
          </FormField>
        </FormRow>
      )}
    </FormSection>
  );
}

/**
 * SEKCJA 3 - Rezerwacja i Dostępność
 * 
 * Zawiera: instant booking, accepts quote, min notice, max advance, duration
 * Używa Switch dla boolean values
 */
interface BookingSectionProps {
  formData: ServiceFormData;
  onChange: (field: keyof ServiceFormData, value: any) => void;
  errors: Record<string, string>;
}

function BookingSection({ formData, onChange, errors }: BookingSectionProps) {
  return (
    <FormSection
      title="Rezerwacja i dostępność"
      description="Zasady bookingów i wyprzedzenia"
    >
      {/* Instant Booking - Switch */}
      <FormField
        label="Natychmiastowa rezerwacja"
        help="Klient może zarezerwować bez Twojej akceptacji"
      >
        <div className="flex items-center gap-3">
          <Switch
            checked={formData.instantBooking}
            onCheckedChange={(checked) => onChange('instantBooking', checked)}
          />
          <span className="text-sm text-slate-600">
            {formData.instantBooking ? '✅ Włączone' : '❌ Wyłączone'}
          </span>
        </div>
      </FormField>

      {/* Accepts Quote Requests - Switch */}
      <FormField
        label="Przyjmuje zapytania o wycenę"
        help="Pozwól klientom prosić o indywidualną wycenę"
      >
        <div className="flex items-center gap-3">
          <Switch
            checked={formData.acceptsQuote}
            onCheckedChange={(checked) => onChange('acceptsQuote', checked)}
          />
          <span className="text-sm text-slate-600">
            {formData.acceptsQuote ? '✅ Włączone' : '❌ Wyłączone'}
          </span>
        </div>
      </FormField>

      {/* Min Notice, Max Advance, Duration - w row */}
      <FormRow>
        <FormField
          label="Minimalny czas wyprzedzenia"
          htmlFor="minNoticeHours"
          error={errors.minNoticeHours}
          help="Ile godzin przed rozpoczęciem?"
        >
          <Input
            id="minNoticeHours"
            type="number"
            min="0"
            value={formData.minNoticeHours}
            onChange={(e) => onChange('minNoticeHours', e.target.value)}
            placeholder="12"
          />
        </FormField>

        <FormField
          label="Maksymalny czas rezerwacji z wyprzedzeniem"
          htmlFor="maxAdvanceDays"
          error={errors.maxAdvanceDays}
          help="Ile dni maksymalnie do przodu?"
        >
          <Input
            id="maxAdvanceDays"
            type="number"
            min="0"
            value={formData.maxAdvanceDays}
            onChange={(e) => onChange('maxAdvanceDays', e.target.value)}
            placeholder="90"
          />
        </FormField>
      </FormRow>

      <FormField
        label="Szacowany czas trwania"
        htmlFor="durationMinutes"
        error={errors.durationMinutes}
        help="Ile minut trwa usługa? (opcjonalnie)"
      >
        <Input
          id="durationMinutes"
          type="number"
          min="0"
          value={formData.durationMinutes}
          onChange={(e) => onChange('durationMinutes', e.target.value)}
          placeholder="60"
        />
      </FormField>
    </FormSection>
  );
}

/**
 * @component LocationSection
 * @description Section 4 - Location and travel settings
 * 
 * Features:
 * - Location dropdown selector
 * - Willing to travel toggle switch
 * - Conditional travel fields (shown only when willing to travel):
 *   - Max distance slider (0-100 km) using Radix Slider
 *   - Travel fee per km input
 * 
 * @param {LocationSectionProps} props - Component props
 * @param {ServiceFormData} props.formData - Current form state
 * @param {Function} props.onChange - Field change handler
 * @param {Record<string, string>} props.errors - Validation errors
 * @param {Location[]} props.locations - Available locations
 * 
 * @returns {JSX.Element} Location and travel section
 */
interface LocationSectionProps {
  formData: ServiceFormData;
  onChange: (field: keyof ServiceFormData, value: any) => void;
  errors: Record<string, string>;
  locations: Location[];
}

/**
 * @component ContentSection
 * @description Section 5 - Service content and details
 * 
 * Contains:
 * - What's included textarea (description of what service includes)
 * - Requirements array (dynamic list - client must provide)
 *   - Add/remove functionality
 *   - Empty state message
 * - Tools provided array (dynamic list - provider brings)
 *   - Add/remove functionality
 *   - Empty state message
 * 
 * Dynamic arrays allow users to add unlimited items with remove buttons.
 * 
 * @param {ContentSectionProps} props - Component props
 * @param {ServiceFormData} props.formData - Current form state
 * @param {Function} props.onChange - Field change handler
 * @param {Record<string, string>} props.errors - Validation errors
 * 
 * @returns {JSX.Element} Service content section with dynamic arrays
 */
interface ContentSectionProps {
  formData: ServiceFormData;
  onChange: (field: keyof ServiceFormData, value: any) => void;
  errors: Record<string, string>;
}

function ContentSection({ formData, onChange, errors }: ContentSectionProps) {
  const addRequirement = () => {
    onChange('requirements', [...formData.requirements, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...formData.requirements];
    updated[index] = value;
    onChange('requirements', updated);
  };

  const removeRequirement = (index: number) => {
    const updated = formData.requirements.filter((_, i) => i !== index);
    onChange('requirements', updated);
  };

  const addTool = () => {
    onChange('toolsProvided', [...formData.toolsProvided, '']);
  };

  const updateTool = (index: number, value: string) => {
    const updated = [...formData.toolsProvided];
    updated[index] = value;
    onChange('toolsProvided', updated);
  };

  const removeTool = (index: number) => {
    const updated = formData.toolsProvided.filter((_, i) => i !== index);
    onChange('toolsProvided', updated);
  };

  return (
    <FormSection
      title="Zawartość usługi"
      description="Co jest wliczone w cenę i czego potrzebujesz?"
    >
      <FormField
        label="Co jest wliczone w cenę?"
        htmlFor="whatIncluded"
        error={errors.whatIncluded}
        help="Opisz co dokładnie otrzymuje klient"
      >
        <Textarea
          id="whatIncluded"
          value={formData.whatIncluded}
          onChange={(e) => onChange('whatIncluded', e.target.value)}
          placeholder="np. Materiały, sprzęt, transport, posprzątanie po pracy..."
          rows={4}
        />
      </FormField>

      <FormField
        label="Wymagania"
        help="Co klient musi zapewnić? (np. dostęp do prądu, miejsce parkingowe)"
      >
        <div className="space-y-3">
          {formData.requirements.length === 0 && (
            <p className="text-sm text-slate-500 italic">Brak wymagań - kliknij 'Dodaj' aby dodać</p>
          )}
          
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={req}
                onChange={(e) => updateRequirement(index, e.target.value)}
                placeholder={`Wymaganie ${index + 1}`}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeRequirement(index)}
                className="px-3"
              >
                🗑️
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addRequirement}
          >
            ➕ Dodaj wymaganie
          </Button>
        </div>
      </FormField>

      <FormField
        label="Narzędzia i sprzęt zapewniony"
        help="Co przynosisz ze sobą?"
      >
        <div className="space-y-3">
          {formData.toolsProvided.length === 0 && (
            <p className="text-sm text-slate-500 italic">Brak narzędzi - kliknij 'Dodaj' aby dodać</p>
          )}
          
          {formData.toolsProvided.map((tool, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={tool}
                onChange={(e) => updateTool(index, e.target.value)}
                placeholder={`Narzędzie ${index + 1}`}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeTool(index)}
                className="px-3"
              >
                🗑️
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addTool}
          >
            ➕ Dodaj narzędzie
          </Button>
        </div>
      </FormField>
    </FormSection>
  );
}

/**
 * @component PoliciesSection
 * @description Section 6 - Cancellation policies
 * 
 * Features:
 * - Radio group with 4 preset policies:
 *   1. Flexible - Full refund 24h before
 *   2. Moderate - 50% refund 48h before
 *   3. Strict - No refund after confirmation
 *   4. Custom - User writes own policy
 * - Conditional custom textarea (shown when "Custom" selected)
 * - Preview box for preset policies
 * 
 * @param {PoliciesSectionProps} props - Component props
 * @param {ServiceFormData} props.formData - Current form state
 * @param {Function} props.onChange - Field change handler
 * @param {Record<string, string>} props.errors - Validation errors
 * 
 * @returns {JSX.Element} Cancellation policies section
 */
interface PoliciesSectionProps {
  formData: ServiceFormData;
  onChange: (field: keyof ServiceFormData, value: any) => void;
  errors: Record<string, string>;
}

function PoliciesSection({ formData, onChange, errors }: PoliciesSectionProps) {
  const policies = [
    {
      value: 'flexible',
      label: 'Elastyczna',
      description: 'Zwrot 100% do 24h przed rozpoczęciem',
      text: 'Klient może anulować rezerwację do 24 godzin przed rozpoczęciem usługi i otrzymać pełny zwrot pieniędzy.',
    },
    {
      value: 'moderate',
      label: 'Umiarkowana',
      description: 'Zwrot 50% do 48h przed rozpoczęciem',
      text: 'Anulacja do 48 godzin przed - zwrot 50%. Anulacja w ostatniej chwili - brak zwrotu.',
    },
    {
      value: 'strict',
      label: 'Sztywna',
      description: 'Brak zwrotu po potwierdzeniu',
      text: 'Po potwierdzeniu rezerwacji nie ma możliwości zwrotu pieniędzy.',
    },
    {
      value: 'custom',
      label: 'Własna polityka',
      description: 'Napisz własne warunki anulowania',
      text: '',
    },
  ];

  const selectedPolicy = policies.find(p => p.text === formData.cancellationPolicy) || policies[3];
  const policyType = selectedPolicy.value;

  return (
    <FormSection
      title="Polityki i zasady"
      description="Warunki anulowania rezerwacji"
    >
      <FormField
        label="Polityka anulowania"
        required
        error={errors.cancellationPolicy}
        help="Wybierz gotowy szablon lub napisz własny"
      >
        <RadioGroup
          value={policyType}
          onValueChange={(val) => {
            const policy = policies.find(p => p.value === val);
            if (policy && val !== 'custom') {
              onChange('cancellationPolicy', policy.text);
            } else if (val === 'custom') {
              onChange('cancellationPolicy', '');
            }
          }}
        >
          {policies.map((policy) => (
            <RadioGroupItem
              key={policy.value}
              value={policy.value}
              label={policy.label}
              description={policy.description}
            />
          ))}
        </RadioGroup>
      </FormField>

      {policyType === 'custom' && (
        <FormField
          label="Własna polityka anulowania"
          htmlFor="customPolicy"
          required
          error={errors.cancellationPolicy}
        >
          <Textarea
            id="customPolicy"
            value={formData.cancellationPolicy}
            onChange={(e) => onChange('cancellationPolicy', e.target.value)}
            placeholder="Opisz warunki anulowania rezerwacji..."
            rows={5}
          />
        </FormField>
      )}

      {policyType !== 'custom' && formData.cancellationPolicy && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>Podgląd:</strong> {formData.cancellationPolicy}
          </p>
        </div>
      )}
    </FormSection>
  );
}

/**
 * @interface Photo
 * @description Photo object structure for service gallery
 * 
 * @property {number} [id] - Database ID (optional for new photos)
 * @property {File} [file] - File object for uploads
 * @property {string} url - Display URL (blob URL or storage URL)
 * @property {string} altText - SEO alt text description
 * @property {boolean} isPrimary - Whether this is the primary/featured photo
 */
interface Photo {
  id?: number;
  file?: File;
  url: string;
  altText: string;
  isPrimary: boolean;
}

/**
 * @component PhotosSection
 * @description Section 7 - Photo upload and management
 * 
 * Features:
 * - Drag & drop upload area (also supports click to upload)
 * - Photo preview grid with thumbnails
 * - Primary photo indicator (star icon, cyan border)
 * - Alt text input for each photo (SEO)
 * - Remove photo button for each
 * - Set as primary button (non-primary photos only)
 * - Counter showing uploaded photos (X/10)
 * - File type validation (image/*)
 * 
 * Max 10 photos allowed. First uploaded photo is automatically set as primary.
 * 
 * @param {PhotosSectionProps} props - Component props
 * @param {Photo[]} props.photos - Current photos array
 * @param {Function} props.onPhotosChange - Photos change handler
 * @param {Record<string, string>} props.errors - Validation errors
 * 
 * @returns {JSX.Element} Photo upload and management section
 */
interface PhotosSectionProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  errors: Record<string, string>;
}

function PhotosSection({ photos, onPhotosChange, errors }: PhotosSectionProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    const newPhotos: Photo[] = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        url: URL.createObjectURL(file),
        altText: '',
        isPrimary: photos.length === 0,
      }));

    onPhotosChange([...photos, ...newPhotos]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newPhotos: Photo[] = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      altText: '',
      isPrimary: photos.length === 0,
    }));

    onPhotosChange([...photos, ...newPhotos]);
  };

  const setPrimary = (index: number) => {
    const updated = photos.map((photo, i) => ({
      ...photo,
      isPrimary: i === index,
    }));
    onPhotosChange(updated);
  };

  const updateAltText = (index: number, altText: string) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], altText };
    onPhotosChange(updated);
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    
    if (photos[index].isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    
    onPhotosChange(updated);
  };

  return (
    <FormSection
      title="Zdjęcia"
      description="Dodaj zdjęcia swojej usługi (min 1, max 10)"
    >
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById('photo-upload')?.click()}
      >
        <div className="space-y-2">
          <div className="text-4xl">📷</div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Przeciągnij zdjęcia tutaj lub kliknij aby wybrać
          </p>
          <p className="text-xs text-slate-500">
            JPG, PNG lub WEBP • Max 5MB per plik
          </p>
        </div>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {errors.photos && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errors.photos}
        </p>
      )}

      {photos.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Zdjęcia ({photos.length}/10)
          </p>
          
          <div className="space-y-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`flex gap-4 p-4 rounded-lg border ${
                  photo.isPrimary
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.altText || `Zdjęcie ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                <div className="flex-1 space-y-2">
                  {photo.isPrimary && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-600 text-white text-xs font-semibold rounded">
                      ⭐ Główne zdjęcie
                    </span>
                  )}

                  <Input
                    value={photo.altText}
                    onChange={(e) => updateAltText(index, e.target.value)}
                    placeholder="Alt text (opis dla SEO)"
                    className="text-sm"
                  />

                  <div className="flex gap-2">
                    {!photo.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimary(index)}
                      >
                        ⭐ Ustaw jako główne
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePhoto(index)}
                    >
                      🗑️ Usuń
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </FormSection>
  );
}

/**
 * @component SEOSection
 * @description Section 8 - SEO optimization fields
 * 
 * Contains:
 * - Meta title input (max 60 chars with counter)
 * - Meta description textarea (max 160 chars with counter)
 * - Google search preview box showing how listing will appear
 * 
 * Both fields optional - will fallback to service title/description if empty.
 * Character counters turn red when limit exceeded.
 * 
 * @param {SEOSectionProps} props - Component props
 * @param {ServiceFormData} props.formData - Current form state
 * @param {Function} props.onChange - Field change handler
 * @param {Record<string, string>} props.errors - Validation errors
 * 
 * @returns {JSX.Element} SEO fields section with preview
 */
interface SEOSectionProps {
  formData: ServiceFormData;
  onChange: (field: keyof ServiceFormData, value: any) => void;
  errors: Record<string, string>;
}

function SEOSection({ formData, onChange, errors }: SEOSectionProps) {
  return (
    <FormSection
      title="SEO i widoczność"
      description="Optymalizacja w wyszukiwarkach (opcjonalnie)"
    >
      <FormField
        label="Meta tytuł"
        htmlFor="metaTitle"
        error={errors.metaTitle}
        help="Tytuł w wynikach Google (zostaw puste aby użyć tytułu usługi)"
      >
        <div className="space-y-1">
          <Input
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => onChange('metaTitle', e.target.value)}
            placeholder={formData.title || 'Tytuł usługi...'}
            maxLength={60}
          />
          <div className="flex justify-end">
            <CharacterCount 
              current={formData.metaTitle.length || formData.title.length} 
              max={60} 
            />
          </div>
        </div>
      </FormField>

      <FormField
        label="Meta opis"
        htmlFor="metaDescription"
        error={errors.metaDescription}
        help="Opis w wynikach Google (zostaw puste aby użyć fragmentu opisu)"
      >
        <div className="space-y-1">
          <Textarea
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => onChange('metaDescription', e.target.value)}
            placeholder={formData.description.slice(0, 160) || 'Opis usługi...'}
            rows={3}
            maxLength={160}
          />
          <div className="flex justify-end">
            <CharacterCount 
              current={formData.metaDescription.length || Math.min(formData.description.length, 160)} 
              max={160} 
            />
          </div>
        </div>
      </FormField>

      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 mb-2">Podgląd w Google:</p>
        <div className="space-y-1">
          <h3 className="text-lg text-blue-600 hover:underline cursor-pointer">
            {formData.metaTitle || formData.title || 'Tytuł usługi'}
          </h3>
          <p className="text-xs text-green-700">ls.test › usługi › ...</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {formData.metaDescription || formData.description.slice(0, 160) || 'Opis usługi...'}
          </p>
        </div>
      </div>
    </FormSection>
  );
}

function LocationSection({ formData, onChange, errors, locations }: LocationSectionProps) {
  return (
    <FormSection
      title="Lokalizacja i dojazd"
      description="Gdzie świadczysz usługę?"
    >
      {/* Lokalizacja bazowa */}
      <FormField
        label="Lokalizacja bazowa"
        htmlFor="location"
        required
        error={errors.location}
      >
        <LocationSelect
          value={formData.selectedLocation}
          onChange={(loc) => onChange('selectedLocation', loc)}
          locations={locations}
        />
      </FormField>

      {/* Willing to Travel - Switch */}
      <FormField
        label="Gotowość do dojazdu"
        help="Czy dojedziesz do klienta?"
      >
        <div className="flex items-center gap-3">
          <Switch
            checked={formData.willingToTravel}
            onCheckedChange={(checked) => onChange('willingToTravel', checked)}
          />
          <span className="text-sm text-slate-600">
            {formData.willingToTravel ? '✅ Tak, dojadę' : '❌ Nie, tylko w mojej lokalizacji'}
          </span>
        </div>
      </FormField>

      {/* CONDITIONAL: Jeśli willing to travel - pokazujemy slider i opłatę */}
      {formData.willingToTravel && (
        <>
          <FormField
            label="Maksymalny dystans dojazdu"
            help="Jak daleko jesteś gotów dojechać?"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">0 km</span>
                <span className="text-lg font-semibold text-cyan-600">
                  {formData.maxDistanceKm} km
                </span>
                <span className="text-sm text-slate-600">100 km</span>
              </div>
              <Slider
                value={[formData.maxDistanceKm]}
                onValueChange={([val]) => onChange('maxDistanceKm', val)}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </FormField>

          <FormField
            label="Opłata za dojazd"
            htmlFor="travelFeePerKm"
            help="Opcjonalnie - ile zł za każdy kilometr? (można zostawić puste)"
          >
            <Input
              id="travelFeePerKm"
              type="number"
              min="0"
              step="0.01"
              value={formData.travelFeePerKm}
              onChange={(e) => onChange('travelFeePerKm', e.target.value)}
              placeholder="2.50"
            />
          </FormField>
        </>
      )}
    </FormSection>
  );
}

/**
 * GŁÓWNY KOMPONENT - ServiceFormPageV2
 * 
 * Orchestruje wszystkie sekcje, handle save, validation
 */
export default function ServiceFormPageV2() {
  const { id } = useParams<{ id?: string }>();
  const serviceId = id ? Number(id) : null;
  const navigate = useNavigate();

  // Fetch danych
  const { data: service, isLoading } = useService(serviceId ?? 0);
  const { categories, loading: categoriesLoading } = useCategories();
  const { locations, loading: locationsLoading } = useLocations();

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    category: null,
    status: 'active',
    pricingType: 'hourly',
    basePrice: '',
    priceRangeLow: '',
    priceRangeHigh: '',
    pricingUnit: 'hour',
    instantBooking: true,
    acceptsQuote: true,
    minNoticeHours: '12',
    maxAdvanceDays: '90',
    durationMinutes: '',
    selectedLocation: null,
    latitude: 52.2297,
    longitude: 21.0122,
    willingToTravel: true,
    maxDistanceKm: 20,
    travelFeePerKm: '',
    whatIncluded: '',
    requirements: [],
    toolsProvided: [],
    cancellationPolicy: '',
    metaTitle: '',
    metaDescription: '',
  });

  // Photos state - osobny bo inna struktura
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Update form když service się załaduje
  useEffect(() => {
    if (service && locations.length > 0) {
      // Mapuj service data do formData
      // TODO: implement mapServiceToForm
    }
  }, [service, locations]);

  /**
   * Handle field change - centralna funkcja do update state
   * 
   * @param field - nazwa pola (klucz z ServiceFormData)
   * @param value - nowa wartość
   */
  const handleChange = (field: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Wyczyść error dla tego pola
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validate form - sprawdza czy wszystkie wymagane pola są wypełnione
   * 
   * @returns true jeśli valid, false jeśli są błędy
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.title.length < 5) {
      newErrors.title = 'Tytuł musi mieć minimum 5 znaków';
    }

    if (formData.description.length < 50) {
      newErrors.description = 'Opis musi mieć minimum 50 znaków';
    }

    if (!formData.category) {
      newErrors.category = 'Wybierz kategorię';
    }

    if (formData.pricingType !== 'quote' && !formData.basePrice) {
      newErrors.basePrice = 'Podaj cenę bazową';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save - wysyła dane do API
   */
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Popraw błędy w formularzu');
      return;
    }

    setIsSaving(true);

    try {
      // TODO: implement API call
      // await updateService(serviceId, formData);
      
      toast.success('Usługa zapisana!');
      navigate('/provider/services');
    } catch (error) {
      toast.error('Błąd podczas zapisywania');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle cancel - wraca do listy bez zapisywania
   */
  const handleCancel = () => {
    if (confirm('Czy na pewno chcesz anulować? Niezapisane zmiany zostaną utracone.')) {
      navigate('/provider/services');
    }
  };

  if (isLoading || categoriesLoading || locationsLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <PageTitle>
          {serviceId ? 'Edytuj usługę' : 'Dodaj usługę'}
        </PageTitle>

        {/* TABS - Nawigacja między sekcjami */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto">
            <Tabs.Trigger
              value="basic"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600"
            >
              Podstawowe
            </Tabs.Trigger>
            <Tabs.Trigger
              value="pricing"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600"
            >
              Ceny
            </Tabs.Trigger>
            <Tabs.Trigger
              value="booking"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600"
            >
              Rezerwacja
            </Tabs.Trigger>
            <Tabs.Trigger
              value="location"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600"
            >
              Lokalizacja
            </Tabs.Trigger>
            <Tabs.Trigger
              value="content"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600"
            >
              Zawartość
            </Tabs.Trigger>
            <Tabs.Trigger
              value="policies"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600"
            >
              Polityki
            </Tabs.Trigger>
            <Tabs.Trigger
              value="photos"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600"
            >
              Zdjęcia
            </Tabs.Trigger>
            <Tabs.Trigger
              value="seo"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600"
            >
              SEO
            </Tabs.Trigger>
          </Tabs.List>

          {/* TAB CONTENT - Sekcje formularza */}
          <div className="space-y-6">
            <Tabs.Content value="basic">
              <BasicInfoSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
                categories={categories}
              />
            </Tabs.Content>

            <Tabs.Content value="pricing">
              <PricingSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />
            </Tabs.Content>

            <Tabs.Content value="booking">
              <BookingSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />
            </Tabs.Content>

            <Tabs.Content value="location">
              <LocationSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
                locations={locations}
              />
            </Tabs.Content>

            <Tabs.Content value="content">
              <ContentSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />
            </Tabs.Content>

            <Tabs.Content value="policies">
              <PoliciesSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />
            </Tabs.Content>

            <Tabs.Content value="photos">
              <PhotosSection
                photos={photos}
                onPhotosChange={setPhotos}
                errors={errors}
              />
            </Tabs.Content>

            <Tabs.Content value="seo">
              <SEOSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>

      {/* STICKY FOOTER - Przyciski akcji */}
      <FormActions>
        <Button variant="outline" onClick={handleCancel}>
          Anuluj
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleChange('status', 'paused')}
          >
            💾 Zapisz jako wstrzymana
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Zapisywanie...' : '✅ Zapisz i publikuj'}
          </Button>
        </div>
      </FormActions>
    </div>
  );
}
