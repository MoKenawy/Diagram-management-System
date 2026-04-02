// src/hooks/useDateRange.ts
import { useState, useCallback, useMemo } from 'react';
import type { ReportDateParams } from '@/types/index';

const toISODate = (date: Date): string => date.toISOString().split('T')[0];

const getDefaultFrom = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  return toISODate(date);
};

const getDefaultTo = (): string => toISODate(new Date());

export const useDateRange = () => {
  const [from, setFrom] = useState(getDefaultFrom);
  const [to, setTo] = useState(getDefaultTo);

  const params = useMemo((): ReportDateParams => ({
    from: new Date(from).toISOString(),
    to: new Date(`${to}T23:59:59.999Z`).toISOString(),
  }), [from, to]);

  const setFromDate = useCallback((value: string) => setFrom(value), []);
  const setToDate = useCallback((value: string) => setTo(value), []);

  return { from, to, params, setFromDate, setToDate } as const;
};