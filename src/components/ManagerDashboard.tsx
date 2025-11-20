import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { menuApi } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ManagerHeader } from './ManagerHeader';

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

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    image: '',
    category: 'milk-tea',
  });

  useEffect(() => {
    console.log('ManagerDashboard mounted, loading menu items...');
    loadMenuItems().catch(err => {
      console.error('Failed to load menu items in useEffect:', err);
    });
  }, []);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await menuApi.getAll();
      setMenuItems(items);
      console.log('Menu items loaded successfully:', items);
    } catch (err) {
      console.error('Error loading menu items:', err);
      setError('Failed to load menu items from server. You can still add new items.');
      setMenuItems([]);
    } finally {
      setIsLoading(false);
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
                        <span className="font-semibold">Price:</span> ${item.basePrice.toFixed(2)}
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
        <Card>
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
