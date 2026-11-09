// src/components/dashboard/manager/UploadsChart.tsx
import { Card, CardContent, Typography, Skeleton } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { TimeSeriesPoint } from '@/types/index';
import type { ReactNode } from 'react';

interface UploadsChartProps {
  data: TimeSeriesPoint[];
  isLoading: boolean;
}


const formatPeriodLabel = (label: ReactNode): string => {
  if (!label) return '';
  const date = new Date(label.toString());
  return date.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' });
};

export const UploadsChart = ({ data, isLoading }: UploadsChartProps) => (
  <Card sx={{ borderRadius: 3, height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        الرفع عبر الزمن
      </Typography>

      {isLoading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="period" tickFormatter={formatPeriodLabel} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip
              labelFormatter={formatPeriodLabel}
              contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#0059bb"
              strokeWidth={2}
              dot={{ r: 4, fill: '#0059bb' }}
              name="عدد الرفعات"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);