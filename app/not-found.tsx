export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found | Annapurna Foods</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          header {
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 1rem;
          }
          .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          .logo {
            font-size: 1.25rem;
            font-weight: bold;
            color: #b45309;
            text-decoration: none;
          }
          main {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #b45309;
          }
          p {
            margin-bottom: 2rem;
            color: #4b5563;
          }
          .button {
            display: inline-block;
            background-color: #b45309;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            text-decoration: none;
            font-weight: 500;
          }
          .button:hover {
            background-color: #92400e;
          }
          footer {
            background-color: #fffbeb;
            padding: 1.5rem;
            text-align: center;
          }
          .footer-text {
            font-size: 0.875rem;
            color: #4b5563;
          }
        `,
          }}
        />
      </head>
      <body>
        <header>
          <div className="container">
            <a href="/" className="logo">
              Annapurna Foods
            </a>
          </div>
        </header>
        <main>
          <div className="container">
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist or has been moved.</p>
            <a href="/" className="button">
              Return to Home
            </a>
          </div>
        </main>
        <footer>
          <div className="container">
            <p className="footer-text">Copyright © 2025 Annapurna Foods</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
