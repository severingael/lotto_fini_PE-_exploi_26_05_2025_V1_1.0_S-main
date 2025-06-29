export class OddsApiError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'OddsApiError';
  }
}

export const ERROR_MESSAGES = {
  API_KEY_REQUIRED: 'Pour accéder aux cotes sportives, veuillez configurer votre clé API dans les paramètres.',
  API_KEY_INVALID: 'La clé API fournie n\'est pas valide. Veuillez vérifier vos paramètres de configuration.',
  API_RATE_LIMIT: 'Le nombre maximum de requêtes a été atteint. Veuillez patienter quelques minutes avant de réessayer.',
  API_CONNECTION_ERROR: 'Impossible de se connecter au service des cotes. Veuillez vérifier votre connexion internet.',
  SPORT_DISABLED: 'Ce championnat est temporairement indisponible. Veuillez réessayer plus tard.',
  RESOURCE_NOT_FOUND: 'Les données demandées ne sont pas disponibles pour le moment.',
  INITIALIZATION_ERROR: 'Une erreur est survenue lors de l\'initialisation du service des cotes. Veuillez réessayer.'
};