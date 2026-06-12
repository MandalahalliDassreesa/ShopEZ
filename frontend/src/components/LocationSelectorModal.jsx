import React, { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_CITIES = [
  'Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 
  'Chandigarh', 'Ahmedabad', 'Pune', 'Chennai', 
  'Kolkata', 'Kochi'
];

const OTHER_CITIES = [
  'Agra', 'Ajmer', 'Aligarh', 'Amritsar', 'Bhopal', 
  'Coimbatore', 'Dehradun', 'Guwahati', 'Indore', 
  'Jaipur', 'Kanpur', 'Lucknow', 'Ludhiana', 'Madurai', 
  'Nagpur', 'Patna', 'Rajkot', 'Surat', 'Vadodara', 'Varanasi'
];

const LocationSelectorModal = ({ isOpen, onClose, onSelectLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleSelect = (city) => {
    onSelectLocation(city);
    onClose();
  };

  const filteredPopular = POPULAR_CITIES.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOther = OTHER_CITIES.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        paddingTop: '5vh'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-panel"
          style={{
            width: '100%', maxWidth: '800px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            maxHeight: '90vh'
          }}
        >
          {/* Header & Search */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
            <button 
              onClick={onClose}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <div style={{ position: 'relative', marginTop: '30px' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search for your city" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 48px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginTop: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
              <MapPin size={18} />
              <span>Detect my location</span>
            </div>
          </div>

          {/* Cities List */}
          <div style={{ padding: '20px', overflowY: 'auto' }}>
            {filteredPopular.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 500 }}>Popular Cities</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
                  {filteredPopular.map(city => (
                    <div 
                      key={city} 
                      onClick={() => handleSelect(city)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        cursor: 'pointer', width: '80px', padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={24} color="var(--text-secondary)" />
                      </div>
                      <span style={{ fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-primary)' }}>{city}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredOther.length > 0 && (
              <div>
                <h4 style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 500 }}>Other Cities</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', padding: '0 20px' }}>
                  {filteredOther.map(city => (
                    <div 
                      key={city}
                      onClick={() => handleSelect(city)}
                      style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', padding: '4px 0' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LocationSelectorModal;
