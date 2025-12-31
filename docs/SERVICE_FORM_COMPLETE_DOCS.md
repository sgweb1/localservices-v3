# ServiceFormPageV2 - Complete Documentation

## Overview

**ServiceFormPageV2** is a comprehensive form component for creating and editing provider services. It features 8 tabbed sections built with Radix UI primitives for maximum accessibility and user experience.

**URL**: `https://ls.test/provider/services/edit/:id`  
**Route**: `/provider/services/edit/:id`  
**Access**: Provider role required (authenticated with Sanctum)

## Architecture

### Component Hierarchy

```
ServiceFormPageV2 (Main Container)
├── Header
│   ├── Back Button (← Powrót do listy)
│   └── PageTitle (Edytuj usługę)
├── Tabs.Root (Radix Tabs)
│   ├── Tabs.List (8 tab triggers)
│   └── Tabs.Content (8 sections)
│       ├── 1. BasicInfoSection
│       ├── 2. PricingSection
│       ├── 3. BookingSection
│       ├── 4. LocationSection
│       ├── 5. ContentSection
│       ├── 6. PoliciesSection
│       ├── 7. PhotosSection
│       └── 8. SEOSection
└── FormActions (Sticky Footer)
    ├── Cancel Button
    ├── Save as Paused Button
    └── Save & Publish Button
```

### State Management

The form uses **centralized state management** with two main state objects:

1. **`formData`** (ServiceFormData interface) - All text/boolean/number fields
2. **`photos`** (Photo[] array) - Separate due to file handling complexity

```typescript
const [formData, setFormData] = useState<ServiceFormData>({ /* 22 fields */ });
const [photos, setPhotos] = useState<Photo[]>([]);
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSaving, setIsSaving] = useState(false);
```

### Key Patterns

#### 1. Centralized Change Handler

All form fields use a single `handleChange` function:

```typescript
const handleChange = (field: keyof ServiceFormData, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Auto-clear error when field changes
  if (errors[field]) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }
};
```

**Benefits**:
- Type-safe field updates (TypeScript knows valid field names)
- Automatic error clearing on change
- Single source of truth
- Easy to track all changes

#### 2. Conditional Rendering

Fields appear/disappear based on other field values:

```typescript
// Example 1: Pricing fields based on pricing type
{pricingType === 'quote' && (
  <FormRow>
    <FormField label="Cena od">...</FormField>
    <FormField label="Cena do">...</FormField>
  </FormRow>
)}

// Example 2: Travel fields based on willing to travel
{willingToTravel && (
  <>
    <Slider value={maxDistanceKm} />
    <Input value={travelFeePerKm} />
  </>
)}
```

#### 3. Dynamic Arrays

Requirements and tools are managed as arrays with add/remove:

```typescript
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
```

## Form Sections

### 1. Basic Information (BasicInfoSection)

**Fields**:
- Title (5-100 chars, required) - Character counter
- Description (min 50 chars, required) - Character counter
- Category (dropdown, required)
- Status (dropdown) - active/paused/draft

**Validation**:
- Title: min 5, max 100 characters
- Description: min 50 characters
- Category: required

### 2. Pricing (PricingSection)

**Fields**:
- Pricing Type (radio group):
  - Hourly - shows base price field
  - Fixed - shows base price field
  - Quote - shows price range (low/high)
- Pricing Unit (hour/day/project)

**Validation**:
- Base price: required for hourly/fixed
- Price range: both low and high required for quote

**Conditional Logic**:
```typescript
{pricingType !== 'quote' && (
  <FormField label="Cena bazowa">
    <Input type="number" value={basePrice} />
  </FormField>
)}

{pricingType === 'quote' && (
  <FormRow>
    <FormField label="Cena od">...</FormField>
    <FormField label="Cena do">...</FormField>
  </FormRow>
)}
```

### 3. Booking (BookingSection)

**Fields**:
- Instant Booking (switch) - Allow direct booking
- Accept Quote Requests (switch)
- Min Notice Hours (number)
- Max Advance Days (number)
- Duration Minutes (number)

**Switches**: Use Radix Switch with green accent when enabled

### 4. Location (LocationSection)

**Fields**:
- Location (dropdown from API)
- Willing to Travel (switch)
- Max Distance (slider, 0-100 km) - **Conditional**
- Travel Fee per km (number) - **Conditional**

**Radix Component**: Uses `<Slider>` for distance (smooth UX)

**Conditional Display**:
Only shows distance/fee when `willingToTravel === true`

### 5. Content (ContentSection)

**Fields**:
- What's Included (textarea)
- Requirements (dynamic array)
  - Add/remove buttons
  - Empty state message
- Tools Provided (dynamic array)
  - Add/remove buttons
  - Empty state message

**Dynamic Array UI**:
```tsx
{formData.requirements.map((req, index) => (
  <div key={index} className="flex gap-2">
    <Input value={req} onChange={...} />
    <Button onClick={() => removeRequirement(index)}>🗑️</Button>
  </div>
))}
<Button onClick={addRequirement}>➕ Dodaj</Button>
```

