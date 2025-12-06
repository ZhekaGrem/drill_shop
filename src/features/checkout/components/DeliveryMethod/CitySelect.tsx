'use client';

import { useState, useEffect, useRef } from 'react';
import { TextInput, Paper, Text, Stack, CloseButton, Group } from '@mantine/core';
import { deliveryEndpoints } from '@/shared/api/endpoints';
import { API_BASE } from '@/shared/api/client';
import styles from './DeliveryMethod.module.scss';

interface CitySelectProps {
  value?: City | null;
  onChange: (city: City | null) => void;
  error?: string;
  onBlur?: () => void;
}

export interface City {
  ref: string;
  name: string;
}

export const CitySelect = ({ value, onChange, error, onBlur }: CitySelectProps) => {
  const [inputValue, setInputValue] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingPopularRef = useRef(false);

  // Load popular cities once
  useEffect(() => {
    if (loadingPopularRef.current || popularCities.length > 0) {
      return;
    }

    const loadPopularCities = async () => {
      loadingPopularRef.current = true;
      setPopularLoading(true);

      try {
        const url = `${API_BASE}${deliveryEndpoints.popularCities}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setPopularCities(data.data);
        } else {
          console.error('Invalid popular cities response:', data);
        }
      } catch (error) {
        console.error('Error loading popular cities:', error);
        setPopularCities([]);
      } finally {
        loadingPopularRef.current = false;
        setPopularLoading(false);
      }
    };

    loadPopularCities();
  }, []);

  // Update input when value changes externally
  useEffect(() => {
    setInputValue(value?.name || '');
  }, [value?.name]);

  // Search cities with debounce
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const url = `${API_BASE}${deliveryEndpoints.searchCities}?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setSuggestions(data.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);

    // Clear timeout for previous search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If text is empty, clear selection
    if (newValue.trim() === '') {
      onChange(null); // Clear city selection
      setSuggestions(popularCities);
      return;
    }

    // If text changed and doesn't match current selection, clear selection
    if (value && newValue !== value.name) {
      onChange(null);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchCities(newValue);
    }, 300);
  };

  const handleCitySelect = (city: City) => {
    setInputValue(city.name);
    setShowSuggestions(false);
    setSuggestions([]);
    onChange(city);
    onBlur?.();
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(null); // Clear selection
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    if (!inputValue.trim() && popularCities.length > 0) {
      setSuggestions(popularCities);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
      onBlur?.();
    }, 200);
  };

  // Determine what to show
  const displaySuggestions = inputValue.length < 2 ? popularCities : suggestions;

  return (
    <div style={{ position: 'relative' }} className={styles.citySelect}>
      <TextInput
        label="Місто доставки"
        placeholder="Введіть назву міста"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        error={error}
        required
        rightSection={inputValue && <CloseButton size="sm" onClick={handleClear} aria-label="Очистити" />}
      />

      {showSuggestions && (
        <Paper
        className={styles.dropdown}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 240,
            overflowY: 'auto',
          }}>
          {popularLoading ? (
            <div className={styles.loadingText}>Завантаження...</div>
          ) : isLoading ? (
            <div className={styles.loadingText}>Пошук...</div>
          ) : displaySuggestions.length > 0 ? (
            <Stack gap={0}>
              {inputValue.length < 2 && popularCities.length > 0 && (
                <div className={styles.suggestionHeader}>Популярні міста</div>
              )}
              {displaySuggestions.map((city) => (
                <div key={city.ref} className={styles.suggestionItem} onClick={() => handleCitySelect(city)}>
                  {city.name}
                </div>
              ))}
            </Stack>
          ) : inputValue.length >= 2 ? (
            <div className={styles.loadingText}>Міста не знайдені</div>
          ) : null}
        </Paper>
      )}
    </div>
  );
};
