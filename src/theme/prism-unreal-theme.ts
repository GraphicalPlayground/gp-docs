import type { PrismTheme } from 'prism-react-renderer';

// Custom Prism theme based on HLJS One Dark theme
const unrealTheme: PrismTheme = {
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
      // Standard functions and methods (BeginPlay)
      types: ['function'],
      style: {
        color: '#61aeee'
      }
    },
    {
      // Macros, Built-ins, and Class titles (UCLASS, GENERATED_BODY)
      // We explicitly include 'builtin' and 'class-name' here per your HLJS source
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

export default unrealTheme;
