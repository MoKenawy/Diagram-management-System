import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Grid from '@mui/material/Grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSystemConfig, useUpdateSystemConfig } from '@/hooks/queries/useAdminQueries';

export const AdminConfigPage = () => {
  const { data: config, isLoading } = useSystemConfig(); // Uses your exact hook name
  const updateMutation = useUpdateSystemConfig();

  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (config) setFormData(config);
  }, [config]);

  const handleChange = (key: string, value: string) => setFormData(p => ({ ...p, [key]: value }));

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      alert('تم حفظ الإعدادات بنجاح');
    } catch {
      alert('حدث خطأ');
    }
  };

  if (isLoading) return <Typography>جاري التحميل...</Typography>;

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" mb={4}>إعدادات النظام</Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField 
            fullWidth label="أقصى حجم للرفع (MB)" type="number"
            value={formData.max_upload_size_mb || ''} 
            onChange={e => handleChange('max_upload_size_mb', e.target.value)} 
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField 
            fullWidth label="مهلة الجلسة (دقائق)" type="number"
            value={formData.session_timeout_minutes || ''} 
            onChange={e => handleChange('session_timeout_minutes', e.target.value)} 
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Accordion variant="outlined">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">إعدادات LDAP (تكامل الدليل النشط)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField fullWidth size="small" label="LDAP Host" value={formData.ldap_host || ''} onChange={e => handleChange('ldap_host', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label="LDAP Port" type="number" value={formData.ldap_port || ''} onChange={e => handleChange('ldap_port', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" label="Bind DN" value={formData.ldap_bind_dn || ''} onChange={e => handleChange('ldap_bind_dn', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth size="small" label="Base DN" value={formData.ldap_base_dn || ''} onChange={e => handleChange('ldap_base_dn', e.target.value)} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending}>
          حفظ التغييرات
        </Button>
        <Button variant="outlined" onClick={() => config && setFormData(config)} disabled={updateMutation.isPending}>
          استعادة الإعدادات
        </Button>
      </Box>
    </Box>
  );
};