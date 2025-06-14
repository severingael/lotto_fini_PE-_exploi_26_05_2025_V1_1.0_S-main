import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, Info } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { formatCurrency } from '../../../utils/format';

interface CombinedBetsConfig {
  enabled: boolean;
  maxSelections: number;
  minOdds: number;
  maxOdds: number;
  maxWinAmount: number;
  minStake: number;
  currency: string;
  restrictedLeagues: string[];
  agentLimits: {
    enabled: boolean;
    maxWinAmount: number;
  };
  lastUpdated?: string;
}

const DEFAULT_CONFIG: CombinedBetsConfig = {
  enabled: true,
  maxSelections: 10,
  minOdds: 1.1,
  maxOdds: 1000,
  maxWinAmount: 10000,
  minStake: 1,
  currency: 'EUR',
  restrictedLeagues: [],
  agentLimits: {
    enabled: false,
    maxWinAmount: 5000
  }
};

const AVAILABLE_LEAGUES = [
  { id: 'soccer_france_ligue_one', name: 'Ligue 1' },
  { id: 'soccer_uefa_champs_league', name: 'Champions League' },
  { id: 'soccer_epl', name: 'Premier League' },
  { id: 'soccer_spain_la_liga', name: 'La Liga' },
  { id: 'soccer_italy_serie_a', name: 'Serie A' },
  { id: 'soccer_germany_bundesliga', name: 'Bundesliga' }
];

const CURRENCIES = [
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'USD', label: 'Dollar ($)', symbol: '$' },
  { value: 'XOF', label: 'CFA', symbol: 'CFA' }
];

export default function CombinedBetsConfig() {
  const [config, setConfig] = useState<CombinedBetsConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setStatus('loading');
      const docRef = doc(db, 'betting_config', 'combined_bets');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig({
          ...DEFAULT_CONFIG,
          ...docSnap.data() as CombinedBetsConfig
        });
      } else {
        await setDoc(docRef, DEFAULT_CONFIG);
      }
      
      setStatus('idle');
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Erreur lors du chargement de la configuration');
      setStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setStatus('saving');
      setError(null);

      // Validation
      if (config.minOdds >= config.maxOdds) {
        throw new Error('La cote minimale doit être inférieure à la cote maximale');
      }

      if (config.maxSelections < 2) {
        throw new Error('Le nombre maximum de sélections doit être d\'au moins 2');
      }

      if (config.minStake <= 0) {
        throw new Error('La mise minimale doit être supérieure à 0');
      }

      // Validation des limites agents
      if (config.agentLimits.enabled && config.agentLimits.maxWinAmount <= 0) {
        throw new Error('La limite de gain pour les agents doit être supérieure à 0');
      }

      const docRef = doc(db, 'betting_config', 'combined_bets');
      await setDoc(docRef, {
        ...config,
        lastUpdated: new Date().toISOString()
      });

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setStatus('error');
    }
  };

  const handleNumberChange = (field: keyof CombinedBetsConfig, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setConfig(prev => ({
        ...prev,
        [field]: numValue
      }));
    }
  };

  const handleAgentLimitChange = (value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setConfig(prev => ({
        ...prev,
        agentLimits: {
          ...prev.agentLimits,
          maxWinAmount: numValue
        }
      }));
    }
  };

  const handleLeagueToggle = (leagueId: string) => {
    setConfig(prev => {
      const isRestricted = prev.restrictedLeagues.includes(leagueId);
      return {
        ...prev,
        restrictedLeagues: isRestricted
          ? prev.restrictedLeagues.filter(id => id !== leagueId)
          : [...prev.restrictedLeagues, leagueId]
      };
    });
  };

  if (status === 'loading') {
    return (
      <BaseDashboard title="Configuration des Paris Combinés">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Configuration des Paris Combinés">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activation générale */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Paramètres Généraux</h2>
                <p className="text-sm text-gray-600">
                  Configuration globale des paris combinés
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={config.enabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  Activer les paris combinés
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre maximum de sélections
                </label>
                <input
                  type="number"
                  min="2"
                  value={config.maxSelections.toString()}
                  onChange={(e) => handleNumberChange('maxSelections', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Devise
                </label>
                <select
                  value={config.currency}
                  onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Limites des cotes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Limites des Cotes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cote minimale
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={config.minOdds.toString()}
                  onChange={(e) => handleNumberChange('minOdds', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cote maximale
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={config.maxOdds.toString()}
                  onChange={(e) => handleNumberChange('maxOdds', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Limites des mises */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Limites des Mises</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mise minimale ({CURRENCIES.find(c => c.value === config.currency)?.symbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={config.minStake.toString()}
                  onChange={(e) => handleNumberChange('minStake', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gain maximum ({CURRENCIES.find(c => c.value === config.currency)?.symbol})
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.maxWinAmount.toString()}
                  onChange={(e) => handleNumberChange('maxWinAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Limites des agents */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Limites des Agents</h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="agentLimitsEnabled"
                  checked={config.agentLimits.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    agentLimits: {
                      ...prev.agentLimits,
                      enabled: e.target.checked
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="agentLimitsEnabled" className="text-sm font-medium text-gray-700">
                  Activer les limites agents
                </label>
              </div>
            </div>

            {config.agentLimits.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gain maximum par pari ({CURRENCIES.find(c => c.value === config.currency)?.symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={config.agentLimits.maxWinAmount.toString()}
                    onChange={(e) => handleAgentLimitChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Cette limite s'applique uniquement aux agents et leurs clients. Les limites générales s'appliquent toujours.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Championnats restreints */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Championnats Restreints</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info className="w-4 h-4" />
                <span>Sélectionnez les championnats à exclure</span>
              </div>
            </div>
            <div className="space-y-2">
              {AVAILABLE_LEAGUES.map(league => (
                <div key={league.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={league.id}
                    checked={config.restrictedLeagues.includes(league.id)}
                    onChange={() => handleLeagueToggle(league.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={league.id} className="text-sm font-medium text-gray-700">
                    {league.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Messages de statut */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700">Configuration sauvegardée avec succès</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={status === 'saving'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'saving' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </BaseDashboard>
  );
}