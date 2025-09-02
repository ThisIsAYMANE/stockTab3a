import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Plus, X, CheckCircle, Circle, Clock, AlertCircle, Filter, Search, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApi } from '../../hooks/useApi';
import { documentsAPI } from '../../services/api';
import PDFGenerator from '../../services/pdfGenerator';
import companyConfig from '../../config/company';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Document {
  id: number;
  type: 'supplier_purchase_order' | 'reception_slip' | 'stock_entry' | 'customer_sales_order' | 'delivery_note' | 'invoice';
  number: string;
  date: string;
  client?: string;
  supplier?: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  workflowStep: number;
  linkedDocuments?: number[];
}

const Documents: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const documents: Document[] = [
    {
      id: 1,
      type: 'supplier_purchase_order',
      number: 'BC-2024-001',
      date: '2024-01-15',
      supplier: 'PlastiPro',
      amount: 3500,
      status: 'sent',
      workflowStep: 1,
      linkedDocuments: [2, 3]
    },
    {
      id: 2,
      type: 'reception_slip',
      number: 'BR-2024-001',
      date: '2024-01-16',
      supplier: 'PlastiPro',
      amount: 3500,
      status: 'sent',
      workflowStep: 2,
      linkedDocuments: [1, 3]
    },
    {
      id: 3,
      type: 'stock_entry',
      number: 'ES-2024-001',
      date: '2024-01-16',
      supplier: 'PlastiPro',
      amount: 3500,
      status: 'sent',
      workflowStep: 3,
      linkedDocuments: [1, 2]
    },
    {
      id: 4,
      type: 'customer_sales_order',
      number: 'VT-2024-001',
      date: '2024-01-15',
      client: 'Ahmed Benali',
      amount: 1250,
      status: 'sent',
      workflowStep: 4,
      linkedDocuments: [5, 6]
    },
    {
      id: 5,
      type: 'delivery_note',
      number: 'BL-2024-001',
      date: '2024-01-14',
      client: 'Ahmed Benali',
      amount: 1250,
      status: 'sent',
      workflowStep: 5,
      linkedDocuments: [4, 6]
    },
    {
      id: 6,
      type: 'invoice',
      number: 'FA-2024-001',
      date: '2024-01-13',
      client: 'Ahmed Benali',
      amount: 1250,
      status: 'paid',
      workflowStep: 6,
      linkedDocuments: [4, 5]
    }
  ];

  const documentTypes = {
    all: 'Tous les documents',
    supplier_purchase_order: t('supplierPurchaseOrder'),
    reception_slip: t('receptionSlip'),
    stock_entry: t('stockEntry'),
    customer_sales_order: t('customerSalesOrder'),
    delivery_note: 'Bon de livraison',
    invoice: t('invoiceDoc')
  };

  const statusTypes = {
    all: 'Tous les statuts',
    draft: 'Brouillon',
    sent: 'Envoyé',
    paid: 'Payé',
    cancelled: 'Annulé'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.client && doc.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (doc.supplier && doc.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('documents')}</h2>
          <p className="text-gray-600 dark:text-gray-400">Gérer tous vos documents commerciaux</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
            Filtres
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Nouveau Document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Documents</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Payés</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {documents.filter(d => d.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {documents.filter(d => d.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Montant Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {documents.reduce((sum, d) => sum + d.amount, 0).toLocaleString()} DH
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder="Rechercher par numéro, client ou fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
            </div>
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Filtrer par type de document"
          >
            {Object.entries(documentTypes).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Filtrer par statut"
          >
            {Object.entries(statusTypes).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Documents Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Numéro</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Étape</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Client/Fournisseur</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Montant</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('linkedDocuments')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {getTypeIcon(doc.type)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {documentTypes[doc.type as keyof typeof documentTypes]}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-mono">{doc.number}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                      {doc.workflowStep}/6
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{doc.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {doc.client || doc.supplier}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                    {doc.amount.toLocaleString()} DH
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                      {statusTypes[doc.status as keyof typeof statusTypes]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {doc.linkedDocuments && doc.linkedDocuments.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded">
                        {doc.linkedDocuments.length} liés
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Voir le document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Télécharger PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                        title="Modifier le document"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer le document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredDocuments.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucun document trouvé</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Documents;