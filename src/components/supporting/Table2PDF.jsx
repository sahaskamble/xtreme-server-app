import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

/**
 * Component to export table data to PDF
 * @param {Object} props - Component props
 * @param {Array} props.data - Data to export
 * @param {Array} props.columns - Column definitions
 * @param {string} props.fileName - Name of the PDF file
 * @param {string} props.title - Title of the PDF document
 * @returns {JSX.Element} - PDF export button
 */
export function PDFExport({ data, columns, fileName = "export.pdf", title = "Export" }) {
  const handleExport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    
    // Add date
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      14, 30
    );
    
    // Prepare table data
    const tableColumn = columns
      .filter(col => col.id !== "actions" && col.accessorKey)
      .map(col => {
        // Use header text if it's a string, otherwise use accessorKey
        return typeof col.header === 'string' ? col.header : col.accessorKey;
      });
    
    const tableRows = data.map(item => {
      return columns
        .filter(col => col.id !== "actions" && col.accessorKey)
        .map(col => {
          const value = item[col.accessorKey];
          return value !== undefined ? value.toString() : '';
        });
    });
    
    // Add table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 40 },
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(fileName);
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <FileDown className="h-4 w-4" />
      <span>Export PDF</span>
    </Button>
  );
}
