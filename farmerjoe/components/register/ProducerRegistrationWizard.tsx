'use client';

import type { MouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

type SignUpPayload = {
  email: string;
  password: string;
  fullName: string;
  role: 'producer';
  metadata?: Record<string, unknown>;
};

type ProducerLocation = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

type ProducerStoreItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  imageUrl?: string;
};

type ProducerRegistrationData = {
  account: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    businessName: string;
  };
  social: {
    website: string;
    instagram: string;
    facebook: string;
    twitter: string;
  };
  preferences: {
    categories: string[];
    locations: ProducerLocation[];
    notes: string;
  };
  store: {
    items: ProducerStoreItem[];
  };
};

const steps = [
  { id: 'basic', label: 'Basic info' },
  { id: 'social', label: 'Social links' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'store', label: 'Virtual store' },
  { id: 'confirm', label: 'Confirmation' },
] as const;

type StepId = (typeof steps)[number]['id'];

type ProducerRegistrationWizardProps = {
  onSubmit: (payload: SignUpPayload) => Promise<void>;
  isSubmitting: boolean;
  supabaseConfigured: boolean;
  onResetError: () => void;
};

const PRODUCT_CATEGORIES = [
  'Fresh produce',
  'Dairy & eggs',
  'Meat & poultry',
  'Artisan goods',
  'Flowers & plants',
  'Workshops & tours',
] as const;

const QUANTITY_UNITS = ['kg', 'lb', 'bunch', 'crate', 'item', 'litre'] as const;

const MAX_LOCATIONS = 3;

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const createInitialData = (): ProducerRegistrationData => ({
  account: {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
  },
  social: {
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
  },
  preferences: {
    categories: [],
    locations: [],
    notes: '',
  },
  store: {
    items: [],
  },
});

type ProducerLocationMapProps = {
  locations: ProducerLocation[];
  onAddLocation: (location: ProducerLocation) => void;
};

function ProducerLocationMap({ locations, onAddLocation }: ProducerLocationMapProps) {
  const handleMapClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (locations.length >= MAX_LOCATIONS) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width;
      const relativeY = (event.clientY - bounds.top) / bounds.height;

      const longitude = Number((relativeX * 360 - 180).toFixed(4));
      const latitude = Number(((1 - relativeY) * 180 - 90).toFixed(4));

      onAddLocation({
        id: createId(),
        label: `Farm site ${locations.length + 1}`,
        latitude,
        longitude,
      });
    },
    [locations, onAddLocation]
  );

  return (
    <div className="relative">
      <div
        className="relative h-64 w-full cursor-crosshair overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50"
        onClick={handleMapClick}
        data-testid="producer-location-map"
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.2),transparent_55%)]" />
        {locations.map((location, index) => {
          const left = ((location.longitude + 180) / 360) * 100;
          const top = ((90 - location.latitude) / 180) * 100;

          return (
            <button
              key={location.id}
              type="button"
              className="group absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-500 bg-white shadow-md"
              style={{ left: `${left}%`, top: `${top}%` }}
              tabIndex={-1}
              data-testid={`producer-location-marker-${index}`}
              onClick={(event) => event.stopPropagation()}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 transition group-hover:bg-emerald-600" />
            </button>
          );
        })}

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-200" />
      </div>
      <p className="mt-2 text-xs text-zinc-500" data-testid="producer-location-helper">
        Click anywhere on the grid to drop a pin. Add up to {MAX_LOCATIONS} farm or market locations.
      </p>
    </div>
  );
}