### 6. Policies (PoliciesSection)

**Fields**:
- Cancellation Policy (radio group with 4 presets):
  1. **Flexible** - Full refund 24h before
  2. **Moderate** - 50% refund 48h before
  3. **Strict** - No refund after confirmation
  4. **Custom** - User writes own policy

**Conditional Custom Textarea**:
Only shown when "Custom" policy selected

**Preview Box**:
Shows policy text for preset options (not shown for custom)

### 7. Photos (PhotosSection)

**Features**:
- Drag & drop upload area
- Click to upload fallback
- Photo preview grid (20x20 thumbnails)
- Alt text input (SEO)
- Primary photo selection (⭐ indicator)
- Remove photo button
- Max 10 photos
- First photo auto-primary

**Photo Object**:
```typescript
interface Photo {
  id?: number;           // DB ID (optional for new)
  file?: File;           // File for upload
  url: string;           // Display URL (blob/storage)
  altText: string;       // SEO description
  isPrimary: boolean;    // Featured photo flag
}
```

**Upload Flow**:
1. User drops files or clicks upload
2. Files converted to Photo objects with blob URLs
3. First photo marked as primary
4. User can change primary, add alt text
5. On save, photos uploaded to storage

### 8. SEO (SEOSection)

**Fields**:
- Meta Title (max 60 chars, optional)
- Meta Description (max 160 chars, optional)
- Google Search Preview (live preview box)

**Character Counters**:
- Turn red when limit exceeded
- Show current/max (e.g., "54 / 60")

**Preview Box**:
Shows how service appears in Google results:
- Blue clickable title
- Green URL breadcrumb
- Gray description text

## Form Validation

### Client-Side Validation

Runs before API submission via `validateForm()`:

```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  // Title validation
  if (formData.title.length < 5) {
    newErrors.title = 'Tytuł musi mieć min. 5 znaków';
  }
  if (formData.title.length > 100) {
    newErrors.title = 'Tytuł może mieć max. 100 znaków';
  }

  // Description validation
  if (formData.description.length < 50) {
    newErrors.description = 'Opis musi mieć min. 50 znaków';
  }

  // Category validation
  if (!formData.category) {
    newErrors.category = 'Kategoria jest wymagana';
  }

  // Pricing validation
  if (formData.pricingType !== 'quote' && !formData.basePrice) {
    newErrors.basePrice = 'Cena bazowa jest wymagana';
  }
  
  if (formData.pricingType === 'quote') {
    if (!formData.priceRangeLow) {
      newErrors.priceRangeLow = 'Cena od jest wymagana';
    }
    if (!formData.priceRangeHigh) {
      newErrors.priceRangeHigh = 'Cena do jest wymagana';
    }
  }

  // Cancellation policy
  if (!formData.cancellationPolicy) {
    newErrors.cancellationPolicy = 'Polityka anulowania jest wymagana';
  }

  // Photos
  if (photos.length === 0) {
    newErrors.photos = 'Dodaj co najmniej 1 zdjęcie';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Server-Side Validation

Backend validates in `ServiceController`:
- All client validations repeated
- Additional database constraints
- File size/type validation for photos
- Slug uniqueness check

## API Integration

### Endpoints

**Fetch Service**:
```
GET /api/v1/provider/services/{id}
```

**Update Service**:
```
PUT /api/v1/provider/services/{id}
Content-Type: application/json
```

**Upload Photos**:
```
POST /api/v1/provider/services/{id}/photos
Content-Type: multipart/form-data
```

### Data Flow

1. **Load** (if editing):
   - Fetch service from API via React Query
   - Map API response to formData
   - Load existing photos

2. **Change**:
   - User updates field → `handleChange(field, value)`
   - formData updated
   - Error cleared for that field

3. **Validate**:
   - User clicks save → `validateForm()`
   - Returns boolean + sets errors object
   - Errors displayed under fields

4. **Save**:
   - If valid → `handleSave()`
   - POST/PUT to API
   - Upload photos separately
   - Toast success/error message
   - Navigate on success

## Testing

### Frontend Tests (Vitest)

**File**: `ServiceFormPageV2.test.tsx`

**Coverage**: 25+ test cases
- Component rendering (all tabs present)
- Form field updates (title, description, etc.)
- Validation (min length, max length, required)
- Tab navigation (switch between sections)
- Conditional rendering (pricing fields, travel fields)
- Dynamic arrays (add/remove requirements/tools)
- Photo upload and management
- Policy selection (presets + custom)
- SEO character limits
- Form submission flow

**Run Tests**:
```bash
npm test ServiceFormPageV2
```

### Backend Tests (PHPUnit)

**File**: `tests/Feature/Api/V1/Provider/ServiceControllerTest.php`

**Coverage**: 30+ test cases
- Authentication/authorization
- CRUD operations (create, read, update, delete)
- Validation rules for all fields
- Pricing type validation
- Photo upload and management
- Primary photo logic
- Travel settings validation
- SEO field limits
- Bulk operations
- Slug generation and uniqueness

**Run Tests**:
```bash
php artisan test --filter=ServiceControllerTest
```

## Usage Examples

### Navigate to Form

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Edit existing service
navigate(`/provider/services/edit/${serviceId}`);

// From ServiceCard component
<Link to={`/provider/services/edit/${service.id}`}>
  Edytuj
</Link>
```

