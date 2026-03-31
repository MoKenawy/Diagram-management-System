// src/controllers/reports.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as reportsService from '../services/reports.service';

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const summary = await reportsService.getSummary({ from, to });
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

export async function getUploadsOverTime(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to, granularity } = req.query as {
      from?: string;
      to?: string;
      granularity?: 'day' | 'week' | 'month';
    };
    const data = await reportsService.getUploadsOverTime({ from, to }, granularity || 'month');
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getDownloadsByDiagram(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await reportsService.getDownloadsByDiagram({ from, to });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getAccessByDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await reportsService.getAccessByDepartment({ from, to });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function exportReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to, format } = req.query as {
      from?: string;
      to?: string;
      format: 'pdf' | 'excel';
    };

    const range = { from, to };
    const [summary, uploadsOverTime, downloadsByDiagram, accessByDepartment] = await Promise.all([
      reportsService.getSummary(range),
      reportsService.getUploadsOverTime(range, 'month'),
      reportsService.getDownloadsByDiagram(range),
      reportsService.getAccessByDepartment(range),
    ]);

    if (format === 'excel') {
      await exportExcel(res, { summary, uploadsOverTime, downloadsByDiagram, accessByDepartment });
    } else {
      await exportPdf(res, { summary, uploadsOverTime, downloadsByDiagram, accessByDepartment });
    }
  } catch (err) {
    next(err);
  }
}

interface ReportData {
  summary: Awaited<ReturnType<typeof reportsService.getSummary>>;
  uploadsOverTime: Awaited<ReturnType<typeof reportsService.getUploadsOverTime>>;
  downloadsByDiagram: Awaited<ReturnType<typeof reportsService.getDownloadsByDiagram>>;
  accessByDepartment: Awaited<ReturnType<typeof reportsService.getAccessByDepartment>>;
}

async function exportExcel(res: Response, data: ReportData) {
  // Dynamic import to avoid issues if exceljs is not installed
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 35 },
    { header: 'Value', key: 'value', width: 25 },
  ];
  summarySheet.addRow({ metric: 'Total Active Diagrams', value: data.summary.totalActiveDiagrams });
  summarySheet.addRow({ metric: 'Total Versions', value: data.summary.totalVersions });
  summarySheet.addRow({ metric: 'Uploads This Month', value: data.summary.uploadsThisMonth });
  summarySheet.addRow({ metric: 'Downloads This Month', value: data.summary.downloadsThisMonth });
  summarySheet.addRow({ metric: 'Active Users This Month', value: data.summary.activeUsersThisMonth });
  summarySheet.addRow({ metric: 'Storage Used (bytes)', value: data.summary.storageUsedBytes });

  // Style header row
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Sheet 2: Uploads Over Time
  const uploadsSheet = workbook.addWorksheet('Uploads Over Time');
  uploadsSheet.columns = [
    { header: 'Period', key: 'period', width: 30 },
    { header: 'Count', key: 'count', width: 15 },
  ];
  data.uploadsOverTime.forEach((row) => uploadsSheet.addRow(row));
  uploadsSheet.getRow(1).font = { bold: true };
  uploadsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  uploadsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Sheet 3: Top Downloads
  const downloadsSheet = workbook.addWorksheet('Top Downloads');
  downloadsSheet.columns = [
    { header: 'Diagram ID', key: 'diagramId', width: 30 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Download Count', key: 'downloadCount', width: 20 },
  ];
  data.downloadsByDiagram.forEach((row) => downloadsSheet.addRow(row));
  downloadsSheet.getRow(1).font = { bold: true };
  downloadsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  downloadsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Sheet 4: By Department
  const deptSheet = workbook.addWorksheet('By Department');
  deptSheet.columns = [
    { header: 'Department ID', key: 'departmentId', width: 30 },
    { header: 'Name (AR)', key: 'nameAr', width: 30 },
    { header: 'Name (EN)', key: 'nameEn', width: 30 },
    { header: 'Diagram Count', key: 'diagramCount', width: 20 },
    { header: 'Download Count', key: 'downloadCount', width: 20 },
  ];
  data.accessByDepartment.forEach((row) => deptSheet.addRow(row));
  deptSheet.getRow(1).font = { bold: true };
  deptSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  deptSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="report-${new Date().toISOString().slice(0, 10)}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
}

