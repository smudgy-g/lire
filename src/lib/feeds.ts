// `include`: keep only links matching it, for sites with a single all-content feed
export const FEEDS = {
	fr: {
		news: [
			{ name: 'France 24', url: 'https://www.france24.com/fr/rss' },
			{ name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml' }
		],
		software: [
			{ name: 'Journal du hacker', url: 'https://www.journalduhacker.net/rss' },
			{
				name: 'Le Monde Informatique',
				url: 'https://www.lemondeinformatique.fr/flux-rss/thematique/toutes-les-actualites/rss.xml'
			},
			{
				name: 'LeMagIT',
				url: 'https://www.lemagit.fr/rss/ContentSyndication.xml',
				include: /\/actualites\//
			}
		],
		culture: [
			{ name: '20 Minutes', url: 'https://www.20minutes.fr/feeds/rss-culture.xml' },
			{ name: 'France 24', url: 'https://www.france24.com/fr/culture/rss' }
		],
		nature: [
			{
				name: 'Sciences et Avenir',
				url: 'https://www.sciencesetavenir.fr/nature-environnement/rss.xml'
			},
			{ name: '20 Minutes', url: 'https://www.20minutes.fr/feeds/rss-planete.xml' }
		],
		travel: [
			{ name: 'Le Figaro', url: 'https://www.lefigaro.fr/rss/figaro_voyages.xml' },
			{ name: '20 Minutes', url: 'https://www.20minutes.fr/feeds/rss-voyage.xml' }
		]
	},
	es: {
		news: [
			{ name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada' },
			{ name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml' }
		],
		culture: [
			{
				name: 'El País',
				url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/cultura/portada'
			},
			{ name: 'La Vanguardia', url: 'https://www.lavanguardia.com/rss/cultura.xml' }
		],
		nature: [
			{
				name: 'El País',
				url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/clima-y-medio-ambiente/portada'
			},
			{ name: 'EFEverde', url: 'https://www.efeverde.com/feed/' }
		],
		travel: [
			{
				name: 'El Viajero',
				url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/elviajero/portada'
			},
			{ name: '20minutos', url: 'https://www.20minutos.es/rss/viajes/' }
		]
	}
};
