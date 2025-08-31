'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateOliveBranch } from '@/lib/oliveGenerator';
import { OLIVE_BRANCH_BG_COLOR } from '@/lib/oliveGenerator';

interface InventoryItem {
  id: string;
  type: 'seed' | 'branch';
  data?: any; // For olive branch data
  createdAt: string;
  quantity?: number; // For stacking seeds
  rarity?: {
    count: string;
    type: string;
    countPercentage: number;
    typePercentage: number;
  };
}

interface UserData {
  username: string;
  email: string;
  role: string;
  onset: string;
  idNo: string;
  bio: string;
  isEmailVerified: boolean;
  oliveBranch?: any;
  activeOliveBranchId?: string;
  inventory?: InventoryItem[];
  seedCount?: number;
}

type SortType = 'newest' | 'oldest' | 'rarity';

const ITEMS_PER_PAGE = 16; // 4x4 grid
const MAX_PAGES = 5;
const MAX_ITEMS = 80;

// Generic seed SVG
const SEED_SVG = `<svg width="100%" height="100%" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="70" fill="${OLIVE_BRANCH_BG_COLOR}"/>
<!-- Seed cluster -->
<rect x="28" y="28" width="4" height="4" fill="#D2B48C"/>
<rect x="32" y="30" width="4" height="4" fill="#CD853F"/>
<rect x="36" y="32" width="4" height="4" fill="#DEB887"/>
<rect x="30" y="34" width="4" height="4" fill="#F5DEB3"/>
<rect x="34" y="36" width="4" height="4" fill="#D2B48C"/>
<rect x="38" y="34" width="4" height="4" fill="#CD853F"/>
</svg>`;

