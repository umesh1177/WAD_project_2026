import { getSharedMasterCollection, addSharedMasterItem, saveSharedMasterCollection } from '../frontend/js/api.js';

// Setup Mock LocalStorage
global.localStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, val) { this.data[key] = val; }
};

// Seed areas
saveSharedMasterCollection('areas', [
    { id: 'a_1', name: 'Original', city: 'Ahmedabad' }
]);

console.log("Before:", getSharedMasterCollection('areas'));

// Add new area
let db = { clinicShortcuts: {} };
addSharedMasterItem('areas', { id: `a_${Date.now()}`, name: 'New Area', city: '', pincode: '', createdAt: '2026-10-02T10:00:00.000Z' }, db);

console.log("After:", getSharedMasterCollection('areas'));
console.log("LocalStorage:", localStorage.data['dhyey-shared-master-data']);
