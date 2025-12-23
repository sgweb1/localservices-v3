import React, { useEffect, useMemo, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useService, type ServiceDetail } from '../dashboard/hooks/useService';
import { useCategories } from '@/hooks/useCategories';
import { useLocations } from '@/hooks/useLocations';
import { useAuth } from '@/contexts/AuthContext';
import { CategorySelect } from '@/components/CategorySelect';
import { LocationSelect } from '@/components/LocationSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PageTitle, Text } from '@/components/ui/typography';
import type { ServiceCategory } from '@/types/service';
import type { Location } from '@/types/location';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ls.test';
const defaultLat = 52.2297;
const defaultLng = 21.0122;

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowAnchor: [13, 41],
});

type PhotoItem = {
  id: number;
  url: string;
  alt_text?: string | null;
  is_primary: boolean;
  position: number;
};

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').trim();

const linesToArray = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean);

const numberOrNull = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const mapServiceToForm = (service: ServiceDetail, locations: Location[]) => {
  const matchedLocation = service.location_id
    ? locations.find((loc) => loc.id === service.location_id) ?? null
    : null;

  return {
    title: service.title ?? '',
    description: service.description ?? '',
    category: service.category_id ? ({ id: service.category_id } as ServiceCategory) : null,
    pricingType: (service.pricing_type as 'hourly' | 'fixed' | 'quote') ?? 'hourly',
    basePrice: service.base_price ? String(service.base_price) : '',
    priceRangeLow: service.price_range_low ? String(service.price_range_low) : '',
    priceRangeHigh: service.price_range_high ? String(service.price_range_high) : '',
    pricingUnit: service.pricing_unit ?? 'service',
    instantBooking: Boolean(service.instant_booking ?? true),
    acceptsQuote: Boolean(service.accepts_quote_requests ?? true),
    minNotice: service.min_notice_hours ? String(service.min_notice_hours) : '12',
    maxAdvance: service.max_advance_days ? String(service.max_advance_days) : '',
    duration: service.duration_minutes ? String(service.duration_minutes) : '',
    selectedLocation: matchedLocation,
    latitude: service.latitude ? String(service.latitude) : String(defaultLat),
    longitude: service.longitude ? String(service.longitude) : String(defaultLng),
    maxDistanceKm: service.max_distance_km ? String(service.max_distance_km) : '20',
    willingToTravel: Boolean(service.willing_to_travel ?? true),
    travelFeePerKm: service.travel_fee_per_km ? String(service.travel_fee_per_km) : '',
    whatIncluded: service.what_included ?? '',
    requirementsText: Array.isArray(service.requirements) ? service.requirements.join('\n') : '',
    toolsText: Array.isArray(service.tools_provided) ? service.tools_provided.join('\n') : '',
    metaTitle: service.meta_title ?? '',
    metaDescription: service.meta_description ?? '',
    status: service.status === 'paused' ? 'paused' : 'active',
    photos: Array.isArray(service.photos)
      ? service.photos.map((p) => ({
          id: p.id,
          url: p.url,
          alt_text: p.alt_text,
          is_primary: Boolean(p.is_primary),
          position: Number(p.position ?? 0),
        }))
      : [],
  };
};

const ServiceFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const serviceId = id ? Number(id) : null;
  const mode: 'create' | 'edit' = serviceId ? 'edit' : 'create';
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: service, isLoading } = useService(serviceId ?? 0);
  const { categories, loading: categoriesLoading } = useCategories();
  const { locations, loading: locationsLoading } = useLocations();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [pricingType, setPricingType] = useState<'hourly' | 'fixed' | 'quote'>('hourly');
  const [basePrice, setBasePrice] = useState('');
  const [priceRangeLow, setPriceRangeLow] = useState('');
  const [priceRangeHigh, setPriceRangeHigh] = useState('');
  const [pricingUnit, setPricingUnit] = useState('service');
  const [instantBooking, setInstantBooking] = useState(true);
  const [acceptsQuote, setAcceptsQuote] = useState(true);
  const [minNotice, setMinNotice] = useState('12');
  const [maxAdvance, setMaxAdvance] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [latitude, setLatitude] = useState(String(defaultLat));
  const [longitude, setLongitude] = useState(String(defaultLng));
  const [maxDistanceKm, setMaxDistanceKm] = useState('20');
  const [willingToTravel, setWillingToTravel] = useState(true);
  const [travelFeePerKm, setTravelFeePerKm] = useState('');
  const [whatIncluded, setWhatIncluded] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [toolsText, setToolsText] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotosAlt, setNewPhotosAlt] = useState<Record<number, string>>({});
  const [existingPhotos, setExistingPhotos] = useState<PhotoItem[]>([]);
  const [draggingPhotoId, setDraggingPhotoId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);
  const [draggingNewPhotoIdx, setDraggingNewPhotoIdx] = useState<number | null>(null);
  const [dropTargetNewIdx, setDropTargetNewIdx] = useState<number | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const quillRef = useRef<Quill | null>(null);
  const quillContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const effectiveProviderId = service?.provider_id ?? user?.id ?? null;

  useEffect(() => {
    if (service && locations.length > 0) {
      const mapped = mapServiceToForm(service, locations);
      setTitle(mapped.title);
      setDescription(mapped.description);
      setCategory(mapped.category);
      setPricingType(mapped.pricingType);
      setBasePrice(mapped.basePrice);
      setPriceRangeLow(mapped.priceRangeLow);
      setPriceRangeHigh(mapped.priceRangeHigh);
      setPricingUnit(mapped.pricingUnit);
      setInstantBooking(mapped.instantBooking);
      setAcceptsQuote(mapped.acceptsQuote);
      setMinNotice(mapped.minNotice);
      setMaxAdvance(mapped.maxAdvance);
      setDuration(mapped.duration);
      setSelectedLocation(mapped.selectedLocation);
      setLatitude(mapped.latitude);
      setLongitude(mapped.longitude);
      setMaxDistanceKm(mapped.maxDistanceKm);
      setWillingToTravel(mapped.willingToTravel);
      setTravelFeePerKm(mapped.travelFeePerKm);
      setWhatIncluded(mapped.whatIncluded);
      setRequirementsText(mapped.requirementsText);
      setToolsText(mapped.toolsText);
      setMetaTitle(mapped.metaTitle);
      setMetaDescription(mapped.metaDescription);
      setStatus(mapped.status === 'paused' ? 'paused' : 'active');
      setExistingPhotos(mapped.photos.sort((a, b) => a.position - b.position));
    }
  }, [service, locations]);

  useEffect(() => {
    if (quillRef.current || !quillContainerRef.current) return;

    quillRef.current = new Quill(quillContainerRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ header: [2, 3, false] }],
          ['clean'],
        ],
      },
      placeholder: 'Opisz usługę (min. 50 znaków)...',
    });

    const quill = quillRef.current;
    const handleChange = () => setDescription(quill.root.innerHTML);

    quill.on('text-change', handleChange);

    return () => {
      quill.off('text-change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (!quillRef.current || !quillContainerRef.current) return;
    const currentHtml = quillRef.current.root.innerHTML;
    if (description && description !== currentHtml) {
      quillRef.current.clipboard.dangerouslyPasteHTML(description);
    }
  }, [description]);

  const pageTitle = useMemo(() => (mode === 'create' ? 'Dodaj usługę' : 'Edytuj usługę'), [mode]);

  const handleIncomingFiles = (files: File[]) => {
    if (!files.length) return;
    setNewPhotos((prev) => [...prev, ...files]);
  };

  const moveNewPhoto = (fromIdx: number, direction: 'up' | 'down') => {
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= newPhotos.length) return;
    const newList = [...newPhotos];
    [newList[fromIdx], newList[toIdx]] = [newList[toIdx], newList[fromIdx]];
    setNewPhotos(newList);
    
    const newAlt = { ...newPhotosAlt };
    const tempAlt = newAlt[fromIdx];
    newAlt[fromIdx] = newAlt[toIdx];
    newAlt[toIdx] = tempAlt;
    setNewPhotosAlt(newAlt);
  };

  const removeNewPhoto = (idx: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== idx));
    const newAlt = { ...newPhotosAlt };
    delete newAlt[idx];
    const reindexed: Record<number, string> = {};
    Object.keys(newAlt).forEach((key) => {
      const oldIdx = Number(key);
      const newIdx = oldIdx > idx ? oldIdx - 1 : oldIdx;
      if (newAlt[oldIdx]) reindexed[newIdx] = newAlt[oldIdx];
    });
    setNewPhotosAlt(reindexed);
  };

  const onNewPhotoDrop = (targetIdx: number) => {
    if (draggingNewPhotoIdx === null || draggingNewPhotoIdx === targetIdx) return;
    const newList = [...newPhotos];
    const [moved] = newList.splice(draggingNewPhotoIdx, 1);
    newList.splice(targetIdx, 0, moved);
    setNewPhotos(newList);
    
    const oldAlt = newPhotosAlt[draggingNewPhotoIdx];
    const newAlt = { ...newPhotosAlt };
    delete newAlt[draggingNewPhotoIdx];
    const reindexed: Record<number, string> = {};
    newList.forEach((_, idx) => {
      if (idx === targetIdx) {
        if (oldAlt) reindexed[idx] = oldAlt;
      } else if (idx < targetIdx) {
        const origIdx = idx < draggingNewPhotoIdx ? idx : idx + 1;
        if (newAlt[origIdx]) reindexed[idx] = newAlt[origIdx];
      } else {
        const origIdx = idx <= draggingNewPhotoIdx ? idx : idx - 1;
        if (newAlt[origIdx]) reindexed[idx] = newAlt[origIdx];
      }
    });
    setNewPhotosAlt(reindexed);
  };

  const uploadNewPhotos = async (createdServiceId: number, createdProviderId: number | null) => {
    if (!createdProviderId || newPhotos.length === 0) {
      setNewPhotos([]);
      setNewPhotosAlt({});
      return;
    }

    for (let i = 0; i < newPhotos.length; i += 1) {
      const form = new FormData();
      form.append('photo', newPhotos[i]);
      const alt = newPhotosAlt[i];
      if (alt) form.append('alt_text', alt);

      const res = await fetch(`${API_BASE_URL}/api/v1/providers/${createdProviderId}/services/${createdServiceId}/photos`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });

      if (res.ok) {
        const payload = await res.json().catch(() => ({}));
        const photo = payload.photo;
        if (photo) {
          setExistingPhotos((prev) => [
            ...prev,
            {
              id: photo.id,
              url: photo.url,
              alt_text: photo.alt_text,
              is_primary: Boolean(photo.is_primary),
              position: Number(photo.position ?? prev.length + 1),
            },
          ].sort((a, b) => a.position - b.position));
        }
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.error || 'Nie udało się wysłać zdjęcia');
      }
    }

    setNewPhotos([]);
    setNewPhotosAlt({});
  };

  const submit = async () => {
    try {
      setIsSaving(true);

      const payload: Record<string, unknown> = {
        title,
        description,
        category_id: category?.id,
        pricing_type: pricingType,
        base_price: numberOrNull(basePrice),
        price_range_low: numberOrNull(priceRangeLow),
        price_range_high: numberOrNull(priceRangeHigh),
        pricing_unit: pricingUnit,
        instant_booking: instantBooking,
        accepts_quote_requests: acceptsQuote,
        min_notice_hours: numberOrNull(minNotice),
        max_advance_days: numberOrNull(maxAdvance),
        duration_minutes: numberOrNull(duration),
        location_id: selectedLocation?.id,
        latitude: numberOrNull(latitude),
        longitude: numberOrNull(longitude),
        max_distance_km: numberOrNull(maxDistanceKm),
        willing_to_travel: willingToTravel,
        travel_fee_per_km: numberOrNull(travelFeePerKm),
        what_included: whatIncluded,
        requirements: requirementsText ? linesToArray(requirementsText) : undefined,
        tools_provided: toolsText ? linesToArray(toolsText) : undefined,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
      };

      const plainDescription = stripHtml(description);
      if (!plainDescription || plainDescription.length < 50) {
        toast.error('Opis musi mieć min. 50 znaków (bez formatowania)');
        return;
      }

      if (!minNotice) {
        payload.min_notice_hours = 12;
      }

      const url = mode === 'create'
        ? `${API_BASE_URL}/api/v1/provider/services`
        : `${API_BASE_URL}/api/v1/provider/services/${serviceId}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        toast.error(error.error || 'Nie udało się zapisać usługi');
        return;
      }

      const saved = await res.json().catch(() => ({}));
      const savedService = saved.data ?? saved;
      const createdId = savedService.id ?? serviceId;
      const savedProviderId = savedService.provider_id ?? savedService.provider?.id ?? effectiveProviderId;

      await uploadNewPhotos(createdId, savedProviderId);

      toast.success(mode === 'create' ? 'Usługa utworzona' : 'Usługa zapisana');
      navigate('/provider/services');
    } catch (err) {
      console.error(err);
      toast.error('Wystąpił błąd podczas zapisywania');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async () => {
    const pid = effectiveProviderId;
    if (!serviceId || !pid) return;
    setIsToggling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/providers/${pid}/services/${serviceId}/toggle-status`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        toast.error(error.error || 'Nie udało się zmienić statusu');
        return;
      }

      const payload = await res.json().catch(() => ({}));
      const newStatus = payload.data?.status ?? (status === 'active' ? 'paused' : 'active');
      setStatus(newStatus === 'paused' ? 'paused' : 'active');
      toast.success(newStatus === 'paused' ? 'Usługa wstrzymana' : 'Usługa aktywowana');
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas zmiany statusu');
    } finally {
      setIsToggling(false);
    }
  };

  const handlePhotoReorder = async (nextOrder: PhotoItem[]) => {
    const pid = effectiveProviderId;
    if (!serviceId || !pid) return;
    setExistingPhotos(nextOrder);
    const orderedIds = nextOrder.map((p) => p.id);
    await fetch(`${API_BASE_URL}/api/v1/providers/${pid}/services/${serviceId}/photos/reorder`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ordered_ids: orderedIds }),
    }).catch(() => toast.error('Nie udało się zapisać kolejności'));
  };

  const movePhoto = (photoId: number, direction: 'up' | 'down') => {
    const idx = existingPhotos.findIndex((p) => p.id === photoId);
    if (idx === -1) return;
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= existingPhotos.length) return;
    const next = [...existingPhotos];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    handlePhotoReorder(next.map((p, i) => ({ ...p, position: i + 1 })));
  };

  const onPhotoDrop = (targetId: number) => {
    if (draggingPhotoId === null || draggingPhotoId === targetId) return;
    const next = [...existingPhotos];
    const from = next.findIndex((p) => p.id === draggingPhotoId);
    const to = next.findIndex((p) => p.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const withPositions = next.map((p, i) => ({ ...p, position: i + 1 }));
    setExistingPhotos(withPositions);
    handlePhotoReorder(withPositions);
  };

  const deletePhoto = async (photoId: number) => {
    const pid = effectiveProviderId;
    if (!serviceId || !pid) return;
    const res = await fetch(`${API_BASE_URL}/api/v1/providers/${pid}/services/${serviceId}/photos/${photoId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      toast.error('Nie udało się usunąć zdjęcia');
      return;
    }
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    toast.success('Zdjęcie usunięte');
  };

  const setPrimaryPhoto = async (photoId: number) => {
    const pid = effectiveProviderId;
    if (!serviceId || !pid) return;
    const res = await fetch(`${API_BASE_URL}/api/v1/providers/${pid}/services/${serviceId}/photos/${photoId}/primary`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      toast.error('Nie udało się ustawić zdjęcia głównego');
      return;
    }
    setExistingPhotos((prev) => prev.map((p) => ({ ...p, is_primary: p.id === photoId })));
    toast.success('Ustawiono zdjęcie główne');
  };

  const categoryLabelId = 'provider-category-label';
  const sectionCardClass = 'glass-card p-5 md:p-6 rounded-2xl border border-white/60 dark:border-slate-800/80 shadow-xl bg-white/85 dark:bg-gray-900/80 backdrop-blur';
  const plainDescriptionLength = stripHtml(description).length;
  const descriptionWordCount = stripHtml(description).split(/\s+/).filter(Boolean).length;
  const descriptionProgress = Math.min(plainDescriptionLength / 50, 1);
  const sectionsNav = [
    { id: 'basics', label: 'Podstawowe' },
    { id: 'details', label: 'Szczegóły' },
    { id: 'pricing', label: 'Cennik' },
    { id: 'booking', label: 'Rezerwacje' },
    { id: 'location', label: 'Lokalizacja' },
    { id: 'seo', label: 'SEO' },
    { id: 'gallery', label: 'Galeria' },
  ];
  const headingClass = 'font-semibold tracking-tight text-slate-900 dark:text-slate-50';
  const subtextClass = 'text-sm text-slate-500 dark:text-slate-400 leading-snug';

  const LatLngUpdater: React.FC = () => {
    useMapEvents({
      click(e) {
        setLatitude(String(e.latlng.lat.toFixed(6)));
        setLongitude(String(e.latlng.lng.toFixed(6)));
      },
      moveend(e) {
        mapRef.current = e.target;
      },
    });
    return null;
  };

  return (
    <div className="relative font-sans">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cyan-50/80 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_85%_0,rgba(14,165,233,0.16),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(45,212,191,0.12),transparent_32%)]" />

      <div className="relative max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <PageTitle gradient>{pageTitle}</PageTitle>
            <Text muted size="sm" className="mt-1">Formularz wizualnie spójny z kalendarzem i pozostałymi widokami providera.</Text>
          </div>
          {mode === 'edit' && (
            <span className="text-xs font-semibold text-slate-500 bg-white/70 dark:bg-slate-900/70 px-3 py-1 rounded-full border border-slate-200/70 dark:border-slate-800/70">
              ID #{serviceId}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {sectionsNav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-xs font-semibold px-3 py-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 hover:border-cyan-300 hover:text-cyan-700 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {mode === 'edit' && isLoading && <Text muted>Ładowanie...</Text>}

        {mode === 'edit' && (
          <div className={`${sectionCardClass} border-l-4 ${status === 'active' ? 'border-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20' : 'border-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl ${status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>●</span>
                  <Text className={headingClass}>Status usługi</Text>
                </div>
                <Text muted size="sm" className={subtextClass}>Zmiana statusu wymaga dostępnego limitu aktywnych usług.</Text>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {status === 'active' ? '✓ Aktywna' : '⏸ Wstrzymana'}
                </span>
                <Button variant="outline" onClick={toggleStatus} disabled={isToggling} className="font-semibold">
                  {status === 'active' ? 'Wstrzymaj' : 'Aktywuj'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div id="basics" className={`${sectionCardClass} bg-gradient-to-br from-cyan-50/30 via-transparent to-transparent dark:from-cyan-950/10 border border-cyan-100 dark:border-cyan-900/30`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <Text className={headingClass}>Limity planu</Text>
              </div>
              <Text muted size="sm" className={subtextClass}>Monitoruj aktywne usługi, aby uniknąć blokady publikacji.</Text>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md">Stan: aktywne usługi / limit</span>
              <Button variant="outline" size="sm" className="font-semibold">Zobacz limity</Button>
            </div>
          </div>
        </div>

        <div className={`${sectionCardClass} space-y-5`}>
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📝</span>
              <Text className={headingClass}>Podstawowe informacje</Text>
            </div>
            <Text muted size="sm" className={subtextClass}>Tytuł, opis i kategoria decydują o kliknięciu klienta.</Text>
          </div>

          <label className="space-y-2 block">
            <div className="flex items-center gap-2">
              <Text className="font-medium">Tytuł usługi</Text>
              <span className="text-red-500 font-bold">*</span>
            </div>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="np. Profesjonalne usługi hydrauliczne" 
              className="text-base font-medium"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text className="font-medium">Opis</Text>
                <span className="text-red-500 font-bold">*</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className={`px-2 py-1 rounded-lg ${plainDescriptionLength >= 50 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>
                  {plainDescriptionLength}/50 znaków
                </span>
                <span className="text-slate-500">• {descriptionWordCount} słów</span>
              </div>
            </div>
            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors">
              <div ref={quillContainerRef} className="min-h-[220px]" />
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-300 ${plainDescriptionLength >= 50 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} 
                style={{ width: `${descriptionProgress * 100}%` }} 
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setDescription('<ul><li>• Punkt 1</li><li>• Punkt 2</li><li>• Punkt 3</li></ul>')} className="font-medium">
                📋 Wstaw szablon listy
              </Button>
              <Text muted size="sm" className="text-[11px] text-slate-500">Min. 50 znaków – unikaj pustych tagów.</Text>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative z-20">
              <label className="mb-2 block" id={categoryLabelId}>
                <div className="flex items-center gap-2">
                  <Text className="font-medium">Kategoria</Text>
                  <span className="text-red-500 font-bold">*</span>
                </div>
              </label>
              <CategorySelect
                categories={categories}
                selected={category}
                onChange={setCategory}
                placeholder="Wybierz kategorię"
                loading={categoriesLoading}
                ariaLabelledBy={categoryLabelId}
                id="provider-category-select"
              />
            </div>
            <div>
              <label className="mb-2 block">
                <Text className="font-medium text-slate-400">Podkategoria</Text>
              </label>
              <Input placeholder="(wkrótce dostępne)" disabled className="bg-slate-50 dark:bg-slate-900/50" />
            </div>
          </div>
        </div>

        <div id="details" className={`${sectionCardClass} space-y-5`}>
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">✨</span>
              <Text className={headingClass}>Szczegóły oferty</Text>
            </div>
            <Text muted size="sm" className={subtextClass}>Dodaj listy korzyści, wymagania i narzędzia.</Text>
          </div>

          <label className="space-y-2 block">
            <Text>Co otrzymuje klient?</Text>
            <Textarea rows={3} value={whatIncluded} onChange={(e) => setWhatIncluded(e.target.value)} placeholder="• Punkt 1\n• Punkt 2" />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2 block">
              <Text>Wymagania od klienta</Text>
              <Textarea rows={4} value={requirementsText} onChange={(e) => setRequirementsText(e.target.value)} placeholder="Jedna linia = jedno wymaganie" />
            </label>
            <label className="space-y-2 block">
              <Text>Co zapewniasz?</Text>
              <Textarea rows={4} value={toolsText} onChange={(e) => setToolsText(e.target.value)} placeholder="Jedna linia = jeden element" />
            </label>
          </div>
        </div>

        <div id="pricing" className={`${sectionCardClass} space-y-5`}>
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💰</span>
              <Text className={headingClass}>Cennik i rozliczenie</Text>
            </div>
            <Text muted size="sm" className={subtextClass}>Typ rozliczenia, widełki i opłaty dodatkowe.</Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['hourly', 'fixed', 'quote'] as const).map((type) => (
              <label 
                key={type} 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                  pricingType === type 
                    ? 'border-cyan-500 ring-4 ring-cyan-100 dark:ring-cyan-900/50 bg-cyan-50/50 dark:bg-cyan-950/20 shadow-lg' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Text className={`font-semibold capitalize ${pricingType === type ? 'text-cyan-700 dark:text-cyan-400' : ''}`}>
                    {type === 'hourly' ? '⏱ Stawka godzinowa' : type === 'fixed' ? '💵 Cena stała' : '💬 Wycena indywidualna'}
                  </Text>
                  <input 
                    type="radio" 
                    name="pricing_type" 
                    value={type} 
                    checked={pricingType === type} 
                    onChange={() => setPricingType(type)}
                    className="w-5 h-5 accent-cyan-500"
                  />
                </div>
                <Text muted size="sm" className="text-xs text-slate-600 dark:text-slate-400">
                  {type === 'hourly' ? 'Rozliczenie za godzinę' : type === 'fixed' ? 'Stała kwota' : 'Kwota po rozmowie'}
                </Text>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">Tip: Ustal jednostkę spójną z opisem</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-[11px] font-semibold"
              onClick={() => { setPricingType('hourly'); setPricingUnit('hour'); setBasePrice('150'); setDuration('60'); }}
            >
              Preset: 150 PLN / godz.
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-[11px] font-semibold"
              onClick={() => { setPricingType('fixed'); setPricingUnit('service'); setBasePrice('250'); setDuration(''); }}
            >
              Preset: Usługa stała 250 PLN
            </Button>
          </div>

          {pricingType !== 'quote' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2 block">
                <Text>{pricingType === 'hourly' ? 'Stawka (PLN)' : 'Cena (PLN)'} *</Text>
                <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="np. 150" />
              </label>
              <label className="space-y-2 block">
                <Text>Jednostka rozliczenia</Text>
                <Select value={pricingUnit} onChange={(e) => setPricingUnit(e.target.value)}>
                  <option value="service">za usługę</option>
                  <option value="hour">za godzinę</option>
                  <option value="day">za dzień</option>
                  <option value="visit">za wizytę</option>
                  <option value="sqm">za m²</option>
                </Select>
              </label>
            </div>
          )}

          {pricingType === 'quote' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2 block">
                <Text>Cena minimalna (opcjonalnie)</Text>
                <Input type="number" value={priceRangeLow} onChange={(e) => setPriceRangeLow(e.target.value)} placeholder="np. 100" />
              </label>
              <label className="space-y-2 block">
                <Text>Cena maksymalna (opcjonalnie)</Text>
                <Input type="number" value={priceRangeHigh} onChange={(e) => setPriceRangeHigh(e.target.value)} placeholder="np. 300" />
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-2 block">
              <Text>Opłata za dojazd (PLN/km)</Text>
              <Input type="number" value={travelFeePerKm} onChange={(e) => setTravelFeePerKm(e.target.value)} placeholder="np. 2.5" />
            </label>
            <div className="space-y-1">
              <Text>Przyjmuję zapytania ofertowe</Text>
              <Switch checked={acceptsQuote} onCheckedChange={setAcceptsQuote} />
            </div>
            <div className="space-y-1">
              <Text>Instant booking</Text>
              <Switch checked={instantBooking} onCheckedChange={setInstantBooking} />
            </div>
          </div>
        </div>

        <div id="booking" className={`${sectionCardClass} space-y-5`}>
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📅</span>
              <Text className={headingClass}>Rezerwacje i dostępność</Text>
            </div>
            <Text muted size="sm" className={subtextClass}>Określ zasady przyjmowania zleceń.</Text>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-2 block">
              <Text>Minimalne wyprzedzenie (godz.) *</Text>
              <Input type="number" value={minNotice} onChange={(e) => setMinNotice(e.target.value)} placeholder="np. 12" />
            </label>
            <label className="space-y-2 block">
              <Text>Maksymalne wyprzedzenie (dni)</Text>
              <Input type="number" value={maxAdvance} onChange={(e) => setMaxAdvance(e.target.value)} placeholder="np. 90" />
            </label>
            <label className="space-y-2 block">
              <Text>Średni czas realizacji (min)</Text>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="np. 90" />
            </label>
          </div>
        </div>

        <div id="location" className={`${sectionCardClass} space-y-5`}>
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📍</span>
              <Text className={headingClass}>Lokalizacja i zasięg</Text>
            </div>
            <Text muted size="sm" className={subtextClass}>Wybierz bazowe miasto i promień.</Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block"><Text>Miejscowość</Text></label>
              <LocationSelect
                locations={locations}
                selected={selectedLocation}
                onChange={setSelectedLocation}
                placeholder="Wybierz miasto"
                loading={locationsLoading}
              />
            </div>
            <label className="space-y-2 block">
              <Text>Promień działania (km)</Text>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={200}
                  value={Number(maxDistanceKm || 0) || 1}
                  onChange={(e) => setMaxDistanceKm(e.target.value)}
                  className="flex-1"
                />
                <Input type="number" value={maxDistanceKm} onChange={(e) => setMaxDistanceKm(e.target.value)} className="w-24" />
                <span className="text-xs text-slate-500">{Number(maxDistanceKm || 0) || 1} km</span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-2 block">
              <Text>Szerokość (lat)</Text>
              <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="52.2297" />
            </label>
            <label className="space-y-2 block">
              <Text>Długość (lng)</Text>
              <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="21.0122" />
            </label>
            <div className="space-y-1 flex items-center gap-3 pt-6">
              <Switch checked={willingToTravel} onCheckedChange={setWillingToTravel} />
              <Text>Gotowy do dojazdu</Text>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/60 dark:border-slate-800/70 shadow-md">
            <MapContainer
              center={[Number(latitude || defaultLat), Number(longitude || defaultLng)]}
              zoom={11}
              style={{ height: 320, width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <Marker
                position={[Number(latitude || defaultLat), Number(longitude || defaultLng)]}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const { lat, lng } = event.target.getLatLng();
                    setLatitude(lat.toFixed(6));
                    setLongitude(lng.toFixed(6));
                  },
                }}
                icon={markerIcon}
              />
              <Circle
                center={[Number(latitude || defaultLat), Number(longitude || defaultLng)]}
                radius={(Number(maxDistanceKm || 0) || 1) * 1000}
                pathOptions={{ color: '#06B6D4', fillColor: '#06B6D4', fillOpacity: 0.12 }}
              />
              <LatLngUpdater />
            </MapContainer>
          </div>
        </div>

        <div id="seo" className={`${sectionCardClass} space-y-5`}>
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🔍</span>
              <Text className={headingClass}>Widoczność i SEO</Text>
            </div>
            <Text muted size="sm" className={subtextClass}>Meta tytuł i opis do udostępnień.</Text>
          </div>
          <label className="space-y-2 block">
            <Text>Meta tytuł</Text>
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={70} placeholder="np. Hydraulik 24/7 – awarie" />
            <Text muted size="sm">{metaTitle.length}/70</Text>
          </label>
          <label className="space-y-2 block">
            <Text>Meta opis</Text>
            <Textarea rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={160} placeholder="Krótki opis do wyników" />
            <Text muted size="sm">{metaDescription.length}/160</Text>
          </label>
        </div>

        <div id="gallery" className={`${sectionCardClass} space-y-5`}>
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🖼️</span>
                <Text className={headingClass}>Galeria i zdjęcia</Text>
              </div>
              <Text muted size="sm" className={subtextClass}>Pierwsze zdjęcie jest miniaturą.</Text>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                📷 {existingPhotos.length + newPhotos.length} {existingPhotos.length + newPhotos.length === 1 ? 'zdjęcie' : 'zdjęć'}
              </span>
              <input
                id="service-photos"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  handleIncomingFiles(files);
                }}
              />
              <Button variant="outline" onClick={() => document.getElementById('service-photos')?.click()} className="font-semibold">
                ➕ Dodaj zdjęcia
              </Button>
              {newPhotos.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { setNewPhotos([]); setNewPhotosAlt({}); }} className="text-red-600 hover:text-red-700">
                  🗑️ Wyczyść nowe
                </Button>
              )}
            </div>
          </div>
        </div>

        <Text muted size="sm" className="text-[11px] text-slate-500">Rekomendacja: poziome 1200x800, max 2MB. Przeciągnij, aby zmienić kolejność.</Text>

        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDropActive 
              ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 scale-[1.02]' 
              : 'border-slate-300 dark:border-slate-600 hover:border-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDropActive(true); }}
          onDragLeave={() => setIsDropActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
            handleIncomingFiles(files);
            setIsDropActive(false);
          }}
          onClick={() => document.getElementById('service-photos')?.click()}
        >
          <div className="text-4xl mb-2">📸</div>
          <Text className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Upuść zdjęcia lub kliknij, aby wybrać</Text>
          <Text muted size="sm" className="text-xs text-slate-500">Wspieramy JPG/PNG/WebP • Max 2MB • Rekomendowane 1200x800px</Text>
        </div>

        {newPhotos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text className="font-semibold">Nowe zdjęcia (do wysłania)</Text>
              <Text muted size="sm" className="text-xs">{newPhotos.length} {newPhotos.length === 1 ? 'zdjęcie' : 'zdjęć'}</Text>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {newPhotos.map((file, idx) => {
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div
                    key={idx}
                    className={`border rounded-xl overflow-hidden bg-white dark:bg-gray-800/40 transition-all ${
                      draggingNewPhotoIdx === idx ? 'ring-2 ring-cyan-400 opacity-50' : ''
                    } ${
                      dropTargetNewIdx === idx ? 'border-dashed border-2 border-cyan-400 ring-2 ring-cyan-200' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    draggable
                    onDragStart={() => setDraggingNewPhotoIdx(idx)}
                    onDragEnd={() => setDraggingNewPhotoIdx(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDropTargetNewIdx(idx);
                    }}
                    onDragLeave={() => setDropTargetNewIdx(null)}
                    onDrop={() => {
                      onNewPhotoDrop(idx);
                      setDropTargetNewIdx(null);
                      setDraggingNewPhotoIdx(null);
                    }}
                  >
                    <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                      <img
                        src={previewUrl}
                        alt={`Podgląd ${file.name}`}
                        className="w-full h-full object-cover"
                        onLoad={() => URL.revokeObjectURL(previewUrl)}
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white backdrop-blur shadow-lg">
                          Nowe
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-800/80 text-white backdrop-blur">
                          #{idx + 1}
                        </span>
                      </div>
                      {dropTargetNewIdx === idx && (
                        <div className="absolute inset-0 bg-cyan-400/20 backdrop-blur-sm flex items-center justify-center">
                          <div className="bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-lg">
                            <Text className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Upuść tutaj</Text>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Text size="sm" className="font-semibold truncate">{file.name}</Text>
                          <Text muted size="sm" className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</Text>
                        </div>
                      </div>
                      <Input
                        placeholder="Alt/Opis zdjęcia"
                        value={newPhotosAlt[idx] ?? ''}
                        onChange={(e) => setNewPhotosAlt((prev) => ({ ...prev, [idx]: e.target.value }))}
                        className="text-sm"
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moveNewPhoto(idx, 'up')}
                          disabled={idx === 0}
                          className="flex-1 text-xs"
                        >
                          ↑ Góra
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moveNewPhoto(idx, 'down')}
                          disabled={idx === newPhotos.length - 1}
                          className="flex-1 text-xs"
                        >
                          ↓ Dół
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeNewPhoto(idx)}
                          className="px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {existingPhotos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text className="font-semibold">Opublikowane zdjęcia</Text>
              <Text muted size="sm" className="text-xs">{existingPhotos.length} {existingPhotos.length === 1 ? 'zdjęcie' : 'zdjęć'}</Text>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {existingPhotos.sort((a, b) => a.position - b.position).map((photo) => (
                <div
                  key={photo.id}
                  className={`border rounded-xl overflow-hidden bg-white dark:bg-gray-800/40 transition-all ${
                    draggingPhotoId === photo.id ? 'ring-2 ring-cyan-400 opacity-50' : ''
                  } ${
                    dropTargetId === photo.id ? 'border-dashed border-2 border-cyan-400 ring-2 ring-cyan-200' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  draggable
                  onDragStart={() => setDraggingPhotoId(photo.id)}
                  onDragEnd={() => setDraggingPhotoId(null)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropTargetId(photo.id);
                  }}
                  onDragLeave={() => setDropTargetId(null)}
                  onDrop={() => {
                    onPhotoDrop(photo.id);
                    setDropTargetId(null);
                    setDraggingPhotoId(null);
                  }}
                >
                  <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    <img src={photo.url} alt={photo.alt_text || 'Zdjęcie usługi'} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {photo.is_primary && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
                          ★ Główne
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-800/80 text-white backdrop-blur">
                        #{photo.position}
                      </span>
                    </div>
                    {dropTargetId === photo.id && (
                      <div className="absolute inset-0 bg-cyan-400/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-lg">
                          <Text className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Upuść tutaj</Text>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    {photo.alt_text && (
                      <Text size="sm" className="text-slate-600 dark:text-slate-400 text-xs italic truncate">"{photo.alt_text}"</Text>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => movePhoto(photo.id, 'up')}
                        className="flex-1 text-xs"
                      >
                        ↑ Góra
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => movePhoto(photo.id, 'down')}
                        className="flex-1 text-xs"
                      >
                        ↓ Dół
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {!photo.is_primary && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setPrimaryPhoto(photo.id)}
                          className="flex-1 text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600"
                        >
                          ★ Ustaw główne
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => deletePhoto(photo.id)}
                        className={`text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 ${photo.is_primary ? 'flex-1' : 'px-4'}`}
                      >
                        Usuń
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Akcje */}
      <div className="sticky bottom-0 left-0 right-0 flex items-center justify-end gap-3 bg-gradient-to-t from-white/95 via-white/90 to-transparent dark:from-slate-950/95 dark:via-slate-950/90 backdrop-blur pt-4 pb-6">
        <div className="glass-card rounded-2xl border border-white/60 dark:border-slate-800/80 shadow-lg px-4 py-3 flex items-center gap-3">
          <div className="text-xs text-slate-500 flex flex-col leading-tight pr-3">
            <span>{plainDescriptionLength >= 50 ? 'Opis OK' : `Opis: ${plainDescriptionLength}/50`}</span>
            <span>{minNotice ? `Min. wyprzedzenie: ${minNotice}h` : 'Dodaj min. wyprzedzenie'}</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/provider/services')}>Anuluj</Button>
          <Button onClick={submit} disabled={isSaving} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-200/60">
            {isSaving ? 'Zapisywanie...' : mode === 'create' ? 'Utwórz usługę' : 'Zapisz zmiany'}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ServiceFormPage;
export { ServiceFormPage };
