// Not every page or feed is UTF-8 (Le Monde Informatique, Actu-Environnement are ISO-8859-*).
// Charset comes from the header, else the XML declaration or <meta> tag near the top, else UTF-8.
export async function readText(response: Response) {
	const bytes = await response.arrayBuffer();
	const head = new TextDecoder('latin1').decode(bytes.slice(0, 2048));

	const charset =
		/charset=([\w-]+)/i.exec(response.headers.get('content-type') ?? '')?.[1] ??
		/(?:encoding|charset)=["']?([\w-]+)/i.exec(head)?.[1];

	try {
		return new TextDecoder(charset).decode(bytes);
	} catch {
		return new TextDecoder().decode(bytes); // unknown label
	}
}
