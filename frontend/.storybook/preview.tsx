import React from 'react';
import type { Preview } from '@storybook/nextjs';
import { Nunito } from 'next/font/google';
import '../src/styles/globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

const addMaterialSymbolsFont = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('material-symbols-stylesheet')) return;

  const link = document.createElement('link');
  link.id = 'material-symbols-stylesheet';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=optional';
  document.head.appendChild(link);
};

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
      defaultViewport: 'responsive',
    },
  },
  decorators: [
    (Story) => {
      React.useEffect(() => {
        addMaterialSymbolsFont();
      }, []);

      return <div className={nunito.variable}><Story /></div>;
    },
  ],
};

export default preview;
