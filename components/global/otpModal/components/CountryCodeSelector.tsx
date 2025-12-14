'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { countryList } from '@/utils/constant/countryCode';

interface Country {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

interface CountryCodeSelectorProps {
  value: string;
  onChange: (dialCode: string) => void;
  disabled?: boolean;
}

export default function CountryCodeSelector({
  value,
  onChange,
  disabled = false,
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = (countryList as Country[]).find((c) => c.dial_code === value) || 
    (countryList as Country[]).find((c) => c.code === 'US') || 
    (countryList as Country[])[0];

  // Filter countries based on search
  const filteredCountries = (countryList as Country[]).filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.code.toLowerCase().includes(search.toLowerCase()) ||
      country.dial_code.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOpenModal = () => {
    if (!disabled) {
      setSearch('');
      setIsOpen(true);
    }
  };

  const handleSelectCountry = (country: Country) => {
    onChange(country.dial_code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleOpenModal}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-[#252B37]">{selectedCountry.code}</span>
          <ChevronDown
            size={14}
            className={`text-[#717680] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-xl w-full max-w-md max-h-[70vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#252B37]">Select Country</h3>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSearch('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-[#717680]" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717680]"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4781B] focus:border-transparent"
                />
              </div>
            </div>

            {/* Countries List */}
            <div className="flex-1 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleSelectCountry(country)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                        selectedCountry.code === country.code ? 'bg-gray-50' : ''
                      }`}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#252B37] truncate">
                          {country.name}
                        </div>
                      </div>
                      <div className="text-sm text-[#717680] font-medium">
                        {country.dial_code}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[#717680] text-base">No countries found</p>
                  <p className="text-[#717680] text-sm mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
