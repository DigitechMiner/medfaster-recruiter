'use client';

import { useMemo, useState } from 'react';

export type PoolTab = 'nearby' | 'active';

export function useCandidatesPoolFilters({
  poolTab,
  page,
  limit,
}: {
  poolTab: PoolTab;
  page: number;
  limit: number;
}) {
  const [selectedRoleSlug, setSelectedRoleSlug] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);
  const [customKm, setCustomKm] = useState('');
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const effectiveKm = useMemo(() => {
    const c = customKm.trim();
    if (c) {
      const n = parseFloat(c);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return radiusKm > 0 ? radiusKm : null;
  }, [customKm, radiusKm]);

  const kmValidationHint = useMemo(() => {
    const c = customKm.trim();
    if (!c) return null;
    const n = parseFloat(c);
    if (Number.isNaN(n) || n <= 0) return 'Enter a valid radius in km (greater than 0).';
    return null;
  }, [customKm]);

  const geoParsed = useMemo(() => {
    if (!coords || effectiveKm == null) {
      return {
        ok: true as const,
        lat: undefined as number | undefined,
        lng: undefined as number | undefined,
        km: undefined as number | undefined,
      };
    }
    return {
      ok: true as const,
      lat: coords.lat,
      lng: coords.lng,
      km: effectiveKm,
    };
  }, [coords, effectiveKm]);

  const roleSlugsFromMeta = useMemo(
    () => (selectedRoleSlug ? [selectedRoleSlug] : undefined),
    [selectedRoleSlug],
  );

  const filters = useMemo(() => {
    const hasGeo =
      geoParsed.lat != null &&
      geoParsed.lng != null &&
      geoParsed.km != null &&
      geoParsed.km > 0;
    const base = {
      page,
      limit,
      roleSlugs: roleSlugsFromMeta,
      ...(hasGeo
        ? { latitude: geoParsed.lat, longitude: geoParsed.lng, km: geoParsed.km }
        : {}),
    };
    if (poolTab === 'active') {
      return { ...base, is_active: true as const };
    }
    return base;
  }, [page, poolTab, roleSlugsFromMeta, geoParsed, limit]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoHint('Geolocation is not supported in this browser.');
      return;
    }
    setLocating(true);
    setGeoHint(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setGeoHint(err.message || 'Could not read your location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 },
    );
  };

  const clearFilters = () => {
    setSelectedRoleSlug('');
    setCoords(null);
    setRadiusKm(25);
    setCustomKm('');
    setGeoHint(null);
  };

  return {
    filters,
    selectedRoleSlug,
    setSelectedRoleSlug,
    coords,
    radiusKm,
    setRadiusKm,
    customKm,
    setCustomKm,
    geoHint,
    kmValidationHint,
    locating,
    requestLocation,
    clearFilters,
  };
}
