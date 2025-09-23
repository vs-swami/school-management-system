import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Minus,
  ShoppingCart,
  Receipt,
  History,
  User,
  School,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  QrCode,
  CreditCard,
  Building,
  Search,
  Filter,
  RefreshCw,
  Download,
  MoreVertical,
  Coffee,
  BookOpen,
  Bus,
  Library,
  Printer,
  Mail,
  ChevronDown,
  ChevronUp,
  Users,
  AlertCircle,
  Grid3x3,
  List,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, FloatingActionButton } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import {
  useStudentService,
  useStudentWalletService
} from '../../../../application/hooks/useServices';

const WalletCard = ({ wallet, onTopup, onPurchase, onViewHistory }) => {
  const getLowBalanceColor = () => {
    if (wallet.currentBalance < 100) return 'text-red-600 bg-red-50';
    if (wallet.currentBalance < 500) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{wallet.studentName}</h3>
            <p className="text-xs text-gray-500">{wallet.registrationNumber}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          wallet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {wallet.status}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Current Balance</p>
        <div className={`inline-flex items-center px-3 py-1 rounded-lg ${getLowBalanceColor()}`}>
          <DollarSign className="w-4 h-4 mr-1" />
          <span className="text-xl font-bold">₹{wallet.currentBalance.toLocaleString()}</span>
        </div>
        {wallet.currentBalance < 100 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Low balance! Please topup
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <p className="text-gray-500">Daily Limit</p>
          <p className="font-semibold text-gray-900">₹{wallet.dailyLimit || 500}</p>
        </div>
        <div>
          <p className="text-gray-500">Today's Spend</p>
          <p className="font-semibold text-gray-900">₹{wallet.todaySpend || 0}</p>
        </div>
        <div>
          <p className="text-gray-500">Total Topup</p>
          <p className="font-semibold text-gray-900">₹{wallet.totalTopup || 0}</p>
        </div>
        <div>
          <p className="text-gray-500">Total Spent</p>
          <p className="font-semibold text-gray-900">₹{wallet.totalSpent || 0}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => onTopup(wallet)}
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-1" />
          Topup
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPurchase(wallet)}
          className="flex-1"
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          Purchase
        </Button>
        <IconButton
          size="sm"
          onClick={() => onViewHistory(wallet)}
        >
          <History className="w-4 h-4" />
        </IconButton>
      </div>
    </div>
  );
};