async function exportPdf(res: Response, data: ReportData) {
  // Dynamic import PDFKit
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="report-${new Date().toISOString().slice(0, 10)}.pdf"`
  );

  doc.pipe(res);

  // Title
  doc.fontSize(22).font('Helvetica-Bold').text('System Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
  doc.moveDown(1.5);

  // Summary Section
  doc.fontSize(16).font('Helvetica-Bold').text('Summary');
  doc.moveDown(0.5);

  const summaryRows = [
    ['Total Active Diagrams', String(data.summary.totalActiveDiagrams)],
    ['Total Versions', String(data.summary.totalVersions)],
    ['Uploads This Month', String(data.summary.uploadsThisMonth)],
    ['Downloads This Month', String(data.summary.downloadsThisMonth)],
    ['Active Users This Month', String(data.summary.activeUsersThisMonth)],
    ['Storage Used (bytes)', String(data.summary.storageUsedBytes)],
  ];

  drawTable(doc, ['Metric', 'Value'], summaryRows, [300, 200]);
  doc.moveDown(1.5);

  // Uploads Over Time
  doc.fontSize(16).font('Helvetica-Bold').text('Uploads Over Time');
  doc.moveDown(0.5);

  if (data.uploadsOverTime.length > 0) {
    const uploadRows = data.uploadsOverTime.map((r) => [
      r.period.slice(0, 10),
      String(r.count),
    ]);
    drawTable(doc, ['Period', 'Count'], uploadRows, [300, 200]);
  } else {
    doc.fontSize(10).font('Helvetica').text('No data available.');
  }
  doc.moveDown(1.5);

  // Top Downloads
  if (doc.y > 650) doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').text('Top Downloads by Diagram');
  doc.moveDown(0.5);

  if (data.downloadsByDiagram.length > 0) {
    const dlRows = data.downloadsByDiagram.map((r) => [
      r.title.substring(0, 40),
      String(r.downloadCount),
    ]);
    drawTable(doc, ['Diagram Title', 'Downloads'], dlRows, [350, 150]);
  } else {
    doc.fontSize(10).font('Helvetica').text('No data available.');
  }
  doc.moveDown(1.5);

  // By Department
  if (doc.y > 550) doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').text('Access by Department');
  doc.moveDown(0.5);

  if (data.accessByDepartment.length > 0) {
    const deptRows = data.accessByDepartment.map((r) => [
      r.nameEn.substring(0, 30),
      String(r.diagramCount),
      String(r.downloadCount),
    ]);
    drawTable(doc, ['Department', 'Diagrams', 'Downloads'], deptRows, [250, 125, 125]);
  } else {
    doc.fontSize(10).font('Helvetica').text('No data available.');
  }

  doc.end();
}

function drawTable(doc: any, headers: string[], rows: string[][], colWidths: number[]) {
  const startX = doc.x;
  const rowHeight = 22;
  const fontSize = 9;
  const headerBg = '#4472C4';

  // Draw header
  let x = startX;
  doc.save();
  for (let i = 0; i < headers.length; i++) {
    doc.rect(x, doc.y, colWidths[i], rowHeight).fill(headerBg);
    doc
      .fill('#FFFFFF')
      .fontSize(fontSize)
      .font('Helvetica-Bold')
      .text(headers[i], x + 5, doc.y + 6, { width: colWidths[i] - 10, lineBreak: false });
    x += colWidths[i];
  }
  doc.restore();
  doc.y += rowHeight;

  // Draw rows
  for (const row of rows) {
    if (doc.y > 750) {
      doc.addPage();
    }

    x = startX;
    const isEven = rows.indexOf(row) % 2 === 0;

    for (let i = 0; i < row.length; i++) {
      if (isEven) {
        doc.save();
        doc.rect(x, doc.y, colWidths[i], rowHeight).fill('#F2F2F2');
        doc.restore();
      }
      doc
        .fill('#000000')
        .fontSize(fontSize)
        .font('Helvetica')
        .text(row[i], x + 5, doc.y + 6, { width: colWidths[i] - 10, lineBreak: false });
      x += colWidths[i];
    }
    doc.y += rowHeight;
  }
}