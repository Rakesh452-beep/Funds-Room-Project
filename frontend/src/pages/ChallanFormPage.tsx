import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { challanApi, customerApi, productApi } from '../services';
import { Customer, Product } from '../types';
import { formatCurrency, formatError, getStatusColor } from '../utils/helpers';
import { useToast } from '../components/Toast';
import { Loading } from '../components/Loading';

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  sku: string;
  unitPrice: number;
  currentStock: number;
}

const steps = ['Customer', 'Products', 'Review'];

export const ChallanFormPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState<'draft' | 'confirm' | null>(null);

  useEffect(() => {
    setLoadingCustomers(true);
    customerApi
      .getCustomers({ limit: 100 })
      .then((data) => setCustomers(data))
      .catch(() => showToast('Failed to load customers', 'error'))
      .finally(() => setLoadingCustomers(false));
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    productApi
      .getProducts({ limit: 100 })
      .then((data) => setProducts(data))
      .catch(() => showToast('Failed to load products', 'error'))
      .finally(() => setLoadingProducts(false));
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.businessName.toLowerCase().includes(q) ||
        c.mobile.includes(q)
    );
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleAddProduct = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: Math.min(i.quantity + 1, product.currentStock) } : i
        );
      }
      return [...prev, {
        productId: product.id,
        quantity: 1,
        name: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        currentStock: product.currentStock,
      }];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        const max = Math.max(i.currentStock, 1);
        return { ...i, quantity: Math.max(1, Math.min(qty, max)) };
      })
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleSubmit = async (status: 'DRAFT' | 'CONFIRMED') => {
    if (!selectedCustomer || cart.length === 0) return;
    setSubmitting(status.toLowerCase() as 'draft' | 'confirm');
    try {
      const res = await challanApi.createChallan({
        customerId: selectedCustomer.id,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        status,
      });

      if (status === 'CONFIRMED') {
        try {
          await challanApi.confirmChallan(res.data.id);
        } catch (confirmErr: any) {
          showToast(formatError(confirmErr, 'Created but couldn\'t confirm - insufficient stock'), 'error');
          navigate(`/challans/${res.data.id}`);
          return;
        }
        showToast('Challan created and confirmed — stock reduced');
      } else {
        showToast('Draft challan created');
      }
      navigate(`/challans/${res.data.id}`);
    } catch (err) {
      showToast(formatError(err, 'Failed to create challan'), 'error');
    } finally {
      setSubmitting(null);
    }
  };

  if (loadingCustomers || loadingProducts) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((label, idx) => (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => idx < step && setStep(idx)}
              className={`flex items-center gap-2 ${idx <= step ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                idx < step
                  ? 'bg-emerald-500 text-white'
                  : idx === step
                  ? 'gradient-bg text-white shadow-card'
                  : 'bg-surface-300 text-surface-400'
              }`}>
                {idx < step ? '✓' : idx + 1}
              </div>
              <span className={`text-sm font-medium ${idx <= step ? 'text-surface-900' : 'text-surface-500'}`}>{label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-1 rounded-full ${idx < step ? 'bg-emerald-500' : 'bg-surface-300'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {/* Step 1: Customer */}
        {step === 0 && (
          <div>
            <h3 className="font-semibold text-surface-900 mb-4">Select Customer</h3>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">🔍</span>
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="input !pl-11"
                placeholder="Search customer by name, business, mobile..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    selectedCustomer?.id === c.id
                      ? 'border-primary bg-primary/10 shadow-card'
                      : 'border-surface-200 bg-surface-100 hover:border-primary/40'
                  }`}
                >
                  <div className="font-medium text-surface-900 text-sm">{c.businessName}</div>
                  <div className="text-xs text-surface-400 mt-0.5">{c.name}</div>
                  <div className="text-xs text-surface-500 mt-1">{c.mobile}</div>
                  <div className="flex gap-1.5 mt-2">
                    <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
                    <span className="badge bg-surface-200 text-surface-400">{c.customerType}</span>
                  </div>
                </button>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="col-span-full text-center text-surface-500 py-8">
                  No customers match. <Link to="/customers/new" className="text-primary">Add one first →</Link>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Products */}
        {step === 1 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-surface-900">Add Products</h3>
              <div className="text-xs text-surface-500">
                For: <span className="text-primary font-medium">{selectedCustomer?.businessName}</span>
              </div>
            </div>

            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">🔍</span>
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="input !pl-11"
                placeholder="Search products to add..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1 mb-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-surface-200 bg-surface-100">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-surface-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-surface-500">{p.sku}</div>
                    <div className={`text-[11px] mt-0.5 ${p.currentStock <= p.minStockAlert ? 'text-red-600' : 'text-surface-500'}`}>
                      Stock: {p.currentStock} · {formatCurrency(p.unitPrice)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddProduct(p)}
                    disabled={p.currentStock <= 0}
                    className="btn-primary !px-3 !py-1.5 !text-sm shrink-0 disabled:opacity-40"
                  >
                    {p.currentStock <= 0 ? 'Out' : '+ Add'}
                  </button>
                </div>
              ))}
            </div>

            {/* Cart */}
            <div className="border-t border-surface-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-surface-900 text-sm">Selected Items ({cart.length})</h4>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-xs text-red-600 hover:text-red-600/80">Clear all</button>
                )}
              </div>

              {cart.length === 0 ? (
                <p className="text-center text-surface-500 text-sm py-6">No products added yet</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl bg-surface-100 border border-surface-200">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-surface-900 truncate">{item.name}</div>
                        <div className="text-[11px] font-mono text-surface-500">{item.sku}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-surface-200 text-surface-500 hover:bg-surface-300"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item.currentStock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          className="w-14 text-center bg-surface-100 border border-surface-300 rounded-lg h-7 text-sm"
                        />
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-surface-200 text-surface-500 hover:bg-surface-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="w-20 text-right text-sm font-mono">{formatCurrency(item.unitPrice * item.quantity)}</div>
                      <button onClick={() => removeItem(item.productId)} className="text-surface-500 hover:text-red-600 px-1">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <div>
            <h3 className="font-semibold text-surface-900 mb-4">Review Challan</h3>

            <div className="bg-surface-100 border border-surface-200 rounded-xl p-4 mb-4">
              <div className="text-[11px] uppercase tracking-wider text-surface-500 mb-1">Customer</div>
              <div className="font-medium text-surface-900">{selectedCustomer?.businessName} ({selectedCustomer?.name})</div>
              <div className="text-xs text-surface-400 mt-0.5">{selectedCustomer?.mobile} · {selectedCustomer?.email}</div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-surface-200 mb-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-100">
                    <th className="table-header">Product</th>
                    <th className="table-header">SKU</th>
                    <th className="table-header">Qty</th>
                    <th className="table-header text-right">Unit Price</th>
                    <th className="table-header text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {cart.map((item) => (
                    <tr key={item.productId}>
                      <td className="table-cell text-surface-900">{item.name}</td>
                      <td className="table-cell font-mono text-xs text-surface-500">{item.sku}</td>
                      <td className="table-cell font-mono">{item.quantity}</td>
                      <td className="table-cell text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="table-cell text-right font-mono text-surface-900">{formatCurrency(item.unitPrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="space-y-1 text-right">
                <div className="text-sm text-surface-400">
                  Total Quantity: <span className="font-mono font-bold text-surface-900">{totalQuantity}</span>
                </div>
                <div className="text-sm text-surface-400">
                  Total Amount: <span className="font-mono font-bold gradient-text text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setStep(step - 1)} disabled={step === 0} className="btn-secondary disabled:opacity-30">
            ← Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 ? !selectedCustomer : cart.length === 0}
              className="btn-primary disabled:opacity-30"
            >
              Continue →
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={submitting !== null || cart.length === 0}
                className="btn-secondary"
              >
                {submitting === 'draft' ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSubmit('CONFIRMED')}
                disabled={submitting !== null || cart.length === 0}
                className="btn-primary"
              >
                {submitting === 'confirm' ? 'Confirming...' : '✓ Confirm Challan'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
