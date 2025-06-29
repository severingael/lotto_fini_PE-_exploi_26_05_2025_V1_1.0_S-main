import React, { useState, useEffect } from 'react';
import { MessageCircle, Save, AlertCircle } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { ContactService, ContactConfig } from '../../../services/contact';

export default function ContactFormConfig() {
  const [config, setConfig] = useState<ContactConfig | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await ContactService.getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Erreur lors du chargement de la configuration');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    
    try {
      setStatus('saving');
      setError(null);

      // Validate WhatsApp number
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(config.whatsappNumber)) {
        throw new Error('Numéro WhatsApp invalide. Format attendu: +33612345678');
      }

      await ContactService.saveConfig(config);
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!config) return;
    
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setConfig(prev => prev ? {
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      } : null);
    } else {
      const [section, field] = name.split('.');
      if (section === 'bannerText') {
        setConfig(prev => prev ? {
          ...prev,
          bannerText: {
            ...prev.bannerText,
            [field]: value
          }
        } : null);
      } else {
        setConfig(prev => prev ? {
          ...prev,
          [name]: value
        } : null);
      }
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (!config) return;
    
    setConfig(prev => prev ? {
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [type]: value
      }
    } : null);
  };

  if (!config) {
    return (
      <BaseDashboard title="Configuration du Formulaire de Contact">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Configuration du Formulaire de Contact">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* WhatsApp Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Configuration WhatsApp</h2>
                <p className="text-sm text-gray-600">
                  Paramètres du service client WhatsApp
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro WhatsApp
                </label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={config.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+33612345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Format international avec le préfixe pays (ex: +33612345678)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure d'ouverture
                  </label>
                  <input
                    type="time"
                    value={config.businessHours.start}
                    onChange={(e) => handleTimeChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de fermeture
                  </label>
                  <input
                    type="time"
                    value={config.businessHours.end}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Textes de la bannière */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Textes de la bannière</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  name="bannerText.title"
                  value={config.bannerText.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sous-titre
                </label>
                <input
                  type="text"
                  name="bannerText.subtitle"
                  value={config.bannerText.subtitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="bannerText.description"
                  value={config.bannerText.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isEnabled"
                name="isEnabled"
                checked={config.isEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700">
                Activer le formulaire de contact
              </label>
            </div>
          </div>

          {/* Messages de statut */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700">Configuration sauvegardée avec succès</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error || 'Une erreur est survenue'}</p>
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