export default function InventoryPage() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState<SortType>('newest');
  const [isPlanting, setIsPlanting] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [plantingBranch, setPlantingBranch] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteQuantity, setDeleteQuantity] = useState(1);
  const [maxDeleteQuantity, setMaxDeleteQuantity] = useState(1);

  // Load user data
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const storedUser = localStorage.getItem('galwayUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Demo: Add registration branch to inventory if none exist
        if (!parsed.inventory || parsed.inventory.length === 0) {
          const inventoryItems: InventoryItem[] = [];
          
          // Add registration olive branch if it exists
          if (parsed.oliveBranch) {
            const registrationBranch: InventoryItem = {
              id: parsed.activeOliveBranchId || `branch_registration_${Date.now()}`,
              type: 'branch',
              data: parsed.oliveBranch,
              createdAt: new Date(parsed.accountCreated || Date.now()).toISOString(),
              rarity: parsed.oliveBranch.rarity
            };
            inventoryItems.push(registrationBranch);
            
            // Set active branch ID if not set
            if (!parsed.activeOliveBranchId) {
              parsed.activeOliveBranchId = registrationBranch.id;
            }
          }
          
          parsed.inventory = inventoryItems;
          parsed.seedCount = 0;
          localStorage.setItem('galwayUser', JSON.stringify(parsed));
        }
        
        // Ensure seedCount matches actual seed quantity in inventory
        const seedItem = parsed.inventory?.find((item: InventoryItem) => item.type === 'seed');
        if (seedItem && seedItem.quantity) {
          parsed.seedCount = seedItem.quantity;
        }
        
        setUserData(parsed);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, [isLoggedIn, router]);

  // Get inventory items with sorting
  const getSortedInventory = (): InventoryItem[] => {
    if (!userData?.inventory) return [];
    
    let items = [...userData.inventory];
    
    switch (sortType) {
      case 'newest':
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rarity':
        const rarityOrder = { 'Very Rare': 4, 'Rare': 3, 'Uncommon': 2, 'Common': 1 };
        items.sort((a, b) => {
          if (a.type === 'seed' && b.type !== 'seed') return -1;
          if (b.type === 'seed' && a.type !== 'seed') return 1;
          if (a.type === 'seed' && b.type === 'seed') return 0;
          
          const aRarity = a.rarity ? (rarityOrder[a.rarity.count as keyof typeof rarityOrder] || 0) : 0;
          const bRarity = b.rarity ? (rarityOrder[b.rarity.count as keyof typeof rarityOrder] || 0) : 0;
          return bRarity - aRarity;
        });
        break;
    }
    
    // Always put seeds first regardless of sort
    const seeds = items.filter(item => item.type === 'seed');
    const branches = items.filter(item => item.type === 'branch');
    
    return [...seeds, ...branches];
  };

  // Paginate items
  const getPaginatedItems = () => {
    const sorted = getSortedInventory();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sorted.slice(startIndex, endIndex);
  };

  // Get total pages needed
  const getTotalPages = () => {
    const totalItems = userData?.inventory?.length || 0;
    return Math.min(Math.ceil(totalItems / ITEMS_PER_PAGE), MAX_PAGES);
  };

  // Plant seed function
  const handlePlantSeed = async () => {
    if (!userData || isPlanting) return;
    
    setIsPlanting(true);
    
    try {
      // Generate new olive branch
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newBranch = generateOliveBranch();
      
      // Create new inventory item
      const newItem: InventoryItem = {
        id: `branch_${Date.now()}`,
        type: 'branch',
        data: newBranch,
        createdAt: new Date().toISOString(),
        rarity: newBranch.rarity
      };
      
      // Update seed stack or remove if quantity becomes 0
      const currentInventory = userData.inventory || [];
      const seedIndex = currentInventory.findIndex(item => item.type === 'seed');
      
      let updatedInventory;
      if (seedIndex !== -1) {
        const seedStack = currentInventory[seedIndex];
        const newQuantity = (seedStack.quantity || 1) - 1;
        
        if (newQuantity > 0) {
          // Update seed stack quantity
          updatedInventory = [
            ...currentInventory.slice(0, seedIndex),
            { ...seedStack, quantity: newQuantity },
            ...currentInventory.slice(seedIndex + 1),
            newItem
          ];
        } else {
          // Remove seed stack if quantity reaches 0
          updatedInventory = [
            ...currentInventory.slice(0, seedIndex),
            ...currentInventory.slice(seedIndex + 1),
            newItem
          ];
        }
      } else {
        updatedInventory = [...currentInventory, newItem];
      }
      
      // Update seed count
      const newSeedCount = Math.max(0, (userData.seedCount || 0) - 1);
      
      const updatedUserData = {
        ...userData,
        inventory: updatedInventory,
        seedCount: newSeedCount
      };
      
      localStorage.setItem('galwayUser', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setPlantingBranch(newBranch);
      
    } catch (error) {
      console.error('Failed to plant seed:', error);
    } finally {
      setIsPlanting(false);
    }
  };

  // Delete item function
  const handleDeleteItem = async (itemId: string, quantityToDelete: number = 1) => {
    if (!userData) return;
    
    const currentInventory = userData.inventory || [];
    const itemIndex = currentInventory.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    const item = currentInventory[itemIndex];
    let updatedInventory;
    
    if (item.type === 'seed' && item.quantity && item.quantity > 1) {
      // Update seed stack quantity
      const newQuantity = item.quantity - quantityToDelete;
      
      if (newQuantity > 0) {
        updatedInventory = [
          ...currentInventory.slice(0, itemIndex),
          { ...item, quantity: newQuantity },
          ...currentInventory.slice(itemIndex + 1)
        ];
      } else {
        // Remove seed stack if quantity reaches 0
        updatedInventory = [
          ...currentInventory.slice(0, itemIndex),
          ...currentInventory.slice(itemIndex + 1)
        ];
      }
      
      // Update seed count
      const newSeedCount = Math.max(0, (userData.seedCount || 0) - quantityToDelete);
      
      const updatedUserData = {
        ...userData,
        inventory: updatedInventory,
        seedCount: newSeedCount
      };
      
      localStorage.setItem('galwayUser', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
    } else {
      // Remove single item (branch or single seed)
      updatedInventory = currentInventory.filter(item => item.id !== itemId);
      
      const updatedUserData = {
        ...userData,
        inventory: updatedInventory
      };
      
      localStorage.setItem('galwayUser', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
    }
    
    setShowDeleteModal(false);
    setItemToDelete(null);
    setDeleteQuantity(1);
  };

  // Add demo seeds function
  const handleAddDemoSeeds = () => {
    if (!userData) return;
    
    const currentInventory = userData.inventory || [];
    const seedIndex = currentInventory.findIndex(item => item.type === 'seed');
    
    let updatedInventory;
    if (seedIndex !== -1) {
      // Update existing seed stack
      const existingSeeds = currentInventory[seedIndex];
      const newQuantity = (existingSeeds.quantity || 1) + 10;
      
      updatedInventory = [
        ...currentInventory.slice(0, seedIndex),
        { ...existingSeeds, quantity: newQuantity },
        ...currentInventory.slice(seedIndex + 1)
      ];
    } else {
      // Create new seed stack
      const newSeedStack: InventoryItem = {
        id: `seed_stack_${Date.now()}`,
        type: 'seed',
        quantity: 10,
        createdAt: new Date().toISOString(),
      };
      
      updatedInventory = [newSeedStack, ...currentInventory];
    }
    
    const newSeedCount = (userData.seedCount || 0) + 10;
    
    const updatedUserData = {
      ...userData,
      inventory: updatedInventory,
      seedCount: newSeedCount
    };
    
    localStorage.setItem('galwayUser', JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
  };

  const renderInventorySlot = (item: InventoryItem | null, index: number) => {
    const isActive = item?.type === 'branch' && item.id === userData?.activeOliveBranchId;
    
    return (
      <div
        key={item?.id || `empty_${index}`}
        className={`aspect-square border-2 rounded-lg relative group transition-all duration-200 ${
          item 
            ? 'border-neutral-300 bg-white hover:border-neutral-400 cursor-pointer' 
            : 'border-neutral-200 bg-neutral-50 border-dashed'
        } ${isActive ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
      >
        {item ? (
          <>
            {/* Item content */}
            <div className="w-full h-full p-2">
              {item.type === 'seed' ? (
                <div className="relative w-full h-full">
                  <div 
                    className="w-full h-full rounded"
                    dangerouslySetInnerHTML={{ __html: SEED_SVG }}
                  />
                  {/* Quantity indicator */}
                  {item.quantity && item.quantity > 1 && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-mono rounded-full w-5 h-5 flex items-center justify-center">
                      {item.quantity}
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="w-full h-full rounded"
                  dangerouslySetInnerHTML={{ __html: item.data?.svg || '' }}
                />
              )}
            </div>
            
            {/* Item actions */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
              <button
                onClick={() => {
                  const foundItem = userData?.inventory?.find(i => i.id === item.id);
                  if (foundItem?.type === 'seed' && foundItem.quantity && foundItem.quantity > 1) {
                    setMaxDeleteQuantity(foundItem.quantity);
                    setDeleteQuantity(1);
                  }
                  setItemToDelete(item.id);
                  setShowDeleteModal(true);
                }}
                className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                title={item.type === 'seed' ? 'Discard seed' : 'Burn branch'}
              >
                ✕
              </button>
            </div>
            
            {/* Rarity indicator for branches */}
            {item.type === 'branch' && item.rarity && (
              <div className="absolute bottom-1 left-1 text-xs font-mono">
                <span className={`px-1 py-0.5 rounded text-white text-[10px] ${
                  item.rarity.count === 'Very Rare' ? 'bg-red-500' :
                  item.rarity.count === 'Rare' ? 'bg-purple-500' :
                  item.rarity.count === 'Uncommon' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {item.rarity.count[0]}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <div className="w-4 h-4 border-2 border-dashed border-current rounded"></div>
          </div>
        )}
      </div>
    );
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 font-mono">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const paginatedItems = getPaginatedItems();
  const totalPages = getTotalPages();
  const seedCount = userData.seedCount || 0;
  const inventoryCount = userData.inventory?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Inventory</h1>
            <p className="text-sm text-neutral-600 font-mono">
              {inventoryCount}/{MAX_ITEMS} slots used • {seedCount} seeds available
            </p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 font-mono text-sm border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200 lowercase"
          >
            ← back to home
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Sorting */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-mono text-neutral-700">sort by:</span>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="px-3 py-1 border border-neutral-300 rounded font-mono text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="newest">newest</option>
                <option value="oldest">oldest</option>
                <option value="rarity">rarity</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              {/* Demo add seeds button */}
              <button
                onClick={handleAddDemoSeeds}
                className="px-4 py-2 bg-blue-500 text-white font-mono text-sm rounded hover:bg-blue-600 transition-colors duration-200 lowercase"
              >
                demo: +10 seeds
              </button>
              
              {/* Plant seed button */}
              {seedCount > 0 && (
                <button
                  onClick={() => setShowPlantModal(true)}
                  className="px-4 py-2 bg-green-500 text-white font-mono text-sm rounded hover:bg-green-600 transition-colors duration-200 lowercase"
                >
                  plant seed ({seedCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 mb-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => {
              const item = paginatedItems[index] || null;
              return renderInventorySlot(item, index);
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-mono border border-neutral-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                ←
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm font-mono rounded ${
                      currentPage === page
                        ? 'bg-neutral-900 text-white'
                        : 'border border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-mono border border-neutral-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {inventoryCount === 0 && (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-neutral-600 font-mono text-sm">
              Your inventory is empty. Visit the shop to purchase seeds.
            </p>
            <Link 
              href="/cart"
              className="inline-block mt-4 px-4 py-2 bg-neutral-900 text-white font-mono text-sm rounded hover:bg-neutral-700 transition-colors duration-200"
            >
              visit shop
            </Link>
          </div>
        )}
      </div>

      {/* Plant Seed Modal */}
      {showPlantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 font-mono">Plant Seed</h3>
            <p className="text-sm text-neutral-600 mb-6 font-mono">
              This will consume one seed and generate a new olive branch for your inventory.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPlantModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors duration-200 font-mono text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPlantModal(false);
                  handlePlantSeed();
                }}
                disabled={isPlanting}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors duration-200 font-mono text-sm"
              >
                {isPlanting ? 'Planting...' : 'Plant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Planting Result Modal */}
      {plantingBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 font-mono">Seed Planted!</h3>
            
            <div className="w-24 h-24 mx-auto mb-4 border border-neutral-200 rounded-lg overflow-hidden">
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: plantingBranch.svg }}
              />
            </div>
            
            <div className="text-xs font-mono text-neutral-600 space-y-1 mb-6">
              <p>{plantingBranch.oliveCount} {plantingBranch.oliveType.toLowerCase()}</p>
              <p>rarity: {plantingBranch.rarity.count.toLowerCase()} ({plantingBranch.rarity.countPercentage}%)</p>
            </div>
            
            <button
              onClick={() => setPlantingBranch(null)}
              className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-700 transition-colors duration-200 font-mono text-sm"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-red-800 mb-4 font-mono">Confirm Deletion</h3>
            
            {(() => {
              const item = userData?.inventory?.find(i => i.id === itemToDelete);
              const isStackedSeeds = item?.type === 'seed' && item.quantity && item.quantity > 1;
              
              return isStackedSeeds ? (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-600 font-mono">
                    How many seeds would you like to discard? (You have {item.quantity} seeds)
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2 font-mono">
                        Quantity to discard:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={deleteQuantity}
                        onChange={(e) => setDeleteQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), item.quantity || 1))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setDeleteQuantity(1)}
                        className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200 font-mono"
                      >
                        1
                      </button>
                      <button
                        onClick={() => setDeleteQuantity(Math.floor((item.quantity || 1) / 2))}
                        className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200 font-mono"
                      >
                        Half
                      </button>
                      <button
                        onClick={() => setDeleteQuantity(item.quantity || 1)}
                        className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200 font-mono"
                      >
                        All
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-600 mb-6 font-mono">
                  Are you sure you want to {item?.type === 'seed' ? 'discard this seed' : 'burn this branch'}? This action cannot be undone.
                </p>
              );
            })()}
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                  setDeleteQuantity(1);
                }}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-colors duration-200 font-mono text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(itemToDelete, deleteQuantity)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 font-mono text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}