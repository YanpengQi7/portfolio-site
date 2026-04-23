export default function ThemeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            var storedTheme = window.localStorage.getItem('site-theme');
            var theme = storedTheme === 'light' ? 'light' : 'dark';
            document.documentElement.dataset.theme = theme;
            document.documentElement.style.colorScheme = theme;
          } catch (error) {
            document.documentElement.dataset.theme = 'dark';
            document.documentElement.style.colorScheme = 'dark';
          }
        `,
      }}
    />
  )
}
