import type { PrismTheme } from 'prism-react-renderer';

// Dark Theme (Based on HLJS One Dark)
export const prismThemeDark: PrismTheme = {
  plain: {
    color: '#abb2bf',
    backgroundColor: '#18181C'
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata', 'quote'],
      style: {
        color: '#5c6370',
        fontStyle: 'italic'
      }
    },
    {
      types: ['keyword', 'atrule', 'selector', 'important'],
      style: {
        color: '#c678dd'
      }
    },
    {
      types: ['tag', 'deleted', 'name', 'namespace'],
      style: {
        color: '#e06c75'
      }
    },
    {
      types: ['operator', 'entity', 'url', 'literal'],
      style: {
        color: '#56b6c2'
      }
    },
    {
      types: ['string', 'char', 'attr-value', 'regex', 'inserted', 'addition'],
      style: {
        color: '#98c379'
      }
    },
    {
      types: ['attr-name', 'variable', 'number', 'type', 'boolean'],
      style: {
        color: '#d19a66'
      }
    },
    {
      types: ['function'],
      style: {
        color: '#61aeee'
      }
    },
    {
      types: ['builtin', 'class-name', 'constant', 'macro', 'property'],
      style: {
        color: '#e6c07b'
      }
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic'
      }
    },
    {
      types: ['bold', 'important'],
      style: {
        fontWeight: 'bold'
      }
    }
  ]
};

// Light Theme (Based on HLJS One Light)
export const prismThemeLight: PrismTheme = {
  plain: {
    color: '#383a42',
    backgroundColor: '#fafafa'
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata', 'quote'],
      style: {
        color: '#a0a1a7',
        fontStyle: 'italic'
      }
    },
    {
      types: ['keyword', 'atrule', 'selector', 'important'],
      style: {
        color: '#a626a4'
      }
    },
    {
      types: ['tag', 'deleted', 'name', 'namespace'],
      style: {
        color: '#e45649'
      }
    },
    {
      types: ['operator', 'entity', 'url', 'literal'],
      style: {
        color: '#0184bc'
      }
    },
    {
      types: ['string', 'char', 'attr-value', 'regex', 'inserted', 'addition'],
      style: {
        color: '#50a14f'
      }
    },
    {
      types: ['attr-name', 'variable', 'number', 'type', 'boolean'],
      style: {
        color: '#986801'
      }
    },
    {
      types: ['function'],
      style: {
        color: '#4078f2'
      }
    },
    {
      types: ['builtin', 'class-name', 'constant', 'macro', 'property'],
      style: {
        color: '#c18401'
      }
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic'
      }
    },
    {
      types: ['bold', 'important'],
      style: {
        fontWeight: 'bold'
      }
    }
  ]
};
