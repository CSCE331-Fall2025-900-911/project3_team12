import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { menuApi, managersApi, Manager, inventoryApi, InventoryItem, InventoryUsageReport, reportsApi } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ManagerHeader } from './ManagerHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: string;
}

export function ManagerDashboard() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  // Reports state
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [salesReport, setSalesReport] = useState<any | null>(null);
  const [popularReport, setPopularReport] = useState<any[] | null>(null);
  const [statusReport, setStatusReport] = useState<any[] | null>(null);

  // Sales date range state
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesEndDate, setSalesEndDate] = useState('');

  // Report timestamps for X/Z reports
  const [popularReportTime, setPopularReportTime] = useState<string | null>(null);
  const [statusReportTime, setStatusReportTime] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    image: '',
    category: 'milk-tea',
  });

  // User management state
  const [managers, setManagers] = useState<Manager[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);

  // Inventory management state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventorySuccess, setInventorySuccess] = useState<string | null>(null);
  const [showAddInventoryForm, setShowAddInventoryForm] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [inventoryFormData, setInventoryFormData] = useState({
    ingredient_name: '',
    quantity: '',
    unit: 'kg',
    min_quantity: '10',
  });

  // Reports state
  const [report, setReport] = useState<InventoryUsageReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    console.log('ManagerDashboard mounted, loading data...');
    loadMenuItems().catch(err => {
      console.error('Failed to load menu items in useEffect:', err);
    });
    loadManagers().catch(err => {
      console.error('Failed to load managers in useEffect:', err);
    });
    loadInventory().catch(err => {
      console.error('Failed to load inventory in useEffect:', err);
    });
  }, []);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await menuApi.getAll();
      // Ensure basePrice is a number
      const normalizedItems = items.map(item => ({
        ...item,
        basePrice: typeof item.basePrice === 'string' ? parseFloat(item.basePrice) : item.basePrice
      }));
      setMenuItems(normalizedItems);
      console.log('Menu items loaded successfully:', normalizedItems);
    } catch (err) {
      console.error('Error loading menu items:', err);
      setError('Failed to load menu items from server. You can still add new items.');
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      setIsLoadingManagers(true);
      setUserError(null);
      const managerList = await managersApi.getAll();
      setManagers(managerList);
      console.log('Managers loaded successfully:', managerList);
    } catch (err) {
      console.error('Error loading managers:', err);
      setUserError('Failed to load managers from server.');
      setManagers([]);
    } finally {
      setIsLoadingManagers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        image: formData.image,
        category: formData.category,
      };

      if (editingItem) {
        await menuApi.update(editingItem.id, itemData);
        setSuccess('Menu item updated successfully!');
      } else {
        await menuApi.create(itemData);
        setSuccess('Menu item added successfully!');
      }

      resetForm();
      await loadMenuItems();
    } catch (err) {
      setError(editingItem ? 'Failed to update menu item' : 'Failed to add menu item');
      console.error(err);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      basePrice: item.basePrice.toString(),
      image: item.image,
      category: item.category,
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      setError(null);
      await menuApi.delete(id);
      setSuccess('Menu item deleted successfully!');
      await loadMenuItems();
    } catch (err) {
      setError('Failed to delete menu item');
      console.error(err);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      image: '',
      category: 'milk-tea',
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      setUserError('Please enter a valid email address');
      return;
    }

    try {
      // Add manager to the database
      await managersApi.add(newUserEmail);
      setUserSuccess(`Manager ${newUserEmail} added successfully!`);
      setNewUserEmail('');
      
      // Reload managers list
      await loadManagers();

      // Clear success message after 3 seconds
      setTimeout(() => setUserSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error adding manager:', err);
      if (err.message?.includes('already exists')) {
        setUserError('This email is already in the system');
      } else {
        setUserError('Failed to add manager. Please try again.');
      }
    }
  };

  const handleRemoveUser = async (managerId: number, email: string) => {
    if (confirm(`Are you sure you want to remove ${email}?`)) {
      try {
        await managersApi.delete(managerId);
        setUserSuccess(`Manager ${email} removed successfully!`);
        
        // Reload managers list
        await loadManagers();
        
        setTimeout(() => setUserSuccess(null), 3000);
      } catch (err: any) {
        console.error('Error removing manager:', err);
        setUserError(err.message || 'Failed to remove manager. Please try again.');
      }
    }
  };

  // Inventory management functions
  const loadInventory = async () => {
    try {
      setIsLoadingInventory(true);
      setInventoryError(null);
      const items = await inventoryApi.getAll();
      setInventory(items);
      console.log('Inventory loaded successfully:', items);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setInventoryError('Failed to load inventory from server.');
      setInventory([]);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInventoryError(null);
    setInventorySuccess(null);

    try {
      const itemData = {
        ingredient_name: inventoryFormData.ingredient_name,
        quantity: parseFloat(inventoryFormData.quantity),
        unit: inventoryFormData.unit,
        min_quantity: parseFloat(inventoryFormData.min_quantity),
      };

      if (editingInventoryItem) {
        await inventoryApi.update(editingInventoryItem.id, itemData);
        setInventorySuccess('Inventory item updated successfully!');
      } else {
        await inventoryApi.add(itemData);
        setInventorySuccess('Inventory item added successfully!');
      }

      resetInventoryForm();
      await loadInventory();
      setTimeout(() => setInventorySuccess(null), 3000);
    } catch (err: any) {
      setInventoryError(editingInventoryItem ? 'Failed to update inventory item' : 'Failed to add inventory item');
      console.error(err);
    }
  };

  const handleEditInventory = (item: InventoryItem) => {
    setEditingInventoryItem(item);
    setInventoryFormData({
      ingredient_name: item.ingredient_name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      min_quantity: item.min_quantity.toString(),
    });
    setShowAddInventoryForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteInventory = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      setInventoryError(null);
      await inventoryApi.delete(id);
      setInventorySuccess('Inventory item deleted successfully!');
      await loadInventory();
      setTimeout(() => setInventorySuccess(null), 3000);
    } catch (err) {
      setInventoryError('Failed to delete inventory item');
      console.error(err);
    }
  };

  const resetInventoryForm = () => {
    setShowAddInventoryForm(false);
    setEditingInventoryItem(null);
    setInventoryFormData({
      ingredient_name: '',
      quantity: '',
      unit: 'kg',
      min_quantity: '10',
    });
  };

  // Reports functions
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);
    setReport(null);

    if (!startDate || !endDate) {
      setReportError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setReportError('Start date must be before end date');
      return;
    }

    try {
      setIsLoadingReport(true);
      const reportData = await inventoryApi.getUsageReport(startDate, endDate);
      setReport(reportData);
    } catch (err: any) {
      console.error('Error generating report:', err);
      setReportError(err.message || 'Failed to generate report');
    } finally {
      setIsLoadingReport(false);
    }
  };

  console.log('ManagerDashboard rendering, user:', user, 'isLoading:', isLoading, 'menuItems:', menuItems.length);

  try {
    return (
      <div className="min-h-screen bg-gray-50">
        <ManagerHeader />
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name || 'Manager'}</p>
        </div>
        {/* Reports Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate database reports (sales, popular items, order status)</CardDescription>
          </CardHeader>
          <CardContent>
            {reportsError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{reportsError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 mb-4 items-end">
              <div className="flex items-center gap-2">
                <label className="text-sm">Sales From</label>
                <Input
                  type="date"
                  value={salesStartDate}
                  onChange={(e) => setSalesStartDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">To</label>
                <Input
                  type="date"
                  value={salesEndDate}
                  onChange={(e) => setSalesEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <Button onClick={async () => {
                setReportsError(null);
                setReportsLoading(true);
                try {
                  let data;
                  if (salesStartDate && salesEndDate) {
                    const startIso = new Date(salesStartDate + 'T00:00:00').toISOString();
                    const endIso = new Date(salesEndDate + 'T23:59:59.999').toISOString();
                    data = await reportsApi.getSalesSummary(startIso, endIso);
                  } else {
                    data = await reportsApi.getSalesSummary();
                  }
                  setSalesReport(data);
                } catch (err: any) {
                  console.error('Sales report error', err);
                  setReportsError(err?.message || 'Failed to generate sales report');
                } finally { setReportsLoading(false); }
              }}>
                Generate Sales Report
              </Button>

              <Button onClick={async () => {
                setReportsError(null);
                setReportsLoading(true);
                try {
                  // compute today's range explicitly
                  const now = new Date();
                  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
                  const startIso = startOfDay.toISOString();
                  const endIso = endOfDay.toISOString();
                  const data = await reportsApi.getPopularDrinks(startIso, endIso);
                  setPopularReport(data);
                  setPopularReportTime(new Date().toLocaleString());
                } catch (err: any) {
                  console.error('Popular report error', err);
                  setReportsError(err?.message || 'Failed to generate popular items report');
                } finally { setReportsLoading(false); }
              }}>
                Generate Popular Items (X Report)
              </Button>

              <Button onClick={async () => {
                setReportsError(null);
                setReportsLoading(true);
                try {
                  // today's range
                  const now = new Date();
                  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
                  const startIso = startOfDay.toISOString();
                  const endIso = endOfDay.toISOString();
                  const data = await reportsApi.getOrdersByStatus(startIso, endIso);
                  setStatusReport(data);
                  setStatusReportTime(new Date().toLocaleString());
                } catch (err: any) {
                  console.error('Status report error', err);
                  setReportsError(err?.message || 'Failed to generate orders-by-status report');
                } finally { setReportsLoading(false); }
              }}>
                Generate Orders-by-Status (Z Report)
              </Button>
            </div>

            {reportsLoading && <div className="text-sm text-gray-600">Generating report...</div>}

            {salesReport && (
              <div className="mt-4">
                <h4 className="font-semibold">Sales Summary</h4>
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded-md">{JSON.stringify(salesReport, null, 2)}</pre>
              </div>
            )}

            {popularReport && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Popular Items</h4>
                  {popularReportTime && <div className="text-sm text-gray-500">As of: {popularReportTime}</div>}
                </div>
                <table className="w-full text-sm mt-2 border-collapse">
                  <thead>
                    <tr className="text-left border-b"><th>Name</th><th>Times Ordered</th><th>Total Quantity</th></tr>
                  </thead>
                  <tbody>
                    {popularReport.map((r) => (
                      <tr key={r.id} className="border-b odd:bg-white even:bg-gray-50">
                        <td className="py-2">{r.name}</td>
                        <td className="py-2">{r.times_ordered}</td>
                        <td className="py-2">{r.total_quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {statusReport && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Orders by Status</h4>
                  {statusReportTime && <div className="text-sm text-gray-500">As of: {statusReportTime}</div>}
                </div>
                <table className="w-full text-sm mt-2 border-collapse">
                  <thead>
                    <tr className="text-left border-b"><th>Status</th><th>Count</th><th>Total Value</th></tr>
                  </thead>
                  <tbody>
                    {statusReport.map((s, idx) => (
                      <tr key={idx} className="border-b odd:bg-white even:bg-gray-50">
                        <td className="py-2">{s.status}</td>
                        <td className="py-2">{s.count}</td>
                        <td className="py-2">${parseFloat(s.total_value || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </CardContent>
        </Card>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="!flex !gap-4 !mb-6 !bg-transparent !h-auto !p-0 !w-fit">
            <TabsTrigger 
              value="menu"
              className="!bg-transparent !text-blue-800 hover:!bg-blue-50 data-[state=active]:!bg-blue-100 !px-6 !py-3 !rounded-md !font-medium !transition-all !shadow-md !border-2 !border-blue-600"
            >
              Menu Items
            </TabsTrigger>
            <TabsTrigger 
              value="inventory"
              className="!bg-transparent !text-blue-800 hover:!bg-blue-50 data-[state=active]:!bg-blue-100 !px-6 !py-3 !rounded-md !font-medium !transition-all !shadow-md !border-2 !border-blue-600"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="!bg-transparent !text-blue-800 hover:!bg-blue-50 data-[state=active]:!bg-blue-100 !px-6 !py-3 !rounded-md !font-medium !transition-all !shadow-md !border-2 !border-blue-600"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="!bg-transparent !text-blue-800 hover:!bg-blue-50 data-[state=active]:!bg-blue-100 !px-6 !py-3 !rounded-md !font-medium !transition-all !shadow-md !border-2 !border-blue-600"
            >
              User Management
            </TabsTrigger>
          </TabsList>

          {/* Menu Items Tab */}
          <TabsContent value="menu">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</CardTitle>
              <CardDescription>
                {editingItem ? 'Update the details of the menu item' : 'Add a new item to the menu'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="milk-tea">Milk Tea</option>
                    <option value="fruit-tea">Fruit Tea</option>
                    <option value="specialty">Specialty</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingItem ? 'Update' : 'Add'} Item</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Menu Items ({menuItems.length})</h2>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>Add New Item</Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-xl">Loading menu items...</div>
            </div>
          ) : menuItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600">No menu items found. Add your first item!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-md mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Price:</span> ${typeof item.basePrice === 'number' ? item.basePrice.toFixed(2) : parseFloat(item.basePrice).toFixed(2)}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Category:</span>{' '}
                        {item.category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="flex-1"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Overview of menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Milk Teas</p>
                <p className="text-2xl font-semibold">
                  {menuItems.filter((i) => i.category === 'milk-tea').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fruit Teas</p>
                <p className="text-2xl font-semibold">
                  {menuItems.filter((i) => i.category === 'fruit-tea').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Specialties</p>
                <p className="text-2xl font-semibold">
                  {menuItems.filter((i) => i.category === 'specialty').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            {inventoryError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{inventoryError}</AlertDescription>
              </Alert>
            )}

            {inventorySuccess && (
              <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
                <AlertDescription>{inventorySuccess}</AlertDescription>
              </Alert>
            )}

            {/* Add/Edit Inventory Form */}
            {showAddInventoryForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{editingInventoryItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</CardTitle>
                  <CardDescription>
                    {editingInventoryItem ? 'Update the inventory item details' : 'Add a new ingredient to inventory'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInventorySubmit} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="ingredient_name">Ingredient Name</Label>
                      <Input
                        id="ingredient_name"
                        value={inventoryFormData.ingredient_name}
                        onChange={(e) => setInventoryFormData({ ...inventoryFormData, ingredient_name: e.target.value })}
                        placeholder="e.g., Milk, Sugar, Tea"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          step="0.01"
                          min="0"
                          value={inventoryFormData.quantity}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, quantity: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <select
                          id="unit"
                          value={inventoryFormData.unit}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, unit: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          required
                        >
                          <option value="kg">Kilograms (kg)</option>
                          <option value="liters">Liters</option>
                          <option value="units">Units</option>
                          <option value="grams">Grams</option>
                          <option value="ml">Milliliters (ml)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="min_quantity">Minimum Quantity (Alert Threshold)</Label>
                      <Input
                        id="min_quantity"
                        type="number"
                        step="0.01"
                        min="0"
                        value={inventoryFormData.min_quantity}
                        onChange={(e) => setInventoryFormData({ ...inventoryFormData, min_quantity: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">{editingInventoryItem ? 'Update' : 'Add'} Item</Button>
                      <Button type="button" variant="outline" onClick={resetInventoryForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Inventory Items List */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Inventory ({inventory.length})</h2>
                {!showAddInventoryForm && (
                  <Button onClick={() => setShowAddInventoryForm(true)}>Add New Item</Button>
                )}
              </div>

              {isLoadingInventory ? (
                <div className="text-center py-8">
                  <div className="text-xl">Loading inventory...</div>
                </div>
              ) : inventory.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-600">No inventory items found. Add your first item!</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inventory.map((item) => (
                            <tr key={item.id} className={item.quantity <= item.min_quantity ? 'bg-red-50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">{item.ingredient_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{item.quantity} {item.unit}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{item.min_quantity} {item.unit}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.quantity <= item.min_quantity ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    In Stock
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditInventory(item)}
                                  className="mr-2"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteInventory(item.id, item.ingredient_name)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            {reportError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{reportError}</AlertDescription>
              </Alert>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Inventory Usage Report</CardTitle>
                <CardDescription>Generate reports on inventory usage between selected dates</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoadingReport}>
                    {isLoadingReport ? 'Generating Report...' : 'Generate Report'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Report Results */}
            {report && (
              <>
                {/* Summary Card */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Report Summary</CardTitle>
                    <CardDescription>
                      {new Date(report.dateRange.startDate).toLocaleDateString()} - {new Date(report.dateRange.endDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {report.reportType === 'detailed' ? (
                        <>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Items Used</p>
                            <p className="text-3xl font-bold text-blue-800">{report.summary.itemsUsed || 0}</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                            <p className="text-3xl font-bold text-green-800">${(report.summary.totalCost || 0).toFixed(2)}</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Units Used</p>
                            <p className="text-3xl font-bold text-purple-800">{(report.summary.totalUnitsUsed || 0).toFixed(2)}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                            <p className="text-3xl font-bold text-blue-800">{report.summary.totalOrders || 0}</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-800">${(report.summary.totalRevenue || 0).toFixed(2)}</p>
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            <Alert className="bg-yellow-50 border-yellow-200">
                              <AlertDescription className="text-sm">{report.summary.message}</AlertDescription>
                            </Alert>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Items Table */}
                {report.reportType === 'detailed' && report.items && report.items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Usage Breakdown</CardTitle>
                      <CardDescription>Item-by-item inventory usage details</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Used</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Unit Cost</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.items.map((item, index) => (
                              <tr key={index} className={item.totalUsed > 0 ? '' : 'opacity-50'}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{item.ingredientName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.totalUsed.toFixed(2)} {item.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${item.avgUnitCost.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-semibold">${item.totalCost.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.usageCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Current Inventory Snapshot (for basic reports) */}
                {report.reportType === 'basic' && report.currentInventory && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Inventory Snapshot</CardTitle>
                      <CardDescription>Current inventory levels at time of report</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Quantity</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Quantity</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.currentInventory.map((item) => (
                              <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{item.ingredient_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.quantity} {item.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.min_quantity} {item.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {item.quantity <= item.min_quantity ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      Low Stock
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      In Stock
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            {userError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{userError}</AlertDescription>
              </Alert>
            )}

            {userSuccess && (
              <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
                <AlertDescription>{userSuccess}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Add and manage authorized users</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add User Form */}
                <form onSubmit={handleAddUser} className="mb-6">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="Enter user email (e.g., user@example.com)"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit">Add User</Button>
                  </div>
                </form>

                {/* User List */}
                <div>
              <h3 className="text-lg font-semibold mb-3">Authorized Managers ({managers.length})</h3>
              {isLoadingManagers ? (
                <p className="text-gray-500 text-sm">Loading managers...</p>
              ) : managers.length === 0 ? (
                <p className="text-gray-500 text-sm">No managers added yet. Add your first manager above.</p>
              ) : (
                <div className="space-y-2">
                  {managers.map((manager) => (
                    <div
                      key={manager.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                    >
                      <span className="text-sm font-medium">{manager.email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(manager.id, manager.email)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error rendering ManagerDashboard:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error loading dashboard. Check console for details.</div>
      </div>
    );
  }
}

