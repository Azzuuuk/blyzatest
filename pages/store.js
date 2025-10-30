import Head from 'next/head';

export default function StorePage() {
	return (
		<>
			<Head>
				<title>Store | Blyza</title>
				<meta name="robots" content="noindex" />
			</Head>
			<main style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				gap: '0.75rem',
				fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
			}}>
				<h1 style={{ margin: 0 }}>Store</h1>
				<p style={{ opacity: 0.8, margin: 0 }}>Coming soon.</p>
			</main>
		</>
	);
}