### Custom Validation

```typescript
// Add custom validation in validateForm()
if (formData.basePrice && parseFloat(formData.basePrice) < 10) {
  newErrors.basePrice = 'Minimalna cena to 10 zł';
}
```

### Extend with New Section

1. Create section component:
```typescript
interface MySectionProps {
  formData: ServiceFormData;
  onChange: (field: keyof ServiceFormData, value: any) => void;
  errors: Record<string, string>;
}

function MySection({ formData, onChange, errors }: MySectionProps) {
  return (
    <FormSection title="Moja sekcja">
      <FormField label="Pole">
        <Input 
          value={formData.myField}
          onChange={(e) => onChange('myField', e.target.value)}
        />
      </FormField>
    </FormSection>
  );
}
```

2. Add tab trigger:
```tsx
<Tabs.Trigger value="mysection">Moja Sekcja</Tabs.Trigger>
```

3. Add tab content:
```tsx
<Tabs.Content value="mysection">
  <MySection formData={formData} onChange={handleChange} errors={errors} />
</Tabs.Content>
```

4. Update ServiceFormData interface:
```typescript
interface ServiceFormData {
  // ... existing fields
  myField: string;
}
```

## Performance Considerations

### Optimizations

1. **React Query Caching**: Service data cached, prevents redundant fetches
2. **Debounced Validation**: Only validates on save, not on every keystroke
3. **Lazy Photo Loading**: Photos load as blob URLs, not base64
4. **Conditional Rendering**: Unused fields not in DOM (not just hidden)

### Bundle Size

- Radix UI: Tree-shakeable, only imports used components
- Form components: Small (~5KB total)
- TypeScript: Zero runtime overhead (compiles away)

## Accessibility

All fields follow WCAG 2.1 Level AA:

- ✅ Proper `<label>` with `htmlFor` on all inputs
- ✅ Error messages with `aria-describedby`
- ✅ Required indicator (red asterisk)
- ✅ Keyboard navigation (tab order logical)
- ✅ Focus visible styles
- ✅ Color contrast 4.5:1 minimum
- ✅ Screen reader friendly (semantic HTML)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

Potential improvements:

1. **Auto-save**: Draft saved every 30s
2. **Unsaved Changes Warning**: Prompt before navigation
3. **Map Integration**: Visual location picker with Leaflet
4. **Photo Reordering**: Drag to reorder gallery
5. **Rich Text Editor**: For description field (Tiptap)
6. **Preview Mode**: See how service looks to customers
7. **Duplicate Service**: Clone existing service
8. **Templates**: Save/load form templates

## Troubleshooting

### Photos not uploading
- Check file size (max 5MB)
- Verify file type (image/*)
- Check storage permissions

### Validation errors not clearing
- Ensure `handleChange` calls error clearing logic
- Check field name matches key in errors object

### Tabs not switching
- Verify Radix Tabs value prop matches trigger/content values
- Check for JavaScript errors in console

### Form not submitting
- Open DevTools Network tab
- Check API response for validation errors
- Verify authentication token present

## Related Files

**Components**:
- `src/components/ui/form.tsx` - Form wrapper components
- `src/components/ui/radio-group.tsx` - Radix RadioGroup
- `src/components/ui/slider.tsx` - Radix Slider
- `src/components/ui/switch.tsx` - Radix Switch
- `src/components/ui/tabs.tsx` - Radix Tabs

**Hooks**:
- `src/features/provider/hooks/useService.ts` - Service data fetching
- `src/hooks/useCategories.ts` - Categories list
- `src/hooks/useLocations.ts` - Locations list

**Types**:
- `src/types/service.ts` - Service interfaces
- `src/types/location.ts` - Location interfaces

**Backend**:
- `app/Http/Controllers/Api/V1/Provider/ServiceController.php` - API controller
- `app/Models/Service.php` - Service model
- `app/Models/ServicePhoto.php` - Photo model

**Documentation**:
- `docs/SERVICE_FORM_V2.md` - Detailed implementation guide
- `docs/index.html` - TypeDoc generated docs

## License

MIT

## Contributing

When modifying this form:
1. Update TypeScript types first
2. Add JSDoc comments to new functions
3. Write tests for new fields/validation
4. Update this documentation
5. Test on mobile (responsive design)
6. Run `npm run docs` to regenerate TypeDoc

---

**Last Updated**: 2024-12-31  
**Version**: 2.0  
**Author**: Claude AI Assistant
