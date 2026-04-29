module.exports = function tailwindPlugin(context, options) {
  return {
    name: 'tailwind-plugin',
    configurePostCss(postcssOptions) {
      postcssOptions.plugins.push(require('@tailwindcss/postcss'));
      return postcssOptions;
    },
    configureWebpack(config, isServer) {
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer = config.optimization.minimizer.filter(
          (m) => m && m.constructor && m.constructor.name !== 'CssMinimizerPlugin'
        );
      }
      return {};
    }
  };
};