export default function ProducerRegistrationWizard({
  onSubmit,
  isSubmitting,
  supabaseConfigured,
  onResetError,
}: ProducerRegistrationWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<ProducerRegistrationData>(() => createInitialData());
  const [stepError, setStepError] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState({
    id: '',
    name: '',
    quantity: '',
    unit: QUANTITY_UNITS[0],
    price: '',
    imageUrl: '',
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);

  const currentStep = steps[stepIndex];
  const progress = useMemo(() => ((stepIndex + 1) / steps.length) * 100, [stepIndex]);

  const updateAccount = useCallback(
    <Field extends keyof ProducerRegistrationData['account']>(
      field: Field,
      value: ProducerRegistrationData['account'][Field]
    ) => {
      onResetError();
      setStepError(null);
      setData((previous) => ({
        ...previous,
        account: {
          ...previous.account,
          [field]: value,
        },
      }));
    },
    [onResetError]
  );

  const updateSocial = useCallback(
    <Field extends keyof ProducerRegistrationData['social']>(
      field: Field,
      value: ProducerRegistrationData['social'][Field]
    ) => {
      onResetError();
      setStepError(null);
      setData((previous) => ({
        ...previous,
        social: {
          ...previous.social,
          [field]: value,
        },
      }));
    },
    [onResetError]
  );

  const toggleCategory = useCallback(
    (category: string) => {
      onResetError();
      setStepError(null);
      setData((previous) => {
        const alreadySelected = previous.preferences.categories.includes(category);
        return {
          ...previous,
          preferences: {
            ...previous.preferences,
            categories: alreadySelected
              ? previous.preferences.categories.filter((value) => value !== category)
              : [...previous.preferences.categories, category],
          },
        };
      });
    },
    [onResetError]
  );

  const addLocation = useCallback(
    (location: ProducerLocation) => {
      onResetError();
      setStepError(null);
      setData((previous) => ({
        ...previous,
        preferences: {
          ...previous.preferences,
          locations: [...previous.preferences.locations, location],
        },
      }));
    },
    [onResetError]
  );

  const updateLocationLabel = useCallback((id: string, label: string) => {
    setData((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        locations: previous.preferences.locations.map((location) =>
          location.id === id ? { ...location, label } : location
        ),
      },
    }));
  }, []);

  const removeLocation = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        locations: previous.preferences.locations.filter((location) => location.id !== id),
      },
    }));
  }, []);

  const updatePreferenceNotes = useCallback((value: string) => {
    onResetError();
    setStepError(null);
    setData((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        notes: value,
      },
    }));
  }, [onResetError]);

  const resetItemDraft = useCallback(() => {
    setItemDraft({
      id: '',
      name: '',
      quantity: '',
      unit: QUANTITY_UNITS[0],
      price: '',
      imageUrl: '',
    });
    setEditingItemId(null);
  }, []);

  const handleItemDraftChange = useCallback(
    (field: 'name' | 'quantity' | 'unit' | 'price' | 'imageUrl', value: string) => {
      setItemError(null);
      setStepError(null);
      setItemDraft((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    []
  );

  const handleStoreItemSubmit = useCallback(() => {
    const trimmedName = itemDraft.name.trim();
    const quantityValue = Number(itemDraft.quantity);
    const priceValue = Number(itemDraft.price);

    if (!trimmedName) {
      setItemError('Add the item name before saving.');
      return;
    }

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      setItemError('Quantity must be a positive number.');
      return;
    }

    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setItemError('Price must be zero or a positive number.');
      return;
    }

    const preparedItem: ProducerStoreItem = {
      id: editingItemId ?? createId(),
      name: trimmedName,
      quantity: Number(quantityValue.toFixed(2)),
      unit: itemDraft.unit.trim() || QUANTITY_UNITS[0],
      price: Number(priceValue.toFixed(2)),
      imageUrl: itemDraft.imageUrl.trim() || undefined,
    };

    setData((previous) => ({
      ...previous,
      store: {
        items:
          editingItemId === null
            ? [...previous.store.items, preparedItem]
            : previous.store.items.map((item) => (item.id === editingItemId ? preparedItem : item)),
      },
    }));

    resetItemDraft();
  }, [editingItemId, itemDraft, resetItemDraft]);

  const handleEditStoreItem = useCallback((item: ProducerStoreItem) => {
    setItemError(null);
    setStepError(null);
    setEditingItemId(item.id);
    setItemDraft({
      id: item.id,
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      price: String(item.price),
      imageUrl: item.imageUrl ?? '',
    });
  }, []);

  const handleRemoveStoreItem = useCallback((id: string) => {
    setData((previous) => ({
      ...previous,
      store: {
        items: previous.store.items.filter((item) => item.id !== id),
      },
    }));
    setItemError(null);
    setStepError(null);
    if (editingItemId === id) {
      resetItemDraft();
    }
  }, [editingItemId, resetItemDraft]);

  const validateStep = useCallback(
    (targetStep: StepId): { valid: boolean; message?: string } => {
      if (targetStep === 'basic') {
        const { fullName, email, password, phone, businessName } = data.account;
        if (!fullName.trim() || !email.trim() || !password.trim() || !phone.trim() || !businessName.trim()) {
          return { valid: false, message: 'Complete all required fields before continuing.' };
        }
        if (password.trim().length < 8) {
          return { valid: false, message: 'Password must be at least 8 characters long.' };
        }
      }

      if (targetStep === 'preferences') {
        if (data.preferences.categories.length === 0) {
          return { valid: false, message: 'Select at least one product category.' };
        }
        if (data.preferences.locations.length === 0) {
          return { valid: false, message: 'Add at least one preferred location.' };
        }
      }

      if (targetStep === 'store') {
        if (data.store.items.length === 0) {
          return { valid: false, message: 'Add at least one item to your virtual store.' };
        }
      }

      return { valid: true };
    },
    [data]
  );

  const handleNext = useCallback(() => {
    const { valid, message } = validateStep(currentStep.id);
    if (!valid) {
      setStepError(message ?? 'Fill out the required information to proceed.');
      return;
    }

    setStepError(null);
    setStepIndex((previous) => Math.min(previous + 1, steps.length - 1));
  }, [currentStep.id, validateStep]);

  const handleBack = useCallback(() => {
    setStepError(null);
    setStepIndex((previous) => Math.max(previous - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    setStepError(null);
    const cleanedSocialLinks = Object.entries(data.social).reduce<Record<string, string>>((accumulator, [key, value]) => {
      const trimmed = value.trim();
      if (trimmed) {
        accumulator[key] = trimmed;
      }
      return accumulator;
    }, {});

    const metadata = {
      producer_profile: {
        business_name: data.account.businessName.trim(),
        phone: data.account.phone.trim(),
        social_links: cleanedSocialLinks,
        preferences: {
          categories: data.preferences.categories,
          locations: data.preferences.locations.map((location) => ({
            label: location.label,
            latitude: location.latitude,
            longitude: location.longitude,
          })),
          notes: data.preferences.notes.trim() || undefined,
        },
        store_items: data.store.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          image_url: item.imageUrl,
        })),
      },
    };

    await onSubmit({
      email: data.account.email.trim(),
      password: data.account.password,
      fullName: data.account.fullName.trim(),
      role: 'producer',
      metadata,
    });
  }, [data, onSubmit]);

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'basic':
        return (
          <div className="space-y-4" data-testid="producer-step-basic">
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-full-name">
                Full name
              </label>
              <input
                id="producer-full-name"
                value={data.account.fullName}
                onChange={(event) => updateAccount('fullName', event.target.value)}
                required
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                data-testid="producer-basic-full-name"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-email">
                  Email
                </label>
                <input
                  id="producer-email"
                  type="email"
                  value={data.account.email}
                  onChange={(event) => updateAccount('email', event.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  data-testid="producer-basic-email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-phone">
                  Phone number
                </label>
                <input
                  id="producer-phone"
                  type="tel"
                  value={data.account.phone}
                  onChange={(event) => updateAccount('phone', event.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  data-testid="producer-basic-phone"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-password">
                  Password
                </label>
                <input
                  id="producer-password"
                  type="password"
                  minLength={8}
                  value={data.account.password}
                  onChange={(event) => updateAccount('password', event.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  data-testid="producer-basic-password"
                />
                <p className="mt-1 text-xs text-zinc-400">Use at least 8 characters for your password.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-business-name">
                  Business name
                </label>
                <input
                  id="producer-business-name"
                  value={data.account.businessName}
                  onChange={(event) => updateAccount('businessName', event.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  data-testid="producer-basic-business-name"
                />
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4" data-testid="producer-step-social">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              Share where customers can find you online. These fields are optional and can be updated later.
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-website">
                Website
              </label>
              <input
                id="producer-website"
                type="url"
                placeholder="https://example.com"
                value={data.social.website}
                onChange={(event) => updateSocial('website', event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                data-testid="producer-social-website"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-instagram">
                  Instagram
                </label>
                <input
                  id="producer-instagram"
                  placeholder="@farmerjoe"
                  value={data.social.instagram}
                  onChange={(event) => updateSocial('instagram', event.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  data-testid="producer-social-instagram"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-facebook">
                  Facebook
                </label>
                <input
                  id="producer-facebook"
                  placeholder="facebook.com/farmerjoe"
                  value={data.social.facebook}
                  onChange={(event) => updateSocial('facebook', event.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  data-testid="producer-social-facebook"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-twitter">
                Twitter / X
              </label>
              <input
                id="producer-twitter"
                placeholder="@farmerjoe"
                value={data.social.twitter}
                onChange={(event) => updateSocial('twitter', event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                data-testid="producer-social-twitter"
              />
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6" data-testid="producer-step-preferences">
            <div>
              <h3 className="text-sm font-medium text-zinc-700">Favourite product categories</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Let customers know what you specialise in. Pick all that apply.
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {PRODUCT_CATEGORIES.map((category) => {
                  const slug = slugify(category);
                  const selected = data.preferences.categories.includes(category);

                  return (
                    <label
                      key={slug}
                      className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300'
                      }`}
                      data-testid={`producer-preferences-category-${slug}`}
                    >
                      <span>{category}</span>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-700">Preferred event locations</h3>
              <ProducerLocationMap locations={data.preferences.locations} onAddLocation={addLocation} />

              {data.preferences.locations.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {data.preferences.locations.map((location, index) => (
                    <li
                      key={location.id}
                      className="flex items-start justify-between gap-4 rounded-md border border-zinc-200 bg-white p-3 text-sm"
                      data-testid={`producer-location-entry-${index}`}
                    >
                      <div className="flex-1 space-y-1">
                        <input
                          value={location.label}
                          onChange={(event) => updateLocationLabel(location.id, event.target.value)}
                          className="w-full rounded-md border border-transparent px-2 py-1 text-sm font-medium text-emerald-900 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                          data-testid={`producer-location-label-${index}`}
                        />
                        <p className="text-xs text-zinc-500" data-testid={`producer-location-coordinates-${index}`}>
                          {location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}°
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLocation(location.id)}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700"
                        data-testid={`producer-location-remove-${index}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-preferences-notes">
                What should customers know?
              </label>
              <textarea
                id="producer-preferences-notes"
                rows={3}
                value={data.preferences.notes}
                onChange={(event) => updatePreferenceNotes(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Share delivery radius, seasonal products, or other helpful details."
                data-testid="producer-preferences-notes"
              />
            </div>
          </div>
        );

      case 'store':
        return (
          <div className="space-y-6" data-testid="producer-step-store">
            <div>
              <h3 className="text-sm font-medium text-zinc-700">Add items to your virtual store</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Customers will see these items on your profile. You can make changes anytime.
              </p>
            </div>

            <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-store-item-name">
                    Item name
                  </label>
                  <input
                    id="producer-store-item-name"
                    value={itemDraft.name}
                    onChange={(event) => handleItemDraftChange('name', event.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    data-testid="producer-store-item-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-store-item-quantity">
                    Quantity
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id="producer-store-item-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemDraft.quantity}
                      onChange={(event) => handleItemDraftChange('quantity', event.target.value)}
                      className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      data-testid="producer-store-item-quantity"
                    />
                    <select
                      value={itemDraft.unit}
                      onChange={(event) => handleItemDraftChange('unit', event.target.value)}
                      className="w-28 rounded-md border border-zinc-200 px-2 py-2 text-sm text-zinc-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      data-testid="producer-store-item-unit"
                    >
                      {QUANTITY_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-store-item-price">
                    Price
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-zinc-500">£</span>
                    <input
                      id="producer-store-item-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemDraft.price}
                      onChange={(event) => handleItemDraftChange('price', event.target.value)}
                      className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      data-testid="producer-store-item-price"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700" htmlFor="producer-store-item-image">
                    Image URL
                  </label>
                  <input
                    id="producer-store-item-image"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={itemDraft.imageUrl}
                    onChange={(event) => handleItemDraftChange('imageUrl', event.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    data-testid="producer-store-item-image"
                  />
                </div>
              </div>

              {itemError && (
                <p className="text-sm text-rose-600" data-testid="producer-store-item-error">
                  {itemError}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleStoreItemSubmit}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  data-testid="producer-store-item-save"
                >
                  {editingItemId ? 'Update item' : 'Add item'}
                </button>
                {editingItemId && (
                  <button
                    type="button"
                    onClick={resetItemDraft}
                    className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
                    data-testid="producer-store-item-cancel-edit"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </div>

            {data.store.items.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-700">Preview</h4>
                <ul className="space-y-3">
                  {data.store.items.map((item, index) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-white p-4 text-sm md:flex-row md:items-center md:justify-between"
                      data-testid={`producer-store-row-${index}`}
                    >
                      <div>
                        <p className="font-semibold text-zinc-900">{item.name}</p>
                        <p className="text-xs text-zinc-500">
                          {item.quantity} {item.unit} · £{item.price.toFixed(2)}
                        </p>
                        {item.imageUrl && (
                          <p className="mt-1 truncate text-xs text-zinc-400">{item.imageUrl}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditStoreItem(item)}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                          data-testid={`producer-store-edit-${index}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStoreItem(item.id)}
                          className="text-xs font-medium text-rose-600 hover:text-rose-700"
                          data-testid={`producer-store-remove-${index}`}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6" data-testid="producer-step-confirm">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <h3 className="text-sm font-semibold text-emerald-900">Review and confirm</h3>
              <p className="mt-1 text-xs text-emerald-800">
                Double-check your details before creating the account. You can edit everything later from your
                dashboard.
              </p>
            </div>

            <section className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4">
              <h4 className="text-sm font-medium text-zinc-700">Account</h4>
              <dl className="text-sm text-zinc-600">
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-zinc-500">Name</dt>
                  <dd className="text-zinc-900">{data.account.fullName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-zinc-500">Email</dt>
                  <dd className="text-zinc-900">{data.account.email}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-zinc-500">Phone</dt>
                  <dd className="text-zinc-900">{data.account.phone}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-medium text-zinc-500">Business</dt>
                  <dd className="text-zinc-900">{data.account.businessName}</dd>
                </div>
              </dl>
            </section>

            <section className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4">
              <h4 className="text-sm font-medium text-zinc-700">Preferences</h4>
              <div className="text-sm text-zinc-600">
                <p className="font-medium text-zinc-500">Categories</p>
                <p className="text-zinc-900">
                  {data.preferences.categories.length > 0 ? data.preferences.categories.join(', ') : 'None selected'}
                </p>
              </div>
              <div className="text-sm text-zinc-600">
                <p className="font-medium text-zinc-500">Locations</p>
                {data.preferences.locations.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {data.preferences.locations.map((location) => (
                      <li key={location.id} className="text-zinc-900">
                        {location.label} · {location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}°
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-900">No locations added</p>
                )}
              </div>
              {data.preferences.notes && (
                <div className="text-sm text-zinc-600">
                  <p className="font-medium text-zinc-500">Notes</p>
                  <p className="text-zinc-900">{data.preferences.notes}</p>
                </div>
              )}
            </section>

            <section className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4">
              <h4 className="text-sm font-medium text-zinc-700">Virtual store</h4>
              <ul className="space-y-1 text-sm text-zinc-600">
                {data.store.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span className="text-zinc-900">
                      {item.name} ({item.quantity} {item.unit})
                    </span>
                    <span className="font-medium text-emerald-700">£{item.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm" data-testid="producer-wizard">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <p className="text-sm font-semibold text-zinc-700">{steps[stepIndex].label}</p>
        </div>
        <div className="h-2 w-full rounded-full bg-emerald-100" data-testid="producer-progress">
          <div
            className="h-2 rounded-full bg-emerald-600 transition-all"
            style={{ width: `${progress}%` }}
            aria-label={`Progress ${Math.round(progress)} percent`}
          />
        </div>
      </div>

      <div className="mt-6 flex-1">{renderStepContent()}</div>

      {stepError && (
        <p className="mt-4 text-sm text-rose-600" role="alert" data-testid="producer-step-error">
          {stepError}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleBack}
            disabled={stepIndex === 0 || isSubmitting}
            className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="producer-back-button"
          >
            Back
          </button>
          {currentStep.id !== 'confirm' && (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              data-testid="producer-next-button"
            >
              Continue
            </button>
          )}
        </div>

        {currentStep.id === 'confirm' && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!supabaseConfigured || isSubmitting}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="producer-confirm-submit"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        )}
      </div>
    </div>
  );
}


