export const LANGS = {
	fr: {
		code: 'FR',
		voice: 'fr-FR',
		brand: 'Lire',
		brandSubtitle: 'en français',
		nav: ['Feed', 'Lire', 'Histoires', 'Cartes'],
		level: 'Niveau',
		levelHint: 'Souligner les mots au-dessus de ce niveau',
		credits: [
			[
				'Niveaux',
				'FLELex',
				'https://cental.uclouvain.be/cefrlex/flelex/',
				'(François et al., 2014)'
			],
			['Lemmes', 'Lexique 4.1', 'http://www.lexique.org', '(New, Pallier et al.), CC BY-SA 4.0'],
			['Définitions', 'Wiktionary', 'https://en.wiktionary.org', '']
		],
		feed: {
			eyebrow: 'Le fil du jour',
			heading: ['Lisez le monde,', 'en français.'],
			intro: 'Des articles récents. Touchez un mot pour sa traduction.',
			topics: {
				news: 'Actualités',
				software: 'Logiciel',
				culture: 'Culture',
				nature: 'Nature',
				travel: 'Voyage'
			},
			readArticle: 'Lire l’article →',
			emptyTitle: 'Rien pour l’instant.',
			emptyBody:
				'Aucun article trouvé pour ces sujets. Réessayez plus tard, ou collez un texte dans',
			sourcesFailed: 'source(s) indisponible(s).'
		},
		read: {
			eyebrow: 'Lire',
			heading: ['Votre texte,', 'mot à mot.'],
			intro: 'Collez l’adresse d’un article ou un texte en français.',
			placeholder: 'https://… ou un texte en français',
			submit: 'Lire →',
			loading: 'Chargement…',
			error: 'Une erreur est survenue',
			networkError: 'Erreur réseau',
			hardLabel: 'souligné',
			hardHint: 'au-dessus de votre niveau',
			savedLabel: 'surligné',
			savedHint: 'déjà enregistré',
			tapHint: 'Touchez un mot pour sa traduction'
		},
		stories: {
			eyebrow: 'Histoires',
			heading: ['Petites histoires,', 'grands progrès.'],
			intro: 'Des textes courts de A2 à B2, avec le vocabulaire clé et une question.',
			back: '← Histoires',
			level: 'Niveau',
			listenToStory: '▶ Écouter l’histoire',
			quizTitle: 'Compréhension',
			correct: 'Correct ! Bien lu.',
			incorrect: 'Pas tout à fait. Relisez le texte.',
			notFound: 'Histoire introuvable.'
		},
		cards: {
			eyebrow: 'Cartes',
			heading: ['Révisez,', 'un mot à la fois.'],
			summary: (savedCount: number, dueCount: number) =>
				`${savedCount} mot${savedCount === 1 ? '' : 's'} enregistré${savedCount === 1 ? '' : 's'} · ${dueCount} à réviser`,
			emptyTitle: 'Aucune carte pour l’instant.',
			emptyBody: 'Pendant la lecture, touchez un mot puis « Enregistrer ».',
			readStory: 'Lire une histoire →',
			allDoneTitle: 'Tout est à jour.',
			allDoneBody: (savedCount: number) =>
				`Revenez plus tard : vos ${savedCount} cartes sont programmées.`,
			frontLabel: 'Français',
			backLabel: 'Traduction',
			flipHint: 'Touchez pour retourner',
			showWord: 'Montrer le mot',
			showMeaning: 'Montrer la traduction',
			again: '↺ Encore',
			know: 'Je sais ✓',
			export: 'Exporter',
			import: 'Importer',
			invalidFile: 'Fichier invalide'
		},
		popover: {
			loading: 'Recherche…',
			noDefinition: '(pas de définition trouvée)',
			offline: '(hors ligne)',
			saved: 'Enregistré ✓',
			save: '+ Enregistrer',
			listenSlowlyLabel: 'Écouter lentement',
			listen: '🔊 Écouter',
			mute: 'Couper la prononciation automatique',
			unmute: 'Activer la prononciation automatique',
			close: 'Fermer'
		}
	},
	es: {
		code: 'ES',
		voice: 'es-ES',
		brand: 'Lire',
		brandSubtitle: 'en español',
		nav: ['Feed', 'Leer', 'Historias', 'Tarjetas'],
		level: 'Nivel',
		levelHint: 'Subrayar las palabras por encima de este nivel',
		credits: [
			['Niveles', 'ELELex', 'https://cental.uclouvain.be/cefrlex/elelex/', 'CC BY-NC-SA 4.0'],
			[
				'Lemas',
				'lemmatization-lists',
				'https://github.com/michmech/lemmatization-lists',
				'(Měchura), ODbL'
			],
			['Definiciones', 'Wiktionary', 'https://en.wiktionary.org', '']
		],
		feed: {
			eyebrow: 'Las noticias del día',
			heading: ['Lee el mundo,', 'en español.'],
			intro: 'Artículos recientes. Toca una palabra para ver su traducción.',
			topics: { news: 'Actualidad', culture: 'Cultura', nature: 'Naturaleza', travel: 'Viajes' },
			readArticle: 'Leer el artículo →',
			emptyTitle: 'Nada por ahora.',
			emptyBody: 'No hay artículos para estos temas. Inténtalo más tarde o pega un texto en',
			sourcesFailed: 'fuente(s) no disponible(s).'
		},
		read: {
			eyebrow: 'Leer',
			heading: ['Tu texto,', 'palabra por palabra.'],
			intro: 'Pega la dirección de un artículo o un texto en español.',
			placeholder: 'https://… o un texto en español',
			submit: 'Leer →',
			loading: 'Cargando…',
			error: 'Ha ocurrido un error',
			networkError: 'Error de red',
			hardLabel: 'subrayado',
			hardHint: 'por encima de tu nivel',
			savedLabel: 'resaltado',
			savedHint: 'ya guardado',
			tapHint: 'Toca una palabra para ver su traducción'
		},
		stories: {
			eyebrow: 'Historias',
			heading: ['Historias cortas,', 'grandes progresos.'],
			intro: 'Textos cortos de A2 a B2, con el vocabulario clave y una pregunta.',
			back: '← Historias',
			level: 'Nivel',
			listenToStory: '▶ Escuchar la historia',
			quizTitle: 'Comprensión',
			correct: '¡Correcto! Bien leído.',
			incorrect: 'No exactamente. Vuelve a leer el texto.',
			notFound: 'Historia no encontrada.'
		},
		cards: {
			eyebrow: 'Tarjetas',
			heading: ['Repasa,', 'palabra a palabra.'],
			summary: (savedCount: number, dueCount: number) =>
				`${savedCount} palabra${savedCount === 1 ? '' : 's'} guardada${savedCount === 1 ? '' : 's'} · ${dueCount} por repasar`,
			emptyTitle: 'Todavía no hay tarjetas.',
			emptyBody: 'Mientras lees, toca una palabra y luego «Guardar».',
			readStory: 'Leer una historia →',
			allDoneTitle: 'Todo al día.',
			allDoneBody: (savedCount: number) =>
				`Vuelve más tarde: tus ${savedCount} tarjetas están programadas.`,
			frontLabel: 'Español',
			backLabel: 'Traducción',
			flipHint: 'Toca para dar la vuelta',
			showWord: 'Mostrar la palabra',
			showMeaning: 'Mostrar la traducción',
			again: '↺ Otra vez',
			know: 'Lo sé ✓',
			export: 'Exportar',
			import: 'Importar',
			invalidFile: 'Archivo no válido'
		},
		popover: {
			loading: 'Buscando…',
			noDefinition: '(no se encontró definición)',
			offline: '(sin conexión)',
			saved: 'Guardado ✓',
			save: '+ Guardar',
			listenSlowlyLabel: 'Escuchar despacio',
			listen: '🔊 Escuchar',
			mute: 'Silenciar la pronunciación automática',
			unmute: 'Activar la pronunciación automática',
			close: 'Cerrar'
		}
	}
};

export type Lang = keyof typeof LANGS;

export const pickLang = (code: string | null | undefined): Lang =>
	code && Object.hasOwn(LANGS, code) ? (code as Lang) : 'fr';