const TopupDialog = ({ wallet, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const quickAmounts = [100, 200, 500, 1000, 2000];

  const handleConfirm = () => {
    if (!amount || amount <= 0) return;

    onConfirm({
      walletId: wallet.id,
      amount: parseFloat(amount),
      paymentMethod,
      referenceNumber
    });

    setAmount('');
    setReferenceNumber('');
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-900">
          Current Balance: <span className="font-bold">₹{wallet?.currentBalance || 0}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Amount Selection</label>
        <div className="flex gap-2 flex-wrap">
          {quickAmounts.map(quickAmount => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                amount === quickAmount.toString()
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              ₹{quickAmount}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Topup Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="upi">UPI</option>
        </select>
      </div>

      {paymentMethod !== 'cash' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Transaction ID or Reference"
          />
        </div>
      )}

      {amount && parseFloat(amount) > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            New balance after topup: <span className="font-bold">
              ₹{((wallet?.currentBalance || 0) + parseFloat(amount)).toLocaleString()}
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!amount || parseFloat(amount) <= 0}
          className="flex-1"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirm Topup
        </Button>
      </div>
    </div>
  );
};

const PurchaseDialog = ({ wallet, onClose, onConfirm }) => {
  const [category, setCategory] = useState('canteen');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const categories = [
    { value: 'canteen', label: 'Canteen', icon: Coffee },
    { value: 'stationery', label: 'Stationery', icon: BookOpen },
    { value: 'transport', label: 'Transport', icon: Bus },
    { value: 'library', label: 'Library', icon: Library },
    { value: 'other', label: 'Other', icon: ShoppingCart }
  ];

  const handleConfirm = () => {
    if (!amount || amount <= 0 || !description) return;

    if (parseFloat(amount) > wallet.currentBalance) {
      alert('Insufficient balance!');
      return;
    }

    onConfirm({
      walletId: wallet.id,
      amount: parseFloat(amount),
      category,
      description,
      items: []
    });

    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-900">
          Available Balance: <span className="font-bold">₹{wallet?.currentBalance || 0}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                  category === cat.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              parseFloat(amount) > wallet?.currentBalance
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="0"
          />
        </div>
        {parseFloat(amount) > wallet?.currentBalance && (
          <p className="text-xs text-red-600 mt-1">Insufficient balance</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What was purchased?"
        />
      </div>

      {amount && parseFloat(amount) > 0 && parseFloat(amount) <= wallet?.currentBalance && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            Balance after purchase: <span className="font-bold">
              ₹{((wallet?.currentBalance || 0) - parseFloat(amount)).toLocaleString()}
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="warning"
          onClick={handleConfirm}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > wallet?.currentBalance || !description}
          className="flex-1"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirm Purchase
        </Button>
      </div>
    </div>
  );
};

const TransactionHistory = ({ transactions }) => {
  const getTransactionIcon = (type, category) => {
    if (type === 'topup') return <TrendingUp className="w-5 h-5 text-green-500" />;
    switch(category) {
      case 'canteen': return <Coffee className="w-5 h-5 text-yellow-600" />;
      case 'stationery': return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'transport': return <Bus className="w-5 h-5 text-purple-600" />;
      case 'library': return <Library className="w-5 h-5 text-indigo-600" />;
      default: return <TrendingDown className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-3">
      {transactions.length > 0 ? (
        transactions.map(txn => (
          <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                {getTransactionIcon(txn.transactionType, txn.category)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(txn.createdAt).toLocaleString()} | Balance: ₹{txn.balanceAfter}
                </p>
              </div>
            </div>
            <p className={`text-sm font-bold ${
              txn.transactionType === 'topup' ? 'text-green-600' : 'text-red-600'
            }`}>
              {txn.transactionType === 'topup' ? '+' : '-'}₹{txn.amount}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-4">No transactions yet</p>
      )}
    </div>
  );
};

const WalletManagement = () => {
  const navigate = useNavigate();
  const walletService = useStudentWalletService();

  const [activeTab, setActiveTab] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [lowBalanceWallets, setLowBalanceWallets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showTopupDialog, setShowTopupDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWallets();
    fetchStatistics();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const result = await walletService.getAllWallets();
      if (result.success) {
        setWallets(result.data || []);
        const lowBalance = (result.data || []).filter(w => w.currentBalance < 100);
        setLowBalanceWallets(lowBalance);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await walletService.getWalletStatistics();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchTransactionHistory = async (walletId) => {
    try {
      const result = await walletService.getWalletTransactions(walletId);
      if (result.success) {
        setTransactions(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleTopup = (wallet) => {
    setSelectedWallet(wallet);
    setShowTopupDialog(true);
  };

  const handlePurchase = (wallet) => {
    setSelectedWallet(wallet);
    setShowPurchaseDialog(true);
  };

  const handleViewHistory = async (wallet) => {
    setSelectedWallet(wallet);
    await fetchTransactionHistory(wallet.id);
    setShowHistoryDialog(true);
  };

  const confirmTopup = async (topupData) => {
    try {
      const result = await walletService.processTopup(topupData.walletId, topupData);
      if (result.success) {
        fetchWallets();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error processing topup:', error);
    }
  };

  const confirmPurchase = async (purchaseData) => {
    try {
      const result = await walletService.processPurchase(purchaseData.walletId, purchaseData);
      if (result.success) {
        fetchWallets();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
    }
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wallet.registrationNumber.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || wallet.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderStatistics = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Total Wallets</p>
            <p className="text-2xl font-bold text-gray-900">{statistics?.totalWallets || 0}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Active Wallets</p>
            <p className="text-2xl font-bold text-gray-900">{statistics?.activeWallets || 0}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900">₹{statistics?.totalBalance?.toLocaleString() || 0}</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Low Balance</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics?.lowBalanceCount || 0}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderWalletList = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No.</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Limit</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Spend</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredWallets.map(wallet => (
            <tr key={wallet.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wallet.studentName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wallet.registrationNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className={`font-bold ${
                  wallet.currentBalance < 100 ? 'text-red-600' :
                  wallet.currentBalance < 500 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  ₹{wallet.currentBalance.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{wallet.dailyLimit || 500}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{wallet.todaySpend || 0}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  wallet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {wallet.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center gap-1">
                  <IconButton size="xs" onClick={() => handleTopup(wallet)}>
                    <Plus className="w-4 h-4" />
                  </IconButton>
                  <IconButton size="xs" onClick={() => handlePurchase(wallet)}>
                    <ShoppingCart className="w-4 h-4" />
                  </IconButton>
                  <IconButton size="xs" onClick={() => handleViewHistory(wallet)}>
                    <History className="w-4 h-4" />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage student wallets, process topups and track purchases
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/finance/wallets/bulk-topup')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Bulk Topup
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/finance/wallets/create')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Wallet
          </Button>
        </div>
      </div>

      {renderStatistics()}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {['All Wallets', 'Low Balance', 'Reports'].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index)}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
                {index === 1 && lowBalanceWallets.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {lowBalanceWallets.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or registration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex gap-1 border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <IconButton onClick={fetchWallets}>
              <RefreshCw className="w-4 h-4" />
            </IconButton>
          </div>

          {activeTab === 0 && (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWallets.map(wallet => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    onTopup={handleTopup}
                    onPurchase={handlePurchase}
                    onViewHistory={handleViewHistory}
                  />
                ))}
              </div>
            ) : (
              renderWalletList()
            )
          )}

          {activeTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowBalanceWallets.length > 0 ? (
                lowBalanceWallets.map(wallet => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    onTopup={handleTopup}
                    onPurchase={handlePurchase}
                    onViewHistory={handleViewHistory}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">All wallets have sufficient balance!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Wallet Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Topups Today</span>
                      <span className="text-sm font-bold">₹12,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Purchases Today</span>
                      <span className="text-sm font-bold">₹8,300</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm text-gray-600">Net Balance Change</span>
                      <span className="text-sm font-bold text-green-600">+₹4,200</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Canteen</span>
                      <span className="text-sm font-bold">₹5,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stationery</span>
                      <span className="text-sm font-bold">₹2,100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Other</span>
                      <span className="text-sm font-bold">₹1,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showTopupDialog && selectedWallet && (
        <Modal
          isOpen={showTopupDialog}
          onClose={() => setShowTopupDialog(false)}
          title={`Topup Wallet - ${selectedWallet.studentName}`}
        >
          <TopupDialog
            wallet={selectedWallet}
            onClose={() => setShowTopupDialog(false)}
            onConfirm={confirmTopup}
          />
        </Modal>
      )}

      {showPurchaseDialog && selectedWallet && (
        <Modal
          isOpen={showPurchaseDialog}
          onClose={() => setShowPurchaseDialog(false)}
          title={`Record Purchase - ${selectedWallet.studentName}`}
        >
          <PurchaseDialog
            wallet={selectedWallet}
            onClose={() => setShowPurchaseDialog(false)}
            onConfirm={confirmPurchase}
          />
        </Modal>
      )}

      {showHistoryDialog && selectedWallet && (
        <Modal
          isOpen={showHistoryDialog}
          onClose={() => setShowHistoryDialog(false)}
          title={`Transaction History - ${selectedWallet.studentName}`}
        >
          <TransactionHistory transactions={transactions} />
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowHistoryDialog(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => navigate('/finance/wallets/topup')}>
        <Plus className="w-6 h-6" />
      </FloatingActionButton>
    </div>
  );
};

export default WalletManagement;