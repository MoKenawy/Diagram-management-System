// src/components/dashboard/manager/DepartmentDownloadsChart.tsx
import { Card, CardContent, Typography, Skeleton } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { DepartmentAccessStats } from '@/types/index';

interface DepartmentDownloadsChartProps {
  data: DepartmentAccessStats[];
  isLoading: boolean;
}

export const DepartmentDownloadsChart = ({ data, isLoading }: DepartmentDownloadsChartProps) => (
  <Card sx={{ borderRadius: 3, height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        التحميلات حسب القسم
      </Typography>

      {isLoading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="nameAr" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0' }} />
            <Bar
              dataKey="downloadCount"
              fill="#1565c0"
              radius={[6, 6, 0, 0]}
              name="التحميلات"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);