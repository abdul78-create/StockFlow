import * as React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
  header: { borderBottom: '2px solid #111', paddingBottom: 15, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', justifyBetween: 'space-between', marginBottom: 5 },
  section: { marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 2 },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 5 },
  tableHeader: { backgroundColor: '#f9f9f9', fontWeight: 'bold' },
  col1: { width: '40%' },
  col2: { width: '20%', textAlign: 'right' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  totals: { alignSelf: 'flex-end', width: '40%', borderTop: '1px solid #111', paddingTop: 5 },
  totalRow: { flexDirection: 'row', justifyBetween: 'space-between', paddingVertical: 2 },
  bold: { fontWeight: 'bold' },
});

interface InvoicePDFProps {
  invoice: {
    invoiceNumber: string;
    issuedDate: string;
    dueDate?: string;
    totalAmount: number;
    balanceDue: number;
    notes?: string;
    customer?: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    items: Array<{
      id: string;
      product?: { name: string; sku: string };
      quantity: number;
      unitPrice: number;
      taxAmount?: number;
      totalAmount: number;
    }>;
  };
}

const InvoiceDocument = ({ invoice }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text>Invoice Number: {invoice.invoiceNumber}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontWeight: 'bold' }}>StockFlow Inventory</Text>
            <Text>Tenant Operations Inc.</Text>
          </View>
        </View>
      </View>

      {/* Bill To */}
      <View style={styles.section}>
        <Text style={styles.label}>BILL TO:</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{invoice.customer?.name || 'Valued Client'}</Text>
        {invoice.customer?.email && <Text>Email: {invoice.customer.email}</Text>}
        {invoice.customer?.phone && <Text>Phone: {invoice.customer.phone}</Text>}
        {invoice.customer?.address && <Text>Address: {invoice.customer.address}</Text>}
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <Text>Date Issued: {new Date(invoice.issuedDate).toLocaleDateString()}</Text>
        {invoice.dueDate && <Text>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</Text>}
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.col1}>Product / Details</Text>
          <Text style={styles.col2}>Quantity</Text>
          <Text style={styles.col3}>Unit Price</Text>
          <Text style={styles.col4}>Amount</Text>
        </View>
        {invoice.items.map(item => (
          <View key={item.id} style={styles.tableRow}>
            <View style={styles.col1}>
              <Text style={{ fontWeight: 'bold' }}>{item.product?.name || 'Product'}</Text>
              <Text style={{ fontSize: 8, color: '#666' }}>{item.product?.sku}</Text>
            </View>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>${Number(item.unitPrice).toFixed(2)}</Text>
            <Text style={styles.col4}>${Number(item.totalAmount).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Summary / Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={{ flex: 1 }}>Total</Text>
          <Text style={styles.bold}>${Number(invoice.totalAmount).toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={{ flex: 1 }}>Balance Due</Text>
          <Text style={styles.bold}>${Number(invoice.balanceDue).toFixed(2)}</Text>
        </View>
      </View>

      {/* Notes */}
      {invoice.notes && (
        <View style={[styles.section, { marginTop: 30 }]}>
          <Text style={styles.label}>Notes:</Text>
          <Text>{invoice.notes}</Text>
        </View>
      )}
    </Page>
  </Document>
);

export function InvoicePDFButton({ invoice }: InvoicePDFProps) {
  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoice} />}
      fileName={`Invoice-${invoice.invoiceNumber}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Preparing...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
export default InvoicePDFButton;
